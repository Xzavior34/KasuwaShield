# Tasks for Antigravity — things Claude can't run itself

Claude (this session) does not sign transactions or handle private keys, and has no
Vercel CLI auth on this machine. Everything below is ready to run as-is. Run each
step from the repository root (`garuntee win/`) unless noted otherwise, and paste the
real output back so the docs can be updated with real values instead of placeholders.

---

## 1. Redeploy KasuwaPolicy v2 (fixes the access-control bug for real)

`contracts/KasuwaPolicy.sol` was patched with an `onlyExecutor` guard (SECURITY.md
Finding 2) and compiled to `artifacts/KasuwaPolicy.v2.compiled.json`, but the fix has
never actually been deployed — `packages/shared/src/constants.ts` still points at the
v1 address. This script deploys v2 and re-points `KasuwaExecutor` at it.

```bash
npx tsx scripts/redeploy-kasuwapolicy-v2.ts
```

Requires `DEPLOYER_PRIVATE_KEY` in `.env.local` (already present) and testnet STT gas
in the deployer wallet (`0x07764D9031b8747e28d3E1601Ff1417569de22DA` — check balance
first at https://shannon-explorer.somnia.network/address/0x07764D9031b8747e28d3E1601Ff1417569de22DA
and request more from the hackathon's Telegram if needed).

**After it succeeds:**
- Update `kasuwaPolicyAddress` in `packages/shared/src/constants.ts` to the new address.
- Update the address everywhere it's hardcoded in `apps/web/` (grep for the old address
  `0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d` — it appears in `app/page.tsx`,
  `app/proof/page.tsx`, `components/shell/AppShell.tsx`, `components/OnChainProofPanel.tsx`).
- Update `SECURITY.md` and `README.md` to say Finding 2 is deployed, not just fixed in code.
- Re-run `npx tsx scripts/verify-deployed-contracts.ts` to confirm the new deployment.

---

## 2. Run the real on-chain policy-roll proof

This is the strongest possible evidence: an ephemeral session key (not the main
wallet) creating a policy, getting authorized, and executing a policy-gated roll,
with real mined transaction hashes.

```bash
npx tsx scripts/execute-real-policy-roll.ts
```

Also requires `DEPLOYER_PRIVATE_KEY` in `.env.local` and testnet gas. It funds a
fresh session key with a small amount of STT automatically.

**After it succeeds:**
- Save the full console output somewhere in `artifacts/` (e.g.
  `artifacts/execute-real-policy-roll-output.txt`) so the 4 transaction hashes and
  Blockscout links are preserved, not just printed once to a terminal.
- Paste the Blockscout links into `README.md` section 9 and into the DoraHacks
  BUIDL page (there's already a milestone entry referencing this script — update it
  or add a follow-up milestone with the real links once you have them).

---

## 3. Redeploy the live demo to Vercel

The public demo at `kasuwa-shield-web-ousu.vercel.app` is running a **stale build**.
Claude found and fixed several bugs in `apps/web/` just now (wrong USDso token
address shown on the dashboard, a fabricated "Tx Mined" claim for a debunked fake
ReactiveHandler address in the downloadable proof JSON, a fake incrementing block
counter that pretended to be a live RPC feed, and a stale "10/10 tests" claim —
now a real `fetch()` to `eth_blockNumber` with an honest "RPC unreachable" fallback,
and 17/17). None of that is live until this redeploys.

```bash
npx vercel whoami        # confirm you're logged in; if not: npx vercel login
npx vercel --prod        # from repo root, or from apps/web if that's the project root
```

If `vercel --prod` asks to link a new project instead of finding the existing one,
stop and check the Vercel dashboard for the project backing
`kasuwa-shield-web-ousu.vercel.app` instead of creating a duplicate deployment.

**After it succeeds:** reload https://kasuwa-shield-web-ousu.vercel.app and confirm
the collateral token now shows the USDso address (`0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171`),
not the old `0x68B1D87F...De11d4` one.

---

## 4. Commit and push the app fixes from step 3's prep work

These files were already edited by Claude this session (not yet committed):

- `apps/web/app/page.tsx`
- `apps/web/app/proof/page.tsx`
- `apps/web/app/proof/[positionId]/page.tsx`

```bash
git add apps/web/app/page.tsx apps/web/app/proof/page.tsx "apps/web/app/proof/[positionId]/page.tsx"
git commit -m "fix(web): correct stale USDso address and fabricated ReactiveHandler tx claim in proof UI; make live block height a real RPC poll instead of a fake counter"
git push
```

---

## 5. Once all of the above is done

Update `README.md`'s "Live Demo" line (currently `http://localhost:3000`) to point at
the real, now-fixed `https://kasuwa-shield-web-ousu.vercel.app`, and do the same on
the DoraHacks BUIDL page. Ask Claude to do this last step once 1-4 are confirmed —
it's just editing markdown/the BUIDL page and doesn't need signing or CLI auth.
