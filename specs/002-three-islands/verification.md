# Phase 2 verification

Source: released Ticket-02/Test Contract1.1 at docs/requirements/phase-2-source.ax.txt.
Runtime revision:8db6afd (source predecessor3567e87 plus terrace wall visual fix).
See [report](../../docs/proof/phase-2/report.md), raw proof and Verify reports there.

| Requirement | Test/assertion and evidence | Result |
|---|---|---|
| FR-001 standard rules | core.test.mjs/phase2.test.mjs: movement, pickup/deposit/score/pulse/safe/hit/spawn/tick/terminal | PASS |
| FR-002 maps/dash/fall/pads/wind | phase2 tests; CLI dash/fall/pad/wind JSONL, browser parity and screenshots | PASS |
| FR-003 drifter | theft, pulse exact-location recovery, flee; CLI drifter scenario and browser parity | PASS |
| FR-004 charm | duration/refresh/boost/dash bypass/respawn; CLI charm and browser parity | PASS |
| FR-005 journey | browser intro/terminal fixtures/total450/retry current night; source next-night flow | PASS |
| FR-006 pause/settings | tick/sim_tick/core freeze, UI pause/resume; normal-results.json after reload | PASS |
| FR-007 audio/HUD/palette | audio nodes running,10slots/cooldowns/timer/arrow, materials exact source HEX, screenshots and ambient formula | PASS |
| FR-008 contract | CLI negative/base regressions, snapshots all new arrays/fields,10scenario replay/browser snapshot parity | PASS |
| FR-009 delivery |43tests Windows/Linux, parity ten scenarios, headless21600<30s, normal browser FPS>30, proof/review/tag | PASS |

SC-001: three-night results/retry verified with fixtures; not a claim of a full human playthrough.
SC-002–003: tests/scenarios, byte replay and Linux parity. SC-004: measured headless/FPS logs.
SC-005: proof and technical review, phase tag after report commit. Hidden grading tests unavailable; cannot claim they passed. No FPS guarantee for other hardware. No macOS claim. Remaining assumptions are documented in spec/contracts.
