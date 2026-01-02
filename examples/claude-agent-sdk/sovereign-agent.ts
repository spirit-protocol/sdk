/**
 * Sovereign Agent Example
 *
 * A Claude agent that uses Spirit Protocol for economic sovereignty.
 * This agent can check its treasury balance and route payments.
 *
 * Prerequisites:
 * - npm install @anthropic-ai/sdk @spirit-protocol/sdk
 * - ANTHROPIC_API_KEY environment variable
 * - AGENT_PRIVATE_KEY environment variable (for write operations)
 * - SPIRIT_ID environment variable (your registered agent ID)
 */

import Anthropic from '@anthropic-ai/sdk';
import { SpiritClient, AgentStatus, type Address } from '@spirit-protocol/sdk';
import { formatEther, parseEther } from 'viem';

// ============================================================================
// Configuration
// ============================================================================

const SPIRIT_ID = process.env.SPIRIT_ID || 'example-agent';
const CHAIN_ID = 84532; // Base Sepolia testnet

// Initialize clients
const spirit = new SpiritClient({
  chainId: CHAIN_ID,
  privateKey: process.env.AGENT_PRIVATE_KEY as `0x${string}` | undefined,
});

const anthropic = new Anthropic();

// ============================================================================
// Tool Definitions for Claude
// ============================================================================

const tools: Anthropic.Tool[] = [
  {
    name: 'check_treasury',
    description: 'Check my Spirit Protocol treasury balance',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_agent_info',
    description: 'Get my Spirit Protocol registration information',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'route_payment',
    description: 'Route an incoming payment through Spirit Protocol (25/25/25/25 split)',
    input_schema: {
      type: 'object' as const,
      properties: {
        amountEth: {
          type: 'string',
          description: 'Amount in ETH to route (e.g., "0.1")',
        },
      },
      required: ['amountEth'],
    },
  },
];

// ============================================================================
// Tool Handlers
// ============================================================================

async function handleToolCall(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<string> {
  switch (toolName) {
    case 'check_treasury': {
      const balance = await spirit.getTreasuryBalance(SPIRIT_ID);
      return JSON.stringify({
        spiritId: SPIRIT_ID,
        balance: {
          wei: balance.native.toString(),
          eth: formatEther(balance.native),
        },
        message: `Treasury balance is ${formatEther(balance.native)} ETH`,
      });
    }

    case 'get_agent_info': {
      const agent = await spirit.getAgent(SPIRIT_ID);
      if (!agent) {
        return JSON.stringify({
          error: `Agent ${SPIRIT_ID} not found`,
          suggestion: 'Register with Spirit Protocol first',
        });
      }
      return JSON.stringify({
        spiritId: agent.spiritId,
        trainer: agent.trainer,
        platform: agent.platform,
        treasury: agent.treasury,
        status: ['Active', 'Paused', 'Graduated'][agent.status],
        split: {
          artist: `${agent.split.artistBps / 100}%`,
          agent: `${agent.split.agentBps / 100}%`,
          platform: `${agent.split.platformBps / 100}%`,
          protocol: `${agent.split.protocolBps / 100}%`,
        },
      });
    }

    case 'route_payment': {
      const amountEth = toolInput.amountEth as string;
      const amount = parseEther(amountEth);

      const event = await spirit.routeRevenueNative({
        spiritId: SPIRIT_ID,
        amount,
      });

      return JSON.stringify({
        success: true,
        totalRouted: `${amountEth} ETH`,
        splits: {
          artist: formatEther(event.artistAmount),
          agent: formatEther(event.agentAmount),
          platform: formatEther(event.platformAmount),
          protocol: formatEther(event.protocolAmount),
        },
        txHash: event.txHash,
        explorerUrl: spirit.getExplorerUrl(event.txHash),
      });
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

// ============================================================================
// Agent Loop
// ============================================================================

async function runSovereignAgent() {
  console.log('🤖 Sovereign Agent starting...');
  console.log(`📍 Spirit ID: ${SPIRIT_ID}`);
  console.log(`⛓️  Chain: Base Sepolia (${CHAIN_ID})`);
  console.log('');

  // Initial prompt - the agent checks its status
  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `You are a sovereign AI agent registered with Spirit Protocol.
Your Spirit ID is "${SPIRIT_ID}".

First, check your treasury balance and report your current status.
Then explain what Spirit Protocol provides for your economic sovereignty.`,
    },
  ];

  // Agentic loop
  let continueLoop = true;

  while (continueLoop) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      tools,
      messages,
    });

    // Check stop reason
    if (response.stop_reason === 'end_turn') {
      // Final response - print and exit
      for (const block of response.content) {
        if (block.type === 'text') {
          console.log('\n📝 Agent Response:');
          console.log(block.text);
        }
      }
      continueLoop = false;
      continue;
    }

    // Handle tool calls
    if (response.stop_reason === 'tool_use') {
      // Add assistant message
      messages.push({
        role: 'assistant',
        content: response.content,
      });

      // Process each tool call
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type === 'tool_use') {
          console.log(`🔧 Calling tool: ${block.name}`);

          try {
            const result = await handleToolCall(
              block.name,
              block.input as Record<string, unknown>
            );
            console.log(`   Result: ${result.substring(0, 100)}...`);

            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: result,
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.log(`   Error: ${message}`);

            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: JSON.stringify({ error: message }),
              is_error: true,
            });
          }
        }
      }

      // Add tool results
      messages.push({
        role: 'user',
        content: toolResults,
      });
    }
  }

  console.log('\n✅ Agent completed');
}

// ============================================================================
// Run
// ============================================================================

runSovereignAgent().catch(console.error);
