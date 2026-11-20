# Data model

Session has night1–3, tick, sim_tick, state playing/paused/won/lost, seed/RNG, score/time counters, wind active/dir_deg, map, arrays. Only core mutates gameplay.
Player pos/vel finite3vectors; grounded boolean; flames0–3/carried0–10 integers; invuln/dashCd/pulseCd/charm/respawn/dashLeft counters nonnegative; facing normalizedXZ; launch velocity optional.
Mote id unique, pos ground anchor, kind random/dropped, ttl/born. Shade id/pos/state five contract states, stateLeft/pushLeft/pushDir. Drifter id/pos/idle|chase|flee, stolen0–3, stateLeft, born. Charm id/pos/available/respawn.
Lantern ids L1..L5/6/7 map-dependent, deposited0..10, lit implies10. Scenario patches lamps byID, replaces entity arrays including empty arrays; no points/events on construction.
Invariant: terminal assigned once, one damage per tick, paused counters frozen; new/dropped entities only interact after birth tick.
