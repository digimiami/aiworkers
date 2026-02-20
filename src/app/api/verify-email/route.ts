import { NextResponse } from 'next/server';
import axios from 'axios';

const HUNTER_API_KEY = process.env.HUNTER_API_KEY || '';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const verifyUrl = `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${HUNTER_API_KEY}`;
    const res = await axios.get(verifyUrl);
    const data = res.data?.data;

    if (!data) {
      return NextResponse.json({ error: 'No verification data returned' }, { status: 404 });
    }

    return NextResponse.json({
      email: data.email,
      status: data.status, // valid, invalid, accept_all, webmail, disposable, unknown
      result: data.result, // deliverable, undeliverable, risky, unknown
      score: data.score,
      isDisposable: data.disposable || false,
      isWebmail: data.webmail || false,
      isMxRecordFound: data.mx_records || false,
      isSMTPValid: data.smtp_server || false,
      isFreeProvider: data.webmail || false,
      sources: data.sources || 0,
    });
  } catch (error: any) {
    console.error('Verify email error:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 });
  }
}
