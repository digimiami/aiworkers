import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prospectName, businessName, auditFindings, tone, email } = await request.json();

    if (!prospectName || !businessName || !auditFindings) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate cold email using DeepSeek
    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY || ''}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are an expert cold email copywriter. Write a personalized cold email in a ${tone} tone. 
            The email should be concise (150-200 words), reference specific business problems from the audit, 
            and include a clear call-to-action. Do not include subject line, just the email body.`,
          },
          {
            role: 'user',
            content: `Write a cold email for ${prospectName} at ${businessName}. 
            Their business audit found these issues: ${auditFindings}. 
            Use a ${tone} tone that appeals to their pain points.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!deepseekResponse.ok) {
      const error = await deepseekResponse.text();
      console.error('DeepSeek API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate email with DeepSeek' },
        { status: 500 }
      );
    }

    const deepseekData = await deepseekResponse.json();
    const emailBody = deepseekData.choices[0].message.content;

    // Generate subject line
    const subjectResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY || ''}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Generate a compelling email subject line (5-8 words max) that would grab attention for a cold email.',
          },
          {
            role: 'user',
            content: `Subject line for cold email to ${prospectName} at ${businessName} about their business issues: ${auditFindings}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 50,
      }),
    });

    const subjectData = await subjectResponse.json();
    const subject = subjectData.choices[0].message.content;

    return NextResponse.json({
      subject: subject.trim(),
      body: emailBody.trim(),
      prospectName,
      businessName,
      email,
    });
  } catch (error) {
    console.error('Error generating cold email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
