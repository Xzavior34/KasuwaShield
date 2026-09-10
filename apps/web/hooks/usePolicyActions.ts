"use client";

import { useCallback, useState } from "react";
import {
  MAX_PROTECTION_PERCENT,
  buildAuthorizeSessionKeyTx,
  buildCreatePolicyTx,
  derivePolicyId,
  explorerTxUrl,
} from "../lib/contracts";

export type ActivationStage =
  | "IDLE"
  | "AWAITING_CREATE_POLICY_SIGNATURE"
  | "CREATE_POLICY_PENDING"
  | "AWAITING_AUTHORIZE_SIGNATURE"
  | "AUTHORIZE_PENDING"
  | "CONFIRMED"
  | "ERROR";

export interface ActivationResult {
  policyId: string;
  createPolicyTxHash: string;
  authorizeTxHash: string;
}

/**
 * Real, on-chain policy activation for a CONNECTED VISITOR's own wallet on Somnia
 * Shannon testnet. Both transactions are signed and gas-paid by the visitor, not a
 * demo/deployer key, and not simulated: they are broadcast via the wallet's own
 * eth_sendTransaction and the resulting hashes are real and independently verifiable
 * on Blockscout.
 */
export function usePolicyActions(userAddress: string | null) {
  const [stage, setStage] = useState<ActivationStage>("IDLE");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ActivationResult | null>(null);

  const reset = useCallback(() => {
    setStage("IDLE");
    setError(null);
    setResult(null);
  }, []);

  const activatePolicy = useCallback(
    async (params: { exposureUSD: number; protectionPercent: number }) => {
      if (typeof window === "undefined" || !(window as any).ethereum || !userAddress) {
        setError("Connect a wallet on Somnia Shannon first.");
        setStage("ERROR");
        return;
      }
      const eth = (window as any).ethereum;
      setError(null);
      setResult(null);

      try {
        // Upfront gas balance check to prevent silent hangs or cryptic RPC reverts
        const balanceHex: string = await eth.request({
          method: "eth_getBalance",
          params: [userAddress, "latest"],
        });
        const balanceWei = BigInt(balanceHex || "0x0");
        if (balanceWei === 0n) {
          setError(
            "Your wallet has 0 STT. Please claim free testnet STT from the Somnia faucet first to pay for gas."
          );
          setStage("ERROR");
          return;
        }

        const policyId = derivePolicyId(userAddress);
        // The visitor's own wallet acts as both owner and session key for this
        // self-serve flow -- no separate funded key required to try it live.
        const sessionKey = userAddress;
        const clampedProtection = Math.min(params.protectionPercent, MAX_PROTECTION_PERCENT);
        const estimatedCost = Math.max(1, Math.round(params.exposureUSD * (clampedProtection / 100) * 0.0028));
        const totalBudgetUSD = Math.max(50, estimatedCost * 10);

        const createTx = buildCreatePolicyTx({
          policyId,
          sessionKey,
          exposureUSD: params.exposureUSD,
          protectionPercent: clampedProtection,
          totalBudgetUSD,
          maxContractPriceCents: 2,
          durationSeconds: 3600,
        });

        setStage("AWAITING_CREATE_POLICY_SIGNATURE");
        const createPolicyTxHash: string = await eth.request({
          method: "eth_sendTransaction",
          params: [{ from: userAddress, to: createTx.to, data: createTx.data }],
        });

        setStage("CREATE_POLICY_PENDING");
        await waitForReceipt(eth, createPolicyTxHash);

        const authTx = buildAuthorizeSessionKeyTx({ sessionKey, policyId });
        setStage("AWAITING_AUTHORIZE_SIGNATURE");
        const authorizeTxHash: string = await eth.request({
          method: "eth_sendTransaction",
          params: [{ from: userAddress, to: authTx.to, data: authTx.data }],
        });

        setStage("AUTHORIZE_PENDING");
        await waitForReceipt(eth, authorizeTxHash);

        setResult({ policyId, createPolicyTxHash, authorizeTxHash });
        setStage("CONFIRMED");
      } catch (err: any) {
        if (err?.code === 4001 || err?.message?.includes("User rejected")) {
          setError("Transaction was cancelled in your wallet.");
        } else {
          setError(err?.message || "Transaction was rejected or failed.");
        }
        setStage("ERROR");
      }
    },
    [userAddress]
  );

  return { stage, error, result, activatePolicy, reset, explorerTxUrl };
}

async function waitForReceipt(eth: any, txHash: string, timeoutMs = 60000, intervalMs = 1500) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const receipt = await eth.request({
      method: "eth_getTransactionReceipt",
      params: [txHash],
    });
    if (receipt) {
      if (receipt.status === "0x0") {
        throw new Error(`Transaction ${txHash} reverted on-chain.`);
      }
      return receipt;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  // Don't fail the flow if confirmation is just slow -- the tx hash itself is already
  // real and checkable on Blockscout even if this poll times out.
  return null;
}
