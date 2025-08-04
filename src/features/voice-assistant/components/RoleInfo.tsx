import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Clock, Target, BookOpen, Users } from 'lucide-react';
import type { Topic } from '../types/types';

interface RoleInfoProps {
  topic: Topic | null;
  isVisible: boolean;
}

const RoleInfo: React.FC<RoleInfoProps> = ({ topic, isVisible }) => {
  if (!topic || !isVisible) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'advanced':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getVocabularyColor = (level: string) => {
    switch (level) {
      case 'basic':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'intermediate':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'advanced':
        return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-300" />
          Thông tin vai trò
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
                     {/* Vai trò */}
           <div className="space-y-3">
             <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 bg-blue-500/20 rounded-lg p-3 border border-blue-400/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🤖</span>
                  <span className="font-semibold text-blue-300">Vai trò AI</span>
                </div>
                <p className="text-white/90 text-sm">{topic.aiRole}</p>
              </div>
              <div className="flex-1 bg-green-500/20 rounded-lg p-3 border border-green-400/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">👤</span>
                  <span className="font-semibold text-green-300">Vai trò của bạn</span>
                </div>
                <p className="text-white/90 text-sm">{topic.userRole}</p>
              </div>
            </div>
          </div>

          {/* Mô tả vai trò */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-yellow-300" />
              <span className="font-semibold text-yellow-300">Mô tả tình huống</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">{topic.roleDescription}</p>
          </div>

                     {/* Thông tin kỹ thuật */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-purple-300" />
                <span className="text-xs text-white/60">Độ khó</span>
              </div>
              <Badge className={getDifficultyColor(topic.difficulty)}>
                {topic.difficulty === 'beginner' ? 'Cơ bản' :
                 topic.difficulty === 'intermediate' ? 'Trung bình' : 'Nâng cao'}
              </Badge>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-blue-300" />
                <span className="text-xs text-white/60">Từ vựng</span>
              </div>
              <Badge className={getVocabularyColor(topic.vocabularyLevel)}>
                {topic.vocabularyLevel === 'basic' ? 'Cơ bản' :
                 topic.vocabularyLevel === 'intermediate' ? 'Trung bình' : 'Nâng cao'}
              </Badge>
            </div>
          </div>

                     {/* Thời gian và tags */}
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-300" />
              <span className="text-sm text-white/70">⏱️ {topic.estimatedDuration} phút</span>
            </div>
            <div className="flex gap-1">
              {topic.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} className="bg-white/10 text-white/70 border-white/20 text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleInfo; 