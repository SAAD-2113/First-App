import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, WifiOff, Battery, BatteryCharging, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  title?: string;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  const [isMobileView, setIsMobileView] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [isActualMobile, setIsActualMobile] = useState(false);

  // Dynamic status bar states reflecting the real device/browser details
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Detect if screen is small (phone size) to optimize responsive spacing
  useEffect(() => {
    const checkMobile = () => {
      setIsActualMobile(
        window.innerWidth < 768 || 
        window.matchMedia('(display-mode: standalone)').matches
      );
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update time dynamically (every minute)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 15000); // Check faster for clock precision
    return () => clearInterval(interval);
  }, []);

  // Sync real browser battery status and online connection status
  useEffect(() => {
    // 1. Online status listeners
    const handleOnlineChange = () => {
      setIsOnline(navigator.onLine);
    };
    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineChange);
    window.addEventListener('offline', handleOnlineChange);

    // 2. Battery status API
    let batteryObj: any = null;
    const updateBattery = (b: any) => {
      setBatteryLevel(Math.round(b.level * 100));
      setIsCharging(b.charging);
    };

    if (navigator && 'getBattery' in navigator) {
      (navigator as any).getBattery()
        .then((battery: any) => {
          batteryObj = battery;
          updateBattery(battery);
          battery.addEventListener('levelchange', () => updateBattery(battery));
          battery.addEventListener('chargingchange', () => updateBattery(battery));
        })
        .catch((err: any) => {
          console.debug('Battery API not supported or rejected:', err);
        });
    }

    return () => {
      window.removeEventListener('online', handleOnlineChange);
      window.removeEventListener('offline', handleOnlineChange);
      if (batteryObj) {
        batteryObj.removeEventListener('levelchange', () => updateBattery(batteryObj));
        batteryObj.removeEventListener('chargingchange', () => updateBattery(batteryObj));
      }
    };
  }, []);

  // Render the unified dynamic status bar
  const renderStatusBar = () => {
    return (
      <div className="h-11 bg-black/35 backdrop-blur-md px-6 pt-3 pb-1 flex items-center justify-between text-xs font-semibold text-white/95 z-20 border-b border-white/5 shadow-md">
        <span className="text-[11px] font-extrabold tracking-tight text-amber-400">
          {currentTime ? currentTime.split(' ')[0] : '12:00'}
        </span>
        <div className="flex items-center gap-2.5 text-white/90">
          {/* Real-time Connection status */}
          <Signal size={12} className={`stroke-[2.5] transition-colors ${isOnline ? 'text-amber-400' : 'text-white/20'}`} />
          {isOnline ? (
            <Wifi size={12} className="stroke-[2.5] text-amber-400" />
          ) : (
            <WifiOff size={12} className="stroke-[2.5] text-red-500 animate-pulse" />
          )}

          {/* Real-time Battery status */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-black text-amber-400/90">{batteryLevel}%</span>
            {isCharging ? (
              <BatteryCharging size={13} className="stroke-[2.5] text-emerald-400 animate-pulse" />
            ) : (
              <Battery size={13} className={`stroke-[2.5] ${batteryLevel < 20 ? 'text-red-500 animate-bounce' : 'text-amber-400'}`} />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-[#380202] via-[#160000] to-[#050000] py-3 px-2 md:py-6 overflow-x-hidden">
      
      {isActualMobile ? (
        /* Mobile View - full screen on mobile device / PWA standalone mode */
        <div className="w-full min-h-screen flex flex-col bg-gradient-to-b from-[#8c0303] via-[#4a0002] to-[#1a0001] overflow-x-hidden text-white relative">
          {/* Real device status bar at the top */}
          {renderStatusBar()}

          {/* Main Application Container */}
          <div className="flex-1 overflow-y-auto flex flex-col bg-transparent pb-6 px-1">
            {children}
          </div>
        </div>
      ) : (
        /* Phone Mock Container for wider screens */
        <div 
          className="relative w-[375px] h-[780px] bg-slate-950 rounded-[50px] shadow-[0_25px_60px_-15px_rgba(239,68,68,0.2)] p-[12px] border-4 border-red-950/40 transition-all duration-300 ring-12 ring-red-950 ring-opacity-20"
          style={{ contentVisibility: 'auto' }}
        >
          {/* Dynamic Island / Notch */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-30 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-red-950/50 mr-2 animate-pulse" />
            <div className="w-8 h-1 rounded-full bg-slate-950" />
          </div>

          {/* Internal Screen Area */}
          <div className="relative w-full h-full bg-gradient-to-b from-[#8c0303] via-[#4a0002] to-[#1a0001] rounded-[38px] overflow-hidden flex flex-col select-none shadow-inner">
            
            {/* Top status bar reflecting true device specs */}
            {renderStatusBar()}

            {/* Application Contents */}
            <div className="flex-1 overflow-y-auto flex flex-col bg-transparent scrollbar-none pb-4">
              {children}
            </div>

            {/* Simulated Home Indicator Bar */}
            <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-32 h-1.5 bg-amber-400/30 rounded-full z-20" />
          </div>
        </div>
      )}
    </div>
  );
}
