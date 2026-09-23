import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const csp = `
    default-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    object-src 'none';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net;
    style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net 'unsafe-inline';
    img-src 'self' data: blob: https: http://localhost:* http://113.20.123.20:*;
    connect-src 'self' https://api-dvcbqp.ebizoffice.vn https://unpkg.com https://cdn.jsdelivr.net http://localhost:* http://113.20.123.20:*;
    font-src 'self' https://fonts.gstatic.com;
    worker-src 'self' blob:;
    manifest-src 'self';
  `.replace(/\n/g, ' ').trim();

  res.headers.set('Content-Security-Policy', csp);
  return res;
}
