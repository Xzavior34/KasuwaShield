# KasuwaShield — Autonomous Portfolio Risk Agent

> **BUIDL one-liner:** KasuwaShield turns 15-minute DreamDEX Event Contracts into
> a continuous, zero-popup insurance policy — sign once with EIP-7702,
> stay protected for 24 hours straight via Somnia's on-chain reactive handler.

**Tagline**: *"Don't predict the downside. Protect the position continuously."*
**Hackathon**: Somnia × DreamDEX Event Contracts Hackathon 2026
**Category**: Autonomous Risk Infrastructure & Event Contracts
**Network**: Somnia Shannon Testnet (`Chain ID 50312`, RPC `https://dream-rpc.somnia.network`)
**GitHub**: [github.com/Xzavior34/KasuwaShield](https://github.com/Xzavior34/KasuwaShield)

---

## ⚡ Why KasuwaShield Exists

Every 15-minute DreamDEX Event Contract is a great primitive and a terrible
user experience: to stay hedged across a full trading day you'd need to sign
**~96 separate transactions**, one per window, and never miss a beat. Nobody does
that. So today, Event Contracts get used for single speculative bets — not for
what they're actually good at: **cheap, granular downside insurance**.

**KasuwaShield is the layer that makes the insurance model usable**, by
turning a stack of 15-minute binary contracts into one continuous policy.

---

## 🔑 Key Differentiators

| Feature | How It Works |
|---|---|
| **EIP-7702 Delegated Execution** | One signature scopes a session key to `executeAutoRoll()` only — zero wallet popups for 24h |
| **Somnia Reactive Handler** | `KasuwaReactiveHandler.sol` detects window settlement on-chain — no off-chain keeper or cron |
| **Deterministic Risk Engine** | Pure math (ΔR = ΔP − θ×E). No AI. No predictions. No hallucinations. |
| **Fail-Closed Policy** | Budget-bounded, kill-switch armed, non-custodial. Session key can NEVER withdraw funds |
| **Continuous 24h Coverage** | Chains up to 96 windows into one policy. Configure once, run autonomously |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                       USER WALLET (EOA)                              │
│    Configures: $500 BTC Exposure | 30% Protection | 24h Duration    │
│    Signs ONE EIP-7702 Authorization Payload                         │
└─────────────────────────────┬────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│            LOCAL EPHEMERAL SESSION KEY (Browser Memory)               │
│     Real secp256k1 key (viem/accounts) — NEVER touches user funds    │
│     Scoped to: executeAutoRoll() on allowlisted DreamDEX pools only  │
└─────────────────────────────┬────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    SOMNIA SHANNON TESTNET                             │
│  ├── KasuwaPolicy.sol          Enforces budget, caps, boundaries     │
│  ├── KasuwaExecutor.sol        Session key authorization router      │
│  └── KasuwaReactiveHandler.sol Emits RolloverWindowOpen on settle    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📜 Deployed Contracts (Live on Shannon Testnet)

| Contract | Address | Explorer |
|---|---|---|
| **KasuwaPolicy** | `0x43a18f29d10e42819873a90a218291b87a82910a` | [View ↗](https://shannon-explorer.somnia.network/address/0x43a18f29d10e42819873a90a218291b87a82910a) |
| **tUSDC Collateral** | `0x68B1D87F95878fE05B998F19b66F4baba5De11d4` | [View ↗](https://shannon-explorer.somnia.network/address/0x68B1D87F95878fE05B998F19b66F4baba5De11d4) |

---

## 🔒 Security & Fail-Closed Controls

1. **Non-Custodial Session Keys**: The local session key can **ONLY** execute `executeAutoRoll()` on allowlisted DreamDEX pools. It can **NEVER** withdraw, transfer, or access user collateral.
2. **Strict Budget Deductions**: Every auto-roll deducts cost from `remainingBudgetUSD` in `KasuwaPolicy.sol`. If budget drops below roll cost, the policy terminates safely.
3. **On-Chain Kill-Switch**: The user can revoke the session key on-chain at any time with a single click (`revokeSessionKey()`).
4. **Duplicate Settlement Prevention**: `KasuwaReactiveHandler.sol` tracks processed market IDs to prevent duplicate event execution.

---

## 🧪 What's Live vs. Simulated

We label this explicitly rather than let judges guess — full breakdown in
[`FINAL_AUDIT.md`](./FINAL_AUDIT.md).

| Component | Status | Details |
|---|:---:|---|
| Somnia RPC connectivity | ✅ LIVE | Real block numbers from `dream-rpc.somnia.network` |
| On-chain policy contracts | ✅ LIVE | Deployed and verified on Shannon Explorer |
| secp256k1 session key generation | ✅ LIVE | Real `viem/accounts` key generation |
| Terminal UI price/audit feed | 🏷 DEMO | Deterministic demo harness (tagged `SIMULATED`) |
| DreamDEX order execution | 🏷 DEMO | Simulated — awaiting mainnet CLOB availability |

---

## 🛠️ Quickstart & Local Verification

```bash
# 1. Install dependencies
npm install

# 2. Run Unit Tests
npx vitest run

# 3. Run EIP-7702 Continuous Auto-Roll Demo
npx tsx scripts/auto-roll-demo.ts

# 4. Launch Autonomous Risk Terminal
node server.js
```

Open [http://localhost:3000](http://localhost:3000) to interact with the terminal.

**Routes:**
- `/` — Overview dashboard with animated chart, dial, telemetry feed
- `/risk` — Quantitative risk engine deep analysis
- `/execution` — EIP-7702 pipeline architecture & auto-roll timeline
- `/proof` — On-chain proof verification with Blockscout links
- `/replay` — Historical backtest scenarios with dynamic computations
