/**
 * Spirit Protocol SDK Type Definitions
 *
 * TypeScript types matching the mainnet SpiritRegistry contract
 * (ERC8004IdentityRegistry + ISpiritRegistry)
 */

// ============================================================================
// Core Types
// ============================================================================

/** Ethereum address type */
export type Address = `0x${string}`;

/** Transaction hash type */
export type Hash = `0x${string}`;

/** Chain IDs supported by Spirit Protocol */
export type SpiritChainId = 8453 | 84532; // Base mainnet | Base Sepolia

// ============================================================================
// Revenue Configuration
// ============================================================================

/** Revenue split configuration in basis points (bps), must sum to 10000 */
export interface RevenueConfig {
  /** Artist/creator share in basis points (25% = 2500) */
  artistBps: number;
  /** Agent treasury share in basis points (25% = 2500) */
  agentBps: number;
  /** Platform share in basis points (25% = 2500) */
  platformBps: number;
  /** Protocol treasury share in basis points (25% = 2500) */
  protocolBps: number;
}

/** Default 25/25/25/25 revenue split */
export const DEFAULT_REVENUE_CONFIG: RevenueConfig = {
  artistBps: 2500,
  agentBps: 2500,
  platformBps: 2500,
  protocolBps: 2500,
};

// ============================================================================
// Agent Types
// ============================================================================

/**
 * Full agent record from SpiritRegistry
 *
 * Composite type built from getSpiritConfig(), getRevenueConfig(),
 * ownerOf(), and agentURI() calls.
 */
export interface SpiritAgent {
  /** Numeric agent ID (ERC-721 token ID) */
  agentId: bigint;
  /** Owner address (controls identity) */
  owner: Address;
  /** Agent URI (IPFS or HTTPS pointing to registration JSON) */
  agentURI: string;
  /** Treasury address (controls funds, also set as agentWallet) */
  treasury: Address;
  /** Child token address (address(0) if none) */
  childToken: Address;
  /** Staking pool address (address(0) if none) */
  stakingPool: Address;
  /** LP position address (address(0) if none) */
  lpPosition: Address;
  /** Artist/creator address */
  artist: Address;
  /** Platform address */
  platform: Address;
  /** Creation timestamp */
  createdAt: bigint;
  /** Whether child token has been created */
  hasToken: boolean;
  /** Revenue routing configuration */
  revenueConfig: RevenueConfig;
}

/** Parameters for registering a new Spirit agent */
export interface RegisterSpiritParams {
  /** URI pointing to agent registration JSON (IPFS or HTTPS) */
  agentURI: string;
  /** Artist/creator address (becomes ERC-8004 owner) */
  artist: Address;
  /** Platform address */
  platform: Address;
  /** Treasury multisig owners (ignored in MVP, pass [artist]) */
  treasuryOwners: Address[];
  /** Treasury multisig threshold (ignored in MVP, pass 1) */
  treasuryThreshold: bigint;
}

/** Result of Spirit agent registration */
export interface RegisterSpiritResult {
  /** Assigned agent ID (ERC-721 token ID) */
  agentId: bigint;
  /** Transaction hash */
  txHash: Hash;
}

// ============================================================================
// Revenue Types
// ============================================================================

/** Revenue routing event data */
export interface RevenueEvent {
  /** Agent ID */
  agentId: bigint;
  /** Token address (address(0) for native ETH) */
  token: Address;
  /** Total amount routed */
  amount: bigint;
  /** Amount sent to artist/creator */
  artistAmount: bigint;
  /** Amount sent to agent treasury */
  agentAmount: bigint;
  /** Amount sent to platform */
  platformAmount: bigint;
  /** Amount sent to protocol treasury */
  protocolAmount: bigint;
  /** Transaction hash */
  txHash: Hash;
  /** Block timestamp */
  timestamp: number;
}

/** Parameters for routing revenue */
export interface RouteRevenueParams {
  /** Agent ID to route revenue for */
  agentId: bigint;
  /** Token address (ZERO_ADDRESS for native ETH) */
  token: Address;
  /** Amount to route (for ERC-20; ignored for ETH where msg.value is used) */
  amount: bigint;
}

// ============================================================================
// Client Configuration
// ============================================================================

/** SDK client configuration */
export interface SpiritClientConfig {
  /** Target chain ID */
  chainId: SpiritChainId;
  /** Custom RPC URL (optional, uses public RPC if not provided) */
  rpcUrl?: string;
  /** Private key for write operations (optional for read-only) */
  privateKey?: `0x${string}`;
  /** Custom contract addresses (optional, uses defaults) */
  contracts?: {
    registry?: Address;
    spiritToken?: Address;
    stakingPool?: Address;
    factory?: Address;
  };
}

// ============================================================================
// Event Types (for listening)
// ============================================================================

/** SpiritRegistered event */
export interface SpiritRegisteredEvent {
  agentId: bigint;
  treasury: Address;
  artist: Address;
  platform: Address;
}

/** RevenueRouted event */
export interface RevenueRoutedEvent {
  agentId: bigint;
  token: Address;
  amount: bigint;
  artistAmount: bigint;
  agentAmount: bigint;
  platformAmount: bigint;
  protocolAmount: bigint;
}

/** TreasuryUpdated event */
export interface TreasuryUpdatedEvent {
  agentId: bigint;
  oldTreasury: Address;
  newTreasury: Address;
}

/** ERC8004 Registered event */
export interface RegisteredEvent {
  agentId: bigint;
  agentURI: string;
  owner: Address;
}

// ============================================================================
// Utility Types
// ============================================================================

/** Balance information */
export interface BalanceInfo {
  /** Native ETH balance */
  native: bigint;
  /** SPIRIT token balance (if applicable) */
  spirit?: bigint;
}
