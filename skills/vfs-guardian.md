# VFS Guardian & Sentinel Policy Authority Skill
<!-- Canonical Block ID: viking://skills/vfs_guardian -->

## Rules of Engagement
1. **Zero Ambient Access**: No agent may perform unbounded reads/writes to ambient host filesystem.
2. **Ephemeral Worktree Clamping**: All writes are restricted to ephemeral VFS sandboxes with strict 512KB write budgets.
3. **Fail Closed**: Any effect without an active Sentinel Capability Lease is immediately halted.
4. **Independent Verification**: Code promotion requires passing Gideon AST diff audits and receipt signatures.
