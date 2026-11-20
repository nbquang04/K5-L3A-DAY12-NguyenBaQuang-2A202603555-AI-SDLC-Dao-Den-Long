# Replaced rules and test impact

Source Ticket-03/contract1.2, released2026-11-20. Phase2 proof/tag preserved.

| Old | New | Tests |
|---|---|---|
| Lit refuses deposit | Refuel100 max;10fuel/mote; first10/relight5 | core partial/full selection, phase3 fuel cases |
| Permanent safe lights | Passive1/s; weak<30 no safe, drain5/s/shade | safety/AI/new drain scenarios |
| all_lit immediate win;300/330/360s | dawn240/270/300s,3/4/5 threshold | terminal/core/phase2 winfixtures/browser totals |
| Capacity10 |10+2*successful_lights cap20 | pickupcapacity/schema/HUD |
| Deposit10/light100/stun5/time/flames | Deposit5/first100/relight40/drainpulse15/dawnfuel+lamps/flames | score assertions |
| Shade wander random | nearest weak or unlit lamp | wander/safety regression |
| Palette defaultonly | persisted toggle, cyaneyes/warningswhite+symbol, torncollapsed lamps | browservisual/settings |

Unchanged: maps/physics/dash/fall, drift/charm/wind, normalizedcamera input, jumpedges, latch/pause/tick, ID/spawn/replay/schemaerror. No silent skips; update affected expected values fromticket. Prior proof is historical, never rewritten.
