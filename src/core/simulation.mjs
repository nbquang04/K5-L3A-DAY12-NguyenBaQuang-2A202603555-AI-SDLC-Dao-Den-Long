import { validateInputPatch, validateScenario } from './validation.mjs';
export const HZ = 60;
const distance = (a, b) => Math.hypot(a[0] - b[0], a[2] - b[2]);
const inside = (a, b, r) => distance(a, b) <= r;
const ticks = seconds => Math.round(seconds * HZ);
const initialInput = () => ({ move: [0, 0], cam_yaw_deg: 0, jump: false, interact: false, pulse: false, dash: false });
function random(g) {
  let x = g.rng >>> 0; x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  g.rng = x >>> 0; return g.rng / 4294967296;
}
function spawnPos(g, min = 4, max = g.t.island_radius - 2) {
  const a = random(g) * Math.PI * 2; const r = min + random(g) * (max - min);
  return [Math.sin(a) * r, 0, Math.cos(a) * r];
}
function addMote(g, pos) { g.motes.push({ id: `M${g.nextMote++}`, pos: [...pos] }); }
function addShade(g, pos, id) {
  if (!id) { do { id = `S${g.nextShade++}`; } while (g.reservedShades.has(id)); }
  g.reservedShades.add(id);
  const shade = { id, pos: [...pos], state: 'chase', stunUntil: 0 };
  g.shades.push(shade); return shade;
}
export function createGame(tuning, seed = 42, scenario = {}) {
  validateScenario(scenario, tuning);
  const t = structuredClone(tuning);
  const g = {
    t, tick: 0, rng: (seed >>> 0) || 0x6d2b79f5, seed,
    state: 'playing', score: 0, time_left_s: scenario.time_left_s ?? t.night1_duration_s,
    startTime: scenario.time_left_s ?? t.night1_duration_s,
    player: { pos: [0, 0, 0], vy: 0, carried: 0, flames: t.flames, invulnUntil: 0, pulseReady: 0 },
    input: initialInput(), motes: [], shades: [], lanterns: [], nextMote: 1, nextShade: 1,
    reservedShades: new Set((scenario.shades ?? []).filter(s => s.id).map(s => s.id)),
    random_motes: scenario.random_motes ?? true, random_shades: scenario.random_shades ?? true,
  };
  if (scenario.player) Object.assign(g.player, structuredClone(scenario.player));
  for (let i = 0; i < 5; i++) {
    const angle = i * Math.PI * 2 / 5;
    g.lanterns.push({ id: `L${i + 1}`, pos: [Math.sin(angle) * 16, 0, Math.cos(angle) * 16], lit: false, deposited: 0 });
  }
  for (const patch of scenario.lanterns ?? []) {
    const lantern = g.lanterns.find(l => l.id === patch.id); Object.assign(lantern, structuredClone(patch));
    if (lantern.lit) lantern.deposited = t.lantern_cost;
    if (lantern.deposited === t.lantern_cost) lantern.lit = true;
  }
  if (scenario.motes) scenario.motes.forEach(pos => addMote(g, pos));
  else if (g.random_motes) {
    // Seeded trails from the centre to each lantern, with gentle sideways variation.
    for (let i = 0; i < t.initial_motes; i++) {
      const a = (i % 5) * Math.PI * 2 / 5; const r = 3 + Math.floor(i / 5) * 1.7;
      const side = (random(g) - 0.5) * 1.4;
      addMote(g, [Math.sin(a) * r + Math.cos(a) * side, 0, Math.cos(a) * r - Math.sin(a) * side]);
    }
  }
  if (scenario.shades) scenario.shades.forEach(s => addShade(g, s.pos, s.id));
  else if (g.random_shades) for (let i = 0; i < t.initial_shades; i++) addShade(g, spawnPos(g, 23, 26));
  return g;
}
function outsideSafety(g, pos) {
  const circles = g.lanterns.filter(l => l.lit);
  const clear = p => circles.every(l => distance(p, l.pos) >= g.t.safe_radius);
  if (clear(pos)) return pos;
  const r = g.t.safe_radius + 1e-7, candidates = [];
  // Closest point outside a union is on an exposed arc or a circle intersection.
  // Enlarge candidate circles slightly to avoid projecting back inside due to FP.
  for (const l of circles) {
    const d = distance(pos, l.pos);
    candidates.push([l.pos[0] + (d > 1e-12 ? (pos[0] - l.pos[0]) / d : 1) * r,
      pos[1], l.pos[2] + (d > 1e-12 ? (pos[2] - l.pos[2]) / d : 0) * r]);
  }
  for (let i = 0; i < circles.length; i++) for (let j = i + 1; j < circles.length; j++) {
    const a = circles[i].pos, b = circles[j].pos, d = distance(a, b);
    if (d <= 1e-12 || d > 2 * r) continue;
    const mx = (a[0] + b[0]) / 2, mz = (a[2] + b[2]) / 2;
    const h = Math.sqrt(Math.max(0, r * r - d * d / 4));
    const nx = -(b[2] - a[2]) / d, nz = (b[0] - a[0]) / d;
    candidates.push([mx + nx * h, pos[1], mz + nz * h], [mx - nx * h, pos[1], mz - nz * h]);
  }
  const valid = candidates.filter(clear).sort((a, b) => distance(a, pos) - distance(b, pos));
  return valid[0] ?? [Math.max(...circles.map(l => l.pos[0] + r)) + 1, pos[1], pos[2]];
}
export function step(g, patch = {}) {
  if (g.state !== 'playing') return [];
  validateInputPatch(patch);
  const prev = g.input; const input = { ...prev, ...patch }; g.input = input;
  const edge = key => input[key] && !prev[key]; const t = g.t; const p = g.player;
  g.tick++; g.time_left_s = Math.max(0, g.startTime - g.tick / HZ);
  const events = []; const event = (name, data) => events.push({ type: 'event', tick: g.tick, name, data });
  let [mx, mz] = input.move; const length = Math.hypot(mx, mz);
  if (length > 1) { mx /= length; mz /= length; }
  const a = (input.cam_yaw_deg % 360) * Math.PI / 180;
  p.pos[0] += (mx * Math.cos(a) + mz * Math.sin(a)) * t.player_speed / HZ;
  p.pos[2] += (-mx * Math.sin(a) + mz * Math.cos(a)) * t.player_speed / HZ;
  const r = Math.hypot(p.pos[0], p.pos[2]);
  if (r > t.island_radius) { p.pos[0] *= t.island_radius / r; p.pos[2] *= t.island_radius / r; }
  if (edge('jump') && p.pos[1] <= 0) p.vy = t.jump_speed;
  if (p.pos[1] > 0 || p.vy > 0) {
    p.pos[1] += p.vy / HZ; p.vy -= t.gravity / HZ;
    if (p.pos[1] <= 0) { p.pos[1] = 0; p.vy = 0; }
  }
  g.motes = g.motes.filter(m => {
    if (p.carried < t.carry_capacity && inside(p.pos, m.pos, t.pickup_radius)) {
      p.carried++; g.score += t.score.per_mote; event('mote_picked', { carried: p.carried }); return false;
    }
    return true;
  });
  if (edge('interact') && p.carried > 0) {
    const targets = g.lanterns.filter(l => !l.lit && inside(p.pos, l.pos, t.interact_radius))
      .sort((a, b) => distance(p.pos, a.pos) - distance(p.pos, b.pos) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const l = targets[0];
    if (l) {
      const amount = Math.min(p.carried, t.lantern_cost - l.deposited);
      if (amount > 0) {
        l.deposited += amount; p.carried -= amount;
        event('deposit', { lantern_id: l.id, amount, deposited: l.deposited });
        if (l.deposited === t.lantern_cost) { l.lit = true; g.score += t.score.per_lantern; event('lantern_lit', { lantern_id: l.id }); }
      }
    }
  }
  if (edge('pulse') && p.carried >= t.pulse_cost && g.tick >= p.pulseReady) {
    p.carried -= t.pulse_cost; p.pulseReady = g.tick + ticks(t.pulse_cooldown_s);
    const stunned_ids = [];
    for (const s of g.shades) if (inside(p.pos, s.pos, t.pulse_radius)) {
      const d = distance(p.pos, s.pos); const dx = d > 1e-12 ? (s.pos[0] - p.pos[0]) / d : 1;
      const dz = d > 1e-12 ? (s.pos[2] - p.pos[2]) / d : 0;
      s.pos[0] += dx * t.pulse_push_m; s.pos[2] += dz * t.pulse_push_m;
      s.state = 'stunned'; s.stunUntil = g.tick + ticks(t.pulse_stun_s); stunned_ids.push(s.id);
      g.score += t.score.per_stun;
    }
    event('pulse', { stunned_ids });
  }
  if (g.random_motes && g.motes.length < t.max_motes && g.tick % ticks(t.mote_spawn_interval_s) === 0) addMote(g, spawnPos(g));
  if (g.random_shades && g.shades.length < t.max_shades && g.tick % ticks(t.shade_spawn_interval_s) === 0) {
    const s = addShade(g, spawnPos(g, 23, 26)); event('shade_spawned', { id: s.id });
  }
  const safe = g.lanterns.some(l => l.lit && inside(p.pos, l.pos, t.safe_radius));
  for (const s of g.shades) {
    if (s.state === 'stunned' && g.tick >= s.stunUntil) s.state = 'chase';
    if (s.state === 'chase') {
      const d = distance(s.pos, p.pos);
      if (d > 1e-12) {
        const amount = Math.min(d, t.shade_speed / HZ);
        s.pos[0] += (p.pos[0] - s.pos[0]) / d * amount;
        s.pos[2] += (p.pos[2] - s.pos[2]) / d * amount;
      }
    }
    s.pos = outsideSafety(g, s.pos);
    if (!safe && s.state !== 'stunned' && p.flames > 0 && g.tick >= p.invulnUntil && inside(p.pos, s.pos, t.shade_hit_radius)) {
      p.flames--; p.invulnUntil = g.tick + ticks(t.invuln_s);
      const dropped = Math.floor(p.carried * t.hit_drop_ratio); p.carried -= dropped;
      event('player_hit', { by: 'shade', flames: p.flames, dropped });
    }
  }
  let reason;
  if (g.lanterns.every(l => l.lit)) { g.state = 'won'; reason = 'all_lit'; }
  else if (p.flames === 0) { g.state = 'lost'; reason = 'no_flames'; }
  else if (g.time_left_s <= 0) { g.state = 'lost'; reason = 'dawn'; }
  if (reason) {
    g.reason = reason;
    if (g.state === 'won') g.score += Math.floor(g.time_left_s) * t.score.per_second_left + p.flames * t.score.per_flame_left;
    event('game_over', { result: g.state, reason });
  }
  return events;
}
const round = v => { const n = Math.round(v * 1000) / 1000; return Object.is(n, -0) ? 0 : n; };
const pos = p => p.map(round);
export function snapshot(g) {
  return {
    type: 'snapshot', tick: g.tick, sim_tick: g.tick, state: g.state,
    time_left_s: g.time_left_s, score: g.score,
    player: { pos: pos(g.player.pos), flames: g.player.flames, carried: g.player.carried },
    lanterns: g.lanterns.map(l => ({ id: l.id, pos: pos(l.pos), lit: l.lit, deposited: l.deposited })),
    shades: g.shades.map(s => ({ id: s.id, pos: pos(s.pos), state: s.state })),
    motes_active: g.motes.length, motes: g.motes.map(m => ({ id: m.id, pos: pos(m.pos) })),
  };
}
