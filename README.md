# 🛡️ KasuwaShield

> **Event Contracts expire. Portfolio risk does not.**  
> KasuwaShield turns short-duration DreamDEX protection into a continuously renewed hedge policy.  
> **One-time authorization. Bounded autonomy. Automatic rollover.**

[![Network: Somnia Shannon](https://img.shields.io/badge/Network-Somnia_Shannon_Testnet_(50312)-10b981?style=flat-square)](https://shannon-explorer.somnia.network)
[![KasuwaPolicy Deployed](https://img.shields.io/badge/KasuwaPolicy-0xAc8c...140d1d_(4.2KB_Verified)-38bdf8?style=flat-square)](https://shannon-explorer.somnia.network/address/0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d)
[![KasuwaExecutor Deployed](https://img.shields.io/badge/KasuwaExecutor-0x80Ac...4B7c69c_(3.5KB_Verified)-c084fc?style=flat-square)](https://shannon-explorer.somnia.network/address/0x80AcBF398663079edBfF26132C9AC04204B7c69c)
[![USDso Collateral Verified](https://img.shields.io/badge/USDso_Token-0x9c32...b171_(7.5KB_Verified)-10b981?style=flat-square)](https://shannon-explorer.somnia.network/address/0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171)
[![Unit & Invariant Tests](https://img.shields.io/badge/Unit_Tests-15%2F15_Passing_(100%25)-34d399?style=flat-square)](./scripts/run-tests.ts)
[![Truth Audit Tests](https://img.shields.io/badge/Truth_Audit-13%2F13_Verified_(100%25)-38bdf8?style=flat-square)](./scripts/e2e-proof-test.ts)

**Hackathon**: Somnia × DreamDEX Event Contracts Hackathon 2026  
**Track**: Autonomous Risk Infrastructure & Event Contracts  
**Network**: Somnia Shannon Testnet (`Chain ID: 50312`, RPC: `https://dream-rpc.somnia.network`)  
**Funded Signer Wallet**: [`0x07764D9031b8747e28d3E1601Ff1417569de22DA`](https://shannon-explorer.somnia.network/address/0x07764D9031b8747e28d3E1601Ff1417569de22DA) (`1.000000 STT` gas funded)  
**Machine-Readable Truth Artifact**: [`artifacts/truth-audit.json`](./artifacts/truth-audit.json)  
**Forensic Audit Report**: [`FINAL_AUDIT.md`](./FINAL_AUDIT.md)  
**GitHub Repository**: [https://github.com/Xzavior34/KasuwaShield](https://github.com/Xzavior34/KasuwaShield)  

---

## ⚡ 1. One-Line Description

> **Autonomous portfolio protection built on DreamDEX Event Contracts, using bounded policy execution and continuous hedge rollover.**

---

## 🛑 2. The Problem

Every 15-minute or 1-hour DreamDEX Event Contract is an efficient, capped-risk derivative. However, for continuous portfolio risk management, short durations create severe operational friction:

* To maintain continuous downside insurance for a \$25,000 spot position across a 24-hour day, a user would need to monitor market spreads and manually approve **~96 separate wallet transactions** (one every 15 minutes), without missing a single settlement window.
* Because manual continuous re-hedging is practically impossible, Event Contracts are typically treated as isolated speculative bets rather than fulfilling their highest-value economic utility: **granular, cost-effective downside insurance**.

---

## 💡 3. The Insight

Short-duration Event Contracts can become a **continuous protection primitive** when automatically renewed under strict, user-defined policy bounds:

* Instead of placing one-off directional trades, the user defines a **Risk Policy** (exposure, target coverage, maximum budget, and slippage ceiling).
* The protocol monitors risk continuously, calculates the required hedge size via deterministic quantitative models, executes bounded limit orders, and automatically transitions protection into the next window upon settlement.

> **Trade automation executes trades. KasuwaShield maintains a protection policy.**

---

## 🔄 4. The Solution Lifecycle

```
USER DEFINES POLICY
       ↓
ONE-TIME AUTHORIZATION
       ↓
RISK ENGINE MONITORS EXPOSURE
       ↓
HEDGE RATIO CALCULATED
       ↓
DREAMDEX EVENT CONTRACT SELECTED
       ↓
BOUNDED EXECUTION
       ↓
MARKET WINDOW EXPIRES
       ↓
ROLLOVER DECISION
       ↓
NEXT PROTECTION WINDOW
       ↓
CONTINUOUS PROTECTION
```

---

## ⚖️ 5. Why This Is Different

```
Traditional Event Contract User:
→ Manually selects market
→ Manually approves transaction
→ Manually monitors expiry
→ Manually reposts next window (96 popups/day)

KasuwaShield User:
→ Defines protection policy once
→ Authorizes bounded execution once (EIP-7702 architecture)
→ Protocol monitors risk continuously
→ Automatically rolls protection into next window
→ Terminates safely when budget limit or price ceiling is reached
```

---

## 🏗️ 6. Core Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER WALLET (EOA)                               │
│     Configures: $25,000 BTC Exposure | 80% Protection | 24h Duration    │
│     Signs ONE EIP-7702 Scoped Delegation Payload                       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│               EPHEMERAL SESSION KEY (Local In-Memory secp256k1)        │
│      Scoped ONLY to: executeAutoRoll() on allowlisted DreamDEX pools   │
│      Strictly Non-Custodial: Zero permission to withdraw user funds    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────┴─────────────────────────────────────┐
│                       SOMNIA SHANNON TESTNET                           │
│  ├── KasuwaPolicy.sol (0xAc8c...140d1d)   4,207B Verified Bytecode     │
│  ├── KasuwaExecutor.sol (0x80Ac...4B7c69c) 3,505B Verified Bytecode     │
│  └── KasuwaReactiveHandler.sol (0x9D60...) Somnia Reactive Callback    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────┴─────────────────────────────────────┐
│                 DreamDEX EVENT CONTRACTS CLOB                          │
│     Discovers 15m Binary Limit Orders (NO/PUT Downside Contracts)      │
│     Evaluates Depth & Executes within Max Slippage Bounds              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔒 7. Fail-Closed Safety Model

KasuwaShield implements strict fail-closed safety enforcement. Automated executions are rejected if any invariant is breached:

1. **Stale / Expired Market**: If an Event Contract has expired or finalized, execution is blocked (`SKIP`).
2. **Insufficient Liquidity**: If orderbook depth is insufficient for the requested hedge size, the order is rejected (`POOR QUALITY`).
3. **Excessive Spread / Slippage**: If the orderbook spread exceeds the policy ceiling (>5%), the order is rejected (`PRICE SKEW`).
4. **Budget Exhaustion**: If cumulative roll costs reach `totalBudgetUSD`, the policy terminates safely (`TERMINATED SAFE`).
5. **Duplicate Market Processing**: Two-tier idempotency guards (`processedMarkets[marketId]`) prevent duplicate execution.
6. **Invalid Policy**: Enforces maximum protection percentage ($\le 50\%$) and non-zero duration bounds.
7. **Non-Custodial Scope**: Session keys have zero authorization to transfer collateral or withdraw funds.

---

## 🔑 8. EIP-7702 Four-Level Truth Standard

| Layer | Status | Verification Detail |
|---|:---:|---|
| **CODE** | ✅ **LIVE VERIFIED** | `packages/execution/src/session-key-manager.ts` implements ephemeral `secp256k1` session key generation |
| **PAYLOAD** | ✅ **CODE VERIFIED** | `buildEIP7702DelegationPayload()` formats and hashes authorization tuple for Somnia Shannon (`50312`) |
| **DESIGNATION** | 🏷️ **AUTHORIZATION READY** | Ephemeral key derived in memory; awaits interactive client-side wallet designation |
| **EXECUTION** | 🏷️ **CODE VERIFIED** | `KasuwaExecutor.sol` validates caller authorization and routes execution to `KasuwaPolicy.sol` |

---

## ⚡ 9. Somnia Reactivity Truth Standard

| Layer | Status | Verification Detail |
|---|:---:|---|
| **IMPLEMENTED** | ✅ **VERIFIED** | [`contracts/KasuwaReactiveHandler.sol`](./contracts/KasuwaReactiveHandler.sol) written with reentrancy guard |
| **COMPILED** | ✅ **VERIFIED** | Solidity `^0.8.24` compilation verified without warnings |
| **DEPLOYED** | ✅ **LIVE_ONCHAIN** | Mined on Somnia Shannon at Block `#478456927` (`0x9D60C436CCD13055EE4CeAb4b8E77d24c2CA5c02`) |
| **REGISTERED** | ✅ **CODE VERIFIED** | `onMarketSettled()` handler configured to emit `RolloverWindowOpen` |
| **TRIGGERED** | 🏷️ **UNVERIFIED LIVE** | Awaits live testnet settlement event trigger |
| **EXECUTED** | 🏷️ **UNVERIFIED LIVE** | Live automated callback execution not yet independently demonstrated |

---

## 📊 10. DreamDEX Event Contract Integration

* **Discovery Method**: Keyed strictly by unique **32-byte `marketId`** to handle pool recycling natively (SpotPool HTTP `/v0/markets` confusion eliminated).
* **Active Market Target**: `0x679795a0195a1b76cdebb7c51d74e058aee92919b8c3389af86ef24535e8a28c` (BTC 15-Minute Binary Downside Window).
* **Parameters**: 900s interval, USDso collateral (`0x9c32...b171`), Best Ask: \$0.32, Best Bid: \$0.28, Spread: 4.0%, Liquidity: 500 contracts.
* **Order Flow Lifecycle**:
  $$\text{ORDER\_CONSTRUCTED} \longrightarrow \text{ORDER\_SUBMITTED} \longrightarrow \text{ORDER\_RESTED} \longrightarrow \text{ORDER\_FILLED (SIMULATED)}$$

---

## 📐 11. Deterministic Quantitative Risk Engine

All financial sizing is calculated via deterministic closed-form equations (zero AI hallucinations):

### 1. Risk Delta ($\Delta R$)
$$\Delta R = \Delta P - (\theta \times E)$$
*Where $\Delta P$ is realized spot price change, $\theta$ is tolerance threshold (e.g. 8%), and $E$ is total exposure.*

### 2. Black-Scholes Binary Downside Probability ($N(-d_2)$)
$$d_2 = \frac{\ln(S / K) + (r - \frac{1}{2}\sigma^2)T}{\sigma \sqrt{T}} \quad \Big| \quad P(\text{Breach}) = N(-d_2)$$
*Calculated via Abramowitz & Stegun polynomial approximation of standard normal CDF.*

### 3. Conditional Value at Risk (CVaR 97.5% Expected Shortfall)
$$\text{CVaR}_{97.5\%} = E \times \sigma_{\text{daily}} \times 2.338$$
*Measures the expected loss in the worst 2.5% of tail-risk scenarios.*

### 4. Optimal Allocation (Kelly Criterion $f^*$)
$$f^* = \frac{p \cdot b - q}{b}$$
*Where $p$ is downside probability, $b$ is contract payout odds ($\frac{\$1.00}{\text{Price}}$), and $q = 1 - p$.*

---

## 🔁 12. Continuous Protection Across Rolling Windows

```
BTC Protection Window #1 (15m)
       ↓
Expiry Approaches (Settlement evaluated)
       ↓
Risk Recalculated by Quant Engine
       ↓
Window #2 Selected (32-byte marketId_2)
       ↓
Policy Revalidated (Budget & spread check)
       ↓
Bounded Execution via Session Key
       ↓
Protection Continues Monotonically
```

---

## 🔍 13. Definitive Four-Tier Proof Center Matrix

| Tier | Capability | Status | Evidence & Verification Details |
|---|---|:---:|---|
| **Tier A: On-Chain** | Somnia Shannon RPC (50312) | ✅ VERIFIED | Live RPC query at Head Block `#478,460,644` |
| **Tier A: On-Chain** | KasuwaPolicy Protocol Contract | ✅ VERIFIED | [`0xAc8c...140d1d`](https://shannon-explorer.somnia.network/address/0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d) (**4,207 Bytes Verified Bytecode**) |
| **Tier A: On-Chain** | KasuwaExecutor Session Router | ✅ VERIFIED | [`0x80Ac...4B7c69c`](https://shannon-explorer.somnia.network/address/0x80AcBF398663079edBfF26132C9AC04204B7c69c) (**3,505 Bytes Verified Bytecode**) |
| **Tier A: On-Chain** | USDso Collateral Token | ✅ VERIFIED | [`0x9c32...b171`](https://shannon-explorer.somnia.network/address/0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171) (**7,532 Bytes Verified Bytecode**) |
| **Tier A: On-Chain** | DreamDEX Testnet Faucet | ✅ VERIFIED | [`0x89Eb...6B7C`](https://shannon-explorer.somnia.network/address/0x89Ebc05dE83aB9752B95030218BB10A542b96B7C) (**2,192 Bytes Verified Bytecode**) |
| **Tier A: On-Chain** | Funded Signer Wallet | ✅ VERIFIED | [`0x0776...22DA`](https://shannon-explorer.somnia.network/address/0x07764D9031b8747e28d3E1601Ff1417569de22DA) (**1.000000 STT Gas Balance**) |
| **Tier B: Live Infra** | Event Contract Discovery | 🏷️ SPECIFIED | Keyed strictly by 32-byte `marketId` (`0x679795...`) |
| **Tier C: Code-Verified** | Quant Risk Engine | ✅ VERIFIED | Black-Scholes $N(-d_2)$, CVaR 97.5%, Kelly $f^*$ verified |
| **Tier C: Code-Verified** | EIP-7702 Payload Hashing | ✅ VERIFIED | secp256k1 key derivation & EIP-7702 hashing verified |
| **Tier C: Code-Verified** | 4 Fail-Closed Invariants | ✅ VERIFIED | 4/4 invariant rejection paths tested |
| **Tier C: Code-Verified** | Two-Tier Idempotency | ✅ VERIFIED | Duplicate market settlements prevented |
| **Tier D: Simulation** | Price Drop Shock Harness | 🏷️ SIMULATED | Deterministic BTC \$64.8k $\to$ \$62.8k drop benchmark |
| **Tier D: Simulation** | 133ms Reaction Benchmark | 🏷️ SIMULATED | Hardware-timed risk calculation benchmark |
| **Tier D: Simulation** | CLOB Limit Order Fill | 🏷️ SIMULATED | Synthetic \$0.28 NO/PUT limit order fill |

---

## 📜 14. Live On-Chain Contract Registry (Somnia Shannon — 50312)

| Contract | On-Chain Address | Runtime Bytecode | Somnia Explorer Link |
|---|---|:---:|:---:|
| **KasuwaPolicy.sol** | `0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d` | **4,207 Bytes** | [View on Explorer ↗](https://shannon-explorer.somnia.network/address/0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d) |
| **KasuwaExecutor.sol** | `0x80AcBF398663079edBfF26132C9AC04204B7c69c` | **3,505 Bytes** | [View on Explorer ↗](https://shannon-explorer.somnia.network/address/0x80AcBF398663079edBfF26132C9AC04204B7c69c) |
| **KasuwaReactiveHandler.sol**| `0x9D60C436CCD13055EE4CeAb4b8E77d24c2CA5c02` | Mined (#478456927) | [View on Explorer ↗](https://shannon-explorer.somnia.network/address/0x9D60C436CCD13055EE4CeAb4b8E77d24c2CA5c02) |
| **USDso Token** | `0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171` | **7,532 Bytes** | [View on Explorer ↗](https://shannon-explorer.somnia.network/address/0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171) |
| **DreamDEX Testnet Faucet**| `0x89Ebc05dE83aB9752B95030218BB10A542b96B7C` | **2,192 Bytes** | [View on Explorer ↗](https://shannon-explorer.somnia.network/address/0x89Ebc05dE83aB9752B95030218BB10A542b96B7C) |
| **Deployer Wallet** | `0x07764D9031b8747e28d3E1601Ff1417569de22DA` | **1.000000 STT Gas** | [View on Explorer ↗](https://shannon-explorer.somnia.network/address/0x07764D9031b8747e28d3E1601Ff1417569de22DA) |

---

## 🧪 15. Automated Verification Test Suite

```bash
# 1. Run Unit & Invariant Protocol Suite (15/15 Passing - 100%)
npm test

# 2. Run 4-Tier On-Chain Truth Audit (13/13 Passing - 100%)
npm run test:audit

# 3. Run Automated Claim Auditor & Truth Enforcer
npm run audit:claims

# 4. Query Live Somnia Shannon Testnet Wallet & Gas Balance (1.0 STT)
npm run verify:testnet-wallet

# 5. Verify all 5 Next.js Web Routes (5/5 Passing - 100%)
npm run verify:routes
```

---

## 📊 16. Verification Test Results

```text
================================================================================
  KASUWASHIELD PROTOCOL VERIFICATION TEST RESULTS
================================================================================
  [✓] Protocol Unit & Invariant Tests: 15 / 15 PASSING (100%)
  [✓] 4-Tier On-Chain Truth Audit:     13 / 13 PASSING (100%)
  [✓] Automated Claim Auditor:         100% PASSING (Zero claim violations)
  [✓] Next.js Web Routes:              5 / 5 PASSING (100%)
  [✓] Live Testnet Wallet Query:       1.000000 STT (Head Block #478,460,644)
================================================================================
```

---

## ⏱️ 17. 2-Minute Demo Script

* **0:00–0:20 (The Problem)**: *"DreamDEX Event Contracts expire every 15 minutes. Portfolio risk does not. Manually approving 96 daily transactions is impractical."*
* **0:20–0:40 (Policy Configuration)**: Configure \$25,000 exposure, 80% coverage target, and a \$100 max budget ceiling on the dashboard.
* **0:40–1:00 (Bounded Authorization)**: Show the scoped session key derivation and EIP-7702 authorization payload bounded strictly to `executeAutoRoll()`.
* **1:00–1:20 (Risk Detection & Hedge Sizing)**: Trigger the -3.1% shock replay; show the deterministic Black-Scholes $N(-d_2)$ calculation and 133ms reaction benchmark.
* **1:20–1:40 (Continuous Rollover)**: Show the 15-minute settlement transition into the replacement window with monotonic roll tracking and budget deduction.
* **1:40–1:55 (Fail-Closed Safety)**: Demonstrate stale market rejection, slippage rejection (>5%), and budget exhaustion kill-switch.
* **1:55–2:00 (Proof Center)**: Open `/proof` to show verified contract bytecode on Somnia Explorer and download the cryptographic JSON receipt.

---

## ⚖️ 18. Competitive Positioning

| Capability | KasuwaShield |
|---|:---:|
| **Exposure-First Protection** | ✅ |
| **Deterministic Hedge Sizing (Black-Scholes / CVaR / Kelly)** | ✅ |
| **Bounded Session Key Autonomy** | ✅ |
| **Fail-Closed Safety Safeguards (4 Invariants)** | ✅ |
| **Event Contract Integration (32-byte marketId)** | ✅ |
| **Continuous Multi-Window Rollover Thesis** | ✅ |
| **On-Chain Bytecode-Verified Contracts** | ✅ |
| **EIP-7702 Scoped Delegation Architecture** | ✅ |
| **Somnia Reactivity Rollover Architecture** | ✅ |
| **Transparent 4-Tier Truth Disclosure** | ✅ |

---

## ⚠️ 19. Truth Disclosure & Limitations

* **Live On-Chain**: Somnia Shannon connection (Chain ID: `50312`), funded wallet (`1.0 STT`), USDso token (`0x9c32...`), faucet (`0x89Eb...`), `KasuwaPolicy` (`0xAc8c...`), `KasuwaExecutor` (`0x80Ac...`), and `KasuwaReactiveHandler` (Mined #478456927).
* **Code-Verified**: Black-Scholes binary math, CVaR 97.5%, Kelly allocation, EIP-7702 payload hashing, and fail-closed rejection invariants.
* **Simulated**: Price drop shock replay (BTC \$64.8k $\to$ \$62.8k), CLOB limit order fill (synthetic \$0.28 limit fill due to testnet taker liquidity), and market settlement redemption.
* **Unverified Live**: Live on-chain dispatch of Somnia Reactivity callbacks and client-side browser-wallet EIP-7702 designation.

---

## 🗺️ 20. Roadmap

- [ ] Mainnet deployment with live DreamDEX CLOB taker liquidity.
- [ ] Integration with native Somnia on-chain reactivity precompiles.
- [ ] Expanded multi-asset hedging vaults (SOL, SOMI, and stablecoin pegs).
- [ ] Dynamic multi-tier portfolio volatility rebalancing.
