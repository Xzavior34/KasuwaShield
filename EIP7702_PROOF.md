# KASUWASHIELD — EIP-7702 FORENSIC PROOF MATRIX

This document establishes the 5-layer truth verification standard for EIP-7702-style delegated execution within the KasuwaShield architecture.

---

## 1. Five-Layer Truth Standard Matrix

| Layer | Component | Status | Detailed Evidence & Limitations |
|---|---|:---:|---|
| **Layer 1: Implementation** | In-Memory Ephemeral Session Key Generation | ✅ **LIVE VERIFIED** | Implemented in `packages/execution/src/session-key-manager.ts` using native `secp256k1` keypair derivation with expiry and budget bounds. |
| **Layer 2: Payload Construction** | Authorization Tuple Formatting & Hashing | ✅ **CODE VERIFIED** | Implemented in `packages/execution/src/eip7702-authorizer.ts`. Constructs `[chainId, address, nonce]` delegation tuple and Keccak256 hashes per EIP-7702 specification. |
| **Layer 3: Authorization Signature** | secp256k1 Signature Production | ✅ **CODE VERIFIED** | Verified by 16/16 unit tests. Valid signatures produced for ephemeral session keys restricted to policy bounds. |
| **Layer 4: EOA Designation** | Live On-Chain EOA Implementation Designation | 🏷️ **NOT PROVEN LIVE** | Ephemeral keys generated locally; live on-chain EOA designation is **not claimed** due to current lack of interactive EIP-7702 UI support in MetaMask. |
| **Layer 5: Delegated Execution** | Autonomous Delegated Transaction Dispatch | 🏷️ **NOT PROVEN LIVE** | Execution path routed through `KasuwaExecutor.sol` session-key validation logic; direct relayer-dispatched EOA transactions remain code-modeled. |

---

## 2. Cryptographic Sizing & Scope Restrictions

* **Non-Custodial Guarantee**: Session keys possess **zero authority** over user funds. They can ONLY call `executeAutoRoll()` on `KasuwaExecutor.sol`.
* **Budget Ceiling**: Every execution checks `remainingBudgetUSD` in `KasuwaPolicy.sol` before submitting orders.
* **Duration Expiry**: Keys are generated with an explicit Unix `validUntil` timestamp. Expired keys are rejected by policy invariants.
