# Phase3 verification matrix

Runtime c8c62cc. [Report](../../docs/proof/phase-3/report.md), [Verify](../../docs/proof/phase-3/verify/20261120T094528Z-37d8c864/report.md).

| Requirement | Evidence/assertions | Result |
|---|---|---|
| FR-001 fuel/refuel/out/relight | phase3tests6000tick, ceiling/fullskip/partial/history;12CLIcases/browserparity | PASS |
| FR-002 drain/safety/pulse | exact30/rounded30unsafe,2drainers/step2/cadence/pause,drainpulse15/ejection/chase | PASS |
| FR-003 dawn | allthree thresholds,noearlywin,finaltickout→relight,deathpriority/fuelbonus | PASS |
| FR-004 capacity | successful_lights/scenario/reset/cap20,HUD12slots | PASS |
| FR-005 score | deposit/refuel5,first100,relight40,pulse5/15,dawnfloorfuel/lamps/flames | PASS |
| FR-006 accessibility | live materials,whitewarning+symbol,collapse.8/tear,bar/blink,persistednormalreload | PASS |
| FR-007 protocol |53tests; schema/fields/events/replay;22scenarioWindows/Linux/browserparity | PASS |
| FR-008 delivery |ADR/changelog/testtable,independentreview,logs/screenshots/FPS/manifest/tag | PASS |

SC-001–005 traced to these tests and report. Replaced rules are in requirements.md; no silent skips.
Hidden grading tests unavailable; no claim of certification. Original Phase1/2 proof/tags preserved.
