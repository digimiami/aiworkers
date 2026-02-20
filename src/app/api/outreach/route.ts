import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { prospectId, prospectName, type, recipient, subject, content } = await request.json();

    if (!recipient || !content) {
      return NextResponse.json({ error: 'Recipient and content are required' }, { status: 400 });
    }

    // Send email via Resend
    if (type === 'email') {
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        await axios.post('https://api.resend.com/emails', {
          from: 'contact@aiworkers.vip',
          to: recipient,
          subject: subject || `Business Growth Opportunity - ${prospectName}`,
          html: content.replace(/\n/g, '<br>'),
        }, { headers: { Authorization: `Bearer ${resendKey}` } });
      }
    }

    // Send SMS via Twilio
    if (type === 'sms') {
      const sid = process.env.TWILIO_SID;
      const auth = process.env.TWILIO_AUTH;
      const from = process.env.TWILIO_FROM;
      if (sid && auth && from) {
        await axios.post(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
          new URLSearchParams({ To: recipient, From: from, Body: content }),
          { auth: { username: sid, password: auth } }
        );
      }
    }

    // Save to DB
    let dbProspectId = prospectId;
    if (!dbProspectId && prospectName) {
      const prospect = await prisma.prospect.findFirst({ where: { name: prospectName } });
      dbProspectId = prospect?.id;
    }

    if (dbProspectId) {
      await prisma.outreach.create({
        data: { prospectId: dbProspectId, type, recipient, subject, content, status: 'sent' },
      });
    }

    return NextResponse.json({ success: true, message: `${type === 'email' ? 'Email' : 'SMS'} sent successfully` });
  } catch (error: any) {
    console.error('Outreach error:', error.response?.data || error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const outreach = await prisma.outreach.findMany({
      include: { prospect: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ outreach });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
