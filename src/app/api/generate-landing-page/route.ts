import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { callLLM, LLMProvider } from '@/lib/llm';

export async function POST(req: Request) {
  try {
    const { business, llm = 'deepseek', wordCount = 1500 } = await req.json();
    const slug = `${business.name || 'business'}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const prompt = `You are an expert web designer and copywriter. Generate content for a high-converting, professional landing page for this business:
Name: ${business.name}
Niche: ${business.niche || 'Local Business'}
Location: ${business.city || business.address || 'Unknown'}
Phone: ${business.phone || 'N/A'}

IMPORTANT: The landing page content should be approximately ${wordCount} words long.
IMPORTANT: Always include a chatbot section.

Generate a JSON object:
{
  "hero": { "title": "string", "subtitle": "string", "cta": "string", "backgroundDescription": "string" },
  "about": "3-4 detailed paragraphs about the business",
  "features": [{ "title": "string", "description": "50+ word description", "icon": "emoji" }],
  "services": [{ "title": "string", "description": "80+ word description", "price": "Starting at $X" }],
  "testimonials": [{ "name": "string", "text": "40+ word testimonial", "rating": 5 }],
  "faq": [{ "question": "string", "answer": "string" }],
  "chatbot": { "greeting": "Welcome message", "commonQuestions": ["Q1", "Q2", "Q3"] },
  "seo": { "title": "SEO title", "description": "Meta description", "keywords": ["kw1", "kw2"] },
  "contact": { "heading": "string", "subheading": "string" }
}
Return ONLY valid JSON. Make content rich and at least ${wordCount} words total.`;

    const result = await callLLM(llm as LLMProvider, 'You are a professional web designer and copywriter. Return only valid JSON.', prompt, 8000);

    let parsed;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : result);
    } catch {
      parsed = { hero: { title: business.name, subtitle: 'Professional Services', cta: 'Contact Us' }, about: result, features: [], services: [], testimonials: [], faq: [], chatbot: { greeting: `Welcome to ${business.name}!`, commonQuestions: [] }, seo: { title: business.name, description: '', keywords: [] }, contact: { heading: 'Contact Us', subheading: '' } };
    }

    if (!parsed.chatbot) {
      parsed.chatbot = { greeting: `Welcome to ${business.name}! How can we help you today?`, commonQuestions: ['What services do you offer?', 'What are your hours?', 'How can I get a quote?'] };
    }

    let prospect = await prisma.prospect.findFirst({ where: { name: business.name } });
    if (!prospect) {
      prospect = await prisma.prospect.create({
        data: { placeId: business.id || null, name: business.name, address: business.address || null, phone: business.phone || null, website: business.website || null, email: business.email || null, rating: business.rating ? parseFloat(String(business.rating)) : null, reviewCount: business.reviewCount || null, niche: business.niche || null, city: business.city || null },
      });
    }

    const landingPage = await prisma.landingPage.create({
      data: { prospectId: prospect.id, content: JSON.stringify(parsed), slug, wordCount, llmUsed: llm, hasChatbot: true },
    });

    return NextResponse.json({ landingPage: parsed, landingPageId: landingPage.id, slug, prospectId: prospect.id });
  } catch (error: any) {
    console.error('Landing page generation error:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to generate landing page' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const pages = await prisma.landingPage.findMany({ include: { prospect: true }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ landingPages: pages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await prisma.landingPage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
