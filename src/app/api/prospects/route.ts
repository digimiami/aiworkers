import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const prospects = await prisma.prospect.findMany({
      include: { proposals: true, landingPages: true, outreach: true, bookings: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ prospects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Use upsert when placeId is provided to handle duplicates
    if (data.placeId) {
      const prospect = await prisma.prospect.upsert({
        where: { placeId: data.placeId },
        update: {
          name: data.name,
          address: data.address,
          phone: data.phone,
          website: data.website,
          email: data.email,
          rating: data.rating != null ? parseFloat(String(data.rating)) : undefined,
          reviewCount: data.reviewCount != null ? parseInt(String(data.reviewCount)) : undefined,
          niche: data.niche,
          city: data.city,
          healthScore: data.healthScore != null ? parseInt(String(data.healthScore)) : undefined,
          missing: data.missing,
        },
        create: {
          placeId: data.placeId,
          name: data.name,
          address: data.address,
          phone: data.phone,
          website: data.website,
          email: data.email,
          rating: data.rating != null ? parseFloat(String(data.rating)) : null,
          reviewCount: data.reviewCount != null ? parseInt(String(data.reviewCount)) : null,
          niche: data.niche,
          city: data.city,
          healthScore: data.healthScore != null ? parseInt(String(data.healthScore)) : null,
          missing: data.missing,
        },
      });
      return NextResponse.json({ prospect });
    }

    // Fallback to create if no placeId
    const prospect = await prisma.prospect.create({ data });
    return NextResponse.json({ prospect });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await prisma.prospect.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
