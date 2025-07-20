const TranscriptionBox = ({ text }: { text: string }) => (
  <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 mb-6">
    <h3 className="text-sm font-medium text-slate-300 mb-2">
      Live Transcription:
    </h3>
    <p className="text-blue-300">{text}</p>
  </div>
);

export default TranscriptionBox;
