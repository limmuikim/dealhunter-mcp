export type SectorType =
  | 'Healthcare'
  | 'Technology'
  | 'Energy'
  | 'Finance'
  | 'Consumer Goods'
  | 'Real Estate'
  | 'Industrials'
  | 'Crypto';

export type VehicleType =
  | 'Stocks'
  | 'Options'
  | 'Futures'
  | 'Forex'
  | 'Derivatives';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Extremely High';

export type DigestFrequency = 'Daily' | 'Weekly';

export interface UserPreferences {
  sectors: SectorType[];
  vehicles: VehicleType[];
  country: string;
  exchange: string;
  riskAppetite: RiskLevel;
  targetMultiplier: number;
  financialObjective: string;
  initialCapital: number;
  timeframe: string;
  email: string;
  frequency: DigestFrequency;
  deliveryTime: string;
  customQuery: string;
}

export interface CitedSource {
  mcpName: string;
  itemTitle: string;
  snippet?: string;
}

export interface TradeIdea {
  id: string;
  ticker: string;
  exchange: string;
  direction: 'LONG' | 'SHORT';
  thesis: string;
  entryRationale: string;
  suggestedPositionSizePercent: number;
  suggestedCapitalAmountUSD: number;
  timeHorizon: string;
  keyRisk: string;
  bullets: string[];
  citedSources: CitedSource[];
}

export interface RiskCheckResult {
  overallRiskLevel: string;
  objectiveEvaluation: string;
  downsideBuffer: string;
  volatilityFlag: string;
  capitalPreservationNote: string;
}

export interface DigestPayload {
  date: string;
  emailSubject: string;
  tagline: string;
  ideas: TradeIdea[];
  riskCheck: RiskCheckResult;
  sourcesConsulted: string[];
  unavailableSources: Array<{ serverId: string; reason: string }>;
  callCount: number;
  estimatedCostUSD: string;
  signOff: string;
  footerDisclaimer: string;
  thinEvidenceNote?: string;
}

export interface McpServerHealth {
  id: string;
  name: string;
  configured: boolean;
  answered: boolean;
  toolsDiscovered: number;
  status: string;
  details: string;
}

export interface HealthReport {
  status: 'ok' | 'degraded' | 'unconfigured';
  summary: string;
  servers: Record<string, McpServerHealth>;
  totalConfigured: number;
  totalAnswered: number;
  timestamp: string;
}
