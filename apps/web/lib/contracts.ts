// Real, on-chain contract wiring for Somnia Shannon Testnet (chain 50312).
// Used by hooks/usePolicyActions.ts to let a CONNECTED VISITOR create and
// authorize their own live KasuwaShield policy, not a simulation.

import {
  decodeFunctionResult,
  encodeFunctionData,
  keccak256,
  toHex,
  type Hex,
} from "viem";

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

export const POLICY_VIEW_ABI = [
  {
    type: "function",
    name: "policies",
    stateMutability: "view",
    inputs: [{ name: "policyId", type: "bytes32" }],
    outputs: [
      { name: "policyId", type: "bytes32" },
      { name: "user", type: "address" },
      { name: "sessionKey", type: "address" },
      { name: "exposureUSD", type: "uint256" },
      { name: "protectionPercent", type: "uint256" },
      { name: "totalBudgetUSD", type: "uint256" },
      { name: "remainingBudgetUSD", type: "uint256" },
      { name: "maxContractPrice", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "durationSeconds", type: "uint256" },
      { name: "rollsExecuted", type: "uint256" },
      { name: "isActive", type: "bool" },
    ],
  },
] as const;

export interface OnChainPolicyState {
  policyId: string;
  user: string;
  sessionKey: string;
  exposureUSD: number;
  protectionPercent: number;
  totalBudgetUSD: number;
  remainingBudgetUSD: number;
  maxContractPrice: number;
  startTime: number;
  durationSeconds: number;
  rollsExecuted: number;
  isActive: boolean;
}

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

export async function fetchPolicyState(policyId: Hex): Promise<OnChainPolicyState | null> {
  try {
    const callData = encodeFunctionData({
      abi: POLICY_VIEW_ABI,
      functionName: "policies",
      args: [policyId],
    });

    const res = await fetch(SOMNIA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [{ to: KASUWA_POLICY_ADDRESS, data: callData }, "latest"],
      }),
    });

    const json = await res.json();
    if (!json?.result || json.result === "0x") return null;

    const decoded = decodeFunctionResult({
      abi: POLICY_VIEW_ABI,
      functionName: "policies",
      data: json.result as Hex,
    });

    const [
      retPolicyId,
      user,
      sessionKey,
      exposureUSD,
      protectionPercent,
      totalBudgetUSD,
      remainingBudgetUSD,
      maxContractPrice,
      startTime,
      durationSeconds,
      rollsExecuted,
      isActive,
    ] = decoded;

    return {
      policyId: retPolicyId,
      user,
      sessionKey,
      exposureUSD: Number(exposureUSD),
      protectionPercent: Number(protectionPercent),
      totalBudgetUSD: Number(totalBudgetUSD),
      remainingBudgetUSD: Number(remainingBudgetUSD),
      maxContractPrice: Number(maxContractPrice),
      startTime: Number(startTime),
      durationSeconds: Number(durationSeconds),
      rollsExecuted: Number(rollsExecuted),
      isActive,
    };
  } catch (err) {
    console.error("Failed to read on-chain policy state:", err);
    return null;
  }
}

export function explorerTxUrl(hash: string) {
  return `${SOMNIA_EXPLORER}/tx/${hash}`;
}
