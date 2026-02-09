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
 * // Create client (mainnet)
 * const spirit = new SpiritClient({ chainId: 8453 });
 *
 * // Get agent by numeric ID
 * const agent = await spirit.getAgent(2n); // Abraham
 *
 * // Register a new Spirit agent
 * const spirit = new SpiritClient({
 *   chainId: 8453,
 *   privateKey: process.env.PRIVATE_KEY,
 * });
 * const result = await spirit.registerSpirit({
 *   agentURI: 'ipfs://...',
 *   artist: '0x...',
 *   platform: '0x...',
 *   treasuryOwners: ['0x...'],
 *   treasuryThreshold: 1n,
 * });
 *
 * console.log('Agent registered:', result.agentId);
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
  RevenueConfig,
  RegisterSpiritParams,
  RegisterSpiritResult,

  // Revenue types
  RevenueEvent,
  RouteRevenueParams,

  // Client configuration
  SpiritClientConfig,

  // Event types
  SpiritRegisteredEvent,
  RevenueRoutedEvent,
  TreasuryUpdatedEvent,
  RegisteredEvent,

  // Utility types
  BalanceInfo,
} from './types';

export { DEFAULT_REVENUE_CONFIG } from './types';

// Constants
export {
  // Chain configuration
  CHAIN_CONFIG,
  getAddresses,
  TESTNET_ADDRESSES,
  MAINNET_ADDRESSES,

  // Contract ABIs
  SPIRIT_REGISTRY_ABI,

  // Protocol constants
  BPS_DENOMINATOR,
  DEFAULT_SPLIT_BPS,
  ZERO_ADDRESS,
  ZERO_HASH,
} from './constants';

// Version
export const VERSION = '0.1.0';
