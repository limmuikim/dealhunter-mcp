import React from 'react';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { RiskCheckResult } from '../types/index.ts';

interface RiskCheckCardProps {
  riskCheck: RiskCheckResult;
}

export const RiskCheckCard: React.FC<RiskCheckCardProps> = ({ riskCheck }) => {
  if (!riskCheck) return null;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-amber-500/30 p-5 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Algorithmic Risk Check & Capital Guardrail
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
          Risk: {riskCheck.overallRiskLevel}
        </span>
      </div>

      <div className="space-y-3 text-xs">
        {/* Objective Evaluation */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/20">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Target Objective Evaluation</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-normal">
            {riskCheck.objectiveEvaluation}
          </p>
        </div>

        {/* Downside Buffer & Volatility in 2 cols */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Downside Buffer & Stop-Loss
            </span>
            <p className="text-slate-200 text-xs font-medium">
              {riskCheck.downsideBuffer}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Catalyst Volatility Alert
            </span>
            <p className="text-slate-200 text-xs font-medium">
              {riskCheck.volatilityFlag}
            </p>
          </div>
        </div>

        {/* Capital Preservation Note */}
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-emerald-300/90 leading-relaxed font-medium">
            <strong className="text-emerald-300 font-bold">Capital Preservation: </strong>
            {riskCheck.capitalPreservationNote}
          </p>
        </div>
      </div>
    </div>
  );
};
