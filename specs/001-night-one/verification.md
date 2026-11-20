# Phase 1 verification matrix

Runtime revision e75aeb2afabb97cad179fb701ddd7613060c7c44. PRD/contract source verified.
[Report](../../docs/proof/phase-1/report.md), [Verify](../../docs/proof/phase-1/verify/20261120T085439Z-a9fae9b6/report.md).

| ID | Requirement | Evidence | Result |
|---|---|---|---|
| P1-V01 | US-01 movement/camera/jump | core/input tests, browser/camera JSON | PASS |
| P1-V02 | US-02 pickup/capacity | core tests, browser pickup | PASS |
| P1-V03 | US-02 partial/full deposit/events | core tests, win.jsonl | PASS |
| P1-V04 | US-03 chase/hit/immunity/safe union | core tests, hit.jsonl | PASS |
| P1-V05 | US-03 pulse/cooldown/stun/push | core tests, browser pulse | PASS |
| P1-V06 | US-04 terminal/score/priorities | core tests, scenario-results.json | PASS |
| P1-V07 | US-04 HUD/restart | browser-results.json, won.png | PASS |
| P1-V08 | US-05 tick0/k+1/latch/edge | CLI/core tests | PASS |
| P1-V09 | US-05 scenario patch/replace | CLI/core tests | PASS |
| P1-V10 | US-05 JSONL/end/rounding/exit2 | CLI/core tests | PASS |
| P1-V11 | US-05 byte replay | replay-a/b.jsonl, linux-results.json | PASS |
| P1-V12 | FR-007 visual design/feedback | intro.png, won.png, browser WebGL | PASS |
| P1-V13 | FR-005 shared core/no GPU | browser/CLI snapshot parity, headless tests | PASS |
| P1-V14 | FR-008 Linux/three commands | Dockerfile, linux logs, README | PASS |

25/25 tests passed on Windows and Linux; 8/8 browser checks passed.
Technical independent review is recorded in technical-review.md, before the final A/D fix.
Final A/D fix has author-run tests/browser evidence; no new independent review is claimed.
This does not imply hidden-test certification or user acceptance of game feel.
