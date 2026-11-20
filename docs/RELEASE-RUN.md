# Đảo Đèn Lồng 1.0.0

Extract ZIP, install Node.js 22+, open a terminal in this folder:

```sh
node scripts/serve.mjs
```

Open http://localhost:4173 in Chrome/Edge/Firefox with WebGL2. No npm install,
Internet or external assets needed. Keep the whole folder together.
Windows and Linux verified; macOS not tested. Keyboard/mouse, 1280×720 recommended.

WASD/arrows move, mouse drag rotates camera, Space jump, Shift dash, E interact,
Q pulse, Esc/P pause. Settings allow all nine actions to be remapped, reduced motion,
large text, volume, sensitivity and distinguishable colors.

Keep at least 3/5, 4/6, 5/7 lamps lit at dawn across three nights. Refuel lamps;
fuel at least 30 creates safety. Loss/final dawn allows a name and local top-ten score.
Board is stored in `.data/leaderboard.json`; preserve it between launches.

```sh
node scripts/serve.mjs --export-leaderboard out.json
```

Source, tests, headless, benchmark and soak tooling are in the public repository:
https://github.com/nbquang04/K5-L3A-DAY12-NguyenBaQuang-2A202603555-AI-SDLC-Dao-Den-Long
See its README and phase4 proof for measurement details and limitations.
