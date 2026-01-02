#!/usr/bin/env node

/**
 * Spirit Protocol MCP Server CLI
 *
 * Usage:
 *   npx @spirit-protocol/sdk mcp
 *   spirit-mcp
 *
 * Environment variables:
 *   SPIRIT_CHAIN_ID     - Chain ID (84532 for testnet, 8453 for mainnet)
 *   SPIRIT_PRIVATE_KEY  - Private key for write operations (optional)
 *   SPIRIT_RPC_URL      - Custom RPC URL (optional)
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

// Import Spirit SDK
const { SpiritClient } = require('../dist/index.js');
const { SPIRIT_TOOLS } = require('../dist/mcp/index.js');
const { formatEther } = require('viem');

// Configuration from environment
const config = {
  chainId: parseInt(process.env.SPIRIT_CHAIN_ID || '84532'),
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
        const agent = await client.getAgent(args.spiritId);
        if (!agent) {
          return { content: [{ type: 'text', text: `Agent "${args.spiritId}" not found.` }] };
        }
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              spiritId: agent.spiritId,
              trainer: agent.trainer,
              platform: agent.platform,
              treasury: agent.treasury,
              status: ['Active', 'Paused', 'Graduated'][agent.status],
            }, null, 2)
          }]
        };
      }

      case 'spirit_balance': {
        const balance = await client.getTreasuryBalance(args.spiritId);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              spiritId: args.spiritId,
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
        const result = await client.registerAgent({
          spiritId: args.spiritId,
          trainer: args.trainer,
          platform: args.platform,
          treasury: args.treasury,
          metadataURI: args.metadataURI,
        });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              spiritKey: result.spiritKey,
              tokenId: result.registryTokenId.toString(),
              txHash: result.txHash,
              explorer: client.getExplorerUrl(result.txHash),
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
