# ADR003 — Replace permanent lights and immediate victory

2026-11-20. Accepted. Source: released Ticket03 / Test Contract1.2.

Permanentbooleanlights andall_lit completion ended tension early. Lantern state now includes integerfuelUnits,ever_lit andrelit_count. Store60unitsperfuel; step2aggregates passive+allcurrentdrainers,thenout beforeanyinputinteraction. This removes repeatedfloatdrift and shadeiterationdependence. Outputroundingneverchangesrules.

An offlamp remembershistory; firstcost10,relight5; a litlamp acceptsrefuel to100. Successful actual lightingincrementsplayerhistoryandcapacity,scenarioinitdoesnot. Query currentcapacity andsafecondition through sharedcorehelpers.

Victory onlyatdawnwithalive+ceil(.6*n)lit; no_flames alwayslosesfirst. Endbonuslit/fuel/flames replacesoldtimebonus. UI/campaign usecoreterminal result withoutindependentwinlogic.

Drainstep2 uses beginningstates/targets andXZ≤2; a playerarrivinglater canstopnexttickdrain. Reportspercontinuous60actualdrainingticks chosenbecause sourcecadence isnotmoreprecise; pausefreezes. Roundscenariofuelnearest1/60unit;littruefuel0visibleatinitthenoutfirststep;offfuel0;ever_lit normalizedtrueiflit. Defaults documented,notclaimedextrasourcetext.

Consequences: replaceimmediate-win/score/capacity/saferegions tests perrequirements.md; retainphysics/drifter/charm/wind/CLIedge/replay regressions. Preservephase2tag/proof unchanged. AddADR/changelog andrealtests/review/browserproofbeforephase3tag.
