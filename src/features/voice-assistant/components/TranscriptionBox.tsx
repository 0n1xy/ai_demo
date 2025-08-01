const TranscriptionBox = ({ text }: { text: string }) => (
  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-blue-400/30 shadow-lg">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
      <h3 className="text-sm font-semibold text-white/90">
        🎤 Live Transcription
      </h3>
    </div>
    <p className="text-blue-200 font-medium leading-relaxed">{text}</p>
  </div>
);

export default TranscriptionBox;
