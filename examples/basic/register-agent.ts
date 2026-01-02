/**
 * Basic Agent Registration Example
 *
 * Demonstrates how to register a new agent with Spirit Protocol.
 *
 * Prerequisites:
 * - npm install @spirit-protocol/sdk
 * - PRIVATE_KEY environment variable
 */

import {
  SpiritClient,
  DEFAULT_SPLIT,
  type Address,
} from '@spirit-protocol/sdk';

async function registerAgent() {
  // Initialize client with private key for write operations
  const client = new SpiritClient({
    chainId: 84532, // Base Sepolia testnet
    privateKey: process.env.PRIVATE_KEY as `0x${string}`,
  });

  console.log('🔗 Connected to Base Sepolia');
  console.log(`📍 Wallet: ${client.getWalletAddress()}`);

  // Define your agent
  const agentParams = {
    spiritId: 'my-first-agent', // Unique identifier
    trainer: client.getWalletAddress() as Address, // Your address as trainer
    platform: '0x0000000000000000000000000000000000000000' as Address, // Platform address
    treasury: client.getWalletAddress() as Address, // Treasury (use Safe in production)
    metadataURI: 'ipfs://QmYourMetadataHash', // Agent metadata
    split: DEFAULT_SPLIT, // 25/25/25/25 split
  };

  console.log('\n📝 Registering agent:', agentParams.spiritId);

  try {
    const result = await client.registerAgent(agentParams);

    console.log('\n✅ Agent registered successfully!');
    console.log(`   Spirit Key: ${result.spiritKey}`);
    console.log(`   Token ID: ${result.registryTokenId}`);
    console.log(`   Transaction: ${client.getExplorerUrl(result.txHash)}`);

    // Verify registration
    const agent = await client.getAgent(agentParams.spiritId);
    if (agent) {
      console.log('\n📊 Agent Details:');
      console.log(`   Status: ${['Active', 'Paused', 'Graduated'][agent.status]}`);
      console.log(`   Treasury: ${agent.treasury}`);
      console.log(`   Split: ${agent.split.artistBps / 100}% / ${agent.split.agentBps / 100}% / ${agent.split.platformBps / 100}% / ${agent.split.protocolBps / 100}%`);
    }
  } catch (error) {
    console.error('❌ Registration failed:', error);
  }
}

registerAgent().catch(console.error);
