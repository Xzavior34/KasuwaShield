# KasuwaShield — Autonomous Portfolio Risk Agent

**Tagline**: *"Don't predict the downside. Protect the position continuously."*  
**Hackathon Submission**: Somnia × DreamDEX Event Contracts Hackathon 2026  
**Category**: Autonomous Risk Infrastructure & Event Contracts  
**Network**: Somnia Shannon Testnet (`Chain ID 50312`, RPC `https://dream-rpc.somnia.network`)  
**Live Terminal**: [http://localhost:3000](http://localhost:3000)  
**GitHub Repository**: [https://github.com/Xzavior34/KasuwaShield](https://github.com/Xzavior34/KasuwaShield)  

---

## ⚡ Executive Summary

Traditional prediction markets treat event contracts as 15-minute binary gambling bets. Most tools force users to sign manual wallet transactions every 15 minutes to stay protected.

**KasuwaShield transforms DreamDEX Event Contracts into an Autonomous, Continuous Risk-Management Infrastructure:**
- **Continuous Policy Configuration**: User sets exposure ($500 BTC), protection target (30%), duration (24 Hours), and max budget ($100).
- **Ephemeral Session Keys (EIP-7702)**: The browser generates a local ECDSA Session Key. The user signs **ONE** authorization payload delegating EOA execution to `KasuwaExecutor.sol`.
- **Zero-Popup Auto-Rolling Loop**: Every 15 minutes, when the current window settles, `KasuwaReactiveHandler.sol` emits `RolloverWindowOpen`. The background keeper automatically executes the next 15-minute hedge using the local Session Key — **with ZERO wallet popups!**
- **Non-Custodial Kill-Switch**: The user can terminate the policy and revoke the Session Key on-chain at any time with a single click.

---

## ⚡ How the Autonomous Risk Agent Works

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER WALLET (EOA)                               │
│     Configures: $500 BTC Exposure | 30% Protection | 24h Duration     │
│     Signs ONE EIP-7702 Authorization Payload (Whitelists Session Key) │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│               LOCAL EPHEMERAL SESSION KEY (Browser Memory)             │
│      Executes 15m/1h auto-rolled hedges with ZERO wallet popups        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────┴─────────────────────────────────────┐
│                       SOMNIA SHANNON TESTNET                           │
│  ├── KasuwaPolicy.sol         (Enforces remainingBudget & caps)        │
│  ├── KasuwaExecutor.sol       (Session Key authorization router)       │
│  └── KasuwaReactiveHandler.sol(Emits RolloverWindowOpen on settlement) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Security & Fail-Closed Controls

1. **Non-Custodial Session Keys**: The local Session Key can **ONLY** execute `executeAutoRoll()` on allowlisted DreamDEX pools. It can **NEVER** withdraw, transfer, or access user collateral.
2. **Strict Budget Deductions**: Every auto-roll deducts cost from `remainingBudgetUSD` in `KasuwaPolicy.sol`. If `remainingBudgetUSD` drops below the roll cost, the policy terminates safely.
3. **On-Chain Kill-Switch**: The user can revoke the Session Key on-chain at any time with a single click (`revokeSessionKey()`).
4. **Duplicate Settlement Prevention**: `KasuwaReactiveHandler.sol` tracks processed market IDs to prevent duplicate event execution.

---

## 🛠️ Quickstart & Local Verification

```bash
# 1. Run Unit Tests (100% pass)
npx vitest run

# 2. Run EIP-7702 Continuous Auto-Roll Golden Path Demo Script
npx tsx scripts/auto-roll-demo.ts

# 3. Launch Local Autonomous Risk Terminal UI
node server.js
```
Open [http://localhost:3000](http://localhost:3000) to interact with the Autonomous Risk Terminal.
