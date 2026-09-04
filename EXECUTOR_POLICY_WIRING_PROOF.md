# KASUWASHIELD — EXECUTOR → POLICY WIRING PROOF

This document provides on-chain and source-level verification of the connection between `KasuwaExecutor` (and `KasuwaReactiveHandler`) and `KasuwaPolicy` on the Somnia Shannon Testnet (`Chain ID: 50312`).

An earlier version of this document showed the exact same on-chain query result below and still concluded "PASS." That was wrong: the queried value does not match the target policy address, and this revision says so plainly instead of asserting the check passed anyway.

---

## 1. On-Chain Contracts Under Inspection

* **Network**: Somnia Shannon Testnet (`Chain ID: 50312`, RPC: `https://dream-rpc.somnia.network`)
* **KasuwaExecutor**: [`0x80AcBF398663079edBfF26132C9AC04204B7c69c`](https://shannon-explorer.somnia.network/address/0x80AcBF398663079edBfF26132C9AC04204B7c69c?tab=contract) — Blockscout source-verified, 3,505 bytes runtime bytecode
* **KasuwaReactiveHandler**: [`0x7eAfd01B0736593611c2Ac73e0FdB6BeED2F3213`](https://shannon-explorer.somnia.network/address/0x7eAfd01B0736593611c2Ac73e0FdB6BeED2F3213?tab=contract) — Blockscout source-verified
* **KasuwaPolicy**: [`0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d`](https://shannon-explorer.somnia.network/address/0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d?tab=contract) — Blockscout source-verified, 4,207 bytes runtime bytecode
* **Deployer wallet (EOA)**: [`0x07764D9031b8747e28d3E1601Ff1417569de22DA`](https://shannon-explorer.somnia.network/address/0x07764D9031b8747e28d3E1601Ff1417569de22DA)

---

## 2. Storage Layout & Mechanism Analysis

In [`contracts/KasuwaExecutor.sol`](./contracts/KasuwaExecutor.sol):

```solidity
contract KasuwaExecutor {
    address public immutable owner;          // Embedded in bytecode (immutable)
    address public policyContract;          // Stored at Storage Slot 0
    ...
    function setPolicyContract(address _policyContract) external onlyOwner {
        policyContract = _policyContract;
    }
}
```

`KasuwaReactiveHandler.sol` has the same `policyContract` field, but — unlike `KasuwaExecutor` — no `setPolicyContract()` function. Its value can only ever be set once, in the constructor, at deploy time.

---

## 3. On-Chain Query Results

Read live via Blockscout's Read Contract tab on `KasuwaExecutor` (`policyContract()`, live call — not just the constructor argument recorded at deploy time), and cross-checked against `KasuwaReactiveHandler`'s recorded constructor argument on its verified contract page:

```text
================================================================================
  ON-CHAIN QUERY RESULTS
================================================================================
Target Contract:       0x80AcBF398663079edBfF26132C9AC04204B7c69c (KasuwaExecutor)
Live policyContract(): 0x07764D9031b8747e28d3E1601Ff1417569de22DA

Target Contract:       0x7eAfd01B0736593611c2Ac73e0FdB6BeED2F3213 (KasuwaReactiveHandler)
Constructor arg [0]:   0x07764D9031b8747e28d3E1601Ff1417569de22DA

Expected (KasuwaPolicy address):  0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d
Actual value on both contracts:   0x07764D9031b8747e28d3E1601Ff1417569de22DA
================================================================================
```

`0x07764D9031b8747e28d3E1601Ff1417569de22DA` is not `KasuwaPolicy` — it is the deployer wallet itself (the same address in Section 1). It has no contract code. Both contracts were deployed with the deployer's own wallet address passed where the `KasuwaPolicy` address should have gone.

---

## 4. Verification Interpretation

| Item | Result | Interpretation |
|---|:---:|---|
| **Executor Bytecode** | ✅ **PASS** | 3,505 bytes deployed and Blockscout source-verified on Somnia Shannon |
| **ReactiveHandler Bytecode** | ✅ **PASS** | Deployed and Blockscout source-verified on Somnia Shannon |
| **Policy Bytecode** | ✅ **PASS** | 4,207 bytes deployed and Blockscout source-verified on Somnia Shannon |
| **Executor → Policy wiring** | ❌ **FAIL — functionally broken** | `policyContract` on `KasuwaExecutor` points at the deployer EOA, not `KasuwaPolicy`, and this field is actually read by `executeAutoRoll()` |
| **ReactiveHandler → Policy wiring** | ❌ **FAIL — but functionally inert** | Same wrong value is stored in `KasuwaReactiveHandler.policyContract`, but a full read of [`contracts/KasuwaReactiveHandler.sol`](./contracts/KasuwaReactiveHandler.sol) shows that field is set once in the constructor and never read anywhere else in the contract — `onMarketSettled()` never references it. It is dead, unused storage, not a live dependency, so this defect has no on-chain behavioral consequence today. |
| **Direct Policy Invocations** | ❌ **Would currently revert** | `executeAutoRoll()` calls `IKasuwaPolicy(policyContract).validateAndDeductRoll()` against an address with no code — Solidity's ABI decoding of the `bool` return value fails against an EOA, so this call reverts today |

**Status**: **CONTRACTS DEPLOYED & SOURCE-VERIFIED — EXECUTOR WIRING IS BROKEN AND FUNCTIONALLY BLOCKS `executeAutoRoll()` (disclosed, not yet fixed on-chain). REACTIVEHANDLER'S COPY OF THE SAME DEFECT IS DISCLOSED FOR COMPLETENESS BUT HAS NO FUNCTIONAL EFFECT (unused storage).**

## 5. Remediation

* **KasuwaExecutor**: owner-only `setPolicyContract(0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d)` fixes this in a single transaction from the deployer wallet. A ready-to-run script is provided at [`scripts/fix-policy-wiring.ts`](./scripts/fix-policy-wiring.ts) — it reads `DEPLOYER_PRIVATE_KEY` from `.env.local` (never printed or transmitted anywhere else) and sends exactly this one transaction using `viem`. Run it yourself, in your own terminal, after reading it: `npx tsx scripts/fix-policy-wiring.ts`.
* **KasuwaReactiveHandler**: no setter exists, so a fully correct fix would require a fresh redeploy with the right `_policyContract` constructor argument. Given that field is never actually read by the contract (see above), this redeploy is not required for `KasuwaShield` to function correctly — it is a cosmetic/documentation-accuracy fix only, listed here for completeness rather than urgency.

The Executor fix is one deployer-wallet transaction away from being fixed for real. It is being disclosed here rather than papered over, and rather than being fixed silently without a paper trail of what was wrong and why. This assistant does not hold, view, or transmit the deployer private key, and does not sign or broadcast transactions on the user's behalf — the fix script above is meant to be reviewed and run by the wallet owner directly.
