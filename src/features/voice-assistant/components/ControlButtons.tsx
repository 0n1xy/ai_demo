import React from "react";
import { Mic, MicOff, Volume2, VolumeX, MessageCircle } from "lucide-react";

interface Props {
  isRecording: boolean;
  isProcessing: boolean;
  toggleRecording: () => void;
  isPlaying: boolean;
  stopAudio: () => void;
  clearConversation: () => void;
}

const ControlButtons: React.FC<Props> = ({
  isRecording,
  isProcessing,
  toggleRecording,
  isPlaying,
  stopAudio,
  clearConversation,
}) => (
  <div className="flex justify-center space-x-4">
    <button
      onClick={toggleRecording}
      disabled={isProcessing}
      className={`p-4 rounded-full transition-all duration-200 ${
        isRecording
          ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25"
          : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isRecording ? (
        <MicOff className="w-6 h-6" />
      ) : (
        <Mic className="w-6 h-6" />
      )}
    </button>

    {/* <button
      onClick={isPlaying ? stopAudio : () => {}}
      disabled={!isPlaying}
      className={`p-4 rounded-full transition-all duration-200 ${
        isPlaying
          ? "bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/25"
          : "bg-slate-600 shadow-lg shadow-slate-500/25"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isPlaying ? (
        <VolumeX className="w-6 h-6" />
      ) : (
        <Volume2 className="w-6 h-6" />
      )}
    </button> */}

    {/* <button
      onClick={clearConversation}
      className="p-4 rounded-full bg-slate-600 hover:bg-slate-700 shadow-lg shadow-slate-500/25 transition-all duration-200"
    >
      <MessageCircle className="w-6 h-6" />
    </button> */}
  </div>
);

export default ControlButtons;
