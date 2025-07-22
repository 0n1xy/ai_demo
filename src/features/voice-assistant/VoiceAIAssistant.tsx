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
      prompt: `You are a customer practicing how to order food in a restaurant...`,
      initialMessage: "Hi, I’d like to order something to eat.",
    },
    // {
    //   name: "Free Talk",
    //   prompt: `You are a friendly and curious English tutor helping a student practice speaking. Always respond with a meaningful reply and ask one follow-up question.`,
    //   initialMessage: "Hi there! What would you like to talk about today?",
    // },

    // {
    //   name: "Future Dreams",
    //   prompt: `You are an encouraging English tutor helping a student talk about their future dreams and goals.`,
    //   initialMessage: "What’s your biggest dream or goal in life?",
    // },
  ];

  useEffect(() => {
    let sendTimeout: NodeJS.Timeout | null = null;

    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || (window as any).webkitSpeechRecognition;

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

        if (finalTranscript.trim()) {
          // Nếu đang chờ gửi cũ, huỷ bỏ
          if (sendTimeout) clearTimeout(sendTimeout);

          // Đợi 3 giây, nếu không có transcript mới thì gửi
          sendTimeout = setTimeout(() => {
            handleSendMessage(finalTranscript.trim());
            setTranscribedText("");
          }, 3000);
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
      if (sendTimeout) clearTimeout(sendTimeout);
      recognitionRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [voiceSettings.language]);

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
        max_completion_tokens: 1500,
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

      console.log("Data:", data);
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

  // const handleSendMessage = async (text: string, customPrompt?: string) => {
  //   if (!text.trim()) return;

  //   setIsProcessing(true);
  //   setError(null);

  //   const userMessage = createUserMessage(text);
  //   const currentMessages = [...messages, userMessage];
  //   setMessages(currentMessages);

  //   try {
  //     const url = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;

  //     const promptToUse = customPrompt ?? systemPrompt;

  //     const messageHistory = currentMessages.map((msg) => ({
  //       role: msg.type === "user" ? "user" : "assistant",
  //       content: msg.content,
  //     }));

  //     const payload: any = {
  //       messages: [],
  //       max_completion_tokens: 800,
  //     };

  //     if (promptToUse) {
  //       payload.messages.push({ role: "system", content: promptToUse });
  //     }

  //     payload.messages.push(...messageHistory);

  //     console.log("🧠 Using system prompt:", promptToUse);
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
  //     const aiText = data.choices?.[0]?.message?.content?.trim() || "";

  //     if (!aiText) {
  //       setError("Empty response from AI");
  //       return;
  //     }

  //     const assistantMessage = createAssistantMessage(aiText);
  //     const updatedMessages = [...currentMessages, assistantMessage];
  //     setMessages(updatedMessages);

  //     console.log("🤖 AI Response:", aiText);
  //     await handleTextToSpeech(aiText);

  //     // ✅ Gợi ý câu trả lời tiếp theo bằng cách gọi lại Azure để sinh JSON reply
  //     const suggestionResponse = await fetch(url, {
  //       method: "POST",
  //       headers: {
  //         "api-key": AZURE_API_KEY,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         messages: [
  //           {
  //             role: "system",
  //             content: `You're an English tutor. Based on the conversation so far, suggest 2 short and natural replies the student might say next. Respond with a JSON array of 1-2 sentences.`,
  //           },
  //           ...updatedMessages.map((msg) => ({
  //             role: msg.type === "user" ? "user" : "assistant",
  //             content: msg.content,
  //           })),
  //         ],
  //         // temperature: 0.7,
  //         max_completion_tokens: 800,
  //       }),
  //     });

  //     const suggestionData = await suggestionResponse.json();
  //     const rawSuggestions =
  //       suggestionData.choices?.[0]?.message?.content || "";

  //     try {
  //       const parsedSuggestions = JSON.parse(rawSuggestions);
  //       if (Array.isArray(parsedSuggestions)) {
  //         setReplySuggestions(parsedSuggestions);
  //         console.log("💡 Suggested replies:", parsedSuggestions);
  //       }
  //     } catch {
  //       console.warn("⚠️ Could not parse suggestions:", rawSuggestions);
  //     }
  //   } catch (error) {
  //     console.error("🛑 Send Message Error:", error);
  //     setError("Failed to process message: " + (error as Error).message);
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

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
            content: "Suggest a possible response the user might say next.",
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
      } else {
        setError("No suggestion received.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch suggestion: " + (err as Error).message);
    }
  };

  // return (
  //   <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
  //     <div className="container mx-auto px-4 py-8 max-w-4xl">
  //       {/* HEADER */}
  //       <Header />

  //       {/* STATUS BAR */}
  //       <StatusBar
  //         connectionStatus={connectionStatus}
  //         isRecording={isRecording}
  //         isProcessing={isProcessing}
  //         toggleSettings={() => setShowSettings(!showSettings)}
  //       />

  //       {/* SETTINGS */}
  //       {showSettings && (
  //         <SettingsPanel
  //           voiceSettings={voiceSettings}
  //           setVoiceSettings={setVoiceSettings}
  //         />
  //       )}

  //       {/* TOPIC SELECTOR */}
  //       <div className="mb-6">
  //         <h2 className="text-lg font-semibold mb-2">🎯 Select a topic:</h2>
  //         <div className="flex flex-col gap-3">
  //           {topics.map((topic) => (
  //             <div
  //               key={topic.name}
  //               className="flex items-center justify-between bg-gray-800 rounded px-4 py-2"
  //             >
  //               <div className="flex items-center gap-3">
  //                 <button
  //                   onClick={() =>
  //                     handleSelectTopic(
  //                       topic.name,
  //                       topic.prompt,
  //                       topic.initialMessage
  //                     )
  //                   }
  //                   className={`px-3 py-1 rounded font-medium ${
  //                     selectedTopic === topic.name
  //                       ? "bg-blue-600"
  //                       : "bg-gray-600 hover:bg-gray-500"
  //                   }`}
  //                 >
  //                   {topic.name}
  //                 </button>

  //                 {topic.sampleDialog && (
  //                   <button
  //                     onClick={() =>
  //                       handlePracticeSample(
  //                         topic.name,
  //                         topic.prompt,
  //                         topic.sampleDialog
  //                       )
  //                     }
  //                     className="px-2 py-1 text-sm bg-yellow-600 hover:bg-yellow-500 rounded"
  //                   >
  //                     📖 Practice Sample
  //                   </button>
  //                 )}
  //               </div>
  //             </div>
  //           ))}
  //         </div>
  //       </div>

  //       {/* ERROR ALERT */}
  //       {error && <ErrorAlert error={error} />}

  //       {/* LIVE TRANSCRIPTION TEXT */}
  //       {transcribedText && <TranscriptionBox text={transcribedText} />}

  //       {/* MESSAGE LIST (with sampleMode) */}
  //       <MessageList messages={messages} sampleMode={sampleMode} />

  //       {/* CONTROL BUTTONS */}
  //       <ControlButtons
  //         isRecording={isRecording}
  //         isProcessing={isProcessing}
  //         toggleRecording={toggleRecording}
  //         isPlaying={isPlaying}
  //         stopAudio={stopAudio}
  //         clearConversation={clearConversation}
  //       />

  //       {/* HIDDEN AUDIO ELEMENT */}
  //       <audio ref={audioRef} style={{ display: "none" }} />
  //     </div>
  //   </div>
  // );

  return (
    // <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
    //   <div className="container mx-auto px-4 py-8 max-w-4xl">
    //     {/* HEADER */}
    //     <Header />

    //     {/* STATUS BAR */}
    //     <StatusBar
    //       connectionStatus={connectionStatus}
    //       isRecording={isRecording}
    //       isProcessing={isProcessing}
    //       toggleSettings={() => setShowSettings(!showSettings)}
    //     />

    //     {/* SETTINGS PANEL */}
    //     {showSettings && (
    //       <SettingsPanel
    //         voiceSettings={voiceSettings}
    //         setVoiceSettings={setVoiceSettings}
    //       />
    //     )}

    //     {/* TOPIC SELECTOR */}
    //     <div className="mb-6">
    //       <h2 className="text-lg font-semibold mb-2">🎯 Select a topic:</h2>
    //       <div className="flex flex-col gap-3">
    //         {topics.map((topic) => (
    //           <div
    //             key={topic.name}
    //             className="flex items-center justify-between bg-gray-800 rounded px-4 py-2"
    //           >
    //             <div className="flex items-center gap-3">
    //               <button
    //                 onClick={() =>
    //                   handleSelectTopic(
    //                     topic.name,
    //                     topic.prompt,
    //                     topic.initialMessage
    //                   )
    //                 }
    //                 className={`px-3 py-1 rounded font-medium ${
    //                   selectedTopic === topic.name
    //                     ? "bg-blue-600"
    //                     : "bg-gray-600 hover:bg-gray-500"
    //                 }`}
    //               >
    //                 {topic.name}
    //               </button>
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     </div>

    //     {/* ERROR ALERT */}
    //     {error && <ErrorAlert error={error} />}

    //     {/* LIVE TRANSCRIPTION */}
    //     {transcribedText && <TranscriptionBox text={transcribedText} />}

    //     {/* MESSAGE LIST */}
    //     <MessageList
    //       messages={messages}
    //       sampleMode={sampleMode}
    //       onSuggestReply={handleSuggestReplyAt}
    //     />

    //     {/* SUGGESTED REPLIES */}
    //     {replySuggestions.length > 0 && (
    //       <div className="mb-6">
    //         <p className="text-sm text-gray-300 mb-2">
    //           🗣️ Try saying one of these:
    //         </p>
    //         <div className="space-y-2">
    //           {replySuggestions.map((s, i) => (
    //             <div
    //               key={i}
    //               className="bg-green-700 text-white px-4 py-2 rounded"
    //             >
    //               {s}
    //             </div>
    //           ))}
    //         </div>
    //       </div>
    //     )}

    //     {/* CONTROL BUTTONS */}
    //     <ControlButtons
    //       isRecording={isRecording}
    //       isProcessing={isProcessing}
    //       toggleRecording={toggleRecording}
    //       isPlaying={isPlaying}
    //       stopAudio={stopAudio}
    //       clearConversation={clearConversation}
    //     />

    //     {/* AUDIO PLAYER (INVISIBLE) */}
    //     <audio ref={audioRef} style={{ display: "none" }} />
    //   </div>
    // </div>
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
                -- Chọn chủ đề --
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
        <audio ref={audioRef} style={{ display: "none" }} />
      </div>
    </div>
  );
};

export default VoiceAIAssistant;
