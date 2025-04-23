import React from 'react';
import ReactDOM from 'react-dom';
import OverlapWidget from './OverlapWidget';

interface OverlapWidgetOptions {
  tenantId: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark';
  container?: string; // CSS selector for container
  onOverlapCalculated?: (score: number, commonInterests: string[]) => void;
  onChatStarted?: (deepLink: string) => void;
}

declare global {
  interface Window {
    OverlapWidget: {
      init: (options: OverlapWidgetOptions) => void;
    };
  }
}

// The main init function that will be exposed globally
const init = (options: OverlapWidgetOptions) => {
  const { container, ...widgetProps } = options;
  
  // If a custom container is specified, render in that element
  if (container) {
    const containerElement = document.querySelector(container);
    if (containerElement) {
      ReactDOM.render(
        <OverlapWidget {...widgetProps} />,
        containerElement
      );
    } else {
      console.error(`OverlapWidget: Container "${container}" not found`);
    }
  } else {
    // Otherwise, create a container and render in it
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'overlapp-widget-container';
    document.body.appendChild(widgetContainer);
    
    ReactDOM.render(
      <OverlapWidget {...widgetProps} />,
      widgetContainer
    );
  }
};

// Expose the init function globally
window.OverlapWidget = {
  init
};

export { init };