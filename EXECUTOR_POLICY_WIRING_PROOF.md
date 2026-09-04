# KASUWASHIELD — EXECUTOR → POLICY WIRING PROOF

This document provides on-chain and source-level verification of the connection between `KasuwaExecutor` (and `KasuwaReactiveHandler`) and `KasuwaPolicy` on the Somnia Shannon Testnet (`Chain ID: 50312`).

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

* **Storage Slot 0**: Allocated to `address public policyContract`.
* **Owner**: `0x07764D9031b8747e28d3E1601Ff1417569de22DA` (Deployer EOA).

---

## 3. On-Chain Verification Query Results

Live on-chain query to Somnia Shannon RPC (`eth_getStorageAt` and `policyContract()` call):

```text
================================================================================
  ON-CHAIN STORAGE QUERY (eth_getStorageAt / policyContract)
================================================================================
Target Contract:       0x80AcBF398663079edBfF26132C9AC04204B7c69c (KasuwaExecutor)
Slot 0 Queried:        0x000000000000000000000000ac8c3afb4f11b43e1c90fc57aedc91e3e7140d1d
Decoded Policy Address: 0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d
Target Policy Address:  0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d
Status:                100% MATCH (LIVE ON-CHAIN VERIFIED)
================================================================================
```

---

## 4. Verification Interpretation

| Item | Result | Interpretation |
|---|:---:|---|
| **Executor Bytecode** | ✅ **PASS** | 3,505 bytes deployed and Blockscout source-verified on Somnia Shannon |
| **ReactiveHandler Bytecode** | ✅ **PASS** | Deployed and Blockscout source-verified on Somnia Shannon |
| **Policy Bytecode** | ✅ **PASS** | 4,207 bytes deployed and Blockscout source-verified on Somnia Shannon |
| **Executor → Policy wiring** | ✅ **PASS — LIVE ON-CHAIN VERIFIED** | `policyContract` on `KasuwaExecutor` points directly to `KasuwaPolicy` (`0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d`), fixed via `scripts/fix-policy-wiring.ts` and re-confirmed with a fresh `eth_getStorageAt` read |
| **ReactiveHandler → Policy wiring** | ⚠️ **STILL WRONG — CONFIRMED INERT** | `KasuwaReactiveHandler.policyContract` still holds the original wrong value (the deployer EOA). It has no setter, only a constructor, so this specific instance cannot be fixed without a redeploy. A full read of `contracts/KasuwaReactiveHandler.sol` shows this field is never referenced anywhere in `onMarketSettled()` — it is disclosed dead storage, not a live dependency, so no redeploy is planned for this alone. |
| **Direct Policy Invocations** | ✅ **PASS (Executor path)** | `executeAutoRoll()` now successfully routes calls to `IKasuwaPolicy(policyContract).validateAndDeductRoll()` — see `scripts/execute-real-policy-roll.ts` for a real, mined, end-to-end proof of this |

**Status**: **EXECUTOR WIRING FIXED AND LIVE-VERIFIED. REACTIVEHANDLER'S COPY OF THE OLD DEFECT REMAINS AND IS DISCLOSED, CONFIRMED FUNCTIONALLY INERT.**

**A separate, second defect** was found while scoping this fix: `KasuwaPolicy.validateAndDeductRoll()` itself had no caller restriction at all — any address, not just `KasuwaExecutor`, could call it directly. This is unrelated to the wiring issue above and is written up in full, including fix status, in [`SECURITY.md`](./SECURITY.md).
