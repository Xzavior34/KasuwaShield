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

  const fetchBalance = useCallback(async (addr?: string) => {
    const target = addr || address;
    if (!target) return;

    try {
      // Direct query to Somnia Shannon testnet RPC guarantees real STT balance on chain 50312
      const res = await fetch("https://dream-rpc.somnia.network", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBalance",
          params: [target, "latest"],
        }),
      });
      const json = await res.json();
      if (json?.result) {
        const valWei = BigInt(json.result);
        const valSTT = (Number(valWei) / 1e18).toFixed(4);
        setBalanceSTT(valSTT);
        return;
      }
    } catch {
      // Fallback to window.ethereum below
    }

    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const res = await (window as any).ethereum.request({
          method: "eth_getBalance",
          params: [target, "latest"],
        });
        if (res) {
          const valWei = BigInt(res);
          const valSTT = (Number(valWei) / 1e18).toFixed(4);
          setBalanceSTT(valSTT);
        }
      }
    } catch {
      // Fallback
    }
  }, [address]);

  // Check if window.ethereum exists with resilient polling for delayed extension injection
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const initProvider = () => {
      try {
        if (typeof window === "undefined") return false;
        const eth = (window as any).ethereum;
        if (!eth) {
          console.log("[useWallet] No ethereum provider detected on page load");
          return false;
        }

        console.log("[useWallet] Ethereum provider detected, initializing...");
        setHasInjectedProvider(true);

        // Check already connected accounts
        eth
          .request({ method: "eth_accounts" })
          .then((accounts: string[]) => {
            if (accounts && accounts.length > 0) {
              console.log("[useWallet] Found existing connection:", accounts[0]);
              setAddress(accounts[0]);
              fetchBalance(accounts[0]);
            }
          })
          .catch((e: any) => {
            console.warn("[useWallet] eth_accounts error:", e);
          });

        // Check current chain ID
        eth
          .request({ method: "eth_chainId" })
          .then((cid: string) => {
            console.log("[useWallet] Current chain ID:", cid);
            setChainId(cid?.toLowerCase() || null);
          })
          .catch((e: any) => {
            console.warn("[useWallet] eth_chainId error:", e);
          });

        const handleAccountsChanged = (accounts: string[]) => {
          console.log("[useWallet] Accounts changed:", accounts);
          if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
            fetchBalance(accounts[0]);
          } else {
            setAddress(null);
            setBalanceSTT(null);
          }
        };

        const handleChainChanged = (newChainId: string) => {
          console.log("[useWallet] Chain changed:", newChainId);
          setChainId(newChainId?.toLowerCase() || null);
          eth
            .request({ method: "eth_accounts" })
            .then((accs: string[]) => {
              if (accs && accs.length > 0) fetchBalance(accs[0]);
            })
            .catch((e: any) => {
              console.warn("[useWallet] eth_accounts error on chain change:", e);
            });
        };

        eth.on?.("accountsChanged", handleAccountsChanged);
        eth.on?.("chainChanged", handleChainChanged);

        cleanup = () => {
          eth.removeListener?.("accountsChanged", handleAccountsChanged);
          eth.removeListener?.("chainChanged", handleChainChanged);
        };

        return true;
      } catch (e) {
        console.error("[useWallet] Provider initialization error:", e);
        return false;
      }
    };

    if (!initProvider()) {
      console.log("[useWallet] Initial provider check failed, polling...");
      const handleInitialized = () => {
        console.log("[useWallet] ethereum#initialized event fired");
        initProvider();
      };
      window.addEventListener("ethereum#initialized", handleInitialized, { once: true });

      const interval = setInterval(() => {
        if (initProvider()) {
          console.log("[useWallet] Provider found during poll");
          clearInterval(interval);
        }
      }, 200);

      const timeout = setTimeout(() => {
        console.log("[useWallet] Provider poll timeout");
        clearInterval(interval);
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
        window.removeEventListener("ethereum#initialized", handleInitialized);
        cleanup?.();
      };
    }

    return () => cleanup?.();
  }, []);

  // Periodic balance auto-refresh while wallet is connected
  useEffect(() => {
    if (!address) return;
    fetchBalance(address);
    const interval = setInterval(() => {
      fetchBalance(address);
    }, 8000);
    return () => clearInterval(interval);
  }, [address, fetchBalance]);

  const switchToSomnia = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    const eth = (window as any).ethereum;
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SOMNIA_CHAIN_ID_HEX }],
      });
      const cid = await eth.request({ method: "eth_chainId" });
      setChainId(cid?.toLowerCase() || null);
    } catch (switchErr: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchErr.code === 4902 || switchErr.message?.includes("4902")) {
        try {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [SOMNIA_PARAMS],
          });
          const cid = await eth.request({ method: "eth_chainId" });
          setChainId(cid?.toLowerCase() || null);
        } catch (addErr: any) {
          setError(addErr.message || "Failed to add Somnia network to wallet");
        }
      } else {
        setError(switchErr.message || "Failed to switch to Somnia network");
      }
    }
  };

  const connectWallet = useCallback(async () => {
    console.log("[connectWallet] Button clicked, starting connection flow");
    
    // Reset error state immediately
    setError(null);
    
    if (typeof window === "undefined") {
      const msg = "Window object not available. This feature requires a browser environment.";
      console.error("[connectWallet]", msg);
      setError(msg);
      setIsConnecting(false);
      return;
    }

    const eth = (window as any).ethereum;
    
    if (!eth) {
      const msg = "No Web3 browser wallet detected. Please install MetaMask, Rabby, or another EIP-1193 compatible wallet extension.";
      console.warn("[connectWallet]", msg);
      setError(msg);
      setIsConnecting(false);
      return;
    }

    console.log("[connectWallet] Ethereum provider found, setting isConnecting=true");
    setIsConnecting(true);

    try {
      // Explicitly guard against null ethereum
      if (!eth.request || typeof eth.request !== "function") {
        throw new Error("Ethereum provider does not support eth_requestAccounts method");
      }

      console.log("[connectWallet] Calling eth_requestAccounts...");
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      
      console.log("[connectWallet] Response from eth_requestAccounts:", accounts);

      if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
        const msg = "No accounts returned from wallet. Please ensure you have an account in your wallet.";
        console.warn("[connectWallet]", msg);
        setError(msg);
        setIsConnecting(false);
        return;
      }

      console.log("[connectWallet] Account connected:", accounts[0]);
      setAddress(accounts[0]);
      setError(null);
      await fetchBalance(accounts[0]);

      try {
        const cid = await eth.request({ method: "eth_chainId" });
        console.log("[connectWallet] Current chain ID:", cid);
        setChainId(cid?.toLowerCase() || null);

        if (cid?.toLowerCase() !== SOMNIA_CHAIN_ID_HEX) {
          console.log("[connectWallet] Wrong network, attempting to switch...");
          await switchToSomnia();
        }
      } catch (netErr: any) {
        console.warn("[connectWallet] Network check/switch deferred:", netErr);
        // Don't fail connection if network detection fails
      }
    } catch (err: any) {
      console.error("[connectWallet] Connection error:", err);
      
      if (err?.code === 4001 || err?.message?.includes("rejected")) {
        setError("You rejected the connection request in your wallet. Please try again and approve the connection.");
      } else if (err?.code === -32002) {
        setError("A connection request is already pending in your wallet. Please check your wallet extension.");
      } else if (err?.message?.includes("not injected")) {
        setError("Wallet provider not found. Please refresh the page and ensure your wallet extension is enabled.");
      } else {
        setError(err.message || "Failed to connect wallet. Please try again.");
      }
    } finally {
      console.log("[connectWallet] Connection flow complete, setting isConnecting=false");
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    console.log("[disconnectWallet] Disconnecting wallet");
    setAddress(null);
    setBalanceSTT(null);
    setError(null);
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
        const fallbackMsg = `KasuwaShield EIP-7702 Delegation Authorization\n\nDelegator: ${address}\nSession Key: ${sessionKeyAddress}\nMax Budget: ${maxBudgetUSD}\nExpires: ${new Date(expiresAt * 1000).toISOString()}`;
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
    refreshBalance: () => fetchBalance(address || undefined),
  };
}
