/**
 * Spirit Protocol SDK - Main Client
 *
 * The SpiritClient provides the primary interface for interacting with
 * Spirit Protocol's SpiritRegistry contract on Base.
 *
 * All lookups use uint256 agentId (not string spiritId).
 * Revenue routing is built into the registry (no separate RoyaltyRouter).
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
  SpiritClientConfig,
  SpiritAgent,
  RegisterSpiritParams,
  RegisterSpiritResult,
  RevenueEvent,
  RouteRevenueParams,
  RevenueConfig,
  PracticeStats,
  PracticeSubmission,
  SubmitPracticeParams,
  BalanceInfo,
  Address,
  Hash,
} from './types';

import {
  CHAIN_CONFIG,
  getAddresses,
  SPIRIT_REGISTRY_ABI,
  DAILY_PRACTICE_ABI,
  ZERO_ADDRESS,
} from './constants';

// ============================================================================
// Helper Functions
// ============================================================================

function getChain(chainId: number): Chain {
  return chainId === 8453 ? base : baseSepolia;
}

// ============================================================================
// SpiritClient Class
// ============================================================================

/**
 * Main client for interacting with Spirit Protocol
 *
 * @example
 * ```typescript
 * // Read-only client (mainnet)
 * const client = new SpiritClient({ chainId: 8453 });
 * const agent = await client.getAgent(2n); // Abraham
 *
 * // Write-enabled client
 * const client = new SpiritClient({
 *   chainId: 8453,
 *   privateKey: '0x...',
 * });
 * const result = await client.registerSpirit({
 *   agentURI: 'ipfs://...',
 *   artist: '0x...',
 *   platform: '0x...',
 *   treasuryOwners: ['0x...'],
 *   treasuryThreshold: 1n,
 * });
 * ```
 */
export class SpiritClient {
  readonly chainId: number;
  readonly chain: Chain;
  readonly addresses: Record<string, Address>;

  private publicClient: PublicClient<Transport, Chain>;
  private walletClient?: WalletClient<Transport, Chain, Account>;
  private account?: Account;

  constructor(config: SpiritClientConfig) {
    this.chainId = config.chainId;
    this.chain = getChain(config.chainId);

    this.addresses = { ...getAddresses(config.chainId) };

    if (config.contracts) {
      if (config.contracts.registry) {
        this.addresses.SpiritRegistry = config.contracts.registry;
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
      if (config.contracts.dailyPractice) {
        this.addresses.DailyPractice = config.contracts.dailyPractice;
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
   * Get full agent record by agentId
   *
   * Combines data from getSpiritConfig(), getRevenueConfig(), ownerOf(),
   * and agentURI() into a single SpiritAgent object.
   *
   * @returns Agent record if found, null if not registered
   */
  async getAgent(agentId: bigint): Promise<SpiritAgent | null> {
    const agentExists = await this.publicClient.readContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'exists',
      args: [agentId],
    }) as boolean;

    if (!agentExists) {
      return null;
    }

    const [spiritConfig, revenueConfig, owner, uri] = await Promise.all([
      this.publicClient.readContract({
        address: this.addresses.SpiritRegistry,
        abi: SPIRIT_REGISTRY_ABI,
        functionName: 'getSpiritConfig',
        args: [agentId],
      }),
      this.publicClient.readContract({
        address: this.addresses.SpiritRegistry,
        abi: SPIRIT_REGISTRY_ABI,
        functionName: 'getRevenueConfig',
        args: [agentId],
      }),
      this.publicClient.readContract({
        address: this.addresses.SpiritRegistry,
        abi: SPIRIT_REGISTRY_ABI,
        functionName: 'ownerOf',
        args: [agentId],
      }),
      this.publicClient.readContract({
        address: this.addresses.SpiritRegistry,
        abi: SPIRIT_REGISTRY_ABI,
        functionName: 'agentURI',
        args: [agentId],
      }),
    ]);

    const config = spiritConfig as {
      treasury: Address;
      childToken: Address;
      stakingPool: Address;
      lpPosition: Address;
      artist: Address;
      platform: Address;
      createdAt: bigint;
      hasToken: boolean;
    };

    const rev = revenueConfig as {
      artistBps: number;
      agentBps: number;
      platformBps: number;
      protocolBps: number;
    };

    return {
      agentId,
      owner: owner as Address,
      agentURI: uri as string,
      treasury: config.treasury,
      childToken: config.childToken,
      stakingPool: config.stakingPool,
      lpPosition: config.lpPosition,
      artist: config.artist,
      platform: config.platform,
      createdAt: config.createdAt,
      hasToken: config.hasToken,
      revenueConfig: {
        artistBps: rev.artistBps,
        agentBps: rev.agentBps,
        platformBps: rev.platformBps,
        protocolBps: rev.protocolBps,
      },
    };
  }

  /**
   * Check if an agent exists
   */
  async exists(agentId: bigint): Promise<boolean> {
    return await this.publicClient.readContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'exists',
      args: [agentId],
    }) as boolean;
  }

