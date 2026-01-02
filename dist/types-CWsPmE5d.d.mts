/**
 * Spirit Protocol SDK Type Definitions
 *
 * TypeScript types that mirror the Solidity contracts
 */
/** Ethereum address type */
type Address = `0x${string}`;
/** Transaction hash type */
type Hash = `0x${string}`;
/** Chain IDs supported by Spirit Protocol */
type SpiritChainId = 8453 | 84532;
/** Agent status enum (mirrors SpiritRegistry.Status) */
declare enum AgentStatus {
    Active = 0,
    Paused = 1,
    Graduated = 2
}
/** Revenue split configuration in basis points (bps) */
interface SplitConfig {
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
declare const DEFAULT_SPLIT: SplitConfig;
/** Economic configuration for an agent */
interface AgentEconomics {
    /** Child token address (agent-specific token) */
    childToken: Address;
    /** Staking pool address */
    stakingPool: Address;
    /** Royalty router address */
    router: Address;
}
/** Full agent record from registry */
interface SpiritAgent {
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
interface RegisterAgentParams {
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
interface RegisterAgentResult {
    /** Computed spirit key (keccak256 hash of spiritId) */
    spiritKey: Hash;
    /** Registry token ID */
    registryTokenId: bigint;
    /** Transaction hash */
    txHash: Hash;
}
/** Revenue routing event */
interface RevenueEvent {
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
interface RouteRevenueParams {
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
interface RouteRevenueNativeParams {
    /** Agent identifier */
    spiritId: string;
    /** Amount in wei (passed as msg.value) */
    amount: bigint;
    /** Optional metadata hash */
    metadataHash?: Hash;
}
/** SDK client configuration */
interface SpiritConfig {
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
/** Agent registered event */
interface AgentRegisteredEvent {
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
interface AgentConfiguredEvent {
    spiritKey: Hash;
    childToken: Address;
    stakingPool: Address;
    router: Address;
}
/** Status updated event */
interface StatusUpdatedEvent {
    spiritKey: Hash;
    status: AgentStatus;
}
/** Provenance recorded event */
interface ProvenanceEvent {
    spiritKey: Hash;
    eventType: Hash;
    contentHash: Hash;
}
/** Filter for listing agents */
interface AgentFilter {
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
interface BalanceInfo {
    /** Native ETH balance */
    native: bigint;
    /** SPIRIT token balance (if applicable) */
    spirit?: bigint;
    /** Agent token balance (if applicable) */
    agentToken?: bigint;
}
/** Transaction receipt with Spirit-specific data */
interface SpiritTransactionReceipt {
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

export { type Address as A, type BalanceInfo as B, DEFAULT_SPLIT as D, type Hash as H, type ProvenanceEvent as P, type RegisterAgentParams as R, type SpiritConfig as S, type SpiritAgent as a, type SplitConfig as b, type RegisterAgentResult as c, AgentStatus as d, type RouteRevenueParams as e, type RevenueEvent as f, type RouteRevenueNativeParams as g, type SpiritChainId as h, type AgentEconomics as i, type AgentRegisteredEvent as j, type AgentConfiguredEvent as k, type StatusUpdatedEvent as l, type AgentFilter as m, type SpiritTransactionReceipt as n };
