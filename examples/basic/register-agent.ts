/**
 * Basic Spirit Registration Example
 *
 * Demonstrates how to register a new Spirit agent with Spirit Protocol.
 *
 * Prerequisites:
 * - npm install @spirit-protocol/sdk
 * - PRIVATE_KEY environment variable
 */

import {
  SpiritClient,
  type Address,
} from '@spirit-protocol/sdk';

async function registerSpirit() {
  // Initialize client with private key for write operations
  const client = new SpiritClient({
    chainId: 8453, // Base mainnet
    privateKey: process.env.PRIVATE_KEY as `0x${string}`,
  });

  console.log('Connected to Base Mainnet');
  console.log(`Wallet: ${client.getWalletAddress()}`);

  // Define your agent
  const artistAddress = client.getWalletAddress() as Address;

  console.log('\nRegistering Spirit agent...');

  try {
    const result = await client.registerSpirit({
      agentURI: 'ipfs://QmYourMetadataHash',       // Agent metadata URI
      artist: artistAddress,                         // Your address as artist/creator
      platform: '0x0000000000000000000000000000000000000000' as Address,
      treasuryOwners: [artistAddress],               // MVP: single owner
      treasuryThreshold: 1n,                         // MVP: threshold of 1
    });

    console.log('\nAgent registered successfully!');
    console.log(`   Agent ID: ${result.agentId}`);
    console.log(`   Transaction: ${client.getExplorerUrl(result.txHash)}`);

    // Verify registration
    const agent = await client.getAgent(result.agentId);
    if (agent) {
      console.log('\nAgent Details:');
      console.log(`   Owner: ${agent.owner}`);
      console.log(`   Treasury: ${agent.treasury}`);
      console.log(`   Revenue: ${agent.revenueConfig.artistBps / 100}% / ${agent.revenueConfig.agentBps / 100}% / ${agent.revenueConfig.platformBps / 100}% / ${agent.revenueConfig.protocolBps / 100}%`);
    }
  } catch (error) {
    console.error('Registration failed:', error);
  }
}

registerSpirit().catch(console.error);
