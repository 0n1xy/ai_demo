import { Loader2, Settings } from "lucide-react";

interface Props {
  connectionStatus: "connected" | "disconnected" | "connecting";
  isRecording: boolean;
  isProcessing: boolean;
  toggleSettings: () => void;
}

const StatusBar = ({
  connectionStatus,
  isRecording,
  isProcessing,
  toggleSettings,
}: Props) => (
  <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 mb-6 flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <div
        className={`flex items-center space-x-2 ${
          connectionStatus === "connected" ? "text-green-400" : "text-red-400"
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            connectionStatus === "connected" ? "bg-green-400" : "bg-red-400"
          }`}
        />
        <span className="text-sm font-medium">
          {connectionStatus === "connected" ? "Connected" : "Disconnected"}
        </span>
      </div>
      {isRecording && (
        <div className="flex items-center space-x-2 text-red-400">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          <span className="text-sm font-medium">Recording...</span>
        </div>
      )}
      {isProcessing && (
        <div className="flex items-center space-x-2 text-blue-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Processing...</span>
        </div>
      )}
    </div>
    <button
      onClick={toggleSettings}
      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
    >
      <Settings className="w-5 h-5" />
    </button>
  </div>
);

export default StatusBar;
