import { AlertCircle } from "lucide-react";

const ErrorAlert = ({ error }: { error: string }) => (
  <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm border border-red-400/50 rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-lg">
    <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
    <span className="text-red-200 font-medium">{error}</span>
  </div>
);

export default ErrorAlert;
