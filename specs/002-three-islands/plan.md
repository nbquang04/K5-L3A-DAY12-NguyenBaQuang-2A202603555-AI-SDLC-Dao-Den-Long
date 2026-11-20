# Implementation Plan: Three Nights

2026-11-20; specs/002-three-islands; branch main. Spec: spec.md.

## Summary
Extend the existing shared Node/Three.js core to contract1.1. Pure terrain queries and map data drive both rendering and movement. Replace superseded tests according to requirements.md; preserve original harness in phase-1 tag.

## Technical Context
JavaScript ES modules, Node22, Three.js0.181.2, node:test, Docker Linux, Orca browser.
No new dependencies. Config only game.contract.json. Tick60Hz; headless≤30s/21600steps, browser≥30FPS1280×720.

## Constitution Check
I/VIII released source captured; II/IX shared pure core and map queries; III seeded RNG/integer counters; IV/X tests before implementation and proof after; V scope Phase2; VI logs/harness/history retained; VII/XI Linux/browser/performance/license/tag. No exceptions. Recheck after implementation.

## Project Structure
src/core/maps.mjs: canonical data, surfaces, walls, pads.
src/core/simulation.mjs: full ticket pipeline, timers, AI and snapshots.
src/core/validation.mjs, src/headless/cli.mjs:1.1 adapter.
src/web/main.mjs/input.mjs/audio.mjs: render/controls/campaign/settings/audio; index.html/style.css.
tests/core.test.mjs/cli.test.mjs/input.test.mjs: revised regression; tests/phase2.test.mjs and scenarios/phase2.
scripts/check-phase2.mjs and browser-check-phase2.mjs: asserting routes/performance/parity.
verification/checks.json, docs/proof/phase-2: separate new evidence; never overwrite Phase1 proof.

## Design
Surface query returns all heights; grounded walking may follow ramp gradients but cannot ascend vertical walls. Descending sweeps land on crossed surfaces; airborne dash freezes Y; launch horizontal velocity persists until landing. Substeps constrain tower collision. Safe union projection ejects immediately (within ticket≤30 ticks), suppressing contact that step.
Counters decrease before actions; tick always advances including paused, sim_tick only playing. Resume edge runs a simulation step immediately. Scenario construction emits no events/points; night_start on first nonpaused step. Snapshot invuln boolean; nonexpiring random mote ttl_s=0. Spawn state1tick is a documented visual/gameplay default where ticket gives no duration.
Settings/localStorage/audio never touch RNG/core. Campaign totals only won nights; retry replaces current-night attempt. Renderer rebuilt per night and disposes old resources.

## Validation
Core tests cover canonical map/pads/dash/fall/pause/wind/drifters/charm/spawn/pulse and surviving contract invariants. CLI replay1/2/3 negative/schema; Linux byte parity. Browser real control, settings reload, flow/audio/HUD, screenshots and measured requestAnimationFrame FPS1280×720. Independent technical review from research agent followed by actual verification; report limitations.

## Complexity Tracking
No ECS/backend/physics library. Geometry lives in shared core rather than renderer callbacks.
