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

const loadDependencies = async () => {
  // Load React and React DOM
  await loadScript('https://unpkg.com/react@17/umd/react.production.min.js');
  await loadScript('https://unpkg.com/react-dom@17/umd/react-dom.production.min.js');
  
  // Load widget script
  await loadScript(`${getOrigin()}/widget/bundle.js`);
};

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};

const getOrigin = (): string => {
  // Determine the appropriate base URL based on the current environment
  const scriptSrc = document.currentScript?.getAttribute('src') || '';
  if (scriptSrc) {
    const scriptUrl = new URL(scriptSrc, window.location.href);
    return `${scriptUrl.protocol}//${scriptUrl.host}`;
  }
  return '';
};

const init = async (options: OverlapWidgetOptions) => {
  try {
    if (!options.tenantId) {
      console.error('OverlapWidget: tenantId is required');
      return;
    }
    
    // Load all required dependencies
    await loadDependencies();
    
    // Initialize the widget
    if (typeof window.OverlapWidget?.init === 'function') {
      window.OverlapWidget.init(options);
    } else {
      console.error('OverlapWidget: Failed to initialize. Widget not found.');
    }
  } catch (error) {
    console.error('OverlapWidget: Failed to initialize', error);
  }
};

// Export the init function globally
window.OverlapWidget = {
  init
};

// Auto initialize if the script has data-tenant-id attribute
document.addEventListener('DOMContentLoaded', () => {
  const script = document.currentScript;
  const tenantId = script?.getAttribute('data-tenant-id');
  
  if (tenantId) {
    const position = script?.getAttribute('data-position') as OverlapWidgetOptions['position'] || 'bottom-right';
    const theme = script?.getAttribute('data-theme') as OverlapWidgetOptions['theme'] || 'light';
    
    init({
      tenantId,
      position,
      theme
    });
  }
});

// Export init for module usage
export { init };