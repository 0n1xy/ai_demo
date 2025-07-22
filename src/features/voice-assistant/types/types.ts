export interface Message {
  id: string;
  type: "user" | "assistant" | "suggestion";
  content: string;
  timestamp: Date;
  isAudio?: boolean;
  suggestedReply?: string;
  suggestingIndex?: number | null;
}

export interface VoiceSettings {
  language: string;
  voice: string;
  speed: number;
  pitch: number;
}
