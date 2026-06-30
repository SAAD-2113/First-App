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
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-tr from-[#380202] via-[#160000] to-[#050000] py-3 px-2 md:py-6 overflow-x-hidden">
      
      {/* Universal Header View Controller - works on both desktop and mobile phone screens */}
      <div className="flex items-center gap-2.5 mb-3.5 backdrop-blur-xl bg-black/40 border border-white/10 shadow-2xl rounded-full px-3.5 py-1.5 text-xs text-white font-bold z-30 transition-all max-w-full">
        <span className="flex items-center gap-1.5 px-1">
          <Smartphone size={13} className="text-amber-400 animate-pulse" />
          <span className="hidden sm:inline text-white/90">Flash Study Station</span>
        </span>
        <div className="h-3.5 w-px bg-white/20" />
        <button
          onClick={() => setIsMobileView(true)}
          className={`px-3 py-1 rounded-full text-[11px] transition-all cursor-pointer ${
            isMobileView 
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-red-950 font-black shadow-md border border-amber-300/30' 
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
          id="btn-view-mobile"
        >
          Mobile
        </button>
        <button
          onClick={() => setIsMobileView(false)}
          className={`px-3 py-1 rounded-full text-[11px] transition-all cursor-pointer ${
            !isMobileView 
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-red-950 font-black shadow-md border border-amber-300/30' 
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
          id="btn-view-desktop"
        >
          Desktop Panel
        </button>
      </div>

      {isMobileView ? (
        /* Mobile View - full screen on mobile device, neat mockup frame on desktop screens */
        isActualMobile ? (
          <div className="w-full max-w-md flex-1 bg-gradient-to-b from-[#8c0303] via-[#4a0002] to-[#1a0001] rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl relative min-h-[80vh]">
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
        )
      ) : (
        /* Expanded Desktop / Tablet Panel Card Container - responsive on mobile */
        <div className="w-full max-w-4xl min-h-[75vh] bg-gradient-to-b from-[#8c0303] via-[#4a0002] to-[#1a0001] rounded-3xl shadow-[0_25px_60px_-15px_rgba(239,68,68,0.2)] border border-white/10 flex flex-col overflow-hidden transition-all duration-300">
          <div className="backdrop-blur-xl bg-black/35 border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <span className="text-xs sm:text-sm font-black text-amber-400 tracking-wider">⚡ THE FLASH STUDY PORTAL ⚡</span>
            <div className="w-16 hidden sm:block" />
          </div>
          <div className="flex-1 overflow-y-auto bg-transparent flex flex-col p-2 sm:p-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
