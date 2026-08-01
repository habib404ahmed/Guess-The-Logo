import { useState, useRef, type ChangeEvent } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import type { LogoQuestion } from '@/types';
import { pinSunstoneLast, saveStoredLogos } from '@/utils/storage';

interface LogoAdminTabProps {
  logos: LogoQuestion[];
  onUpdateLogos: (logos: LogoQuestion[]) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cleanBrandName(filename: string): string {
  let name = filename.replace(/\.[^/.]+$/, '');
  name = name.replace(/^[\d\s\-_]+/, '');
  name = name.replace(/^logo[_\-\s]+/i, '');
  name = name.replace(/[_\-]+/g, ' ');
  return name
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

function generateOptions(brandName: string, allBrands: string[]) {
  const distractors = allBrands
    .filter((b) => b.toLowerCase() !== brandName.toLowerCase())
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const defaults = ['Apple', 'Nike', 'Google', 'Amazon', 'Microsoft', 'Adidas', 'Samsung'];
  for (const d of defaults) {
    if (distractors.length >= 3) break;
    if (d.toLowerCase() !== brandName.toLowerCase() && !distractors.includes(d)) {
      distractors.push(d);
    }
  }

  const options = [
    { id: 'a', label: brandName, isCorrect: true },
    { id: 'b', label: distractors[0] || 'Option B', isCorrect: false },
    { id: 'c', label: distractors[1] || 'Option C', isCorrect: false },
    { id: 'd', label: distractors[2] || 'Option D', isCorrect: false },
  ];

  return options.sort(() => Math.random() - 0.5);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LogoAdminTab({ logos, onUpdateLogos }: LogoAdminTabProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress]       = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Confirmation Modal State for Deletion
  const [deletingLogo, setDeletingLogo] = useState<LogoQuestion | null>(null);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Handle Folder Import ──
  const handleFolderImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((file) =>
      /\.(jpg|jpeg|png|webp|svg|gif|avif)$/i.test(file.name),
    );

    if (imageFiles.length === 0) {
      showToast('No valid images found in selected folder.');
      return;
    }

    setIsImporting(true);
    setProgress(0);

    const newQuestions: LogoQuestion[] = [];
    const allNames = imageFiles.map((f) => cleanBrandName(f.name));

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const brandName = cleanBrandName(file.name) || `Logo ${i + 1}`;

      try {
        const dataUrl = await readFileAsDataURL(file);
        const questionId = `logo-custom-${Date.now()}-${i}`;

        newQuestions.push({
          id: questionId,
          type: 'logo',
          logoSrc: dataUrl,
          brandName,
          category: brandName.toLowerCase() === 'sunstone' ? 'Sponsor' : 'Brand',
          difficulty: 'medium',
          points: 10,
          options: generateOptions(brandName, allNames),
        });
      } catch (err) {
        console.error('Failed reading file', file.name, err);
      }

      setProgress(Math.round(((i + 1) / imageFiles.length) * 100));
    }

    setIsImporting(false);
    const updated = pinSunstoneLast([...logos, ...newQuestions]);
    onUpdateLogos(updated);
    saveStoredLogos(updated); // Immediate storage persistence
    showToast(`Imported Successfully! (${newQuestions.length} logos added)`);

    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  // ── Handle Single File Add ──
  const handleSingleAdd = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const brandName = cleanBrandName(file.name) || 'New Logo';

    try {
      const dataUrl = await readFileAsDataURL(file);
      const questionId = `logo-custom-${Date.now()}`;
      const allNames = logos.map((l) => l.brandName);

      const newQ: LogoQuestion = {
        id: questionId,
        type: 'logo',
        logoSrc: dataUrl,
        brandName,
        category: 'Brand',
        difficulty: 'medium',
        points: 10,
        options: generateOptions(brandName, allNames),
      };

      const updated = pinSunstoneLast([...logos, newQ]);
      onUpdateLogos(updated);
      saveStoredLogos(updated); // Immediate storage persistence
      showToast(`Added ${brandName} successfully!`);
    } catch (err) {
      console.error(err);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Edit Brand Name ──
  const handleNameChange = (id: string, newName: string) => {
    const updated = logos.map((q) => {
      if (q.id === id) {
        return {
          ...q,
          brandName: newName,
          options: q.options.map((opt) =>
            opt.isCorrect ? { ...opt, label: newName } : opt,
          ),
        };
      }
      return q;
    });

    const pinned = pinSunstoneLast(updated);
    onUpdateLogos(pinned);
    saveStoredLogos(pinned); // Immediate storage persistence
  };

  // ── Initiate Delete (Triggers Confirmation Dialog) ──
  const handleDeleteClick = (logo: LogoQuestion) => {
    setDeletingLogo(logo);
  };

  // ── Confirm Delete Permanent Action ──
  const confirmDelete = () => {
    if (!deletingLogo) return;

    const updated = logos.filter((q) => q.id !== deletingLogo.id);
    const pinned = pinSunstoneLast(updated);

    onUpdateLogos(pinned);
    saveStoredLogos(pinned); // Immediate permanent deletion in localStorage

    setDeletingLogo(null);
    showToast('Logo deleted successfully.');
  };

  // ── Reorder ──
  const handleReorder = (newOrder: LogoQuestion[]) => {
    const pinned = pinSunstoneLast(newOrder);
    onUpdateLogos(pinned);
    saveStoredLogos(pinned); // Immediate storage persistence
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Action Bar ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-h3 font-bold text-[#f0f4ff]">Logo Challenge Manager</h2>
          <p className="text-body mt-0.5 text-[#94a3b8]">
            Import an entire folder of logos. Reorder, rename, or delete logos permanently.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Hidden Directory Input */}
          <input
            ref={folderInputRef}
            type="file"
            // @ts-expect-error - HTML5 webkitdirectory non-standard attribute
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
            accept="image/*"
            className="hidden"
            onChange={handleSingleAdd}
          />

          {/* Folder Import Button */}
          <button
            id="import-logo-folder-btn"
            className="btn btn-primary shadow-lg shadow-blue-500/20"
            onClick={() => folderInputRef.current?.click()}
            disabled={isImporting}
          >
            <span>Import Logo Folder</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Single Add Button */}
          <button
            className="btn btn-outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            <span>+ Add Image</span>
          </button>
        </div>
      </div>

      {/* ── Import Progress ── */}
      {isImporting && (
        <div className="card flex flex-col gap-2">
          <div className="flex items-center justify-between text-label">
            <span className="text-[#60a5fa]">Importing logo folder…</span>
            <span className="font-bold text-[#f0f4ff]">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
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
          className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-[#4ade80]"
        >
          ✅ {toastMessage}
        </motion.div>
      )}

      {/* ── Sunstone Pin Banner ── */}
      <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-3 text-amber-300">
        <span className="text-xl">📌</span>
        <p className="text-label">
          <strong>Sunstone Pinning Active:</strong> The logo named <strong>"Sunstone"</strong> automatically remains locked as the last question even after reordering or shuffling.
        </p>
      </div>

      {/* ── Reorderable Logo List ── */}
      <Reorder.Group
        axis="y"
        values={logos}
        onReorder={handleReorder}
        className="flex flex-col gap-3"
      >
        {logos.map((logo, idx) => {
          const isSunstone =
            logo.brandName.trim().toLowerCase() === 'sunstone';

          return (
            <Reorder.Item
              key={logo.id}
              value={logo}
              className="card flex items-center justify-between gap-4 p-4"
              style={{
                borderColor: isSunstone
                  ? 'rgba(245, 158, 11, 0.4)'
                  : 'rgba(255, 255, 255, 0.08)',
                background: isSunstone
                  ? 'rgba(245, 158, 11, 0.06)'
                  : 'rgba(255, 255, 255, 0.04)',
              }}
            >
              {/* Drag Handle + Question Number */}
              <div className="flex items-center gap-3">
                <span className="cursor-grab text-xl text-[#475569] hover:text-[#94a3b8] select-none">
                  ⋮⋮
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-[#94a3b8]">
                  #{idx + 1}
                </span>
              </div>

              {/* Thumbnail */}
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-black/40 border border-white/10 p-1">
                <img
                  src={logo.logoSrc}
                  alt={logo.brandName}
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Editable Company Name */}
              <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-2">
                <input
                  type="text"
                  value={logo.brandName}
                  onChange={(e) => handleNameChange(logo.id, e.target.value)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-semibold text-[#f0f4ff] focus:border-blue-500 focus:outline-none"
                  placeholder="Company / Brand Name"
                />

                {isSunstone && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30">
                    📌 Pinned Final Question
                  </span>
                )}
              </div>

              {/* Delete Button (Triggers Confirmation) */}
              <button
                id={`delete-logo-btn-${logo.id}`}
                onClick={() => handleDeleteClick(logo)}
                className="btn btn-sm btn-ghost text-red-400 hover:bg-red-500/20 hover:text-red-300"
                title="Delete Logo"
              >
                🗑️ Delete
              </button>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {/* ── Confirmation Dialog Modal ── */}
      <AnimatePresence>
        {deletingLogo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md rounded-3xl border border-red-500/40 bg-[#0c1024] p-6 shadow-2xl flex flex-col gap-5 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 text-3xl text-red-400">
                🗑️
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="text-xl font-bold text-white">
                  Delete Logo?
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Are you sure you want to delete <strong>"{deletingLogo.brandName}"</strong>? This will permanently remove it from storage and update question numbers.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  id="confirm-delete-cancel-btn"
                  className="btn btn-secondary flex-1"
                  onClick={() => setDeletingLogo(null)}
                >
                  Cancel
                </button>
                <button
                  id="confirm-delete-btn"
                  className="btn bg-red-600 hover:bg-red-500 text-white font-bold flex-1 shadow-lg shadow-red-500/25"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
