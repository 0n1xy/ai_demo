// src/features/voice-assistant/services/voiceAssistantService.ts

import type { VoiceSettings } from "../types/types";

export const sendMessageToAI = async (message: string): Promise<string> => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      conversation_id: "session-" + Date.now(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get response from AI");
  }

  const data = await response.json();
  return data.response;
};

export const getAudioFromText = async (
  text: string,
  voiceSettings: VoiceSettings
): Promise<Blob> => {
  const response = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      voice: voiceSettings.voice,
      speed: voiceSettings.speed,
      pitch: voiceSettings.pitch,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate audio from text");
  }

  return await response.blob();
};
