import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: interviewId } = await params;

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        rounds: { orderBy: { roundOrder: 'asc' } },
        messages: { orderBy: { timestamp: 'asc' } },
        codingSubmissions: { orderBy: { createdAt: 'desc' } },
        evaluation: true,
      },
    });

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      interview,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
