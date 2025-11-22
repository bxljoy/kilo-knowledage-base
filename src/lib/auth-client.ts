/**
 * Client-side Authentication Utilities
 * Use these in Client Components
 */

import { createClient } from './supabase/client';

/**
 * Detect if we're in a mobile browser that might use WebView
 */
function isMobileBrowser() {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  // Check for mobile devices
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    userAgent.toLowerCase()
  );
}

/**
 * Sign in with Google OAuth
 * @param callbackUrl - Optional URL to redirect to after authentication
 */
export async function signInWithGoogle(callbackUrl?: string) {
  const supabase = createClient();

  // Build redirect URL with callback parameter for deep linking
  let redirectTo = `${window.location.origin}/auth/callback`;
  if (callbackUrl) {
    redirectTo += `?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Error signing in with Google:', error.message);
    throw error;
  }

  return data;
}

/**
 * Sign in with GitHub OAuth
 * @param callbackUrl - Optional URL to redirect to after authentication
 */
export async function signInWithGitHub(callbackUrl?: string) {
  const supabase = createClient();

  // Build redirect URL with callback parameter for deep linking
  let redirectTo = `${window.location.origin}/auth/callback`;
  if (callbackUrl) {
    redirectTo += `?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo,
    },
  });

  if (error) {
    console.error('Error signing in with GitHub:', error.message);
    throw error;
  }

  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
}

/**
 * Get current user (client-side)
 */
export async function getCurrentUser() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting user:', error.message);
    return null;
  }

  return user;
}
