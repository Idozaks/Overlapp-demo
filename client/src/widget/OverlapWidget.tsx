import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import QRCode from 'qrcode';

interface WidgetProps {
  tenantId: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark';
  onOverlapCalculated?: (score: number, commonInterests: string[]) => void;
  onChatStarted?: (deepLink: string) => void;
}

interface WidgetSession {
  sessionId: string;
  tenantName: string;
  logoUrl?: string;
}

interface OverlapResult {
  score: number;
  commonInterests: string[];
}

const baseStyles = `
  .overlapp-widget {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    box-sizing: border-box;
    position: fixed;
    width: 350px;
    max-width: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 100000;
    display: flex;
    flex-direction: column;
  }
  
  .overlapp-widget.bottom-right {
    bottom: 20px;
    right: 20px;
  }
  
  .overlapp-widget.bottom-left {
    bottom: 20px;
    left: 20px;
  }
  
  .overlapp-widget.top-right {
    top: 20px;
    right: 20px;
  }
  
  .overlapp-widget.top-left {
    top: 20px;
    left: 20px;
  }
  
  .overlapp-widget-header {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .overlapp-widget-logo {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .overlapp-widget-logo img {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    object-fit: cover;
  }
  
  .overlapp-widget-logo span {
    font-weight: 600;
    font-size: 16px;
  }
  
  .overlapp-widget-close {
    background: none;
    border: none;
    cursor: pointer;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
    transition: opacity 0.2s;
    padding: 0;
  }
  
  .overlapp-widget-close:hover {
    opacity: 1;
  }
  
  .overlapp-widget-content {
    padding: 20px;
    text-align: center;
  }
  
  .overlapp-widget-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  
  .overlapp-widget-description {
    font-size: 14px;
    margin-bottom: 20px;
    opacity: 0.8;
  }
  
  .overlapp-widget-qr {
    margin: 0 auto 20px;
    width: 180px;
    height: 180px;
    background: #fff;
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
  
  .overlapp-widget-qr img {
    width: 100%;
    height: 100%;
  }
  
  .overlapp-widget-footer {
    text-align: center;
    padding: 12px 16px;
    font-size: 12px;
    opacity: 0.6;
  }
  
  .overlapp-widget-close-text {
    text-decoration: underline;
    cursor: pointer;
  }
  
  .overlapp-widget-results {
    text-align: center;
    padding: 0 20px 20px;
  }
  
  .overlapp-widget-score {
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 10px;
  }
  
  .overlapp-widget-interests {
    margin-bottom: 20px;
  }
  
  .overlapp-widget-interest {
    display: inline-block;
    margin: 4px;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 500;
  }
  
  .overlapp-widget-chat-button {
    display: block;
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    text-align: center;
    border: none;
    transition: all 0.2s;
  }
  
  .overlapp-widget-chat-button:hover {
    opacity: 0.9;
  }
  
  /* Light Theme */
  .overlapp-widget.light {
    background-color: #fff;
    color: #333;
  }
  
  .overlapp-widget.light .overlapp-widget-header {
    background-color: #f5f5f5;
    border-bottom: 1px solid #eee;
  }
  
  .overlapp-widget.light .overlapp-widget-interest {
    background-color: #f0f0f0;
    color: #555;
  }
  
  .overlapp-widget.light .overlapp-widget-chat-button {
    background-color: #2563eb;
    color: white;
  }
  
  /* Dark Theme */
  .overlapp-widget.dark {
    background-color: #1f2937;
    color: #f3f4f6;
  }
  
  .overlapp-widget.dark .overlapp-widget-header {
    background-color: #111827;
    border-bottom: 1px solid #374151;
  }
  
  .overlapp-widget.dark .overlapp-widget-interest {
    background-color: #374151;
    color: #d1d5db;
  }
  
  .overlapp-widget.dark .overlapp-widget-chat-button {
    background-color: #3b82f6;
    color: white;
  }
`;

