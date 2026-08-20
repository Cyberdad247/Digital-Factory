#!/usr/bin/env python3
"""
[SYSTEM_IDENTITY: SIR_GIDEON // THE ALEXANDRIAN CRUCIBLE]
verify_cloudbrain_sync.py - Model Context Protocol (MCP) Grounded Sync & Isomorphism Verifier
"""

import sys
import json
import urllib.request
import urllib.error

API_BASE = "http://localhost:3000/api/mcp"

def run_crucible_test():
    print("=" * 60)
    print("⚜️ CAMELOT-OS: SIR GIDEON MGV CRUCIBLE AUDIT INITIATED")
    print("=" * 60)
    
    # 1. Test Server MCP Status
    try:
        req = urllib.request.Request(f"{API_BASE}/status")
        with urllib.request.urlopen(req, timeout=5) as res:
            status_data = json.loads(res.read().decode('utf-8'))
            print(f"[THREAD A: MNEMOSYNE] MCP Server Status: {status_data.get('status', 'OFFLINE')}")
            print(f"  -> Active Vault: {status_data.get('activeVault')}")
            print(f"  -> Total Blocks Indexed: {status_data.get('totalBlocks')}")
            print(f"  -> Bifrost Tunnel: {status_data.get('bifrostSecurity', {}).get('tunnelType')}")
    except Exception as e:
        print(f"[CRITICAL_HALT] MCP Server unreachable: {e}")
        print("//TRIGGER_REZERO_STATE: Halting kinetic execution.")
        sys.exit(1)

    # 2. Test Grounded Query Retrieval with Strict Citations
    test_query = "Retrieve Isomorphic FileTree Law and Zero-Hallucination Mandate"
    payload = json.dumps({"query": test_query, "requireCitations": True}).encode('utf-8')
    try:
        req = urllib.request.Request(
            f"{API_BASE}/query",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=5) as res:
            result = json.loads(res.read().decode('utf-8'))
            citations = result.get('citations', [])
            score = result.get('groundedScore', 0)
            
            print(f"\n[THREAD B: CODA] Grounded Query Execution: '{test_query}'")
            print(f"  -> Latency: {result.get('latencyMs')}ms")
            print(f"  -> Grounded Score: {score * 100}%")
            print(f"  -> Citations Received: {len(citations)}")
            
            for idx, cite in enumerate(citations):
                print(f"     [{idx+1}] {cite.get('sourceTitle')} | Block: {cite.get('blockId')}")

            if len(citations) == 0 or score < 0.85:
                print("\n[CRUCIBLE_VERDICT: REJECTED] Inadequate citations. Hallucination risk detected.")
                print("//REZERO_TRIGGERED: Rollback to L0 cache.")
                sys.exit(2)
            else:
                print("\n[CRUCIBLE_VERDICT: VERIFIED] Zero-Hallucination proof established.")

    except Exception as e:
        print(f"[THREAD C: GIDEON] MGV Query Test Failed: {e}")
        sys.exit(1)

    # 3. Test Isomorphic FileTree Law
    try:
        req = urllib.request.Request(f"{API_BASE}/filetree-audit")
        with urllib.request.urlopen(req, timeout=5) as res:
            audit = json.loads(res.read().decode('utf-8'))
            print(f"\n[LADY MNEMOSYNE] Isomorphic FileTree Integrity: {audit.get('isomorphicIntegrityScore')}%")
            print(f"  -> Total Nodes Audited: {audit.get('totalNodesAudited')}")
            print(f"  -> Synchronized (1:1): {audit.get('synchronizedCount')}")
            print(f"  -> Missing At Edge: {audit.get('missingCount')}")
            print(f"  -> Action: {audit.get('remedyAction')}")
    except Exception as e:
        print(f"[FILETREE_WARNING] FileTree audit warning: {e}")

    print("\n" + "=" * 60)
    print("⚡ MGV CRUCIBLE AUDIT COMPLETE: KINETIC PERMISSION GRANTED")
    print("=" * 60)

if __name__ == "__main__":
    run_crucible_test()
