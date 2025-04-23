import React from 'react';
import { createRoot } from 'react-dom/client';
import OverlapWidget from './OverlapWidget';

/**
 * This bundle file is used by the widget initialization script to render the widget
 * in an isolated React environment that won't interfere with the host site.
 */

interface OverlapWidgetOptions {
  tenantId: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark';
}

/**
 * Initialize the widget with the provided options
 * @param options The widget configuration options
 */
function initializeWidget(options: OverlapWidgetOptions) {
  // Find or create the widget container
  let container = document.getElementById('overlapp-widget-container');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'overlapp-widget-container';
    document.body.appendChild(container);
  }
  
  // Create a new React root
  const root = createRoot(container);
  
  // Render the widget component
  root.render(
    <React.StrictMode>
      <OverlapWidget 
        tenantId={options.tenantId}
        position={options.position}
        theme={options.theme}
        onClose={() => {
          // Unmount the widget when closed
          root.unmount();
          if (container && container.parentNode) {
            container.parentNode.removeChild(container);
          }
        }}
      />
    </React.StrictMode>
  );
}

// Listen for initialization events from the loader script
window.addEventListener('overlapp-widget-init', (event: Event) => {
  const customEvent = event as CustomEvent<OverlapWidgetOptions>;
  initializeWidget(customEvent.detail);
});

// Export the initialization function globally for direct usage
(window as any).initOverlapWidget = initializeWidget;