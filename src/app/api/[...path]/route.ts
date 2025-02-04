import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

const API_BASE_URL = "https://mis.fly.dev/api/v1";

// Helper function to handle CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const requestHeaders = new Headers(request.headers);
  
  try {
    const response = await fetch(`${API_BASE_URL}/${path.join('/')}`, {
      headers: {
        Authorization: requestHeaders.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: corsHeaders(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const body = await request.json();
  const requestHeaders = new Headers(request.headers);

  try {
    const response = await fetch(`${API_BASE_URL}/${path.join('/')}`, {
      method: 'POST',
      headers: {
        Authorization: requestHeaders.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: corsHeaders(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  await context.params; // Await params even if we don't use them
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders(),
      'Access-Control-Allow-Credentials': 'true',
    },
  });
} 