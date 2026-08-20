# Self-Triaging & Efficiency Foundry Architecture

## 1. Triage-Driven Orchestration (Anya Engine)
Instead of activating all Titan engines simultaneously, an `Orchestrator` agent (Anya) acts as the primary entry point.

### Logic
1. **Intent Analysis**: User natural language -> `WorkflowIntent`.
2. **Engine Selection**:
   - If `Intent` == `Design` -> Delegate to Merlin Software Agency.
   - If `Intent` == `Implement` -> Delegate to Blueprint OS.
   - If `Intent` == `Debug/Analyze` -> Delegate to Hive IDE.
3. **Budget Allocation**: Assign a `ContextBudget` based on intent complexity.

## 2. Resource & Token Reduction Strategy
### Semantic Slicing (Hive IDE)
- Instead of full repository ingestion, Hive IDE now performs **Symbol-level Slicing**.
- Only symbols, contracts, and test anchors relevant to the `Task DAG` node are loaded into the Pill's context.

### Lazy-Foundry Execution
- Foundry workcells and Pill harnesses are only instantiated on-demand upon `Sentinel` lease issuance, eliminating overhead for inactive tasks.

## 3. No-Code Chat to Workflow (Orchestrator)
The interface is transformed from a static dashboard to a conversational orchestrator that generates executable `Blueprint OS` Task DAGs in real-time.
