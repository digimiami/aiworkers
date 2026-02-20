import { NextResponse } from 'next/server';

export async function GET() {
  const llms = [
    { id: 'deepseek', name: 'DeepSeek', available: !!process.env.DEEPSEEK_API_KEY },
    { id: 'manus', name: 'Manus (GPT-4.1-mini)', available: !!process.env.MANUS_API_KEY },
    { id: 'kimi', name: 'Kimi', available: !!process.env.KIMI_API },
    { id: 'gemini', name: 'Gemini', available: !!process.env.GEMINI_API },
    { id: 'openai', name: 'OpenAI', available: !!process.env.OPENAI_KEY },
  ];
  return NextResponse.json({ llms });
}
