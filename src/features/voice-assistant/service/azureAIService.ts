import type { SavedWord } from '../types/vocabulary.types';

export interface WordDetails {
  pronunciation: string;
  meaning: string;
  example: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  notes: string;
}

interface DictionaryApiResponse {
  word: string;
  phonetic?: string;
  phonetics: Array<{
    text?: string;
    audio?: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms: string[];
      antonyms: string[];
    }>;
    synonyms: string[];
    antonyms: string[];
  }>;
  license: {
    name: string;
    url: string;
  };
  sourceUrls: string[];
}

export class AzureAIService {
  private static readonly AZURE_OPENAI_ENDPOINT = import.meta.env.VITE_AZURE_ENDPOINT;
  private static readonly AZURE_OPENAI_API_KEY = import.meta.env.VITE_AZURE_API_KEY;
  private static readonly AZURE_OPENAI_DEPLOYMENT = import.meta.env.VITE_AZURE_DEPLOYMENT || 'gpt-4';
  private static readonly DICTIONARY_API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';

  /**
   * Get word details from Dictionary API only
   */
  static async getWordDetails(word: string): Promise<WordDetails> {
    try {
      // Get data from Dictionary API only
      const dictionaryData = await this.getDictionaryData(word);
      return this.convertDictionaryToWordDetails(dictionaryData);
    } catch (error) {
      console.error('Error getting word details:', error);
      return this.getDefaultWordDetails(word);
    }
  }

  /**
   * Get data from Dictionary API
   */
  private static async getDictionaryData(word: string): Promise<DictionaryApiResponse> {
    const url = `${this.DICTIONARY_API_BASE}/${encodeURIComponent(word)}`;
    console.log('Calling Dictionary API:', url);

    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Word "${word}" not found in dictionary`);
      }
      throw new Error(`Dictionary API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Dictionary API response:', data);
    
    return data[0]; // Return the first entry
  }

  /**
   * Convert Dictionary API data to WordDetails format
   */
  private static convertDictionaryToWordDetails(dictionaryData: DictionaryApiResponse): WordDetails {
    const firstMeaning = dictionaryData.meanings[0];
    const firstDefinition = firstMeaning?.definitions[0];
    
    return {
      pronunciation: dictionaryData.phonetic || dictionaryData.phonetics[0]?.text || '',
      meaning: firstDefinition?.definition || '',
      example: firstDefinition?.example || '',
      difficulty: this.estimateDifficulty(dictionaryData),
      category: firstMeaning?.partOfSpeech || 'General',
      tags: [
        firstMeaning?.partOfSpeech || '',
        ...(firstDefinition?.synonyms || []).slice(0, 3),
        ...(firstMeaning?.synonyms || []).slice(0, 2)
      ].filter(Boolean),
      notes: `Source: ${dictionaryData.sourceUrls[0] || 'Dictionary API'}`
    };
  }

  /**
   * Enhance Dictionary data with Azure AI translation
   */
  private static async enhanceWithAzureAI(word: string, dictionaryData: DictionaryApiResponse): Promise<WordDetails> {
    const prompt = this.buildEnhancementPrompt(word, dictionaryData);
    const response = await this.callAzureOpenAI(prompt);
    return this.parseResponse(response);
  }

  /**
   * Build the prompt for Azure AI enhancement
   */
  private static buildEnhancementPrompt(word: string, dictionaryData: DictionaryApiResponse): string {
    const firstMeaning = dictionaryData.meanings[0];
    const firstDefinition = firstMeaning?.definitions[0];
    
    return `Enhance this English word information with Vietnamese translation and context:

Word: "${word}"
English Definition: "${firstDefinition?.definition || ''}"
Part of Speech: "${firstMeaning?.partOfSpeech || ''}"
English Example: "${firstDefinition?.example || ''}"
Synonyms: ${JSON.stringify(firstDefinition?.synonyms || [])}

Provide enhanced information in this exact JSON format:

{
  "pronunciation": "${dictionaryData.phonetic || dictionaryData.phonetics[0]?.text || ''}",
  "meaning": "Vietnamese translation here",
  "example": "Vietnamese example sentence here",
  "difficulty": "easy|medium|hard",
  "category": "General|Business|Academic|Technology|etc",
  "tags": ["part_of_speech", "synonym1", "synonym2"],
  "notes": "Learning tips and usage notes in Vietnamese"
}

Rules:
- pronunciation: Keep the original IPA from dictionary
- meaning: Translate the English definition to Vietnamese
- example: Create a natural Vietnamese sentence using the word
- difficulty: Estimate based on word complexity
- category: Choose appropriate category
- tags: Include part of speech and relevant synonyms
- notes: Provide helpful learning tips in Vietnamese

Respond with ONLY the JSON, no other text.`;
  }