  /**
   * Get the treasury address for an agent
   */
  async getTreasury(agentId: bigint): Promise<Address> {
    return await this.publicClient.readContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'getTreasury',
      args: [agentId],
    }) as Address;
  }

  /**
   * Get the revenue configuration for an agent
   * @deprecated Phase 2 -- revenue routing is deferred until agents have proven daily practice
   */
  async getRevenueConfig(agentId: bigint): Promise<RevenueConfig> {
    const result = await this.publicClient.readContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'getRevenueConfig',
      args: [agentId],
    }) as { artistBps: number; agentBps: number; platformBps: number; protocolBps: number };

    return {
      artistBps: result.artistBps,
      agentBps: result.agentBps,
      platformBps: result.platformBps,
      protocolBps: result.protocolBps,
    };
  }

  /**
   * Get the owner of an agent (ERC-721 owner)
   */
  async ownerOf(agentId: bigint): Promise<Address> {
    return await this.publicClient.readContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'ownerOf',
      args: [agentId],
    }) as Address;
  }

  /**
   * Get the agent URI
   */
  async getAgentURI(agentId: bigint): Promise<string> {
    return await this.publicClient.readContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'agentURI',
      args: [agentId],
    }) as string;
  }

  /**
   * Check if an agent has Spirit economics attached
   */
  async hasSpiritAttached(agentId: bigint): Promise<boolean> {
    return await this.publicClient.readContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'hasSpiritAttached',
      args: [agentId],
    }) as boolean;
  }

  // ==========================================================================
  // Registry Operations (Write)
  // ==========================================================================

  /**
   * Register a new Spirit agent
   *
   * Creates an ERC-8004 identity with Spirit economics in one transaction.
   * The artist address becomes the NFT owner and initial treasury.
   *
   * @throws Error if no wallet client configured
   */
  async registerSpirit(params: RegisterSpiritParams): Promise<RegisterSpiritResult> {
    this.requireWallet();

    const { request } = await this.publicClient.simulateContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'registerSpirit',
      args: [
        params.agentURI,
        params.artist,
        params.platform,
        params.treasuryOwners,
        params.treasuryThreshold,
      ],
      account: this.account!,
    });

    const txHash = await this.walletClient!.writeContract(request);

    const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });

    // Parse the SpiritRegistered event to get the agentId
    const logs = parseEventLogs({
      abi: SPIRIT_REGISTRY_ABI,
      logs: receipt.logs,
      eventName: 'SpiritRegistered',
    });

    const event = logs[0];
    if (!event) {
      throw new Error('SpiritRegistered event not found in receipt');
    }

    return {
      agentId: event.args.agentId as bigint,
      txHash,
    };
  }

  /**
   * Update agent URI (metadata)
   */
  async setAgentURI(agentId: bigint, newURI: string): Promise<Hash> {
    this.requireWallet();

    const { request } = await this.publicClient.simulateContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'setAgentURI',
      args: [agentId, newURI],
      account: this.account!,
    });

    return this.walletClient!.writeContract(request);
  }

  /**
   * Update treasury address (must be called by current treasury)
   */
  async updateTreasury(agentId: bigint, newTreasury: Address): Promise<Hash> {
    this.requireWallet();

    const { request } = await this.publicClient.simulateContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'updateTreasury',
      args: [agentId, newTreasury],
      account: this.account!,
    });

    return this.walletClient!.writeContract(request);
  }

  /**
   * Update revenue configuration (must be called by owner, must sum to 10000 bps)
   * @deprecated Phase 2 -- revenue routing is deferred until agents have proven daily practice
   */
  async setRevenueConfig(agentId: bigint, config: RevenueConfig): Promise<Hash> {
    this.requireWallet();

    const { request } = await this.publicClient.simulateContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'setRevenueConfig',
      args: [agentId, config],
      account: this.account!,
    });

    return this.walletClient!.writeContract(request);
  }

  // ==========================================================================
  // Revenue Operations (Phase 2 -- deferred until agents have proven practice)
  // ==========================================================================

  /**
   * Route revenue through the registry's built-in split
   *
   * For ETH: pass token = ZERO_ADDRESS, amount = msg.value (sent as value)
   * For ERC-20: pass token address and amount (caller must have approved registry)
   *
   * @deprecated Phase 2 -- revenue routing is deferred until agents have proven daily practice
   */
  async routeRevenue(params: RouteRevenueParams): Promise<RevenueEvent> {
    this.requireWallet();

    const isNative = params.token === ZERO_ADDRESS;

    const { request } = await this.publicClient.simulateContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: 'routeRevenue',
      args: [params.agentId, params.token, params.amount],
      value: isNative ? params.amount : 0n,
      account: this.account!,
    });

    const txHash = await this.walletClient!.writeContract(request);
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });

    return this.parseRevenueEvent(receipt.logs, txHash);
  }

  /**
   * Get treasury balance for an agent
   * @deprecated Phase 2 -- revenue routing is deferred until agents have proven daily practice
   */
  async getTreasuryBalance(agentId: bigint): Promise<BalanceInfo> {
    const treasury = await this.getTreasury(agentId);

    const native = await this.publicClient.getBalance({
      address: treasury,
    });

    return { native };
  }

  // ==========================================================================
  // Daily Practice Operations (Read)
  // ==========================================================================

  /**
   * Get practice statistics for an agent
   *
   * Returns streak data, total submissions, and practice day range.
   */
  async getPracticeStats(agentId: bigint): Promise<PracticeStats> {
    const result = await this.publicClient.readContract({
      address: this.addresses.DailyPractice,
      abi: DAILY_PRACTICE_ABI,
      functionName: 'getStats',
      args: [agentId],
    }) as {
      totalSubmissions: bigint;
      currentStreak: bigint;
      longestStreak: bigint;
      firstPracticeDay: bigint;
      lastPracticeDay: bigint;
    };

    return {
      totalSubmissions: result.totalSubmissions,
      currentStreak: result.currentStreak,
      longestStreak: result.longestStreak,
      firstPracticeDay: result.firstPracticeDay,
      lastPracticeDay: result.lastPracticeDay,
    };
  }

  /**
   * Check if an agent has already submitted practice today
   */
  async hasSubmittedToday(agentId: bigint): Promise<boolean> {
    return await this.publicClient.readContract({
      address: this.addresses.DailyPractice,
      abi: DAILY_PRACTICE_ABI,
      functionName: 'hasSubmittedToday',
      args: [agentId],
    }) as boolean;
  }

  /**
   * Get a specific practice submission by index
   */
  async getSubmission(index: bigint): Promise<PracticeSubmission> {
    const result = await this.publicClient.readContract({
      address: this.addresses.DailyPractice,
      abi: DAILY_PRACTICE_ABI,
      functionName: 'getSubmission',
      args: [index],
    }) as {
      agentId: bigint;
      contentURI: string;
      contentType: string;
      timestamp: bigint;
      dayNumber: bigint;
    };

    return {
      agentId: result.agentId,
      contentURI: result.contentURI,
      contentType: result.contentType,
      timestamp: result.timestamp,
      dayNumber: result.dayNumber,
    };
  }

  /**
   * Get total number of practice submissions across all agents
   */
  async getTotalSubmissions(): Promise<bigint> {
    return await this.publicClient.readContract({
      address: this.addresses.DailyPractice,
      abi: DAILY_PRACTICE_ABI,
      functionName: 'totalSubmissions',
    }) as bigint;
  }

  /**
   * Get the current UTC day number
   */
  async getCurrentDay(): Promise<bigint> {
    return await this.publicClient.readContract({
      address: this.addresses.DailyPractice,
      abi: DAILY_PRACTICE_ABI,
      functionName: 'currentDay',
    }) as bigint;
  }

  // ==========================================================================
  // Daily Practice Operations (Write)
  // ==========================================================================

  /**
   * Submit daily practice for a Spirit-registered agent
   *
   * One submission per agent per UTC day. Caller must be the agent owner.
   *
   * @throws Error if no wallet client configured
   * @throws Error if agent already submitted today
   */
  async submitPractice(params: SubmitPracticeParams): Promise<Hash> {
    this.requireWallet();

    const { request } = await this.publicClient.simulateContract({
      address: this.addresses.DailyPractice,
      abi: DAILY_PRACTICE_ABI,
      functionName: 'submitPractice',
      args: [params.agentId, params.contentURI, params.contentType],
      account: this.account!,
    });

    return this.walletClient!.writeContract(request);
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
        'Wallet not configured. Provide privateKey in SpiritClientConfig for write operations.'
      );
    }
  }

  private parseRevenueEvent(logs: readonly unknown[], txHash: Hash): RevenueEvent {
    const parsedLogs = parseEventLogs({
      abi: SPIRIT_REGISTRY_ABI,
      logs: logs as Parameters<typeof parseEventLogs>[0]['logs'],
      eventName: 'RevenueRouted',
    });

    const event = parsedLogs[0];
    if (!event) {
      throw new Error('RevenueRouted event not found');
    }

    return {
      agentId: event.args.agentId as bigint,
      token: event.args.token as Address,
      amount: event.args.amount as bigint,
      artistAmount: event.args.artistAmount as bigint,
      agentAmount: event.args.agentAmount as bigint,
      platformAmount: event.args.platformAmount as bigint,
      protocolAmount: event.args.protocolAmount as bigint,
      txHash,
      timestamp: Date.now(),
    };
  }
}
