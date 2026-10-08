import React from 'react';
import { CheckCircle2, UserCheck } from 'lucide-react';

export const WhoIsThisFor: React.FC = () => {
  const points = [
    'Retail investors looking for an informational edge',
    'Entrepreneurs managing side portfolios & personal capital',
    'Beginners who want structured, guided trade ideas',
    'Professional investors seeking public crowd & prediction signals',
  ];

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
      <div className="flex items-center gap-2 mb-3">
        <UserCheck className="w-4 h-4 text-emerald-400" />
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Who Is This For?
        </h3>
      </div>

      <ul className="space-y-2">
        {points.map((pt, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{pt}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
