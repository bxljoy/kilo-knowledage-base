/**
 * Next.js Middleware for Authentication
 * Handles auth state and protects routes
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      // Store the intended destination for deep linking
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/signup')) {
    if (user) {
      // Check for callback URL to support deep linking
      const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
      const redirectUrl = callbackUrl && callbackUrl.startsWith('/')
        ? new URL(callbackUrl, request.url)
        : new URL('/dashboard', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
