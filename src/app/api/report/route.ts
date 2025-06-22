import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get session token from query parameters
    const { searchParams } = new URL(request.url);
    const gen_token = searchParams.get('gen_token');

    // Validate session token
    if (!gen_token) {
      return NextResponse.json(
        { error: 'Missing generation token' },
        { status: 401 }
      );
    }

    const result = await fetch(`http://localhost:8000/get-market-research-report?gen_token=${gen_token}`, {
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    }) 
        .then(res => res.json());

    console.log(result);

    // Return mock report data
    return NextResponse.json({
      success: true,
      data: {
        report: result.market_research_report,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in report generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 