import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LocalInterviewSubAgent } from '@/lib/llm/local-subagent';

const localAgent = new LocalInterviewSubAgent();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: interviewId } = await params;

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        messages: { orderBy: { timestamp: 'asc' } },
        codingSubmissions: true,
        evaluation: true,
      },
    });

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found.' }, { status: 404 });
    }

    // Check if report already exists
    if (interview.evaluation) {
      return NextResponse.json({
        success: true,
        report: interview.evaluation,
      });
    }

    // Collect coding scores
    const codingScores = interview.codingSubmissions
      .map(s => s.score)
      .filter((s): s is number => s !== null && s !== undefined);

    // Generate comprehensive evaluation
    const reportData = await localAgent.generateEvaluationReport(
      {
        roleTitle: interview.roleTitle,
        experienceLevel: interview.experienceLevel,
      },
      interview.messages.map(m => ({
        sender: m.sender,
        content: m.content,
        nlpMetrics: m.nlpMetrics,
      })),
      codingScores
    );

    const categoryScores = {
      technicalFundamentals: reportData.technicalScore,
      problemSolving: Math.min(100, reportData.technicalScore + 5),
      codingProficiency: reportData.codingScore,
      verbalCommunication: reportData.communicationScore,
      deliveryAndConfidence: reportData.confidenceScore,
    };

    // Save report in DB and mark interview completed
    const evaluation = await prisma.evaluationReport.create({
      data: {
        interviewId,
        overallScore: reportData.overallScore,
        technicalScore: reportData.technicalScore,
        codingScore: reportData.codingScore,
        communicationScore: reportData.communicationScore,
        confidenceScore: reportData.confidenceScore,
        categoryScores,
        strengths: reportData.strengths,
        improvements: reportData.improvements,
        detailedFeedback: reportData.detailedFeedback,
      },
    });

    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: 'completed',
      },
    });

    return NextResponse.json({
      success: true,
      report: evaluation,
    });
  } catch (error: any) {
    console.error('[Evaluation Report Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate evaluation report.' }, { status: 500 });
  }
}
