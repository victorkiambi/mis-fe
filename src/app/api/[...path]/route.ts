import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = "https://mis.fly.dev/api/v1";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const headers = new Headers(request.headers);
  
  const response = await fetch(`${API_BASE_URL}/${path}`, {
    headers: {
      Authorization: headers.get('Authorization') || '',
      'Content-Type': 'application/json',
    },
  });

  return NextResponse.json(await response.json());
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const body = await request.json();
  const headers = new Headers(request.headers);

  const response = await fetch(`${API_BASE_URL}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: headers.get('Authorization') || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return NextResponse.json(await response.json());
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 