import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "./components/Header";
import StatusBar from "./components/StatusBar";
import SettingsPanel from "./components/SettingsPanel";
import TranscriptionBox from "./components/TranscriptionBox";
import MessageList from "./components/MessageList";
import ControlButtons from "./components/ControlButtons";
import ErrorAlert from "./components/ErrorAlert";
import { createUserMessage, createAssistantMessage } from "./types/logic";
import type { Message, VoiceSettings } from "./types/types";

const VoiceAIAssistant: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcribedText, setTranscribedText] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<
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

  const AZURE_API_KEY = import.meta.env.VITE_AZURE_API_KEY;
  const AZURE_ENDPOINT = import.meta.env.VITE_AZURE_ENDPOINT;
  const AZURE_DEPLOYMENT = import.meta.env.VITE_AZURE_DEPLOYMENT;
  const AZURE_API_VERSION = import.meta.env.VITE_AZURE_API_VERSION;
  const GOOGLE_TTS_KEY = import.meta.env.VITE_GOOGLE_TTS_KEY;

  const topics = [
    {
      name: "Theme Park Staff",
      prompt: `You are a helpful and polite theme park staff member practicing English to give directions to visitors. Respond naturally, give clear directions, and always ask a polite follow-up question.`,
      initialMessage: "Hello! How can I assist you in the theme park today?",
    },
    {
      name: "Order Food",
      prompt: `You are a customer practicing how to order food in a restaurant. The AI should act as a restaurant server, respond politely, take orders, and ask follow-up questions like drink preferences, side dishes, or payment method.`,
      initialMessage: "Hi, I’d like to order something to eat.",
    },
    {
      name: "Free Talk",
      prompt: `You are a friendly and curious English tutor helping a student practice speaking. Always respond with a meaningful reply and ask one follow-up question.`,
      initialMessage: "Hi there! What would you like to talk about today?",
    },

    {
      name: "Future Dreams",
      prompt: `You are an encouraging English tutor helping a student talk about their future dreams and goals.`,
      initialMessage: "What’s your biggest dream or goal in life?",
    },
  ];

  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = voiceSettings.language;

      recognitionRef.current.onresult = (event) => {
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

        setTranscribedText(finalTranscript + interimTranscript);

        if (finalTranscript) {
          handleSendMessage(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          recognitionRef.current?.start();
        }
      };
    }

    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      recognitionRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [voiceSettings.language]);

  // const handleSendMessage = async (text: string) => {
  //   if (!text.trim()) return;

  //   setIsProcessing(true);
  //   setError(null);

  //   const userMessage = createUserMessage(text);

  //   const currentMessages = [...messages, userMessage];
  //   setMessages(currentMessages);

  //   try {
  //     const url = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;

  //     const messageHistory = currentMessages.map((msg) => ({
  //       role: msg.type === "user" ? "user" : "assistant",
  //       content: msg.content,
  //     }));

  //     const payload: any = {
  //       messages: [],
  //       max_completion_tokens: 500,
  //     };

  //     if (systemPrompt) {
  //       payload.messages.push({ role: "system", content: systemPrompt });
  //     }
  //     console.log("🧠 Using system prompt:", systemPrompt);
  //     payload.messages.push(...messageHistory);

  //     console.log("📤 Payload to Azure:", payload.messages);

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
  //       console.error("Azure Error", response.status, errorText);
  //       throw new Error("Failed to get response from Azure");
  //     }

  //     const data = await response.json();
  //     const aiText = data.choices[0].message.content;

  //     const assistantMessage = createAssistantMessage(aiText);
  //     setMessages((prev) => [...prev, assistantMessage]);

  //     await handleTextToSpeech(aiText);
  //   } catch (error) {
  //     console.error("🛑 Send Message Error:", error);
  //     setError("Failed to process message: " + (error as Error).message);
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  const handleSendMessage = async (text: string, customPrompt?: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    setError(null);

    const userMessage = createUserMessage(text);

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);

    try {
      const url = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;

      const messageHistory = currentMessages.map((msg) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      const promptToUse = customPrompt ?? systemPrompt;

      const payload: any = {
        messages: [],
        max_completion_tokens: 800,
      };

      if (promptToUse) {
        payload.messages.push({ role: "system", content: promptToUse });
      }

      console.log("🧠 Using system prompt:", promptToUse);
      payload.messages.push(...messageHistory);
      console.log("📤 Payload to Azure:", payload.messages);

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
      const aiText = data.choices[0]?.message?.content?.trim() || "";

      console.log("🤖 AI Response:", aiText);

      if (!aiText) {
        setError("Empty response from AI");
        return;
      }

      const assistantMessage = createAssistantMessage(aiText);
      setMessages((prev) => [...prev, assistantMessage]);

      console.log("🔊 Text to TTS:", aiText);
      await handleTextToSpeech(aiText);
    } catch (error) {
      console.error("🛑 Send Message Error:", error);
      setError("Failed to process message: " + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextToSpeech = async (text: string) => {
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

      // ✅ Log kết quả để debug nếu không có audioContent
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
        await audioRef.current.play();
      }
    } catch (error) {
      console.error("🛑 Google TTS Error:", error); // log lỗi rõ ràng
      setError("Failed to convert text to speech: " + (error as Error).message);
      setIsPlaying(false);
    }
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
  };

  // const handleSelectTopic = (topic: string, prompt: string) => {
  //   clearConversation();
  //   setSelectedTopic(topic);

  //   // ✅ Dùng callback để đảm bảo set xong prompt rồi mới gửi
  //   setSystemPrompt(prompt);
  // };

  const handleSelectTopic = (
    topicName: string,
    prompt: string,
    initialMessage: string
  ) => {
    clearConversation();
    setSelectedTopic(topicName);
    setSystemPrompt(prompt); // Giữ system prompt cho toàn bộ đoạn hội thoại
    handleSendMessage(initialMessage, prompt); // Gửi câu mở đầu riêng cho topic
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Header />
        <StatusBar
          connectionStatus={connectionStatus}
          isRecording={isRecording}
          isProcessing={isProcessing}
          toggleSettings={() => setShowSettings(!showSettings)}
        />
        {showSettings && (
          <SettingsPanel
            voiceSettings={voiceSettings}
            setVoiceSettings={setVoiceSettings}
          />
        )}
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Select a topic:</h2>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic.name}
                onClick={() =>
                  handleSelectTopic(
                    topic.name,
                    topic.prompt,
                    topic.initialMessage
                  )
                }
                className={`px-3 py-1 rounded ${
                  selectedTopic === topic.name ? "bg-blue-600" : "bg-gray-700"
                }`}
              >
                {topic.name}
              </button>
            ))}
          </div>
        </div>
        {error && <ErrorAlert error={error} />}
        {transcribedText && <TranscriptionBox text={transcribedText} />}
        <MessageList messages={messages} />
        <ControlButtons
          isRecording={isRecording}
          isProcessing={isProcessing}
          toggleRecording={toggleRecording}
          isPlaying={isPlaying}
          stopAudio={stopAudio}
          clearConversation={clearConversation}
        />
        <audio ref={audioRef} style={{ display: "none" }} />
      </div>
    </div>
  );
};

export default VoiceAIAssistant;
