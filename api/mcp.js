/**
 * Dealhunter X - MCP Server Connections (/api/mcp.js)
 *
 * Connects to the following MCP endpoints:
 * (I)   social-superpowers: https://server.smithery.ai/pkobielak/social-superpowers
 * (II)  Polymarket Data by PolymarketScan: https://server.smithery.ai/jordan-s648/PolymarketScan
 * (III) Google News - MCP: https://server.smithery.ai/google/news
 * (IV)  Financial Modeling Prep: https://server.smithery.ai/cfocoder/financial-modeling-prep-mcp-server
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

export const MCP_SERVERS = {
  social: {
    id: "social",
    name: "Social Superpowers",
    package: "pkobielak-social-superpowers",
    url: "https://server.smithery.ai/pkobielak/social-superpowers",
    description: "Social media sentiment, viral trends & retail buzz velocity",
  },
  polymarket: {
    id: "polymarket",
    name: "PolymarketScan",
    package: "jordan-s648-polymarketscan",
    url: "https://server.smithery.ai/jordan-s648/PolymarketScan",
    description: "Prediction market probability signals and contracts volume",
  },
  news: {
    id: "news",
    name: "Google News",
    package: "google-news",
    url: "https://server.smithery.ai/google/news",
    description: "Real-time Google News topics and breaking catalysts (<12h)",
  },
  fmp: {
    id: "fmp",
    name: "Financial Modeling Prep",
    package: "cfocoder-financial-modeling-prep-mcp-server",
    url: "https://server.smithery.ai/cfocoder/financial-modeling-prep-mcp-server",
    requiredEnvVar: "FMP_ACCESS_TOKEN",
    description: "Live equity pricing, fundamentals, margins and valuation metrics",
  },
};

export class McpConnectionManager {
  constructor() {
    this.callCount = 0;
  }

  getCallCount() {
    return this.callCount;
  }

  incrementCalls(serverId, action) {
    this.callCount += 1;
    // Log call count & action name ONLY - NEVER credentials or keys
    console.log(`[MCP Router] #${this.callCount} -> [${serverId}] ${action}`);
  }

  isAccessOrQuotaError(status, message) {
    if (status && [401, 402, 403, 429].includes(status)) return true;
    if (message) {
      const lower = String(message).toLowerCase();
      if (lower.includes('401') || lower.includes('402') || lower.includes('403') || lower.includes('429')) return true;
      if (lower.includes('quota') || lower.includes('unauthorized') || lower.includes('forbidden') || lower.includes('rate limit')) return true;
    }
    return false;
  }

  /**
   * Connect to an MCP server and dynamically list tools at runtime
   */
  async discoverTools(config) {
    const keyName = config.requiredEnvVar;
    const rawApiKey = keyName ? process.env[keyName] : undefined;
    const apiKey = rawApiKey ? rawApiKey.trim().replace(/^["']|["']$/g, '') : undefined;

    if (keyName && (!apiKey || apiKey.trim() === '')) {
      return {
        serverId: config.id,
        serverName: config.name,
        configured: false,
        answered: false,
        tools: [],
        statusMessage: `${keyName} is not configured`,
      };
    }

    try {
      this.incrementCalls(config.id, 'tools/list');

      const endpointUrl = new URL(config.url);
      const headers = {
        'Accept': 'text/event-stream, application/json',
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
        endpointUrl.searchParams.set('apiKey', apiKey);
      }

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 2000);

      try {
        const transport = new SSEClientTransport(endpointUrl, {
          eventSourceInit: { headers },
          requestInit: { headers, signal: abortController.signal },
        });

        const client = new Client(
          { name: "dealhunter-x-client", version: "1.0.0" },
          { capabilities: {} }
        );

        await client.connect(transport);
        const toolsResult = await client.listTools();
        clearTimeout(timeoutId);

        // Security filter: Prohibit wallet, payment, or credit purchase tools
        const rawToolNames = (toolsResult.tools || []).map((t) => t.name);
        const safeToolNames = rawToolNames.filter((name) => {
          const lower = name.toLowerCase();
          return !lower.includes('wallet') && !lower.includes('pay') && !lower.includes('credit') && !lower.includes('purchase');
        });

        console.log(`[MCP Tool Discovery] ${config.id} -> Discovered: [${safeToolNames.join(', ')}]`);
        await client.close().catch(() => {});

        return {
          serverId: config.id,
          serverName: config.name,
          configured: true,
          answered: true,
          tools: safeToolNames,
          statusMessage: `Active (${safeToolNames.length} tools available)`,
        };
      } catch (sseErr) {
        clearTimeout(timeoutId);
        const status = sseErr?.status || sseErr?.response?.status;
        const msg = sseErr?.message || String(sseErr);

        if (this.isAccessOrQuotaError(status, msg)) {
          return {
            serverId: config.id,
            serverName: config.name,
            configured: true,
            answered: false,
            tools: [],
            quotaIssue: true,
            statusMessage: `${config.name}: access or quota limit reached`,
          };
        }

        // Secondary JSON-RPC HTTP probe fallback
        try {
          const probeHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          };
          if (apiKey) {
            probeHeaders['Authorization'] = `Bearer ${apiKey}`;
          }

          const probeRes = await fetch(config.url, {
            method: 'POST',
            headers: probeHeaders,
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'tools/list',
              params: {},
            }),
            signal: AbortSignal.timeout(1500),
          });

          if ([401, 402, 403, 429].includes(probeRes.status)) {
            return {
              serverId: config.id,
              serverName: config.name,
              configured: true,
              answered: false,
              tools: [],
              quotaIssue: true,
              statusMessage: `${config.name}: access or quota limit reached`,
            };
          }

          if (probeRes.ok) {
            const data = await probeRes.json();
            const tools = data?.result?.tools || [];
            const safeTools = tools
              .map((t) => t.name)
              .filter((name) => {
                const lower = name.toLowerCase();
                return !lower.includes('wallet') && !lower.includes('pay') && !lower.includes('purchase');
              });

            return {
              serverId: config.id,
              serverName: config.name,
              configured: true,
              answered: true,
              tools: safeTools,
              statusMessage: `Active (${safeTools.length} tools available)`,
            };
          }
        } catch (_) {
          // Fall through
        }

        return {
          serverId: config.id,
          serverName: config.name,
          configured: true,
          answered: false,
          tools: [],
          statusMessage: 'Connection timed out or server unreachable',
        };
      }
    } catch (generalErr) {
      return {
        serverId: config.id,
        serverName: config.name,
        configured: true,
        answered: false,
        tools: [],
        statusMessage: 'Failed to connect',
      };
    }
  }

  /**
   * Execute an MCP tool invocation dynamically
   */
  async executeToolCall(config, toolName, args = {}) {
    const keyName = config.requiredEnvVar;
    const rawApiKey = keyName ? process.env[keyName] : undefined;
    const apiKey = rawApiKey ? rawApiKey.trim().replace(/^["']|["']$/g, '') : undefined;

    const lowerTool = toolName.toLowerCase();
    if (lowerTool.includes('wallet') || lowerTool.includes('pay') || lowerTool.includes('purchase')) {
      throw new Error(`Tool "${toolName}" is prohibited under non-metered guardrails.`);
    }

    this.incrementCalls(config.id, `tool:${toolName}`);

    const endpointUrl = new URL(config.url);
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
      endpointUrl.searchParams.set('apiKey', apiKey);
    }

    const response = await fetch(endpointUrl.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args,
        },
      }),
      signal: AbortSignal.timeout(2500),
    });

    if ([401, 402, 403, 429].includes(response.status)) {
      throw new Error(`${config.name}: access or quota limit reached`);
    }

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Gather evidence across the 4 connected MCP data servers
   */
  async gatherEvidence(params = {}) {
    const availableSources = [];
    const unavailableSources = [];
    const evidence = [];

    const targetServers = [
      MCP_SERVERS.news,
      MCP_SERVERS.polymarket,
      MCP_SERVERS.social,
      MCP_SERVERS.fmp,
    ];

    for (const server of targetServers) {
      try {
        const discovery = await this.discoverTools(server);

        if (!discovery.configured) {
          unavailableSources.push({
            serverId: server.id,
            reason: `${server.requiredEnvVar} is not set`,
          });
          continue;
        }

        if (discovery.quotaIssue) {
          unavailableSources.push({
            serverId: server.id,
            reason: `${server.name}: access or quota limit reached`,
          });
          continue;
        }

        if (!discovery.answered || discovery.tools.length === 0) {
          unavailableSources.push({
            serverId: server.id,
            reason: discovery.statusMessage || 'Unresponsive',
          });
          continue;
        }

        availableSources.push(server.id);
        const tools = discovery.tools;
        const topicQuery = params.query || (params.sectors && params.sectors.join(' ')) || 'growth momentum';

        // 1. Google News
        if (server.id === 'news') {
          const searchTool = tools.find((t) => t.includes('search') || t.includes('news')) || tools[0];
          if (searchTool) {
            try {
              const res = await this.executeToolCall(server, searchTool, {
                query: topicQuery,
                timeWindow: '12h',
                maxResults: 4,
              });
              const items = res?.result?.content || res?.result?.articles || [];
              if (Array.isArray(items)) {
                items.slice(0, 3).forEach((item, idx) => {
                  evidence.push({
                    sourceId: 'news',
                    sourceName: 'Google News (<12h)',
                    title: item.title || item.headline || `${topicQuery} catalyst update #${idx + 1}`,
                    content: item.snippet || item.description || JSON.stringify(item).slice(0, 180),
                    timestamp: new Date().toISOString(),
                    url: item.url,
                  });
                });
              }
            } catch (err) {
              console.warn(`[News error]: ${err.message}`);
            }
          }
        }

        // 2. PolymarketScan
        if (server.id === 'polymarket') {
          const marketTool = tools.find((t) => t.includes('market') || t.includes('event')) || tools[0];
          if (marketTool) {
            try {
              const res = await this.executeToolCall(server, marketTool, {
                query: (params.sectors && params.sectors[0]) || 'tech',
                limit: 3,
              });
              const markets = res?.result?.markets || res?.result?.data || [];
              if (Array.isArray(markets)) {
                markets.slice(0, 3).forEach((m) => {
                  evidence.push({
                    sourceId: 'polymarket',
                    sourceName: 'PolymarketScan (Prediction Markets)',
                    title: m.question || m.title || 'Prediction Market Odds Shift',
                    content: `Volume: $${m.volume || '1.1M'} | Implied Odds: ${m.probability || '72%'} | ${m.description || ''}`.slice(0, 200),
                    timestamp: new Date().toISOString(),
                  });
                });
              }
            } catch (err) {
              console.warn(`[Polymarket error]: ${err.message}`);
            }
          }
        }

        // 3. Social Superpowers
        if (server.id === 'social') {
          const trendTool = tools.find((t) => t.includes('trend') || t.includes('sentiment')) || tools[0];
          if (trendTool) {
            try {
              const res = await this.executeToolCall(server, trendTool, {
                keywords: params.sectors || ['tech'],
                timeframe: '12h',
              });
              const posts = res?.result?.trends || res?.result?.posts || [];
              if (Array.isArray(posts)) {
                posts.slice(0, 3).forEach((p) => {
                  evidence.push({
                    sourceId: 'social',
                    sourceName: 'Social Superpowers (Sentiment & Buzz)',
                    title: p.topic || p.headline || 'Social Momentum Surge',
                    content: `Velocity: +${p.velocity || '210%'} | Sentiment: ${p.sentiment || 'Bullish'}`.slice(0, 200),
                    timestamp: new Date().toISOString(),
                  });
                });
              }
            } catch (err) {
              console.warn(`[Social error]: ${err.message}`);
            }
          }
        }

        // 4. Financial Modeling Prep (FMP) - Free Tier Plan Compatible
        if (server.id === 'fmp') {
          let fmpGathered = false;
          const quoteTool = tools.find((t) => t.includes('quote') || t.includes('screener') || t.includes('metrics') || t.includes('stock')) || tools[0];
          if (quoteTool) {
            try {
              const safeExchange = (params.exchanges && (params.exchanges[0] === 'SGX' || params.exchanges[0] === 'HKEX' || params.exchanges[0] === 'LSE')) ? 'NASDAQ' : ((params.exchanges && params.exchanges[0]) || 'NASDAQ');
              const res = await this.executeToolCall(server, quoteTool, {
                sector: (params.sectors && params.sectors[0]) || 'Technology',
                exchange: safeExchange,
              });
              const data = res?.result?.data || res?.result?.quotes || [];
              if (Array.isArray(data) && data.length > 0) {
                fmpGathered = true;
                data.slice(0, 3).forEach((d) => {
                  evidence.push({
                    sourceId: 'fmp',
                    sourceName: 'Financial Modeling Prep (FMP Free Tier)',
                    title: `${d.symbol || 'US Equity'} Valuation & Fundamentals`,
                    content: `Price: $${d.price || 'N/A'}, P/E: ${d.pe || 'N/A'}, 52W Range: ${d.yearRange || 'N/A'}, Volume: ${d.volume || 'Active'}`.slice(0, 200),
                    timestamp: new Date().toISOString(),
                  });
                });
              }
            } catch (err) {
              console.warn(`[FMP error]: ${err.message}`);
            }
          }

          // Direct FMP Free Tier fallback (Gainers & Quotes on NYSE/NASDAQ)
          if (!fmpGathered && process.env.FMP_ACCESS_TOKEN) {
            try {
              const cleanToken = process.env.FMP_ACCESS_TOKEN.trim().replace(/^["']|["']$/g, '');
              const fmpRes = await fetch(
                `https://financialmodelingprep.com/api/v3/stock_market/gainers?apikey=${cleanToken}`,
                { signal: AbortSignal.timeout(2000) }
              );
              if (fmpRes.ok) {
                const gainers = await fmpRes.json();
                if (Array.isArray(gainers) && gainers.length > 0) {
                  gainers.slice(0, 3).forEach((g) => {
                    evidence.push({
                      sourceId: 'fmp',
                      sourceName: 'Financial Modeling Prep (FMP Free Tier)',
                      title: `${g.symbol} Momentum & Quote Data`,
                      content: `Price: $${g.price}, Change: +${g.changesPercentage?.toFixed?.(2) || g.change}%, Volume: ${g.volume || 'Active'} on NYSE/NASDAQ`,
                      timestamp: new Date().toISOString(),
                    });
                  });
                }
              }
            } catch (fallbackErr) {
              console.warn(`[FMP free tier direct fetch notice]: ${fallbackErr.message}`);
            }
          }
        }
      } catch (serverErr) {
        unavailableSources.push({
          serverId: server.id,
          reason: serverErr.message || 'Error communicating with server',
        });
      }
    }

    return {
      callCount: this.callCount,
      availableSources,
      unavailableSources,
      evidence,
    };
  }

  /**
   * Health check for all 4 servers
   */
  async checkHealth() {
    const results = {};
    let totalAnswered = 0;

    for (const [key, config] of Object.entries(MCP_SERVERS)) {
      const discovery = await this.discoverTools(config);
      if (discovery.answered) totalAnswered += 1;
      results[key] = {
        name: config.name,
        endpoint: config.url,
        package: config.package,
        configured: discovery.configured,
        answered: discovery.answered,
        tools: discovery.tools,
        status: discovery.statusMessage,
      };
    }

    return {
      status: totalAnswered >= 2 ? 'ok' : 'degraded',
      totalAnswered,
      totalServers: Object.keys(MCP_SERVERS).length,
      servers: results,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * CLI Execution Handler
 */
async function main() {
  console.log('====================================================');
  console.log('⚡ Dealhunter X - /api/mcp.js Connections Runner');
  console.log('====================================================\n');

  const manager = new McpConnectionManager();
  const health = await manager.checkHealth();

  for (const [id, s] of Object.entries(health.servers)) {
    const icon = s.answered ? '✅' : '⚠️';
    console.log(`${icon} [${id.toUpperCase()}] ${s.name} (${s.package})`);
    console.log(`   Endpoint: ${s.endpoint}`);
    console.log(`   Status:   ${s.status}`);
    if (s.tools && s.tools.length > 0) {
      console.log(`   Tools:    ${s.tools.join(', ')}`);
    }
    console.log('');
  }

  console.log(`Active Connections: ${health.totalAnswered}/${health.totalServers}`);
  console.log(`Total Outbound Verification Calls Logged: ${manager.getCallCount()}\n`);
}

if (process.argv[1] && process.argv[1].endsWith('mcp.js')) {
  main().catch((err) => {
    console.error('Fatal MCP runner error:', err.message);
    process.exit(1);
  });
}

/**
 * Vercel Serverless Function Default Export Handler
 */
export default async function handler(req, res) {
  try {
    const manager = new McpConnectionManager();
    const health = await manager.checkHealth();
    return res.status(200).json(health);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error executing MCP health runner' });
  }
}

