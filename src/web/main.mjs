import * as THREE from 'three';
import { createGame, step, snapshot, HZ } from '../core/simulation.mjs';
import { keyboardInput } from './input.mjs';

const $ = id => document.getElementById(id);
const canvas = $('world'); const keys = new Set();
let g, tuning, scene, camera, renderer, playerMesh, ambient, sun;
let mode = 'intro', yaw = 0, accumulator = 0, lastTime = 0, dragging = false;
let pulseAge = 100, hitAge = 100, toastAge = 100, visualTime = 0, facing = 0;
const lanternMeshes = new Map(), moteMeshes = new Map(), shadeMeshes = new Map();
let pulseMesh, motesGroup, shadesGroup;
const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra });
const green = mat(0x31554b), dark = mat(0x162d33), rock = mat(0x344c4d), gold = mat(0x986e3e);
const lightMaterial = () => mat(0xffd390, { emissive: 0xffac3c, emissiveIntensity: 1.6 });
function mesh(geometry, material, parent, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, material); m.position.set(x, y, z); parent.add(m); return m;
}
function sphere(r, material, parent, x, y, z, detail = 1) { return mesh(new THREE.IcosahedronGeometry(r, detail), material, parent, x, y, z); }
function cylinder(r1, r2, h, material, parent, x, y, z, segments = 8) { return mesh(new THREE.CylinderGeometry(r1, r2, h, segments), material, parent, x, y, z); }
function disc(radius, color, parent, opacity = 1) {
  const m = mesh(new THREE.CircleGeometry(radius, 64), new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, side: THREE.DoubleSide, depthWrite: false }), parent);
  m.rotation.x = -Math.PI / 2; return m;
}
function lantern(parent, x, z, small = false) {
  const group = new THREE.Group(); group.position.set(x, 0, z); parent.add(group);
  const scale = small ? 0.2 : 1;
  if (!small) {
    cylinder(0.65, 0.85, 0.28, rock, group, 0, 0.14, 0);
    cylinder(0.12, 0.18, 3.4, gold, group, 0, 1.7, 0);
    const arm = mesh(new THREE.BoxGeometry(1.8, 0.13, 0.14), gold, group, 0.6, 3.25, 0); arm.rotation.z = 0.08;
  }
  const lamp = new THREE.Group(); lamp.position.set(small ? 0 : 1.1, small ? 0 : 2.72, 0); group.add(lamp);
  const body = cylinder(0.4, 0.4, 0.68, mat(0x566b57), lamp, 0, 0, 0, 12);
  cylinder(0.34, 0.34, 0.09, gold, lamp, 0, 0.36, 0, 12);
  cylinder(0.34, 0.34, 0.09, gold, lamp, 0, -0.36, 0, 12);
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; cylinder(0.012, 0.012, 0.65, gold, lamp, Math.sin(a) * 0.4, 0, Math.cos(a) * 0.4); }
  cylinder(0.02, 0.02, 0.3, gold, lamp, 0, -0.55, 0);
  const lampLight = new THREE.PointLight(0xffb65a, small ? 9 : 0, small ? 4 : 12, 1.4);
  lampLight.position.copy(lamp.position); group.add(lampLight);
  if (small) { body.material = lightMaterial(); group.scale.setScalar(scale); }
  const safe = !small ? disc(tuning.safe_radius, 0xf5bf6b, group, 0.075) : null;
  if (safe) { safe.position.y = 0.035; safe.visible = false; }
  return { group, body, light: lampLight, safe };
}
function makePlayer() {
  const group = new THREE.Group(); scene.add(group);
  cylinder(0.35, 0.5, 0.83, mat(0x65a99b), group, 0, 0.75, 0, 7);
  cylinder(0.1, 0.12, 0.36, dark, group, -0.18, 0.17, 0);
  cylinder(0.1, 0.12, 0.36, dark, group, 0.18, 0.17, 0);
  sphere(0.29, mat(0xd8b38c), group, 0, 1.32, 0, 2);
  const hat = cylinder(0, 0.85, 0.43, mat(0xcac09a), group, 0, 1.68, 0, 24); hat.rotation.x = 0.08;
  const arm = mesh(new THREE.BoxGeometry(0.18, 0.58, 0.19), mat(0x5b9c91), group, 0.45, 0.88, 0.08); arm.rotation.z = 0.3;
  const lamp = lantern(group, 0.62, 0.12, true); lamp.group.position.y = 0.5;
  sphere(0.04, dark, group, -0.1, 1.34, 0.257); sphere(0.04, dark, group, 0.1, 1.34, 0.257);
  const shadow = disc(0.65, 0x071d21, scene, 0.28); shadow.position.y = 0.025;
  group.userData.shadow = shadow;
  return group;
}
function makeShade() {
  const group = new THREE.Group(); shadesGroup.add(group);
  const material = mat(0x29213f, { emissive: 0x1a0835, emissiveIntensity: 0.7 });
  const blob = sphere(0.72, material, group, 0, 0.72, 0, 1); blob.scale.set(1, 1.35, 1);
  sphere(0.09, new THREE.MeshBasicMaterial({ color: 0xcbb5e8 }), group, -0.24, 0.92, 0.6);
  sphere(0.09, new THREE.MeshBasicMaterial({ color: 0xcbb5e8 }), group, 0.24, 0.92, 0.6);
  const skirt = cylinder(0.6, 0.95, 0.5, material, group, 0, 0.23, 0, 7); skirt.rotation.y = 0.3;
  group.userData.body = material; return group;
}
function environment() {
  scene.background = new THREE.Color(0x132b3a); scene.fog = new THREE.FogExp2(0x183540, 0.009);
  ambient = new THREE.HemisphereLight(0xb3d8d9, 0x173e35, 1.2); scene.add(ambient);
  sun = new THREE.DirectionalLight(0xaccbd4, 1.7); sun.position.set(-20, 40, -15); scene.add(sun);
  cylinder(tuning.island_radius, tuning.island_radius - 4, 4, rock, scene, 0, -2.1, 0, 64);
  cylinder(tuning.island_radius, tuning.island_radius + 0.3, 0.3, green, scene, 0, -0.15, 0, 64);
  cylinder(22, 12, 9, mat(0x223b40), scene, 0, -8.2, 0, 14);
  // Stable decoration hash: intentionally separate from gameplay RNG.
  const rand = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  for (let i = 0; i < 70; i++) {
    const a = i * Math.PI * 2 / 70, r = tuning.island_radius - 0.7 + rand(i) * 0.7;
    const b = sphere(0.5 + rand(i + 3) * 0.7, rock, scene, Math.sin(a) * r, 0.1, Math.cos(a) * r, 0);
    b.scale.y = 0.7;
  }
  for (let branch = 0; branch < 5; branch++) {
    const a = branch * Math.PI * 2 / 5;
    for (let i = 0; i < 18; i++) {
      const r = 1.2 + i * 0.8; const offset = Math.sin(i * 0.5) * 0.35;
      const pebble = cylinder(0.23 + rand(i + branch) * 0.12, 0.28, 0.04, mat(0x7a8b6c), scene,
        Math.sin(a) * r + Math.cos(a) * offset, 0.025, Math.cos(a) * r - Math.sin(a) * offset, 6);
      pebble.rotation.y = rand(i) * 3;
    }
  }
  for (let i = 0; i < 25; i++) {
    const a = i * 2.399, r = 21 + rand(i + 22) * 4, x = Math.sin(a) * r, z = Math.cos(a) * r;
    const tree = new THREE.Group(); tree.position.set(x, 0, z); scene.add(tree);
    const h = 1.6 + rand(i + 55) * 2;
    cylinder(0.13, 0.2, h, mat(0x64664b), tree, 0, h / 2, 0);
    const leaves = sphere(1.4, mat(i % 3 ? 0x3b7062 : 0x557663), tree, 0, h + 0.65, 0, 0); leaves.scale.y = 1.3;
    sphere(0.8, mat(0x447166), tree, 0.8, h, 0.1, 0);
  }
  for (let i = 0; i < 45; i++) {
    const a = rand(i + 100) * Math.PI * 2, r = 38 + rand(i + 200) * 50;
    const cloud = sphere(4 + rand(i + 300) * 4, mat(0x496574, { transparent: true, opacity: 0.19, depthWrite: false }), scene,
      Math.sin(a) * r, -6 - rand(i + 400) * 4, Math.cos(a) * r, 1);
    cloud.scale.set(2.2, 0.28, 1.1);
  }
  const points = [];
  for (let i = 0; i < 380; i++) { const a = rand(i + 600) * Math.PI * 2; const y = 20 + rand(i + 700) * 90; points.push(Math.sin(a) * 120, y, Math.cos(a) * 120); }
  const stars = new THREE.BufferGeometry(); stars.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: 0xe6dec6, size: 0.17, transparent: true, opacity: 0.8 })));
  sphere(3.5, new THREE.MeshBasicMaterial({ color: 0xf0d9ac }), scene, -48, 45, 60, 3);
  const centre = disc(2, 0x6b8262, scene, 0.15); centre.position.y = 0.02;
  for (let i = 0; i < 5; i++) {
    const l = g.lanterns[i]; const m = lantern(scene, l.pos[0], l.pos[2]); lanternMeshes.set(l.id, m);
  }
  motesGroup = new THREE.Group(); shadesGroup = new THREE.Group(); scene.add(motesGroup, shadesGroup);
  pulseMesh = mesh(new THREE.RingGeometry(0.94, 1, 80), new THREE.MeshBasicMaterial({ color: 0xffcf80, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }), scene);
  pulseMesh.rotation.x = -Math.PI / 2;
}
function disposeGroup(group) {
  group.traverse(m => { if (m.geometry) m.geometry.dispose(); if (m.material) m.material.dispose(); });
  group.removeFromParent();
}
function syncEntities() {
  const active = new Set(g.motes.map(m => m.id));
  for (const [id, m] of moteMeshes) if (!active.has(id)) { disposeGroup(m); moteMeshes.delete(id); }
  for (const m of g.motes) {
    if (!moteMeshes.has(m.id)) {
      const group = new THREE.Group(); sphere(0.13, lightMaterial(), group, 0, 0, 0, 1);
      const halo = sphere(0.28, new THREE.MeshBasicMaterial({ color: 0xffd27d, transparent: true, opacity: 0.12, depthWrite: false }), group, 0, 0, 0);
      halo.scale.y = 0.8; motesGroup.add(group); moteMeshes.set(m.id, group);
    }
    const object = moteMeshes.get(m.id); const phase = Number(m.id.slice(1)) || 0;
    object.position.set(m.pos[0], m.pos[1] + 0.65 + Math.sin(visualTime * 2 + phase) * 0.15, m.pos[2]);
  }
  const ids = new Set(g.shades.map(s => s.id));
  for (const [id, m] of shadeMeshes) if (!ids.has(id)) { disposeGroup(m); shadeMeshes.delete(id); }
  for (const s of g.shades) {
    if (!shadeMeshes.has(s.id)) shadeMeshes.set(s.id, makeShade());
    const m = shadeMeshes.get(s.id); m.position.set(s.pos[0], s.pos[1] + Math.sin(visualTime * 3) * 0.07, s.pos[2]);
    m.rotation.y = Math.atan2(g.player.pos[0] - s.pos[0], g.player.pos[2] - s.pos[2]);
    m.userData.body.color.setHex(s.state === 'stunned' ? 0x79769a : 0x29213f);
    m.rotation.z = s.state === 'stunned' ? Math.sin(visualTime * 9) * 0.15 : 0;
  }
  let lit = 0;
  for (const l of g.lanterns) {
    const m = lanternMeshes.get(l.id); m.group.position.set(l.pos[0], l.pos[1], l.pos[2]);
    m.light.intensity = l.lit ? 24 : 1; m.safe.visible = l.lit;
    m.body.material.color.setHex(l.lit ? 0xffd592 : 0x69705b);
    m.body.material.emissive.setHex(l.lit ? 0xffaf4e : 0x2d3526);
    m.body.material.emissiveIntensity = l.lit ? 1.7 : 0.2;
    if (l.lit) lit++;
  }
  ambient.intensity = 1.2 + lit * 0.18; sun.intensity = 1.7 + lit * 0.1;
  scene.background.setHex(0x132b3a).lerp(new THREE.Color(0x42635c), lit / 12);
}
function toast(text) { $('toast').textContent = text; toastAge = 0; }
function eventsVisual(events) {
  for (const event of events) {
    if (event.name === 'pulse') { pulseAge = 0; pulseMesh.position.set(g.player.pos[0], 0.08, g.player.pos[2]); }
    if (event.name === 'player_hit') { hitAge = 0; toast('Bóng Mực chạm vào Mây. Hãy tìm ánh đèn!'); }
    if (event.name === 'lantern_lit') toast('Một ngọn đèn đã thức giấc.');
    if (event.name === 'mote_picked' && event.data.carried === tuning.carry_capacity) toast('Túi đã đầy. Mang ánh sáng về đèn nhé.');
    if (event.name === 'game_over') finish();
  }
}
function hud() {
  const n = g.lanterns.filter(l => l.lit).length;
  $('carried').textContent = g.player.carried; $('lit').textContent = n; $('score').textContent = g.score;
  $('flames').textContent = '● '.repeat(g.player.flames) + '○ '.repeat(tuning.flames - g.player.flames);
  $('flames').setAttribute('aria-label', `${g.player.flames} trên ${tuning.flames} lửa`);
  const time = Math.ceil(g.time_left_s); $('timer').textContent = `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`;
  $('timer').style.color = time < 30 ? '#f4a88c' : '';
  $('lantern-progress').innerHTML = g.lanterns.map(l => `<span class="${l.lit ? 'on' : ''}" title="${l.id}"></span>`).join('');
  const near = g.lanterns.find(l => !l.lit && Math.hypot(l.pos[0] - g.player.pos[0], l.pos[2] - g.player.pos[2]) <= tuning.interact_radius);
  $('prompt').textContent = near ? (g.player.carried ? `E · Thắp ${near.id} — đã nạp ${near.deposited}/${tuning.lantern_cost}` : 'Cần đom đóm để thắp ngọn đèn này') : '';
}
function start(scenario = {}) {
  g = createGame(tuning, 42, scenario); yaw = 0; facing = 0; accumulator = 0; keys.clear(); pulseAge = hitAge = toastAge = 100;
  mode = 'playing'; document.body.classList.add('playing');
  $('welcome').hidden = true; $('result').hidden = true; $('paused').hidden = true; $('hud').hidden = false;
  $('toast').textContent = ''; hud(); canvas.focus();
}
function finish() {
  mode = 'result'; keys.clear(); $('paused').hidden = true; $('result').hidden = false;
  const won = g.state === 'won'; $('result-kicker').textContent = won ? 'NĂM NGỌN ĐÈN. MỘT ĐÊM ĐƯỢC CỨU.' : 'ĐỐM SÁNG CHƯA BAO GIỜ TẮT HẲN';
  $('result-title').innerHTML = won ? 'Đảo lại<br><em>sáng rồi.</em>' : 'Hẹn một<br><em>đêm khác.</em>';
  $('result-story').textContent = won ? 'Mây đã giữ được ánh sáng cho Đảo Bến. Những chú đom đóm sẽ nhớ đêm này.' : g.reason === 'dawn' ? 'Bình minh đến trước khi năm ngọn đèn thức giấc. Thử một hành trình khác nhé.' : 'Sương đen đã bắt kịp Mây. Giữ lại chút ánh sáng cho lần trở về tiếp theo.';
  $('final-score').textContent = g.score; hud();
}
function pause() { if (mode === 'playing') { mode = 'paused'; keys.clear(); accumulator = 0; $('paused').hidden = false; } }
function resume() { if (mode === 'paused') { mode = 'playing'; accumulator = 0; lastTime = performance.now(); $('paused').hidden = true; canvas.focus(); } }
function input() {
  return keyboardInput(keys, yaw);
}
function animate(now) {
  requestAnimationFrame(animate);
  const dt = lastTime ? (now - lastTime) / 1000 : 0; lastTime = now; visualTime += Math.min(dt, 0.1);
  if (mode === 'playing' && !document.hidden) {
    accumulator += dt; let budget = 600;
    while (accumulator >= 1 / HZ && mode === 'playing' && budget-- > 0) { eventsVisual(step(g, input())); accumulator -= 1 / HZ; }
  }
  pulseAge += dt; hitAge += dt; toastAge += dt;
  pulseMesh.material.opacity = Math.max(0, 1 - pulseAge / 0.7) * 0.8;
  pulseMesh.scale.setScalar(Math.min(1, pulseAge / 0.7) * tuning.pulse_radius);
  $('hit-flash').style.opacity = hitAge < 0.6 ? String(0.7 * (1 - hitAge / 0.6)) : '0';
  $('toast').style.opacity = toastAge < 3 ? '1' : '0';
  syncEntities();
  playerMesh.position.fromArray(g.player.pos);
  if (mode === 'playing') {
    const inp = input(); if (Math.hypot(...inp.move) > 0) facing = Math.atan2(inp.move[0], inp.move[1]) + yaw * Math.PI / 180;
  }
  playerMesh.rotation.y = facing;
  playerMesh.userData.shadow.position.set(g.player.pos[0], 0.025, g.player.pos[2]);
  playerMesh.visible = g.tick >= g.player.invulnUntil || Math.sin(visualTime * 30) > -0.3;
  if (mode === 'intro') { camera.position.set(38, 29, -40); camera.lookAt(3, 0, 2); }
  else {
    const a = yaw * Math.PI / 180; const desired = new THREE.Vector3(g.player.pos[0] - Math.sin(a) * 11, g.player.pos[1] + 8, g.player.pos[2] - Math.cos(a) * 11);
    camera.position.lerp(desired, 1 - Math.exp(-7 * Math.min(dt, 0.1))); camera.lookAt(g.player.pos[0], g.player.pos[1] + 0.7, g.player.pos[2]);
  }
  if (mode !== 'intro') hud(); renderer.render(scene, camera);
}
async function boot() {
  const response = await fetch('/game.contract.json'); if (!response.ok) throw new Error('Không đọc được cấu hình game. Chạy npm run build rồi npm start.');
  tuning = (await response.json()).tuning; g = createGame(tuning, 42);
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;
  scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 250);
  environment(); playerMesh = makePlayer();
  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
  addEventListener('keydown', e => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (e.code === 'Escape') { mode === 'paused' ? resume() : pause(); return; }
    if (mode === 'playing') keys.add(e.code);
  });
  addEventListener('keyup', e => keys.delete(e.code));
  addEventListener('blur', pause); document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  canvas.addEventListener('pointerdown', e => { dragging = true; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (dragging && mode === 'playing') yaw -= e.movementX * 0.3; });
  canvas.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('pointercancel', () => { dragging = false; });
  $('start').onclick = () => start(); $('restart').onclick = () => start(); $('pause').onclick = pause; $('resume').onclick = resume;
  // Explicit validation mode: no test API or scenario injection in normal play.
  if (new URLSearchParams(location.search).has('labtest')) {
    window.__lab = {
      start, pause, resume, snapshot: () => snapshot(g),
      advance: (frames) => { pause(); for (const frame of frames) eventsVisual(step(g, frame)); hud(); return snapshot(g); },
      get mode() { return mode; }, get renderer() { return renderer.info.render; },
    };
  }
  requestAnimationFrame(animate);
}
boot().catch(error => { $('error').hidden = false; $('welcome').hidden = true; $('error-text').textContent = error.message; document.body.classList.add('fatal'); console.error(error); });
