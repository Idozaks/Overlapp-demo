/**
 * OverlapLite Widget Initialization Script
 * 
 * This script is included by third-party websites to load and initialize
 * the OverlapLite widget. It creates an iframe that loads the widget
 * and handles communication between the host site and the widget.
 */

(function() {
  // Widget configuration
  let widgetConfig = {
    tenantId: null,
    position: 'bottom-right',
    theme: 'light',
    demoMode: false,
  };

  // Widget DOM elements
  let widgetContainer = null;
  let widgetButton = null;
  let widgetFrame = null;
  let widgetOverlay = null;
  let isWidgetOpen = false;

  // Create the OverlapWidget global namespace
  window.OverlapWidget = {
    /**
     * Initialize the widget with configuration
     * @param {Object} config Widget configuration
     */
    init: function(config) {
      console.log('Initializing OverlapLite Widget', config);
      
      // Merge config with defaults
      widgetConfig = { ...widgetConfig, ...config };
      
      if (!widgetConfig.tenantId && !widgetConfig.demoMode) {
        console.error('OverlapLite Widget Error: No tenant ID provided');
        return;
      }
      
      // Create widget container if it doesn't exist
      createWidgetContainer();
      
      // Create toggle button
      createWidgetButton();
      
      // Setup event listeners
      setupEventListeners();
      
      console.log('OverlapLite Widget initialized successfully');
    },
    
    /**
     * Open the widget
     */
    open: function() {
      console.log('Opening OverlapLite Widget');
      openWidget();
    },
    
    /**
     * Close the widget
     */
    close: function() {
      console.log('Closing OverlapLite Widget');
      closeWidget();
    },
    
    /**
     * Toggle the widget open/closed state
     */
    toggle: function() {
      console.log('Toggling OverlapLite Widget');
      toggleWidget();
    },
    
    /**
     * Simulate a QR code scan (for demo purposes)
     */
    simulateScan: function() {
      console.log('Simulating QR code scan');
      if (widgetFrame) {
        widgetFrame.contentWindow.postMessage({
          type: 'SIMULATE_SCAN',
          userId: 11 // Use a default test user ID
        }, '*');
      }
    },
    
    /**
     * Analyze the overlap (for demo purposes)
     */
    analyzeOverlap: function() {
      console.log('Analyzing overlap');
      if (widgetFrame) {
        widgetFrame.contentWindow.postMessage({
          type: 'ANALYZE_OVERLAP'
        }, '*');
      }
    }
  };
  
  /**
   * Create the widget container
   */
  function createWidgetContainer() {
    // Remove any existing container
    const existingContainer = document.getElementById('overlapp-widget-container');
    if (existingContainer) {
      document.body.removeChild(existingContainer);
    }
    
    // Create new container
    widgetContainer = document.createElement('div');
    widgetContainer.id = 'overlapp-widget-container';
    widgetContainer.style.position = 'fixed';
    widgetContainer.style.zIndex = '999999';
    
    // Set position based on config
    switch (widgetConfig.position) {
      case 'bottom-right':
        widgetContainer.style.bottom = '20px';
        widgetContainer.style.right = '20px';
        break;
      case 'bottom-left':
        widgetContainer.style.bottom = '20px';
        widgetContainer.style.left = '20px';
        break;
      case 'top-right':
        widgetContainer.style.top = '20px';
        widgetContainer.style.right = '20px';
        break;
      case 'top-left':
        widgetContainer.style.top = '20px';
        widgetContainer.style.left = '20px';
        break;
      default:
        widgetContainer.style.bottom = '20px';
        widgetContainer.style.right = '20px';
    }
    
    document.body.appendChild(widgetContainer);
  }
  
  /**
   * Create the widget toggle button
   */
  function createWidgetButton() {
    widgetButton = document.createElement('button');
    widgetButton.id = 'overlapp-widget-button';
    widgetButton.setAttribute('aria-label', 'Open Overlap Widget');
    widgetButton.style.width = '60px';
    widgetButton.style.height = '60px';
    widgetButton.style.borderRadius = '50%';
    widgetButton.style.backgroundColor = '#4f46e5';
    widgetButton.style.color = 'white';
    widgetButton.style.border = 'none';
    widgetButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    widgetButton.style.cursor = 'pointer';
    widgetButton.style.display = 'flex';
    widgetButton.style.alignItems = 'center';
    widgetButton.style.justifyContent = 'center';
    widgetButton.style.transition = 'transform 0.3s ease';
    
    // Add logo/icon
    widgetButton.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="12" r="6" fill="rgba(255,255,255,0.9)" />
        <circle cx="16" cy="12" r="6" fill="rgba(255,255,255,0.9)" />
        <path d="M14 12a4 4 0 11-8 0 4 4 0 018 0z" fill="rgba(79,70,229,0.5)" />
      </svg>
    `;
    
    // Add hover effect
    widgetButton.addEventListener('mouseover', function() {
      widgetButton.style.transform = 'scale(1.05)';
    });
    
    widgetButton.addEventListener('mouseout', function() {
      widgetButton.style.transform = 'scale(1)';
    });
    
    widgetContainer.appendChild(widgetButton);
  }
  
  /**
   * Create the widget iframe
   */
  function createWidgetFrame() {
    // Create overlay
    widgetOverlay = document.createElement('div');
    widgetOverlay.id = 'overlapp-widget-overlay';
    widgetOverlay.style.position = 'fixed';
    widgetOverlay.style.top = '0';
    widgetOverlay.style.left = '0';
    widgetOverlay.style.width = '100%';
    widgetOverlay.style.height = '100%';
    widgetOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    widgetOverlay.style.zIndex = '999998';
    widgetOverlay.style.opacity = '0';
    widgetOverlay.style.transition = 'opacity 0.3s ease';
    widgetOverlay.style.display = 'none';
    document.body.appendChild(widgetOverlay);
    
    // Create iframe
    widgetFrame = document.createElement('iframe');
    widgetFrame.id = 'overlapp-widget-frame';
    widgetFrame.style.position = 'fixed';
    widgetFrame.style.bottom = '90px';
    widgetFrame.style.right = '20px';
    widgetFrame.style.width = '360px';
    widgetFrame.style.height = '600px';
    widgetFrame.style.border = 'none';
    widgetFrame.style.borderRadius = '12px';
    widgetFrame.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
    widgetFrame.style.zIndex = '999999';
    widgetFrame.style.opacity = '0';
    widgetFrame.style.transform = 'translateY(20px)';
    widgetFrame.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    widgetFrame.style.display = 'none';
    
    // Set frame source based on demo mode
    if (widgetConfig.demoMode) {
      widgetFrame.src = `${window.location.origin}/widget/demo?theme=${widgetConfig.theme}`;
    } else {
      widgetFrame.src = `${window.location.origin}/widget?tenantId=${widgetConfig.tenantId}&theme=${widgetConfig.theme}`;
    }
    
    // Add iframe to container
    widgetContainer.appendChild(widgetFrame);
  }
  
  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Toggle button click
    widgetButton.addEventListener('click', toggleWidget);
    
    // Handle overlay click to close widget
    if (widgetOverlay) {
      widgetOverlay.addEventListener('click', closeWidget);
    }
    
    // Handle messages from widget iframe
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type) {
        switch (event.data.type) {
          case 'WIDGET_READY':
            console.log('Widget ready!');
            break;
          case 'WIDGET_CLOSE':
            closeWidget();
            break;
          case 'WIDGET_OVERLAP_COMPLETE':
            console.log('Overlap analysis complete:', event.data.data);
            break;
        }
      }
    });
  }
  
  /**
   * Open the widget
   */
  function openWidget() {
    if (!isWidgetOpen) {
      // Create widget frame if it doesn't exist
      if (!widgetFrame) {
        createWidgetFrame();
      }
      
      // Show overlay and frame
      if (widgetOverlay) {
        widgetOverlay.style.display = 'block';
        setTimeout(() => widgetOverlay.style.opacity = '1', 10);
      }
      
      widgetFrame.style.display = 'block';
      setTimeout(() => {
        widgetFrame.style.opacity = '1';
        widgetFrame.style.transform = 'translateY(0)';
      }, 10);
      
      isWidgetOpen = true;
    }
  }
  
  /**
   * Close the widget
   */
  function closeWidget() {
    if (isWidgetOpen && widgetFrame) {
      // Hide overlay and frame
      if (widgetOverlay) {
        widgetOverlay.style.opacity = '0';
        setTimeout(() => widgetOverlay.style.display = 'none', 300);
      }
      
      widgetFrame.style.opacity = '0';
      widgetFrame.style.transform = 'translateY(20px)';
      setTimeout(() => widgetFrame.style.display = 'none', 300);
      
      isWidgetOpen = false;
    }
  }
  
  /**
   * Toggle the widget
   */
  function toggleWidget() {
    if (isWidgetOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  }
})();