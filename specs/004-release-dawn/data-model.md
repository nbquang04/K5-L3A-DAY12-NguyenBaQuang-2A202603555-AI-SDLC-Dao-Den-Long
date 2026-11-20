# Data Model
Benchmark: seed safeinteger,durationpositive,scene200shadeswander/100motes/3litfuel100/playerorigin; samples finitepositivems, warmup3, orbit15. Metrics avg/p1/p95/framecount/load/nonnegative; RSSnullable,vsyncboolean,renderer/osstrings.
Soak: baseSeed safeinteger,nightspositiveinteger; results lengthnights, crashesnonnegative; RSSstart/endMBpositive, durationnonnegative; seedindex0-based. Hold currentstateonly.
LeaderboardEntry: name regex^[A-Za-z0-9_]{3,12}$, score nonnegativesafeinteger, nights_won integer0..3, achieved_at validISOtimezone, seed safeinteger. List≤10 sortedscoredesc/timeasc stable. Disk schema{entries:[...]}; corruptdataerrorpreservesfile.
Settings.bindings exactly9action→KeyboardEvent.code strings, uniqueprimaries; reducedMotion/largeText/colorblind booleans; volume0..1,sensitivity.05..1. Invalidstoredvaluesnormalize todefaults. Caption queue bounded andexpires; leaderboard submitonceperattempt, scoreonlywonlevels.
Release metadata:version1.0.0,source revision,artifactsha256,video duration<300s,bench/soak actualoutputreferences.
