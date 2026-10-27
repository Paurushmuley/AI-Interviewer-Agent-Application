import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('auth_token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const payload = verifyUserToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });
    }

    const interviews = await prisma.interview.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        evaluation: true,
        codingSubmissions: {
          select: { id: true, score: true, problemTitle: true },
        },
      },
    });

    // Compute summary statistics
    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter(i => i.status === 'completed' && i.evaluation);
    const totalMinutes = interviews.reduce((acc, curr) => acc + curr.targetDurationMinutes, 0);

    const scores = completedInterviews.map(i => i.evaluation!.overallScore);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalInterviews,
        completedCount: completedInterviews.length,
        totalMinutes,
        avgScore,
        highestScore,
      },
      interviews: interviews.map(i => ({
        id: i.id,
        roleTitle: i.roleTitle,
        experienceLevel: i.experienceLevel,
        interviewType: i.interviewType,
        targetDurationMinutes: i.targetDurationMinutes,
        status: i.status,
        llmProvider: i.llmProvider,
        createdAt: i.createdAt,
        score: i.evaluation?.overallScore ?? null,
        technicalScore: i.evaluation?.technicalScore ?? null,
        codingScore: i.evaluation?.codingScore ?? null,
        communicationScore: i.evaluation?.communicationScore ?? null,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
