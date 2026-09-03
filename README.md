# KasuwaShield

### Autonomous Portfolio Protection for DreamDEX Event Contracts

> **Event Contracts expire. Portfolio risk does not.**  
> KasuwaShield turns short-duration DreamDEX Event Contracts into a continuously renewed hedge policy.  
> **One-time authorization. Bounded autonomy. Automatic rollover.**

[![Somnia Network](https://img.shields.io/badge/Network-Somnia_Shannon_(50312)-10b981?style=flat-square)](https://shannon-explorer.somnia.network)
[![DreamDEX Protocol](https://img.shields.io/badge/Integration-DreamDEX_Event_Contracts-38bdf8?style=flat-square)](https://dreamdex.io)
[![Solidity](https://img.shields.io/badge/Contracts-Solidity_^0.8.24-6366f1?style=flat-square)](./contracts)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5.5-3178c6?style=flat-square)](./packages)
[![EIP-7702 Architecture](https://img.shields.io/badge/Architecture-EIP--7702_Scoped_Delegation-a855f7?style=flat-square)](./packages/execution)
[![Somnia Reactivity](https://img.shields.io/badge/Architecture-Somnia_Reactive_Handler-ec4899?style=flat-square)](./contracts/KasuwaReactiveHandler.sol)
[![Testnet Ready](https://img.shields.io/badge/Status-Hackathon_Testnet_Prototype-f59e0b?style=flat-square)](https://shannon-explorer.somnia.network)

**Forensic Audit**: [`FINAL_FORENSIC_AUDIT.md`](./FINAL_FORENSIC_AUDIT.md) | **Wiring Proof**: [`EXECUTOR_POLICY_WIRING_PROOF.md`](./EXECUTOR_POLICY_WIRING_PROOF.md) | **EIP-7702 Matrix**: [`EIP7702_PROOF.md`](./EIP7702_PROOF.md)  
**Machine-Readable Ledgers**: [`artifacts/onchain-verification.json`](./artifacts/onchain-verification.json) | [`artifacts/final-truth-report.json`](./artifacts/final-truth-report.json)

---

## ⚡ 1. One-Sentence Explanation

> **KasuwaShield monitors portfolio risk, calculates a bounded hedge, enforces execution policy, and prepares the next Event Contract hedge before the current protection window expires.**

> **This is a protection policy, not a prediction bot.**

---

## 🛑 2. The Problem

DreamDEX Event Contracts are short-duration instruments (typically 15-minute or 1-hour expiry windows). While they provide efficient, capped-risk binary derivatives, protecting a continuous spot portfolio exposure creates severe operational friction:

* **Repeated Authorization Friction**: Maintaining continuous 24-hour downside protection requires repeated manual wallet approvals across successive windows (e.g. 96 separate transactions per day for 15-minute contracts).
* **Window Gaps & Missed Rollovers**: Any delay in approving the next contract leaves the underlying portfolio completely unprotected against sudden market drops.
* **Inconsistent Sizing & Emotional Execution**: Manual traders struggle to calculate mathematically optimal hedge ratios ($N(-d_2)$, CVaR, and Kelly fractions) during fast-moving market dislocations.

> **The problem is not only choosing the correct Event Contract. The harder problem is maintaining protection as the underlying risk persists.**

---

## 💡 3. The Solution

KasuwaShield introduces **continuous, stateful portfolio protection**:

* The user defines an explicit **Risk Policy** once (underlying exposure, maximum protection percentage, spending budget ceiling, and slippage tolerance).
* The user grants a **scoped, non-custodial authorization** (via EIP-7702 architecture) restricted strictly to hedge execution.
* The deterministic **Quantitative Risk Engine** monitors spot exposure, dynamically sizes downside (PUT/NO) Event Contracts, executes bounded limit orders on DreamDEX, and automatically rolls protection into the next window upon settlement.

```
Portfolio Exposure
       ↓
Risk Engine
       ↓
Hedge Ratio
       ↓
Policy Validation
       ↓
Authorized Execution
       ↓
Event Contract
       ↓
Monitoring
       ↓
Expiry
       ↓
Rollover
       ↓
Next Hedge
```

> **The hedge is treated as a renewable protection window rather than a one-off trade.**

---

## ⚖️ 4. Why This Is Different

| Dimension | Traditional Event Contract Trading | Prediction Bot | Manual Portfolio Hedge | KasuwaShield |
|---|---|---|---|---|
| **Primary Objective** | Directional speculation | Profit maximization / Alpha | Periodic risk reduction | **Continuous portfolio preservation** |
| **Position Sizing** | Discretionary / Fixed bet | Model-driven speculative sizing | Arbitrary manual sizing | **Deterministic CVaR / Black-Scholes / Kelly** |
| **Authorization** | Per-trade wallet popup | Custodial API key / Bot wallet | Per-trade wallet popup | **One-time EIP-7702 bounded delegation** |
| **Monitoring** | Manual screen watching | Continuous market polling | Sporadic manual checks | **Continuous risk & lifecycle monitoring** |
| **Expiry Handling** | Position expires; trader exits | Settles to cash balance | Position lapses; manual rebuild | **Automatic rollover into replacement window** |
| **Risk Limits** | None enforced | Algorithmic stop-loss | Mental stop-loss | **Strict fail-closed policy invariants** |
| **Failure Behavior** | User error / missed window | Unbounded execution risk | Unhedged portfolio drop | **Fail-closed refusal to execute** |

> **Most Event Contract applications optimize prediction, execution, or manual hedging. KasuwaShield focuses on the missing lifecycle layer: continuously maintaining bounded protection across expiring Event Contract windows.**

---

## 🏗️ 5. Architecture

```mermaid
flowchart TD
    User([User EOA]) -->|1. Configures Policy & Scope| PolicyEngine[Policy Engine]
    User -->|2. Signs Scoped Delegation| AuthLayer[EIP-7702 Auth Layer]
    
    RiskEngine[Quantitative Risk Engine] -->|Monitors Spot Risk| PolicyEngine
    PolicyEngine -->|Evaluates Safety Invariants| SafetyGates{Fail-Closed Gates}
    
    SafetyGates -->|Breached: Stale / Slippage / Budget| Refuse[Refuse Execution & Alert]
    SafetyGates -->|Passed: Valid Bounds| Executor[KasuwaExecutor.sol]
    
    AuthLayer -->|Validates Session Key| Executor
    Executor -->|Submits Limit Order| DreamDEX[DreamDEX Event Contracts CLOB]
    
    DreamDEX -->|Market Settles at Expiry| SomniaInfra[Somnia Infrastructure]
    SomniaInfra -->|Emits Settlement Event| ReactiveHandler[KasuwaReactiveHandler.sol]
    ReactiveHandler -->|Triggers Rollover Window| RiskEngine
```

### Fail-Closed Execution Invariants:
1. **Stale / Expired Market**: If market expiry $\le \text{now} + 60\text{s}$, execution is blocked.
2. **Insufficient Liquidity**: If orderbook depth < required contract units, order is rejected.
3. **Excessive Spread / Slippage**: If spread > policy ceiling (>5%), order is rejected.
4. **Budget Exhaustion**: If cumulative expenditure reaches `totalBudgetUSD`, execution terminates safely.
5. **Duplicate Processing**: Two-tier idempotency (`processedMarkets[marketId]`) prevents duplicate execution.

---

## 📐 6. Quantitative Risk Engine

Financial sizing is calculated via deterministic closed-form formulations without speculative AI heuristics:

### 1. Residual Risk Delta ($\Delta R$)
$$\Delta R = \Delta P - (\theta \times E)$$
*Where $\Delta P$ is portfolio price change, $\theta$ is hedge ratio, and $E$ is spot asset exposure.*

### 2. Black-Scholes Binary Downside Probability ($N(-d_2)$)
$$d_2 = \frac{\ln(S / K) + (r - \frac{1}{2}\sigma^2)T}{\sigma \sqrt{T}} \quad \Big| \quad P(\text{Downside Breach}) = N(-d_2)$$
*Calculated via Abramowitz & Stegun polynomial approximation of standard normal CDF.*

### 3. Conditional Value at Risk (CVaR 97.5% Expected Shortfall)
$$\text{CVaR}_{97.5\%} = E \times \sigma_{\text{daily}} \times 2.338$$
*Measures expected portfolio loss in the worst 2.5% of tail-risk market dislocations.*

### 4. Optimal Allocation (Kelly Criterion $f^*$)
$$f^* = \frac{p \cdot b - q}{b}$$
*Where $p$ is downside probability, $b$ is contract payout odds ($\frac{\$1.00}{\text{Price}}$), and $q = 1 - p$.*

> *Disclaimer: KasuwaShield is a prototype risk-management architecture built for hackathon demonstration, not certified financial advice.*

---

## 🔄 7. Continuous Rollover — The Hero Feature

### Protection Doesn't End When the Contract Does

```
┌─────────────────┐
│   UNPROTECTED   │
└────────┬────────┘
         │ Spot exposure detected
         ▼
┌─────────────────┐
│  RISK_DETECTED  │
└────────┬────────┘
         │ Deterministic risk sizing (BS / CVaR / Kelly)
         ▼
┌─────────────────┐
│ HEDGE_CALCULATED│
└────────┬────────┘
         │ Policy checks passed & session key signed
         ▼
┌─────────────────┐
│  HEDGE_ACTIVE   │◄────────────────────────────────┐
└────────┬────────┘                                 │
         │ Continuous monitoring                    │
         ▼                                          │
┌─────────────────┐                                 │
│   MONITORING    │                                 │
└────────┬────────┘                                 │
         │ Expiry window approaches                 │
         ▼                                          │
┌──────────────────┐                                │
│ROLLOVER_REQUIRED │                                │
└────────┬─────────┘                                │
         │ Reactive trigger / new market discovered │
         ▼                                          │
┌──────────────────┐                                │
│ REHEDGE_PENDING  │────────────────────────────────┘
└──────────────────┘  Policy revalidated & replacement executed
```

* **Zero Infinite Loops**: Maximum retry limits and monotonic state transitions.
* **Idempotent Accounting**: `processedMarkets[marketId]` prevents duplicate fills on identical windows.
* **Budget Tracking**: Roll costs deduct monotonically from authorized budget.

---

## 🔒 8. Security Model

* **Non-Custodial Design**: Session keys possess **zero withdrawal permissions** and cannot transfer user collateral.
* **Strict Policy Bounds**: Every transaction must pass `validateOrder()` against on-chain limits.
* **Fail-Closed Guarantee**: In unsafe market conditions, the protocol **refuses execution** rather than risking capital.

---

## 📜 9. Smart Contracts & Deployment Evidence

### Verified On-Chain Contracts (Somnia Shannon — Chain ID: `50312`)

| Contract | Address | Runtime Bytecode | Somnia Explorer Link |
|---|---|:---:|:---:|
| **KasuwaPolicy.sol** | `0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d` | **4,207 Bytes** | [View on Explorer ↗](https://shannon-explorer.somnia.network/address/0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d) |
| **KasuwaExecutor.sol** | `0x80AcBF398663079edBfF26132C9AC04204B7c69c` | **3,505 Bytes** | [View on Explorer ↗](https://shannon-explorer.somnia.network/address/0x80AcBF398663079edBfF26132C9AC04204B7c69c) |
| **KasuwaReactiveHandler.sol**| `0x9D60C436CCD13055EE4CeAb4b8E77d24c2CA5c02` | Mined (#478456927) | [View on Explorer ↗](https://shannon-explorer.somnia.network/address/0x9D60C436CCD13055EE4CeAb4b8E77d24c2CA5c02) |
| **USDso Token** | `0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171` | **7,532 Bytes** | [View on Explorer ↗](https://shannon-explorer.somnia.network/address/0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171) |
| **DreamDEX Testnet Faucet**| `0x89Ebc05dE83aB9752B95030218BB10A542b96B7C` | **2,192 Bytes** | [View on Explorer ↗](https://shannon-explorer.somnia.network/address/0x89Ebc05dE83aB9752B95030218BB10A542b96B7C) |
| **Funded Signer Wallet** | `0x07764D9031b8747e28d3E1601Ff1417569de22DA` | **1.000000 STT Gas** | [View on Explorer ↗](https://shannon-explorer.somnia.network/address/0x07764D9031b8747e28d3E1601Ff1417569de22DA) |

### DreamDEX Protocol Core Reference Addresses (Somnia Shannon)
* **BinaryMarketsModule**: `0x3ecC694Cef705358864a646142ac17A90E29e388`
* **MarketsCore**: `0x2802504314685D89bF6C992CA5a8e7cC78bc0294`
* **BinarySettlement**: `0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23`
* **OutcomeToken6909**: `0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9`
* **OracleHub**: `0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b`
* **CollateralRouter**: `0xbC0C9834B15ACE38bB50dDaa7d7f7C7CC4DC183C`

---

## 🔌 10. DreamDEX Integration

* **Dynamic Discovery**: Markets are keyed by unique **32-byte `marketId`** (e.g. `0x679795a0...` for BTC 15m downside) to avoid static pool address collision across recurring windows.
* **Order Construction**: Builds bounded limit orders against the DreamDEX CLOB orderbook with price ceiling and max slippage validation.
* **Settlement Awareness**: Tracks binary settlement outcomes to trigger replacement hedge sizing.

---

## ⚡ 11. Somnia Integration

* **High-Frequency Suitability**: Sub-second block times enable rapid risk evaluation and window-to-window transitions without coverage gaps.
* **Low-Cost Execution**: Sub-cent gas fees allow frequent 15-minute rollovers without eroding protection budgets.
* **Reactive Architecture**: On-chain reactive contract interfaces enable event-driven rollover upon market settlement.

---

## 🔑 12. EIP-7702 Architecture

> **EIP-7702 provides the authorization model KasuwaShield is designed around: a user can authorize bounded execution logic without turning the system into a conventional custodial trading account.**

* **Implemented & Code-Verified**:
  * In-memory `secp256k1` ephemeral session keypair derivation (`session-key-manager.ts`).
  * EIP-7702 delegation tuple construction and Keccak256 authorization hashing.
  * Smart contract authorization verification (`KasuwaExecutor.sol`).
* **Unclaimed / Not Verified Live**:
  * Live interactive browser-wallet EOA designation (due to current lack of native MetaMask EIP-7702 UI support).

---

## 🔍 13. Evidence & Truth Model (Proof Center: `/proof`)

| Tier | Category | Status | Details & Verification Artifacts |
|---|---|:---:|---|
| **Tier A** | Verified On-Chain | ✅ **LIVE_ONCHAIN** | Deployed `KasuwaPolicy` (4.2KB), `KasuwaExecutor` (3.5KB), USDso Token (7.5KB), Faucet (2.2KB), Head Block `#478,522,005` |
| **Tier B** | Live Infrastructure | 🏷️ **TESTNET_SPECIFIED** | DreamDEX 32-byte `marketId` discovery, orderbook depth & spread boundary parsing |
| **Tier C** | Code-Verified | ✅ **100% TESTED** | Black-Scholes $N(-d_2)$, CVaR 97.5%, Kelly $f^*$, 4 fail-closed invariants, idempotency guards |
| **Tier D** | Simulated Benchmarks | 🏷️ **SIMULATED** | BTC price shock replay (\$64.8k $\to$ \$62.8k), 133ms reaction benchmark, synthetic CLOB limit fill |

---

## 🎬 14. 2-Minute Judge Demo Flow

1. **Dashboard (`/`)**: Inspect portfolio exposure (\$25,000 BTC), current coverage (80%), and live Somnia Shannon on-chain status.
2. **Policy Configuration (`/risk`)**: Adjust protection percentage, budget limit (\$100), and max slippage ceiling.
3. **Stress Replay (`/replay`)**: Trigger a -3.1% market shock; observe deterministic Black-Scholes downside probability calculation.
4. **Execution & Rollover (`/execution`)**: Watch the 15-minute window transition into the next protection window with monotonic budget deduction.
5. **Safeguards Check**: Observe fail-closed rejection when simulating stale markets or wide spreads (>5%).
6. **Proof Center (`/proof`)**: Verify runtime bytecode on Somnia Explorer and download the cryptographic audit receipt JSON.

---

## 🧪 15. Verification & Automated Test Results

```text
================================================================================
  KASUWASHIELD PROTOCOL VERIFICATION SUITE
================================================================================
  [✓] Protocol Unit & Invariant Tests: 15 / 15 PASSING (100%)
  [✓] 4-Tier On-Chain Truth Audit:     13 / 13 PASSING (100%)
  [✓] Automated Claim Auditor:         100% PASSING (Zero claim violations)
  [✓] Next.js Web Routes:              5 / 5 PASSING (Status 200)
  [✓] Live Testnet Wallet Query:       1.000000 STT (Head Block #478,522,005)
================================================================================
```

---

## 🛠️ 16. Reproducibility & Local Setup

```bash
# 1. Clone repository
git clone https://github.com/Xzavior34/KasuwaShield.git
cd KasuwaShield

# 2. Run unit and invariant test suite (15/15 passing)
npm test

# 3. Run 4-tier on-chain truth audit (13/13 passing)
npm run test:audit

# 4. Run automated claim auditor
npm run audit:claims

# 5. Verify all web routes
npm run verify:routes

# 6. Start local demo server
node server.js
# Access dashboard at http://localhost:3000
```

---

## 📂 17. Repository Map

```text
KasuwaShield/
├── contracts/                        # Solidity ^0.8.24 Smart Contracts
│   ├── KasuwaPolicy.sol              # Deployed on-chain (0xAc8c...140d1d - 4,207B)
│   ├── KasuwaExecutor.sol            # Deployed on-chain (0x80Ac...4B7c69c - 3,505B)
│   └── KasuwaReactiveHandler.sol     # Reactive settlement callback (Mined #478456927)
├── packages/
│   ├── math/                         # Deterministic Quant Risk Engine (BS, CVaR, Kelly)
│   ├── execution/                    # EIP-7702 session key manager & order constructor
│   └── shared/                       # Deployed contract addresses & Somnia RPC config
├── apps/web/                         # Next.js 14 Web Application
│   ├── app/page.tsx                  # Exposure Dashboard
│   ├── app/risk/page.tsx             # Policy Configuration
│   ├── app/execution/page.tsx        # Rollover Lifecycle
│   ├── app/replay/page.tsx           # Stress Replay Engine
│   └── app/proof/page.tsx            # 4-Tier Truth & Evidence Center
├── artifacts/
│   └── truth-audit.json              # Machine-readable truth ledger
├── scripts/                          # Forensic verification & test harnesses
│   ├── run-tests.ts                  # Protocol unit test suite
│   ├── e2e-proof-test.ts             # On-chain truth audit
│   └── audit-claims.ts               # Claim compliance auditor
├── FINAL_AUDIT.md                    # 14-section forensic audit report
└── README.md                         # Authoritative protocol documentation
```

---

## ⚠️ 18. Limitations & Truth Disclosure

### What This Prototype Proves:
* Deterministic quantitative risk sizing without speculative AI hallucinations.
* Strict fail-closed policy enforcement (stale market, wide spread, budget limit).
* Idempotent multi-window rollover state machine.
* Bytecode-verified smart contracts live on Somnia Shannon testnet.
* Dynamic DreamDEX 32-byte `marketId` discovery.

### What Is Explicitly Not Claimed:
* Production mainnet autonomous trading scale.
* Live browser-wallet EIP-7702 interactive designation.
* Live external reactive callback dispatch (testnet trigger pending).
* Guaranteed continuous CLOB taker fills (simulated due to testnet liquidity).
* Guaranteed financial returns.

---

## 🗺️ 19. Roadmap

- [ ] Mainnet deployment on Somnia Mainnet with production DreamDEX CLOB liquidity.
- [ ] Integration with native Somnia on-chain reactivity precompiles for sub-second reactive execution.
- [ ] Multi-asset protection vaults (supporting BTC, ETH, SOL, SOMI, and stablecoin depeg risks).
- [ ] Direct ERC-4337 / EIP-7702 bundler relayer integration for seamless client-side signing.

---

## 🚀 20. Final Takeaway

> **KasuwaShield turns expiring DreamDEX Event Contracts from isolated bets into a continuously renewed, policy-controlled portfolio protection layer.**

* **Live Demo**: [http://localhost:3000](http://localhost:3000)
* **GitHub Repository**: [https://github.com/Xzavior34/KasuwaShield](https://github.com/Xzavior34/KasuwaShield)
* **Proof Center**: `/proof`
* **Hackathon**: Somnia × DreamDEX Event Contracts Hackathon 2026
