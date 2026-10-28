import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AntigravityInterviewSubAgent } from '@/lib/llm/antigravity-agent';

const antigravityAgent = new AntigravityInterviewSubAgent();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: interviewId } = await params;
    const forceRegenerate = req.nextUrl.searchParams.get('regenerate') === 'true';

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        messages: { orderBy: { timestamp: 'asc' } },
        codingSubmissions: { orderBy: { createdAt: 'desc' } },
        evaluation: true,
      },
    });

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found.' }, { status: 404 });
    }

    // Check if report already exists and has comprehensive Q&A evaluations
    if (interview.evaluation && !forceRegenerate) {
      const existingScores = interview.evaluation.categoryScores as any;
      if (existingScores?.qaEvaluations && existingScores?.actionableImprovementPlan) {
        return NextResponse.json({
          success: true,
          report: interview.evaluation,
        });
      }
    }

    // Generate comprehensive evaluation strictly dependent on candidate answers, repetition & confidence
    const reportData = await antigravityAgent.generateEvaluationReport(
      {
        roleTitle: interview.roleTitle,
        experienceLevel: interview.experienceLevel,
        jobDescription: interview.jobDescription,
        parsedResume: interview.parsedResume,
      },
      interview.messages.map(m => ({
        sender: m.sender,
        content: m.content,
        nlpMetrics: m.nlpMetrics,
      })),
      interview.codingSubmissions.map(s => ({
        problemTitle: s.problemTitle,
        language: s.language,
        submittedCode: s.submittedCode,
        score: s.score,
        feedback: s.feedback,
        testResults: s.testResults,
      }))
    );

    const categoryScores = reportData.categoryScores || {
      technicalFundamentals: reportData.technicalScore,
      problemSolving: Math.min(100, reportData.technicalScore + 5),
      codingProficiency: reportData.codingScore,
      verbalCommunication: reportData.communicationScore,
      deliveryAndConfidence: reportData.confidenceScore,
    };

    // Upsert report in DB and mark interview completed
    const evaluation = await prisma.evaluationReport.upsert({
      where: { interviewId },
      update: {
        overallScore: reportData.overallScore,
        technicalScore: reportData.technicalScore,
        codingScore: reportData.codingScore,
        communicationScore: reportData.communicationScore,
        confidenceScore: reportData.confidenceScore,
        categoryScores: categoryScores as any,
        strengths: reportData.strengths,
        improvements: reportData.improvements,
        detailedFeedback: reportData.detailedFeedback,
      },
      create: {
        interviewId,
        overallScore: reportData.overallScore,
        technicalScore: reportData.technicalScore,
        codingScore: reportData.codingScore,
        communicationScore: reportData.communicationScore,
        confidenceScore: reportData.confidenceScore,
        categoryScores: categoryScores as any,
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
