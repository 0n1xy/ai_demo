// import React, { useState, useEffect, useRef, useCallback } from "react";
// import {
//   Mic,
//   MicOff,
//   Volume2,
//   VolumeX,
//   Settings,
//   MessageCircle,
//   Loader2,
//   AlertCircle,
// } from "lucide-react";

// interface Message {
//   id: string;
//   type: "user" | "assistant";
//   content: string;
//   timestamp: Date;
//   isAudio?: boolean;
// }

// interface VoiceSettings {
//   language: string;
//   voice: string;
//   speed: number;
//   pitch: number;
// }

// const VoiceAIAssistant: React.FC = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [transcribedText, setTranscribedText] = useState("");
//   const [connectionStatus, setConnectionStatus] = useState<
//     "connected" | "disconnected" | "connecting"
//   >("disconnected");
//   const [showSettings, setShowSettings] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
//     language: "vi-VN",
//     voice: "vi-VN-Standard-A",
//     speed: 1.0,
//     pitch: 0.0,
//   });

//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioChunksRef = useRef<Blob[]>([]);
//   const audioContextRef = useRef<AudioContext | null>(null);
//   const streamRef = useRef<MediaStream | null>(null);
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const synthRef = useRef<SpeechSynthesis | null>(null);
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   // Initialize speech recognition
//   useEffect(() => {
//     if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
//       const SpeechRecognition =
//         window.SpeechRecognition || window.webkitSpeechRecognition;
//       recognitionRef.current = new SpeechRecognition();
//       recognitionRef.current.continuous = true;
//       recognitionRef.current.interimResults = true;
//       recognitionRef.current.lang = voiceSettings.language;

//       recognitionRef.current.onresult = (event) => {
//         let finalTranscript = "";
//         let interimTranscript = "";

//         for (let i = event.resultIndex; i < event.results.length; i++) {
//           const transcript = event.results[i][0].transcript;
//           if (event.results[i].isFinal) {
//             finalTranscript += transcript;
//           } else {
//             interimTranscript += transcript;
//           }
//         }

//         setTranscribedText(finalTranscript + interimTranscript);

//         if (finalTranscript) {
//           handleSendMessage(finalTranscript);
//         }
//       };

//       recognitionRef.current.onerror = (event) => {
//         setError(`Speech recognition error: ${event.error}`);
//         setIsRecording(false);
//       };

//       recognitionRef.current.onend = () => {
//         if (isRecording) {
//           recognitionRef.current?.start();
//         }
//       };
//     }

//     // Initialize speech synthesis
//     if ("speechSynthesis" in window) {
//       synthRef.current = window.speechSynthesis;
//     }

//     return () => {
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, [voiceSettings.language]);

//   // Handle sending message to Azure OpenAI
//   const handleSendMessage = async (text: string) => {
//     if (!text.trim()) return;

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       type: "user",
//       content: text,
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setIsProcessing(true);
//     setError(null);

//     try {
//       // Simulate API call to Azure OpenAI
//       const response = await fetch("/api/chat", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           message: text,
//           conversation_id: "session-" + Date.now(),
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to get response from AI");
//       }

//       const data = await response.json();

//       const assistantMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         type: "assistant",
//         content: data.response,
//         timestamp: new Date(),
//       };

//       setMessages((prev) => [...prev, assistantMessage]);

//       // Convert text to speech using Google Cloud TTS
//       await handleTextToSpeech(data.response);
//     } catch (error) {
//       setError("Failed to process message: " + (error as Error).message);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // Handle text-to-speech conversion
//   const handleTextToSpeech = async (text: string) => {
//     try {
//       setIsPlaying(true);

//       // First try Google Cloud TTS API
//       const response = await fetch("/api/tts", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           text: text,
//           voice: voiceSettings.voice,
//           speed: voiceSettings.speed,
//           pitch: voiceSettings.pitch,
//         }),
//       });

//       if (response.ok) {
//         const audioBlob = await response.blob();
//         const audioUrl = URL.createObjectURL(audioBlob);

