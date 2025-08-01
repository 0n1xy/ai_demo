import type { VocabularyWord, Message } from '../types/types';

export class VocabularyUtils {
  // Từ điển cơ sở - từ cơ bản mà người học thường biết
  private static readonly BASIC_VOCABULARY = new Set([
    // Từ cơ bản
    'hello', 'hi', 'goodbye', 'bye', 'yes', 'no', 'ok', 'okay', 'please', 'thank', 'thanks',
    'sorry', 'excuse', 'pardon', 'good', 'bad', 'nice', 'great', 'fine', 'well', 'better',
    
    // Đại từ
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'his', 'hers',
    'this', 'that', 'these', 'those',
    
    // Động từ cơ bản
    'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'can', 'could', 'may', 'might', 'should',
    'go', 'come', 'get', 'make', 'take', 'give', 'see', 'look', 'want', 'need', 'like',
    'know', 'think', 'say', 'tell', 'ask', 'help', 'work', 'play', 'eat', 'drink',
    
    // Tính từ cơ bản
    'big', 'small', 'good', 'bad', 'new', 'old', 'young', 'hot', 'cold', 'warm',
    'happy', 'sad', 'angry', 'tired', 'hungry', 'thirsty', 'busy', 'free', 'easy', 'hard',
    'fast', 'slow', 'high', 'low', 'long', 'short', 'far', 'near', 'right', 'wrong',
    
    // Danh từ cơ bản
    'time', 'day', 'night', 'morning', 'afternoon', 'evening', 'today', 'tomorrow',
    'year', 'month', 'week', 'hour', 'minute', 'second', 'name', 'place', 'thing',
    'person', 'people', 'man', 'woman', 'boy', 'girl', 'child', 'children', 'family',
    'friend', 'home', 'house', 'room', 'door', 'window', 'car', 'bus', 'train', 'plane',
    'food', 'water', 'money', 'book', 'pen', 'paper', 'phone', 'computer', 'television',
    
    // Từ nối
    'and', 'or', 'but', 'because', 'if', 'when', 'where', 'why', 'how', 'what', 'who',
    'which', 'that', 'than', 'then', 'so', 'as', 'for', 'with', 'without', 'by', 'from',
    'to', 'in', 'on', 'at', 'up', 'down', 'out', 'off', 'over', 'under', 'between',
    'before', 'after', 'during', 'while', 'until', 'since', 'ago', 'now', 'here', 'there',
    
    // Số đếm
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'hundred', 'thousand', 'million', 'first', 'second', 'third', 'fourth', 'fifth',
    
    // Màu sắc cơ bản
    'red', 'blue', 'green', 'yellow', 'black', 'white', 'brown', 'pink', 'purple', 'orange',
    'gray', 'grey', 'gold', 'silver',
    
    // Thời tiết
    'sunny', 'rainy', 'cloudy', 'windy', 'snow', 'rain', 'sun', 'cloud', 'wind',
    
    // Cảm xúc
    'happy', 'sad', 'angry', 'excited', 'worried', 'surprised', 'scared', 'confused'
  ]);

  // Từ điển theo chủ đề
  private static readonly TOPIC_VOCABULARY: Record<string, Set<string>> = {
    'Công viên chủ đề': new Set([
      'amusement', 'park', 'ride', 'rollercoaster', 'ferris', 'wheel', 'carousel',
      'ticket', 'entrance', 'exit', 'queue', 'line', 'wait', 'fun', 'exciting',
      'thrilling', 'scary', 'safe', 'height', 'speed', 'adventure', 'entertainment',
      'attraction', 'show', 'performance', 'food', 'drink', 'souvenir', 'gift', 'shop',
      'restaurant', 'cafe', 'bathroom', 'toilet', 'map', 'guide', 'staff', 'employee',
      'customer', 'visitor', 'guest', 'family', 'children', 'adult', 'teenager'
    ]),
    'Gọi món': new Set([
      'menu', 'order', 'food', 'drink', 'dish', 'meal', 'breakfast', 'lunch', 'dinner',
      'appetizer', 'main', 'course', 'dessert', 'soup', 'salad', 'pizza', 'burger',
      'pasta', 'rice', 'chicken', 'beef', 'pork', 'fish', 'vegetable', 'fruit',
      'bread', 'cheese', 'milk', 'water', 'coffee', 'tea', 'juice', 'soda', 'beer',
      'wine', 'spicy', 'sweet', 'sour', 'hot', 'cold', 'fresh', 'delicious', 'tasty',
      'price', 'cost', 'expensive', 'cheap', 'bill', 'tip', 'service', 'waiter',
      'waitress', 'chef', 'cook', 'kitchen', 'table', 'chair', 'plate', 'bowl',
      'fork', 'spoon', 'knife', 'napkin', 'glass', 'cup', 'bottle'
    ])
  };

