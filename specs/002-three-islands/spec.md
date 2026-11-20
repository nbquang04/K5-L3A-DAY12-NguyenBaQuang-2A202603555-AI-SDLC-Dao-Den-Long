# Feature Specification: Three Nights — Ticket-02

**Feature Branch**: main; feature directory specs/002-three-islands
**Created**: 2026-11-20
**Status**: Specified
**Input**: Ship Phase 2 quickly after tagging Phase 1; released Ticket-02 and Test Contract 1.1.

## User Scenarios & Testing

### User Story 1 — Standard controls and maps (Priority: P1)
Mây explores the three canonical islands, jumps, dashes, uses ramps and launch pads, and recovers after falling.
Why: consistent controls and traversable terrain are the foundation.
Independent test: isolated movement/terrain/dash/fall scenarios on each night.
Acceptance: movement 6 m/s, jump 7/gravity20, dash14 for12 ticks with90-tick cooldown; airborne dash holds height; canonical map positions/radii from source; falling below -10 loses one flame/all carried, respawns after60 ticks with90 invulnerability; no repeat fall hit while waiting.

### User Story 2 — Light and enemies (Priority: P1)
Collect and deposit light, avoid enemies, defend with pulse and safe lanterns.
Independent test: pickup/deposit/pulse/contact/spawn scenarios.
Acceptance: capacity10, pickup XZ1 and height1.5; cost10, retained partial deposits; +10 per deposited mote, +100 lamp, +5 shade pulse, win time/flame bonuses; pulse cost3/radius3D5/cooldown180/stun120/push4 over15ticks; safe6 blocks shades; canonical shade state machine, spawn schedules, hit/recoil/drop/TTL rules; no_flames wins precedence over all_lit, then dawn.

### User Story 3 — New threats and powerup (Priority: P1)
Gió Lạc steals light; pulse can recover it; Bùa Gió boosts run/dash; night3 has wind.
Independent test: drifter state/steal/drop, charm pickup/expiry/respawn, wind schedule scenarios.
Acceptance: exact Ticket-02 Part3 states, ranges, speed, one theft, flee/expiry; charm600ticks run7.2 no dash cooldown, respawn2700; wind each1800 ticks for300, preview120ticks, push2m/s.

### User Story 4 — Three-night journey and presentation (Priority: P1)
Menu → night intro with Ông Đăng → play → result → next night; final Bình Minh shows total of won nights; retry current night on loss.
Independent test: inject terminal fixtures for each night and exercise actual UI transitions.
Acceptance: pause Esc/P stops simulation with resume/retry/settings/menu; volume/mouse sensitivity persist across reload; background music and all ten listed event sounds; HUD slots/cooldowns/offscreen target arrow, mm:ss red flashing at ≤30s; canonical colors within10%; ambient0.15+0.55lit/total.

### User Story 5 — Contract and delivery (Priority: P1)
Run all three nights headlessly and replay outputs without a GPU.
Independent test: CLI subprocesses and browser parity, Linux clean build.
Acceptance: contract1.1, --night1/2/3, required extended snapshots/scenarios/events, pause advances tick but freezes sim_tick/timers/spawns, all base protocol regression; ≤30s for21600ticks, normal browser ≥30FPS average at1280×720; one scenario per new feature, proof, updated agent guidance and phase-2 tag.

### Edge Cases
Input fields persist; jump/interact/pulse/dash/pause rising edges. A dash press during dash is ignored. Charm refreshes. New spawns cannot interact until next tick. Dropped motes collectible next tick, expire480ticks. Spawn skips when no legal position. Tie lamps/enemy contacts by stable ID. Terrain walls block ascent, descending can land on lower surface; tower solid. No deaths caused by drifters. Paused terminal timers remain frozen.

## Requirements

- **FR-001**: All canonical numerical rules and exact tick pipeline in source Part1.
- **FR-002**: All canonical maps, terrain, pads, wind and spawn points in source Part2.
- **FR-003**: Gió Lạc lifecycle, stealing and pulse recovery from Part3.1.
- **FR-004**: Bùa Gió pickup, refresh, speed/dash and respawn from Part3.2.
- **FR-005**: Three-night journey and total won-night score from Part3.3.
- **FR-006**: Pause/settings persistence from Part3.4–5.
- **FR-007**: Audio, complete HUD, palette and ambient from Part3.6–8.
- **FR-008**: Exact Test Contract1.1 additions and base protocol regression.
- **FR-009**: Scenarios/tests, Linux/parity, measured headless/FPS, proof and phase-2 delivery.

### Key Entities
Session: tick/sim_tick/night/state/wind/score; Player: pos/vel/grounded/invuln/cooldowns/charm; Lantern; Mote random/dropped with TTL; Shade spawning/wander/chase/recoil/stunned; Drifter idle/chase/flee/stolen; Charm available/respawn; Campaign won-night scores; Settings volume/sensitivity.

## Success Criteria

- **SC-001**: All three nights have canonical terrain, can end/retry/advance through final dawn screen.
- **SC-002**: Each new gameplay feature has an asserting headless scenario, surviving base rules regressions pass.
- **SC-003**: Same inputs produce byte-identical outputs in two processes and Windows/Linux; malformed data returns2.
- **SC-004**: A21600tick headless run finishes ≤30s;1280×720 normal-play measured average≥30FPS.
- **SC-005**: All mandatory behavior has real proof, updated docs and tagged delivery with explicit limitations.

## Assumptions
Full authoritative source is docs/requirements/phase-2-source.ax.txt; requirements.md records changed rules/tests. Do not copy the entire ticket here.
Unspecified durations: shade spawning1tick; wander2m/s deterministic seeded direction; idle drifter deterministic wandering. Snapshot random mote ttl_s=0, absent charm positions resolved by ID. Scenario accepts optional drifter state_ticks_left/stolen and charm available/respawn_ticks; validated strictly. night_start emitted on first nonpaused simulation tick (never during scenario construction). Shade pos represents ground anchor; pulse tests shade center pos+0.8. These choices are documented defaults, not extra claimed ticket text.

Night3 start/respawn is (0,0,-30), on ground clear of the central tower; Ticket-02 only explicitly fixes Night1 start. This is a documented layout choice for unspecified starts.
