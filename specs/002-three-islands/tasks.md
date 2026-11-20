# Tasks: Three Nights

## Phase 1: Setup
- [ ] T001 Capture Ticket-02, requirements.md rule/test changes, config standard numbers in game.contract.json (FR-001/008).
## Phase 2: Foundation
- [ ] T002 Add asserting tests/phase2.test.mjs before implementation; revise superseded tests/core.test.mjs with documented ticket expectations (FR-009).
- [ ] T003 Implement src/core/maps.mjs terrain/map data and surface/wall/pad queries (FR-002).
- [ ] T004 Extend src/core/validation.mjs and CLI for data-model.md Session.night/tick/sim_tick/state, Player.pos/vel/grounded/flames/carried/invuln/dashCd/pulseCd/charm/respawn/dashLeft, Lantern.id/deposited/lit, Mote.id/pos/kind/ttl/born, Shade.id/pos/state/stateLeft/pushLeft/pushDir, Drifter.id/pos/state/stolen/stateLeft/born, Charm.id/pos/available/respawn (FR-008).
## Phase 3: US1 — maps and controls
- [ ] T005 [US1] Implement core movement/dash/pads/ramps/tower/fall/respawn in src/core/simulation.mjs; render all canonical terrain in src/web/main.mjs (FR-001/002).
Independent test: isolated dash airborne, bridge fall, ramp/wall/pad landing assertions.
## Phase 4: US2 — light and enemies
- [ ] T006 [US2] Implement tick pipeline, pickup/deposit/score, shade states/spawn/safe union/pulse/drop/recoil in src/core/simulation.mjs, tests/core.test.mjs (FR-001).
Independent test: deposit score, pulse120/15, hit/drop/TTL, canonical schedules.
## Phase 5: US3 — new systems
- [ ] T007 [US3] Implement drifter/charm/wind in core and visuals; add scenarios tests/scenarios/phase2 and assertions (FR-003/004/002).
Independent test: theft/recovery, charm cooldown bypass/respawn, wind warning/active.
## Phase 6: US4 — journey
- [ ] T008 [US4] Implement campaign/intro/results/dawn, pause/settings persistence, complete HUD/palette, src/web/main.mjs/index.html/style.css (FR-005/006/007).
- [ ] T009 [US4] Add procedural WebAudio music and required event effects in src/web/audio.mjs; sources in CREDITS (FR-007).
Independent test: browser transitions/retry/settings reload, audio nodes, palette/HUD checks.
## Phase 7: US5 — contract/delivery
- [ ] T010 [US5] Extend CLI regression/replay in tests/cli.test.mjs and scripts/check-phase2.mjs; measure21600ticks (FR-008/009).
- [ ] T011 [US5] Configure verification/checks.json, Linux check for phase2, browser QA/FPS at1280x720 and proof/phase-2 (FR-009).
Independent test: malformed scenario exit2, replay1/2/3 bytes, Linux parity, measured performance.
## Phase 8: Polish
- [ ] T012 Update AGENTS/ARCHITECTURE/README/notes/STATUS and skill project guidance, verification.md/report; review/converge then commit/tag phase-2 (FR-009).

## Dependencies & Execution Order
T001→T002→T003/T004→T005→T006→T007→T008/T009→T010→T011→T012.
Tests first, core then adapters then visual QA. Research may run separately per plan skill; shared code edited sequentially.
Parallel examples: geometry research vs timer research; audio/UI requirements review vs pure CLI schema review; no simultaneous mutation required.
Implementation strategy: preserve reproducible phase1 tag, replace changed laws by explicit ticket assertions, deliver full Phase2 scope after evidence.
