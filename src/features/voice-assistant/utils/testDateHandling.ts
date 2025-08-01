// Test file để kiểm tra xử lý date
import { LocalStorageUtils } from './localStorageUtils';

export const testDateHandling = () => {
  console.log('🧪 === TEST DATE HANDLING ===');
  
  // Test 1: Kiểm tra getUserStats với date string
  console.log('Test 1: getUserStats với date string');
  try {
    // Giả lập localStorage với date string
    const mockStats = {
      totalConversations: 5,
      totalConversationTime: 120,
      totalWordsLearned: 25,
      averageFluencyScore: 75,
      favoriteTopics: ['Công viên chủ đề'],
      streakDays: 3,
      lastStudyDate: '2024-01-15T10:30:00.000Z', // Date string
      vocabularyProgress: { beginner: 10, intermediate: 10, advanced: 5 },
      learningStreak: { currentStreak: 3, longestStreak: 5, totalStudyDays: 10 }
    };
    
    localStorage.setItem('user_stats', JSON.stringify(mockStats));
    
    const stats = LocalStorageUtils.getUserStats();
    console.log('✅ getUserStats result:', stats);
    console.log('✅ lastStudyDate type:', typeof stats.lastStudyDate);
    console.log('✅ lastStudyDate instanceof Date:', stats.lastStudyDate instanceof Date);
    
    if (stats.lastStudyDate instanceof Date) {
      console.log('✅ Date conversion successful');
    } else {
      console.log('❌ Date conversion failed');
    }
  } catch (error) {
    console.error('❌ Test 1 failed:', error);
  }
  
  // Test 2: Kiểm tra getProgressHistory với date string
  console.log('\nTest 2: getProgressHistory với date string');
  try {
    const mockProgress = [
      {
        conversationId: 'test-1',
        date: '2024-01-15T10:30:00.000Z', // Date string
        topic: 'Công viên chủ đề',
        metrics: {
          fluencyScore: 80,
          newWordsCount: 5,
          averageSentenceLength: 8.5,
          conversationDuration: 15,
          messageCount: 10,
          vocabularyDiversity: 75,
          vocabularyLevel: 'intermediate'
        },
        wordsLearned: [],
        commonMistakes: [],
        contextWords: []
      }
    ];
    
    localStorage.setItem('learning_progress', JSON.stringify(mockProgress));
    
    const progress = LocalStorageUtils.getProgressHistory();
    console.log('✅ getProgressHistory result:', progress);
    console.log('✅ date type:', typeof progress[0].date);
    console.log('✅ date instanceof Date:', progress[0].date instanceof Date);
    
    if (progress[0].date instanceof Date) {
      console.log('✅ Date conversion successful');
    } else {
      console.log('❌ Date conversion failed');
    }
  } catch (error) {
    console.error('❌ Test 2 failed:', error);
  }
  
  // Test 3: Kiểm tra với invalid date
  console.log('\nTest 3: Invalid date handling');
  try {
    const mockInvalidStats = {
      totalConversations: 1,
      totalConversationTime: 10,
      totalWordsLearned: 2,
      averageFluencyScore: 50,
      favoriteTopics: [],
      streakDays: 1,
      lastStudyDate: 'invalid-date-string', // Invalid date
      vocabularyProgress: { beginner: 1, intermediate: 1, advanced: 0 },
      learningStreak: { currentStreak: 1, longestStreak: 1, totalStudyDays: 1 }
    };
    
    localStorage.setItem('user_stats', JSON.stringify(mockInvalidStats));
    
    const stats = LocalStorageUtils.getUserStats();
    console.log('✅ getUserStats with invalid date:', stats);
    console.log('✅ lastStudyDate type:', typeof stats.lastStudyDate);
    console.log('✅ lastStudyDate instanceof Date:', stats.lastStudyDate instanceof Date);
    
    if (stats.lastStudyDate instanceof Date && !isNaN(stats.lastStudyDate.getTime())) {
      console.log('✅ Invalid date handled correctly');
    } else {
      console.log('❌ Invalid date not handled correctly');
    }
  } catch (error) {
    console.error('❌ Test 3 failed:', error);
  }
  
  console.log('\n🧪 === END TEST DATE HANDLING ===');
};

// Export để có thể gọi từ console
(window as any).testDateHandling = testDateHandling; 