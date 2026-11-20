# Tasks: Lantern Fuel

## Phase1: Setup
- [x] T001 Capture source/rule changes and ADR/changelog; update contract tuning in game.contract.json (FR-001–008).
## Phase2: Foundation
- [x] T002 Write tests/phase3.test.mjs before implementation; adapt changed core/phase2 expectations per requirements.md (FR-008).
- [x] T003 Extend validation/model initialization in src/core/validation.mjs and simulation.mjs for data-model.md Lantern.fuelUnits/lit/deposited/ever_lit/relit_count, Player.successful_lights/carried/capacity, Session.state/night/duration, Shade.state/target_lantern_id/drainTicks and Settings.colorblind (FR-001/004/007).
## Phase3: US1 — fuel
- [x] T004 [US1] Implement shared helpers and step2 fuel/out, eligible nearest interaction/refuel/relight in src/core/simulation.mjs; tests/scenarios/phase3 fuel assertions (FR-001).
Independent test: exact6000tick decay, refuel ceiling/full skip, relight5/history.
## Phase4: US2 — drain
- [x] T005 [US2] Implement weak safety/drain selection/transitions/aggregation/cadence/pulse in src/core/simulation.mjs and regressions tests/phase3.test.mjs (FR-002).
Independent test: stacked drain, exact30, chase stays chase, target changes, ejection, drainpulse15.
## Phase5: US3/4 — dawn/capacity/score
- [x] T006 [US3] Replace terminal/dawn bonuses and durations; update scripts/check-phase2.mjs regression fixtures for superseded win conditions (FR-003/005).
- [x] T007 [US4] Apply dynamiccapacity to pickup/schema/HUD and actuallighting counter in core/web (FR-004/005).
Independent test: thresholds eachnight, finaltickout/refuel/hit, noearlywin; capacity20/reset/scenario.
## Phase6: US5 — accessible presentation
- [x] T008 [US5] Add fuelbars/blink/torncollapsed lamps and updated HUD/prompts/story in src/web/main.mjs/index.html/style.css; persisted palette toggle affects shadeeyes/edges and warning symbols (FR-006).
Independent test: browser visiblebar/scale/tear/blink, settings/reload, no core changes.
## Phase7: US6 — contract/proof
- [x] T009 [US6] Add scripts/check-phase3.mjs with CLI scenarios/replay/performance, snapshot1.2 assertions and invalidschema tests (FR-007/008).
- [x] T010 [US6] Configure Verify/Linux and browser phase3 QA/FPS; preserve all past proof (FR-008).
Independent test: Windows/Linux byte replay, browser parity and normal URL settings/FPS.
## Phase8: Polish
- [x] T011 Update AGENTS/ARCHITECTURE/dao-verify/README/notes/STATUS, verification/report, independent technical review/converge then commit/tag phase-3 (FR-008).

## Dependencies / Parallel Examples / Strategy
T001→T002→T003→T004→T005→T006/007→T008→T009→T010→T011.
Research can compare fuel timing while author reads prior tests; pure UI requirements review and CLI schema review are independent. Shared source edits sequential. Tests first, core then adapters then visible evidence; no silent skips or copied historical PASS.

Evidence: proof/phase-3/report.md, Verify20261120T094528Z-37d8c864, independent review53tests. Tag follows documentation commit.
