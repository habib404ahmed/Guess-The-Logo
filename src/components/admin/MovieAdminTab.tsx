import { useState, useRef, type ChangeEvent } from 'react';
import { motion, Reorder } from 'framer-motion';
import type { MovieQuestion } from '@/types';
import {
  saveStoredMovies,
  saveStoredMoviesAsync,
  saveMediaBlob,
  deleteMediaBlob,
  type ExtendedMovieQuestion,
} from '@/utils/storage';

interface MovieAdminTabProps {
  movies: MovieQuestion[];
  onUpdateMovies: (movies: MovieQuestion[]) => void;
}

function cleanMovieTitle(filename: string): string {
  let name = filename.replace(/\.[^/.]+$/, '');
  name = name.replace(/^[\d\s\-_]+/, '');
  name = name.replace(/^dialogue[_\-\s]+/i, '');
  name = name.replace(/[_\-]+/g, ' ');
  return name
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

function generateMovieOptions(movieTitle: string, allTitles: string[]) {
  const distractors = allTitles
    .filter((t) => t.toLowerCase() !== movieTitle.toLowerCase())
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const defaults = [
    '3 Idiots',
    'Sholay',
    'The Dark Knight',
    'Titanic',
    'KGF Chapter 2',
    'Avengers Endgame',
  ];

  for (const d of defaults) {
    if (distractors.length >= 3) break;
    if (d.toLowerCase() !== movieTitle.toLowerCase() && !distractors.includes(d)) {
      distractors.push(d);
    }
  }

  const options = [
    { id: 'a', label: movieTitle, isCorrect: true },
    { id: 'b', label: distractors[0] || 'Movie B', isCorrect: false },
    { id: 'c', label: distractors[1] || 'Movie C', isCorrect: false },
    { id: 'd', label: distractors[2] || 'Movie D', isCorrect: false },
  ];

  return options.sort(() => Math.random() - 0.5);
}

export function MovieAdminTab({ movies, onUpdateMovies }: MovieAdminTabProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress]       = useState(0);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  );

  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, isError = false) => {
    setToastMessage({ text: msg, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const updateSaveTimestamp = () => {
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  // Live Statistics Calculations
  const readyCount = movies.filter(
    (m) =>
      m.movieTitle &&
      m.movieTitle.trim() !== '' &&
      m.dialogueText &&
      m.dialogueText.trim() !== '' &&
      Boolean(m.dialogueSrc || m.videoUrl),
  ).length;
  const incompleteCount = movies.length - readyCount;

  // Check if list currently contains only default questions
  const containsOnlyDefaults = movies.length > 0 && movies.every((m) => m.id.startsWith('movie-0') || m.id.startsWith('movie-1'));

  // ── Handle Folder Import ──
  const handleFolderImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const mediaFiles = Array.from(files).filter((file) =>
      /\.(mp3|wav|mp4|m4a|mov|ogg|webm|mkv|avi|m4v|3gp|flv|wmv)$/i.test(file.name),
    );

    if (mediaFiles.length === 0) {
      showToast('No valid media files found in selected folder.', true);
      return;
    }

    setIsImporting(true);
    setProgress(0);

    const newQuestions: ExtendedMovieQuestion[] = [];
    const allTitles = mediaFiles.map((f) => cleanMovieTitle(f.name));

    for (let i = 0; i < mediaFiles.length; i++) {
      const file = mediaFiles[i];
      const movieTitle = cleanMovieTitle(file.name) || `Movie ${i + 1}`;

      try {
        const objectUrl = URL.createObjectURL(file);
        const questionId = `movie-custom-${Date.now()}-${i}`;

        // Save raw binary file to IndexedDB immediately on import
        await saveMediaBlob(questionId, file);

        newQuestions.push({
          id: questionId,
          type: 'movie',
          dialogueSrc: objectUrl,
          videoUrl: objectUrl,
          _rawFile: file,
          videoBlob: file,
          videoFile: file,
          movieTitle,
          dialogueText: `"${movieTitle} - Famous Dialogue Clip"`,
          fileName: file.name,
          optionalHint: '',
          releaseYear: 2024,
          genre: 'Cinema',
          difficulty: 'medium',
          points: 10,
          options: generateMovieOptions(movieTitle, allTitles),
        });
      } catch (err) {
        console.error('[Import Error] Failed processing file:', file.name, err);
      }

      setProgress(Math.round(((i + 1) / mediaFiles.length) * 100));
    }

    setIsImporting(false);

    // If list currently contains default questions, replace them with newly imported videos so Question 1 is immediately the custom video!
    const updated = containsOnlyDefaults
      ? newQuestions
      : [...newQuestions, ...movies];

    onUpdateMovies(updated);
    saveStoredMovies(updated);
    updateSaveTimestamp();
    showToast(`✅ ${newQuestions.length} Movie Clip${newQuestions.length === 1 ? '' : 's'} Imported & Set to Question 1!`);

    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  // ── Handle Single File Add ──
  const handleSingleAdd = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const movieTitle = cleanMovieTitle(file.name) || 'New Movie';

    try {
      const objectUrl = URL.createObjectURL(file);
      const questionId = `movie-custom-${Date.now()}`;
      const allTitles = movies.map((m) => m.movieTitle);

      // Save raw binary file to IndexedDB immediately on add
      await saveMediaBlob(questionId, file);

      const newQ: ExtendedMovieQuestion = {
        id: questionId,
        type: 'movie',
        dialogueSrc: objectUrl,
        videoUrl: objectUrl,
        _rawFile: file,
        videoBlob: file,
        videoFile: file,
        movieTitle,
        dialogueText: `"${movieTitle} - Dialogue"`,
        fileName: file.name,
        optionalHint: '',
        releaseYear: 2024,
        genre: 'Cinema',
        difficulty: 'medium',
        points: 10,
        options: generateMovieOptions(movieTitle, allTitles),
      };

      const updated = containsOnlyDefaults
        ? [newQ]
        : [newQ, ...movies];

      onUpdateMovies(updated);
      saveStoredMovies(updated);
      updateSaveTimestamp();
      showToast(`Added ${movieTitle} video clip successfully!`);
    } catch (err) {
      console.error('[Import Error] Failed adding single file:', err);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Movie Title Edit ──
  const handleTitleChange = (id: string, newTitle: string) => {
    const updated = movies.map((q) => {
      if (q.id === id) {
        return {
          ...q,
          movieTitle: newTitle,
          options: q.options.map((opt) =>
            opt.isCorrect ? { ...opt, label: newTitle } : opt,
          ),
        };
      }
      return q;
    });
    onUpdateMovies(updated);
    saveStoredMovies(updated);
    updateSaveTimestamp();
  };

  // ── Dialogue Text Edit ──
  const handleDialogueTextChange = (id: string, newText: string) => {
    const updated = movies.map((q) => {
      if (q.id === id) {
        return {
          ...q,
          dialogueText: newText,
        };
      }
      return q;
    });
    onUpdateMovies(updated);
    saveStoredMovies(updated);
    updateSaveTimestamp();
  };

  // ── Optional Hint Edit ──
  const handleHintChange = (id: string, newHint: string) => {
    const updated = movies.map((q) => {
      if (q.id === id) {
        return {
          ...q,
          optionalHint: newHint,
        };
      }
      return q;
    });
    onUpdateMovies(updated);
    saveStoredMovies(updated);
    updateSaveTimestamp();
  };

  // ── Save & Validate All Changes ──
  const handleSaveAll = async () => {
    for (let i = 0; i < movies.length; i++) {
      const m = movies[i];
      if (!m.movieTitle || m.movieTitle.trim() === '') {
        showToast(`Validation Error: Movie Name is required for item #${i + 1}`, true);
        return;
      }
      if (!m.dialogueText || m.dialogueText.trim() === '') {
        showToast(`Validation Error: Dialogue Text is required for item #${i + 1}`, true);
        return;
      }
    }

    // Extract binary Blobs for all active preview URLs and commit them to IndexedDB
    showToast('Saving video clips & updating IndexedDB...');
    await saveStoredMoviesAsync(movies);
    updateSaveTimestamp();

    const totalClips = movies.length;
    const clipWord = totalClips === 1 ? 'video clip' : 'video clips';
    const prefix = totalClips === 1 ? 'Saved' : 'Saved all';
    showToast(`${prefix} ${totalClips} ${clipWord} & metadata successfully!`);
  };

  // ── Delete ──
  const handleDelete = (id: string) => {
    const updated = movies.filter((q) => q.id !== id);
    deleteMediaBlob(id); // Delete binary blob from IndexedDB
    onUpdateMovies(updated);
    saveStoredMovies(updated);
    updateSaveTimestamp();
    showToast('Dialogue clip deleted.');
  };

  return (
    <div className="flex flex-col gap-8">
      {/* ── Professional Workstation Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6 select-none">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/40 text-xl">
              🎬
            </span>
            <h2
              className="text-2xl font-black text-white tracking-tight flex flex-wrap items-center gap-3"
              style={{ fontFamily: 'Space Grotesk, Orbitron, sans-serif' }}
            >
              <span>Movie Challenge Workstation</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold text-cyan-300 bg-cyan-500/15 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                {movies.length} Clips Loaded
              </span>
            </h2>
          </div>
          <p className="text-sm font-medium text-[#94a3b8] mt-1">
            Manage media clips, dialogue prompts, and stage reveal answers for the Movie Challenge.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Hidden Inputs */}
          <input
            ref={folderInputRef}
            type="file"
            // @ts-expect-error - webkitdirectory non-standard HTML5 attribute
            webkitdirectory=""
            directory=""
            multiple
            className="hidden"
            onChange={handleFolderImport}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/*"
            className="hidden"
            onChange={handleSingleAdd}
          />

          {/* Folder Import Button */}
          <button
            id="import-dialogue-folder-btn"
            className="btn btn-secondary shadow-lg shadow-purple-500/25 px-5 py-2.5 rounded-xl font-bold"
            onClick={() => folderInputRef.current?.click()}
            disabled={isImporting}
          >
            <span>📁 Import Video Folder</span>
          </button>

          {/* Single File Add Button */}
          <button
            className="btn btn-outline border-white/20 text-slate-200 hover:bg-white/10 px-5 py-2.5 rounded-xl font-bold"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            <span>+ Add Video File</span>
          </button>

          {/* Save All Changes Button */}
          <button
            className="btn btn-primary shadow-lg shadow-blue-500/25 px-6 py-2.5 rounded-xl font-black tracking-wider uppercase"
            onClick={handleSaveAll}
          >
            <span>💾 Save All Changes</span>
          </button>
        </div>
      </div>

      {/* ── LIVE STATISTICS BAR (4 Premium Glass Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        {/* Card 1: Total Clips */}
        <motion.div
          whileHover={{ y: -2, scale: 1.01 }}
          className="flex items-center justify-between p-5 rounded-[20px] backdrop-blur-xl border border-cyan-500/30"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(5, 8, 22, 0.6) 100%)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          }}
        >
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
              Total Clips
            </span>
            <span className="text-3xl font-black text-white mt-1">
              {movies.length}
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-2xl text-cyan-300">
            🎬
          </div>
        </motion.div>

        {/* Card 2: Ready for Challenge */}
        <motion.div
          whileHover={{ y: -2, scale: 1.01 }}
          className="flex items-center justify-between p-5 rounded-[20px] backdrop-blur-xl border border-emerald-500/30"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(5, 8, 22, 0.6) 100%)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          }}
        >
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
              Ready for Challenge
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1">
              {readyCount}
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-2xl text-emerald-300">
            ✅
          </div>
        </motion.div>

        {/* Card 3: Missing Information */}
        <motion.div
          whileHover={{ y: -2, scale: 1.01 }}
          className="flex items-center justify-between p-5 rounded-[20px] backdrop-blur-xl border border-amber-500/30"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(5, 8, 22, 0.6) 100%)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          }}
        >
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
              Incomplete
            </span>
            <span className="text-3xl font-black text-amber-400 mt-1">
              {incompleteCount}
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-400/40 text-2xl text-amber-300">
            ⚠️
          </div>
        </motion.div>

        {/* Card 4: Last Saved */}
        <motion.div
          whileHover={{ y: -2, scale: 1.01 }}
          className="flex items-center justify-between p-5 rounded-[20px] backdrop-blur-xl border border-purple-500/30"
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(5, 8, 22, 0.6) 100%)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          }}
        >
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
              Last Saved
            </span>
            <span className="text-xl font-extrabold text-purple-300 mt-2 truncate">
              {lastSavedTime}
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 border border-purple-400/40 text-2xl text-purple-300">
            💾
          </div>
        </motion.div>
      </div>

      {/* ── Import Progress Indicator ── */}
      {isImporting && (
        <div className="rounded-2xl p-5 bg-purple-950/40 border border-purple-500/40 backdrop-blur-xl flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-sm font-bold">
            <span className="text-purple-300">Processing & encoding video clips…</span>
            <span className="text-white">{progress}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`rounded-2xl border px-6 py-3.5 font-bold ${
            toastMessage.isError
              ? 'border-red-500/40 bg-red-500/15 text-red-300'
              : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
          }`}
        >
          {toastMessage.isError ? '⚠️ ' : '✅ '}
          {toastMessage.text}
        </motion.div>
      )}

      {/* ── Premium Glass Media Cards List (DaVinci / Linear Workstation Cards) ── */}
      <Reorder.Group
        axis="y"
        values={movies}
        onReorder={(newOrder) => {
          onUpdateMovies(newOrder);
          saveStoredMovies(newOrder);
          updateSaveTimestamp();
        }}
        className="flex flex-col gap-6"
      >
        {movies.map((movie, idx) => {
          const mediaSrc = movie.dialogueSrc || movie.videoUrl || '';
          const isVideo =
            !movie.fileName ||
            /\.(mp4|mov|webm|mkv)$/i.test(mediaSrc) ||
            mediaSrc.startsWith('data:video/') ||
            mediaSrc.startsWith('blob:') ||
            (movie.fileName && /\.(mp4|mov|webm)$/i.test(movie.fileName));

          return (
            <Reorder.Item
              key={movie.id}
              value={movie}
              className="group relative flex flex-col gap-6 p-8 rounded-[24px] backdrop-blur-3xl border border-purple-500/35 transition-all select-none"
              style={{
                background: 'linear-gradient(145deg, rgba(14, 12, 35, 0.88) 0%, rgba(6, 8, 24, 0.94) 100%)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 30px rgba(168,85,247,0.25)',
              }}
              whileHover={{ y: -2 }}
            >
              {/* Card Title Header (Drag Handle, Clip #, File Name) */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3.5">
                  <span className="cursor-grab text-2xl text-slate-400 hover:text-white transition-colors">
                    ⋮⋮
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/40 text-xs font-black text-purple-300">
                    #{idx + 1}
                  </span>

                  <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-base">{isVideo ? '🎥' : '🎵'}</span>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {movie.fileName || `${movie.movieTitle}.mp4`}
                    </span>
                  </div>
                </div>
              </div>

              {/* TWO COLUMN SPLIT-SCREEN LAYOUT (40% Left Video Preview / 60% Right Form Inputs) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* ── LEFT COLUMN (40%): Compact Video Preview Container ── */}
                <div className="lg:col-span-5 flex flex-col gap-3 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">
                      📹 Video Player Preview
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      16:9 Aspect Ratio
                    </span>
                  </div>

                  {/* 16:9 Compact Video Frame (Max Width ~420px, Rounded 16px, Glass Border, Neon Outline) */}
                  <div
                    className="relative w-full max-w-[420px] aspect-video overflow-hidden rounded-[16px] bg-black/90 flex items-center justify-center border border-cyan-400/40"
                    style={{
                      boxShadow: '0 0 20px rgba(0, 240, 255, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                  >
                    {isVideo && mediaSrc ? (
                      <video
                        id={`video-player-${movie.id}`}
                        src={mediaSrc}
                        controls
                        preload="metadata"
                        playsInline
                        autoPlay={false}
                        className="h-full w-full object-contain rounded-xl"
                      />
                    ) : (
                      <audio
                        id={`video-player-${movie.id}`}
                        src={mediaSrc}
                        controls
                        preload="metadata"
                        className="w-full px-4"
                      />
                    )}
                  </div>
                </div>

                {/* ── RIGHT COLUMN (60%): Stacked Form Fields (24px Spacing) ── */}
                <div className="lg:col-span-7 flex flex-col gap-6 w-full">

                  {/* 1. 🎬 MOVIE NAME * (Required) */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center justify-between">
                      <span>🎬 MOVIE NAME *</span>
                      <span className="text-[10px] font-semibold text-purple-300">Required</span>
                    </label>
                    <input
                      type="text"
                      value={movie.movieTitle}
                      onChange={(e) => handleTitleChange(movie.id, e.target.value)}
                      className="w-full h-[50px] rounded-[14px] border border-purple-500/50 bg-purple-950/20 px-4 font-bold text-white text-base focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-inner"
                      placeholder="e.g. Dabangg, Pushpa, Sholay"
                    />
                  </div>

                  {/* 2. 📝 DIALOGUE TEXT * (Required) */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center justify-between">
                      <span>📝 DIALOGUE TEXT *</span>
                      <span className="text-[10px] font-semibold text-cyan-300">Required</span>
                    </label>
                    <textarea
                      rows={3}
                      value={movie.dialogueText || ''}
                      onChange={(e) => handleDialogueTextChange(movie.id, e.target.value)}
                      className="w-full rounded-[14px] border border-cyan-500/50 bg-cyan-950/20 p-4 font-semibold text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none transition-all shadow-inner leading-relaxed"
                      placeholder='e.g. "Thappad Se Darr Nahi Lagta Sahab" or "Pushpa... Pushpa Raj"'
                    />
                  </div>

                  {/* 3. 💡 HINT (OPTIONAL) */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-[#94a3b8] uppercase tracking-widest">
                      💡 HINT (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      value={movie.optionalHint || ''}
                      onChange={(e) => handleHintChange(movie.id, e.target.value)}
                      className="w-full h-[50px] rounded-[14px] border border-white/15 bg-white/5 px-4 text-sm font-medium text-white focus:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                      placeholder="e.g. Salman Khan, Amitabh Bachchan"
                    />
                  </div>

                  {/* ── HORIZONTAL ACTION BUTTONS BELOW INPUT FIELDS ── */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {/* Play / Pause Toggle Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById(`video-player-${movie.id}`) as HTMLMediaElement;
                        if (el) {
                          if (el.paused) {
                            el.play();
                          } else {
                            el.pause();
                          }
                        }
                      }}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-500/15 border border-purple-500/40 text-purple-300 font-extrabold text-sm hover:bg-purple-500/30 hover:scale-[1.02] transition-all cursor-pointer shadow-lg"
                    >
                      <span>▶️ Play / Pause Video</span>
                    </button>

                    {/* Delete Clip Button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(movie.id)}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500/15 border border-red-500/35 text-red-300 font-extrabold text-sm hover:bg-red-500/30 hover:scale-[1.02] transition-all cursor-pointer shadow-lg"
                    >
                      <span>🗑️ Delete Clip</span>
                    </button>

                    {/* Save Changes Button */}
                    <button
                      type="button"
                      onClick={handleSaveAll}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 border border-white/20 text-white font-extrabold text-sm hover:scale-[1.02] transition-all cursor-pointer shadow-lg shadow-purple-500/25 ml-auto"
                    >
                      <span>💾 Save All Changes</span>
                    </button>
                  </div>

                </div>
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
}
