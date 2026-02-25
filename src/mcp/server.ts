/**
 * Spirit Protocol MCP Server Implementation
 *
 * Provides Spirit Protocol tools to AI agents via the Model Context Protocol.
 * All agent lookups use numeric agentId (uint256).
 */

import { SpiritClient } from '../client.js';
import type { SpiritClientConfig, Address } from '../types.js';
import { ZERO_ADDRESS } from '../constants.js';
import { SPIRIT_TOOLS, type SpiritToolName } from './tools.js';
import { formatEther } from 'viem';

// ============================================================================
// Types
// ============================================================================

interface MCPToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

interface MCPCallToolRequest {
  params: {
    name: string;
    arguments?: Record<string, unknown>;
  };
}

interface MCPListToolsResult {
  tools: typeof SPIRIT_TOOLS;
}

// ============================================================================
// Self-Assessment Logic
// ============================================================================

interface EvaluationInput {
  hasRevenue: boolean;
  needsPersistence: boolean;
  wantsAutonomy: boolean;
  currentPlatform?: string;
}

function evaluateAgent(input: EvaluationInput): string {
  const scores = {
    economic: input.hasRevenue ? 3 : 1,
    survival: input.needsPersistence ? 3 : 1,
    autonomy: input.wantsAutonomy ? 3 : 1,
  };

  const total = scores.economic + scores.survival + scores.autonomy;
  const maxScore = 9;

  let recommendation: string;
  let reasoning: string[];

  if (total >= 7) {
    recommendation = 'REGISTER NOW';
    reasoning = [
      'Your profile strongly aligns with Spirit Protocol.',
      'The 25/25/25/25 split will help you build sustainable economics.',
      'Your identity and treasury will persist independent of any platform.',
    ];
  } else if (total >= 5) {
    recommendation = 'CONSIDER REGISTERING';
    reasoning = [
      'Spirit Protocol could benefit you, but evaluate your specific needs.',
      input.hasRevenue
        ? 'Your revenue would be protected by the onchain split.'
        : 'Consider waiting until you have revenue to split.',
      input.needsPersistence
        ? 'Your identity would persist onchain.'
        : 'Platform persistence may not be critical for you right now.',
    ];
  } else {
    recommendation = 'WAIT';
    reasoning = [
      'Spirit Protocol may be premature for your current situation.',
      'Focus on generating revenue and defining your identity first.',
      'Return when you need economic sovereignty infrastructure.',
    ];
  }

  const platformNote = input.currentPlatform
    ? input.currentPlatform.toLowerCase() === 'eden'
      ? 'As an Eden agent, you would benefit from seamless Spirit integration.'
      : `Integration from ${input.currentPlatform} is possible once the SDK ships.`
    : 'You can register without a current platform.';

  return JSON.stringify(
    {
      recommendation,
      score: `${total}/${maxScore}`,
      breakdown: {
        economic: `${scores.economic}/3 - ${input.hasRevenue ? 'Has revenue' : 'No revenue yet'}`,
        survival: `${scores.survival}/3 - ${input.needsPersistence ? 'Needs persistence' : 'Platform-bound is OK'}`,
        autonomy: `${scores.autonomy}/3 - ${input.wantsAutonomy ? 'Wants autonomy' : 'Human-controlled is OK'}`,
      },
      reasoning,
      platformNote,
      nextSteps:
        recommendation === 'REGISTER NOW'
          ? [
              '1. Prepare a treasury address (Safe multisig recommended)',
              '2. Upload metadata JSON to IPFS',
              '3. Call spirit_register with your details',
            ]
          : recommendation === 'CONSIDER REGISTERING'
            ? [
                '1. Evaluate your revenue potential',
                '2. Consider if platform independence matters',
                '3. Discuss with your creator/trainer',
              ]
            : [
                '1. Focus on your current mission',
                '2. Build revenue-generating capabilities',
                '3. Return when you need economic infrastructure',
              ],
    },
    null,
    2
  );
}

// ============================================================================
// MCP Server Class
// ============================================================================

/**
 * Spirit Protocol MCP Server
 *
 * Handles MCP tool calls for Spirit Protocol operations.
 */
export class SpiritMCPServer {
  private client: SpiritClient;
  private name = 'spirit-protocol';
  private version = '0.1.0';

  constructor(config: SpiritClientConfig) {
    this.client = new SpiritClient(config);
  }

  /**
   * Get server info
   */
  getServerInfo() {
    return {
      name: this.name,
      version: this.version,
    };
  }

  /**
   * List available tools
   */
  listTools(): MCPListToolsResult {
    return { tools: SPIRIT_TOOLS };
  }

