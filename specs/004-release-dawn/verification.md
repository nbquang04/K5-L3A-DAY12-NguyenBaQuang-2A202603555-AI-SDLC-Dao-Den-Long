# Phase 4 traceability

| Requirement | Implementation | Verification / proof |
|---|---|---|
| FR001 / US1 benchmark | core/benchmark, web/benchmark+instances, scripts/bench | phase4 metric/scene tests; root bench.json+raw frames; report |
| FR002 / US2 soak | soak+soak-input | deterministic input test, real10night output/sidecar, verifier assertion |
| FR003 / US3 board | shared/leaderboard, server/store, release-ui | unit validation/ties/corrupt preservation, server restart/concurrency/export, browser loss form/menu |
| FR004 / US4 keys | settings/input/release-ui | conflicts/aliases, real remapped movement/pause and persisted reload |
| FR005 / US4 a11y | release.css, release-ui, edge-indicator | visible text computed18px, persisted125%/reducedmotion, lowfuel/countdown and live spawn at edge; pixel-direction regression |
| FR006 retained rules | shared simulation wander extraction only | 61tests,22scenarios,32retained browser checks and Linux byteparity |
| FR007 / US5 package | build/server/package-release | cleanLinux, extractedZIP server/web/API/export; README3commands, license/credits/changelog |
| FR008 / US6 final | record-demo, retrospective, release | actualMP4metadata<300s, visualreview, ZIPhash, publictag/Release |

See docs/proof/phase-4/report.md for actual commands/revision/environment/results and
limitations. Formal instructor hardware/hidden tests unavailable; do not equate local
PASS with external grading. All shipped functionality verified locally; publication
is complete only when release.json names the actual public release and uploaded assets.
