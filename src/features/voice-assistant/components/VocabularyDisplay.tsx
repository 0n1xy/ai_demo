import React, { useState } from 'react';
import { BookOpen, TrendingUp, Target, Lightbulb, Eye, EyeOff, Check, X } from 'lucide-react';
import type { VocabularyWord } from '../types/types';
import { VocabularyUtils } from '../utils/vocabularyUtils';

interface Props {
  words: VocabularyWord[];
  topic: string;
}

const VocabularyDisplay: React.FC<Props> = ({ words, topic }) => {
  const [showLearned, setShowLearned] = useState(false);
  const [localWords, setLocalWords] = useState<VocabularyWord[]>(words);

  // Cập nhật localWords khi words prop thay đổi
  React.useEffect(() => {
    setLocalWords(words);
  }, [words]);

  // Lọc từ vựng dựa trên trạng thái hiển thị
  const filteredWords = showLearned 
    ? localWords 
    : localWords.filter(word => !word.learned);

  // Xử lý đánh dấu từ đã học
  const handleMarkAsLearned = (word: string, index: number) => {
    VocabularyUtils.markWordAsLearned(word);
    setLocalWords(prev => prev.map((w, i) => 
      i === index ? { ...w, learned: true } : w
    ));
  };

  // Xử lý bỏ đánh dấu từ đã học
  const handleUnmarkAsLearned = (word: string, index: number) => {
    VocabularyUtils.unmarkWordAsLearned(word);
    setLocalWords(prev => prev.map((w, i) => 
      i === index ? { ...w, learned: false } : w
    ));
  };

  if (filteredWords.length === 0) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 mb-4 border border-slate-700/50">
        <div className="text-center text-slate-400">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>
            {showLearned 
              ? 'Chưa có từ vựng mới trong cuộc trò chuyện này'
              : 'Tất cả từ vựng đã được học hoặc chưa có từ mới'
            }
          </p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/20';
      default: return 'text-slate-400 bg-slate-400/20';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 mb-4 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
          Từ vựng mới học được
        </h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowLearned(!showLearned)}
            className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors"
            style={{
              backgroundColor: showLearned ? 'rgba(34, 197, 94, 0.2)' : 'rgba(148, 163, 184, 0.2)',
              color: showLearned ? '#4ade80' : '#94a3b8'
            }}
          >
            {showLearned ? (
              <>
                <EyeOff className="w-3 h-3" />
                <span>Ẩn từ đã học</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" />
                <span>Hiện từ đã học</span>
              </>
            )}
          </button>
          <div className="text-sm text-slate-400">
            {filteredWords.length}/{words.length} từ
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredWords.map((word, index) => (
          <div 
            key={index} 
            className={`bg-slate-700/50 rounded-lg p-3 transition-all ${
              word.learned ? 'opacity-60 border-l-4 border-green-500' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className={`text-lg font-bold ${word.learned ? 'text-green-400' : 'text-white'}`}>
                  {word.word}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(word.difficulty)}`}>
                  {getDifficultyLabel(word.difficulty)}
                </span>
                {word.isNew && !word.learned && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium text-green-400 bg-green-400/20">
                    Mới
                  </span>
                )}
                {word.learned && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium text-green-400 bg-green-400/20">
                    Đã học
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-slate-400">
                  {word.frequency} lần
                </div>
                <button
                  onClick={() => word.learned 
                    ? handleUnmarkAsLearned(word.word, localWords.findIndex(w => w.word === word.word))
                    : handleMarkAsLearned(word.word, localWords.findIndex(w => w.word === word.word))
                  }
                  className={`p-1 rounded-full transition-colors ${
                    word.learned 
                      ? 'text-red-400 hover:bg-red-400/20' 
                      : 'text-green-400 hover:bg-green-400/20'
                  }`}
                  title={word.learned ? 'Bỏ đánh dấu đã học' : 'Đánh dấu đã học'}
                >
                  {word.learned ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-sm text-slate-300 mb-2">
              <Lightbulb className="w-4 h-4 inline mr-1 text-yellow-400" />
              {word.context}
            </div>

            {word.relatedWords.length > 0 && (
              <div className="text-sm text-slate-400">
                <Target className="w-4 h-4 inline mr-1 text-blue-400" />
                Từ liên quan: {word.relatedWords.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Thống kê từ vựng */}
      <div className="mt-4 pt-4 border-t border-slate-600">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-400">
              {filteredWords.filter(w => w.difficulty === 'easy').length}
            </div>
            <div className="text-xs text-slate-400">Dễ</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-400">
              {filteredWords.filter(w => w.difficulty === 'medium').length}
            </div>
            <div className="text-xs text-slate-400">Trung bình</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-400">
              {filteredWords.filter(w => w.difficulty === 'hard').length}
            </div>
            <div className="text-xs text-slate-400">Khó</div>
          </div>
        </div>
        <div className="mt-2 text-center text-xs text-slate-400">
          {localWords.filter(w => w.learned).length} từ đã học • {localWords.filter(w => !w.learned).length} từ chưa học
        </div>
      </div>

      {/* Gợi ý học tập */}
      <div className="mt-4 pt-4 border-t border-slate-600">
        <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
          <TrendingUp className="w-4 h-4 mr-1 text-purple-400" />
          Gợi ý học tập
        </h4>
        <div className="text-sm text-slate-300 space-y-1">
          <p>• Thử sử dụng các từ mới trong câu hoàn chỉnh</p>
          <p>• Ôn lại từ khó thường xuyên</p>
          <p>• Tìm hiểu thêm từ liên quan đến chủ đề "{topic}"</p>
        </div>
      </div>
    </div>
  );
};

export default VocabularyDisplay; 