import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Edge-compatible JWT check (Next.js middleware runs on the Edge runtime,
// where jsonwebtoken doesn't work — jose is used here instead, purely for
// route gating; API routes still do their own full check with lib/auth.js).
async function getRole(token) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.role;
  } catch {
    return null;
  }
}

export async function middleware(req) {
  const token = req.cookies.get('naura_session')?.value;
  const role = token ? await getRole(token) : null;

  const isAdminPage = req.nextUrl.pathname.startsWith('/admin');
  const isAdminApi = req.nextUrl.pathname.startsWith('/api/admin');

  if ((isAdminPage || isAdminApi) && role !== 'admin') {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
