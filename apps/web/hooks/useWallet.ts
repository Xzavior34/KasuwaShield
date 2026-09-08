"use client";

import { useState, useEffect, useCallback } from "react";

export interface WalletState {
  address: string | null;
  chainId: string | null;
  balanceSTT: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  hasInjectedProvider: boolean;
  error: string | null;
}

const SOMNIA_CHAIN_ID_HEX = "0xc488"; // 50312 in hex
const SOMNIA_PARAMS = {
  chainId: SOMNIA_CHAIN_ID_HEX,
  chainName: "Somnia Shannon Testnet",
  nativeCurrency: {
    name: "Somnia Test Token",
    symbol: "STT",
    decimals: 18,
  },
  rpcUrls: ["https://dream-rpc.somnia.network"],
  blockExplorerUrls: ["https://shannon-explorer.somnia.network"],
};

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [balanceSTT, setBalanceSTT] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [hasInjectedProvider, setHasInjectedProvider] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if window.ethereum exists
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      setHasInjectedProvider(true);

      const eth = (window as any).ethereum;

      // Check already connected accounts
      eth
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
            fetchBalance(accounts[0]);
          }
        })
        .catch(() => {});

      // Check current chain ID
      eth
        .request({ method: "eth_chainId" })
        .then((cid: string) => {
          setChainId(cid?.toLowerCase() || null);
        })
        .catch(() => {});

      // Handlers for provider events
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          fetchBalance(accounts[0]);
        } else {
          setAddress(null);
          setBalanceSTT(null);
        }
      };

      const handleChainChanged = (newChainId: string) => {
        setChainId(newChainId?.toLowerCase() || null);
        if (address) fetchBalance(address);
      };

      eth.on?.("accountsChanged", handleAccountsChanged);
      eth.on?.("chainChanged", handleChainChanged);

      return () => {
        eth.removeListener?.("accountsChanged", handleAccountsChanged);
        eth.removeListener?.("chainChanged", handleChainChanged);
      };
    }
  }, []);

  const fetchBalance = async (addr: string) => {
    try {
      if (typeof window === "undefined" || !(window as any).ethereum) return;
      const res = await (window as any).ethereum.request({
        method: "eth_getBalance",
        params: [addr, "latest"],
      });
      if (res) {
        const valWei = BigInt(res);
        const valSTT = (Number(valWei) / 1e18).toFixed(4);
        setBalanceSTT(valSTT);
      }
    } catch {
      // Fallback
    }
  };

  const switchToSomnia = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    const eth = (window as any).ethereum;
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SOMNIA_CHAIN_ID_HEX }],
      });
    } catch (switchErr: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchErr.code === 4902 || switchErr.message?.includes("4902")) {
        try {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [SOMNIA_PARAMS],
          });
        } catch (addErr: any) {
          setError(addErr.message || "Failed to add Somnia network to wallet");
        }
      } else {
        setError(switchErr.message || "Failed to switch to Somnia network");
      }
    }
  };

  const connectWallet = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setError("No Web3 browser wallet detected (e.g. MetaMask, Rabby). Install a wallet extension or use Testnet Signer mode.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const eth = (window as any).ethereum;
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        await fetchBalance(accounts[0]);

        const cid = await eth.request({ method: "eth_chainId" });
        setChainId(cid?.toLowerCase() || null);

        if (cid?.toLowerCase() !== SOMNIA_CHAIN_ID_HEX) {
          await switchToSomnia();
        }
      }
    } catch (err: any) {
      setError(err.message || "User rejected wallet connection");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setBalanceSTT(null);
  }, []);

  const signSessionAuthorization = useCallback(
    async (sessionKeyAddress: string, maxBudgetUSD: string, durationSeconds: number): Promise<string> => {
      if (typeof window === "undefined" || !(window as any).ethereum || !address) {
        throw new Error("Wallet not connected");
      }

      const eth = (window as any).ethereum;
      const timestamp = Math.floor(Date.now() / 1000);
      const expiresAt = timestamp + durationSeconds;

      // EIP-712 structured data for KasuwaShield session key delegation
      const msgParams = JSON.stringify({
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          SessionKeyAuthorization: [
            { name: "delegator", type: "address" },
            { name: "sessionKey", type: "address" },
            { name: "maxBudgetUSD", type: "string" },
            { name: "authorizedAt", type: "uint256" },
            { name: "expiresAt", type: "uint256" },
            { name: "scope", type: "string" },
          ],
        },
        primaryType: "SessionKeyAuthorization",
        domain: {
          name: "KasuwaShield Risk Agent",
          version: "2.0",
          chainId: 50312,
          verifyingContract: "0xbd2a26c3893db93ef86e0ceaaec080df8f9c550a",
        },
        message: {
          delegator: address,
          sessionKey: sessionKeyAddress,
          maxBudgetUSD,
          authorizedAt: timestamp,
          expiresAt,
          scope: "executeAutoRoll(bytes32,uint256,uint256)",
        },
      });

      try {
        const sig = await eth.request({
          method: "eth_signTypedData_v4",
          params: [address, msgParams],
        });
        return sig;
      } catch (typedErr) {
        // Fallback to personal_sign if wallet doesn't support v4
        const fallbackMsg = `KasuwaShield EIP-7702 Delegation Authorization\n\nDelegator: ${address}\nSession Key: ${sessionKeyAddress}\nMax Budget: ${maxBudgetUSD}\nExpires: ${new Date(expiresAt * 1000).toISOString()}\nChain ID: 50312 (Somnia Shannon)`;
        const sig = await eth.request({
          method: "personal_sign",
          params: [fallbackMsg, address],
        });
        return sig;
      }
    },
    [address]
  );

  const isCorrectNetwork = chainId?.toLowerCase() === SOMNIA_CHAIN_ID_HEX;

  return {
    address,
    chainId,
    balanceSTT,
    isConnected: !!address,
    isConnecting,
    isCorrectNetwork,
    hasInjectedProvider,
    error,
    connectWallet,
    disconnectWallet,
    switchToSomnia,
    signSessionAuthorization,
  };
}
