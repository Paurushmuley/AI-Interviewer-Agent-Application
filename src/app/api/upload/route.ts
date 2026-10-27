import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import { uploadResumeBlob } from '@/lib/blob';
import { parseResumeText, alignResumeWithJd } from '@/lib/nlp/resume-parser';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const jdText = (formData.get('jd') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No resume file provided.' }, { status: 400 });
    }

    const filename = file.name || 'resume.pdf';
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let extractedText = '';

    // Handle PDF or Plain Text
    if (filename.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
      try {
        const pdfData = await pdf(buffer);
        extractedText = pdfData.text;
      } catch (pdfErr) {
        console.warn('PDF parsing error, falling back to raw buffer string:', pdfErr);
        extractedText = buffer.toString('utf-8');
      }
    } else {
      extractedText = buffer.toString('utf-8');
    }

    // Run NLP entity & skill extraction
    const parsedResume = parseResumeText(extractedText);

    // Compute alignment if JD was passed
    const jdAlignment = jdText ? alignResumeWithJd(parsedResume, jdText) : null;

    // Upload to Vercel Blob (temporary storage)
    const { url, pathname } = await uploadResumeBlob(filename, buffer, file.type || 'application/pdf');

    return NextResponse.json({
      success: true,
      blobUrl: url,
      pathname,
      filename,
      parsedResume,
      jdAlignment,
    });
  } catch (error: any) {
    console.error('[Upload API Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to process resume.' }, { status: 500 });
  }
}
