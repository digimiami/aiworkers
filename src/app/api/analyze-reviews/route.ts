import { NextResponse } from 'next/server';
import axios from 'axios';

interface ReviewAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
}

export async function POST(request: Request) {
  try {
    const { businessName, location, placeId } = await request.json();

    if (!businessName || !location) {
      return NextResponse.json({ error: 'Business name and location are required' }, { status: 400 });
    }

    const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY || '';
    const deepseekKey = process.env.DEEPSEEK_API_KEY || '';
    const deepseekUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions';

    let businessDetails: any = {};

    // If placeId is provided, get details directly
    if (placeId) {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,reviews,rating,user_ratings_total&key=${googleMapsKey}`;
      const detailsResponse = await axios.get(detailsUrl);
      businessDetails = detailsResponse.data.result || {};
    } else {
      // Search for the business
      const query = `${businessName} in ${location}`;
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${googleMapsKey}`;
      const searchResponse = await axios.get(searchUrl);

      if (searchResponse.data.results.length === 0) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
      }

      const place = searchResponse.data.results[0];
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,reviews,rating,user_ratings_total&key=${googleMapsKey}`;
      const detailsResponse = await axios.get(detailsUrl);
      businessDetails = detailsResponse.data.result || {};
    }

    const reviews = businessDetails.reviews || [];

    if (reviews.length === 0) {
      return NextResponse.json({
        business: {
          name: businessDetails.name || businessName,
          address: businessDetails.formatted_address || location,
          rating: businessDetails.rating || 0,
          totalReviews: businessDetails.user_ratings_total || 0,
        },
        analysis: {
          totalReviews: 0,
          averageSentiment: 'neutral',
          sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
          commonComplaints: [],
          commonPraise: [],
          responseRate: 0,
          recommendations: ['No reviews found yet. Encourage customers to leave reviews.'],
        },
      });
    }

    // Analyze reviews with DeepSeek
    const reviewTexts = reviews.map((r: any) => `Rating: ${r.rating}/5\nReview: ${r.text}`).join('\n\n');

    const analysisPrompt = `Analyze these Google Business reviews and provide sentiment analysis:

${reviewTexts}

For each review, determine if the sentiment is positive, negative, or neutral.
Then provide:
1. Average sentiment (positive/negative/neutral)
2. Common complaints (top 3)
3. Common praise (top 3)
4. Response rate estimate (0-100%)

Return ONLY valid JSON with this exact structure:
{
  "sentimentBreakdown": {
    "positive": 5,
    "neutral": 2,
    "negative": 1
  },
  "commonComplaints": [
    "Slow service",
    "High prices"
  ],
  "commonPraise": [
    "Great customer service",
    "Quality products"
  ],
  "responseRate": 45,
  "recommendations": [
    "Respond faster to negative reviews",
    "Highlight your strengths in your description"
  ]
}`;

    const analysisResponse = await axios.post(
      deepseekUrl,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a review analysis expert. Analyze customer reviews and provide actionable insights. Always respond in valid JSON.' },
          { role: 'user', content: analysisPrompt },
        ],
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${deepseekKey}`,
        },
      }
    );

    const analysisData = JSON.parse(analysisResponse.data.choices[0].message.content);

    const totalSentiment = analysisData.sentimentBreakdown.positive + analysisData.sentimentBreakdown.neutral + analysisData.sentimentBreakdown.negative;
    const positivePercent = totalSentiment > 0 ? (analysisData.sentimentBreakdown.positive / totalSentiment) * 100 : 0;

    let averageSentiment = 'neutral';
    if (positivePercent > 60) averageSentiment = 'positive';
    else if (positivePercent < 40) averageSentiment = 'negative';

    return NextResponse.json({
      business: {
        name: businessDetails.name || businessName,
        address: businessDetails.formatted_address || location,
        rating: businessDetails.rating || 0,
        totalReviews: businessDetails.user_ratings_total || 0,
      },
      analysis: {
        totalReviews: reviews.length,
        averageSentiment,
        sentimentBreakdown: analysisData.sentimentBreakdown,
        commonComplaints: analysisData.commonComplaints,
        commonPraise: analysisData.commonPraise,
        responseRate: analysisData.responseRate,
        recommendations: analysisData.recommendations,
      },
      reviews: reviews.slice(0, 10).map((r: any) => ({
        author: r.author_name,
        rating: r.rating,
        text: r.text,
        time: r.time,
      })),
    });
  } catch (error: any) {
    console.error('Review analysis error:', error.response?.data || error.message);

    // Fallback response
    return NextResponse.json({
      business: {
        name: 'Unknown',
        address: 'Unknown',
        rating: 0,
        totalReviews: 0,
      },
      analysis: {
        totalReviews: 0,
        averageSentiment: 'neutral',
        sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
        commonComplaints: ['Unable to fetch reviews'],
        commonPraise: [],
        responseRate: 0,
        recommendations: ['Try searching for the business again'],
      },
      isFallback: true,
    });
  }
}
