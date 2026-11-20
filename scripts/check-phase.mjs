import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { createGame, step, snapshot } from '../src/core/simulation.mjs';
const dir = process.env.PROOF_DIR || 'docs/proof/phase-1'; mkdirSync(dir, { recursive: true });
const cli = args => { const r = spawnSync(process.execPath, ['src/headless/cli.mjs', ...args], { encoding: 'utf8' }); assert.equal(r.status, 0, r.stderr); };
const results = [];
for (const [scenario, reason, expectedScore] of [['win', 'all_lit', 608], ['hit', 'no_flames', 0], ['dawn', 'dawn', 0]]) {
  const out = `${dir}/${scenario}.jsonl`;
  cli(['--seed', '42', '--night', '1', '--ticks', '60', '--snapshot-every', '1', '--scenario', `tests/scenarios/${scenario}.json`, ...(scenario === 'win' ? ['--inputs', 'tests/scenarios/interact.json'] : []), '--out', out]);
  const rows = readFileSync(out, 'utf8').trim().split('\n').map(JSON.parse);
  assert.equal(rows.filter(r => r.type === 'end').length, 1);
  assert.equal(rows.at(-1).score, expectedScore); assert.equal(rows.at(-1).ticks, 1);
  assert.equal(rows.find(r => r.name === 'game_over').data.reason, reason);
  assert.equal(rows[0].score, 0); assert.equal(rows[0].tick, 0);
  results.push({ scenario, status: 'PASS', reason, score: expectedScore });
}
const contract = JSON.parse(readFileSync('game.contract.json', 'utf8'));
// Generate actual held-key inputs for a complete default game; no scenario shortcuts.
const g = createGame(contract.tuning, 42); const frames = []; let previous = '';
for (let k = 0; k < 10800 && g.state === 'playing'; k++) {
  const distance = p => Math.hypot(p[0] - g.player.pos[0], p[2] - g.player.pos[2]);
  const unlit = g.lanterns.filter(l => !l.lit).sort((a, b) => distance(a.pos) - distance(b.pos));
  const motes = [...g.motes].sort((a, b) => distance(a.pos) - distance(b.pos));
  const target = g.player.carried >= 4 || !motes.length ? unlit[0] : motes[0];
  let dx = target ? target.pos[0] - g.player.pos[0] : 0, dz = target ? target.pos[2] - g.player.pos[2] : 0;
  const d = Math.hypot(dx, dz); if (d > 0) { dx /= d; dz /= d; }
  const danger = g.shades.some(s => s.state !== 'stunned' && distance(s.pos) < 4.5);
  const patch = { move: [dx, dz], cam_yaw_deg: 0, interact: k % 2 === 0, pulse: danger && g.player.carried >= 2 && k % 2 === 0 };
  const encoded = JSON.stringify(patch);
  if (encoded !== previous) { frames.push({ tick: k, ...patch }); previous = encoded; }
  step(g, patch);
}
assert.equal(g.state, 'won', `Default-play route failed: ${g.state}, lit=${g.lanterns.filter(l => l.lit).length}`);
writeFileSync(`${dir}/default-play.inputs.json`, JSON.stringify({ frames }, null, 2) + '\n');
for (const name of ['replay-a', 'replay-b']) cli(['--seed', '42', '--night', '1', '--ticks', '10800', '--inputs', `${dir}/default-play.inputs.json`, '--out', `${dir}/${name}.jsonl`]);
const a = readFileSync(`${dir}/replay-a.jsonl`), b = readFileSync(`${dir}/replay-b.jsonl`);
assert.deepEqual(a, b); const rows = a.toString().trim().split('\n').map(JSON.parse);
assert.equal(rows.at(-1).state, 'won'); assert.equal(rows.at(-1).ticks, g.tick);
assert.equal(rows.at(-1).score, g.score);
results.push({ scenario: 'default-play-and-replay', status: 'PASS', tick: g.tick, score: g.score, flames: g.player.flames, sha256: createHash('sha256').update(a).digest('hex') });
writeFileSync(`${dir}/scenario-results.json`, JSON.stringify({ node: process.version, platform: process.platform, results, finalSnapshot: snapshot(g) }, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));
