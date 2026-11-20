# Implementation Plan: Lantern Fuel

2026-11-20; main; specs/003-lantern-fuel/spec.md.

## Summary / Technical Context
Reuse Node22 ESmodules/Three.js0.181.2, no dependencies. Shared pure simulation remains sole authority; integerfuelunits(60/fuel) preserve deterministic ticks. UI reads helpers/snapshots forbars/capacity/safety. Retain ≥30FPS1280x720 and headless≤30seconds. Linux Docker/node:test/Orca browser proof.

## Constitution Check
I/VIII sourcecaptured and rulechangetable; II/IX sharedcore/helpers; III integerfuel/replay; IV/X testsbefore and actualevidence; V Phase3only; VI preserve harness/proof; VII/XI Linux/browser/review/license/tag. No exception. Research agent reviewed fuel/tickmodel; repeat check postimplementation.

## Project Structure
src/core/simulation.mjs: fuel helpers/state, step2 drain/decay/out, dynamiccapacity, interact/relight, AI drain, dawnscore/end.
src/core/validation.mjs:1.2 additions and nightdependent IDs/capacity.
src/web/main.mjs/style.css/index.html: fuelbars,1Hzlowblink,collapsed/torn lamps,capacity/thresholdHUD, palettecheckbox/localStorage/shadeeyes/warnings.
game.contract.json:1.2 standardtuning; tests/phase3.test.mjs and updatedcore/phase2tests; scripts/check-phase3.mjs/browser-check-phase3.mjs plus phase2 harness remainsusableforregression. Linux/manifest phase3proof. docs/adr/003-lantern-fuel.md and CHANGELOG.md breakingchanges.

## Design
Lantern.fuelUnits integer0..6000; ever_lit/relit_count persist across out; constructionnotcounted. Helper capacity(g), isSafeLantern(g,l), lightingCost(g,l) used bycore/UI; no duplicate gameplayrules.
Step2 aggregates valid start-of-tick drainers before decay and out; decrement1+5*nunits. fuel_drain cadence continuous participating60ticks per shade; leaving resets. Roundingonlyserialization1decimal. Interactivefullskip afterdecay. Drain transition later setsnextticktarget; playerwithin6 triggerschase; pulsebonus readspriorstate. Ejectionimmediatewithin30 bound suppresseshit.
Terminal: no_flames, thenonlyatdawn threshold; bonusfuel/lit/flame. Noearlyexit. Settingsaffectpresentationonly. LampsbodyYscale.8off andblacktear mesh; fuelbar topbackground/fill; lowblink1Hz acrosslight/bar. Defaultpurpleeyes corrected; accessiblecyan/warningwhite+symbol. Saveboolean safely.

## Validation
Tests exactfuel arithmetic,refuelroundup/fullskip,partialrelight/history/capacity,drainstack/transitions/safety/pulse,cadence/pause,finaltick/noearlywin/score. Existingphysics/CLIregressionremain. CLIscenario andbrowserparity, Linuxbytes, actualpalette/persistence/lampgeometry/screenshots/FPS. Independentreview thenproof/tag. No hidden-testclaim.

## Complexity Tracking
No newengine/backend/stateframework; modify current model and sharedhelpers only.
