import { NextResponse } from 'next/server';
import axios from 'axios';

const HUNTER_API_KEY = process.env.HUNTER_API_KEY || '';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  const niche = searchParams.get('niche');

  if (!location || !niche) {
    return NextResponse.json({ error: 'Location and niche are required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  const query = `${niche} in ${location}`;

  try {
    // 1. Find places
    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
    const searchResponse = await axios.get(textSearchUrl);
    const results = searchResponse.data.results;

    // 2. Get details for each place (to get more photos, reviews, etc.)
    const detailedResults = await Promise.all(
      results.slice(0, 10).map(async (place: any) => {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,photos,opening_hours&key=${apiKey}`;
        const detailsResponse = await axios.get(detailsUrl);
        const details = detailsResponse.data.result || {};

        let email = null;
        // Try to find email using Hunter.io if website is available
        if (details.website && HUNTER_API_KEY) {
          try {
            const url = new URL(details.website.startsWith('http') ? details.website : `https://${details.website}`);
            const domain = url.hostname.replace('www.', '');
            const hunterUrl = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${HUNTER_API_KEY}`;
            const hunterRes = await axios.get(hunterUrl);
            const hunterData = hunterRes.data?.data;
            if (hunterData?.emails && hunterData.emails.length > 0) {
              email = hunterData.emails[0].value;
            }
          } catch (err) {
            // Silently fail email lookup
            console.error('Email lookup error for', details.name);
          }
        }

        return {
          id: place.place_id,
          name: details.name || place.name,
          address: details.formatted_address || place.formatted_address,
          phone: details.formatted_phone_number || 'No Phone',
          website: details.website || null,
          email: email,
          rating: details.rating || 0,
          reviewCount: details.user_ratings_total || 0,
          photosCount: details.photos?.length || 0,
          location: place.geometry.location,
        };
      })
    );

    return NextResponse.json({ results: detailedResults });
  } catch (error: any) {
    console.error('Search error:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 });
  }
}
