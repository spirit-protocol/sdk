/**
 * Spirit Protocol MCP Server
 *
 * Model Context Protocol server that provides Spirit Protocol tools
 * for Claude and other MCP-compatible AI agents.
 *
 * @example
 * ```typescript
 * import { createSpiritMCPServer } from '@spirit-protocol/sdk/mcp';
 *
 * const server = createSpiritMCPServer({
 *   chainId: 84532,
 *   privateKey: process.env.AGENT_PRIVATE_KEY,
 * });
 *
 * // Connect to stdio transport
 * server.connect(transport);
 * ```
 */

export { createSpiritMCPServer, SpiritMCPServer } from './server';
export { SPIRIT_TOOLS, type SpiritToolName } from './tools';
