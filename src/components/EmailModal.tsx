import React, { useState } from 'react';
import { X, Mail, Check, Copy, Send } from 'lucide-react';
import { DigestPayload } from '../types/index.ts';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  digest: DigestPayload | null;
  targetEmail: string;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  digest,
  targetEmail,
}) => {
  const [copied, setCopied] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  if (!isOpen || !digest) return null;

  const handleCopy = () => {
    const text = `Subject: ${digest.emailSubject}

DEALHUNTER X
${digest.tagline}

Here are your Top 3 Trade Ideas for ${digest.date}:

${digest.ideas
  .map(
    (idea, i) =>
      `${i + 1}. ${idea.ticker} (${idea.exchange}) - ${idea.direction}
Thesis: ${idea.thesis}
Suggested Size: ${idea.suggestedPositionSizePercent}% of capital (~$${idea.suggestedCapitalAmountUSD})
Horizon: ${idea.timeHorizon}
Key Risk: ${idea.keyRisk}
Key Signals:
${idea.bullets.map((b) => ` • ${b}`).join('\n')}
Sources: ${idea.citedSources.map((s) => `${s.mcpName}: ${s.itemTitle}`).join(', ')}`
  )
  .join('\n\n')}

RISK CHECK:
Level: ${digest.riskCheck.overallRiskLevel}
Objective: ${digest.riskCheck.objectiveEvaluation}
Downside Buffer: ${digest.riskCheck.downsideBuffer}

--
${digest.signOff}

${digest.footerDisclaimer}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDispatch = () => {
    setDispatched(true);
    setTimeout(() => {
      setDispatched(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Email Digest Preview</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono text-slate-300 bg-slate-950/70">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <p>
              <strong className="text-emerald-400">To:</strong> {targetEmail || 'yourname@gmail.com'}
            </p>
            <p>
              <strong className="text-emerald-400">Subject:</strong> {digest.emailSubject}
            </p>
            <p>
              <strong className="text-emerald-400">Tagline:</strong> {digest.tagline}
            </p>
          </div>

          <div className="space-y-4 font-sans text-xs">
            <div className="border-b border-slate-800 pb-2">
              <span className="text-emerald-400 font-black text-sm uppercase">
                DEALHUNTER X DIGEST
              </span>
              <p className="text-slate-400 text-[11px]">{digest.tagline}</p>
            </div>

            {digest.ideas.map((idea, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">
                    {idx + 1}. {idea.ticker} ({idea.exchange}) —{' '}
                    <span className="text-emerald-400">{idea.direction}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Size: {idea.suggestedPositionSizePercent}% (~${idea.suggestedCapitalAmountUSD})
                  </span>
                </div>
                <p className="text-slate-300">{idea.thesis}</p>
                <ul className="space-y-1 text-slate-400 text-[11px]">
                  {idea.bullets.map((b, bI) => (
                    <li key={bI} className="flex gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-[10px] text-amber-300/80 pt-1 border-t border-slate-800">
                  Risk: {idea.keyRisk}
                </div>
              </div>
            ))}

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] space-y-1">
              <div className="font-bold">Risk Check ({digest.riskCheck.overallRiskLevel}):</div>
              <p>{digest.riskCheck.objectiveEvaluation}</p>
            </div>

            <div className="pt-2 text-slate-400 text-[11px] space-y-2 border-t border-slate-800">
              <p className="font-bold text-slate-200">Sign off: {digest.signOff}</p>
              <p className="text-[10px] text-slate-500">{digest.footerDisclaimer}</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-900">
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Email Digest</span>
              </>
            )}
          </button>

          <button
            onClick={handleDispatch}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            {dispatched ? (
              <>
                <Check className="w-4 h-4" />
                <span>Digest Queued for {targetEmail || 'Email'}!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Digest via Email</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
