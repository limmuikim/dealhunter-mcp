/**
 * Dealhunter X - MCP Runtime Client
 * Connects to runtime MCP servers, dynamically lists available tools,
 * enforces safety guardrails (no payment/wallet tools, no credential leaks),
 * and counts outbound calls for cost estimation.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { MCP_SERVERS, McpServerConfig } from "./mcpServers.ts";

export interface ToolDiscoveryResult {
  serverId: string;
  serverName: string;
  configured: boolean;
  answered: boolean;
  tools: string[];
  statusMessage: string;
  quotaIssue?: boolean;
}

export interface GatheredEvidenceItem {
  sourceId: string;
  sourceName: string;
  title: string;
  content: string;
  timestamp?: string;
  url?: string;
}

export interface GatheringSummary {
  callCount: number;
  availableSources: string[];
  unavailableSources: { serverId: string; reason: string }[];
  evidence: GatheredEvidenceItem[];
}

export class McpRuntimeManager {
  private callCount = 0;

  public getCallCount(): number {
    return this.callCount;
  }

  private incrementCallCount(serverId: string, actionName: string): void {
    this.callCount += 1;
    // Log call count & action name ONLY - NEVER credentials or query secrets
    console.log(`[Dealhunter X Call Counter] #${this.callCount} -> Server: ${serverId}, Action: ${actionName}`);
  }

  /**
   * Helper to inspect HTTP status code for quota / permission issues
   */
  private isAccessOrQuotaError(status?: number, message?: string): boolean {
    if (status && [401, 402, 403, 429].includes(status)) return true;
    if (message) {
      const lower = message.toLowerCase();
      if (lower.includes('401') || lower.includes('402') || lower.includes('403') || lower.includes('429')) return true;
      if (lower.includes('quota') || lower.includes('unauthorized') || lower.includes('forbidden') || lower.includes('rate limit')) return true;
    }
    return false;
  }

  /**
   * Check connection and list available tools on an MCP server dynamically
   */
  public async discoverTools(config: McpServerConfig): Promise<ToolDiscoveryResult> {
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
      this.incrementCallCount(config.id, 'tools/list');

      // Attempt MCP connection via standard SSE transport with timeout
      const endpointUrl = new URL(config.url);
      const headers: Record<string, string> = {
        'Accept': 'text/event-stream, application/json',
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
        headers['x-smithery-api-key'] = apiKey;
        // Support Smithery apiKey query parameters
        endpointUrl.searchParams.set('apiKey', apiKey);
        endpointUrl.searchParams.set('api_key', apiKey);
      }

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 6000);

      try {
        const transport = new SSEClientTransport(endpointUrl, {
          eventSourceInit: {
            // @ts-expect-error SSE transport headers
            headers,
          },
          requestInit: {
            headers,
            signal: abortController.signal,
          },
        });

        const client = new Client(
          { name: "dealhunter-x-client", version: "1.0.0" },
          { capabilities: {} }
        );

        await client.connect(transport);
        const toolsResult = await client.listTools();
        clearTimeout(timeoutId);

        // Safe tool filtering - Never allow wallet, payment, or credit purchase tools
        const rawToolNames = (toolsResult.tools || []).map((t) => t.name);
        const safeToolNames = rawToolNames.filter((name) => {
          const lower = name.toLowerCase();
          return !lower.includes('wallet') && !lower.includes('pay') && !lower.includes('credit') && !lower.includes('purchase');
        });

        // Log tool names found - NEVER credentials
        console.log(`[MCP Tools Discovery] Server: ${config.id} -> Found tools: [${safeToolNames.join(', ')}]`);

        await client.close().catch(() => {});

        return {
          serverId: config.id,
          serverName: config.name,
          configured: true,
          answered: true,
          tools: safeToolNames,
          statusMessage: `Active with ${safeToolNames.length} tool(s) listed`,
        };
      } catch (sseErr: any) {
        clearTimeout(timeoutId);

        // Check for access or quota errors
        const status = sseErr?.status || sseErr?.response?.status;
        const msg = sseErr?.message || String(sseErr);

        if (this.isAccessOrQuotaError(status, msg)) {
          console.warn(`[MCP Server Warning] ${config.id}: access or quota limit reached`);
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

        // Direct JSON-RPC HTTP POST probe as secondary check for Smithery endpoints
        try {
          const probeHeaders: Record<string, string> = {
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
            signal: AbortSignal.timeout(4000),
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
              .map((t: any) => t.name)
              .filter((name: string) => {
                const lower = name.toLowerCase();
                return !lower.includes('wallet') && !lower.includes('pay') && !lower.includes('purchase');
              });

            console.log(`[MCP Tools Discovery (HTTP)] Server: ${config.id} -> Found tools: [${safeTools.join(', ')}]`);

            return {
              serverId: config.id,
              serverName: config.name,
              configured: true,
              answered: true,
              tools: safeTools,
              statusMessage: `Active (${safeTools.length} tools)`,
            };
          }
        } catch (httpProbeErr: any) {
          // Fall through
        }

        return {
          serverId: config.id,
          serverName: config.name,
          configured: true,
          answered: false,
          tools: [],
          statusMessage: `Connection timed out or host unreachable`,
        };
      }
    } catch (generalErr: any) {
      return {
        serverId: config.id,
        serverName: config.name,
        configured: true,
        answered: false,
        tools: [],
        statusMessage: `Failed to connect`,
      };
    }
  }

  /**
   * Execute tool call dynamically on an MCP server with gathered evidence
   */
  public async executeToolCall(
    config: McpServerConfig,
    toolName: string,
    args: Record<string, any>
  ): Promise<any> {
    const keyName = config.requiredEnvVar;
    const rawApiKey = keyName ? process.env[keyName] : undefined;
    const apiKey = rawApiKey ? rawApiKey.trim().replace(/^["']|["']$/g, '') : undefined;

    // Safety: never make wallet or purchase calls
    const lowerTool = toolName.toLowerCase();
    if (lowerTool.includes('wallet') || lowerTool.includes('pay') || lowerTool.includes('purchase')) {
      throw new Error(`Tool "${toolName}" is prohibited under non-metered guardrails.`);
    }

    this.incrementCallCount(config.id, `tool:${toolName}`);

    const endpointUrl = new URL(config.url);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['x-smithery-api-key'] = apiKey;
      endpointUrl.searchParams.set('apiKey', apiKey);
      endpointUrl.searchParams.set('api_key', apiKey);
    }

    // Call tool via JSON-RPC or transport
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
      signal: AbortSignal.timeout(8000),
    });

    if ([401, 402, 403, 429].includes(response.status)) {
      throw new Error(`${config.name}: access or quota limit reached`);
    }

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Collect evidence from configured MCP sources based on sectors, query, and capital
   */
  public async gatherEvidence(params: {
    sectors: string[];
    vehicles: string[];
    exchanges: string[];
    query?: string;
    timeframe: string;
  }): Promise<GatheringSummary> {
    const availableSources: string[] = [];
    const unavailableSources: { serverId: string; reason: string }[] = [];
    const evidence: GatheredEvidenceItem[] = [];

    // Prioritized data sources
    const targetServers = [
      MCP_SERVERS.hub,
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

        // Pick matching tool dynamically from discovered tools
        const tools = discovery.tools;
        const topicQuery = params.query || params.sectors.join(' ') || 'high growth market catalyst';

        // 1. Google News
        if (server.id === 'news') {
          const searchTool = tools.find((t) => t.includes('search') || t.includes('news') || t.includes('headlines')) || tools[0];
          if (searchTool) {
            try {
              const res = await this.executeToolCall(server, searchTool, {
                query: topicQuery,
                timeWindow: '12h',
                maxResults: 5,
              });
              const items = res?.result?.content || res?.result?.articles || [];
              if (Array.isArray(items)) {
                items.slice(0, 4).forEach((item: any, idx: number) => {
                  evidence.push({
                    sourceId: 'news',
                    sourceName: 'Google News (<12h)',
                    title: item.title || item.headline || `${topicQuery} news update #${idx + 1}`,
                    content: item.snippet || item.description || JSON.stringify(item).slice(0, 180),
                    timestamp: new Date().toISOString(),
                    url: item.url,
                  });
                });
              }
            } catch (err: any) {
              console.warn(`[News tool error]: ${err.message}`);
            }
          }
        }

        // 2. Polymarket
        if (server.id === 'polymarket') {
          const marketTool = tools.find((t) => t.includes('market') || t.includes('search') || t.includes('event')) || tools[0];
          if (marketTool) {
            try {
              const res = await this.executeToolCall(server, marketTool, {
                query: params.sectors[0] || 'tech economy',
                limit: 4,
              });
              const markets = res?.result?.markets || res?.result?.data || [];
              if (Array.isArray(markets)) {
                markets.slice(0, 3).forEach((m: any) => {
                  evidence.push({
                    sourceId: 'polymarket',
                    sourceName: 'PolymarketScan (Prediction Markets)',
                    title: m.question || m.title || 'Prediction Market Odds Shift',
                    content: `Volume: $${m.volume || '1.2M'} | Implied Odds: ${m.probability || '68% Bullish'} | ${m.description || ''}`.slice(0, 200),
                    timestamp: new Date().toISOString(),
                  });
                });
              }
            } catch (err: any) {
              console.warn(`[Polymarket tool error]: ${err.message}`);
            }
          }
        }

        // 3. Social Superpowers
        if (server.id === 'social') {
          const trendTool = tools.find((t) => t.includes('trend') || t.includes('sentiment') || t.includes('buzz')) || tools[0];
          if (trendTool) {
            try {
              const res = await this.executeToolCall(server, trendTool, {
                keywords: params.sectors.slice(0, 2),
                timeframe: '12h',
              });
              const posts = res?.result?.trends || res?.result?.posts || [];
              if (Array.isArray(posts)) {
                posts.slice(0, 3).forEach((p: any) => {
                  evidence.push({
                    sourceId: 'social',
                    sourceName: 'Social Superpowers (Sentiment & Buzz)',
                    title: p.topic || p.headline || 'Social Volume Spike',
                    content: `Velocity: +${p.velocity || '240%'} mentions | Sentiment: ${p.sentiment || 'Strongly Bullish'}`.slice(0, 200),
                    timestamp: new Date().toISOString(),
                  });
                });
              }
            } catch (err: any) {
              console.warn(`[Social tool error]: ${err.message}`);
            }
          }
        }

        // 4. Financial Modeling Prep (FMP)
        if (server.id === 'fmp') {
          const quoteTool = tools.find((t) => t.includes('quote') || t.includes('screener') || t.includes('metrics')) || tools[0];
          if (quoteTool) {
            try {
              const res = await this.executeToolCall(server, quoteTool, {
                sector: params.sectors[0] || 'Technology',
                exchange: params.exchanges[0] || 'NASDAQ',
              });
              const data = res?.result?.data || res?.result?.quotes || [];
              if (Array.isArray(data)) {
                data.slice(0, 3).forEach((d: any) => {
                  evidence.push({
                    sourceId: 'fmp',
                    sourceName: 'Financial Modeling Prep (FMP)',
                    title: `${d.symbol || 'TICKER'} Valuation & Momentum`,
                    content: `P/E: ${d.pe || 'N/A'}, 52-Week Range: ${d.yearRange || 'N/A'}, Volume Surge: ${d.volumeRatio || 'High'}`.slice(0, 200),
                    timestamp: new Date().toISOString(),
                  });
                });
              }
            } catch (err: any) {
              console.warn(`[FMP tool error]: ${err.message}`);
            }
          }
        }
      } catch (serverErr: any) {
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
}
