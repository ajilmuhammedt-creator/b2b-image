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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      <div
        className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-slate-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Studio Settings</h3>
            <p className="text-[11px] text-slate-400">Defaults work automatically</p>
          </div>
        </div>
        <button type="button" className="text-slate-400 hover:text-white transition">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4 pt-1">
          {/* Model */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              AI Image Model
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update('model', 'gpt-image-2.5-sunburst')}
                className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition ${
                  settings.model === 'gpt-image-2.5-sunburst'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-slate-200">Sunburst</div>
                <div className="text-[10px] text-slate-400">Editing precision (Default)</div>
              </button>

              <button
                type="button"
                onClick={() => update('model', 'gpt-image-2.5-flare')}
                className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition ${
                  settings.model === 'gpt-image-2.5-flare'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-slate-200">Flare</div>
                <div className="text-[10px] text-slate-400">Faster generation</div>
              </button>
            </div>
          </div>

          {/* Quality */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Quality Level
            </label>
            <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(['low', 'medium', 'high', 'xhigh', 'max'] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => update('quality', q)}
                  className={`py-1 rounded text-[11px] font-medium capitalize transition ${
                    settings.quality === q
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Feature Image Size */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Feature Image Size (1:1 Square)
            </label>
            <select
              value={settings.featureSize}
              onChange={(e) => update('featureSize', e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="1024x1024">1024 × 1024 (Standard HD)</option>
              <option value="2048x2048">2048 × 2048 (Ultra HD 4K)</option>
            </select>
          </div>

          {/* Poster Size */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Poster Canvas Size
            </label>
            <select
              value={settings.posterSize}
              onChange={(e) => update('posterSize', e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="1024x1536">1024 × 1536 (Portrait 2:3 - Default)</option>
              <option value="1536x1024">1536 × 1024 (Landscape 3:2)</option>
            </select>
          </div>

          {/* Accent Color */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Accent Colour
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => update('accentColor', 'Auto')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  settings.accentColor === 'Auto'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                Auto (Model picks)
              </button>

              <div className="flex items-center space-x-1.5 flex-1 bg-slate-950 px-2 py-1 border border-slate-800 rounded-lg">
                <input
                  type="color"
                  value={settings.accentColor === 'Auto' ? '#4f46e5' : settings.accentColor}
                  onChange={(e) => update('accentColor', e.target.value)}
                  className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono text-slate-300 flex-1">
                  {settings.accentColor === 'Auto' ? 'Custom Picker' : settings.accentColor}
                </span>
              </div>
            </div>
          </div>

          {/* Style Lock */}
          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.styleLock}
                onChange={(e) => update('styleLock', e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
              />
              <div className="space-y-0.5">
                <div className="text-xs font-medium text-slate-200 flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Style Lock</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Use approved Image 1 as style reference for 2 to 5 (sequential generation).
                </p>
              </div>
            </label>
          </div>

          {/* Background */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="block text-xs font-medium text-slate-300">
              Background Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update('background', 'white')}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium border text-center transition ${
                  settings.background === 'white'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                White
              </button>
              <button
                type="button"
                onClick={() => update('background', 'pale tint')}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium border text-center transition ${
                  settings.background === 'pale tint'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
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
