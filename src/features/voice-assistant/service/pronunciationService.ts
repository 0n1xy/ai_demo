export interface PronunciationResult {
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  pronunciationScore: number;
  wordLevelResults: WordLevelResult[];
  detailedFeedback: string;
}

export interface WordLevelResult {
  word: string;
  accuracyScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  errorType?: string;
  suggestedPronunciation?: string;
}

export class PronunciationService {
  private static readonly AZURE_SPEECH_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY;
  private static readonly AZURE_SPEECH_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION;

  // Đánh giá phát âm từ audio blob
  static async assessPronunciation(audioBlob: Blob, referenceText: string): Promise<PronunciationResult> {
    try {
      if (!this.AZURE_SPEECH_KEY || !this.AZURE_SPEECH_REGION) {
        throw new Error('Azure Speech credentials not configured');
      }

      // Chuyển đổi audio blob thành ArrayBuffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // Tạo request body cho Azure Speech Services
      const requestBody = {
        audio: {
          data: this.arrayBufferToBase64(arrayBuffer)
        },
        referenceText: referenceText,
        pronunciationAssessment: {
          referenceText: referenceText,
          granularity: "Word",
          enableMiscue: true,
          enableProsodyAssessment: true
        }
      };

      // Gọi Azure Speech Services API
      const response = await fetch(
        `https://${this.AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': this.AZURE_SPEECH_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`Azure Speech API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return this.parsePronunciationResult(result, referenceText);
    } catch (error) {
      console.error('Pronunciation assessment error:', error);
      throw error;
    }
  }

  // Chuyển đổi ArrayBuffer thành Base64
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Parse kết quả từ Azure Speech Services
  private static parsePronunciationResult(azureResult: any, referenceText: string): PronunciationResult {
    const pronunciationAssessment = azureResult.PronunciationAssessment;
    
    if (!pronunciationAssessment) {
      // Fallback nếu không có pronunciation assessment
      return {
        overallScore: 75,
        accuracyScore: 75,
        fluencyScore: 75,
        completenessScore: 75,
        pronunciationScore: 75,
        wordLevelResults: [],
        detailedFeedback: "Pronunciation assessment not available"
      };
    }

    const wordLevelResults: WordLevelResult[] = pronunciationAssessment.WordLevelResults?.map((word: any) => ({
      word: word.Word,
      accuracyScore: word.AccuracyScore * 100,
      pronunciationScore: word.PronunciationScore * 100,
      fluencyScore: word.FluencyScore * 100,
      errorType: word.ErrorType,
      suggestedPronunciation: word.SuggestedPronunciation
    })) || [];

    return {
      overallScore: pronunciationAssessment.OverallScore * 100,
      accuracyScore: pronunciationAssessment.AccuracyScore * 100,
      fluencyScore: pronunciationAssessment.FluencyScore * 100,
      completenessScore: pronunciationAssessment.CompletenessScore * 100,
      pronunciationScore: pronunciationAssessment.PronunciationScore * 100,
      wordLevelResults,
      detailedFeedback: this.generateDetailedFeedback(pronunciationAssessment, wordLevelResults)
    };
  }

  // Tạo feedback chi tiết
  private static generateDetailedFeedback(assessment: any, wordResults: WordLevelResult[]): string {
    const overallScore = assessment.OverallScore * 100;
    let feedback = `Overall Score: ${overallScore.toFixed(1)}/100\n\n`;

    // Đánh giá tổng quan
    if (overallScore >= 90) {
      feedback += "🎉 Excellent pronunciation! Your speech is very clear and natural.\n";
    } else if (overallScore >= 80) {
      feedback += "👍 Good pronunciation! You're doing well with most words.\n";
    } else if (overallScore >= 70) {
      feedback += "📚 Fair pronunciation. Keep practicing to improve.\n";
    } else {
      feedback += "💪 Keep practicing! Focus on the words below.\n";
    }

    // Chi tiết từng từ có vấn đề
    const problematicWords = wordResults.filter(word => word.accuracyScore < 70);
    if (problematicWords.length > 0) {
      feedback += "\n📝 Words to practice:\n";
      problematicWords.forEach(word => {
        feedback += `• "${word.word}" - Score: ${word.accuracyScore.toFixed(1)}/100`;
        if (word.suggestedPronunciation) {
          feedback += ` (Try: "${word.suggestedPronunciation}")`;
        }
        feedback += "\n";
      });
    }

    return feedback;
  }

  // Đánh giá nhanh (simplified version)
  static async quickAssessment(audioBlob: Blob): Promise<number> {
    try {
      const result = await this.assessPronunciation(audioBlob, "");
      return result.overallScore;
    } catch (error) {
      console.error('Quick assessment error:', error);
      return 75; // Default score
    }
  }

  // Lưu kết quả pronunciation vào localStorage
  static savePronunciationResult(result: PronunciationResult, timestamp: Date = new Date()): void {
    try {
      const history = this.getPronunciationHistory();
      history.push({
        ...result,
        timestamp,
        id: crypto.randomUUID()
      });
      
      // Giữ chỉ 50 kết quả gần nhất
      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }
      
      localStorage.setItem('pronunciation_history', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving pronunciation result:', error);
    }
  }

  // Lấy lịch sử pronunciation
  static getPronunciationHistory(): Array<PronunciationResult & { timestamp: Date; id: string }> {
    try {
      const stored = localStorage.getItem('pronunciation_history');
      if (!stored) return [];
      
      const history = JSON.parse(stored);
      return history.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    } catch (error) {
      console.error('Error loading pronunciation history:', error);
      return [];
    }
  }

  // Tính điểm trung bình
  static getAverageScore(): number {
    const history = this.getPronunciationHistory();
    if (history.length === 0) return 0;
    
    const totalScore = history.reduce((sum, result) => sum + result.overallScore, 0);
    return totalScore / history.length;
  }

  // Xóa lịch sử pronunciation
  static clearPronunciationHistory(): void {
    localStorage.removeItem('pronunciation_history');
  }
} 