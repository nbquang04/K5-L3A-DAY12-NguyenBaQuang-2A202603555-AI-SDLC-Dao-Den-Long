import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createGame, step, snapshot } from '../src/core/simulation.mjs';
import { mapFor, surfaces } from '../src/core/maps.mjs';
const t = JSON.parse(readFileSync(new URL('../game.contract.json', import.meta.url))).tuning;
const empty = { random_motes:false, random_shades:false, random_drifters:false, wind_enabled:false, motes:[], shades:[], drifters:[], charms:[] };
const game = (s={}, night=1) => createGame(t,42,{...empty,...s},night);
const run = (g,n,p={}) => {const events=[];for(let i=0;i<n;i++)events.push(...step(g,i?{}:p));return events;};
test('canonical maps and terrain include bridge, tiers, ramp and tower',()=>{
 assert.equal(mapFor(1).lanterns.length,5);assert.equal(mapFor(2).lanterns.length,6);assert.equal(mapFor(3).lanterns.length,7);
 assert.deepEqual(surfaces(2,35,0),[0]);assert.deepEqual(surfaces(2,35,3),[]);
 assert.ok(surfaces(3,0,18).includes(3));assert.ok(surfaces(3,5,0).includes(6));
 assert.ok(surfaces(3,27*Math.cos(Math.PI/6),27*.5).some(y=>Math.abs(y-1.5)<1e-8));
});
test('dash lasts12 ticks, cooldown90, airborne height held and edge required',()=>{
 const g=game({player:{pos:[0,2,0]}});run(g,12,{dash:true});
 assert.ok(Math.abs(g.player.pos[2]-2.8)<1e-8);assert.equal(g.player.pos[1],2);
 assert.equal(snapshot(g).player.dash_cd_s,79/60);run(g,1);assert.ok(g.player.pos[1]<2);
});
test('pause increments tick only and freezes timers, counters and TTL',()=>{
 const g=game({player:{charm_ticks:600}});step(g,{pause:true});const s=snapshot(g);run(g,100);
 assert.equal(g.tick,101);assert.equal(g.sim_tick,0);assert.equal(g.state,'paused');assert.equal(snapshot(g).player.charm_s,s.player.charm_s);
 step(g,{pause:false});step(g,{pause:true});assert.equal(g.sim_tick,1);assert.equal(g.state,'playing');
});
test('fall loses once, waits60, resets velocity and grants90 invulnerability',()=>{
 const g=game({player:{pos:[45,-11,0],carried:7}});const ev=step(g);
 assert.equal(g.player.flames,2);assert.equal(g.player.carried,0);assert.equal(ev.find(e=>e.name==='player_hit').data.lost,7);
 run(g,59);assert.equal(g.player.flames,2);assert.ok(g.player.pos[1]<-10);step(g);
 assert.deepEqual(g.player.pos,[0,0,0]);assert.deepEqual(g.player.vel,[0,0,0]);assert.equal(snapshot(g).player.invuln,true);
});
test('pickup height/capacity, deposit scores rather than pickup, partial retained',()=>{
 const g=game({motes:[[0,0,0],[0,2,0]],lanterns:[{id:'L1',pos:[0,0,0],deposited:8}]});
 step(g);assert.equal(g.player.carried,1);assert.equal(g.score,0);step(g,{interact:true});
 assert.equal(g.lanterns[0].deposited,9);assert.equal(g.score,10);assert.equal(g.motes.length,1);
});
test('pulse uses3D radius, stun120 push4 over15ticks and costs3',()=>{
 const g=game({player:{carried:3},shades:[{id:'S1',pos:[2,0,0]},{id:'S2',pos:[0,8,0]}]});
 const ev=step(g,{pulse:true});assert.deepEqual(ev.find(e=>e.name==='pulse').data.stunned_ids,['S1']);
 assert.equal(g.player.carried,0);assert.equal(g.score,5);assert.equal(g.shades[0].state,'stunned');
 run(g,14);assert.ok(Math.abs(g.shades[0].pos[0]-6)<1e-8);
});
test('shade hit drops half, recoil, invulnerability, dropped motes expire',()=>{
 const g=game({player:{carried:7},shades:[{id:'S1',pos:[0,0,0],state:'chase'}]});
 step(g);assert.equal(g.player.flames,2);assert.equal(g.player.carried,4);assert.equal(g.motes.length,3);assert.equal(g.shades[0].state,'recoil');
 run(g,60);assert.equal(g.player.flames,2);assert.ok(g.motes.every(m=>m.kind==='dropped'));
});
test('drifter steals through invulnerability and pulse recovers stolen motes',()=>{
 const g=game({player:{carried:6,invuln_ticks:90},drifters:[{id:'D1',pos:[0,0,0],state:'chase'}]},2);
 let ev=step(g);assert.equal(g.player.carried,3);assert.equal(g.player.flames,3);assert.ok(ev.some(e=>e.name==='drifter_steal'));
 ev=step(g,{pulse:true});assert.ok(ev.some(e=>e.name==='drifter_drop'));assert.equal(g.drifters[0].stolen,0);assert.equal(g.motes.length,3);
});
test('charm refreshes600, run7.2 and repeated edge dash without cooldown',()=>{
 const g=game({charms:[{id:'C1',pos:[0,0,0]}]},2);step(g);assert.equal(snapshot(g).player.charm_s,10);assert.equal(g.charms[0].respawn,2700);
 step(g,{move:[0,1]});assert.ok(Math.abs(g.player.pos[2]-.12)<1e-8);
 step(g,{dash:true});run(g,11);step(g,{dash:false});assert.ok(step(g,{dash:true}).some(e=>e.name==='dash'));
});
test('spawn schedules,20 distinct initial motes and no same-tick contact',()=>{
 const g=createGame(t,42,{},1);assert.equal(g.motes.length,20);assert.equal(new Set(g.motes.map(m=>JSON.stringify(m.pos))).size,20);assert.equal(g.shades.length,0);
 run(g,300);assert.equal(g.shades.length,2);assert.ok(g.shades.every(s=>s.state==='spawning'));assert.equal(g.motes.length<=22,true);
});
test('wind warns before1800 and active300ticks then stops',()=>{
 const g=game({wind_enabled:true},3);run(g,1680);assert.equal(g.wind.warning,true);run(g,120);assert.equal(g.wind.active,true);run(g,300);assert.equal(g.wind.active,false);
});
test('no_flames overrides all_lit; win overrides dawn if alive',()=>{
 const lamps=mapFor(1).lanterns.map((pos,i)=>({id:`L${i+1}`,lit:true}));
 const g=game({player:{flames:0},lanterns:lamps});step(g);assert.equal(g.reason,'no_flames');
 const h=game({time_left_s:1/60,lanterns:lamps});step(h);assert.equal(h.state,'won');
});
test('launch pad crosses night2 sea and retains horizontal launch despite opposite input',()=>{
 const g=game({player:{pos:[20,0,18]}},2);step(g);assert.ok(g.player.vel[1]>13);run(g,75,{move:[-1,0]});
 assert.ok(g.player.pos[0]>45);run(g,15,{move:[0,0]});assert.equal(g.player.grounded,true);assert.ok(g.player.pos[0]>45);
});
test('night3 pad lands on upper tier; vertical wall and tower stop walking/dash',()=>{
 const g=game({player:{pos:[0,3,13]}},3);run(g,65);assert.equal(g.player.pos[1],6);assert.equal(g.player.grounded,true);
 const wall=game({player:{pos:[0,0,24.5]}},3);run(wall,10,{move:[0,-1]});assert.ok(wall.player.pos[2]>=24);
 const tower=game({player:{pos:[3,6,0]}},3);run(tower,12,{move:[-1,0],dash:true});assert.ok(tower.player.pos[0]>=2);
});
test('ramp climbs from ground to terrace, bridge edge falls, lost last flame never respawns',()=>{
 const a=Math.PI/6,g=game({player:{pos:[30*Math.cos(a),0,15]}},3);run(g,61,{move:[-Math.cos(a),-.5]});assert.ok(g.player.pos[1]>2.8);
 const b=game({player:{pos:[35,0,2]}},2);run(b,80,{move:[0,1]});assert.equal(b.player.flames,2);
 const last=game({player:{pos:[50,-11,0],flames:1,invuln_ticks:999}});step(last);assert.equal(last.state,'lost');assert.equal(last.reason,'no_flames');
});
test('dropped motes cannot be collected on birth tick and expire after480 sim ticks',()=>{
 const g=game({player:{carried:3},shades:[{pos:[0,0,0]}]});step(g);assert.equal(g.motes[0].ttl,480);g.shades=[];run(g,479);assert.equal(g.motes.length,1);step(g);assert.equal(g.motes.length,0);
});
test('review regression: drifter releases stolen light at its exact location',()=>{
 const g=game({player:{carried:3},drifters:[{id:'D1',pos:[2,0,0],state:'flee',stolen:2,state_ticks_left:240}]},2);
 step(g,{pulse:true});assert.equal(g.motes.length,2);for(const m of g.motes)assert.deepEqual(m.pos,[2,0,0]);
});
test('review regression: shade recoil travels2m in60ticks and new shade activates next tick',()=>{
 const g=game({shades:[{id:'S1',pos:[0,0,0]}]});step(g);run(g,60);assert.ok(Math.abs(g.shades[0].pos[0]-2)<1e-8);
 const h=createGame(t,42,{},1);run(h,300);assert.equal(h.shades[0].state,'spawning');step(h);assert.notEqual(h.shades[0].state,'spawning');
});
