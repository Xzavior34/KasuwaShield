process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const baseUrl = process.env.TARGET_URL || process.argv[2] || "https://kasuwa-shield-web-ousu.vercel.app";

const checks = {
  "/": [
    "Deterministic Risk Engine",
    "Agent Telemetry Stream",
    "KasuwaPolicy.sol",
    "KasuwaExecutor.sol",
    "KasuwaReactiveHandler.sol",
    "USDso Collateral Token",
    "Somnia Shannon (50312)",
  ],
  "/risk": [
    "Quantitative Risk Engine",
    "Value at Risk",
    "Kelly Criterion",
    "Vol Skew",
  ],
  "/execution": [
    "System Architecture Flow",
    "Interactive Session Key Sandbox",
    "Permission Boundaries",
    "EIP-7702",
  ],
  "/proof": [
    "Live Testnet Execution Proof Center",
    "Somnia Shannon Testnet",
    "KasuwaPolicy",
    "KasuwaExecutor",
    "KasuwaReactiveHandler",
  ],
  "/proof/demo-pos-1": [
    "On-Chain Position Verification",
    "Position Parameters",
    "0x12407c4343bcec1a28fd0c788f6e4019c2e4624e0aad67a19800665baab2c562",
  ],
  "/replay": [
    "Flash Crash",
    "Gradual Bleed",
    "Volatility Spike",
    "Mean Reversion",
  ],
};

async function fetchRoute(path) {
  const url = baseUrl.replace(/\/$/, "") + path;
  const res = await fetch(url);
  const data = await res.text();
  return { status: res.status, data };
}

async function runVerification() {
  console.log("==================================================");
  console.log(`  KASUWASHIELD ROUTE & FEATURE VERIFIER: ${baseUrl}`);
  console.log("==================================================");

  let allPassed = true;
  for (const [route, expected] of Object.entries(checks)) {
    try {
      const { status, data } = await fetchRoute(route);
      const missing = expected.filter((k) => !data.includes(k));
      if (missing.length > 0 || status !== 200) {
        allPassed = false;
        console.log(`  [✗] ${route} -> FAIL (status ${status}, missing: ${missing.join(", ")})`);
      } else {
        console.log(`  [✓] ${route} -> PASS (${expected.length}/${expected.length} features verified, ${data.length} bytes, status ${status})`);
      }
    } catch (err) {
      allPassed = false;
      console.log(`  [✗] ${route} -> ERROR (${err.message})`);
    }
  }

  console.log("==================================================");
  if (allPassed) {
    console.log("  ALL ROUTES & TOURNAMENT FEATURES 100% VERIFIED");
  } else {
    process.exit(1);
  }
}

runVerification();
