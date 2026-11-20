# Ticket-02 traceability

Source: docs/requirements/phase-2-source.ax.txt and phase-2-source.txt, read from released artifact on 2026-11-20. Contract 1.1 supersedes chosen Phase 1 tuning. Full numeric/map rules in that source are normative; no Phase 3 scope.

| Old rule | New rule | Tests affected |
|---|---|---|
| 8 capacity, 4 per lantern, pickup 1.2 XZ only | 10, 10, radius 1 plus height 1.5 | pickup/deposit/CLI fixtures |
| Score on pickup | +10 per deposited mote | score/win assertions |
| 180 seconds, radius28 blocked edge | 300/330/360 seconds, precise maps, fall/respawn | movement/time/fall |
| pulse2/stun3/cooldown1/push2 instant | pulse3/stun2/cooldown3/push4 over15 ticks, 3D | pulse tests |
| chase3/hit0.8/invuln2/no drop/safe3 | state machine4/4.5, hit1+height, invuln90/drop half/safe6 | enemy/hit/safe |
| all_lit before no_flames | no_flames before all_lit before dawn | terminal precedence |
| sim_tick=tick | pause advances tick only | replay/snapshot |

Unchanged regression: deterministic seed, JSONL one end, input latch/edges, normalized diagonals, camera-relative input, partial deposits, invalid data exit2. Phase 1 tag retains original suite/proof. Tests replaced for changed rules must use the new contract expectations, never actual-output-derived expectations.
