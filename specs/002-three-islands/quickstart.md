# Validation quickstart

npm ci → npm run build → npm start, open localhost:4173.
npm test; node scripts/check-phase2.mjs; python scripts/verify.py --config verification/checks.json.
CLI: node src/headless/cli.mjs --night 2 --seed 42 --ticks 21600 --out artifacts/night2.jsonl.
Expected: one end, extended snapshots, repeat byte parity, exit0, ≤30s. Malformed scenario exit2/stderr.
Browser: play three-night flow, Shift dash, Esc/P pause, settings persisted on reload, camera WASD including fixed A/D. Measure FPS1280×720; use test-only fixture bridge for terminal states, not as proof of a human full playthrough.
