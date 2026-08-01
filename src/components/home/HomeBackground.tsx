import { useEffect, useState } from 'react';

/**
 * HomeBackground — Million-Dollar Event Environmental Lighting
 * ─────────────────────────────────────────────────────────────────────────────
 * Modeled after PlayStation Showcase & Apple Keynote stages:
 * - Parallax hero background layer
 * - Dynamic mouse tracking lighting aura (blue, purple, cyan bloom)
 * - Cinematic vignette & soft ambient grid mesh
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
          transform: `translate(${(mousePos.x - 50) * -0.05}px, ${(mousePos.y - 50) * -0.05}px)`,
        }}
      />

      {/* ── 2. Dark Overlay for Text & Typography Contrast ── */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(6, 9, 24, 0.65)' }}
      />

      {/* ── 3. Interactive Mouse Lighting Aura (Blue / Purple / Cyan Glow) ── */}
      <div
        className="absolute inset-0 transition-all duration-300 ease-out"
        style={{
          background: `radial-gradient(circle 600px at ${mousePos.x}% ${mousePos.y}%, rgba(59, 130, 246, 0.15) 0%, rgba(168, 85, 247, 0.1) 40%, transparent 80%)`,
        }}
      />

      {/* ── 4. Cinematic Soft Vignette Around Viewport Edges ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(6, 9, 24, 0.1) 0%, rgba(6, 9, 24, 0.75) 75%, rgba(6, 9, 24, 0.95) 100%)',
        }}
      />

      {/* ── 5. Ambient Center Bloom ── */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3/4 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.08) 0%, rgba(168, 85, 247, 0.06) 45%, transparent 80%)',
        }}
      />

      {/* ── 6. Futuristic Cyberpunk Grid Mesh ── */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  );
}
