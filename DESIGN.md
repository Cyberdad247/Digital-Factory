# ARTHURIAN OMNI-DIGITAL FORGE — DESIGN & ARCHITECTURAL SYSTEM (DESIGN.md)

> **Standard Compliance**: Inspired by `VoltAgent/awesome-design-md`, `nexu-io/open-design`, and `donnemartin/system-design-primer`.
> **Role**: Unyielding contract governing UI tokens, holographic shaders, typography scales, agent personas, and distributed state boundaries.

---

## 1. VISUAL DESIGN TOKENS (DESIGN.MD PROTOCOL)

### 1.1 Color Palette & Atmospheric Neutrals
- **Background Canvas**: `#07070D` (Cool deep obsidian, <3% saturation)
- **HUD Panel Fill**: `#0D0D18` with `rgba(0, 0, 0, 0.85)` inset shadow
- **Arc Core Cyan**: `#00F0FF` (Primary kinetic energy, glow vectors, telemetry streams)
- **Excalibur Gold**: `#D4AF37` / `#FFD700` (Arthurian sovereignty, active focus ring, high-priority gates)
- **Sentinel Emerald**: `#10B981` (Verification pass, low risk, 0% ambient leak)
- **Gideon Ruby/Amber**: `#F59E0B` (High warning) / `#EF4444` (Critical fail-closed gate)
- **Armor Border Hairlines**: `1px solid rgba(212, 175, 55, 0.35)` and `rgba(0, 240, 255, 0.3)`

### 1.2 Typographic Hierarchy & Spacing Math
- **Archetype**: Low-Contrast Product/OS (`Major Second 1.125` ratio)
- **Code & Telemetry**: Monospace (`JetBrains Mono`, `Fira Code`, `ui-monospace`)
- **Headers & Reticle**: Bold/Black Uppercase Display (`tracking-widest`, `font-black`)
- **Nested Border Radius Rule**: $\text{Radius}_{\text{inner}} = \text{Radius}_{\text{outer}} - \text{Padding}$
  - Container Outer: `rounded-2xl` (16px) with `p-4` (16px) $\rightarrow$ Inner Element: `rounded-lg` (8px)

---

## 2. DISTRIBUTED ARCHITECTURE PATTERNS (SYSTEM DESIGN PRIMER)

### 2.1 Capability Leases & Fail-Closed Boundaries
- **Sentinel Ephemeral Leases**: MicroVM processes operate under strict capability attenuation.
- **Hydra Ledger**: Append-only cryptographic receipt logging with tenant-scoped isolation.
- **Asynchronous Swarms**: Decoupled message queues with rate-limit backoff and auto-wake daemons.

### 2.2 Persona Responsibilities
- **Knight Merlin**: Routing, DAG compilation, topological task sequencing.
- **Knight Lancelot**: UI/UX, spatial layout, kinetic animation, reactive HUD matrices.
- **Knight Galahad**: Boundary constraints, JWT/Sentinel leases, adversarial invariant checks.
- **Knight Gideon**: Independent verification, AST test synthesis, fail-closed gatekeeper.
