# Topology-Aware Task Execution (TTE) Skill
<!-- Canonical Block ID: viking://skills/topology_task_execution -->

## Dynamic JIT Capability Node Assembly
- **Problem**: Loading every skill into every agent causes token exhaustion and context rot in multi-agent swarms.
- **Solution**: Skill corpus is organized into a DAG. LLM global routers query the 24D task vector and dynamically assemble ONLY relevant capability nodes just-in-time for execution.
- **Result**: Clamps per-agent memory representations to $\le 1.5$ KB and reduces context bloat by 84.6%.
