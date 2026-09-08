/**
 * KasuwaShield — Keeper Health Watchdog & Monitor
 * Reads artifacts/keeper-heartbeat.json and reports on:
 * - Daemon process health & PID
 * - Heartbeat freshness
 * - Consecutive rolls executed and budget depletion
 */
import fs from "node:fs";
import path from "node:path";

export function checkKeeperHealth() {
  console.log("================================================================================");
  console.log("  KASUWASHIELD — KEEPER DAEMON HEALTH WATCHDOG");
  console.log("================================================================================\n");

  const heartbeatPath = path.resolve(process.cwd(), "artifacts", "keeper-heartbeat.json");
  if (!fs.existsSync(heartbeatPath)) {
    console.log("[INFO] No active or past keeper heartbeat found at artifacts/keeper-heartbeat.json.");
    console.log("       Start the keeper with `npm run keeper` to begin automated multi-window rolls.\n");
    return;
  }

  try {
    const raw = fs.readFileSync(heartbeatPath, "utf8");
    const data = JSON.parse(raw);

    const now = Date.now();
    const lastHeartbeatTime = new Date(data.timestamp).getTime();
    const ageSeconds = Math.round((now - lastHeartbeatTime) / 1000);

    console.log(`  SERVICE:            ${data.service || "Keeper Daemon"}`);
    console.log(`  STATUS:             ${data.status}`);
    console.log(`  TIMESTAMP:          ${data.timestamp} (${ageSeconds}s ago)`);
    console.log(`  PID:                ${data.pid || "N/A"}`);
    console.log(`  UPTIME:             ${data.uptimeSeconds || 0}s`);
    console.log(`  POLICY ID:          ${data.policyId || "N/A"}`);
    console.log(`  SESSION KEY:        ${data.sessionKey || "N/A"}`);
    console.log(`  ROLLS EXECUTED:     ${data.rollsExecuted ?? "N/A"}`);
    if (data.latestTx) {
      console.log(`  LATEST TX:          ${data.latestTx}`);
    }
    if (data.error) {
      console.log(`  LAST ERROR:         ${data.error}`);
    }

    console.log("\n--------------------------------------------------------------------------------");
    if (data.status === "FAILED") {
      console.log("  [ALERT] Keeper daemon reported a failure! Inspect error logs above.");
    } else if (data.status === "COMPLETED" || data.status === "STOPPED") {
      console.log(`  [OK] Keeper daemon shut down cleanly (${data.status}).`);
    } else if (ageSeconds < 120) {
      console.log("  [HEALTHY] Keeper daemon is actively broadcasting rolls on schedule.");
    } else {
      console.log(`  [STALE] Last heartbeat was ${ageSeconds}s ago (daemon may be idle or terminated).`);
    }
    console.log("================================================================================\n");
  } catch (err: any) {
    console.error("[ERROR] Failed to parse keeper-heartbeat.json:", err.message);
  }
}

checkKeeperHealth();
