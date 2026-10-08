/**
 * Dealhunter X - MCP Server Registry
 * NOTE: Per project guardrails, MCP server URLs may ONLY be defined in this file.
 */

export interface McpServerConfig {
  id: 'polymarket' | 'social' | 'fmp' | 'crashtest';
  name: string;
  url: string;
  requiredEnvVar?: 'FMP_ACCESS_TOKEN';
  description: string;
  sourceType: string;
}

export const MCP_SERVERS: Record<string, McpServerConfig> = {
  social: {
    id: 'social',
    name: 'Social Superpowers',
    url: 'https://server.smithery.ai/pkobielak/social-superpowers',
    description: 'Social media trend analysis & viral buzz sentiment',
    sourceType: 'social',
  },
  polymarket: {
    id: 'polymarket',
    name: 'PolymarketScan',
    url: 'https://server.smithery.ai/jordan-s648/PolymarketScan',
    description: 'Prediction market volume and probability signals',
    sourceType: 'prediction',
  },
  fmp: {
    id: 'fmp',
    name: 'Financial Modeling Prep',
    url: 'https://server.smithery.ai/cfocoder/financial-modeling-prep-mcp-server',
    requiredEnvVar: 'FMP_ACCESS_TOKEN',
    description: 'Live equity pricing, fundamentals, metrics and earnings ratios',
    sourceType: 'market_data',
  },
  crashtest: {
    id: 'crashtest',
    name: 'Risk CrashTest',
    url: 'https://server.smithery.ai/crashtest',
    description: 'Automated downside stress-testing and tail-risk validation',
    sourceType: 'risk',
  },
};
