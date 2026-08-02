import { useState, type MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { staggerChild } from '@/animations/variants';
import { audioManager } from '@/utils/audioManager';

type AccentColor = 'primary' | 'secondary';

interface ChallengeCardProps {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  accentColor: AccentColor;
  questionCount: number;
  difficulty: string;
  onClick: () => void;
  index: number;
}

const ACCENT: Record<AccentColor, {
  glow: string;
  badge: string;
  badgeBorder: string;
  badgeText: string;
  buttonBg: string;
  buttonBorder: string;
  buttonGlow: string;
  borderHover: string;
  iconBg: string;
  iconGlow: string;
  cornerColor: string;
}> = {
  primary: {
    glow: 'rgba(0,243,255,0.45)',
    badge: 'rgba(0,243,255,0.18)',
    badgeBorder: 'rgba(0,243,255,0.45)',
    badgeText: '#00f3ff',
    buttonBg: 'linear-gradient(135deg, #00f3ff 0%, #3b82f6 50%, #1d4ed8 100%)',
    buttonBorder: 'rgba(0,243,255,0.7)',
    buttonGlow: 'rgba(0,243,255,0.55)',
    borderHover: 'rgba(0,243,255,0.65)',
    iconBg: 'rgba(0,243,255,0.18)',
    iconGlow: '#00f3ff',
    cornerColor: '#00f3ff',
  },
  secondary: {
    glow: 'rgba(255,0,127,0.45)',
    badge: 'rgba(255,0,127,0.18)',
    badgeBorder: 'rgba(255,0,127,0.45)',
    badgeText: '#ff007f',
    buttonBg: 'linear-gradient(135deg, #ff007f 0%, #a855f7 50%, #9333ea 100%)',
    buttonBorder: 'rgba(255,0,127,0.7)',
    buttonGlow: 'rgba(255,0,127,0.55)',
    borderHover: 'rgba(255,0,127,0.65)',
    iconBg: 'rgba(255,0,127,0.18)',
    iconGlow: '#ff007f',
    cornerColor: '#ff007f',
  },
};

function LogoIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 20L17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function MovieIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="14" rx="2.5" stroke="currentColor" strokeWidth="2.2" />
      <path d="M2 8h20M8 3v5M16 3v5M8 17v4M16 17v4M12 17v4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChallengeCard({
  id,
  title,
  description,
  imageSrc,
  imageAlt,
  accentColor,
  questionCount,
  difficulty,
  onClick,
  index,
}: ChallengeCardProps) {
  const a = ACCENT[accentColor];
  const Icon = accentColor === 'primary' ? LogoIcon : MovieIcon;

  // 3D Parallax Tilt State
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - card.left;
    const y = e.clientY - card.top;
    const centerX = card.width / 2;
    const centerY = card.height / 2;

    const rY = ((x - centerX) / centerX) * 8; // Max 8 deg
    const rX = ((centerY - y) / centerY) * 8;

    setRotX(rX);
    setRotY(rY);
  };

  const handleMouseLeave = () => {
    setRotX(0);
    setRotY(0);
  };

  const handleClick = () => {
    audioManager.playClick();
    onClick();
  };

  return (
    <motion.article
      id={id}
      variants={staggerChild}
      custom={index}
      onClick={handleClick}
      onMouseEnter={() => audioManager.playHover()}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      aria-label={`Start ${title} challenge`}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className="challenge-card group relative cursor-pointer overflow-hidden rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 select-none"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(6,9,24,0.92) 100%)',
        border: `1.5px solid ${a.badgeBorder}`,
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        boxShadow: `0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.25), 0 0 35px ${a.glow}`,
        transformStyle: 'preserve-3d',
      }}
      animate={{
        rotateX: rotX,
        rotateY: rotY,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{
        scale: 1.04,
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Cybernetic HUD Corner Brackets */}
      <div
        className="pointer-events-none absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 z-20 transition-all duration-300"
        style={{ borderColor: a.cornerColor }}
      />
      <div
        className="pointer-events-none absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 z-20 transition-all duration-300"
        style={{ borderColor: a.cornerColor }}
      />
      <div
        className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 z-20 transition-all duration-300"
        style={{ borderColor: a.cornerColor }}
      />
      <div
        className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 z-20 transition-all duration-300"
        style={{ borderColor: a.cornerColor }}
      />

      {/* Glow Ambient Aura on Hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at center top, ${a.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Game Image Banner with Parallax Zoom */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/6' }}>
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="eager"
          draggable={false}
        />
        {/* Bottom fade gradient */}
        <div
          className="absolute inset-x-0 bottom-0 h-3/4"
          style={{
            background: 'linear-gradient(to top, rgba(6,9,24,0.98) 0%, transparent 100%)',
          }}
        />
        {/* Arcade Level Badge */}
        <div
          className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black text-white shadow-2xl backdrop-blur-md"
          style={{
            background: 'rgba(0,0,0,0.6)',
            border: `1px solid ${a.cornerColor}`,
            boxShadow: `0 0 15px ${a.buttonGlow}`,
          }}
        >
          <span className="h-2 w-2 rounded-full animate-ping" style={{ background: a.cornerColor }} />
          <span>STAGE #{index + 1}</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="relative flex flex-col gap-4 p-6">
        {/* Header Row */}
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: a.iconBg,
              color: a.iconGlow,
              border: `1.5px solid ${a.badgeBorder}`,
              boxShadow: `0 0 20px ${a.glow}`,
            }}
          >
            <Icon />
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <h2
              className="font-black leading-tight text-white tracking-tight"
              style={{
                fontFamily: 'Space Grotesk, Outfit, system-ui, sans-serif',
                fontSize: 'clamp(1.3rem, 2.4vw, 1.65rem)',
                textShadow: `0 0 20px ${a.glow}`,
              }}
            >
              {title}
            </h2>
            <div className="flex flex-wrap gap-2">
              <span
                className="text-caption rounded-full px-3 py-0.5 font-extrabold uppercase text-xs"
                style={{
                  background: a.badge,
                  border: `1px solid ${a.badgeBorder}`,
                  color: a.badgeText,
                  textShadow: `0 0 10px ${a.glow}`,
                }}
              >
                {questionCount} QUESTIONS
              </span>
              <span
                className="text-caption rounded-full px-3 py-0.5 font-extrabold uppercase text-xs"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#e2e8f0',
                }}
              >
                🏆 100 PTS / QUEST
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-label leading-relaxed text-[#cbd5e1] font-semibold text-sm">
          {description}
        </p>

        {/* Esports Action Button */}
        <motion.button
          id={`${id}-cta`}
          className="btn btn-xl mt-1 w-full shimmer font-black tracking-widest text-base"
          style={{
            height: '56px',
            background: a.buttonBg,
            border: `1.5px solid ${a.buttonBorder}`,
            color: '#ffffff',
            boxShadow: `0 8px 30px ${a.buttonGlow}`,
            textShadow: '0 2px 8px rgba(0,0,0,0.6)',
          }}
          whileHover={{ boxShadow: `0 12px 40px ${a.buttonGlow}`, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          <span>🎮 ENTER ARENA</span>
          <ArrowRightIcon />
        </motion.button>
      </div>

      {/* Hover High Voltage Neon Border */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 2px ${a.borderHover}, 0 0 60px ${a.glow}` }}
      />
    </motion.article>
  );
}
