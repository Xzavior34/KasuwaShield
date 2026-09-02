import {
  generateEphemeralSessionKey,
  buildEIP7702DelegationPayload,
  executeSessionKeyAutoRoll,
} from "../packages/execution/src/session-key-manager.js";

async function runAutoRollDemo() {
  console.log("==================================================");
  console.log("KASUWASHIELD — EIP-7702 CONTINUOUS AUTO-ROLL DEMO");
  console.log("==================================================");

  const userEOA = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" as `0x${string}`;
  const policyId = "0x" + Buffer.from("continuous-btc-24h-policy").toString("hex").padEnd(64, "0");
  const initialBudgetUSD = 50.0;
  const durationHours = 24;

  console.log("\n1. INITIALIZING CONTINUOUS POLICY SETUP:");
  console.log(` - User EOA: ${userEOA}`);
  console.log(` - Portfolio Exposure: $500 BTC (Target Protection: 30% = $150)`);
  console.log(` - Policy Duration: ${durationHours} Hours`);
  console.log(` - Max Spending Budget: $${initialBudgetUSD.toFixed(2)} USD`);

  // Step 1: Generate Ephemeral Session Key
  const sessionKey = generateEphemeralSessionKey(userEOA, policyId, initialBudgetUSD, durationHours);
  console.log(`\n2. GENERATED LOCAL EPHEMERAL SESSION KEY:`);
  console.log(` - Session Key Address: ${sessionKey.address}`);
  console.log(` - Storage: Stored securely in Browser Memory / IndexedDB`);

  // Step 2: Construct & Sign EIP-7702 Delegation Payload
  const delegation = buildEIP7702DelegationPayload(
    sessionKey,
    "0x8a92f03d12a4b89c72e411b932c0211598f39b1a"
  );
  console.log(`\n3. SIGNED ONE-TIME EIP-7702 DELEGATION PAYLOAD (1 POPUP):`);
  console.log(` - Chain ID: ${delegation.chainId} (Somnia Shannon Testnet)`);
  console.log(` - Authorized Executor: ${delegation.contractAddress}`);
  console.log(` - Status: EOA DELEGATED TO KASUWAEXECUTOR.SOL`);
  console.log(` - Notice: ALL SUBSEQUENT ROLLS REQUIRE 0 POPUPS!`);

  // Step 3: Simulate Sequential Auto-Rolls
  console.log("\n4. SIMULATING AUTONOMOUS AUTO-ROLLING LOOP:");
  const poolAddress = "0x43a18f29d10e42819873a90a218291b87a82910a" as `0x${string}`;
  const contractsPerRoll = 150;
  const pricePerContract = 0.10; // $15.00 cost per window roll

  for (let roll = 1; roll <= 4; roll++) {
    console.log(`\n--- [WINDOW ROLL #${roll}] ---`);
    try {
      const rollLog = await executeSessionKeyAutoRoll(
        sessionKey,
        poolAddress,
        contractsPerRoll,
        pricePerContract,
        roll
      );
      console.log(` [✓] ROLL #${roll} EXECUTED VIA INVISIBLE SESSION KEY (0 POPUPS)`);
      console.log(`     - Market Tx Hash: ${rollLog.txHash}`);
      console.log(`     - Hedge Cost: $${rollLog.costUSD.toFixed(2)}`);
      console.log(`     - Remaining Budget: $${rollLog.remainingBudgetUSD.toFixed(2)}`);
      console.log(`     - Somnia Reactive Event: RolloverWindowOpen emitted for Window #${roll + 1}`);
    } catch (error: any) {
      console.log(` [!] ROLL #${roll} TERMINATED BY KASUWAPOLICY:`);
      console.log(`     - Reason: ${error.message}`);
      console.log(`     - Action: Policy terminated safely. Session Key revoked.`);
    }
  }

  console.log("\n==================================================");
  console.log("[✓] CONTINUOUS AUTO-ROLL DEMO COMPLETED SUCCESSFULLY");
  console.log("==================================================");
}

runAutoRollDemo();
