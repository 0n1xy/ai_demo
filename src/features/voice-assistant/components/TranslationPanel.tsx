import React, { useState, useEffect } from 'react';
import { Languages, Globe, Download, Copy, Check, X, Settings } from 'lucide-react';
import { TranslationService } from '../service/translationService';
import type { TranslationResult, TranslationSettings } from '../types/translation.types';
import type { Message } from '../types/types';

interface Props {
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
}

const TranslationPanel: React.FC<Props> = ({ messages, isOpen, onClose }) => {
  const [translations, setTranslations] = useState<TranslationResult[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [settings, setSettings] = useState<TranslationSettings>(TranslationService.getTranslationSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const supportedLanguages = TranslationService.getSupportedLanguages();

  // Dịch toàn bộ cuộc hội thoại
  const translateConversation = async () => {
    if (messages.length === 0) return;

    setIsTranslating(true);
    try {
      const results = await TranslationService.translateConversation(messages, settings.targetLanguage);
      setTranslations(results);
      
      // Lưu vào lịch sử
      results.forEach(result => {
        TranslationService.saveTranslationHistory(result);
      });
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Dịch một tin nhắn cụ thể
  const translateMessage = async (message: Message) => {
    try {
      const result = await TranslationService.translateMessage(message, settings.targetLanguage);
      setTranslations(prev => [...prev, result]);
      TranslationService.saveTranslationHistory(result);
    } catch (error) {
      console.error('Message translation failed:', error);
    }
  };

  // Sao chép bản dịch
  const copyTranslation = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  // Xuất bản dịch
  const exportTranslations = () => {
    const content = translations.map((translation, index) => {
      const message = messages[index];
      return `Tin nhắn ${index + 1} (${message.type === 'user' ? 'Người dùng' : 'AI'}):
Gốc: ${translation.originalText}
Dịch: ${translation.translatedText}
---`;
    }).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Cập nhật cài đặt
  const updateSettings = (newSettings: Partial<TranslationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    TranslationService.saveTranslationSettings(updatedSettings);
  };

  // Tự động dịch khi mở panel
  useEffect(() => {
    if (isOpen && messages.length > 0 && settings.autoTranslate) {
      translateConversation();
    }
  }, [isOpen, messages, settings.autoTranslate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800/90 to-blue-800/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl">
              <Languages className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Dịch đoạn hội thoại</h3>
              <p className="text-white/70 text-sm">
                {messages.length} tin nhắn • {TranslationService.getLanguageName(settings.targetLanguage)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Cài đặt"
            >
              <Settings className="w-5 h-5 text-white/70" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 bg-white/5 border-b border-white/20">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/80 text-sm mb-2 block">Ngôn ngữ đích</label>
                <select
                  value={settings.targetLanguage}
                  onChange={(e) => updateSettings({ targetLanguage: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  {supportedLanguages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-white/80 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.autoTranslate}
                    onChange={(e) => updateSettings({ autoTranslate: e.target.checked })}
                    className="rounded"
                  />
                  Tự động dịch khi mở
                </label>
                
                <label className="flex items-center gap-2 text-white/80 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.showOriginal}
                    onChange={(e) => updateSettings({ showOriginal: e.target.checked })}
                    className="rounded"
                  />
                  Hiển thị văn bản gốc
                </label>
                
                <label className="flex items-center gap-2 text-white/80 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.showTranslation}
                    onChange={(e) => updateSettings({ showTranslation: e.target.checked })}
                    className="rounded"
                  />
                  Hiển thị bản dịch
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <button
              onClick={translateConversation}
              disabled={isTranslating || messages.length === 0}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              {isTranslating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang dịch...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Dịch toàn bộ
                </div>
              )}
            </button>

            {translations.length > 0 && (
              <button
                onClick={exportTranslations}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Xuất file
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {translations.length === 0 ? (
            <div className="text-center py-8">
              <Languages className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/70">Chưa có bản dịch nào</p>
              <p className="text-white/50 text-sm mt-2">
                Nhấn "Dịch toàn bộ" để bắt đầu dịch cuộc hội thoại
              </p>
            </div>
          ) : (
            translations.map((translation, index) => {
              const message = messages[index];
              return (
                <div key={index} className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        message.type === 'user' 
                          ? 'bg-blue-500/20 text-blue-300' 
                          : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {message.type === 'user' ? 'Người dùng' : 'AI'}
                      </div>
                      <span className="text-white/50 text-sm">
                        Tin nhắn {index + 1}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => copyTranslation(translation.translatedText, index)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="Sao chép bản dịch"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-white/70" />
                      )}
                    </button>
                  </div>

                  {settings.showOriginal && (
                    <div className="mb-3">
                      <div className="text-white/50 text-xs mb-1">Văn bản gốc:</div>
                      <div className="text-white/90 bg-white/5 rounded p-3 border border-white/10">
                        {translation.originalText}
                      </div>
                    </div>
                  )}

                  {settings.showTranslation && (
                    <div>
                      <div className="text-white/50 text-xs mb-1">
                        Bản dịch ({TranslationService.getLanguageName(translation.targetLanguage)}):
                      </div>
                      <div className="text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded p-3 border border-blue-400/30">
                        {translation.translatedText}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslationPanel; 