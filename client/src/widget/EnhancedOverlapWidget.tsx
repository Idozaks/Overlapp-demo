import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, QrCode, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

/**
 * Enhanced OverlapWidget component with pre-processed background analysis
 * and a clear "Overlap!" call-to-action button
 */
interface EnhancedOverlapWidgetProps {
  tenantId: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'system';
  onClose?: () => void;
}

type WidgetState = 'closed' | 'minimized' | 'qr-display' | 'overlap-results' | 'chat';

interface OverlapResults {
  percentageMatch: number;
  commonInterests: string[];
  conversationStarters: string[];
}

// Position classes for widget positioning
const positionClasses = {
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4'
};

const EnhancedOverlapWidget: React.FC<EnhancedOverlapWidgetProps> = ({
  tenantId,
  position = 'bottom-right',
  theme = 'light',
  onClose,
}) => {
  const [widgetState, setWidgetState] = useState<WidgetState>('closed');
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [processingComplete, setProcessingComplete] = useState<boolean>(false);
  const [tenantProfile, setTenantProfile] = useState<any>(null);
  const [overlapResults, setOverlapResults] = useState<OverlapResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrGenerated, setQrGenerated] = useState<boolean>(false);
  const qrRef = useRef<HTMLDivElement>(null);

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

  // Set body class for theming
  useEffect(() => {
    const body = document.body;
    
    if (effectiveTheme === 'dark') {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
  }, [effectiveTheme]);

  // Track widget events
  const trackEvent = async (eventType: string, data: any = {}) => {
    try {
      await apiRequest('POST', '/api/widget/track', {
        tenantId,
        eventType,
        sessionId: sessionId || undefined,
        data
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  };

  // Get tenant profile
  const getTenantProfile = async () => {
    try {
      const response = await apiRequest('GET', `/api/tenants/${tenantId}/profile`);
      const data = await response.json();
      setTenantProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching tenant profile:', error);
      setError('Failed to load community profile');
      return null;
    }
  };

  // Start session and generate QR code
  const startSession = async () => {
    try {
      const response = await apiRequest('POST', '/api/widget/session', {
        tenantId,
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer
        }
      });
      
      const data = await response.json();
      setSessionId(data.sessionId);
      
      // Generate QR code
      if (qrRef.current) {
        // Simulate QR code generation
        setTimeout(() => {
          setQrGenerated(true);
        }, 500);
      }
      
      return data;
    } catch (error) {
      console.error('Error starting session:', error);
      setError('Failed to start session');
      return null;
    }
  };

  // Background processing to pre-calculate overlap results
  useEffect(() => {
    // Start background processing when widget is opened
    if (widgetState === 'qr-display' && sessionId && !processingComplete) {
      // Simulate background processing with synthetic data
      // In a real implementation, this would be an API call
      setTimeout(() => {
        const results = {
          percentageMatch: 78,
          commonInterests: [
            'Photography',
            'Machine Learning',
            'Vegetarian Cooking',
            'Hiking',
            'Science Fiction'
          ],
          conversationStarters: [
            'Have you tried any new vegetarian recipes lately?',
            'What kind of photography do you enjoy most?',
            'Read any good sci-fi books recently?',
            'What machine learning projects are you interested in?',
            'What\'s your favorite hiking trail?'
          ]
        };
        
        setOverlapResults(results);
        setProcessingComplete(true);
      }, 1500);
    }
  }, [widgetState, sessionId, processingComplete]);

  // Initialize widget when opened
  const openWidget = async () => {
    setWidgetState('qr-display');
    setLoading(true);
    
    // Track view event
    trackEvent('view');
    
    // Get tenant profile
    const profile = await getTenantProfile();
    
    // Start session and generate QR code
    if (profile) {
      const session = await startSession();
      if (session) {
        trackEvent('qr_displayed', { sessionId: session.sessionId });
      }
    }
    
    setLoading(false);
  };

  // Minimize widget
  const minimizeWidget = () => {
    setWidgetState('minimized');
  };

  // Expand minimized widget
  const expandWidget = () => {
    setWidgetState('qr-display');
  };

  // Close widget
  const closeWidget = () => {
    setWidgetState('closed');
    if (onClose) onClose();
  };

  // Handle QR code scan
  const handleQrScan = () => {
    setLoading(true);
    trackEvent('scan');
    
    // Simulate QR code scan
    setTimeout(() => {
      setLoading(false);
      // Instead of showing results, we'll just mark that the scan happened
      // Results will be displayed when the user clicks the "Overlap!" button
    }, 1000);
  };

  // Handle clicking the "Overlap!" button to show results
  const handleShowOverlap = () => {
    if (processingComplete && overlapResults) {
      setWidgetState('overlap-results');
      trackEvent('overlap_complete');
    } else {
      setError('Still calculating results, please wait...');
    }
  };
  
  // Start chat
  const startChat = () => {
    setWidgetState('chat');
    trackEvent('click_to_chat');
  };

  // Container classes for theming
  const containerClasses = `rounded-lg shadow-lg overflow-hidden ${
    effectiveTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
  }`;

  // Render widget button
  const renderWidgetButton = () => {
    return (
      <button
        onClick={openWidget}
        className={`h-12 w-12 rounded-full shadow-lg flex items-center justify-center ${
          effectiveTheme === 'dark' ? 'bg-gray-800 text-blue-400' : 'bg-blue-500 text-white'
        }`}
        aria-label="Open Overlap Widget"
      >
        <QrCode className="w-6 h-6" />
      </button>
    );
  };

  // Render minimized widget
  const renderMinimizedWidget = () => {
    return (
      <div className={`${containerClasses} w-64 flex items-center justify-between p-3`}>
        <div className="flex items-center">
          <QrCode className="w-5 h-5 mr-2 text-blue-500" />
          <span className="font-medium text-sm">Scan to see overlap</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={expandWidget}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Expand"
          >
            <ChevronDown className="w-4 h-4 transform rotate-180" />
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
    );
  };

  // Render widget content based on state
  const renderWidgetContainer = () => {
    if (widgetState === 'minimized') {
      return renderMinimizedWidget();
    }
    
    switch (widgetState) {
      case 'qr-display':
        return (
          <div className={`${containerClasses} w-80 max-w-full`}>
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Scan to Connect</h3>
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
              {error ? (
                <div className="text-red-500 text-center mb-4">{error}</div>
              ) : null}
              
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {tenantProfile ? tenantProfile.name : 'This community'} wants to connect with you!
                </p>
              </div>
              
              <div 
                ref={qrRef} 
                className={`mx-auto w-48 h-48 bg-white flex items-center justify-center rounded-lg mb-4 ${loading ? 'animate-pulse' : ''}`}
              >
                {qrGenerated ? (
                  <img 
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADIAQMAAACXljzdAAAABlBMVEX///8AAABVwtN+AAABaUlEQVRYw+2YMY6FMAxEx5HoOACnzNE4TY7ADeho0CwOSSCxsNJu+YoUb8bj378sRafT6cfpi9w8SCvyIuuDfI4kJAkMJJBwpHVkS0QisnCkNOSLJCJX5B/I8SL+TeLVSWR7dFJE5JZIC7JFpAVpQWIhWZCWJAeJF1IPkpNkCZIa5G4kcTdyk2RvSpDEID1JYpAlyX2QGiQ9SGuQNUhrkLWQMG8iIeYk3on4LolBnGQ5SEiSnIgbyWAJbxJtJNpJGDG/3WL+zq+dBCTaiO8kfpA4SUIjCRdJXUgskrKTcCGxSMpOYpKEIvGD5Kb4Jrltm/i3gQkSr46+/KTxTnLPwNRJ6kLCQkIFWX4JUqsg9SC1SByknMBP3/yZ+GzXCM+SGU34QNx1QnVJvEhmlehNQjshN1m2O0UTYcaxbbeQ8NRFWK8RTb17yS2Kv5DEqQ0TJPG8LWrO25eUz6ZXmFRrIRqnWaW7FJ1Op3fkB9Z+4+O7HfC/AAAAAElFTkSuQmCC" 
                    alt="QR Code"
                    className="w-full h-full"
                  />
                ) : (
                  <div className="text-gray-400">Generating QR code...</div>
                )}
              </div>
              
              {qrGenerated && (
                <>
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      For demo purposes, click below to simulate scanning the QR code
                    </p>
                  </div>
                  
                  <button
                    onClick={handleQrScan}
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Simulate Scan'}
                  </button>
                  
                  {processingComplete && (
                    <button
                      onClick={handleShowOverlap}
                      className="w-full mt-3 bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition flex items-center justify-center gap-2 font-medium"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="8" cy="12" r="6" fill="rgba(255,255,255,0.7)" />
                        <circle cx="16" cy="12" r="6" fill="rgba(255,255,255,0.7)" />
                        <path d="M14 12a4 4 0 11-8 0 4 4 0 018 0z" fill="rgba(0,150,0,0.5)" />
                      </svg>
                      <span>Overlap!</span>
                    </button>
                  )}
                </>
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
                <h3 className="font-medium text-lg mb-1">Overlap Score</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Your interests match with {tenantProfile ? tenantProfile.name : 'this community'}
                </p>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Shared Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {overlapResults.commonInterests.map((interest, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-sm rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
              
              <button
                onClick={startChat}
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Start Chat</span>
              </button>
            </div>
          </div>
        );
        
      case 'chat':
        return (
          <div className={`${containerClasses} w-80 max-w-full h-96`}>
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
            
            <div className="p-4 h-64 overflow-y-auto border-b border-gray-200 dark:border-gray-700">
              <div className="mb-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg rounded-tl-none max-w-[80%] ml-auto mb-2">
                  <p className="text-sm text-gray-800 dark:text-gray-100">
                    Hello! Thanks for connecting. I see we both share an interest in {overlapResults?.commonInterests[0]}.
                  </p>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  Just now
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-xs text-gray-500 mb-2 text-center">Conversation Starters</h4>
                {overlapResults?.conversationStarters.map((starter, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-2 border border-gray-200 dark:border-gray-700 rounded-md mb-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-3 flex items-center gap-2">
              <input
                type="text"
                className="flex-1 p-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-md text-sm"
                placeholder="Type your message..."
              />
              <button
                className="p-2 bg-blue-500 text-white rounded-md"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
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

export default EnhancedOverlapWidget;