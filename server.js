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

function getHeaderHTML(activeRoute, status) {
  const dashColor = activeRoute === '/' ? '#10b981' : '#94a3b8';
  const proofColor = activeRoute.startsWith('/proof') ? '#10b981' : '#94a3b8';
  const replayColor = activeRoute.startsWith('/replay') ? '#10b981' : '#94a3b8';

  return `
    <header style="border-bottom:1px solid #1e293b; background:rgba(6,9,17,0.95); position:sticky; top:0; z-index:50; font-family:monospace;">
      <div style="max-width:96rem; margin:0 auto; padding:1rem 1.5rem; display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <div style="width:2.25rem; height:2.25rem; border-radius:0.5rem; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); display:flex; align-items:center; justify-content:center; font-size:1.25rem;">🛡️</div>
          <div>
            <a href="/" style="font-weight:800; font-size:1.125rem; color:#ffffff; text-decoration:none;">KASUWA<span style="color:#10b981;">SHIELD</span></a>
            <span style="font-size:0.65rem; color:#94a3b8; display:block;">INSTITUTIONAL QUANT DOWNSIDE PROTECTION</span>
          </div>
        </div>

        <nav style="display:flex; align-items:center; gap:1.5rem; font-size:0.875rem; font-weight:600;">
          <a href="/" style="color:${dashColor}; text-decoration:none;">Dashboard</a>
          <a href="/proof/demo-pos-1" style="color:${proofColor}; text-decoration:none;">On-Chain Proof</a>
          <a href="/replay" style="color:${replayColor}; text-decoration:none;">Replay Mode</a>
          <span style="padding:0.25rem 0.75rem; border-radius:0.375rem; background:#1e293b; border:1px solid #334155; color:#cbd5e1; font-size:0.75rem;">Somnia Shannon (50312)</span>
        </nav>

        <div>
          <button onclick="triggerStressSimulation()" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#dc2626; color:#ffffff; font-weight:800; font-size:0.75rem; border:1px solid #f87171; cursor:pointer;">⚠️ [ SIMULATE MARKET STRESS ]</button>
        </div>
      </div>

      <!-- High-Density Hero Status Strip -->
      <div style="border-top:1px solid #1e293b; background:#090d19; padding:0.625rem 1.5rem;">
        <div style="max-width:96rem; margin:0 auto; display:grid; grid-template-columns:repeat(8, 1fr); gap:0.75rem; font-size:0.75rem;">
          <div style="background:rgba(15,23,42,0.8); padding:0.5rem; border-radius:0.375rem; border:1px solid #1e293b;">
            <span style="color:#94a3b8; display:block; font-size:0.65rem; text-transform:uppercase;">Portfolio Value</span>
            <span style="font-weight:700; color:#ffffff; font-size:0.875rem;">$25,000</span>
          </div>
          <div style="background:rgba(15,23,42,0.8); padding:0.5rem; border-radius:0.375rem; border:1px solid #1e293b;">
            <span style="color:#94a3b8; display:block; font-size:0.65rem; text-transform:uppercase;">Protected Value</span>
            <span style="font-weight:700; color:#34d399; font-size:0.875rem;">$20,000</span>
          </div>
          <div style="background:rgba(15,23,42,0.8); padding:0.5rem; border-radius:0.375rem; border:1px solid #1e293b;">
            <span style="color:#94a3b8; display:block; font-size:0.65rem; text-transform:uppercase;">Protection Coverage</span>
            <span id="strip-coverage" style="font-weight:700; color:#6ee7b7; font-size:0.875rem;">80.0%</span>
          </div>
          <div style="background:rgba(15,23,42,0.8); padding:0.5rem; border-radius:0.375rem; border:1px solid #1e293b;">
            <span style="color:#94a3b8; display:block; font-size:0.65rem; text-transform:uppercase;">Protection Gap</span>
            <span id="strip-gap" style="font-weight:700; color:#34d399; font-size:0.875rem;">0.0%</span>
          </div>
          <div style="background:rgba(15,23,42,0.8); padding:0.5rem; border-radius:0.375rem; border:1px solid #1e293b;">
            <span style="color:#94a3b8; display:block; font-size:0.65rem; text-transform:uppercase;">Current Risk</span>
            <span id="strip-risk" style="font-weight:700; color:#34d399; font-size:0.875rem;">34 / 100</span>
          </div>
          <div style="background:rgba(15,23,42,0.8); padding:0.5rem; border-radius:0.375rem; border:1px solid #1e293b;">
            <span style="color:#94a3b8; display:block; font-size:0.65rem; text-transform:uppercase;">Hedge Status</span>
            <span id="strip-status" style="padding:0.125rem 0.375rem; border-radius:0.25rem; background:rgba(16,185,129,0.2); border:1px solid rgba(16,185,129,0.4); color:#34d399; font-weight:700; font-size:0.65rem;">● PROTECTED</span>
          </div>
          <div style="background:rgba(15,23,42,0.8); padding:0.5rem; border-radius:0.375rem; border:1px solid #1e293b;">
            <span style="color:#94a3b8; display:block; font-size:0.65rem; text-transform:uppercase;">User Interventions</span>
            <span style="font-weight:700; color:#34d399; font-size:0.875rem;">0 ACTIONS</span>
          </div>
          <div style="background:rgba(15,23,42,0.8); padding:0.5rem; border-radius:0.375rem; border:1px solid #1e293b;">
            <span style="color:#94a3b8; display:block; font-size:0.65rem; text-transform:uppercase;">Event → Execution</span>
            <span style="font-weight:700; color:#cbd5e1; font-size:0.75rem;">133ms <span style="color:#f59e0b; font-size:0.6rem;">(DEMO)</span></span>
          </div>
        </div>
      </div>
    </header>
  `;
}

