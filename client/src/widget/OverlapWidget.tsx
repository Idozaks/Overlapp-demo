import React, { useState, useEffect } from 'react';
import { X, ChevronDown, QrCode, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

/**
 * The OverlapWidget component is the main widget that renders in an iframe or via script
 * It shows a button that expands to display a QR code for overlap analysis
 */
interface OverlapWidgetProps {
  tenantId: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark';
  onClose?: () => void;
}

type WidgetState = 'closed' | 'minimized' | 'qr-display' | 'overlap-results' | 'chat';

interface OverlapResults {
  score: number;
  commonInterests: string[];
  percentageMatch: number;
  recommendedConversationStarters: string[];
}

const positionClasses = {
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
};

const OverlapWidget: React.FC<OverlapWidgetProps> = ({
  tenantId,
  position = 'bottom-right',
  theme = 'light',
  onClose,
}) => {
  const [widgetState, setWidgetState] = useState<WidgetState>('closed');
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [tenantProfile, setTenantProfile] = useState<any>(null);
  const [overlapResults, setOverlapResults] = useState<OverlapResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Position classes based on position prop
  const positionClass = positionClasses[position];
  
  // Use system theme if theme is set to 'system'
  const [effectiveTheme, setEffectiveTheme] = useState(theme);
  
  useEffect(() => {
    if (theme === 'system') {
      const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setEffectiveTheme(isDarkMode ? 'dark' : 'light');
      
      // Listen for theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setEffectiveTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setEffectiveTheme(theme);
    }
  }, [theme]);

  // Initialize widget and track view
  useEffect(() => {
    const initialize = async () => {
      try {
        // Track widget view
        const response = await apiRequest('POST', '/api/widget/track', {
          tenantId,
          eventType: 'view',
          metadata: {
            userAgent: navigator.userAgent,
            referrer: document.referrer,
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSessionId(data.sessionId);
        }
        
        // Fetch tenant profile
        const profileResponse = await apiRequest('GET', `/api/widget/tenant/profile/${tenantId}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setTenantProfile(profileData);
        } else {
          setError('Could not load community profile');
        }
      } catch (err) {
        console.error('Error initializing widget:', err);
        setError('Failed to initialize widget');
      }
    };
    
    if (tenantId) {
      initialize();
    }
  }, [tenantId]);

  // Toggle widget open/closed
  const toggleWidget = () => {
    if (widgetState === 'closed') {
      setWidgetState('qr-display');
      // Track widget open event
      trackEvent('open');
    } else {
      setWidgetState('closed');
    }
  };
  
  // Minimize widget
  const minimizeWidget = () => {
    setWidgetState('minimized');
    trackEvent('minimize');
  };
  
  // Expand minimized widget
  const expandWidget = () => {
    setWidgetState('qr-display');
    trackEvent('expand');
  };
  
  // Close widget completely
  const closeWidget = () => {
    setWidgetState('closed');
    if (onClose) onClose();
  };
  
  // Track events
  const trackEvent = async (eventType: string) => {
    try {
      await apiRequest('POST', '/api/widget/track', {
        tenantId,
        sessionId,
        eventType,
      });
    } catch (err) {
      console.error('Error tracking event:', err);
    }
  };
  
  // Simulate QR code scan (in a real app, this would be triggered by actual QR scan)
  const simulateScan = async () => {
    setLoading(true);
    trackEvent('scan');
    
    try {
      // Simulate API call to get overlap results
      setTimeout(() => {
        // Mock results - in a real implementation this would come from the server
        setOverlapResults({
          score: 65,
          percentageMatch: 65,
          commonInterests: ['Technology', 'Reading', 'Travel', 'Photography'],
          recommendedConversationStarters: [
            'What kind of photography do you enjoy most?',
            'Have you read any interesting books lately?',
            'What travel destinations are on your bucket list?'
          ]
        });
        setWidgetState('overlap-results');
        setLoading(false);
        trackEvent('overlap_complete');
      }, 2000);
    } catch (err) {
      console.error('Error getting overlap results:', err);
      setError('Failed to process overlap results');
      setLoading(false);
    }
  };
  
  // Start chat
  const startChat = () => {
    setWidgetState('chat');
    trackEvent('click_to_chat');
  };

  // Widget button
  const renderWidgetButton = () => (
    <button
      onClick={toggleWidget}
      className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${
        effectiveTheme === 'dark' ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white'
      }`}
      aria-label="Open Overlap Widget"
    >
      <Sparkles className="w-6 h-6" />
    </button>
  );

  // Widget container with content based on state
  const renderWidgetContainer = () => {
    const containerClasses = `rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${
      effectiveTheme === 'dark' 
        ? 'bg-slate-900 text-white border border-gray-700' 
        : 'bg-white text-slate-900 border border-gray-200'
    }`;

    switch (widgetState) {
      case 'minimized':
        return (
          <div 
            className={`${containerClasses} w-14 h-14 flex items-center justify-center cursor-pointer`}
            onClick={expandWidget}
          >
            <ChevronDown className="w-6 h-6" />
          </div>
        );

      case 'qr-display':
        return (
          <div className={`${containerClasses} w-80 max-w-full`}>
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">OverlapLite</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={minimizeWidget}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Minimize"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={closeWidget}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="text-center mb-4">
                <h4 className="font-medium text-lg mb-1">
                  {tenantProfile?.name || 'Community Profile'}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {tenantProfile?.description || 'Scan to discover your overlap'}
                </p>
              </div>
              
              {error ? (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400 text-center">
                  {error}
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                  <p>Analyzing overlap...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-2 rounded-lg mb-4">
                    <div className="border border-gray-200 rounded overflow-hidden">
                      {/* Placeholder for actual QR code */}
                      <div className="w-48 h-48 grid grid-cols-6 grid-rows-6 gap-0 bg-white p-2">
                        <div className="col-span-2 row-span-2 bg-black rounded-tl-lg"></div>
                        <div className="col-span-2 row-span-2 col-start-5 bg-black rounded-tr-lg"></div>
                        <div className="col-span-2 row-span-2 row-start-5 bg-black rounded-bl-lg"></div>
                        <div className="row-start-3 col-start-3 col-span-2 row-span-2 bg-black"></div>
                        <div className="row-start-2 col-start-2 col-span-1 row-span-1 bg-black"></div>
                        <div className="row-start-5 col-start-5 col-span-1 row-span-1 bg-black"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-center mb-4">
                    Scan this QR code with your camera to discover your overlap with our community
                  </p>
                  {/* For demo purposes, add a simulate button */}
                  <button
                    onClick={simulateScan}
                    className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                      effectiveTheme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    Simulate Scan
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'overlap-results':
        if (!overlapResults) return null;
        
        return (
          <div className={`${containerClasses} w-80 max-w-full`}>
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Your Results</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={minimizeWidget}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Minimize"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={closeWidget}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="text-center mb-6">
                <div className="mb-3">
                  <span className="inline-block w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {overlapResults.percentageMatch}%
                  </span>
                </div>
                <h4 className="font-medium text-lg">
                  You & {tenantProfile?.name || 'this community'}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your shared interests
                </p>
              </div>
              
              <div className="mb-4">
                <h5 className="font-medium mb-2">Common Interests:</h5>
                <div className="flex flex-wrap gap-2">
                  {overlapResults.commonInterests.map((interest, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h5 className="font-medium mb-2">Conversation Starters:</h5>
                <ul className="space-y-2">
                  {overlapResults.recommendedConversationStarters.map((starter, index) => (
                    <li key={index} className="text-sm pl-4 relative">
                      <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      {starter}
                    </li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={startChat}
                className={`w-full py-2 rounded-md flex items-center justify-center gap-2 ${
                  effectiveTheme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                Start Conversation
              </button>
            </div>
          </div>
        );

      case 'chat':
        return (
          <div className={`${containerClasses} w-80 max-w-full h-96 flex flex-col`}>
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Chat</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={minimizeWidget}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Minimize"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={closeWidget}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex flex-col gap-3">
                <div className="max-w-[75%] p-3 rounded-lg bg-gray-100 dark:bg-gray-800 self-start">
                  <p className="text-sm">
                    Hi there! I noticed we both share an interest in photography. What kind of photos do you like to take?
                  </p>
                </div>
                
                <div className="max-w-[75%] p-3 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 self-end">
                  <p className="text-sm">
                    Hello! I mostly enjoy landscape and street photography. How about you?
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type a message..."
                  className={`flex-1 px-3 py-2 text-sm rounded-md outline-none ${
                    effectiveTheme === 'dark'
                      ? 'bg-gray-800 border-gray-700 focus:border-blue-500'
                      : 'bg-gray-50 border-gray-200 focus:border-blue-500'
                  } border`}
                />
                <button
                  className={`p-2 rounded-md ${
                    effectiveTheme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`fixed z-[9999] ${positionClass} transition-all duration-300 ease-in-out`} data-widget-id={tenantId}>
      {widgetState === 'closed' ? renderWidgetButton() : renderWidgetContainer()}
    </div>
  );
};

export default OverlapWidget;