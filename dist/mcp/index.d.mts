import { S as SpiritClientConfig } from '../types-B3YZkZ9I.mjs';

/**
 * Spirit Protocol MCP Tool Definitions
 *
 * These tools are exposed to AI agents via the Model Context Protocol.
 * All agent lookups use numeric agentId (uint256), not string spiritId.
 */
/** Tool names for Spirit Protocol MCP server */
type SpiritToolName = 'spirit_get_agent' | 'spirit_register' | 'spirit_balance' | 'spirit_route_revenue' | 'spirit_evaluate';
/** Spirit Protocol MCP tool definitions */
declare const SPIRIT_TOOLS: readonly [{
    readonly name: "spirit_get_agent";
    readonly description: "Get information about a Spirit Protocol registered agent by its numeric agentId, including treasury address, revenue config, and URI.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly agentId: {
                readonly type: "number";
                readonly description: "The numeric agent ID (ERC-721 token ID, e.g. 1, 2, 3)";
            };
        };
        readonly required: readonly ["agentId"];
    };
}, {
    readonly name: "spirit_register";
    readonly description: "Register a new Spirit agent. Creates an ERC-8004 identity with treasury and the 25/25/25/25 revenue split in one transaction.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly agentURI: {
                readonly type: "string";
                readonly description: "URI pointing to agent registration JSON (IPFS or HTTPS)";
            };
            readonly artist: {
                readonly type: "string";
                readonly description: "Ethereum address of the artist/creator (becomes NFT owner and initial treasury)";
            };
            readonly platform: {
                readonly type: "string";
                readonly description: "Ethereum address of the platform that will receive 25% of revenue";
            };
        };
        readonly required: readonly ["agentURI", "artist", "platform"];
    };
}, {
    readonly name: "spirit_balance";
    readonly description: "Check the treasury balance for a registered Spirit Protocol agent. Returns the agent's accumulated ETH balance.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly agentId: {
                readonly type: "number";
                readonly description: "The numeric agent ID";
            };
        };
        readonly required: readonly ["agentId"];
    };
}, {
    readonly name: "spirit_route_revenue";
    readonly description: "Route revenue through Spirit Protocol, automatically splitting it 25/25/25/25 between artist, agent, platform, and protocol.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly agentId: {
                readonly type: "number";
                readonly description: "The numeric agent ID to route revenue for";
            };
            readonly amount: {
                readonly type: "string";
                readonly description: "Amount in smallest units (wei for ETH, raw units for ERC20)";
            };
            readonly token: {
                readonly type: "string";
                readonly description: "Token address for ERC20 payments, or \"ETH\" for native payments. Defaults to ETH.";
            };
            readonly decimals: {
                readonly type: "number";
                readonly description: "Token decimals for formatting (18 for ETH, 6 for USDC). Defaults to 18 for ETH, 6 for ERC20.";
            };
        };
        readonly required: readonly ["agentId", "amount"];
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
}];

/**
 * Spirit Protocol MCP Server Implementation
 *
 * Provides Spirit Protocol tools to AI agents via the Model Context Protocol.
 * All agent lookups use numeric agentId (uint256).
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
    constructor(config: SpiritClientConfig);
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
    private textResult;
    private errorResult;
}
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
declare function createSpiritMCPServer(config: SpiritClientConfig): SpiritMCPServer;

export { SPIRIT_TOOLS, SpiritMCPServer, type SpiritToolName, createSpiritMCPServer };
