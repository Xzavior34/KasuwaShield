import { createPublicClient, http } from "viem";
import { somniaTestnet } from "viem/chains";
import { SOMNIA_SHANNON_CONFIG, IBinaryPoolAbi } from "../packages/shared/src/index.js";

async function main() {
  const poolAddress = process.argv[2] || "0x_pool_address";
  console.log(`Inspecting on-chain state for pool: ${poolAddress}`);

  const pub = createPublicClient({
    chain: somniaTestnet,
    transport: http(SOMNIA_SHANNON_CONFIG.rpcUrl),
  });

  if (!poolAddress.startsWith("0x") || poolAddress.length !== 42) {
    console.log("Please provide a valid pool address: npx tsx scripts/inspect-market.ts 0xPoolAddress");
    return;
  }

  try {
    const poolContract = { address: poolAddress as `0x${string}`, abi: IBinaryPoolAbi };
    const [params, finalized, bids, asks] = await Promise.all([
      pub.readContract({ ...poolContract, functionName: "getBinaryPoolParams" }),
      pub.readContract({ ...poolContract, functionName: "finalized" }),
      pub.readContract({ ...poolContract, functionName: "getBookLevels", args: [true, 5n] }),
      pub.readContract({ ...poolContract, functionName: "getBookLevels", args: [false, 5n] }),
    ]);

    console.log("\n--- On-Chain Pool State ---");
    console.log("Finalized:", finalized);
    console.log("Collateral Token:", (params as any).collateralToken);
    console.log("Market Contract:", (params as any).market);
    console.log("Outcome Token:", (params as any).outcomeToken);
    console.log("Yes (Up) ID:", (params as any).yesId?.toString());
    console.log("No (Down) ID:", (params as any).noId?.toString());
    console.log("\n--- Order Book Bids ---", bids);
    console.log("\n--- Order Book Asks ---", asks);
  } catch (err) {
    console.error("Inspection failed:", err);
  }
}

main().catch(console.error);
