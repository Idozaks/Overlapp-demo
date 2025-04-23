import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'qrcode';
import { 
  X, 
  Maximize2, 
  ChevronUp, 
  ChevronDown, 
  RefreshCw, 
  MessageCircle, 
  Share2, 
  Percent 
} from 'lucide-react';

interface OverlapWidgetProps {
  tenantId: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark';
  onClose?: () => void;
}

interface TenantProfile {
  id: number;
  name: string;
  description?: string;
  tags: string[];
}

interface WidgetSession {
  id: number;
  sessionId: string;
  score: number | null;
  commonInterests: string[] | null;
  status: 'pending' | 'completed' | 'error';
}

enum WidgetStep {
  CLOSED = 'closed',
  MINIMIZED = 'minimized',
  QR_SCAN = 'qr_scan',
  LOADING = 'loading',
  RESULTS = 'results',
}

const OverlapWidget: React.FC<OverlapWidgetProps> = ({ 
  tenantId, 
  position = 'bottom-right', 
  theme = 'light',
  onClose
}) => {
  const [step, setStep] = useState<WidgetStep>(WidgetStep.MINIMIZED);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [tenantProfile, setTenantProfile] = useState<TenantProfile | null>(null);
  const [session, setSession] = useState<WidgetSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const isDark = theme === 'dark';
  
  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  }[position];

  // Theme classes
  const themeClasses = isDark 
    ? 'bg-gray-900 text-white border-gray-700' 
    : 'bg-white text-gray-900 border-gray-200';

  // Track view event when widget is first displayed
  useEffect(() => {
    if (step === WidgetStep.MINIMIZED) {
      // Track view event
      trackEvent('view');
    }
  }, []);

  // Load tenant profile when widget is mounted
  useEffect(() => {
    const fetchTenantProfile = async () => {
      try {
        const response = await axios.get(`/api/widget/tenant/${tenantId}/profile`);
        setTenantProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch tenant profile:', error);
        setError('Failed to load community profile');
      }
    };

    fetchTenantProfile();
  }, [tenantId]);

  // Generate QR code when showing the scan step
  useEffect(() => {
    if (step === WidgetStep.QR_SCAN) {
      generateQrCode();
    }
  }, [step]);

  // Polling for session status
  useEffect(() => {
    // Clean up polling on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const generateQrCode = async () => {
    try {
      // Create a new session
      const sessionResponse = await axios.post(`/api/widget/session`, { tenantId });
      const newSession = sessionResponse.data;
      setSession(newSession);
      
      // Generate QR code URL
      const scanUrl = `${window.location.origin}/overlap/${newSession.sessionId}`;
      const qrCode = await QRCode.toDataURL(scanUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 200,
        color: {
          dark: isDark ? '#FFFFFF' : '#000000',
          light: isDark ? '#222222' : '#FFFFFF',
        },
      });
      
      setQrCodeUrl(qrCode);
      
      // Track scan event
      trackEvent('scan', { sessionId: newSession.sessionId });
      
      // Start polling for session updates
      const interval = setInterval(() => {
        checkSessionStatus(newSession.sessionId);
      }, 3000);
      
      setPollingInterval(interval);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      setError('Failed to generate QR code');
      setStep(WidgetStep.MINIMIZED);
    }
  };

  const checkSessionStatus = async (sessionId: string) => {
    try {
      const response = await axios.get(`/api/widget/session/${sessionId}`);
      const updatedSession = response.data;
      
      setSession(updatedSession);
      
      if (updatedSession.status === 'completed') {
        // Stop polling
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        
        // Show results
        setStep(WidgetStep.RESULTS);
        
        // Track overlap complete event
        trackEvent('overlap_complete', { 
          sessionId: sessionId,
          score: updatedSession.score,
          commonInterestsCount: updatedSession.commonInterests?.length || 0,
        });
      } else if (updatedSession.status === 'error') {
        // Stop polling
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        
        setError('An error occurred while processing your request');
        setStep(WidgetStep.QR_SCAN);
      }
    } catch (error) {
      console.error('Failed to check session status:', error);
    }
  };

  const handleChatClick = () => {
    // Track chat click event
    if (session) {
      trackEvent('click_to_chat', { sessionId: session.sessionId });
    }
    
    // Open chat in new window
    if (session) {
      window.open(`/chat/session/${session.sessionId}`, '_blank');
    }
  };

  const trackEvent = async (eventType: string, data: any = {}) => {
    try {
      await axios.post(`/api/widget/analytics`, {
        tenantId,
        eventType,
        sessionId: session?.sessionId,
        data
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  };

  const getWidgetContent = () => {
    switch (step) {
      case WidgetStep.MINIMIZED:
        return (
          <div 
            className="flex items-center justify-center cursor-pointer w-full h-full"
            onClick={() => setStep(WidgetStep.QR_SCAN)}
          >
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              <span className="font-medium">Find Your Overlapp</span>
              <ChevronUp className="w-4 h-4" />
            </div>
          </div>
        );
        
      case WidgetStep.QR_SCAN:
        return (
          <div className="p-4 flex flex-col items-center">
            <div className="relative w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {tenantProfile?.name || 'Community Overlap'}
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setStep(WidgetStep.MINIMIZED)} 
                    className={`p-1 rounded-full hover:bg-gray-200 ${isDark ? 'hover:bg-gray-700' : ''}`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { onClose?.(); setStep(WidgetStep.CLOSED); }} 
                    className={`p-1 rounded-full hover:bg-gray-200 ${isDark ? 'hover:bg-gray-700' : ''}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {tenantProfile && (
              <div className="mb-4 text-center">
                <p className="text-sm mb-2">
                  {tenantProfile.description || `Scan to discover how you overlap with ${tenantProfile.name}`}
                </p>
                <div className="flex flex-wrap gap-1 justify-center mt-2">
                  {tenantProfile.tags.slice(0, 5).map((tag, index) => (
                    <span 
                      key={index} 
                      className={`text-xs px-2 py-1 rounded-full ${
                        isDark ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                  {tenantProfile.tags.length > 5 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isDark ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      +{tenantProfile.tags.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="bg-white p-2 rounded-md mb-4">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Scan QR Code" width={200} height={200} />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              )}
            </div>
            
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
              Scan with your phone camera to connect
            </p>
          </div>
        );
        
      case WidgetStep.LOADING:
        return (
          <div className="p-6 flex flex-col items-center">
            <div className="flex justify-between items-center w-full mb-6">
              <h3 className="text-lg font-semibold">
                Analyzing Overlapp...
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setStep(WidgetStep.MINIMIZED)} 
                  className={`p-1 rounded-full hover:bg-gray-200 ${isDark ? 'hover:bg-gray-700' : ''}`}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { onClose?.(); setStep(WidgetStep.CLOSED); }} 
                  className={`p-1 rounded-full hover:bg-gray-200 ${isDark ? 'hover:bg-gray-700' : ''}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <RefreshCw className="w-12 h-12 animate-spin mb-4" />
            <p className="text-center mb-2">Finding your shared interests...</p>
            <p className="text-sm text-center text-gray-500">This may take a moment</p>
          </div>
        );
        
      case WidgetStep.RESULTS:
        return (
          <div className="p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Your Overlapp Results
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setStep(WidgetStep.MINIMIZED)} 
                  className={`p-1 rounded-full hover:bg-gray-200 ${isDark ? 'hover:bg-gray-700' : ''}`}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { onClose?.(); setStep(WidgetStep.CLOSED); }} 
                  className={`p-1 rounded-full hover:bg-gray-200 ${isDark ? 'hover:bg-gray-700' : ''}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center mb-6">
              <div className={`
                w-32 h-32 rounded-full flex items-center justify-center
                text-3xl font-bold border-4 
                ${session?.score && session.score > 70 
                  ? 'border-green-500 text-green-600' 
                  : session?.score && session.score > 40 
                    ? 'border-yellow-500 text-yellow-600' 
                    : 'border-blue-500 text-blue-600'
                }
              `}>
                {session?.score || 0}%
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Shared Interests</h4>
              <div className="flex flex-wrap gap-2">
                {session?.commonInterests && session.commonInterests.length > 0 ? (
                  session.commonInterests.map((interest, index) => (
                    <span 
                      key={index} 
                      className={`px-2 py-1 rounded-full text-sm ${
                        isDark ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No common interests found</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleChatClick} 
                className={`
                  flex-1 py-2 px-4 rounded-md flex items-center justify-center gap-2
                  ${isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }
                `}
              >
                <MessageCircle className="w-4 h-4" />
                Start Chat
              </button>
              <button 
                onClick={() => setStep(WidgetStep.QR_SCAN)} 
                className={`
                  py-2 px-3 rounded-md flex items-center justify-center
                  ${isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'border border-gray-300 hover:bg-gray-100'
                  }
                `}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (step === WidgetStep.CLOSED) {
    return null;
  }

  return (
    <div 
      className={`fixed ${positionClasses} z-50 shadow-lg rounded-lg border ${themeClasses} transition-all duration-300 ease-in-out overflow-hidden
        ${step === WidgetStep.MINIMIZED ? 'w-60 h-12' : 'w-80'}`}
    >
      {getWidgetContent()}
    </div>
  );
};

export default OverlapWidget;