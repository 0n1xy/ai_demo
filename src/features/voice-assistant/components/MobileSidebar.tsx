import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Separator } from '../../../components/ui/separator';
import { Target, TrendingUp, BookOpen } from 'lucide-react';
import { ProgressService } from '../service/progressService';
import type { UserStats, Topic } from '../types/types';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  topics: Topic[];
  selectedTopic: string | null;
  onSelectTopic: (topicName: string, prompt: string, initialMessage: string) => void;
  onShowFullProgress: () => void;
  onSaveProgress?: () => void;
  hasMessages?: boolean;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
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
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 border-r border-white/20 flex flex-col overflow-hidden z-50 lg:hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <h2 className="text-lg font-semibold text-white">Menu</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            className="p-2 text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Topics Section */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-300" />
                Chủ đề luyện nói
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
                {topics.map((topic) => (
                  <Button
                    key={topic.name}
                    variant={selectedTopic === topic.name ? "default" : "outline"}
                    className={`w-full justify-start h-auto p-3 text-left transition-all duration-200 ${
                      selectedTopic === topic.name
                        ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-blue-400/50 text-white'
                        : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/40'
                    }`}
                    onClick={() => {
                      onSelectTopic(topic.name, topic.prompt, topic.initialMessage);
                      onClose();
                    }}
                  >
                    <div className="w-full">
                      <div className="font-semibold mb-1 text-sm">{topic.name}</div>
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

          <Separator className="bg-white/20" />

          {/* Progress Section */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-300" />
                Tiến trình học
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {!stats || stats.totalConversations === 0 ? (
                  <div className="text-center py-4">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-white/40" />
                    <p className="text-white/60 text-sm">
                      Chưa có dữ liệu tiến trình
                    </p>
                    <p className="text-white/40 text-xs mt-1">
                      Bắt đầu luyện nói để theo dõi
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/10 rounded-lg p-2 border border-white/20">
                        <div className="text-lg font-bold text-blue-300">{stats.totalConversations}</div>
                        <div className="text-xs text-white/60">Cuộc trò chuyện</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-2 border border-white/20">
                        <div className="text-lg font-bold text-yellow-300">{stats.averageFluencyScore}</div>
                        <div className="text-xs text-white/60">Điểm trung bình</div>
                      </div>
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
                        onClick={() => {
                          onShowFullProgress();
                          onClose();
                        }}
                        className="w-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 hover:from-blue-500/50 hover:to-purple-500/50 border border-blue-400/50 text-white text-sm py-2"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </Button>
                      
                      {onSaveProgress && hasMessages && (
                        <Button
                          onClick={() => {
                            onSaveProgress();
                            onClose();
                          }}
                          className="w-full bg-gradient-to-r from-green-500/30 to-green-600/30 hover:from-green-500/50 hover:to-green-600/50 border border-green-400/50 text-white text-sm py-2"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Lưu tiến trình
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar; 