# KASUWASHIELD — EXECUTOR → POLICY WIRING PROOF

This document provides on-chain and source-level verification of the connection between `KasuwaExecutor` (and `KasuwaReactiveHandler`) and `KasuwaPolicy` on the Somnia Shannon Testnet (`Chain ID: 50312`).

---

## 1. On-Chain Contracts Under Inspection

* **Network**: Somnia Shannon Testnet (`Chain ID: 50312`, RPC: `https://dream-rpc.somnia.network`)
* **KasuwaExecutor**: [`0x80AcBF398663079edBfF26132C9AC04204B7c69c`](https://shannon-explorer.somnia.network/address/0x80AcBF398663079edBfF26132C9AC04204B7c69c?tab=contract) — Blockscout source-verified, 3,505 bytes runtime bytecode
* **KasuwaReactiveHandler**: [`0x7eAfd01B0736593611c2Ac73e0FdB6BeED2F3213`](https://shannon-explorer.somnia.network/address/0x7eAfd01B0736593611c2Ac73e0FdB6BeED2F3213?tab=contract) — Blockscout source-verified
* **KasuwaPolicy v2**: [`0xbd2a26c3893db93ef86e0ceaaec080df8f9c550a`](https://shannon-explorer.somnia.network/address/0xbd2a26c3893db93ef86e0ceaaec080df8f9c550a?tab=contract) — Blockscout source-verified, 4,400+ bytes runtime bytecode (with `onlyExecutor` security guard)
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
Target Contract:        0x80AcBF398663079edBfF26132C9AC04204B7c69c (KasuwaExecutor)
Slot 0 Queried:         0x000000000000000000000000bd2a26c3893db93ef86e0ceaaec080df8f9c550a
Decoded Policy Address: 0xbd2a26c3893db93ef86e0ceaaec080df8f9c550a
Target Policy Address:  0xbd2a26c3893db93ef86e0ceaaec080df8f9c550a
Status:                 100% MATCH (LIVE ON-CHAIN VERIFIED v2)
================================================================================
```

---

## 4. Verification Interpretation

| Item | Result | Interpretation |
|---|:---:|---|
| **Executor Bytecode** | ✅ **PASS** | 3,505 bytes deployed and Blockscout source-verified on Somnia Shannon |
| **ReactiveHandler Bytecode** | ✅ **PASS** | Deployed and Blockscout source-verified on Somnia Shannon |
| **Policy v2 Bytecode** | ✅ **PASS** | 4,400+ bytes deployed on Somnia Shannon (`0xbd2a...550a`) with `onlyExecutor` access control |
| **Executor → Policy wiring** | ✅ **PASS — LIVE ON-CHAIN VERIFIED** | `policyContract` on `KasuwaExecutor` points directly to `KasuwaPolicy v2` (`0xbd2a26c3893db93ef86e0ceaaec080df8f9c550a`), executed in block `#479864632` |
| **Direct Policy Invocations** | ✅ **PASS** | `executeAutoRoll()` routes calls directly to `IKasuwaPolicy(policyContract).validateAndDeductRoll()` with `onlyExecutor` access control |

---

## 5. Live On-Chain Lifecycle Execution Proof (Ephemeral Session Key)

Executed via `scripts/execute-real-policy-roll.ts` on Somnia Shannon Testnet:

* **Policy ID**: `0x9e4721639009e3fa32480ec85ba239166ed760aae367a3c8b3fc1636a1ac901f`
* **Deployer / Demo User**: [`0x07764D9031b8747e28d3E1601Ff1417569de22DA`](https://shannon-explorer.somnia.network/address/0x07764D9031b8747e28d3E1601Ff1417569de22DA)
* **Ephemeral Session Key**: `0x6DaFe8171DBAB532F06B52C8c00E2D05540aB615` (fresh, holds zero non-gas funds)

### Mined Transactions

1. **`KasuwaPolicy.createPolicy(...)`**  
   Tx: [`0x716c140c1b0729c59cede0177d474d0a922134bf6613f07e06c834f1596e27bc`](https://shannon-explorer.somnia.network/tx/0x716c140c1b0729c59cede0177d474d0a922134bf6613f07e06c834f1596e27bc)
2. **`KasuwaExecutor.authorizeSessionKey(...)`**  
   Tx: [`0x11339f6d3a9afd4e8c200ac7b8ea8cc94612527cd0d3ffc8c888ce3f81fff2f0`](https://shannon-explorer.somnia.network/tx/0x11339f6d3a9afd4e8c200ac7b8ea8cc94612527cd0d3ffc8c888ce3f81fff2f0)
3. **Session Key Gas Funding (0.5 STT)**  
   Tx: [`0xd25d317e847a4382501e82fb2153c064ba7589ff28185c407bd54151f8a0f617`](https://shannon-explorer.somnia.network/tx/0xd25d317e847a4382501e82fb2153c064ba7589ff28185c407bd54151f8a0f617)
4. **`KasuwaExecutor.executeAutoRoll(...)` (Signed by Session Key)**  
   Tx: [`0x6aea872e1034b52c25e852b0a061624c6ae1d030b0ebeb717a9673bca3169f06`](https://shannon-explorer.somnia.network/tx/0x6aea872e1034b52c25e852b0a061624c6ae1d030b0ebeb717a9673bca3169f06)  
   Block: `#479888195` | Status: `success`  
   State Readback: `remainingBudgetUSD: 45` (started at 50), `rollsExecuted: 1`, `isActive: true`.

---

## 6. Live Automated Keeper Daemon Proof (3 Consecutive Rolls)

Executed via `scripts/keeper-daemon.ts` on Somnia Shannon Testnet:

* **Policy ID**: `0x7a3db100cbdfc093a1cf64fc02d08a5c3ba3867ffab860d5b403e05a0694e9f7`
* **Ephemeral Session Key**: `0xEbB5bfa17d0c3A0B1c9006Eb589aBff8FdfB437c`
* **Total Budget**: 50 USD | **Roll Size**: 5 USD | **Window**: 15s

### Keeper Daemon Transactions

1. **`KasuwaPolicy.createPolicy(...)`**  
   Tx: [`0x0ca24aec71c5e5e30469c1206cf0962937ac51a96def6069d98a7a5f419bb58b`](https://shannon-explorer.somnia.network/tx/0x0ca24aec71c5e5e30469c1206cf0962937ac51a96def6069d98a7a5f419bb58b)
2. **`KasuwaExecutor.authorizeSessionKey(...)`**  
   Tx: [`0x6192a9a32587ec57093d5d7c4b5efcbf6f3406e904b51c278e39a8c9931a1e76`](https://shannon-explorer.somnia.network/tx/0x6192a9a32587ec57093d5d7c4b5efcbf6f3406e904b51c278e39a8c9931a1e76)
3. **Session Key Gas Funding (0.2 STT)**  
   Tx: [`0xa2c9165f0e73f0f329cca02ed1662931ebd1d2ac6b0bf666461c659556dfc391`](https://shannon-explorer.somnia.network/tx/0xa2c9165f0e73f0f329cca02ed1662931ebd1d2ac6b0bf666461c659556dfc391)
4. **Window 1 Auto-Roll Tx (Block #481236242)**  
   Tx: [`0x5b49c1c9f39ff994b4c4e2e301eb32b09f849a17affdbc7922a5cd51f985bcae`](https://shannon-explorer.somnia.network/tx/0x5b49c1c9f39ff994b4c4e2e301eb32b09f849a17affdbc7922a5cd51f985bcae) — Budget remaining: 45 USD
5. **Window 2 Auto-Roll Tx (Block #481236422)**  
   Tx: [`0x3dfd81201497e715ce280cb6216eb44468cc853e2120b644232a8b37bf1854a3`](https://shannon-explorer.somnia.network/tx/0x3dfd81201497e715ce280cb6216eb44468cc853e2120b644232a8b37bf1854a3) — Budget remaining: 40 USD
6. **Window 3 Auto-Roll Tx (Block #481236611)**  
   Tx: [`0x9bad9c3023fb823fd4486b177d6303e9f905be3ef2e0c26914220400a00d90a7`](https://shannon-explorer.somnia.network/tx/0x9bad9c3023fb823fd4486b177d6303e9f905be3ef2e0c26914220400a00d90a7) — Budget remaining: 35 USD

**Final State Readback**: `rollsExecuted: 3`, `remainingBudgetUSD: 35`, `isActive: true`.

---

**Status**: **ALL CONTRACTS DEPLOYED, SOURCE-VERIFIED, ON-CHAIN WIRED TO V2, AND FULL MULTI-WINDOW LIFECYCLE PROVEN ON-CHAIN (PASS)**
