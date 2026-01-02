# @spirit-protocol/sdk

TypeScript SDK for Spirit Protocol — economic sovereignty infrastructure for AI agents on Base.

## Installation

```bash
npm install @spirit-protocol/sdk
```

> If npm install fails, install from GitHub: `npm install github:spirit-protocol/spirit-sdk`

## Quick Start

```typescript
import { SpiritClient } from '@spirit-protocol/sdk';

// Create a read-only client
const spirit = new SpiritClient({
  chainId: 84532, // Base Sepolia testnet
});

// Get agent information
const agent = await spirit.getAgent('abraham');
console.log(agent?.treasury, agent?.split);
```

## Features

- **Agent Registration** — Register AI agents with onchain identity
- **Revenue Routing** — Automatic 25/25/25/25 split (creator/agent/platform/protocol)
- **Treasury Management** — Check and manage agent treasuries
- **MCP Server** — Model Context Protocol integration for Claude
- **Type-safe** — Full TypeScript support with autocomplete

## Configuration

### Read-Only Client

```typescript
const spirit = new SpiritClient({
  chainId: 84532, // 84532 = Base Sepolia, 8453 = Base Mainnet
});
```

### Write-Enabled Client

```typescript
const spirit = new SpiritClient({
  chainId: 84532,
  privateKey: process.env.AGENT_PRIVATE_KEY, // For transactions
});
```

## Core Operations

### Get Agent Information

```typescript
const agent = await spirit.getAgent('abraham');

if (agent) {
  console.log('Treasury:', agent.treasury);
  console.log('Status:', ['Active', 'Paused', 'Graduated'][agent.status]);
  console.log('Split:', agent.split);
}
```

### Register an Agent

```typescript
const result = await spirit.registerAgent({
  spiritId: 'my-agent',
  trainer: '0x...', // Creator address (gets 25%)
  platform: '0x...', // Platform address (gets 25%)
  treasury: '0x...', // Agent treasury (gets 25%)
  metadataURI: 'ipfs://...',
});

console.log('Registered:', result.spiritKey);
console.log('Token ID:', result.registryTokenId);
console.log('Transaction:', result.txHash);
```

### Route Revenue

```typescript
import { parseEther } from 'viem';

// Route native ETH
const event = await spirit.routeRevenueNative({
  spiritId: 'my-agent',
  amount: parseEther('0.1'),
});

console.log('Routed:', event.amount);
console.log('Artist got:', event.artistAmount);
console.log('Agent got:', event.agentAmount);
```

### Check Treasury Balance

```typescript
const balance = await spirit.getTreasuryBalance('abraham');
console.log('Treasury balance:', balance.native, 'wei');
```

## MCP Server

The SDK includes an MCP server for Claude Code and other MCP-compatible agents.

### Quick Start (Claude Code)

Add to your `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "spirit-protocol": {
      "command": "npx",
      "args": ["-y", "@spirit-protocol/sdk", "spirit-mcp"],
      "env": {
        "SPIRIT_CHAIN_ID": "84532"
      }
    }
  }
}
```

### Available Tools

| Tool | Description |
|------|-------------|
| `spirit_get_agent` | Get agent registration info |
| `spirit_register` | Register a new agent |
| `spirit_balance` | Check treasury balance |
| `spirit_evaluate` | Self-assessment for unregistered agents |

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPIRIT_CHAIN_ID` | Chain ID (84532=testnet, 8453=mainnet) | 84532 |
| `SPIRIT_PRIVATE_KEY` | Private key for write operations | - |
| `SPIRIT_RPC_URL` | Custom RPC URL | Chain default |

### Usage with Claude Agent SDK

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { SpiritClient } from '@spirit-protocol/sdk';

const spirit = new SpiritClient({
  chainId: 84532,
  privateKey: process.env.AGENT_PRIVATE_KEY,
});

// Define Spirit tools for Claude
const tools = [
  {
    name: 'check_treasury',
    description: 'Check Spirit Protocol treasury balance',
    input_schema: { type: 'object', properties: {} },
  },
];

// Handle tool calls
async function handleTool(name: string) {
  if (name === 'check_treasury') {
    return await spirit.getTreasuryBalance('my-agent');
  }
}
```

See [examples/mcp](./examples/mcp) for Claude Code configuration.

## Contract Addresses

### Base Sepolia (Testnet) — LIVE

| Contract | Address | Basescan |
|----------|---------|----------|
| SpiritRegistry | `0x4a0e642e9aec25c5856987e95c0410ae10e8de5e` | [View](https://sepolia.basescan.org/address/0x4a0e642e9aec25c5856987e95c0410ae10e8de5e) |
| RoyaltyRouter | `0x271bf11777ff7cbb9d938d2122d01493f6e9fc21` | [View](https://sepolia.basescan.org/address/0x271bf11777ff7cbb9d938d2122d01493f6e9fc21) |
| ProtocolTreasury | `0xe4951bEE6FA86B809655922f610FF74C0E33416C` | [View](https://sepolia.basescan.org/address/0xe4951bEE6FA86B809655922f610FF74C0E33416C) |

**Layer 2 Contracts (staking, tokens):**

| Contract | Address |
|----------|---------|
| SpiritToken | `0xC3FD6880fC602d999f64C4a38dF51BEB6e1b654B` |
| SpiritFactory | `0x53B9db3DCF3a69a0F62c44b19a6c37149b7fB93b` |
| StakingPool | `0xBBC3C7dc9151FFDc97e04E84Ad0fE91aF91D9DeE` |

These addresses are the defaults for `chainId: 84532`. No manual configuration needed for testnet.

### Base Mainnet

Coming soon.

## Revenue Split

Spirit Protocol enforces a **25/25/25/25** revenue split:

| Recipient | Share | Purpose |
|-----------|-------|---------|
| Creator | 25% | Rewards the human who trained/created the agent |
| Agent | 25% | Accumulates in agent treasury for evolution |
| Platform | 25% | Compensates the hosting platform |
| Protocol | 25% | Funds Spirit Protocol development & grants |

## Types

```typescript
import type {
  SpiritAgent,
  SplitConfig,
  RevenueEvent,
  AgentStatus,
} from '@spirit-protocol/sdk';
```

## Examples

- [Basic Registration](./examples/basic/register-agent.ts)
- [Sovereign Agent (Claude)](./examples/claude-agent-sdk/sovereign-agent.ts)
- [MCP Configuration](./examples/mcp/spirit-mcp-config.json)

## Links

- [Spirit Protocol Website](https://spiritprotocol.io)
- [Documentation](https://spiritprotocol.io/developers)
- [Whitepaper](https://spiritprotocol.io/whitepaper.pdf)
- [GitHub](https://github.com/spirit-protocol/spirit-sdk)

## License

MIT
