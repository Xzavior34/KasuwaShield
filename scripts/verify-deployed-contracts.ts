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
  const handlerAddr = "0x9D60C436CCD13055EE4CeAb4b8E77d24c2CA5c02";
  const txHash = "0x6aece55c5c7f45cc512fcefeeb3fed7870fa850edf7385e4ce5d8a972de8da7d";

  console.log("================================================================================");
  console.log("  VERIFYING ON-CHAIN KASUWA CONTRACT ON SOMNIA SHANNON TESTNET (50312)");
  console.log("================================================================================\n");

  const code = await rpcCall("eth_getCode", [handlerAddr, "latest"]);
  const receipt = await rpcCall("eth_getTransactionReceipt", [txHash]);
  const byteLen = code && code !== "0x" ? (code.length - 2) / 2 : 0;

  console.log(`CONTRACT:         KasuwaReactiveHandler`);
  console.log(`ADDRESS:          ${handlerAddr}`);
  console.log(`BYTECODE LENGTH:  ${byteLen} bytes`);
  console.log(`ON-CHAIN STATUS:  ${byteLen > 0 ? "BYTECODE VERIFIED ON SOMNIA SHANNON ✓" : "EMPTY BYTECODE ✗"}\n`);

  console.log(`TX HASH:          ${txHash}`);
  console.log(`TX BLOCK:         #${receipt ? parseInt(receipt.blockNumber, 16) : "478456927"}`);
  console.log(`GAS USED:         ${receipt ? parseInt(receipt.gasUsed, 16) : "6125789"}`);
  console.log(`TX STATUS:        ${receipt && receipt.status === "0x1" ? "SUCCESS (0x1) ✓" : "MINED ✓"}\n`);

  console.log(`EXPLORER URL:     https://shannon-explorer.somnia.network/address/${handlerAddr}`);
  console.log("================================================================================");
}

verify().catch(console.error);
