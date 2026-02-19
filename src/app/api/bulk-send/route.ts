import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { businesses, proposalTemplate } = await request.json();

    if (!businesses || !Array.isArray(businesses) || businesses.length === 0) {
      return NextResponse.json(
        { error: 'No businesses provided' },
        { status: 400 }
      );
    }

    if (!proposalTemplate) {
      return NextResponse.json(
        { error: 'No proposal template provided' },
        { status: 400 }
      );
    }

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // Simulate sending emails to each business
    for (const business of businesses) {
      try {
        // In production, this would use Resend API
        // For now, we simulate the send
        const success = Math.random() > 0.1; // 90% success rate

        if (success) {
          results.push({
            businessId: business.id,
            businessName: business.name,
            email: business.email,
            status: 'sent',
            timestamp: new Date().toISOString(),
          });
          successCount++;
        } else {
          results.push({
            businessId: business.id,
            businessName: business.name,
            email: business.email,
            status: 'failed',
            error: 'Email delivery failed',
            timestamp: new Date().toISOString(),
          });
          failureCount++;
        }
      } catch (error) {
        results.push({
          businessId: business.id,
          businessName: business.name,
          email: business.email,
          status: 'failed',
          error: String(error),
          timestamp: new Date().toISOString(),
        });
        failureCount++;
      }
    }

    return NextResponse.json({
      totalSent: businesses.length,
      successCount,
      failureCount,
      results,
    });
  } catch (error) {
    console.error('Error bulk sending:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
