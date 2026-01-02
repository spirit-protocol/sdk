/**
 * Spirit Protocol SDK Constants
 *
 * Contract addresses, chain configuration, and ABIs
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
  // Layer 1: Minimal (spirit-onboarding-demo) - Deployed Jan 2, 2026
  SpiritRegistry: '0x4a0e642e9aec25c5856987e95c0410ae10e8de5e',
  RoyaltyRouter: '0x271bf11777ff7cbb9d938d2122d01493f6e9fc21',

  // Layer 2: Full (spirit-contracts-core)
  SpiritToken: '0xC3FD6880fC602d999f64C4a38dF51BEB6e1b654B',
  SpiritFactory: '0x53B9db3DCF3a69a0F62c44b19a6c37149b7fB93b',
  StakingPool: '0xBBC3C7dc9151FFDc97e04E84Ad0fE91aF91D9DeE',
  RewardController: '0xD91CCC7eeA5c0aD0f6e5E2c6E5c08bdF5C1cA1b0',

  // Protocol Treasury (for 25% protocol share)
  ProtocolTreasury: '0xe4951bEE6FA86B809655922f610FF74C0E33416C',
};

/** Mainnet (Base) contract addresses */
export const MAINNET_ADDRESSES: Record<string, Address> = {
  // TODO: Deploy to mainnet
  SpiritRegistry: '0x0000000000000000000000000000000000000000',
  RoyaltyRouter: '0x0000000000000000000000000000000000000000',
  SpiritToken: '0x0000000000000000000000000000000000000000',
  SpiritFactory: '0x0000000000000000000000000000000000000000',
  StakingPool: '0x0000000000000000000000000000000000000000',
  RewardController: '0x0000000000000000000000000000000000000000',
  ProtocolTreasury: '0x0000000000000000000000000000000000000000',
};

/** Get contract addresses for a specific chain */
export function getAddresses(chainId: SpiritChainId): Record<string, Address> {
  return chainId === 8453 ? MAINNET_ADDRESSES : TESTNET_ADDRESSES;
}

// ============================================================================
// Contract ABIs (minimal, for SDK operations)
// ============================================================================

/** SpiritRegistry ABI (read/write operations) */
export const SPIRIT_REGISTRY_ABI = [
  // Read functions
  {
    type: 'function',
    name: 'getAgent',
    inputs: [{ name: 'spiritId', type: 'string' }],
    outputs: [
      {
        name: 'record',
        type: 'tuple',
        components: [
          { name: 'spiritId', type: 'string' },
          { name: 'registryTokenId', type: 'uint256' },
          { name: 'trainer', type: 'address' },
          { name: 'platform', type: 'address' },
          { name: 'treasury', type: 'address' },
          { name: 'metadataURI', type: 'string' },
          {
            name: 'split',
            type: 'tuple',
            components: [
              { name: 'artistBps', type: 'uint16' },
              { name: 'agentBps', type: 'uint16' },
              { name: 'platformBps', type: 'uint16' },
              { name: 'protocolBps', type: 'uint16' },
            ],
          },
          {
            name: 'economics',
            type: 'tuple',
            components: [
              { name: 'childToken', type: 'address' },
              { name: 'stakingPool', type: 'address' },
              { name: 'router', type: 'address' },
            ],
          },
          { name: 'status', type: 'uint8' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRecipients',
    inputs: [{ name: 'spiritId', type: 'string' }],
    outputs: [
      { name: 'trainer', type: 'address' },
      { name: 'platform', type: 'address' },
      { name: 'treasury', type: 'address' },
      {
        name: 'split',
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
    name: 'resolveKey',
    inputs: [{ name: 'spiritId', type: 'string' }],
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'nextTokenId',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  // Write functions
  {
    type: 'function',
    name: 'registerAgent',
    inputs: [
      { name: 'spiritId', type: 'string' },
      { name: 'trainer', type: 'address' },
      { name: 'platform', type: 'address' },
      { name: 'treasury', type: 'address' },
      { name: 'metadataURI', type: 'string' },
      {
        name: 'split',
        type: 'tuple',
        components: [
          { name: 'artistBps', type: 'uint16' },
          { name: 'agentBps', type: 'uint16' },
          { name: 'platformBps', type: 'uint16' },
          { name: 'protocolBps', type: 'uint16' },
        ],
      },
    ],
    outputs: [
      { name: 'spiritKey', type: 'bytes32' },
      { name: 'registryTokenId', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateMetadata',
    inputs: [
      { name: 'spiritId', type: 'string' },
      { name: 'metadataURI', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateStatus',
    inputs: [
      { name: 'spiritId', type: 'string' },
      { name: 'status', type: 'uint8' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'recordEvent',
    inputs: [
      { name: 'spiritId', type: 'string' },
      { name: 'eventType', type: 'bytes32' },
      { name: 'contentHash', type: 'bytes32' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  // Events
  {
    type: 'event',
    name: 'AgentRegistered',
    inputs: [
      { name: 'spiritKey', type: 'bytes32', indexed: true },
      { name: 'spiritId', type: 'string', indexed: false },
      { name: 'registryTokenId', type: 'uint256', indexed: false },
      { name: 'trainer', type: 'address', indexed: false },
      { name: 'platform', type: 'address', indexed: false },
      { name: 'treasury', type: 'address', indexed: false },
      {
        name: 'split',
        type: 'tuple',
        indexed: false,
        components: [
          { name: 'artistBps', type: 'uint16' },
          { name: 'agentBps', type: 'uint16' },
          { name: 'platformBps', type: 'uint16' },
          { name: 'protocolBps', type: 'uint16' },
        ],
      },
      { name: 'metadataURI', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'StatusUpdated',
    inputs: [
      { name: 'spiritKey', type: 'bytes32', indexed: true },
      { name: 'status', type: 'uint8', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ProvenanceRecorded',
    inputs: [
      { name: 'spiritKey', type: 'bytes32', indexed: true },
      { name: 'eventType', type: 'bytes32', indexed: true },
      { name: 'contentHash', type: 'bytes32', indexed: false },
    ],
  },
] as const;

/** RoyaltyRouter ABI (read/write operations) */
export const ROYALTY_ROUTER_ABI = [
  // Read functions
  {
    type: 'function',
    name: 'registry',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
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
    name: 'acceptedCurrency',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  // Write functions
  {
    type: 'function',
    name: 'routeRevenue',
    inputs: [
      { name: 'spiritId', type: 'string' },
      { name: 'currency', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'metadataHash', type: 'bytes32' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'routeRevenueNative',
    inputs: [
      { name: 'spiritId', type: 'string' },
      { name: 'metadataHash', type: 'bytes32' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  // Events
  {
    type: 'event',
    name: 'RevenueRouted',
    inputs: [
      { name: 'spiritKey', type: 'bytes32', indexed: true },
      { name: 'currency', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'artistAmount', type: 'uint256', indexed: false },
      { name: 'agentAmount', type: 'uint256', indexed: false },
      { name: 'platformAmount', type: 'uint256', indexed: false },
      { name: 'protocolAmount', type: 'uint256', indexed: false },
      { name: 'metadataHash', type: 'bytes32', indexed: false },
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
