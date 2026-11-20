# Changelog

## Phase4 - v1.0.0 / Contract1.3
- Real headed benchmark, canonical scene, shared wander, instanced rendering and raw timing samples.
- Ten-night same-process soak with RSS/GC boundary evidence.
- Atomic disk top10 leaderboard/export and won-night totals.
- Nine remappable keys, captions/edge arrow, reduced motion and18px/large UI.
- Runnable ZIP, MP4 demo, retrospective and release verification.

## Phase1 - Contract1.0
- Shared deterministic core, third-person island, pickup/deposit/pulse/shades, HUD/retry and JSONL.
- Fixed screen-space A/D adapter with regression.

## Phase2 - Contract1.1
- Three-night campaign, canonical maps, dash/pads/fall, wind, drifters and charms.
- Procedural audio, pause/settings, Linux replay parity and browser regression.


## Phase3 — Contract1.2 (breaking changes)
- Lanterns consume fuel; lit lamps accept refuel, weak lamps lose safety and can be drained. Out lamps retain ever_lit; relightcost5 replacesfirstcost10 afterfirstlight.
- No immediate all_lit victory. Dawn240/270/300seconds requires3/5,4/6,5/7lit andalive; wonreason dawn_survived replacesall_lit.
- Capacity grows10→20 fromactual lightingcount. Scenario successful_lights supports setupwithoutfakeevents.
- Score replaced:5/motedeposit/refuel,100first/40relight,5pulse/15drainpulse; win50+floorfuelperlitlamp plus50/flame; notimebonus.
- Protocol addsfuel/history/capacity/drain/scenariofields andevents. Oldschemas andchangedexpectedvalues mustbeupdated; no silenttestskip.
- Persisted distinguishable palette; cyan shadeeyes/edges, white⚠warnings; noncolorlampstatus.

Unchangedphysics/maps/drifters/charms/wind/pause/baseCLI retained. See specs/003-lantern-fuel/requirements.md for affectedtestmapping and docs/adr/003-lantern-fuel.md forstate/tickdecision.
