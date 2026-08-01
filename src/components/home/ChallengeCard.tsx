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
}> = {
  primary: {
    glow: 'rgba(59,130,246,0.35)',
    badge: 'rgba(59,130,246,0.18)',
    badgeBorder: 'rgba(59,130,246,0.35)',
    badgeText: '#60a5fa',
    buttonBg: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #2563eb)',
    buttonBorder: 'rgba(59,130,246,0.6)',
    buttonGlow: 'rgba(59,130,246,0.45)',
    borderHover: 'rgba(59,130,246,0.55)',
    iconBg: 'rgba(59,130,246,0.15)',
    iconGlow: '#60a5fa',
  },
  secondary: {
    glow: 'rgba(168,85,247,0.35)',
    badge: 'rgba(168,85,247,0.18)',
    badgeBorder: 'rgba(168,85,247,0.35)',
    badgeText: '#c084fc',
    buttonBg: 'linear-gradient(135deg, #a855f7, #ec4899, #9333ea)',
    buttonBorder: 'rgba(168,85,247,0.6)',
    buttonGlow: 'rgba(168,85,247,0.45)',
    borderHover: 'rgba(168,85,247,0.55)',
    iconBg: 'rgba(168,85,247,0.15)',
    iconGlow: '#c084fc',
  },
};

function LogoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 20L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MovieIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M2 8h20M8 3v5M16 3v5M8 17v4M16 17v4M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
      className="challenge-card group relative cursor-pointer overflow-hidden rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-white/40 select-none"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1.5px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2)',
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
      {/* HUD Corner Highlights */}
      <div className="pointer-events-none absolute top-3 left-3 h-3.5 w-3.5 border-t-2 border-l-2 border-white/20 group-hover:border-purple-400 z-20 transition-colors" />
      <div className="pointer-events-none absolute top-3 right-3 h-3.5 w-3.5 border-t-2 border-r-2 border-white/20 group-hover:border-purple-400 z-20 transition-colors" />
      <div className="pointer-events-none absolute bottom-3 left-3 h-3.5 w-3.5 border-b-2 border-l-2 border-white/20 group-hover:border-purple-400 z-20 transition-colors" />
      <div className="pointer-events-none absolute bottom-3 right-3 h-3.5 w-3.5 border-b-2 border-r-2 border-white/20 group-hover:border-purple-400 z-20 transition-colors" />

      {/* Glow Orb on Hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at center top, ${a.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Image Container with Parallax Zoom */}
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
        {/* Number Badge */}
        <div
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white shadow-xl"
          style={{
            background: a.buttonBg,
            boxShadow: `0 0 16px ${a.buttonGlow}`,
          }}
        >
          #{index + 1}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="relative flex flex-col gap-3.5 p-6">
        {/* Header Row */}
        <div className="flex items-center gap-3.5">
          <div
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: a.iconBg,
              color: a.iconGlow,
              border: `1px solid ${a.badgeBorder}`,
              boxShadow: `0 0 15px ${a.badge}`,
            }}
          >
            <Icon />
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <h2
              className="font-black leading-tight text-[#f0f4ff]"
              style={{
                fontFamily: 'Space Grotesk, Outfit, system-ui, sans-serif',
                fontSize: 'clamp(1.2rem, 2.2vw, 1.5rem)',
              }}
            >
              {title}
            </h2>
            <div className="flex flex-wrap gap-2">
              <span
                className="text-caption rounded-full px-3 py-0.5 font-bold"
                style={{
                  background: a.badge,
                  border: `1px solid ${a.badgeBorder}`,
                  color: a.badgeText,
                }}
              >
                {questionCount} Questions
              </span>
              <span
                className="text-caption rounded-full px-3 py-0.5 font-bold"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#94a3b8',
                }}
              >
                {difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-label leading-relaxed text-[#94a3b8] font-medium">
          {description}
        </p>

        {/* Action Button */}
        <motion.button
          id={`${id}-cta`}
          className="btn btn-xl mt-1 w-full shimmer font-extrabold"
          style={{
            height: '54px',
            background: a.buttonBg,
            border: `1px solid ${a.buttonBorder}`,
            color: '#ffffff',
            boxShadow: `0 6px 24px ${a.buttonGlow}`,
          }}
          whileHover={{ boxShadow: `0 10px 36px ${a.buttonGlow}` }}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          <span className="tracking-wide">START CHALLENGE</span>
          <ArrowRightIcon />
        </motion.button>
      </div>

      {/* Hover Neon Border Highlight */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1.5px ${a.borderHover}, 0 0 50px ${a.glow}` }}
      />
    </motion.article>
  );
}
