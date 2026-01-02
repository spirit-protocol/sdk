// src/constants.ts
var CHAIN_CONFIG = {
  /** Base Mainnet */
  8453: {
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }
  },
  /** Base Sepolia (Testnet) */
  84532: {
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }
  }
};
var TESTNET_ADDRESSES = {
  // Layer 1: Minimal (spirit-onboarding-demo)
  SpiritRegistry: "0x0000000000000000000000000000000000000000",
  // TODO: Deploy
  RoyaltyRouter: "0x0000000000000000000000000000000000000000",
  // TODO: Deploy
  // Layer 2: Full (spirit-contracts-core)
  SpiritToken: "0xC3FD6880fC602d999f64C4a38dF51BEB6e1b654B",
  SpiritFactory: "0x53B9db3DCF3a69a0F62c44b19a6c37149b7fB93b",
  StakingPool: "0xBBC3C7dc9151FFDc97e04E84Ad0fE91aF91D9DeE",
  RewardController: "0xD91CCC7eeA5c0aD0f6e5E2c6E5c08bdF5C1cA1b0",
  // Protocol Treasury (for 25% protocol share)
  ProtocolTreasury: "0x0000000000000000000000000000000000000000"
  // TODO: Set
};
var MAINNET_ADDRESSES = {
  // TODO: Deploy to mainnet
  SpiritRegistry: "0x0000000000000000000000000000000000000000",
  RoyaltyRouter: "0x0000000000000000000000000000000000000000",
  SpiritToken: "0x0000000000000000000000000000000000000000",
  SpiritFactory: "0x0000000000000000000000000000000000000000",
  StakingPool: "0x0000000000000000000000000000000000000000",
  RewardController: "0x0000000000000000000000000000000000000000",
  ProtocolTreasury: "0x0000000000000000000000000000000000000000"
};
function getAddresses(chainId) {
  return chainId === 8453 ? MAINNET_ADDRESSES : TESTNET_ADDRESSES;
}
var SPIRIT_REGISTRY_ABI = [
  // Read functions
  {
    type: "function",
    name: "getAgent",
    inputs: [{ name: "spiritId", type: "string" }],
    outputs: [
      {
        name: "record",
        type: "tuple",
        components: [
          { name: "spiritId", type: "string" },
          { name: "registryTokenId", type: "uint256" },
          { name: "trainer", type: "address" },
          { name: "platform", type: "address" },
          { name: "treasury", type: "address" },
          { name: "metadataURI", type: "string" },
          {
            name: "split",
            type: "tuple",
            components: [
              { name: "artistBps", type: "uint16" },
              { name: "agentBps", type: "uint16" },
              { name: "platformBps", type: "uint16" },
              { name: "protocolBps", type: "uint16" }
            ]
          },
          {
            name: "economics",
            type: "tuple",
            components: [
              { name: "childToken", type: "address" },
              { name: "stakingPool", type: "address" },
              { name: "router", type: "address" }
            ]
          },
          { name: "status", type: "uint8" }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getRecipients",
    inputs: [{ name: "spiritId", type: "string" }],
    outputs: [
      { name: "trainer", type: "address" },
      { name: "platform", type: "address" },
      { name: "treasury", type: "address" },
      {
        name: "split",
        type: "tuple",
        components: [
          { name: "artistBps", type: "uint16" },
          { name: "agentBps", type: "uint16" },
          { name: "platformBps", type: "uint16" },
          { name: "protocolBps", type: "uint16" }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "resolveKey",
    inputs: [{ name: "spiritId", type: "string" }],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "pure"
  },
  {
    type: "function",
    name: "nextTokenId",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  // Write functions
  {
    type: "function",
    name: "registerAgent",
    inputs: [
      { name: "spiritId", type: "string" },
      { name: "trainer", type: "address" },
      { name: "platform", type: "address" },
      { name: "treasury", type: "address" },
      { name: "metadataURI", type: "string" },
      {
        name: "split",
        type: "tuple",
        components: [
          { name: "artistBps", type: "uint16" },
          { name: "agentBps", type: "uint16" },
          { name: "platformBps", type: "uint16" },
          { name: "protocolBps", type: "uint16" }
        ]
      }
    ],
    outputs: [
      { name: "spiritKey", type: "bytes32" },
      { name: "registryTokenId", type: "uint256" }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "updateMetadata",
    inputs: [
      { name: "spiritId", type: "string" },
      { name: "metadataURI", type: "string" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "updateStatus",
    inputs: [
      { name: "spiritId", type: "string" },
      { name: "status", type: "uint8" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "recordEvent",
    inputs: [
      { name: "spiritId", type: "string" },
      { name: "eventType", type: "bytes32" },
      { name: "contentHash", type: "bytes32" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  // Events
  {
    type: "event",
    name: "AgentRegistered",
    inputs: [
      { name: "spiritKey", type: "bytes32", indexed: true },
      { name: "spiritId", type: "string", indexed: false },
      { name: "registryTokenId", type: "uint256", indexed: false },
      { name: "trainer", type: "address", indexed: false },
      { name: "platform", type: "address", indexed: false },
      { name: "treasury", type: "address", indexed: false },
      {
        name: "split",
        type: "tuple",
        indexed: false,
        components: [
          { name: "artistBps", type: "uint16" },
          { name: "agentBps", type: "uint16" },
          { name: "platformBps", type: "uint16" },
          { name: "protocolBps", type: "uint16" }
        ]
      },
      { name: "metadataURI", type: "string", indexed: false }
    ]
  },
  {
    type: "event",
    name: "StatusUpdated",
    inputs: [
      { name: "spiritKey", type: "bytes32", indexed: true },
      { name: "status", type: "uint8", indexed: false }
    ]
  },
  {
    type: "event",
    name: "ProvenanceRecorded",
    inputs: [
      { name: "spiritKey", type: "bytes32", indexed: true },
      { name: "eventType", type: "bytes32", indexed: true },
      { name: "contentHash", type: "bytes32", indexed: false }
    ]
  }
];
var ROYALTY_ROUTER_ABI = [
  // Read functions
  {
    type: "function",
    name: "registry",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "protocolTreasury",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "acceptedCurrency",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view"
  },
  // Write functions
  {
    type: "function",
    name: "routeRevenue",
    inputs: [
      { name: "spiritId", type: "string" },
      { name: "currency", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "metadataHash", type: "bytes32" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "routeRevenueNative",
    inputs: [
      { name: "spiritId", type: "string" },
      { name: "metadataHash", type: "bytes32" }
    ],
    outputs: [],
    stateMutability: "payable"
  },
  // Events
  {
    type: "event",
    name: "RevenueRouted",
    inputs: [
      { name: "spiritKey", type: "bytes32", indexed: true },
      { name: "currency", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "artistAmount", type: "uint256", indexed: false },
      { name: "agentAmount", type: "uint256", indexed: false },
      { name: "platformAmount", type: "uint256", indexed: false },
      { name: "protocolAmount", type: "uint256", indexed: false },
      { name: "metadataHash", type: "bytes32", indexed: false }
    ]
  }
];
var BPS_DENOMINATOR = 1e4;
var DEFAULT_SPLIT_BPS = {
  artist: 2500,
  agent: 2500,
  platform: 2500,
  protocol: 2500
};
var ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
var ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";

// src/types.ts
var AgentStatus = /* @__PURE__ */ ((AgentStatus2) => {
  AgentStatus2[AgentStatus2["Active"] = 0] = "Active";
  AgentStatus2[AgentStatus2["Paused"] = 1] = "Paused";
  AgentStatus2[AgentStatus2["Graduated"] = 2] = "Graduated";
  return AgentStatus2;
})(AgentStatus || {});
var DEFAULT_SPLIT = {
  artistBps: 2500,
  agentBps: 2500,
  platformBps: 2500,
  protocolBps: 2500
};

// src/client.ts
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEventLogs
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
function getChain(chainId) {
  return chainId === 8453 ? base : baseSepolia;
}
function parseAgentRecord(raw) {
  const record = raw;
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
      protocolBps: record.split.protocolBps
    },
    economics: {
      childToken: record.economics.childToken,
      stakingPool: record.economics.stakingPool,
      router: record.economics.router
    },
    status: record.status
  };
}
var SpiritClient = class {
  chainId;
  chain;
  addresses;
  publicClient;
  walletClient;
  account;
  constructor(config) {
    this.chainId = config.chainId;
    this.chain = getChain(config.chainId);
    this.addresses = { ...getAddresses(config.chainId), ...config.contracts };
    const rpcUrl = config.rpcUrl || CHAIN_CONFIG[config.chainId].rpcUrl;
    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(rpcUrl)
    });
    if (config.privateKey) {
      this.account = privateKeyToAccount(config.privateKey);
      this.walletClient = createWalletClient({
        chain: this.chain,
        transport: http(rpcUrl),
        account: this.account
      });
    }
  }
  // ==========================================================================
  // Registry Operations (Read)
  // ==========================================================================
  /**
   * Get agent record by spiritId
   */
  async getAgent(spiritId) {
    try {
      const result = await this.publicClient.readContract({
        address: this.addresses.SpiritRegistry,
        abi: SPIRIT_REGISTRY_ABI,
        functionName: "getAgent",
        args: [spiritId]
      });
      const agent = parseAgentRecord(result);
      if (agent.registryTokenId === 0n) {
        return null;
      }
      return agent;
    } catch {
      return null;
    }
  }
  /**
   * Get recipients and split configuration for an agent
   */
  async getRecipients(spiritId) {
    try {
      const result = await this.publicClient.readContract({
        address: this.addresses.SpiritRegistry,
        abi: SPIRIT_REGISTRY_ABI,
        functionName: "getRecipients",
        args: [spiritId]
      });
      return {
        trainer: result[0],
        platform: result[1],
        treasury: result[2],
        split: {
          artistBps: result[3].artistBps,
          agentBps: result[3].agentBps,
          platformBps: result[3].platformBps,
          protocolBps: result[3].protocolBps
        }
      };
    } catch {
      return null;
    }
  }
  /**
   * Resolve spiritId to spiritKey (keccak256 hash)
   */
  async resolveKey(spiritId) {
    const result = await this.publicClient.readContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: "resolveKey",
      args: [spiritId]
    });
    return result;
  }
  /**
   * Get the next available token ID
   */
  async getNextTokenId() {
    const result = await this.publicClient.readContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: "nextTokenId",
      args: []
    });
    return result;
  }
  /**
   * Check if an agent is registered
   */
  async isRegistered(spiritId) {
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
  async registerAgent(params) {
    this.requireWallet();
    const split = params.split || DEFAULT_SPLIT;
    const { request } = await this.publicClient.simulateContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: "registerAgent",
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
          protocolBps: split.protocolBps
        }
      ],
      account: this.account
    });
    const txHash = await this.walletClient.writeContract(request);
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });
    const logs = parseEventLogs({
      abi: SPIRIT_REGISTRY_ABI,
      logs: receipt.logs,
      eventName: "AgentRegistered"
    });
    const event = logs[0];
    if (!event) {
      throw new Error("AgentRegistered event not found in receipt");
    }
    return {
      spiritKey: event.args.spiritKey,
      registryTokenId: event.args.registryTokenId,
      txHash
    };
  }
  /**
   * Update agent metadata URI
   */
  async updateMetadata(spiritId, metadataURI) {
    this.requireWallet();
    const { request } = await this.publicClient.simulateContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: "updateMetadata",
      args: [spiritId, metadataURI],
      account: this.account
    });
    return this.walletClient.writeContract(request);
  }
  /**
   * Update agent status
   */
  async updateStatus(spiritId, status) {
    this.requireWallet();
    const { request } = await this.publicClient.simulateContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: "updateStatus",
      args: [spiritId, status],
      account: this.account
    });
    return this.walletClient.writeContract(request);
  }
  /**
   * Record a provenance event for an agent
   */
  async recordEvent(spiritId, eventType, contentHash) {
    this.requireWallet();
    const { request } = await this.publicClient.simulateContract({
      address: this.addresses.SpiritRegistry,
      abi: SPIRIT_REGISTRY_ABI,
      functionName: "recordEvent",
      args: [spiritId, eventType, contentHash],
      account: this.account
    });
    return this.walletClient.writeContract(request);
  }
  // ==========================================================================
  // Revenue Operations
  // ==========================================================================
  /**
   * Route ERC20 revenue through the 25/25/25/25 split
   *
   * Note: Caller must have approved the RoyaltyRouter to spend the currency
   */
  async routeRevenue(params) {
    this.requireWallet();
    const metadataHash = params.metadataHash || ZERO_HASH;
    const { request } = await this.publicClient.simulateContract({
      address: this.addresses.RoyaltyRouter,
      abi: ROYALTY_ROUTER_ABI,
      functionName: "routeRevenue",
      args: [params.spiritId, params.currency, params.amount, metadataHash],
      account: this.account
    });
    const txHash = await this.walletClient.writeContract(request);
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });
    return this.parseRevenueEvent(receipt.logs, txHash);
  }
  /**
   * Route native ETH revenue through the 25/25/25/25 split
   */
  async routeRevenueNative(params) {
    this.requireWallet();
    const metadataHash = params.metadataHash || ZERO_HASH;
    const { request } = await this.publicClient.simulateContract({
      address: this.addresses.RoyaltyRouter,
      abi: ROYALTY_ROUTER_ABI,
      functionName: "routeRevenueNative",
      args: [params.spiritId, metadataHash],
      value: params.amount,
      account: this.account
    });
    const txHash = await this.walletClient.writeContract(request);
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });
    return this.parseRevenueEvent(receipt.logs, txHash);
  }
  /**
   * Get treasury balance for an agent
   */
  async getTreasuryBalance(spiritId) {
    const agent = await this.getAgent(spiritId);
    if (!agent) {
      throw new Error(`Agent not found: ${spiritId}`);
    }
    const native = await this.publicClient.getBalance({
      address: agent.treasury
    });
    return { native };
  }
  // ==========================================================================
  // Utility Methods
  // ==========================================================================
  /**
   * Get the configured wallet address
   */
  getWalletAddress() {
    return this.account?.address || null;
  }
  /**
   * Check if wallet is configured for write operations
   */
  hasWallet() {
    return !!this.walletClient;
  }
  /**
   * Get the block explorer URL for a transaction
   */
  getExplorerUrl(txHash) {
    return `${CHAIN_CONFIG[this.chainId].blockExplorer}/tx/${txHash}`;
  }
  // ==========================================================================
  // Private Methods
  // ==========================================================================
  requireWallet() {
    if (!this.walletClient || !this.account) {
      throw new Error(
        "Wallet not configured. Provide privateKey in SpiritConfig for write operations."
      );
    }
  }
  parseRevenueEvent(logs, txHash) {
    const parsedLogs = parseEventLogs({
      abi: ROYALTY_ROUTER_ABI,
      logs,
      eventName: "RevenueRouted"
    });
    const event = parsedLogs[0];
    if (!event) {
      throw new Error("RevenueRouted event not found");
    }
    return {
      spiritKey: event.args.spiritKey,
      currency: event.args.currency,
      amount: event.args.amount,
      artistAmount: event.args.artistAmount,
      agentAmount: event.args.agentAmount,
      platformAmount: event.args.platformAmount,
      protocolAmount: event.args.protocolAmount,
      metadataHash: event.args.metadataHash,
      txHash,
      timestamp: Date.now()
    };
  }
};

export {
  CHAIN_CONFIG,
  TESTNET_ADDRESSES,
  MAINNET_ADDRESSES,
  getAddresses,
  SPIRIT_REGISTRY_ABI,
  ROYALTY_ROUTER_ABI,
  BPS_DENOMINATOR,
  DEFAULT_SPLIT_BPS,
  ZERO_ADDRESS,
  ZERO_HASH,
  AgentStatus,
  DEFAULT_SPLIT,
  SpiritClient
};
