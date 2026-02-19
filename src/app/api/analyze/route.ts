import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const business = await request.json();

    const apiKey = process.env.DEEPSEEK_API_KEY || 'sk-1511f9e02a8b4cf3909ebafbc80cb881';
    const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions';

    const prompt = `Analyze this local business for prospecting:
    Name: ${business.name}
    Address: ${business.address}
    Website: ${business.website || 'None'}
    Rating: ${business.rating}
    Reviews: ${business.reviewCount}
    Photos: ${business.photosCount}

    Based on this data, provide:
    1. A health score (0-100).
    2. What they are missing (list 2-3 key things).
    3. A brief growth suggestion.

    Format the response as a JSON object:
    {
      "healthScore": number,
      "missing": [string, string, ...],
      "suggestion": string
    }`;

    const response = await axios.post(
      apiUrl,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a business growth analyst. Always respond in valid JSON.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const analysis = JSON.parse(response.data.choices[0].message.content);
    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Analysis error:', error.response?.data || error.message);
    
    // Fallback logic if API fails
    const business = await request.json();
    let score = 0;
    const missing = [];
    
    if (business.website) score += 40; else missing.push('Professional website');
    if (business.reviewCount > 50) score += 20; else missing.push('More customer reviews');
    if (business.rating > 4) score += 20; else missing.push('Higher average rating');
    if (business.photosCount > 10) score += 20; else missing.push('More business photos');
    
    return NextResponse.json({
      healthScore: score,
      missing,
      suggestion: business.website ? 'Optimize website for conversions' : 'Create a landing page to capture leads',
      isFallback: true
    });
  }
}
