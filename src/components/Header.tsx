import React from 'react';
import { Zap, Bell, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onSubscribeClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSubscribeClick }) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-black text-sm tracking-widest text-emerald-400">
            <span className="flex items-center justify-center w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              <Zap className="w-4 h-4 fill-emerald-400" />
            </span>
            <span>DHX</span>
          </div>
          <span className="hidden sm:inline-block h-3.5 w-px bg-slate-800" />
          <span className="hidden sm:inline-block text-slate-400">
            Powered by crowd wisdom & public signals
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Risk-Grounded Engine</span>
          </div>

          <button
            onClick={onSubscribeClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 cursor-pointer"
          >
            <span>Subscribe — US$35/mo</span>
          </button>
        </div>
      </div>

      {/* Main Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase">
          DEALHUNTER X
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400 font-medium tracking-wide">
          Find tomorrow's ten-baggers, today.
        </p>
      </div>
    </header>
  );
};
