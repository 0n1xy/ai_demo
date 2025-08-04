import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Separator } from '../../../components/ui/separator';
import { Button } from '../../../components/ui/button';
import { Target, TrendingUp, Clock, BookOpen } from 'lucide-react';
import { ProgressService } from '../service/progressService';
import type { UserStats, Topic } from '../types/types';

interface Props {
  topics: Topic[];
  selectedTopic: string | null;
  onSelectTopic: (topicName: string, prompt: string, initialMessage: string) => void;
  onShowFullProgress: () => void;
  onSaveProgress?: () => void;
  hasMessages?: boolean;
}

const Sidebar: React.FC<Props> = React.memo(({ 
  topics, 
  selectedTopic, 
  onSelectTopic, 
  onShowFullProgress,
  onSaveProgress,
  hasMessages
}) => {
  const [stats, setStats] = React.useState<UserStats | null>(null);

  const loadStats = () => {
    const userStats = ProgressService.getUserStats();
    setStats(userStats);
  };

  React.useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000); // Giảm từ 5s xuống 10s
    return () => clearInterval(interval);
  }, []);

  return (
         <div className="w-80 h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 border-r border-white/20 flex flex-col overflow-hidden">
      {/* Topics Section */}
      <Card className="m-4 bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-300" />
            Chủ đề luyện nói
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
                     <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-hide">
            {topics.map((topic) => (
              <Button
                key={topic.name}
                variant={selectedTopic === topic.name ? "default" : "outline"}
                className={`w-full justify-start h-auto p-4 text-left transition-all duration-200 ${
                  selectedTopic === topic.name
                    ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-blue-400/50 text-white'
                    : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/40'
                }`}
                onClick={() => onSelectTopic(topic.name, topic.prompt, topic.initialMessage)}
              >
                <div className="w-full">
                  <div className="font-semibold mb-1">{topic.name}</div>
                  <div className="text-xs opacity-70 mb-2">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-blue-300">🤖 AI:</span>
                      <span>{topic.aiRole}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-green-300">👤 Bạn:</span>
                      <span>{topic.userRole}</span>
                    </div>
                  </div>
                  <div className="text-xs opacity-60 line-clamp-2">
                    {topic.roleDescription}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      topic.difficulty === 'beginner' ? 'bg-green-500/20 text-green-300' :
                      topic.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {topic.difficulty === 'beginner' ? 'Cơ bản' :
                       topic.difficulty === 'intermediate' ? 'Trung bình' : 'Nâng cao'}
                    </span>
                    <span className="text-xs opacity-50">⏱️ {topic.estimatedDuration} phút</span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator className="mx-4 bg-white/20" />

             {/* Progress Section */}
       <Card className="m-4 flex-1 bg-white/10 backdrop-blur-sm border-white/20 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-300" />
            Tiến trình học
          </CardTitle>
        </CardHeader>
                 <CardContent className="pt-0 flex-1">
           <div className="h-full overflow-y-auto scrollbar-hide">
            {!stats || stats.totalConversations === 0 ? (
              <div className="text-center py-6">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-white/40" />
                <p className="text-white/60 text-sm">
                  Chưa có dữ liệu tiến trình
                </p>
                <p className="text-white/40 text-xs mt-1">
                  Bắt đầu luyện nói để theo dõi
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-white/10 rounded-lg p-2 border border-white/20">
                    <div className="text-xl font-bold text-blue-300">{stats.totalConversations}</div>
                    <div className="text-xs text-white/60">Cuộc trò chuyện</div>
                  </div>
                  {/* Từ mới - Đã ẩn */}
                  {/* 
                  <div className="bg-white/10 rounded-lg p-2 border border-white/20">
                    <div className="text-xl font-bold text-green-300">{stats.totalWordsLearned}</div>
                    <div className="text-xs text-white/60">Từ mới</div>
                  </div>
                  */}
                </div>

                <div className="bg-white/10 rounded-lg p-2 border border-white/20">
                  <div className="text-xl font-bold text-yellow-300">{stats.averageFluencyScore}</div>
                  <div className="text-xs text-white/60">Điểm trung bình</div>
                </div>

                {stats.streakDays > 0 && (
                  <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg p-2 border border-red-400/30">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔥</span>
                      <div>
                        <div className="font-bold text-white text-sm">{stats.streakDays} ngày</div>
                        <div className="text-xs text-white/70">Học liên tiếp</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={onShowFullProgress}
                    className="w-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 hover:from-blue-500/50 hover:to-purple-500/50 border border-blue-400/50 text-white text-sm py-2"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Xem chi tiết
                  </Button>
                  
                  {onSaveProgress && hasMessages && (
                    <Button
                      onClick={onSaveProgress}
                      className="w-full bg-gradient-to-r from-green-500/30 to-green-600/30 hover:from-green-500/50 hover:to-green-600/50 border border-green-400/50 text-white text-sm py-2"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Lưu tiến trình
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar; 