//         if (audioRef.current) {
//           audioRef.current.src = audioUrl;
//           audioRef.current.onended = () => {
//             setIsPlaying(false);
//             URL.revokeObjectURL(audioUrl);
//           };
//           await audioRef.current.play();
//         }
//       } else {
//         // Fallback to Web Speech API
//         if (synthRef.current) {
//           const utterance = new SpeechSynthesisUtterance(text);
//           utterance.lang = voiceSettings.language;
//           utterance.rate = voiceSettings.speed;
//           utterance.pitch = voiceSettings.pitch;
//           utterance.onend = () => setIsPlaying(false);
//           synthRef.current.speak(utterance);
//         }
//       }
//     } catch (error) {
//       setError("Failed to convert text to speech: " + (error as Error).message);
//       setIsPlaying(false);
//     }
//   };

//   // Toggle recording
//   const toggleRecording = useCallback(() => {
//     if (isRecording) {
//       setIsRecording(false);
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//     } else {
//       setIsRecording(true);
//       setError(null);
//       if (recognitionRef.current) {
//         recognitionRef.current.start();
//       }
//     }
//   }, [isRecording]);

//   // Stop audio playback
//   const stopAudio = () => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.currentTime = 0;
//     }
//     if (synthRef.current) {
//       synthRef.current.cancel();
//     }
//     setIsPlaying(false);
//   };

//   // Clear conversation
//   const clearConversation = () => {
//     setMessages([]);
//     setTranscribedText("");
//     setError(null);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
//       <div className="container mx-auto px-4 py-8 max-w-4xl">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
//             Voice AI Assistant
//           </h1>
//           <p className="text-slate-300">
//             Speak naturally and get intelligent responses
//           </p>
//         </div>

//         {/* Status Bar */}
//         <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 mb-6 flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <div
//               className={`flex items-center space-x-2 ${
//                 connectionStatus === "connected"
//                   ? "text-green-400"
//                   : "text-red-400"
//               }`}
//             >
//               <div
//                 className={`w-2 h-2 rounded-full ${
//                   connectionStatus === "connected"
//                     ? "bg-green-400"
//                     : "bg-red-400"
//                 }`}
//               ></div>
//               <span className="text-sm font-medium">
//                 {connectionStatus === "connected"
//                   ? "Connected"
//                   : "Disconnected"}
//               </span>
//             </div>
//             {isRecording && (
//               <div className="flex items-center space-x-2 text-red-400">
//                 <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
//                 <span className="text-sm font-medium">Recording...</span>
//               </div>
//             )}
//             {isProcessing && (
//               <div className="flex items-center space-x-2 text-blue-400">
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 <span className="text-sm font-medium">Processing...</span>
//               </div>
//             )}
//           </div>
//           <button
//             onClick={() => setShowSettings(!showSettings)}
//             className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
//           >
//             <Settings className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Settings Panel */}
//         {showSettings && (
//           <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6">
//             <h3 className="text-xl font-semibold mb-4">Voice Settings</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Language
//                 </label>
//                 <select
//                   value={voiceSettings.language}
//                   onChange={(e) =>
//                     setVoiceSettings((prev) => ({
//                       ...prev,
//                       language: e.target.value,
//                     }))
//                   }
//                   className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-400 focus:outline-none"
//                 >
//                   <option value="vi-VN">Vietnamese</option>
//                   <option value="en-US">English (US)</option>
//                   <option value="en-GB">English (UK)</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-2">Voice</label>
//                 <select
//                   value={voiceSettings.voice}
//                   onChange={(e) =>
//                     setVoiceSettings((prev) => ({
//                       ...prev,
//                       voice: e.target.value,
//                     }))
//                   }
//                   className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-400 focus:outline-none"
//                 >
//                   <option value="vi-VN-Standard-A">Vietnamese Female</option>
//                   <option value="vi-VN-Standard-B">Vietnamese Male</option>
//                   <option value="en-US-Standard-A">English Female</option>
//                   <option value="en-US-Standard-B">English Male</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Speed: {voiceSettings.speed}
//                 </label>
//                 <input
//                   type="range"
//                   min="0.5"
//                   max="2.0"
//                   step="0.1"
//                   value={voiceSettings.speed}
//                   onChange={(e) =>
//                     setVoiceSettings((prev) => ({
//                       ...prev,
//                       speed: parseFloat(e.target.value),
//                     }))
//                   }
//                   className="w-full"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Pitch: {voiceSettings.pitch}
//                 </label>
//                 <input
//                   type="range"
//                   min="-20"
//                   max="20"
//                   step="1"
//                   value={voiceSettings.pitch}
//                   onChange={(e) =>
//                     setVoiceSettings((prev) => ({
//                       ...prev,
//                       pitch: parseFloat(e.target.value),
//                     }))
//                   }
//                   className="w-full"
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Error Display */}
//         {error && (
//           <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 flex items-center space-x-2">
//             <AlertCircle className="w-5 h-5 text-red-400" />
//             <span className="text-red-300">{error}</span>
//           </div>
//         )}

