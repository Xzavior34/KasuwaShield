"use client";

import React, { useState } from "react";
import { Database, Copy, Check, ExternalLink } from "lucide-react";
import { AuditRecord } from "../hooks/useRiskEngineState";

interface AuditLedgerProps {
  auditLedger: AuditRecord[];
}

export function AuditLedger({ auditLedger }: AuditLedgerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-[#0b101d] rounded-xl p-5 border border-slate-800 space-y-4 shadow-xl font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">
            ON-CHAIN AUDIT LEDGER
          </h3>
        </div>
        <span className="text-xs text-slate-400">HISTORICAL PROTECTION ACTIONS</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <th className="py-2.5 px-3">TIME</th>
              <th className="py-2.5 px-3">EVENT</th>
              <th className="py-2.5 px-3">ACTION</th>
              <th className="py-2.5 px-3">CONTRACT</th>
              <th className="py-2.5 px-3">RISK SCORE</th>
              <th className="py-2.5 px-3">TX HASH</th>
              <th className="py-2.5 px-3 text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {auditLedger.map((row) => (
              <tr key={row.id} className="hover:bg-slate-900/80 transition-colors">
                <td className="py-3 px-3 text-slate-400">{row.time}</td>
                <td className="py-3 px-3 font-bold text-white">{row.event}</td>
                <td className="py-3 px-3 text-cyan-300">{row.action}</td>
                <td className="py-3 px-3 text-slate-400">{row.contract}</td>
                <td className="py-3 px-3 font-bold text-emerald-400">{row.riskScore}/100</td>
                <td className="py-3 px-3 font-mono">
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400 truncate max-w-[100px]">{row.txHash}</span>
                    <button
                      onClick={() => handleCopy(row.id, row.txHash)}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      {copiedId === row.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    row.status === "CONFIRMED"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}>
                    ● {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
