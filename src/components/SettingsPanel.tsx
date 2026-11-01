import { useState } from 'react';
import type { StudioSettings } from '../types';
import { Sliders, Lock, ChevronDown, ChevronUp } from 'lucide-react';

interface SettingsPanelProps {
  settings: StudioSettings;
  setSettings: (settings: StudioSettings) => void;
}

export function SettingsPanel({ settings, setSettings }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  const update = <K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#0E1118]/80 border border-[#E3E8EF] dark:border-white/[0.06] rounded-[16px] p-4.5 space-y-4 shadow-[0_1px_3px_rgba(15,27,61,0.06)] dark:shadow-xl backdrop-blur-xl">
      <div
        className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-[#E3E8EF] dark:border-white/[0.06]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-[#E8EDF7] dark:bg-white/[0.04] text-[#0F1B3D] dark:text-slate-300 flex items-center justify-center">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#0F172A] dark:text-white">Studio Settings</h3>
            <p className="text-[10px] text-[#5B6478] dark:text-slate-400">Model & Canvas Quality</p>
          </div>
        </div>
        <button type="button" className="text-[#5B6478] hover:text-[#0F172A] dark:hover:text-white transition">
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-3.5 pt-0.5">
          {/* Model */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-[#5B6478] dark:text-slate-400">
              AI Image Model
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => update('model', 'gpt-image-2.5-sunburst')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition ${
                  settings.model === 'gpt-image-2.5-sunburst'
                    ? 'bg-[#E8EDF7] text-[#0F1B3D] font-semibold border-0 shadow-none dark:border-indigo-500/60 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border'
                    : 'bg-[#FFFFFF] border border-[#E3E8EF] text-[#5B6478] hover:border-slate-300 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-slate-400 dark:hover:border-white/[0.12]'
                }`}
              >
                <div className={`font-semibold text-xs ${settings.model === 'gpt-image-2.5-sunburst' ? 'text-[#0F1B3D] dark:text-slate-200' : 'text-[#5B6478] dark:text-slate-200'}`}>
                  Sunburst
                </div>
                <div className="text-[9px] text-[#5B6478] dark:text-slate-400">High Precision (Default)</div>
              </button>

              <button
                type="button"
                onClick={() => update('model', 'gpt-image-2.5-flare')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition ${
                  settings.model === 'gpt-image-2.5-flare'
                    ? 'bg-[#E8EDF7] text-[#0F1B3D] font-semibold border-0 shadow-none dark:border-indigo-500/60 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border'
                    : 'bg-[#FFFFFF] border border-[#E3E8EF] text-[#5B6478] hover:border-slate-300 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-slate-400 dark:hover:border-white/[0.12]'
                }`}
              >
                <div className={`font-semibold text-xs ${settings.model === 'gpt-image-2.5-flare' ? 'text-[#0F1B3D] dark:text-slate-200' : 'text-[#5B6478] dark:text-slate-200'}`}>
                  Flare
                </div>
                <div className="text-[9px] text-[#5B6478] dark:text-slate-400">Fast Generation</div>
              </button>
            </div>
          </div>

          {/* Quality */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-[#5B6478] dark:text-slate-400">
              Quality
            </label>
            <div className="grid grid-cols-5 gap-1 bg-[#F4F7FC] dark:bg-white/[0.02] p-1 rounded-lg border border-[#DCE4F2] dark:border-white/[0.06]">
              {(['low', 'medium', 'high', 'xhigh', 'max'] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => update('quality', q)}
                  className={`py-1 rounded text-[10px] font-medium capitalize transition ${
                    settings.quality === q
                      ? 'bg-[#E8EDF7] text-[#0F1B3D] font-semibold border-0 shadow-none dark:bg-indigo-600 dark:text-white'
                      : 'bg-white border border-[#E3E8EF] text-[#5B6478] hover:text-[#0F172A] dark:bg-transparent dark:border-0 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Feature Image Size */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-[#5B6478] dark:text-slate-400">
              Feature Size (1:1 Square)
            </label>
            <select
              value={settings.featureSize}
              onChange={(e) => update('featureSize', e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-[#FFFFFF] dark:bg-white/[0.02] border border-[#E3E8EF] dark:border-white/[0.08] rounded-lg text-xs text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0F1B3D] dark:focus:ring-indigo-500"
            >
              <option value="1024x1024" className="bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white">1024 × 1024 (Standard HD)</option>
              <option value="2048x2048" className="bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white">2048 × 2048 (Ultra HD 4K)</option>
            </select>
          </div>

          {/* Poster Size */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-[#5B6478] dark:text-slate-400">
              Poster Canvas Size
            </label>
            <select
              value={settings.posterSize}
              onChange={(e) => update('posterSize', e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-[#FFFFFF] dark:bg-white/[0.02] border border-[#E3E8EF] dark:border-white/[0.08] rounded-lg text-xs text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0F1B3D] dark:focus:ring-indigo-500"
            >
              <option value="1024x1536" className="bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white">1024 × 1536 (Portrait 2:3 - Default)</option>
              <option value="1536x1024" className="bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white">1536 × 1024 (Landscape 3:2)</option>
            </select>
          </div>

          {/* Accent Color */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-[#5B6478] dark:text-slate-400">
              Accent Colour
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => update('accentColor', 'Auto')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  settings.accentColor === 'Auto'
                    ? 'bg-[#E8EDF7] text-[#0F1B3D] font-semibold border-0 shadow-none dark:border-indigo-500/60 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border'
                    : 'bg-[#FFFFFF] border border-[#E3E8EF] text-[#5B6478] hover:border-slate-300 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-slate-400 dark:hover:border-white/[0.12]'
                }`}
              >
                Auto
              </button>

              <div className="flex items-center space-x-1.5 flex-1 bg-[#FFFFFF] dark:bg-white/[0.02] px-2 py-1 border border-[#E3E8EF] dark:border-white/[0.06] rounded-lg">
                <input
                  type="color"
                  value={settings.accentColor === 'Auto' ? '#E11D2E' : settings.accentColor}
                  onChange={(e) => update('accentColor', e.target.value)}
                  className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="text-[11px] font-mono text-[#5B6478] dark:text-slate-400 flex-1">
                  {settings.accentColor === 'Auto' ? 'Custom' : settings.accentColor}
                </span>
              </div>
            </div>
          </div>

          {/* Style Lock */}
          <div className="pt-2 border-t border-[#E3E8EF] dark:border-white/[0.06]">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.styleLock}
                onChange={(e) => update('styleLock', e.target.checked)}
                className="mt-0.5 rounded border-[#E3E8EF] dark:border-white/[0.12] bg-white dark:bg-white/[0.04] text-[#E11D2E] focus:ring-[#0F1B3D]"
              />
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                  <span>Style Lock</span>
                </div>
                <p className="text-[10px] text-[#5B6478] dark:text-slate-400 leading-normal">
                  Use approved Image 1 as style reference for subsequent generations.
                </p>
              </div>
            </label>
          </div>

          {/* Background */}
          <div className="space-y-1 pt-2 border-t border-[#E3E8EF] dark:border-white/[0.06]">
            <label className="block text-[11px] font-medium text-[#5B6478] dark:text-slate-400">
              Background Tone
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => update('background', 'white')}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium text-center transition ${
                  settings.background === 'white'
                    ? 'bg-[#E8EDF7] text-[#0F1B3D] font-semibold border-0 shadow-none dark:border-indigo-500/60 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border'
                    : 'bg-[#FFFFFF] border border-[#E3E8EF] text-[#5B6478] hover:border-slate-300 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-slate-400 dark:hover:border-white/[0.12]'
                }`}
              >
                Pure White
              </button>
              <button
                type="button"
                onClick={() => update('background', 'pale tint')}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium text-center transition ${
                  settings.background === 'pale tint'
                    ? 'bg-[#E8EDF7] text-[#0F1B3D] font-semibold border-0 shadow-none dark:border-indigo-500/60 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border'
                    : 'bg-[#FFFFFF] border border-[#E3E8EF] text-[#5B6478] hover:border-slate-300 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-slate-400 dark:hover:border-white/[0.12]'
                }`}
              >
                Pale Tint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
