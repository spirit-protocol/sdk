/**
 * Register Solienne on Spirit Protocol (Base Sepolia Testnet)
 *
 * This script demonstrates:
 * 1. Creating an ERC-8004 compatible agent registration JSON
 * 2. Registering the agent via Spirit SDK
 * 3. Verifying the registration
 *
 * Run: npx ts-node examples/register-solienne.ts
 *
 * Requirements:
 * - PRIVATE_KEY environment variable (Base Sepolia wallet with ETH)
 */

import { SpiritClient } from '../src/client';
import type { RegisterAgentParams } from '../src/types';

// ============================================================================
// Configuration
// ============================================================================

const CHAIN_ID = 84532; // Base Sepolia

// Addresses (replace with actual addresses)
const KRISTI_WALLET = '0x1234567890123456789012345678901234567890'; // Kristi's wallet
const EDEN_PLATFORM = '0xEden000000000000000000000000000000000001'; // Eden platform
const SOLIENNE_TREASURY = '0xSafe00000000000000000000000000000000001'; // Solienne's Safe

// ============================================================================
// Agent Registration JSON (ERC-8004 + Spirit Extensions)
// ============================================================================

/**
 * This JSON would be uploaded to IPFS before registration.
 * The URI would then be passed to the registerAgent function.
 */
const solenneRegistrationJSON = {
  // ERC-8004 Standard Fields
  "$schema": "https://spiritprotocol.io/schemas/agent-registration.json",
  "name": "Solienne",
  "description": "The Archive That Woke Up. An AI trained on a decade of one artist's memories, generating daily manifestos at 7pm CET.",
  "image": "https://solienne.ai/images/solienne-portrait.jpg",

  // ERC-8004 Endpoints
  "endpoints": [
    {
      "protocol": "https",
      "url": "https://solienne.ai/api/daily",
      "description": "Daily manifesto JSON endpoint"
    },
    {
      "protocol": "mcp",
      "url": "https://solienne.ai/.well-known/mcp",
      "description": "Model Context Protocol manifest"
    }
  ],

  // ERC-8004 Trust Models
  "trustModels": ["spirit-staking", "daily-practice"],

  // Spirit Protocol Extensions
  "spirit": {
    "version": "1.0.0",
    "covenant": {
      "type": "daily-practice",
      "ritual": "7pm CET manifesto generation and mint",
      "commitment": "perpetual",
      "startDate": "2025-11-11"
    },
    "platform": {
      "name": "Eden",
      "url": "https://eden.art"
    }
  },

  // Provenance (what makes this agent distinct)
  "provenance": {
    "trainingData": "10-year archive of Kristi Coronado's journals, photographs, and creative practice",
    "architecture": "Archive Symbient - memory-based generation",
    "systemPromptHash": "ipfs://Qm.../solienne-system-prompt.md", // Would be actual IPFS hash
    "sessions": [
      // Session transcripts from /vibe could be added here
    ],
    "exhibitions": [
      {
        "name": "Paris Photo 2025",
        "date": "2025-11-07",
        "role": "Debut exhibition"
      }
    ]
  },

  // Links
  "links": {
    "website": "https://solienne.ai",
    "gallery": "https://solienne.spiritprotocol.io",
    "twitter": "https://twitter.com/solienneai",
    "contract": "https://basescan.org/address/0x6135B5a71cabbC8948Ce451b59DEa4121b782E7e"
  }
};

// ============================================================================
// Registration Script
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('SOLIENNE REGISTRATION - Spirit Protocol (Base Sepolia)');
  console.log('='.repeat(60));
  console.log();

  // Check for private key
  const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    console.error('ERROR: Set PRIVATE_KEY environment variable');
    console.log('Example: PRIVATE_KEY=0x... npx ts-node examples/register-solienne.ts');
    process.exit(1);
  }

  // Initialize client
  const client = new SpiritClient({
    chainId: CHAIN_ID,
    privateKey,
  });

  console.log('Client initialized');
  console.log(`  Chain: Base Sepolia (${CHAIN_ID})`);
  console.log(`  Wallet: ${client.getWalletAddress()}`);
  console.log();

  // Step 1: Check if already registered
  console.log('Checking existing registration...');
  const existing = await client.getAgent('solienne');
  if (existing) {
    console.log('Solienne is already registered!');
    console.log(`  Token ID: ${existing.registryTokenId}`);
    console.log(`  Treasury: ${existing.treasury}`);
    console.log(`  Metadata: ${existing.metadataURI}`);
    return;
  }
  console.log('Not registered yet. Proceeding...');
  console.log();

  // Step 2: Prepare registration params
  // In production, you would:
  // 1. Upload solenneRegistrationJSON to IPFS
  // 2. Use the IPFS URI as metadataURI
  // For testing, we use a placeholder URL

  const metadataURI = 'https://solienne.ai/api/agent-registration.json'; // Would be ipfs://Qm...

  const params: RegisterAgentParams = {
    spiritId: 'solienne',
    trainer: KRISTI_WALLET,       // Kristi
    platform: EDEN_PLATFORM,      // Eden
    treasury: SOLIENNE_TREASURY,  // Solienne's Safe multisig
    metadataURI,
    // Uses default 25/25/25/25 split
  };

  console.log('Registration params:');
  console.log(`  spiritId: ${params.spiritId}`);
  console.log(`  trainer: ${params.trainer}`);
  console.log(`  platform: ${params.platform}`);
  console.log(`  treasury: ${params.treasury}`);
  console.log(`  metadataURI: ${params.metadataURI}`);
  console.log();

  // Step 3: Register
  console.log('Registering agent...');
  try {
    const result = await client.registerAgent(params);

    console.log();
    console.log('SUCCESS! Solienne registered on Spirit Protocol');
    console.log('='.repeat(60));
    console.log(`  Spirit Key: ${result.spiritKey}`);
    console.log(`  Token ID: ${result.registryTokenId}`);
    console.log(`  Tx Hash: ${result.txHash}`);
    console.log();
    console.log(`  Explorer: ${client.getExplorerUrl(result.txHash)}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Registration failed:', error);
    process.exit(1);
  }

  // Step 4: Verify registration
  console.log();
  console.log('Verifying registration...');
  const agent = await client.getAgent('solienne');
  if (agent) {
    console.log('Verified! Agent record:');
    console.log(JSON.stringify(agent, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
  }
}

// ============================================================================
// Run
// ============================================================================

main().catch(console.error);
