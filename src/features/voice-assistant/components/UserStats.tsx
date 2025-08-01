import React from 'react';
import { TrendingUp, Clock, BookOpen, Target, Calendar, Star } from 'lucide-react';
import type { UserStats } from '../types/types';

interface Props {
  stats: UserStats;
}

const UserStatsComponent: React.FC<Props> = ({ stats }) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (date: Date | string) => {
    // Đảm bảo date là Date object
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Kiểm tra nếu date không hợp lệ
    if (isNaN(dateObj.getTime())) {
      return 'Chưa có dữ liệu';
    }
    
    return dateObj.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-6 text-white flex items-center">
        <TrendingUp className="w-6 h-6 mr-2 text-blue-400" />
        Thống kê học tập
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tổng số cuộc trò chuyện */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-4 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Tổng cuộc trò chuyện</p>
              <p className="text-2xl font-bold text-white">{stats.totalConversations}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        {/* Tổng thời gian học */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-4 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">Tổng thời gian</p>
              <p className="text-2xl font-bold text-white">{formatTime(stats.totalConversationTime)}</p>
            </div>
            <Clock className="w-8 h-8 text-green-400" />
          </div>
        </div>

        {/* Từ mới học được - Đã ẩn */}
        {/* 
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-4 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-medium">Từ mới học</p>
              <p className="text-2xl font-bold text-white">{stats.totalWordsLearned}</p>
            </div>
            <Target className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        */}

        {/* Điểm trôi chảy trung bình */}
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg p-4 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-sm font-medium">Điểm trôi chảy TB</p>
              <p className="text-2xl font-bold text-white">{stats.averageFluencyScore}/100</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        {/* Số ngày học liên tiếp */}
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg p-4 border border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-300 text-sm font-medium">Ngày học liên tiếp</p>
              <p className="text-2xl font-bold text-white">{stats.streakDays}</p>
            </div>
            <Calendar className="w-8 h-8 text-red-400" />
          </div>
        </div>

        {/* Lần học cuối */}
        <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-lg p-4 border border-indigo-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-300 text-sm font-medium">Lần học cuối</p>
              <p className="text-lg font-bold text-white">{formatDate(stats.lastStudyDate)}</p>
            </div>
            <Star className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Chủ đề yêu thích */}
      {stats.favoriteTopics.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-400" />
            Chủ đề yêu thích
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.favoriteTopics.map((topic, index) => (
              <span
                key={topic}
                className="px-3 py-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full text-sm font-medium text-white border border-blue-400/50"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStatsComponent; 