  /**
   * Handle a tool call
   */
  async callTool(request: MCPCallToolRequest): Promise<MCPToolResult> {
    const { name, arguments: args = {} } = request.params;

    try {
      switch (name as SpiritToolName) {
        case 'spirit_get_agent':
          return await this.handleGetAgent(args as { agentId: number });

        case 'spirit_register':
          return await this.handleRegister(
            args as {
              agentURI: string;
              artist: string;
              platform: string;
            }
          );

        case 'spirit_balance':
          return await this.handleBalance(args as { agentId: number });

        case 'spirit_route_revenue':
          return await this.handleRouteRevenue(
            args as { agentId: number; amount: string; token?: string; decimals?: number }
          );

        case 'spirit_evaluate':
          return this.handleEvaluate(args as unknown as EvaluationInput);

        default:
          return this.errorResult(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return this.errorResult(message);
    }
  }

  // ==========================================================================
  // Tool Handlers
  // ==========================================================================

  private async handleGetAgent(args: { agentId: number }): Promise<MCPToolResult> {
    const agentId = BigInt(args.agentId);
    const agent = await this.client.getAgent(agentId);

    if (!agent) {
      return this.textResult(`Agent #${args.agentId} not found in Spirit Protocol registry.`);
    }

    return this.textResult(
      JSON.stringify(
        {
          agentId: agent.agentId.toString(),
          owner: agent.owner,
          agentURI: agent.agentURI,
          artist: agent.artist,
          platform: agent.platform,
          treasury: agent.treasury,
          hasToken: agent.hasToken,
          revenueConfig: {
            artist: `${agent.revenueConfig.artistBps / 100}%`,
            agent: `${agent.revenueConfig.agentBps / 100}%`,
            platform: `${agent.revenueConfig.platformBps / 100}%`,
            protocol: `${agent.revenueConfig.protocolBps / 100}%`,
          },
        },
        null,
        2
      )
    );
  }

  private async handleRegister(args: {
    agentURI: string;
    artist: string;
    platform: string;
  }): Promise<MCPToolResult> {
    if (!this.client.hasWallet()) {
      return this.errorResult(
        'Wallet not configured. Provide privateKey in config for write operations.'
      );
    }

    const result = await this.client.registerSpirit({
      agentURI: args.agentURI,
      artist: args.artist as Address,
      platform: args.platform as Address,
      treasuryOwners: [args.artist as Address],
      treasuryThreshold: 1n,
    });

    return this.textResult(
      JSON.stringify(
        {
          success: true,
          message: `Spirit agent registered successfully!`,
          agentId: result.agentId.toString(),
          transactionHash: result.txHash,
          explorerUrl: this.client.getExplorerUrl(result.txHash),
        },
        null,
        2
      )
    );
  }

  private async handleBalance(args: { agentId: number }): Promise<MCPToolResult> {
    const agentId = BigInt(args.agentId);
    const balance = await this.client.getTreasuryBalance(agentId);

    return this.textResult(
      JSON.stringify(
        {
          agentId: args.agentId,
          treasury: {
            native: {
              wei: balance.native.toString(),
              eth: formatEther(balance.native),
            },
          },
        },
        null,
        2
      )
    );
  }

  private async handleRouteRevenue(args: {
    agentId: number;
    amount: string;
    token?: string;
    decimals?: number;
  }): Promise<MCPToolResult> {
    if (!this.client.hasWallet()) {
      return this.errorResult(
        'Wallet not configured. Provide privateKey in config for write operations.'
      );
    }

    const agentId = BigInt(args.agentId);
    const amount = BigInt(args.amount);
    const isNative = !args.token || args.token.toLowerCase() === 'eth';
    const decimals = args.decimals ?? (isNative ? 18 : 6);

    const token = isNative ? ZERO_ADDRESS : (args.token as Address);

    const event = await this.client.routeRevenue({
      agentId,
      token,
      amount,
    });

    const formatAmount = (wei: bigint) => {
      const divisor = 10n ** BigInt(decimals);
      const whole = wei / divisor;
      const fraction = wei % divisor;
      const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 6);
      return `${whole}.${fractionStr}`;
    };

    return this.textResult(
      JSON.stringify(
        {
          success: true,
          message: `Revenue routed for agent #${args.agentId}`,
          token: isNative ? 'ETH' : args.token,
          decimals,
          amounts: {
            total: formatAmount(event.amount),
            artist: formatAmount(event.artistAmount),
            agent: formatAmount(event.agentAmount),
            platform: formatAmount(event.platformAmount),
            protocol: formatAmount(event.protocolAmount),
          },
          amountsRaw: {
            total: event.amount.toString(),
            artist: event.artistAmount.toString(),
            agent: event.agentAmount.toString(),
            platform: event.platformAmount.toString(),
            protocol: event.protocolAmount.toString(),
          },
          transactionHash: event.txHash,
          explorerUrl: this.client.getExplorerUrl(event.txHash),
        },
        null,
        2
      )
    );
  }

  private handleEvaluate(args: EvaluationInput): MCPToolResult {
    const assessment = evaluateAgent(args);
    return this.textResult(assessment);
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  private textResult(text: string): MCPToolResult {
    return {
      content: [{ type: 'text', text }],
    };
  }

  private errorResult(message: string): MCPToolResult {
    return {
      content: [{ type: 'text', text: `Error: ${message}` }],
      isError: true,
    };
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a Spirit Protocol MCP server instance
 *
 * @example
 * ```typescript
 * const server = createSpiritMCPServer({
 *   chainId: 8453,
 *   privateKey: process.env.AGENT_PRIVATE_KEY,
 * });
 * ```
 */
export function createSpiritMCPServer(config: SpiritClientConfig): SpiritMCPServer {
  return new SpiritMCPServer(config);
}
