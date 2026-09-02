# KasuwaShield — EIP-7702 Continuous Auto-Rolling Downside Protection

**Tagline**: *"Don't predict the downside. Protect the position continuously."*  
**Hackathon Submission**: Somnia × DreamDEX Event Contracts Hackathon 2026  
**Network**: Somnia Shannon Testnet (`Chain ID 50312`, RPC `https://dream-rpc.somnia.network`)  
**Live UI**: [http://localhost:3000](http://localhost:3000)  

---

## ⚡ Executive Summary: The Category Upgrade

Traditional prediction markets treat event contracts as 15-minute binary gambling bets. Most hackathon tools build one-off trade calculators that force the user to sign a wallet transaction every 15 minutes.

**KasuwaShield transforms DreamDEX Event Contracts into an Autonomous, Continuous Risk-Management Layer:**
- **Continuous Policy Configuration**: User sets exposure ($500 BTC), protection target (30%), duration (24 Hours), and max budget ($100).
- **Ephemeral Session Keys (EIP-7702)**: The browser generates a local ECDSA Session Key. The user signs **ONE** authorization payload delegating EOA execution to `KasuwaExecutor.sol`.
- **Zero-Popup Auto-Rolling Loop**: Every 15 minutes, when the current window settles, `KasuwaReactiveHandler.sol` emits `RolloverWindowOpen`. The background keeper automatically executes the next 15-minute hedge using the local Session Key — **with ZERO wallet popups!**
- **Non-Custodial Kill-Switch**: The user can terminate the policy and revoke the Session Key on-chain at any time with a single click.

---

## 🏗️ Architecture & Component Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER WALLET (EOA)                               │
│      Signs 1 EIP-7702 Delegation Payload (Whitelists Session Key)      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│               LOCAL EPHEMERAL SESSION KEY (Browser DB)                │
│       Executes auto-rolled 15m hedges with ZERO wallet popups           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────┴─────────────────────────────────────┐
│                       SOMNIA SHANNON TESTNET                           │
│  ├── KasuwaPolicy.sol         (Enforces budget caps & policy limits)   │
│  ├── KasuwaExecutor.sol       (Session Key authorization router)       │
│  └── KasuwaReactiveHandler.sol(Emits RolloverWindowOpen on settlement)  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Monorepo Package Structure

- **`contracts/`**:
  - `KasuwaPolicy.sol`: Non-custodial policy enforcing budget caps, contract price ceilings, remaining budget deduction, and policy termination.
  - `KasuwaExecutor.sol`: EIP-7702 Session Key validation and execution router.
  - `KasuwaReactiveHandler.sol`: Somnia Reactive callback contract emitting `RolloverWindowOpen`.
- **`packages/execution/`**:
  - `session-key-manager.ts`: Generates local ephemeral Session Keys, builds EIP-7702 delegation payloads, and executes zero-popup auto-rolls.
- **`packages/risk-engine/`**: Deterministic downside protection calculator & 0–100 market quality scoring.
- **`packages/markets/`**: Live testnet market discovery scanning Somnia logs & pool parameters.
- **`scripts/`**:
  - `auto-roll-demo.ts`: Golden path demo script testing 4-window continuous auto-rolling shield execution.

---

## 🚀 Quickstart & Local Verification

### 1. Run Unit Tests & Auto-Roll Golden Path Script
```bash
npx vitest run
npx tsx scripts/auto-roll-demo.ts
```

### 2. Launch Local UI Terminal
```bash
node server.js
```
Open [http://localhost:3000](http://localhost:3000) to inspect the Continuous Auto-Rolling Shield UI terminal.
