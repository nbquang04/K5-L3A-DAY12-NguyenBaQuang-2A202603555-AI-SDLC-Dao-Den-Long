# Implementation Plan: Release Dawn
2026-11-20; main; spec.md.

## Summary / Technical Context
Retain Node22/Three0.181.2. Add pinned Playwright1.65.1 devtool for headed benchmark and actual demo recording, using installedChrome/Edge orPlaywrightChromium. Runtime server/leaderboard onlyNodebuiltins; browser uses localvendor. No gameplaylaws replaced. Existing53tests/22scenarios retained.

## Constitution Check
Released source captured, no future inference; core shared and deterministic; benchmark deliberately isolated ticket-defined suppression only; AIinput RNG separate; tests/proof/review beforetag; no fabricatedRSS/FPS/token. Preserve previous tags, publish ownedrepo Release with credits/license/video. No exception. Research agent reviewed metric boundaries/memory/export/accessibility. Recheck postimplementation.

## Project Structure / Decisions
- src/core/benchmark.mjs reuses createGame and shared wander helper, creates200/100 and3fuel100 lamps; stepBenchmark only movement, no normalcore changes.
- src/web/benchmark.mjs collects rAF samples after3s, orbit15s and reports result; adaptive instancing forlarge shade/mote counts in presentation retains normal geometry/shaders/effects.
- scripts/bench.mjs starts own localserver/Chromium, measuresprocess-to-firstframe, waits actualduration, writes metrics/raw samples and exits. Web RSSnull/vsyncfalse documented. scripts/browser-runtime.mjs findsbrowser and isolateschildresources.
- scripts/soak.mjs singleprocess10seedednights,RSS/load/reset, no unbounded retainedstates, optionalGC consistentlyatboundaries; CLI parser rejectsinvaliddata.
- src/shared/leaderboard.mjs purevalidation/sort; scripts/leaderboard-store.mjs atomicdiskstore; scripts/serve.mjs API and exportCLI, isolateddataenv forQA. Browser board/menu/results form, purestatic hosts require the shipped Node server for persistent leaderboard; no second persistence store.
- src/web/settings.mjs purebindings/default/conflicts; input.mjs acceptsbindings whilepreservingunclaimedaliases; main handlescapture/persist/pause and captions/reducedmotion/largefont; CSSallUI18+ at720p.
- tests/phase4.test.mjs, server integration, benchmark formula/scene/RNG tests; scripts/check-phase4.mjs runs prior22cases+soak; realbench separateGPU command; browserQA and extractedpackage smoke.
- scripts/package-release.ps1 stages selfcontaineddist+Node server/sharedstore/README/LICENSE/CREDITS; ZIP+SHA256. scripts/record-demo.mjs Playwrightactualplay+actualproof+benchscene, FFmpegconversionMP4<5min. docs/RETROSPECTIVE.md fourphaseevaluation with unmeasuredcost stated.

## Validation
Unitbefore implementation, then actualbench30s+3warmup and soak10; Linuxclean regression and22casebyteparity; diskreopen/export/name/ties; actualbrowserremap/captions/fonts/reducedmotion/settings/palette. Recordcommands/revision/environment/rawsamples/scenecounts/video metadata, independentlyreview and tagphase4/v1.0.0 onlyafterproof/package. GitHubRelease ownsameorigin, noapprovalneeded under requestedrelease scope.

## Complexity Tracking
Server persistence required byCLIexport; no remote backend/database. Batching is generaladaptive renderer optimization. Build normalgame remains threecommands; browserinstall only bench/demo tooling if nobrowserfound.
