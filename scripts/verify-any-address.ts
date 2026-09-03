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
  const addr = "0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d";

  console.log("================================================================================");
  console.log("  VERIFYING ADDRESS ON SOMNIA SHANNON TESTNET (50312)");
  console.log("================================================================================\n");

  const code = await rpcCall("eth_getCode", [addr, "latest"]);
  const bal = await rpcCall("eth_getBalance", [addr, "latest"]);
  const byteLen = code && code !== "0x" ? (code.length - 2) / 2 : 0;

  console.log(`ADDRESS:          ${addr}`);
  console.log(`BYTECODE LENGTH:  ${byteLen} bytes`);
  console.log(`ON-CHAIN STATUS:  ${byteLen > 0 ? "BYTECODE VERIFIED ON SOMNIA SHANNON ✓" : "EMPTY BYTECODE (EOA / Un-deployed) ✗"}`);
  console.log(`EXPLORER URL:     https://shannon-explorer.somnia.network/address/${addr}\n`);
  console.log("================================================================================");
}

verify().catch(console.error);
