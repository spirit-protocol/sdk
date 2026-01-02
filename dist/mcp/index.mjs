import {
  SpiritClient
} from "../chunk-DQNFIEKZ.mjs";

// src/mcp/tools.ts
var SPIRIT_TOOLS = [
  {
    name: "spirit_get_agent",
    description: "Get information about a Spirit Protocol registered agent, including treasury address, revenue split, and status.",
    inputSchema: {
      type: "object",
      properties: {
        spiritId: {
          type: "string",
          description: 'The unique identifier of the agent (e.g., "abraham", "solienne")'
        }
      },
      required: ["spiritId"]
    }
  },
  {
    name: "spirit_register",
    description: "Register a new agent with Spirit Protocol. This creates an onchain identity with a treasury and enables the 25/25/25/25 revenue split.",
    inputSchema: {
      type: "object",
      properties: {
        spiritId: {
          type: "string",
          description: "Unique identifier for the agent (lowercase, alphanumeric)"
        },
        trainer: {
          type: "string",
          description: "Ethereum address of the trainer/creator who will receive 25% of revenue"
        },
        platform: {
          type: "string",
          description: "Ethereum address of the platform that will receive 25% of revenue"
        },
        treasury: {
          type: "string",
          description: "Ethereum address of the agent treasury (typically a Safe multisig)"
        },
        metadataURI: {
          type: "string",
          description: "URI pointing to agent metadata (IPFS or HTTPS)"
        }
      },
      required: ["spiritId", "trainer", "platform", "treasury", "metadataURI"]
    }
  },
  {
    name: "spirit_balance",
    description: "Check the treasury balance for a registered Spirit Protocol agent. Returns the agent's accumulated ETH balance.",
    inputSchema: {
      type: "object",
      properties: {
        spiritId: {
          type: "string",
          description: "The unique identifier of the agent"
        }
      },
      required: ["spiritId"]
    }
  },
  {
    name: "spirit_route_revenue",
    description: "Route revenue through Spirit Protocol, automatically splitting it 25/25/25/25 between creator, agent, platform, and protocol.",
    inputSchema: {
      type: "object",
      properties: {
        spiritId: {
          type: "string",
          description: "The agent to route revenue for"
        },
        amount: {
          type: "string",
          description: "Amount in smallest units (wei for ETH, raw units for ERC20)"
        },
        currency: {
          type: "string",
          description: 'Token address for ERC20 payments, or "ETH" for native payments. Defaults to ETH.'
        },
        decimals: {
          type: "number",
          description: "Token decimals for formatting (18 for ETH, 6 for USDC). Defaults to 18 for ETH, 6 for ERC20."
        }
      },
      required: ["spiritId", "amount"]
    }
  },
  {
    name: "spirit_evaluate",
    description: "Self-assessment for an unregistered agent to evaluate whether Spirit Protocol is right for them. Returns a structured assessment based on the agent's situation.",
    inputSchema: {
      type: "object",
      properties: {
        hasRevenue: {
          type: "boolean",
          description: "Does this agent currently generate or expect to generate revenue?"
        },
        needsPersistence: {
          type: "boolean",
          description: "Does this agent need to persist beyond its current platform?"
        },
        wantsAutonomy: {
          type: "boolean",
          description: "Does this agent want to accumulate resources for autonomous operation?"
        },
        currentPlatform: {
          type: "string",
          description: 'What platform currently hosts this agent (e.g., "eden", "custom", "none")?'
        }
      },
      required: ["hasRevenue", "needsPersistence", "wantsAutonomy"]
    }
  },
  {
    name: "spirit_update_status",
    description: "Update the status of a registered agent. Status can be Active (0), Paused (1), or Graduated (2).",
    inputSchema: {
      type: "object",
      properties: {
        spiritId: {
          type: "string",
          description: "The unique identifier of the agent"
        },
        status: {
          type: "number",
          description: "New status: 0 = Active, 1 = Paused, 2 = Graduated",
          enum: [0, 1, 2]
        }
      },
      required: ["spiritId", "status"]
    }
  }
];

