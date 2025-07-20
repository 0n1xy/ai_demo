export const VOICE_LANGUAGES = {
  VI_VN: "vi-VN",
  EN_US: "en-US",
  EN_GB: "en-GB",
} as const;

export const VOICE_OPTIONS = {
  VI_FEMALE: "vi-VN-Standard-A",
  VI_MALE: "vi-VN-Standard-B",
  EN_US_FEMALE: "en-US-Standard-A",
  EN_US_MALE: "en-US-Standard-B",
} as const;

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  language: VOICE_LANGUAGES.VI_VN,
  voice: VOICE_OPTIONS.VI_FEMALE,
  speed: 1.0,
  pitch: 0.0,
};
