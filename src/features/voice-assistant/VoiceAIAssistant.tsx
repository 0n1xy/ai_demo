import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import StatusBar from "./components/StatusBar";
import SettingsPanel from "./components/SettingsPanel";
import TranscriptionBox from "./components/TranscriptionBox";
import MessageList from "./components/MessageList";
import ControlButtons from "./components/ControlButtons";
import ErrorAlert from "./components/ErrorAlert";
import { createUserMessage, createAssistantMessage } from "./types/logic";
import type { Message, VoiceSettings } from "./types/types";
import FloatingFeedback from "./components/FloatingFeedback";
import Sidebar from "./components/Sidebar";
// Mở lại Progress và Progress Panel
import ProgressPanel from "./components/ProgressPanel";
import TranslationPanel from "./components/TranslationPanel";
import VocabularyManager from "./components/VocabularyManager";
import VocabularyReview from "./components/VocabularyReview";
// import PronunciationResultDisplay from "./components/PronunciationResult";
// Ẩn các import không cần thiết để code sạch sẽ
// import StorageInfo from "./components/StorageInfo";
// import VocabularyDisplay from "./components/VocabularyDisplay";
// Mở lại ProgressService để sử dụng cho Progress
import { ProgressService } from "./service/progressService";
import { PronunciationService } from "./service/pronunciationService";
import type { PronunciationResult } from "./service/pronunciationService";
// import { VocabularyUtils } from "./utils/vocabularyUtils";
// import { debugProgress, createTestData } from "./utils/debugProgress";
// import { LocalStorageUtils } from "./utils/localStorageUtils";
// import { testDateHandling } from "./utils/testDateHandling";

