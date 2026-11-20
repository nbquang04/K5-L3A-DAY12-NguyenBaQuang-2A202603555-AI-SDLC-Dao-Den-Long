# Contract1.2
Retain1.1 protocol except Ticket03changes. game.contract.json addsfuel_max100,fuel_decay_per_s1,fuel_per_mote10,relight_cost5,win_ratio.6,drain_per_s5,low_fuel_threshold30,capacity_max20; durations240/270/300.
Snapshots: lantern addsfuel rounded1decimal (off0),ever_lit,relit_count; player.capacity; shade.state drain allowed. Scenario lanternfuel0..100/ever_litboolean; player.successful_lights integer≥0 determinesvalidationcapacity; shades.target_lantern_id mustbelampinthisnight. No relit_countoverride.
Newevents refuel{lantern_id,amount,fuel},lantern_out{lantern_id},fuel_drain{lantern_id,shade_id,fuel}; lantern_lit{lantern_id,relight:boolean}; game_overwon reason dawn_survived; noall_lit.
Fuel/drain applystep2,drainreportsaftereach60actualcontinuousparticipating simticks per shade; pausedfreezes. Ifdueandoutthisstep,drainreportfuel0 precedesout. night_start timing unchanged. Scenarioinitnoevents/score/capacitygains. Input/CLI/errorcodesunchanged; malformeddata2stderr.
