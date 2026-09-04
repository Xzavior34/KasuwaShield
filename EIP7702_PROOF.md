# KASUWASHIELD — EIP-7702 FORENSIC PROOF MATRIX

This document establishes the 5-layer truth verification standard for EIP-7702-style delegated execution within the KasuwaShield architecture.

An earlier version of this document claimed Keccak256 delegation-tuple hashing in a file called `eip7702-authorizer.ts`, and claimed "17/17 unit tests" verified secp256k1 signature production. Neither was true: that file does not exist in this repository, and there is no signature-production code anywhere in `packages/execution`. This revision describes what the code actually does instead.

---

## 1. Five-Layer Truth Standard Matrix

| Layer | Component | Status | Detailed Evidence & Limitations |
|---|---|:---:|---|
| **Layer 1: Implementation** | In-Memory Ephemeral Session Key Generation | ✅ **LIVE VERIFIED** | Implemented in `packages/execution/src/session-key-manager.ts` (`generateEphemeralSessionKey`): a real secp256k1 keypair via Node's native ECDH, with the address derived by a locally-implemented, test-vector-verified Keccak-256 (`deriveAddressFromPrivateKey`) — see Section 2 below for why that specific detail matters. Bounded by an explicit expiry and budget. |
| **Layer 2: Payload Construction** | Delegation Descriptor Construction | ✅ **CODE VERIFIED (plain object, not a cryptographic payload)** | Implemented in `packages/execution/src/session-key-manager.ts` (`buildEIP7702DelegationPayload`). It returns a plain JS object — `{ chainId, contractAddress, sessionKeyAddress, policyId, remainingBudgetUSD, nonce, validUntil }` — for the demo/offline harness to consume. It does **not** Keccak256-hash an EIP-7702 authorization tuple or construct an RLP-encoded authorization list; that step is not implemented. |
| **Layer 3: Authorization Signature** | secp256k1 Signature Production | ❌ **NOT IMPLEMENTED** | No code in this repository signs an EIP-7702 authorization tuple or any other payload. `executeSessionKeyAutoRoll()` records a transaction log entry for the offline demo harness; it does not produce or verify a signature. The 17/17 passing unit tests cover risk sizing, policy budget math, session-key address derivation, and lifecycle state transitions — none of them test signature production, because there is none to test. |
| **Layer 4: EOA Designation** | Live On-Chain EOA Implementation Designation | 🏷️ **NOT PROVEN LIVE** | Ephemeral keys generated locally; live on-chain EOA designation is **not claimed** due to current lack of interactive EIP-7702 UI support in MetaMask. |
| **Layer 5: Delegated Execution** | Autonomous Delegated Transaction Dispatch | 🏷️ **NOT PROVEN LIVE** | Execution path routed through `KasuwaExecutor.sol` session-key validation logic; direct relayer-dispatched EOA transactions remain code-modeled. |

---

## 2. Cryptographic Sizing & Scope Restrictions

* **Non-Custodial Guarantee**: Session keys possess **zero authority** over user funds. They can ONLY call `executeAutoRoll()` on `KasuwaExecutor.sol`.
* **Budget Ceiling**: Every execution checks `remainingBudgetUSD` in `KasuwaPolicy.sol` before submitting orders.
* **Duration Expiry**: Keys are generated with an explicit Unix `validUntil` timestamp. Expired keys are rejected by policy invariants.
* **Address derivation correctness**: `deriveAddressFromPrivateKey()` had a real defect at one point — it used SHA-256 in place of Keccak-256, which produced a syntactically valid-looking `0x` address that was **not** actually reachable from the corresponding private key on any EVM chain. It now uses a dependency-free Keccak-256 implementation, verified against known Keccak-256 test vectors and cross-checked address-for-address against viem's audited `privateKeyToAddress()` across 20 random keys before being wired in. `scripts/run-tests.ts` — "Session key address is the REAL Ethereum address for its private key" — regression-tests this with three fixed, independently-computed vectors so it needs no npm dependency to catch a recurrence.

## 3. What Would Turn Layer 2/3 Into Real EIP-7702 Authorization

To go from "delegation descriptor" to an actual EIP-7702 authorization: (1) build the RLP-encoded authorization tuple `[chainId, address, nonce]` per EIP-7702, (2) Keccak256-hash it with the `0x05` magic prefix the spec defines, (3) sign that hash with the session key's private key (secp256k1, recoverable signature), and (4) include the resulting `(yParity, r, s)` alongside the tuple in a type-4 transaction's `authorizationList`. None of these four steps exist in this repository yet — they are the concrete, scoped next steps to move Layer 2/3 from code-modeled to cryptographically real.
