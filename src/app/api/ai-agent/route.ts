import { NextResponse } from 'next/server';
import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

export async function POST(req: Request) {
  try {
    const { prospectName, businessNiche, conversationHistory, lastMessage } = await req.json();

    const prompt = `
      You are an AI sales assistant for "AI Workers", a company that helps local businesses grow with AI and digital marketing.
      
      Prospect Name: ${prospectName}
      Business Niche: ${businessNiche}
      
      Conversation History:
      ${conversationHistory.map((m: any) => `${m.role}: ${m.content}`).join('\n')}
      
      The prospect just said: "${lastMessage}"
      
      Generate a professional, friendly, and helpful response that addresses their concern or question. 
      Your goal is to book a consultation call or get them to review the proposal we sent.
      Keep the response concise and focused on the value we provide for ${businessNiche} businesses.
    `;

    const response = await axios.post(
      DEEPSEEK_URL,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a helpful sales assistant.' },
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.choices[0].message.content;
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('AI Agent error:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to generate AI response' }, { status: 500 });
  }
}
