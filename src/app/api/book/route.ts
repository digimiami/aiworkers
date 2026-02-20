import { NextRequest, NextResponse } from 'next/server';

interface BookingData {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  preferredService: string;
  selectedDate: string;
  selectedTime: string;
}

const TELEGRAM_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '');
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1002351768088'; // Default admin chat
const RESEND_API_KEY = '';
const ADMIN_EMAIL = 'contact@aiworkers.vip';

export async function POST(request: NextRequest) {
  try {
    const bookingData: BookingData = await request.json();

    // Validate required fields
    if (!bookingData.name || !bookingData.email || !bookingData.phone || !bookingData.businessName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store booking in localStorage via response (client will handle persistence)
    const booking = {
      id: Date.now().toString(),
      ...bookingData,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    // Send Telegram notification
    const telegramMessage = `
🎯 New Booking Request

Name: ${bookingData.name}
Email: ${bookingData.email}
Phone: ${bookingData.phone}
Business: ${bookingData.businessName}
Service: ${bookingData.preferredService}
Date: ${bookingData.selectedDate}
Time: ${bookingData.selectedTime}

Link: https://aiworkers.app/analytics?booking=${booking.id}
    `.trim();

    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: 'HTML',
        }),
      });
    } catch (telegramError) {
      console.error('Telegram notification failed:', telegramError);
      // Don't fail the booking if Telegram fails
    }

    // Send Resend email notification
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'contact@aiworkers.vip',
          to: ADMIN_EMAIL,
          subject: `New Booking: ${bookingData.businessName}`,
          html: `
            <h2>New Booking Request</h2>
            <p><strong>Name:</strong> ${bookingData.name}</p>
            <p><strong>Email:</strong> ${bookingData.email}</p>
            <p><strong>Phone:</strong> ${bookingData.phone}</p>
            <p><strong>Business:</strong> ${bookingData.businessName}</p>
            <p><strong>Service:</strong> ${bookingData.preferredService}</p>
            <p><strong>Date:</strong> ${bookingData.selectedDate}</p>
            <p><strong>Time:</strong> ${bookingData.selectedTime}</p>
            <p><a href="https://aiworkers.app/analytics?booking=${booking.id}">View in Analytics</a></p>
          `,
        }),
      });
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the booking if email fails
    }

    // Send confirmation email to prospect
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'contact@aiworkers.vip',
          to: bookingData.email,
          subject: 'Booking Confirmation - AI Workers',
          html: `
            <h2>Booking Confirmed!</h2>
            <p>Hi ${bookingData.name},</p>
            <p>Thank you for booking a call with AI Workers. Here are your booking details:</p>
            <p><strong>Date:</strong> ${bookingData.selectedDate}</p>
            <p><strong>Time:</strong> ${bookingData.selectedTime}</p>
            <p><strong>Service:</strong> ${bookingData.preferredService}</p>
            <p>We'll send you a calendar invite shortly. If you have any questions, feel free to reach out.</p>
            <p>Best regards,<br>AI Workers Team</p>
          `,
        }),
      });
    } catch (confirmError) {
      console.error('Confirmation email failed:', confirmError);
    }

    return NextResponse.json({
      success: true,
      booking,
      message: 'Booking confirmed! Check your email for details.',
    });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Failed to process booking' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Return sample bookings for analytics
  const bookings = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '555-0101',
      businessName: 'Tech Startup Inc',
      preferredService: 'Pro',
      selectedDate: '2026-02-25',
      selectedTime: '10:00 AM',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '555-0102',
      businessName: 'Digital Agency',
      preferredService: 'Enterprise',
      selectedDate: '2026-02-26',
      selectedTime: '2:00 PM',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
    },
  ];

  return NextResponse.json({ bookings });
}