  /**
   * Estimate word difficulty based on dictionary data
   */
  private static estimateDifficulty(dictionaryData: DictionaryApiResponse): 'easy' | 'medium' | 'hard' {
    const word = dictionaryData.word.toLowerCase();
    const definition = dictionaryData.meanings[0]?.definitions[0]?.definition || '';
    
    // Simple heuristics for difficulty estimation
    if (word.length <= 4 || definition.length < 50) {
      return 'easy';
    } else if (word.length <= 8 || definition.length < 100) {
      return 'medium';
    } else {
      return 'hard';
    }
  }

  /**
   * Build the prompt for Azure AI (legacy method)
   */
  private static buildPrompt(word: string): string {
    return `Analyze the English word "${word}" and provide information in this exact JSON format:

{
  "pronunciation": "/əˈsɪst/",
  "meaning": "giúp đỡ, hỗ trợ",
  "example": "Tôi sẽ giúp bạn hoàn thành công việc này.",
  "difficulty": "medium",
  "category": "General",
  "tags": ["verb", "help", "support"],
  "notes": "Thường dùng trong ngữ cảnh chính thức, có thể dùng với 'in' hoặc 'with'"
}

Rules:
- pronunciation: Use IPA format
- meaning: Vietnamese translation
- example: Vietnamese sentence using the word
- difficulty: easy/medium/hard
- category: General/Business/Academic/Technology/etc
- tags: array of relevant tags
- notes: learning tips

Respond with ONLY the JSON, no other text.`;
  }

  /**
   * Call Azure OpenAI API
   */
  private static async callAzureOpenAI(prompt: string): Promise<string> {
    const url = `${this.AZURE_OPENAI_ENDPOINT}/openai/deployments/${this.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2023-05-15`;
    
    console.log('Calling Azure OpenAI API:', {
      url: url.replace(this.AZURE_OPENAI_API_KEY, '***'),
      deployment: this.AZURE_OPENAI_DEPLOYMENT,
      hasEndpoint: !!this.AZURE_OPENAI_ENDPOINT,
      hasApiKey: !!this.AZURE_OPENAI_API_KEY
    });

    const requestBody = {
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that provides detailed information about English words in Vietnamese context. Always respond with valid JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0
    };

    console.log('Request body:', requestBody);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.AZURE_OPENAI_API_KEY,
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API error response:', errorText);
      throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Azure OpenAI response:', data);
    
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in Azure OpenAI response');
    }
    
    return content;
  }

  /**
   * Parse the AI response
   */
  private static parseResponse(response: string): WordDetails {
    try {
      console.log('Parsing AI response:', response);
      
      // Clean the response - remove any markdown formatting
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/```\n?/, '');
      }
      if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/```\n?/, '');
      }
      
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response:', cleanResponse);
        throw new Error('No JSON found in response');
      }

      const jsonString = jsonMatch[0];
      console.log('Extracted JSON string:', jsonString);
      
      const parsed = JSON.parse(jsonString);
      console.log('Parsed JSON:', parsed);
      
      return {
        pronunciation: parsed.pronunciation || '',
        meaning: parsed.meaning || '',
        example: parsed.example || '',
        difficulty: this.validateDifficulty(parsed.difficulty) || 'medium',
        category: parsed.category || 'General',
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        notes: parsed.notes || ''
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.error('Original response:', response);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to parse AI response: ${errorMessage}`);
    }
  }

  /**
   * Validate difficulty level
   */
  private static validateDifficulty(difficulty: string): 'easy' | 'medium' | 'hard' {
    const validDifficulties = ['easy', 'medium', 'hard'];
    return validDifficulties.includes(difficulty) ? difficulty as 'easy' | 'medium' | 'hard' : 'medium';
  }

  /**
   * Get default word details when AI fails
   */
  private static getDefaultWordDetails(word: string): WordDetails {
    return {
      pronunciation: '',
      meaning: '',
      example: '',
      difficulty: 'medium',
      category: 'General',
      tags: [],
      notes: `Không thể lấy thông tin tự động cho từ "${word}". Vui lòng nhập thông tin thủ công.`
    };
  }

  /**
   * Check if Azure AI is configured
   */
  static isConfigured(): boolean {
    return !!(this.AZURE_OPENAI_ENDPOINT && this.AZURE_OPENAI_API_KEY);
  }

  /**
   * Check if the service can work (Dictionary API is always available)
   */
  static canWork(): boolean {
    return true; // Dictionary API is always available
  }

  /**
   * Get configuration status
   */
  static getConfigStatus(): { configured: boolean; missing: string[] } {
    const missing = [];
    
    if (!this.AZURE_OPENAI_ENDPOINT) {
      missing.push('VITE_AZURE_ENDPOINT');
    }
    
    if (!this.AZURE_OPENAI_API_KEY) {
      missing.push('VITE_AZURE_API_KEY');
    }

    return {
      configured: missing.length === 0,
      missing
    };
  }
} 