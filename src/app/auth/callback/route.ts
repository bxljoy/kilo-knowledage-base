/**
 * Auth Callback Route
 * Handles OAuth callback from Google
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const callbackUrl = requestUrl.searchParams.get('callbackUrl');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to callback URL if provided (deep linking), otherwise go to dashboard
  const redirectUrl = callbackUrl && callbackUrl.startsWith('/')
    ? `${origin}${callbackUrl}`
    : `${origin}/dashboard`;

  return NextResponse.redirect(redirectUrl);
}
