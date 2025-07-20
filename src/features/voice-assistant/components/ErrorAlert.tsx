import { AlertCircle } from "lucide-react";

const ErrorAlert = ({ error }: { error: string }) => (
  <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 flex items-center space-x-2">
    <AlertCircle className="w-5 h-5 text-red-400" />
    <span className="text-red-300">{error}</span>
  </div>
);

export default ErrorAlert;
