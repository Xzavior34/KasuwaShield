"""
KasuwaShield — Automated Slither Static Security Analyzer Runner

Executes Trail of Bits Slither against protocol smart contracts using JSON output mode.
Dynamically parses detector results, classifies vulnerabilities by impact,
and exits with code 1 if execution fails or if any High/Critical/Medium vulnerability is detected.
"""

import subprocess
import sys
import os
import json

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

CONTRACTS = [
    "contracts/KasuwaPolicy.sol",
    "contracts/KasuwaExecutor.sol",
    "contracts/KasuwaReactiveHandler.sol"
]

def get_installed_detectors_count(solc_path):
    try:
        cmd = [sys.executable, "-m", "slither", "--list-detectors"]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0:
            lines = [l for l in res.stdout.splitlines() if "|" in l and l.strip().split("|")[1].strip().isdigit()]
            if lines:
                return len(lines)
    except Exception:
        pass
    return None

def main():
    print("=" * 80)
    print("  KASUWASHIELD — RIGOROUS SLITHER STATIC SECURITY AUDIT")
    print("=" * 80)

    solc_path = "./solc.exe" if os.path.exists("solc.exe") else "solc"
    
    # 1. Verify solc availability
    try:
        res = subprocess.run([solc_path, "--version"], capture_output=True, text=True)
        if res.returncode != 0:
            print(f"[FATAL ERROR] solc at '{solc_path}' returned non-zero exit code.")
            sys.exit(1)
        solc_ver = res.stdout.splitlines()[1] if len(res.stdout.splitlines()) > 1 else res.stdout.strip()
        print(f"[*] Solidity Compiler: {solc_ver}")
    except Exception as e:
        print(f"[FATAL ERROR] Unable to execute solc compiler: {e}")
        sys.exit(1)

    # 2. Get active detector count
    detector_count = get_installed_detectors_count(solc_path)
    if detector_count:
        print(f"[*] Slither Detectors Active: {detector_count}")
    else:
        print(f"[*] Slither Detectors Active: Standard Trail of Bits Suite")

    audit_summary = []
    total_critical = 0
    total_high = 0
    total_medium = 0
    total_low = 0
    total_info = 0
    analysis_failed = False

    for contract in CONTRACTS:
        if not os.path.exists(contract):
            print(f"\n[!] ERROR: Contract file not found: {contract}")
            analysis_failed = True
            continue

        print(f"\n[*] Running Slither on {contract}...")
        cmd = [sys.executable, "-m", "slither", contract, "--solc", solc_path, "--json", "-"]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True)
        except Exception as e:
            print(f"    [!] Execution failed: {e}")
            analysis_failed = True
            continue

        # Slither returns non-zero when issues are detected, but stdout contains JSON
        stdout = res.stdout.strip()
        if not stdout:
            print(f"    [!] No output from Slither (stderr: {res.stderr[:200]})")
            analysis_failed = True
            continue

        try:
            # Find the JSON payload in stdout (ignoring preceding text lines)
            json_start = stdout.find("{")
            if json_start == -1:
                raise ValueError("No JSON object found in stdout")
            data = json.loads(stdout[json_start:])
        except Exception as e:
            print(f"    [!] Failed to parse Slither JSON output: {e}")
            print(f"    Raw stdout snippet: {stdout[:200]}")
            analysis_failed = True
            continue

        results = data.get("results", {})
        detectors = results.get("detectors", [])

        crit_list = [d for d in detectors if d.get("impact", "").lower() == "critical"]
        high_list = [d for d in detectors if d.get("impact", "").lower() == "high"]
        med_list = [d for d in detectors if d.get("impact", "").lower() == "medium"]
        low_list = [d for d in detectors if d.get("impact", "").lower() == "low"]
        info_list = [d for d in detectors if d.get("impact", "").lower() in ("informational", "optimization")]

        c_count = len(crit_list)
        h_count = len(high_list)
        m_count = len(med_list)
        l_count = len(low_list)
        i_count = len(info_list)

        total_critical += c_count
        total_high += h_count
        total_medium += m_count
        total_low += l_count
        total_info += i_count

        contract_clean = (c_count == 0 and h_count == 0 and m_count == 0)
        status_str = "PASS (Clean)" if contract_clean else "FAIL (Issues Found)"

        print(f"    -> Status: {status_str}")
        print(f"    -> Findings: {c_count} Critical, {h_count} High, {m_count} Medium, {l_count} Low, {i_count} Informational")

        if not contract_clean:
            for d in crit_list + high_list + med_list:
                print(f"       [{d.get('impact').upper()}] {d.get('check')}: {d.get('description', '').splitlines()[0]}")

        audit_summary.append({
            "contract": contract,
            "passed": contract_clean,
            "critical": c_count,
            "high": h_count,
            "medium": m_count,
            "low": l_count,
            "info": i_count
        })

    print("\n" + "=" * 80)
    print("  SLITHER AUDIT VERIFICATION SUMMARY")
    print("=" * 80)

    if analysis_failed or len(audit_summary) != len(CONTRACTS):
        print("  [✗] AUDIT FAILED: One or more contracts failed to analyze or could not be verified.")
        sys.exit(1)

    for item in audit_summary:
        state = "✓ SECURE" if item["passed"] else "✗ VULNERABLE"
        print(f"  {state} | {item['contract']:<35} | Crit: {item['critical']} | High: {item['high']} | Med: {item['medium']} | Low: {item['low']} | Info: {item['info']}")

    print("-" * 80)
    if total_critical == 0 and total_high == 0 and total_medium == 0:
        print(f"  [✓] AUDIT PASSED: ZERO Critical, ZERO High, ZERO Medium vulnerabilities across {len(CONTRACTS)} contracts.")
        print(f"      Total minor triage: {total_low} Low (informational/gas), {total_info} Informational (style/events).")
        print("================================================================================\n")
        sys.exit(0)
    else:
        print(f"  [✗] AUDIT FAILED: Detected {total_critical} Critical, {total_high} High, {total_medium} Medium vulnerabilities!")
        print("================================================================================\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