const OverlapWidget: React.FC<WidgetProps> = ({
  tenantId,
  position = 'bottom-right',
  theme = 'light',
  onOverlapCalculated,
  onChatStarted
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [session, setSession] = useState<WidgetSession | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [overlapResult, setOverlapResult] = useState<OverlapResult | null>(null);
  const [step, setStep] = useState<'loading' | 'scan' | 'results'>('loading');
  const [error, setError] = useState<string | null>(null);

  const closeWidget = () => {
    setIsVisible(false);
  };

  const generateQRCode = async (sessionId: string) => {
    try {
      // The URL should point to your application's auth page with the session ID
      const authUrl = `${window.location.origin}/auth/widget?session=${sessionId}`;
      const qrUrl = await QRCode.toDataURL(authUrl, {
        margin: 1,
        width: 200,
        color: {
          dark: '#222222',
          light: '#ffffff'
        }
      });
      setQrCode(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError('Unable to generate QR code');
    }
  };

  const startChatSession = async () => {
    if (!session) return;
    
    try {
      const response = await axios.post(`/api/widget/session/${session.sessionId}/chatlink`);
      const { deepLink } = response.data;
      
      if (onChatStarted) {
        onChatStarted(deepLink);
      } else {
        // Default behavior - redirect to the deep link
        window.location.href = deepLink;
      }
    } catch (error) {
      console.error('Error starting chat session:', error);
      setError('Unable to start chat session');
    }
  };

  const pollForResults = async (sessionId: string) => {
    try {
      const response = await axios.get(`/api/widget/session/${sessionId}/overlap`);
      const { score, commonInterests } = response.data;
      
      setOverlapResult({ score, commonInterests });
      setStep('results');
      
      if (onOverlapCalculated) {
        onOverlapCalculated(score, commonInterests);
      }
    } catch (error) {
      // If 401 error, it means the user hasn't authorized yet
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Continue polling
        setTimeout(() => pollForResults(sessionId), 3000);
      } else {
        console.error('Error polling for results:', error);
        setError('Error calculating overlap');
      }
    }
  };

  useEffect(() => {
    // Initialize widget session
    const initSession = async () => {
      try {
        const response = await axios.post('/api/widget/session/initialize', { tenantId });
        const sessionData: WidgetSession = response.data;
        
        setSession(sessionData);
        await generateQRCode(sessionData.sessionId);
        setStep('scan');
        
        // Start polling for results
        setTimeout(() => pollForResults(sessionData.sessionId), 3000);
      } catch (error) {
        console.error('Error initializing widget session:', error);
        setError('Unable to initialize widget');
      }
    };
    
    initSession();
    
    // Add styles to document
    const styleElement = document.createElement('style');
    styleElement.textContent = baseStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      // Clean up styles
      document.head.removeChild(styleElement);
    };
  }, [tenantId]);

  if (!isVisible) {
    return null;
  }

  const containerElement = document.createElement('div');
  
  return createPortal(
    <div className={`overlapp-widget ${position} ${theme}`}>
      <div className="overlapp-widget-header">
        <div className="overlapp-widget-logo">
          {session?.logoUrl && <img src={session.logoUrl} alt={session.tenantName} />}
          <span>{session?.tenantName || 'Overlapp Widget'}</span>
        </div>
        <button className="overlapp-widget-close" onClick={closeWidget}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 3.5L3.5 12.5M3.5 3.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      {step === 'loading' && (
        <div className="overlapp-widget-content">
          <div className="overlapp-widget-title">Initializing...</div>
          <div className="overlapp-widget-description">Please wait while we set up your session.</div>
        </div>
      )}
      
      {step === 'scan' && qrCode && (
        <div className="overlapp-widget-content">
          <div className="overlapp-widget-title">Scan to Connect</div>
          <div className="overlapp-widget-description">
            Scan this QR code to see how your interests overlap with the community.
          </div>
          <div className="overlapp-widget-qr">
            <img src={qrCode} alt="Login QR Code" />
          </div>
          <div className="overlapp-widget-description">
            After scanning, log in with your Overlapp account to see your compatibility score.
          </div>
        </div>
      )}
      
      {step === 'results' && overlapResult && (
        <div className="overlapp-widget-results">
          <div className="overlapp-widget-title">Your Community Overlap</div>
          <div className="overlapp-widget-score">{overlapResult.score}%</div>
          <div className="overlapp-widget-description">
            {overlapResult.score > 70
              ? "Wow! You're highly compatible with this community."
              : overlapResult.score > 40
              ? "You have good compatibility with this community."
              : "You have some shared interests with this community."}
          </div>
          
          {overlapResult.commonInterests.length > 0 && (
            <div className="overlapp-widget-interests">
              <div className="overlapp-widget-description">Common interests:</div>
              {overlapResult.commonInterests.map((interest, index) => (
                <span key={index} className="overlapp-widget-interest">
                  {interest}
                </span>
              ))}
            </div>
          )}
          
          <button 
            className="overlapp-widget-chat-button"
            onClick={startChatSession}
          >
            Start Chat
          </button>
        </div>
      )}
      
      {error && (
        <div className="overlapp-widget-content">
          <div className="overlapp-widget-title">Something went wrong</div>
          <div className="overlapp-widget-description">{error}</div>
        </div>
      )}
      
      <div className="overlapp-widget-footer">
        Powered by <a href="https://overlapp.io" target="_blank" rel="noopener noreferrer">Overlapp</a> • 
        <span className="overlapp-widget-close-text" onClick={closeWidget}> Close</span>
      </div>
    </div>,
    document.body
  );
};

export default OverlapWidget;