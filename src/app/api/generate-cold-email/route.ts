import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { callLLM, LLMProvider } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    const { prospectName, businessName, auditFindings, tone = 'professional', email, llm = 'deepseek' } = await request.json();

    if (!businessName) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
    }

    const prompt = `Write a personalized cold email for:
Business: ${businessName}
Contact: ${prospectName || 'Business Owner'}
Tone: ${tone}
Audit Findings: ${auditFindings || 'Needs website optimization, better online presence, and more reviews'}

Write a compelling cold email (150-200 words) that references specific business problems and has a strong call-to-action.

Return JSON format:
{
  "subject": "Email subject line (5-8 words)",
  "body": "Full email body"
}
Return ONLY valid JSON.`;

    const result = await callLLM(llm as LLMProvider, 'You are an expert cold email copywriter. Return only valid JSON with subject and body fields.', prompt);

    let parsed;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : result);
    } catch {
      parsed = { subject: `Grow ${businessName} with AI-Powered Marketing`, body: result };
    }

    if (!parsed.subject || !parsed.body) {
      parsed = { subject: parsed.subject || `Grow ${businessName}`, body: parsed.body || result };
    }

    await prisma.coldEmail.create({
      data: { businessName, recipient: email || null, subject: parsed.subject, body: parsed.body, tone, llmUsed: llm },
    });

    return NextResponse.json({ subject: parsed.subject.trim(), body: parsed.body.trim(), prospectName, businessName, email });
  } catch (error: any) {
    console.error('Cold email generation error:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to generate email' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const emails = await prisma.coldEmail.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ emails });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
