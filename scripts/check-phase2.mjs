import {createGame,step,snapshot} from '../src/core/simulation.mjs';
import {mapFor} from '../src/core/maps.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const t=JSON.parse(readFileSync('game.contract.json')).tuning;
const proof=resolve(process.env.PROOF_DIR??'docs/proof/phase-2');mkdirSync(proof,{recursive:true});
const dir=resolve('tests/scenarios/phase2');mkdirSync(dir,{recursive:true});
const empty={random_motes:false,random_shades:false,random_drifters:false,wind_enabled:false,motes:[],shades:[],drifters:[],charms:[]};
const cases=[
 {name:'dash',night:1,scenario:{...empty,player:{pos:[0,2,0]}},frames:[{tick:0,dash:true}],ticks:12,check:s=>{assert.equal(s.player.pos[2],2.8);assert.equal(s.player.pos[1],2);}},
 {name:'fall',night:2,scenario:{...empty,player:{pos:[35,-11,3],carried:8}},frames:[],ticks:61,check:s=>{assert.deepEqual(s.player.pos,[0,0,0]);assert.equal(s.player.flames,2);assert.equal(s.player.carried,0);}},
 {name:'pad',night:2,scenario:{...empty,player:{pos:[20,0,18]}},frames:[],ticks:90,check:s=>{assert.ok(s.player.pos[0]>45);assert.equal(s.player.grounded,true);}},
 {name:'drifter',night:2,scenario:{...empty,player:{carried:6},drifters:[{id:'D1',pos:[0,0,0],state:'chase'}]},frames:[{tick:1,pulse:true}],ticks:2,check:s=>{assert.equal(s.player.carried,0);assert.equal(s.drifters[0].stolen,0);assert.equal(s.motes.length,3);}},
 {name:'charm',night:2,scenario:{...empty,charms:[{id:'C1',pos:[0,0,0]}]},frames:[{tick:1,move:[0,1]}],ticks:2,check:s=>{assert.equal(s.player.pos[2],.12);assert.equal(s.player.charm_s,599/60);}},
 {name:'wind',night:3,scenario:{...empty,wind_enabled:true},frames:[],ticks:1800,check:s=>assert.equal(s.wind.active,true)},
 {name:'pause',night:3,scenario:{...empty,player:{charm_ticks:600}},frames:[{tick:0,pause:true},{tick:10,pause:false},{tick:11,pause:true}],ticks:12,check:s=>{assert.equal(s.sim_tick,1);assert.equal(s.player.charm_s,599/60);}},
 ...[1,2,3].map(night=>({name:`win-night${night}`,night,scenario:{...empty,time_left_s:1/60,lanterns:mapFor(night).lanterns.map((p,i)=>({id:`L${i+1}`,lit:true}))},frames:[],ticks:1,check:s=>{assert.equal(s.state,'won');assert.equal(s.score,150);}})),
];
const results=[];
for(const c of cases){const scenarioFile=`${dir}/${c.name}.json`,inputsFile=`${dir}/${c.name}.inputs.json`;writeFileSync(scenarioFile,JSON.stringify(c.scenario,null,2)+'\n');writeFileSync(inputsFile,JSON.stringify({frames:c.frames},null,2)+'\n');let bytes;
 for(const suffix of ['a','b']){const out=`${proof}/${c.name}-${suffix}.jsonl`;const args=['src/headless/cli.mjs','--seed','42','--night',String(c.night),'--ticks',String(c.ticks),'--snapshot-every','1','--scenario',scenarioFile,'--inputs',inputsFile,'--out',out];const r=spawnSync(process.execPath,args,{encoding:'utf8'});assert.equal(r.status,0,r.stderr);const raw=readFileSync(out);if(bytes)assert.deepEqual(raw,bytes);bytes=raw;}
 const rows=bytes.toString().trim().split('\n').map(JSON.parse),final=rows.filter(r=>r.type==='snapshot').at(-1);c.check(final);assert.equal(rows.filter(r=>r.type==='end').length,1);
 const g=createGame(t,42,c.scenario,c.night);let at=0;for(let k=0;k<c.ticks&&!['won','lost'].includes(g.state);k++){let p={};if(c.frames[at]?.tick===k){const {tick,...patch}=c.frames[at++];p=patch;}step(g,p);}assert.deepEqual(snapshot(g),final);
 results.push({name:c.name,night:c.night,status:'PASS',scenario:c.scenario,frames:c.frames,final});
}
const performanceScenario=`${dir}/performance.json`;writeFileSync(performanceScenario,JSON.stringify({...empty,time_left_s:360}));const start=performance.now();const r=spawnSync(process.execPath,['src/headless/cli.mjs','--night','3','--ticks','21600','--scenario',performanceScenario,'--out',`${proof}/performance.jsonl`],{encoding:'utf8'});const seconds=(performance.now()-start)/1000;assert.equal(r.status,0,r.stderr);assert.ok(seconds<=30,`${seconds}s >30s`);const end=JSON.parse(readFileSync(`${proof}/performance.jsonl`,'utf8').trim().split('\n').at(-1));assert.equal(end.ticks,21600);
writeFileSync(`${proof}/results.json`,JSON.stringify({status:'PASS',environment:{node:process.version,platform:process.platform},performance_seconds:seconds,results},null,2)+'\n');
console.log(`PASS ${cases.length} scenarios, two-process byte replay, Node parity, 21600 ticks in ${seconds.toFixed(3)}s`);
