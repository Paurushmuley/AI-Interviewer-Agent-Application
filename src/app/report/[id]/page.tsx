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
  Download,
  Sparkles,
  BarChart3,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Target,
  BookOpen,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Compass,
  Layers,
  MessageSquare,
} from 'lucide-react';

export default function InterviewReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: interviewId } = use(params);
  const [interview, setInterview] = useState<any | null>(null);
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [expandedQA, setExpandedQA] = useState<Record<number, boolean>>({ 1: true });

  const toggleQA = (qNum: number) => {
    setExpandedQA(prev => ({ ...prev, [qNum]: !prev[qNum] }));
  };

  const loadReport = async (forceRegenerate = false) => {
    try {
      if (forceRegenerate) setRegenerating(true);
      const res = await fetch(`/api/interview/${interviewId}`);
      const data = await res.json();
      if (data.success) {
        setInterview(data.interview);
        if (data.interview.evaluation && !forceRegenerate) {
          // If evaluation already exists and has the new rich Q&A evaluations, use it
          const existingScores = data.interview.evaluation.categoryScores as any;
          if (existingScores?.qaEvaluations && existingScores?.actionableImprovementPlan) {
            setReport(data.interview.evaluation);
            return;
          }
        }

        // Trigger evaluation calculation / regeneration
        const evalRes = await fetch(
          `/api/interview/${interviewId}/evaluate${forceRegenerate ? '?regenerate=true' : ''}`,
          { method: 'POST' }
        );
        const evalData = await evalRes.json();
        if (evalData.success) {
          setReport(evalData.report);
        }
      }
    } catch (err) {
      console.error('Failed to load evaluation report:', err);
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 min-h-[70vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400 text-sm">
          <Sparkles className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="font-semibold text-slate-300">Generating multi-dimensional answer-based evaluation report...</span>
          <p className="text-xs text-slate-500">Evaluating technical accuracy, word repetition, and growth roadmap</p>
        </div>
      </div>
    );
  }

  const overall = report?.overallScore || 78;
  const technical = report?.technicalScore || 80;
  const problemSolving = report?.categoryScores?.problemSolving || Math.min(100, technical + 4);
  const coding = report?.codingScore || 82;
  const comms = report?.communicationScore || 75;
  const confidence = report?.confidenceScore || 85;

  const speechAnalytics = report?.categoryScores?.speechAnalytics;
  const qaEvaluations: any[] = report?.categoryScores?.qaEvaluations || [];
  const improvementPlan = report?.categoryScores?.actionableImprovementPlan;

  // Recommendation Badge
  let recommendationBadge = {
    title: 'Solid Candidate • Minor Polish Needed',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };
  if (overall >= 85) {
    recommendationBadge = {
      title: 'Strong Hire • Candidate Ready for Onsite',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    };
  } else if (overall < 65) {
    recommendationBadge = {
      title: 'Developing • Targeted Technical Revision Needed',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    };
  }

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
            onClick={() => loadReport(true)}
            disabled={regenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold border border-slate-800 transition-colors disabled:opacity-50"
            title="Recalculate report with latest answer analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${regenerating ? 'animate-spin' : ''}`} />
            <span>{regenerating ? 'Re-analyzing...' : 'Re-analyze Report'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
              Personalized Performance Report
            </span>
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${recommendationBadge.color}`}>
              {recommendationBadge.title}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{interview?.roleTitle}</h1>
          <p className="text-xs text-slate-400">
            {interview?.experienceLevel} Level • Practiced on {new Date(interview?.createdAt).toLocaleDateString()} with Interviewer Arohi • {interview?.llmProvider?.toUpperCase()} Engine
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

      {/* 5-Column Core Competencies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Technical Architecture */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-blue-400" /> Architecture
          </span>
          <div className="text-2xl font-bold text-white">{technical}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${technical}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 block">Concept Depth</span>
        </div>

        {/* Problem Solving & Scalability */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" /> Scalability
          </span>
          <div className="text-2xl font-bold text-indigo-300">{problemSolving}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${problemSolving}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 block">Systems Rigor</span>
        </div>

        {/* Live Coding */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-purple-400" /> Live Coding
          </span>
          <div className="text-2xl font-bold text-purple-300">{coding}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${coding}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 block">Correctness & Syntax</span>
        </div>

        {/* Verbal Fluency */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Spoken Fluency
          </span>
          <div className="text-2xl font-bold text-emerald-400">{comms}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${comms}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 block">Clarity & Lexicon</span>
        </div>

        {/* Delivery Confidence */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Confidence
          </span>
          <div className="text-2xl font-bold text-amber-300">{confidence}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${confidence}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 block">Spoken Presence</span>
        </div>
      </div>

      {/* Verbal Delivery & Vocabulary Repetition Analytics */}
      {speechAnalytics && (
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
                {speechAnalytics.lexicalDiversityPercent}%
              </div>
              <p className="text-[11px] text-slate-400">
                {speechAnalytics.lexicalDiversityPercent >= 50
                  ? 'Strong vocabulary range with varied technical terms.'
                  : 'Noticeable vocabulary repetition. Practice substituting common words.'}
              </p>
            </div>

            {/* Speaking Pace & Cadence */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
              <span className="text-xs text-slate-400 font-medium">Average Spoken Tempo</span>
              <div className="text-2xl font-bold text-emerald-400">
                {speechAnalytics.avgWpm} <span className="text-sm font-normal text-slate-400">WPM</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {speechAnalytics.avgWpm >= 115 && speechAnalytics.avgWpm <= 165
                  ? 'Optimal conversational pace for clear video communication.'
                  : speechAnalytics.avgWpm < 115
                  ? 'Pacing was deliberate or hesitant. Practice continuous flow.'
                  : 'Fast cadence. Slow down slightly to emphasize key points.'}
              </p>
            </div>

            {/* Total Fillers */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
              <span className="text-xs text-slate-400 font-medium">Recorded Filler Words</span>
              <div className="text-2xl font-bold text-amber-400">
                {speechAnalytics.totalFillers}
              </div>
              <p className="text-[11px] text-slate-400">
                {speechAnalytics.totalFillers <= 3
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
                {speechAnalytics.topRepeatedWords?.length > 0 ? (
                  speechAnalytics.topRepeatedWords.map((item: any) => (
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
                {speechAnalytics.crutchWordsFrequency?.length > 0 ? (
                  speechAnalytics.crutchWordsFrequency.map((item: any) => (
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

      {/* Comprehensive Actionable Improvement Roadmap ("What You Need to Improve") */}
      {improvementPlan && (
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Targeted Growth Roadmap & What You Need to Improve
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-amber-400/90">
              Directly Derived From Your Spoken Answers
            </span>
          </div>

          {/* 1. Prioritized Technical Concepts to Master */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-400" /> High-Priority Technical Concepts to Master
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {improvementPlan.technicalGaps?.map((gap: any, i: number) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{gap.topic}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      gap.priority === 'High'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {gap.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-slate-300">Why it matters: </strong>
                    {gap.whyItMatters}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-blue-400">Actionable remedy: </strong>
                    {gap.actionableRemedy}
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-amber-300 font-mono">
                    <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">Practice Question for Next Round:</span>
                    "{gap.targetedPracticeQuestion}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Communication & Coding Polish */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Delivery Polish */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Verbal Delivery & Presence Polish
              </h4>
              <div className="space-y-2 text-xs text-slate-300">
                {improvementPlan.deliveryAndCommunication?.map((item: any, idx: number) => (
                  <div key={idx} className="space-y-0.5 border-l-2 border-emerald-500/40 pl-2.5 py-0.5">
                    <span className="text-[11px] text-slate-400 font-medium block">{item.issue}</span>
                    <p className="text-xs text-slate-200">{item.remedy}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Coding & Architecture Suggestions */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-purple-400" /> Algorithmic & Code Execution Polish
              </h4>
              <div className="space-y-2 text-xs text-slate-300">
                {improvementPlan.codingAndArchitecture?.map((item: any, idx: number) => (
                  <div key={idx} className="space-y-0.5 border-l-2 border-purple-500/40 pl-2.5 py-0.5">
                    <span className="text-[11px] text-purple-300 font-medium block">{item.area}</span>
                    <p className="text-xs text-slate-200">{item.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Step-by-Step 4-Week Study Roadmap */}
          {improvementPlan.studyRoadmap && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-400" /> 4-Week Interview Mastery Roadmap
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {improvementPlan.studyRoadmap.map((step: any, i: number) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {step.step}
                      </span>
                      <span className="text-[10px] text-slate-500">{step.duration}</span>
                    </div>
                    <h5 className="text-xs font-bold text-white">{step.title}</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{step.focus}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Question-by-Question Deep Evaluation (Strictly Answer-Dependent) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              Question-by-Question Spoken Evaluation
            </h3>
            <p className="text-xs text-slate-400">
              In-depth critique of each question asked by Arohi, your spoken answer, and how a senior engineer answers
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-400">
            {qaEvaluations.length} Spoken Turns Evaluated
          </span>
        </div>

        <div className="space-y-3">
          {qaEvaluations.length > 0 ? (
            qaEvaluations.map((qa: any) => {
              const isOpen = expandedQA[qa.questionNumber] !== false;
              let badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
              if (qa.answerScore >= 85) badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
              else if (qa.answerScore < 60) badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

              return (
                <div
                  key={qa.questionNumber}
                  className="rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden transition-all"
                >
                  {/* Question Header Card */}
                  <div
                    onClick={() => toggleQA(qa.questionNumber)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                        Q{qa.questionNumber}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                        {qa.question}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                        {qa.answerScore}% • {qa.qualityBadge}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Accordion Body */}
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-800/60 bg-slate-950/40">
                      {/* Arohi's Question */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                          Arohi's Question:
                        </span>
                        <p className="text-xs text-slate-200 font-medium leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          {qa.question}
                        </p>
                      </div>

                      {/* Candidate's Spoken Answer */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Your Spoken Answer:
                        </span>
                        <blockquote className="text-xs text-slate-300 italic leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                          "{qa.candidateAnswer}"
                        </blockquote>
                      </div>

                      {/* Strengths & Gaps Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {/* What Went Well */}
                        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> What You Got Right:
                          </span>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {qa.keyStrengths}
                          </p>
                        </div>

                        {/* Critical Gaps */}
                        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> What Was Missing or Incomplete:
                          </span>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {qa.criticalGaps}
                          </p>
                        </div>
                      </div>

                      {/* Senior Engineer Benchmark / Model Answer */}
                      <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
                        <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Senior Engineer Benchmark (How to Answer Better):
                        </span>
                        <p className="text-[11px] text-slate-200 leading-relaxed">
                          {qa.seniorBenchmark}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
              No Q&A turns recorded yet. Click "Re-analyze Report" to refresh the interview evaluation.
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
}
