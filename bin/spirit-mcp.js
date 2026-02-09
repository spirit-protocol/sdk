#!/usr/bin/env node

/**
 * Spirit Protocol MCP Server CLI
 *
 * Usage:
 *   npx @spirit-protocol/sdk mcp
 *   spirit-mcp
 *
 * Environment variables:
 *   SPIRIT_CHAIN_ID     - Chain ID (8453 for mainnet, 84532 for testnet)
 *   SPIRIT_PRIVATE_KEY  - Private key for write operations (optional)
 *   SPIRIT_RPC_URL      - Custom RPC URL (optional)
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

// Import Spirit SDK
const { SpiritClient, ZERO_ADDRESS } = require('../dist/index.js');
const { SPIRIT_TOOLS } = require('../dist/mcp/index.js');
const { formatEther } = require('viem');

// Configuration from environment
const config = {
  chainId: parseInt(process.env.SPIRIT_CHAIN_ID || '8453'),
  privateKey: process.env.SPIRIT_PRIVATE_KEY,
  rpcUrl: process.env.SPIRIT_RPC_URL,
};

// Create Spirit client
const client = new SpiritClient(config);

// Create MCP server
const server = new Server(
  { name: 'spirit-protocol', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: SPIRIT_TOOLS,
}));

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'spirit_get_agent': {
        const agentId = BigInt(args.agentId);
        const agent = await client.getAgent(agentId);
        if (!agent) {
          return { content: [{ type: 'text', text: `Agent #${args.agentId} not found.` }] };
        }
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              agentId: agent.agentId.toString(),
              owner: agent.owner,
              agentURI: agent.agentURI,
              artist: agent.artist,
              platform: agent.platform,
              treasury: agent.treasury,
              revenueConfig: {
                artist: `${agent.revenueConfig.artistBps / 100}%`,
                agent: `${agent.revenueConfig.agentBps / 100}%`,
                platform: `${agent.revenueConfig.platformBps / 100}%`,
                protocol: `${agent.revenueConfig.protocolBps / 100}%`,
              },
            }, null, 2)
          }]
        };
      }

      case 'spirit_balance': {
        const agentId = BigInt(args.agentId);
        const balance = await client.getTreasuryBalance(agentId);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              agentId: args.agentId,
              balance: {
                wei: balance.native.toString(),
                eth: formatEther(balance.native),
              }
            }, null, 2)
          }]
        };
      }

      case 'spirit_register': {
        if (!client.hasWallet()) {
          return {
            content: [{ type: 'text', text: 'Error: SPIRIT_PRIVATE_KEY required for registration.' }],
            isError: true
          };
        }
        const result = await client.registerSpirit({
          agentURI: args.agentURI,
          artist: args.artist,
          platform: args.platform,
          treasuryOwners: [args.artist],
          treasuryThreshold: 1n,
        });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              agentId: result.agentId.toString(),
              txHash: result.txHash,
              explorer: client.getExplorerUrl(result.txHash),
            }, null, 2)
          }]
        };
      }

      case 'spirit_route_revenue': {
        if (!client.hasWallet()) {
          return {
            content: [{ type: 'text', text: 'Error: SPIRIT_PRIVATE_KEY required for revenue routing.' }],
            isError: true
          };
        }
        const agentId = BigInt(args.agentId);
        const amount = BigInt(args.amount);
        const isNative = !args.token || args.token.toLowerCase() === 'eth';
        const token = isNative ? ZERO_ADDRESS : args.token;
        const event = await client.routeRevenue({ agentId, token, amount });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              agentId: args.agentId,
              amount: event.amount.toString(),
              txHash: event.txHash,
            }, null, 2)
          }]
        };
      }

      case 'spirit_evaluate': {
        const scores = {
          economic: args.hasRevenue ? 3 : 1,
          survival: args.needsPersistence ? 3 : 1,
          autonomy: args.wantsAutonomy ? 3 : 1,
        };
        const total = scores.economic + scores.survival + scores.autonomy;
        const recommendation = total >= 7 ? 'REGISTER NOW' : total >= 5 ? 'CONSIDER' : 'WAIT';
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              recommendation,
              score: `${total}/9`,
              breakdown: scores,
            }, null, 2)
          }]
        };
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true
        };
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Spirit Protocol MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
