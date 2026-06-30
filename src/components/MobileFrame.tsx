import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  title?: string;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  const [isMobileView, setIsMobileView] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

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
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-[#380202] via-[#160000] to-[#050000] py-4 px-2 md:py-8">
      {/* Header Controller */}
      <div className="flex items-center gap-3 mb-4 backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl rounded-full px-4 py-1.5 text-xs text-white/95 font-semibold z-10">
        <span className="flex items-center gap-1.5">
          <Smartphone size={14} className={isMobileView ? 'text-amber-400' : 'text-white/70'} />
          <span>The Flash Study Station</span>
        </span>
        <div className="h-4 w-px bg-white/20" />
        <button
          onClick={() => setIsMobileView(true)}
          className={`px-2.5 py-0.5 rounded-full transition-all ${
            isMobileView ? 'bg-amber-500 text-red-950 font-black border border-amber-400/30 shadow-sm' : 'text-white/80 hover:bg-white/10'
          }`}
          id="btn-view-mobile"
        >
          Mobile
        </button>
        <button
          onClick={() => setIsMobileView(false)}
          className={`px-2.5 py-0.5 rounded-full transition-all ${
            !isMobileView ? 'bg-amber-500 text-red-950 font-black border border-amber-400/30 shadow-sm' : 'text-white/80 hover:bg-white/10'
          }`}
          id="btn-view-desktop"
        >
          Desktop Panel
        </button>
      </div>

      {isMobileView ? (
        /* Phone Mock Container */
        <div 
          className="relative w-[375px] h-[780px] bg-slate-950 rounded-[50px] shadow-[0_25px_60px_-15px_rgba(239,68,68,0.15)] p-[12px] border-4 border-red-950/40 transition-all duration-300 ring-12 ring-red-950 ring-opacity-20"
          style={{ contentVisibility: 'auto' }}
        >
          {/* Dynamic Island / Notch */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-30 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-red-950/50 mr-2" />
            <div className="w-8 h-1 rounded-full bg-slate-950" />
          </div>

          {/* Internal Screen Area */}
          <div className="relative w-full h-full bg-gradient-to-b from-[#8c0303] via-[#4a0002] to-[#1a0001] rounded-[38px] overflow-hidden flex flex-col select-none shadow-inner">
            
            {/* Status Bar */}
            <div className="h-11 bg-black/20 backdrop-blur-md px-6 pt-3 pb-1 flex items-center justify-between text-xs font-semibold text-white/95 z-20">
              <span className="text-[11px] font-bold tracking-tight text-amber-400">{currentTime.split(' ')[0]}</span>
              <div className="flex items-center gap-1.5 text-white/90">
                <Signal size={12} className="stroke-[2.5] text-amber-400" />
                <Wifi size={12} className="stroke-[2.5] text-amber-400" />
                <div className="flex items-center gap-0.5">
                  <span className="text-[9px] font-bold text-amber-400">100%</span>
                  <Battery size={13} className="stroke-[2.5] text-amber-400" />
                </div>
              </div>
            </div>

            {/* Application Contents */}
            <div className="flex-1 overflow-y-auto flex flex-col bg-transparent scrollbar-none pb-4">
              {children}
            </div>

            {/* Home Indicator Bar */}
            <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-32 h-1.5 bg-amber-400/40 rounded-full z-20" />
          </div>
        </div>
      ) : (
        /* Expanded Desktop / Tablet Card Container */
        <div className="w-full max-w-4xl min-h-[750px] bg-gradient-to-b from-[#8c0303] via-[#4a0002] to-[#1a0001] rounded-3xl shadow-[0_25px_60px_-15px_rgba(239,68,68,0.2)] border border-white/10 flex flex-col overflow-hidden transition-all duration-300">
          <div className="backdrop-blur-xl bg-black/30 border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-amber-300" />
            </div>
            <span className="text-sm font-black text-amber-400 tracking-wider">⚡ THE FLASH STUDY PORTAL ⚡</span>
            <div className="w-16" />
          </div>
          <div className="flex-1 overflow-y-auto bg-transparent flex flex-col">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
