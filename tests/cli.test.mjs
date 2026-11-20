import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = new URL('../', import.meta.url);
const execute = (args) => spawnSync(process.execPath, ['src/headless/cli.mjs', ...args], { cwd: root, encoding: 'utf8' });
const fixture = (fn) => { const dir = mkdtempSync(join(tmpdir(), 'lantern-')); try { fn(dir); } finally { rmSync(dir, { recursive: true, force: true }); } };
test('CLI N steps, snapshot zero + interval, exactly one end; two processes identical', () => fixture(dir => {
  const scenario = join(dir, 's.json'); writeFileSync(scenario, JSON.stringify({ random_motes: false, random_shades: false, motes: [], shades: [] }));
  let previous;
  for (const name of ['a', 'b']) {
    const out = join(dir, name + '.jsonl'); const r = execute(['--seed', '42', '--night', '1', '--ticks', '21', '--snapshot-every', '10', '--scenario', scenario, '--out', out]);
    assert.equal(r.status, 0, r.stderr); assert.equal(r.stdout, '');
    const raw = readFileSync(out); if (previous) assert.deepEqual(raw, previous); previous = raw;
    const lines = raw.toString().trim().split('\n').map(JSON.parse);
    assert.deepEqual(lines.filter(x => x.type === 'snapshot').map(x => x.tick), [0, 10, 20]);
    assert.deepEqual(lines.at(-1), { type: 'end', ticks: 21, state: 'playing', score: 0 });
  }
}));
test('tick 0 run and input k -> event k+1; inputs persist', () => fixture(dir => {
  const scenario = join(dir, 's.json'); const inputs = join(dir, 'i.json'); const out = join(dir, 'out.jsonl');
  writeFileSync(scenario, JSON.stringify({ random_motes: false, random_shades: false, shades: [], motes: [[0, 0, 0]] }));
  writeFileSync(inputs, JSON.stringify({ frames: [{ tick: 0, move: [1, 0] }] }));
  let r = execute(['--night', '1', '--ticks', '0', '--scenario', scenario, '--out', out]); assert.equal(r.status, 0, r.stderr);
  assert.equal(readFileSync(out, 'utf8').trim().split('\n').length, 2);
  r = execute(['--night', '1', '--ticks', '10', '--scenario', scenario, '--inputs', inputs, '--out', out]); assert.equal(r.status, 0, r.stderr);
  const rows = readFileSync(out, 'utf8').trim().split('\n').map(JSON.parse);
  assert.equal(rows[0].player.carried, 0); assert.equal(rows.find(x => x.type === 'event').tick, 1);
  assert.equal(rows.filter(x => x.type === 'snapshot').at(-1).player.pos[0], 1);
}));
test('invalid JSON/schema/CLI return nonzero, data errors 2 and stderr', () => fixture(dir => {
  const p = join(dir, 'bad.json'); const out = join(dir, 'o.jsonl');
  for (const data of ['{', JSON.stringify({ frames: [{ tick: 0, pulse: 'yes' }] })]) {
    writeFileSync(p, data); const r = execute(['--night', '1', '--ticks', '2', '--inputs', p, '--out', out]);
    assert.equal(r.status, 2); assert.ok(r.stderr.length); assert.equal(r.stdout, '');
  }
  writeFileSync(p, JSON.stringify({ lanterns: [{ id: 'invalid' }] }));
  assert.equal(execute(['--night', '1', '--ticks', '2', '--scenario', p, '--out', out]).status, 2);
  assert.notEqual(execute(['--night', '2', '--ticks', '1', '--out', out]).status, 0);
}));
