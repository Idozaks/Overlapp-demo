import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { PlayIcon, PauseIcon, RefreshCw } from 'lucide-react';
import MobileDeviceSimulator from './MobileDeviceSimulator';

interface HeroPageDemoProps {
  className?: string;
}

const HeroPageDemo: React.FC<HeroPageDemoProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [isActive, setIsActive] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  // Auto-start the demo after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasStarted(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Controls to toggle demo playback
  const toggleDemo = () => {
    setIsActive(!isActive);
    if (!hasStarted) {
      setHasStarted(true);
    }
  };

  // Reset the demo
  const resetDemo = () => {
    setHasStarted(false);
    setTimeout(() => {
      setHasStarted(true);
      setIsActive(true);
    }, 100);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t('Experience Overlapp in Action')}
            </motion.h2>
            
            <motion.p 
              className="text-lg text-muted-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {t('Watch simulated user journeys showcasing how Overlapp connects digital and physical experiences.')}
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button
                onClick={toggleDemo}
                variant={isActive ? "outline" : "default"}
                className="gap-2"
              >
                {isActive ? (
                  <>
                    <PauseIcon className="h-4 w-4" />
                    {t('Pause Demo')}
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4" />
                    {t('Resume Demo')}
                  </>
                )}
              </Button>
              
              <Button
                onClick={resetDemo}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {t('Restart')}
              </Button>
            </motion.div>
            
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                    <path d="M22 11.1V6.9C22 3.4 20.6 2 17.1 2H12.9C9.4 2 8 3.4 8 6.9V8H11.1C14.6 8 16 9.4 16 12.9V16H17.1C20.6 16 22 14.6 22 11.1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17.1V12.9C16 9.4 14.6 8 11.1 8H6.9C3.4 8 2 9.4 2 12.9V17.1C2 20.6 3.4 22 6.9 22H11.1C14.6 22 16 20.6 16 17.1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.08008 15L8.03008 16.95L11.9201 13.05" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-base">{t('Social Discovery')}</h3>
                  <p className="text-sm text-muted-foreground">{t('Connect with people who share your interests and values')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                    <path d="M17.1501 13.82L14.1701 16.8M14.1701 16.8L11.2001 13.82M14.1701 16.8V7.79" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.8501 10.18L9.8301 7.2M9.8301 7.2L12.8001 10.18M9.8301 7.2V16.21" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 3V7H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L17 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-base">{t('Physical Integration')}</h3>
                  <p className="text-sm text-muted-foreground">{t('Seamlessly bridge your digital and physical experiences')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                    <path d="M12.1601 10.87C12.0601 10.86 11.9401 10.86 11.8301 10.87C9.45006 10.79 7.56006 8.84 7.56006 6.44C7.56006 3.99 9.54006 2 12.0001 2C14.4501 2 16.4401 3.99 16.4401 6.44C16.4301 8.84 14.5401 10.79 12.1601 10.87Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.15997 14.56C4.73997 16.18 4.73997 18.82 7.15997 20.43C9.90997 22.27 14.42 22.27 17.17 20.43C19.59 18.81 19.59 16.17 17.17 14.56C14.43 12.73 9.91997 12.73 7.15997 14.56Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-base">{t('Identity Management')}</h3>
                  <p className="text-sm text-muted-foreground">{t('Take control of your digital identity across platforms')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                    <path d="M3.01001 11.22V15.71C3.01001 20.2 4.81001 22 9.30001 22H14.69C19.18 22 20.98 20.2 20.98 15.71V11.22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 12C13.83 12 15.18 10.51 15 8.68L14.34 2H9.66999L8.99999 8.68C8.81999 10.51 10.17 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.31 12C20.33 12 21.81 10.36 21.61 8.35L21.33 5.6C20.97 3 19.97 2 17.35 2H14.3L15 9.01C15.17 10.66 16.66 12 18.31 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.64 12C7.29 12 8.78 10.66 8.94 9.01L9.16 6.8L9.64001 2H6.59C3.97001 2 2.97 3 2.61 5.6L2.34 8.35C2.14 10.36 3.62 12 5.64 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 17C10.33 17 9.5 17.83 9.5 19.5V22H14.5V19.5C14.5 17.83 13.67 17 12 17Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-base">{t('Marketplace Engagement')}</h3>
                  <p className="text-sm text-muted-foreground">{t('Discover products and services that align with your values')}</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {hasStarted ? (
              <MobileDeviceSimulator autoPlay={isActive} interval={8000} className="max-w-full" />
            ) : (
              <div className="h-[600px] w-[300px] bg-muted/50 rounded-[2rem] flex items-center justify-center">
                <RefreshCw className="h-10 w-10 text-muted-foreground animate-spin" />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroPageDemo;