/**
 * Dealhunter X - Standalone MCP Script & Utilities (mcp.js)
 *
 * Provides standalone CLI and programmatic utilities to:
 * - Ping and inspect connected MCP servers
 * - Dynamically discover available runtime tools
 * - Query public market signals without exposing credentials
 *
 * Usage:
 *   node mcp.js           -> Runs health check & lists discovered tools
 *   node mcp.js health    -> Detailed JSON health status
 */

import { MCP_SERVERS } from './lib/mcpServers.ts';
import { McpRuntimeManager } from './lib/mcpClient.ts';
import { checkMcpHealth } from './lib/healthHandler.ts';

/**
 * List all dynamically discovered tools across all configured MCP servers.
 */
export async function listAllMcpTools() {
  const manager = new McpRuntimeManager();
  const results = {};

  for (const [key, config] of Object.entries(MCP_SERVERS)) {
    try {
      const discovery = await manager.discoverTools(config);
      results[key] = {
        name: config.name,
        configured: discovery.configured,
        answered: discovery.answered,
        tools: discovery.tools,
        status: discovery.statusMessage,
      };
    } catch (err) {
      results[key] = {
        name: config.name,
        configured: false,
        answered: false,
        tools: [],
        status: err?.message || 'Error connecting to server',
      };
    }
  }

  return {
    totalCalls: manager.getCallCount(),
    servers: results,
  };
}

/**
 * Execute dynamic evidence gathering across active data sources.
 */
export async function gatherMcpEvidence(params = {}) {
  const manager = new McpRuntimeManager();
  const summary = await manager.gatherEvidence({
    sectors: params.sectors || ['Technology', 'Healthcare'],
    vehicles: params.vehicles || ['Stocks'],
    exchanges: params.exchanges || ['NASDAQ'],
    query: params.query || '',
    timeframe: params.timeframe || '1 Month',
  });
  return summary;
}

/**
 * CLI Entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'summary';

  console.log('====================================================');
  console.log('⚡ Dealhunter X - Model Context Protocol (MCP) Utility');
  console.log('====================================================\n');

  if (command === 'health') {
    console.log('[+] Checking MCP servers health...\n');
    const health = await checkMcpHealth();
    console.log(JSON.stringify(health, null, 2));
    return;
  }

  console.log('[+] Discovering tools on configured MCP servers...\n');
  const toolReport = await listAllMcpTools();

  for (const [id, s] of Object.entries(toolReport.servers)) {
    const statusIcon = s.answered ? '✅' : s.configured ? '⚠️' : '💤';
    console.log(`${statusIcon} [${id.toUpperCase()}] ${s.name}`);
    console.log(`   Status: ${s.status}`);
    if (s.tools && s.tools.length > 0) {
      console.log(`   Discovered Tools (${s.tools.length}): ${s.tools.join(', ')}`);
    }
    console.log('');
  }

  console.log(`Total Outbound Verification Calls Logged: ${toolReport.totalCalls}`);
  console.log('Execution completed.\n');
}

// Execute when invoked directly
if (process.argv[1] && process.argv[1].endsWith('mcp.js')) {
  main().catch((err) => {
    console.error('Fatal MCP runner error:', err.message);
    process.exit(1);
  });
}
