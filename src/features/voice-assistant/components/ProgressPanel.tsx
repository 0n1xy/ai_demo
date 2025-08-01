import React, { useState, useEffect } from 'react';
import { BarChart3, X, Calendar, TrendingUp } from 'lucide-react';
import ProgressChart from './ProgressChart';
import { ProgressService } from '../service/progressService';
import type { ProgressChartData } from '../types/types';
import type { UserStats as UserStatsType } from '../types/types';
import UserStatsComponent from './UserStats';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ProgressPanel: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'charts'>('overview');
  const [chartData, setChartData] = useState<ProgressChartData[]>([]);
  const [userStats, setUserStats] = useState<UserStatsType | null>(null);
  const [timeRange, setTimeRange] = useState<number>(7);

  useEffect(() => {
    if (isOpen) {
      loadProgressData();
    }
  }, [isOpen, timeRange]);

  const loadProgressData = () => {
    const data = ProgressService.getChartData(timeRange);
    const stats = ProgressService.getUserStats();
    setChartData(data);
    setUserStats(stats);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl">
              <BarChart3 className="w-8 h-8 text-blue-300" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              📊 Tiến trình học tập
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-2xl transition-all duration-300 hover:scale-110"
          >
            <X className="w-6 h-6 text-white/70" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/20 bg-gradient-to-r from-slate-800/50 to-purple-800/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-6 px-8 text-center font-semibold transition-all duration-300 ${
              activeTab === 'overview'
                ? 'text-blue-300 border-b-2 border-blue-400 bg-gradient-to-r from-blue-500/20 to-transparent'
                : 'text-white/60 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-6 h-6 inline mr-3" />
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex-1 py-6 px-8 text-center font-semibold transition-all duration-300 ${
              activeTab === 'charts'
                ? 'text-blue-300 border-b-2 border-blue-400 bg-gradient-to-r from-blue-500/20 to-transparent'
                : 'text-white/60 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-6 h-6 inline mr-3" />
            Biểu đồ
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {activeTab === 'overview' && userStats && userStats.lastStudyDate && (
            <UserStatsComponent stats={userStats} />
          )}

          {activeTab === 'overview' && (!userStats || !userStats.lastStudyDate) && (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Chưa có dữ liệu thống kê
              </h3>
              <p className="text-slate-400">
                Bắt đầu luyện nói để theo dõi tiến độ học tập của bạn
              </p>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="space-y-6">
              {/* Time Range Selector */}
              <div className="flex items-center space-x-4 mb-6">
                <label className="text-white font-medium">Thời gian:</label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value={7}>7 ngày qua</option>
                  <option value={14}>14 ngày qua</option>
                  <option value={30}>30 ngày qua</option>
                  <option value={90}>3 tháng qua</option>
                </select>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProgressChart
                  data={chartData}
                  title="Điểm độ trôi chảy"
                  metric="fluencyScore"
                  color="bg-gradient-to-r from-blue-500 to-blue-600"
                  maxValue={100}
                />
                
                {/* ProgressChart cho số từ mới học được - Đã ẩn */}
                {/* 
                <ProgressChart
                  data={chartData}
                  title="Số từ mới học được"
                  metric="newWordsCount"
                  color="bg-gradient-to-r from-green-500 to-green-600"
                />
                */}
                
                <ProgressChart
                  data={chartData}
                  title="Độ dài câu trung bình"
                  metric="averageSentenceLength"
                  color="bg-gradient-to-r from-purple-500 to-purple-600"
                />
                
                <ProgressChart
                  data={chartData}
                  title="Đa dạng từ vựng"
                  metric="vocabularyDiversity"
                  color="bg-gradient-to-r from-yellow-500 to-yellow-600"
                  maxValue={100}
                />
              </div>

              {/* Empty State */}
              {chartData.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Chưa có dữ liệu tiến trình
                  </h3>
                  <p className="text-slate-400">
                    Bắt đầu luyện nói để theo dõi tiến độ học tập của bạn
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressPanel; 