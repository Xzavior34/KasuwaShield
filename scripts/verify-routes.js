import http from "node:http";

const checks = {
  "/": ["price-chart", "telemetry-feed", "dial-arc", "slider-exposure", "DreamDEX CLOB Order Book Depth", "switchAsset", "downloadAuditLog", "judge-modal"],
  "/risk": ["Quantitative Risk Engine", "Value at Risk", "Kelly Criterion", "Vol Skew"],
  "/execution": ["System Architecture Flow", "Interactive Session Key Sandbox", "simulateKillSwitch", "Permission Boundaries"],
  "/proof": ["Deployed Contract Verification", "KasuwaReactiveHandler", "Cryptographic Execution Audit Ledger", "shannon-explorer"],
  "/replay": ["Flash Crash", "Gradual Bleed", "Volatility Spike", "Mean Reversion"]
};

function fetchRoute(path) {
  return new Promise((resolve, reject) => {
    http.get("http://localhost:3000" + path, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, data }));
    }).on("error", reject);
  });
}

async function runVerification() {
  console.log("==================================================");
  console.log("  KASUWASHIELD 10/10 ROUTE & FEATURE VERIFIER");
  console.log("==================================================");

  let allPassed = true;
  for (const [route, expected] of Object.entries(checks)) {
    const { status, data } = await fetchRoute(route);
    const missing = expected.filter((k) => !data.includes(k));
    if (missing.length > 0 || status !== 200) {
      allPassed = false;
      console.log(`  [✗] ${route} -> FAIL (status ${status}, missing: ${missing.join(", ")})`);
    } else {
      console.log(`  [✓] ${route} -> PASS (${expected.length}/${expected.length} features verified, ${data.length} bytes, status ${status})`);
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