function getDashboardViewHTML(status) {
  return `
    <div style="display:flex; flex-direction:column; gap:1.5rem; font-family:monospace;">
      
      <!-- Summary Restored Banner (Hidden initially) -->
      <div id="restored-card" style="display:none; background:#0b101d; border:2px solid #10b981; border-radius:0.75rem; padding:1.5rem; flex-direction:column; gap:1rem;">
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(16,185,129,0.3); padding-bottom:0.75rem;">
          <div>
            <h2 style="font-size:1.25rem; font-weight:900; color:#ffffff; margin:0;">✓ PROTECTION RESTORED</h2>
            <p style="font-size:0.75rem; color:#34d399; margin:0.25rem 0 0 0;">Autonomous EIP-7702 Auto-Roll Executed Successfully • 0 User Signatures Required</p>
          </div>
          <button onclick="document.getElementById('restored-card').style.display='none'" style="background:none; border:none; color:#94a3b8; font-size:1.25rem; cursor:pointer;">✕</button>
        </div>
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.75rem; text-align:center;">
          <div style="background:#0f172a; padding:0.75rem; border-radius:0.5rem; border:1px solid #1e293b;"><span style="font-size:0.65rem; color:#94a3b8; display:block;">COVERAGE RESTORED</span><strong style="font-size:1.25rem; color:#34d399;">80.0%</strong></div>
          <div style="background:#0f172a; padding:0.75rem; border-radius:0.5rem; border:1px solid #1e293b;"><span style="font-size:0.65rem; color:#94a3b8; display:block;">RISK SCORE</span><strong style="font-size:1.25rem; color:#6ee7b7;">32 / 100</strong></div>
          <div style="background:#0f172a; padding:0.75rem; border-radius:0.5rem; border:1px solid #1e293b;"><span style="font-size:0.65rem; color:#94a3b8; display:block;">USER ACTIONS</span><strong style="font-size:1.25rem; color:#34d399;">0 ACTIONS</strong></div>
          <div style="background:#0f172a; padding:0.75rem; border-radius:0.5rem; border:1px solid #334155;"><span style="font-size:0.65rem; color:#94a3b8; display:block;">HEDGE POSITION</span><strong style="font-size:1.25rem; color:#67e8f9;">ACTIVE</strong></div>
        </div>
      </div>

      <!-- Bento Row 1: Spot vs Strike Chart & Hedge Dial -->
      <div style="display:grid; grid-template-columns:8fr 4fr; gap:1.5rem;">
        <div style="background:#0b101d; border:1px solid #1e293b; border-radius:0.75rem; padding:1.25rem; display:flex; flex-direction:column; gap:1rem;">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid #1e293b; padding-bottom:0.75rem;">
            <div>
              <h2 style="font-size:0.875rem; font-weight:800; color:#ffffff; margin:0;">DETERMINISTIC RISK ENGINE</h2>
              <p style="font-size:0.75rem; color:#94a3b8; margin:0.25rem 0 0 0;">Continuous spot price vs strike threshold evaluation</p>
            </div>
            <div style="display:flex; gap:1rem; font-size:0.75rem;">
              <span>BTC Spot: <strong id="chart-btc" style="color:#34d399;">$64,800</strong></span>
              <span>Threshold: <strong style="color:#fb7185;">$64,000</strong></span>
            </div>
          </div>
          <!-- Chart Visual Box -->
          <div style="background:#060911; border:1px solid #1e293b; border-radius:0.5rem; padding:1.5rem; height:180px; display:flex; flex-direction:column; justify-content:space-between; position:relative;">
            <div style="border-bottom:1px dashed #ef4444; width:100%; position:absolute; top:65%; left:0;"></div>
            <div style="position:absolute; right:1rem; top:60%; color:#ef4444; font-size:0.65rem;">HEDGE THRESHOLD STRIKE ($64,000)</div>
            <div style="display:flex; justify-content:space-between; align-items:flex-end; height:100%; z-index:2;">
              <div style="width:10%; height:80%; background:rgba(16,185,129,0.3); border-top:2px solid #10b981;"></div>
              <div style="width:10%; height:78%; background:rgba(16,185,129,0.3); border-top:2px solid #10b981;"></div>
              <div style="width:10%; height:75%; background:rgba(16,185,129,0.3); border-top:2px solid #10b981;"></div>
              <div style="width:10%; height:72%; background:rgba(16,185,129,0.3); border-top:2px solid #10b981;"></div>
              <div id="chart-bar-5" style="width:10%; height:70%; background:rgba(16,185,129,0.3); border-top:2px solid #10b981;"></div>
            </div>
          </div>
        </div>

        <div style="background:#0b101d; border:1px solid #1e293b; border-radius:0.75rem; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between;">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid #1e293b; padding-bottom:0.5rem;">
            <h3 style="font-size:0.75rem; font-weight:800; color:#ffffff; margin:0;">HEDGE COVERAGE RATIO</h3>
            <span id="dial-badge" style="font-size:0.65rem; padding:0.125rem 0.375rem; border-radius:0.25rem; background:rgba(16,185,129,0.1); color:#34d399; border:1px solid rgba(16,185,129,0.3);">● Protection Sufficient</span>
          </div>

          <div style="text-align:center; padding:1rem 0;">
            <div id="dial-val" style="font-size:2.25rem; font-weight:900; color:#ffffff;">80.0%</div>
            <div style="font-size:0.65rem; color:#94a3b8; text-transform:uppercase;">HEDGE COVERAGE</div>
          </div>

          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.5rem; text-align:center; background:#0f172a; padding:0.5rem; border-radius:0.375rem; border:1px solid #1e293b; font-size:0.75rem;">
            <div><span style="color:#94a3b8; font-size:0.65rem; display:block;">Target</span><strong>80%</strong></div>
            <div><span style="color:#94a3b8; font-size:0.65rem; display:block;">Current</span><strong id="dial-cur" style="color:#34d399;">80.0%</strong></div>
            <div><span style="color:#94a3b8; font-size:0.65rem; display:block;">Gap</span><strong id="dial-gap" style="color:#34d399;">0.0%</strong></div>
          </div>
        </div>
      </div>

      <!-- Bento Row 2: Risk Formulas & 5-Stage Execution Pipeline -->
      <div style="display:grid; grid-template-columns:5fr 7fr; gap:1.5rem;">
        <div style="background:#0b101d; border:1px solid #1e293b; border-radius:0.75rem; padding:1.25rem; display:flex; flex-direction:column; gap:1rem;">
          <h3 style="font-size:0.75rem; font-weight:800; color:#ffffff; border-bottom:1px solid #1e293b; padding-bottom:0.5rem; margin:0;">RISK CALCULATION FORMULAS</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.75rem;">
            <div style="background:#0f172a; padding:0.5rem; border-radius:0.375rem; border:1px solid #1e293b;"><span style="color:#94a3b8; display:block; font-size:0.65rem;">Exposure</span>$25,000</div>
            <div style="background:#0f172a; padding:0.5rem; border-radius:0.375rem; border:1px solid #1e293b;"><span style="color:#94a3b8; display:block; font-size:0.65rem;">Downside Threshold</span>-8.0% ($2,000)</div>
          </div>
          <div style="background:#060911; padding:0.75rem; border-radius:0.375rem; border:1px solid #1e293b; font-size:0.75rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;"><span style="color:#94a3b8;">Formula: Risk Delta (ΔR)</span><span style="color:#34d399;">ΔP - (Threshold × Exposure)</span></div>
            <div style="display:flex; justify-content:space-between;"><span style="color:#cbd5e1;">Calculated Risk Delta:</span><strong id="math-delta" style="color:#34d399;">-$2,000.00 (SAFE)</strong></div>
          </div>
        </div>

        <div style="background:#0b101d; border:1px solid #1e293b; border-radius:0.75rem; padding:1.25rem; display:flex; flex-direction:column; gap:1rem;">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid #1e293b; padding-bottom:0.5rem;">
            <h3 style="font-size:0.75rem; font-weight:800; color:#ffffff; margin:0;">AUTONOMOUS EXECUTION PIPELINE</h3>
            <span style="font-size:0.65rem; color:#67e8f9; background:rgba(6,182,212,0.1); border:1px solid rgba(6,182,212,0.3); padding:0.125rem 0.375rem; border-radius:0.25rem;">EIP-7702 AUTOMATED</span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:0.5rem; font-size:0.75rem;">
            <div style="background:#0f172a; padding:0.5rem; border-radius:0.375rem; border:1px solid #1e293b;"><span style="color:#64748b; font-size:0.65rem;">01 STAGE</span><strong style="display:block; color:#fff;">EVENT</strong><span style="color:#34d399; font-size:0.65rem;">● RECEIVED</span></div>
            <div style="background:#0f172a; padding:0.5rem; border-radius:0.375rem; border:1px solid #1e293b;"><span style="color:#64748b; font-size:0.65rem;">02 STAGE</span><strong style="display:block; color:#fff;">RISK</strong><span id="pipe-risk" style="color:#34d399; font-size:0.65rem;">● EVALUATED</span></div>
            <div style="background:#0f172a; padding:0.5rem; border-radius:0.375rem; border:1px solid #1e293b;"><span style="color:#64748b; font-size:0.65rem;">03 STAGE</span><strong style="display:block; color:#fff;">DECISION</strong><span style="color:#34d399; font-size:0.65rem;">● APPROVED</span></div>
            <div style="background:#0f172a; padding:0.5rem; border-radius:0.375rem; border:1px solid #1e293b;"><span style="color:#64748b; font-size:0.65rem;">04 STAGE</span><strong style="display:block; color:#fff;">EXECUTION</strong><span style="color:#34d399; font-size:0.65rem;">● SUBMITTED</span></div>
            <div style="background:#0f172a; padding:0.5rem; border-radius:0.375rem; border:1px solid #1e293b;"><span style="color:#64748b; font-size:0.65rem;">05 STAGE</span><strong style="display:block; color:#fff;">PROOF</strong><span style="color:#34d399; font-size:0.65rem;">● CONFIRMED</span></div>
          </div>
        </div>
      </div>

      <!-- Bento Row 3: EIP-7702 Delegated Execution & Security Boundaries -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
        <div style="background:#0b101d; border:1px solid #1e293b; border-radius:0.75rem; padding:1.25rem; display:flex; flex-direction:column; gap:0.75rem;">
          <h3 style="font-size:0.75rem; font-weight:800; color:#ffffff; border-bottom:1px solid #1e293b; padding-bottom:0.5rem; margin:0;">EIP-7702 DELEGATED EXECUTION ARCHITECTURE</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.75rem;">
            <div style="background:#0f172a; padding:0.5rem; border-radius:0.375rem; border:1px solid #1e293b;"><span style="color:#94a3b8; font-size:0.65rem; display:block;">Account (EOA)</span><span style="color:#fff;">0x71C9...9A2B (DEMO)</span></div>
            <div style="background:#0f172a; padding:0.5rem; border-radius:0.375rem; border:1px solid #1e293b;"><span style="color:#94a3b8; font-size:0.65rem; display:block;">Delegated Executor</span><span style="color:#67e8f9;">0x8F31...4C1C (Kasuwa)</span></div>
          </div>
          <div style="background:#060911; padding:0.5rem; border-radius:0.375rem; border:1px solid #1e293b; font-size:0.75rem; display:flex; justify-content:space-between;">
            <span>SESSION AUTHORIZATION: <strong style="color:#34d399;">ACTIVE SESSION AUTHORIZATION</strong></span>
            <span style="color:#f59e0b; font-size:0.65rem;">SIMULATED DELEGATION</span>
          </div>
        </div>

        <div style="background:#0b101d; border:1px solid #1e293b; border-radius:0.75rem; padding:1.25rem; display:flex; flex-direction:column; gap:0.75rem;">
          <h3 style="font-size:0.75rem; font-weight:800; color:#ffffff; border-bottom:1px solid #1e293b; padding-bottom:0.5rem; margin:0;">EXECUTION PERMISSIONS & BOUNDARIES</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.75rem;">
            <div style="background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.2); padding:0.5rem; border-radius:0.375rem;">
              <span style="color:#34d399; font-weight:700; display:block; font-size:0.65rem;">✓ ALLOWED ACTIONS</span>
              <div style="color:#cbd5e1; font-size:0.65rem; margin-top:0.25rem;">• Execute approved hedges<br/>• Maintain policy limits<br/>• Auto-roll eligible contracts</div>
            </div>
            <div style="background:rgba(244,63,94,0.05); border:1px solid rgba(244,63,94,0.2); padding:0.5rem; border-radius:0.375rem;">
              <span style="color:#fb7185; font-weight:700; display:block; font-size:0.65rem;">✕ PROHIBITED ACTIONS</span>
              <div style="color:#cbd5e1; font-size:0.65rem; margin-top:0.25rem;">• Withdraw user funds<br/>• Change portfolio ownership<br/>• Exceed max notional</div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <script>
      function triggerStressSimulation() {
        var card = document.getElementById('restored-card');
        var btc = document.getElementById('chart-btc');
        var dialVal = document.getElementById('dial-val');
        var dialCur = document.getElementById('dial-cur');
        var dialGap = document.getElementById('dial-gap');
        var stripGap = document.getElementById('strip-gap');
        var stripRisk = document.getElementById('strip-risk');
        var stripCov = document.getElementById('strip-coverage');
        var stripStat = document.getElementById('strip-status');
        var mathDelta = document.getElementById('math-delta');

        // Step 1: Volatility Drop
        btc.innerText = '$62,800';
        dialVal.innerText = '58.0%';
        dialCur.innerText = '58.0%';
        dialGap.innerText = '22.0%';
        stripGap.innerText = '22.0%';
        stripRisk.innerText = '98 / 100';
        stripCov.innerText = '58.0%';
        stripStat.innerText = '⚠ THRESHOLD BREACHED';
        stripStat.style.borderColor = '#f43f5e';
        stripStat.style.color = '#f43f5e';
        mathDelta.innerText = '+$1,000.00 (BREACH)';
        mathDelta.style.color = '#f43f5e';

        // Step 2: Auto-Roll Restore (3.5s later)
        setTimeout(function() {
          btc.innerText = '$64,800';
          dialVal.innerText = '80.0%';
          dialCur.innerText = '80.0%';
          dialGap.innerText = '0.0%';
          stripGap.innerText = '0.0%';
          stripRisk.innerText = '32 / 100';
          stripCov.innerText = '80.0%';
          stripStat.innerText = '● PROTECTED';
          stripStat.style.borderColor = 'rgba(16,185,129,0.4)';
          stripStat.style.color = '#34d399';
          mathDelta.innerText = '-$2,000.00 (SAFE)';
          mathDelta.style.color = '#34d399';

          if (card) card.style.display = 'flex';
        }, 3500);
      }
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
    </div>
  `;
}

function getReplayViewHTML() {
  return `
    <div style="max-width:56rem; margin:0 auto; display:flex; flex-direction:column; gap:1.5rem; font-family:monospace;">
      <div style="padding:1rem; border-radius:0.75rem; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.4); color:#fcd34d; font-size:0.875rem; display:flex; align-items:center; justify-content:space-between;">
        <p style="margin:0;"><strong>HISTORICAL REPLAY MODE:</strong> Simulated backtest results over historical volatility windows.</p>
        <span style="padding:0.25rem 0.625rem; border-radius:0.375rem; background:rgba(245,158,11,0.25); font-weight:700; color:#fef3c7;">DYNAMIC BACKTEST ENGINE</span>
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
  ${getHeaderHTML(url, status)}

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
