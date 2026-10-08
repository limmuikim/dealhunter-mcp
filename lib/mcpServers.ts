/**
 * Dealhunter X - MCP Server Registry
 * NOTE: Per project guardrails, MCP server URLs may ONLY be defined in this file.
 */

export interface McpServerConfig {
  id: 'news' | 'polymarket' | 'reddit' | 'social' | 'fmp' | 'crashtest' | 'gmail' | 'hub';
  name: string;
  url: string;
  requiredEnvVar?: 'SMITHERY_API_KEY' | 'FMP_ACCESS_TOKEN';
  description: string;
  sourceType: string;
}

export const MCP_SERVERS: Record<string, McpServerConfig> = {
  hub: {
    id: 'hub',
    name: 'Dealhunter X MCP Hub',
    url: 'https://mcp.smithery.ai/muikimlim-insead',
    requiredEnvVar: 'SMITHERY_API_KEY',
    description: 'Central Dealhunter X MCP aggregation endpoint',
    sourceType: 'hub',
  },
  social: {
    id: 'social',
    name: 'Social Superpowers',
    url: 'https://server.smithery.ai/pkobielak/social-superpowers',
    requiredEnvVar: 'SMITHERY_API_KEY',
    description: 'Social media trend analysis & viral buzz sentiment',
    sourceType: 'social',
  },
  polymarket: {
    id: 'polymarket',
    name: 'PolymarketScan',
    url: 'https://server.smithery.ai/jordan-s648/PolymarketScan',
    requiredEnvVar: 'SMITHERY_API_KEY',
    description: 'Prediction market volume and probability signals',
    sourceType: 'prediction',
  },
  news: {
    id: 'news',
    name: 'Google News',
    url: 'https://server.smithery.ai/google/news',
    requiredEnvVar: 'SMITHERY_API_KEY',
    description: 'Real-time trending news (< 12 hours) and breaking catalysts',
    sourceType: 'news',
  },
  fmp: {
    id: 'fmp',
    name: 'Financial Modeling Prep',
    url: 'https://server.smithery.ai/cfocoder/financial-modeling-prep-mcp-server',
    requiredEnvVar: 'FMP_ACCESS_TOKEN',
    description: 'Live equity pricing, fundamentals, metrics and earnings ratios',
    sourceType: 'market_data',
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit Trends',
    url: 'https://server.smithery.ai/pkobielak/social-superpowers',
    requiredEnvVar: 'SMITHERY_API_KEY',
    description: 'Retail trading crowd momentum and forum mentions',
    sourceType: 'social',
  },
  crashtest: {
    id: 'crashtest',
    name: 'Risk CrashTest',
    url: 'https://server.smithery.ai/crashtest',
    requiredEnvVar: 'SMITHERY_API_KEY',
    description: 'Automated downside stress-testing and tail-risk validation',
    sourceType: 'risk',
  },
  gmail: {
    id: 'gmail',
    name: 'Digest Dispatcher (Gmail)',
    url: 'https://server.smithery.ai/gmail',
    requiredEnvVar: 'SMITHERY_API_KEY',
    description: 'Digest distribution and email confirmation channel',
    sourceType: 'email',
  },
};
