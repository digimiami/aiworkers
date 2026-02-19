import { NextResponse } from 'next/server';
import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-1511f9e02a8b4cf3909ebafbc80cb881';
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

export async function POST(req: Request) {
  try {
    const { business } = await req.json();

    const prompt = `
      You are an expert sales consultant. Generate a professional sales proposal for the following business:
      Name: ${business.name}
      Niche: ${business.niche}
      Location: ${business.city}
      Current Rating: ${business.rating} (${business.reviewCount} reviews)
      Website: ${business.website || 'None'}
      Missing/Issues: ${business.missing?.join(', ') || 'General optimization'}

      The proposal should be in JSON format with the following structure:
      {
        "businessAnalysis": "string",
        "whatTheyAreMissing": ["string"],
        "recommendedServices": [
          { "title": "string", "description": "string" }
        ],
        "pricingTiers": [
          { "tier": "string", "price": "string", "features": ["string"] }
        ],
        "roiProjections": "string"
      }
      Make it professional, persuasive, and tailored to their specific niche and needs.
    `;

    const response = await axios.post(
      DEEPSEEK_URL,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates sales proposals in JSON format.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const proposalData = JSON.parse(response.data.choices[0].message.content);
    return NextResponse.json(proposalData);
  } catch (error: any) {
    console.error('Proposal generation error:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to generate proposal' }, { status: 500 });
  }
}
