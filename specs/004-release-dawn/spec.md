# Feature Specification: Dawn v1.0.0 — Ticket-04

**Feature Branch**: main, feature directory specs/004-release-dawn
**Created**:2026-11-20
**Status**: Specified
**Input**: Continue Phase4. Released Ticket04/Test Contract1.3, captured in docs/requirements/phase-4-source.ax.txt.

## User Scenarios & Testing

### User Story1 — Reproducible benchmark (Priority:P1)
As evaluator I run bench_cmd --seed42 --duration30 --out bench.json and obtain real rendering metrics.
Why: measurable release quality.
Independent test: real browser scene plus deterministic scene/unit metric assertions.
Acceptance: window/viewport1280x720, night1 full normal effects/lighting, exactly200wander shades and100motes seeded and spread onisland, L1–L3lit/fuel100; no spawn/damage/pickup/fueldecay/end. Player0,0,0 without input; camera starts30,15,0,orbits counterclockwise15s/revolution looking0. Warmup3s excluded, then duration seconds measured, process exits0. Metrics contract1.3 avg_fps=1000N/sumdt, worst1%mean inverse, dtp95,frames,load_ms,peak_mem_mb (webnullwith explanation),vsync_off,renderer,os. Instructor-machine thresholdsavg60,p1low30,load10000ms; local data labeled local, not certification.

### User Story2 — Long-run stability (Priority:P1)
As evaluator I run soak_cmd --seed7 --nights10 --out soak.json.
Independent test: seeded inputs, same-process10night cycle and actual RSS measurements.
Acceptance: nights1→2→3repeat, indexi zero-based seed7+i; finish terminal or standard duration. Every30ticks choose direction; perstep independent5%jump,3%dash,2%pulse,10%interact. No simulation sleeps. mem_start after firstnight load, mem_end after final reset, duration monotonic. Output nights/crashes/results/memory/duration; crashes0, end≤1.2start. Do not inflate startingRSS or fabricate memory.

### User Story3 — Persist local leaderboard (Priority:P1)
After final dawn or any loss I enter3–12ASCII[A-Za-z0-9_] name and save total won-night score.
Independent test: disk restart/export, tie sorting, validation and actual result form/menu.
Acceptance: name,score,nights_won0..3,ISO8601timezone achieved_at,seed; top10scoredescending then earliest first; persistentlocaldisk; menu leaderboard; run_cmd --export-leaderboard out.json gives {entries:[...]} sorted. No score submission after intermediate wins. Failed current attempt not included in total.

### User Story4 — Controls and accessibility (Priority:P1)
Rebind all9actions, see conflict feedback, restoredefaults, retain settings across restart.
Independent test: actual keyboard rebinding/settings/reload and pure settings/input tests.
Acceptance: fourmovement,jump,dash,interact,pulse,pause all editable; duplicate primary keys blocked; defaultaliases never cause double actions when reassigned. Visual captions for shade_spawned with edge-directionarrow, upcomingwind,last10seconds andfuel<30. Reducedmotion disables camera shake/fullscreenflash. All UI text≥18px1280x720, optional1.25largefont persisted; prior palette/volume/sensitivity retained.

### User Story5 — Installable release (Priority:P1)
As player I clone clean and start in≤3commands or download runnable GitHubReleasev1.0.0.
Independent test: clean Linux build/headless and extractedrelease package server smoke.
Acceptance: README description/image/systemrequirements/install/controls/tests/headless/bench/soak; changelogall4phases,credits/license/harness. Contract1.3addsbench_cmd/soak_cmd, all earlier unaffected rules unchanged. Tagphase-4 and Releasev1.0.0 publicrepo with runnablewebfolder/server instructions orDockerimage. Actual bench.json/soak.json committed.

### User Story6 — Evaluation and demo (Priority:P1)
User receives1–2page retro synthesizing fourphaseevaluations, AI failures/detection/harness/value/costestimate-or-unavailable/savings/whattochange, plus actual MP4<5minutes showing directplay and test/headless/bench evidence.
Independent test: video metadata/visualreview and releaseassets checks.
Acceptance: playable recording, real output evidence, no fabricated results; video at docs/demo/demo.mp4 orRelease. Token/cost explicitly unavailable if unmeasured, no invented estimate.

### Edge Cases
Invalid CLI/data exitnonzero/stderr; benchmarkduration positive; warmup no measuredsamples; percentiles use deterministic nearest-rank. Browser-managedvsync reportedfalse when cannotguarantee disabling. Benchmark creative extraactors/effects disabled; shared normal geometry/lighting retained. Soak holds only currentnight, resetsafterlast; explicitGCifavailable is documented, not a substitute for freeing references. Leaderboard badfile preserved/refuse overwrite; ties stable; invalid names/scores rejected; no HTML injection. Missing localstorage/disk errors shown. Bindings validation falls back safely for malformedsettings; collisions include aliases asneeded.

## Requirements
- **FR-001**: Exact canonical rendering benchmark scene/CLI/timing/metrics and measured output.
- **FR-002**: Same-process seeded10night soak/RSS/output/threshold.
- **FR-003**: Localdisk top10leaderboard, terminalnameform/menu/export.
- **FR-004**: Persistent9actionbindings/conflict/defaults and retained controls.
- **FR-005**: Captions/arrows/reducedmotion/min18/large1.25, persisted.
- **FR-006**: Contract1.3, inherited gameplay/CLI regression, actual proof/review.
- **FR-007**: Cleaninstall/package/docs/licenses/changelog/phase4tag/publicRelease.
- **FR-008**: Retro/demo<5minactualplayandproof.

### Key Entities
BenchmarkSession:seed,scene200/100/3,orbit/warmup/measuredsamples/output. SoakRun:nights/seeds/results/crashes/RSS/time. LeaderboardEntry:name,score,nights_won,achieved_at,seed. Settings:bindings/reducedMotion/largeText plus retainedvolume/sensitivity/colorblind. Release:source revision,assets,video,checksums.

## Success Criteria
- **SC-001**: Canonical benchmark actually runs and emits formula-verified rawsample-derived results; local thresholds reported honestly.
- **SC-002**:10night sameprocess soak0crashes/RSSratio≤1.2 ontestedmachine.
- **SC-003**: Leaderboard survives process restart and exports correctly; all binding/accessibility criteria observable and tested.
- **SC-004**: Earlier unsuperseded regressions/replay/Linux/browserpass; extractedrelease runnable; no hidden-testclaim.
- **SC-005**: phase-4/v1.0.0 plus runnableasset/video/retro/bench/soak/proof present with accurate limitations.

## Assumptions
Webgame uses a local Node static/APIserver for diskleaderboard; purestatic hosting supports gameplay only; persistent leaderboard/export require the shipped Node server. Disk path defaults.data/leaderboard.json and can be isolated byenvfor QA. NamesASCIIbaseline. Bench uses installedChrome/Edge orPlaywrightChromium, headedbydefault; No headless rendering flag is advertised. RSSnullforwebbench, vsyncfalsebecause browsercontrolsRAF. Metricp95 nearest-rank. Batching identical geometry when entitycountlarge is a generalrendereroptimization, not reducedbenchquality. Soak invokes optionalGC atload/reset boundaries consistently. No new gameplayrules.
