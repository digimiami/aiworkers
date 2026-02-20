import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { businessName, location } = await request.json();

    if (!businessName || !location) {
      return NextResponse.json({ error: 'Business name and location are required' }, { status: 400 });
    }

    const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY || '';
    const deepseekKey = process.env.DEEPSEEK_API_KEY || '';
    const deepseekUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions';

    // Search for the business to get its details and category
    const query = `${businessName} in ${location}`;
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${googleMapsKey}`;
    const searchResponse = await axios.get(searchUrl);

    if (searchResponse.data.results.length === 0) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const mainBusiness = searchResponse.data.results[0];
    const mainDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${mainBusiness.place_id}&fields=name,formatted_address,types,rating,user_ratings_total,website,photos&key=${googleMapsKey}`;
    const mainDetailsResponse = await axios.get(mainDetailsUrl);
    const mainBusinessDetails = mainDetailsResponse.data.result || {};

    // Extract business type/category
    const businessTypes = mainBusinessDetails.types || [];
    const primaryType = businessTypes.find((t: string) => !t.includes('point_of_interest') && !t.includes('establishment')) || businessTypes[0];

    // Search for competitors in the same category
    const competitorQuery = `${primaryType || businessName} in ${location}`;
    const competitorSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(competitorQuery)}&key=${googleMapsKey}`;
    const competitorSearchResponse = await axios.get(competitorSearchUrl);

    // Get top 5 competitors (excluding the main business)
    const competitors = competitorSearchResponse.data.results
      .filter((c: any) => c.place_id !== mainBusiness.place_id)
      .slice(0, 5);

    // Get detailed information for competitors
    const competitorDetails = await Promise.all(
      competitors.map(async (competitor: any) => {
        try {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${competitor.place_id}&fields=name,formatted_address,rating,user_ratings_total,website,photos,opening_hours&key=${googleMapsKey}`;
          const detailsResponse = await axios.get(detailsUrl);
          const details = detailsResponse.data.result || {};

          return {
            id: competitor.place_id,
            name: details.name || competitor.name,
            address: details.formatted_address || competitor.formatted_address,
            rating: details.rating || 0,
            reviewCount: details.user_ratings_total || 0,
            website: details.website || null,
            photosCount: details.photos?.length || 0,
            hasHours: !!details.opening_hours,
          };
        } catch (err) {
          console.error('Error fetching competitor details:', err);
          return {
            id: competitor.place_id,
            name: competitor.name,
            address: competitor.formatted_address,
            rating: competitor.rating || 0,
            reviewCount: competitor.user_ratings_total || 0,
            website: null,
            photosCount: 0,
            hasHours: false,
          };
        }
      })
    );

    // Prepare comparison data
    const mainBizData = {
      id: mainBusiness.place_id,
      name: mainBusinessDetails.name || businessName,
      address: mainBusinessDetails.formatted_address || location,
      rating: mainBusinessDetails.rating || 0,
      reviewCount: mainBusinessDetails.user_ratings_total || 0,
      website: mainBusinessDetails.website || null,
      photosCount: mainBusinessDetails.photos?.length || 0,
      hasHours: !!mainBusinessDetails.opening_hours,
    };

    // Use DeepSeek to analyze competitive position
    const analysisPrompt = `Compare this business with its competitors and provide insights:

Main Business:
- Name: ${mainBizData.name}
- Rating: ${mainBizData.rating}/5 (${mainBizData.reviewCount} reviews)
- Website: ${mainBizData.website ? 'Yes' : 'No'}
- Photos: ${mainBizData.photosCount}

Competitors:
${competitorDetails.map((c, i) => `${i + 1}. ${c.name} - Rating: ${c.rating}/5 (${c.reviewCount} reviews), Website: ${c.website ? 'Yes' : 'No'}, Photos: ${c.photosCount}`).join('\n')}

Provide:
1. Competitive strengths (where main business is ahead)
2. Competitive weaknesses (where competitors are ahead)
3. Key areas to improve
4. Market positioning recommendation

Return ONLY valid JSON:
{
  "strengths": ["item1", "item2"],
  "weaknesses": ["item1", "item2"],
  "improvements": ["item1", "item2"],
  "positioning": "recommendation text"
}`;

    const analysisResponse = await axios.post(
      deepseekUrl,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a competitive analysis expert. Analyze business competition and provide strategic insights. Always respond in valid JSON.' },
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

    const analysis = JSON.parse(analysisResponse.data.choices[0].message.content);

    return NextResponse.json({
      mainBusiness: mainBizData,
      competitors: competitorDetails,
      analysis,
    });
  } catch (error: any) {
    console.error('Competitor analysis error:', error.response?.data || error.message);

    // Fallback response
    return NextResponse.json({
      mainBusiness: {
        id: 'unknown',
        name: 'Unknown',
        address: 'Unknown',
        rating: 0,
        reviewCount: 0,
        website: null,
        photosCount: 0,
        hasHours: false,
      },
      competitors: [],
      analysis: {
        strengths: [],
        weaknesses: [],
        improvements: ['Unable to fetch competitor data'],
        positioning: 'Try searching again',
      },
      isFallback: true,
    });
  }
}
