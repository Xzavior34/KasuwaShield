# ARCHITECTURE DECISION RECORD (ADR)

**Project**: KasuwaShield  
**Document**: Architecture Decision Record  

---

## 1. Monorepo Architecture

KasuwaShield is structured as a high-efficiency monorepo:

```
kasuwa-shield/
├── apps/
│   └── web/                   # Next.js 14 App Router UI (Tailwind, shadcn/ui, viem/wagmi)
├── packages/
│   ├── risk-engine/           # Deterministic downside protection calculation & scoring
│   ├── markets/               # Live DreamDEX market discovery & on-chain verification
│   ├── execution/             # Order sizing, policy checks, & DreamDEX execution engine
│   ├── shared/                # Common types, ABIs, chain configurations
│   └── ui/                    # Shared design system components
├── contracts/
│   ├── KasuwaPolicy.sol       # On-chain user risk policy enforcement contract
│   ├── KasuwaExecutor.sol     # Non-custodial batched execution & operator helper
│   ├── KasuwaReactiveHandler.sol # Somnia Reactive event handler for market settlement
│   └── interfaces/            # IBinaryPool, IBinaryMarket, IBinaryMarketsModule ABIs
├── scripts/
│   ├── discover-markets.ts    # On-chain event scanner for live binary markets
│   ├── inspect-market.ts     # Deep live state inspector for a given market ID
│   ├── deploy.ts              # Foundry/Hardhat deployment script for Somnia Shannon
│   ├── testnet-smoke.ts       # Golden-path testnet execution & verification script
│   └── demo-preflight.ts      # Automated demo readiness validator
├── docs/                      # Architectural, technical, security & hackathon docs
└── test/                      # Unit, integration, contract & E2E tests
```

---

## 2. Risk Engine Mathematics (Fixed-Payout Protection Model)

Rather than forcing Black-Scholes (which models continuous European options), KasuwaShield uses a transparent **Event-Contract Downside Protection Sizing Model**:

1. **Target Protected Value**:
   $$V_{\text{protect}} = \text{exposureUSD} \times \text{protectionPercent}$$
2. **Contract Payout**:
   Each winning outcome contract pays $1.00$ collateral unit at settlement.
3. **Required Protection Contracts**:
   $$N_{\text{contracts}} = \lceil V_{\text{protect}} \rceil$$
4. **Estimated Cost**:
   $$\text{Cost}_{\text{est}} = N_{\text{contracts}} \times P_{\text{ask}}$$
   where $P_{\text{ask}}$ is the best ask price for the Down/No outcome contract in 1e6 units (e.g. $0.35$ per contract for $35\%$ downside probability).
5. **Policy Check**:
   Execution occurs IF AND ONLY IF:
   - $\text{Cost}_{\text{est}} \le \text{maxBudget}$
   - $P_{\text{ask}} \le \text{maxContractPrice}$
   - $\text{Slippage} \le \text{maxSlippage}$
   - Market Status is `Trading` (1) and `finalized == false`.

---

## 3. Somnia Reactivity Integration Flow

```
DreamDEX Binary Market Settles (isResolved == true)
        │
        ▼ (On-Chain Log: MarketResolved / PayoutDeclared)
Somnia Reactivity Precompile / Validator Event Bus
        │
        ▼ (On-Chain Trigger)
KasuwaReactiveHandler._onEvent()
        │
        ▼
Update KasuwaShield Position Settlement State -> SETTLED_CLAIMABLE
        │
        ▼ (Client / Session-Key Auto-Sweep)
IBinaryMarketsModule.redeem(operatorId, venueId, marketId, outcomeIdx, amount)
        │
        ▼
Collateral Claimed & Verified On-Chain
```

---

## 4. EIP-7702 & Non-Custodial Session Keys

- **EIP-7702 Delegation**: Enables single-click protection activation by batching approval and order placement.
- **Restricted Operator**: Session key is granted permission solely to submit orders to allowlisted DreamDEX pools up to `maxBudget`. Operator cannot transfer assets or withdraw funds.
