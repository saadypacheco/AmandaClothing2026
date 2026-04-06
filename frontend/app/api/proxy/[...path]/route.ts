import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8000';

async function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const search = req.nextUrl.search;
  const url = `${API_URL}/${path}${search}`;

  const headers: HeadersInit = {
    'Content-Type': req.headers.get('content-type') || 'application/json',
  };
  const auth = req.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;

  const body = req.method !== 'GET' && req.method !== 'HEAD'
    ? await req.text()
    : undefined;

  const res = await fetch(url, {
    method: req.method,
    headers,
    body,
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
  });
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
export const OPTIONS = handler;
