import React from "react";
import { MessageCircle } from "lucide-react";
import type { Message } from "../types/types";

const MessageList: React.FC<{ messages: Message[] }> = ({ messages }) => (
  <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 min-h-[400px] max-h-[600px] overflow-y-auto">
    {messages.length === 0 ? (
      <div className="text-center text-slate-400 py-12">
        <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>Start speaking to begin your conversation</p>
      </div>
    ) : (
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-200"
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default MessageList;
