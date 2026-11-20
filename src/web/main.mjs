import * as THREE from 'three';
import { createGame, step, snapshot, HZ, capacity, lightingCost, isSafeLantern } from '../core/simulation.mjs';
import { keyboardInput } from './input.mjs';
import { mapFor } from '../core/maps.mjs';
import { GameAudio } from './audio.mjs';
import { installReleaseUI } from './release-ui.mjs';
import { pressed } from './settings.mjs';
import { createBenchmark, stepBenchmark } from '../core/benchmark.mjs';
import { benchmarkSession } from './benchmark.mjs';
import { ModelInstances } from './instances.mjs';
let shadeBatch,moteBatch;
const benchmarkParams=new URLSearchParams(location.search);let benchmark;

const $ = id => document.getElementById(id);
const canvas = $('world'); const keys = new Set();
let g, tuning, scene, camera, renderer, playerMesh, ambient, sun;
let mode = 'intro', yaw = 0, accumulator = 0, lastTime = 0, dragging = false;
let pulseAge = 100, hitAge = 100, toastAge = 100, visualTime = 0, facing = 0;
const lanternMeshes = new Map(), moteMeshes = new Map(), shadeMeshes = new Map();
let pulseMesh, motesGroup, shadesGroup;
let currentNight=1, wonScores=[null,null,null], settingsReturn='menu', lastCountdown=-1, releaseUI;
let settings={volume:.35,sensitivity:.3,colorblind:false};
try {settings={...settings,...JSON.parse(localStorage.getItem('dao-settings')||'{}')};}catch{}
settings.volume=Math.min(1,Math.max(0,Number(settings.volume)||0));settings.sensitivity=Math.min(1,Math.max(.05,Number(settings.sensitivity)||.3));
settings.colorblind=settings.colorblind===true;
const audio=new GameAudio(settings.volume), drifterMeshes=new Map(), charmMeshes=new Map();
let fpsSamples=[],lastWindWarning=false;
const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra });
const green = mat(0x2f5d50), dark = mat(0x162d33), rock = mat(0xc9b48a), gold = mat(0x6b4a2f);
const lightMaterial = () => mat(0xfff6c2, { emissive: 0xffe58a, emissiveIntensity: 1.6 });
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
  const body = cylinder(0.4, 0.4, 0.68, mat(0x5b5f6e), lamp, 0, 0, 0, 12);
  cylinder(0.34, 0.34, 0.09, gold, lamp, 0, 0.36, 0, 12);
  cylinder(0.34, 0.34, 0.09, gold, lamp, 0, -0.36, 0, 12);
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; cylinder(0.012, 0.012, 0.65, gold, lamp, Math.sin(a) * 0.4, 0, Math.cos(a) * 0.4); }
  cylinder(0.02, 0.02, 0.3, gold, lamp, 0, -0.55, 0);
  const lampLight = new THREE.PointLight(0xffb65a, small ? 9 : 0, small ? 4 : 12, 1.4);
  lampLight.position.copy(lamp.position); group.add(lampLight);
  if (small) { body.material = lightMaterial(); group.scale.setScalar(scale); }
  const safe = !small ? disc(tuning.safe_radius, 0xf5bf6b, group, 0.075) : null;
  if (safe) { safe.position.y = 0.035; safe.visible = false; }
  let fuelBar, fuelFill, tear;
  if(!small){
    fuelBar=mesh(new THREE.PlaneGeometry(1.7,.17),new THREE.MeshBasicMaterial({color:0x0e1430,side:THREE.DoubleSide}),group,0,4.05,0);
    fuelFill=mesh(new THREE.PlaneGeometry(1.6,.1),new THREE.MeshBasicMaterial({color:0xffb347,side:THREE.DoubleSide}),group,0,4.05,.015);
    const tearShape=new THREE.Shape();tearShape.moveTo(-.05,.25);tearShape.lineTo(.07,.1);tearShape.lineTo(-.02,.02);tearShape.lineTo(.1,-.14);tearShape.lineTo(.01,-.27);tearShape.lineTo(-.04,-.1);tearShape.lineTo(-.12,.04);tearShape.lineTo(-.04,.12);tearShape.closePath();
    tear=mesh(new THREE.ShapeGeometry(tearShape),new THREE.MeshBasicMaterial({color:0x0e1430,side:THREE.DoubleSide}),lamp,.08,0,.405);tear.rotation.z=.25;
    group.userData.kind='lantern';group.userData.body=body;group.userData.fuelBar=fuelBar;group.userData.tear=tear;
  }
  return { group, body, light: lampLight, safe, fuelBar, fuelFill, tear };
}
function makePlayer() {
  const group = new THREE.Group(); scene.add(group);
  cylinder(0.35, 0.5, 0.83, mat(0xe8e2d0), group, 0, 0.75, 0, 7);
  const scarf=mesh(new THREE.BoxGeometry(.62,.13,.4),mat(0xc8102e),group,0,1.08,0);
  cylinder(0.1, 0.12, 0.36, dark, group, -0.18, 0.17, 0);
  cylinder(0.1, 0.12, 0.36, dark, group, 0.18, 0.17, 0);
  sphere(0.29, mat(0xd8b38c), group, 0, 1.32, 0, 2);
  const hat = cylinder(0, 0.85, 0.43, mat(0xcac09a), group, 0, 1.68, 0, 24); hat.rotation.x = 0.08;
  const arm = mesh(new THREE.BoxGeometry(0.18, 0.58, 0.19), mat(0xe8e2d0), group, 0.45, 0.88, 0.08); arm.rotation.z = 0.3;
  const lamp = lantern(group, 0.62, 0.12, true); lamp.group.position.y = 0.5;
  sphere(0.04, dark, group, -0.1, 1.34, 0.257); sphere(0.04, dark, group, 0.1, 1.34, 0.257);
  const shadow = disc(0.65, 0x071d21, scene, 0.28); shadow.position.y = 0.025;
  group.userData.shadow = shadow;
  return group;
}
function makeShade() {
  const group = new THREE.Group(); shadesGroup.add(group);
  const material = mat(0x120a1a, { emissive: 0x7a3cff, emissiveIntensity: 0.18 });
  const blob = sphere(0.72, material, group, 0, 0.72, 0, 1); blob.scale.set(1, 1.35, 1);
  const eyes=new THREE.MeshBasicMaterial({color:settings.colorblind?0x00b3ff:0x7a3cff});
  sphere(0.09, eyes, group, -0.24, 0.92, 0.6);
  sphere(0.09, eyes, group, 0.24, 0.92, 0.6);
  const skirt = cylinder(0.6, 0.95, 0.5, material, group, 0, 0.23, 0, 7); skirt.rotation.y = 0.3;
  const outline=mesh(new THREE.IcosahedronGeometry(.78,1),new THREE.MeshBasicMaterial({color:settings.colorblind?0x00b3ff:0x7a3cff,wireframe:true,transparent:true,opacity:.45}),group,0,.72,0);outline.scale.y=1.35;
  group.userData.body = material;group.userData.eyes=eyes;group.userData.outline=outline.material;group.userData.kind='shade'; return group;
}
function environment() {
  scene.background = new THREE.Color(0x0e1430); scene.fog = new THREE.FogExp2(0x1b2350, 0.006);
  ambient = new THREE.HemisphereLight(0xb3d8d9, 0x173e35, .15); scene.add(ambient);
  sun = new THREE.DirectionalLight(0xaccbd4, 1.7); sun.position.set(-20, 40, -15); scene.add(sun);
  for(const [cx,cz] of g.map.centres){const r=g.map.radius;cylinder(r,r-4,4,rock,scene,cx,-2.1,cz,64);cylinder(r,r,.3,green,scene,cx,-.15,cz,64);cylinder(r*.8,r*.3,9,mat(0x12384a),scene,cx,-8.2,cz,16);}
  if(g.night===2){mesh(new THREE.BoxGeometry(18,.25,4),gold,scene,35,-.125,0);for(let x=26;x<=44;x+=.6)mesh(new THREE.BoxGeometry(.1,.05,4),mat(0xc9b48a),scene,x,.025,0);}
  if(g.night===3){
    const terrace=mesh(new THREE.RingGeometry(12,24,64,1,Math.PI,Math.PI),green,scene,0,3,0);terrace.rotation.x=-Math.PI/2;
    for(const r of [12,24]){const wall=mesh(new THREE.CylinderGeometry(r,r,3,64,1,true,-Math.PI/2,Math.PI),rock,scene,0,1.5,0);wall.material.side=THREE.DoubleSide;}
    cylinder(8,8,6,rock,scene,0,3,0,64);const top=disc(8,0x2f5d50,scene);top.position.y=6.01;
    cylinder(2,2,8,gold,scene,0,10,0,20);sphere(1.2,mat(0xf2c14e),scene,0,13,0,2);
    for(const deg of [30,150]){const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a),verts=[];for(const [u,v,y]of [[30,-1.5,0],[30,1.5,0],[24,1.5,3],[30,-1.5,0],[24,1.5,3],[24,-1.5,3]])verts.push(u*c-v*s,y+.015,u*s+v*c);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.computeVertexNormals();mesh(geo,mat(0xc9b48a,{side:THREE.DoubleSide}),scene);}
  }
  for(const pad of g.map.pads){const d=disc(1,0xf2c14e,scene);d.position.set(pad.pos[0],pad.pos[1]+.04,pad.pos[2]);const ring=mesh(new THREE.TorusGeometry(.8,.08,6,24),mat(0xc8102e),scene,pad.pos[0],pad.pos[1]+.1,pad.pos[2]);ring.rotation.x=Math.PI/2;}
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
    const cloud = sphere(4 + rand(i + 300) * 4, mat(0x12384a, { transparent: true, opacity: 0.19, depthWrite: false }), scene,
      Math.sin(a) * r, -6 - rand(i + 400) * 4, Math.cos(a) * r, 1);
    cloud.scale.set(2.2, 0.28, 1.1);
  }
  const points = [];
  for (let i = 0; i < 380; i++) { const a = rand(i + 600) * Math.PI * 2; const y = 20 + rand(i + 700) * 90; points.push(Math.sin(a) * 120, y, Math.cos(a) * 120); }
  const stars = new THREE.BufferGeometry(); stars.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: 0xe6dec6, size: 0.17, transparent: true, opacity: 0.8 })));
  sphere(3.5, new THREE.MeshBasicMaterial({ color: 0xf0d9ac }), scene, -48, 45, 60, 3);
  const centre = disc(2, 0x6b8262, scene, 0.15); centre.position.y = 0.02;
  for (let i = 0; i < g.lanterns.length; i++) {
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
  if(moteBatch&&g.motes.length>moteBatch.parts[0].mesh.instanceMatrix.count){moteBatch.dispose();moteBatch=null;}
  if(shadeBatch&&g.shades.length>shadeBatch.parts[0].mesh.instanceMatrix.count){shadeBatch.dispose();shadeBatch=null;}
  if(g.motes.length>50&&!moteBatch){const model=new THREE.Group();sphere(.13,lightMaterial(),model,0,0,0,1);const halo=sphere(.28,new THREE.MeshBasicMaterial({color:0xffd27d,transparent:true,opacity:.12,depthWrite:false}),model,0,0,0);halo.scale.y=.8;moteBatch=new ModelInstances(model,motesGroup,g.motes.length);}
  if(g.shades.length>32&&!shadeBatch)shadeBatch=new ModelInstances(makeShade(),shadesGroup,g.shades.length);
  if(moteBatch&&moteMeshes.size){for(const m of moteMeshes.values())disposeGroup(m);moteMeshes.clear();}
  if(shadeBatch&&shadeMeshes.size){for(const m of shadeMeshes.values())disposeGroup(m);shadeMeshes.clear();}
  if(moteBatch)moteBatch.update(g.motes,(o,m)=>o.position.set(m.pos[0],m.pos[1]+.65+Math.sin(visualTime*2+Number(m.id.slice(1)))*.15,m.pos[2]));
  if(shadeBatch)shadeBatch.update(g.shades,(o,s)=>{o.position.set(s.pos[0],s.pos[1]+Math.sin(visualTime*3)*.07,s.pos[2]);o.rotation.y=Math.atan2(g.player.pos[0]-s.pos[0],g.player.pos[2]-s.pos[2]);});
  const active = new Set(g.motes.map(m => m.id));
  for (const [id, m] of moteMeshes) if (!active.has(id)) { disposeGroup(m); moteMeshes.delete(id); }
  for (const m of moteBatch?[]:g.motes) {
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
  for (const s of shadeBatch?[]:g.shades) {
    if (!shadeMeshes.has(s.id)) shadeMeshes.set(s.id, makeShade());
    const m = shadeMeshes.get(s.id); m.position.set(s.pos[0], s.pos[1] + Math.sin(visualTime * 3) * 0.07, s.pos[2]);
    m.rotation.y = Math.atan2(g.player.pos[0] - s.pos[0], g.player.pos[2] - s.pos[2]);
    m.userData.body.color.setHex(s.state === 'stunned' ? 0x3a3450 : 0x120a1a);
    m.userData.eyes.color.setHex(settings.colorblind?0x00b3ff:0x7a3cff);m.userData.outline.color.setHex(settings.colorblind?0x00b3ff:0x7a3cff);m.userData.body.emissive.setHex(settings.colorblind?0x00b3ff:0x7a3cff);
    m.scale.setScalar(s.state==='spawning'?.5:1);
    m.rotation.z = s.state === 'stunned' ? Math.sin(visualTime * 9) * 0.15 : 0;
  }
  let lit = 0;
  for (const l of g.lanterns) {
    const m = lanternMeshes.get(l.id); m.group.position.set(l.pos[0], l.pos[1], l.pos[2]);
    const low=l.lit&&l.fuelUnits<tuning.low_fuel_threshold*HZ;
    const blink=!low||Math.floor(visualTime*2)%2===0;
    m.light.intensity = l.lit ? (blink?24:5) : 0; m.safe.visible = isSafeLantern(g,l);
    m.body.scale.y=l.lit?1:.8;m.tear.visible=!l.lit;
    m.fuelBar.visible=l.lit;m.fuelFill.visible=l.lit&&blink;
    m.fuelFill.scale.x=l.fuelUnits/(tuning.fuel_max*HZ);
    m.fuelBar.quaternion.copy(camera.quaternion);m.fuelFill.quaternion.copy(camera.quaternion);
    m.body.material.color.setHex(l.lit ? 0xffb347 : 0x5b5f6e);
    m.body.material.emissive.setHex(l.lit ? 0xffe9b0 : 0x000000);
    m.body.material.emissiveIntensity = l.lit ? (blink?1.7:.3) : 0;
    if (l.lit) lit++;
  }
  ambient.intensity = .15+.55*lit/g.lanterns.length;
  for(const [id,m]of drifterMeshes)if(!g.drifters.some(d=>d.id===id)){disposeGroup(m);drifterMeshes.delete(id);}
  for(const d of g.drifters){if(!drifterMeshes.has(d.id)){const ribbon=mesh(new THREE.TorusKnotGeometry(.35,.1,32,5),mat(0x8fa3b8),scene);drifterMeshes.set(d.id,ribbon);}const m=drifterMeshes.get(d.id);m.position.set(d.pos[0],d.pos[1]+1.2,d.pos[2]);m.rotation.y=visualTime*2;}
  for(const c of g.charms){if(!charmMeshes.has(c.id)){const m=mesh(new THREE.BoxGeometry(.6,.9,.08),mat(0xc8102e,{emissive:0xf2c14e,emissiveIntensity:.2}),scene);charmMeshes.set(c.id,m);}const m=charmMeshes.get(c.id);m.visible=c.available;m.position.set(c.pos[0],c.pos[1]+1.1+Math.sin(visualTime*3)*.15,c.pos[2]);m.rotation.y=visualTime;}
}
function toast(text) { $('toast').textContent = text; toastAge = 0; }
function eventsVisual(events) {
  for (const event of events) {
    releaseUI?.event(event);
    audio.effect(event.name);
    if (event.name === 'pulse') { pulseAge = 0; pulseMesh.position.set(g.player.pos[0], 0.08, g.player.pos[2]); }
    if (event.name === 'player_hit') { hitAge = 0; toast(`${settings.colorblind?'⚠ ':''}Mây mất một Ngọn Lửa. Hãy tìm ánh đèn còn đủ dầu!`); }
    if (event.name === 'lantern_lit') toast(event.data.relight?'Ngọn đèn đã sáng trở lại.':'Một ngọn đèn thức giấc. Túi của Mây rộng thêm!');
    if(event.name==='lantern_out')toast('Một ngọn đèn đã cạn dầu. Mang ánh sáng trở lại nhé.');
    if(event.name==='refuel')toast('Đã châm dầu. Giữ đảo sáng tới bình minh!');
    if (event.name === 'mote_picked' && event.data.carried === capacity(g)) toast('Túi đã đầy. Mang ánh sáng về đèn nhé.');
    if (event.name === 'game_over') finish();
  }
}
function hud() {
  const n = g.lanterns.filter(l => l.lit).length;
  $('carried').textContent = g.player.carried; $('lit').textContent = n; $('score').textContent = g.score;
  $('flames').textContent = '● '.repeat(g.player.flames) + '○ '.repeat(tuning.flames - g.player.flames);
  $('flames').setAttribute('aria-label', `${g.player.flames} trên ${tuning.flames} lửa`);
  const time = Math.ceil(g.time_left_s); $('timer').textContent = `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`;
  $('timer').classList.toggle('danger',time<=30);document.body.classList.toggle('colorblind',settings.colorblind);
  $('warning-symbol').hidden=!(settings.colorblind&&time<=30);
  $('capacity').textContent=capacity(g);
  $('dawn-goal').textContent=`GIỮ ÍT NHẤT ${Math.ceil(tuning.win_ratio*g.lanterns.length)}/${g.lanterns.length} ĐÈN TỚI BÌNH MINH`;
  if(time<=10&&time>0&&time!==lastCountdown){lastCountdown=time;audio.effect('countdown');}
  $('lamp-total').textContent=g.lanterns.length;
  $('mote-slots').innerHTML=Array.from({length:capacity(g)},(_,i)=>`<i class="${i<g.player.carried?'filled':''}"></i>`).join('');
  $('dash-cd').textContent=g.player.charm>0?'GIÓ · ∞':g.player.dashCd>0?`${(g.player.dashCd/60).toFixed(1)}s`:'SẴN SÀNG';
  $('pulse-cd').textContent=g.player.pulseCd>0?`${(g.player.pulseCd/60).toFixed(1)}s`:'SẴN SÀNG';
  $('wind-alert').textContent=g.wind.warning?'LÁ BẮT ĐẦU BAY · GIÓ ĐẾN SAU 2 GIÂY':g.wind.active?'GIÓ MẠNH · GIỮ VỮNG BƯỚC CHÂN':'';
  $('wind-leaves').hidden=!(g.wind.warning||g.wind.active);if(g.wind.warning&&!lastWindWarning)audio.effect('wind');lastWindWarning=g.wind.warning;
  const target=g.lanterns.filter(l=>!l.lit||l.fuelUnits<tuning.low_fuel_threshold*HZ).sort((a,b)=>Math.hypot(a.pos[0]-g.player.pos[0],a.pos[2]-g.player.pos[2])-Math.hypot(b.pos[0]-g.player.pos[0],b.pos[2]-g.player.pos[2]))[0];
  if(target){const v=new THREE.Vector3(...target.pos);v.y+=2;v.project(camera);const off=v.z>1||Math.abs(v.x)>1||Math.abs(v.y)>1;$('target-arrow').hidden=!off;$('target-arrow').textContent=`➤ ${target.id}`;$('target-arrow').style.transform=`rotate(${Math.atan2(-v.y,v.x)}rad)`;}else $('target-arrow').hidden=true;
  $('lantern-progress').innerHTML = g.lanterns.map(l => `<span class="${l.lit ? 'on' : ''}" title="${l.id}"></span>`).join('');
  const near = g.lanterns.filter(l=>(!l.lit||l.fuelUnits<tuning.fuel_max*HZ)&&Math.hypot(l.pos[0]-g.player.pos[0],l.pos[2]-g.player.pos[2])<=tuning.interact_radius).sort((a,b)=>Math.hypot(a.pos[0]-g.player.pos[0],a.pos[2]-g.player.pos[2])-Math.hypot(b.pos[0]-g.player.pos[0],b.pos[2]-g.player.pos[2])||a.id.localeCompare(b.id))[0];
  $('prompt').textContent = near ? near.lit?`E — Châm dầu (${Math.floor(near.fuelUnits/HZ)}/${tuning.fuel_max})`:`E — ${near.ever_lit?'Thắp lại':'Nạp ánh sáng'} (${near.deposited}/${lightingCost(g,near)})` : '';
}
function rebuild(){shadeBatch?.dispose();moteBatch?.dispose();shadeBatch=moteBatch=null;if(scene){scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});}scene=new THREE.Scene();lanternMeshes.clear();moteMeshes.clear();shadeMeshes.clear();drifterMeshes.clear();charmMeshes.clear();environment();playerMesh=makePlayer();}
function start(scenario = {},night=currentNight) {
  for(let i=night-1;i<3;i++)wonScores[i]=null;releaseUI?.start();
  currentNight=night;g = createGame(tuning, 42, scenario,night); rebuild();yaw = 0; facing = 0; accumulator = 0; keys.clear(); pulseAge = hitAge = toastAge = 100;lastCountdown=-1;
  mode = 'playing'; document.body.classList.add('playing');
  $('welcome').hidden = true; $('result').hidden = true; $('paused').hidden = true; $('hud').hidden = false;
  $('toast').textContent = ''; hud(); canvas.focus();
  $('night-intro').hidden=true;$('settings').hidden=true;audio.unlock();$('night-label').textContent=`ĐÊM 0${night} — ${g.map.name.toUpperCase()}`;
}
function finish() {
  mode = 'result'; keys.clear(); $('paused').hidden = true; $('result').hidden = false;
  const won = g.state === 'won'; $('result-kicker').textContent = won ? 'NĂM NGỌN ĐÈN. MỘT ĐÊM ĐƯỢC CỨU.' : 'ĐỐM SÁNG CHƯA BAO GIỜ TẮT HẲN';
  $('result-title').innerHTML = won ? 'Đảo lại<br><em>sáng rồi.</em>' : 'Hẹn một<br><em>đêm khác.</em>';
  $('result-story').textContent = won ? 'Mây đã giữ được ánh sáng cho Đảo Bến. Những chú đom đóm sẽ nhớ đêm này.' : g.reason === 'dawn' ? 'Bình minh đến trước khi năm ngọn đèn thức giấc. Thử một hành trình khác nhé.' : 'Sương đen đã bắt kịp Mây. Giữ lại chút ánh sáng cho lần trở về tiếp theo.';
  if(won)wonScores[currentNight-1]=g.score;
  releaseUI?.finish(won,currentNight);
  $('result-kicker').textContent=won?`ĐÊM ${currentNight} · ${g.map.name.toUpperCase()} ĐÃ SÁNG`:'MỘT HÀNH TRÌNH KHÁC ĐANG ĐỢI';
  $('result-story').textContent=won?`Ông Đăng: “Con đã giữ được ánh sáng cho ${g.map.name}. Hãy mang hy vọng đến hòn đảo tiếp theo.”`:'Ông Đăng: “Đừng sợ bóng tối. Con có thể thử lại đêm này.”';
  if(won&&currentNight===3){$('result-title').innerHTML='Bình<br><em>Minh.</em>';$('final-score').textContent=wonScores.reduce((a,b)=>a+b,0);}else $('final-score').textContent=g.score;
  $('next-night').hidden=!won||currentNight===3;$('restart').textContent=won&&currentNight===3?'Về menu':'Chơi lại Đêm này';audio.effect(won?'won':'lost');hud();
}
function pause() { if (mode === 'playing') {step(g,{move:[0,0],jump:false,dash:false,interact:false,pulse:false,pause:true});mode = 'paused'; keys.clear(); accumulator = 0; $('paused').hidden = false; } }
function resume() { if (mode === 'paused') {step(g,{pause:false});eventsVisual(step(g,{move:[0,0],jump:false,dash:false,interact:false,pulse:false,pause:true}));g.input.pause=false;mode = g.state==='playing'?'playing':'result'; accumulator = 0; lastTime = performance.now(); $('paused').hidden = true; canvas.focus(); } }
function intro(night){currentNight=night;mode='night-intro';$('welcome').hidden=true;$('result').hidden=true;$('paused').hidden=true;$('hud').hidden=true;$('night-intro').hidden=false;$('intro-name').textContent=`Đêm ${night} · ${mapFor(night).name}`;$('intro-story').textContent=`Ông Đăng: “Mây à, hãy giữ ít nhất ${Math.ceil(tuning.win_ratio*mapFor(night).lanterns.length)} ngọn đèn của ${mapFor(night).name} sáng đến bình minh. Châm dầu cho đèn yếu, thắp lại đèn tắt và đừng để Bóng Mực hút cạn hy vọng.”`;audio.unlock();}
function menu(){mode='intro';keys.clear();$('welcome').hidden=false;for(const id of ['hud','result','paused','night-intro','settings'])$(id).hidden=true;document.body.classList.remove('playing');}
function showSettings(){settingsReturn=mode;if(mode==='playing')pause();$('settings').hidden=false;$('paused').hidden=true;mode='settings';$('volume').value=settings.volume;$('sensitivity').value=settings.sensitivity;$('colorblind').checked=settings.colorblind;}
function input() {
  return keyboardInput(keys, yaw, settings.bindings);
}
function animate(now) {
  requestAnimationFrame(animate);
  const dt = lastTime ? (now - lastTime) / 1000 : 0; lastTime = now; visualTime += Math.min(dt, 0.1);
  if(mode==='playing'&&dt>0){fpsSamples.push(dt);if(fpsSamples.length>600)fpsSamples.shift();}audio.music(mode==='playing');
  if (mode === 'playing' && !document.hidden) {
    accumulator += dt; let budget = 600;
    while (accumulator >= 1 / HZ && mode === 'playing' && budget-- > 0) { eventsVisual(step(g, input())); accumulator -= 1 / HZ; }
  }
  if(mode==='benchmark'){accumulator+=dt;while(accumulator>=1/HZ){stepBenchmark(g);accumulator-=1/HZ;}benchmark.camera(camera,now);}
  pulseAge += dt; hitAge += dt; toastAge += dt;
  pulseMesh.material.opacity = Math.max(0, 1 - pulseAge / 0.7) * 0.8;
  pulseMesh.scale.setScalar(Math.min(1, pulseAge / 0.7) * tuning.pulse_radius);
  $('hit-flash').style.opacity = !settings.reducedMotion && hitAge < 0.6 ? String(0.7 * (1 - hitAge / 0.6)) : '0';
  $('toast').style.opacity = toastAge < 3 ? '1' : '0';
  syncEntities();
  playerMesh.position.fromArray(g.player.pos);
  if (mode === 'playing') {
    const inp = input(); if (Math.hypot(...inp.move) > 0) facing = Math.atan2(inp.move[0], inp.move[1]) + yaw * Math.PI / 180;
  }
  playerMesh.rotation.y = facing;
  playerMesh.userData.shadow.position.set(g.player.pos[0], 0.025, g.player.pos[2]);
  playerMesh.visible = g.player.invuln===0 || Math.sin(visualTime * 30) > -0.3;
  if (mode === 'intro') { camera.position.set(38, 29, -40); camera.lookAt(3, 0, 2); }
  else if(mode!=='benchmark') {
    const a = yaw * Math.PI / 180; const desired = new THREE.Vector3(g.player.pos[0] - Math.sin(a) * 11, g.player.pos[1] + 8, g.player.pos[2] - Math.cos(a) * 11);
    camera.position.lerp(desired, 1 - Math.exp(-7 * Math.min(dt, 0.1))); camera.lookAt(g.player.pos[0], g.player.pos[1] + 0.7, g.player.pos[2]);
  }
  if (['playing','paused'].includes(mode)) hud(); renderer.render(scene, camera);
  if(mode==='benchmark')benchmark.frame(now);
  releaseUI?.update(camera);
}
async function boot() {
  const response = await fetch('/game.contract.json'); if (!response.ok) throw new Error('Không đọc được cấu hình game. Chạy npm run build rồi npm start.');
  tuning = (await response.json()).tuning; g = createGame(tuning, 42);
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;
  scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 250);
  environment(); playerMesh = makePlayer();
  releaseUI=installReleaseUI({settings,getState:()=>g,getScores:()=>wonScores,getMode:()=>mode,menu});
  if(benchmarkParams.has('benchmark')){g=createBenchmark(tuning,Number(benchmarkParams.get('seed')??42));rebuild();mode='benchmark';benchmark=benchmarkSession(Number(benchmarkParams.get('duration')??30));for(const section of document.querySelectorAll('main section'))section.hidden=true;document.body.classList.add('playing');}
  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
  addEventListener('keydown', e => {
    if(releaseUI.capture(e))return;
    if(e.target instanceof HTMLInputElement && mode!=='playing')return;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (pressed(new Set([e.code]),'pause',settings.bindings)) {if(!e.repeat)mode === 'paused' ? resume() : pause(); return; }
    if(e.code==='Space'&&!e.repeat&&mode==='playing'&&g.player.grounded)audio.effect('jump');
    if (mode === 'playing') keys.add(e.code);
  });
  addEventListener('keyup', e => keys.delete(e.code));
  addEventListener('blur', pause); document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  canvas.addEventListener('pointerdown', e => { dragging = true; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (dragging && mode === 'playing') yaw -= e.movementX * settings.sensitivity; });
  canvas.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('pointercancel', () => { dragging = false; });
  $('start').onclick = () => {wonScores=[null,null,null];intro(1);}; $('enter-night').onclick=()=>start();$('next-night').onclick=()=>intro(currentNight+1);
  $('restart').onclick = () => g.state==='won'&&currentNight===3?menu():start(); $('pause').onclick = pause; $('resume').onclick = resume;
  $('retry-night').onclick=()=>start();$('to-menu').onclick=menu;$('menu-settings').onclick=showSettings;$('pause-settings').onclick=showSettings;
  for(const id of ['volume','sensitivity'])$(id).oninput=()=>{settings[id]=Number($(id).value);audio.setVolume(settings.volume);try{localStorage.setItem('dao-settings',JSON.stringify(settings));}catch{}};
  $('colorblind').onchange=()=>{settings.colorblind=$('colorblind').checked;document.body.classList.toggle('colorblind',settings.colorblind);try{localStorage.setItem('dao-settings',JSON.stringify(settings));}catch{}};
  $('close-settings').onclick=()=>{$('settings').hidden=true;if(settingsReturn==='intro'){menu();}else{mode='paused';$('paused').hidden=false;}};
  // Explicit validation mode: no test API or scenario injection in normal play.
  if (new URLSearchParams(location.search).has('labtest')) {
    window.__lab = {
      start, pause, resume, snapshot: () => snapshot(g),
      advance: (frames) => {if(g.state==='paused'){step(g,{pause:false});step(g,{pause:true});g.input.pause=false;}mode='paused';$('paused').hidden=true; for (const frame of frames) eventsVisual(step(g, frame)); hud(); return snapshot(g); },
      intro,menu, get settings(){return settings;},get campaign(){return [...wonScores];},get audio(){return {notes:audio.notes,effects:audio.effects,state:audio.ctx?.state};},get fps(){return fpsSamples.length/fpsSamples.reduce((a,b)=>a+b,0);},get ambient(){return ambient.intensity;},get scene(){return scene;},get frame(){return renderer.info.render.frame;},
      get mode() { return mode; }, get renderer() { return renderer.info.render; },
    };
  }
  requestAnimationFrame(animate);
}
boot().catch(error => { $('error').hidden = false; $('welcome').hidden = true; $('error-text').textContent = error.message; document.body.classList.add('fatal'); console.error(error); });
