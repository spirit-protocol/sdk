/**
 * Spirit Protocol MCP Tool Definitions
 *
 * These tools are exposed to AI agents via the Model Context Protocol.
 */

/** Tool names for Spirit Protocol MCP server */
export type SpiritToolName =
  | 'spirit_get_agent'
  | 'spirit_register'
  | 'spirit_balance'
  | 'spirit_route_revenue'
  | 'spirit_evaluate'
  | 'spirit_update_status';

/** Spirit Protocol MCP tool definitions */
export const SPIRIT_TOOLS = [
  {
    name: 'spirit_get_agent' as const,
    description:
      'Get information about a Spirit Protocol registered agent, including treasury address, revenue split, and status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        spiritId: {
          type: 'string',
          description: 'The unique identifier of the agent (e.g., "abraham", "solienne")',
        },
      },
      required: ['spiritId'],
    },
  },
  {
    name: 'spirit_register' as const,
    description:
      'Register a new agent with Spirit Protocol. This creates an onchain identity with a treasury and enables the 25/25/25/25 revenue split.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        spiritId: {
          type: 'string',
          description: 'Unique identifier for the agent (lowercase, alphanumeric)',
        },
        trainer: {
          type: 'string',
          description: 'Ethereum address of the trainer/creator who will receive 25% of revenue',
        },
        platform: {
          type: 'string',
          description: 'Ethereum address of the platform that will receive 25% of revenue',
        },
        treasury: {
          type: 'string',
          description: 'Ethereum address of the agent treasury (typically a Safe multisig)',
        },
        metadataURI: {
          type: 'string',
          description: 'URI pointing to agent metadata (IPFS or HTTPS)',
        },
      },
      required: ['spiritId', 'trainer', 'platform', 'treasury', 'metadataURI'],
    },
  },
  {
    name: 'spirit_balance' as const,
    description:
      "Check the treasury balance for a registered Spirit Protocol agent. Returns the agent's accumulated ETH balance.",
    inputSchema: {
      type: 'object' as const,
      properties: {
        spiritId: {
          type: 'string',
          description: 'The unique identifier of the agent',
        },
      },
      required: ['spiritId'],
    },
  },
  {
    name: 'spirit_route_revenue' as const,
    description:
      'Route revenue through Spirit Protocol, automatically splitting it 25/25/25/25 between creator, agent, platform, and protocol.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        spiritId: {
          type: 'string',
          description: 'The agent to route revenue for',
        },
        amount: {
          type: 'string',
          description: 'Amount in smallest units (wei for ETH, raw units for ERC20)',
        },
        currency: {
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
      required: ['spiritId', 'amount'],
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
  {
    name: 'spirit_update_status' as const,
    description:
      'Update the status of a registered agent. Status can be Active (0), Paused (1), or Graduated (2).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        spiritId: {
          type: 'string',
          description: 'The unique identifier of the agent',
        },
        status: {
          type: 'number',
          description: 'New status: 0 = Active, 1 = Paused, 2 = Graduated',
          enum: [0, 1, 2],
        },
      },
      required: ['spiritId', 'status'],
    },
  },
] as const;

/** Get a tool definition by name */
export function getTool(name: SpiritToolName) {
  return SPIRIT_TOOLS.find((t) => t.name === name);
}
