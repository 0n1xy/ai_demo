import React from 'react';
import { TrendingUp, Clock, Target } from 'lucide-react';
import { ProgressService } from '../service/progressService';
import type { UserStats } from '../types/types';

interface Props {
  onShowFullProgress: () => void;
}

const QuickProgress: React.FC<Props> = ({ onShowFullProgress }) => {
  const [stats, setStats] = React.useState<UserStats | null>(null);

  const loadStats = () => {
    const userStats = ProgressService.getUserStats();
    setStats(userStats);
  };

  React.useEffect(() => {
    loadStats();
    
    // Refresh stats mỗi 5 giây
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!stats || stats.totalConversations === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-blue-400/30 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-blue-500/30 rounded-xl">
            <TrendingUp className="w-6 h-6 text-blue-300" />
          </div>
          Tiến trình học
        </h3>
        <button
          onClick={onShowFullProgress}
          className="px-4 py-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 hover:from-blue-500/50 hover:to-purple-500/50 rounded-xl text-white/90 font-medium transition-all duration-300 hover:scale-105 border border-blue-400/50"
        >
          Xem chi tiết →
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="text-center p-4 bg-white/10 rounded-xl border border-white/20">
          <div className="text-3xl font-bold text-blue-300 mb-1">{stats.totalConversations}</div>
          <div className="text-sm text-white/70 font-medium">Cuộc trò chuyện</div>
        </div>
        {/* Từ mới - Đã ẩn */}
        {/* 
        <div className="text-center p-4 bg-white/10 rounded-xl border border-white/20">
          <div className="text-3xl font-bold text-green-300 mb-1">{stats.totalWordsLearned}</div>
          <div className="text-sm text-white/70 font-medium">Từ mới</div>
        </div>
        */}
        <div className="text-center p-4 bg-white/10 rounded-xl border border-white/20">
          <div className="text-3xl font-bold text-yellow-300 mb-1">{stats.averageFluencyScore}</div>
          <div className="text-sm text-white/70 font-medium">Điểm TB</div>
        </div>
      </div>
      
      {stats.streakDays > 0 && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/30 to-orange-500/30 rounded-xl border border-red-400/50">
            <span className="text-2xl">🔥</span>
            <span className="text-white font-bold">{stats.streakDays} ngày học liên tiếp!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickProgress; 