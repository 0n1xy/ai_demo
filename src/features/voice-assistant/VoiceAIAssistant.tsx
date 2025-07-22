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
        sendTimeout.current = setTimeout(() => {
          console.log("Gửi message:", finalTranscript.trim());
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
      if (isRecordingRef.current) {
        recognitionRef.current?.start();
      }
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

  const handleSendMessage = async (text: string, customPrompt?: string) => {
    if (!text.trim()) return;

    const promptToUse =  localStorage.getItem("systemPrompt");
  if (!promptToUse) {
    setError("Bạn cần chọn chủ đề luyện nói trước khi bắt đầu.");
    setIsProcessing(false);
    return;
  }
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
      recognitionRef.current?.stop();
      setIsRecording(false);
      console.log("⏹️ Stopped recording");
    } else {
      try {
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

  const clearConversation = () => {
    setMessages([]);
    setTranscribedText("");
    setError(null);
    setSelectedTopic(null);
    setSystemPrompt(null);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-10 max-w-3xl text-lg leading-relaxed">
        {/* HEADER */}
        <Header />

        {/* STATUS BAR */}
        {/* <StatusBar
          connectionStatus={connectionStatus}
          isRecording={isRecording}
          isProcessing={isProcessing}
          toggleSettings={() => setShowSettings(!showSettings)}
        /> */}

        {/* SETTINGS PANEL */}
        {/* {showSettings && (
          <SettingsPanel
            voiceSettings={voiceSettings}
            setVoiceSettings={setVoiceSettings}
          />
        )} */}

        {/* TOPIC SELECTOR */}
        <div className="mb-8">
          <div className="mb-6">
            <label
              htmlFor="topicSelect"
              className="block mb-2 font-semibold text-lg"
            >
              🎯 Chọn chủ đề luyện nói:
            </label>
            <select
              id="topicSelect"
              className="w-full px-4 py-2 rounded-md bg-gray-100 border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={selectedTopic || ""}
              onChange={(e) => {
                const selected = topics.find((t) => t.name === e.target.value);
                if (selected) {
                  handleSelectTopic(
                    selected.name,
                    selected.prompt,
                    selected.initialMessage
                  );
                }
              }}
            >
              <option value="" disabled>
                Chọn chủ đề
              </option>
              {topics.map((topic) => (
                <option key={topic.name} value={topic.name}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>
        </div>
   

        {/* ERROR ALERT */}
        {error && <ErrorAlert error={error} />}

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
          <div className="mb-8">
            <p className="text-base text-gray-700 mb-3 font-medium">
              🗣️ Gợi ý câu bạn có thể thử nói:
            </p>
            <div className="space-y-3">
              {replySuggestions.map((s, i) => (
                <div
                  key={i}
                  className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md border border-blue-300"
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
          isProcessing={isProcessing}
          toggleRecording={toggleRecording}
          isPlaying={isPlaying}
          stopAudio={stopAudio}
          clearConversation={clearConversation}
        />

        {/* AUDIO PLAYER (INVISIBLE) */}
        {/* <audio ref={audioRef} style={{ display: "none" }} /> */}
        <FloatingFeedback />
      </div>
    </div>
  );
};

export default VoiceAIAssistant;
