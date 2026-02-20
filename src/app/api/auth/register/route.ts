import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'aiworkers-dev-secret-change-in-production';

// GET: Check if any users exist (for first-time setup detection)
export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({ noUsers: userCount === 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Register a new user (admin-only, or first-time setup)
export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role = 'user' } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;

    if (!isFirstUser) {
      // Verify the caller is an authenticated admin
      const token = req.cookies.get('auth-token')?.value;
      if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
        if (decoded.role !== 'admin') {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const finalRole = isFirstUser ? 'admin' : role;

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: finalRole },
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
