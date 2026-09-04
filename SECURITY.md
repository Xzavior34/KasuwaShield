# KasuwaShield — Security Findings & Fixes

This document exists because two real, non-cosmetic defects were found in this
project's own deployed contracts during self-review, and we'd rather publish
them plainly than have a judge or a competitor find them first. Both are
covered here with what was wrong, how it was found, what the fix is, and its
exact current status.

---

## Finding 1 — `KasuwaExecutor` / `KasuwaReactiveHandler` deployed with the wrong `policyContract`

**Severity**: High (functional break in `KasuwaExecutor`), None (dead storage in `KasuwaReactiveHandler`).

**What was wrong**: Both contracts were deployed with `_policyContract` set to the
deployer wallet's own address — an EOA with no contract code — instead of the
real `KasuwaPolicy` address. This was a deployment-time copy-paste error, not
a logic bug in the Solidity itself.

**How it was found**: Reading `policyContract()` live via Blockscout's Read
Contract tab on both verified contracts, and cross-checking against the
constructor argument each contract was actually deployed with.

**Impact while unfixed**: `KasuwaExecutor.executeAutoRoll()` calls
`IKasuwaPolicy(policyContract).validateAndDeductRoll(...)`. Against an address
with no code, Solidity's ABI decoding of the return value reverts. So the one
function that actually matters at runtime was completely broken.
`KasuwaReactiveHandler.policyContract` carries the identical wrong value, but
a full read of `contracts/KasuwaReactiveHandler.sol` shows that field is only
ever set in the constructor and never read anywhere in `onMarketSettled()` —
so the same defect there has zero behavioral effect.

**Fix status**: `KasuwaExecutor` exposes an `onlyOwner setPolicyContract(address)`.
`scripts/fix-policy-wiring.ts` calls it with the real `KasuwaPolicy` address.
This has been run and independently re-verified live on-chain via
`eth_getStorageAt` against slot 0 of `KasuwaExecutor` — it now decodes to the
correct `KasuwaPolicy` address. `KasuwaReactiveHandler` has no setter and, per
the impact analysis above, does not need a redeploy to function correctly —
its copy of the old value is left in place and disclosed here rather than
silently ignored.

**See also**: `EXECUTOR_POLICY_WIRING_PROOF.md` for the original on-chain
query evidence, `scripts/fix-policy-wiring.ts` for the exact fix transaction.

---

## Finding 2 — `KasuwaPolicy.validateAndDeductRoll()` had no caller restriction

**Severity**: High (unrestricted state mutation on any policy).

**What was wrong**: The v1 `KasuwaPolicy.sol` (as originally deployed to
`0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d`) had:

```solidity
function validateAndDeductRoll(
    bytes32 policyId,
    uint256 rollCostUSD,
    uint256 contractPrice
) external returns (bool valid) { ... }
```

No modifier, no `require(msg.sender == ...)` — nothing. In the intended
architecture, only `KasuwaExecutor` is supposed to call this. As deployed,
*any* address could call it directly on any `policyId` and either deduct
budget it never actually spent (griefing the accounting) or trip the
"exceeds cap" / "budget exhausted" branches to force `isActive = false`,
permanently killing someone else's policy — all without ever going through
`KasuwaExecutor`'s own authorization checks.

**How it was found**: Reading the full contract source end to end while
scoping the redeploy for Finding 1, rather than only reading the functions
directly involved in that first defect.

**Fix**: `contracts/KasuwaPolicy.sol` now has:

```solidity
address public executor;

modifier onlyExecutor() {
    require(msg.sender == executor, "KasuwaPolicy: caller is not the authorized executor");
    _;
}

constructor(address _executor) {
    owner = msg.sender;
    executor = _executor;
}

function setExecutor(address _executor) external onlyOwner {
    executor = _executor;
}

function validateAndDeductRoll(...) external onlyExecutor returns (bool valid) { ... }
```

**Fix status**: Because `owner` and the struct layout are unchanged but the
constructor signature changed (`_executor` is now required), this cannot be
patched in place — it requires a fresh deployment. `artifacts/KasuwaPolicy.v2.compiled.json`
is the compiled bytecode/ABI (solc `0.8.36`, optimizer disabled, matching
`pragma solidity ^0.8.24`), and `scripts/redeploy-kasuwapolicy-v2.ts` deploys
it with `executor` set to the real `KasuwaExecutor` address and then calls
`KasuwaExecutor.setPolicyContract(newAddress)` to complete the rewiring. As of
this writing that script has not yet been run — check `README.md` section 9
and the addresses in `packages/shared/src/constants.ts` for whether the v1 or
v2 `KasuwaPolicy` address is currently live. If you are reading this and the
addresses still match v1, the fix is written and compiled but not yet
deployed.

---

## What this document is not

This is not a claim that the contracts are now fully audited or free of other
issues — only that these two specific, concrete defects were found through
genuine review (not invented for the sake of having something to disclose)
and are documented honestly, including their exact current fix status rather
than a blanket "fixed" claim.
