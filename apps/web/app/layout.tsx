import "./globals.css";
import React from "react";

export const metadata = {
  title: "KasuwaShield — Autonomous Portfolio Risk Agent",
  description: "Don't predict the downside. Protect the position continuously. Built on Somnia & DreamDEX Event Contracts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#060911] text-slate-100 antialiased selection:bg-emerald-500/30">
        {children}
      </body>
    </html>
  );
}