const VoiceAIAssistant: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcribedText, setTranscribedText] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null);
  const [sampleMode, setSampleMode] = useState(false);
  const [replySuggestions, setReplySuggestions] = useState<string[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [suggestingIndex, setSuggestingIndex] = useState<number | null>(null);
  // Mở lại state progress panel
  const [showProgressPanel, setShowProgressPanel] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  // State cho từ vựng - Đã ẩn
  // const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([]);
  
  // State cho pronunciation assessment
  const [pronunciationResult, setPronunciationResult] = useState<PronunciationResult | null>(null);
  const [isAssessingPronunciation, setIsAssessingPronunciation] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  // State cho translation
  const [showTranslationPanel, setShowTranslationPanel] = useState(false);
  
  // State cho vocabulary manager
  const [showVocabularyManager, setShowVocabularyManager] = useState(false);
  const [openVocabularyManagerInAddMode, setOpenVocabularyManagerInAddMode] = useState(false);
  
  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [connectionStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("connected");
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    language: "en-US",
    voice: "en-US-Standard-C",
    speed: 1.0,
    pitch: 0.0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sendTimeout = useRef<NodeJS.Timeout | null>(null);

  const AZURE_API_KEY = import.meta.env.VITE_AZURE_API_KEY;
  const AZURE_ENDPOINT = import.meta.env.VITE_AZURE_ENDPOINT;
  const AZURE_DEPLOYMENT = import.meta.env.VITE_AZURE_DEPLOYMENT;
  const AZURE_API_VERSION = import.meta.env.VITE_AZURE_API_VERSION;
  const GOOGLE_TTS_KEY = import.meta.env.VITE_GOOGLE_TTS_KEY;

  const topics = [
    {
      name: "Công viên chủ đề",
      prompt: `You are a curious visitor at a theme park. You are asking short, clear questions to the user who plays the role of a theme park staff member. Keep your responses concise (1–2 sentences), and always follow up with a polite question.`,
      initialMessage: "Hello! How can I assist you in the theme park today?",
    },
    {
      name: "Gọi món",
      prompt: `You are a customer ordering familiar food in a restaurant. Reply in 1–2 short sentences (max 25 words). Use only common dishes like burger, pizza, rice, soup.`,
      initialMessage: "Hi, I’d like to order something to eat.",
    },

  ];

  // Đặt ở đầu function component, cùng chỗ với các useRef khác
  const isRecordingRef = useRef(isRecording);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Cập nhật từ vựng khi messages thay đổi - Đã ẩn
  /*
  useEffect(() => {
    if (messages.length > 0 && selectedTopic) {
      const words = VocabularyUtils.analyzeVocabulary(messages, selectedTopic);
      setVocabularyWords(words);
    } else {
      setVocabularyWords([]);
    }
  }, [messages, selectedTopic]);
  */

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError("Trình duyệt không hỗ trợ SpeechRecognition");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = voiceSettings.language;

    // Thiết lập MediaRecorder để ghi âm
    let mediaRecorder: MediaRecorder | null = null;
    let audioChunks: Blob[] = [];

    // Lưu vào refs để sử dụng ở nơi khác
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = audioChunks;

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      // console.log("finalTranscript:", finalTranscript, "interimTranscript:", interimTranscript);
      setTranscribedText(finalTranscript + interimTranscript);

      if (finalTranscript.trim()) {
        if (sendTimeout.current) clearTimeout(sendTimeout.current);
        sendTimeout.current = setTimeout(async () => {
          console.log("Gửi message:", finalTranscript.trim());
          
          // Dừng ghi âm và đánh giá phát âm
          stopMediaRecording();
          recognitionRef.current?.stop();
          setIsRecording(false);
          
          // Đánh giá phát âm nếu có audio blob
          if (audioBlob) {
            await assessPronunciation(audioBlob, finalTranscript.trim());
          }
          
          handleSendMessage(finalTranscript.trim());
          setTranscribedText("");
        }, 3000);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      console.log("onend, isRecordingRef.current:", isRecordingRef.current);
      // Không tự động start lại - để người dùng nhấn lại nút để ghi âm mới
      setIsRecording(false);
    };

    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (sendTimeout.current) clearTimeout(sendTimeout.current);
      recognitionRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    const savedTopic = localStorage.getItem("selectedTopic");
    const savedPrompt = localStorage.getItem("systemPrompt");
    if (savedTopic && savedPrompt) {
      setSelectedTopic(savedTopic);
      setSystemPrompt(savedPrompt);
    }
  }, []);

  // Mở lại tự động lưu tiến trình
  useEffect(() => {
    return () => {
      if (messages.length > 0 && selectedTopic && sessionStartTime) {
        const progress = ProgressService.calculateSessionMetrics(messages, selectedTopic, sessionStartTime);
        const success = ProgressService.saveProgress(progress);
        if (success) {
          console.log("💾 Tự động lưu tiến trình khi rời trang:", progress);
        } else {
          console.error("❌ Lỗi tự động lưu tiến trình");
        }
      }
    };
  }, [messages, selectedTopic, sessionStartTime]);

  const handleSendMessage = async (text: string, customPrompt?: string) => {
    if (!text.trim()) return;

    const promptToUse =  localStorage.getItem("systemPrompt");
  if (!promptToUse) {
    setError("Bạn cần chọn chủ đề luyện nói trước khi bắt đầu.");
    setIsProcessing(false);
    return;
  }

    // Logic lưu tiến trình đã được di chuyển vào sau khi nhận phản hồi từ AI
    // if (!promptToUse) {
    //   setError("Bạn cần chọn chủ đề luyện nói trước khi bắt đầu.");
    //   setIsProcessing(false);
    //   return;
    // }

    setIsProcessing(true);
    setError(null);

    // Tạo message user mới
    const userMessage = createUserMessage(text);

    // Thêm vào mảng messages tạm thời để tạo payload
    const currentMessages = [...messages, userMessage];

    setMessages(currentMessages); // Cập nhật lại state để có thể dùng trong payload

    try {
      const url = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;

      // Chỉ thêm 1 system prompt nếu có
      const payload: any = {
        messages: [],
      };
      if (promptToUse) {
        payload.messages.push({ role: "system", content: promptToUse });
      }

      const filteredMessages = currentMessages.filter(
        (msg) => msg.type === "user" || msg.type === "assistant"
      ).map((msg) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
      }));
      payload.messages.push(...filteredMessages);

      console.log("🧠 Using system prompt:", promptToUse);
      console.log("📤 Payload to Azure:", payload.messages);

      if (payload.messages.length === 0) {
        setError("Không có nội dung để gửi lên AI. Hãy nhập tin nhắn hoặc chọn chủ đề.");
        setIsProcessing(false);
        return;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "api-key": AZURE_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Azure Error", response.status, errorText);
        throw new Error("Failed to get response from Azure");
      }

      const data = await response.json();
      console.log("Full Azure response:", JSON.stringify(data, null, 2));
      const aiText = data.choices[0]?.message?.content?.trim() || "";

      console.log("Data:", data);
      console.log("🤖 AI Response:", aiText);

      if (!aiText) {
        setError("Empty response from AI");
        return;
      }

      const assistantMessage = createAssistantMessage(aiText);
      setMessages((prev) => [...prev, assistantMessage]);

      // Lưu tiến trình sau khi hoàn thành một đoạn hội thoại
      const updatedMessages = [...currentMessages, assistantMessage];
      const userMessages = updatedMessages.filter(msg => msg.type === 'user');
      if (userMessages.length >= 3 && selectedTopic && sessionStartTime) {
        saveCurrentProgress();
      }

      // await handleTextToSpeech(aiText);
    } catch (error) {
      console.error("🛑 Send Message Error:", error);
      setError("Failed to process message: " + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextToSpeech = async (text: string) => {
    if (!audioEnabled) {
      console.warn("🔇 Audio playback not enabled yet");
      return;
    }

    try {
      setIsPlaying(true);
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: { text },
            voice: {
              languageCode: voiceSettings.language,
              name: voiceSettings.voice,
            },
            audioConfig: {
              audioEncoding: "MP3",
              speakingRate: voiceSettings.speed,
              pitch: voiceSettings.pitch,
            },
          }),
        }
      );

      if (!response.ok) throw new Error("Google TTS failed");

      const data = await response.json();
      console.log("🧾 Google TTS full response:", data);

      if (!data.audioContent) {
        throw new Error("Google TTS response missing audioContent");
      }

      const binary = atob(data.audioContent);
      const buffer = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        buffer[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([buffer], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
        };
        audioRef.current.play().catch((err) => {
          console.warn("🔇 Autoplay blocked by browser:", err);
          setIsPlaying(false);
        });
      }
    } catch (error) {
      console.error("🛑 Google TTS Error:", error);
      setError("Failed to convert text to speech: " + (error as Error).message);
      setIsPlaying(false);
    }
  };

  const enableAudioPlayback = () => {
    const dummyAudio = new Audio(
      "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"
    ); // ~1s
    dummyAudio.addEventListener("canplaythrough", () => {
      dummyAudio
        .play()
        .then(() => {
          setAudioEnabled(true);
          console.log("🔊 Audio playback enabled");
        })
        .catch((err) => {
          console.warn("❌ User denied audio autoplay:", err);
        });
    });
    dummyAudio.load();
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Không cho phép dừng thủ công - ghi âm sẽ tự động dừng sau khi nói xong
      console.log("⏹️ Recording will stop automatically after speaking");
      return;
    } else {
      try {
        // Bắt đầu ghi âm media
        startMediaRecording();
        
        recognitionRef.current?.start();
        setIsRecording(true);
        setError(null);
        console.log("🎙️ Started recording");
      } catch (err) {
        console.error("❌ Failed to start recognition:", err);
        setError("Failed to start recording. Please allow microphone access.");
      }
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    synthRef.current?.cancel();
    setIsPlaying(false);
  };

  // Bắt đầu ghi âm media
  const startMediaRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
    } catch (error) {
      console.error('Error starting media recorder:', error);
    }
  };

  // Dừng ghi âm media
  const stopMediaRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Đánh giá phát âm
  const assessPronunciation = async (audioBlob: Blob, referenceText: string) => {
    try {
      setIsAssessingPronunciation(true);
      setError(null);
      
      console.log("🎯 Đang đánh giá phát âm...");
      const result = await PronunciationService.assessPronunciation(audioBlob, referenceText);
      
      setPronunciationResult(result);
      PronunciationService.savePronunciationResult(result);
      
      console.log("✅ Đánh giá phát âm hoàn thành:", result.overallScore);
    } catch (error) {
      console.error("❌ Lỗi đánh giá phát âm:", error);
      setError("Không thể đánh giá phát âm. Vui lòng thử lại.");
    } finally {
      setIsAssessingPronunciation(false);
    }
  };

  // Mở lại function saveCurrentProgress
  const saveCurrentProgress = () => {
    if (messages.length > 0 && selectedTopic && sessionStartTime) {
      const progress = ProgressService.calculateSessionMetrics(messages, selectedTopic, sessionStartTime);
      const success = ProgressService.saveProgress(progress);
      
      if (success) {
        console.log("💾 Đã lưu tiến trình học:", progress);
        
        // Hiển thị thông báo thành công
        setError(null);
        const successMessage = `✅ Đã lưu tiến trình học! Điểm: ${progress.metrics.fluencyScore}/100`;
        setTimeout(() => {
          setError(successMessage);
          setTimeout(() => setError(null), 3000);
        }, 100);
      } else {
        setError("❌ Lỗi lưu tiến trình học");
        setTimeout(() => setError(null), 2000);
      }
    } else {
      setError("❌ Không có dữ liệu để lưu tiến trình");
      setTimeout(() => setError(null), 2000);
    }
  };

  // Ẩn tất cả các function test và debug để code sạch sẽ
  /*
  // Function để test việc lưu tiến trình (có thể xóa sau)
  const testSaveProgress = () => {
    if (!selectedTopic) {
      setError("❌ Vui lòng chọn chủ đề trước");
      return;
    }
    
    const testMessages = [
      { id: '1', type: 'user' as const, content: 'Hello, how are you?', timestamp: new Date() },
      { id: '2', type: 'assistant' as const, content: 'I am fine, thank you!', timestamp: new Date() },
      { id: '3', type: 'user' as const, content: 'What is your name?', timestamp: new Date() },
      { id: '4', type: 'assistant' as const, content: 'My name is AI Assistant.', timestamp: new Date() },
      { id: '5', type: 'user' as const, content: 'Nice to meet you!', timestamp: new Date() },
    ];
    
    const testStartTime = new Date(Date.now() - 10 * 60 * 1000); // 10 phút trước
    const progress = ProgressService.calculateSessionMetrics(testMessages, selectedTopic, testStartTime);
    ProgressService.saveProgress(progress);
    
    setError("🧪 Đã tạo dữ liệu test tiến trình!");
    setTimeout(() => setError(null), 2000);
  };

  // Debug function
  const debugProgressData = () => {
    debugProgress();
    setError("🔍 Đã debug tiến trình - xem console");
    setTimeout(() => setError(null), 2000);
  };

  const createTestProgressData = () => {
    createTestData();
    setError("🧪 Đã tạo dữ liệu test mẫu!");
    setTimeout(() => setError(null), 2000);
  };

  // Debug localStorage
  const debugLocalStorage = () => {
    LocalStorageUtils.debugAll();
    setError("🔍 Đã debug localStorage - xem console");
    setTimeout(() => setError(null), 2000);
  };

  // Kiểm tra localStorage
  const checkLocalStorage = () => {
    const isAvailable = LocalStorageUtils.isAvailable();
    if (isAvailable) {
      setError("✅ localStorage khả dụng");
    } else {
      setError("❌ localStorage không khả dụng");
    }
    setTimeout(() => setError(null), 2000);
  };

  // Test date handling
  const testDateHandlingFunction = () => {
    testDateHandling();
    setError("🧪 Date handling test completed! Check console for results.");
    setTimeout(() => setError(null), 3000);
  };
  */

  const clearConversation = () => {
    // Lưu tiến trình học trước khi xóa
    saveCurrentProgress();
    
    setMessages([]);
    setTranscribedText("");
    setError(null);
    setSelectedTopic(null);
    setSystemPrompt(null);
    setSessionStartTime(null);
    localStorage.removeItem("selectedTopic");
    localStorage.removeItem("systemPrompt");
  };

  // const handleSelectTopic = (topic: string, prompt: string) => {
  //   clearConversation();
  //   setSelectedTopic(topic);

  //   // ✅ Dùng callback để đảm bảo set xong prompt rồi mới gửi
  //   setSystemPrompt(prompt);
  // };

  // const handleSelectTopic = (
  //   topicName: string,
  //   prompt: string,
  //   initialMessage: string
  // ) => {
  //   clearConversation();
  //   setSelectedTopic(topicName);
  //   setSystemPrompt(prompt); // Giữ system prompt cho toàn bộ đoạn hội thoại
  //   handleSendMessage(initialMessage, prompt); // Gửi câu mở đầu riêng cho topic
  // };

  const handleSelectTopic = (
    topicName: string,
    prompt: string,
    initialMessage: string
  ) => {
    clearConversation();
    setSelectedTopic(topicName);
    setSystemPrompt(prompt);
    setSampleMode(false);
    setSessionStartTime(new Date()); // Bắt đầu session mới
    localStorage.setItem("selectedTopic", topicName);
    localStorage.setItem("systemPrompt", prompt);
    handleSendMessage(initialMessage, prompt);
  };

  // const handleSuggestReplyAt = async (index: number) => {
  //   try {
  //     const contextMessages = messages.slice(0, index + 1);

  //     const messageHistory = contextMessages.map((msg) => ({
  //       role: msg.type === "user" ? "user" : "assistant",
  //       content: msg.content,
  //     }));

  //     const payload = {
  //       messages: [
  //         ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
  //         ...messageHistory,
  //         {
  //           role: "user",
  //           content: "Suggest a possible response the user might say next.",
  //         },
  //       ],
  //       max_completion_tokens: 800,
  //     };

  //     const url = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;

  //     const response = await fetch(url, {
  //       method: "POST",
  //       headers: {
  //         "api-key": AZURE_API_KEY,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       throw new Error("Azure Suggestion Error: " + errorText);
  //     }

  //     const data = await response.json();
  //     console.log("Azure Response Data:", JSON.stringify(data, null, 2));

  //     const suggestion = data.choices?.[0]?.message?.content?.trim();

  //     if (suggestion) {
  //       setTranscribedText(suggestion);
  //       await handleTextToSpeech(suggestion);
  //     } else {
  //       setError("No suggestion received.");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setError("Failed to fetch suggestion: " + (err as Error).message);
  //   }
  // };

  const handleSuggestReplyAt = async (index: number) => {
    if (suggestingIndex !== null) return; // prevent spam clicks
    setSuggestingIndex(index);
    try {
      const contextMessages = messages.slice(0, index + 1);

      const messageHistory = contextMessages.map((msg) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      const payload = {
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          ...messageHistory,
          {
            role: "system",
            content: `Suggest a possible response the user might say next. ${systemPrompt ?? ""} Always respond in only 1–2 short sentences (maximum 25 words). Do not give long or detailed answers.`,
          },
        ],
        max_completion_tokens: 1500,
      };

      const url = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "api-key": AZURE_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Azure Suggestion Error: " + errorText);
      }

      const data = await response.json();
      console.log("Azure Response Data:", JSON.stringify(data, null, 2));
      const suggestion = data.choices[0]?.message?.content?.trim();

      if (suggestion) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            type: "suggestion",
            content: suggestion,
            timestamp: new Date(),
          },
        ]);
        setSuggestingIndex(null);
      } else {
        setError("No suggestion received.");
        setSuggestingIndex(null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch suggestion: " + (err as Error).message);
      setSuggestingIndex(null);
    }
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex">
      {/* SIDEBAR */}
      <Sidebar
        topics={topics}
        selectedTopic={selectedTopic}
        onSelectTopic={handleSelectTopic}
        onShowFullProgress={() => setShowProgressPanel(true)}
        onSaveProgress={saveCurrentProgress}
        hasMessages={messages.length > 0}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex">
        {/* CENTER CONTENT */}
        <div className="flex-1 flex flex-col">
          <div className="container mx-auto px-6 py-6 max-w-4xl">
            {/* HEADER */}
            <Header />

            {/* ERROR ALERT */}
            {error && <ErrorAlert error={error} />}

            {/* PRONUNCIATION ASSESSMENT ALERT */}
            {isAssessingPronunciation && (
              <div className="fixed top-4 right-4 bg-blue-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-sm">
                🎯 Đang đánh giá phát âm...
              </div>
            )}

            {/* LIVE TRANSCRIPTION */}
            {transcribedText && <TranscriptionBox text={transcribedText} />}

            {/* MESSAGE LIST */}
            <MessageList
              messages={messages}
              sampleMode={sampleMode}
              onSuggestReply={handleSuggestReplyAt}
              isProcessing={isProcessing}
              suggestingIndex={suggestingIndex}
            />

            {/* SUGGESTED REPLIES */}
            {replySuggestions.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-yellow-400/30 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-semibold text-white/90">
                    💡 Gợi ý câu bạn có thể thử nói
                  </h3>
                </div>
                <div className="space-y-3">
                  {replySuggestions.map((s, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/50 rounded-xl px-4 py-3 text-white/90 font-medium"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTROL BUTTONS */}
            <ControlButtons
              isRecording={isRecording}
              isProcessing={isProcessing || isAssessingPronunciation}
              toggleRecording={toggleRecording}
              isPlaying={isPlaying}
              stopAudio={stopAudio}
              clearConversation={clearConversation}
              onTranslate={() => setShowTranslationPanel(true)}
              hasMessages={messages.length > 0}
              onOpenVocabulary={() => setShowVocabularyManager(true)}
            />
          </div>
        </div>

        {/* RIGHT SIDEBAR - VOCABULARY SECTION */}
        <div className="w-80 h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 border-l border-white/20 flex flex-col p-4">
                          <VocabularyReview 
                  onOpenVocabularyManager={() => {
                    setOpenVocabularyManagerInAddMode(false);
                    setShowVocabularyManager(true);
                  }}
                  onOpenAddVocabulary={() => {
                    setOpenVocabularyManagerInAddMode(true);
                    setShowVocabularyManager(true);
                  }}
                />
        </div>
      </div>

      {/* MODALS AND PANELS */}
      {/* ProgressPanel */}
      <ProgressPanel 
        isOpen={showProgressPanel} 
        onClose={() => setShowProgressPanel(false)} 
      />

      {/* Translation Panel */}
      <TranslationPanel
        messages={messages}
        isOpen={showTranslationPanel}
        onClose={() => setShowTranslationPanel(false)}
      />
      
      {/* Vocabulary Manager */}
              <VocabularyManager
          isOpen={showVocabularyManager}
          onClose={() => {
            setShowVocabularyManager(false);
            setOpenVocabularyManagerInAddMode(false);
          }}
          openInAddMode={openVocabularyManagerInAddMode}
        />

      {/* Pronunciation Result Modal */}
      {pronunciationResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800/90 to-purple-800/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl max-w-md">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4">Pronunciation Score</h3>
              <div className="text-4xl font-bold text-green-400 mb-2">
                {pronunciationResult.overallScore.toFixed(1)}/100
              </div>
              <p className="text-white/70 mb-4">{pronunciationResult.detailedFeedback}</p>
              <button
                onClick={() => setPronunciationResult(null)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAIAssistant;
