# Quickstart
Game: npm ci; npm run build; npm start. localhost4173.
Test: npm test; npm run verify; python scripts/verify.py --config verification/checks.json.
Benchmark: node scripts/bench.mjs --seed42 --duration30 --out bench.json (flags require spaces: --seed 42 --duration 30).
Soak: node --expose-gc scripts/soak.mjs --seed 7 --nights 10 --out soak.json.
Leaderboard: npm start -- --export-leaderboard artifacts/leaderboard.json.
Browserbench needs installedChrome/Edge or npx playwright install chromium. Headedrequiresdisplay; Linuxdesktop orXvfb. Vsyncbrowser-managed; RSSnull documented.
Release ZIP contains localdist and dependency-freeNode server. Extract then node scripts/serve.mjs. Persistentdata under.data, retainedbetween launches.
