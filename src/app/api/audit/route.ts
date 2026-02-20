import { NextResponse } from 'next/server';
import axios from 'axios';

interface AuditScore {
  category: string;
  score: number;
  recommendation: string;
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
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,photos,opening_hours,business_status,types,reviews&key=${googleMapsKey}`;
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
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,photos,opening_hours,business_status,types,reviews&key=${googleMapsKey}`;
      const detailsResponse = await axios.get(detailsUrl);
      businessDetails = detailsResponse.data.result || {};
    }

    // Prepare audit data
    const auditData = {
      name: businessDetails.name || businessName,
      address: businessDetails.formatted_address || location,
      phone: businessDetails.formatted_phone_number || 'Not listed',
      website: businessDetails.website || null,
      rating: businessDetails.rating || 0,
      reviewCount: businessDetails.user_ratings_total || 0,
      photosCount: businessDetails.photos?.length || 0,
      hasHours: !!businessDetails.opening_hours,
      businessStatus: businessDetails.business_status || 'OPERATIONAL',
      categories: businessDetails.types || [],
      reviewsCount: businessDetails.reviews?.length || 0,
    };

    // Use DeepSeek to generate audit scores
    const auditPrompt = `Analyze this business profile and provide audit scores for each category:

Business Name: ${auditData.name}
Address: ${auditData.address}
Phone: ${auditData.phone}
Website: ${auditData.website || 'Not available'}
Google Rating: ${auditData.rating}/5 (${auditData.reviewCount} reviews)
Photos: ${auditData.photosCount}
Business Hours Listed: ${auditData.hasHours ? 'Yes' : 'No'}
Business Status: ${auditData.businessStatus}
Categories: ${auditData.categories.join(', ')}

Score each category from 0-100 and provide recommendations:
1. Business Hours - Is the business hours information complete and accurate?
2. Categories - Are the business categories/types properly set?
3. Description - Does the business have a complete description?
4. Photos - Does the business have enough quality photos (10+)?
5. Reviews - Does the business have sufficient reviews (50+)?
6. Website - Does the business have an active website?
7. Q&A - Does the business engage with Q&A section?

Return ONLY valid JSON with this exact structure:
{
  "overallGrade": "A",
  "overallScore": 85,
  "scores": [
    {
      "category": "Business Hours",
      "score": 80,
      "recommendation": "Ensure hours are updated during holidays"
    }
  ]
}`;

    const auditResponse = await axios.post(
      deepseekUrl,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a Google Business Profile audit expert. Analyze businesses and provide detailed audit scores. Always respond in valid JSON.' },
          { role: 'user', content: auditPrompt },
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

    const auditResult = JSON.parse(auditResponse.data.choices[0].message.content);

    return NextResponse.json({
      business: auditData,
      audit: auditResult,
    });
  } catch (error: any) {
    console.error('Audit error:', error.response?.data || error.message);

    // Fallback audit if API fails
    const { businessName, location } = await request.json();
    const fallbackScores = [
      { category: 'Business Hours', score: 60, recommendation: 'Add complete business hours' },
      { category: 'Categories', score: 70, recommendation: 'Verify and update business categories' },
      { category: 'Description', score: 50, recommendation: 'Write a detailed business description' },
      { category: 'Photos', score: 40, recommendation: 'Add at least 10 high-quality photos' },
      { category: 'Reviews', score: 55, recommendation: 'Encourage customers to leave reviews' },
      { category: 'Website', score: 30, recommendation: 'Create or optimize your website' },
      { category: 'Q&A', score: 45, recommendation: 'Monitor and respond to customer questions' },
    ];

    const avgScore = Math.round(fallbackScores.reduce((sum, s) => sum + s.score, 0) / fallbackScores.length);
    const grade = avgScore >= 90 ? 'A' : avgScore >= 80 ? 'B' : avgScore >= 70 ? 'C' : avgScore >= 60 ? 'D' : 'F';

    return NextResponse.json({
      business: {
        name: businessName,
        address: location,
        phone: 'Not available',
        website: null,
        rating: 0,
        reviewCount: 0,
        photosCount: 0,
      },
      audit: {
        overallGrade: grade,
        overallScore: avgScore,
        scores: fallbackScores,
      },
      isFallback: true,
    });
  }
}
