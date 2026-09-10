"use client";

import React from "react";
import Link from "next/link";
import { Shield, Wallet, ArrowRight, ExternalLink, Github } from "lucide-react";
import { useWallet } from "../hooks/useWallet";

export default function LandingPage() {
  const wallet = useWallet();

  return (
    <main className="min-h-screen bg-[#060911] font-mono">
      <header className="border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-extrabold tracking-tight text-white">
              KASUWA<span className="text-emerald-400">SHIELD</span>
            </span>
          </div>
          <a
            href="https://github.com/Xzavior34/KasuwaShield"
            target="_blank"
            rel="noreferrer"
            className="text-slate-500 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="flex items-center space-x-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold">
            Somnia Shannon Testnet &middot; Chain 50312
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-snug">
          Event Contracts expire every 15 minutes.
          <br />
          Your downside risk doesn&apos;t.
        </h1>

        <p className="text-sm sm:text-base text-slate-400 mt-4 max-w-2xl leading-relaxed">
          KasuwaShield turns one wallet approval into a self-renewing hedge policy on DreamDEX Event
          Contracts. A non-custodial on-chain policy decides whether each roll is safe, and refuses
          execution the instant it isn&apos;t.
        </p>

        <p className="text-sm sm:text-base text-emerald-400/90 mt-3 max-w-2xl leading-relaxed font-bold">
          This isn&apos;t a mockup. Connect a testnet wallet and you can create a real, on-chain
          protection policy under your own address, right now.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
          <div className="bg-[#0b101d] border border-slate-800 rounded-lg px-4 py-3">
            <span className="text-emerald-400 font-bold block mb-1">1. Connect</span>
            <span className="text-slate-500">Any injected wallet. Switches you to Somnia Shannon automatically.</span>
          </div>
          <div className="bg-[#0b101d] border border-slate-800 rounded-lg px-4 py-3">
            <span className="text-emerald-400 font-bold block mb-1">2. Configure</span>
            <span className="text-slate-500">Set your exposure and target protection level inside the app.</span>
          </div>
          <div className="bg-[#0b101d] border border-slate-800 rounded-lg px-4 py-3">
            <span className="text-emerald-400 font-bold block mb-1">3. Activate</span>
            <span className="text-slate-500">Two real signed transactions. Your policy, live on-chain.</span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {wallet.isConnected ? (
            <>
              <div className="px-4 py-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
                Connected: {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
              </div>
              <Link
                href="/app"
                className="px-5 py-2.5 rounded-md bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-2 hover:bg-emerald-400 transition-all"
              >
                <span>CONTINUE TO APP</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <button
              onClick={wallet.connectWallet}
              disabled={wallet.isConnecting}
              className="px-5 py-2.5 rounded-md bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-2 hover:bg-emerald-400 transition-all disabled:opacity-60"
            >
              <Wallet className="w-4 h-4" />
              <span>{wallet.isConnecting ? "CONNECTING..." : "CONNECT WALLET & TRY IT"}</span>
            </button>
          )}

          <Link
            href="/app"
            className="px-5 py-2.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs flex items-center space-x-2 hover:border-slate-500 transition-all"
          >
            <span>EXPLORE AS GUEST</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/proof"
            className="px-4 py-2.5 rounded-md text-slate-400 font-bold text-xs flex items-center space-x-1.5 hover:text-white transition-all"
          >
            <span>See on-chain proof</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!wallet.hasInjectedProvider && (
          <p className="text-[11px] text-amber-400/80 mt-3">
            No browser wallet detected. Install MetaMask or Rabby to connect, or enter the app to
            explore in read-only mode first.
          </p>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
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

      <footer className="border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
          <span>KasuwaShield &middot; Somnia &times; DreamDEX Event Contracts Hackathon 2026</span>
          <a
            href="https://github.com/Xzavior34/KasuwaShield"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-300 transition-colors"
          >
            GitHub Repository
          </a>
        </div>
      </footer>
    </main>
  );
}
