---
name: dao-verify
description: Verify a change or phase delivery in the Dao Den Long game against the active released ticket, shared-core behavior, headless protocol and real browser evidence.
---

Read AGENTS.md, docs/STATUS.md, docs/VERIFICATION.md and active specs/*/{spec,plan,tasks,requirements}.md. Resolve active feature through .specify/feature.json. Use only released source in docs/requirements; never infer future tickets.

Before changing a rule, read its tests and the rule-change table. Preserve old phase proof/tags. Implement behavior assertions from the ticket, including negative and boundary cases. Do not use actual output as expected.

For Phase2, npm test covers canonical terrain, dash/fall, pause tick/sim_tick, AI/drop/pulse, drifters, charms, wind and surviving Phase1 contract. npm run verify creates ten CLI scenarios and replay proof. Run python scripts/verify.py --config verification/checks.json for build/tests/scenarios/Linux parity; Docker must be running.

For active Phase3, read specs/003-lantern-fuel/requirements.md and ADR003. Verify integer fuel, exact30 safety, stacked drain/step2, refuel/relight, capacity/score and dawn-only thresholds. npm run verify now creates12new and10retained scenarios under proof/phase-3; do not overwrite prior proof. Use scripts/browser-check-phase3.ps1 for bars/blink/torn-collapse, palette/persistence and CLI/browser parity. Changed all_lit/score/duration expectations are explicitly superseded, not skipped.

Use Orca browser skill for live controls, journey/retry/settings reload/audio/HUD/palette and screenshots. At1280x720 measure normal play FPS≥30; measure21600 headless ticks≤30seconds. A hidden tab pauses and invalidates live-input/FPS measurements; restore the window rather than bypassing product pause.

Write proof to docs/proof/phase-N, update verification.md/task/status with actual PASS/FAIL/BLOCKED/NOT_RUN. Record revision/dirty state/commands/environment/exit/assertions. Independent review must be attributed separately from author QA. Never claim hidden grading tests passed without access. Tag only a concrete tested delivery and report remaining limitations.

Phase4: Ticket04/contract1.3 adds headed benchmark, same-process soak, disk leaderboard/export and accessibility. `npm run verify` writes phase4 proof and retains22scenarios; manifest includes phase4/server tests and Linux. Run benchmark separately while no other renderer/heavy task is measuring; preserve slow samples and failed trials. Web RSSnull/vsyncfalse are documented limitations, not fabricated measurements. Public soak flags are jitless/1MiB nursery/expose-gc with symmetric load/reset GC; assert string results and real RSS ratio. `node scripts/browser-check-phase4.mjs` uses project-named Playwright release QA for retained32checks plus6newgroups. Validate extractedZIP and actualMP4duration/frames; publish own-repo release only after evidence. Old proof/tags remain immutable.
