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
| **Executor → Policy wiring** | ✅ **PASS — LIVE ON-CHAIN VERIFIED** | `policyContract` on `KasuwaExecutor` points directly to `KasuwaPolicy` (`0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d`) |
| **Direct Policy Invocations** | ✅ **PASS** | `executeAutoRoll()` routes calls directly to `IKasuwaPolicy(policyContract).validateAndDeductRoll()` |

**Status**: **ALL CONTRACTS DEPLOYED, SOURCE-VERIFIED, AND ON-CHAIN WIRED (PASS)**
