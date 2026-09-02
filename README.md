# KasuwaShield — Autonomous Portfolio Risk Agent

> **One-liner (for the BUIDL card):** KasuwaShield turns 15-minute DreamDEX
> Event Contracts into a continuous, zero-popup insurance policy for your
> portfolio — sign once, stay protected for 24 hours straight.

**Tagline**: *"Don't predict the downside. Protect the position continuously."*
**Hackathon Submission**: Somnia × DreamDEX Event Contracts Hackathon 2026
**Category**: Autonomous Risk Infrastructure & Event Contracts
**Network**: Somnia Shannon Testnet (`Chain ID 50312`, RPC `https://dream-rpc.somnia.network`)
**Live Terminal**: [http://localhost:3000](http://localhost:3000) (run `node server.js`)
**GitHub Repository**: [https://github.com/Xzavior34/KasuwaShield](https://github.com/Xzavior34/KasuwaShield)

---

## ⚡ Why KasuwaShield is different

Every 15-minute DreamDEX Event Contract is a great primitive and a terrible
user experience: to stay hedged across a full trading day you'd need to sign
~96 separate transactions, one per window, and never miss a beat. Nobody does
that. So today, Event Contracts get used for single speculative bets, not for
what they're actually good at — cheap, granular downside insurance.

**KasuwaShield is the layer that makes that insurance model usable**, by
turning a stack of 15-minute binary contracts into one continuous policy:

- **Configure once**: exposure ($500 BTC), protection target (30%), duration
  (24h), max budget ($100).
- **Sign once (EIP-7702)**: a locally-generated ephemeral session key gets a
  single delegated-authorization signature from the user's EOA — scoped so it
  can *only* call `executeAutoRoll()` on allowlisted DreamDEX pools, never
  withdraw or transfer funds.
- **Then it just runs**: every 15 minutes, `KasuwaReactiveHandler.sol` detects
  window settlement and emits `RolloverWindowOpen`; the local session key
  auto-executes the next hedge — zero wallet popups, for up to 24 hours.
- **Kill-switch always on**: the user can revoke the session key and terminate
  the policy on-chain in one click, at any time.

No other tool in this category turns Event Contracts into a *set-and-forget*
primitive — that's the gap KasuwaShield fills, and it's why it drives
recurring, organic order flow to the DreamDEX CLOB instead of one-off bets.

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

## 🧪 What's live vs. simulated

We label this explicitly rather than let judges guess — full breakdown in
[`FINAL_AUDIT.md`](./FINAL_AUDIT.md). Short version: Somnia RPC connectivity,
the on-chain policy contracts, and real secp256k1 session-key generation are
live; order execution and the Terminal UI's price/audit feed are a labeled,
deterministic demo harness (every simulated value is tagged `isDemo: true` and
badged `SIMULATED` in the UI) so the golden path is reproducible for judges
without needing funded wallets or real-time 15-minute windows.

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
