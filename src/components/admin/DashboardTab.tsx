import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/types';
import type { AppSettings } from '@/utils/storage';
import type { LogoQuestion, MovieQuestion } from '@/types';

interface DashboardTabProps {
  logos: LogoQuestion[];
  movies: MovieQuestion[];
  settings: AppSettings;
  onNavigateTab: (tab: 'logo' | 'movie' | 'settings') => void;
}

export function DashboardTab({
  logos,
  movies,
  settings,
  onNavigateTab,
}: DashboardTabProps) {
  const navigate = useNavigate();

  const sunstonePresent = logos.some(
    (q) => q.brandName.trim().toLowerCase() === 'sunstone',
  );

  return (
    <div className="flex flex-col gap-6">
      {/* ── Welcome Banner ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
        style={{
          background:
            'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(168,85,247,0.12) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-caption text-[#60a5fa]">Admin Control Center</span>
            <h1 className="text-h2 mt-1 font-bold text-[#f0f4ff]">
              Freshers Challenge Arena
            </h1>
            <p className="text-body mt-1 max-w-xl text-[#94a3b8]">
              Manage logos, audio dialogues, event timers, and play order offline.
              All changes apply immediately to the presentation stage.
            </p>
          </div>
          <button
            id="launch-arena-btn"
            className="btn btn-lg flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#fff',
              boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
            }}
            onClick={() => navigate(ROUTES.HOME)}
          >
            <span>Launch Arena Stage</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Logos Stat */}
        <div
          className="card cursor-pointer"
          onClick={() => onNavigateTab('logo')}
        >
          <div className="flex items-center justify-between">
            <span className="text-caption text-[#94a3b8]">Logo Challenge</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              🏢
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-[#f0f4ff]">{logos.length}</p>
          <p className="text-label mt-1 text-[#94a3b8]">
            {sunstonePresent ? '📌 Sunstone Pinned Last' : 'Logos Ready'}
          </p>
        </div>

        {/* Movies Stat */}
        <div
          className="card cursor-pointer"
          onClick={() => onNavigateTab('movie')}
        >
          <div className="flex items-center justify-between">
            <span className="text-caption text-[#94a3b8]">Movie Challenge</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              🎬
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-[#f0f4ff]">{movies.length}</p>
          <p className="text-label mt-1 text-[#94a3b8]">Dialogues Ready</p>
        </div>

        {/* Timer Stat */}
        <div
          className="card cursor-pointer"
          onClick={() => onNavigateTab('settings')}
        >
          <div className="flex items-center justify-between">
            <span className="text-caption text-[#94a3b8]">Question Timer</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              ⏱️
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-[#f0f4ff]">
            {settings.questionTimer}s
          </p>
          <p className="text-label mt-1 text-[#94a3b8]">Seconds Per Question</p>
        </div>

        {/* Audio / System Stat */}
        <div
          className="card cursor-pointer"
          onClick={() => onNavigateTab('settings')}
        >
          <div className="flex items-center justify-between">
            <span className="text-caption text-[#94a3b8]">Audio & FX</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              🔊
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-[#f0f4ff]">
            {settings.soundEffects ? 'Enabled' : 'Muted'}
          </p>
          <p className="text-label mt-1 text-[#94a3b8]">Sound Manager Active</p>
        </div>
      </div>

      {/* ── Quick Workflows & System Info ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Workflow Instructions Card */}
        <div className="card flex flex-col gap-4">
          <h3 className="text-h4 text-[#f0f4ff]">Event Preparation Checklist</h3>
          <ul className="flex flex-col gap-3">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                1
              </span>
              <div>
                <p className="font-semibold text-[#f0f4ff]">Import Logo Folder</p>
                <p className="text-label text-[#94a3b8]">
                  Select the folder on your laptop containing logo images.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-400">
                2
              </span>
              <div>
                <p className="font-semibold text-[#f0f4ff]">Import Dialogue Folder</p>
                <p className="text-label text-[#94a3b8]">
                  Select the folder containing MP3/WAV/MP4 audio files.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                3
              </span>
              <div>
                <p className="font-semibold text-[#f0f4ff]">Verify Sunstone Pin</p>
                <p className="text-label text-[#94a3b8]">
                  Sunstone is guaranteed to sit at the final question slot.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Quick Action Bar */}
        <div className="card flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-h4 text-[#f0f4ff]">Quick Management</h3>
            <p className="text-label mt-1 text-[#94a3b8]">
              Directly jump into folder importing or timer configuration.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="btn btn-secondary flex-1"
              onClick={() => onNavigateTab('logo')}
            >
              <span>Import Logos</span>
            </button>
            <button
              className="btn btn-outline flex-1"
              onClick={() => onNavigateTab('movie')}
            >
              <span>Import Movies</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
