import React, { useState } from 'react';
import { X, Check, Zap, Shield, Sparkles } from 'lucide-react';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [subscribed, setSubscribed] = useState(false);

  if (!isOpen) return null;

  const features = [
    'Automated daily pre-market execution digest (6:00 AM EST)',
    'Full access to all 4 live MCP data streams (Polymarket, Social, News, FMP)',
    'Real-time catalyst alerts (< 15-minute latency)',
    'Asymmetric ten-bagger candidate scanner with down-to-the-minute filings',
    'Custom portfolio downside risk stress-testing',
  ];

  const handleSubscribe = () => {
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
          <Zap className="w-6 h-6 fill-emerald-400" />
        </div>

        <h3 className="text-xl font-black text-white">Dealhunter X Pro</h3>
        <p className="text-xs text-slate-400 mt-1">
          Unleash automated AI signals and daily asymmetric trade digests.
        </p>

        <div className="my-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white">$35</span>
            <span className="text-xs text-slate-400">/ month · Cancel anytime</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">
            30-day risk-free educational trial
          </p>
        </div>

        <ul className="space-y-2.5 mb-6">
          {features.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={handleSubscribe}
          disabled={subscribed}
          className="w-full py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
        >
          {subscribed ? 'Welcome to Dealhunter X Pro!' : 'Activate Pro Membership'}
        </button>
      </div>
    </div>
  );
};
