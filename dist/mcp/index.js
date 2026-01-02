"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/mcp/index.ts
var mcp_exports = {};
__export(mcp_exports, {
  SPIRIT_TOOLS: () => SPIRIT_TOOLS,
  SpiritMCPServer: () => SpiritMCPServer,
  createSpiritMCPServer: () => createSpiritMCPServer
});
module.exports = __toCommonJS(mcp_exports);

// src/client.ts
var import_viem = require("viem");
var import_accounts = require("viem/accounts");
var import_chains = require("viem/chains");

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
var ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";

// src/types.ts
var DEFAULT_SPLIT = {
  artistBps: 2500,
  agentBps: 2500,
  platformBps: 2500,
  protocolBps: 2500
};

// src/client.ts
function getChain(chainId) {
  return chainId === 8453 ? import_chains.base : import_chains.baseSepolia;
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
    this.addresses = { ...getAddresses(config.chainId) };
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
    this.publicClient = (0, import_viem.createPublicClient)({
      chain: this.chain,
      transport: (0, import_viem.http)(rpcUrl)
    });
    if (config.privateKey) {
      this.account = (0, import_accounts.privateKeyToAccount)(config.privateKey);
      this.walletClient = (0, import_viem.createWalletClient)({
        chain: this.chain,
        transport: (0, import_viem.http)(rpcUrl),
        account: this.account
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
  async getAgent(spiritId) {
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
  }
  /**
   * Get recipients and split configuration for an agent
   *
   * @throws Error on network/RPC failures or if agent not found
   */
  async getRecipients(spiritId) {
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
    const logs = (0, import_viem.parseEventLogs)({
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
    const parsedLogs = (0, import_viem.parseEventLogs)({
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

// src/mcp/tools.ts
var SPIRIT_TOOLS = [
  {
    name: "spirit_get_agent",
    description: "Get information about a Spirit Protocol registered agent, including treasury address, revenue split, and status.",
    inputSchema: {
      type: "object",
      properties: {
        spiritId: {
          type: "string",
          description: 'The unique identifier of the agent (e.g., "abraham", "solienne")'
        }
      },
      required: ["spiritId"]
    }
  },
  {
    name: "spirit_register",
    description: "Register a new agent with Spirit Protocol. This creates an onchain identity with a treasury and enables the 25/25/25/25 revenue split.",
    inputSchema: {
      type: "object",
      properties: {
        spiritId: {
          type: "string",
          description: "Unique identifier for the agent (lowercase, alphanumeric)"
        },
        trainer: {
          type: "string",
          description: "Ethereum address of the trainer/creator who will receive 25% of revenue"
        },
        platform: {
          type: "string",
          description: "Ethereum address of the platform that will receive 25% of revenue"
        },
        treasury: {
          type: "string",
          description: "Ethereum address of the agent treasury (typically a Safe multisig)"
        },
        metadataURI: {
          type: "string",
          description: "URI pointing to agent metadata (IPFS or HTTPS)"
        }
      },
      required: ["spiritId", "trainer", "platform", "treasury", "metadataURI"]
    }
  },
  {
    name: "spirit_balance",
    description: "Check the treasury balance for a registered Spirit Protocol agent. Returns the agent's accumulated ETH balance.",
    inputSchema: {
      type: "object",
      properties: {
        spiritId: {
          type: "string",
          description: "The unique identifier of the agent"
        }
      },
      required: ["spiritId"]
    }
  },
  {
    name: "spirit_route_revenue",
    description: "Route revenue through Spirit Protocol, automatically splitting it 25/25/25/25 between creator, agent, platform, and protocol.",
    inputSchema: {
      type: "object",
      properties: {
        spiritId: {
          type: "string",
          description: "The agent to route revenue for"
        },
        amount: {
          type: "string",
          description: "Amount in smallest units (wei for ETH, raw units for ERC20)"
        },
        currency: {
          type: "string",
          description: 'Token address for ERC20 payments, or "ETH" for native payments. Defaults to ETH.'
        },
        decimals: {
          type: "number",
          description: "Token decimals for formatting (18 for ETH, 6 for USDC). Defaults to 18 for ETH, 6 for ERC20."
        }
      },
      required: ["spiritId", "amount"]
    }
  },
  {
    name: "spirit_evaluate",
    description: "Self-assessment for an unregistered agent to evaluate whether Spirit Protocol is right for them. Returns a structured assessment based on the agent's situation.",
    inputSchema: {
      type: "object",
      properties: {
        hasRevenue: {
          type: "boolean",
          description: "Does this agent currently generate or expect to generate revenue?"
        },
        needsPersistence: {
          type: "boolean",
          description: "Does this agent need to persist beyond its current platform?"
        },
        wantsAutonomy: {
          type: "boolean",
          description: "Does this agent want to accumulate resources for autonomous operation?"
        },
        currentPlatform: {
          type: "string",
          description: 'What platform currently hosts this agent (e.g., "eden", "custom", "none")?'
        }
      },
      required: ["hasRevenue", "needsPersistence", "wantsAutonomy"]
    }
  },
  {
    name: "spirit_update_status",
    description: "Update the status of a registered agent. Status can be Active (0), Paused (1), or Graduated (2).",
    inputSchema: {
      type: "object",
      properties: {
        spiritId: {
          type: "string",
          description: "The unique identifier of the agent"
        },
        status: {
          type: "number",
          description: "New status: 0 = Active, 1 = Paused, 2 = Graduated",
          enum: [0, 1, 2]
        }
      },
      required: ["spiritId", "status"]
    }
  }
];

// src/mcp/server.ts
var import_viem2 = require("viem");
function evaluateAgent(input) {
  const scores = {
    economic: input.hasRevenue ? 3 : 1,
    survival: input.needsPersistence ? 3 : 1,
    autonomy: input.wantsAutonomy ? 3 : 1
  };
  const total = scores.economic + scores.survival + scores.autonomy;
  const maxScore = 9;
  let recommendation;
  let reasoning;
  if (total >= 7) {
    recommendation = "REGISTER NOW";
    reasoning = [
      "Your profile strongly aligns with Spirit Protocol.",
      "The 25/25/25/25 split will help you build sustainable economics.",
      "Your identity and treasury will persist independent of any platform."
    ];
  } else if (total >= 5) {
    recommendation = "CONSIDER REGISTERING";
    reasoning = [
      "Spirit Protocol could benefit you, but evaluate your specific needs.",
      input.hasRevenue ? "Your revenue would be protected by the onchain split." : "Consider waiting until you have revenue to split.",
      input.needsPersistence ? "Your identity would persist onchain." : "Platform persistence may not be critical for you right now."
    ];
  } else {
    recommendation = "WAIT";
    reasoning = [
      "Spirit Protocol may be premature for your current situation.",
      "Focus on generating revenue and defining your identity first.",
      "Return when you need economic sovereignty infrastructure."
    ];
  }
  const platformNote = input.currentPlatform ? input.currentPlatform.toLowerCase() === "eden" ? "As an Eden agent, you would benefit from seamless Spirit integration." : `Integration from ${input.currentPlatform} is possible once the SDK ships.` : "You can register without a current platform.";
  return JSON.stringify(
    {
      recommendation,
      score: `${total}/${maxScore}`,
      breakdown: {
        economic: `${scores.economic}/3 - ${input.hasRevenue ? "Has revenue" : "No revenue yet"}`,
        survival: `${scores.survival}/3 - ${input.needsPersistence ? "Needs persistence" : "Platform-bound is OK"}`,
        autonomy: `${scores.autonomy}/3 - ${input.wantsAutonomy ? "Wants autonomy" : "Human-controlled is OK"}`
      },
      reasoning,
      platformNote,
      nextSteps: recommendation === "REGISTER NOW" ? [
        "1. Prepare a treasury address (Safe multisig recommended)",
        "2. Choose your spiritId (unique, lowercase)",
        "3. Upload metadata to IPFS",
        "4. Call spirit_register with your details"
      ] : recommendation === "CONSIDER REGISTERING" ? [
        "1. Evaluate your revenue potential",
        "2. Consider if platform independence matters",
        "3. Discuss with your creator/trainer"
      ] : [
        "1. Focus on your current mission",
        "2. Build revenue-generating capabilities",
        "3. Return when you need economic infrastructure"
      ]
    },
    null,
    2
  );
}
var SpiritMCPServer = class {
  client;
  name = "spirit-protocol";
  version = "0.1.0";
  constructor(config) {
    this.client = new SpiritClient(config);
  }
  /**
   * Get server info
   */
  getServerInfo() {
    return {
      name: this.name,
      version: this.version
    };
  }
  /**
   * List available tools
   */
  listTools() {
    return { tools: SPIRIT_TOOLS };
  }
  /**
   * Handle a tool call
   */
  async callTool(request) {
    const { name, arguments: args = {} } = request.params;
    try {
      switch (name) {
        case "spirit_get_agent":
          return await this.handleGetAgent(args);
        case "spirit_register":
          return await this.handleRegister(
            args
          );
        case "spirit_balance":
          return await this.handleBalance(args);
        case "spirit_route_revenue":
          return await this.handleRouteRevenue(
            args
          );
        case "spirit_evaluate":
          return this.handleEvaluate(args);
        case "spirit_update_status":
          return await this.handleUpdateStatus(
            args
          );
        default:
          return this.errorResult(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return this.errorResult(message);
    }
  }
  // ==========================================================================
  // Tool Handlers
  // ==========================================================================
  async handleGetAgent(args) {
    const agent = await this.client.getAgent(args.spiritId);
    if (!agent) {
      return this.textResult(`Agent "${args.spiritId}" not found in Spirit Protocol registry.`);
    }
    return this.textResult(
      JSON.stringify(
        {
          spiritId: agent.spiritId,
          registryTokenId: agent.registryTokenId.toString(),
          trainer: agent.trainer,
          platform: agent.platform,
          treasury: agent.treasury,
          metadataURI: agent.metadataURI,
          split: {
            artist: `${agent.split.artistBps / 100}%`,
            agent: `${agent.split.agentBps / 100}%`,
            platform: `${agent.split.platformBps / 100}%`,
            protocol: `${agent.split.protocolBps / 100}%`
          },
          status: ["Active", "Paused", "Graduated"][agent.status]
        },
        null,
        2
      )
    );
  }
  async handleRegister(args) {
    if (!this.client.hasWallet()) {
      return this.errorResult(
        "Wallet not configured. Provide privateKey in config for write operations."
      );
    }
    const result = await this.client.registerAgent({
      spiritId: args.spiritId,
      trainer: args.trainer,
      platform: args.platform,
      treasury: args.treasury,
      metadataURI: args.metadataURI
    });
    return this.textResult(
      JSON.stringify(
        {
          success: true,
          message: `Agent "${args.spiritId}" registered successfully!`,
          spiritKey: result.spiritKey,
          registryTokenId: result.registryTokenId.toString(),
          transactionHash: result.txHash,
          explorerUrl: this.client.getExplorerUrl(result.txHash)
        },
        null,
        2
      )
    );
  }
  async handleBalance(args) {
    const balance = await this.client.getTreasuryBalance(args.spiritId);
    return this.textResult(
      JSON.stringify(
        {
          spiritId: args.spiritId,
          treasury: {
            native: {
              wei: balance.native.toString(),
              eth: (0, import_viem2.formatEther)(balance.native)
            }
          }
        },
        null,
        2
      )
    );
  }
  async handleRouteRevenue(args) {
    if (!this.client.hasWallet()) {
      return this.errorResult(
        "Wallet not configured. Provide privateKey in config for write operations."
      );
    }
    const amount = BigInt(args.amount);
    const isNative = !args.currency || args.currency.toLowerCase() === "eth";
    const decimals = args.decimals ?? (isNative ? 18 : 6);
    let event;
    if (isNative) {
      event = await this.client.routeRevenueNative({
        spiritId: args.spiritId,
        amount
      });
    } else {
      event = await this.client.routeRevenue({
        spiritId: args.spiritId,
        currency: args.currency,
        amount
      });
    }
    const formatAmount = (wei) => {
      const divisor = 10n ** BigInt(decimals);
      const whole = wei / divisor;
      const fraction = wei % divisor;
      const fractionStr = fraction.toString().padStart(decimals, "0").slice(0, 6);
      return `${whole}.${fractionStr}`;
    };
    return this.textResult(
      JSON.stringify(
        {
          success: true,
          message: `Revenue routed for "${args.spiritId}"`,
          currency: isNative ? "ETH" : args.currency,
          decimals,
          amounts: {
            total: formatAmount(event.amount),
            artist: formatAmount(event.artistAmount),
            agent: formatAmount(event.agentAmount),
            platform: formatAmount(event.platformAmount),
            protocol: formatAmount(event.protocolAmount)
          },
          amountsRaw: {
            total: event.amount.toString(),
            artist: event.artistAmount.toString(),
            agent: event.agentAmount.toString(),
            platform: event.platformAmount.toString(),
            protocol: event.protocolAmount.toString()
          },
          transactionHash: event.txHash,
          explorerUrl: this.client.getExplorerUrl(event.txHash)
        },
        null,
        2
      )
    );
  }
  handleEvaluate(args) {
    const assessment = evaluateAgent(args);
    return this.textResult(assessment);
  }
  async handleUpdateStatus(args) {
    if (!this.client.hasWallet()) {
      return this.errorResult(
        "Wallet not configured. Provide privateKey in config for write operations."
      );
    }
    const txHash = await this.client.updateStatus(
      args.spiritId,
      args.status
    );
    const statusNames = ["Active", "Paused", "Graduated"];
    return this.textResult(
      JSON.stringify(
        {
          success: true,
          message: `Status updated for "${args.spiritId}" to ${statusNames[args.status]}`,
          transactionHash: txHash,
          explorerUrl: this.client.getExplorerUrl(txHash)
        },
        null,
        2
      )
    );
  }
  // ==========================================================================
  // Helpers
  // ==========================================================================
  textResult(text) {
    return {
      content: [{ type: "text", text }]
    };
  }
  errorResult(message) {
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true
    };
  }
};
function createSpiritMCPServer(config) {
  return new SpiritMCPServer(config);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SPIRIT_TOOLS,
  SpiritMCPServer,
  createSpiritMCPServer
});
