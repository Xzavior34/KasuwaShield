import https from "node:https";

const RPC_URL = "https://dream-rpc.somnia.network";

function rpcCall(method: string, params: any[] = []): Promise<any> {
  return new Promise((resolve) => {
    const data = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
    const u = new URL(RPC_URL);
    const req = https.request(
      {
        hostname: u.hostname,
        port: 443,
        path: u.pathname,
        method: "POST",
        rejectUnauthorized: false,
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
            resolve(JSON.parse(body).result);
          } catch {
            resolve(null);
          }
        });
      }
    );
    req.on("error", () => resolve(null));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve(null);
    });
    req.write(data);
    req.end();
  });
}

async function verify() {
  console.log("================================================================================");
  console.log("  VERIFYING ON-CHAIN KASUWA CONTRACTS ON SOMNIA SHANNON TESTNET (50312)");
  console.log("================================================================================\n");

  const contracts = [
    { name: "KasuwaPolicy.sol (v2)", address: "0xbd2a26c3893db93ef86e0ceaaec080df8f9c550a" },
    { name: "KasuwaExecutor.sol", address: "0x80AcBF398663079edBfF26132C9AC04204B7c69c" },
    { name: "KasuwaReactiveHandler.sol", address: "0x7eAfd01B0736593611c2Ac73e0FdB6BeED2F3213" },
    { name: "USDso Collateral Token", address: "0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171" },
  ];

  for (const c of contracts) {
    const code = await rpcCall("eth_getCode", [c.address, "latest"]);
    const byteLen = code && code !== "0x" ? (code.length - 2) / 2 : 0;
    console.log(`CONTRACT:         ${c.name}`);
    console.log(`ADDRESS:          ${c.address}`);
    console.log(`BYTECODE LENGTH:  ${byteLen} bytes`);
    console.log(`ON-CHAIN STATUS:  ${byteLen > 0 ? "BYTECODE VERIFIED ON SOMNIA SHANNON ✓" : "EMPTY BYTECODE ✗"}`);
    console.log(`EXPLORER URL:     https://shannon-explorer.somnia.network/address/${c.address}\n`);
  }

  console.log("================================================================================");
}

verify().catch(console.error);
