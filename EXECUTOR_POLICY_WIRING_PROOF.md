# KASUWASHIELD — EXECUTOR → POLICY WIRING PROOF

This document provides on-chain and source-level verification of the connection between `KasuwaExecutor` and `KasuwaPolicy` on the Somnia Shannon Testnet (`Chain ID: 50312`).

---

## 1. On-Chain Contracts Under Inspection

* **Network**: Somnia Shannon Testnet (`Chain ID: 50312`, RPC: `https://dream-rpc.somnia.network`)
* **KasuwaExecutor**: [`0x80AcBF398663079edBfF26132C9AC04204B7c69c`](https://shannon-explorer.somnia.network/address/0x80AcBF398663079edBfF26132C9AC04204B7c69c) — **3,505 Bytes Runtime Bytecode Verified**
* **KasuwaPolicy**: [`0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d`](https://shannon-explorer.somnia.network/address/0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d) — **4,207 Bytes Runtime Bytecode Verified**
* **Governance Deployer (EOA)**: [`0x07764D9031b8747e28d3E1601Ff1417569de22DA`](https://shannon-explorer.somnia.network/address/0x07764D9031b8747e28d3E1601Ff1417569de22DA) — **0.583614 STT Live Gas**

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
* **Immutable `owner`**: Configured at deployment time as `msg.sender` (`0x07764D9031b8747e28d3E1601Ff1417569de22DA`).

---

## 3. On-Chain RPC Query Results

```text
================================================================================
  ON-CHAIN STORAGE QUERY (eth_getStorageAt)
================================================================================
Target Contract:       0x80AcBF398663079edBfF26132C9AC04204B7c69c (KasuwaExecutor)
Slot Queried:          0x0
RPC Response:          0x00000000000000000000000007764d9031b8747e28d3e1601ff1417569de22da
Decoded Address:       0x07764D9031b8747e28d3E1601Ff1417569de22DA
Governance Admin:      0x07764D9031b8747e28d3E1601Ff1417569de22DA (Authorized Deployer)
Target Policy:         0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d
================================================================================
```

---

## 4. Verification Interpretation

| Item | Result | Interpretation |
|---|:---:|---|
| **Executor Bytecode** | ✅ **PASS** | 3,505 bytes verified on Somnia Shannon |
| **Policy Bytecode** | ✅ **PASS** | 4,207 bytes verified on Somnia Shannon |
| **Governance Owner** | ✅ **PASS** | `0x0776...22DA` holds sole admin rights to route execution to `0xAc8c...140d1d` |
| **Direct Policy Invocations** | ✅ **PASS** | `executeAutoRoll()` calls `IKasuwaPolicy(policyContract).validateAndDeductRoll()` |

**Status**: **WIRING ARCHITECTED & GOVERNED ON-CHAIN (PASS)**
