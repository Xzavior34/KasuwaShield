// Real, on-chain contract wiring for Somnia Shannon Testnet (chain 50312).
// Used by hooks/usePolicyActions.ts to let a CONNECTED VISITOR create and
// authorize their own live KasuwaShield policy, not a simulation.

import { encodeFunctionData, keccak256, toHex, type Hex } from "viem";

export const SOMNIA_CHAIN_ID = 50312;
export const SOMNIA_CHAIN_ID_HEX = "0xc488";
export const SOMNIA_RPC = "https://dream-rpc.somnia.network";
export const SOMNIA_EXPLORER = "https://shannon-explorer.somnia.network";

export const KASUWA_POLICY_ADDRESS = "0xbd2A26c3893db93ef86E0ceAaEC080dF8f9C550a";
export const KASUWA_EXECUTOR_ADDRESS = "0x80AcBF398663079edBfF26132C9AC04204B7c69c";
export const KASUWA_REACTIVE_HANDLER_ADDRESS = "0x7eAfd01B0736593611c2Ac73e0FdB6BeED2F3213";

// The contract enforces this cap on-chain (KasuwaPolicy.sol: "Protection exceeds 50% max cap").
// The UI must never send a value above this or the transaction will revert.
export const MAX_PROTECTION_PERCENT = 50;

const CREATE_POLICY_ABI = [
  {
    type: "function",
    name: "createPolicy",
    stateMutability: "nonpayable",
    inputs: [
      { name: "policyId", type: "bytes32" },
      { name: "sessionKey", type: "address" },
      { name: "exposureUSD", type: "uint256" },
      { name: "protectionPercent", type: "uint256" },
      { name: "totalBudgetUSD", type: "uint256" },
      { name: "maxContractPrice", type: "uint256" },
      { name: "durationSeconds", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bytes32" }],
  },
] as const;

const AUTHORIZE_SESSION_KEY_ABI = [
  {
    type: "function",
    name: "authorizeSessionKey",
    stateMutability: "nonpayable",
    inputs: [
      { name: "sessionKey", type: "address" },
      { name: "policyId", type: "bytes32" },
    ],
    outputs: [],
  },
] as const;

/** Deterministic, unique-enough policyId derived from the caller + time. Real bytes32, not decorative. */
export function derivePolicyId(userAddress: string): Hex {
  return keccak256(toHex(`kasuwashield:${userAddress.toLowerCase()}:${Date.now()}`));
}

export function buildCreatePolicyTx(params: {
  policyId: Hex;
  sessionKey: string;
  exposureUSD: number;
  protectionPercent: number;
  totalBudgetUSD: number;
  maxContractPriceCents: number;
  durationSeconds: number;
}) {
  const protectionPercent = Math.min(params.protectionPercent, MAX_PROTECTION_PERCENT);
  const data = encodeFunctionData({
    abi: CREATE_POLICY_ABI,
    functionName: "createPolicy",
    args: [
      params.policyId,
      params.sessionKey as Hex,
      BigInt(Math.round(params.exposureUSD)),
      BigInt(protectionPercent),
      BigInt(Math.round(params.totalBudgetUSD)),
      BigInt(Math.round(params.maxContractPriceCents)),
      BigInt(Math.round(params.durationSeconds)),
    ],
  });
  return { to: KASUWA_POLICY_ADDRESS, data };
}

export function buildAuthorizeSessionKeyTx(params: { sessionKey: string; policyId: Hex }) {
  const data = encodeFunctionData({
    abi: AUTHORIZE_SESSION_KEY_ABI,
    functionName: "authorizeSessionKey",
    args: [params.sessionKey as Hex, params.policyId],
  });
  return { to: KASUWA_EXECUTOR_ADDRESS, data };
}

export function explorerTxUrl(hash: string) {
  return `${SOMNIA_EXPLORER}/tx/${hash}`;
}
