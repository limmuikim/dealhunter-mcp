import React from 'react';
import { BarChart3, Users, DollarSign, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { HealthReport } from '../types/index.ts';

interface IntelligenceSourcesProps {
  healthReport: HealthReport | null;
  isLoadingHealth: boolean;
  onRefreshHealth: () => void;
}

export const IntelligenceSources: React.FC<IntelligenceSourcesProps> = ({
  healthReport,
  isLoadingHealth,
  onRefreshHealth,
}) => {
  const sources = [
    {
      id: 'polymarket',
      title: 'Prediction Markets',
      subtitle: 'Real-time crowd probability signals',
      icon: BarChart3,
      serverKey: 'polymarket',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'social',
      title: 'Social Media Trends',
      subtitle: 'Sentiment from social platforms',
      icon: Users,
      serverKey: 'social',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      id: 'fmp',
      title: 'Financial Market Data',
      subtitle: 'Live pricing & fundamental data',
      icon: DollarSign,
      serverKey: 'fmp',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  const getServerStatus = (key: string) => {
    if (!healthReport) return { status: 'checking', label: 'Checking...' };
    const s = healthReport.servers[key];
    if (!s) return { status: 'ready', label: 'Ready' };
    if (s.answered) return { status: 'active', label: `Active (${s.toolsDiscovered} tools)` };
    if (s.status === 'quota_reached') return { status: 'quota', label: 'Quota limit' };
    if (!s.configured) return { status: 'unconfigured', label: 'Key not set' };
    return { status: 'idle', label: 'Standby' };
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold tracking-wider text-slate-200 uppercase">
            Intelligence Sources
          </h2>
        </div>
        <button
          onClick={onRefreshHealth}
          disabled={isLoadingHealth}
          className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
          title="Refresh source health"
        >
          {isLoadingHealth ? (
            <span className="animate-spin text-emerald-400">●</span>
          ) : (
            <span>Check live</span>
          )}
        </button>
      </div>

      <div className="space-y-2.5">
        {sources.map((item) => {
          const Icon = item.icon;
          const stat = getServerStatus(item.serverKey);

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center border ${item.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px]">
                {stat.status === 'active' && (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {stat.label}
                  </span>
                )}
                {stat.status === 'quota' && (
                  <span className="flex items-center gap-1 text-amber-400 font-medium">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    Quota
                  </span>
                )}
                {stat.status === 'unconfigured' && (
                  <span className="text-slate-500 font-medium">Standby</span>
                )}
                {stat.status === 'checking' && (
                  <span className="text-slate-500 font-medium">Connecting...</span>
                )}
                {stat.status === 'ready' && (
                  <span className="flex items-center gap-1 text-slate-400 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-slate-500" />
                    Ready
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {healthReport?.status === 'unconfigured' && (
        <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
          <span>
            MCP credentials not detected in environment. Using calibrated reference signals until API keys are set.
          </span>
        </div>
      )}
    </div>
  );
};
