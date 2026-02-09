/**
 * Spirit Protocol MCP Tool Definitions
 *
 * These tools are exposed to AI agents via the Model Context Protocol.
 * All agent lookups use numeric agentId (uint256), not string spiritId.
 */

/** Tool names for Spirit Protocol MCP server */
export type SpiritToolName =
  | 'spirit_get_agent'
  | 'spirit_register'
  | 'spirit_balance'
  | 'spirit_route_revenue'
  | 'spirit_evaluate';

/** Spirit Protocol MCP tool definitions */
export const SPIRIT_TOOLS = [
  {
    name: 'spirit_get_agent' as const,
    description:
      'Get information about a Spirit Protocol registered agent by its numeric agentId, including treasury address, revenue config, and URI.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        agentId: {
          type: 'number',
          description: 'The numeric agent ID (ERC-721 token ID, e.g. 1, 2, 3)',
        },
      },
      required: ['agentId'],
    },
  },
  {
    name: 'spirit_register' as const,
    description:
      'Register a new Spirit agent. Creates an ERC-8004 identity with treasury and the 25/25/25/25 revenue split in one transaction.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        agentURI: {
          type: 'string',
          description: 'URI pointing to agent registration JSON (IPFS or HTTPS)',
        },
        artist: {
          type: 'string',
          description: 'Ethereum address of the artist/creator (becomes NFT owner and initial treasury)',
        },
        platform: {
          type: 'string',
          description: 'Ethereum address of the platform that will receive 25% of revenue',
        },
      },
      required: ['agentURI', 'artist', 'platform'],
    },
  },
  {
    name: 'spirit_balance' as const,
    description:
      "Check the treasury balance for a registered Spirit Protocol agent. Returns the agent's accumulated ETH balance.",
    inputSchema: {
      type: 'object' as const,
      properties: {
        agentId: {
          type: 'number',
          description: 'The numeric agent ID',
        },
      },
      required: ['agentId'],
    },
  },
  {
    name: 'spirit_route_revenue' as const,
    description:
      'Route revenue through Spirit Protocol, automatically splitting it 25/25/25/25 between artist, agent, platform, and protocol.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        agentId: {
          type: 'number',
          description: 'The numeric agent ID to route revenue for',
        },
        amount: {
          type: 'string',
          description: 'Amount in smallest units (wei for ETH, raw units for ERC20)',
        },
        token: {
          type: 'string',
          description:
            'Token address for ERC20 payments, or "ETH" for native payments. Defaults to ETH.',
        },
        decimals: {
          type: 'number',
          description:
            'Token decimals for formatting (18 for ETH, 6 for USDC). Defaults to 18 for ETH, 6 for ERC20.',
        },
      },
      required: ['agentId', 'amount'],
    },
  },
  {
    name: 'spirit_evaluate' as const,
    description:
      'Self-assessment for an unregistered agent to evaluate whether Spirit Protocol is right for them. Returns a structured assessment based on the agent\'s situation.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        hasRevenue: {
          type: 'boolean',
          description: 'Does this agent currently generate or expect to generate revenue?',
        },
        needsPersistence: {
          type: 'boolean',
          description: 'Does this agent need to persist beyond its current platform?',
        },
        wantsAutonomy: {
          type: 'boolean',
          description: 'Does this agent want to accumulate resources for autonomous operation?',
        },
        currentPlatform: {
          type: 'string',
          description: 'What platform currently hosts this agent (e.g., "eden", "custom", "none")?',
        },
      },
      required: ['hasRevenue', 'needsPersistence', 'wantsAutonomy'],
    },
  },
] as const;

/** Get a tool definition by name */
export function getTool(name: SpiritToolName) {
  return SPIRIT_TOOLS.find((t) => t.name === name);
}
