import type { TranslationResult, TranslationSettings } from '../types/translation.types';

export type { TranslationResult, TranslationSettings };

export class TranslationService {
  private static readonly AZURE_TRANSLATOR_KEY = import.meta.env.VITE_AZURE_TRANSLATOR_KEY;
  private static readonly AZURE_TRANSLATOR_REGION = import.meta.env.VITE_AZURE_TRANSLATOR_REGION;
  private static readonly AZURE_TRANSLATOR_ENDPOINT = 'https://api.cognitive.microsofttranslator.com';

  // Dịch một đoạn văn bản
  static async translateText(text: string, targetLanguage: string = 'vi'): Promise<TranslationResult> {
    try {
      if (!this.AZURE_TRANSLATOR_KEY || !this.AZURE_TRANSLATOR_REGION) {
        throw new Error('Azure Translator credentials not configured');
      }

      const response = await fetch(
        `${this.AZURE_TRANSLATOR_ENDPOINT}/translate?api-version=3.0&to=${targetLanguage}`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': this.AZURE_TRANSLATOR_KEY,
            'Ocp-Apim-Subscription-Region': this.AZURE_TRANSLATOR_REGION,
            'Content-Type': 'application/json',
            'X-ClientTraceId': crypto.randomUUID()
          },
          body: JSON.stringify([{ text }])
        }
      );

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const translation = result[0];

      return {
        originalText: text,
        translatedText: translation.translations[0].text,
        sourceLanguage: translation.detectedLanguage?.language || 'en',
        targetLanguage: targetLanguage,
        confidence: translation.detectedLanguage?.score || 1.0
      };
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  // Dịch toàn bộ cuộc hội thoại
  static async translateConversation(messages: any[], targetLanguage: string = 'vi'): Promise<TranslationResult[]> {
    try {
      const userMessages = messages.filter(msg => msg.type === 'user');
      const assistantMessages = messages.filter(msg => msg.type === 'assistant');

      const allTexts = [
        ...userMessages.map(msg => msg.content),
        ...assistantMessages.map(msg => msg.content)
      ];

      const translations: TranslationResult[] = [];
      
      for (const text of allTexts) {
        if (text.trim()) {
          const translation = await this.translateText(text, targetLanguage);
          translations.push(translation);
        }
      }

      return translations;
    } catch (error) {
      console.error('Conversation translation error:', error);
      throw error;
    }
  }

  // Dịch một tin nhắn cụ thể
  static async translateMessage(message: any, targetLanguage: string = 'vi'): Promise<TranslationResult> {
    return this.translateText(message.content, targetLanguage);
  }

  // Lưu cài đặt dịch thuật
  static saveTranslationSettings(settings: TranslationSettings): void {
    try {
      localStorage.setItem('translation_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving translation settings:', error);
    }
  }

  // Lấy cài đặt dịch thuật
  static getTranslationSettings(): TranslationSettings {
    try {
      const stored = localStorage.getItem('translation_settings');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading translation settings:', error);
    }

    // Default settings
    return {
      targetLanguage: 'vi',
      autoTranslate: false,
      showOriginal: true,
      showTranslation: true
    };
  }

  // Lưu lịch sử dịch thuật
  static saveTranslationHistory(translation: TranslationResult): void {
    try {
      const history = this.getTranslationHistory();
      history.push({
        ...translation,
        timestamp: new Date(),
        id: crypto.randomUUID()
      });

      // Giữ chỉ 100 bản dịch gần nhất
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }

      localStorage.setItem('translation_history', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving translation history:', error);
    }
  }

  // Lấy lịch sử dịch thuật
  static getTranslationHistory(): Array<TranslationResult & { timestamp: Date; id: string }> {
    try {
      const stored = localStorage.getItem('translation_history');
      if (!stored) return [];

      const history = JSON.parse(stored);
      return history.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    } catch (error) {
      console.error('Error loading translation history:', error);
      return [];
    }
  }

  // Xóa lịch sử dịch thuật
  static clearTranslationHistory(): void {
    localStorage.removeItem('translation_history');
  }

  // Danh sách ngôn ngữ hỗ trợ
  static getSupportedLanguages(): { code: string; name: string; nativeName: string }[] {
    return [
      { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語' },
      { code: 'ko', name: 'Korean', nativeName: '한국어' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' }
    ];
  }

  // Lấy tên ngôn ngữ từ mã
  static getLanguageName(code: string): string {
    const language = this.getSupportedLanguages().find(lang => lang.code === code);
    return language ? language.nativeName : code;
  }

  // Kiểm tra xem có phải là tiếng Việt không
  static isVietnamese(text: string): boolean {
    // Simple heuristic: check for Vietnamese characters
    const vietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    return vietnameseChars.test(text);
  }

  // Tự động phát hiện ngôn ngữ cần dịch
  static getAutoTargetLanguage(text: string): string {
    if (this.isVietnamese(text)) {
      return 'en'; // Nếu là tiếng Việt, dịch sang tiếng Anh
    } else {
      return 'vi'; // Nếu không phải tiếng Việt, dịch sang tiếng Việt
    }
  }
} 