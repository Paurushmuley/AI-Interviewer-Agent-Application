import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UnifiedLLMAdapter } from '@/lib/llm/adapter';
import { decryptApiKey } from '@/lib/crypto';
import { LLMProvider } from '@/lib/llm/types';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: interviewId } = await params;
    const { submissionId, code, language = 'javascript' } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Code cannot be empty.' }, { status: 400 });
    }

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        codingSubmissions: true,
        user: { include: { apiKeys: true } },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found.' }, { status: 404 });
    }

    // Find submission or target latest
    const submission = submissionId
      ? interview.codingSubmissions.find(s => s.id === submissionId)
      : interview.codingSubmissions[0];

    const problemTitle = submission?.problemTitle || 'Coding Assessment';
    const problemStatement = submission?.problemStatement || 'Solve the given technical challenge.';

    // Resolve key
    let plainApiKey: string | undefined = undefined;
    if (interview.llmProvider !== 'local') {
      const savedKey = interview.user.apiKeys.find(k => k.provider === interview.llmProvider);
      if (savedKey) {
        try {
          plainApiKey = decryptApiKey(savedKey.encryptedKey, savedKey.iv, savedKey.tag);
        } catch {}
      }
    }

    // Run evaluation via Unified LLM or Local Sub-Agent
    const evaluation = await UnifiedLLMAdapter.evaluateCode(
      interview.llmProvider as LLMProvider,
      plainApiKey,
      problemTitle,
      problemStatement,
      code,
      language
    );

    // Update submission record
    let updatedSubmission;
    if (submission) {
      updatedSubmission = await prisma.codingSubmission.update({
        where: { id: submission.id },
        data: {
          submittedCode: code,
          language,
          score: evaluation.score,
          feedback: evaluation.feedback,
          testResults: evaluation.testResults as any,
        },
      });
    } else {
      updatedSubmission = await prisma.codingSubmission.create({
        data: {
          interviewId,
          language,
          problemTitle,
          problemStatement,
          submittedCode: code,
          score: evaluation.score,
          feedback: evaluation.feedback,
          testResults: evaluation.testResults as any,
        },
      });
    }

    // Add notification into transcript
    await prisma.transcriptMessage.create({
      data: {
        interviewId,
        sender: 'system',
        content: `Candidate submitted code for "${problemTitle}". Evaluated Score: ${evaluation.score}/100.`,
      },
    });

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
      evaluation,
    });
  } catch (error: any) {
    console.error('[Code Submission Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to evaluate code.' }, { status: 500 });
  }
}
