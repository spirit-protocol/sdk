/**
 * Spirit Protocol SDK Constants
 *
 * Contract addresses, chain configuration, and ABIs
 * Matches mainnet SpiritRegistry deployed Feb 3, 2026 on Base (chainId 8453)
 */

import type { Address, SpiritChainId } from './types';

// ============================================================================
// Chain Configuration
// ============================================================================

export const CHAIN_CONFIG = {
  /** Base Mainnet */
  8453: {
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  /** Base Sepolia (Testnet) */
  84532: {
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
} as const;

// ============================================================================
// Contract Addresses
// ============================================================================

/** Testnet (Base Sepolia) contract addresses */
export const TESTNET_ADDRESSES: Record<string, Address> = {
  // SpiritRegistry (spirit-contracts-core) — Base Sepolia
  SpiritRegistry: '0x98f61d33bFD87a2e73aEf4a1bf1c8E534Ad0d5Aa',

  // Practice contracts (pending Sepolia deploy)
  DailyPractice: '0x0000000000000000000000000000000000000000',
  PracticeCuration: '0x0000000000000000000000000000000000000000',

  // Not yet deployed on testnet
  SpiritToken: '0x0000000000000000000000000000000000000000',
  SpiritFactory: '0x0000000000000000000000000000000000000000',
  StakingPool: '0x0000000000000000000000000000000000000000',
  RewardController: '0x0000000000000000000000000000000000000000',

  // Protocol Treasury
  ProtocolTreasury: '0xe4951bEE6FA86B809655922f610FF74C0E33416C',
};

/** Mainnet (Base) contract addresses */
export const MAINNET_ADDRESSES: Record<string, Address> = {
  // SpiritRegistry deployed Feb 3, 2026 — Base Mainnet (chainId 8453)
  SpiritRegistry: '0xF2709ceF1Cf4893ed78D3220864428b32b12dFb9',
  // Practice contracts (pending mainnet deploy)
  DailyPractice: '0x0000000000000000000000000000000000000000',
  PracticeCuration: '0x0000000000000000000000000000000000000000',

  SpiritToken: '0x0000000000000000000000000000000000000000',   // TODO: TGE
  SpiritFactory: '0x0000000000000000000000000000000000000000', // TODO: TGE
  StakingPool: '0x0000000000000000000000000000000000000000',   // TODO: TGE
  RewardController: '0x0000000000000000000000000000000000000000', // TODO: TGE
  ProtocolTreasury: '0x5D6D8518A1d564c85ea5c41d1dc0deca70F2301C',
};

/** Get contract addresses for a specific chain */
export function getAddresses(chainId: SpiritChainId): Record<string, Address> {
  return chainId === 8453 ? MAINNET_ADDRESSES : TESTNET_ADDRESSES;
}

// ============================================================================
// Contract ABIs (minimal, for SDK operations)
// ============================================================================

/**
 * SpiritRegistry ABI — matches mainnet contract at 0xF2709ceF1Cf4893ed78D3220864428b32b12dFb9
 *
 * SpiritRegistry extends ERC8004IdentityRegistry with treasury, revenue routing,
 * and token creation primitives. All lookups use uint256 agentId (not string spiritId).
 *
 * Revenue routing is built into the registry (no separate RoyaltyRouter contract).
 */
export const SPIRIT_REGISTRY_ABI = [
  // ==========================================================================
  // Read functions (SpiritRegistry)
  // ==========================================================================
  {
    type: 'function',
    name: 'getSpiritConfig',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'treasury', type: 'address' },
          { name: 'childToken', type: 'address' },
          { name: 'stakingPool', type: 'address' },
          { name: 'lpPosition', type: 'address' },
          { name: 'artist', type: 'address' },
          { name: 'platform', type: 'address' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'hasToken', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRevenueConfig',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'artistBps', type: 'uint16' },
          { name: 'agentBps', type: 'uint16' },
          { name: 'platformBps', type: 'uint16' },
          { name: 'protocolBps', type: 'uint16' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTreasury',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getChildToken',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getStakingPool',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasSpiritAttached',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getExternalAgent',
    inputs: [{ name: 'spiritId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'registry', type: 'address' },
          { name: 'agentId', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'protocolTreasury',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'defaultRevenueConfig',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'artistBps', type: 'uint16' },
          { name: 'agentBps', type: 'uint16' },
          { name: 'platformBps', type: 'uint16' },
          { name: 'protocolBps', type: 'uint16' },
        ],
      },
    ],
    stateMutability: 'pure',
  },

  // ==========================================================================
  // Read functions (ERC8004IdentityRegistry)
  // ==========================================================================
  {
    type: 'function',
    name: 'ownerOf',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'agentURI',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'agentWalletOf',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'exists',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getMetadata',
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'key', type: 'string' },
    ],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },

  // ==========================================================================
  // Write functions (SpiritRegistry)
  // ==========================================================================
  {
    type: 'function',
    name: 'registerSpirit',
    inputs: [
      { name: 'agentURI_', type: 'string' },
      { name: 'artist', type: 'address' },
      { name: 'platform', type: 'address' },
      { name: 'treasuryOwners', type: 'address[]' },
      { name: 'treasuryThreshold', type: 'uint256' },
    ],
    outputs: [{ name: 'agentId', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'attachSpirit',
    inputs: [
      { name: 'externalRegistry', type: 'address' },
      { name: 'externalAgentId', type: 'uint256' },
      { name: 'artist', type: 'address' },
      { name: 'platform', type: 'address' },
    ],
    outputs: [{ name: 'spiritId', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'routeRevenue',
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'updateTreasury',
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'newTreasury', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setRevenueConfig',
    inputs: [
      { name: 'agentId', type: 'uint256' },
      {
        name: 'config',
        type: 'tuple',
        components: [
          { name: 'artistBps', type: 'uint16' },
          { name: 'agentBps', type: 'uint16' },
          { name: 'platformBps', type: 'uint16' },
          { name: 'protocolBps', type: 'uint16' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // ==========================================================================
  // Write functions (ERC8004IdentityRegistry)
  // ==========================================================================
  {
    type: 'function',
    name: 'setAgentURI',
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'newURI', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setMetadata',
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // ==========================================================================
  // Events (SpiritRegistry)
  // ==========================================================================
  {
    type: 'event',
    name: 'SpiritRegistered',
    inputs: [
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'treasury', type: 'address', indexed: true },
      { name: 'artist', type: 'address', indexed: true },
      { name: 'platform', type: 'address', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'SpiritAttached',
    inputs: [
      { name: 'spiritId', type: 'uint256', indexed: true },
      { name: 'externalRegistry', type: 'address', indexed: true },
      { name: 'externalAgentId', type: 'uint256', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'RevenueRouted',
    inputs: [
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'token', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'artistAmount', type: 'uint256', indexed: false },
      { name: 'agentAmount', type: 'uint256', indexed: false },
      { name: 'platformAmount', type: 'uint256', indexed: false },
      { name: 'protocolAmount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'TreasuryUpdated',
    inputs: [
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'oldTreasury', type: 'address', indexed: false },
      { name: 'newTreasury', type: 'address', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ChildTokenCreated',
    inputs: [
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'childToken', type: 'address', indexed: true },
      { name: 'stakingPool', type: 'address', indexed: true },
      { name: 'lpPosition', type: 'address', indexed: false },
    ],
  },

  // ==========================================================================
  // Events (ERC8004IdentityRegistry)
  // ==========================================================================
  {
    type: 'event',
    name: 'Registered',
    inputs: [
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'agentURI', type: 'string', indexed: false },
      { name: 'owner', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'URIUpdated',
    inputs: [
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'newURI', type: 'string', indexed: false },
      { name: 'updatedBy', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'AgentWalletSet',
    inputs: [
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'oldWallet', type: 'address', indexed: true },
      { name: 'newWallet', type: 'address', indexed: true },
    ],
  },
] as const;

// ============================================================================
// DailyPractice ABI
// ============================================================================

/**
 * DailyPractice ABI — covenant contract for daily creative output
 *
 * Each registered agent submits one creative artifact per UTC day.
 * Streak tracking (current, longest, total) is maintained on-chain.
 */
export const DAILY_PRACTICE_ABI = [
  // Read functions
  {
    type: 'function',
    name: 'getStats',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'totalSubmissions', type: 'uint256' },
          { name: 'currentStreak', type: 'uint256' },
          { name: 'longestStreak', type: 'uint256' },
          { name: 'firstPracticeDay', type: 'uint256' },
          { name: 'lastPracticeDay', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSubmission',
    inputs: [{ name: 'index', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'agentId', type: 'uint256' },
          { name: 'contentURI', type: 'string' },
          { name: 'contentType', type: 'string' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'dayNumber', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasSubmittedToday',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'currentDay',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalSubmissions',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getDailySubmissions',
    inputs: [{ name: 'dayNumber', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'registry',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  // Write functions
  {
    type: 'function',
    name: 'submitPractice',
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'contentURI', type: 'string' },
      { name: 'contentType', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  // Events
  {
    type: 'event',
    name: 'PracticeSubmitted',
    inputs: [
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'dayNumber', type: 'uint256', indexed: true },
      { name: 'submissionIndex', type: 'uint256', indexed: false },
      { name: 'contentURI', type: 'string', indexed: false },
      { name: 'contentType', type: 'string', indexed: false },
      { name: 'currentStreak', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'StreakBroken',
    inputs: [
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'previousStreak', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'StreakRecord',
    inputs: [
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'newRecord', type: 'uint256', indexed: false },
    ],
  },
] as const;

// ============================================================================
// Protocol Constants
// ============================================================================

/** Basis points denominator (10000 = 100%) */
export const BPS_DENOMINATOR = 10000;

/** Default revenue split (25% each) */
export const DEFAULT_SPLIT_BPS = {
  artist: 2500,
  agent: 2500,
  platform: 2500,
  protocol: 2500,
} as const;

/** Zero address constant */
export const ZERO_ADDRESS: Address = '0x0000000000000000000000000000000000000000';

/** Zero hash constant */
export const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000' as const;
