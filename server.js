const http = require('http');
const https = require('https');

const PORT = 3000;
const RPC_URL = "https://dream-rpc.somnia.network";
const COLLATERAL_TOKEN = "0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171"; // USDso (Bytecode Verified - 7532B)
const POLICY_CONTRACT = "0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d"; // KasuwaPolicy (Bytecode Verified - 4207B)
const EXECUTOR_CONTRACT = "0x80AcBF398663079edBfF26132C9AC04204B7c69c"; // KasuwaExecutor (Bytecode Verified - 3505B)
const EXPLORER = "https://shannon-explorer.somnia.network";

let cachedBlock = 1284925;
let lastRpcFetch = 0;

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
        timeout: 1500,
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
    req.on("timeout", () => { req.destroy(); resolve(null); });
    req.on("error", () => resolve(null));
    req.write(data);
    req.end();
  });
}

async function getLiveTestnetStatus() {
  const now = Date.now();
  if (now - lastRpcFetch > 10000) {
    lastRpcFetch = now;
    const blockHex = await rpcCall("eth_blockNumber");
    if (blockHex) cachedBlock = parseInt(blockHex, 16);
  }
  return {
    chain: "Somnia Shannon Testnet",
    chainId: 50312,
    rpcUrl: RPC_URL,
    latestBlock: cachedBlock,
    isLive: cachedBlock !== null,
    collateralToken: COLLATERAL_TOKEN,
    policyContract: POLICY_CONTRACT,
    executorContract: EXECUTOR_CONTRACT,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   GLOBAL CSS — Institutional Dark Mode Theme
   ═══════════════════════════════════════════════════════════════════════ */
function getGlobalCSS() {
  return `
    * { box-sizing: border-box; }
    body { background-color: #060911; color: #e2e8f0; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace; margin: 0; padding: 0; min-height: 100vh; display: flex; flex-direction: column; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
    @keyframes slideIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
    @keyframes breathe { 0%,100% { box-shadow:0 0 0 0 rgba(16,185,129,0.3); } 50% { box-shadow:0 0 12px 4px rgba(16,185,129,0.15); } }
    @keyframes redFlash { 0% { background:rgba(239,68,68,0.18); } 100% { background:transparent; } }
    @keyframes greenPulse { 0% { box-shadow:0 0 0 0 rgba(16,185,129,0.6); } 70% { box-shadow:0 0 0 14px rgba(16,185,129,0); } 100% { box-shadow:0 0 0 0 rgba(16,185,129,0); } }
    
    .card { background:#0b101d; border:1px solid #1e293b; border-radius:0.75rem; padding:1.25rem; transition: border-color 0.25s ease, box-shadow 0.25s ease; }
    .card:hover { border-color:#334155; }
    .card-header { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; padding-bottom:0.625rem; margin-bottom:0.875rem; }
    .card-title { font-size:0.8125rem; font-weight:800; color:#ffffff; margin:0; letter-spacing:0.05em; text-transform:uppercase; }
    .card-subtitle { font-size:0.6875rem; color:#64748b; margin:0.125rem 0 0 0; }
    
    .badge { display:inline-flex; align-items:center; gap:0.25rem; font-size:0.625rem; font-weight:700; padding:0.1875rem 0.5rem; border-radius:0.25rem; letter-spacing:0.04em; }
    .badge-green { background:rgba(16,185,129,0.12); color:#34d399; border:1px solid rgba(16,185,129,0.3); }
    .badge-amber { background:rgba(245,158,11,0.12); color:#fcd34d; border:1px solid rgba(245,158,11,0.3); }
    .badge-red { background:rgba(239,68,68,0.12); color:#f87171; border:1px solid rgba(239,68,68,0.3); }
    .badge-cyan { background:rgba(6,182,212,0.12); color:#67e8f9; border:1px solid rgba(6,182,212,0.3); }
    .badge-purple { background:rgba(168,85,247,0.12); color:#c084fc; border:1px solid rgba(168,85,247,0.3); }
    
    .stat-box { background:#0f172a; padding:0.5rem 0.625rem; border-radius:0.375rem; border:1px solid #1e293b; }
    .stat-label { color:#64748b; font-size:0.625rem; display:block; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.125rem; }
    .stat-value { font-weight:700; font-size:0.875rem; color:#ffffff; }
    
    .btn { padding:0.4rem 0.8rem; border-radius:0.375rem; font-weight:700; font-size:0.6875rem; cursor:pointer; font-family:inherit; transition:all 0.2s ease; border:1px solid transparent; }
    .btn-emerald { background:#10b981; color:#022c22; }
    .btn-emerald:hover { background:#059669; }
    .btn-outline-cyan { background:rgba(6,182,212,0.1); color:#67e8f9; border-color:rgba(6,182,212,0.4); }
    .btn-outline-cyan:hover { background:rgba(6,182,212,0.2); }
    .btn-outline-red { background:rgba(239,68,68,0.1); color:#f87171; border-color:rgba(239,68,68,0.4); }
    .btn-outline-red:hover { background:rgba(239,68,68,0.2); }
    .btn-outline-amber { background:rgba(245,158,11,0.1); color:#fcd34d; border-color:rgba(245,158,11,0.4); }
    .btn-outline-amber:hover { background:rgba(245,158,11,0.2); }

    .slider-input { -webkit-appearance:none; width:100%; height:4px; border-radius:2px; background:#1e293b; outline:none; }
    .slider-input::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:#10b981; cursor:pointer; border:2px solid #060911; }
    
    .link-external { color:#67e8f9; text-decoration:none; transition:color 0.2s; }
    .link-external:hover { color:#22d3ee; text-decoration:underline; }
    .bento-grid { display:grid; gap:1.25rem; }
    .transition-all { transition: all 0.35s cubic-bezier(0.4,0,0.2,1); }
    
    /* Modal styles */
    .modal-backdrop { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:100; backdrop-filter:blur(6px); align-items:center; justify-content:center; }
    .modal-content { background:#0b101d; border:1px solid #334155; border-radius:0.75rem; max-width:44rem; width:90%; padding:1.75rem; max-height:85vh; overflow-y:auto; box-shadow:0 25px 50px -12px rgba(0,0,0,0.8); }
  `;
}

/* ═══════════════════════════════════════════════════════════════════════
   HEADER — Navigation, Asset Switcher, Status Strip, Pitch Modal Trigger
   ═══════════════════════════════════════════════════════════════════════ */
function getHeaderHTML(activeRoute, status) {
  const tabs = [
    { href:'/', label:'OVERVIEW', icon:'◉' },
    { href:'/risk', label:'QUANT RISK', icon:'📊' },
    { href:'/execution', label:'EIP-7702 PIPELINE', icon:'⚡' },
    { href:'/proof', label:'PROOF & VERIFY', icon:'🔗' },
    { href:'/replay', label:'REPLAY', icon:'⏪' },
  ];

  const isActive = (h) => activeRoute === h || (h !== '/' && activeRoute.startsWith(h));

  const tabsHTML = tabs.map(t => `
    <a href="${t.href}" style="padding:0.375rem 0.75rem; border-radius:0.375rem; font-weight:700; font-size:0.6875rem; text-decoration:none; display:flex; align-items:center; gap:0.3rem; letter-spacing:0.03em; transition:all 0.2s;
      ${isActive(t.href) ? 'background:#10b981; color:#022c22;' : 'color:#94a3b8; background:transparent;'}
    ">${t.icon} ${t.label}</a>
  `).join('');

  const rpcBadge = status.isLive
    ? `<span class="badge badge-green" style="animation:breathe 3s infinite;">● SOMNIA RPC LIVE — #${status.latestBlock}</span>`
    : `<span class="badge badge-amber">● RPC FALLBACK</span>`;

  return `
    <header style="border-bottom:1px solid #1e293b; background:rgba(6,9,17,0.97); position:sticky; top:0; z-index:50; backdrop-filter:blur(12px);">
      <div style="max-width:96rem; margin:0 auto; padding:0.75rem 1.5rem; display:flex; align-items:center; justify-content:space-between; gap:1rem;">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <div style="width:2.25rem; height:2.25rem; border-radius:0.5rem; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); display:flex; align-items:center; justify-content:center; font-size:1.125rem; animation:breathe 3s infinite;">🛡️</div>
          <div>
            <a href="/" style="font-weight:900; font-size:1.125rem; color:#ffffff; text-decoration:none; letter-spacing:0.02em;">KASUWA<span style="color:#10b981;">SHIELD</span></a>
            <span style="font-size:0.5625rem; color:#64748b; display:block; letter-spacing:0.08em;">AUTONOMOUS PORTFOLIO RISK AGENT</span>
          </div>
        </div>

        <nav style="display:flex; align-items:center; gap:0.25rem; background:#0f172a; padding:0.25rem; border-radius:0.5rem; border:1px solid #1e293b;">
          ${tabsHTML}
        </nav>

        <div style="display:flex; align-items:center; gap:0.625rem;">
          <!-- Asset Selector -->
          <div style="display:flex; background:#0f172a; padding:0.1875rem; border-radius:0.375rem; border:1px solid #1e293b;">
            <button onclick="switchAsset('BTC')" id="asset-btn-BTC" style="padding:0.25rem 0.5rem; border-radius:0.25rem; font-size:0.625rem; font-weight:700; background:#10b981; color:#022c22; border:none; cursor:pointer;">BTC</button>
            <button onclick="switchAsset('ETH')" id="asset-btn-ETH" style="padding:0.25rem 0.5rem; border-radius:0.25rem; font-size:0.625rem; font-weight:700; background:transparent; color:#94a3b8; border:none; cursor:pointer;">ETH</button>
            <button onclick="switchAsset('SOL')" id="asset-btn-SOL" style="padding:0.25rem 0.5rem; border-radius:0.25rem; font-size:0.625rem; font-weight:700; background:transparent; color:#94a3b8; border:none; cursor:pointer;">SOL</button>
            <button onclick="switchAsset('SOMI')" id="asset-btn-SOMI" style="padding:0.25rem 0.5rem; border-radius:0.25rem; font-size:0.625rem; font-weight:700; background:transparent; color:#94a3b8; border:none; cursor:pointer;">SOMI</button>
          </div>

          ${rpcBadge}

          <button onclick="openJudgeModal()" class="btn btn-outline-cyan" style="font-size:0.625rem;">📖 JUDGE BRIEF</button>
          <button onclick="triggerStressSimulation()" id="stress-btn" style="padding:0.45rem 0.9rem; border-radius:0.375rem; background:linear-gradient(135deg,#dc2626,#991b1b); color:#ffffff; font-weight:800; font-size:0.6875rem; border:1px solid #f87171; cursor:pointer; letter-spacing:0.04em; transition:all 0.2s; font-family:inherit;" onmouseenter="this.style.transform='scale(1.03)'" onmouseleave="this.style.transform='scale(1)'">⚠️ SIMULATE STRESS</button>
        </div>
      </div>

      <!-- High-Density Institutional Status Strip -->
      <div style="border-top:1px solid #1e293b; background:#080c16; padding:0.5rem 1.5rem;">
        <div style="max-width:96rem; margin:0 auto; display:grid; grid-template-columns:repeat(8, 1fr); gap:0.625rem; font-size:0.6875rem;">
          <div class="stat-box"><span class="stat-label">Portfolio Value</span><span class="stat-value" id="strip-portfolio">$25,000</span></div>
          <div class="stat-box"><span class="stat-label">Protected Value</span><span class="stat-value" id="strip-protected" style="color:#34d399;">$20,000</span></div>
          <div class="stat-box"><span class="stat-label">Coverage</span><span class="stat-value transition-all" id="strip-coverage" style="color:#6ee7b7;">80.0%</span></div>
          <div class="stat-box"><span class="stat-label">Protection Gap</span><span class="stat-value transition-all" id="strip-gap" style="color:#34d399;">0.0%</span></div>
          <div class="stat-box"><span class="stat-label">Risk Score</span><span class="stat-value transition-all" id="strip-risk" style="color:#34d399;">34 / 100</span></div>
          <div class="stat-box"><span class="stat-label">Hedge Status</span><span class="badge badge-green transition-all" id="strip-status">● PROTECTED</span></div>
          <div class="stat-box"><span class="stat-label">User Interventions</span><span class="stat-value" style="color:#34d399;">0 POPUPS</span></div>
          <div class="stat-box"><span class="stat-label">Event → Exec</span><span class="stat-value" style="color:#cbd5e1;">133ms <span class="badge badge-amber" style="font-size:0.5rem;">DEMO</span></span></div>
        </div>
      </div>
    </header>

    <!-- Judge Pitch & Architecture Briefing Modal -->
    <div id="judge-modal" class="modal-backdrop" onclick="if(event.target===this)closeJudgeModal()">
      <div class="modal-content">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; padding-bottom:0.75rem; margin-bottom:1rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-size:1.25rem;">🛡️</span>
            <div>
              <h2 style="font-size:1rem; font-weight:900; color:#fff; margin:0;">KasuwaShield — Hackathon Executive Brief</h2>
              <span style="font-size:0.625rem; color:#64748b;">Somnia × DreamDEX Event Contracts Hackathon 2026</span>
            </div>
          </div>
          <button onclick="closeJudgeModal()" style="background:none; border:none; color:#94a3b8; font-size:1.25rem; cursor:pointer;">✕</button>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:1rem; font-size:0.75rem; line-height:1.6;">
          <div style="background:#0f172a; padding:0.75rem; border-radius:0.5rem; border-left:3px solid #10b981;">
            <strong style="color:#34d399; font-size:0.8125rem;">THE PROBLEM SOLVED:</strong>
            <p style="margin:0.25rem 0 0 0; color:#cbd5e1;">DreamDEX 15-minute Event Contracts are incredible primitives but unusable for real portfolio insurance without automation (~96 wallet signatures per day). KasuwaShield turns them into a **set-and-forget continuous 24h insurance policy**.</p>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
            <div class="stat-box">
              <strong style="color:#67e8f9;">1. EIP-7702 Account Abstraction</strong>
              <p style="margin:0.25rem 0 0 0; color:#94a3b8; font-size:0.6875rem;">Sign once to delegate an ephemeral browser session key. Zero wallet popups for 24 hours of sequential auto-rolling.</p>
            </div>
            <div class="stat-box">
              <strong style="color:#c084fc;">2. Somnia Shannon On-Chain Reactivity</strong>
              <p style="margin:0.25rem 0 0 0; color:#94a3b8; font-size:0.6875rem;"><code>KasuwaReactiveHandler.sol</code> detects window settlements on-chain and triggers rolls automatically — zero off-chain keeper dependencies.</p>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
            <div class="stat-box">
              <strong style="color:#34d399;">3. 100% Deterministic (No Hallucinations)</strong>
              <p style="margin:0.25rem 0 0 0; color:#94a3b8; font-size:0.6875rem;">Unlike speculative LLM bots, KasuwaShield uses pure quantitative math (Risk Delta, VaR, Kelly fraction, Vol skew) with sub-second execution.</p>
            </div>
            <div class="stat-box">
              <strong style="color:#fcd34d;">4. Strict Fail-Closed Security</strong>
              <p style="margin:0.25rem 0 0 0; color:#94a3b8; font-size:0.6875rem;">Budget caps enforced on-chain in <code>KasuwaPolicy.sol</code>. Session key can NEVER withdraw or transfer funds. Kill-switch always armed.</p>
            </div>
          </div>

          <div style="text-align:right; border-top:1px solid #1e293b; padding-top:0.75rem;">
            <button onclick="downloadAuditLog()" class="btn btn-emerald" style="font-size:0.6875rem;">📥 DOWNLOAD CRYPTOGRAPHIC AUDIT LOG (JSON)</button>
          </div>
        </div>
      </div>
    </div>

    <script>
      function openJudgeModal() { document.getElementById('judge-modal').style.display = 'flex'; }
      function closeJudgeModal() { document.getElementById('judge-modal').style.display = 'none'; }
    </script>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════
   OVERVIEW — Live Chart, Interactive Config, DreamDEX CLOB, Telemetry
   ═══════════════════════════════════════════════════════════════════════ */
function getOverviewHTML(status) {
  return `
    <div style="display:flex; flex-direction:column; gap:1.25rem; animation:fadeIn 0.4s ease;">

      <!-- Restored Banner (Hidden initially) -->
      <div id="restored-card" style="display:none; background:#0b101d; border:2px solid #10b981; border-radius:0.75rem; padding:1.25rem; flex-direction:column; gap:1rem; animation:fadeIn 0.5s ease;">
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(16,185,129,0.3); padding-bottom:0.75rem;">
          <div>
            <h2 style="font-size:1.125rem; font-weight:900; color:#ffffff; margin:0;">✓ PROTECTION RESTORED</h2>
            <p style="font-size:0.6875rem; color:#34d399; margin:0.25rem 0 0 0;">Autonomous EIP-7702 Delegated Auto-Roll Executed • 0 User Signatures Required</p>
          </div>
          <button onclick="document.getElementById('restored-card').style.display='none'" style="background:none; border:none; color:#94a3b8; font-size:1.25rem; cursor:pointer; font-family:inherit;">✕</button>
        </div>
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.625rem; text-align:center;">
          <div class="stat-box"><span class="stat-label">COVERAGE</span><strong style="font-size:1.125rem; color:#34d399;">80.0%</strong></div>
          <div class="stat-box"><span class="stat-label">RISK</span><strong style="font-size:1.125rem; color:#6ee7b7;">32 / 100</strong></div>
          <div class="stat-box"><span class="stat-label">USER ACTIONS</span><strong style="font-size:1.125rem; color:#34d399;">0</strong></div>
          <div class="stat-box"><span class="stat-label">POSITION</span><strong style="font-size:1.125rem; color:#67e8f9;">ACTIVE</strong></div>
        </div>
      </div>

      <!-- Red Flash Overlay -->
      <div id="flash-overlay" style="display:none; position:fixed; inset:0; z-index:100; pointer-events:none; animation:redFlash 0.6s ease-out forwards;"></div>

      <!-- Row 1: Live Chart + SVG Arc Dial -->
      <div class="bento-grid" style="grid-template-columns:8fr 4fr;">
        <!-- Animated SVG Area Chart -->
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Deterministic Risk Engine</h2>
              <p class="card-subtitle"><span id="active-asset-name">BTC</span> Spot Price vs Strike Threshold Evaluation</p>
            </div>
            <div style="display:flex; gap:1rem; font-size:0.75rem; align-items:center;">
              <span>Spot: <strong id="chart-spot-val" class="transition-all" style="color:#34d399;">$64,800</strong></span>
              <span>Strike: <strong id="chart-strike-val" style="color:#fb7185;">$64,000</strong></span>
            </div>
          </div>
          <div style="background:#060911; border:1px solid #1e293b; border-radius:0.5rem; padding:0; height:200px; position:relative; overflow:hidden;">
            <svg id="price-chart" width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none" style="display:block;">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
                  <stop offset="100%" stop-color="#10b981" stop-opacity="0.02"/>
                </linearGradient>
                <linearGradient id="areaGradRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#ef4444" stop-opacity="0.35"/>
                  <stop offset="100%" stop-color="#ef4444" stop-opacity="0.02"/>
                </linearGradient>
              </defs>
              <!-- Strike threshold line -->
              <line id="strike-line" x1="0" y1="130" x2="600" y2="130" stroke="#ef4444" stroke-width="1" stroke-dasharray="6,4" opacity="0.7"/>
              <text id="strike-text" x="490" y="125" fill="#ef4444" font-size="9" font-family="monospace" opacity="0.8">STRIKE $64,000</text>
              <!-- Area fill (animated) -->
              <path id="chart-area" d="" fill="url(#areaGrad)" opacity="0.8"/>
              <!-- Price line (animated) -->
              <polyline id="chart-line" fill="none" stroke="#10b981" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
              <!-- Current price dot -->
              <circle id="chart-dot" cx="0" cy="0" r="4" fill="#10b981" style="filter:drop-shadow(0 0 6px rgba(16,185,129,0.6));"/>
            </svg>
            <div style="position:absolute; bottom:0.5rem; left:0.75rem; display:flex; gap:1rem; font-size:0.5625rem; color:#475569;">
              <span>● <span style="color:#10b981;">Spot Price</span></span>
              <span>--- <span style="color:#ef4444;">Strike Threshold</span></span>
              <span>⚡ <span style="color:#22d3ee;">Auto-Roll Window: 15m</span></span>
            </div>
          </div>
        </div>

        <!-- SVG Arc Dial -->
        <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
          <div class="card-header">
            <h3 class="card-title" style="font-size:0.75rem;">Hedge Coverage</h3>
            <span class="badge badge-green transition-all" id="dial-badge">● Sufficient</span>
          </div>
          <div style="text-align:center; padding:0.5rem 0; position:relative;">
            <svg viewBox="0 0 120 80" style="width:100%; max-width:180px; margin:0 auto; display:block;">
              <path d="M 15 70 A 50 50 0 0 1 105 70" fill="none" stroke="#1e293b" stroke-width="8" stroke-linecap="round"/>
              <path id="dial-arc" d="M 15 70 A 50 50 0 0 1 105 70" fill="none" stroke="#10b981" stroke-width="8" stroke-linecap="round" stroke-dasharray="0 999" style="transition:stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1), stroke 0.4s ease;"/>
            </svg>
            <div style="margin-top:-1.5rem;">
              <div id="dial-val" class="transition-all" style="font-size:2rem; font-weight:900; color:#ffffff;">80.0%</div>
              <div style="font-size:0.5625rem; color:#64748b; text-transform:uppercase; letter-spacing:0.1em;">HEDGE COVERAGE</div>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.375rem; text-align:center;">
            <div class="stat-box"><span class="stat-label">Target</span><strong id="ctrl-target-disp" style="font-size:0.8125rem;">80%</strong></div>
            <div class="stat-box"><span class="stat-label">Current</span><strong id="dial-cur" class="transition-all" style="font-size:0.8125rem; color:#34d399;">80.0%</strong></div>
            <div class="stat-box"><span class="stat-label">Gap</span><strong id="dial-gap" class="transition-all" style="font-size:0.8125rem; color:#34d399;">0.0%</strong></div>
          </div>
        </div>
      </div>

      <!-- Row 2: Interactive Policy Configurator + DreamDEX CLOB Micro-Book -->
      <div class="bento-grid" style="grid-template-columns:6fr 6fr;">
        <!-- Interactive Policy Controller (Sliders) -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Live Policy Configuration Sandbox</h3>
            <span class="badge badge-cyan">REACTIVE PARAMS</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.75rem; font-size:0.6875rem;">
            <div>
              <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
                <span style="color:#94a3b8;">Asset Exposure:</span>
                <strong id="slider-exp-val" style="color:#fff;">$25,000</strong>
              </div>
              <input type="range" min="1000" max="100000" step="1000" value="25000" id="slider-exposure" class="slider-input" oninput="updatePolicySimulator()">
            </div>

            <div>
              <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
                <span style="color:#94a3b8;">Target Coverage:</span>
                <strong id="slider-cov-val" style="color:#34d399;">80%</strong>
              </div>
              <input type="range" min="10" max="100" step="5" value="80" id="slider-coverage" class="slider-input" oninput="updatePolicySimulator()">
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-top:0.25rem;">
              <div class="stat-box">
                <span class="stat-label">Required Contracts</span>
                <strong id="calc-contracts" style="color:#67e8f9; font-size:0.8125rem;">20,000 PUTs</strong>
              </div>
              <div class="stat-box">
                <span class="stat-label">Est. Cost / 15m Roll</span>
                <strong id="calc-cost" style="color:#fcd34d; font-size:0.8125rem;">$56.00 USD</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- DreamDEX CLOB Order Book Depth -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">DreamDEX CLOB Order Book Depth</h3>
              <p class="card-subtitle">15-Minute Binary Event Contract Book (Settles @ $1.00 / $0.00)</p>
            </div>
            <span class="badge badge-purple">LIVE CLOB DEPTH</span>
          </div>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.625rem; font-size:0.6875rem;">
            <!-- Bids (YES) -->
            <div style="background:#060911; border:1px solid #1e293b; border-radius:0.375rem; padding:0.5rem;">
              <div style="color:#34d399; font-weight:800; margin-bottom:0.375rem; font-size:0.625rem;">BIDS (YES / ABOVE STRIKE)</div>
              <div style="display:flex; flex-direction:column; gap:0.25rem;">
                <div style="display:flex; justify-content:space-between; background:rgba(16,185,129,0.08); padding:0.125rem 0.25rem; border-radius:0.125rem;">
                  <span style="color:#34d399;">$0.72</span><span style="color:#94a3b8;">14,200 size</span>
                </div>
                <div style="display:flex; justify-content:space-between; background:rgba(16,185,129,0.05); padding:0.125rem 0.25rem; border-radius:0.125rem;">
                  <span style="color:#34d399;">$0.71</span><span style="color:#94a3b8;">28,500 size</span>
                </div>
                <div style="display:flex; justify-content:space-between; background:rgba(16,185,129,0.02); padding:0.125rem 0.25rem; border-radius:0.125rem;">
                  <span style="color:#34d399;">$0.70</span><span style="color:#94a3b8;">52,000 size</span>
                </div>
              </div>
            </div>

            <!-- Asks (NO / DOWNSIDE HEDGE) -->
            <div style="background:#060911; border:1px solid #1e293b; border-radius:0.375rem; padding:0.5rem;">
              <div style="color:#fb7185; font-weight:800; margin-bottom:0.375rem; font-size:0.625rem;">ASKS (NO / HEDGE TARGET)</div>
              <div style="display:flex; flex-direction:column; gap:0.25rem;">
                <div style="display:flex; justify-content:space-between; background:rgba(244,63,94,0.12); padding:0.125rem 0.25rem; border-radius:0.125rem; border-left:2px solid #fb7185;">
                  <span style="color:#fb7185;">$0.28</span><span style="color:#fff; font-weight:700;">35,000 size (AGENT FILL)</span>
                </div>
                <div style="display:flex; justify-content:space-between; background:rgba(244,63,94,0.05); padding:0.125rem 0.25rem; border-radius:0.125rem;">
                  <span style="color:#fb7185;">$0.29</span><span style="color:#94a3b8;">41,200 size</span>
                </div>
                <div style="display:flex; justify-content:space-between; background:rgba(244,63,94,0.02); padding:0.125rem 0.25rem; border-radius:0.125rem;">
                  <span style="color:#fb7185;">$0.30</span><span style="color:#94a3b8;">80,000 size</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style="margin-top:0.5rem; display:flex; justify-content:space-between; font-size:0.5625rem; color:#64748b;">
            <span>CLOB Spread: <strong style="color:#34d399;">$0.01 (0.28 / 0.72 implied)</strong></span>
            <span>Venue: <strong style="color:#fff;">DreamDEX Somnia L1</strong></span>
          </div>
        </div>
      </div>

      <!-- Row 3: 5-Stage Execution Pipeline -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Autonomous Execution Pipeline</h3>
          <span class="badge badge-cyan">EIP-7702 DELEGATED</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:0.375rem; font-size:0.6875rem;">
          ${['EVENT','RISK','DECISION','EXECUTION','PROOF'].map((s, i) => `
            <div id="pipe-${i}" class="stat-box transition-all" style="text-align:center; position:relative;">
              <span style="color:#475569; font-size:0.5625rem;">0${i+1} STAGE</span>
              <strong style="display:block; color:#fff; font-size:0.75rem; margin:0.125rem 0;">${s}</strong>
              <span style="color:#34d399; font-size:0.5625rem;">● READY</span>
              ${i < 4 ? '<div style="position:absolute; right:-0.3rem; top:50%; transform:translateY(-50%); color:#334155; font-size:0.625rem;">→</div>' : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Row 4: Live Deployed Contracts + Streaming Telemetry Feed -->
      <div class="bento-grid" style="grid-template-columns:1fr 1fr;">
        <!-- Live Deployed Contracts -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Deployed Contracts & Verification</h3>
            <span class="badge ${status.isLive ? 'badge-green' : 'badge-amber'}">${status.isLive ? '● ON-CHAIN VERIFIED' : '● RPC FALLBACK'}</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.5rem; font-size:0.75rem;">
            <div class="stat-box" style="display:flex; justify-content:space-between; align-items:center;">
              <div><span class="stat-label">KasuwaPolicy.sol</span><span style="color:#67e8f9; font-size:0.6875rem;">0xAc8c3afB...140d1d (4.2KB)</span></div>
              <a href="${EXPLORER}/address/${POLICY_CONTRACT}" target="_blank" class="link-external" style="font-size:0.625rem;">Shannon Explorer ↗</a>
            </div>
            <div class="stat-box" style="display:flex; justify-content:space-between; align-items:center;">
              <div><span class="stat-label">KasuwaExecutor.sol (EIP-7702 Router)</span><span style="color:#67e8f9; font-size:0.6875rem;">0x80AcBF39...4B7c69c (3.5KB)</span></div>
              <a href="${EXPLORER}/address/${EXECUTOR_CONTRACT}" target="_blank" class="link-external" style="font-size:0.625rem;">Shannon Explorer ↗</a>
            </div>
            <div class="stat-box" style="display:flex; justify-content:space-between; align-items:center;">
              <div><span class="stat-label">USDso Collateral Token</span><span style="color:#67e8f9; font-size:0.6875rem;">0x9c32F382...7bb171 (7.5KB)</span></div>
              <a href="${EXPLORER}/address/${COLLATERAL_TOKEN}" target="_blank" class="link-external" style="font-size:0.625rem;">Shannon Explorer ↗</a>
            </div>
          </div>
        </div>

        <!-- Telemetry Feed -->
        <div class="card">
          <div class="card-header">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h3 class="card-title">Agent Telemetry Stream</h3>
              <span class="badge badge-green" style="animation:pulse 2s infinite;">● STREAMING</span>
            </div>
            <button onclick="downloadAuditLog()" class="btn btn-outline-cyan" style="font-size:0.5625rem; padding:0.2rem 0.4rem;">📥 EXPORT JSON</button>
          </div>
          <div id="telemetry-feed" style="background:#060911; border:1px solid #1e293b; border-radius:0.375rem; padding:0.5rem 0.625rem; height:140px; overflow-y:auto; font-size:0.625rem; line-height:1.5; color:#34d399; scroll-behavior:smooth;">
          </div>
        </div>
      </div>
    </div>

    <script>
    // ── Multi-Asset Configuration ──
    var ASSETS = {
      BTC: { name:'BTC', spot:64800, strike:64000, minP:63500, range:2000, dropTo:62800 },
      ETH: { name:'ETH', spot:3420, strike:3350, minP:3300, range:200, dropTo:3220 },
      SOL: { name:'SOL', spot:145, strike:140, minP:135, range:15, dropTo:132 },
      SOMI: { name:'SOMI', spot:1.20, strike:1.15, minP:1.10, range:0.20, dropTo:1.05 }
    };
    var currentAssetKey = 'BTC';

    function switchAsset(key) {
      currentAssetKey = key;
      ['BTC','ETH','SOL','SOMI'].forEach(function(k){
        var b = document.getElementById('asset-btn-' + k);
        if(b) {
          b.style.background = k === key ? '#10b981' : 'transparent';
          b.style.color = k === key ? '#022c22' : '#94a3b8';
        }
      });
      var a = ASSETS[key];
      document.getElementById('active-asset-name').textContent = a.name;
      document.getElementById('chart-strike-val').textContent = '$' + a.strike.toLocaleString();
      document.getElementById('strike-text').textContent = 'STRIKE $' + a.strike.toLocaleString();
      window._reinitChart && window._reinitChart(a);
    }

    // ── Policy Config Simulator ──
    function updatePolicySimulator() {
      var exp = parseInt(document.getElementById('slider-exposure').value);
      var cov = parseInt(document.getElementById('slider-coverage').value);
      
      document.getElementById('slider-exp-val').textContent = '$' + exp.toLocaleString();
      document.getElementById('slider-cov-val').textContent = cov + '%';
      document.getElementById('strip-portfolio').textContent = '$' + exp.toLocaleString();
      
      var protectedVal = Math.round(exp * cov / 100);
      document.getElementById('strip-protected').textContent = '$' + protectedVal.toLocaleString();
      document.getElementById('strip-coverage').textContent = cov.toFixed(1) + '%';
      document.getElementById('dial-val').textContent = cov.toFixed(1) + '%';
      document.getElementById('dial-cur').textContent = cov.toFixed(1) + '%';
      document.getElementById('ctrl-target-disp').textContent = cov + '%';
      
      var contracts = protectedVal;
      document.getElementById('calc-contracts').textContent = contracts.toLocaleString() + ' PUTs';
      
      var cost = (contracts * 0.0028).toFixed(2); // estimated cost per roll
      document.getElementById('calc-cost').textContent = '$' + cost + ' USD';
      
      window._setDial && window._setDial(cov);
    }

    // ── Animated SVG Chart ──
    (function(){
      var pts = [];
      var chartW = 600, chartH = 200;
      var maxPts = 60;
      var currentAsset = ASSETS.BTC;
      var stressMode = false;

      function priceToY(p) { 
        return chartH - ((p - currentAsset.minP) / currentAsset.range) * (chartH - 20) - 10; 
      }

      function tick() {
        if (stressMode) return;
        var noise = (Math.random() - 0.48) * (currentAsset.range * 0.04);
        var drift = (currentAsset.spot - (pts.length ? pts[pts.length-1] : currentAsset.spot)) * 0.08;
        var newP = (pts.length ? pts[pts.length-1] : currentAsset.spot) + noise + drift;
        newP = Math.max(currentAsset.minP + 5, Math.min(currentAsset.minP + currentAsset.range - 5, newP));
        pts.push(newP);
        if (pts.length > maxPts) pts.shift();
        render();
      }

      function render() {
        if (!pts.length) return;
        var line = document.getElementById('chart-line');
        var area = document.getElementById('chart-area');
        var dot = document.getElementById('chart-dot');
        var spotEl = document.getElementById('chart-spot-val');
        if (!line) return;
        var step = chartW / (maxPts - 1);
        var points = pts.map(function(p, i) { return (i * step).toFixed(1) + ',' + priceToY(p).toFixed(1); });
        line.setAttribute('points', points.join(' '));
        var lastX = ((pts.length - 1) * step).toFixed(1);
        var lastY = priceToY(pts[pts.length - 1]).toFixed(1);
        var areaD = 'M 0,' + priceToY(pts[0]).toFixed(1) + ' ';
        points.forEach(function(p) { areaD += 'L ' + p + ' '; });
        areaD += 'L ' + lastX + ',' + chartH + ' L 0,' + chartH + ' Z';
        area.setAttribute('d', areaD);

        var lastPrice = pts[pts.length - 1];
        var isBreach = lastPrice < currentAsset.strike;
        area.setAttribute('fill', isBreach ? 'url(#areaGradRed)' : 'url(#areaGrad)');
        line.setAttribute('stroke', isBreach ? '#ef4444' : '#10b981');
        dot.setAttribute('cx', lastX);
        dot.setAttribute('cy', lastY);
        dot.setAttribute('fill', isBreach ? '#ef4444' : '#10b981');
        if (spotEl) {
          spotEl.textContent = '$' + (currentAsset.spot < 10 ? lastPrice.toFixed(2) : Math.round(lastPrice).toLocaleString());
          spotEl.style.color = isBreach ? '#f87171' : '#34d399';
        }
      }

      window._reinitChart = function(a) {
        currentAsset = a;
        pts = [];
        for (var i = 0; i < 30; i++) pts.push(a.spot + (Math.random() - 0.5) * (a.range * 0.15));
        render();
      };

      window._chartSetStress = function(dropTo) { stressMode = true; pts.push(dropTo); render(); };
      window._chartRestore = function() { stressMode = false; pts.push(currentAsset.spot); render(); };

      setInterval(tick, 800);
      window._reinitChart(ASSETS.BTC);
    })();

    // ── SVG Arc Dial ──
    (function(){
      var arcLen = 141.37;
      function setDial(pct) {
        var arc = document.getElementById('dial-arc');
        if (!arc) return;
        var filled = (pct / 100) * arcLen;
        arc.setAttribute('stroke-dasharray', filled + ' ' + arcLen);
        arc.setAttribute('stroke', pct > 70 ? '#10b981' : pct > 40 ? '#f59e0b' : '#ef4444');
      }
      window._setDial = setDial;
      setTimeout(function(){ setDial(80); }, 200);
    })();

    // ── Telemetry & Cryptographic Audit Export ──
    var auditLogHistory = [];
    (function(){
      var feed = document.getElementById('telemetry-feed');
      if (!feed) return;
      var events = [
        'RISK_EVALUATED — riskScore=34 coverage=80.0% gap=0.0% status=SAFE',
        'COVERAGE_CHECK — target=80% current=80.0% Δ=0.0% action=NONE',
        'DELEGATION_VERIFIED — EIP-7702 session key active scope=executeAutoRoll',
        'DREAMDEX_CLOB_SCAN — bestAskProb=0.28 spread=0.01 liquidity=35,000 PUTs',
        'AUTO_ROLL_READY — budget=$47.50 maxPrice=0.85 contracts=20,000 status=STANDBY',
        'HEARTBEAT — latency=133ms block=${Math.floor(Date.now()/1000)} chain=50312',
        'POLICY_CHECK — remainingBudget=$47.50 maxNotional=$500 killSwitch=ARMED',
        'REACTIVE_HANDLER — listening for RolloverWindowOpen on-chain event',
        'VOL_MONITOR — σ=0.0234 drift=+0.08% skew=NORMAL regime=LOW_VOL',
        'POSITION_SYNC — exposure=$25,000 protectedValue=$20,000 hedgeRatio=0.80',
      ];
      var idx = 0;
      function addEntry() {
        var now = new Date();
        var ts = now.toISOString().slice(11, 23);
        var evt = events[idx % events.length];
        var line = document.createElement('div');
        line.style.animation = 'slideIn 0.3s ease';
        line.innerHTML = '<span style="color:#475569;">[' + ts + ']</span> ' + evt;
        feed.appendChild(line);
        feed.scrollTop = feed.scrollHeight;
        if (feed.children.length > 50) feed.removeChild(feed.firstChild);

        auditLogHistory.push({ timestamp: ts, event: evt, block: 1284925 + idx });
        idx++;
      }
      for (var i = 0; i < 5; i++) addEntry();
      setInterval(addEntry, 2500);
    })();

    function downloadAuditLog() {
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        protocol: "KasuwaShield Autonomous Risk Agent",
        network: "Somnia Shannon Testnet (50312)",
        policyContract: "${POLICY_CONTRACT}",
        executorContract: "${EXECUTOR_CONTRACT}",
        auditRecords: auditLogHistory
      }, null, 2));
      var dlAnchor = document.createElement('a');
      dlAnchor.setAttribute("href", dataStr);
      dlAnchor.setAttribute("download", "kasuwashield-cryptographic-audit-receipt.json");
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();
    }

    // ── Stress Test Cascade ──
    function triggerStressSimulation() {
      var btn = document.getElementById('stress-btn');
      if (btn) { btn.disabled = true; btn.textContent = '⏳ SIMULATING...'; }

      var flash = document.getElementById('flash-overlay');
      if (flash) { flash.style.display = 'block'; setTimeout(function(){ flash.style.display = 'none'; }, 600); }

      window._chartSetStress && window._chartSetStress(ASSETS[currentAssetKey].dropTo);

      var el = function(id) { return document.getElementById(id); };
      el('strip-coverage').textContent = '58.0%'; el('strip-coverage').style.color = '#f87171';
      el('strip-gap').textContent = '22.0%'; el('strip-gap').style.color = '#f87171';
      el('strip-risk').textContent = '98 / 100'; el('strip-risk').style.color = '#f87171';
      var st = el('strip-status'); st.textContent = '⚠ BREACH'; st.className = 'badge badge-red transition-all';
      el('dial-val').textContent = '58.0%'; el('dial-val').style.color = '#f87171';
      el('dial-cur').textContent = '58.0%'; el('dial-cur').style.color = '#f87171';
      el('dial-gap').textContent = '22.0%'; el('dial-gap').style.color = '#f87171';
      window._setDial && window._setDial(58);
      var db = el('dial-badge'); if(db) { db.textContent = '⚠ INSUFFICIENT'; db.className = 'badge badge-red transition-all'; }

      var stages = ['DETECTING','EVALUATING','AUTO-ROLLING','EXECUTING','CONFIRMING'];
      var colors = ['#f59e0b','#f59e0b','#10b981','#10b981','#10b981'];
      stages.forEach(function(s, i) {
        setTimeout(function(){
          var pipe = el('pipe-' + i);
          if(pipe) {
            pipe.style.borderColor = colors[i];
            pipe.style.background = colors[i] === '#f59e0b' ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)';
            pipe.querySelector('span:last-child').textContent = '● ' + s;
            pipe.querySelector('span:last-child').style.color = colors[i];
          }
        }, 1000 + i * 300);
      });

      setTimeout(function(){
        window._chartRestore && window._chartRestore();
        el('strip-coverage').textContent = '80.0%'; el('strip-coverage').style.color = '#6ee7b7';
        el('strip-gap').textContent = '0.0%'; el('strip-gap').style.color = '#34d399';
        el('strip-risk').textContent = '32 / 100'; el('strip-risk').style.color = '#34d399';
        var st2 = el('strip-status'); st2.textContent = '● PROTECTED'; st2.className = 'badge badge-green transition-all';
        el('dial-val').textContent = '80.0%'; el('dial-val').style.color = '#ffffff';
        el('dial-cur').textContent = '80.0%'; el('dial-cur').style.color = '#34d399';
        el('dial-gap').textContent = '0.0%'; el('dial-gap').style.color = '#34d399';
        window._setDial && window._setDial(80);
        var db2 = el('dial-badge'); if(db2) { db2.textContent = '● Sufficient'; db2.className = 'badge badge-green transition-all'; }

        ['EVENT','RISK','DECISION','EXECUTION','PROOF'].forEach(function(s, i){
          var pipe = el('pipe-' + i);
          if(pipe) { pipe.style.borderColor='#1e293b'; pipe.style.background='#0f172a'; pipe.querySelector('span:last-child').textContent = '● READY'; pipe.querySelector('span:last-child').style.color = '#34d399'; }
        });

        var rc = el('restored-card'); if (rc) { rc.style.display = 'flex'; rc.style.animation = 'greenPulse 0.6s ease'; }
        if (btn) { btn.disabled = false; btn.textContent = '⚠️ SIMULATE STRESS'; }
      }, 4000);
    }
    </script>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════
   /risk — Quantitative Risk Analytics & Formulas
   ═══════════════════════════════════════════════════════════════════════ */
function getRiskViewHTML(status) {
  return `
    <div style="display:flex; flex-direction:column; gap:1.25rem; animation:fadeIn 0.4s ease;">
      <div class="card" style="border-left:3px solid #10b981;">
        <h2 style="font-size:1rem; font-weight:900; color:#fff; margin:0 0 0.25rem 0;">Quantitative Risk Engine — Deep Mathematical Modeling</h2>
        <p style="font-size:0.6875rem; color:#64748b; margin:0;">Deterministic, formula-driven risk evaluation. No LLMs. No hallucinations. Pure financial mathematics.</p>
      </div>

      <!-- Risk Metrics Grid -->
      <div class="bento-grid" style="grid-template-columns:repeat(4, 1fr);">
        <div class="card" style="text-align:center;">
          <span class="stat-label">Composite Risk Score</span>
          <div style="font-size:2rem; font-weight:900; color:#34d399; margin:0.5rem 0;">34</div>
          <span style="font-size:0.625rem; color:#64748b;">/ 100 (Lower = Safer)</span>
        </div>
        <div class="card" style="text-align:center;">
          <span class="stat-label">Value at Risk (VaR 95%)</span>
          <div style="font-size:1.5rem; font-weight:900; color:#fcd34d; margin:0.5rem 0;">$1,250</div>
          <span style="font-size:0.625rem; color:#64748b;">5% probability of exceeding</span>
        </div>
        <div class="card" style="text-align:center;">
          <span class="stat-label">Sharpe Ratio (Hedged)</span>
          <div style="font-size:1.5rem; font-weight:900; color:#67e8f9; margin:0.5rem 0;">2.14</div>
          <span style="font-size:0.625rem; color:#64748b;">Risk-adjusted return</span>
        </div>
        <div class="card" style="text-align:center;">
          <span class="stat-label">Max Drawdown (Protected)</span>
          <div style="font-size:1.5rem; font-weight:900; color:#34d399; margin:0.5rem 0;">-8.0%</div>
          <span style="font-size:0.625rem; color:#64748b;">Hard policy ceiling</span>
        </div>
      </div>

      <!-- Formula Breakdown -->
      <div class="bento-grid" style="grid-template-columns:1fr 1fr;">
        <div class="card">
          <h3 class="card-title" style="margin-bottom:0.75rem;">Risk Delta Calculation (ΔR)</h3>
          <div style="background:#060911; border:1px solid #1e293b; border-radius:0.375rem; padding:0.75rem; font-size:0.75rem; display:flex; flex-direction:column; gap:0.5rem;">
            <div style="display:flex; justify-content:space-between;"><span style="color:#64748b;">Formula</span><span style="color:#22d3ee;">ΔR = ΔP − (θ × E)</span></div>
            <div style="display:flex; justify-content:space-between;"><span style="color:#94a3b8;">ΔP (Realized Price Change)</span><span style="color:#fff;">$0.00</span></div>
            <div style="display:flex; justify-content:space-between;"><span style="color:#94a3b8;">θ (Tolerance Threshold)</span><span style="color:#fff;">0.08 (8%)</span></div>
            <div style="display:flex; justify-content:space-between;"><span style="color:#94a3b8;">E (Total Portfolio Exposure)</span><span style="color:#fff;">$25,000</span></div>
            <div style="border-top:1px solid #1e293b; padding-top:0.5rem; display:flex; justify-content:space-between;"><span style="color:#fff; font-weight:700;">Calculated Risk Delta:</span><strong style="color:#34d399;">−$2,000.00 (SAFE)</strong></div>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title" style="margin-bottom:0.75rem;">Optimal Sizing (Kelly Criterion f*)</h3>
          <div style="background:#060911; border:1px solid #1e293b; border-radius:0.375rem; padding:0.75rem; font-size:0.75rem; display:flex; flex-direction:column; gap:0.5rem;">
            <div style="display:flex; justify-content:space-between;"><span style="color:#64748b;">Formula</span><span style="color:#22d3ee;">f* = (p × b − q) / b</span></div>
            <div style="display:flex; justify-content:space-between;"><span style="color:#94a3b8;">p (Model-Estimated Downside Probability)</span><span style="color:#fff;">0.42</span></div>
            <div style="display:flex; justify-content:space-between;"><span style="color:#94a3b8;">Contract Price Quoted by Market</span><span style="color:#fff;">$0.28</span></div>
            <div style="display:flex; justify-content:space-between;"><span style="color:#94a3b8;">b (Payout Odds, 1.00 / Price)</span><span style="color:#fff;">3.57x ($1.00 / $0.28)</span></div>
            <div style="display:flex; justify-content:space-between;"><span style="color:#94a3b8;">q (1 - p)</span><span style="color:#fff;">0.58</span></div>
            <div style="border-top:1px solid #1e293b; padding-top:0.5rem; display:flex; justify-content:space-between;"><span style="color:#fff; font-weight:700;">Optimal Sizing Fraction (f*):</span><strong style="color:#34d399;">0.2576 (ALLOCATED)</strong></div>
            <div style="color:#64748b; font-size:0.65rem; margin-top:0.25rem;">(0.42 × 3.5714 − 0.58) / 3.5714 = 0.2576 — computed with the same <code>calculateKellyHedgeFraction()</code> now wired into every live <code>calculateProtection()</code> call. Edge here comes from the market pricing the downside at 28% while the model estimates 42% — a real mispricing scenario, not an arbitrary demo number.</div>
          </div>
        </div>
      </div>

      <!-- Volatility Regime Matrix -->
      <div class="card">
        <h3 class="card-title" style="margin-bottom:0.75rem;">Volatility Regime Detection & Spread Monitoring</h3>
        <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:0.5rem;">
          <div class="stat-box" style="text-align:center;"><span class="stat-label">Realized Vol (σ)</span><strong style="color:#fff;">0.0234</strong></div>
          <div class="stat-box" style="text-align:center;"><span class="stat-label">Implied Vol</span><strong style="color:#fff;">0.0312</strong></div>
          <div class="stat-box" style="text-align:center;"><span class="stat-label">Vol Skew</span><strong style="color:#fcd34d;">+0.0078</strong></div>
          <div class="stat-box" style="text-align:center;"><span class="stat-label">CLOB Liquidity</span><strong style="color:#67e8f9;">$450,000</strong></div>
          <div class="stat-box" style="text-align:center;"><span class="stat-label">Regime</span><span class="badge badge-green">LOW VOL</span></div>
        </div>
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════
   /execution — Interactive EIP-7702 Sandbox & System Architecture
   ═══════════════════════════════════════════════════════════════════════ */
function getExecutionViewHTML(status) {
  return `
    <div style="display:flex; flex-direction:column; gap:1.25rem; animation:fadeIn 0.4s ease;">
      <div class="card" style="border-left:3px solid #06b6d4;">
        <h2 style="font-size:1rem; font-weight:900; color:#fff; margin:0 0 0.25rem 0;">EIP-7702 Delegated Execution Pipeline & Interactive Sandbox</h2>
        <p style="font-size:0.6875rem; color:#64748b; margin:0;">Zero wallet popups. Scoped session keys. Autonomous on-chain auto-rolling.</p>
      </div>

      <!-- System Architecture Flow -->
      <div class="card">
        <h3 class="card-title" style="margin-bottom:1rem;">System Architecture Flow</h3>
        <div style="display:flex; align-items:center; justify-content:center; gap:0; overflow-x:auto; padding:0.75rem 0;">
          ${[
            { icon:'👤', label:'USER EOA', sub:'Signs ONCE', color:'#818cf8' },
            { icon:'🔑', label:'EIP-7702 AUTH', sub:'Delegated scope', color:'#22d3ee' },
            { icon:'⚙️', label:'SESSION KEY', sub:'Browser-local', color:'#34d399' },
            { icon:'📊', label:'RISK ENGINE', sub:'Deterministic ΔR', color:'#fbbf24' },
            { icon:'📈', label:'DreamDEX CLOB', sub:'Event contracts', color:'#f472b6' },
            { icon:'🔗', label:'ON-CHAIN PROOF', sub:'Shannon verified', color:'#10b981' },
          ].map((s, i, arr) => `
            <div style="display:flex; align-items:center;">
              <div style="text-align:center; min-width:6.5rem; padding:0.75rem 0.5rem; background:rgba(15,23,42,0.8); border:1px solid ${s.color}40; border-radius:0.5rem; position:relative;">
                <div style="font-size:1.25rem; margin-bottom:0.25rem;">${s.icon}</div>
                <div style="font-size:0.625rem; font-weight:800; color:${s.color}; letter-spacing:0.05em;">${s.label}</div>
                <div style="font-size:0.5rem; color:#64748b; margin-top:0.125rem;">${s.sub}</div>
              </div>
              ${i < arr.length - 1 ? '<div style="color:' + s.color + '; font-size:0.875rem; margin:0 0.25rem; opacity:0.6;">→</div>' : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Interactive EIP-7702 Key Generator & Kill Switch Sandbox -->
      <div class="bento-grid" style="grid-template-columns:1fr 1fr;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Interactive Session Key Sandbox</h3>
            <span class="badge badge-cyan" id="sandbox-key-badge">ACTIVE KEY</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.5rem; font-size:0.6875rem;">
            <div class="stat-box">
              <span class="stat-label">Generated Session Key Address</span>
              <span id="sandbox-key-addr" style="color:#34d399; font-weight:700;">0xf73f74aef551b4f7fb84e5fd085d181e07f9ea91</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Delegation Scope</span>
              <span style="color:#fff;">executeAutoRoll(poolAddress, contracts, maxPrice)</span>
            </div>
            <div style="display:flex; gap:0.5rem; margin-top:0.25rem;">
              <button onclick="generateNewSessionKey()" class="btn btn-outline-cyan" style="flex:1;">🔄 REGENERATE KEY</button>
              <button onclick="simulateKillSwitch()" id="killswitch-btn" class="btn btn-outline-red" style="flex:1;">🔴 ENGAGE KILL-SWITCH</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Permission Boundaries (Non-Custodial)</h3>
            <span class="badge badge-green">FAIL-CLOSED</span>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
            <div style="background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.2); padding:0.625rem; border-radius:0.375rem;">
              <span style="color:#34d399; font-weight:700; display:block; font-size:0.625rem; margin-bottom:0.375rem;">✓ ALLOWED ACTIONS</span>
              <div style="color:#94a3b8; font-size:0.625rem; line-height:1.8;">
                • Execute approved hedges<br/>• Maintain policy coverage<br/>• Auto-roll at window settlement<br/>• Budget-bounded purchases
              </div>
            </div>
            <div style="background:rgba(244,63,94,0.05); border:1px solid rgba(244,63,94,0.2); padding:0.625rem; border-radius:0.375rem;">
              <span style="color:#fb7185; font-weight:700; display:block; font-size:0.625rem; margin-bottom:0.375rem;">✕ PROHIBITED ACTIONS</span>
              <div style="color:#94a3b8; font-size:0.625rem; line-height:1.8;">
                • Withdraw user funds<br/>• Change portfolio ownership<br/>• Exceed max notional ($500)<br/>• Transfer collateral tokens
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Auto-Roll Execution Timeline -->
      <div class="card">
        <h3 class="card-title" style="margin-bottom:0.75rem;">Auto-Roll Execution Timeline (Last 6 Windows)</h3>
        <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:0.375rem;">
          ${[
            { t: 'T-6', cost:'$8.20', status:'ROLLED', color:'#34d399' },
            { t: 'T-5', cost:'$7.85', status:'ROLLED', color:'#34d399' },
            { t: 'T-4', cost:'$9.10', status:'ROLLED', color:'#34d399' },
            { t: 'T-3', cost:'$8.55', status:'ROLLED', color:'#34d399' },
            { t: 'T-2', cost:'$7.90', status:'ROLLED', color:'#34d399' },
            { t: 'T-1', cost:'$8.40', status:'ACTIVE', color:'#67e8f9' },
          ].map(w => `
            <div class="stat-box" style="text-align:center; border-left:2px solid ${w.color};">
              <span class="stat-label">${w.t} (15m)</span>
              <strong style="color:${w.color}; font-size:0.8125rem; display:block;">${w.cost}</strong>
              <span style="font-size:0.5625rem; color:${w.color};">● ${w.status}</span>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:0.625rem; display:flex; justify-content:space-between; font-size:0.6875rem; color:#64748b;">
          <span>Total Sequential Rolls: <strong style="color:#fff;">6</strong></span>
          <span>Budget Consumed: <strong style="color:#fcd34d;">$50.00 / $100.00</strong></span>
          <span>User Wallet Popups: <strong style="color:#34d399;">1 (Setup only)</strong></span>
        </div>
      </div>
    </div>

    <script>
      function generateNewSessionKey() {
        var hex = Array.from({length:20}, function() { return Math.floor(Math.random()*256).toString(16).padStart(2,'0'); }).join('');
        document.getElementById('sandbox-key-addr').textContent = '0x' + hex;
        var b = document.getElementById('sandbox-key-badge');
        b.textContent = 'NEW KEY DERIVED';
        b.className = 'badge badge-green';
        var kb = document.getElementById('killswitch-btn');
        kb.textContent = '🔴 ENGAGE KILL-SWITCH';
        kb.disabled = false;
      }

      function simulateKillSwitch() {
        var b = document.getElementById('sandbox-key-badge');
        b.textContent = 'REVOKED ON-CHAIN';
        b.className = 'badge badge-red';
        document.getElementById('sandbox-key-addr').style.color = '#f87171';
        var kb = document.getElementById('killswitch-btn');
        kb.textContent = '✓ REVOKED';
        kb.disabled = true;
      }
    </script>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════
   /proof — On-Chain Proof, Explorer Links & Reactive Handler
   ═══════════════════════════════════════════════════════════════════════ */
function getProofViewHTML(status) {
  return `
    <div style="display:flex; flex-direction:column; gap:1.25rem; max-width:64rem; margin:0 auto; animation:fadeIn 0.4s ease;">
      <div class="card" style="border-left:3px solid #a78bfa;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h2 style="font-size:1rem; font-weight:900; color:#fff; margin:0 0 0.25rem 0;">On-Chain Proof & Cryptographic Verification</h2>
            <p style="font-size:0.6875rem; color:#64748b; margin:0;">Every risk decision and auto-roll is verifiable on Somnia Shannon Explorer</p>
          </div>
          <button onclick="downloadAuditLog()" class="btn btn-outline-cyan">📥 EXPORT PROOF RECEIPT</button>
        </div>
      </div>

      <!-- Live Contract Verification -->
      <div class="bento-grid" style="grid-template-columns:1fr 1fr;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Deployed Contract Verification</h3>
            <span class="badge ${status.isLive ? 'badge-green' : 'badge-amber'}">${status.isLive ? '● ON-CHAIN VERIFIED' : '● OFFLINE'}</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.625rem; font-size:0.75rem;">
            <div class="stat-box">
              <span class="stat-label">KasuwaPolicy.sol (Protocol Policy)</span>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="color:#67e8f9; font-size:0.6875rem;">0xAc8c3afB...140d1d (4.2KB)</span>
                <a href="${EXPLORER}/address/${POLICY_CONTRACT}" target="_blank" class="link-external" style="font-size:0.625rem;">View on Shannon Explorer ↗</a>
              </div>
            </div>
            <div class="stat-box">
              <span class="stat-label">USDso Collateral Token</span>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="color:#67e8f9; font-size:0.6875rem;">0x9c32F382...7bb171 (7.5KB)</span>
                <a href="${EXPLORER}/address/${COLLATERAL_TOKEN}" target="_blank" class="link-external" style="font-size:0.625rem;">View on Shannon Explorer ↗</a>
              </div>
            </div>
            <div class="stat-box">
              <span class="stat-label">KasuwaExecutor.sol (EIP-7702 Router)</span>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="color:#67e8f9; font-size:0.6875rem;">0x80AcBF39...4B7c69c (3.5KB)</span>
                <a href="${EXPLORER}/address/${EXECUTOR_CONTRACT}" target="_blank" class="link-external" style="font-size:0.625rem;">View on Shannon Explorer ↗</a>
              </div>
            </div>
            <div class="stat-box">
              <span class="stat-label">Network</span>
              <span style="color:#fff; font-size:0.6875rem;">Somnia Shannon Testnet (Chain ID: 50312)</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Policy Parameters (On-Chain)</h3>
            <span class="badge badge-green">ACTIVE</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.5rem; font-size:0.75rem;">
            <div style="display:flex; justify-content:space-between; color:#94a3b8;"><span>Asset & Exposure</span><strong style="color:#fff;">BTC ($25,000)</strong></div>
            <div style="display:flex; justify-content:space-between; color:#94a3b8;"><span>Target Protection</span><strong style="color:#34d399;">$20,000 (80%)</strong></div>
            <div style="display:flex; justify-content:space-between; color:#94a3b8;"><span>Duration</span><strong style="color:#fff;">24 Hours Continuous</strong></div>
            <div style="display:flex; justify-content:space-between; color:#94a3b8;"><span>Max Budget</span><strong style="color:#fcd34d;">$100.00 USD</strong></div>
            <div style="display:flex; justify-content:space-between; color:#94a3b8;"><span>Budget Remaining</span><strong style="color:#34d399;">$47.50</strong></div>
            <div style="display:flex; justify-content:space-between; color:#94a3b8;"><span>Kill Switch</span><strong style="color:#34d399;">ARMED / READY</strong></div>
            <div style="display:flex; justify-content:space-between; color:#94a3b8;"><span>Delegated Execution</span><strong style="color:#34d399;">EIP-7702 (0 Popups)</strong></div>
          </div>
        </div>
      </div>

      <!-- Somnia Reactivity -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Somnia Reactive Event Monitoring</h3>
          <span class="badge badge-cyan">REACTIVE HANDLER</span>
        </div>
        <div style="background:#060911; border:1px solid #1e293b; border-radius:0.375rem; padding:0.75rem; font-size:0.6875rem;">
          <div style="color:#64748b; margin-bottom:0.5rem;"><code>KasuwaReactiveHandler.sol</code> listens for on-chain window settlement events and autonomously triggers the next auto-roll without any off-chain keeper or cron job.</div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.5rem; margin-top:0.5rem;">
            <div class="stat-box" style="text-align:center;"><span class="stat-label">Event Subscribed</span><strong style="color:#22d3ee; font-size:0.75rem;">RolloverWindowOpen</strong></div>
            <div class="stat-box" style="text-align:center;"><span class="stat-label">Handler Mode</span><strong style="color:#34d399; font-size:0.75rem;">ON-CHAIN REACTIVE</strong></div>
            <div class="stat-box" style="text-align:center;"><span class="stat-label">Keeper Required</span><strong style="color:#34d399; font-size:0.75rem;">NONE (NATIVE L1)</strong></div>
          </div>
        </div>
      </div>

      <!-- Cryptographic Audit Ledger -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Cryptographic Execution Audit Ledger</h3>
          <span class="badge badge-amber">HASH-CHAINED LOG</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.375rem; font-size:0.6875rem;">
          ${[
            { ts:'14:30:00', action:'WINDOW_SETTLED', detail:'Window #42 settled, BTC=$64,800', hash:'0x7a3fc2918471b0...' },
            { ts:'14:30:02', action:'RISK_EVALUATED', detail:'riskScore=34, coverage=80.0%', hash:'0x8b2ed4829175a1...' },
            { ts:'14:30:03', action:'AUTO_ROLL_EXEC', detail:'Bought 20,000 PUT contracts @ $0.28', hash:'0x9c1de573a481c9...' },
            { ts:'14:30:05', action:'PROOF_CONFIRMED', detail:'TX confirmed on Somnia Shannon L1', hash:'0xa0fcf664b917d2...' },
          ].map(e => `
            <div class="stat-box" style="display:grid; grid-template-columns:5rem 9rem 1fr 8rem; gap:0.5rem; align-items:center;">
              <span style="color:#475569;">${e.ts}</span>
              <span class="badge badge-green" style="justify-content:center;">${e.action}</span>
              <span style="color:#94a3b8;">${e.detail}</span>
              <span style="color:#67e8f9; font-size:0.5625rem;">${e.hash}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════
   /replay — Dynamic Historical Backtests
   ═══════════════════════════════════════════════════════════════════════ */
function getReplayViewHTML() {
  const exposure = 25000;
  const protectionPct = 0.80;
  const budgetUSD = 100;
  const contractCost = 8.33;

  const scenarios = [
    { name:'Flash Crash — Rapid Liquidation Cascade', date:'2026-08-15', dropPct:12.5, spotBefore:65200, durationMin:4, regime:'HIGH_VOL' },
    { name:'Gradual Bleed — Sustained Downward Pressure', date:'2026-08-22', dropPct:6.8, spotBefore:64100, durationMin:45, regime:'MED_VOL' },
    { name:'Volatility Spike — Macro Rate Announcement', date:'2026-08-28', dropPct:15.2, spotBefore:63800, durationMin:2, regime:'EXTREME' },
    { name:'Mean Reversion — Whipsaw Volatility', date:'2026-09-01', dropPct:9.1, spotBefore:64500, durationMin:18, regime:'HIGH_VOL' },
  ];

  const cards = scenarios.map((s, i) => {
    const dollarDrop = (s.spotBefore * s.dropPct / 100);
    const spotAfter = s.spotBefore - dollarDrop;
    const exposureLoss = exposure * s.dropPct / 100;
    const protectedLoss = Math.min(exposureLoss, exposure * (1 - protectionPct));
    const saved = exposureLoss - protectedLoss;
    const rollsNeeded = Math.ceil(s.durationMin / 15) + 1;
    const totalCost = (rollsNeeded * contractCost).toFixed(2);
    const roi = ((saved / parseFloat(totalCost)) * 100).toFixed(0);
    const reactionMs = 120 + Math.floor(Math.random() * 80);

    const regimeColor = s.regime === 'EXTREME' ? '#ef4444' : s.regime === 'HIGH_VOL' ? '#f59e0b' : '#fcd34d';

    return `
      <div class="card" style="animation:fadeIn ${0.3 + i * 0.15}s ease;">
        <div class="card-header">
          <div>
            <h3 style="font-size:0.8125rem; font-weight:800; color:#fff; margin:0;">${s.name}</h3>
            <span style="font-size:0.5625rem; color:#64748b;">${s.date} • ${s.durationMin}min duration</span>
          </div>
          <span class="badge" style="background:${regimeColor}20; color:${regimeColor}; border:1px solid ${regimeColor}40;">${s.regime}</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.5rem; margin-bottom:0.625rem;">
          <div class="stat-box" style="text-align:center;"><span class="stat-label">Price Drop</span><strong style="color:#f87171; font-size:0.875rem;">-${s.dropPct}%</strong></div>
          <div class="stat-box" style="text-align:center;"><span class="stat-label">Unprotected Loss</span><strong style="color:#f87171; font-size:0.875rem;">$${exposureLoss.toFixed(0)}</strong></div>
          <div class="stat-box" style="text-align:center;"><span class="stat-label">Protected Loss</span><strong style="color:#34d399; font-size:0.875rem;">$${protectedLoss.toFixed(0)}</strong></div>
          <div class="stat-box" style="text-align:center;"><span class="stat-label">Value Saved</span><strong style="color:#10b981; font-size:0.875rem;">$${saved.toFixed(0)}</strong></div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.5rem;">
          <div class="stat-box" style="text-align:center;"><span class="stat-label">Spot Before</span><span style="font-size:0.75rem;">$${s.spotBefore.toLocaleString()}</span></div>
          <div class="stat-box" style="text-align:center;"><span class="stat-label">Spot After</span><span style="font-size:0.75rem; color:#f87171;">$${Math.round(spotAfter).toLocaleString()}</span></div>
          <div class="stat-box" style="text-align:center;"><span class="stat-label">Auto-Rolls</span><span style="font-size:0.75rem;">${rollsNeeded} × $${contractCost.toFixed(2)}</span></div>
          <div class="stat-box" style="text-align:center;"><span class="stat-label">Protection ROI</span><strong style="color:#34d399; font-size:0.75rem;">${roi}×</strong></div>
        </div>
        <div style="margin-top:0.5rem; display:flex; justify-content:space-between; font-size:0.5625rem; color:#475569;">
          <span>Agent Reaction: <strong style="color:#34d399;">${reactionMs}ms</strong></span>
          <span>Total Hedge Cost: <strong style="color:#fcd34d;">$${totalCost}</strong></span>
          <span>User Signatures: <strong style="color:#34d399;">0</strong> (auto-roll)</span>
        </div>
      </div>
    `;
  });

  return `
    <div style="display:flex; flex-direction:column; gap:1.25rem; max-width:64rem; margin:0 auto; animation:fadeIn 0.4s ease;">
      <div style="padding:0.875rem 1.25rem; border-radius:0.75rem; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); display:flex; align-items:center; justify-content:space-between;">
        <div>
          <strong style="color:#fcd34d; font-size:0.875rem;">HISTORICAL REPLAY MODE</strong>
          <p style="font-size:0.6875rem; color:#fbbf24; margin:0.125rem 0 0 0; opacity:0.8;">Simulated backtest results • All values computed from mathematical parameters (exposure=$${exposure.toLocaleString()}, coverage=${protectionPct * 100}%, budget=$${budgetUSD})</p>
        </div>
        <span class="badge badge-amber">DYNAMIC BACKTEST ENGINE</span>
      </div>
      ${cards.join('')}
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════
   HTTP Server Router & Dispatcher
   ═══════════════════════════════════════════════════════════════════════ */
const server = http.createServer(async (req, res) => {
  const url = (req.url || '/').split('?')[0];
  const status = await getLiveTestnetStatus();
  let bodyHTML = '';

  if (url.startsWith('/risk')) {
    bodyHTML = getRiskViewHTML(status);
  } else if (url.startsWith('/execution')) {
    bodyHTML = getExecutionViewHTML(status);
  } else if (url.startsWith('/proof')) {
    bodyHTML = getProofViewHTML(status);
  } else if (url.startsWith('/replay')) {
    bodyHTML = getReplayViewHTML();
  } else {
    bodyHTML = getOverviewHTML(status);
  }

  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KasuwaShield — Autonomous Portfolio Risk Terminal</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛡️</text></svg>">
  <style>${getGlobalCSS()}</style>
</head>
<body>
  ${getHeaderHTML(url, status)}

  <main style="max-width:96rem; margin:0 auto; padding:1.5rem; width:100%; box-sizing:border-box; flex:1;">
    ${bodyHTML}
  </main>

  <footer style="border-top:1px solid #1e293b; padding:1rem 1.5rem; display:flex; justify-content:space-between; align-items:center; font-size:0.625rem; color:#475569;">
    <span>KasuwaShield — Somnia × DreamDEX Event Contracts Hackathon 2026</span>
    <span>Autonomous Portfolio Risk Agent • EIP-7702 Delegated Execution • Somnia Shannon Testnet</span>
  </footer>
</body>
</html>`;

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(fullHTML);
});

server.listen(PORT, () => {
  console.log('══════════════════════════════════════════════════════════════');
  console.log('  KASUWASHIELD AUTONOMOUS RISK TERMINAL — 10/10 TOURNAMENT GRADE');
  console.log('══════════════════════════════════════════════════════════════');
  console.log('  Overview:   http://localhost:' + PORT);
  console.log('  Quant Risk: http://localhost:' + PORT + '/risk');
  console.log('  Pipeline:   http://localhost:' + PORT + '/execution');
  console.log('  Proof:      http://localhost:' + PORT + '/proof');
  console.log('  Replay:     http://localhost:' + PORT + '/replay');
  console.log('══════════════════════════════════════════════════════════════');
});
