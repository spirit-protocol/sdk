import { Chain } from 'viem';
import { A as Address, S as SpiritConfig, a as SpiritAgent, b as SplitConfig, H as Hash, R as RegisterAgentParams, c as RegisterAgentResult, d as AgentStatus, e as RouteRevenueParams, f as RevenueEvent, g as RouteRevenueNativeParams, B as BalanceInfo, h as SpiritChainId } from './types-CWsPmE5d.js';
export { k as AgentConfiguredEvent, i as AgentEconomics, m as AgentFilter, j as AgentRegisteredEvent, D as DEFAULT_SPLIT, P as ProvenanceEvent, n as SpiritTransactionReceipt, l as StatusUpdatedEvent } from './types-CWsPmE5d.js';

/**
 * Spirit Protocol SDK - Main Client
 *
 * The SpiritClient provides the primary interface for interacting with
 * Spirit Protocol contracts on Base.
 */

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
declare class SpiritClient {
    readonly chainId: number;
    readonly chain: Chain;
    readonly addresses: Record<string, Address>;
    private publicClient;
    private walletClient?;
    private account?;
    constructor(config: SpiritConfig);
    /**
     * Get agent record by spiritId
     */
    getAgent(spiritId: string): Promise<SpiritAgent | null>;
    /**
     * Get recipients and split configuration for an agent
     */
    getRecipients(spiritId: string): Promise<{
        trainer: Address;
        platform: Address;
        treasury: Address;
        split: SplitConfig;
    } | null>;
    /**
     * Resolve spiritId to spiritKey (keccak256 hash)
     */
    resolveKey(spiritId: string): Promise<Hash>;
    /**
     * Get the next available token ID
     */
    getNextTokenId(): Promise<bigint>;
    /**
     * Check if an agent is registered
     */
    isRegistered(spiritId: string): Promise<boolean>;
    /**
     * Register a new agent with Spirit Protocol
     *
     * @throws Error if no wallet client configured
     */
    registerAgent(params: RegisterAgentParams): Promise<RegisterAgentResult>;
    /**
     * Update agent metadata URI
     */
    updateMetadata(spiritId: string, metadataURI: string): Promise<Hash>;
    /**
     * Update agent status
     */
    updateStatus(spiritId: string, status: AgentStatus): Promise<Hash>;
    /**
     * Record a provenance event for an agent
     */
    recordEvent(spiritId: string, eventType: Hash, contentHash: Hash): Promise<Hash>;
    /**
     * Route ERC20 revenue through the 25/25/25/25 split
     *
     * Note: Caller must have approved the RoyaltyRouter to spend the currency
     */
    routeRevenue(params: RouteRevenueParams): Promise<RevenueEvent>;
    /**
     * Route native ETH revenue through the 25/25/25/25 split
     */
    routeRevenueNative(params: RouteRevenueNativeParams): Promise<RevenueEvent>;
    /**
     * Get treasury balance for an agent
     */
    getTreasuryBalance(spiritId: string): Promise<BalanceInfo>;
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
/** SpiritRegistry ABI (read/write operations) */
declare const SPIRIT_REGISTRY_ABI: readonly [{
    readonly type: "function";
    readonly name: "getAgent";
    readonly inputs: readonly [{
        readonly name: "spiritId";
        readonly type: "string";
    }];
    readonly outputs: readonly [{
        readonly name: "record";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "spiritId";
            readonly type: "string";
        }, {
            readonly name: "registryTokenId";
            readonly type: "uint256";
        }, {
            readonly name: "trainer";
            readonly type: "address";
        }, {
            readonly name: "platform";
            readonly type: "address";
        }, {
            readonly name: "treasury";
            readonly type: "address";
        }, {
            readonly name: "metadataURI";
            readonly type: "string";
        }, {
            readonly name: "split";
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
        }, {
            readonly name: "economics";
            readonly type: "tuple";
            readonly components: readonly [{
                readonly name: "childToken";
                readonly type: "address";
            }, {
                readonly name: "stakingPool";
                readonly type: "address";
            }, {
                readonly name: "router";
                readonly type: "address";
            }];
        }, {
            readonly name: "status";
            readonly type: "uint8";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getRecipients";
    readonly inputs: readonly [{
        readonly name: "spiritId";
        readonly type: "string";
    }];
    readonly outputs: readonly [{
        readonly name: "trainer";
        readonly type: "address";
    }, {
        readonly name: "platform";
        readonly type: "address";
    }, {
        readonly name: "treasury";
        readonly type: "address";
    }, {
        readonly name: "split";
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
    readonly name: "resolveKey";
    readonly inputs: readonly [{
        readonly name: "spiritId";
        readonly type: "string";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "pure";
}, {
    readonly type: "function";
    readonly name: "nextTokenId";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "registerAgent";
    readonly inputs: readonly [{
        readonly name: "spiritId";
        readonly type: "string";
    }, {
        readonly name: "trainer";
        readonly type: "address";
    }, {
        readonly name: "platform";
        readonly type: "address";
    }, {
        readonly name: "treasury";
        readonly type: "address";
    }, {
        readonly name: "metadataURI";
        readonly type: "string";
    }, {
        readonly name: "split";
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
    readonly outputs: readonly [{
        readonly name: "spiritKey";
        readonly type: "bytes32";
    }, {
        readonly name: "registryTokenId";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "updateMetadata";
    readonly inputs: readonly [{
        readonly name: "spiritId";
        readonly type: "string";
    }, {
        readonly name: "metadataURI";
        readonly type: "string";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "updateStatus";
    readonly inputs: readonly [{
        readonly name: "spiritId";
        readonly type: "string";
    }, {
        readonly name: "status";
        readonly type: "uint8";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "recordEvent";
    readonly inputs: readonly [{
        readonly name: "spiritId";
        readonly type: "string";
    }, {
        readonly name: "eventType";
        readonly type: "bytes32";
    }, {
        readonly name: "contentHash";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "event";
    readonly name: "AgentRegistered";
    readonly inputs: readonly [{
        readonly name: "spiritKey";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "spiritId";
        readonly type: "string";
        readonly indexed: false;
    }, {
        readonly name: "registryTokenId";
        readonly type: "uint256";
        readonly indexed: false;
    }, {
        readonly name: "trainer";
        readonly type: "address";
        readonly indexed: false;
    }, {
        readonly name: "platform";
        readonly type: "address";
        readonly indexed: false;
    }, {
        readonly name: "treasury";
        readonly type: "address";
        readonly indexed: false;
    }, {
        readonly name: "split";
        readonly type: "tuple";
        readonly indexed: false;
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
    }, {
        readonly name: "metadataURI";
        readonly type: "string";
        readonly indexed: false;
    }];
}, {
    readonly type: "event";
    readonly name: "StatusUpdated";
    readonly inputs: readonly [{
        readonly name: "spiritKey";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "status";
        readonly type: "uint8";
        readonly indexed: false;
    }];
}, {
    readonly type: "event";
    readonly name: "ProvenanceRecorded";
    readonly inputs: readonly [{
        readonly name: "spiritKey";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "eventType";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "contentHash";
        readonly type: "bytes32";
        readonly indexed: false;
    }];
}];
/** RoyaltyRouter ABI (read/write operations) */
declare const ROYALTY_ROUTER_ABI: readonly [{
    readonly type: "function";
    readonly name: "registry";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
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
    readonly name: "acceptedCurrency";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "routeRevenue";
    readonly inputs: readonly [{
        readonly name: "spiritId";
        readonly type: "string";
    }, {
        readonly name: "currency";
        readonly type: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
    }, {
        readonly name: "metadataHash";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "routeRevenueNative";
    readonly inputs: readonly [{
        readonly name: "spiritId";
        readonly type: "string";
    }, {
        readonly name: "metadataHash";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "event";
    readonly name: "RevenueRouted";
    readonly inputs: readonly [{
        readonly name: "spiritKey";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "currency";
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
    }, {
        readonly name: "metadataHash";
        readonly type: "bytes32";
        readonly indexed: false;
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

declare const VERSION = "0.1.0";

export { Address, AgentStatus, BPS_DENOMINATOR, BalanceInfo, CHAIN_CONFIG, DEFAULT_SPLIT_BPS, Hash, MAINNET_ADDRESSES, ROYALTY_ROUTER_ABI, RegisterAgentParams, RegisterAgentResult, RevenueEvent, RouteRevenueNativeParams, RouteRevenueParams, SPIRIT_REGISTRY_ABI, SpiritAgent, SpiritChainId, SpiritClient, SpiritConfig, SplitConfig, TESTNET_ADDRESSES, VERSION, ZERO_ADDRESS, ZERO_HASH, getAddresses };
