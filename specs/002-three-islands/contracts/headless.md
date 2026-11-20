# Contract1.1 adapter

Base1.0 schema/CLI remains; --night accepts1/2/3. Exact additions: night, wind{active,dir_deg}; player vel/grounded/invuln/dash_cd_s/pulse_cd_s/charm_s; motes{id,pos,kind,ttl_s}, drifters{id,pos,state,stolen}, charms{id,available,respawn_s}. Invuln is boolean, random ttl_s=0. Numeric coordinates/vel round3; time/counters seconds exact.
Input pause/dash are rising-edge and latched. Paused steps advance tick only, snapshot state paused; resume step immediately simulates. Exactly one end; terminal stops early.
Scenario player adds invuln_ticks,dash_cd_ticks,pulse_cd_ticks,charm_ticks; shades state/state_ticks_left; drifters{id?,pos,state?,stolen?,state_ticks_left?}; charms{id,pos?,available?,respawn_ticks?}; random_drifters/wind_enabled booleans. Arrays replace default. Unknown keys/error types return2/stderr. Night-dependent lamp IDs validated.
New events exact ticket names/data. player_hit fall adds lost (all lost carried). night_start first simulation step; no event from construction. This timing and unspecified scenario defaults are project choices pending any future clarification, not claimed literal ticket schema.
