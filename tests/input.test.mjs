import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { keyboardInput } from '../src/web/input.mjs';
import { createGame, step } from '../src/core/simulation.mjs';
const t = JSON.parse(readFileSync(new URL('../game.contract.json', import.meta.url))).tuning;
function simulate(code, yaw) {
  const g = createGame(t, 42, { random_motes: false, random_shades: false });
  for (let i = 0; i < 60; i++) step(g, keyboardInput(new Set([code]), yaw));
  return g.player.pos;
}
test('regression: A projects left and D projects right for camera yaw 0/90/180/270', () => {
  for (const yaw of [0, 90, 180, 270]) {
    const angle = yaw * Math.PI / 180;
    const screenRight = [-Math.cos(angle), Math.sin(angle)];
    const a = simulate('KeyA', yaw), d = simulate('KeyD', yaw);
    const project = p => p[0] * screenRight[0] + p[2] * screenRight[1];
    assert.ok(project(a) < -5.99, `A must go screen-left at yaw ${yaw}`);
    assert.ok(project(d) > 5.99, `D must go screen-right at yaw ${yaw}`);
  }
});
test('W/S follow camera depth, arrows match keys and opposing keys cancel', () => {
  for (const yaw of [0, 90, 180, 270]) {
    const w = simulate('KeyW', yaw), s = simulate('KeyS', yaw), angle = yaw * Math.PI / 180;
    const forward = p => p[0] * Math.sin(angle) + p[2] * Math.cos(angle);
    assert.ok(forward(w) > 5.99); assert.ok(forward(s) < -5.99);
    assert.deepEqual(simulate('ArrowLeft', yaw), simulate('KeyA', yaw));
    assert.deepEqual(simulate('ArrowRight', yaw), simulate('KeyD', yaw));
  }
  assert.deepEqual(keyboardInput(new Set(['KeyA', 'KeyD', 'KeyW', 'KeyS']), 0).move, [0, 0]);
});
