import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const {
      monthlyRevenue,
      industryType,
      hasWebsite,
      googleRating,
      reviewCount,
      monthlyAdSpend,
    } = await request.json();

    const prompt = `You are an AI business consultant. Based on the following business metrics, calculate the projected revenue increase if they implement AI Workers services:

Business Metrics:
- Current Monthly Revenue: $${monthlyRevenue}
- Industry: ${industryType}
- Has Website: ${hasWebsite ? 'Yes' : 'No'}
- Google Rating: ${googleRating}/5
- Review Count: ${reviewCount}
- Monthly Ad Spend: $${monthlyAdSpend}

Please provide a JSON response with ONLY these fields (no markdown, no extra text):
{
  "projectedMonthlyLeads": <number>,
  "projectedRevenueIncrease": <number>,
  "conversionRate": <number between 0 and 1>,
  "reasoning": "<brief explanation>"
}

Base your calculations on:
1. Industry benchmarks for lead generation
2. Typical conversion rates (2-5% for most industries)
3. Average deal size for the industry
4. Impact of AI-driven marketing and automation`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-1511f9e02a8b4cf3909ebafbc80cb881`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('DeepSeek API error:', error);
      return NextResponse.json(
        { error: 'Failed to calculate ROI' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      projectedMonthlyLeads: Math.round(result.projectedMonthlyLeads),
      projectedRevenueIncrease: Math.round(result.projectedRevenueIncrease),
      conversionRate: result.conversionRate,
      reasoning: result.reasoning,
      yearlyProjection: Math.round(result.projectedRevenueIncrease * 12),
    });
  } catch (error) {
    console.error('Error calculating ROI:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
