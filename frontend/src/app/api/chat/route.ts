import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiUrl = 'https://thulani-api-341498038874.us-central1.run.app/api/chat';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Chat Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat response', details: error.message },
      { status: 500 }
    );
  }
}
