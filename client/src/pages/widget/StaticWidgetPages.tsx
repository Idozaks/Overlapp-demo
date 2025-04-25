import React from 'react';
import WidgetPage from './WidgetPage';
import DemoPage from './DemoPage';
import SimplifiedWidget from './SimplifiedWidget';

// This file exports static wrapper components for widget pages
// This prevents the "Rendered fewer hooks than expected" error

export const StaticWidgetPageComponent = () => {
  // Using simplified component for now to test the loading issue
  return <SimplifiedWidget />;
};

export const StaticDemoPageComponent = () => {
  // Using simplified component for now to test the loading issue
  return <SimplifiedWidget />;
};