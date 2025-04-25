import React from 'react';
import { EngageIndex } from './EngageIndex';
import { EngagePersona } from './EngagePersona';
import { EngageOnline } from './EngageOnline';
import { EngageOffline } from './EngageOffline';
import { SimplifiedEngage } from './SimplifiedEngage';

// This file exports static wrapper components for each engage page
// This prevents the "Rendered fewer hooks than expected" error

export const StaticEngageIndexPage = () => {
  // Using simplified component for now to test the loading issue
  return <SimplifiedEngage />;
};

export const StaticEngagePersonaPage = () => {
  // Using simplified component for now to test the loading issue
  return <SimplifiedEngage />;
};

export const StaticEngageOnlinePage = () => {
  // Using simplified component for now to test the loading issue
  return <SimplifiedEngage />;
};

export const StaticEngageOfflinePage = () => {
  // Using simplified component for now to test the loading issue
  return <SimplifiedEngage />;
};