# Research

Plan research agent runtime_research reviewed source/geometry read-only. Adopt multi-surface height queries, local ramp coordinates, swept vertical landing, small horizontal substeps for tower/walls; no renderer collision authority. Use integer counters, latch input even paused, separate tick/sim_tick. Immediate safe-circle ejection satisfies≤30ticks. Retain prior union algorithm.
Alternatives: external physics engine rejected because headless parity and dependency overhead; clamp island rejected because ticket requires falling. Timer wall clock rejected because deterministic replay.
Unspecified protocol fields/defaults are explicitly in spec assumptions and contracts/headless.md; no blocking unknown remains.
