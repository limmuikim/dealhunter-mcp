import React from 'react';
import {
  Send,
  Save,
  Sliders,
  DollarSign,
  Clock,
  Mail,
  Search,
  Globe,
  TrendingUp,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';
import {
  SectorType,
  VehicleType,
  RiskLevel,
  DigestFrequency,
  UserPreferences,
} from '../types/index.ts';

interface PreferencesFormProps {
  preferences: UserPreferences;
  onChange: (updated: Partial<UserPreferences>) => void;
  onSavePreferences: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  saveNotice: boolean;
}

const ALL_SECTORS: SectorType[] = [
  'Healthcare',
  'Technology',
  'Energy',
  'Finance',
  'Consumer Goods',
  'Real Estate',
  'Industrials',
  'Crypto',
];

const ALL_VEHICLES: VehicleType[] = [
  'Stocks',
  'Options',
  'Futures',
  'Forex',
  'Derivatives',
];

const COUNTRIES = [
  { value: 'United States', label: 'United States' },
  { value: 'Singapore', label: 'Singapore (SGX)' },
  { value: 'Hong Kong', label: 'Hong Kong (HKEX)' },
  { value: 'United Kingdom', label: 'United Kingdom (LSE)' },
  { value: 'Japan', label: 'Japan (TSE)' },
  { value: 'Global', label: 'Global Cross-Market' },
];

const EXCHANGES = [
  { value: 'NYSE', label: 'NYSE' },
  { value: 'NASDAQ', label: 'NASDAQ' },
  { value: 'SGX', label: 'SGX (Singapore)' },
  { value: 'HKEX', label: 'HKEX (Hong Kong)' },
  { value: 'LSE', label: 'LSE (London)' },
  { value: 'MULTI', label: 'Multi-Exchange / Cross-Listed' },
];

const RISK_LEVELS: RiskLevel[] = ['Low', 'Medium', 'High', 'Extremely High'];

export const PreferencesForm: React.FC<PreferencesFormProps> = ({
  preferences,
  onChange,
  onSavePreferences,
  onGenerate,
  isGenerating,
  saveNotice,
}) => {
  const toggleSector = (sector: SectorType) => {
    const exists = preferences.sectors.includes(sector);
    if (exists) {
      if (preferences.sectors.length > 1) {
        onChange({ sectors: preferences.sectors.filter((s) => s !== sector) });
      }
    } else {
      onChange({ sectors: [...preferences.sectors, sector] });
    }
  };

  const toggleVehicle = (vehicle: VehicleType) => {
    const exists = preferences.vehicles.includes(vehicle);
    if (exists) {
      if (preferences.vehicles.length > 1) {
        onChange({ vehicles: preferences.vehicles.filter((v) => v !== vehicle) });
      }
    } else {
      onChange({ vehicles: [...preferences.vehicles, vehicle] });
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Sector Interests & 2. Country & Exchange */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sector Interests */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              Sector Interests
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-3.5">
            Select the sectors you're interested in trading
          </p>

          <div className="flex flex-wrap gap-2">
            {ALL_SECTORS.map((sector) => {
              const selected = preferences.sectors.includes(sector);
              return (
                <button
                  key={sector}
                  type="button"
                  onClick={() => toggleSector(sector)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                    selected
                      ? 'bg-slate-800 border-emerald-500/50 text-white shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selected ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                  />
                  {sector}
                </button>
              );
            })}
          </div>
        </div>

        {/* Country & Exchange */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              Country & Exchange
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-3.5">
            Choose your preferred markets
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Country
              </label>
              <select
                value={preferences.country}
                onChange={(e) => onChange({ country: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Market Exchange
              </label>
              <select
                value={preferences.exchange}
                onChange={(e) => onChange({ exchange: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                {EXCHANGES.map((ex) => (
                  <option key={ex.value} value={ex.value}>
                    {ex.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Vehicles Selection */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
            Financial Vehicles & Instruments
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Select eligible trading instruments (stocks, options, futures, forex, or derivatives)
        </p>

        <div className="flex flex-wrap gap-2">
          {ALL_VEHICLES.map((vehicle) => {
            const selected = preferences.vehicles.includes(vehicle);
            return (
              <button
                key={vehicle}
                type="button"
                onClick={() => toggleVehicle(vehicle)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                  selected
                    ? 'bg-slate-800 border-emerald-500/50 text-white shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    selected ? 'bg-emerald-400' : 'bg-slate-600'
                  }`}
                />
                {vehicle}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Return & Risk Appetite & 4. Capital & Timeframe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Return & Risk Appetite */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              Return & Risk Appetite
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Set your financial targets and risk tolerance
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-medium text-slate-400">
                  Target Return Multiplier
                </span>
                <span className="text-base font-black text-emerald-400">
                  {preferences.targetMultiplier}X
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={preferences.targetMultiplier}
                onChange={(e) =>
                  onChange({ targetMultiplier: parseInt(e.target.value, 10) })
                }
                className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1X (Conservative)</span>
                <span>20X (Aggressive)</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-2">
                Risk Tolerance
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {RISK_LEVELS.map((level) => {
                  const selected = preferences.riskAppetite === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => onChange({ riskAppetite: level })}
                      className={`py-1.5 px-2 rounded-xl text-center text-xs font-medium border transition-all cursor-pointer ${
                        selected
                          ? 'bg-slate-800 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Capital & Timeframe */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              Capital & Timeframe
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Define your investment parameters
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Initial Capital (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500">$</span>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={preferences.initialCapital}
                  onChange={(e) =>
                    onChange({
                      initialCapital: Math.max(0, parseInt(e.target.value, 10) || 0),
                    })
                  }
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Investment Timeframe
              </label>
              <select
                value={preferences.timeframe}
                onChange={(e) => onChange({ timeframe: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                <option value="1 Month">1 Month (Catalyst Swing)</option>
                <option value="3 Months">3 Months (Quarterly Earnings)</option>
                <option value="6 Months">6 Months (Mid-Term Trend)</option>
                <option value="1 Year">1 Year (Ten-Bagger Horizon)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Objective & Interactive Catalyst Search */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
            Objective & Interactive Catalyst Search
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Specify your goal or type specific catalysts you are hunting (e.g., AI chips, GLP-1 weight loss, uranium energy)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Financial Objective (Free Text)
            </label>
            <input
              type="text"
              value={preferences.financialObjective}
              onChange={(e) => onChange({ financialObjective: e.target.value })}
              placeholder="e.g. 10X return on $1,000 capital"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Interactive Search Query / Theme Catalyst
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={preferences.customQuery}
                onChange={(e) => onChange({ customQuery: e.target.value })}
                placeholder="e.g., AI accelerators, defense drones, nuclear fusion"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Email & Delivery Preferences */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
            Email & Delivery Preferences
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Configure how you receive your trade ideas
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Gmail Address
            </label>
            <input
              type="email"
              value={preferences.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="yourname@gmail.com"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-2">
                Digest Frequency
              </label>
              <div className="flex gap-4">
                {(['Daily', 'Weekly'] as DigestFrequency[]).map((freq) => {
                  const selected = preferences.frequency === freq;
                  return (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => onChange({ frequency: freq })}
                      className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer"
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selected
                            ? 'border-emerald-400 bg-emerald-500/20'
                            : 'border-slate-600 bg-transparent'
                        }`}
                      >
                        {selected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </span>
                      <span>{freq}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Preferred Delivery Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <select
                  value={preferences.deliveryTime}
                  onChange={(e) => onChange({ deliveryTime: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  <option value="6:00 AM">6:00 AM (Pre-Market Open)</option>
                  <option value="8:00 AM">8:00 AM (Morning Bell)</option>
                  <option value="4:30 PM">4:30 PM (Post-Market Close)</option>
                  <option value="8:00 PM">8:00 PM (Evening Digest)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        {/* Main CTA */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm tracking-wide transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.55)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin text-slate-950 text-base">●</span>
              <span>Running Stage A MCP Feeds & Risk Check...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 fill-slate-950" />
              <span>Generate My Trade Ideas</span>
            </>
          )}
        </button>

        {/* Save preferences button */}
        <button
          type="button"
          onClick={onSavePreferences}
          className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {saveNotice ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Saved to LocalStorage!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-slate-400" />
              <span>Save preferences</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
