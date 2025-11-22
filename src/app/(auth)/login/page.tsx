'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { signInWithGoogle, signInWithGitHub } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

function LoginForm() {
  const [isLoading, setIsLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  // Detect if user is in a WebView (in-app browser) which Google blocks
  const isInAppBrowser = () => {
    if (typeof window === 'undefined') return false;

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const ua = userAgent.toLowerCase();

    // Detect common in-app browsers that cause OAuth issues
    const inAppBrowserPatterns = [
      'fban',        // Facebook App
      'fbav',        // Facebook App
      'instagram',   // Instagram App
      'twitter',     // Twitter App
      'line',        // Line App
      'wechat',      // WeChat
      'micromessenger', // WeChat alternative name
      'snapchat',    // Snapchat
      'tiktok',      // TikTok
      'linkedin',    // LinkedIn App
    ];

    // Check if user agent matches any in-app browser pattern
    const isInApp = inAppBrowserPatterns.some(pattern => ua.includes(pattern));

    // Also check if it's a WebView on iOS or Android
    const isIosWebView = /(iphone|ipod|ipad).*applewebkit(?!.*safari)/i.test(ua);
    const isAndroidWebView = ua.includes('wv') || (ua.includes('android') && !ua.includes('chrome'));

    return isInApp || isIosWebView || isAndroidWebView;
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading('google');
      setError(null);
      setShowMobileWarning(false);

      // Show warning for in-app browser users before attempting sign-in
      if (isInAppBrowser()) {
        setShowMobileWarning(true);
        setIsLoading(null);
        return;
      }

      await signInWithGoogle(callbackUrl || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      setIsLoading(null);
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      setIsLoading('github');
      setError(null);
      setShowMobileWarning(false);

      // Show warning for in-app browser users before attempting sign-in
      if (isInAppBrowser()) {
        setShowMobileWarning(true);
        setIsLoading(null);
        return;
      }

      await signInWithGitHub(callbackUrl || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      setIsLoading(null);
    }
  };

  const handleMobileContinue = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(provider);
      setError(null);
      setShowMobileWarning(false);

      if (provider === 'google') {
        await signInWithGoogle(callbackUrl || undefined);
      } else {
        await signInWithGitHub(callbackUrl || undefined);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';

      // Provide more helpful error message for mobile OAuth errors
      if (errorMessage.includes('403') || errorMessage.includes('disallowed')) {
        setError(
          'OAuth sign-in is blocked on mobile browsers. Please open this page in your device\'s default browser (Safari for iOS, Chrome for Android) instead of an in-app browser.'
        );
      } else {
        setError(errorMessage);
      }

      setIsLoading(null);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 sm:p-8 space-y-4 sm:space-y-6 w-full max-w-md mx-auto">
      <div className="text-center space-y-2 sm:space-y-3">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
          Welcome to Kilo<br className="hidden sm:block" /><span className="sm:hidden"> </span>Knowledge Base
        </h1>
        <p className="text-slate-400 text-base sm:text-lg font-light px-2">
          Sign in to access your knowledge bases and AI-powered chat
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm">
          <div className="font-semibold mb-1">Sign-in Error</div>
          {error}
        </div>
      )}

      {showMobileWarning && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl p-4 space-y-3">
          <div className="font-semibold">In-App Browser Detected</div>
          <p className="text-sm">
            You're viewing this page in an in-app browser (Instagram, Facebook, Twitter, etc.).
            Google and GitHub block OAuth sign-in in these browsers for security reasons.
          </p>
          <p className="text-sm font-medium">
            To sign in:
          </p>
          <ol className="text-sm space-y-1 ml-4 list-decimal">
            <li>Tap the button below to copy this page's URL</li>
            <li>Open your device's browser (Safari on iOS, Chrome on Android)</li>
            <li>Paste the URL and sign in there</li>
          </ol>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('URL copied! Now paste it in Safari or Chrome.');
            }}
            className="w-full mt-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-sm font-medium transition-colors"
          >
            Copy Page URL
          </button>
        </div>
      )}

      <div className="space-y-2 sm:space-y-3">
        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading !== null}
          className="w-full text-sm sm:text-base"
          size="lg"
        >
          {isLoading === 'google' ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Signing in...
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </>
          )}
        </Button>

        <Button
          onClick={handleGitHubSignIn}
          disabled={isLoading !== null}
          className="w-full bg-slate-700 hover:bg-slate-600 text-sm sm:text-base"
          size="lg"
        >
          {isLoading === 'github' ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Signing in...
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Sign in with GitHub
            </>
          )}
        </Button>
      </div>

      <p className="text-center text-sm text-slate-400">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