//         {/* Live Transcription */}
//         {transcribedText && (
//           <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 mb-6">
//             <h3 className="text-sm font-medium text-slate-300 mb-2">
//               Live Transcription:
//             </h3>
//             <p className="text-blue-300">{transcribedText}</p>
//           </div>
//         )}

//         {/* Chat Messages */}
//         <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 min-h-[400px] max-h-[600px] overflow-y-auto">
//           {messages.length === 0 ? (
//             <div className="text-center text-slate-400 py-12">
//               <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
//               <p>Start speaking to begin your conversation</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {messages.map((message) => (
//                 <div
//                   key={message.id}
//                   className={`flex ${
//                     message.type === "user" ? "justify-end" : "justify-start"
//                   }`}
//                 >
//                   <div
//                     className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
//                       message.type === "user"
//                         ? "bg-blue-600 text-white"
//                         : "bg-slate-700 text-slate-200"
//                     }`}
//                   >
//                     <p>{message.content}</p>
//                     <p className="text-xs opacity-70 mt-1">
//                       {message.timestamp.toLocaleTimeString()}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Control Buttons */}
//         <div className="flex justify-center space-x-4">
//           <button
//             onClick={toggleRecording}
//             disabled={isProcessing}
//             className={`p-4 rounded-full transition-all duration-200 ${
//               isRecording
//                 ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25"
//                 : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25"
//             } disabled:opacity-50 disabled:cursor-not-allowed`}
//           >
//             {isRecording ? (
//               <MicOff className="w-6 h-6" />
//             ) : (
//               <Mic className="w-6 h-6" />
//             )}
//           </button>

//           <button
//             onClick={isPlaying ? stopAudio : () => {}}
//             disabled={!isPlaying}
//             className={`p-4 rounded-full transition-all duration-200 ${
//               isPlaying
//                 ? "bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/25"
//                 : "bg-slate-600 shadow-lg shadow-slate-500/25"
//             } disabled:opacity-50 disabled:cursor-not-allowed`}
//           >
//             {isPlaying ? (
//               <VolumeX className="w-6 h-6" />
//             ) : (
//               <Volume2 className="w-6 h-6" />
//             )}
//           </button>

//           <button
//             onClick={clearConversation}
//             className="p-4 rounded-full bg-slate-600 hover:bg-slate-700 shadow-lg shadow-slate-500/25 transition-all duration-200"
//           >
//             <MessageCircle className="w-6 h-6" />
//           </button>
//         </div>

//         {/* Audio element for playback */}
//         <audio ref={audioRef} style={{ display: "none" }} />
//       </div>
//     </div>
//   );
// };

// export default VoiceAIAssistant;

import React from "react";
import VoiceAIAssistant from "./features/voice-assistant/VoiceAIAssistant";

const App = () => {
  return (
    <div>
      <VoiceAIAssistant />
    </div>
  );
};

export default App;
