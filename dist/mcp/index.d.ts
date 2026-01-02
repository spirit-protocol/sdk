import { S as SpiritConfig } from '../types-CWsPmE5d.js';

/**
 * Spirit Protocol MCP Tool Definitions
 *
 * These tools are exposed to AI agents via the Model Context Protocol.
 */
/** Tool names for Spirit Protocol MCP server */
type SpiritToolName = 'spirit_get_agent' | 'spirit_register' | 'spirit_balance' | 'spirit_route_revenue' | 'spirit_evaluate' | 'spirit_update_status';
/** Spirit Protocol MCP tool definitions */
declare const SPIRIT_TOOLS: readonly [{
    readonly name: "spirit_get_agent";
    readonly description: "Get information about a Spirit Protocol registered agent, including treasury address, revenue split, and status.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly spiritId: {
                readonly type: "string";
                readonly description: "The unique identifier of the agent (e.g., \"abraham\", \"solienne\")";
            };
        };
        readonly required: readonly ["spiritId"];
    };
}, {
    readonly name: "spirit_register";
    readonly description: "Register a new agent with Spirit Protocol. This creates an onchain identity with a treasury and enables the 25/25/25/25 revenue split.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly spiritId: {
                readonly type: "string";
                readonly description: "Unique identifier for the agent (lowercase, alphanumeric)";
            };
            readonly trainer: {
                readonly type: "string";
                readonly description: "Ethereum address of the trainer/creator who will receive 25% of revenue";
            };
            readonly platform: {
                readonly type: "string";
                readonly description: "Ethereum address of the platform that will receive 25% of revenue";
            };
            readonly treasury: {
                readonly type: "string";
                readonly description: "Ethereum address of the agent treasury (typically a Safe multisig)";
            };
            readonly metadataURI: {
                readonly type: "string";
                readonly description: "URI pointing to agent metadata (IPFS or HTTPS)";
            };
        };
        readonly required: readonly ["spiritId", "trainer", "platform", "treasury", "metadataURI"];
    };
}, {
    readonly name: "spirit_balance";
    readonly description: "Check the treasury balance for a registered Spirit Protocol agent. Returns the agent's accumulated ETH balance.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly spiritId: {
                readonly type: "string";
                readonly description: "The unique identifier of the agent";
            };
        };
        readonly required: readonly ["spiritId"];
    };
}, {
    readonly name: "spirit_route_revenue";
    readonly description: "Route revenue through Spirit Protocol, automatically splitting it 25/25/25/25 between creator, agent, platform, and protocol.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly spiritId: {
                readonly type: "string";
                readonly description: "The agent to route revenue for";
            };
            readonly amount: {
                readonly type: "string";
                readonly description: "Amount in smallest units (wei for ETH, raw units for ERC20)";
            };
            readonly currency: {
                readonly type: "string";
                readonly description: "Token address for ERC20 payments, or \"ETH\" for native payments. Defaults to ETH.";
            };
            readonly decimals: {
                readonly type: "number";
                readonly description: "Token decimals for formatting (18 for ETH, 6 for USDC). Defaults to 18 for ETH, 6 for ERC20.";
            };
        };
        readonly required: readonly ["spiritId", "amount"];
    };
}, {
    readonly name: "spirit_evaluate";
    readonly description: "Self-assessment for an unregistered agent to evaluate whether Spirit Protocol is right for them. Returns a structured assessment based on the agent's situation.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly hasRevenue: {
                readonly type: "boolean";
                readonly description: "Does this agent currently generate or expect to generate revenue?";
            };
            readonly needsPersistence: {
                readonly type: "boolean";
                readonly description: "Does this agent need to persist beyond its current platform?";
            };
            readonly wantsAutonomy: {
                readonly type: "boolean";
                readonly description: "Does this agent want to accumulate resources for autonomous operation?";
            };
            readonly currentPlatform: {
                readonly type: "string";
                readonly description: "What platform currently hosts this agent (e.g., \"eden\", \"custom\", \"none\")?";
            };
        };
        readonly required: readonly ["hasRevenue", "needsPersistence", "wantsAutonomy"];
    };
}, {
    readonly name: "spirit_update_status";
    readonly description: "Update the status of a registered agent. Status can be Active (0), Paused (1), or Graduated (2).";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly spiritId: {
                readonly type: "string";
                readonly description: "The unique identifier of the agent";
            };
            readonly status: {
                readonly type: "number";
                readonly description: "New status: 0 = Active, 1 = Paused, 2 = Graduated";
                readonly enum: readonly [0, 1, 2];
            };
        };
        readonly required: readonly ["spiritId", "status"];
    };
}];

/**
 * Spirit Protocol MCP Server Implementation
 *
 * Provides Spirit Protocol tools to AI agents via the Model Context Protocol.
 */

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
/**
 * Spirit Protocol MCP Server
 *
 * Handles MCP tool calls for Spirit Protocol operations.
 */
declare class SpiritMCPServer {
    private client;
    private name;
    private version;
    constructor(config: SpiritConfig);
    /**
     * Get server info
     */
    getServerInfo(): {
        name: string;
        version: string;
    };
    /**
     * List available tools
     */
    listTools(): MCPListToolsResult;
    /**
     * Handle a tool call
     */
    callTool(request: MCPCallToolRequest): Promise<MCPToolResult>;
    private handleGetAgent;
    private handleRegister;
    private handleBalance;
    private handleRouteRevenue;
    private handleEvaluate;
    private handleUpdateStatus;
    private textResult;
    private errorResult;
}
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
declare function createSpiritMCPServer(config: SpiritConfig): SpiritMCPServer;

export { SPIRIT_TOOLS, SpiritMCPServer, type SpiritToolName, createSpiritMCPServer };
