'use client';

import React from 'react';
import { Activity, Gauge, ShieldCheck, MessageSquare } from 'lucide-react';
import { SpeechMetrics } from '@/lib/nlp/speech-analyzer';

interface SpeechMetricsBadgeProps {
  metrics: SpeechMetrics | null;
}

export const SpeechMetricsBadge: React.FC<SpeechMetricsBadgeProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
        <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
        <span>NLP Speech Analyzer Ready</span>
      </div>
    );
  }

  const pacingColor =
    metrics.pacingQuality === 'optimal'
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      : metrics.pacingQuality === 'hesitant'
      ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
      : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Pacing / WPM */}
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${pacingColor}`}>
        <Gauge className="w-3.5 h-3.5" />
        <span>{metrics.estimatedWpm} WPM ({metrics.pacingQuality})</span>
      </div>

      {/* Confidence Score */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Confidence: {metrics.confidenceScore}%</span>
      </div>

      {/* Filler Words */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 text-xs font-medium">
        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
        <span>Fillers: {metrics.fillerWordsCount}</span>
        {metrics.fillerWordsFound.length > 0 && (
          <span className="text-[10px] text-slate-400">({metrics.fillerWordsFound.slice(0, 2).join(', ')})</span>
        )}
      </div>
    </div>
  );
};
