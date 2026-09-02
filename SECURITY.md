# SECURITY SPECIFICATION

**KasuwaShield — Programmable Downside Protection**

---

## 1. Security Architecture & Non-Custodial Boundaries

KasuwaShield is architected to guarantee strict non-custodial safety:

1. **Direct Wallet Execution**: All order placement interacts directly with official DreamDEX binary pool contracts (`IBinaryPool`).
2. **Policy Contract (`KasuwaPolicy.sol`)**:
   - Acts as a fail-closed gatekeeper.
   - Enforces `maxProtectionPercent` (default <= 50%).
   - Enforces `maxBudgetUSD` ceiling.
   - Enforces `maxContractPrice` cap.
   - Enforces maximum slippage thresholds.
3. **Session Key / Operator Isolation (`KasuwaExecutor.sol`)**:
   - Authorized operator keys have permission ONLY to submit IOC taker orders to approved DreamDEX pools.
   - Operators possess ZERO withdrawal, transfer, or approval modification capabilities.

---

## 2. Replay & Duplicate Protection

- Position records are uniquely keyed by `positionId = shield_${timestamp}_${marketId}`.
- Settlement callbacks in `KasuwaReactiveHandler.sol` verify event emitter origin and enforce `!isClaimed` flags to prevent duplicate or replayed redemptions.

---

## 3. Key Management Standards

- No private keys are ever stored, logged, or exposed in frontend client code or public repositories.
- Local tests utilize environment variables loaded securely via `.env`.
