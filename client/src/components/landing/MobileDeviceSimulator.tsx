import React, { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Battery, Signal } from 'lucide-react';

interface MobileDeviceSimulatorProps {
  children: ReactNode;
  className?: string;
  showStatusBar?: boolean;
  deviceColor?: string;
}

export const MobileDeviceSimulator: React.FC<MobileDeviceSimulatorProps> = ({
  children,
  className = '',
  showStatusBar = true,
  deviceColor = 'bg-zinc-900',
}) => {
  const [time, setTime] = useState<string>('');
  
  // Update the time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className={`relative w-[280px] h-[580px] rounded-[40px] ${deviceColor} shadow-2xl overflow-hidden mx-auto`}>
        {/* Device frame */}
        <div className="absolute inset-0 border-[12px] border-zinc-800 rounded-[40px] pointer-events-none z-10">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-[25px] bg-zinc-900 rounded-b-[14px]" />
        </div>
        
        {/* Screen content */}
        <div className="absolute inset-0 rounded-[28px] overflow-hidden bg-background">
          {/* Status bar */}
          {showStatusBar && (
            <div className="h-7 bg-background/90 backdrop-blur-md flex items-center justify-between px-5 text-xs text-foreground">
              <div>{time}</div>
              <div className="flex items-center gap-1">
                <Signal size={12} />
                <Wifi size={12} />
                <Battery size={14} />
              </div>
            </div>
          )}
          
          {/* App content */}
          <div className="h-[calc(100%-28px)] overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDeviceSimulator;