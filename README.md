# KasuwaShield — Autonomous Portfolio Risk Agent

**Tagline**: *"Don't predict the downside. Protect the position continuously."*  
**Hackathon Submission**: Somnia × DreamDEX Event Contracts Hackathon 2026  
**Category**: Autonomous Risk Infrastructure & Event Contracts  
**Network**: Somnia Shannon Testnet (`Chain ID 50312`, RPC `https://dream-rpc.somnia.network`)  
**Live Terminal**: [http://localhost:3000](http://localhost:3000)  
**GitHub Repository**: [https://github.com/Xzavior34/KasuwaShield](https://github.com/Xzavior34/KasuwaShield)  

---

## 🚀 Why KasuwaShield is Different (The Category Kill-Shot)

Most prediction market hackathon entries treat event contracts as binary 15-minute gambling bets. They force users to predict directional price moves or build one-off trade calculators that require manual wallet approvals every 15 minutes.

**KasuwaShield is an Autonomous Risk Agent powered by Somnia Reactivity and EIP-7702 Ephemeral Session Keys.**

| Competitor Architecture | Competitor Limitation | KasuwaShield Advantage |
| :--- | :--- | :--- |
| **Vs. Multi-Leg Routers (Branch)** | Requires constant manual wallet-signing for every trade leg. | **Zero-Popup Continuous Execution**: User signs **ONE** EIP-7702 delegation payload. Ephemeral local Session Keys auto-roll hedges seamlessly without MetaMask popups. |
| **Vs. Auto-Rollers (Let It Ride)** | Auto-rolls speculative betting streaks, compounding downside risk until bust. | **Autonomous Portfolio Hedging**: Dynamically calculates portfolio exposure to hedge and protect spot/perp assets over 24h/7d windows. |
| **Vs. AI Chatbots (Dreamdesk / QDS)** | Slow, non-deterministic LLM prompt wrappers prone to hallucinations. | **Deterministic Policy Engine**: 100% fail-closed smart contract risk policy (`KasuwaPolicy.sol`) with strict budget caps and price ceilings. |
| **Vs. Black-Scholes Formula (Sigma)** | Applies European options formulas to fixed 1e6 binary event contracts. | **Tailored Fixed-Payout Math**: Sizes downside coverage specifically for DreamDEX 1e6 binary orderbooks. |

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
