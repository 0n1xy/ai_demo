import React from "react";
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, Trash, Languages, BookOpen } from "lucide-react";

interface Props {
  isRecording: boolean;
  isProcessing: boolean;
  toggleRecording: () => void;
  isPlaying: boolean;
  stopAudio: () => void;
  clearConversation: () => void;
  onTranslate?: () => void;
  hasMessages?: boolean;
  onOpenVocabulary?: () => void;

  onTestProgress?: () => void;
  onDebugProgress?: () => void;
  onCreateTestData?: () => void;
  onDebugLocalStorage?: () => void;
  onCheckLocalStorage?: () => void;
  onTestDateHandling?: () => void;
}

const ControlButtons: React.FC<Props> = React.memo(({
  isRecording,
  isProcessing,
  toggleRecording,
  isPlaying,
  stopAudio,
  clearConversation,
  onTranslate,
  hasMessages,
  onOpenVocabulary,
  onTestProgress,
  onDebugProgress,
  onCreateTestData,
  onDebugLocalStorage,
  onCheckLocalStorage,
  onTestDateHandling,
}) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-white/20">
    <div className="flex justify-center gap-2 sm:gap-4">
    <div className="relative group">
      <button
        onClick={toggleRecording}
        disabled={isProcessing}
        className={`p-3 sm:p-4 rounded-xl transition-all duration-150 hover:scale-105 ${
          isRecording
            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25 border border-red-400/50"
            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 border border-blue-400/50"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isRecording ? (
          <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </button>
      
                           {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {isProcessing 
            ? "Đang xử lý, vui lòng chờ..." 
            : isRecording 
              ? "Đang ghi âm - sẽ tự động dừng và đánh giá phát âm" 
              : "Nhấn để bắt đầu ghi âm và đánh giá phát âm"
          }
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
        </div>
    </div>

    {/* Audio Button - Có thể bật lại khi cần */}
    {/* 
    <div className="relative group">
      <button
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
      </button>
      
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {isPlaying ? "Dừng phát âm thanh" : "Phát âm thanh phản hồi"}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
      </div>
    </div>
    */}

         <div className="relative group">
       <button
         onClick={clearConversation}
         className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-lg shadow-slate-500/25 transition-all duration-150 hover:scale-105 border border-slate-400/50"
       >
                    <Trash className="w-5 h-5 sm:w-6 sm:h-6" />
       </button>
       
       {/* Tooltip */}
       <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
         Xóa tất cả tin nhắn trong cuộc trò chuyện
         <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
       </div>
     </div>

     {/* Translation Button */}
     {onTranslate && hasMessages && (
       <div className="relative group">
         <button
           onClick={onTranslate}
           className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/25 transition-all duration-150 hover:scale-105 border border-green-400/50"
         >
           <Languages className="w-5 h-5 sm:w-6 sm:h-6" />
         </button>
         
         {/* Tooltip */}
         <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
           Dịch đoạn hội thoại
           <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
         </div>
       </div>
     )}

     {/* Vocabulary Button */}
     {onOpenVocabulary && (
       <div className="relative group">
         <button
           onClick={onOpenVocabulary}
           className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/25 transition-all duration-150 hover:scale-105 border border-purple-400/50"
         >
           <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
         </button>
         
         {/* Tooltip */}
         <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
           Quản lý từ vựng
           <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
         </div>
       </div>
     )}



    {/* Ẩn các button test và debug khác */}
    {/* 
    {onTestProgress && (
      <button
        onClick={onTestProgress}
        className="p-4 rounded-full bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/25 transition-all duration-200"
        title="Test tiến trình (tạm thời)"
      >
        <TestTube className="w-6 h-6" />
      </button>
    )}

    {onDebugProgress && (
      <button
        onClick={onDebugProgress}
        className="p-4 rounded-full bg-gray-600 hover:bg-gray-700 shadow-lg shadow-gray-500/25 transition-all duration-200"
        title="Debug tiến trình"
      >
        🔍
      </button>
    )}

    {onCreateTestData && (
      <button
        onClick={onCreateTestData}
        className="p-4 rounded-full bg-pink-600 hover:bg-pink-700 shadow-lg shadow-pink-500/25 transition-all duration-200"
        title="Tạo dữ liệu test"
      >
        📊
      </button>
    )}

    {onDebugLocalStorage && (
      <button
        onClick={onDebugLocalStorage}
        className="p-4 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all duration-200"
        title="Debug localStorage"
      >
        💾
      </button>
    )}

    {onCheckLocalStorage && (
      <button
        onClick={onCheckLocalStorage}
        className="p-4 rounded-full bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/25 transition-all duration-200"
        title="Kiểm tra localStorage"
      >
        ✅
      </button>
    )}

    {onTestDateHandling && (
      <button
        onClick={onTestDateHandling}
        className="p-4 rounded-full bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/25 transition-all duration-200"
        title="Test date handling"
      >
        📅
      </button>
    )}
    */}
    </div>
  </div>
));

ControlButtons.displayName = 'ControlButtons';

export default ControlButtons;
