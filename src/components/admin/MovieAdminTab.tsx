import { useState, useRef, type ChangeEvent } from 'react';
import { motion, Reorder } from 'framer-motion';
import type { MovieQuestion } from '@/types';
import { saveStoredMovies } from '@/utils/storage';

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

  // Modal preview state
  const [previewMedia, setPreviewMedia] = useState<{
    title: string;
    src: string;
  } | null>(null);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, isError = false) => {
    setToastMessage({ text: msg, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Handle Folder Import ──
  const handleFolderImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const mediaFiles = Array.from(files).filter((file) =>
      /\.(mp3|wav|mp4|m4a|mov|ogg|webm)$/i.test(file.name),
    );

    if (mediaFiles.length === 0) {
      showToast('No media files found in selected folder.', true);
      return;
    }

    setIsImporting(true);
    setProgress(0);

    const newQuestions: MovieQuestion[] = [];
    const allTitles = mediaFiles.map((f) => cleanMovieTitle(f.name));

    for (let i = 0; i < mediaFiles.length; i++) {
      const file = mediaFiles[i];
      const movieTitle = cleanMovieTitle(file.name) || `Movie ${i + 1}`;

      try {
        const dataUrl = await readFileAsDataURL(file);
        const questionId = `movie-custom-${Date.now()}-${i}`;

        newQuestions.push({
          id: questionId,
          type: 'movie',
          dialogueSrc: dataUrl,
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
        console.error('Failed reading media file', file.name, err);
      }

      setProgress(Math.round(((i + 1) / mediaFiles.length) * 100));
    }

    setIsImporting(false);
    const updated = [...movies, ...newQuestions];
    onUpdateMovies(updated);
    saveStoredMovies(updated);
    showToast(`Imported ${newQuestions.length} video/dialogue clips successfully!`);

    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  // ── Handle Single File Add ──
  const handleSingleAdd = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const movieTitle = cleanMovieTitle(file.name) || 'New Movie';

    try {
      const dataUrl = await readFileAsDataURL(file);
      const questionId = `movie-custom-${Date.now()}`;
      const allTitles = movies.map((m) => m.movieTitle);

      const newQ: MovieQuestion = {
        id: questionId,
        type: 'movie',
        dialogueSrc: dataUrl,
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

      const updated = [...movies, newQ];
      onUpdateMovies(updated);
      saveStoredMovies(updated);
      showToast(`Added ${movieTitle} clip successfully!`);
    } catch (err) {
      console.error(err);
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
  };

  // ── Save & Validate All Changes ──
  const handleSaveAll = () => {
    // Validation: Movie Name & Dialogue Text are required!
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

    saveStoredMovies(movies);
    showToast('Saved all movie dialogue answers, dialogues & hints successfully!');
  };

  // ── Delete ──
  const handleDelete = (id: string) => {
    const updated = movies.filter((q) => q.id !== id);
    onUpdateMovies(updated);
    saveStoredMovies(updated);
    showToast('Dialogue clip deleted.');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Header & Actions ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
        <div>
          <h2 className="text-h3 font-bold text-[#f0f4ff]">Movie Challenge Manager</h2>
          <p className="text-body mt-0.5 text-[#94a3b8]">
            Import dialogue video/audio folders. Enter Movie Name & Dialogue Text (both required) for live stage reveal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Hidden Directory Input */}
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

          {/* Hidden File Input */}
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
            className="btn btn-secondary shadow-lg shadow-purple-500/20"
            onClick={() => folderInputRef.current?.click()}
            disabled={isImporting}
          >
            <span>📁 Import Video Folder</span>
          </button>

          {/* Single File Add */}
          <button
            className="btn btn-outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            <span>+ Add Video File</span>
          </button>

          {/* Save All Changes Button */}
          <button
            className="btn btn-primary shadow-lg shadow-blue-500/20"
            onClick={handleSaveAll}
          >
            <span>💾 Save Movie List</span>
          </button>
        </div>
      </div>

      {/* ── Import Progress Bar ── */}
      {isImporting && (
        <div className="card flex flex-col gap-2 bg-purple-500/10 border-purple-500/30">
          <div className="flex items-center justify-between text-label">
            <span className="text-[#c084fc]">Processing video folder clips…</span>
            <span className="font-bold text-[#f0f4ff]">{progress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-purple-500 transition-all duration-200"
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
          className={`rounded-2xl border px-5 py-3 ${
            toastMessage.isError
              ? 'border-red-500/40 bg-red-500/15 text-red-300'
              : 'border-emerald-500/30 bg-emerald-500/10 text-[#4ade80]'
          }`}
        >
          {toastMessage.isError ? '⚠️ ' : '✅ '}
          {toastMessage.text}
        </motion.div>
      )}

      {/* ── Movie Dialogue Cards List ── */}
      <Reorder.Group
        axis="y"
        values={movies}
        onReorder={(newOrder) => {
          onUpdateMovies(newOrder);
          saveStoredMovies(newOrder);
        }}
        className="flex flex-col gap-4"
      >
        {movies.map((movie, idx) => {
          const isVideo =
            /\.(mp4|mov|webm|mkv)$/i.test(movie.dialogueSrc) ||
            movie.dialogueSrc.startsWith('data:video/') ||
            (movie.fileName && /\.(mp4|mov|webm)$/i.test(movie.fileName));

          return (
            <Reorder.Item
              key={movie.id}
              value={movie}
              className="card flex flex-col gap-4 p-5 backdrop-blur-xl border border-white/10 hover:border-purple-500/40 transition-colors"
            >
              {/* Row 1: Header (Drag, #, File Name, Preview, Delete) */}
              <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <span className="cursor-grab text-2xl text-[#475569] hover:text-[#94a3b8] select-none">
                    ⋮⋮
                  </span>

                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs font-black text-[#c084fc]">
                    #{idx + 1}
                  </span>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-lg">
                    {isVideo ? '🎥' : '🎵'}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                      🎥 Video / Audio File (Read Only)
                    </span>
                    <span
                      className="truncate text-sm font-medium text-slate-300"
                      title={movie.fileName || `${movie.movieTitle}.mp4`}
                    >
                      {movie.fileName || `${movie.movieTitle}.mp4`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setPreviewMedia({
                        title: movie.movieTitle,
                        src: movie.dialogueSrc,
                      })
                    }
                    className="btn btn-sm btn-outline text-purple-300 border-purple-500/30 hover:bg-purple-500/20"
                  >
                    ▶️ Preview
                  </button>

                  <button
                    onClick={() => handleDelete(movie.id)}
                    className="btn btn-sm btn-ghost text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    title="Delete Clip"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {/* Row 2: Editable Fields (Movie Name, Dialogue Text, Optional Hint) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* 🎬 Movie Name (Required) */}
                <div className="md:col-span-4 flex flex-col gap-1">
                  <label className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center justify-between">
                    <span>🎬 Movie Name *</span>
                    <span className="text-[10px] font-normal text-purple-300">Required</span>
                  </label>
                  <input
                    type="text"
                    value={movie.movieTitle}
                    onChange={(e) => handleTitleChange(movie.id, e.target.value)}
                    className="w-full rounded-xl border border-purple-500/40 bg-purple-950/20 px-3.5 py-2 font-bold text-[#f0f4ff] focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-base"
                    placeholder="e.g. Dabangg, Pushpa, Sholay"
                  />
                </div>

                {/* 📝 Dialogue Text (Required Text Area) */}
                <div className="md:col-span-5 flex flex-col gap-1">
                  <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                    <span>📝 Dialogue Text *</span>
                    <span className="text-[10px] font-normal text-cyan-300">Required</span>
                  </label>
                  <textarea
                    rows={2}
                    value={movie.dialogueText || ''}
                    onChange={(e) => handleDialogueTextChange(movie.id, e.target.value)}
                    className="w-full rounded-xl border border-cyan-500/40 bg-cyan-950/20 px-3.5 py-1.5 text-sm font-medium text-[#f0f4ff] focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 resize-none"
                    placeholder='e.g. "Thappad Se Darr Nahi Lagta Sahab" or "Pushpa... Pushpa Raj"'
                  />
                </div>

                {/* 💡 Hint (Optional) */}
                <div className="md:col-span-3 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                    💡 Hint (Optional)
                  </label>
                  <input
                    type="text"
                    value={movie.optionalHint || ''}
                    onChange={(e) => handleHintChange(movie.id, e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-[#f0f4ff] focus:border-purple-500/50 focus:outline-none"
                    placeholder="e.g. Amitabh Bachchan"
                  />
                </div>
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {/* ── Preview Video Modal ── */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-2xl rounded-3xl border border-purple-500/40 bg-[#0b0f24] p-6 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">
                🎬 Preview Clip: {previewMedia.title}
              </h3>
              <button
                onClick={() => setPreviewMedia(null)}
                className="rounded-full bg-white/10 p-2 text-slate-300 hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black flex items-center justify-center">
              <video
                src={previewMedia.src}
                controls
                autoPlay
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex justify-end">
              <button
                className="btn btn-secondary"
                onClick={() => setPreviewMedia(null)}
              >
                Close Preview
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
