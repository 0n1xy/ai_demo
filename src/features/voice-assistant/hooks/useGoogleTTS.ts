import { GOOGLE_TTS_KEY } from "../constants/config";
import type { VoiceSettings } from "../types/types";

export const synthesizeSpeech = async (
  text: string,
  voiceSettings: VoiceSettings
): Promise<string> => {
  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: voiceSettings.language,
          name: voiceSettings.voice,
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: voiceSettings.speed,
          pitch: voiceSettings.pitch,
        },
      }),
    }
  );

  const data = await response.json();
  if (!data.audioContent) throw new Error("Google TTS failed");

  const binary = atob(data.audioContent);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
  const blob = new Blob([buffer], { type: "audio/mp3" });
  return URL.createObjectURL(blob);
};
