import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import WidgetContent from './components/WidgetContent';

/**
 * DemoPage is a special mode for the widget that runs with demo data
 * for showcasing the widget without requiring actual tenant setup.
 */
const DemoPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'qr' | 'auth' | 'overlap' | 'completed'>('qr');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { user } = useAuth();

  // Get theme from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme') as 'light' | 'dark';
    
    if (themeParam) {
      setTheme(themeParam);
    }
  }, []);

  // Listen for messages from the parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type) {
        switch (event.data.type) {
          case 'SIMULATE_SCAN':
            handleSimulateScan(event.data.userId);
            break;
          case 'ANALYZE_OVERLAP':
            setCurrentStep('overlap');
            setTimeout(() => {
              setCurrentStep('completed');
            }, 1000);
            break;
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Notify parent that widget is ready
    window.parent.postMessage({ type: 'WIDGET_READY' }, '*');

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Function to handle QR code scan simulation
  const handleSimulateScan = (userId: number) => {
    setCurrentStep('auth');
    console.log('Simulating QR code scan for user ID:', userId);
    setTimeout(() => {
      setCurrentStep('overlap');
      setTimeout(() => {
        setCurrentStep('completed');
      }, 1000);
    }, 500);
  };

  // Function to close the widget
  const handleClose = () => {
    window.parent.postMessage({ type: 'WIDGET_CLOSE' }, '*');
  };

  return (
    <div className="w-full h-full">
      <WidgetContent 
        theme={theme}
        onClose={handleClose}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        demoMode={true}
      />
    </div>
  );
};

export default DemoPage;