import {createGame,step,snapshot} from '../src/core/simulation.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const t=JSON.parse(readFileSync('game.contract.json')).tuning;
const proof=resolve(process.env.PROOF_DIR??'docs/proof/phase-3'),dir=resolve('tests/scenarios/phase3');mkdirSync(proof,{recursive:true});mkdirSync(dir,{recursive:true});
const empty={random_motes:false,random_shades:false,random_drifters:false,wind_enabled:false,motes:[],shades:[],drifters:[],charms:[]};
const cases=[
 {name:'refuel',scenario:{...empty,player:{carried:8},lanterns:[{id:'L1',pos:[0,0,0],lit:true,fuel:75}]},frames:[{tick:0,interact:true}],ticks:1,check:s=>{assert.equal(s.player.carried,5);assert.equal(s.lanterns[0].fuel,100);assert.equal(s.score,15);}},
 {name:'relight',scenario:{...empty,player:{carried:5},lanterns:[{id:'L1',pos:[0,0,0],ever_lit:true}]},frames:[{tick:0,interact:true}],ticks:1,check:s=>{assert.equal(s.lanterns[0].relit_count,1);assert.equal(s.player.capacity,12);assert.equal(s.score,65);}},
 {name:'out',scenario:{...empty,lanterns:[{id:'L1',lit:true,fuel:1/60}]},ticks:1,check:s=>{assert.equal(s.lanterns[0].fuel,0);assert.equal(s.lanterns[0].lit,false);assert.equal(s.lanterns[0].ever_lit,true);}},
 {name:'drain',scenario:{...empty,player:{pos:[20,0,0]},lanterns:[{id:'L1',lit:true,fuel:20,pos:[0,0,0]}],shades:[{id:'S1',pos:[0,0,0],state:'drain',target_lantern_id:'L1'},{id:'S2',pos:[1,0,0],state:'drain',target_lantern_id:'L1'}]},ticks:60,check:s=>assert.equal(s.lanterns[0].fuel,9)},
 {name:'drain-pulse',scenario:{...empty,player:{pos:[3,0,0],carried:3},lanterns:[{id:'L1',lit:true,fuel:20,pos:[0,0,0]}],shades:[{id:'S1',pos:[1,0,0],state:'drain',target_lantern_id:'L1'}]},frames:[{tick:0,pulse:true}],ticks:1,check:s=>{assert.equal(s.shades[0].state,'stunned');assert.equal(s.score,15);}},
 {name:'capacity',scenario:{...empty,player:{successful_lights:4,carried:10},lanterns:[{id:'L1',pos:[0,0,0]}]},frames:[{tick:0,interact:true}],ticks:1,check:s=>{assert.equal(s.player.capacity,20);assert.equal(s.score,150);}},
 {name:'pause-fuel',scenario:{...empty,lanterns:[{id:'L1',lit:true,fuel:10}]},frames:[{tick:0,pause:true},{tick:60,pause:false},{tick:61,pause:true}],ticks:62,check:s=>{assert.equal(s.sim_tick,1);assert.equal(s.lanterns[0].fuel,10);}},
 {name:'no-early-win',scenario:{...empty,lanterns:Array.from({length:5},(_,i)=>({id:`L${i+1}`,lit:true}))},ticks:120,check:s=>{assert.equal(s.state,'playing');assert.equal(s.lanterns[0].fuel,98);}},
 ...[1,2,3].map(night=>({name:`dawn-night${night}`,night,scenario:{...empty,time_left_s:1/60,lanterns:Array.from({length:Math.ceil(.6*(night+4))},(_,i)=>({id:`L${i+1}`,lit:true,fuel:80}))},ticks:1,check:s=>{assert.equal(s.state,'won');assert.equal(s.score,Math.ceil(.6*(night+4))*129+150);}})),
 {name:'dawn-loss',scenario:{...empty,time_left_s:1/60},ticks:1,check:s=>assert.equal(s.state,'lost')},
];
const results=[];
for(const c of cases){c.night??=1;c.frames??=[];const sf=`${dir}/${c.name}.json`,inf=`${dir}/${c.name}.inputs.json`;writeFileSync(sf,JSON.stringify(c.scenario,null,2)+'\n');writeFileSync(inf,JSON.stringify({frames:c.frames},null,2)+'\n');let bytes;
 for(const suffix of ['a','b']){const out=`${proof}/${c.name}-${suffix}.jsonl`;const r=spawnSync(process.execPath,['src/headless/cli.mjs','--seed','42','--night',String(c.night),'--ticks',String(c.ticks),'--snapshot-every','1','--scenario',sf,'--inputs',inf,'--out',out],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);const raw=readFileSync(out);if(bytes)assert.deepEqual(raw,bytes);bytes=raw;}
 const rows=bytes.toString().trim().split('\n').map(JSON.parse),final=rows.filter(r=>r.type==='snapshot').at(-1);c.check(final);assert.equal(rows.filter(r=>r.type==='end').length,1);
 if(c.name==='drain')assert.equal(rows.filter(r=>r.name==='fuel_drain').length,2);
 const g=createGame(t,42,c.scenario,c.night);let at=0;for(let k=0;k<c.ticks&&!['won','lost'].includes(g.state);k++){let p={};if(c.frames[at]?.tick===k){const {tick,...patch}=c.frames[at++];p=patch;}step(g,p);}assert.deepEqual(snapshot(g),final);
 results.push({name:c.name,night:c.night,status:'PASS',scenario:c.scenario,frames:c.frames,final});
}
const start=performance.now();const regression=spawnSync(process.execPath,['scripts/check-phase2.mjs'],{encoding:'utf8',env:{...process.env,PROOF_DIR:`${proof}/regression`}});assert.equal(regression.status,0,regression.stderr);const prior=JSON.parse(readFileSync(`${proof}/regression/results.json`));
writeFileSync(`${proof}/results.json`,JSON.stringify({status:'PASS',environment:{node:process.version,platform:process.platform},performance_seconds:prior.performance_seconds,regression:prior.results.map(r=>({name:r.name,status:r.status})),results},null,2)+'\n');
console.log(`PASS ${cases.length} fuel/dawn scenarios and ${prior.results.length} retained scenarios, byte replay/parity; 21600ticks ${prior.performance_seconds.toFixed(3)}s`);
