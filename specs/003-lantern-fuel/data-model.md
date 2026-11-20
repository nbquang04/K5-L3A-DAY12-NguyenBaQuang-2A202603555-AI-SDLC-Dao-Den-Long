# Data model
Lantern.fuelUnits integer0..6000; lit boolean; deposited integer0..currentcost; ever_lit boolean; relit_count integer≥0. Scenario construction setsrelit_count0, doesnotincrease successful_lights orscore. Littrue impliesever_lit; out setsfuel/deposited0 andkeepshistory.
Player.successful_lights integer≥0; capacity computedmin(capacity_max,carry_capacity+2*successful_lights); carried0..capacity. Session night duration240/270/300; stateplaying/paused/won/lost; onlydawncanwin.
Shade.state includesdrain; target_lantern_id optionalvalidnightlamp; drainTicks countsconsecutiveactualstep2participation0..59, resetwhenleavingdrain; all otherfieldsretained.
Settings.colorblind boolean persistent; never enters core or CLIinput.
