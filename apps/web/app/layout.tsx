import "./globals.css";
import React from "react";

export const metadata = {
  title: "KasuwaShield — Programmable Downside Protection",
  description: "Don't predict the downside. Protect the position. Built on Somnia & DreamDEX Event Contracts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-between">
        <header className="border-b border-slate-800 bg-[#0c101c]/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg">
                🛡️
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Kasuwa<span className="text-emerald-400">Shield</span>
              </span>
            </div>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a href="/" className="hover:text-emerald-400 transition-colors">Dashboard</a>
              <a href="/proof/demo-pos-1" className="hover:text-emerald-400 transition-colors">On-Chain Proof</a>
              <a href="/replay" className="hover:text-emerald-400 transition-colors">Replay Mode</a>
              <div className="px-3 py-1.5 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-300">
                Somnia Shannon (50312)
              </div>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
          {children}
        </main>

        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
          <p>KasuwaShield — Somnia × DreamDEX Event Contracts Hackathon 2026 Submission</p>
          <p className="mt-1">Non-custodial risk management layer. Programmable downside protection.</p>
        </footer>
      </body>
    </html>
  );
}
