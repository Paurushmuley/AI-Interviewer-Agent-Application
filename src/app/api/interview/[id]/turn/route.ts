import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeSpeechTranscript } from '@/lib/nlp/speech-analyzer';
import { UnifiedLLMAdapter } from '@/lib/llm/adapter';
import { decryptApiKey } from '@/lib/crypto';
import { LLMProvider, ChatMessage } from '@/lib/llm/types';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: interviewId } = await params;
    const body = await req.json();
    const { candidateTranscript, durationSeconds = 30, remainingMinutes } = body;

    if (!candidateTranscript || !candidateTranscript.trim()) {
      return NextResponse.json({ error: 'Candidate transcript is required.' }, { status: 400 });
    }

    // 1. Fetch interview and context
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        rounds: { orderBy: { roundOrder: 'asc' } },
        messages: { orderBy: { timestamp: 'asc' } },
        user: {
          include: {
            apiKeys: true,
          },
        },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found.' }, { status: 404 });
    }

    // 2. Run NLP feature extraction on candidate's spoken speech
    const speechMetrics = analyzeSpeechTranscript(candidateTranscript, durationSeconds);

    // 3. Save candidate message with NLP analytics into DB
    const candidateMsgRecord = await prisma.transcriptMessage.create({
      data: {
        interviewId,
        sender: 'candidate',
        content: candidateTranscript.trim(),
        nlpMetrics: speechMetrics as any,
      },
    });

    // 4. Construct message history for LLM
    const chatHistory: ChatMessage[] = interview.messages.map(m => ({
      role: m.sender === 'candidate' ? 'user' : 'assistant',
      content: m.content,
    }));
    chatHistory.push({ role: 'user', content: candidateTranscript.trim() });

    // 5. Determine current stage & remaining time
    const parsedResume: any = interview.parsedResume || {};
    const effectiveRemainingMinutes = remainingMinutes !== undefined
      ? Math.max(0, remainingMinutes)
      : Math.max(0, interview.targetDurationMinutes - Math.round(interview.messages.length * 1.5));

    // Determine active round
    const activeRound = interview.rounds.find(r => r.status === 'active') || interview.rounds[0];

    // 6. Resolve API key if provider is not local
    let plainApiKey: string | undefined = undefined;
    if (interview.llmProvider !== 'local') {
      const savedKey = interview.user.apiKeys.find(k => k.provider === interview.llmProvider);
      if (savedKey) {
        try {
          plainApiKey = decryptApiKey(savedKey.encryptedKey, savedKey.iv, savedKey.tag);
        } catch (decryptErr) {
          console.warn('Failed to decrypt key, falling back to local agent:', decryptErr);
        }
      }
    }

    // 7. Invoke Unified LLM Adapter
    const llmTurn = await UnifiedLLMAdapter.generateTurn(
      interview.llmProvider as LLMProvider,
      plainApiKey,
      chatHistory,
      {
        roleTitle: interview.roleTitle,
        experienceLevel: interview.experienceLevel as any,
        interviewStage: (activeRound?.roundType as any) || 'experience_deepdive',
        remainingMinutes: effectiveRemainingMinutes,
        totalDurationMinutes: interview.targetDurationMinutes,
        jobDescription: interview.jobDescription,
        candidateSkills: parsedResume?.skills || [],
        matchedSkills: parsedResume?.skills?.slice(0, 5) || [],
        missingSkills: [],
        lastCandidateMetrics: {
          wpm: speechMetrics.estimatedWpm,
          fillerCount: speechMetrics.fillerWordsCount,
          confidenceScore: speechMetrics.confidenceScore,
        },
      },
      interview.llmModel || undefined
    );

    // 8. If LLM produced a coding challenge, register it
    let registeredChallenge: any = null;
    if (llmTurn.codingChallenge) {
      const createdChallenge = await prisma.codingSubmission.create({
        data: {
          interviewId,
          language: llmTurn.codingChallenge.expectedLanguage || 'javascript',
          problemTitle: llmTurn.codingChallenge.title,
          problemStatement: llmTurn.codingChallenge.description,
          starterCode: llmTurn.codingChallenge.starterCode,
          submittedCode: llmTurn.codingChallenge.starterCode,
          testResults: llmTurn.codingChallenge.testCases as any,
        },
      });
      registeredChallenge = createdChallenge;
    }

    // 9. Save Agent response in DB
    const agentMsgRecord = await prisma.transcriptMessage.create({
      data: {
        interviewId,
        sender: 'agent',
        content: llmTurn.content,
      },
    });

    return NextResponse.json({
      success: true,
      candidateMetrics: speechMetrics,
      agentMessage: {
        id: agentMsgRecord.id,
        sender: agentMsgRecord.sender,
        content: agentMsgRecord.content,
        timestamp: agentMsgRecord.timestamp,
      },
      stageTransition: llmTurn.stageTransition || 'continue',
      codingChallenge: registeredChallenge,
    });
  } catch (error: any) {
    console.error('[Interview Turn Error]:', error);
    return NextResponse.json({ error: error.message || 'Error processing interview turn.' }, { status: 500 });
  }
}
