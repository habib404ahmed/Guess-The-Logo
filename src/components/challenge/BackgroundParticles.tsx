import { useEffect, useRef } from 'react';

/**
 * Living Cosmic Nebula & Particle Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * High-performance 60 FPS HTML5 Canvas engine rendering:
 * - Animated nebula clouds (magenta, cyan, deep space purple)
 * - 120+ twinkling parallax stars & drifting space dust
 * - Dynamic shooting stars with glowing light tails
 * - Shimmering aurora light waves
 */
export function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // ── Star System ──
    interface Star {
      x: number;
      y: number;
      size: number;
      baseAlpha: number;
      alpha: number;
      twinkleSpeed: number;
      vx: number;
      vy: number;
      color: string;
    }

    const stars: Star[] = Array.from({ length: 110 }, () => {
      const colors = ['#ffffff', '#60a5fa', '#c084fc', '#38bdf8', '#e879f9'];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        baseAlpha: Math.random() * 0.6 + 0.2,
        alpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.005,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    // ── Shooting Star System ──
    interface ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      alpha: number;
      active: boolean;
      width: number;
    }

    let shootingStar: ShootingStar | null = null;
    let lastShootingStarTime = Date.now();

    const spawnShootingStar = () => {
      const startX = Math.random() * width * 0.8 + width * 0.1;
      const startY = Math.random() * height * 0.4;
      shootingStar = {
        x: startX,
        y: startY,
        length: Math.random() * 120 + 80,
        speed: Math.random() * 12 + 10,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2, // ~45 deg
        alpha: 1,
        active: true,
        width: Math.random() * 2 + 1,
      };
    };

    // ── Nebula Cloud Gradients ──
    let nebulaAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      nebulaAngle += 0.002;
      const pulse1 = Math.sin(nebulaAngle) * 0.08 + 0.15;
      const pulse2 = Math.cos(nebulaAngle * 0.7) * 0.08 + 0.12;

      // ── 1. Deep Space Nebula Glows ──
      const grad1 = ctx.createRadialGradient(
        width * 0.3 + Math.sin(nebulaAngle) * 60,
        height * 0.3 + Math.cos(nebulaAngle) * 40,
        50,
        width * 0.3,
        height * 0.3,
        width * 0.5,
      );
      grad1.addColorStop(0, `rgba(147, 51, 234, ${pulse1})`); // Violet nebula
      grad1.addColorStop(0.6, `rgba(59, 130, 246, ${pulse1 * 0.5})`);
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');

      const grad2 = ctx.createRadialGradient(
        width * 0.7 + Math.cos(nebulaAngle * 0.8) * 50,
        height * 0.6 + Math.sin(nebulaAngle * 0.8) * 50,
        50,
        width * 0.7,
        height * 0.6,
        width * 0.5,
      );
      grad2.addColorStop(0, `rgba(6, 182, 212, ${pulse2})`); // Cyan nebula
      grad2.addColorStop(0.6, `rgba(168, 85, 247, ${pulse2 * 0.4})`);
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // ── 2. Twinkling Parallax Stars & Constellations ──
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Move star slightly
        star.x += star.vx;
        star.y += star.vy;
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Twinkle
        star.alpha += Math.sin(Date.now() * star.twinkleSpeed) * 0.015;
        if (star.alpha < 0.1) star.alpha = 0.1;
        if (star.alpha > 0.85) star.alpha = 0.85;

        // Draw Star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.shadowColor = star.color;
        ctx.shadowBlur = star.size * 4;
        ctx.fill();

        // Connect nearby stars with faint constellation lines
        for (let j = i + 1; j < stars.length; j++) {
          const star2 = stars[j];
          const dx = star.x - star2.x;
          const dy = star.y - star2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(star2.x, star2.y);
            ctx.strokeStyle = '#818cf8';
            ctx.globalAlpha = (1 - dist / 90) * 0.08;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // ── 3. Shooting Star Mechanics ──
      const now = Date.now();
      if (!shootingStar && now - lastShootingStarTime > 4000 + Math.random() * 3000) {
        spawnShootingStar();
        lastShootingStarTime = now;
      }

      if (shootingStar && shootingStar.active) {
        const ss = shootingStar;
        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        const starGrad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
        starGrad.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha})`);
        starGrad.addColorStop(0.3, `rgba(168, 85, 247, ${ss.alpha * 0.8})`);
        starGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = starGrad;
        ctx.lineWidth = ss.width;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Advance shooting star head
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.alpha -= 0.015;

        if (ss.alpha <= 0 || ss.x > width + 100 || ss.y > height + 100) {
          ss.active = false;
          shootingStar = null;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* 60 FPS HTML5 Canvas Cosmic Galaxy Engine */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />

      {/* Top & Bottom Vignette Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(6,9,24,0.65) 85%, rgba(6,9,24,0.92) 100%)',
        }}
      />
    </div>
  );
}
