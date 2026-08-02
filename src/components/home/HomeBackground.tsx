import { useEffect, useState } from 'react';

/**
 * HomeBackground — 1:1 Match to User's Esports Stadium Arena
 * ─────────────────────────────────────────────────────────────────────────────
 * Features:
 * - High-resolution stage background image
 * - Top Left Blue & Top Right Purple Spotlight Beams
 * - Hanging Vertical "PLAY GUESS WIN" Stage Banners with Trophy Icons
 * - Circular HUD ring glow framing behind the main hero title
 * - Mouse parallax ambient lighting
 */
export function HomeBackground() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = Math.round((e.clientX / window.innerWidth) * 100);
      const y = Math.round((e.clientY / window.innerHeight) * 100);
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden select-none"
      style={{ zIndex: 0 }}
    >
      {/* ── 1. Base Esports Stadium Stage Background ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: "url('/images/esports-arena-bg.png')",
          backgroundAttachment: 'fixed',
          transform: `translate(${(mousePos.x - 50) * -0.04}px, ${(mousePos.y - 50) * -0.04}px) scale(1.02)`,
        }}
      />

      {/* ── 2. Dark Ambient Overlay ── */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(5, 7, 20, 0.45)' }}
      />

      {/* ── 3. Top Left Blue & Top Right Purple Spotlight Beams ── */}
      <div
        className="absolute top-0 left-0 w-1/2 h-full opacity-60"
        style={{
          background: 'radial-gradient(ellipse at 15% 0%, rgba(0, 162, 255, 0.45) 0%, transparent 65%)',
        }}
      />
      <div
        className="absolute top-0 right-0 w-1/2 h-full opacity-60"
        style={{
          background: 'radial-gradient(ellipse at 85% 0%, rgba(168, 85, 247, 0.45) 0%, transparent 65%)',
        }}
      />

      {/* ── 4. Center Glowing Circular Cybernetic Ring (Behind Title) ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center opacity-40"
        style={{ width: '680px', height: '680px' }}
      >
        <div
          className="w-full h-full rounded-full border border-purple-500/30 animate-spin"
          style={{
            boxShadow: '0 0 80px rgba(168,85,247,0.3), inset 0 0 80px rgba(0,162,255,0.3)',
            animationDuration: '60s',
          }}
        />
        <div
          className="absolute inset-12 rounded-full border border-cyan-400/30 animate-spin"
          style={{ animationDuration: '40s', animationDirection: 'reverse' }}
        />
      </div>

      {/* ── 5. Left Hanging Banner ("PLAY GUESS WIN 🏆") ── */}
      <div className="hidden xl:flex absolute top-0 left-8 z-10 flex-col items-center gap-3 pt-6 pb-8 px-4 bg-gradient-to-b from-blue-950/90 via-blue-900/60 to-transparent border-x border-b border-cyan-400/40 rounded-b-2xl shadow-[0_10px_30px_rgba(0,162,255,0.3)] backdrop-blur-md">
        <div className="flex flex-col items-center gap-2 text-[11px] font-black tracking-widest text-cyan-300 uppercase leading-none">
          <span>P</span>
          <span>L</span>
          <span>A</span>
          <span>Y</span>
        </div>
        <div className="h-2 w-2 rounded-full bg-cyan-400 my-1 animate-pulse" />
        <div className="flex flex-col items-center gap-2 text-[11px] font-black tracking-widest text-cyan-300 uppercase leading-none">
          <span>G</span>
          <span>U</span>
          <span>E</span>
          <span>S</span>
          <span>S</span>
        </div>
        <div className="h-2 w-2 rounded-full bg-cyan-400 my-1 animate-pulse" />
        <div className="flex flex-col items-center gap-2 text-[11px] font-black tracking-widest text-cyan-300 uppercase leading-none">
          <span>W</span>
          <span>I</span>
          <span>N</span>
        </div>
        <div className="text-2xl mt-2 text-cyan-400 drop-shadow-[0_0_12px_rgba(0,243,255,0.8)]">
          🏆
        </div>
      </div>

      {/* ── 6. Right Hanging Banner ("PLAY GUESS WIN 🏆") ── */}
      <div className="hidden xl:flex absolute top-0 right-8 z-10 flex-col items-center gap-3 pt-6 pb-8 px-4 bg-gradient-to-b from-purple-950/90 via-purple-900/60 to-transparent border-x border-b border-purple-400/40 rounded-b-2xl shadow-[0_10px_30px_rgba(168,85,247,0.3)] backdrop-blur-md">
        <div className="flex flex-col items-center gap-2 text-[11px] font-black tracking-widest text-purple-300 uppercase leading-none">
          <span>P</span>
          <span>L</span>
          <span>A</span>
          <span>Y</span>
        </div>
        <div className="h-2 w-2 rounded-full bg-purple-400 my-1 animate-pulse" />
        <div className="flex flex-col items-center gap-2 text-[11px] font-black tracking-widest text-purple-300 uppercase leading-none">
          <span>G</span>
          <span>U</span>
          <span>E</span>
          <span>S</span>
          <span>S</span>
        </div>
        <div className="h-2 w-2 rounded-full bg-purple-400 my-1 animate-pulse" />
        <div className="flex flex-col items-center gap-2 text-[11px] font-black tracking-widest text-purple-300 uppercase leading-none">
          <span>W</span>
          <span>I</span>
          <span>N</span>
        </div>
        <div className="text-2xl mt-2 text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]">
          🏆
        </div>
      </div>

      {/* ── 7. Bottom Left & Bottom Right HUD Hashes ── */}
      <div className="absolute bottom-4 left-6 flex items-center gap-1.5 opacity-60">
        <div className="h-3 w-1.5 bg-cyan-400 -skew-x-12" />
        <div className="h-3 w-1.5 bg-cyan-400 -skew-x-12" />
        <div className="h-3 w-1.5 bg-cyan-400 -skew-x-12" />
      </div>
      <div className="absolute bottom-4 right-6 flex items-center gap-1.5 opacity-60">
        <div className="h-3 w-1.5 bg-purple-400 -skew-x-12" />
        <div className="h-3 w-1.5 bg-purple-400 -skew-x-12" />
        <div className="h-3 w-1.5 bg-purple-400 -skew-x-12" />
      </div>
    </div>
  );
}
