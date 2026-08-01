import { useState } from 'react';
import type { AppSettings } from '@/utils/storage';

interface SettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetDefaults: () => void;
}

export function SettingsTab({
  settings,
  onUpdateSettings,
  onResetDefaults,
}: SettingsTabProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
    showToast('Settings saved.');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div>
        <h2 className="text-h3 font-bold text-[#f0f4ff]">Event & Presentation Settings</h2>
        <p className="text-body mt-0.5 text-[#94a3b8]">
          Configure timers, audio, shuffle rules, and screen presentation behavior.
        </p>
      </div>

      {/* ── Toast ── */}
      {toastMessage && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-[#4ade80]">
          ✅ {toastMessage}
        </div>
      )}

      {/* ── Settings Cards ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Timer Setting */}
        <div className="card flex flex-col gap-4">
          <div>
            <h3 className="text-h4 text-[#f0f4ff]">⏱️ Question Timer</h3>
            <p className="text-label mt-1 text-[#94a3b8]">
              Number of seconds allowed per question during the live arena.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {[10, 15, 20, 30].map((sec) => {
              const isSelected = settings.questionTimer === sec;
              return (
                <button
                  key={sec}
                  onClick={() => updateSetting('questionTimer', sec)}
                  className={`btn flex-1 ${
                    isSelected ? 'btn-primary' : 'btn-outline'
                  }`}
                >
                  {sec}s
                </button>
              );
            })}
          </div>
        </div>

        {/* Shuffle Settings */}
        <div className="card flex flex-col gap-4">
          <div>
            <h3 className="text-h4 text-[#f0f4ff]">🔀 Shuffling Rules</h3>
            <p className="text-label mt-1 text-[#94a3b8]">
              Control whether questions appear in random or fixed order.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Shuffle Logos */}
            <label className="flex items-center justify-between cursor-pointer rounded-xl bg-white/5 p-3 hover:bg-white/10">
              <div>
                <p className="font-semibold text-[#f0f4ff]">Shuffle Logos</p>
                <p className="text-caption text-[#94a3b8]">
                  Randomize logo order (Sunstone will stay pinned to the end)
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.shuffleLogos}
                onChange={(e) => updateSetting('shuffleLogos', e.target.checked)}
                className="h-5 w-5 accent-blue-500 cursor-pointer"
              />
            </label>

            {/* Shuffle Movies */}
            <label className="flex items-center justify-between cursor-pointer rounded-xl bg-white/5 p-3 hover:bg-white/10">
              <div>
                <p className="font-semibold text-[#f0f4ff]">Shuffle Movies</p>
                <p className="text-caption text-[#94a3b8]">
                  Randomize dialogue sequence on each challenge start
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.shuffleMovies}
                onChange={(e) => updateSetting('shuffleMovies', e.target.checked)}
                className="h-5 w-5 accent-purple-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Audio Toggles */}
        <div className="card flex flex-col gap-4">
          <div>
            <h3 className="text-h4 text-[#f0f4ff]">🔊 Audio & Sound FX</h3>
            <p className="text-label mt-1 text-[#94a3b8]">
              Enable or mute event audio feedback and background music.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between cursor-pointer rounded-xl bg-white/5 p-3 hover:bg-white/10">
              <div>
                <p className="font-semibold text-[#f0f4ff]">Background Music</p>
                <p className="text-caption text-[#94a3b8]">
                  Ambient stage music during presentation
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.backgroundMusic}
                onChange={(e) => updateSetting('backgroundMusic', e.target.checked)}
                className="h-5 w-5 accent-blue-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer rounded-xl bg-white/5 p-3 hover:bg-white/10">
              <div>
                <p className="font-semibold text-[#f0f4ff]">Sound Effects</p>
                <p className="text-caption text-[#94a3b8]">
                  Click, answer feedback, and countdown tick sounds
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) => updateSetting('soundEffects', e.target.checked)}
                className="h-5 w-5 accent-blue-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Presentation Display */}
        <div className="card flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-h4 text-[#f0f4ff]">🖥️ Presentation Display</h3>
            <p className="text-label mt-1 text-[#94a3b8]">
              Configure default stage launch settings.
            </p>
          </div>

          <label className="flex items-center justify-between cursor-pointer rounded-xl bg-white/5 p-3 hover:bg-white/10">
            <div>
              <p className="font-semibold text-[#f0f4ff]">Fullscreen by Default</p>
              <p className="text-caption text-[#94a3b8]">
                Request fullscreen mode on launching the Arena stage
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.fullscreenByDefault}
              onChange={(e) =>
                updateSetting('fullscreenByDefault', e.target.checked)
              }
              className="h-5 w-5 accent-blue-500 cursor-pointer"
            />
          </label>

          <div className="pt-2">
            <button
              onClick={() => {
                if (
                  confirm(
                    'Are you sure you want to reset all imported logos, movies, and settings back to factory defaults?',
                  )
                ) {
                  onResetDefaults();
                  showToast('Reset to factory defaults completed.');
                }
              }}
              className="btn btn-outline border-red-500/40 text-red-400 hover:bg-red-500/20 w-full"
            >
              🔄 Reset All Data to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
