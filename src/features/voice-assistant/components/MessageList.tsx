import React from "react";
import { MessageCircle } from "lucide-react";
import type { Message } from "../types/types";

interface Props {
  messages: Message[];
  sampleMode?: boolean;
  onSuggestReply?: (index: number) => void;
}

const MessageList: React.FC<Props> = ({ messages, onSuggestReply }) => (
  <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 min-h-[400px] max-h-[600px] overflow-y-auto">
    {messages.length === 0 ? (
      <div className="text-center text-slate-400 py-12">
        <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>Chọn chủ đề để bắt đầu luyện nói</p>
      </div>
    ) : (
      <div className="space-y-4">
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
                className={`relative group max-w-xs lg:max-w-md px-4 py-2 rounded-lg transition-all duration-300 ease-in-out
                  ${
                    isUser
                      ? "bg-blue-600 text-white"
                      : isSuggestion
                      ? "bg-green-700 text-white"
                      : "bg-slate-700 text-slate-200"
                  }`}
                style={{ whiteSpace: "pre-wrap" }}
              >
                <p>{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>

                {isAssistant && onSuggestReply && (
                  <button
                    onClick={() => onSuggestReply(index)}
                    className="absolute -top-2 -right-2 text-xs bg-yellow-500 hover:bg-yellow-400 text-black px-1 py-0.5 rounded"
                    title="Get reply suggestion"
                  >
                    Bấm vào đây để gợi ý
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

export default MessageList;
