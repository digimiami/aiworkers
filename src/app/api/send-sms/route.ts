import { NextResponse } from 'next/server';
import axios from 'axios';

const TWILIO_SID = process.env.TWILIO_SID || '';
const TWILIO_AUTH = process.env.TWILIO_AUTH || '';
const TWILIO_FROM = process.env.TWILIO_FROM || '';
const TWILIO_URL = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;

export async function POST(req: Request) {
  try {
    const { to, message, businessName } = await req.json();

    // Use URLSearchParams for Twilio's form-urlencoded body
    const params = new URLSearchParams();
    params.append('From', TWILIO_FROM || '+1234567890');
    params.append('To', to);
    params.append('Body', `Hi! This is the AI Workers Team. We've prepared a custom proposal for ${businessName}. ${message}`);

    const authHeader = `Basic ${Buffer.from(`${TWILIO_SID}:${TWILIO_AUTH}`).toString('base64')}`;

    const response = await axios.post(
      TWILIO_URL,
      params,
      {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('SMS sending error:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
  }
}
