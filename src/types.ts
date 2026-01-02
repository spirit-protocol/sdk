/**
 * Spirit Protocol SDK Type Definitions
 *
 * TypeScript types that mirror the Solidity contracts
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

/** Agent status enum (mirrors SpiritRegistry.Status) */
export enum AgentStatus {
  Active = 0,
  Paused = 1,
  Graduated = 2,
}

// ============================================================================
// Split Configuration
// ============================================================================

/** Revenue split configuration in basis points (bps) */
export interface SplitConfig {
  /** Artist/creator share in basis points (25% = 2500) */
  artistBps: number;
  /** Agent treasury share in basis points (25% = 2500) */
  agentBps: number;
  /** Platform share in basis points (25% = 2500) */
  platformBps: number;
  /** Protocol treasury share in basis points (25% = 2500) */
  protocolBps: number;
}

/** Default 25/25/25/25 split */
export const DEFAULT_SPLIT: SplitConfig = {
  artistBps: 2500,
  agentBps: 2500,
  platformBps: 2500,
  protocolBps: 2500,
};

// ============================================================================
// Agent Types
// ============================================================================

/** Economic configuration for an agent */
export interface AgentEconomics {
  /** Child token address (agent-specific token) */
  childToken: Address;
  /** Staking pool address */
  stakingPool: Address;
  /** Royalty router address */
  router: Address;
}

/** Full agent record from registry */
export interface SpiritAgent {
  /** Unique agent identifier (human-readable) */
  spiritId: string;
  /** Registry token ID (NFT) */
  registryTokenId: bigint;
  /** Trainer/creator wallet address */
  trainer: Address;
  /** Platform wallet address */
  platform: Address;
  /** Agent treasury address (typically a Safe) */
  treasury: Address;
  /** Metadata URI (IPFS or HTTPS) */
  metadataURI: string;
  /** Revenue split configuration */
  split: SplitConfig;
  /** Economic contracts configuration */
  economics: AgentEconomics;
  /** Current agent status */
  status: AgentStatus;
}

/** Parameters for registering a new agent */
export interface RegisterAgentParams {
  /** Unique agent identifier */
  spiritId: string;
  /** Trainer/creator wallet address */
  trainer: Address;
  /** Platform wallet address */
  platform: Address;
  /** Agent treasury address */
  treasury: Address;
  /** Metadata URI */
  metadataURI: string;
  /** Revenue split (defaults to 25/25/25/25) */
  split?: SplitConfig;
}

/** Result of agent registration */
export interface RegisterAgentResult {
  /** Computed spirit key (keccak256 hash of spiritId) */
  spiritKey: Hash;
  /** Registry token ID */
  registryTokenId: bigint;
  /** Transaction hash */
  txHash: Hash;
}

// ============================================================================
// Revenue Types
// ============================================================================

/** Revenue routing event */
export interface RevenueEvent {
  /** Spirit key (indexed) */
  spiritKey: Hash;
  /** Currency address (address(0) for native ETH) */
  currency: Address;
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
  /** Optional metadata hash */
  metadataHash: Hash;
  /** Transaction hash */
  txHash: Hash;
  /** Block timestamp */
  timestamp: number;
}

/** Parameters for routing revenue (ERC20) */
export interface RouteRevenueParams {
  /** Agent identifier */
  spiritId: string;
  /** ERC20 token address */
  currency: Address;
  /** Amount to route */
  amount: bigint;
  /** Optional metadata hash */
  metadataHash?: Hash;
}

/** Parameters for routing native ETH revenue */
export interface RouteRevenueNativeParams {
  /** Agent identifier */
  spiritId: string;
  /** Amount in wei (passed as msg.value) */
  amount: bigint;
  /** Optional metadata hash */
  metadataHash?: Hash;
}

// ============================================================================
// Client Configuration
// ============================================================================

/** SDK client configuration */
export interface SpiritConfig {
  /** Target chain ID */
  chainId: SpiritChainId;
  /** Custom RPC URL (optional, uses public RPC if not provided) */
  rpcUrl?: string;
  /** Private key for write operations (optional for read-only) */
  privateKey?: `0x${string}`;
  /** Custom contract addresses (optional, uses defaults) */
  contracts?: {
    registry?: Address;
    router?: Address;
    spiritToken?: Address;
    stakingPool?: Address;
    factory?: Address;
  };
}

// ============================================================================
// Event Types (for listening)
// ============================================================================

/** Agent registered event */
export interface AgentRegisteredEvent {
  spiritKey: Hash;
  spiritId: string;
  registryTokenId: bigint;
  trainer: Address;
  platform: Address;
  treasury: Address;
  split: SplitConfig;
  metadataURI: string;
}

/** Agent configured event (economic config set) */
export interface AgentConfiguredEvent {
  spiritKey: Hash;
  childToken: Address;
  stakingPool: Address;
  router: Address;
}

/** Status updated event */
export interface StatusUpdatedEvent {
  spiritKey: Hash;
  status: AgentStatus;
}

/** Provenance recorded event */
export interface ProvenanceEvent {
  spiritKey: Hash;
  eventType: Hash;
  contentHash: Hash;
}

// ============================================================================
// Utility Types
// ============================================================================

/** Filter for listing agents */
export interface AgentFilter {
  /** Filter by status */
  status?: AgentStatus;
  /** Filter by trainer address */
  trainer?: Address;
  /** Filter by platform address */
  platform?: Address;
  /** Pagination offset */
  offset?: number;
  /** Pagination limit */
  limit?: number;
}

/** Balance information */
export interface BalanceInfo {
  /** Native ETH balance */
  native: bigint;
  /** SPIRIT token balance (if applicable) */
  spirit?: bigint;
  /** Agent token balance (if applicable) */
  agentToken?: bigint;
}

/** Transaction receipt with Spirit-specific data */
export interface SpiritTransactionReceipt {
  /** Transaction hash */
  hash: Hash;
  /** Block number */
  blockNumber: bigint;
  /** Gas used */
  gasUsed: bigint;
  /** Transaction status */
  status: 'success' | 'reverted';
  /** Parsed Spirit events */
  events: Array<RevenueEvent | AgentRegisteredEvent | StatusUpdatedEvent>;
}
