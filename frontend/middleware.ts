import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/dashboard', '/profile', '/report', '/redeem'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Clear cookie if requested via query param
  if (pathname === '/login' && req.nextUrl.searchParams.get('clear') === '1') {
    const cleanUrl = req.nextUrl.clone();
    cleanUrl.searchParams.delete('clear');
    const res = NextResponse.redirect(cleanUrl);
    res.cookies.delete('token');
    return res;
  }

  // Redirect logged-in users away from auth pages
  if ((pathname === '/login' || pathname === '/signup') && token) {
    const dashUrl = req.nextUrl.clone();
    dashUrl.pathname = '/dashboard';
    return NextResponse.redirect(dashUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/report/:path*', '/redeem/:path*', '/login', '/signup'],
};
