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


    const result = await fetch(`http://localhost:8000/get-slides?gen_token=${gen_token}`, {
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    }) 
        .then(res => res.json());

    console.log(result);


    // Return mock slides data
    return NextResponse.json({
      success: true,
      slides: result.slides
    });

  } catch (error) {
    console.error('Error in slides generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 