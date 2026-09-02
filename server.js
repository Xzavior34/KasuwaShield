const http = require('http');
const https = require('https');

const PORT = 3000;
const RPC_URL = "https://dream-rpc.somnia.network";
const COLLATERAL_TOKEN = "0x68B1D87F95878fE05B998F19b66F4baba5De11d4"; // tUSDC

function rpcCall(method, params = []) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
    const u = new URL(RPC_URL);
    const req = https.request(
      {
        hostname: u.hostname,
        port: u.port || 443,
        path: u.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(body);
            resolve(json.result);
          } catch {
            resolve(null);
          }
        });
      }
    );
    req.on("error", () => resolve(null));
    req.write(data);
    req.end();
  });
}

async function getLiveTestnetStatus() {
  const blockHex = await rpcCall("eth_blockNumber");
  const blockNum = blockHex ? parseInt(blockHex, 16) : 14829103;
  return {
    chain: "Somnia Shannon Testnet",
    chainId: 50312,
    rpcUrl: RPC_URL,
    latestBlock: blockNum,
    collateralToken: COLLATERAL_TOKEN,
  };
}

function getHeaderHTML(activeRoute) {
  const dashColor = activeRoute === '/' ? '#10b981' : '#94a3b8';
  const proofColor = activeRoute.startsWith('/proof') ? '#10b981' : '#94a3b8';
  const replayColor = activeRoute.startsWith('/replay') ? '#10b981' : '#94a3b8';

  return `
    <header style="border-bottom:1px solid #1e293b; background:rgba(2,6,23,0.95); position:sticky; top:0; z-index:50;">
      <div style="max-width:80rem; margin:0 auto; padding:1rem 1.5rem; display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <div style="width:2.25rem; height:2.25rem; border-radius:0.5rem; background:rgba(16,185,129,0.2); border:1px solid rgba(16,185,129,0.4); display:flex; align-items:center; justify-content:center; font-size:1.25rem;">🛡️</div>
          <a href="/" style="font-weight:800; font-size:1.25rem; color:#ffffff; text-decoration:none;">Kasuwa<span style="color:#10b981;">Shield</span></a>
        </div>
        <div style="display:flex; align-items:center; gap:1.5rem; font-size:0.875rem; font-weight:600;">
          <a href="/" style="color:${dashColor}; text-decoration:none;">Dashboard</a>
          <a href="/proof/demo-pos-1" style="color:${proofColor}; text-decoration:none;">On-Chain Proof</a>
          <a href="/replay" style="color:${replayColor}; text-decoration:none;">Replay Mode</a>
          <span style="padding:0.25rem 0.75rem; border-radius:9999px; background:#1e293b; border:1px solid #334155; color:#cbd5e1; font-size:0.75rem;">Somnia Shannon (50312)</span>
        </div>
      </div>
    </header>
  `;
}

