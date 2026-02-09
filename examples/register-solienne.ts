/**
 * Register Solienne on Spirit Protocol (Base Mainnet)
 *
 * This script demonstrates:
 * 1. Creating an ERC-8004 compatible agent registration JSON
 * 2. Registering the agent via Spirit SDK (registerSpirit)
 * 3. Verifying the registration
 *
 * Run: npx ts-node examples/register-solienne.ts
 *
 * Requirements:
 * - PRIVATE_KEY environment variable (Base wallet with ETH)
 */

import { SpiritClient } from '../src/client';
import type { RegisterSpiritParams } from '../src/types';

// ============================================================================
// Configuration
// ============================================================================

const CHAIN_ID = 8453; // Base Mainnet

// Addresses (replace with actual addresses)
const KRISTI_WALLET = '0x1234567890123456789012345678901234567890' as const; // Kristi's wallet
const EDEN_PLATFORM = '0xEden000000000000000000000000000000000001' as const; // Eden platform

// ============================================================================
// Agent Registration JSON (ERC-8004 + Spirit Extensions)
// ============================================================================

/**
 * This JSON would be uploaded to IPFS before registration.
 * The URI would then be passed to the registerSpirit function.
 */
const _solenneRegistrationJSON = {
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
    "systemPromptHash": "ipfs://Qm.../solienne-system-prompt.md",
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
  }
};

// ============================================================================
// Registration Script
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('SOLIENNE REGISTRATION - Spirit Protocol (Base Mainnet)');
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
  console.log(`  Chain: Base Mainnet (${CHAIN_ID})`);
  console.log(`  Wallet: ${client.getWalletAddress()}`);
  console.log();

  // Step 1: Prepare registration params
  // In production, you would:
  // 1. Upload registration JSON to IPFS
  // 2. Use the IPFS URI as agentURI
  // For testing, we use a placeholder URL

  const agentURI = 'https://solienne.ai/api/agent-registration.json'; // Would be ipfs://Qm...

  const params: RegisterSpiritParams = {
    agentURI,
    artist: KRISTI_WALLET,          // Kristi (becomes NFT owner and initial treasury)
    platform: EDEN_PLATFORM,        // Eden
    treasuryOwners: [KRISTI_WALLET], // MVP: single owner
    treasuryThreshold: 1n,           // MVP: threshold of 1
  };

  console.log('Registration params:');
  console.log(`  agentURI: ${params.agentURI}`);
  console.log(`  artist: ${params.artist}`);
  console.log(`  platform: ${params.platform}`);
  console.log();

  // Step 2: Register
  console.log('Registering Spirit agent...');
  try {
    const result = await client.registerSpirit(params);

    console.log();
    console.log('SUCCESS! Solienne registered on Spirit Protocol');
    console.log('='.repeat(60));
    console.log(`  Agent ID: ${result.agentId}`);
    console.log(`  Tx Hash: ${result.txHash}`);
    console.log();
    console.log(`  Explorer: ${client.getExplorerUrl(result.txHash)}`);
    console.log('='.repeat(60));

    // Step 3: Verify registration
    console.log();
    console.log('Verifying registration...');
    const agent = await client.getAgent(result.agentId);
    if (agent) {
      console.log('Verified! Agent record:');
      console.log(JSON.stringify(agent, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
    }

  } catch (error) {
    console.error('Registration failed:', error);
    process.exit(1);
  }
}

// ============================================================================
// Run
// ============================================================================

main().catch(console.error);
