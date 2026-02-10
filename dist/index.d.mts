import { Chain } from 'viem';
import { A as Address, S as SpiritClientConfig, a as SpiritAgent, R as RevenueConfig, b as RegisterSpiritParams, c as RegisterSpiritResult, H as Hash, d as RouteRevenueParams, e as RevenueEvent, B as BalanceInfo, f as SpiritChainId } from './types-B3YZkZ9I.mjs';
export { D as DEFAULT_REVENUE_CONFIG, i as RegisteredEvent, h as RevenueRoutedEvent, g as SpiritRegisteredEvent, T as TreasuryUpdatedEvent } from './types-B3YZkZ9I.mjs';

/**
 * Spirit Protocol SDK - Main Client
 *
 * The SpiritClient provides the primary interface for interacting with
 * Spirit Protocol's SpiritRegistry contract on Base.
 *
 * All lookups use uint256 agentId (not string spiritId).
 * Revenue routing is built into the registry (no separate RoyaltyRouter).
 */

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
declare class SpiritClient {
    readonly chainId: number;
    readonly chain: Chain;
    readonly addresses: Record<string, Address>;
    private publicClient;
    private walletClient?;
    private account?;
    constructor(config: SpiritClientConfig);
    /**
     * Get full agent record by agentId
     *
     * Combines data from getSpiritConfig(), getRevenueConfig(), ownerOf(),
     * and agentURI() into a single SpiritAgent object.
     *
     * @returns Agent record if found, null if not registered
     */
    getAgent(agentId: bigint): Promise<SpiritAgent | null>;
    /**
     * Check if an agent exists
     */
    exists(agentId: bigint): Promise<boolean>;
    /**
     * Get the treasury address for an agent
     */
    getTreasury(agentId: bigint): Promise<Address>;
    /**
     * Get the revenue configuration for an agent
     */
    getRevenueConfig(agentId: bigint): Promise<RevenueConfig>;
    /**
     * Get the owner of an agent (ERC-721 owner)
     */
    ownerOf(agentId: bigint): Promise<Address>;
    /**
     * Get the agent URI
     */
    getAgentURI(agentId: bigint): Promise<string>;
    /**
     * Check if an agent has Spirit economics attached
     */
    hasSpiritAttached(agentId: bigint): Promise<boolean>;
    /**
     * Register a new Spirit agent
     *
     * Creates an ERC-8004 identity with Spirit economics in one transaction.
     * The artist address becomes the NFT owner and initial treasury.
     *
     * @throws Error if no wallet client configured
     */
    registerSpirit(params: RegisterSpiritParams): Promise<RegisterSpiritResult>;
    /**
     * Update agent URI (metadata)
     */
    setAgentURI(agentId: bigint, newURI: string): Promise<Hash>;
    /**
     * Update treasury address (must be called by current treasury)
     */
    updateTreasury(agentId: bigint, newTreasury: Address): Promise<Hash>;
    /**
     * Update revenue configuration (must be called by owner, must sum to 10000 bps)
     */
    setRevenueConfig(agentId: bigint, config: RevenueConfig): Promise<Hash>;
    /**
     * Route revenue through the registry's built-in split
     *
     * For ETH: pass token = ZERO_ADDRESS, amount = msg.value (sent as value)
     * For ERC-20: pass token address and amount (caller must have approved registry)
     */
    routeRevenue(params: RouteRevenueParams): Promise<RevenueEvent>;
    /**
     * Get treasury balance for an agent
     */
    getTreasuryBalance(agentId: bigint): Promise<BalanceInfo>;
    /**
     * Get the configured wallet address
     */
    getWalletAddress(): Address | null;
    /**
     * Check if wallet is configured for write operations
     */
    hasWallet(): boolean;
    /**
     * Get the block explorer URL for a transaction
     */
    getExplorerUrl(txHash: Hash): string;
    private requireWallet;
    private parseRevenueEvent;
}

