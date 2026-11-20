import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createGame, step, snapshot } from '../src/core/simulation.mjs';
import { validateInputs, validateScenario } from '../src/core/validation.mjs';
const t = JSON.parse(readFileSync(new URL('../game.contract.json', import.meta.url))).tuning;
const empty = { random_motes: false, random_shades: false, motes: [], shades: [] };
const game = (s = {}) => createGame(t, 42, { ...empty, ...s });
const run = (g, n, input = {}) => { const events = []; for (let k = 0; k < n; k++) events.push(...step(g, input)); return events; };
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);

test('tick zero, scenario has no score/events; lantern patch preserves five', () => {
  const g = game({ lanterns: [{ id: 'L1', lit: true, pos: [5, 0, 5] }] });
  assert.equal(g.score, 0); assert.equal(g.tick, 0); assert.equal(g.lanterns.length, 5);
  assert.equal(snapshot(g).lanterns[0].lit, true); assert.equal(snapshot(g).motes_active, 0);
});
test('movement camera yaw, diagonal normalization and held input', () => {
  const g = game(); step(g, { move: [0, 1], cam_yaw_deg: 90 }); run(g, 59);
  near(g.player.pos[0], 6); near(g.player.pos[2], 0); assert.equal(g.tick, 60);
  const d = game(); run(d, 60, { move: [1, 1] }); near(Math.hypot(d.player.pos[0], d.player.pos[2]), 6);
});
test('jump rising edge only, lands, release allows next jump', () => {
  const g = game(); step(g, { jump: true }); assert.ok(g.player.pos[1] > 0);
  run(g, 120); assert.equal(g.player.pos[1], 0);
  step(g, { jump: false }); step(g, { jump: true }); assert.ok(g.player.pos[1] > 0);
});
test('standing exactly on canonical edge is supported', () => {
  const g = game(); run(g, 400, { move: [1, 0] }); near(g.player.pos[0], t.island_radius);
  assert.equal(g.player.flames, t.flames);
});
test('pickup exactly at radius; full bag leaves motes; horizontal distance while jumping', () => {
  const g = game({ motes: [[t.pickup_radius, 0, 0], [t.pickup_radius + 0.001, 0, 0]] });
  const ev = step(g, { jump: true }); assert.equal(g.player.carried, 1); assert.equal(g.motes.length, 1);
  assert.deepEqual(ev.filter(e => e.name === 'mote_picked')[0].data, { carried: 1 });
  const full = game({ player: { carried: 10 }, motes: [[0, 0, 0]] }); step(full); assert.equal(full.motes.length, 1);
});
test('partial deposit retained, hold interact does not retrigger, lit once', () => {
  const g = game({ player: { carried: 2 }, lanterns: [{ id: 'L1', pos: [0, 0, 2] }] });
  step(g, { interact: true }); assert.equal(g.lanterns[0].deposited, 2); assert.equal(g.player.carried, 0);
  g.player.carried = 10; step(g); assert.equal(g.lanterns[0].deposited, 2);
  step(g, { interact: false }); const ev = step(g, { interact: true });
  assert.deepEqual(ev.map(e => e.name), ['deposit', 'lantern_lit']);
  assert.equal(g.player.carried, 2); assert.equal(g.score, 150);
  step(g, { interact: false }); assert.equal(step(g, { interact: true }).find(e=>e.name==='refuel').data.amount, 1);
});
test('shades chase, contact hit once per immunity and drop half the motes', () => {
  const g = game({ player: { carried: 3 }, shades: [{ id: 'S1', pos: [0, 0, 0] }, { pos: [0, 0, 0] }] });
  const ev = step(g); assert.equal(ev.filter(e => e.name === 'player_hit').length, 1);
  assert.equal(g.player.flames, 2); assert.equal(g.player.carried, 2);
  run(g, 89); assert.equal(g.player.flames, 2); step(g); assert.equal(g.player.flames, 1);
  const chase = game({ shades: [{ pos: [10, 0, 0] }] }); step(chase); near(chase.shades[0].pos[0], 10 - 4/60);
});
test('safe light blocks shade movement including shade placed inside safety', () => {
  const g = game({ lanterns: [{ id: 'L1', pos: [0, 0, 0], lit: true }], shades: [{ pos: [0, 0, 0] }] });
  run(g, 60); assert.equal(g.player.flames, 3);
  assert.ok(Math.hypot(g.shades[0].pos[0], g.shades[0].pos[2]) >= t.safe_radius - 1e-8);
});
test('pulse consumes exact cost, stuns/pushes, no retrigger while held, cooldown', () => {
  const g = game({ player: { carried: 8 }, shades: [{ id: 'ink', pos: [2, 0, 0] }] });
  const ev = step(g, { pulse: true }); assert.equal(g.player.carried, 5);
  assert.deepEqual(ev.find(e => e.name === 'pulse').data, { stunned_ids: ['ink'] });
  assert.equal(g.shades[0].state, 'stunned'); near(g.shades[0].pos[0], 2 + 4/15); assert.equal(g.score, 5);
  step(g, { pulse: false }); step(g, { pulse: true }); assert.equal(g.player.carried, 5);
  run(g, 180); assert.equal(g.shades[0].state, 'chase');
});
test('pulse insufficient and outside radius leave enemy unaffected; zero direction finite', () => {
  const g = game({ player: { carried: 1 }, shades: [{ pos: [2, 0, 0] }] });
  assert.equal(step(g, { pulse: true }).some(e => e.name === 'pulse'), false); assert.equal(g.player.carried, 1);
  const z = game({ player: { carried: 3 }, shades: [{ pos: [0, 0, 0] }, { pos: [6, 0, 0] }] });
  step(z, { pulse: true }); assert.ok(z.shades[0].pos.every(Number.isFinite)); assert.equal(z.shades[1].state, 'chase');
});
test('dawn fuel bonus exact once, terminal freezes; enough lights at deadline', () => {
  const g = game({ player: { carried: 10 }, time_left_s: 1 / 60, lanterns: Array.from({ length: 5 }, (_, i) => ({ id: `L${i + 1}`, lit: i > 0, pos: [0, 0, 0] })) });
  const ev = step(g, { interact: true }); assert.equal(g.state, 'won'); assert.equal(g.score, 150 + 150 + 4*149 + 150);
  assert.deepEqual(ev.at(-1).data, { result: 'won', reason: 'dawn_survived' });
  assert.equal(step(g).length, 0); assert.equal(g.tick, 1); assert.equal(g.score, 150 + 150 + 4*149 + 150);
});
test('no_flames and dawn losses', () => {
  const g = game({ player: { flames: 1 }, shades: [{ pos: [0, 0, 0] }] });
  assert.equal(step(g).at(-1).data.reason, 'no_flames');
  const d = game({ time_left_s: 1 / 60 }); assert.equal(step(d).at(-1).data.reason, 'dawn');
});
test('seed replay and reset create identical snapshots', () => {
  const a = createGame(t, 7); const b = createGame(t, 7);
  run(a, 200, { move: [0.4, 0.6] }); run(b, 200, { move: [0.4, 0.6] });
  assert.deepEqual(snapshot(a), snapshot(b)); assert.deepEqual(snapshot(game()), snapshot(game()));
});
test('input/schema rejects invalid types, duplicate ticks, NaN, unknown lanterns', () => {
  for (const value of [{ frames: [{ tick: 0, move: [2, 0] }] }, { frames: [{ tick: 1 }, { tick: 1 }] }, { frames: [{ tick: 0, jump: 1 }] }, { frames: [{ tick: -1 }] }]) assert.throws(() => validateInputs(value, t));
  for (const value of [{ player: { pos: [NaN, 0, 0] } }, { lanterns: [{ id: 'L6' }] }, { player: { carried: 11 } }, { shades: [{ id: 'S1', pos: [0, 0, 0] }, { id: 'S1', pos: [0, 0, 0] }] }]) assert.throws(() => validateScenario(value, t));
  assert.doesNotThrow(() => validateInputs({ frames: [{ tick: 0, jump: true }, { tick: 1, jump: false }] }, t));
});
test('deposit outside radius fails, tie chooses L1, full scenario deposit becomes lit', () => {
  const g = game({ player: { carried: 8 }, lanterns: [{ id: 'L1', pos: [0, 0, 2.001] }] });
  step(g, { interact: true }); assert.equal(g.player.carried, 8);
  const tie = game({ player: { carried: 10 }, lanterns: [{ id: 'L1', pos: [1, 0, 0] }, { id: 'L2', pos: [-1, 0, 0] }] });
  step(tie, { interact: true }); assert.equal(tie.lanterns[0].lit, true); assert.equal(tie.lanterns[1].lit, false);
  assert.equal(game({ lanterns: [{ id: 'L1', deposited: 10 }] }).lanterns[0].lit, true);
});
test('pulse inclusive radius and positive cooldown boundary', () => {
  const g = game({ player: { carried: 8, invuln_ticks:1000 }, shades: [{ id: 'edge', pos: [5, 0, 0] }, { id: 'outside', pos: [5.001, 0, 0] }] });
  const ev = step(g, { pulse: true }); assert.deepEqual(ev.find(e => e.name === 'pulse').data.stunned_ids, ['edge']);
  step(g, { pulse: false }); run(g, 178); const later = step(g, { pulse: true });
  assert.equal(later.some(e => e.name === 'pulse'), true); assert.equal(g.player.carried, 2);
});
test('safe-radius inclusive protects player; just outside can be hit', () => {
  const safe = game({ player: { pos: [6, 0, 0] }, lanterns: [{ id: 'L1', lit: true, pos: [0, 0, 0] }], shades: [{ pos: [6.1, 0, 0] }] });
  step(safe); assert.equal(safe.player.flames, 3);
  const unsafe = game({ player: { pos: [6.001, 0, 0] }, lanterns: [{ id: 'L1', lit: true, pos: [0, 0, 0] }], shades: [{ pos: [6.1, 0, 0] }] });
  step(unsafe); assert.equal(unsafe.player.flames, 2);
});
test('random spawn flags and generated IDs stay deterministic without collisions', () => {
  const off = game(); run(off, 1081); assert.equal(off.motes.length, 0); assert.equal(off.shades.length, 0);
  const on = createGame(t, 9, { random_motes: true, random_shades: true, motes: [], shades: [{ id: 'S1', pos: [25, 0, 0] }], player: { pos: [0, 0, 0] }, lanterns: [{ id: 'L1', lit: true, pos: [0, 0, 0] }] });
  const ev = run(on, 1080); assert.ok(on.motes.length > 0); assert.equal(on.shades.length, 4);
  assert.equal(new Set(on.shades.map(s => s.id)).size, 4); assert.ok(ev.some(e => e.name === 'shade_spawned'));
});
test('scenario time override follows exact elapsed formula and coordinates alone round', () => {
  const g = game({ time_left_s: 300, player: { pos: [0.12345, 0, 0] } }); step(g);
  assert.equal(snapshot(g).time_left_s, 300 - 1 / 60); assert.equal(snapshot(g).player.pos[0], 0.123);
});
test('regression: overlapping safe circles must exclude shades from their entire union', () => {
  const g = game({ player: { pos: [10, 0, 0] }, lanterns: [{ id: 'L1', pos: [0, 0, 0], lit: true }, { id: 'L2', pos: [5, 0, 0], lit: true }], shades: [{ pos: [2.5, 0, 0] }] });
  step(g);
  for (const l of g.lanterns.filter(l => l.lit)) assert.ok(Math.hypot(g.shades[0].pos[0] - l.pos[0], g.shades[0].pos[2] - l.pos[2]) >= t.safe_radius);
});
