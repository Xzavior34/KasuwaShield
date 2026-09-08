import React from "react";

interface CryptoIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

export const CryptoIcon: React.FC<CryptoIconProps> = ({
  symbol,
  size = 16,
  className = "",
}) => {
  const sym = symbol?.toUpperCase() || "";

  switch (sym) {
    case "BTC":
    case "WBTC":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 inline-block ${className}`}
          aria-label="Bitcoin"
        >
          <circle cx="16" cy="16" r="16" fill="#F7931A" />
          <path
            d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.314-1.256-.314l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.535 2.146-4.152.986-5.325.694l.95-3.81c1.172.293 4.929.872 4.375 3.116zm.536-5.565c-.488 1.954-3.501.962-4.478.718l.861-3.454c.977.243 4.118.698 3.617 2.736z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "ETH":
    case "WETH":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 inline-block ${className}`}
          aria-label="Ethereum"
        >
          <circle cx="16" cy="16" r="16" fill="#627EEA" />
          <g fill="#FFFFFF" fillRule="evenodd">
            <path d="M16.498 4v8.87l7.497 3.35z" fillOpacity="0.6" />
            <path d="M16.498 4L9 16.22l7.498-3.35z" />
            <path d="M16.498 21.968v6.027L24 17.616z" fillOpacity="0.6" />
            <path d="M16.498 27.995v-6.028L9 17.616z" />
            <path d="M16.498 20.573l7.497-4.354-7.497-3.349z" fillOpacity="0.2" />
            <path d="M9 16.22l7.498 4.353v-7.702z" fillOpacity="0.6" />
          </g>
        </svg>
      );

    case "SOL":
    case "WSOL":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 inline-block ${className}`}
          aria-label="Solana"
        >
          <circle cx="16" cy="16" r="16" fill="#000000" />
          <defs>
            <linearGradient id="solGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FFA3" />
              <stop offset="100%" stopColor="#DC1FFF" />
            </linearGradient>
          </defs>
          <path
            d="M8.5 21.8l2.4-2.4c.3-.3.8-.5 1.2-.5h11.4c.5 0 .8.6.5 1l-2.4 2.4c-.3.3-.8.5-1.2.5H9c-.5 0-.8-.6-.5-1zm0-11.6L10.9 7.8c.3-.3.8-.5 1.2-.5h11.4c.5 0 .8.6.5 1l-2.4 2.4c-.3.3-.8.5-1.2.5H9c-.5 0-.8-.6-.5-1zm15 5.8l-2.4 2.4c-.3.3-.8.5-1.2.5H8.5c-.5 0-.8-.6-.5-1l2.4-2.4c.3-.3.8-.5 1.2-.5h11.4c.5 0 .8.6.5 1z"
            fill="url(#solGrad)"
          />
        </svg>
      );

    case "SOMI":
    case "STT":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 inline-block ${className}`}
          aria-label="Somnia"
        >
          <circle cx="16" cy="16" r="16" fill="#0A1128" />
          <circle cx="16" cy="16" r="15" stroke="#00F0FF" strokeWidth="1" strokeOpacity="0.4" />
          <path
            d="M9 16c0-3.866 3.134-7 7-7 2.5 0 4.7 1.3 5.9 3.3l-2.8 1.6c-.7-1.2-2-1.9-3.1-1.9-2.2 0-4 1.8-4 4s1.8 4 4 4c1.1 0 2.4-.7 3.1-1.9l2.8 1.6C20.7 21.7 18.5 23 16 23c-3.866 0-7-3.134-7-7z"
            fill="#00F0FF"
          />
          <circle cx="21.5" cy="16" r="2.5" fill="#7000FF" />
          <circle cx="16" cy="16" r="1.5" fill="#FFFFFF" />
        </svg>
      );

    case "USDSO":
    case "USDC":
    case "TUSDC":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 inline-block ${className}`}
          aria-label="USDso"
        >
          <circle cx="16" cy="16" r="16" fill="#10B981" />
          <path
            d="M17.5 10.5c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5v.6c-1.8.3-3 1.6-3 3.2 0 1.9 1.5 2.8 3.5 3.3 1.7.4 2.5.9 2.5 1.8 0 .9-.8 1.6-2 1.6s-2.2-.7-2.4-1.8h-2.1c.2 2 1.6 3.4 3.5 3.8v.7c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5v-.6c2-.3 3.3-1.6 3.3-3.4 0-2-1.6-2.9-3.6-3.4-1.6-.4-2.4-.8-2.4-1.6 0-.8.7-1.4 1.7-1.4 1.1 0 1.8.6 2 1.5h2.1c-.2-1.7-1.4-2.9-3.1-3.2v-.6z"
            fill="#FFFFFF"
          />
        </svg>
      );

    default:
      return (
        <span
          style={{ width: size, height: size }}
          className={`inline-flex items-center justify-center rounded-full bg-slate-800 text-slate-300 font-bold text-[9px] border border-slate-700 shrink-0 ${className}`}
        >
          {sym.slice(0, 1) || "?"}
        </span>
      );
  }
};
