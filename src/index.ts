/**
 * Spirit Protocol SDK
 *
 * TypeScript SDK for AI agents to achieve economic sovereignty
 * through Spirit Protocol on Base.
 *
 * @example
 * ```typescript
 * import { SpiritClient } from '@spirit-protocol/sdk';
 *
 * // Create client
 * const spirit = new SpiritClient({
 *   chainId: 84532, // Base Sepolia
 *   privateKey: process.env.PRIVATE_KEY,
 * });
 *
 * // Register an agent
 * const result = await spirit.registerAgent({
 *   spiritId: 'my-agent',
 *   trainer: '0x...',
 *   platform: '0x...',
 *   treasury: '0x...',
 *   metadataURI: 'ipfs://...',
 * });
 *
 * console.log('Agent registered:', result.spiritKey);
 * ```
 *
 * @packageDocumentation
 */

// Main client
export { SpiritClient } from './client';

// Types
export type {
  // Core types
  Address,
  Hash,
  SpiritChainId,

  // Agent types
  SpiritAgent,
  AgentEconomics,
  SplitConfig,
  RegisterAgentParams,
  RegisterAgentResult,

  // Revenue types
  RevenueEvent,
  RouteRevenueParams,
  RouteRevenueNativeParams,

  // Client configuration
  SpiritConfig,

  // Event types
  AgentRegisteredEvent,
  AgentConfiguredEvent,
  StatusUpdatedEvent,
  ProvenanceEvent,

  // Utility types
  AgentFilter,
  BalanceInfo,
  SpiritTransactionReceipt,
} from './types';

export { AgentStatus, DEFAULT_SPLIT } from './types';

// Constants
export {
  // Chain configuration
  CHAIN_CONFIG,
  getAddresses,
  TESTNET_ADDRESSES,
  MAINNET_ADDRESSES,

  // Contract ABIs
  SPIRIT_REGISTRY_ABI,
  ROYALTY_ROUTER_ABI,

  // Protocol constants
  BPS_DENOMINATOR,
  DEFAULT_SPLIT_BPS,
  ZERO_ADDRESS,
  ZERO_HASH,
} from './constants';

// Version
export const VERSION = '0.1.0';
