import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// This component provides a consistent way to wrap lazy-loaded components
// with a Suspense boundary and fallback UI
export interface SuspenseWrapperProps {
  component: React.ComponentType;
  fallback?: React.ReactNode;
}

export default function SuspenseWrapper({ 
  component: Component, 
  fallback 
}: SuspenseWrapperProps) {
  const defaultFallback = (
    <div className="container py-12 text-center">
      <Loader2 className="h-10 w-10 animate-spin mx-auto" />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <Component />
    </Suspense>
  );
}