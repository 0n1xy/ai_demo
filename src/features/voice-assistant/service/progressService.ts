import type { LearningProgress, ProgressChartData, UserStats, Message } from '../types/types';
import { LocalStorageUtils } from '../utils/localStorageUtils';
import { VocabularyUtils } from '../utils/vocabularyUtils';

export class ProgressService {
  // Lưu tiến trình học
  static saveProgress(progress: LearningProgress): boolean {
    console.log('💾 Đang lưu tiến trình học:', progress);
    const success = LocalStorageUtils.saveProgress(progress);
    
    if (success) {
      console.log('✅ Lưu tiến trình thành công');
    } else {
      console.error('❌ Lưu tiến trình thất bại');
    }
    
    return success;
  }

  // Lấy lịch sử tiến trình
  static getProgressHistory(): LearningProgress[] {
    return LocalStorageUtils.getProgressHistory();
  }

  // Tính toán metrics từ messages
  static calculateSessionMetrics(messages: Message[], topic: string, sessionStartTime: Date): LearningProgress {
    const userMessages = messages.filter(msg => msg.type === 'user');
    const sessionDuration = (Date.now() - sessionStartTime.getTime()) / (1000 * 60); // phút

    // Tính độ dài câu trung bình
    const totalWords = userMessages.reduce((sum, msg) => {
      return sum + msg.content.split(' ').length;
    }, 0);
    const averageSentenceLength = userMessages.length > 0 ? totalWords / userMessages.length : 0;

    // Tính điểm độ trôi chảy (dựa trên độ dài câu và số từ)
    const fluencyScore = Math.min(100, Math.max(0, 
      (averageSentenceLength * 10) + (userMessages.length * 5)
    ));

    // Tính đa dạng từ vựng
    const allWords = userMessages.flatMap(msg => 
      msg.content.toLowerCase().split(/\s+/).filter(word => word.length > 2)
    );
    const uniqueWords = new Set(allWords);
    const vocabularyDiversity = Math.min(100, (uniqueWords.size / Math.max(allWords.length, 1)) * 100);

    // Phân tích từ vựng mới với VocabularyUtils
    const wordsLearned = VocabularyUtils.analyzeVocabulary(messages, topic);
    const vocabularyLevel = VocabularyUtils.getVocabularyLevel(wordsLearned);

    return {
      conversationId: crypto.randomUUID(),
      date: new Date(),
      topic,
      metrics: {
        fluencyScore: Math.round(fluencyScore),
        newWordsCount: wordsLearned.length,
        averageSentenceLength: Math.round(averageSentenceLength * 10) / 10,
        conversationDuration: Math.round(sessionDuration * 10) / 10,
        messageCount: userMessages.length,
        vocabularyDiversity: Math.round(vocabularyDiversity),
        vocabularyLevel
      },
      wordsLearned,
      commonMistakes: [], // Có thể cải thiện bằng AI analysis
      contextWords: wordsLearned.map(w => w.word) // Từ vựng liên quan đến chủ đề
    };
  }

  // Lấy dữ liệu cho biểu đồ
  static getChartData(days: number = 7): ProgressChartData[] {
    const progress = this.getProgressHistory();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentProgress = progress.filter(p => p.date >= cutoffDate);
    
    return recentProgress.map(p => ({
      date: p.date.toLocaleDateString('vi-VN'),
      fluencyScore: p.metrics.fluencyScore,
      newWordsCount: p.metrics.newWordsCount,
      averageSentenceLength: p.metrics.averageSentenceLength,
      vocabularyDiversity: p.metrics.vocabularyDiversity
    }));
  }

  // Tính toán thống kê tổng quan
  static getUserStats(): UserStats {
    return LocalStorageUtils.getUserStats();
  }

  // Xóa dữ liệu tiến trình
  static clearProgress(): void {
    LocalStorageUtils.clearAll();
  }
} 