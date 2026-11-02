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
import { LogoIcon } from '@/components/brand/Logo';

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

  // Workspace State (Video, Live Code, or Mobile Transcript)
  const [activeTab, setActiveTab] = useState<'video' | 'coding' | 'transcript'>('video');
  const [codingChallenge, setCodingChallenge] = useState<any | null>(null);

  // Voice & Speech synthesis state
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.12); // Natural, brisk human conversational tempo (upgraded from slow 0.94)
  const speechRateRef = useRef(speechRate);
  speechRateRef.current = speechRate;

  // Helper to prioritize Arohi as default Indian voice
  const findIndianVoice = (voiceList: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    if (!voiceList || voiceList.length === 0) return null;

    // 0. TOP PRIORITY: Arohi / Aarohi / आरोही (User's preferred default voice)
    const arohiVoice = voiceList.find(
      v =>
        v.name.includes('आरोही') ||
        v.name.toLowerCase().includes('arohi') ||
        v.name.toLowerCase().includes('aarohi')
    );
    if (arohiVoice) return arohiVoice;

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
    utterance.rate = speechRateRef.current; // Natural, brisk cadence (default 1.12x, eliminates sluggishness)
    utterance.pitch = 1.0;

    // Pick Indian voice (Arohi prioritized as default)
    const activeVoice = selectedVoice || findIndianVoice(window.speechSynthesis.getVoices());
    if (activeVoice) {
      utterance.voice = activeVoice;
      utterance.lang = activeVoice.lang || 'en-IN';
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

      // TWO-WAY COMMUNICATION: When Arohi finishes speaking, immediately start listening to candidate!
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

  // 6. Finish Interview & View Report with Instant Confirmation Tab
  const [showEndConfirmModal, setShowEndConfirmModal] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  // Trigger Confirmation Tab
  const requestEndInterview = () => {
    // Stop recognition while user is considering
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }
    setIsRecording(false);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setAutoSendingCountdown(null);
    setShowEndConfirmModal(true);
  };

  const cancelEndInterview = () => {
    setShowEndConfirmModal(false);
    // Resume listening if two-way mode is active
    if (isTwoWayModeRef.current && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
      startSpeechRecognition();
    }
  };

  // Immediate Conclude & Finalize Interview
  const confirmImmediateEndInterview = async () => {
    setShowEndConfirmModal(false);
    setIsEnding(true);
    setTimerActive(false);

    // Immediately stop speech synthesis & microphone
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }
    setIsRecording(false);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setAutoSendingCountdown(null);

    try {
      const res = await fetch(`/api/interview/${interviewId}/evaluate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        router.push(`/report/${interviewId}`);
      } else {
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
    <div className="flex-1 flex flex-col h-[calc(100dvh-4rem)] max-w-7xl mx-auto px-2 sm:px-6 py-2.5 sm:py-4 w-full overflow-hidden">
      {/* Top Session Bar (Optimized for Mobile & Desktop) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-800 gap-2.5 shrink-0">
        {/* Row 1: Branding, Role Badge & Mobile Action Controls */}
        <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 truncate">
            <LogoIcon size={26} />
            <span className="text-xs font-bold text-white uppercase tracking-wider px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 truncate max-w-[140px] sm:max-w-none">
              {interview?.roleTitle}
            </span>
            <span className="text-xs text-slate-400 hidden md:inline truncate max-w-[200px]">
              {interview?.experienceLevel} Level
            </span>
          </div>

          {/* Mobile-Only Action Strip (Timer & End Button) */}
          <div className="flex items-center gap-1.5 sm:hidden">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-mono font-bold ${
                secondsRemaining < 300
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}
            >
              <Clock className="w-3 h-3 text-blue-400" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <button
              onClick={requestEndInterview}
              className="p-1.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1 cursor-pointer"
              title="End Interview"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">End</span>
            </button>
          </div>
        </div>

        {/* Row 2 on Mobile / Right Rail on Desktop: View Switcher Tabs & Audio Settings */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {/* View Switcher Tabs (Video vs Coding vs Transcript on Mobile) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 flex-1 sm:flex-initial justify-center">
            <button
              onClick={() => setActiveTab('video')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'video' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video</span>
            </button>

            <button
              onClick={() => setActiveTab('coding')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'coding' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code</span>
              {codingChallenge && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
            </button>

            {/* Mobile-Only Transcript Switcher Tab */}
            <button
              onClick={() => setActiveTab('transcript')}
              className={`lg:hidden flex-1 sm:flex-initial flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'transcript' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat ({messages.length})</span>
            </button>
          </div>

          {/* Desktop Audio Controls (Voice & Speed & Timer & End Button) */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            {/* Indian English Voice Selector */}
            {availableVoices.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="text-sm" title="Accent: Indian English (en-IN)">🇮🇳</span>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const found = availableVoices.find(v => v.name === e.target.value);
                    if (found) {
                      setSelectedVoice(found);
                      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        const previewName = found.name.includes('आरोही') || found.name.toLowerCase().includes('arohi') ? 'Arohi' : (found.name.split('-')[0].replace(/Microsoft|Online|Natural|Google/gi, '').trim() || found.name);
                        const testUtterance = new SpeechSynthesisUtterance(`Hello! Voice set to ${previewName}.`);
                        testUtterance.voice = found;
                        testUtterance.rate = speechRateRef.current;
                        testUtterance.lang = found.lang || 'en-IN';
                        window.speechSynthesis.speak(testUtterance);
                      }
                    }
                  }}
                  className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer max-w-[120px] md:max-w-[160px] truncate"
                  title="Select Interviewer Voice (Default: Arohi)"
                >
                  {availableVoices.map((v) => (
                    <option key={v.name} value={v.name} className="bg-slate-900 text-white">
                      {v.name.includes('आरोही') || v.name.toLowerCase().includes('arohi')
                        ? `⭐ 🇮🇳 ${v.name} (Default)`
                        : v.lang.toLowerCase().includes('in') || v.name.toLowerCase().includes('india')
                        ? `🇮🇳 ${v.name}`
                        : v.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Interviewer Speaking Pace / Speed Selector */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-amber-400 font-bold text-xs" title="Speaking Pace">⚡</span>
              <select
                value={speechRate}
                onChange={(e) => {
                  const newRate = parseFloat(e.target.value);
                  setSpeechRate(newRate);
                  speechRateRef.current = newRate;
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const testUtterance = new SpeechSynthesisUtterance(`Speed ${newRate}x.`);
                    const activeVoice = selectedVoice || findIndianVoice(window.speechSynthesis.getVoices());
                    if (activeVoice) {
                      testUtterance.voice = activeVoice;
                      testUtterance.lang = activeVoice.lang || 'en-IN';
                    }
                    testUtterance.rate = newRate;
                    window.speechSynthesis.speak(testUtterance);
                  }
                }}
                className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
                title="Interviewer Speech Speed"
              >
                <option value="1.0" className="bg-slate-900 text-white">1.0x Normal</option>
                <option value="1.12" className="bg-slate-900 text-white">1.12x Natural (Fast)</option>
                <option value="1.2" className="bg-slate-900 text-white">1.2x Brisk</option>
                <option value="1.3" className="bg-slate-900 text-white">1.3x Rapid</option>
              </select>
            </div>

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
              onClick={requestEndInterview}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-md shadow-rose-600/20 cursor-pointer shrink-0"
              title="Conclude and evaluate this interview session"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>End & Evaluate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 py-2 sm:py-3 overflow-hidden min-h-0">
        {/* Left / Primary Column (8 cols on Desktop, Full on Mobile) */}
        <div className={`flex flex-col gap-2.5 sm:gap-3 h-full overflow-hidden ${
          activeTab === 'transcript' ? 'hidden lg:flex lg:col-span-8' : 'col-span-1 lg:col-span-8'
        }`}>
          {activeTab === 'video' ? (
            /* Split Screen Video Call: AI Avatar + Candidate WebCam */
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 flex-1 min-h-0 overflow-y-auto">
              <AiAvatar
                isSpeaking={isAiSpeaking}
                isThinking={isAiThinking}
                interviewerName={
                  interview?.llmProvider === 'antigravity' || interview?.llmProvider === 'local'
                    ? 'Arohi (Lead Tech Interviewer • Indian Voice)'
                    : interview?.llmProvider === 'ollama'
                    ? `Arohi (Ollama • ${interview?.llmModel || 'Local Model'})`
                    : `Arohi (${interview?.llmProvider?.toUpperCase()} • BYOK)`
                }
              />
              <CandidateCam candidateName="You (Candidate)" isRecording={isRecording} />

              {/* Initial Call Connect Overlay */}
              {!hasStartedCall && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md rounded-2xl p-4 sm:p-6 text-center border border-slate-800">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mb-3 sm:mb-4 text-blue-400 animate-pulse shadow-lg shadow-blue-500/20">
                    <PhoneCall className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1">Live Two-Way Video Call Ready</h3>
                  <p className="text-xs text-slate-300 max-w-md mb-4 sm:mb-5 leading-relaxed">
                    Lead Technical Interviewer <strong className="text-blue-400">Arohi</strong> is ready.
                    Two-way conversational audio is active. When you speak, the application will catch your words dynamically.
                  </p>
                  <button
                    onClick={handleStartCall}
                    className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-blue-500/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
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
          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 shrink-0">
            {/* Live NLP Metrics Badges & 2-Way Mode Status */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
              <SpeechMetricsBadge metrics={lastMetrics} />

              <div className="flex items-center gap-1.5 sm:gap-2">
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
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all border shrink-0 ${
                    isTwoWayMode
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Hands-Free Two-Way Live Conversation"
                >
                  <Radio className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isTwoWayMode ? 'animate-pulse text-emerald-400' : ''}`} />
                  <span className="hidden sm:inline">{isTwoWayMode ? 'Hands-Free 2-Way: Active' : 'Manual Push-to-Talk'}</span>
                  <span className="sm:hidden">{isTwoWayMode ? '2-Way Live' : 'Manual'}</span>
                </button>

                {/* Conversation State Indicators */}
                {isAiSpeaking ? (
                  <span className="text-[10px] sm:text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                    <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" /> Speaking...
                  </span>
                ) : isAiThinking ? (
                  <span className="text-[10px] sm:text-[11px] text-purple-400 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" /> Thinking...
                  </span>
                ) : isRecording ? (
                  <span className="text-[10px] sm:text-[11px] text-rose-400 flex items-center gap-1 font-medium animate-pulse">
                    <Mic className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Listening...
                  </span>
                ) : null}
              </div>
            </div>

            {/* Auto-submission Countdown Bar */}
            {autoSendingCountdown !== null && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 rounded-xl text-xs text-blue-200 animate-pulse">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Answer captured. Sending in <strong>{autoSendingCountdown}s</strong>...</span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
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
                className={`p-2.5 sm:p-3 rounded-xl font-medium text-xs flex items-center justify-center transition-all shrink-0 ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
                title={isRecording ? 'Mute Mic' : 'Speak (Mic)'}
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
                    ? 'Listening... speak answer'
                    : isTwoWayMode
                    ? '2-Way active (starts listening when AI finishes)'
                    : 'Tap mic or type answer...'
                }
                className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() => handleSendTurnWithText()}
                disabled={!candidateInput.trim() || isAiThinking}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20 shrink-0"
              >
                {isAiThinking ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span className="hidden xs:inline">Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Live Interview Transcript History (Full on Mobile when 'transcript' tab active, 4-cols on Desktop) */}
        <div className={`flex flex-col h-full rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden ${
          activeTab === 'transcript' ? 'col-span-1 flex min-h-0' : 'hidden lg:flex lg:col-span-4'
        }`}>
          <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-900 border-b border-slate-800 shrink-0">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Live Transcript
            </span>
            <span className="text-[11px] text-slate-400">{messages.length} turns</span>
          </div>

          <div className="flex-1 p-3 sm:p-3.5 space-y-2.5 sm:space-y-3 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`p-2.5 sm:p-3 rounded-xl text-xs leading-relaxed ${
                  msg.sender === 'agent'
                    ? 'bg-blue-950/40 border border-blue-500/20 text-slate-200'
                    : msg.sender === 'system'
                    ? 'bg-purple-950/30 border border-purple-500/20 text-purple-200 italic'
                    : 'bg-slate-950 border border-slate-800 text-slate-100 ml-3 sm:ml-4'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-semibold uppercase">
                  <span className="truncate max-w-[170px]">{msg.sender === 'agent' ? 'Arohi (AI Lead)' : msg.sender === 'system' ? 'System' : 'You'}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {msg.sender === 'agent' && (
                      <button
                        type="button"
                        onClick={() => speakText(msg.content)}
                        className="text-blue-400 hover:text-blue-300 p-0.5 rounded transition-colors"
                        title="Replay Voice (Arohi)"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* End Interview Confirmation Tab / Modal */}
      {showEndConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <StopCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">Conclude Interview Session?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to end this interview? All your spoken responses, technical answers, and coding submissions will be finalized to immediately generate your comprehensive evaluation report.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={cancelEndInterview}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition-colors border border-slate-700 cursor-pointer"
              >
                Return to Interview
              </button>
              <button
                type="button"
                onClick={confirmImmediateEndInterview}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <StopCircle className="w-4 h-4" />
                <span>Yes, End Immediately</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Immediate Evaluation Ending Overlay */}
      {isEnding && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
          <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mb-4 text-blue-400 animate-spin">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Concluding Interview Session</h3>
          <p className="text-xs text-slate-400 max-w-sm text-center leading-relaxed">
            Evaluating your responses, NLP communication metrics, and live coding performance. Redirecting to your report...
          </p>
        </div>
      )}
    </div>
  );
}
