# Feature Specification: Lantern Fuel — Ticket-03

**Feature Branch**: main; directory specs/003-lantern-fuel
**Created**:2026-11-20
**Status**: Specified
**Input**: Continue Phase3; released Ticket-03/Test Contract1.2, captured docs/requirements/phase-3-source.ax.txt.

## User Scenarios & Testing

### User Story1 — Maintain lanterns (Priority:P1)
As Mây I keep lit lanterns fueled and relight extinguished lanterns.
Why: the new central resource loop.
Independent test: fuel decay/refuel/out/partial relight scenarios.
Acceptance: max100, every active simulation tick decay1/60; first/relight fuel100. Lit lamps accept min(carried,ceil((100-fuel)/10)); full lamps excluded, no event/score for zero use. Nearest eligible inXZ2, ID tie. Atzero extinguish, deposited0, ever_lit stays; first cost10, relight5, partial progress preserved. Display fuel bars, low<30 blinks1Hz; unlit visibly20% collapsed with torn paper.

### User Story2 — Protect weak lanterns (Priority:P1)
Shades can approach and drain weak lights; refueling/pulse defends them.
Independent test: wander/chase/drain transitions and stacked drain/safe-boundary scenarios.
Acceptance: safe radius only when lit fuel≥30 (exact30 safe). Wander chooses nearest weak lit, otherwise nearest unlit lamp; chase retains player target. WithinXZ2 enter drain. Drain5/second each plus passive1, applying at step2. Fromdrain chase if player≤6, stunned on pulse, wander if lampout/refueled≥30/distance>2. Recovery fromstun goeswander. Refuel to≥30 ejects nearby shades≤30ticks without damage during ejection. Pulse scores15 total for previously-draining shade, otherwise5.

### User Story3 — Survive until dawn (Priority:P1)
No early win. Survive240/270/300seconds with≥ceil(.6*count) lit at final tick:3/5,4/6,5/7.
Independent test: all lit beforedawn keepsplaying; threshold/damage/out/refuel at exactfinaltick.
Acceptance: no_flames always loses first; atdawn alive+threshold wins reason dawn_survived, belowthreshold losesdawn. Final check after all tick updates. Win bonus perlitlamp50+floor(fuel) and50/flame, no timebonus. Campaign/retry totals remain.

### User Story4 — Grow capacity and new score (Priority:P1)
Each actual successful lighting, including relight, increases capacity by2 from10 up to20, reset eachnight.
Independent test: firstlight/relight/partial/refuel/scenario-init and scoreexact assertions.
Acceptance: successful_lights excludes scenario-lit lamps; scenario explicit successful_lights controls capacity. Pickup uses currentcapacity, HUD carried/capacity. +5/deposited/refueled mote; +100 firstlight or40relight; pulse5or15; dawn bonuses onlyonwin. No pickupscore or previous timebonus.

### User Story5 — Distinguishable palette (Priority:P1)
Settings option “Bảng màu dễ phân biệt” persists after reload.
Independent test: actual settings toggle and reload; material/UI visual assertions.
Acceptance: shade edges/eyes #00B3FF instead of#7A3CFF; UI warning #FFFFFF plus⚠ instead of#FF5A5F. Lit/unlit state distinguishable without color through collapsed/torn lamps; lowfuel blink unchanged. Setting never changes core/headless output.

### User Story6 — Replay and delivery (Priority:P1)
Headless contract1.2 exposes fuel/history/capacity/drain and events, with prior unsuperseded laws intact.
Independent test: CLI scenarios, negative data, byte replay/browser/Linux parity.
Acceptance: snapshot fuel1decimal (unlit0), ever_lit, relit_count; player.capacity; shade drain state. Scenario lantern lit/fuel/ever_lit, defaultlitfuel100; player.successful_lights; shade.target_lantern_id. Events refuel{lantern_id,amount,fuel}, lantern_out{id via lantern_id}, fuel_drain{lantern_id,shade_id,fuel} onceeach60simticks draining; lantern_lit addsrelightboolean; game_over dawn_survived replacesall_lit. ADR and breaking-change changelog, updated tests withreasons, actual evidence/tagphase-3.

### Edge Cases
Fuel update occursstep2 before movement/pickup/interact/safe/pulse/AI/contact/spawn/terminal. Expired lamp can relight in samefinaltick. Pause freezes fuel/drain and counters. Newlyentered drain begins consuming onnexttick; snapshot0 scenario no events/score/capacity gains. Exact30 threshold evaluated after tickdecay. Integer1/60fuelunits avoid repeatedfloat subtraction. Multiple drainers aggregate before out; invalid target cannot drain. Relight count counts actual relights, scenario construction0. Full lamp may decay before interaction and become eligible thattick. Tests for full-exclusion use fuel_decay0 unitfixture to isolate selection, not change normalrules.

## Requirements
- **FR-001**: Integer fuel state/decay/refuel/out/relight and selection per source section1.
- **FR-002**: Weak safety and shade drain lifecycle/stacking/pulse/ejection persection2.
- **FR-003**: Dawn-only victory/newdurations/finaltickpriority persection3.
- **FR-004**: Dynamiccapacity successful_lights persection4.
- **FR-005**: Replace scoreformula persection5.
- **FR-006**: Persisted accessible palette and noncolorlampstatus persection6.
- **FR-007**: Exact1.2 protocol/scenario/events persection7; retain unaffected1.1 requirements.
- **FR-008**: ADR, changelog, changed-test table, regressions/proof/review/tag.

### Key Entities
Lantern: fuel, lit, deposited, ever_lit, relit_count. Player: successful_lights, capacity. Shade: drain, target_lantern_id, reporting counter. Settings: distinguishable palette boolean. Existing map/physics/drifter/charm/campaign retained.

## Success Criteria
- **SC-001**: Firstlight→decay→weak/drain→out→relight/refuel demonstrable through realstate/events/UI.
- **SC-002**: Allthree final thresholds/early-no-win/finaltickpriority asserted, previous unsuperseded tests pass.
- **SC-003**: Same inputs byte-identical Windows/Linux; browser snapshot parity; malformedscenario exit2.
- **SC-004**: Fuel/HUD/accessibility/persistence visibly verified, performance remains≥30FPS1280×720 andheadless≤30seconds.
- **SC-005**: All required changed laws traced inADR/changelog/testtable and verified beforetag.

## Assumptions
Fuel scenario decimals mapped to nearest integer1/60 unit; display/eventfuel rounded1decimal. fuel_drain cadence uses each shade's continuous drain participation60ticks, frozenpaused/resetwhenleaving. Drainstep2 uses states/targets fromstartoftick; transitions later do not retroactively cancel thattick's charge. Explicit scenario ever_litfalse withlittrue normalizestrue; unlitfuel normalizes0. Partial deposited atcost normalizeslighting withoutscore/historycountergain. relit_count scenario starts0 because ticketdoesnot permit overridingit. These clarify unspecified details ratherthan claiming additional source text.