  // Độ khó của từ dựa trên tần suất và độ phức tạp
  private static readonly WORD_DIFFICULTY = {
    easy: new Set([
      'hello', 'hi', 'good', 'bad', 'big', 'small', 'hot', 'cold', 'happy', 'sad',
      'eat', 'drink', 'sleep', 'walk', 'run', 'go', 'come', 'see', 'look', 'hear',
      'say', 'tell', 'ask', 'know', 'think', 'want', 'need', 'like', 'love', 'hate'
    ]),
    medium: new Set([
      'beautiful', 'wonderful', 'amazing', 'interesting', 'important', 'necessary',
      'possible', 'impossible', 'different', 'similar', 'special', 'ordinary',
      'understand', 'remember', 'forget', 'believe', 'decide', 'choose', 'prefer',
      'enjoy', 'finish', 'start', 'begin', 'continue', 'stop', 'wait', 'hurry'
    ]),
    hard: new Set([
      'extraordinary', 'phenomenal', 'magnificent', 'spectacular', 'remarkable',
      'exceptional', 'outstanding', 'brilliant', 'genius', 'intelligent', 'creative',
      'innovative', 'revolutionary', 'sophisticated', 'complicated', 'complex',
      'challenging', 'difficult', 'impossible', 'unbelievable', 'incredible'
    ])
  };

  // Phân tích từ vựng từ tin nhắn
  static analyzeVocabulary(messages: Message[], topic: string): VocabularyWord[] {
    const userMessages = messages.filter(msg => msg.type === 'user');
    
    // Tách tất cả từ
    const allWords = userMessages.flatMap(msg => 
      this.extractWords(msg.content)
    );

    // Đếm tần suất từ
    const wordFrequency = new Map<string, number>();
    allWords.forEach(word => {
      wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
    });

    // Lọc từ mới (không có trong từ điển cơ bản)
    const newWords = Array.from(wordFrequency.entries())
      .filter(([word, frequency]) => {
        const isBasic = this.BASIC_VOCABULARY.has(word);
        const isTopicRelated = this.TOPIC_VOCABULARY[topic]?.has(word) || false;
        const isRelevant = word.length > 2 && !/^\d+$/.test(word);
        
        return !isBasic && isRelevant && (isTopicRelated || frequency > 1);
      })
      .sort(([,a], [,b]) => b - a) // Sắp xếp theo tần suất
      .slice(0, 10); // Lấy top 10 từ

    // Chuyển đổi thành VocabularyWord
    return newWords.map(([word, frequency]) => {
      const difficulty = this.getWordDifficulty(word);
      const context = this.getWordContext(word, topic);
      const relatedWords = this.getRelatedWords(word, topic);
      const isNew = !this.BASIC_VOCABULARY.has(word);
      const learned = this.isWordLearned(word);

      return {
        word,
        frequency,
        difficulty,
        context,
        relatedWords,
        isNew,
        topic,
        learned
      };
    });
  }

