import React from "react";
import type { VoiceSettings } from "../types/types";

interface Props {
  voiceSettings: VoiceSettings;
  setVoiceSettings: React.Dispatch<React.SetStateAction<VoiceSettings>>;
}

const SettingsPanel: React.FC<Props> = ({
  voiceSettings,
  setVoiceSettings,
}) => (
  <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6">
    <h3 className="text-xl font-semibold mb-4">Voice Settings</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">Language</label>
        <select
          value={voiceSettings.language}
          onChange={(e) =>
            setVoiceSettings((prev) => ({ ...prev, language: e.target.value }))
          }
          className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-400 focus:outline-none"
        >
          <option value="vi-VN">Vietnamese</option>
          <option value="en-US">English (US)</option>
          <option value="en-GB">English (UK)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Voice</label>
        <select
          value={voiceSettings.voice}
          onChange={(e) =>
            setVoiceSettings((prev) => ({ ...prev, voice: e.target.value }))
          }
          className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-400 focus:outline-none"
        >
          <option value="vi-VN-Standard-A">Vietnamese Female</option>
          <option value="vi-VN-Standard-B">Vietnamese Male</option>
          <option value="en-US-Standard-A">English Female</option>
          <option value="en-US-Standard-B">English Male</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Speed: {voiceSettings.speed}
        </label>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={voiceSettings.speed}
          onChange={(e) =>
            setVoiceSettings((prev) => ({
              ...prev,
              speed: parseFloat(e.target.value),
            }))
          }
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Pitch: {voiceSettings.pitch}
        </label>
        <input
          type="range"
          min="-20"
          max="20"
          step="1"
          value={voiceSettings.pitch}
          onChange={(e) =>
            setVoiceSettings((prev) => ({
              ...prev,
              pitch: parseFloat(e.target.value),
            }))
          }
          className="w-full"
        />
      </div>
    </div>
  </div>
);

export default SettingsPanel;
