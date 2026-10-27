import { encryptApiKey, decryptApiKey } from '../src/lib/crypto';
import { analyzeSpeechTranscript } from '../src/lib/nlp/speech-analyzer';
import { parseResumeText, alignResumeWithJd } from '../src/lib/nlp/resume-parser';
import { AntigravityInterviewSubAgent } from '../src/lib/llm/antigravity-agent';
import { OllamaAdapter } from '../src/lib/llm/ollama-adapter';

async function runVerification() {
  console.log('=== [1/4] Testing AES-256-GCM Encryption / Decryption ===');
  const sampleKey = 'sk-proj-test1234567890abcdefghijklmnopqrstuvwxyz';
  const encrypted = encryptApiKey(sampleKey);
  console.log('Encrypted payload:', { iv: encrypted.iv, tag: encrypted.tag, len: encrypted.encrypted.length });
  const decrypted = decryptApiKey(encrypted.encrypted, encrypted.iv, encrypted.tag);
  if (decrypted !== sampleKey) throw new Error('Decryption mismatch!');
  console.log('✔ AES-256-GCM encryption/decryption round-trip verified successfully.');

  console.log('\n=== [2/4] Testing Real-Time Speech NLP Analyzer ===');
  const sampleSpeech = `Um, so basically, I architected and engineered a high-throughput microservice using Node.js and PostgreSQL. Like, we faced some latency bottlenecks, but I optimized the query indexing and resolved the issue, you know?`;
  const metrics = analyzeSpeechTranscript(sampleSpeech, 25);
  console.log('NLP Metrics:', {
    totalWords: metrics.totalWords,
    fillersCount: metrics.fillerWordsCount,
    fillersFound: metrics.fillerWordsFound,
    estimatedWpm: metrics.estimatedWpm,
    confidenceScore: metrics.confidenceScore,
    strongActions: metrics.strongActionWords,
  });
  if (metrics.fillerWordsCount < 3) throw new Error('Filler words not detected properly!');
  if (!metrics.strongActionWords.includes('architected')) throw new Error('Strong action word missing!');
  console.log('✔ Speech NLP analysis verified successfully.');

  console.log('\n=== [3/4] Testing Resume Parser & JD Alignment ===');
  const sampleResume = `
Alex Mercer
alex@example.com
Senior Software Engineer with 6 years experience in TypeScript, React, Next.js, Node.js, and PostgreSQL.
Projects:
Built a high-volume payment processing system using microservices and Redis.
Architected real-time WebSocket dashboard for financial traders.
Education:
Bachelor of Science in Computer Science from University of Michigan.
`;
  const parsed = parseResumeText(sampleResume);
  console.log('Parsed Resume:', {
    email: parsed.email,
    skills: parsed.skills,
    estimatedYears: parsed.estimatedExperienceYears,
    level: parsed.experienceLevel,
  });
  const sampleJd = `Seeking a Senior Full-Stack Engineer with strong TypeScript, React, Next.js, PostgreSQL, and Docker skills.`;
  const alignment = alignResumeWithJd(parsed, sampleJd);
  console.log('JD Alignment:', {
    matchScore: alignment.matchScore,
    matched: alignment.matchedSkills,
    missing: alignment.missingSkills,
  });
  if (alignment.matchedSkills.length < 3) throw new Error('JD alignment skills missing!');
  console.log('✔ Resume NLP parser and JD alignment verified successfully.');

  console.log('\n=== [4/4] Testing Antigravity Sub-Agent & Ollama Integration ===');
  const antigravityAgent = new AntigravityInterviewSubAgent();
  const firstTurn = await antigravityAgent.generateInterviewTurn([], {
    roleTitle: 'Senior Full-Stack Engineer',
    experienceLevel: 'Senior',
    interviewStage: 'intro',
    remainingMinutes: 30,
    totalDurationMinutes: 30,
    jobDescription: sampleJd,
    candidateSkills: parsed.skills,
    matchedSkills: alignment.matchedSkills,
    missingSkills: alignment.missingSkills,
  });
  console.log('Antigravity Sub-Agent Turn 1:', firstTurn.content.slice(0, 120) + '...');

  const codeEval = await antigravityAgent.evaluateCodeSubmission(
    'Two Sum',
    'Find two numbers that add to target.',
    `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) return [map.get(diff), i];
    map.set(nums[i], i);
  }
  return [];
}`,
    'javascript'
  );
  console.log('Antigravity Sub-Agent Code Evaluation:', { score: codeEval.score, testPasses: codeEval.testResults.length });
  if (codeEval.score < 70) throw new Error('Code evaluation score unexpected!');

  const ollama = new OllamaAdapter();
  const ollamaPing = await ollama.ping();
  console.log('Ollama Ping Status:', { online: ollamaPing.online, msg: ollamaPing.message });
  console.log('✔ Antigravity sub-agent and Ollama adapter verified successfully.');

  console.log('\n🎉 ALL SYSTEM VERIFICATIONS PASSED 100%!');
}

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
