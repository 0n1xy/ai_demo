export interface Message {
  id: string;
  type: "user" | "assistant" | "suggestion";
  content: string;
  timestamp: Date;
  isAudio?: boolean;
  suggestedReply?: string;
  suggestingIndex?: number | null;
}

export interface VoiceSettings {
  language: string;
  voice: string;
  speed: number;
  pitch: number;
}

// Thêm types cho tính năng tiến trình học
export interface LearningProgress {
  conversationId: string; // Thay đổi từ sessionId
  date: Date;
  topic: string;
  metrics: {
    fluencyScore: number; // Điểm độ trôi chảy (0-100)
    newWordsCount: number; // Số từ mới học được
    averageSentenceLength: number; // Độ dài câu trung bình
    conversationDuration: number; // Thời gian hội thoại (phút)
    messageCount: number; // Số tin nhắn trong cuộc trò chuyện
    vocabularyDiversity: number; // Đa dạng từ vựng (0-100)
    vocabularyLevel: 'beginner' | 'intermediate' | 'advanced'; // Cấp độ từ vựng
  };
  wordsLearned: VocabularyWord[]; // Thay đổi từ string[] thành VocabularyWord[]
  commonMistakes: string[]; // Các lỗi thường gặp
  contextWords: string[]; // Từ vựng liên quan đến chủ đề
}

// Thêm interface cho từ vựng mới
export interface VocabularyWord {
  word: string;
  frequency: number; // Tần suất xuất hiện trong cuộc trò chuyện
  difficulty: 'easy' | 'medium' | 'hard'; // Độ khó của từ
  context: string; // Ngữ cảnh sử dụng
  relatedWords: string[]; // Từ liên quan
  isNew: boolean; // Có phải từ mới thực sự không
  topic: string; // Chủ đề liên quan
  learned: boolean; // Đã học từ này chưa
}

export interface ProgressChartData {
  date: string;
  fluencyScore: number;
  newWordsCount: number;
  averageSentenceLength: number;
  vocabularyDiversity: number;
}

export interface UserStats {
  totalConversations: number; // Thay đổi từ totalSessions
  totalConversationTime: number; // Tổng thời gian hội thoại (phút)
  totalWordsLearned: number;
  averageFluencyScore: number;
  favoriteTopics: string[];
  streakDays: number; // Số ngày học liên tiếp
  lastStudyDate: Date;
  vocabularyProgress: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  learningStreak: {
    currentStreak: number;
    longestStreak: number;
    totalStudyDays: number;
  };
}

export interface Topic {
  name: string;
  prompt: string;
  initialMessage: string;
  aiRole: string; // Vai trò của AI trong cuộc hội thoại
  userRole: string; // Vai trò của người dùng trong cuộc hội thoại
  roleDescription: string; // Mô tả chi tiết về vai trò và tình huống
  difficulty: 'beginner' | 'intermediate' | 'advanced'; // Độ khó của chủ đề
  vocabularyLevel: 'basic' | 'intermediate' | 'advanced'; // Cấp độ từ vựng cần thiết
  estimatedDuration: number; // Thời gian ước tính cho cuộc hội thoại (phút)
  tags: string[]; // Các tag để phân loại chủ đề
}
