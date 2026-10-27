'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Send,
  Clock,
  Sparkles,
  Award,
  Code2,
  Video,
  MessageSquare,
  AlertTriangle,
  StopCircle,
  Volume2,
  Languages,
  Radio,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import { AiAvatar } from '@/components/avatar/AiAvatar';
import { CandidateCam } from '@/components/camera/CandidateCam';
import { CodeWorkspace } from '@/components/coding/CodeWorkspace';
import { SpeechMetricsBadge } from '@/components/nlp/SpeechMetricsBadge';
import { SpeechMetrics } from '@/lib/nlp/speech-analyzer';

export default function InterviewRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: interviewId } = use(params);

  // Interview state
  const [interview, setInterview] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Time & Pacing state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1800); // 30 mins default
  const [timerActive, setTimerActive] = useState(true);

  // Media & Interaction states
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [candidateInput, setCandidateInput] = useState('');
  const [lastMetrics, setLastMetrics] = useState<SpeechMetrics | null>(null);
  const [turnStartTime, setTurnStartTime] = useState<number>(Date.now());

  // Hands-Free Two-Way Live Conversation state
  const [isTwoWayMode, setIsTwoWayMode] = useState(true);
  const [hasStartedCall, setHasStartedCall] = useState(false);
  const [autoSendingCountdown, setAutoSendingCountdown] = useState<number | null>(null);

  // Synchronized refs to avoid stale closures in Web Speech callbacks
  const isTwoWayModeRef = useRef(isTwoWayMode);
  isTwoWayModeRef.current = isTwoWayMode;

  const isAiSpeakingRef = useRef(isAiSpeaking);
  isAiSpeakingRef.current = isAiSpeaking;

  const isAiThinkingRef = useRef(isAiThinking);
  isAiThinkingRef.current = isAiThinking;

  const isSubmittingRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any | null>(null);

  // Coding Workspace State
  const [activeTab, setActiveTab] = useState<'video' | 'coding'>('video');
  const [codingChallenge, setCodingChallenge] = useState<any | null>(null);

  // Voice & Speech synthesis state
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Helper to prioritize natural Indian English voices
  const findIndianVoice = (voiceList: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    if (!voiceList || voiceList.length === 0) return null;

    // 1. Natural / Neural Indian English (Microsoft Edge / Windows Online Natural)
    const naturalIndian = voiceList.find(
      v =>
        (v.lang.toLowerCase() === 'en-in' || v.lang.toLowerCase().replace('_', '-') === 'en-in' || v.name.toLowerCase().includes('india')) &&
        (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online'))
    );
    if (naturalIndian) return naturalIndian;

    // 2. Renowned Indian Voice names: Neerja, Prabhat, Heera, Ravi
    const namedIndian = voiceList.find(
      v =>
        v.name.toLowerCase().includes('neerja') ||
        v.name.toLowerCase().includes('prabhat') ||
        v.name.toLowerCase().includes('heera') ||
        v.name.toLowerCase().includes('ravi')
    );
    if (namedIndian) return namedIndian;

    // 3. Any English (India) voice (Google English India, etc.)
    const anyIndian = voiceList.find(
      v =>
        v.lang.toLowerCase() === 'en-in' ||
        v.lang.toLowerCase().replace('_', '-') === 'en-in' ||
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('hindi')
    );
    if (anyIndian) return anyIndian;

    // 4. Fallback to any Natural English voice
    return (
      voiceList.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Online'))) ||
      voiceList.find(v => v.lang.startsWith('en')) ||
      voiceList[0]
    );
  };

  // Cache browser voices and auto-select Indian English on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const populateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);
        const bestVoice = findIndianVoice(voices);
        if (bestVoice) {
          setSelectedVoice(bestVoice);
        }
      }
    };

    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // 1. Fetch Interview Data
  useEffect(() => {
    async function loadInterview() {
      try {
        const res = await fetch(`/api/interview/${interviewId}`);
        const data = await res.json();
        if (data.success) {
          setInterview(data.interview);
          setMessages(data.interview.messages || []);
          setSecondsRemaining((data.interview.targetDurationMinutes || 30) * 60);

          if (data.interview.codingSubmissions && data.interview.codingSubmissions.length > 0) {
            setCodingChallenge(data.interview.codingSubmissions[0]);
          }

          // If interview already has previous candidate turns, resume call directly
          if (data.interview.messages && data.interview.messages.length > 1) {
            setHasStartedCall(true);
          }
        }
      } catch (err) {
        console.error('Failed to load interview:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInterview();
  }, [interviewId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // 2. Timer Countdown Engine
  useEffect(() => {
    if (!timerActive || secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, secondsRemaining]);

  // Format seconds to MM:SS
  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 3. Browser Speech Synthesis with Human Indian English Accent & Pacing
  const cleanSpokenText = (raw: string): string => {
    return raw
      .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold
      .replace(/\*(.*?)\*/g, '$1')     // remove italics
      .replace(/`([^`]+)`/g, '$1')     // remove inline code ticks
      .replace(/```[\s\S]*?```/g, 'Here is a code snippet.') // summarize code blocks in speech
      .replace(/<think>[\s\S]*?<\/think>/gi, '') // strip any leftover reasoning tags
      .replace(/#+\s/g, '')            // remove headings
      .replace(/[-*•]\s+/g, '')        // remove bullet points
      .replace(/\s+/g, ' ')            // collapse extra whitespace
      .trim();
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any pending speech
    const cleaned = cleanSpokenText(text);
    if (!cleaned) return;

    // Abort speech recognition while AI is speaking so it doesn't transcribe its own voice
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }
    setIsRecording(false);

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = 'en-IN'; // Set Indian English locale
    utterance.rate = 0.94;    // Human conversational cadence (natural pacing, avoids robotic rush)
    utterance.pitch = 1.0;

    // Pick Indian voice
    const activeVoice = selectedVoice || findIndianVoice(window.speechSynthesis.getVoices());
    if (activeVoice) {
      utterance.voice = activeVoice;
    }

    utterance.onstart = () => {
      setIsAiSpeaking(true);
      isAiSpeakingRef.current = true;
      setIsAiThinking(false);
      isAiThinkingRef.current = false;
    };

    utterance.onend = () => {
      setIsAiSpeaking(false);
      isAiSpeakingRef.current = false;
      setTurnStartTime(Date.now()); // Mark start of candidate turn

      // TWO-WAY COMMUNICATION: When Ananya finishes speaking, immediately start listening to candidate!
      if (isTwoWayModeRef.current) {
        startSpeechRecognition();
      }
    };

    utterance.onerror = () => {
      setIsAiSpeaking(false);
      isAiSpeakingRef.current = false;
      if (isTwoWayModeRef.current) {
        startSpeechRecognition();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // 4. Two-Way Speech Recognition (STT): Catches words and auto-processes on conversational pause
  const startSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    if (isAiSpeakingRef.current || isAiThinkingRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English ASR

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + ' ';
        }
        const text = fullTranscript.trim();
        if (!text) return;

        setCandidateInput(text);

        // TWO-WAY COMMUNICATION: When user speaks, catch words and auto-process on conversational pause!
        if (isTwoWayModeRef.current) {
          // Clear any active silence timers on each new word
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }

          // If the candidate has spoken at least a few words (>= 6 chars), start the 2s pause countdown
          if (text.length >= 6) {
            let count = 2;
            setAutoSendingCountdown(count);

            countdownIntervalRef.current = setInterval(() => {
              count -= 1;
              if (count > 0) {
                setAutoSendingCountdown(count);
              } else {
                if (countdownIntervalRef.current) {
                  clearInterval(countdownIntervalRef.current);
                  countdownIntervalRef.current = null;
                }
              }
            }, 1000);

            silenceTimerRef.current = setTimeout(() => {
              setAutoSendingCountdown(null);
              handleSendTurnWithText(text);
            }, 2100); // 2.1-second natural conversational pause threshold
          }
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition warning:', err.error);
        if (err.error === 'not-allowed') {
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        // Auto-restart listening if two-way mode is active, AI is not speaking/thinking, and not currently submitting
        if (
          isTwoWayModeRef.current &&
          !isAiSpeakingRef.current &&
          !isAiThinkingRef.current &&
          !isSubmittingRef.current
        ) {
          try {
            recognition.start();
            setIsRecording(true);
          } catch {
            setIsRecording(false);
          }
        } else {
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
      setTurnStartTime(Date.now());
    } catch (err) {
      console.warn('Could not start speech recognition:', err);
      setIsRecording(false);
    }
  };

  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    if (isRecording) {
      // User manually stopped recording
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setAutoSendingCountdown(null);

      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      setIsRecording(false);
    } else {
      // User manually started recording
      startSpeechRecognition();
    }
  };

  // 5. Submit Candidate Turn to AI Interviewer
  const handleSendTurnWithText = async (overrideText?: string) => {
    const textToSend = (overrideText !== undefined ? overrideText : candidateInput).trim();
    if (!textToSend || isAiThinkingRef.current || isAiSpeakingRef.current) return;

    // Clear timers & countdown
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setAutoSendingCountdown(null);

    // Stop recognition while submitting so voice isn't re-transcribed
    isSubmittingRef.current = true;
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }
    setIsRecording(false);

    const durationSeconds = Math.max(5, Math.round((Date.now() - turnStartTime) / 1000));
    const remainingMins = Math.round(secondsRemaining / 60);

    // Optimistically update UI
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      sender: 'candidate',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setCandidateInput('');
    setIsAiThinking(true);
    isAiThinkingRef.current = true;

    try {
      const res = await fetch(`/api/interview/${interviewId}/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateTranscript: textToSend,
          durationSeconds,
          remainingMinutes: remainingMins,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit response.');
      }

      // Update metrics
      if (data.candidateMetrics) {
        setLastMetrics(data.candidateMetrics);
      }

      // Update Coding challenge if initiated
      if (data.codingChallenge) {
        setCodingChallenge(data.codingChallenge);
        setActiveTab('coding'); // Auto switch to coding editor when problem arrives!
      }

      // Add Agent Message and speak aloud (triggering the two-way loop)
      if (data.agentMessage) {
        setMessages(prev => [...prev, data.agentMessage]);
        speakText(data.agentMessage.content);
      }
    } catch (err) {
      console.error('Error submitting turn:', err);
      setIsAiThinking(false);
      isAiThinkingRef.current = false;
      if (isTwoWayModeRef.current) {
        startSpeechRecognition();
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  // User Join / Start Live Video Call
  const handleStartCall = () => {
    setHasStartedCall(true);
    const firstMsg = messages.find(m => m.sender === 'agent')?.content || interview?.messages?.[0]?.content;
    if (firstMsg) {
      speakText(firstMsg);
    } else {
      startSpeechRecognition();
    }
  };

  // 6. Finish Interview & View Report
  const handleFinishInterview = async () => {
    setTimerActive(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    try {
      const res = await fetch(`/api/interview/${interviewId}/evaluate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        router.push(`/report/${interviewId}`);
      }
    } catch {
      router.push(`/report/${interviewId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <Sparkles className="w-5 h-5 text-blue-500 animate-spin" />
          <span>Setting up secure interview session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-3 sm:px-6 py-4 w-full overflow-hidden">
      {/* Top Session Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            {interview?.roleTitle}
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            {interview?.experienceLevel} Level •{' '}
            {interview?.llmProvider === 'antigravity' || interview?.llmProvider === 'local'
              ? 'Antigravity AI Sub-Agent Assigned'
              : interview?.llmProvider === 'ollama'
              ? `Ollama Local (${interview?.llmModel || 'llama3.2'})`
              : `Multi-LLM BYOK (${interview?.llmProvider?.toUpperCase()})`}
          </span>
        </div>

        {/* View Switcher Tabs (Video Conference vs Live Code Editor) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'video' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Call</span>
          </button>

          <button
            onClick={() => setActiveTab('coding')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'coding' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Live Code Editor</span>
            {codingChallenge && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
          </button>
        </div>

        {/* Voice Selector, Timer & Finish Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Indian English Voice Selector */}
          {availableVoices.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-sm" title="Accent: Indian English (en-IN)">🇮🇳</span>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const found = availableVoices.find(v => v.name === e.target.value);
                  if (found) {
                    setSelectedVoice(found);
                    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                      const previewName = found.name.split('-')[0].replace(/Microsoft|Online|Natural|Google/gi, '').trim() || found.name;
                      const testUtterance = new SpeechSynthesisUtterance(`Hello! Voice set to ${previewName}.`);
                      testUtterance.voice = found;
                      testUtterance.rate = 0.94;
                      testUtterance.lang = 'en-IN';
                      window.speechSynthesis.speak(testUtterance);
                    }
                  }
                }}
                className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer max-w-[120px] md:max-w-[160px] truncate"
                title="Select Interviewer Voice (Prioritizing Indian English • en-IN)"
              >
                {availableVoices.map((v) => (
                  <option key={v.name} value={v.name} className="bg-slate-900 text-white">
                    {v.lang.toLowerCase().includes('in') || v.name.toLowerCase().includes('india') ? `🇮🇳 ${v.name}` : v.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              secondsRemaining < 300
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={handleFinishInterview}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-md shadow-rose-600/20"
          >
            <StopCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">End & Evaluate</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 py-3 overflow-hidden min-h-0">
        {/* Left Column: Video Room or Coding Workspace (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3 h-full overflow-hidden">
          {activeTab === 'video' ? (
            /* Split Screen Video Call: AI Avatar on Left + Candidate WebCam on Right */
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0">
              <AiAvatar
                isSpeaking={isAiSpeaking}
                isThinking={isAiThinking}
                interviewerName={
                  interview?.llmProvider === 'antigravity' || interview?.llmProvider === 'local'
                    ? 'Ananya (Antigravity AI Sub-Agent • en-IN)'
                    : interview?.llmProvider === 'ollama'
                    ? `Ananya (Ollama • ${interview?.llmModel || 'Local Model'} • en-IN)`
                    : `Ananya (${interview?.llmProvider?.toUpperCase()} • BYOK • en-IN)`
                }
              />
              <CandidateCam candidateName="You (Candidate)" isRecording={isRecording} />

              {/* Initial Call Connect Overlay */}
              {!hasStartedCall && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md rounded-2xl p-6 text-center border border-slate-800">
                  <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mb-4 text-blue-400 animate-pulse shadow-lg shadow-blue-500/20">
                    <PhoneCall className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1.5">Live Two-Way Video Call Ready</h3>
                  <p className="text-xs text-slate-300 max-w-md mb-5 leading-relaxed">
                    Lead Technical Interviewer <strong className="text-blue-400">Ananya</strong> is online.
                    Two-way conversational audio is enabled. When you speak, the application will catch your words and process them dynamically.
                  </p>
                  <button
                    onClick={handleStartCall}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2.5 shadow-xl shadow-blue-500/25 transition-all transform hover:scale-105 active:scale-95"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Join Video Call & Start Speaking</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Coding Profile Workspace */
            <div className="flex-1 min-h-0">
              <CodeWorkspace
                interviewId={interviewId}
                problemTitle={codingChallenge?.problemTitle || 'Live Technical Coding Challenge'}
                problemStatement={
                  codingChallenge?.problemStatement ||
                  'The interviewer will assign a coding problem tailored to your JD and experience level during this round.'
                }
                starterCode={codingChallenge?.starterCode}
                expectedLanguage={codingChallenge?.language || 'javascript'}
                testCases={codingChallenge?.testResults || []}
              />
            </div>
          )}

          {/* Bottom Bar: Real-time NLP Metrics & Speech Input */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            {/* Live NLP Metrics Badges & 2-Way Mode Status */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SpeechMetricsBadge metrics={lastMetrics} />

              <div className="flex items-center gap-2">
                {/* Two-Way Mode Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setIsTwoWayMode(prev => {
                      const next = !prev;
                      if (!next) {
                        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                        setAutoSendingCountdown(null);
                      } else {
                        if (!isAiSpeakingRef.current && !isAiThinkingRef.current) {
                          startSpeechRecognition();
                        }
                      }
                      return next;
                    });
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    isTwoWayMode
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Hands-Free Two-Way Live Conversation"
                >
                  <Radio className={`w-3.5 h-3.5 ${isTwoWayMode ? 'animate-pulse text-emerald-400' : ''}`} />
                  <span>{isTwoWayMode ? 'Hands-Free 2-Way: Active' : 'Manual Push-to-Talk'}</span>
                </button>

                {/* Conversation State Indicators */}
                {isAiSpeaking ? (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                    <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Ananya is speaking...
                  </span>
                ) : isAiThinking ? (
                  <span className="text-[11px] text-purple-400 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" /> Ananya analyzing response...
                  </span>
                ) : isRecording ? (
                  <span className="text-[11px] text-rose-400 flex items-center gap-1 font-medium animate-pulse">
                    <Mic className="w-3.5 h-3.5" /> Listening to you...
                  </span>
                ) : null}
              </div>
            </div>

            {/* Auto-submission Countdown Bar */}
            {autoSendingCountdown !== null && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 rounded-xl text-xs text-blue-200 animate-pulse">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Answer captured. Sending to Ananya in <strong>{autoSendingCountdown}s</strong>...</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendTurnWithText()}
                    className="px-2.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors"
                  >
                    Send Now
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                      setAutoSendingCountdown(null);
                    }}
                    className="text-[11px] text-slate-300 hover:text-white underline cursor-pointer"
                  >
                    Keep Speaking
                  </button>
                </div>
              </div>
            )}

            {/* Answer Input Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-3 rounded-xl font-medium text-xs flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
                title={isRecording ? 'Mute / Stop Mic' : 'Start Speaking (Mic)'}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-blue-400" />}
              </button>

              <input
                type="text"
                value={candidateInput}
                onChange={e => setCandidateInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendTurnWithText()}
                placeholder={
                  isRecording
                    ? 'Listening live... speak your answer'
                    : isTwoWayMode
                    ? 'Hands-free 2-way mode active (starts listening when interviewer finishes speaking)'
                    : 'Type or click mic to speak...'
                }
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() => handleSendTurnWithText()}
                disabled={!candidateInput.trim() || isAiThinking}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20 shrink-0"
              >
                {isAiThinking ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Send Turn</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interview Transcript History (4 cols) */}
        <div className="lg:col-span-4 flex flex-col h-full rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Live Transcript
            </span>
            <span className="text-[11px] text-slate-400">{messages.length} messages</span>
          </div>

          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`p-3 rounded-xl text-xs leading-relaxed ${
                  msg.sender === 'agent'
                    ? 'bg-blue-950/40 border border-blue-500/20 text-slate-200'
                    : msg.sender === 'system'
                    ? 'bg-purple-950/30 border border-purple-500/20 text-purple-200 italic'
                    : 'bg-slate-950 border border-slate-800 text-slate-100 ml-4'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-semibold uppercase">
                  <span>{msg.sender === 'agent' ? 'Ananya (AI Interviewer • en-IN)' : msg.sender === 'system' ? 'System' : 'You'}</span>
                  <div className="flex items-center gap-1.5">
                    {msg.sender === 'agent' && (
                      <button
                        type="button"
                        onClick={() => speakText(msg.content)}
                        className="text-blue-400 hover:text-blue-300 p-0.5 rounded transition-colors"
                        title="Replay Voice (en-IN)"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
