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
  const handlerAddr = "0x7eAfd01B0736593611c2Ac73e0FdB6BeED2F3213";
  // No hardcoded txHash here on purpose -- a prior version fell back to printing a
  // hardcoded block number and "MINED (Y)" even when the receipt lookup returned null.
  // Bytecode presence (checked below) is what actually proves this address is live.

  console.log("================================================================================");
  console.log("  VERIFYING ON-CHAIN KASUWA CONTRACT ON SOMNIA SHANNON TESTNET (50312)");
  console.log("================================================================================\n");

  const code = await rpcCall("eth_getCode", [handlerAddr, "latest"]);
  const byteLen = code && code !== "0x" ? (code.length - 2) / 2 : 0;

  console.log(`CONTRACT:         KasuwaReactiveHandler`);
  console.log(`ADDRESS:          ${handlerAddr}`);
  console.log(`BYTECODE LENGTH:  ${byteLen} bytes`);
  console.log(`ON-CHAIN STATUS:  ${byteLen > 0 ? "BYTECODE VERIFIED ON SOMNIA SHANNON ✓" : "EMPTY BYTECODE -- NOT A DEPLOYED CONTRACT ✗"}\n`);

  console.log(`EXPLORER URL:     https://shannon-explorer.somnia.network/address/${handlerAddr}`);
  console.log("================================================================================");
}

verify().catch(console.error);
