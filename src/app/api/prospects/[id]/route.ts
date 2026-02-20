import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const prospect = await prisma.prospect.findUnique({
      where: { id },
      include: {
        proposals: { orderBy: { createdAt: 'desc' } },
        landingPages: { orderBy: { createdAt: 'desc' } },
        outreach: { orderBy: { createdAt: 'desc' } },
        bookings: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    return NextResponse.json({ prospect });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
