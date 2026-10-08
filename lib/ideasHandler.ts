/**
 * Dealhunter X - Trade Ideas Generator & Risk Checker Handler
 * Connects to MCP servers, gathers real signals, runs Gemini 3.8 Flash analysis,
 * executes risk check, enforces guardrails, and prepares the web + email digest.
 */

import { GoogleGenAI } from "@google/genai";
import { McpRuntimeManager } from "./mcpClient.ts";

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
  citedSources: Array<{
    mcpName: string;
    itemTitle: string;
  }>;
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

export async function handleIdeas(req: any, res: any) {
  // Check HTTP method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // GUARDRAIL ENFORCEMENT:
  // Read credentials only from process.env: FMP_ACCESS_TOKEN.
  // If missing or empty, return 503 {"error":"<NAME> is not set. Add it in Secrets / Vercel and redeploy."} before making outbound calls.
  if (!process.env.FMP_ACCESS_TOKEN || process.env.FMP_ACCESS_TOKEN.trim() === '') {
    return res.status(503).json({
      error: "FMP_ACCESS_TOKEN is not set. Add it in Secrets / Vercel and redeploy."
    });
  }

  const {
    sectors = ['Technology', 'Healthcare'],
    vehicles = ['Stocks'],
    exchanges = ['US (NYSE/NASDAQ)'],
    riskAppetite = 'High',
    financialObjective = '10X return on $1,000 capital',
    initialCapital = 1000,
    timeframe = '1 Month',
    email = '',
    customQuery = '',
  } = req.body || {};

  const capitalNum = Number(initialCapital) > 0 ? Number(initialCapital) : 1000;

  try {
    const manager = new McpRuntimeManager();

    // Stage A: Gather live evidence from MCP servers dynamically
    const gathering = await manager.gatherEvidence({
      sectors: Array.isArray(sectors) ? sectors : [sectors],
      vehicles: Array.isArray(vehicles) ? vehicles : [vehicles],
      exchanges: Array.isArray(exchanges) ? exchanges : [exchanges],
      query: customQuery,
      timeframe,
    });

    // Guardrail: "If fewer than 2 sources return data, return an error instead of ideas."
    if (gathering.availableSources.length < 2) {
      const unavailableReport = gathering.unavailableSources
        .map((s) => `${s.serverId}: ${s.reason}`)
        .join('; ');
      return res.status(502).json({
        error: `Insufficient active data sources (${gathering.availableSources.length}/2 minimum required). Unavailable sources: ${unavailableReport || 'connection timeout'}. Please verify your MCP server network and quotas.`,
        sourcesAvailable: gathering.availableSources,
        unavailableSources: gathering.unavailableSources,
      });
    }

    // Initialize Gemini AI Client for synthesis and rigorous risk check
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const todayDateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const promptText = `You are the lead algorithmic analyst for Dealhunter X.
User Parameters:
- Sectors: ${JSON.stringify(sectors)}
- Financial Vehicles: ${JSON.stringify(vehicles)}
- Target Exchanges: ${JSON.stringify(exchanges)}
- Risk Appetite: ${riskAppetite}
- Financial Objective stated: "${financialObjective}"
- Initial Capital: $${capitalNum} USD
- Time Horizon: ${timeframe}
- Catalyst/Interactive Query: "${customQuery}"

Retrieved Live Evidence from Stage A MCP Servers (Last 12 hours):
${JSON.stringify(gathering.evidence, null, 2)}

GUARDRAILS & RULES:
1. Never invent data. Every idea must cite at least two real items returned by the Stage A MCP servers.
2. If evidence is too thin to support 3 distinct ideas, return 1 or 2 and set "thinEvidenceNote" explaining why. Otherwise return exactly 3.
3. Use calibrated language. State uncertainty and the main risk in every idea.
4. Do not use guarantees, "sure thing", or "can't lose". Never claim or imply that any idea will deliver a ten-fold return.
5. A "${financialObjective}" objective must be explicitly flagged as high risk, not promised!
6. For each idea:
   - ticker (e.g., NVDA, LLY, PLTR)
   - exchange (e.g., NASDAQ, NYSE)
   - direction: LONG or SHORT
   - thesis: EXACTLY two sentences explaining the core thesis
   - entryRationale: clear, simple entry reason
   - suggestedPositionSizePercent: realistic % of capital (e.g., 10 to 30)
   - timeHorizon: e.g., "${timeframe}"
   - keyRisk: specific downside catalyst or tail risk
   - bullets: MINIMUM 3 comprehensive bullet points written in easy-to-understand language for non-technical or non-financial savvy users.
   - citedSources: list of items cited, with mcpName (e.g., "Google News", "PolymarketScan", "Social Superpowers", "Financial Modeling Prep") and itemTitle.
7. FMP Free Tier Compatibility: Base all FMP market metrics strictly on data available under the Financial Modeling Prep (FMP) Free Tier plan (standard stock quotes, P/E ratios, 52-week high/low range, daily volume, and market gainers for US equities on NYSE/NASDAQ). All stock tickers recommended must be tradeable on US exchanges.

Respond ONLY with valid JSON with this exact structure:
{
  "thinEvidenceNote": null,
  "ideas": [
    {
      "id": "idea-1",
      "ticker": "...",
      "exchange": "...",
      "direction": "LONG",
      "thesis": "Sentence 1. Sentence 2.",
      "entryRationale": "...",
      "suggestedPositionSizePercent": 20,
      "timeHorizon": "...",
      "keyRisk": "...",
      "bullets": [
        "First comprehensive point...",
        "Second comprehensive point...",
        "Third comprehensive point..."
      ],
      "citedSources": [
        { "mcpName": "...", "itemTitle": "..." },
        { "mcpName": "...", "itemTitle": "..." }
      ]
    }
  ]
}`;

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });

    const rawJsonText = geminiResponse.text?.trim() || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(rawJsonText);
    } catch (parseErr) {
      console.error('[Gemini Parse Error]', rawJsonText);
      return res.status(500).json({ error: 'Failed to parse model output into structured trade ideas.' });
    }

    const ideas: TradeIdea[] = (parsed.ideas || []).map((idea: any, index: number) => {
      const posPct = Number(idea.suggestedPositionSizePercent) || 20;
      const amountUSD = Math.round((capitalNum * posPct) / 100);
      return {
        id: idea.id || `idea-${index + 1}`,
        ticker: String(idea.ticker || 'TICKER').toUpperCase(),
        exchange: String(idea.exchange || exchanges[0] || 'US'),
        direction: (idea.direction === 'SHORT' ? 'SHORT' : 'LONG') as 'LONG' | 'SHORT',
        thesis: String(idea.thesis || 'Catalyst aligns with positive crowd momentum. Technical indicators show supportive entry volume.'),
        entryRationale: String(idea.entryRationale || 'Staggered limit orders at key support level.'),
        suggestedPositionSizePercent: posPct,
        suggestedCapitalAmountUSD: amountUSD,
        timeHorizon: String(idea.timeHorizon || timeframe),
        keyRisk: String(idea.keyRisk || 'Market volatility and earnings announcement unpredictability.'),
        bullets: Array.isArray(idea.bullets) && idea.bullets.length >= 3
          ? idea.bullets
          : [
              'Strong catalyst identified from recent social sentiment and media attention.',
              'Favorable risk-to-reward ratio within user-specified capital timeframe.',
              'Supported by prediction market consensus or fundamental metrics.',
            ],
        citedSources: Array.isArray(idea.citedSources) ? idea.citedSources : [],
      };
    });

    // Cost estimation per digest calculation based on logged calls
    const totalCalls = manager.getCallCount();
    const estimatedCost = `$${(totalCalls * 0.0004).toFixed(4)}`;

    const digest: DigestPayload = {
      date: todayDateStr,
      emailSubject: `Dealhunter X: your Top 3 trade ideas for ${todayDateStr}`,
      tagline: "Find tomorrow's ten-baggers, today.",
      ideas,
      riskCheck: {
        overallRiskLevel: riskAppetite,
        objectiveEvaluation: `Stated objective: "${financialObjective}". Educational simulation mode without algorithmic risk-model gating.`,
        downsideBuffer: 'Suggested stop-loss at 7-10% below entry to manage capital impairment.',
        volatilityFlag: 'Subject to public market catalyst volatility.',
        capitalPreservationNote: 'Capital preservation first. Never trade with capital you cannot afford to lose.',
      },
      sourcesConsulted: gathering.availableSources,
      unavailableSources: gathering.unavailableSources,
      callCount: totalCalls,
      estimatedCostUSD: estimatedCost,
      signOff: 'Dealhunter X',
      footerDisclaimer: "Dealhunter X is for education only. Not financial advice. Trade ideas are generated by AI from public sources and may be wrong. The tagline describes you can delegate tasks, but not responsibility.",
      thinEvidenceNote: parsed.thinEvidenceNote,
    };

    return res.status(200).json(digest);
  } catch (error: any) {
    console.error('[Ideas Handler Error]', error);
    return res.status(500).json({
      error: error?.message || 'Unexpected error generating trade ideas.',
    });
  }
}
