import React from 'react';
import { EngageIndex } from './EngageIndex';
import { EngagePersona } from './EngagePersona';
import { EngageOnline } from './EngageOnline';
import { EngageOffline } from './EngageOffline';
import { SimplifiedEngage } from './SimplifiedEngage';
import { EnhancedEngageIndex } from './EnhancedEngageIndex';
import { EnhancedEngagePersona } from './EnhancedEngagePersona';
import { EnhancedEngageOnline } from './EnhancedEngageOnline';
import { EnhancedEngageOffline } from './EnhancedEngageOffline';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Loader2 } from 'lucide-react';

// This file exports static wrapper components for each engage page
// This prevents the "Rendered fewer hooks than expected" error

export const StaticEngageIndexPage = () => {
  // Wrapped in ErrorBoundary to catch DOM manipulation errors
  return (
    <ErrorBoundary>
      <React.Suspense 
        fallback={
          <div className="container py-8 text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto" />
          </div>
        }
      >
        <div id="engage-index-container">
          <EnhancedEngageIndex />
        </div>
      </React.Suspense>
    </ErrorBoundary>
  );
};

export const StaticEngagePersonaPage = () => {
  // Wrapped in ErrorBoundary to catch DOM manipulation errors
  return (
    <ErrorBoundary
      fallback={
        <div className="container py-8 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
          <p className="text-muted-foreground mb-4">We're having trouble loading this page</p>
          <a href="/engage" className="text-primary hover:underline">
            Return to Engage
          </a>
        </div>
      }
    >
      <React.Suspense 
        fallback={
          <div className="container py-8 text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto" />
            <p className="mt-4">Loading persona view...</p>
          </div>
        }
      >
        <div id="engage-persona-container">
          <EnhancedEngagePersona />
        </div>
      </React.Suspense>
    </ErrorBoundary>
  );
};

export const StaticEngageOnlinePage = () => {
  // Wrapped in ErrorBoundary to catch DOM manipulation errors
  return (
    <ErrorBoundary>
      <React.Suspense 
        fallback={
          <div className="container py-8 text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto" />
          </div>
        }
      >
        <div id="engage-online-container">
          <EnhancedEngageOnline />
        </div>
      </React.Suspense>
    </ErrorBoundary>
  );
};

export const StaticEngageOfflinePage = () => {
  // Wrapped in ErrorBoundary to catch DOM manipulation errors
  return (
    <ErrorBoundary>
      <React.Suspense 
        fallback={
          <div className="container py-8 text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto" />
          </div>
        }
      >
        <div id="engage-offline-container">
          <EnhancedEngageOffline />
        </div>
      </React.Suspense>
    </ErrorBoundary>
  );
};