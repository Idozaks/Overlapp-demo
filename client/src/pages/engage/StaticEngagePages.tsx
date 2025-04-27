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

// This file exports static wrapper components for each engage page
// This prevents the "Rendered fewer hooks than expected" error

export const StaticEngageIndexPage = () => {
  // Using enhanced components now that we've fixed the loading issues
  return <EnhancedEngageIndex />;
};

export const StaticEngagePersonaPage = () => {
  // Wrap the EnhancedEngagePersona component in error boundaries and safe mounting
  // to prevent "Cannot read properties of null (reading 'appendChild')" errors
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <div id="engage-persona-container">
        <EnhancedEngagePersona />
      </div>
    </React.Suspense>
  );
};

export const StaticEngageOnlinePage = () => {
  // Using enhanced components now that we've fixed the loading issues
  return <EnhancedEngageOnline />;
};

export const StaticEngageOfflinePage = () => {
  // Using enhanced components now that we've fixed the loading issues
  return <EnhancedEngageOffline />;
};