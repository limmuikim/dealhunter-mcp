import React from 'react';
import { Sparkles, ArrowUpRight, TrendingUp } from 'lucide-react';

interface SampleDailyDigestCardProps {
  onLoadSample: () => void;
  isActive: boolean;
}

export const SampleDailyDigestCard: React.FC<SampleDailyDigestCardProps> = ({
  onLoadSample,
  isActive,
}) => {
  const sampleItems = [
    {
      num: '1',
      ticker: 'NVDA',
      exchange: 'NASDAQ',
      pct: '+12.4%',
      summary:
        'AI chip demand surge — social buzz up 340%, prediction market 78% bullish',
    },
    {
      num: '2',
      ticker: 'LLY',
      exchange: 'NYSE',
      pct: '+8.7%',
      summary:
        'Weight-loss drug trial results trending on Google News, positive sentiment',
    },
    {
      num: '3',
      ticker: 'PLTR',
      exchange: 'NYSE',
      pct: '+6.2%',
      summary:
        'Government contract wins, social media mentions up 210% week-over-week',
    },
  ];

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Sample Daily Digest
        </h3>
        <button
          onClick={onLoadSample}
          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{isActive ? 'Showing Full View' : 'Inspect Full Breakdown'}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-[11px] border-b border-slate-800/80 pb-2">
          <span className="text-slate-400 font-medium">
            Today's Top 3 Ideas — Jan 15, 2025
          </span>
          <span className="text-emerald-400 font-bold tracking-wider text-[10px] uppercase">
            HIGH CONFIDENCE
          </span>
        </div>

        <div className="space-y-2.5">
          {sampleItems.map((item) => (
            <div
              key={item.num}
              onClick={onLoadSample}
              className="group cursor-pointer p-1.5 -mx-1.5 rounded-lg hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold text-xs">
                    {item.num}.
                  </span>
                  <span className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors">
                    {item.ticker}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {item.exchange}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-black">
                  <TrendingUp className="w-3 h-3" />
                  <span>{item.pct}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed pl-4">
                {item.summary}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
