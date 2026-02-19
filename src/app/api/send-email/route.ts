import { NextResponse } from 'next/server';
import axios from 'axios';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_URL = 'https://api.resend.com/emails';

export async function POST(req: Request) {
  try {
    const { email, subject, content, businessName } = await req.json();

    const response = await axios.post(
      RESEND_URL,
      {
        from: 'onboarding@resend.dev',
        to: email || 'delivered@resend.dev', // Use a default for testing if not provided
        subject: subject || `Proposal for ${businessName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #7c3aed;">Service Proposal</h1>
            <p>Hi there,</p>
            <p>We've prepared a custom proposal for <strong>${businessName}</strong>.</p>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${content.replace(/\n/g, '<br>')}
            </div>
            <p>Best regards,<br>The AI Workers Team</p>
          </div>
        `
      },
      {
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('Email sending error:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
