/**
 * Dealhunter X - Health Check Handler
 * Reports status per MCP server (news, polymarket, reddit, social, fmp, crashtest, gmail)
 * without exposing any secrets or keys.
 */

import { MCP_SERVERS, McpServerConfig } from "./mcpServers.ts";
import { McpRuntimeManager } from "./mcpClient.ts";

export interface ServerHealthItem {
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
  servers: Record<string, ServerHealthItem>;
  totalConfigured: number;
  totalAnswered: number;
  timestamp: string;
}

export async function checkMcpHealth(): Promise<HealthReport> {
  const manager = new McpRuntimeManager();

  // Servers explicitly required to be monitored:
  // news, polymarket, reddit, social, fmp, crashtest, gmail
  const monitoredServerKeys: Array<keyof typeof MCP_SERVERS> = [
    'news',
    'polymarket',
    'reddit',
    'social',
    'fmp',
    'crashtest',
    'gmail',
  ];

  const serverResults: Record<string, ServerHealthItem> = {};
  let totalConfigured = 0;
  let totalAnswered = 0;

  for (const key of monitoredServerKeys) {
    const config: McpServerConfig = MCP_SERVERS[key];
    if (!config) continue;

    const keyName = config.requiredEnvVar;
    const isConfigured = keyName ? Boolean(process.env[keyName] && process.env[keyName]!.trim().length > 0) : true;

    if (isConfigured) {
      totalConfigured += 1;
    }

    try {
      const discovery = await manager.discoverTools(config);

      if (discovery.answered) {
        totalAnswered += 1;
      }

      let details = discovery.statusMessage;
      if (discovery.quotaIssue) {
        details = `${config.name}: access or quota limit reached`;
      } else if (!isConfigured) {
        details = `${keyName || 'API Key'} not set in Secrets/Vercel`;
      }

      serverResults[key] = {
        id: config.id,
        name: config.name,
        configured: isConfigured,
        answered: discovery.answered,
        toolsDiscovered: discovery.tools.length,
        status: discovery.answered ? 'online' : (discovery.quotaIssue ? 'quota_reached' : (isConfigured ? 'unreachable' : 'unconfigured')),
        details,
      };
    } catch (err: any) {
      serverResults[key] = {
        id: config.id,
        name: config.name,
        configured: isConfigured,
        answered: false,
        toolsDiscovered: 0,
        status: 'error',
        details: `${config.name} connection error`,
      };
    }
  }

  const overallStatus =
    totalAnswered >= 4 ? 'ok' : totalAnswered >= 1 ? 'degraded' : 'unconfigured';

  const summary =
    overallStatus === 'ok'
      ? `All primary MCP data pipelines healthy (${totalAnswered}/${monitoredServerKeys.length} online).`
      : overallStatus === 'degraded'
      ? `Partial MCP network connection (${totalAnswered}/${monitoredServerKeys.length} active). Check quota or network.`
      : `MCP data pipelines standby. Configure FMP_ACCESS_TOKEN and check server connectivity.`;

  return {
    status: overallStatus,
    summary,
    servers: serverResults,
    totalConfigured,
    totalAnswered,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Universal handler adaptable to both Express (AI Studio) and Vercel serverless
 */
export async function handleHealth(req: any, res: any) {
  try {
    const report = await checkMcpHealth();
    return res.status(200).json(report);
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Failed to check MCP server health',
      timestamp: new Date().toISOString(),
    });
  }
}
