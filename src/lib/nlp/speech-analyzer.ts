export interface SpeechMetrics {
  totalWords: number;
  fillerWordsCount: number;
  fillerWordsFound: string[];
  fillerRatioPercent: number;
  estimatedWpm: number;
  pacingQuality: 'hesitant' | 'optimal' | 'rushed';
  confidenceScore: number; // 0 - 100
  hesitationMarkers: string[];
  strongActionWords: string[];
}

const COMMON_FILLER_WORDS = [
  'um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 'actually',
  'literally', 'sort of', 'kind of', 'i mean', 'right', 'honestly'
];

const HESITATION_PHRASES = [
  'i guess', 'i think maybe', 'not sure', 'probably', 'maybe', 'perhaps',
  'i dont know', 'i don\'t know', 'could be'
];

const STRONG_ACTION_VERBS = [
  'architected', 'engineered', 'implemented', 'optimized', 'designed',
  'refactored', 'debugged', 'spearheaded', 'resolved', 'deployed',
  'integrated', 'scaled', 'automated', 'delivered', 'analyzed'
];

/**
 * Analyzes candidate spoken response transcript for NLP metrics.
 * @param transcript Spoken text from speech-to-text
 * @param durationSeconds Approximate duration taken by candidate to speak
 */
export function analyzeSpeechTranscript(
  transcript: string,
  durationSeconds: number = 30
): SpeechMetrics {
  const normalized = transcript.toLowerCase();
  const words: string[] = normalized.match(/\b[a-z0-9'-]+\b/g) || [];
  const totalWords = words.length;

  if (totalWords === 0) {
    return {
      totalWords: 0,
      fillerWordsCount: 0,
      fillerWordsFound: [],
      fillerRatioPercent: 0,
      estimatedWpm: 0,
      pacingQuality: 'hesitant',
      confidenceScore: 50,
      hesitationMarkers: [],
      strongActionWords: [],
    };
  }

  // 1. Detect filler words
  const fillerFound: string[] = [];
  let fillerCount = 0;

  for (const filler of COMMON_FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = normalized.match(regex);
    if (matches) {
      fillerCount += matches.length;
      fillerFound.push(`${filler} (${matches.length}x)`);
    }
  }

  const fillerRatioPercent = Math.min(100, Math.round((fillerCount / totalWords) * 100));

  // 2. Calculate WPM (Words per minute)
  const durationMinutes = Math.max(0.1, durationSeconds / 60);
  const estimatedWpm = Math.round(totalWords / durationMinutes);

  let pacingQuality: 'hesitant' | 'optimal' | 'rushed' = 'optimal';
  if (estimatedWpm < 110) {
    pacingQuality = 'hesitant';
  } else if (estimatedWpm > 175) {
    pacingQuality = 'rushed';
  }

  // 3. Detect hesitation markers vs action verbs
  const hesitationsFound: string[] = [];
  for (const phrase of HESITATION_PHRASES) {
    if (normalized.includes(phrase)) {
      hesitationsFound.push(phrase);
    }
  }

  const strongWordsFound: string[] = [];
  for (const verb of STRONG_ACTION_VERBS) {
    if (words.includes(verb)) {
      strongWordsFound.push(verb);
    }
  }

  // 4. Compute Confidence Score (0 - 100)
  // Baseline 75: Penalized by high filler ratio and hesitations; boosted by strong action words and optimal pacing
  let confidenceScore = 75;

  // Filler penalty: up to -25
  confidenceScore -= Math.min(25, fillerRatioPercent * 2.5);

  // Hesitation penalty: -5 per hesitation phrase (up to -15)
  confidenceScore -= Math.min(15, hesitationsFound.length * 5);

  // Strong action word bonus: +4 per strong verb (up to +20)
  confidenceScore += Math.min(20, strongWordsFound.length * 4);

  // Pacing adjustment
  if (pacingQuality === 'optimal') {
    confidenceScore += 5;
  } else {
    confidenceScore -= 5;
  }

  confidenceScore = Math.max(10, Math.min(100, Math.round(confidenceScore)));

  return {
    totalWords,
    fillerWordsCount: fillerCount,
    fillerWordsFound: fillerFound,
    fillerRatioPercent,
    estimatedWpm,
    pacingQuality,
    confidenceScore,
    hesitationMarkers: hesitationsFound,
    strongActionWords: strongWordsFound,
  };
}
