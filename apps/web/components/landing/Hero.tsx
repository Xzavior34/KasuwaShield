"use client";

import React from "react";
import Link from "next/link";
import { Shield, Wallet, ArrowDown, ExternalLink } from "lucide-react";

interface HeroProps {
  isConnected: boolean;
  isConnecting: boolean;
  hasInjectedProvider: boolean;
  address: string | null;
  onConnect: () => void;
  onScrollToApp: () => void;
}

export function Hero({ isConnected, isConnecting, hasInjectedProvider, address, onConnect, onScrollToApp }: HeroProps) {
  return (
    <section className="border-b border-slate-800/80 bg-[#060911]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 font-mono">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold">
            Somnia Shannon Testnet &middot; Chain 50312
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
          Event Contracts expire every 15 minutes.
          <br />
          Your downside risk doesn&apos;t.
        </h1>

        <p className="text-sm text-slate-400 mt-3 max-w-2xl leading-relaxed">
          KasuwaShield turns one wallet approval into a self-renewing hedge policy on DreamDEX Event
          Contracts. A non-custodial on-chain policy decides whether each roll is safe, and refuses
          execution the instant it isn&apos;t. This isn&apos;t a mockup: connect a testnet wallet below
          and you can create a real, on-chain protection policy under your own address right now.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
          <div className="bg-[#0b101d] border border-slate-800 rounded-lg px-3 py-2.5">
            <span className="text-emerald-400 font-bold block">1. Connect</span>
            <span className="text-slate-500">Any injected wallet, switches you to Somnia Shannon automatically.</span>
          </div>
          <div className="bg-[#0b101d] border border-slate-800 rounded-lg px-3 py-2.5">
            <span className="text-emerald-400 font-bold block">2. Configure</span>
            <span className="text-slate-500">Set exposure and target protection with the sliders below.</span>
          </div>
          <div className="bg-[#0b101d] border border-slate-800 rounded-lg px-3 py-2.5">
            <span className="text-emerald-400 font-bold block">3. Activate</span>
            <span className="text-slate-500">Two real signed transactions, your policy, live on-chain.</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {isConnected ? (
            <div className="px-3 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="px-4 py-2.5 rounded-md bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-2 hover:bg-emerald-400 transition-all"
            >
              <Wallet className="w-4 h-4" />
              <span>{isConnecting ? "CONNECTING..." : "CONNECT WALLET & TRY IT LIVE"}</span>
            </button>
          )}

          <button
            onClick={onScrollToApp}
            className="px-4 py-2.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs flex items-center space-x-2 hover:border-slate-500 transition-all"
          >
            <ArrowDown className="w-4 h-4" />
            <span>SKIP TO DASHBOARD</span>
          </button>

          <Link
            href="/proof"
            className="px-4 py-2.5 rounded-md text-slate-400 font-bold text-xs flex items-center space-x-1.5 hover:text-white transition-all"
          >
            <span>See on-chain proof</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!hasInjectedProvider && (
          <p className="text-[11px] text-amber-400/80 mt-3">
            No browser wallet detected. Install MetaMask or Rabby to connect and try this live, or
            keep scrolling to explore the dashboard in read-only mode.
          </p>
        )}

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>Need gas for Somnia Shannon testnet?</span>
          <a
            href="https://testnet.somnia.network/"
            target="_blank"
            rel="noreferrer"
            className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center space-x-1 transition-colors"
          >
            <span>Claim free testnet STT from the official Somnia Faucet</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </section>
  );
}
