# KasuwaShield 🛡️

**Programmable Downside Protection using DreamDEX Event Contracts on Somnia Network**

> *"Don't predict the downside. Protect the position."*

---

## 📌 Executive Summary

**KasuwaShield** transforms DreamDEX Event Contracts from speculative prediction toys into **programmable downside-protection infrastructure** for existing crypto positions.

- **The Problem**: Prediction markets ask users *"What do you think will happen?"*, treating event contracts as binary gambling.
- **The KasuwaShield Insight**: Active traders and treasury managers ask *"What exposure do I already hold, and how much downside protection do I want?"*
- **The Solution**: An autonomous risk-management terminal that evaluates portfolio exposure, discovers live DreamDEX binary event contracts, calculates transparent protection requirements, enforces non-custodial risk policies, executes orders via DreamDEX CLOB, and automatically settles/redeems payouts via Somnia Reactivity.

Built for the **Somnia × DreamDEX Event Contracts Hackathon 2026** using **$0 of paid software, SaaS, or infrastructure**.

---

## ⚡ Core Differentiation & Judging Score Optimization

| Judging Criteria | Weight | How KasuwaShield Excels |
| :--- | :--- | :--- |
| **Innovation & Originality** | **20%** | Category shift from speculation to programmable protection. Event contracts become risk-management infrastructure. |
| **Technical Implementation** | **25%** | Full integration with `@somnia-chain/markets-sdk`, live `MarketCreated` log discovery, on-chain CLOB order placement, Somnia Reactive event callbacks, and EIP-7702 session key routing. |
| **User Experience & Design** | **20%** | Single primary action: `[ PROTECT MY POSITION ]`. Transparent market quality scoring (0–100) and live execution progress tracking. |
| **Business & Ecosystem Impact** | **20%** | Unlocks institutional and retail hedging use cases for DreamDEX event contracts, driving organic volume to Somnia pools. |
| **Presentation & Demo** | **15%** | Dedicated `/proof/[positionId]` page giving judges independent verification of every testnet block, execution hash, and reactivity event. |

---

## 🏗️ Architecture Overview

```
                        USER PORTFOLIO
                             │
                             ▼
                    KASUWASHIELD TERMINAL
                             │
                             ▼
                   PROTECTION ENGINE
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
        Exposure       Market Quality      Policy
        Engine            Engine           Engine
            │                │                │
            └────────────────┼────────────────┘
                             ▼
                     EXECUTION ENGINE
                             │
                             ▼
                    DREAMDEX CLOB POOL
                     (IBinaryPool)
                             │
                             ▼
                   ACTIVE SHIELD POSITION
                             │
                             ▼
                    MARKET RESOLUTION
                             │
                             ▼
                    SOMNIA REACTIVITY
                 (KasuwaReactiveHandler)
                             │
                             ▼
                     SETTLED & REDEEMED
                             │
                             ▼
                      ON-CHAIN PROOF
                   (/proof/[positionId])
```

---

## 🚀 Quickstart & Demo Setup

### Prerequisites
- Node.js 18+ & `npm` / `pnpm`
- Somnia Shannon Testnet Account with `STT` gas & `tUSDC` collateral

### 1. Installation
```bash
git clone https://github.com/your-username/kasuwa-shield.git
cd kasuwa-shield
npm install
```

### 2. Environment Configuration
Create a `.env` file at root:
```env
PRIVATE_KEY=0x_your_funded_testnet_private_key
RPC_URL=https://dream-rpc.somnia.network
WS_RPC_URL=wss://api.infra.testnet.somnia.network/ws
```

### 3. Run Demo Pre-Flight Check
Verify network connectivity, testnet balances, and active DreamDEX markets:
```bash
npm run preflight
```

### 4. Discover Live Binary Markets
```bash
npm run discover
```

### 5. Run Testnet Smoke Test
```bash
npm run smoke
```

### 6. Run Web Terminal UI
```bash
npm run dev --workspace=apps/web
```
Open `http://localhost:3000` to interact with the KasuwaShield terminal.

---

## 🔍 On-Chain Proof Verification

Every state transition in KasuwaShield is independently verifiable on the Somnia Shannon Testnet Explorer:
- **Explorer Base URL**: `https://shannon-explorer.somnia.network/`
- **Proof Terminal**: Visit `/proof/demo-pos-1` to inspect raw execution hashes, settlement resolution logs, and Somnia Reactive event callbacks.

---

## 🔐 Security & Non-Custodial Guarantee

KasuwaShield is completely non-custodial:
1. **No Funds Custody**: Funds remain in the user's wallet until an order is placed on the DreamDEX CLOB.
2. **KasuwaPolicy Enforcement**: Smart contract policies enforce strict spending caps (`maxBudgetUSD`), price ceilings (`maxContractPrice`), and slippage caps (`maxSlippageBps`).
3. **Session Key Isolation**: Operators are restricted solely to submitting orders to allowlisted pools up to policy limits; they CANNOT transfer assets or withdraw funds.

---

## 📄 License & Disclaimer

MIT License. See [DISCLAIMER.md](file:///c:/Users/Administrator/CrossDevice/Pixel%208%20Pro/garuntee%20win/DISCLAIMER.md) for testnet usage notes.
