import type { LearningProgress, UserStats } from '../types/types';

export class LocalStorageUtils {
  private static readonly PROGRESS_KEY = 'learning_progress';
  private static readonly USER_STATS_KEY = 'user_stats';

  // Kiểm tra localStorage có khả dụng không
  static isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.error('❌ localStorage không khả dụng:', e);
      return false;
    }
  }

  // Lưu dữ liệu với error handling
  static setItem(key: string, value: any): boolean {
    try {
      if (!this.isAvailable()) {
        console.error('❌ localStorage không khả dụng');
        return false;
      }
      
      const jsonValue = JSON.stringify(value);
      localStorage.setItem(key, jsonValue);
      console.log(`✅ Đã lưu ${key}:`, value);
      return true;
    } catch (error) {
      console.error(`❌ Lỗi lưu ${key}:`, error);
      return false;
    }
  }

  // Đọc dữ liệu với error handling
  static getItem<T>(key: string, defaultValue: T): T {
    try {
      if (!this.isAvailable()) {
        console.error('❌ localStorage không khả dụng');
        return defaultValue;
      }
      
      const stored = localStorage.getItem(key);
      if (!stored) {
        console.log(`📭 Không có dữ liệu cho ${key}`);
        return defaultValue;
      }
      
      const parsed = JSON.parse(stored);
      console.log(`📖 Đã đọc ${key}:`, parsed);
      return parsed;
    } catch (error) {
      console.error(`❌ Lỗi đọc ${key}:`, error);
      return defaultValue;
    }
  }

  // Xóa dữ liệu
  static removeItem(key: string): boolean {
    try {
      if (!this.isAvailable()) {
        return false;
      }
      
      localStorage.removeItem(key);
      console.log(`🗑️ Đã xóa ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Lỗi xóa ${key}:`, error);
      return false;
    }
  }

  // Lưu tiến trình học
  static saveProgress(progress: LearningProgress): boolean {
    try {
      const existingProgress = this.getProgressHistory();
      existingProgress.push(progress);
      
      const success = this.setItem(this.PROGRESS_KEY, existingProgress);
      if (success) {
        this.updateUserStats();
      }
      return success;
    } catch (error) {
      console.error('❌ Lỗi lưu tiến trình:', error);
      return false;
    }
  }

  // Lấy lịch sử tiến trình
  static getProgressHistory(): LearningProgress[] {
    const stored = this.getItem<LearningProgress[]>(this.PROGRESS_KEY, []);
    
    return stored.map((item: any) => {
      // Đảm bảo date là Date object hợp lệ
      let date: Date;
      try {
        date = new Date(item.date);
        if (isNaN(date.getTime())) {
          date = new Date(); // Fallback to current date if invalid
        }
      } catch (error) {
        date = new Date(); // Fallback to current date if error
      }

      return {
        ...item,
        date
      };
    });
  }

  // Lưu user stats
  static saveUserStats(stats: UserStats): boolean {
    return this.setItem(this.USER_STATS_KEY, stats);
  }

  // Lấy user stats
  static getUserStats(): UserStats {
    const stats = this.getItem<UserStats>(this.USER_STATS_KEY, {
      totalConversations: 0,
      totalConversationTime: 0,
      totalWordsLearned: 0,
      averageFluencyScore: 0,
      favoriteTopics: [],
      streakDays: 0,
      lastStudyDate: new Date(),
      vocabularyProgress: { beginner: 0, intermediate: 0, advanced: 0 },
      learningStreak: { currentStreak: 0, longestStreak: 0, totalStudyDays: 0 }
    });

    // Đảm bảo lastStudyDate là Date object
    if (typeof stats.lastStudyDate === 'string') {
      stats.lastStudyDate = new Date(stats.lastStudyDate);
    }

    return stats;
  }

  // Cập nhật user stats từ progress history
  static updateUserStats(): void {
    const progress = this.getProgressHistory();
    
    if (progress.length === 0) {
      this.saveUserStats({
        totalConversations: 0,
        totalConversationTime: 0,
        totalWordsLearned: 0,
        averageFluencyScore: 0,
        favoriteTopics: [],
        streakDays: 0,
        lastStudyDate: new Date(),
        vocabularyProgress: { beginner: 0, intermediate: 0, advanced: 0 },
        learningStreak: { currentStreak: 0, longestStreak: 0, totalStudyDays: 0 }
      });
      return;
    }

    const totalConversations = progress.length;
    const totalConversationTime = progress.reduce((sum, p) => sum + p.metrics.conversationDuration, 0);
    // const totalWordsLearned = progress.reduce((sum, p) => sum + p.metrics.newWordsCount, 0);
    const totalWordsLearned = 0; // Đã ẩn tính năng từ mới
    const averageFluencyScore = progress.reduce((sum, p) => sum + p.metrics.fluencyScore, 0) / totalConversations;

    // Tính topic yêu thích
    const topicCounts = progress.reduce((acc, p) => {
      acc[p.topic] = (acc[p.topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic);

    // Tính streak days
    const sortedDates = progress
      .map(p => p.date)
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streakDays = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const date of sortedDates) {
      const studyDate = new Date(date);
      studyDate.setHours(0, 0, 0, 0);
      
      if (studyDate.getTime() === currentDate.getTime()) {
        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (studyDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    const stats: UserStats = {
      totalConversations,
      totalConversationTime: Math.round(totalConversationTime),
      totalWordsLearned,
      averageFluencyScore: Math.round(averageFluencyScore),
      favoriteTopics,
      streakDays,
      lastStudyDate: sortedDates.length > 0 ? sortedDates[0] : new Date(),
      vocabularyProgress: { beginner: 0, intermediate: 0, advanced: 0 },
      learningStreak: { currentStreak: streakDays, longestStreak: streakDays, totalStudyDays: 1 }
    };

    this.saveUserStats(stats);
  }

  // Xóa tất cả dữ liệu
  static clearAll(): boolean {
    try {
      this.removeItem(this.PROGRESS_KEY);
      this.removeItem(this.USER_STATS_KEY);
      console.log('🗑️ Đã xóa tất cả dữ liệu tiến trình');
      return true;
    } catch (error) {
      console.error('❌ Lỗi xóa dữ liệu:', error);
      return false;
    }
  }

  // Kiểm tra dung lượng localStorage
  static checkStorageSize(): void {
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }
      console.log(`📊 Dung lượng localStorage: ${totalSize} bytes`);
    } catch (error) {
      console.error('❌ Lỗi kiểm tra dung lượng:', error);
    }
  }

  // Debug tất cả dữ liệu
  static debugAll(): void {
    console.log('🔍 === DEBUG LOCALSTORAGE ===');
    console.log('✅ localStorage khả dụng:', this.isAvailable());
    this.checkStorageSize();
    
    const progress = this.getProgressHistory();
    const stats = this.getUserStats();
    
    console.log('📊 Progress History:', progress);
    console.log('👤 User Stats:', stats);
    console.log('🔍 === END DEBUG ===');
  }
} 