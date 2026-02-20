import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const name = data.name || data.clientName;
    const email = data.email || data.clientEmail;
    const phone = data.phone || data.clientPhone || '';
    const date = data.date || data.selectedDate;
    const time = data.time || data.selectedTime;
    const notes = data.notes || data.preferredService || '';

    if (!name || !email || !date || !time) {
      return NextResponse.json({ error: 'Name, email, date and time are required' }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: { clientName: name, clientEmail: email, clientPhone: phone, date, time, notes, status: 'confirmed' },
    });

    // Send confirmation email to client
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        await axios.post('https://api.resend.com/emails', {
          from: 'contact@aiworkers.vip',
          to: email,
          subject: 'Your Call is Confirmed - AI Workers',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h1 style="color:#7c3aed;">Call Confirmed!</h1>
            <p>Hi ${name},</p>
            <p>Your consultation call has been confirmed:</p>
            <div style="background:#f3f4f6;padding:20px;border-radius:8px;margin:20px 0;">
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Time:</strong> ${time}</p>
              ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
            </div>
            <p>We look forward to speaking with you!</p>
            <p>Best regards,<br>AI Workers Team</p>
          </div>`,
        }, { headers: { Authorization: `Bearer ${resendKey}` } });
      } catch (e: any) { console.error('Email error:', e.response?.data || e.message); }
    }

    // Notify admin via Telegram
    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
    if (tgToken && chatId) {
      try {
        await axios.post(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          chat_id: chatId,
          text: `📞 New Booking!\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nDate: ${date}\nTime: ${time}\nNotes: ${notes || 'None'}`,
        });
      } catch (e) { console.error('Telegram error:', e); }
    }

    return NextResponse.json({ success: true, booking, message: 'Booking confirmed! Confirmation email sent.' });
  } catch (error: any) {
    console.error('Booking error:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to process booking' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ bookings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
