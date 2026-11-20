import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createGame,step,snapshot,capacity,isSafeLantern} from '../src/core/simulation.mjs';
import {validateScenario} from '../src/core/validation.mjs';
const t=JSON.parse(readFileSync(new URL('../game.contract.json',import.meta.url))).tuning;
const empty={random_motes:false,random_shades:false,random_drifters:false,wind_enabled:false,motes:[],shades:[],drifters:[],charms:[]};
const game=(s={},night=1)=>createGame(t,42,{...empty,...s},night);
const run=(g,n,p={})=>{const out=[];for(let i=0;i<n;i++)out.push(...step(g,i?{}:p));return out;};
test('lit scenario defaults fuel100/ever_lit; no score/capacity gain and exact6000tick out',()=>{
 const g=game({lanterns:[{id:'L1',lit:true}]});assert.equal(g.lanterns[0].fuelUnits,6000);assert.equal(g.player.successful_lights,0);assert.equal(capacity(g),10);
 run(g,5999);assert.equal(g.lanterns[0].lit,true);assert.equal(g.lanterns[0].fuelUnits,1);const ev=step(g);assert.equal(g.lanterns[0].lit,false);assert.equal(g.lanterns[0].deposited,0);assert.equal(g.lanterns[0].ever_lit,true);assert.ok(ev.some(e=>e.name==='lantern_out'));
});
test('refuel uses ceiling in exact units and consumes only needed motes; full excluded',()=>{
 const g=game({player:{carried:8},lanterns:[{id:'L1',pos:[0,0,0],lit:true,fuel:75}]});const ev=step(g,{interact:true});assert.equal(g.player.carried,5);assert.equal(g.lanterns[0].fuelUnits,6000);assert.equal(g.score,15);assert.deepEqual(ev.find(e=>e.name==='refuel').data,{lantern_id:'L1',amount:3,fuel:100});
 const full=createGame({...t,fuel_decay_per_s:0},42,{...empty,player:{carried:10},lanterns:[{id:'L1',pos:[0,0,0],lit:true},{id:'L2',pos:[1,0,0]}]});const events=step(full,{interact:true});assert.equal(full.lanterns[1].lit,true);assert.equal(events.some(e=>e.name==='refuel'),false);
});
test('relight costs5, firstlight10, partial held; score/history/capacity exact',()=>{
 const g=game({player:{carried:3},lanterns:[{id:'L1',pos:[0,0,0],ever_lit:true}]});step(g,{interact:true});assert.equal(g.lanterns[0].deposited,3);assert.equal(g.score,15);g.player.carried=4;step(g,{interact:false});const events=step(g,{interact:true});assert.equal(g.player.carried,2);assert.equal(g.score,65);assert.equal(capacity(g),12);assert.equal(g.lanterns[0].relit_count,1);assert.deepEqual(events.find(e=>e.name==='lantern_lit').data,{lantern_id:'L1',relight:true});
 const h=game({player:{carried:10},lanterns:[{id:'L1',pos:[0,0,0]}]});step(h,{interact:true});assert.equal(h.score,150);assert.equal(h.lanterns[0].relit_count,0);assert.equal(h.lanterns[0].fuelUnits,6000);
});
test('capacity max20 from successful lights; scenario permits carried20 only when capacity allows',()=>{
 const g=game({player:{successful_lights:10,carried:20}});assert.equal(capacity(g),20);assert.equal(snapshot(g).player.capacity,20);assert.equal(capacity(game()),10);
 assert.throws(()=>game({player:{carried:11}}));assert.throws(()=>game({player:{successful_lights:-1}}));
});
test('exact30 safe; fuel below30 unsafe even snapshot rounds30.0; refuel ejects',()=>{
 const g=game({player:{pos:[10,0,0]},lanterns:[{id:'L1',pos:[0,0,0],lit:true,fuel:30}],shades:[{id:'S1',pos:[2,0,0],state:'wander'}]});assert.equal(isSafeLantern(g,g.lanterns[0]),true);step(g);assert.equal(isSafeLantern(g,g.lanterns[0]),false);assert.equal(snapshot(g).lanterns[0].fuel,30);
 const h=game({player:{carried:1},lanterns:[{id:'L1',pos:[0,0,0],lit:true,fuel:25}],shades:[{id:'S1',pos:[0,0,0],state:'drain',target_lantern_id:'L1'}]});step(h,{interact:true});assert.equal(h.player.flames,3);assert.ok(Math.hypot(h.shades[0].pos[0],h.shades[0].pos[2])>=6);
});
test('two drainers stack atstep2, cadence60, pause freezes; out resets progress',()=>{
 const g=game({player:{pos:[20,0,0]},lanterns:[{id:'L1',pos:[0,0,0],lit:true,fuel:20}],shades:[{id:'S1',pos:[0,0,0],state:'drain',target_lantern_id:'L1'},{id:'S2',pos:[1,0,0],state:'drain',target_lantern_id:'L1'}]});const ev=run(g,60);assert.equal(g.lanterns[0].fuelUnits,540);assert.equal(ev.filter(e=>e.name==='fuel_drain').length,2);step(g,{pause:true});run(g,30);assert.equal(g.lanterns[0].fuelUnits,540);
 step(g,{pause:false});step(g,{pause:true});run(g,49);assert.equal(g.lanterns[0].lit,false);assert.equal(g.lanterns[0].deposited,0);
});
test('wander prefers weak lit target; chase never switches to lantern; drain reacts at6m and pulse15',()=>{
 const g=game({player:{pos:[25,0,0]},lanterns:[{id:'L1',pos:[0,0,0],lit:true,fuel:20}],shades:[{id:'S1',pos:[1,0,0],state:'wander'}]});step(g);assert.equal(g.shades[0].state,'drain');assert.equal(g.shades[0].target_lantern_id,'L1');
 const pulse=game({player:{pos:[3,0,0],carried:3},lanterns:[{id:'L1',pos:[0,0,0],lit:true,fuel:20}],shades:[{id:'S1',pos:[1,0,0],state:'drain',target_lantern_id:'L1'}]});step(pulse,{pulse:true});assert.equal(pulse.score,15);assert.equal(pulse.shades[0].state,'stunned');run(pulse,120);assert.notEqual(pulse.shades[0].state,'stunned');
 const chase=game({player:{pos:[10,0,0]},lanterns:[{id:'L1',pos:[0,0,0],lit:true,fuel:20}],shades:[{id:'S1',pos:[1,0,0],state:'chase'}]});step(chase);assert.equal(chase.shades[0].state,'chase');
});
test('no early win; eachnight threshold onlyatdawn, correct fuel/flame bonus and deathpriority',()=>{
 for(const night of [1,2,3]){const count=night+4,need=Math.ceil(count*.6),lamps=Array.from({length:count},(_,i)=>({id:`L${i+1}`,lit:i<need,fuel:80}));
 const early=game({lanterns:lamps},night);step(early);assert.equal(early.state,'playing');
 const win=game({time_left_s:1/60,lanterns:lamps},night);step(win);assert.equal(win.state,'won');assert.equal(win.reason,'dawn_survived');assert.equal(win.score,need*(50+79)+150);
 const loss=game({time_left_s:1/60,lanterns:lamps.slice(1)},night);step(loss);assert.equal(loss.reason,'dawn');
 const dead=game({time_left_s:1/60,player:{flames:0},lanterns:lamps},night);step(dead);assert.equal(dead.reason,'no_flames');}
});
test('finaltick out before interaction can relight and count towards dawn; roundingonlyoutput',()=>{
 const g=game({time_left_s:1/60,player:{carried:5},lanterns:[{id:'L1',lit:true,fuel:1/60,pos:[0,0,0]},{id:'L2',lit:true},{id:'L3',lit:true}]});const ev=step(g,{interact:true});assert.equal(g.state,'won');assert.equal(g.score,65+150+2*149+150);assert.deepEqual(ev.filter(e=>['lantern_out','deposit','lantern_lit'].includes(e.name)).map(e=>e.name),['lantern_out','deposit','lantern_lit']);
});
test('invalid fuel/ever_lit/target schema rejected',()=>{
 for(const s of [{lanterns:[{id:'L1',fuel:101}]},{lanterns:[{id:'L1',ever_lit:1}]},{shades:[{pos:[0,0,0],state:'drain',target_lantern_id:'L8'}]}])assert.throws(()=>validateScenario(s,t));
});
