import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { callLLM, LLMProvider } from '@/lib/llm';

export async function POST(req: Request) {
  try {
    const { business, llm = 'deepseek' } = await req.json();

    const prompt = `You are an expert sales consultant. Generate a professional sales proposal for the following business:
Name: ${business.name}
Niche: ${business.niche || 'Local Business'}
Location: ${business.city || business.address || 'Unknown'}
Current Rating: ${business.rating || 'N/A'} (${business.reviewCount || 0} reviews)
Website: ${business.website || 'None'}
Phone: ${business.phone || 'N/A'}
Email: ${business.email || 'N/A'}
Missing/Issues: ${business.missing?.join(', ') || 'General optimization needed'}

Generate a comprehensive JSON proposal:
{
  "businessAnalysis": "detailed 3-4 paragraph analysis",
  "whatTheyAreMissing": ["item1", "item2"],
  "recommendedServices": [
    { "title": "Service Name", "description": "What we'll do" }
  ],
  "pricingTiers": [
    { "tier": "Basic", "price": "$497/mo", "features": ["feature1", "feature2"] },
    { "tier": "Professional", "price": "$997/mo", "features": ["feature1", "feature2", "feature3"] },
    { "tier": "Enterprise", "price": "$1,997/mo", "features": ["feature1", "feature2", "feature3", "feature4"] }
  ],
  "roiProjections": "detailed ROI analysis paragraph",
  "timeline": "implementation timeline",
  "nextSteps": ["step1", "step2", "step3"]
}
Return ONLY valid JSON.`;

    const result = await callLLM(llm as LLMProvider, 'You are a professional sales proposal writer. Return only valid JSON.', prompt);

    let parsed;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : result);
    } catch {
      parsed = { businessAnalysis: result, whatTheyAreMissing: [], recommendedServices: [], pricingTiers: [], roiProjections: '' };
    }

    // Save prospect if not exists
    let prospect = await prisma.prospect.findFirst({ where: { name: business.name } });
    if (!prospect) {
      prospect = await prisma.prospect.create({
        data: {
          placeId: business.id || null,
          name: business.name,
          address: business.address || null,
          phone: business.phone || null,
          website: business.website || null,
          email: business.email || null,
          rating: business.rating ? parseFloat(String(business.rating)) : null,
          reviewCount: business.reviewCount || null,
          niche: business.niche || null,
          city: business.city || null,
        },
      });
    }

    // Save proposal to DB
    const proposal = await prisma.proposal.create({
      data: {
        prospectId: prospect.id,
        content: JSON.stringify(parsed),
        pricing: JSON.stringify(parsed.pricingTiers || []),
        llmUsed: llm,
        status: 'draft',
      },
    });

    return NextResponse.json({ proposal: parsed, proposalId: proposal.id, prospectId: prospect.id });
  } catch (error: any) {
    console.error('Proposal generation error:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to generate proposal' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const proposals = await prisma.proposal.findMany({
      include: { prospect: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ proposals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { proposalId, pricing, status, content } = await req.json();
    const data: any = {};
    if (pricing) data.pricing = JSON.stringify(pricing);
    if (status) data.status = status;
    if (content) data.content = content;
    const updated = await prisma.proposal.update({ where: { id: proposalId }, data });
    return NextResponse.json({ proposal: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await prisma.proposal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
