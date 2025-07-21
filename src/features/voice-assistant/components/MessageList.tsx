// import React from "react";
// import { MessageCircle } from "lucide-react";
// import type { Message } from "../types/types";

// interface MessageListProps {
//   messages: Message[];
//   sampleMode?: boolean; // 👈 Thêm prop để nhận biết đoạn luyện tập mẫu
// }

// const MessageList: React.FC<MessageListProps> = ({ messages, sampleMode }) => (
//   <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 min-h-[400px] max-h-[600px] overflow-y-auto">
//     {messages.length === 0 ? (
//       <div className="text-center text-slate-400 py-12">
//         <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
//         <p>Start speaking to begin your conversation</p>
//       </div>
//     ) : (
//       <div className="space-y-4">
//         {messages.map((message) => (
//           <div
//             key={message.id}
//             className={`flex ${
//               message.type === "user" ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div className="flex items-start gap-2">
//               {/* 🎤 Icon gợi ý bạn cần nói nếu đang ở sample mode */}
//               {sampleMode && message.type === "user" && (
//                 <span className="text-yellow-400 mt-1">🎤</span>
//               )}

//               <div
//                 className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
//                   message.type === "user"
//                     ? sampleMode
//                       ? "bg-green-700 text-white animate-pulse border border-white"
//                       : "bg-blue-600 text-white"
//                     : "bg-slate-700 text-slate-200"
//                 }`}
//               >
//                 <p className="whitespace-pre-wrap">{message.content}</p>
//                 <p className="text-xs opacity-70 mt-1">
//                   {message.timestamp?.toLocaleTimeString?.() ?? ""}
//                 </p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     )}
//   </div>
// );

// export default MessageList;

// import React from "react";
// import { MessageCircle } from "lucide-react";
// import type { Message } from "../types/types";

// interface Props {
//   messages: Message[];
//   sampleMode?: boolean;
//   onSuggestReply?: (index: number) => void;
// }

// const MessageList: React.FC<Props> = ({
//   messages,
//   sampleMode,
//   onSuggestReply,
// }) => (
//   <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 min-h-[400px] max-h-[600px] overflow-y-auto">
//     {messages.length === 0 ? (
//       <div className="text-center text-slate-400 py-12">
//         <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
//         <p>Start speaking to begin your conversation</p>
//       </div>
//     ) : (
//       <div className="space-y-4">
//         {messages.map((message, index) => (
//           <div
//             key={message.id}
//             className={`flex ${
//               message.type === "user" ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div
//               className={`relative group max-w-xs lg:max-w-md px-4 py-2 rounded-lg transition-all duration-300 ease-in-out
//                 ${
//                   message.type === "user"
//                     ? "bg-blue-600 text-white"
//                     : "bg-slate-700 text-slate-200"
//                 }`}
//             >
//               <p>{message.content}</p>
//               <p className="text-xs opacity-70 mt-1">
//                 {message.timestamp.toLocaleTimeString()}
//               </p>

//               {message.type === "assistant" && onSuggestReply && (
//                 <div className="mt-2 flex items-center gap-2">
//                   <button
//                     onClick={() => onSuggestReply(index)}
//                     className="text-xs bg-yellow-500 hover:bg-yellow-400 text-black px-2 py-1 rounded"
//                   >
//                     💡 Suggest reply
//                   </button>

//                   {/* Nếu có gợi ý hiện sẵn (optionally show below) */}
//                   {message.suggestedReply && (
//                     <span className="text-sm italic text-green-300">
//                       👉 Try saying: <strong>{message.suggestedReply}</strong>
//                     </span>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     )}
//   </div>
// );

// export default MessageList;

// import React from "react";
// import { MessageCircle } from "lucide-react";
// import type { Message } from "../types/types";

// interface Props {
//   messages: Message[];
//   sampleMode?: boolean;
//   onSuggestReply?: (index: number) => void;
//   suggestedReplies?: { [index: number]: string }; // Thêm object map index → gợi ý
// }

// const MessageList: React.FC<Props> = ({
//   messages,
//   sampleMode,
//   onSuggestReply,
//   suggestedReplies = {},
// }) => (
//   <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 min-h-[400px] max-h-[600px] overflow-y-auto">
//     {messages.length === 0 ? (
//       <div className="text-center text-slate-400 py-12">
//         <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
//         <p>Start speaking to begin your conversation</p>
//       </div>
//     ) : (
//       <div className="space-y-4">
//         {messages.map((message, index) => (
//           <div
//             key={message.id}
//             className={`flex ${
//               message.type === "user" ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div
//               className={`relative group max-w-xs lg:max-w-md px-4 py-2 rounded-lg transition-all duration-300 ease-in-out
//                 ${
//                   message.type === "user"
//                     ? "bg-blue-600 text-white"
//                     : "bg-slate-700 text-slate-200"
//                 }`}
//             >
//               <p>{message.content}</p>
//               <p className="text-xs opacity-70 mt-1">
//                 {message.timestamp.toLocaleTimeString()}
//               </p>

//               {message.type === "assistant" && onSuggestReply && (
//                 <button
//                   onClick={() => onSuggestReply(index)}
//                   className="absolute -top-2 -right-2 text-xs bg-yellow-500 hover:bg-yellow-400 text-black px-1 py-0.5 rounded"
//                   title="Get reply suggestion"
//                 >
//                   💡
//                 </button>
//               )}

//               {/* Gợi ý hiển thị ngay dưới tin nhắn assistant */}
//               {message.type === "assistant" &&
//                 suggestedReplies[index] &&
//                 !sampleMode && (
//                   <div className="mt-3 text-sm text-yellow-400 border-t border-yellow-600 pt-2">
//                     👉 <span className="font-semibold">Try saying:</span>{" "}
//                     <em>{suggestedReplies[index]}</em>
//                   </div>
//                 )}
//             </div>
//           </div>
//         ))}
//       </div>
//     )}
//   </div>
// );

// export default MessageList;

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
        <p>Start speaking to begin your conversation</p>
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
                    💡
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
