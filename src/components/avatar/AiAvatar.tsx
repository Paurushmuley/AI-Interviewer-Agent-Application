'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bot, Volume2, Mic, Sparkles } from 'lucide-react';

interface AiAvatarProps {
  isSpeaking: boolean;
  isThinking: boolean;
  interviewerName?: string;
  avatarStyle?: 'futuristic' | 'executive';
}

export const AiAvatar: React.FC<AiAvatarProps> = ({
  isSpeaking,
  isThinking,
  interviewerName = 'Arohi (Lead Tech Interviewer • Indian Voice)',
}) => {
  const [mouthOpen, setMouthOpen] = useState(0); // 0 to 1
  const [blink, setBlink] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  // Lip-sync simulation during speech
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(0);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let angle = 0;
    const animateMouth = () => {
      angle += 0.2;
      // Realistic speech modulation using dual frequency wave
      const openness = Math.abs(Math.sin(angle) * 0.7 + Math.sin(angle * 2.3) * 0.3);
      setMouthOpen(openness);
      animFrameRef.current = requestAnimationFrame(animateMouth);
    };

    animFrameRef.current = requestAnimationFrame(animateMouth);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSpeaking]);

  // Natural eye blinking intervals
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3800);

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full min-h-[340px] bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-2xl border border-slate-800 p-6 overflow-hidden shadow-2xl">
      {/* Dynamic Background Glow */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
          isSpeaking
            ? 'opacity-40 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.35)_0%,transparent_70%)]'
            : isThinking
            ? 'opacity-40 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.35)_0%,transparent_70%)]'
            : 'opacity-10 bg-[radial-gradient(circle_at_center,rgba(100,116,139,0.2)_0%,transparent_70%)]'
        }`}
      />

      {/* Status Pill */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 backdrop-blur-md border border-slate-700/60 text-xs font-medium text-slate-200">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isSpeaking
              ? 'bg-emerald-400 animate-ping'
              : isThinking
              ? 'bg-purple-400 animate-pulse'
              : 'bg-blue-400'
          }`}
        />
        {isSpeaking ? (
          <span className="flex items-center gap-1.5 text-emerald-300">
            <Volume2 className="w-3.5 h-3.5" /> Speaking...
          </span>
        ) : isThinking ? (
          <span className="flex items-center gap-1.5 text-purple-300">
            <Sparkles className="w-3.5 h-3.5 animate-spin" /> Analyzing response...
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-slate-300">
            <Mic className="w-3.5 h-3.5" /> Listening to you
          </span>
        )}
      </div>

      {/* SVG AI Avatar Canvas with Lip & Eye Sync */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 my-auto flex items-center justify-center">
        {/* Animated Sound Wave Rings */}
        {isSpeaking && (
          <>
            <div className="absolute inset-0 rounded-full border border-blue-500/40 animate-ping opacity-30" />
            <div className="absolute -inset-4 rounded-full border border-indigo-500/20 animate-pulse duration-1000" />
          </>
        )}

        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>

          {/* Outer Cyber Frame */}
          <circle cx="100" cy="100" r="92" fill="none" stroke="url(#glowGrad)" strokeWidth="2.5" opacity="0.6" strokeDasharray="6 3" />
          <circle cx="100" cy="100" r="84" fill="url(#skinGrad)" />

          {/* Neck & Shoulders */}
          <path d="M 60 185 Q 100 160 140 185 L 155 200 L 45 200 Z" fill="#334155" opacity="0.7" />

          {/* Face Base */}
          <ellipse cx="100" cy="98" rx="44" ry="52" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

          {/* Eyes (With Natural Blinking) */}
          <g>
            {blink ? (
              <>
                <line x1="74" y1="90" x2="88" y2="90" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="112" y1="90" x2="126" y2="90" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                {/* Left Eye */}
                <ellipse cx="81" cy="90" rx="7" ry="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                <circle cx="81" cy="90" r="3" fill="#38bdf8" />
                <circle cx="82.5" cy="88.5" r="1.2" fill="#ffffff" />

                {/* Right Eye */}
                <ellipse cx="119" cy="90" rx="7" ry="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                <circle cx="119" cy="90" r="3" fill="#38bdf8" />
                <circle cx="120.5" cy="88.5" r="1.2" fill="#ffffff" />
              </>
            )}
          </g>

          {/* Eyebrows */}
          <path d="M 72 80 Q 81 77 89 80" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          <path d="M 111 80 Q 119 77 128 80" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />

          {/* Nose */}
          <path d="M 100 95 L 98 108 L 102 108" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />

          {/* Dynamic Lip-Movement (Mouth Open / Close Animation) */}
          {isSpeaking ? (
            <ellipse
              cx="100"
              cy={124 + mouthOpen * 2}
              rx={12 + mouthOpen * 4}
              ry={3 + mouthOpen * 9}
              fill="#090d16"
              stroke="#38bdf8"
              strokeWidth="2"
            />
          ) : (
            <path
              d="M 88 126 Q 100 131 112 126"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}

          {/* Tech Headset Accent */}
          <path d="M 52 95 Q 52 50 100 48 Q 148 50 148 95" fill="none" stroke="#64748b" strokeWidth="3" opacity="0.5" />
          <rect x="46" y="90" width="10" height="20" rx="4" fill="#3b82f6" />
          <rect x="144" y="90" width="10" height="20" rx="4" fill="#3b82f6" />
          <path d="M 50 108 Q 65 130 82 128" fill="none" stroke="#3b82f6" strokeWidth="2" />
          <circle cx="84" cy="128" r="3" fill="#60a5fa" />
        </svg>
      </div>

      {/* Name and Subtitle */}
      <div className="text-center z-10 mt-2">
        <h4 className="text-sm font-semibold text-slate-100 flex items-center justify-center gap-1.5">
          <Bot className="w-4 h-4 text-blue-400" />
          {interviewerName}
        </h4>
        <p className="text-xs text-slate-400 mt-0.5">AI Interview Specialist • Arohi Voice</p>
      </div>
    </div>
  );
};