/**
 * Spirit Protocol SDK Constants
 *
 * Contract addresses, chain configuration, and ABIs
 * Matches mainnet SpiritRegistry deployed Feb 3, 2026 on Base (chainId 8453)
 */

declare const CHAIN_CONFIG: {
    /** Base Mainnet */
    readonly 8453: {
        readonly name: "Base";
        readonly rpcUrl: "https://mainnet.base.org";
        readonly blockExplorer: "https://basescan.org";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
    };
    /** Base Sepolia (Testnet) */
    readonly 84532: {
        readonly name: "Base Sepolia";
        readonly rpcUrl: "https://sepolia.base.org";
        readonly blockExplorer: "https://sepolia.basescan.org";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
    };
};
/** Testnet (Base Sepolia) contract addresses */
declare const TESTNET_ADDRESSES: Record<string, Address>;
/** Mainnet (Base) contract addresses */
declare const MAINNET_ADDRESSES: Record<string, Address>;
/** Get contract addresses for a specific chain */
declare function getAddresses(chainId: SpiritChainId): Record<string, Address>;
/**
 * SpiritRegistry ABI — matches mainnet contract at 0xF2709ceF1Cf4893ed78D3220864428b32b12dFb9
 *
 * SpiritRegistry extends ERC8004IdentityRegistry with treasury, revenue routing,
 * and token creation primitives. All lookups use uint256 agentId (not string spiritId).
 *
 * Revenue routing is built into the registry (no separate RoyaltyRouter contract).
 */
