'use client';

import { ComponentType } from 'react';
import { ProtectedRoute } from './protected-route';

/**
 * Higher-Order Component to protect pages
 * Wraps a component with authentication checking
 *
 * Usage:
 * export default withAuth(DashboardPage);
 */
export function withAuth<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  const WrappedComponent = (props: P) => {
    return (
      <ProtectedRoute fallback={fallback}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  // Copy display name for debugging
  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}
