'use client';

import React from 'react';
import Link from 'next/link';

interface LogoIconProps {
  className?: string;
  size?: number | string;
  animate?: boolean;
}

/**
 * Pure SVG Brand Icon Mark for AI Interviewer:
 * Combines an intelligent cyber-squircle container with conversational sound waves,
 * central neural processing core, and synaptic connection arcs.
 */
export const LogoIcon: React.FC<LogoIconProps> = ({
  className = '',
  size = 36,
  animate = true,
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      style={{ width: pixelSize, height: pixelSize }}
      className={`relative shrink-0 flex items-center justify-center ${className}`}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md select-none transition-transform duration-300"
      >
        <defs>
          {/* Background Gradient */}
          <linearGradient id="aiLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#0b1120" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Border Metallic Aurora Gradient */}
          <linearGradient id="aiLogoBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="45%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          {/* Core Electric Indigo Gradient */}
          <linearGradient id="aiLogoCore" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          {/* Cyan Speech Accent Gradient */}
          <linearGradient id="aiLogoCyan" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          {/* Ambient Lighting Aura */}
          <radialGradient id="aiLogoAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#6366f1" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>

          {/* Luminescent Filter */}
          <filter id="aiCoreGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Squircle Container with Aurora Edge */}
        <rect
          x="2.5"
          y="2.5"
          width="59"
          height="59"
          rx="16"
          fill="url(#aiLogoBg)"
          stroke="url(#aiLogoBorder)"
          strokeWidth="2.5"
        />

        {/* Ambient Center Aura */}
        <circle cx="32" cy="32" r="21" fill="url(#aiLogoAura)" />

        {/* Halo Arc representing Headset / Live Audio Connection */}
        <path
          d="M18 34C18 24.0589 24.268 16 32 16C39.732 16 46 24.0589 46 34"
          stroke="url(#aiLogoCore)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="1 3.5"
          opacity="0.6"
        />

        {/* Left Speech Sound Waves (Candidate Voice NLP) */}
        <rect
          x="16.5"
          y="27"
          width="3.2"
          height="10"
          rx="1.6"
          fill="url(#aiLogoCyan)"
          opacity="0.85"
          className={animate ? 'animate-pulse' : ''}
          style={{ animationDuration: '2.4s' }}
        />
        <rect
          x="22.5"
          y="21.5"
          width="3.6"
          height="21"
          rx="1.8"
          fill="url(#aiLogoCyan)"
          className={animate ? 'animate-pulse' : ''}
          style={{ animationDuration: '1.8s' }}
        />

        {/* Center Neural Processing Core (Arohi / LLM Intelligence) */}
        <rect
          x="28.8"
          y="14.5"
          width="6.4"
          height="35"
          rx="3.2"
          fill="url(#aiLogoCore)"
          filter="url(#aiCoreGlow)"
        />

        {/* Optical Sparkle Diamond at Center */}
        <path
          d="M32 26L34.5 32L32 38L29.5 32Z"
          fill="#ffffff"
          opacity="0.95"
        />

        {/* Right Voice Sound Waves (AI Interviewer Voice TTS) */}
        <rect
          x="38"
          y="21.5"
          width="3.6"
          height="21"
          rx="1.8"
          fill="url(#aiLogoCore)"
          className={animate ? 'animate-pulse' : ''}
          style={{ animationDuration: '1.9s' }}
        />
        <rect
          x="44.5"
          y="27"
          width="3.2"
          height="10"
          rx="1.6"
          fill="url(#aiLogoCore)"
          opacity="0.85"
          className={animate ? 'animate-pulse' : ''}
          style={{ animationDuration: '2.5s' }}
        />

        {/* Synaptic Foundation Arc (Connecting Speech to Insights) */}
        <path
          d="M20 45C23.5 48 27.5 49.5 32 49.5C36.5 49.5 40.5 48 44 45"
          stroke="url(#aiLogoBorder)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Synaptic Data Nodes */}
        <circle cx="20" cy="45" r="2" fill="#38bdf8" />
        <circle cx="44" cy="45" r="2" fill="#c084fc" />
        <circle cx="32" cy="49.5" r="2.25" fill="#ffffff" filter="url(#aiCoreGlow)" />

        {/* Corner Intelligence Spark */}
        <path
          d="M49 11V17M46 14H52"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    </div>
  );
};

interface LogoProps {
  href?: string;
  className?: string;
  iconSize?: number;
  showSubtitle?: boolean;
  subtitleText?: string;
}

/**
 * Full Brand Logo component with LogoIcon + styled typography.
 */
export const Logo: React.FC<LogoProps> = ({
  href = '/',
  className = '',
  iconSize = 36,
  showSubtitle = true,
  subtitleText = 'NLP + LLM Platform',
}) => {
  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      <div className="relative transition-transform duration-300 group-hover:scale-105">
        <LogoIcon size={iconSize} />
        {/* Subtle background glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />
      </div>

      <div className="flex flex-col">
        <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-blue-200 transition-colors">
          AI Interviewer
        </span>
        {showSubtitle && (
          <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase -mt-0.5 hidden min-[400px]:inline">
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
