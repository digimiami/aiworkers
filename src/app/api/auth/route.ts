import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Simple auth - in production use NextAuth or similar
export async function POST(request: NextRequest) {
  try {
    const { action, email, password, name, role } = await request.json();

    if (action === 'register') {
      if (!email || !password || !name) {
        return NextResponse.json({ error: 'Email, password and name are required' }, { status: 400 });
      }
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      }
      // Simple hash (in production use bcrypt)
      const hashedPassword = Buffer.from(password).toString('base64');
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, name, role: role || 'user' },
      });
      return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    }

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      const hashedPassword = Buffer.from(password).toString('base64');
      if (user.password !== hashedPassword) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
