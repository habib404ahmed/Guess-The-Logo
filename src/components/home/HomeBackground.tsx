import { useEffect, useState } from 'react';

/**
 * HomeBackground — High-Energy Cyberpunk Game Zone Arena Lighting
 * ─────────────────────────────────────────────────────────────────────────────
 * Modeled after Esports Stadiums & PlayStation Showcase Game Arenas:
 * - Parallax hero background layer
 * - High-voltage mouse tracking lighting aura (Cyan #00f3ff & Hot Magenta #ff007f bloom)
 * - Cyberpunk neon grid mesh & atmospheric laser beam sweeps
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
      {/* ── 1. Base Hero Background Layer ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: "url('/assets/backgrounds/hero-bg.jpg')",
          backgroundAttachment: 'fixed',
          filter: 'blur(3px) scale(1.05)',
          transform: `translate(${(mousePos.x - 50) * -0.06}px, ${(mousePos.y - 50) * -0.06}px)`,
        }}
      />

      {/* ── 2. Dark Overlay for Contrast & Typography Readability ── */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(5, 7, 20, 0.68)' }}
      />

      {/* ── 3. High-Voltage Mouse Tracking Neon Aura (Cyan & Magenta Bloom) ── */}
      <div
        className="absolute inset-0 transition-all duration-300 ease-out"
        style={{
          background: `radial-gradient(circle 650px at ${mousePos.x}% ${mousePos.y}%, rgba(0, 243, 255, 0.18) 0%, rgba(255, 0, 127, 0.14) 40%, transparent 80%)`,
        }}
      />

      {/* ── 4. Cinematic Soft Vignette Around Viewport Edges ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(5, 7, 20, 0.1) 0%, rgba(5, 7, 20, 0.75) 75%, rgba(5, 7, 20, 0.95) 100%)',
        }}
      />

      {/* ── 5. Ambient Esports Stadium Center Bloom ── */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3/4 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0, 243, 255, 0.12) 0%, rgba(168, 85, 247, 0.1) 45%, transparent 80%)',
        }}
      />

      {/* ── 6. Futuristic Cyberpunk Grid Mesh ── */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 243, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 127, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  );
}
