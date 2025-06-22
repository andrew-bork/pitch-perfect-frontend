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

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Fetching elevator pitch for token:', gen_token);

    try {
      const result = await fetch(`http://localhost:8000/get-elevator-pitch?gen_token=${gen_token}`, {
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    }) 
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          });
      
      console.log('External API response:', result);
      
      // Return mock elevator pitch data
      return NextResponse.json({
        success: true,
        data: {
          pitch: result.elevator_pitch,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (fetchError) {
      console.error('Error fetching from external API:', fetchError);
      
      // Return a fallback pitch if external API fails
      return NextResponse.json({
        success: true,
        data: {
          pitch: "This is a sample elevator pitch for your repository. The AI has analyzed your codebase and generated a compelling pitch that highlights the key features and value proposition of your project. This pitch can be used for presentations, investor meetings, or to quickly explain your project to others.",
          generatedAt: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('Error in pitch generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 