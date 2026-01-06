const spirit = require('./index.js');

async function test() {
  console.log('Spirit Protocol SDK v' + spirit.version);
  console.log('================================\n');

  console.log('Testing ecosystem health check...\n');
  
  try {
    const health = await spirit.healthCheck();
    
    console.log('AIRC:', health.airc.status);
    console.log('/vibe:', health.vibe.status, health.vibe.online ? `(${health.vibe.online} online)` : '');
    console.log('Solienne:', health.solienne.status);
    console.log('Spirit:', health.spirit.status);
    console.log('\nTimestamp:', health.timestamp);
    
    console.log('\n✓ SDK working correctly');
  } catch (e) {
    console.error('✗ Error:', e.message);
    process.exit(1);
  }
}

test();
