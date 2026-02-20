import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || (process.env.TELEGRAM_BOT_TOKEN || '');
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface TelegramNotification {
  chatId: string;
  type: 'proposal_opened' | 'prospect_replied' | 'appointment_booked';
  prospectName: string;
  businessName?: string;
  details?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { chatId, type, prospectName, businessName, details } = await request.json();

    if (!chatId || !type || !prospectName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format message based on notification type
    let message = '';
    switch (type) {
      case 'proposal_opened':
        message = `📧 Proposal Opened!\n\n${prospectName} from ${businessName || 'Unknown'} has opened your proposal.`;
        break;
      case 'prospect_replied':
        message = `💬 New Reply!\n\n${prospectName} from ${businessName || 'Unknown'} has replied to your email.\n\nMessage: ${details || 'No details provided'}`;
        break;
      case 'appointment_booked':
        message = `📅 Appointment Booked!\n\n${prospectName} from ${businessName || 'Unknown'} has booked an appointment.\n\nDetails: ${details || 'No details provided'}`;
        break;
      default:
        message = `🔔 Notification: ${prospectName}`;
    }

    // Send message to Telegram
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Telegram API error:', error);
      return NextResponse.json(
        { error: 'Failed to send Telegram notification' },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      messageId: data.result.message_id,
    });
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get bot info
    const response = await fetch(`${TELEGRAM_API_URL}/getMe`);
    const data = await response.json();

    return NextResponse.json({
      botName: data.result.first_name,
      botUsername: data.result.username,
      connected: true,
    });
  } catch (error) {
    console.error('Error getting bot info:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Telegram' },
      { status: 500 }
    );
  }
}
