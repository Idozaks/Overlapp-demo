/**
 * OverlapLite Widget Initialization Script
 * 
 * This script is loaded from the host website and initializes the OverlapLite widget.
 * It creates a container element and loads the widget script.
 */

interface OverlapWidgetOptions {
  tenantId: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark';
}

declare global {
  interface Window {
    OverlapWidget: {
      init: (options: OverlapWidgetOptions) => void;
      close: () => void;
    };
  }
}

// Self-executing function to avoid polluting global scope
(function() {
  let widgetContainer: HTMLElement | null = null;
  let isInitialized = false;

  /**
   * Initialize the widget with the given options
   */
  function init(options: OverlapWidgetOptions) {
    if (isInitialized) {
      console.warn('OverlapLite Widget is already initialized');
      return;
    }

    // Create container element
    widgetContainer = document.createElement('div');
    widgetContainer.id = 'overlapp-widget-container';
    document.body.appendChild(widgetContainer);

    // Load the widget bundle
    const script = document.createElement('script');
    script.src = `${window.location.origin}/widget/bundle.js`;
    script.onload = () => {
      // Initialize the widget when bundle is loaded
      if (window.OverlapWidget) {
        // Pass the options to the bundle script
        const event = new CustomEvent('overlapp-widget-init', { detail: options });
        window.dispatchEvent(event);
        isInitialized = true;
      }
    };
    document.head.appendChild(script);
  }

  /**
   * Close and clean up the widget
   */
  function close() {
    if (widgetContainer && widgetContainer.parentNode) {
      widgetContainer.parentNode.removeChild(widgetContainer);
      widgetContainer = null;
      isInitialized = false;
    }
  }

  // Expose public API
  window.OverlapWidget = {
    init,
    close
  };

  // Auto-initialize if script has data attributes
  const script = document.currentScript as HTMLScriptElement;
  if (script) {
    const tenantId = script.getAttribute('data-tenant-id');
    if (tenantId) {
      const position = script.getAttribute('data-position') as OverlapWidgetOptions['position'] || 'bottom-right';
      const theme = script.getAttribute('data-theme') as OverlapWidgetOptions['theme'] || 'light';
      
      init({
        tenantId,
        position,
        theme
      });
    }
  }
})();

export {};