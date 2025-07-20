export interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  isAudio?: boolean;
}

export interface VoiceSettings {
  language: string;
  voice: string;
  speed: number;
  pitch: number;
}
