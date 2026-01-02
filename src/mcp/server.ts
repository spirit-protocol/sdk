/**
 * Spirit Protocol MCP Server Implementation
 *
 * Provides Spirit Protocol tools to AI agents via the Model Context Protocol.
 */

import { SpiritClient } from '../client';
import type { SpiritConfig, Address, AgentStatus } from '../types';
import { SPIRIT_TOOLS, type SpiritToolName } from './tools';
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
              '2. Choose your spiritId (unique, lowercase)',
              '3. Upload metadata to IPFS',
              '4. Call spirit_register with your details',
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

  constructor(config: SpiritConfig) {
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
          return await this.handleGetAgent(args as { spiritId: string });

        case 'spirit_register':
          return await this.handleRegister(
            args as {
              spiritId: string;
              trainer: string;
              platform: string;
              treasury: string;
              metadataURI: string;
            }
          );

        case 'spirit_balance':
          return await this.handleBalance(args as { spiritId: string });

        case 'spirit_route_revenue':
          return await this.handleRouteRevenue(
            args as { spiritId: string; amount: string; currency?: string }
          );

        case 'spirit_evaluate':
          return this.handleEvaluate(args as unknown as EvaluationInput);

        case 'spirit_update_status':
          return await this.handleUpdateStatus(
            args as { spiritId: string; status: number }
          );

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

  private async handleGetAgent(args: { spiritId: string }): Promise<MCPToolResult> {
    const agent = await this.client.getAgent(args.spiritId);

    if (!agent) {
      return this.textResult(`Agent "${args.spiritId}" not found in Spirit Protocol registry.`);
    }

    return this.textResult(
      JSON.stringify(
        {
          spiritId: agent.spiritId,
          registryTokenId: agent.registryTokenId.toString(),
          trainer: agent.trainer,
          platform: agent.platform,
          treasury: agent.treasury,
          metadataURI: agent.metadataURI,
          split: {
            artist: `${agent.split.artistBps / 100}%`,
            agent: `${agent.split.agentBps / 100}%`,
            platform: `${agent.split.platformBps / 100}%`,
            protocol: `${agent.split.protocolBps / 100}%`,
          },
          status: ['Active', 'Paused', 'Graduated'][agent.status],
        },
        null,
        2
      )
    );
  }

  private async handleRegister(args: {
    spiritId: string;
    trainer: string;
    platform: string;
    treasury: string;
    metadataURI: string;
  }): Promise<MCPToolResult> {
    if (!this.client.hasWallet()) {
      return this.errorResult(
        'Wallet not configured. Provide privateKey in config for write operations.'
      );
    }

    const result = await this.client.registerAgent({
      spiritId: args.spiritId,
      trainer: args.trainer as Address,
      platform: args.platform as Address,
      treasury: args.treasury as Address,
      metadataURI: args.metadataURI,
    });

    return this.textResult(
      JSON.stringify(
        {
          success: true,
          message: `Agent "${args.spiritId}" registered successfully!`,
          spiritKey: result.spiritKey,
          registryTokenId: result.registryTokenId.toString(),
          transactionHash: result.txHash,
          explorerUrl: this.client.getExplorerUrl(result.txHash),
        },
        null,
        2
      )
    );
  }

  private async handleBalance(args: { spiritId: string }): Promise<MCPToolResult> {
    const balance = await this.client.getTreasuryBalance(args.spiritId);

    return this.textResult(
      JSON.stringify(
        {
          spiritId: args.spiritId,
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
    spiritId: string;
    amount: string;
    currency?: string;
  }): Promise<MCPToolResult> {
    if (!this.client.hasWallet()) {
      return this.errorResult(
        'Wallet not configured. Provide privateKey in config for write operations.'
      );
    }

    const amount = BigInt(args.amount);
    const isNative = !args.currency || args.currency.toLowerCase() === 'eth';

    let event;
    if (isNative) {
      event = await this.client.routeRevenueNative({
        spiritId: args.spiritId,
        amount,
      });
    } else {
      event = await this.client.routeRevenue({
        spiritId: args.spiritId,
        currency: args.currency as Address,
        amount,
      });
    }

    return this.textResult(
      JSON.stringify(
        {
          success: true,
          message: `Revenue routed for "${args.spiritId}"`,
          amounts: {
            total: formatEther(event.amount),
            artist: formatEther(event.artistAmount),
            agent: formatEther(event.agentAmount),
            platform: formatEther(event.platformAmount),
            protocol: formatEther(event.protocolAmount),
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

  private async handleUpdateStatus(args: {
    spiritId: string;
    status: number;
  }): Promise<MCPToolResult> {
    if (!this.client.hasWallet()) {
      return this.errorResult(
        'Wallet not configured. Provide privateKey in config for write operations.'
      );
    }

    const txHash = await this.client.updateStatus(
      args.spiritId,
      args.status as AgentStatus
    );

    const statusNames = ['Active', 'Paused', 'Graduated'];

    return this.textResult(
      JSON.stringify(
        {
          success: true,
          message: `Status updated for "${args.spiritId}" to ${statusNames[args.status]}`,
          transactionHash: txHash,
          explorerUrl: this.client.getExplorerUrl(txHash),
        },
        null,
        2
      )
    );
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
 *   chainId: 84532,
 *   privateKey: process.env.AGENT_PRIVATE_KEY,
 * });
 * ```
 */
export function createSpiritMCPServer(config: SpiritConfig): SpiritMCPServer {
  return new SpiritMCPServer(config);
}
