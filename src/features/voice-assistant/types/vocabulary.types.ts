export interface SavedWord {
  id: string;
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  createdAt: Date;
  lastReviewed: Date;
  reviewCount: number;
  mastered: boolean;
  notes: string;
}

export interface VocabularySettings {
  autoSaveNewWords: boolean;
  showPronunciation: boolean;
  showMeaning: boolean;
  showExample: boolean;
  defaultDifficulty: 'easy' | 'medium' | 'hard';
  defaultCategory: string;
}

export interface VocabularyStats {
  totalWords: number;
  masteredWords: number;
  needReviewWords: number;
  averageReviewCount: number;
  mostDifficultCategory: string;
  lastAddedWord: Date | null;
} 