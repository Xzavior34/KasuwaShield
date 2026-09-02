# VERIFICATION & IMPLEMENTATION NOTES

**Project**: KasuwaShield — Autonomous Portfolio Risk Agent
**Hackathon**: Somnia × DreamDEX Event Contracts Hackathon 2026
**Network**: Somnia Shannon Testnet (`Chain ID 50312`)

This document replaces an earlier self-scored rubric. Grading our own submission
against the judges' criteria isn't our call to make — this is instead a plain
account of what is real, what is simulated, and where to look to check both.

---

## 1. What's real vs. what's simulated (and why)

We'd rather be specific than impressive. Every number in the Terminal UI that
isn't backed by a live call is tagged `isDemo: true` in
`apps/web/hooks/useRiskEngineState.ts` and rendered with a visible `SIMULATED` /
`DEMO` badge — nothing in the UI pretends to be live when it isn't.

**Live today:**
- Somnia Shannon Testnet RPC connectivity (`eth_blockNumber` against
  `https://dream-rpc.somnia.network`) — see `getLiveTestnetStatus()` in
  `server.js` and `discoverLiveBinaryMarkets()` in `packages/markets/src/discovery.ts`.
- On-chain policy enforcement logic in `KasuwaPolicy.sol` / `KasuwaExecutor.sol` /
  `KasuwaReactiveHandler.sol` — these are real, tested Solidity contracts, not mocks.
- Ephemeral session-key generation — real secp256k1 keypairs via `viem/accounts`
  (`packages/execution/src/session-key-manager.ts`), not placeholder bytes.
- The deterministic risk-sizing math in `packages/risk-engine` — covered by unit
  tests in `test/unit/risk-engine.test.ts` (`npx vitest run`).

**Simulated for the demo, clearly labeled:**
- Order execution against the DreamDEX CLOB and the auto-roll keeper loop
  (`packages/execution/src/session-key-manager.ts` → `executeSessionKeyAutoRoll`,
  `scripts/auto-roll-demo.ts`) generate a placeholder tx hash rather than
  broadcasting a real transaction, so the golden-path demo runs offline and
  deterministically for judges.
- The Terminal UI's live price feed, stress-test cascade, and audit ledger are
  scripted state transitions (`useRiskEngineState.ts`), not a wallet-connected
  session — this was a deliberate choice so the 90-second demo is reproducible
  without needing funded testnet wallets or waiting on real 15-minute windows.
- `/replay` is explicitly labeled `HISTORICAL REPLAY MODE` / simulated backtest.

Wiring `executeSessionKeyAutoRoll` to a real `walletClient.sendTransaction` call
signed by the session key, and connecting the Terminal to a live wallet, are the
two concrete next steps to take this from demo-grade to production-grade — both
are scoped in the code with `NOTE:` comments at the relevant call sites.

---

## 2. How to verify locally

```bash
npx vitest run          # unit tests for the risk-sizing math
npx tsx scripts/auto-roll-demo.ts   # deterministic EIP-7702 auto-roll golden path
node server.js          # Terminal UI at http://localhost:3000
```

---

## 3. Pre-submission checklist

- [x] $0 paid software or infrastructure dependency.
- [x] Live Somnia Shannon Testnet RPC communication for block height & market
      discovery (`Chain ID 50312`).
- [x] Fail-closed, non-custodial risk policy enforcement (`KasuwaPolicy.sol`),
      covered by unit tests.
- [x] Every simulated/demo value in the UI carries an explicit `SIMULATION` /
      `DEMO` badge — see section 1.
- [x] Full monorepo structure, smart contracts, CLI scripts, and local server
      run end-to-end (`http://localhost:3000`).
