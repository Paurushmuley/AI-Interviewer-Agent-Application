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

export interface WordRepetitionAnalysis {
  totalSpokenWords: number;
  uniqueWordsCount: number;
  lexicalDiversityPercent: number; // Type-Token Ratio
  topRepeatedWords: Array<{ word: string; count: number }>;
  crutchWordsFrequency: Array<{ word: string; count: number }>;
  repetitiveSummary: string;
}

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', "aren't", 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', "can't", 'cannot',
  'could', "couldn't", 'did', "didn't", 'do', 'does', "doesn't", 'doing', "don't", 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', "hadn't", 'has', "hasn't", 'have', "haven't", 'having', 'he', "he'd",
  "he'll", "he's", 'her', 'here', "here's", 'hers', 'herself', 'him', 'himself', 'his', 'how', "how's", 'i',
  "i'd", "i'll", "i'm", "i've", 'if', 'in', 'into', 'is', "isn't", 'it', "it's", 'its', 'itself', "let's",
  'me', 'more', 'most', "mustn't", 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', "shan't", 'she', "she'd", "she'll",
  "she's", 'should', "shouldn't", 'so', 'some', 'such', 'than', 'that', "that's", 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', "there's", 'these', 'they', "they'd", "they'll", "they're", "they've",
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', "wasn't", 'we', "we'd", "we'll",
  "we're", "we've", 'were', "weren't", 'what', "what's", 'when', "when's", 'where', "where's", 'which',
  'while', 'who', "who's", 'whom', 'why', "why's", 'with', "won't", 'would', "wouldn't", 'you', "you'd",
  "you'll", "you're", "you've", 'your', 'yours', 'yourself', 'yourselves'
]);

const CRUTCH_WORDS = new Set([
  'basically', 'like', 'actually', 'literally', 'obviously', 'stuff', 'things',
  'sort of', 'kind of', 'pretty much', 'you know', 'right', 'honestly', 'whatever', 'definitely'
]);

/**
 * Analyzes word repetition, lexical diversity, and crutch word frequencies across all candidate spoken turns.
 */
export function analyzeWordRepetition(allSpokenTexts: string[]): WordRepetitionAnalysis {
  const fullText = allSpokenTexts.join(' ').toLowerCase();
  const rawWords = fullText.match(/\b[a-z0-9'-]+\b/g) || [];
  const totalSpokenWords = rawWords.length;

  if (totalSpokenWords === 0) {
    return {
      totalSpokenWords: 0,
      uniqueWordsCount: 0,
      lexicalDiversityPercent: 0,
      topRepeatedWords: [],
      crutchWordsFrequency: [],
      repetitiveSummary: 'Insufficient candidate spoken turns to analyze vocabulary diversity.',
    };
  }

  const frequencyMap = new Map<string, number>();
  const uniqueWordsSet = new Set<string>();

  for (const word of rawWords) {
    uniqueWordsSet.add(word);
    frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
  }

  // Lexical Diversity (Type-Token Ratio)
  const lexicalDiversityPercent = Math.round((uniqueWordsSet.size / totalSpokenWords) * 100);

  // Top non-stop repeated words (repeated >= 2 times)
  const nonStopWordRepeats: Array<{ word: string; count: number }> = [];
  const crutchWordRepeats: Array<{ word: string; count: number }> = [];

  for (const [word, count] of frequencyMap.entries()) {
    if (CRUTCH_WORDS.has(word) && count >= 2) {
      crutchWordRepeats.push({ word, count });
    }
    if (!STOP_WORDS.has(word) && word.length > 2 && count >= 2) {
      nonStopWordRepeats.push({ word, count });
    }
  }

  // Sort descending
  nonStopWordRepeats.sort((a, b) => b.count - a.count);
  crutchWordRepeats.sort((a, b) => b.count - a.count);

  const topRepeatedWords = nonStopWordRepeats.slice(0, 6);
  const crutchWordsFrequency = crutchWordRepeats.slice(0, 5);

  let repetitiveSummary = '';
  if (crutchWordsFrequency.length > 0) {
    const list = crutchWordsFrequency.map(c => `"${c.word}" (${c.count}x)`).join(', ');
    repetitiveSummary = `Frequent reliance on crutch words: ${list}. Lexical diversity was ${lexicalDiversityPercent}%.`;
  } else if (lexicalDiversityPercent > 55) {
    repetitiveSummary = `Strong vocabulary range with ${lexicalDiversityPercent}% lexical diversity and minimal repetitive crutch words.`;
  } else {
    repetitiveSummary = `Moderate vocabulary variety (${lexicalDiversityPercent}% lexical diversity). Practice intentional pauses to reduce repetition.`;
  }

  return {
    totalSpokenWords,
    uniqueWordsCount: uniqueWordsSet.size,
    lexicalDiversityPercent,
    topRepeatedWords,
    crutchWordsFrequency,
    repetitiveSummary,
  };
}
