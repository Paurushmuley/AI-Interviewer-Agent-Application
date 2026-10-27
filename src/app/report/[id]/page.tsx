'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Code2,
  Clock,
  ArrowLeft,
  Share2,
  Download,
  Sparkles,
  BarChart3,
  Terminal,
  ShieldCheck,
} from 'lucide-react';

export default function InterviewReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: interviewId } = use(params);
  const [interview, setInterview] = useState<any | null>(null);
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await fetch(`/api/interview/${interviewId}`);
        const data = await res.json();
        if (data.success) {
          setInterview(data.interview);
          if (data.interview.evaluation) {
            setReport(data.interview.evaluation);
          } else {
            // Trigger evaluation calculation if not yet generated
            const evalRes = await fetch(`/api/interview/${interviewId}/evaluate`, { method: 'POST' });
            const evalData = await evalRes.json();
            if (evalData.success) {
              setReport(evalData.report);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load evaluation report:', err);
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <Sparkles className="w-5 h-5 text-blue-500 animate-spin" />
          <span>Generating multi-dimensional evaluation report...</span>
        </div>
      </div>
    );
  }

  const overall = report?.overallScore || 78;
  const technical = report?.technicalScore || 80;
  const coding = report?.codingScore || 82;
  const comms = report?.communicationScore || 75;
  const confidence = report?.confidenceScore || 85;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Account Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            Interview Performance Report
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{interview?.roleTitle}</h1>
          <p className="text-xs text-slate-400">
            {interview?.experienceLevel} Level • Practiced on {new Date(interview?.createdAt).toLocaleDateString()} • Multi-LLM BYOK ({interview?.llmProvider?.toUpperCase()})
          </p>
        </div>

        {/* Big Overall Score Circle */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-950 border-4 border-blue-500/40 flex flex-col items-center justify-center shadow-lg shadow-blue-500/10">
            <span className="text-3xl sm:text-4xl font-black text-white">{overall}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Overall / 100</span>
          </div>
        </div>
      </div>

      {/* 4-Column Score Breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-blue-400" /> Technical Depth
          </span>
          <div className="text-2xl font-bold text-white">{technical}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${technical}%` }} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-purple-400" /> Live Coding
          </span>
          <div className="text-2xl font-bold text-purple-300">{coding}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${coding}%` }} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Speech & Comms
          </span>
          <div className="text-2xl font-bold text-emerald-400">{comms}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${comms}%` }} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Delivery Confidence
          </span>
          <div className="text-2xl font-bold text-amber-300">{confidence}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${confidence}%` }} />
          </div>
        </div>
      </div>

      {/* Speech & Vocabulary Repetition Analytics */}
      {report?.categoryScores?.speechAnalytics && (
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Verbal Delivery & Vocabulary Repetition Analytics
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Spoken Turn NLP Analysis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lexical Diversity */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
              <span className="text-xs text-slate-400 font-medium">Lexical Diversity (Type-Token Ratio)</span>
              <div className="text-2xl font-bold text-blue-400">
                {report.categoryScores.speechAnalytics.lexicalDiversityPercent}%
              </div>
              <p className="text-[11px] text-slate-400">
                {report.categoryScores.speechAnalytics.lexicalDiversityPercent >= 50
                  ? 'Strong vocabulary range with varied technical terms.'
                  : 'Noticeable vocabulary repetition. Practice substituting common words.'}
              </p>
            </div>

            {/* Speaking Pace & Cadence */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
              <span className="text-xs text-slate-400 font-medium">Average Spoken Tempo</span>
              <div className="text-2xl font-bold text-emerald-400">
                {report.categoryScores.speechAnalytics.avgWpm} <span className="text-sm font-normal text-slate-400">WPM</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {report.categoryScores.speechAnalytics.avgWpm >= 115 && report.categoryScores.speechAnalytics.avgWpm <= 165
                  ? 'Optimal conversational pace for clear video communication.'
                  : report.categoryScores.speechAnalytics.avgWpm < 115
                  ? 'Pacing was deliberate or hesitant. Practice continuous flow.'
                  : 'Fast cadence. Slow down slightly to emphasize key points.'}
              </p>
            </div>

            {/* Total Fillers */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
              <span className="text-xs text-slate-400 font-medium">Recorded Filler Words</span>
              <div className="text-2xl font-bold text-amber-400">
                {report.categoryScores.speechAnalytics.totalFillers}
              </div>
              <p className="text-[11px] text-slate-400">
                {report.categoryScores.speechAnalytics.totalFillers <= 3
                  ? 'Excellent verbal clarity with minimal speech fillers.'
                  : 'Moderate filler usage. Pause intentionally instead of using crutch words.'}
              </p>
            </div>
          </div>

          {/* Repetition Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Top Repeated Words */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Most Frequently Repeated Terms:</span>
              <div className="flex flex-wrap gap-1.5">
                {report.categoryScores.speechAnalytics.topRepeatedWords?.length > 0 ? (
                  report.categoryScores.speechAnalytics.topRepeatedWords.map((item: any) => (
                    <span
                      key={item.word}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono"
                    >
                      {item.word} <strong className="text-blue-400 font-bold">({item.count}x)</strong>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No excessive term repetition detected.</span>
                )}
              </div>
            </div>

            {/* Crutch Words */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Conversational Crutch Words:</span>
              <div className="flex flex-wrap gap-1.5">
                {report.categoryScores.speechAnalytics.crutchWordsFrequency?.length > 0 ? (
                  report.categoryScores.speechAnalytics.crutchWordsFrequency.map((item: any) => (
                    <span
                      key={item.word}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono"
                    >
                      "{item.word}" <strong className="text-rose-400 font-bold">({item.count}x)</strong>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-400/90 italic">Zero conversational crutch words recorded.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strengths & Improvements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Demonstrated Strengths</h3>
          </div>
          <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
            {report?.strengths}
          </p>
        </div>

        {/* Priority Improvements */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Priority Growth Areas</h3>
          </div>
          <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
            {report?.improvements}
          </p>
        </div>
      </div>

      {/* Detailed Evaluator Summary */}
      <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Evaluator Synthesis</h3>
        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{report?.detailedFeedback}</p>
      </div>

      {/* Live Coding Challenge Submissions Review */}
      {interview?.codingSubmissions && interview.codingSubmissions.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400">
              <Terminal className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Live Coding Assessment Review</h3>
            </div>
            <span className="text-xs font-bold text-emerald-400">
              Score: {interview.codingSubmissions[0].score}/100
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200">
              Problem: {interview.codingSubmissions[0].problemTitle}
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400/90 overflow-x-auto">
              <pre>{interview.codingSubmissions[0].submittedCode}</pre>
            </div>
            {interview.codingSubmissions[0].feedback && (
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {interview.codingSubmissions[0].feedback}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Full Transcript Review */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Question-by-Question Transcript</h3>
          <span className="text-xs text-slate-400">{interview?.messages?.length || 0} total turns</span>
        </div>

        <div className="space-y-3">
          {interview?.messages?.map((msg: any, i: number) => (
            <div
              key={msg.id || i}
              className={`p-4 rounded-xl text-xs space-y-1.5 ${
                msg.sender === 'agent'
                  ? 'bg-blue-950/20 border border-blue-500/20 text-slate-200'
                  : msg.sender === 'system'
                  ? 'bg-purple-950/20 border border-purple-500/20 text-purple-200'
                  : 'bg-slate-950 border border-slate-800 text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>{msg.sender === 'agent' ? 'AI Interviewer' : msg.sender === 'system' ? 'System Event' : 'Candidate'}</span>
                {msg.nlpMetrics && (
                  <span className="text-blue-400 font-normal">
                    {msg.nlpMetrics.estimatedWpm} WPM • {msg.nlpMetrics.fillerWordsCount} fillers • {msg.nlpMetrics.confidenceScore}% confidence
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
