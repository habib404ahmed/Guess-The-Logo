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
  buttonGlow: string;
  borderStroke: string;
  numberBg: string;
  graphicSrc: string;
}> = {
  primary: {
    glow: 'rgba(0, 162, 255, 0.45)',
    badge: 'rgba(0, 162, 255, 0.18)',
    badgeBorder: 'rgba(0, 162, 255, 0.5)',
    badgeText: '#38bdf8',
    buttonBg: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
    buttonGlow: 'rgba(0, 162, 255, 0.65)',
    borderStroke: 'rgba(0, 162, 255, 0.75)',
    numberBg: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
    graphicSrc: '/images/logo-challenge-neon.png',
  },
  secondary: {
    glow: 'rgba(168, 85, 247, 0.45)',
    badge: 'rgba(168, 85, 247, 0.18)',
    badgeBorder: 'rgba(168, 85, 247, 0.5)',
    badgeText: '#c084fc',
    buttonBg: 'linear-gradient(135deg, #e040fb 0%, #7c4dff 100%)',
    buttonGlow: 'rgba(168, 85, 247, 0.65)',
    borderStroke: 'rgba(168, 85, 247, 0.75)',
    numberBg: 'linear-gradient(135deg, #e040fb 0%, #7c4dff 100%)',
    graphicSrc: '/images/movie-challenge-neon.png',
  },
};

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
  accentColor,
  questionCount,
  difficulty,
  onClick,
  index,
}: ChallengeCardProps) {
  const a = ACCENT[accentColor];

  // 3D Parallax Tilt State
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - card.left;
    const y = e.clientY - card.top;
    const centerX = card.width / 2;
    const centerY = card.height / 2;

    const rY = ((x - centerX) / centerX) * 7;
    const rX = ((centerY - y) / centerY) * 7;

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

  const formattedIndex = (index + 1).toString().padStart(2, '0');

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
      className="challenge-card group relative cursor-pointer overflow-hidden rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 select-none flex flex-col justify-between"
      style={{
        background: 'linear-gradient(145deg, rgba(12, 16, 38, 0.85) 0%, rgba(6, 8, 22, 0.92) 100%)',
        border: `1.8px solid ${a.borderStroke}`,
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        boxShadow: `0 20px 60px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.25), 0 0 35px ${a.glow}`,
        transformStyle: 'preserve-3d',
      }}
      animate={{
        rotateX: rotX,
        rotateY: rotY,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{
        scale: 1.03,
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* HUD Chamfered Corner Markers */}
      <div className="pointer-events-none absolute top-3 left-3 h-3.5 w-3.5 border-t-2 border-l-2 z-20" style={{ borderColor: a.borderStroke }} />
      <div className="pointer-events-none absolute top-3 right-3 h-3.5 w-3.5 border-t-2 border-r-2 z-20" style={{ borderColor: a.borderStroke }} />
      <div className="pointer-events-none absolute bottom-3 left-3 h-3.5 w-3.5 border-b-2 border-l-2 z-20" style={{ borderColor: a.borderStroke }} />
      <div className="pointer-events-none absolute bottom-3 right-3 h-3.5 w-3.5 border-b-2 border-r-2 z-20" style={{ borderColor: a.borderStroke }} />

      {/* Top Banner & Graphic Section */}
      <div className="relative p-5 pb-0">
        {/* Number Circle Badge (Top Left 01 / 02) */}
        <div
          className="absolute left-8 top-8 z-30 flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white shadow-2xl border border-white/40"
          style={{
            background: a.numberBg,
            boxShadow: `0 0 20px ${a.buttonGlow}`,
          }}
        >
          {formattedIndex}
        </div>

        {/* Center Neon Graphic Box */}
        <div
          className="relative overflow-hidden rounded-2xl border border-white/10 flex items-center justify-center"
          style={{
            height: '210px',
            background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.9) 0%, rgba(5, 7, 20, 0.98) 100%)',
          }}
        >
          <img
            src={a.graphicSrc}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="eager"
            draggable={false}
          />
        </div>
      </div>

      {/* Card Content Details */}
      <div className="flex flex-col gap-3 p-6 pt-4">
        {/* Title */}
        <h3
          className="font-black text-white tracking-tight"
          style={{
            fontFamily: 'Space Grotesk, Outfit, system-ui, sans-serif',
            fontSize: '1.65rem',
            textShadow: `0 0 15px ${a.glow}`,
          }}
        >
          {title}
        </h3>

        {/* Badges Row */}
        <div className="flex items-center gap-2.5">
          <span
            className="text-caption rounded-full px-3.5 py-1 font-black uppercase text-xs tracking-wider"
            style={{
              background: a.badge,
              border: `1px solid ${a.badgeBorder}`,
              color: a.badgeText,
            }}
          >
            {questionCount} QUESTIONS
          </span>
          <span
            className="text-caption rounded-full px-3.5 py-1 font-black uppercase text-xs tracking-wider"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#94a3b8',
            }}
          >
            {difficulty}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm font-medium text-[#94a3b8] leading-relaxed">
          {description}
        </p>

        {/* High-Tech Bevelled Angled 3D Button */}
        <motion.button
          id={`${id}-cta`}
          className="relative mt-2 w-full flex items-center justify-center gap-2 font-black text-white uppercase tracking-wider transition-all"
          style={{
            height: '52px',
            background: a.buttonBg,
            clipPath: 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)',
            boxShadow: `0 8px 30px ${a.buttonGlow}`,
            fontSize: '15px',
          }}
          whileHover={{ scale: 1.02, filter: 'brightness(1.15)' }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          <span>START CHALLENGE</span>
          <ArrowRightIcon />
        </motion.button>
      </div>

      {/* Hover Neon Border Overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 2px ${a.borderStroke}, 0 0 60px ${a.glow}` }}
      />
    </motion.article>
  );
}