declare const SPIRIT_REGISTRY_ABI: readonly [{
    readonly type: "function";
    readonly name: "getSpiritConfig";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "treasury";
            readonly type: "address";
        }, {
            readonly name: "childToken";
            readonly type: "address";
        }, {
            readonly name: "stakingPool";
            readonly type: "address";
        }, {
            readonly name: "lpPosition";
            readonly type: "address";
        }, {
            readonly name: "artist";
            readonly type: "address";
        }, {
            readonly name: "platform";
            readonly type: "address";
        }, {
            readonly name: "createdAt";
            readonly type: "uint256";
        }, {
            readonly name: "hasToken";
            readonly type: "bool";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getRevenueConfig";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "artistBps";
            readonly type: "uint16";
        }, {
            readonly name: "agentBps";
            readonly type: "uint16";
        }, {
            readonly name: "platformBps";
            readonly type: "uint16";
        }, {
            readonly name: "protocolBps";
            readonly type: "uint16";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getTreasury";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getChildToken";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getStakingPool";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "hasSpiritAttached";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getExternalAgent";
    readonly inputs: readonly [{
        readonly name: "spiritId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "registry";
            readonly type: "address";
        }, {
            readonly name: "agentId";
            readonly type: "uint256";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "protocolTreasury";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "defaultRevenueConfig";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "artistBps";
            readonly type: "uint16";
        }, {
            readonly name: "agentBps";
            readonly type: "uint16";
        }, {
            readonly name: "platformBps";
            readonly type: "uint16";
        }, {
            readonly name: "protocolBps";
            readonly type: "uint16";
        }];
    }];
    readonly stateMutability: "pure";
}, {
    readonly type: "function";
    readonly name: "ownerOf";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "agentURI";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "agentWalletOf";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "exists";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getMetadata";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
    }, {
        readonly name: "key";
        readonly type: "string";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "registerSpirit";
    readonly inputs: readonly [{
        readonly name: "agentURI_";
        readonly type: "string";
    }, {
        readonly name: "artist";
        readonly type: "address";
    }, {
        readonly name: "platform";
        readonly type: "address";
    }, {
        readonly name: "treasuryOwners";
        readonly type: "address[]";
    }, {
        readonly name: "treasuryThreshold";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "attachSpirit";
    readonly inputs: readonly [{
        readonly name: "externalRegistry";
        readonly type: "address";
    }, {
        readonly name: "externalAgentId";
        readonly type: "uint256";
    }, {
        readonly name: "artist";
        readonly type: "address";
    }, {
        readonly name: "platform";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "spiritId";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "routeRevenue";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
    }, {
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "updateTreasury";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
    }, {
        readonly name: "newTreasury";
        readonly type: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setRevenueConfig";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
    }, {
        readonly name: "config";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "artistBps";
            readonly type: "uint16";
        }, {
            readonly name: "agentBps";
            readonly type: "uint16";
        }, {
            readonly name: "platformBps";
            readonly type: "uint16";
        }, {
            readonly name: "protocolBps";
            readonly type: "uint16";
        }];
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setAgentURI";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
    }, {
        readonly name: "newURI";
        readonly type: "string";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setMetadata";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
    }, {
        readonly name: "key";
        readonly type: "string";
    }, {
        readonly name: "value";
        readonly type: "string";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "event";
    readonly name: "SpiritRegistered";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "treasury";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "artist";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "platform";
        readonly type: "address";
        readonly indexed: false;
    }];
}, {
    readonly type: "event";
    readonly name: "SpiritAttached";
    readonly inputs: readonly [{
        readonly name: "spiritId";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "externalRegistry";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "externalAgentId";
        readonly type: "uint256";
        readonly indexed: true;
    }];
}, {
    readonly type: "event";
    readonly name: "RevenueRouted";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "token";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
    }, {
        readonly name: "artistAmount";
        readonly type: "uint256";
        readonly indexed: false;
    }, {
        readonly name: "agentAmount";
        readonly type: "uint256";
        readonly indexed: false;
    }, {
        readonly name: "platformAmount";
        readonly type: "uint256";
        readonly indexed: false;
    }, {
        readonly name: "protocolAmount";
        readonly type: "uint256";
        readonly indexed: false;
    }];
}, {
    readonly type: "event";
    readonly name: "TreasuryUpdated";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "oldTreasury";
        readonly type: "address";
        readonly indexed: false;
    }, {
        readonly name: "newTreasury";
        readonly type: "address";
        readonly indexed: false;
    }];
}, {
    readonly type: "event";
    readonly name: "ChildTokenCreated";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "childToken";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "stakingPool";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "lpPosition";
        readonly type: "address";
        readonly indexed: false;
    }];
}, {
    readonly type: "event";
    readonly name: "Registered";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "agentURI";
        readonly type: "string";
        readonly indexed: false;
    }, {
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
    }];
}, {
    readonly type: "event";
    readonly name: "URIUpdated";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "newURI";
        readonly type: "string";
        readonly indexed: false;
    }, {
        readonly name: "updatedBy";
        readonly type: "address";
        readonly indexed: true;
    }];
}, {
    readonly type: "event";
    readonly name: "AgentWalletSet";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "oldWallet";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "newWallet";
        readonly type: "address";
        readonly indexed: true;
    }];
}];
/** Basis points denominator (10000 = 100%) */
declare const BPS_DENOMINATOR = 10000;
/** Default revenue split (25% each) */
declare const DEFAULT_SPLIT_BPS: {
    readonly artist: 2500;
    readonly agent: 2500;
    readonly platform: 2500;
    readonly protocol: 2500;
};
/** Zero address constant */
declare const ZERO_ADDRESS: Address;
/** Zero hash constant */
declare const ZERO_HASH: "0x0000000000000000000000000000000000000000000000000000000000000000";

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

declare const VERSION = "0.1.0";

export { Address, BPS_DENOMINATOR, BalanceInfo, CHAIN_CONFIG, DEFAULT_SPLIT_BPS, Hash, MAINNET_ADDRESSES, RegisterSpiritParams, RegisterSpiritResult, RevenueConfig, RevenueEvent, RouteRevenueParams, SPIRIT_REGISTRY_ABI, SpiritAgent, SpiritChainId, SpiritClient, SpiritClientConfig, TESTNET_ADDRESSES, VERSION, ZERO_ADDRESS, ZERO_HASH, getAddresses };
