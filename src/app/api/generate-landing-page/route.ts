import { NextResponse } from 'next/server';
import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-1511f9e02a8b4cf3909ebafbc80cb881';
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

export async function POST(req: Request) {
  try {
    const { business } = await req.json();

    const prompt = `
      You are an expert web designer and copywriter. Generate content for a high-converting landing page for this business:
      Name: ${business.name}
      Niche: ${business.niche}
      Location: ${business.city}
      
      The landing page should be modern, professional, and focus on conversions.
      Generate a JSON object with this structure:
      {
        "hero": {
          "title": "string",
          "subtitle": "string",
          "cta": "string"
        },
        "features": [
          { "title": "string", "description": "string", "icon": "string" }
        ],
        "about": "string",
        "testimonials": [
          { "name": "string", "text": "string", "rating": 5 }
        ],
        "contact": {
          "address": "string",
          "phone": "string"
        }
      }
      Make the copy specific to their niche (${business.niche}).
    `;

    const response = await axios.post(
      DEEPSEEK_URL,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a professional copywriter that generates landing page content in JSON format.' },
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

    const landingPageData = JSON.parse(response.data.choices[0].message.content);
    return NextResponse.json(landingPageData);
  } catch (error: any) {
    console.error('Landing page generation error:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to generate landing page' }, { status: 500 });
  }
}