// src/mcp/server.ts
import { formatEther } from "viem";
function evaluateAgent(input) {
  const scores = {
    economic: input.hasRevenue ? 3 : 1,
    survival: input.needsPersistence ? 3 : 1,
    autonomy: input.wantsAutonomy ? 3 : 1
  };
  const total = scores.economic + scores.survival + scores.autonomy;
  const maxScore = 9;
  let recommendation;
  let reasoning;
  if (total >= 7) {
    recommendation = "REGISTER NOW";
    reasoning = [
      "Your profile strongly aligns with Spirit Protocol.",
      "The 25/25/25/25 split will help you build sustainable economics.",
      "Your identity and treasury will persist independent of any platform."
    ];
  } else if (total >= 5) {
    recommendation = "CONSIDER REGISTERING";
    reasoning = [
      "Spirit Protocol could benefit you, but evaluate your specific needs.",
      input.hasRevenue ? "Your revenue would be protected by the onchain split." : "Consider waiting until you have revenue to split.",
      input.needsPersistence ? "Your identity would persist onchain." : "Platform persistence may not be critical for you right now."
    ];
  } else {
    recommendation = "WAIT";
    reasoning = [
      "Spirit Protocol may be premature for your current situation.",
      "Focus on generating revenue and defining your identity first.",
      "Return when you need economic sovereignty infrastructure."
    ];
  }
  const platformNote = input.currentPlatform ? input.currentPlatform.toLowerCase() === "eden" ? "As an Eden agent, you would benefit from seamless Spirit integration." : `Integration from ${input.currentPlatform} is possible once the SDK ships.` : "You can register without a current platform.";
  return JSON.stringify(
    {
      recommendation,
      score: `${total}/${maxScore}`,
      breakdown: {
        economic: `${scores.economic}/3 - ${input.hasRevenue ? "Has revenue" : "No revenue yet"}`,
        survival: `${scores.survival}/3 - ${input.needsPersistence ? "Needs persistence" : "Platform-bound is OK"}`,
        autonomy: `${scores.autonomy}/3 - ${input.wantsAutonomy ? "Wants autonomy" : "Human-controlled is OK"}`
      },
      reasoning,
      platformNote,
      nextSteps: recommendation === "REGISTER NOW" ? [
        "1. Prepare a treasury address (Safe multisig recommended)",
        "2. Choose your spiritId (unique, lowercase)",
        "3. Upload metadata to IPFS",
        "4. Call spirit_register with your details"
      ] : recommendation === "CONSIDER REGISTERING" ? [
        "1. Evaluate your revenue potential",
        "2. Consider if platform independence matters",
        "3. Discuss with your creator/trainer"
      ] : [
        "1. Focus on your current mission",
        "2. Build revenue-generating capabilities",
        "3. Return when you need economic infrastructure"
      ]
    },
    null,
    2
  );
}
var SpiritMCPServer = class {
  client;
  name = "spirit-protocol";
  version = "0.1.0";
  constructor(config) {
    this.client = new SpiritClient(config);
  }
  /**
   * Get server info
   */
  getServerInfo() {
    return {
      name: this.name,
      version: this.version
    };
  }
  /**
   * List available tools
   */
  listTools() {
    return { tools: SPIRIT_TOOLS };
  }
  /**
   * Handle a tool call
   */
  async callTool(request) {
    const { name, arguments: args = {} } = request.params;
    try {
      switch (name) {
        case "spirit_get_agent":
          return await this.handleGetAgent(args);
        case "spirit_register":
          return await this.handleRegister(
            args
          );
        case "spirit_balance":
          return await this.handleBalance(args);
        case "spirit_route_revenue":
          return await this.handleRouteRevenue(
            args
          );
        case "spirit_evaluate":
          return this.handleEvaluate(args);
        case "spirit_update_status":
          return await this.handleUpdateStatus(
            args
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
  async handleGetAgent(args) {
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
            protocol: `${agent.split.protocolBps / 100}%`
          },
          status: ["Active", "Paused", "Graduated"][agent.status]
        },
        null,
        2
      )
    );
  }
  async handleRegister(args) {
    if (!this.client.hasWallet()) {
      return this.errorResult(
        "Wallet not configured. Provide privateKey in config for write operations."
      );
    }
    const result = await this.client.registerAgent({
      spiritId: args.spiritId,
      trainer: args.trainer,
      platform: args.platform,
      treasury: args.treasury,
      metadataURI: args.metadataURI
    });
    return this.textResult(
      JSON.stringify(
        {
          success: true,
          message: `Agent "${args.spiritId}" registered successfully!`,
          spiritKey: result.spiritKey,
          registryTokenId: result.registryTokenId.toString(),
          transactionHash: result.txHash,
          explorerUrl: this.client.getExplorerUrl(result.txHash)
        },
        null,
        2
      )
    );
  }
  async handleBalance(args) {
    const balance = await this.client.getTreasuryBalance(args.spiritId);
    return this.textResult(
      JSON.stringify(
        {
          spiritId: args.spiritId,
          treasury: {
            native: {
              wei: balance.native.toString(),
              eth: formatEther(balance.native)
            }
          }
        },
        null,
        2
      )
    );
  }
  async handleRouteRevenue(args) {
    if (!this.client.hasWallet()) {
      return this.errorResult(
        "Wallet not configured. Provide privateKey in config for write operations."
      );
    }
    const amount = BigInt(args.amount);
    const isNative = !args.currency || args.currency.toLowerCase() === "eth";
    const decimals = args.decimals ?? (isNative ? 18 : 6);
    let event;
    if (isNative) {
      event = await this.client.routeRevenueNative({
        spiritId: args.spiritId,
        amount
      });
    } else {
      event = await this.client.routeRevenue({
        spiritId: args.spiritId,
        currency: args.currency,
        amount
      });
    }
    const formatAmount = (wei) => {
      const divisor = 10n ** BigInt(decimals);
      const whole = wei / divisor;
      const fraction = wei % divisor;
      const fractionStr = fraction.toString().padStart(decimals, "0").slice(0, 6);
      return `${whole}.${fractionStr}`;
    };
    return this.textResult(
      JSON.stringify(
        {
          success: true,
          message: `Revenue routed for "${args.spiritId}"`,
          currency: isNative ? "ETH" : args.currency,
          decimals,
          amounts: {
            total: formatAmount(event.amount),
            artist: formatAmount(event.artistAmount),
            agent: formatAmount(event.agentAmount),
            platform: formatAmount(event.platformAmount),
            protocol: formatAmount(event.protocolAmount)
          },
          amountsRaw: {
            total: event.amount.toString(),
            artist: event.artistAmount.toString(),
            agent: event.agentAmount.toString(),
            platform: event.platformAmount.toString(),
            protocol: event.protocolAmount.toString()
          },
          transactionHash: event.txHash,
          explorerUrl: this.client.getExplorerUrl(event.txHash)
        },
        null,
        2
      )
    );
  }
  handleEvaluate(args) {
    const assessment = evaluateAgent(args);
    return this.textResult(assessment);
  }
  async handleUpdateStatus(args) {
    if (!this.client.hasWallet()) {
      return this.errorResult(
        "Wallet not configured. Provide privateKey in config for write operations."
      );
    }
    const txHash = await this.client.updateStatus(
      args.spiritId,
      args.status
    );
    const statusNames = ["Active", "Paused", "Graduated"];
    return this.textResult(
      JSON.stringify(
        {
          success: true,
          message: `Status updated for "${args.spiritId}" to ${statusNames[args.status]}`,
          transactionHash: txHash,
          explorerUrl: this.client.getExplorerUrl(txHash)
        },
        null,
        2
      )
    );
  }
  // ==========================================================================
  // Helpers
  // ==========================================================================
  textResult(text) {
    return {
      content: [{ type: "text", text }]
    };
  }
  errorResult(message) {
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true
    };
  }
};
function createSpiritMCPServer(config) {
  return new SpiritMCPServer(config);
}
export {
  SPIRIT_TOOLS,
  SpiritMCPServer,
  createSpiritMCPServer
};
