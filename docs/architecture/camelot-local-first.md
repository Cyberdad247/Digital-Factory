# Camelot-OS Local-First Architecture

## 1. Receipt-Backed Storage (CRDT-Audit Store)
The Camelot-OS receipt store acts as the source of truth for all agentic activity. It is structured as an append-only ledger using CRDT principles to ensure consistency across local agentic operations.

### Data Structure
Every action (map, anchor, write, test) generates a signed receipt. Receipts are stored as indexed, immutable files within the VFS worktree or a dedicated Camelot-managed path.

### Consistency Model
The store uses LWW (Last-Write-Wins) registers or causal ordering for receipts to maintain a reliable audit trail even if multiple Knight Pills attempt to write simultaneously (though the Foundry architecture strictly limits writers).

## 2. VFS-Based Diagnostic Bundling
Because Camelot-OS systems operate within hardened, air-gapped Foundry workcells, diagnostic information must be aggregated into a verifiable bundle for human-in-the-loop review.

### Diagnostic Bundle Components
1. **Receipt Chain**: The full, cryptographically linked history of the task.
2. **Structural Snapshot**: A filtered copy of the VFS worktree state (source code revision + candidate patch).
3. **Operational Evidence**: Collected test results, build logs, and resource utilization metrics.
4. **Environment Attestation**: A machine-readable manifest of the cgroup/sandbox constraints enforced during the task.

### Packaging
Bundles are produced as deterministic zip artifacts in the `/evidence` workcell mount, signed by the Foundry controller.
