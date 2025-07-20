import type { Message } from "./types";

export const createUserMessage = (text: string): Message => ({
  id: Date.now().toString(),
  type: "user",
  content: text,
  timestamp: new Date(),
});

export const createAssistantMessage = (text: string): Message => ({
  id: (Date.now() + 1).toString(),
  type: "assistant",
  content: text,
  timestamp: new Date(),
});
