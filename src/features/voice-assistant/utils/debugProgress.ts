import { ProgressService } from '../service/progressService';

export const debugProgress = () => {
  console.log('🔍 === DEBUG PROGRESS ===');
  
  // Kiểm tra localStorage
  const progressData = localStorage.getItem('learning_progress');
  const userStatsData = localStorage.getItem('user_stats');
  
  console.log('📊 Progress Data:', progressData ? JSON.parse(progressData) : 'Không có dữ liệu');
  console.log('👤 User Stats Data:', userStatsData ? JSON.parse(userStatsData) : 'Không có dữ liệu');
  
  // Lấy thống kê từ service
  const stats = ProgressService.getUserStats();
  const chartData = ProgressService.getChartData(7);
  
  console.log('📈 User Stats:', stats);
  console.log('📊 Chart Data (7 days):', chartData);
  
  // Kiểm tra progress history
  const history = ProgressService.getProgressHistory();
  console.log('📚 Progress History:', history);
  
  console.log('🔍 === END DEBUG ===');
};

export const clearAllProgress = () => {
  console.log('🗑️ Xóa tất cả dữ liệu tiến trình...');
  ProgressService.clearProgress();
  console.log('✅ Đã xóa xong');
};

export const createTestData = () => {
  console.log('🧪 Tạo dữ liệu test...');
  
  const testProgress = {
    sessionId: 'test-1',
    date: new Date(),
    topic: 'Công viên chủ đề',
    metrics: {
      fluencyScore: 75,
      newWordsCount: 8,
      averageSentenceLength: 6.2,
      conversationDuration: 15.5,
      messageCount: 12,
      vocabularyDiversity: 85
    },
    wordsLearned: ['amusement', 'rollercoaster', 'ticket', 'queue', 'ride', 'fun', 'exciting', 'thrilling'],
    commonMistakes: []
  };
  
  ProgressService.saveProgress(testProgress);
  console.log('✅ Đã tạo dữ liệu test:', testProgress);
}; 