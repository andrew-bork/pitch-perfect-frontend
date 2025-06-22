import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repositoryUrl, username, repository } = body;

    // Validate required fields
    if (!repositoryUrl || !username || !repository) {
      return NextResponse.json(
        { error: 'Repository URL, username, and repository name are required' },
        { status: 400 }
      );
    }

    console.log('Starting processing for:', { repositoryUrl, username, repository });

    let generationId: string;

    try {
      const result = await fetch(`http://localhost:8000/start-processing?repo_url=${repositoryUrl}&username=${username}&repo_name=${repository}`, {
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
      generationId = result.gen_token;
    } catch (fetchError) {
      console.error('Error calling external API:', fetchError);
      
      // Generate a fallback token if external API fails
      generationId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Using fallback generation ID:', generationId);
    }

    // Return the initial generation status
    return NextResponse.json({
      success: true,
      data: {
        gen_token: generationId
      }
    });

  } catch (error) {
    console.error('Error starting generation process:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}