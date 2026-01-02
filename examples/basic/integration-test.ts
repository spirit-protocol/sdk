/**
 * Integration Test - Spirit SDK
 *
 * Validates SDK connectivity and address override pattern.
 * Uses environment variables for contract addresses.
 *
 * Usage:
 *   SPIRIT_REGISTRY=0x... SPIRIT_ROUTER=0x... npx tsx examples/basic/integration-test.ts
 *
 * Prerequisites:
 *   - npm install
 *   - Deployed SpiritRegistry and RoyaltyRouter on Base Sepolia
 */

import { SpiritClient } from '../../src';

// ============================================================================
// Environment Configuration
// ============================================================================

const SPIRIT_REGISTRY = process.env.SPIRIT_REGISTRY;
const SPIRIT_ROUTER = process.env.SPIRIT_ROUTER;
const SPIRIT_RPC_URL = process.env.SPIRIT_RPC_URL; // Optional custom RPC
const TEST_AGENT_ID = process.env.TEST_AGENT_ID || 'abraham'; // Agent to query

// ============================================================================
// Validation
// ============================================================================

function checkEnv(): boolean {
  const missing: string[] = [];

  if (!SPIRIT_REGISTRY) missing.push('SPIRIT_REGISTRY');
  if (!SPIRIT_ROUTER) missing.push('SPIRIT_ROUTER');

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:\n');
    missing.forEach((v) => console.error(`   ${v}=0x...`));
    console.error('\nExample usage:');
    console.error(
      '   SPIRIT_REGISTRY=0x1234... SPIRIT_ROUTER=0x5678... npx tsx examples/basic/integration-test.ts\n'
    );
    return false;
  }

  return true;
}

// ============================================================================
// Tests
// ============================================================================

async function runTests() {
  console.log('🧪 Spirit SDK Integration Test\n');
  console.log('Configuration:');
  console.log(`   Chain:    Base Sepolia (84532)`);
  console.log(`   Registry: ${SPIRIT_REGISTRY}`);
  console.log(`   Router:   ${SPIRIT_ROUTER}`);
  console.log(`   RPC:      ${SPIRIT_RPC_URL || '(default)'}`);
  console.log(`   Agent:    ${TEST_AGENT_ID}`);
  console.log('');

  // Initialize client with overrides
  const spirit = new SpiritClient({
    chainId: 84532,
    rpcUrl: SPIRIT_RPC_URL,
    contracts: {
      registry: SPIRIT_REGISTRY as `0x${string}`,
      router: SPIRIT_ROUTER as `0x${string}`,
    },
  });

  let passed = 0;
  let failed = 0;

  // Test 1: Address override mapping
  console.log('Test 1: Address override mapping');
  try {
    const registryMatch = spirit.addresses.SpiritRegistry === SPIRIT_REGISTRY;
    const routerMatch = spirit.addresses.RoyaltyRouter === SPIRIT_ROUTER;

    if (registryMatch && routerMatch) {
      console.log('   ✅ Contract addresses correctly mapped');
      passed++;
    } else {
      console.log('   ❌ Address mismatch');
      console.log(`      Expected registry: ${SPIRIT_REGISTRY}`);
      console.log(`      Got:               ${spirit.addresses.SpiritRegistry}`);
      failed++;
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err}`);
    failed++;
  }

  // Test 2: Wallet status (should be read-only)
  console.log('Test 2: Read-only mode');
  try {
    const hasWallet = spirit.hasWallet();
    if (!hasWallet) {
      console.log('   ✅ Client correctly initialized in read-only mode');
      passed++;
    } else {
      console.log('   ⚠️  Wallet configured (unexpected for this test)');
      passed++;
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err}`);
    failed++;
  }

  // Test 3: Chain configuration
  console.log('Test 3: Chain configuration');
  try {
    if (spirit.chainId === 84532 && spirit.chain.name === 'Base Sepolia') {
      console.log('   ✅ Chain correctly configured as Base Sepolia');
      passed++;
    } else {
      console.log(`   ❌ Unexpected chain: ${spirit.chain.name} (${spirit.chainId})`);
      failed++;
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err}`);
    failed++;
  }

  // Test 4: Registry read (requires deployed contract)
  console.log(`Test 4: Registry read (getAgent "${TEST_AGENT_ID}")`);
  try {
    const agent = await spirit.getAgent(TEST_AGENT_ID);

    if (agent) {
      console.log('   ✅ Agent found:');
      console.log(`      Token ID:  ${agent.registryTokenId}`);
      console.log(`      Trainer:   ${agent.trainer}`);
      console.log(`      Treasury:  ${agent.treasury}`);
      console.log(`      Status:    ${['Active', 'Paused', 'Graduated'][agent.status]}`);
      passed++;
    } else {
      console.log(`   ℹ️  Agent "${TEST_AGENT_ID}" not registered (this may be expected)`);
      passed++; // Not a failure - agent may not exist yet
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('execution reverted') || message.includes('contract')) {
      console.log('   ❌ Contract call failed - is the registry deployed at this address?');
      console.log(`      Error: ${message.substring(0, 100)}`);
    } else {
      console.log(`   ❌ RPC error: ${message.substring(0, 100)}`);
    }
    failed++;
  }

  // Test 5: Resolve key (pure function, no state needed)
  console.log('Test 5: Resolve spiritId to key');
  try {
    const key = await spirit.resolveKey('test-agent');
    if (key && key.startsWith('0x') && key.length === 66) {
      console.log(`   ✅ Key resolved: ${key.substring(0, 18)}...`);
      passed++;
    } else {
      console.log(`   ❌ Invalid key format: ${key}`);
      failed++;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`   ❌ Error: ${message.substring(0, 100)}`);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Check contract deployment and addresses.');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

// ============================================================================
// Main
// ============================================================================

if (!checkEnv()) {
  process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