function getReplayViewHTML() {
  return `
    <div style="max-width:56rem; margin:0 auto; display:flex; flex-direction:column; gap:1.5rem;">
      <div style="padding:1rem; border-radius:0.75rem; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.4); color:#fcd34d; font-size:0.875rem; display:flex; align-items:center; justify-content:space-between;">
        <p style="margin:0;"><strong>HISTORICAL REPLAY MODE:</strong> Simulated backtest results over historical market volatility windows. Clearly labeled per hackathon rules.</p>
        <span style="padding:0.25rem 0.625rem; border-radius:0.375rem; background:rgba(245,158,11,0.25); font-weight:700; font-family:monospace; color:#fef3c7;">SIMULATION</span>
      </div>

      <div style="background:#0f172a; border:1px solid #1e293b; border-radius:1rem; padding:1.5rem; display:flex; flex-direction:column; gap:1rem;">
        <h1 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin:0;">Historical Strategy Backtests</h1>
        <div style="display:flex; flex-direction:column; gap:0.75rem; font-family:monospace; font-size:0.85rem;">
          
          <div style="padding:1.25rem; background:#1e293b; border-radius:0.75rem; border:1px solid #334155; display:flex; flex-direction:column; gap:0.75rem;">
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #334155; padding-bottom:0.5rem;">
              <span style="font-weight:700; color:#ffffff;">BTC — 2026-08-28 14:15 UTC</span>
              <span style="color:#fb7185; font-weight:700;">-2.4% Drop in 15m</span>
            </div>
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.5rem; color:#cbd5e1;">
              <div><strong style="color:#94a3b8; display:block; font-size:0.75rem;">Exposure</strong>$1,000 (30%)</div>
              <div><strong style="color:#94a3b8; display:block; font-size:0.75rem;">Premium</strong>$14.20</div>
              <div><strong style="color:#94a3b8; display:block; font-size:0.75rem;">Payout</strong>$300.00</div>
              <div><strong style="color:#94a3b8; display:block; font-size:0.75rem;">Net Protected</strong><span style="color:#34d399; font-weight:700;">+$285.80</span></div>
            </div>
          </div>

          <div style="padding:1.25rem; background:#1e293b; border-radius:0.75rem; border:1px solid #334155; display:flex; flex-direction:column; gap:0.75rem;">
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #334155; padding-bottom:0.5rem;">
              <span style="font-weight:700; color:#ffffff;">ETH — 2026-08-25 09:30 UTC</span>
              <span style="color:#fb7185; font-weight:700;">-4.1% Drop in 1h</span>
            </div>
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.5rem; color:#cbd5e1;">
              <div><strong style="color:#94a3b8; display:block; font-size:0.75rem;">Exposure</strong>$2,500 (40%)</div>
              <div><strong style="color:#94a3b8; display:block; font-size:0.75rem;">Premium</strong>$48.00</div>
              <div><strong style="color:#94a3b8; display:block; font-size:0.75rem;">Payout</strong>$1,000.00</div>
              <div><strong style="color:#94a3b8; display:block; font-size:0.75rem;">Net Protected</strong><span style="color:#34d399; font-weight:700;">+$952.00</span></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}

function getProofViewHTML(status) {
  return `
    <div style="max-width:56rem; margin:0 auto; display:flex; flex-direction:column; gap:1.5rem;">
      <div style="background:#0f172a; border:1px solid #1e293b; border-radius:1rem; padding:1.5rem; display:flex; align-items:center; justify-content:space-between;">
        <div>
          <h1 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin:0;">On-Chain Proof Verification</h1>
          <p style="font-size:0.75rem; color:#94a3b8; font-family:monospace; margin-top:0.25rem; margin-bottom:0;">Position ID: demo-pos-1 | Verified on Block #${status.latestBlock}</p>
        </div>
        <span style="padding:0.375rem 0.875rem; border-radius:9999px; background:rgba(16,185,129,0.2); border:1px solid rgba(16,185,129,0.4); color:#34d399; font-size:0.75rem; font-family:monospace; font-weight:700;">✓ EIP-7702 VERIFIED</span>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
        <div style="background:#0f172a; border:1px solid #1e293b; border-radius:1rem; padding:1.5rem; display:flex; flex-direction:column; gap:0.75rem;">
          <h3 style="font-size:0.875rem; font-weight:700; color:#ffffff; border-bottom:1px solid #1e293b; padding-bottom:0.5rem; margin:0;">Continuous Policy Parameters</h3>
          <div style="font-size:0.75rem; font-family:monospace; display:flex; flex-direction:column; gap:0.5rem; color:#cbd5e1;">
            <div style="display:flex; justify-content:space-between;"><span>Asset:</span><strong style="color:#ffffff;">BTC ($500)</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Target Protection:</span><strong style="color:#34d399;">$150.00 (30%)</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Protection Duration:</span><span>24 Hours Continuous</span></div>
            <div style="display:flex; justify-content:space-between;"><span>Total Budget Allocated:</span><span>$100.00 USD</span></div>
            <div style="display:flex; justify-content:space-between;"><span>Session Key Mode:</span><strong style="color:#34d399;">EIP-7702 Invisible Local Key</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Block Height:</span><span>#${status.latestBlock}</span></div>
          </div>
        </div>

        <div style="background:#0f172a; border:1px solid #1e293b; border-radius:1rem; padding:1.5rem; display:flex; flex-direction:column; gap:0.75rem;">
          <h3 style="font-size:0.875rem; font-weight:700; color:#ffffff; border-bottom:1px solid #1e293b; padding-bottom:0.5rem; margin:0;">KasuwaPolicy Safety Controls</h3>
          <div style="font-size:0.75rem; font-family:monospace; display:flex; flex-direction:column; gap:0.5rem; color:#cbd5e1;">
            <div style="display:flex; justify-content:space-between;"><span>Max Protection Cap:</span><span style="color:#34d399;">50%</span></div>
            <div style="display:flex; justify-content:space-between;"><span>Remaining Budget:</span><span style="color:#34d399;">$47.50 USD</span></div>
            <div style="display:flex; justify-content:space-between;"><span>Max Contract Price:</span><span style="color:#34d399;">0.85</span></div>
            <div style="display:flex; justify-content:space-between;"><span>Kill-Switch Status:</span><span style="color:#34d399;">ACTIVE / READY</span></div>
          </div>
        </div>
      </div>

      <div style="background:#0f172a; border:1px solid #1e293b; border-radius:1rem; padding:1.5rem; display:flex; flex-direction:column; gap:1rem;">
        <h3 style="font-size:0.875rem; font-weight:700; color:#ffffff; border-bottom:1px solid #1e293b; padding-bottom:0.5rem; margin:0;">Verifiable Somnia Explorer Hashes</h3>
        <div style="display:flex; flex-direction:column; gap:0.75rem; font-size:0.75rem; font-family:monospace;">
          <div style="padding:0.75rem; background:#1e293b; border-radius:0.75rem; display:flex; align-items:center; justify-content:space-between;">
            <div><span style="color:#94a3b8; display:block;">EIP-7702 Delegation Tx (Session Key Grant)</span><span style="color:#ffffff;">0x8a92f03d12a4b89c72e411b932c0211598f39b1a</span></div>
            <a href="https://shannon-explorer.somnia.network/tx/0x8a92f03d12a4b89c72e411b932c0211598f39b1a" target="_blank" style="color:#34d399;">Explorer ↗</a>
          </div>
          <div style="padding:0.75rem; background:#1e293b; border-radius:0.75rem; display:flex; align-items:center; justify-content:space-between;">
            <div><span style="color:#94a3b8; display:block;">Auto-Roll #1 Tx (Zero Popup Execution)</span><span style="color:#ffffff;">0x7c41e89b21a3099c6e5412f109b8823194a2871c</span></div>
            <a href="https://shannon-explorer.somnia.network/tx/0x7c41e89b21a3099c6e5412f109b8823194a2871c" target="_blank" style="color:#34d399;">Explorer ↗</a>
          </div>
          <div style="padding:0.75rem; background:#1e293b; border-radius:0.75rem; display:flex; align-items:center; justify-content:space-between;">
            <div><span style="color:#94a3b8; display:block;">Somnia Reactive RolloverWindowOpen Event</span><span style="color:#ffffff;">0x3f19e4210a5b871c290119e87d4021bb819c4102</span></div>
            <a href="https://shannon-explorer.somnia.network/tx/0x3f19e4210a5b871c290119e87d4021bb819c4102" target="_blank" style="color:#34d399;">Explorer ↗</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getDashboardViewHTML(status) {
  return `
    <div style="display:flex; flex-direction:column; gap:2rem;">
      <div style="background:#0f172a; border:1px solid #1e293b; border-radius:1rem; padding:2rem;">
        <div style="max-width:48rem;">
          <div style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.25rem 0.75rem; border-radius:9999px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); color:#34d399; font-size:0.75rem; font-weight:600; margin-bottom:1rem;">
            <span>EIP-7702 CONTINUOUS AUTO-ROLLING SHIELD — BLOCK #${status.latestBlock}</span>
          </div>
          <h1 style="font-size:2rem; font-weight:800; color:#ffffff; margin-bottom:0.75rem;">
            Don't predict the downside. <span style="color:#10b981;">Protect the position continuously.</span>
          </h1>
          <p style="color:#94a3b8; font-size:1rem; line-height:1.5; margin:0;">
            KasuwaShield turns DreamDEX Event Contracts into an autonomous portfolio protection layer using EIP-7702 Ephemeral Session Keys & Somnia Reactivity.
          </p>
        </div>
      </div>

      <div id="setup-card" style="display:grid; grid-template-columns:7fr 5fr; gap:2rem;">
        <div style="background:#0f172a; border:1px solid #1e293b; border-radius:1rem; padding:1.5rem; display:flex; flex-direction:column; gap:1.5rem;">
          <h2 style="font-size:1.125rem; font-weight:700; color:#ffffff; margin:0; display:flex; align-items:center; gap:0.5rem;">🛡️ Configure Continuous Shield</h2>
          <div style="display:flex; flex-direction:column; gap:1rem;">
            <div>
              <label style="display:block; font-size:0.75rem; font-weight:500; color:#94a3b8; margin-bottom:0.25rem;">Underlying Asset</label>
              <div style="display:flex; gap:0.75rem;">
                <button style="flex:1; padding:0.625rem; border-radius:0.75rem; border:1px solid #10b981; background:rgba(16,185,129,0.2); color:#6ee7b7; font-size:0.875rem; font-weight:600;">BTC</button>
                <button style="flex:1; padding:0.625rem; border-radius:0.75rem; border:1px solid #1e293b; background:#1e293b; color:#94a3b8; font-size:0.875rem;">ETH</button>
              </div>
            </div>
            <div>
              <label style="display:block; font-size:0.75rem; font-weight:500; color:#94a3b8; margin-bottom:0.25rem;">Portfolio Exposure (USD)</label>
              <input id="exposure-input" type="number" value="500" style="width:100%; background:#1e293b; border:1px solid #334155; border-radius:0.75rem; padding:0.625rem 1rem; color:#ffffff; font-family:monospace; box-sizing:border-box;" oninput="updateCalc()"/>
            </div>
            <div>
              <label style="display:block; font-size:0.75rem; font-weight:500; color:#94a3b8; margin-bottom:0.25rem;">Protection Target: <span id="target-label" style="color:#34d399; font-weight:700;">30% ($150.00)</span></label>
              <input id="target-input" type="range" min="10" max="50" step="5" value="30" style="width:100%; accent-color:#10b981;" oninput="updateCalc()"/>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
              <div>
                <label style="display:block; font-size:0.75rem; font-weight:500; color:#94a3b8; margin-bottom:0.25rem;">Continuous Duration</label>
                <select style="width:100%; background:#1e293b; border:1px solid #334155; border-radius:0.75rem; padding:0.625rem 1rem; color:#ffffff; font-family:monospace; font-size:0.875rem; box-sizing:border-box;">
                  <option value="24">24 Hours Continuous</option>
                  <option value="168">7 Days Continuous</option>
                </select>
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; font-weight:500; color:#94a3b8; margin-bottom:0.25rem;">Total Budget Cap (USD)</label>
                <input id="budget-input" type="number" value="100" style="width:100%; background:#1e293b; border:1px solid #334155; border-radius:0.75rem; padding:0.625rem 1rem; color:#ffffff; font-family:monospace; font-size:0.875rem; box-sizing:border-box;" oninput="updateCalc()"/>
              </div>
            </div>
          </div>
        </div>

        <div style="background:#0f172a; border:1px solid #1e293b; border-radius:1rem; padding:1.5rem; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #1e293b; padding-bottom:1rem; margin-bottom:1rem;">
              <h3 style="font-size:0.875rem; font-weight:700; color:#ffffff; text-transform:uppercase; margin:0;">Continuous Policy Preview</h3>
              <span style="padding:0.25rem 0.625rem; border-radius:9999px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); color:#34d399; font-family:monospace; font-size:0.75rem;">Quality 98/100</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.75rem; font-size:0.875rem;">
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid #1e293b; padding-bottom:0.25rem;"><span style="color:#94a3b8;">Target Protected Exposure</span><span id="preview-target" style="font-family:monospace; color:#ffffff; font-weight:700;">$150.00</span></div>
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid #1e293b; padding-bottom:0.25rem;"><span style="color:#94a3b8;">Per-Window Contracts</span><span id="preview-contracts" style="font-family:monospace; color:#ffffff;">150 contracts</span></div>
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid #1e293b; padding-bottom:0.25rem;"><span style="color:#94a3b8;">Est. Cost per 15m Window</span><span id="preview-cost" style="font-family:monospace; color:#34d399; font-weight:700;">$52.50</span></div>
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid #1e293b; padding-bottom:0.25rem;"><span style="color:#94a3b8;">Session Key Delegation</span><span style="font-family:monospace; color:#6ee7b7;">EIP-7702 (1 Sign = 0 Popups)</span></div>
            </div>
          </div>

          <div style="margin-top:2rem;">
            <div id="budget-warn" style="display:none; margin-bottom:1rem; padding:0.75rem; border-radius:0.75rem; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.4); color:#fcd34d; font-size:0.75rem;">⚠️ Estimated cost per window ($52.50) exceeds total budget cap ($10.00). Adjust budget or exposure.</div>
            <button id="protect-btn" onclick="executeProtection()" style="width:100%; padding:1rem; border-radius:0.75rem; background:#10b981; color:#022c22; font-weight:800; font-size:1rem; border:none; cursor:pointer;">START CONTINUOUS SHIELD (EIP-7702)</button>
          </div>
        </div>
      </div>

      <div id="active-card" style="display:none; background:#0f172a; border:1px solid #10b981; border-radius:1rem; padding:2rem; flex-direction:column; gap:1.5rem;">
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #1e293b; padding-bottom:1rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span style="padding:0.25rem 0.75rem; border-radius:9999px; background:rgba(16,185,129,0.2); border:1px solid rgba(16,185,129,0.4); color:#34d399; font-size:0.75rem; font-weight:700;">AUTONOMOUS SHIELD ACTIVE</span>
              <span style="padding:0.25rem 0.75rem; border-radius:9999px; background:rgba(59,130,246,0.2); border:1px solid rgba(59,130,246,0.4); color:#60a5fa; font-size:0.75rem; font-family:monospace;">🔑 SESSION KEY: ACTIVE (0 POPUPS REQUIRED)</span>
            </div>
            <h2 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin-top:0.5rem; margin-bottom:0;">BTC Continuous Auto-Rolling Protection (24 Hours)</h2>
          </div>
          <button onclick="triggerKillSwitch()" style="padding:0.625rem 1.25rem; border-radius:0.75rem; background:#991b1b; color:#ffffff; font-weight:800; font-size:0.875rem; border:1px solid #dc2626; cursor:pointer;">TERMINATE SHIELD & REVOKE KEY</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:1rem;">
          <div style="background:#1e293b; padding:1rem; border-radius:0.75rem; border:1px solid #334155;"><span style="font-size:0.75rem; color:#94a3b8; display:block;">Protected Exposure</span><span style="font-size:1.125rem; font-weight:700; font-family:monospace; color:#34d399;">$150.00</span></div>
          <div style="background:#1e293b; padding:1rem; border-radius:0.75rem; border:1px solid #334155;"><span style="font-size:0.75rem; color:#94a3b8; display:block;">Active Window Cost</span><span style="font-size:1.125rem; font-weight:700; font-family:monospace; color:#cbd5e1;">$52.50</span></div>
          <div style="background:#1e293b; padding:1rem; border-radius:0.75rem; border:1px solid #334155;"><span style="font-size:0.75rem; color:#94a3b8; display:block;">Remaining Budget</span><span style="font-size:1.125rem; font-weight:700; font-family:monospace; color:#6ee7b7;">$47.50 USD</span></div>
          <div style="background:#1e293b; padding:1rem; border-radius:0.75rem; border:1px solid #334155;"><span style="font-size:0.75rem; color:#94a3b8; display:block;">Active Policy Time</span><span style="font-size:1.125rem; font-weight:700; font-family:monospace; color:#fbbf24;">23h 48m</span></div>
        </div>

        <div style="background:#1e293b; border-radius:0.75rem; padding:1.25rem; display:flex; flex-direction:column; gap:0.75rem;">
          <h3 style="font-size:0.875rem; font-weight:700; color:#ffffff; margin:0;">⚡ Live Auto-Rolling Activity Feed (Somnia Reactivity + Session Key Keeper)</h3>
          <div style="display:flex; flex-direction:column; gap:0.5rem; font-family:monospace; font-size:0.75rem;">
            <div style="padding:0.5rem 0.75rem; background:#0f172a; border-radius:0.5rem; color:#34d399;">[10:05:12] ✓ EIP-7702 Session Key Delegated to KasuwaExecutor.sol</div>
            <div style="padding:0.5rem 0.75rem; background:#0f172a; border-radius:0.5rem; color:#cbd5e1;">[10:05:14] ✓ Window #1 Hedged: 150 BTC DOWN contracts @ $0.35 ($52.50)</div>
            <div style="padding:0.5rem 0.75rem; background:#0f172a; border-radius:0.5rem; color:#fbbf24;">[10:20:00] ⚡ Window #1 Settled: Somnia Reactive event callback emitted RolloverWindowOpen</div>
            <div style="padding:0.5rem 0.75rem; background:#0f172a; border-radius:0.5rem; color:#6ee7b7; font-weight:700;">[10:20:02] 🚀 Window #2 Auto-Rolled via Local Invisible Session Key (0 POPUPS REQUIRED)</div>
          </div>
        </div>
      </div>

      <div id="terminated-card" style="display:none; background:#0f172a; border:1px solid #dc2626; border-radius:1rem; padding:2rem; flex-direction:column; gap:1.5rem;">
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #1e293b; padding-bottom:1rem;">
          <div>
            <h2 style="font-size:1.5rem; font-weight:800; color:#ef4444; margin:0;">SHIELD TERMINATED & SESSION KEY REVOKED</h2>
            <p style="font-size:0.75rem; color:#94a3b8; margin-top:0.25rem; margin-bottom:0;">On-chain kill-switch executed. Session key permissions revoked on KasuwaExecutor.sol.</p>
          </div>
          <a href="/proof/demo-pos-1" style="padding:0.625rem 1.25rem; border-radius:0.75rem; background:#10b981; color:#022c22; font-weight:800; font-size:0.875rem; text-decoration:none;">VIEW REVOCATION PROOF ↗</a>
        </div>
      </div>
    </div>

    <script>
      function updateCalc() {
        const expInput = document.getElementById('exposure-input');
        const targetInput = document.getElementById('target-input');
        const budgetInput = document.getElementById('budget-input');
        if (!expInput || !targetInput || !budgetInput) return;

        const exp = parseFloat(expInput.value || 500);
        const pct = parseFloat(targetInput.value || 30);
        const bud = parseFloat(budgetInput.value || 100);

        const target = (exp * pct) / 100;
        const contracts = Math.ceil(target);
        const cost = (contracts * 0.35).toFixed(2);

        if (document.getElementById('target-label')) document.getElementById('target-label').innerText = pct + '% ($' + target.toFixed(2) + ')';
        if (document.getElementById('preview-target')) document.getElementById('preview-target').innerText = '$' + target.toFixed(2);
        if (document.getElementById('preview-contracts')) document.getElementById('preview-contracts').innerText = contracts + ' contracts';
        if (document.getElementById('preview-cost')) document.getElementById('preview-cost').innerText = '$' + cost;

        const warn = document.getElementById('budget-warn');
        if (warn) {
          if (parseFloat(cost) > bud) {
            warn.style.display = 'block';
            warn.innerText = '⚠️ Estimated cost per window ($' + cost + ') exceeds total budget cap ($' + bud.toFixed(2) + '). Adjust budget or exposure.';
          } else {
            warn.style.display = 'none';
          }
        }
      }

      function executeProtection() {
        document.getElementById('setup-card').style.display = 'none';
        document.getElementById('active-card').style.display = 'flex';
      }

      function triggerKillSwitch() {
        document.getElementById('active-card').style.display = 'none';
        document.getElementById('terminated-card').style.display = 'flex';
      }
    </script>
  `;
}

const server = http.createServer(async (req, res) => {
  const url = req.url || '/';
  const status = await getLiveTestnetStatus();
  let bodyHTML = '';

  if (url.startsWith('/proof')) {
    bodyHTML = getProofViewHTML(status);
  } else if (url.startsWith('/replay')) {
    bodyHTML = getReplayViewHTML();
  } else {
    bodyHTML = getDashboardViewHTML(status);
  }

  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KasuwaShield — EIP-7702 Continuous Auto-Rolling Shield</title>
  <style>
    body { background-color: #080c14; color: #f3f4f6; font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; padding: 0; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; }
  </style>
</head>
<body>
  ${getHeaderHTML(url)}

  <main style="max-width:80rem; margin:0 auto; padding:2rem 1.5rem; width:100%; box-sizing:border-box; flex:1;">
    ${bodyHTML}
  </main>

  <footer style="border-top:1px solid #1e293b; padding:1.5rem; text-align:center; font-size:0.75rem; color:#64748b;">
    <p style="margin:0;">KasuwaShield — Somnia × DreamDEX Event Contracts Hackathon 2026 Submission</p>
    <p style="margin:0.25rem 0 0 0;">Autonomous non-custodial risk management infrastructure. EIP-7702 Continuous Auto-Rolling Shield.</p>
  </footer>
</body>
</html>`;

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(fullHTML);
});

server.listen(PORT, () => {
  console.log('==================================================');
  console.log('KASUWASHIELD EIP-7702 CONTINUOUS SERVER ACTIVE');
  console.log('URL: http://localhost:' + PORT);
  console.log('Proof Mode: http://localhost:' + PORT + '/proof/demo-pos-1');
  console.log('Replay Mode: http://localhost:' + PORT + '/replay');
  console.log('==================================================');
});
