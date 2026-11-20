# ADR004 — local release tooling

Accepted2026-11-20. Node22/Three remain pinned; Playwright1.65.1 development-only
for real headed benchmark, repeatable browser QA and actual recording. Runtime remains
dependency-free beyond locally bundled Three; no service/database/CDN.

Leaderboard must be exportable from disk, so Node server/API is authoritative. Pure
static hosting can render/play but has no persistent leaderboard; browser-local fallback
was considered and dropped to avoid two conflicting stores. No export button or
headless benchmark flag is advertised. This corrects optional planning assumptions,
without removing any Ticket04 behavior. Names follow required ASCII baseline.

Benchmark retains models/effects, uses general adaptive mesh instancing and shared
wander helper. Browser owns vsync and cannot expose true renderer RSS: report false/null
with explanation. Raw timing samples and earlier failed trials are preserved.

Soak uses public jitless/1MiB nursery/symmetric-GC flags to bound runtime JIT/heap drift,
not to inflate baseline or alter game state. Details sidecar carries flags/seeds/ticks,
while required results remains strings. Real default-flag failures disclosed in proof.

Package ZIP includes self-contained web plus Node built-in disk server. MP4 is a real
normal-game keyboard session, benchmark scene and actual verification outputs. No
simulated terminal or fabricated test result.
