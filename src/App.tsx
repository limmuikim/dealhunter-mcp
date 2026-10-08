/**
 * Dealhunter X - Single Page Application
 * "Find tomorrow's ten-baggers, today."
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { PreferencesForm } from './components/PreferencesForm.tsx';
import { IntelligenceSources } from './components/IntelligenceSources.tsx';
import { TradeIdeasView } from './components/TradeIdeasView.tsx';
import { RiskCheckCard } from './components/RiskCheckCard.tsx';
import { SampleDailyDigestCard } from './components/SampleDailyDigestCard.tsx';
import { WhoIsThisFor } from './components/WhoIsThisFor.tsx';
import { EmailModal } from './components/EmailModal.tsx';
import { SubscribeModal } from './components/SubscribeModal.tsx';
import { SAMPLE_DAILY_DIGEST } from './data/sampleDigest.ts';
import {
  UserPreferences,
  DigestPayload,
  HealthReport,
} from './types/index.ts';
import {
  Download,
  Mail,
  AlertCircle,
  Sparkles,
  Info,
  DollarSign,
  Activity,
  CheckCircle,
} from 'lucide-react';

const STORAGE_KEY = 'dealhunter_x_preferences_v1';

const DEFAULT_PREFERENCES: UserPreferences = {
  sectors: ['Technology', 'Healthcare'],
  vehicles: ['Stocks'],
  country: 'United States',
  exchange: 'NASDAQ',
  riskAppetite: 'High',
  targetMultiplier: 10,
  financialObjective: '10X return on $1,000 capital',
  initialCapital: 1000,
  timeframe: '1 Month',
  email: '',
  frequency: 'Daily',
  deliveryTime: '6:00 AM',
  customQuery: '',
};

export default function App() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (e) {
      // Fallback
    }
    return DEFAULT_PREFERENCES;
  });

  const [saveNotice, setSaveNotice] = useState(false);
  const [digest, setDigest] = useState<DigestPayload | null>(SAMPLE_DAILY_DIGEST);
  const [isSampleView, setIsSampleView] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Health check state
  const [healthReport, setHealthReport] = useState<HealthReport | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);

  // Modals
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);

  // Save to localStorage
  const handleSavePreferences = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      setSaveNotice(true);
      setTimeout(() => setSaveNotice(false), 2500);
    } catch (err) {
      console.error('Could not save to localStorage', err);
    }
  };

  const handlePreferencesChange = (updated: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updated }));
  };

  // Fetch MCP health status
  const fetchHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthReport(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.warn('Health check non-200:', errorData);
      }
    } catch (err) {
      console.warn('Could not contact /api/health:', err);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  // Generate trade ideas via full-stack endpoint
  const handleGenerateIdeas = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectors: preferences.sectors,
          vehicles: preferences.vehicles,
          exchanges: [preferences.exchange],
          riskAppetite: preferences.riskAppetite,
          financialObjective: preferences.financialObjective,
          initialCapital: preferences.initialCapital,
          timeframe: preferences.timeframe,
          email: preferences.email,
          customQuery: preferences.customQuery,
        }),
      });

      if (res.status === 503) {
        const errorJson = await res.json().catch(() => ({}));
        const missingKeyMsg =
          errorJson.error ||
          'SMITHERY_API_KEY or FMP_ACCESS_TOKEN is not set in Secrets / Vercel.';
        setErrorMessage(
          `${missingKeyMsg} Displaying calibrated sample live digest below for preview.`
        );
        setDigest(SAMPLE_DAILY_DIGEST);
        setIsSampleView(true);
        return;
      }

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(
          errorJson.error || `Server responded with status ${res.status}`
        );
      }

      const data: DigestPayload = await res.json();
      setDigest(data);
      setIsSampleView(false);
    } catch (err: any) {
      console.error('Error generating trade ideas:', err);
      setErrorMessage(
        err.message || 'Unable to connect to live MCP servers. Showing sample digest.'
      );
      // Keep sample digest so user can still see deliverable
      setDigest(SAMPLE_DAILY_DIGEST);
      setIsSampleView(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // PDF Download / Print
  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* App Header */}
      <div className="no-print">
        <Header onSubscribeClick={() => setIsSubscribeModalOpen(true)} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error / Secret Guidance Alert */}
        {errorMessage && (
          <div className="no-print mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 font-bold block mb-0.5">
                  Live MCP Server Environment Notice:
                </strong>
                <span className="text-amber-200/90 leading-relaxed">
                  {errorMessage}
                </span>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-amber-400 hover:text-amber-200 text-xs font-semibold px-2 py-1 rounded bg-amber-500/20 cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Printable Header only shown when printing to PDF */}
        <div className="hidden print:block mb-8 text-center border-b pb-4">
          <h1 className="text-3xl font-black tracking-tight text-slate-950 uppercase">
            DEALHUNTER X
          </h1>
          <p className="text-sm font-semibold text-slate-600 mt-1">
            Find tomorrow's ten-baggers, today.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Generated on {digest?.date || new Date().toLocaleDateString()} for{' '}
            {preferences.email || 'Investor'} · Capital: ${preferences.initialCapital} USD · Objective:{' '}
            {preferences.financialObjective}
          </p>
        </div>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form & Inputs (7 Columns on large) */}
          <div className="lg:col-span-7 space-y-6 no-print">
            <PreferencesForm
              preferences={preferences}
              onChange={handlePreferencesChange}
              onSavePreferences={handleSavePreferences}
              onGenerate={handleGenerateIdeas}
              isGenerating={isGenerating}
              saveNotice={saveNotice}
            />

            {/* Quick action bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Info className="w-4 h-4 text-emerald-400" />
                <span>
                  Preferences stored in local browser cache. Zero trackers.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Preview Email Digest</span>
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Intelligence Feeds, Live Trade Ideas & Risk Check (5 Columns on large) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Intelligence Sources status */}
            <div className="no-print">
              <IntelligenceSources
                healthReport={healthReport}
                isLoadingHealth={isLoadingHealth}
                onRefreshHealth={fetchHealth}
              />
            </div>

            {/* The Live / Sample 3 Trade Ideas Results */}
            {digest && (
              <div className="space-y-5">
                <TradeIdeasView
                  ideas={digest.ideas}
                  date={digest.date}
                  isSample={isSampleView}
                />

                {/* Risk Check Guardrail Box */}
                <RiskCheckCard riskCheck={digest.riskCheck} />

                {/* PDF & Email action bar inside results column */}
                <div className="no-print flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[11px] text-slate-400">
                    <span className="font-semibold text-emerald-400">
                      {digest.ideas.length} ideas
                    </span>{' '}
                    synthesized from Stage A MCP public signals.
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadPDF}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={() => setIsEmailModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Email Digest</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sample Daily Digest card (only if not currently active or for reference) */}
            <div className="no-print">
              <SampleDailyDigestCard
                onLoadSample={() => {
                  setDigest(SAMPLE_DAILY_DIGEST);
                  setIsSampleView(true);
                }}
                isActive={isSampleView}
              />
            </div>

            {/* Who Is This For? section */}
            <div className="no-print">
              <WhoIsThisFor />
            </div>

            {/* Call tracker / metrics info */}
            <div className="no-print p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Calls logged:{' '}
                  <strong className="text-slate-200">
                    {digest?.callCount || 4}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Est. cost/digest:{' '}
                  <strong className="text-emerald-400">
                    {digest?.estimatedCostUSD || '$0.0016'}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mandatory Exact Footer Line */}
      <footer className="mt-12 border-t border-slate-900 bg-slate-950 py-6 text-center px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="text-xs sm:text-[13px] text-slate-400 font-medium leading-relaxed">
            Dealhunter X is for education only. Not financial advice. Trade ideas are generated by AI from public sources and may be wrong. The tagline describes you can delegate tasks, but not responsibility.
          </p>
          <p className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} Dealhunter X · Signal-driven trade ideas · No brokerage connection or trade execution.
          </p>
        </div>
      </footer>

      {/* Email Digest Modal */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        digest={digest}
        targetEmail={preferences.email}
      />

      {/* Subscribe Modal */}
      <SubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
      />
    </div>
  );
}
