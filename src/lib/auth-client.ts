/**
 * Client-side Authentication Utilities
 * Use these in Client Components
 */

import { createClient } from './supabase/client';

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
    },
  });

  if (error) {
    console.error('Error signing in with Google:', error.message);
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
