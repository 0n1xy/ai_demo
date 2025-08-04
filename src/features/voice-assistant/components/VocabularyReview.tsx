import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Star, Target, Plus } from 'lucide-react';
import { VocabularyService } from '../service/vocabularyService';
import type { SavedWord } from '../types/vocabulary.types';

interface Props {
  onOpenVocabularyManager: () => void;
  onOpenAddVocabulary?: () => void;
  refreshTrigger?: number; // Thêm prop để trigger refresh
}

const VocabularyReview: React.FC<Props> = ({ onOpenVocabularyManager, onOpenAddVocabulary, refreshTrigger }) => {
  const [wordsForReview, setWordsForReview] = useState<SavedWord[]>([]);
  const [stats, setStats] = useState(VocabularyService.getStats());

  useEffect(() => {
    loadData();
  }, [refreshTrigger]); // Reload khi refreshTrigger thay đổi

  const loadData = () => {
    const reviewWords = VocabularyService.getWordsForReview();
    setWordsForReview(reviewWords.slice(0, 5)); // Chỉ hiển thị 5 từ đầu
    setStats(VocabularyService.getStats());
  };

  const handleReview = (id: string) => {
    VocabularyService.markAsReviewed(id);
    loadData();
  };

  const handleMaster = (id: string) => {
    VocabularyService.markAsMastered(id);
    loadData();
  };

  if (stats.totalWords === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-medium">Từ vựng</h3>
        </div>
        <p className="text-white/70 text-sm mb-3">Chưa có từ vựng nào</p>
        <button
          onClick={onOpenAddVocabulary || onOpenVocabularyManager}
          className="w-full px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white text-sm font-medium transition-colors"
        >
          Thêm từ đầu tiên
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-medium">Từ vựng</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVocabularyManager}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            {/* Từ Vựng */}
          </button>
          {onOpenAddVocabulary && (
            <button
              onClick={onOpenAddVocabulary}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Thêm từ vựng mới"
            >
              <Plus className="w-4 h-4 text-purple-400" />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-white font-bold text-base sm:text-lg">{stats.totalWords}</div>
          <div className="text-white/60 text-xs">Tổng</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-green-400 font-bold text-base sm:text-lg">{stats.masteredWords}</div>
          <div className="text-white/60 text-xs">Thuộc</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-orange-400 font-bold text-base sm:text-lg">{stats.needReviewWords}</div>
          <div className="text-white/60 text-xs">Cần ôn</div>
        </div>
      </div>

      {/* Words for review */}
      {wordsForReview.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Clock className="w-4 h-4" />
            Cần ôn tập
          </div>
          {wordsForReview.map(word => (
            <div key={word.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="text-white font-medium text-sm">{word.word}</h4>
                    <span className="text-blue-300 text-xs">[{word.pronunciation}]</span>
                    {word.mastered && (
                      <Star className="w-3 h-3 text-purple-400" />
                    )}
                  </div>
                  <p className="text-white/70 text-xs">{word.meaning}</p>
                </div>
                <div className="flex items-center gap-1 self-end sm:self-start">
                  <button
                    onClick={() => handleReview(word.id)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Đánh dấu đã ôn"
                  >
                    <Clock className="w-3 h-3 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleMaster(word.id)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Đánh dấu đã thuộc"
                  >
                    <Target className="w-3 h-3 text-purple-400" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/50 text-xs">
                <span>{word.category}</span>
                <span>•</span>
                <span>Ôn: {word.reviewCount} lần</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {wordsForReview.length === 0 && stats.totalWords > 0 && (
        <div className="text-center py-4">
          <Star className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-white/70 text-sm">Tất cả từ đã được ôn tập!</p>
        </div>
      )}
    </div>
  );
};

export default VocabularyReview; 