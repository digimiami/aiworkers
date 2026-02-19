import { NextRequest, NextResponse } from 'next/server';

export interface BusinessResult {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  healthScore: number;
  niche: string;
}

// Mock business data generator
function generateMockBusinesses(zipCode: string, niche: string, count: number = 15): BusinessResult[] {
  const businesses: BusinessResult[] = [];
  const niches = niche.split(',').map((n) => n.trim());
  const names = [
    'Premier',
    'Elite',
    'Advanced',
    'Professional',
    'Expert',
    'Quality',
    'Superior',
    'Optimal',
    'Stellar',
    'Dynamic',
  ];

  for (let i = 0; i < count; i++) {
    const selectedNiche = niches[i % niches.length];
    const name = `${names[i % names.length]} ${selectedNiche} Services ${i + 1}`;
    const healthScore = Math.floor(Math.random() * 60) + 30; // 30-90

    businesses.push({
      id: `biz_${zipCode}_${i}`,
      name,
      address: `${Math.floor(Math.random() * 9000) + 1000} Main St, ${zipCode}`,
      phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      email: `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
      website: `https://${name.toLowerCase().replace(/\s+/g, '')}.com`,
      healthScore,
      niche: selectedNiche,
    });
  }

  return businesses;
}

export async function POST(request: NextRequest) {
  try {
    const { zipCode, niche } = await request.json();

    if (!zipCode || !niche) {
      return NextResponse.json(
        { error: 'Missing zipCode or niche' },
        { status: 400 }
      );
    }

    // In production, this would call a real business database API
    // For now, we generate mock data
    const businesses = generateMockBusinesses(zipCode, niche);

    return NextResponse.json({
      zipCode,
      niche,
      count: businesses.length,
      businesses,
    });
  } catch (error) {
    console.error('Error searching businesses:', error);
    return NextResponse.json(
      { error: 'Failed to search businesses' },
      { status: 500 }
    );
  }
}
