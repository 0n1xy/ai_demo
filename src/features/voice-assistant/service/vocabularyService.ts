import type { SavedWord, VocabularySettings, VocabularyStats } from '../types/vocabulary.types';

export class VocabularyService {
  private static readonly VOCABULARY_KEY = 'saved_vocabulary';
  private static readonly VOCABULARY_SETTINGS_KEY = 'vocabulary_settings';

  // Lưu từ mới
  static saveWord(word: Omit<SavedWord, 'id' | 'createdAt' | 'lastReviewed' | 'reviewCount' | 'mastered'>): SavedWord {
    const newWord: SavedWord = {
      ...word,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      lastReviewed: new Date(),
      reviewCount: 0,
      mastered: false
    };

    const words = this.getAllWords();
    words.push(newWord);
    this.saveWords(words);

    return newWord;
  }

  // Lấy tất cả từ đã lưu
  static getAllWords(): SavedWord[] {
    try {
      const stored = localStorage.getItem(this.VOCABULARY_KEY);
      if (!stored) return [];

      const words = JSON.parse(stored);
      return words.map((word: any) => ({
        ...word,
        createdAt: new Date(word.createdAt),
        lastReviewed: new Date(word.lastReviewed)
      }));
    } catch (error) {
      console.error('Error loading vocabulary:', error);
      return [];
    }
  }

  // Lấy từ theo ID
  static getWordById(id: string): SavedWord | null {
    const words = this.getAllWords();
    return words.find(word => word.id === id) || null;
  }

  // Cập nhật từ
  static updateWord(id: string, updates: Partial<SavedWord>): boolean {
    const words = this.getAllWords();
    const index = words.findIndex(word => word.id === id);
    
    if (index === -1) return false;

    words[index] = { ...words[index], ...updates };
    this.saveWords(words);
    return true;
  }

  // Xóa từ
  static deleteWord(id: string): boolean {
    const words = this.getAllWords();
    const filteredWords = words.filter(word => word.id !== id);
    
    if (filteredWords.length === words.length) return false;
    
    this.saveWords(filteredWords);
    return true;
  }

  // Tìm từ theo từ khóa
  static searchWords(query: string): SavedWord[] {
    const words = this.getAllWords();
    const lowerQuery = query.toLowerCase();
    
    return words.filter(word => 
      word.word.toLowerCase().includes(lowerQuery) ||
      word.meaning.toLowerCase().includes(lowerQuery) ||
      word.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Lấy từ cần ôn tập (chưa mastered hoặc lâu chưa review)
  static getWordsForReview(): SavedWord[] {
    const words = this.getAllWords();
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return words.filter(word => 
      !word.mastered || word.lastReviewed < oneWeekAgo
    ).sort((a, b) => a.lastReviewed.getTime() - b.lastReviewed.getTime());
  }

  // Đánh dấu đã ôn tập
  static markAsReviewed(id: string): boolean {
    const word = this.getWordById(id);
    if (!word) return false;

    return this.updateWord(id, {
      lastReviewed: new Date(),
      reviewCount: word.reviewCount + 1,
      mastered: word.reviewCount >= 5 // Sau 5 lần review thì mastered
    });
  }

  // Đánh dấu đã thuộc
  static markAsMastered(id: string): boolean {
    return this.updateWord(id, { mastered: true });
  }

  // Lấy từ theo category
  static getWordsByCategory(category: string): SavedWord[] {
    const words = this.getAllWords();
    return words.filter(word => word.category === category);
  }

  // Lấy từ theo difficulty
  static getWordsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): SavedWord[] {
    const words = this.getAllWords();
    return words.filter(word => word.difficulty === difficulty);
  }

  // Lấy thống kê
  static getStats(): VocabularyStats {
    const words = this.getAllWords();
    
    if (words.length === 0) {
      return {
        totalWords: 0,
        masteredWords: 0,
        needReviewWords: 0,
        averageReviewCount: 0,
        mostDifficultCategory: '',
        lastAddedWord: null
      };
    }

    const masteredWords = words.filter(word => word.mastered).length;
    const needReviewWords = this.getWordsForReview().length;
    const averageReviewCount = words.reduce((sum, word) => sum + word.reviewCount, 0) / words.length;
    
    // Tìm category khó nhất (ít từ mastered nhất)
    const categoryStats = words.reduce((acc, word) => {
      if (!acc[word.category]) {
        acc[word.category] = { total: 0, mastered: 0 };
      }
      acc[word.category].total++;
      if (word.mastered) acc[word.category].mastered++;
      return acc;
    }, {} as Record<string, { total: number; mastered: number }>);

    const mostDifficultCategory = Object.entries(categoryStats)
      .sort(([, a], [, b]) => (a.mastered / a.total) - (b.mastered / b.total))[0]?.[0] || '';

    const lastAddedWord = words.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.createdAt || null;

    return {
      totalWords: words.length,
      masteredWords,
      needReviewWords,
      averageReviewCount: Math.round(averageReviewCount * 10) / 10,
      mostDifficultCategory,
      lastAddedWord
    };
  }

  // Lấy tất cả categories
  static getAllCategories(): string[] {
    const words = this.getAllWords();
    const categories = new Set(words.map(word => word.category));
    return Array.from(categories).sort();
  }

  // Lấy tất cả tags
  static getAllTags(): string[] {
    const words = this.getAllWords();
    const tags = new Set(words.flatMap(word => word.tags));
    return Array.from(tags).sort();
  }

  // Lưu cài đặt
  static saveSettings(settings: VocabularySettings): void {
    try {
      localStorage.setItem(this.VOCABULARY_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving vocabulary settings:', error);
    }
  }

  // Lấy cài đặt
  static getSettings(): VocabularySettings {
    try {
      const stored = localStorage.getItem(this.VOCABULARY_SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading vocabulary settings:', error);
    }

    // Default settings
    return {
      autoSaveNewWords: false,
      showPronunciation: true,
      showMeaning: true,
      showExample: true,
      defaultDifficulty: 'medium',
      defaultCategory: 'General'
    };
  }

  // Xuất từ vựng
  static exportVocabulary(): string {
    const words = this.getAllWords();
    const stats = this.getStats();
    
    let content = `VOCABULARY EXPORT\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `Total Words: ${stats.totalWords}\n`;
    content += `Mastered: ${stats.masteredWords}\n`;
    content += `Need Review: ${stats.needReviewWords}\n\n`;
    
    words.forEach((word, index) => {
      content += `${index + 1}. ${word.word} [${word.pronunciation}]\n`;
      content += `   Meaning: ${word.meaning}\n`;
      content += `   Example: ${word.example}\n`;
      content += `   Category: ${word.category}\n`;
      content += `   Difficulty: ${word.difficulty}\n`;
      content += `   Tags: ${word.tags.join(', ')}\n`;
      content += `   Review Count: ${word.reviewCount}\n`;
      content += `   Mastered: ${word.mastered ? 'Yes' : 'No'}\n`;
      if (word.notes) content += `   Notes: ${word.notes}\n`;
      content += `\n`;
    });
    
    return content;
  }

  // Xóa tất cả từ vựng
  static clearAllWords(): void {
    localStorage.removeItem(this.VOCABULARY_KEY);
  }

  // Private method để lưu words
  private static saveWords(words: SavedWord[]): void {
    try {
      localStorage.setItem(this.VOCABULARY_KEY, JSON.stringify(words));
    } catch (error) {
      console.error('Error saving vocabulary:', error);
    }
  }
} 