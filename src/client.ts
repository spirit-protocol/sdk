/**
 * Spirit Protocol SDK - Main Client
 *
 * The SpiritClient provides the primary interface for interacting with
 * Spirit Protocol contracts on Base.
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type WalletClient,
  type Chain,
  type Transport,
  type Account,
  parseEventLogs,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';

import type {
  SpiritConfig,
  SpiritAgent,
  RegisterAgentParams,
  RegisterAgentResult,
  RevenueEvent,
  RouteRevenueParams,
  RouteRevenueNativeParams,
  BalanceInfo,
  Address,
  Hash,
  SplitConfig,
  AgentStatus,
} from './types';

import {
  CHAIN_CONFIG,
  getAddresses,
  SPIRIT_REGISTRY_ABI,
  ROYALTY_ROUTER_ABI,
  ZERO_HASH,
} from './constants';
import { DEFAULT_SPLIT } from './types';

// ============================================================================
// Helper Functions
// ============================================================================

function getChain(chainId: number): Chain {
  return chainId === 8453 ? base : baseSepolia;
}

function parseAgentRecord(raw: unknown): SpiritAgent {
  const record = raw as {
    spiritId: string;
    registryTokenId: bigint;
    trainer: Address;
    platform: Address;
    treasury: Address;
    metadataURI: string;
    split: { artistBps: number; agentBps: number; platformBps: number; protocolBps: number };
    economics: { childToken: Address; stakingPool: Address; router: Address };
    status: number;
  };

  return {
    spiritId: record.spiritId,
    registryTokenId: record.registryTokenId,
    trainer: record.trainer,
    platform: record.platform,
    treasury: record.treasury,
    metadataURI: record.metadataURI,
    split: {
      artistBps: record.split.artistBps,
      agentBps: record.split.agentBps,
      platformBps: record.split.platformBps,
      protocolBps: record.split.protocolBps,
    },
    economics: {
      childToken: record.economics.childToken,
      stakingPool: record.economics.stakingPool,
      router: record.economics.router,
    },
    status: record.status as AgentStatus,
  };
}

// ============================================================================
// SpiritClient Class
// ============================================================================

/**
 * Main client for interacting with Spirit Protocol
 *
 * @example
 * ```typescript
 * // Read-only client
 * const client = new SpiritClient({ chainId: 84532 });
 * const agent = await client.getAgent('abraham');
 *
 * // Write-enabled client
 * const client = new SpiritClient({
 *   chainId: 84532,
 *   privateKey: '0x...',
 * });
 * const result = await client.registerAgent({ ... });
 * ```
 */
export class SpiritClient {
  readonly chainId: number;
  readonly chain: Chain;
  readonly addresses: Record<string, Address>;

  private publicClient: PublicClient<Transport, Chain>;
  private walletClient?: WalletClient<Transport, Chain, Account>;
  private account?: Account;

