'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Client-side protected route wrapper
 * Redirects to login if user is not authenticated
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login with callback URL for deep linking
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
    }
  }, [user, loading, router, pathname]);

  // Show loading state
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
        </div>
      )
    );
  }

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