  // Tách từ từ câu
  private static extractWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Loại bỏ dấu câu
      .split(/\s+/)
      .filter(word => word.length > 2 && !/^\d+$/.test(word));
  }

  // Xác định độ khó của từ
  private static getWordDifficulty(word: string): 'easy' | 'medium' | 'hard' {
    if (this.WORD_DIFFICULTY.easy.has(word)) return 'easy';
    if (this.WORD_DIFFICULTY.medium.has(word)) return 'medium';
    if (this.WORD_DIFFICULTY.hard.has(word)) return 'hard';
    
    // Dựa vào độ dài và độ phức tạp
    if (word.length <= 4) return 'easy';
    if (word.length <= 8) return 'medium';
    return 'hard';
  }

  // Lấy ngữ cảnh sử dụng từ
  private static getWordContext(word: string, topic: string): string {
    const contexts: Record<string, Record<string, string>> = {
      'Công viên chủ đề': {
        'ticket': 'Mua vé vào công viên',
        'ride': 'Trò chơi cảm giác mạnh',
        'queue': 'Xếp hàng chờ đợi',
        'fun': 'Vui vẻ, thú vị',
        'exciting': 'Hồi hộp, thú vị'
      },
      'Gọi món': {
        'menu': 'Thực đơn món ăn',
        'order': 'Đặt món ăn',
        'delicious': 'Ngon miệng',
        'spicy': 'Cay',
        'fresh': 'Tươi mới'
      }
    };

    return contexts[topic]?.[word] || `Sử dụng trong chủ đề ${topic}`;
  }

  // Lấy từ liên quan
  private static getRelatedWords(word: string, topic: string): string[] {
    const relatedWords: Record<string, Record<string, string[]>> = {
      'Công viên chủ đề': {
        'ticket': ['entrance', 'price', 'cost', 'buy'],
        'ride': ['rollercoaster', 'fun', 'exciting', 'thrilling'],
        'queue': ['wait', 'line', 'crowd', 'busy'],
        'fun': ['enjoy', 'happy', 'exciting', 'amazing']
      },
      'Gọi món': {
        'menu': ['food', 'dish', 'meal', 'order'],
        'order': ['food', 'meal', 'dish', 'delicious'],
        'delicious': ['tasty', 'good', 'yummy', 'amazing'],
        'spicy': ['hot', 'pepper', 'chili', 'strong']
      }
    };

    return relatedWords[topic]?.[word] || [];
  }

  // Tính cấp độ từ vựng của cuộc trò chuyện
  static getVocabularyLevel(words: VocabularyWord[]): 'beginner' | 'intermediate' | 'advanced' {
    if (words.length === 0) return 'beginner';

    const difficultyCounts = {
      easy: words.filter(w => w.difficulty === 'easy').length,
      medium: words.filter(w => w.difficulty === 'medium').length,
      hard: words.filter(w => w.difficulty === 'hard').length
    };

    const total = words.length;
    const easyRatio = difficultyCounts.easy / total;
    const hardRatio = difficultyCounts.hard / total;

    if (hardRatio > 0.3) return 'advanced';
    if (easyRatio > 0.7) return 'beginner';
    return 'intermediate';
  }

  // Tạo gợi ý học từ vựng
  static generateVocabularySuggestions(words: VocabularyWord[], topic: string): string[] {
    const suggestions = [];
    
    // Gợi ý dựa trên từ đã học
    const learnedWords = words.map(w => w.word);
    const topicWords = Array.from(this.TOPIC_VOCABULARY[topic] || []);
    const unlearnedWords = topicWords.filter(word => !learnedWords.includes(word));
    
    if (unlearnedWords.length > 0) {
      suggestions.push(`Thử sử dụng từ: ${unlearnedWords.slice(0, 3).join(', ')}`);
    }

    // Gợi ý dựa trên độ khó
    const hardWords = words.filter(w => w.difficulty === 'hard');
    if (hardWords.length > 0) {
      suggestions.push(`Ôn lại từ khó: ${hardWords.slice(0, 2).map(w => w.word).join(', ')}`);
    }

    // Gợi ý câu hoàn chỉnh
    if (words.length > 0) {
      const sampleWord = words[0];
      suggestions.push(`Thử câu: "I want to ${sampleWord.word}..."`);
    }

    return suggestions;
  }

  // Kiểm tra từ đã được học chưa
  static isWordLearned(word: string): boolean {
    const learnedWords = this.getLearnedWords();
    return learnedWords.includes(word);
  }

  // Lấy danh sách từ đã học từ localStorage
  static getLearnedWords(): string[] {
    try {
      const learnedWords = localStorage.getItem('learnedWords');
      return learnedWords ? JSON.parse(learnedWords) : [];
    } catch (error) {
      console.error('Error loading learned words:', error);
      return [];
    }
  }

  // Đánh dấu từ đã học
  static markWordAsLearned(word: string): void {
    try {
      const learnedWords = this.getLearnedWords();
      if (!learnedWords.includes(word)) {
        learnedWords.push(word);
        localStorage.setItem('learnedWords', JSON.stringify(learnedWords));
      }
    } catch (error) {
      console.error('Error saving learned word:', error);
    }
  }

  // Bỏ đánh dấu từ đã học
  static unmarkWordAsLearned(word: string): void {
    try {
      const learnedWords = this.getLearnedWords();
      const updatedWords = learnedWords.filter(w => w !== word);
      localStorage.setItem('learnedWords', JSON.stringify(updatedWords));
    } catch (error) {
      console.error('Error removing learned word:', error);
    }
  }

  // Tính điểm từ vựng
  static calculateVocabularyScore(words: VocabularyWord[]): number {
    if (words.length === 0) return 0;

    const scores = words.map(word => {
      switch (word.difficulty) {
        case 'easy': return 1;
        case 'medium': return 2;
        case 'hard': return 3;
        default: return 1;
      }
    });

    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / words.length;
    
    // Chuyển đổi thành điểm 0-100
    return Math.min(100, Math.round(averageScore * 20));
  }
} 