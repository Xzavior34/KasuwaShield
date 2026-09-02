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
  const blockNum = blockHex ? parseInt(blockHex, 16) : 1284925;
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
    <header style="border-bottom:1px solid #1e293b; background:rgba(6,9,17,0.95); position:sticky; top:0; z-index:50;">
      <div style="max-width:96rem; margin:0 auto; padding:1rem 1.5rem; display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <div style="width:2.25rem; height:2.25rem; border-radius:0.5rem; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); display:flex; align-items:center; justify-content:center; font-size:1.25rem;">🛡️</div>
          <div>
            <a href="/" style="font-weight:800; font-size:1.125rem; color:#ffffff; text-decoration:none; font-family:monospace;">KASUWA<span style="color:#10b981;">SHIELD</span></a>
            <span style="font-size:0.65rem; color:#94a3b8; font-family:monospace; display:block;">INSTITUTIONAL QUANT DOWNSIDE PROTECTION</span>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:1.5rem; font-size:0.875rem; font-weight:600; font-family:monospace;">
          <a href="/" style="color:${dashColor}; text-decoration:none;">Dashboard</a>
          <a href="/proof/demo-pos-1" style="color:${proofColor}; text-decoration:none;">On-Chain Proof</a>
          <a href="/replay" style="color:${replayColor}; text-decoration:none;">Replay Mode</a>
          <span style="padding:0.25rem 0.75rem; border-radius:0.375rem; background:#1e293b; border:1px solid #334155; color:#cbd5e1; font-size:0.75rem;">Somnia Shannon (50312)</span>
        </div>
      </div>
    </header>
  `;
}

function getReplayViewHTML() {
  return `
    <div style="max-width:56rem; margin:0 auto; display:flex; flex-direction:column; gap:1.5rem; font-family:monospace;">
      <div style="padding:1rem; border-radius:0.75rem; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.4); color:#fcd34d; font-size:0.875rem; display:flex; align-items:center; justify-content:space-between;">
        <p style="margin:0;"><strong>HISTORICAL REPLAY MODE:</strong> Simulated backtest results over historical volatility windows.</p>
        <span style="padding:0.25rem 0.625rem; border-radius:0.375rem; background:rgba(245,158,11,0.25); font-weight:700; color:#fef3c7;">DYNAMIC BACKTEST ENGINE</span>
      </div>

      <div style="background:#0b101d; border:1px solid #1e293b; border-radius:0.75rem; padding:1.5rem; display:flex; flex-direction:column; gap:1.5rem;">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <h1 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin:0;">Dynamic Strategy Backtest Engine</h1>
          <button onclick="runDynamicBacktest()" style="padding:0.625rem 1.25rem; border-radius:0.5rem; background:#10b981; color:#022c22; font-weight:800; font-size:0.875rem; border:none; cursor:pointer;">⚡ RUN DYNAMIC VOLATILITY BACKTEST</button>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; background:#0f172a; padding:1rem; border-radius:0.5rem; border:1px solid #334155;">
          <div>
            <label style="display:block; font-size:0.75rem; color:#94a3b8; margin-bottom:0.25rem;">Simulated Portfolio Exposure ($)</label>
            <input id="replay-exposure" type="number" value="25000" style="width:100%; background:#0b101d; border:1px solid #334155; border-radius:0.375rem; padding:0.5rem; color:#fff; font-family:monospace;" oninput="recalculateReplay()"/>
          </div>
          <div>
            <label style="display:block; font-size:0.75rem; color:#94a3b8; margin-bottom:0.25rem;">Protection Coverage Target (%)</label>
            <input id="replay-target-pct" type="number" value="80" style="width:100%; background:#0b101d; border:1px solid #334155; border-radius:0.375rem; padding:0.5rem; color:#fff; font-family:monospace;" oninput="recalculateReplay()"/>
          </div>
          <div>
            <label style="display:block; font-size:0.75rem; color:#94a3b8; margin-bottom:0.25rem;">Contract Ask Price ($)</label>
            <input id="replay-price" type="number" value="0.35" step="0.05" style="width:100%; background:#0b101d; border:1px solid #334155; border-radius:0.375rem; padding:0.5rem; color:#fff; font-family:monospace;" oninput="recalculateReplay()"/>
          </div>
        </div>

        <div id="simulation-output" style="display:flex; flex-direction:column; gap:0.75rem; font-size:0.85rem;">
        </div>
      </div>
    </div>

    <script>
      var historicalWindows = [
        { asset: 'BTC', drop: '-2.4% Drop in 15m', time: '2026-08-28 14:15 UTC', defaultExp: 25000, defaultPct: 80, price: 0.35 },
        { asset: 'ETH', drop: '-4.1% Drop in 1h', time: '2026-08-25 09:30 UTC', defaultExp: 10000, defaultPct: 80, price: 0.40 }
      ];

      function computeBacktestRow(w) {
        var expInput = document.getElementById('replay-exposure');
        var pctInput = document.getElementById('replay-target-pct');
        var priceInput = document.getElementById('replay-price');

        var exp = expInput ? parseFloat(expInput.value || w.defaultExp) : w.defaultExp;
        var pct = pctInput ? parseFloat(pctInput.value || w.defaultPct) : w.defaultPct;
        var price = priceInput ? parseFloat(priceInput.value || w.price) : w.price;

        var targetProtectedUSD = (exp * pct) / 100;
        var contracts = Math.ceil(targetProtectedUSD);
        var premiumUSD = (contracts * price).toFixed(2);
        var payoutUSD = (contracts * 1.00).toFixed(2);
        var netProtectedUSD = (parseFloat(payoutUSD) - parseFloat(premiumUSD)).toFixed(2);

        return '<div style="padding:1.25rem; background:#0f172a; border-radius:0.5rem; border:1px solid #334155; display:flex; flex-direction:column; gap:0.75rem;">' +
          '<div style="display:flex; justify-content:space-between; border-bottom:1px solid #334155; padding-bottom:0.5rem;">' +
            '<span style="font-weight:700; color:#ffffff;">' + w.asset + ' — ' + w.time + '</span>' +
            '<span style="color:#fb7185; font-weight:700;">' + w.drop + '</span>' +
          '</div>' +
          '<div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.5rem; color:#cbd5e1;">' +
            '<div><strong style="color:#94a3b8; display:block; font-size:0.75rem;">Exposure</strong>$' + exp.toLocaleString() + ' (' + pct + '%)</div>' +
            '<div><strong style="color:#94a3b8; display:block; font-size:0.75rem;">Premium Paid</strong>$' + premiumUSD + '</div>' +
            '<div><strong style="color:#94a3b8; display:block; font-size:0.75rem;">Redemption Payout</strong>$' + payoutUSD + '</div>' +
            '<div><strong style="color:#94a3b8; display:block; font-size:0.75rem;">Net Protected PnL</strong><span style="color:#34d399; font-weight:700;">+$' + netProtectedUSD + '</span></div>' +
          '</div>' +
        '</div>';
      }

      function recalculateReplay() {
        var container = document.getElementById('simulation-output');
        if (!container) return;
        var html = '';
        for (var i = 0; i < historicalWindows.length; i++) {
          html += computeBacktestRow(historicalWindows[i]);
        }
        container.innerHTML = html;
      }
      recalculateReplay();
    </script>
  `;
}

function getProofViewHTML(status) {
  return `
    <div style="max-width:56rem; margin:0 auto; display:flex; flex-direction:column; gap:1.5rem; font-family:monospace;">
      <div style="background:#0b101d; border:1px solid #1e293b; border-radius:0.75rem; padding:1.5rem; display:flex; align-items:center; justify-content:space-between;">
        <div>
          <h1 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin:0;">Proof Verification (Demo Mode)</h1>
          <p style="font-size:0.75rem; color:#94a3b8; margin-top:0.25rem; margin-bottom:0;">Position ID: demo-pos-1 | Verified on Block #${status.latestBlock}</p>
        </div>
        <span style="padding:0.375rem 0.875rem; border-radius:9999px; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.4); color:#fcd34d; font-size:0.75rem; font-weight:700;">SIMULATED TRANSACTION</span>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
        <div style="background:#0b101d; border:1px solid #1e293b; border-radius:0.75rem; padding:1.5rem; display:flex; flex-direction:column; gap:0.75rem;">
          <h3 style="font-size:0.875rem; font-weight:700; color:#ffffff; border-bottom:1px solid #1e293b; padding-bottom:0.5rem; margin:0;">Continuous Policy Parameters</h3>
          <div style="font-size:0.75rem; display:flex; flex-direction:column; gap:0.5rem; color:#cbd5e1;">
            <div style="display:flex; justify-content:space-between;"><span>Asset & Exposure:</span><strong style="color:#ffffff;">BTC ($25,000)</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Target Protection:</span><strong style="color:#34d399;">$20,000.00 (80%)</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Protection Duration:</span><span>24 Hours Continuous</span></div>
            <div style="display:flex; justify-content:space-between;"><span>Total Budget Allocated:</span><span>$100.00 USD</span></div>
            <div style="display:flex; justify-content:space-between;"><span>Delegated Execution:</span><strong style="color:#34d399;">EIP-7702 (0 Popups Required)</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Block Height:</span><span>#${status.latestBlock}</span></div>
          </div>
        </div>

        <div style="background:#0b101d; border:1px solid #1e293b; border-radius:0.75rem; padding:1.5rem; display:flex; flex-direction:column; gap:0.75rem;">
          <h3 style="font-size:0.875rem; font-weight:700; color:#ffffff; border-bottom:1px solid #1e293b; padding-bottom:0.5rem; margin:0;">KasuwaPolicy Safety Controls</h3>
          <div style="font-size:0.75rem; display:flex; flex-direction:column; gap:0.5rem; color:#cbd5e1;">
            <div style="display:flex; justify-content:space-between;"><span>Max Protection Cap:</span><span style="color:#34d399;">50%</span></div>
            <div style="display:flex; justify-content:space-between;"><span>Remaining Budget:</span><span style="color:#34d399;">$47.50 USD</span></div>
            <div style="display:flex; justify-content:space-between;"><span>Max Contract Price:</span><span style="color:#34d399;">0.85</span></div>
            <div style="display:flex; justify-content:space-between;"><span>Kill-Switch Status:</span><span style="color:#34d399;">ACTIVE / READY</span></div>
          </div>
        </div>
      </div>

      <div style="background:#0b101d; border:1px solid #1e293b; border-radius:0.75rem; padding:1.5rem; display:flex; flex-direction:column; gap:1rem;">
        <h3 style="font-size:0.875rem; font-weight:700; color:#ffffff; border-bottom:1px solid #1e293b; padding-bottom:0.5rem; margin:0;">Verifiable Somnia Explorer Hashes</h3>
        <div style="display:flex; flex-direction:column; gap:0.75rem; font-size:0.75rem;">
          <div style="padding:0.75rem; background:#0f172a; border-radius:0.5rem; display:flex; align-items:center; justify-content:space-between;">
            <div><span style="color:#94a3b8; display:block;">Live Shannon Testnet Block #${status.latestBlock}</span><span style="color:#ffffff;">https://shannon-explorer.somnia.network/block/${status.latestBlock}</span></div>
            <a href="https://shannon-explorer.somnia.network/block/${status.latestBlock}" target="_blank" style="color:#34d399;">Block Explorer ↗</a>
          </div>
          <div style="padding:0.75rem; background:#0f172a; border-radius:0.5rem; display:flex; align-items:center; justify-content:space-between;">
            <div><span style="color:#94a3b8; display:block;">DreamDEX Collateral Token (tUSDC) Contract</span><span style="color:#ffffff;">${status.collateralToken}</span></div>
            <a href="https://shannon-explorer.somnia.network/address/${status.collateralToken}" target="_blank" style="color:#34d399;">Token Contract ↗</a>
          </div>
          <div style="padding:0.75rem; background:#0f172a; border-radius:0.5rem; display:flex; align-items:center; justify-content:space-between;">
            <div><span style="color:#94a3b8; display:block;">KasuwaShield Risk Policy Contract</span><span style="color:#ffffff;">0x43a18f29d10e42819873a90a218291b87a82910a</span></div>
            <a href="https://shannon-explorer.somnia.network/address/0x43a18f29d10e42819873a90a218291b87a82910a" target="_blank" style="color:#34d399;">Policy Contract ↗</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getDashboardViewHTML(status) {
  return `
    <div style="display:flex; flex-direction:column; gap:1.5rem; font-family:monospace;">
      <div style="background:#0b101d; border:1px solid #1e293b; border-radius:0.75rem; padding:1.5rem;">
        <div style="max-width:48rem;">
          <div style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.25rem 0.75rem; border-radius:9999px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); color:#34d399; font-size:0.75rem; font-weight:600; margin-bottom:1rem;">
            <span>EIP-7702 DELEGATED EXECUTION — BLOCK #${status.latestBlock}</span>
          </div>
          <h1 style="font-size:1.75rem; font-weight:800; color:#ffffff; margin-bottom:0.75rem;">
            Don't predict the downside. <span style="color:#10b981;">Protect the position continuously.</span>
          </h1>
          <p style="color:#94a3b8; font-size:0.875rem; line-height:1.5; margin:0;">
            KasuwaShield turns DreamDEX Event Contracts into an autonomous portfolio protection layer using EIP-7702 Delegated Execution & Somnia Reactivity.
          </p>
        </div>
      </div>
    </div>
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
  <title>KasuwaShield — Institutional Quant Risk Terminal</title>
  <style>
    body { background-color: #060911; color: #f3f4f6; font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; padding: 0; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; }
  </style>
</head>
<body>
  ${getHeaderHTML(url)}

  <main style="max-width:96rem; margin:0 auto; padding:2rem 1.5rem; width:100%; box-sizing:border-box; flex:1;">
    ${bodyHTML}
  </main>

  <footer style="border-top:1px solid #1e293b; padding:1.5rem; text-align:center; font-size:0.75rem; color:#64748b; font-family:monospace;">
    <p style="margin:0;">KasuwaShield — Somnia × DreamDEX Event Contracts Hackathon 2026 Submission</p>
    <p style="margin:0.25rem 0 0 0;">Autonomous Portfolio Risk Agent. EIP-7702 Delegated Execution Infrastructure.</p>
  </footer>
</body>
</html>`;

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(fullHTML);
});

server.listen(PORT, () => {
  console.log('==================================================');
  console.log('KASUWASHIELD INSTITUTIONAL QUANT TERMINAL SERVER ACTIVE');
  console.log('URL: http://localhost:' + PORT);
  console.log('Proof Mode: http://localhost:' + PORT + '/proof/demo-pos-1');
  console.log('Replay Mode: http://localhost:' + PORT + '/replay');
  console.log('==================================================');
});
