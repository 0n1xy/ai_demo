import React from 'react';

const Header = React.memo(() => (
  <div className="text-center mb-6">
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        🎤 Luyện nói tiếng Anh với AI
      </h1>
      <p className="text-base text-white/80 leading-relaxed">
        Nói tự nhiên hơn và cải thiện phản xạ giao tiếp tiếng Anh của bạn
      </p>
      <div className="flex justify-center items-center gap-4 mt-4">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          AI Assistant sẵn sàng
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          Voice Recognition
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          Real-time Chat
        </div>
      </div>
    </div>
  </div>
));

Header.displayName = 'Header';

export default Header;
