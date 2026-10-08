import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ExternalLink,
  Target,
  Percent,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { TradeIdea } from '../types/index.ts';

interface TradeIdeasViewProps {
  ideas: TradeIdea[];
  date: string;
  isSample?: boolean;
}

export const TradeIdeasView: React.FC<TradeIdeasViewProps> = ({
  ideas,
  date,
  isSample = false,
}) => {
  if (!ideas || ideas.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">
            Today's Top {ideas.length} Ideas — {date}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isSample && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Sample Live Calibration
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            HIGH CONFIDENCE SIGNALS
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {ideas.map((idea, index) => {
          const isLong = idea.direction === 'LONG';
          return (
            <div
              key={idea.id || index}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-slate-700/90 p-5 shadow-xl transition-all"
            >
              {/* Header: Number, Ticker, Exchange, Direction */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-black text-sm">
                    {index + 1}.
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-white tracking-wide">
                        {idea.ticker}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {idea.exchange}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase border ${
                      isLong
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {isLong ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>{idea.direction}</span>
                  </div>
                </div>
              </div>

              {/* Thesis (exactly 2 sentences) */}
              <div className="mt-3.5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Core Thesis
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  {idea.thesis}
                </p>
              </div>

              {/* Rationale & Trade Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3.5 pt-3 border-t border-slate-800/60 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-[11px]">
                    <Target className="w-3 h-3 text-emerald-400" />
                    <span>Entry Rationale</span>
                  </div>
                  <p className="text-slate-200 text-xs font-medium">
                    {idea.entryRationale}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-[11px]">
                    <Percent className="w-3 h-3 text-emerald-400" />
                    <span>Suggested Position Size</span>
                  </div>
                  <p className="text-slate-200 text-xs font-semibold">
                    {idea.suggestedPositionSizePercent}% of Capital
                    <span className="text-slate-400 font-normal ml-1">
                      (~${idea.suggestedCapitalAmountUSD})
                    </span>
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-[11px]">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>Time Horizon</span>
                  </div>
                  <p className="text-slate-200 text-xs font-semibold">
                    {idea.timeHorizon}
                  </p>
                </div>
              </div>

              {/* Min 3 Comprehensive Bullet Points */}
              <div className="mt-4 pt-3 border-t border-slate-800/60">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Key Signals & Evidence (Min. 3 Points)</span>
                </h4>
                <ul className="space-y-1.5">
                  {idea.bullets.map((bullet, bIdx) => (
                    <li
                      key={bIdx}
                      className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Risk Banner */}
              <div className="mt-3.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <span className="font-bold text-amber-300 mr-1.5">Key Risk:</span>
                  <span className="text-amber-200/90">{idea.keyRisk}</span>
                </div>
              </div>

              {/* Specific Sources Used (MCP Name + Item Title) */}
              {idea.citedSources && idea.citedSources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/60">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Stage A MCP Citations
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {idea.citedSources.map((source, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] text-slate-300"
                      >
                        <ExternalLink className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="font-bold text-emerald-400">
                          {source.mcpName}:
                        </span>
                        <span className="text-slate-300 truncate max-w-[200px] sm:max-w-[280px]">
                          {source.itemTitle}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
