import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, X, RefreshCw, MessageCircle } from 'lucide-react';

interface WidgetContentProps {
  tenantId?: string;
  theme?: 'light' | 'dark';
  onClose: () => void;
  currentStep: 'qr' | 'auth' | 'overlap' | 'completed';
  setCurrentStep: (step: 'qr' | 'auth' | 'overlap' | 'completed') => void;
  demoMode?: boolean;
}

/**
 * WidgetContent component contains the actual UI for the widget.
 * This is used by both WidgetPage and DemoPage.
 */
const WidgetContent: React.FC<WidgetContentProps> = ({
  tenantId,
  theme = 'light',
  onClose,
  currentStep,
  setCurrentStep,
  demoMode = false
}) => {
  // Function to get Tenant profile
  const getTenantProfile = () => {
    if (demoMode) {
      return 'Demo Community';
    }
    if (tenantId?.includes('bookclub')) {
      return `BookClub Community`;
    }
    return 'Website Community';
  };

  // Function to handle simulate scan button click
  const handleSimulateScan = () => {
    setCurrentStep('auth');
    setTimeout(() => {
      setCurrentStep('overlap');
      setTimeout(() => {
        setCurrentStep('completed');
      }, 1000);
    }, 500);
  };

  // Render the current step
  return (
    <div className="w-full h-full bg-background text-foreground p-4 rounded-lg flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <circle cx="8" cy="12" r="6" fill="rgba(79,70,229,0.5)" />
            <circle cx="16" cy="12" r="6" fill="rgba(79,70,229,0.5)" />
            <path d="M14 12a4 4 0 11-8 0 4 4 0 018 0z" fill="rgba(255,255,255,0.9)" />
          </svg>
          {demoMode ? "Overlapp!" : "OverlapLite"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col">
        {currentStep === 'qr' && (
          <motion.div
            className="flex-1 flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <QrCode className="w-32 h-32 mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-2">Scan to Connect</h3>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Scan this QR code to connect your Digital Identity Unit (DIU) and see your overlap with {getTenantProfile()}
            </p>
            <Button onClick={handleSimulateScan}>
              Simulate Scan {demoMode && '(Demo)'}
            </Button>
          </motion.div>
        )}

        {currentStep === 'auth' && (
          <motion.div
            className="flex-1 flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-xl font-bold mb-2">Connecting...</h3>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Verifying your DIU (Digital Identity Unit)
            </p>
          </motion.div>
        )}

        {currentStep === 'overlap' && (
          <motion.div
            className="flex-1 flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-xl font-bold mb-2">Analyzing Overlap</h3>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Comparing your DIU with {getTenantProfile()}
            </p>
          </motion.div>
        )}

        {currentStep === 'completed' && (
          <motion.div
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-muted/50 rounded-lg p-4 flex items-center mb-4">
              <div className="mr-4 relative">
                <svg className="w-16 h-16" viewBox="0 0 100 100">
                  <circle cx="35" cy="50" r="30" fill="#818cf8" fillOpacity="0.6" />
                  <circle cx="65" cy="50" r="30" fill="#818cf8" fillOpacity="0.6" />
                  <path d="M50 50 m-15 0 a15,15 0 1,0 30,0 a15,15 0 1,0 -30,0" fill="white" fillOpacity="0.9" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                  {demoMode ? '85%' : '73%'}
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-1">{demoMode ? 'High Overlap!' : 'Significant Overlap'}</h3>
                <p className="text-sm text-muted-foreground">Your DIU overlaps significantly with {getTenantProfile()}</p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Common Interests</h4>
              <div className="flex flex-wrap gap-2">
                {demoMode ? (
                  <>
                    <Badge variant="secondary">Technology</Badge>
                    <Badge variant="secondary">AI/ML</Badge>
                    <Badge variant="secondary">Web Development</Badge>
                    <Badge variant="secondary">Digital Identity</Badge>
                    <Badge variant="secondary">Innovation</Badge>
                  </>
                ) : (
                  <>
                    <Badge variant="secondary">Science Fiction</Badge>
                    <Badge variant="secondary">Book Clubs</Badge>
                    <Badge variant="secondary">Literary Fiction</Badge>
                    <Badge variant="secondary">Reading</Badge>
                    <Badge variant="secondary">Writing</Badge>
                  </>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Recommended Conversation Starters</h4>
              <ul className="text-sm space-y-2">
                {demoMode ? (
                  <>
                    <li className="p-2 bg-muted/30 rounded">What aspects of digital identity do you find most interesting?</li>
                    <li className="p-2 bg-muted/30 rounded">Have you worked on any interesting AI projects recently?</li>
                  </>
                ) : (
                  <>
                    <li className="p-2 bg-muted/30 rounded">Have you read any science fiction novels recently?</li>
                    <li className="p-2 bg-muted/30 rounded">What's your take on contemporary literary fiction?</li>
                  </>
                )}
              </ul>
            </div>

            <div className="mt-auto pt-4">
              <Button className="w-full" onClick={onClose} variant="default">
                <MessageCircle className="mr-2 h-4 w-4" />
                Start Chat
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {demoMode && (
        <div className="mt-4 text-xs text-center text-muted-foreground">
          <p>Demo Mode - No real data is being used</p>
        </div>
      )}
    </div>
  );
};

export default WidgetContent;