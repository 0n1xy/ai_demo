export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

export interface TranslationSettings {
  targetLanguage: string;
  autoTranslate: boolean;
  showOriginal: boolean;
  showTranslation: boolean;
} 