  constructor(config: SpiritConfig) {
    this.chainId = config.chainId;
    this.chain = getChain(config.chainId);

    // Start with default addresses for the chain
    this.addresses = { ...getAddresses(config.chainId) };

    // Map user-friendly config keys to actual contract names
    if (config.contracts) {
      if (config.contracts.registry) {
        this.addresses.SpiritRegistry = config.contracts.registry;
      }
      if (config.contracts.router) {
        this.addresses.RoyaltyRouter = config.contracts.router;
      }
      if (config.contracts.spiritToken) {
        this.addresses.SpiritToken = config.contracts.spiritToken;
      }
      if (config.contracts.stakingPool) {
        this.addresses.StakingPool = config.contracts.stakingPool;
      }
      if (config.contracts.factory) {
        this.addresses.SpiritFactory = config.contracts.factory;
      }
    }

    const rpcUrl = config.rpcUrl || CHAIN_CONFIG[config.chainId].rpcUrl;

    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(rpcUrl),
    });

    if (config.privateKey) {
      this.account = privateKeyToAccount(config.privateKey);
      this.walletClient = createWalletClient({
        chain: this.chain,
        transport: http(rpcUrl),
        account: this.account,
      });
    }
  }

  // ==========================================================================
  // Registry Operations (Read)
  // ==========================================================================

  /**
   * Get agent record by spiritId
   *
   * @returns Agent record if found, null if not registered
   * @throws Error on network/RPC failures
   */
  async getAgent(spiritId: string): Promise<SpiritAgent | null> {
    const result = await this.publicClient.readContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'getAgent',
      args: [spiritId],
    });

    const agent = parseAgentRecord(result);

    // Check if agent exists (registryTokenId > 0)
    if (agent.registryTokenId === 0n) {
      return null;
    }

    return agent;
  }

  /**
   * Get recipients and split configuration for an agent
   *
   * @throws Error on network/RPC failures or if agent not found
   */
  async getRecipients(spiritId: string): Promise<{
    trainer: Address;
    platform: Address;
    treasury: Address;
    split: SplitConfig;
  }> {
    const result = await this.publicClient.readContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'getRecipients',
      args: [spiritId],
    }) as [Address, Address, Address, { artistBps: number; agentBps: number; platformBps: number; protocolBps: number }];

    return {
      trainer: result[0],
      platform: result[1],
      treasury: result[2],
      split: {
        artistBps: result[3].artistBps,
        agentBps: result[3].agentBps,
        platformBps: result[3].platformBps,
        protocolBps: result[3].protocolBps,
      },
    };
  }

  /**
   * Resolve spiritId to spiritKey (keccak256 hash)
   */
  async resolveKey(spiritId: string): Promise<Hash> {
    const result = await this.publicClient.readContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'resolveKey',
      args: [spiritId],
    });

    return result as Hash;
  }

  /**
   * Get the next available token ID
   */
  async getNextTokenId(): Promise<bigint> {
    const result = await this.publicClient.readContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'nextTokenId',
      args: [],
    });

    return result as bigint;
  }

  /**
   * Check if an agent is registered
   */
  async isRegistered(spiritId: string): Promise<boolean> {
    const agent = await this.getAgent(spiritId);
    return agent !== null;
  }

  // ==========================================================================
  // Registry Operations (Write)
  // ==========================================================================

  /**
   * Register a new agent with Spirit Protocol
   *
   * @throws Error if no wallet client configured
   */
  async registerAgent(params: RegisterAgentParams): Promise<RegisterAgentResult> {
    this.requireWallet();

    const split = params.split || DEFAULT_SPLIT;

    const { request } = await this.publicClient.simulateContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'registerAgent',
      args: [
        params.spiritId,
        params.trainer,
        params.platform,
        params.treasury,
        params.metadataURI,
        {
          artistBps: split.artistBps,
          agentBps: split.agentBps,
          platformBps: split.platformBps,
          protocolBps: split.protocolBps,
        },
      ],
      account: this.account!,
    });

    const txHash = await this.walletClient!.writeContract(request);

    const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });

    // Parse the AgentRegistered event
    const logs = parseEventLogs({
      abi: SPIRIT_REGISTRY_ABI,
      logs: receipt.logs,
      eventName: 'AgentRegistered',
    });

    const event = logs[0];
    if (!event) {
      throw new Error('AgentRegistered event not found in receipt');
    }

    return {
      spiritKey: event.args.spiritKey as Hash,
      registryTokenId: event.args.registryTokenId as bigint,
      txHash,
    };
  }

  /**
   * Update agent metadata URI
   */
  async updateMetadata(spiritId: string, metadataURI: string): Promise<Hash> {
    this.requireWallet();

    const { request } = await this.publicClient.simulateContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'updateMetadata',
      args: [spiritId, metadataURI],
      account: this.account!,
    });

    return this.walletClient!.writeContract(request);
  }

  /**
   * Update agent status
   */
  async updateStatus(spiritId: string, status: AgentStatus): Promise<Hash> {
    this.requireWallet();

    const { request } = await this.publicClient.simulateContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'updateStatus',
      args: [spiritId, status],
      account: this.account!,
    });

    return this.walletClient!.writeContract(request);
  }

  /**
   * Record a provenance event for an agent
   */
  async recordEvent(
    spiritId: string,
    eventType: Hash,
    contentHash: Hash
  ): Promise<Hash> {
    this.requireWallet();

    const { request } = await this.publicClient.simulateContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'recordEvent',
      args: [spiritId, eventType, contentHash],
      account: this.account!,
    });

    return this.walletClient!.writeContract(request);
  }

  // ==========================================================================
  // Revenue Operations
  // ==========================================================================

  /**
   * Route ERC20 revenue through the 25/25/25/25 split
   *
   * Note: Caller must have approved the RoyaltyRouter to spend the currency
   */
  async routeRevenue(params: RouteRevenueParams): Promise<RevenueEvent> {
    this.requireWallet();

    const metadataHash = params.metadataHash || ZERO_HASH;

    const { request } = await this.publicClient.simulateContract({
      address: this.addresses.RoyaltyRouter,
      abi: ROYALTY_ROUTER_ABI,
      functionName: 'routeRevenue',
      args: [params.spiritId, params.currency, params.amount, metadataHash],
      account: this.account!,
    });

    const txHash = await this.walletClient!.writeContract(request);
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });

    return this.parseRevenueEvent(receipt.logs, txHash);
  }

  /**
   * Route native ETH revenue through the 25/25/25/25 split
   */
  async routeRevenueNative(params: RouteRevenueNativeParams): Promise<RevenueEvent> {
    this.requireWallet();

    const metadataHash = params.metadataHash || ZERO_HASH;

    const { request } = await this.publicClient.simulateContract({
      address: this.addresses.RoyaltyRouter,
      abi: ROYALTY_ROUTER_ABI,
      functionName: 'routeRevenueNative',
      args: [params.spiritId, metadataHash],
      value: params.amount,
      account: this.account!,
    });

    const txHash = await this.walletClient!.writeContract(request);
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });

    return this.parseRevenueEvent(receipt.logs, txHash);
  }

  /**
   * Get treasury balance for an agent
   */
  async getTreasuryBalance(spiritId: string): Promise<BalanceInfo> {
    const agent = await this.getAgent(spiritId);
    if (!agent) {
      throw new Error(`Agent not found: ${spiritId}`);
    }

    const native = await this.publicClient.getBalance({
      address: agent.treasury,
    });

    return { native };
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Get the configured wallet address
   */
  getWalletAddress(): Address | null {
    return this.account?.address || null;
  }

  /**
   * Check if wallet is configured for write operations
   */
  hasWallet(): boolean {
    return !!this.walletClient;
  }

  /**
   * Get the block explorer URL for a transaction
   */
  getExplorerUrl(txHash: Hash): string {
    return `${CHAIN_CONFIG[this.chainId as 8453 | 84532].blockExplorer}/tx/${txHash}`;
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  private requireWallet(): void {
    if (!this.walletClient || !this.account) {
      throw new Error(
        'Wallet not configured. Provide privateKey in SpiritConfig for write operations.'
      );
    }
  }

  private parseRevenueEvent(logs: readonly unknown[], txHash: Hash): RevenueEvent {
    const parsedLogs = parseEventLogs({
      abi: ROYALTY_ROUTER_ABI,
      logs: logs as Parameters<typeof parseEventLogs>[0]['logs'],
      eventName: 'RevenueRouted',
    });

    const event = parsedLogs[0];
    if (!event) {
      throw new Error('RevenueRouted event not found');
    }

    return {
      spiritKey: event.args.spiritKey as Hash,
      currency: event.args.currency as Address,
      amount: event.args.amount as bigint,
      artistAmount: event.args.artistAmount as bigint,
      agentAmount: event.args.agentAmount as bigint,
      platformAmount: event.args.platformAmount as bigint,
      protocolAmount: event.args.protocolAmount as bigint,
      metadataHash: event.args.metadataHash as Hash,
      txHash,
      timestamp: Date.now(),
    };
  }
}
