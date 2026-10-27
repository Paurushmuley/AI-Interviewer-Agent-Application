import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth';
import { UnifiedLLMAdapter } from '@/lib/llm/adapter';
import { decryptApiKey } from '@/lib/crypto';
import { LLMProvider } from '@/lib/llm/types';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('auth_token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const payload = verifyUserToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      roleTitle,
      jobDescription,
      targetDurationMinutes = 30,
      experienceLevel = 'Mid',
      interviewType = 'full_loop',
      resumeBlobUrl,
      resumeFilename,
      parsedResume,
      llmProvider = 'local',
      llmModel,
    } = body;

    if (!roleTitle || !jobDescription) {
      return NextResponse.json({ error: 'Role title and job description are required.' }, { status: 400 });
    }

    // 1. Create interview record
    const interview = await prisma.interview.create({
      data: {
        userId: payload.userId,
        roleTitle,
        jobDescription,
        targetDurationMinutes: parseInt(String(targetDurationMinutes), 10) || 30,
        experienceLevel,
        interviewType,
        resumeBlobUrl,
        resumeFilename,
        parsedResume: parsedResume || null,
        llmProvider,
        llmModel: llmModel || null,
        status: 'in_progress',
      },
    });

    // 2. Setup initial rounds
    const rounds = [
      { roundType: 'intro', roundOrder: 1, status: 'active' },
      { roundType: 'experience_deepdive', roundOrder: 2, status: 'pending' },
      { roundType: 'coding_challenge', roundOrder: 3, status: 'pending' },
      { roundType: 'behavioral', roundOrder: 4, status: 'pending' },
      { roundType: 'candidate_qa', roundOrder: 5, status: 'pending' },
    ];

    for (const r of rounds) {
      await prisma.interviewRound.create({
        data: {
          interviewId: interview.id,
          roundType: r.roundType,
          roundOrder: r.roundOrder,
          status: r.status,
        },
      });
    }

    // 3. Resolve API key if provider is not local
    let plainApiKey: string | undefined = undefined;
    if (llmProvider !== 'local') {
      const savedKeyRecord = await prisma.userApiKey.findUnique({
        where: {
          userId_provider: {
            userId: payload.userId,
            provider: llmProvider,
          },
        },
      });
      if (savedKeyRecord) {
        plainApiKey = decryptApiKey(savedKeyRecord.encryptedKey, savedKeyRecord.iv, savedKeyRecord.tag);
      }
    }

    // 4. Generate first interview greeting
    const firstTurn = await UnifiedLLMAdapter.generateTurn(
      llmProvider as LLMProvider,
      plainApiKey,
      [],
      {
        roleTitle,
        experienceLevel: experienceLevel as any,
        interviewStage: 'intro',
        remainingMinutes: interview.targetDurationMinutes,
        totalDurationMinutes: interview.targetDurationMinutes,
        jobDescription,
        candidateSkills: parsedResume?.skills || [],
        matchedSkills: parsedResume?.skills?.slice(0, 5) || [],
        missingSkills: [],
      },
      llmModel
    );

    // 5. Store first message in transcript
    const initialMessage = await prisma.transcriptMessage.create({
      data: {
        interviewId: interview.id,
        sender: 'agent',
        content: firstTurn.content,
      },
    });

    return NextResponse.json({
      success: true,
      interviewId: interview.id,
      initialMessage: {
        id: initialMessage.id,
        sender: initialMessage.sender,
        content: initialMessage.content,
        timestamp: initialMessage.timestamp,
      },
    });
  } catch (error: any) {
    console.error('[Create Interview API Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to initialize interview.' }, { status: 500 });
  }
}
