# KasuwaShield — Autonomous Portfolio Risk Agent

> **BUIDL One-Liner:** KasuwaShield transforms short-duration DreamDEX Event Contracts from speculative retail bets into a continuous, policy-driven portfolio downside protection primitive on Somnia Network.

[![Network: Somnia Shannon](https://img.shields.io/badge/Network-Somnia_Shannon_Testnet_(50312)-10b981?style=flat-square)](https://shannon-explorer.somnia.network)
[![Smart Contracts](https://img.shields.io/badge/Contracts-Configured_in_Repo-67e8f9?style=flat-square)](https://shannon-explorer.somnia.network/address/0x43a18f29d10e42819873a90a218291b87a82910a)
[![Account Abstraction](https://img.shields.io/badge/Standard-EIP--7702_Delegated_Execution_Architecture-c084fc?style=flat-square)](https://eips.ethereum.org/EIPS/eip-7702)
[![Unit Tests](https://img.shields.io/badge/Unit_Tests-10%2F10_Passing_(100%25)-34d399?style=flat-square)](./scripts/run-tests.ts)
[![Truth Audit Tests](https://img.shields.io/badge/Truth_Audit-13%2F13_Verified_(100%25)-38bdf8?style=flat-square)](./scripts/e2e-proof-test.ts)

**Tagline**: *"Don't predict the downside. Protect the position continuously."*  
**Hackathon**: Somnia × DreamDEX Event Contracts Hackathon 2026  
**Track**: Autonomous Risk Infrastructure & Event Contracts  
**Network**: Somnia Shannon Testnet (`Chain ID: 50312`, RPC: `https://dream-rpc.somnia.network`)  
**GitHub Repository**: [https://github.com/Xzavior34/KasuwaShield](https://github.com/Xzavior34/KasuwaShield)  

---

## ⚡ 1. The Core Problem

DreamDEX 15-minute binary Event Contracts are efficient, capped-risk financial derivatives. However, for continuous portfolio risk management, their short duration creates an impossible user friction:

* To maintain continuous downside insurance for a \$25,000 spot crypto exposure across a 24-hour day, a user would need to evaluate the orderbook and approve **~96 separate wallet transactions** (one every 15 minutes), without missing a single settlement window.
* Because manual continuous re-hedging is impractical, event contracts are typically relegated to isolated speculative bets rather than fulfilling their economic potential: **granular, cost-effective downside insurance**.

---

## 🛡️ 2. The Solution

**KasuwaShield provides the autonomous risk infrastructure layer that makes continuous portfolio hedging practical**:

1. **Configure Once**: The user defines portfolio exposure (\$25,000 BTC), target coverage (80%), duration (24h), and a maximum budget ceiling (\$100).
2. **Authorize Once (EIP-7702 Architecture)**: The user signs a single scoped authorization payload delegating ephemeral session key execution strictly to `executeAutoRoll()` on allowlisted DreamDEX contracts.
3. **Continuous Monitoring & Reactive Rollover**: `KasuwaReactiveHandler.sol` is designed to listen for on-chain settlement events on Somnia L1 and signal the next replacement hedge rollover without requiring repeated wallet popups.
4. **Sovereign Non-Custodial Control**: The session key is strictly restricted from transferring collateral or withdrawing funds, and the user can revoke execution permissions on-chain in 1 click at any time.

---

## 💡 3. Why It Is Different

```
TRADITIONAL PREDICTION MARKET UX:
[ User Bets ] ──> [ Wait 15 Mins ] ──> [ Settlement ] ──> [ Manual Repost / 96 Popups a Day ]

KASUWASHIELD CONTINUOUS PROTECTION:
[ Authorize Policy ] ──> [ Quant Risk Engine ] ──> [ Bounded Auto-Roll ] ──> [ Reactive Rollover ] ──> [ Continuous Coverage ]
```

*KasuwaShield explores a different layer of the stack: policy-driven continuous hedge maintenance rather than one-off speculative prediction trading.*

---

## 🏗️ 4. System Architecture Flow

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
│  ├── KasuwaPolicy.sol          Enforces remainingBudgetUSD & hard caps │
│  ├── KasuwaExecutor.sol        EIP-7702 delegated execution router     │
│  └── KasuwaReactiveHandler.sol Reactive settlement callback listener   │
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

## 📐 5. Deterministic Quantitative Risk Engine

All financial sizing is calculated via deterministic closed-form equations (zero AI hallucinations):

### 1. Risk Delta ($\Delta R$)
$$\Delta R = \Delta P - (\theta \times E)$$
*Where $\Delta P$ is realized spot price change, $\theta$ is tolerance threshold, and $E$ is total exposure.*

### 2. Optimal Allocation (Kelly Criterion $f^*$)
$$f^* = \frac{p \cdot b - q}{b}$$
*Where $p$ is downside probability, $b$ is contract payout odds ($\frac{\$1.00}{\text{Price}}$), and $q = 1 - p$.*

### 3. Value at Risk (VaR 95%) & Coverage Gap
$$\text{Coverage Ratio } C = \left(\frac{H}{E}\right) \times 100\% \quad \Big| \quad \text{Coverage Gap} = \text{Target Coverage} - C$$

---

## 🔒 6. Fail-Closed Safety Model & 4 Rejection Invariants

KasuwaShield implements strict fail-closed policy enforcement. Automated rolls are rejected if any invariant is breached:

1. **Stale Market Rejection**: If an Event Contract has expired or finalized, the execution is blocked (`SKIP`).
2. **Illiquidity Rejection**: If orderbook depth is insufficient for the requested hedge size, the order is blocked (`POOR QUALITY`).
3. **Slippage Breach Rejection**: If the orderbook spread exceeds the policy ceiling (>5%), the order is rejected (`PRICE SKEW`).
4. **Budget Exhaustion Rejection**: If total cumulative roll cost exceeds `remainingBudgetUSD`, the policy terminates safely (`TERMINATED SAFE`).

---

## 🔁 7. Two-Tier Idempotency & Duplicate Prevention

To prevent duplicate rollover execution during RPC retries, re-orgs, or duplicate callbacks:
* **Off-Chain Deduplication**: `processedMarketIds` set tracks processed settlement events in memory.
* **On-Chain Policy Guard**: `KasuwaPolicy.sol` tracks monotonically increasing `rollsExecuted` and validates budget availability per `marketId`.

---

## 🔄 8. 9-Stage Continuous Lifecycle State Machine

```
[ UNPROTECTED ]
       │ (Spot drops below strike)
       ▼
[ RISK_DETECTED ] ──> [ HEDGE_CALCULATED ] ──> [ HEDGE_PENDING ]
                                                      │
                                                      ▼
[ MONITORING ] <────────────────────────────── [ HEDGE_ACTIVE ]
       │
       ▼ (15m window settlement)
[ ROLLOVER_REQUIRED ] ──> [ REHEDGE_PENDING ] ──> [ HEDGE_ACTIVE / SETTLED_PROFIT ]
```

---

## 📜 9. Smart Contract Reference (Somnia Shannon — Chain ID: 50312)

| Contract | Address / Reference | Role | Source File |
|---|---|---|---|
| **KasuwaPolicy.sol** | `0x43a18f29d10e42819873a90a218291b87a82910a` | Enforces budget caps & sovereign revocation | [`contracts/KasuwaPolicy.sol`](./contracts/KasuwaPolicy.sol) |
| **KasuwaExecutor.sol** | `0x8a92f03d12a4b89c72e411b932c0211598f39b1a` | EIP-7702 delegated execution router | [`contracts/KasuwaExecutor.sol`](./contracts/KasuwaExecutor.sol) |
| **KasuwaReactiveHandler.sol** | `contracts/KasuwaReactiveHandler.sol` | Somnia reactive settlement listener | [`contracts/KasuwaReactiveHandler.sol`](./contracts/KasuwaReactiveHandler.sol) |
| **tUSDC Collateral Token** | `0x68B1D87F95878fE05B998F19b66F4baba5De11d4` | Verified Testnet Collateral (Bytecode confirmed) | [View on Explorer ↗](https://shannon-explorer.somnia.network/address/0x68B1D87F95878fE05B998F19b66F4baba5De11d4) |

---

## 🔍 10. Four-Tier Truth Table & Verification Disclosure

| Tier | Component | Status | Verification Evidence |
|---|---|:---:|---|
| **Tier A: On-Chain** | Somnia Shannon RPC (50312) | ✅ VERIFIED | Live RPC query at Block `#478,110,388` |
| **Tier A: On-Chain** | tUSDC Collateral Token | ✅ VERIFIED | On-chain bytecode verified on Shannon Explorer |
| **Tier B: Live Infra** | DreamDEX Market Discovery | ✅ VERIFIED | Reads active 15m BTC `marketId` with expiry buffer |
| **Tier C: Code-Verified** | Quant Risk Engine | ✅ VERIFIED | 100% deterministic formulas verified in test suite |
| **Tier C: Code-Verified** | EIP-7702 Payload Hashing | ✅ VERIFIED | secp256k1 key derivation & EIP-7702 hashing verified |
| **Tier C: Code-Verified** | 4 Fail-Closed Invariants | ✅ VERIFIED | 4/4 invariant rejection paths tested |
| **Tier C: Code-Verified** | Two-Tier Idempotency | ✅ VERIFIED | Duplicate market settlements prevented |
| **Tier D: Simulation** | Price Drop Shock Harness | 🏷️ SIMULATED | Deterministic BTC \$64.8k $\to$ \$62.8k drop benchmark |
| **Tier D: Simulation** | 133ms Reaction Benchmark | 🏷️ SIMULATED | Hardware-timed risk calculation benchmark |
| **Tier D: Simulation** | CLOB Limit Order Fill | 🏷️ SIMULATED | Simulated \$0.28 NO/PUT limit order fill |

---

## 🧪 11. Test Results Summary

```bash
# 1. Run Unit & Invariant Protocol Suite (10/10 Passing - 100%)
node "tsx" scripts/run-tests.ts

# 2. Run 4-Tier On-Chain Truth Audit (13/13 Passing - 100%)
node "tsx" scripts/e2e-proof-test.ts

# 3. Verify all 5 Next.js Web Routes (5/5 Passing - 100%)
node scripts/verify-routes.js
```

---

## 🎬 12. Recommended 2-Minute Demo Path for Judges

1. **Dashboard Overview (`/`)**: Show portfolio exposure (\$25k BTC), target coverage (80%), and live breathing SVG chart.
2. **Interactive Configuration**: Drag the Exposure and Coverage sliders; watch required PUT contracts update in real time.
3. **Trigger Market Stress**: Click `⚠️ STRESS TEST`. Observe the 133ms risk reaction and the `✓ PROTECTION RESTORED` autonomous rollover.
4. **Inspect EIP-7702 Architecture (`/execution`)**: Review non-custodial session key bounds; click `🔄 REGENERATE KEY`.
5. **Backtest Volatility on Replay (`/replay`)**: Drag backtest sliders and click `[ ▶️ RUN PLAYBACK ]` for step-by-step playback.
6. **Verify Proof Center (`/proof`)**: Inspect live block height `#478,110,388`, 13/13 truth proofs, and click `[ 📥 EXPORT TRUTH AUDIT ]` to download the JSON receipt.

---

## 🛠️ 13. Getting Started

```bash
# Clone the repository
git clone https://github.com/Xzavior34/KasuwaShield.git
cd KasuwaShield

# Install dependencies
npm install

# Run full test suite
npm test

# Launch autonomous terminal
node server.js
# Access at http://localhost:3000
```

---

## 🗺️ 14. Roadmap

- [ ] Mainnet deployment with live DreamDEX CLOB taker liquidity.
- [ ] Integration with native Somnia on-chain reactivity precompiles.
- [ ] Expanded multi-asset hedging vaults (SOL, SOMI, and stablecoin pegs).
- [ ] Dynamic multi-tier portfolio volatility rebalancing.
