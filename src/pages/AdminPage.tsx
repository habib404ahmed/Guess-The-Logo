import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '@/types';
import type { LogoQuestion, MovieQuestion } from '@/types';
import {
  getStoredSettings,
  saveStoredSettings,
  getStoredLogos,
  saveStoredLogos,
  getStoredMovies,
  saveStoredMovies,
  resetToDefaults,
  type AppSettings,
} from '@/utils/storage';

import { DashboardTab } from '@/components/admin/DashboardTab';
import { LogoAdminTab } from '@/components/admin/LogoAdminTab';
import { MovieAdminTab } from '@/components/admin/MovieAdminTab';
import { SettingsTab } from '@/components/admin/SettingsTab';

type TabType = 'dashboard' | 'logo' | 'movie' | 'settings';

export function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  const [logos, setLogos]       = useState<LogoQuestion[]>(() => getStoredLogos());
  const [movies, setMovies]     = useState<MovieQuestion[]>(() => getStoredMovies());

  // Save changes to storage
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const handleUpdateLogos = (newLogos: LogoQuestion[]) => {
    setLogos(newLogos);
    saveStoredLogos(newLogos);
  };

  const handleUpdateMovies = (newMovies: MovieQuestion[]) => {
    setMovies(newMovies);
    saveStoredMovies(newMovies);
  };

  const handleResetDefaults = () => {
    resetToDefaults();
    setSettings(getStoredSettings());
    setLogos(getStoredLogos());
    setMovies(getStoredMovies());
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#060918] text-[#f0f4ff]">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#060918]/85 backdrop-blur-xl px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Brand logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white shadow-lg shadow-blue-500/20">
              ⚡
            </div>
            <div>
              <h1 className="font-bold text-[#f0f4ff] text-lg leading-none">
                Arena Admin Panel
              </h1>
              <p className="text-caption mt-0.5 text-[#94a3b8]">
                Freshers Orientation 2026
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
            {[
              { id: 'dashboard', label: '🏠 Dashboard' },
              { id: 'logo',      label: '🏢 Logo Challenge' },
              { id: 'movie',     label: '🎬 Movie Challenge' },
              { id: 'settings',  label: '⚙️ Settings' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive ? 'text-white' : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="admin-active-tab"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-white/20"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Go to Arena Button */}
          <button
            id="go-to-arena-btn"
            onClick={() => navigate(ROUTES.HOME)}
            className="btn btn-sm btn-primary"
          >
            <span>Go to Arena Stage</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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

        {/* Mobile Tab Switcher */}
        <div className="mt-3 flex md:hidden items-center justify-around rounded-xl border border-white/10 bg-white/5 p-1">
          {[
            { id: 'dashboard', label: '🏠' },
            { id: 'logo',      label: '🏢' },
            { id: 'movie',     label: '🎬' },
            { id: 'settings',  label: '⚙️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`rounded-lg px-3 py-1.5 text-lg ${
                activeTab === tab.id ? 'bg-white/20' : 'text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
          >
            {activeTab === 'dashboard' && (
              <DashboardTab
                logos={logos}
                movies={movies}
                settings={settings}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'logo' && (
              <LogoAdminTab
                logos={logos}
                onUpdateLogos={handleUpdateLogos}
              />
            )}

            {activeTab === 'movie' && (
              <MovieAdminTab
                movies={movies}
                onUpdateMovies={handleUpdateMovies}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onResetDefaults={handleResetDefaults}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
