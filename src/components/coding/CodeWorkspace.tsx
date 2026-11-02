'use client';

import React, { useState } from 'react';
import { Code2, Play, CheckCircle2, XCircle, Sparkles, Terminal, FileCode } from 'lucide-react';

interface CodeWorkspaceProps {
  interviewId: string;
  problemTitle: string;
  problemStatement: string;
  starterCode?: string;
  expectedLanguage?: string;
  testCases?: Array<{ input: string; expectedOutput: string }>;
  onCodeEvaluated?: (evaluation: any) => void;
}

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({
  interviewId,
  problemTitle,
  problemStatement,
  starterCode = '// Write your solution here\n\nfunction solve() {\n  \n}\n',
  expectedLanguage = 'javascript',
  testCases = [],
  onCodeEvaluated,
}) => {
  const [code, setCode] = useState(starterCode);
  const [language, setLanguage] = useState(expectedLanguage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState<any | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setEvalResult(null);

    try {
      const res = await fetch(`/api/interview/${interviewId}/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEvalResult(data.evaluation);
        if (onCodeEvaluated) {
          onCodeEvaluated(data.evaluation);
        }
      }
    } catch (err) {
      console.error('Failed to submit code:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2 max-w-full truncate">
          <Code2 className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400 shrink-0" />
          <h3 className="text-xs sm:text-sm font-semibold text-slate-100 truncate">{problemTitle}</h3>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python 3</option>
          </select>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shadow-md shrink-0"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Evaluating...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Submit Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden min-h-[300px] sm:min-h-[420px]">
        {/* Left Column: Problem & Examples (5 cols) */}
        <div className="lg:col-span-5 p-3 sm:p-4 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-y-auto max-h-[190px] sm:max-h-[240px] lg:max-h-none space-y-3 sm:space-y-4 bg-slate-900/40">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Problem Description</h4>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{problemStatement}</p>
          </div>

          {testCases && testCases.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Example Test Cases</h4>
              {testCases.map((tc, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                  <div className="text-slate-400">Input: <span className="text-slate-200">{tc.input}</span></div>
                  <div className="text-slate-400 mt-1">Output: <span className="text-emerald-400">{tc.expectedOutput}</span></div>
                </div>
              ))}
            </div>
          )}

          {/* Evaluation Results Banner */}
          {evalResult && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-blue-500/40 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" /> Assessment Score
                </span>
                <span className={`text-sm font-bold ${evalResult.score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {evalResult.score} / 100
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-normal whitespace-pre-wrap">{evalResult.feedback}</p>

              {evalResult.testResults && (
                <div className="space-y-1 pt-1">
                  {evalResult.testResults.map((tr: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                      {tr.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                      <span>{tr.note}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Code Editor (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-950">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 text-[11px] text-slate-400">
            <FileCode className="w-3.5 h-3.5 text-slate-400" />
            <span>solution.{language === 'python' ? 'py' : language === 'typescript' ? 'ts' : 'js'}</span>
          </div>

          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full p-4 bg-slate-950 font-mono text-xs text-emerald-300 focus:outline-none resize-none leading-relaxed selection:bg-blue-600/30"
            placeholder="// Type or paste your code here..."
            onKeyDown={e => {
              // Enable Tab key indentation
              if (e.key === 'Tab') {
                e.preventDefault();
                const start = e.currentTarget.selectionStart;
                const end = e.currentTarget.selectionEnd;
                setCode(code.substring(0, start) + '  ' + code.substring(end));
                setTimeout(() => {
                  e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
                }, 0);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
