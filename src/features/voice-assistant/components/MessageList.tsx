import React, { useState } from "react";
import { MessageCircle, Languages, Copy, Check } from "lucide-react";
import type { Message } from "../types/types";
import { TranslationService } from "../service/translationService";

interface Props {
  messages: Message[];
  sampleMode?: boolean;
  onSuggestReply?: (index: number) => void;
  isProcessing?: boolean;
  suggestingIndex?: number | null;
}

const MessageList: React.FC<Props> = React.memo(({
  messages,
  onSuggestReply,
  isProcessing,
  suggestingIndex,
}) => {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>({});
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  // Dịch nhanh một tin nhắn
  const translateMessage = async (messageId: string, content: string) => {
    if (translations[messageId] || isTranslating[messageId]) return;

    setIsTranslating(prev => ({ ...prev, [messageId]: true }));
    try {
      const result = await TranslationService.translateText(content, 'vi');
      setTranslations(prev => ({ ...prev, [messageId]: result.translatedText }));
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(prev => ({ ...prev, [messageId]: false }));
    }
  };

  // Sao chép tin nhắn
  const copyMessage = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessage(messageId);
      setTimeout(() => setCopiedMessage(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 min-h-[400px] max-h-[600px] overflow-y-auto border border-white/20">
    {messages.length === 0 ? (
      <div className="text-center text-white/60 py-12">
        <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Chọn chủ đề để bắt đầu luyện nói</p>
        <p className="text-sm mt-2">🎯 Bạn sẽ thấy cuộc trò chuyện ở đây</p>
      </div>
    ) : (
      <div className="space-y-6">
        {messages.map((message, index) => {
          const isUser = message.type === "user";
          const isAssistant = message.type === "assistant";
          const isSuggestion = message.type === "suggestion";

          return (
            <div
              key={message.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative group max-w-xs lg:max-w-md px-4 py-3 rounded-2xl transition-all duration-200 ease-in-out shadow-lg
                  ${
                    isUser
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-400/50"
                      : isSuggestion
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-400/50"
                      : "bg-gradient-to-r from-slate-700 to-slate-800 text-white border border-slate-600/50"
                  }`}
                style={{ whiteSpace: "pre-wrap" }}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {/* Translation */}
                {translations[message.id] && (
                  <div className="mt-2 p-2 bg-white/10 rounded border border-white/20">
                    <p className="text-xs text-white/60 mb-1">Bản dịch:</p>
                    <p className="text-sm text-white/90">{translations[message.id]}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyMessage(message.content, message.id)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="Sao chép tin nhắn"
                    >
                      {copiedMessage === message.id ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-white/70" />
                      )}
                    </button>
                    
                    {!translations[message.id] && (
                      <button
                        onClick={() => translateMessage(message.id, message.content)}
                        disabled={isTranslating[message.id]}
                        className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                        title="Dịch tin nhắn"
                      >
                        {isTranslating[message.id] ? (
                          <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <Languages className="w-3 h-3 text-white/70" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isAssistant && onSuggestReply && (
                  <div className="flex items-center gap-2 absolute -top-3 -right-3">
                    <button
                      onClick={() => onSuggestReply(index)}
                      className="text-xs bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-3 py-1 rounded-full font-medium transition-all duration-150 hover:scale-105 shadow-lg"
                      title="Get reply suggestion"
                      disabled={suggestingIndex === index}
                    >
                      💡 Gợi ý
                    </button>
                    {suggestingIndex === index && (
                      <span className="w-4 h-4 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin inline-block"></span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-800 text-white animate-pulse border border-slate-600/50">
              <div className="h-4 w-32 bg-slate-500 rounded mb-2"></div>
              <div className="h-4 w-24 bg-slate-600 rounded"></div>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;
