# Đảo Đèn Lồng v1.0.0

Three-night 3D game with shared deterministic headless core, fuel/refuel/drain,
local disk leaderboard, remappable controls and accessibility settings.

Download `dao-den-long-v1.0.0.zip`, extract, install Node.js22+, run
`node scripts/serve.mjs`, then open http://localhost:4173. No npm install/CDN needed.
Instructions, LICENSE and credits are included. `demo.mp4` is62.48seconds of real
keyboard play and actual test/headless/benchmark evidence.

Verified:61Windows/Linux tests,22replay scenarios with byte parity,32retained browser
checks plus6release groups, extractedpackage HTTP/API/CLIexport. Benchmark locally:
99.23avgFPS/56.35p1low/3.57sload; soak10nights0crashes/RSS+5.02% with documented
public Node flags. Raw outputs and reproducible commands are committed.

Browser-controlled vsync remains enabled; web renderer RSS unavailable (null).
Instructor hardware/hidden tests unavailable; macOS and human game-feel acceptance
not claimed. See docs/proof/phase-4/report.md and docs/RETROSPECTIVE.md.
