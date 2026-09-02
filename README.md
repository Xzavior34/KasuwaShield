# KasuwaShield — Autonomous Portfolio Risk Agent

> **BUIDL One-Liner:** KasuwaShield turns 15-minute DreamDEX Event Contracts into
> a continuous, zero-popup downside insurance policy — sign once with EIP-7702,
> stay protected for 24 hours straight via Somnia's on-chain reactive handler.

[![Network: Somnia Shannon](https://img.shields.io/badge/Network-Somnia_Shannon_Testnet_(50312)-10b981?style=flat-square)](https://shannon-explorer.somnia.network)
[![Smart Contracts](https://img.shields.io/badge/Contracts-Verified_on_Blockscout-67e8f9?style=flat-square)](https://shannon-explorer.somnia.network/address/0x43a18f29d10e42819873a90a218291b87a82910a)
[![Account Abstraction](https://img.shields.io/badge/Standard-EIP--7702_Delegated_Execution-c084fc?style=flat-square)](https://eips.ethereum.org/EIPS/eip-7702)
[![Tests: 100% Passing](https://img.shields.io/badge/Tests-10%2F10_Passing_(100%25)-34d399?style=flat-square)](./scripts/run-tests.ts)

**Tagline**: *"Don't predict the downside. Protect the position continuously."*  
**Hackathon**: Somnia × DreamDEX Event Contracts Hackathon 2026  
**Category**: Autonomous Risk Infrastructure & Event Contracts  
**Network**: Somnia Shannon Testnet (`Chain ID: 50312`, RPC: `https://dream-rpc.somnia.network`)  
**GitHub Repository**: [https://github.com/Xzavior34/KasuwaShield](https://github.com/Xzavior34/KasuwaShield)  

---

## ⚡ The Core Problem & Solution

Every 15-minute DreamDEX Event Contract is a high-speed financial derivative, but a painful manual user experience: to keep a portfolio continuously hedged across a single 24-hour trading day, a user would need to approve **~96 separate wallet transactions**, one for every 15-minute window, without missing a single settlement. 

Because nobody does this, event contracts are typically used for isolated speculative bets rather than what they excel at: **granular, low-cost downside insurance**.

**KasuwaShield provides the autonomous infrastructure layer that makes the continuous insurance model viable**, turning a sequential stack of 15-minute binary event contracts into a set-and-forget, zero-friction protection policy:

1. **Configure Once**: Choose asset exposure (e.g., $25,000 BTC), protection target (80%), duration (24h), and max volatility budget ($100).
2. **Sign Once (EIP-7702)**: An ephemeral browser session key receives a one-time delegated authorization signature from the user's EOA, strictly scoped to call `executeAutoRoll()` on allowlisted DreamDEX pools.
3. **Continuous On-Chain Reactivity**: At every 15-minute window settlement, `KasuwaReactiveHandler.sol` detects the settlement on-chain and triggers the next auto-roll hedge with **zero wallet popups**.
4. **Instant On-Chain Kill-Switch**: The user retains full sovereign control to revoke the session key on-chain at any time in 1 click.

---

## 🔑 Core Architectural Innovations

| Innovation | Technical Implementation | Practical Benefit |
|---|---|---|
| **EIP-7702 Account Abstraction** | Temporary delegated execution via scoped ECDSA secp256k1 session keys | **98.9% reduction in wallet friction** (1 signature vs. 96 popups/day) |
| **Somnia Shannon Reactivity** | Native `KasuwaReactiveHandler.sol` listening for `RolloverWindowOpen` | **Zero off-chain keeper or cron dependencies**; fully native on-chain execution |
| **100% Deterministic Risk Engine** | Mathematical risk delta ($\Delta R$), Kelly criterion ($f^*$), and VaR modeling | **Zero AI hallucinations**, sub-second execution, pure financial mathematics |
| **Non-Custodial Fail-Closed Security** | Hard budget ceilings & kill-switches in `KasuwaPolicy.sol` | Session keys can **never** withdraw collateral or transfer user funds |
| **Multi-Asset Protection Matrix** | Dynamic volatility regimes for BTC, ETH, SOL, and SOMNIA/STT | Real-time parametric hedging adapted to asset-specific spreads and depth |

---

## 🏗 System Architecture Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER WALLET (EOA)                               │
│     Configures: $25,000 BTC Exposure | 80% Protection | 24h Duration    │
│     Signs ONE EIP-7702 Authorization (Whitelists Scoped Session Key)   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│               LOCAL EPHEMERAL SESSION KEY (Browser Memory)             │
│      Cryptographic secp256k1 keypair generated locally in memory       │
│      Scoped ONLY to: executeAutoRoll() on allowlisted DreamDEX pools   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────┴─────────────────────────────────────┐
│                       SOMNIA SHANNON TESTNET                           │
│  ├── KasuwaPolicy.sol          Enforces remainingBudgetUSD & hard caps │
│  ├── KasuwaExecutor.sol        EIP-7702 delegated execution router     │
│  └── KasuwaReactiveHandler.sol Emits RolloverWindowOpen on settlement  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────┴─────────────────────────────────────┐
│                 DreamDEX EVENT CONTRACTS CLOB                          │
│     Executes 15m Binary Limit Orders (NO/PUT Downside Contracts)       │
│     Settles deterministically at $1.00 (Breach) or $0.00 (Safe)        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📐 Quantitative Risk Engine Formulation

KasuwaShield avoids predictive guessing or black-box deliberation. Sizing is governed by deterministic financial mathematics:

### 1. Risk Delta ($\Delta R$)
$$\Delta R = \Delta P - (\theta \times E)$$
*Where $\Delta P$ is the realized spot change, $\theta$ is the user's tolerance threshold (e.g., 8%), and $E$ is total exposure.*

### 2. Optimal Allocation (Kelly Criterion $f^*$)
$$f^* = \frac{p \cdot b - q}{b}$$
*Where $p$ is the downside event probability, $b$ is the event contract payout odds ($\frac{\$1.00}{\text{Price}}$), and $q = 1 - p$.*

### 3. Protection Coverage Ratio ($C$)
$$C = \left(\frac{H}{E}\right) \times 100\%$$
*Where $H$ is the total hedged value and $E$ is total exposure. Protection Gap is computed continuously as $\text{Target} - C$.*

---

## 📜 Deployed & Verified Contracts (Somnia Shannon Testnet)

| Contract | Address | Network | Blockscout Explorer |
|---|---|:---:|:---:|
| **KasuwaPolicy.sol** | `0x43a18f29d10e42819873a90a218291b87a82910a` | Shannon (50312) | [View on Explorer ↗](https://shannon-explorer.somnia.network/address/0x43a18f29d10e42819873a90a218291b87a82910a) |
| **KasuwaExecutor.sol** | `0x8a92f03d12a4b89c72e411b932c0211598f39b1a` | Shannon (50312) | [View on Explorer ↗](https://shannon-explorer.somnia.network/address/0x8a92f03d12a4b89c72e411b932c0211598f39b1a) |
| **tUSDC Collateral** | `0x68B1D87F95878fE05B998F19b66F4baba5De11d4` | Shannon (50312) | [View on Explorer ↗](https://shannon-explorer.somnia.network/address/0x68B1D87F95878fE05B998F19b66F4baba5De11d4) |

---

## 🖥 Terminal Views & Tour

The KasuwaShield Terminal is organized into 5 dedicated views:

- **`/` (Overview Terminal)**: Live breathing SVG area price chart, real-time radial coverage dial, interactive policy configuration sandbox, DreamDEX CLOB order book depth visualizer, 5-stage pipeline tracker, and streaming agent telemetry.
- **`/risk` (Quantitative Risk Engine)**: In-depth metrics including Value at Risk (VaR 95%), Hedged Sharpe Ratio (2.14), Kelly Fraction ($f^* = 0.42$), and Volatility Regime monitoring.
- **`/execution` (EIP-7702 Pipeline)**: Full horizontal system architecture, interactive session key sandbox, non-custodial permission boundaries, and 6-window auto-roll execution timeline.
- **`/proof` (Reactivity & Proof)**: Shannon Explorer contract verification, `KasuwaReactiveHandler.sol` event listener, and cryptographic execution audit ledger.
- **`/replay` (Historical Backtest Engine)**: 4 dynamic backtest scenarios (Flash Crash, Gradual Bleed, Volatility Spike, Mean Reversion) with fully computed values.

---

## 🔒 Security & Fail-Closed Controls

1. **Strict Non-Custodial Delegation**: Session keys are ephemeral and stored only in local memory. They possess permissions **only** to call `executeAutoRoll()` on verified DreamDEX pools.
2. **On-Chain Budget Ceilings**: Every roll deducts cost from `remainingBudgetUSD` in `KasuwaPolicy.sol`. If budget drops below roll cost, the policy terminates safely and automatically.
3. **1-Click Emergency Kill-Switch**: The user can invoke `revokeSessionKey()` on-chain at any time to immediately cancel all delegated execution rights.
4. **Duplicate Execution Prevention**: `KasuwaReactiveHandler.sol` tracks processed market IDs to prevent double-execution on re-orgs or duplicate events.

---

## 🧪 What's Live vs. Simulated

To ensure total transparency for hackathon evaluators:

| Component | Status | Details |
|---|:---:|---|
| **Somnia RPC Connectivity** | ✅ LIVE | Live block numbers fetched from `https://dream-rpc.somnia.network` |
| **On-Chain Policy Contracts** | ✅ LIVE | Deployed, verified, and queryable on Shannon Blockscout Explorer |
| **secp256k1 Key Derivation** | ✅ LIVE | Real cryptographic key generation in local browser memory |
| **Terminal Telemetry & Price Stream** | 🏷 DEMO | Deterministic test harness (badged `SIMULATED`) for reproducible evaluations |
| **DreamDEX Order Execution** | 🏷 DEMO | Simulated against live contract ABI parameters awaiting mainnet deployment |

---

## 🛠 Quickstart & Verification

```bash
# 1. Install workspace dependencies
npm install

# 2. Run the Protocol Verification Test Suite (100% Pass)
npm test

# 3. Run the Autonomous EIP-7702 Auto-Roll Golden Path Demo
npx tsx scripts/auto-roll-demo.ts

# 4. Verify all 5 Terminal Routes & Features
node scripts/verify-routes.js

# 5. Launch the Institutional Quant Terminal UI
node server.js
```

Open [http://localhost:3000](http://localhost:3000) to explore the terminal.
