import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { frameMetrics } from '../src/shared/metrics.mjs';
import { rankEntries, validateSubmission } from '../src/shared/leaderboard.mjs';
import { DEFAULT_BINDINGS, bindKey, pressed } from '../src/web/settings.mjs';
import { createBenchmark, stepBenchmark } from '../src/core/benchmark.mjs';
import { loadBoard, saveEntry } from '../scripts/leaderboard-store.mjs';
import { inputGenerator } from '../scripts/soak-input.mjs';
import { edgeIndicator } from '../src/shared/edge-indicator.mjs';
const tuning=JSON.parse(await readFile('game.contract.json','utf8')).tuning;
test('edge indicator preserves pixel direction on non-square viewport and behind camera',()=>{
 const p=edgeIndicator(1,-1,1280,720);assert.equal(p.y,685);assert.ok(Math.abs((p.x-640)/(p.y-360)-1280/720)<1e-9);
 const b=edgeIndicator(1,-1,1280,720,true);assert.ok(Math.abs(b.y-35)<1e-9);assert.ok(b.x<640);
});
test('metrics use all samples, worst ceil 1%, nearest-rank p95',()=>{
 const m=frameMetrics([...Array(99).fill(10),100]);
 assert.equal(m.frames,100);assert.equal(m.avg_fps,100000/1090);assert.equal(m.p1_low_fps,10);assert.equal(m.frame_ms_p95,10);
 assert.throws(()=>frameMetrics([]));assert.throws(()=>frameMetrics([0]));
});
test('benchmark exact counts, seed, fuel, origin and suppressed rules',()=>{
 const a=createBenchmark(tuning,42),b=createBenchmark(tuning,42);
 assert.deepEqual(a.shades,b.shades);assert.equal(a.shades.length,200);assert.equal(a.motes.length,100);
 assert.deepEqual(a.player.pos,[0,0,0]);assert.equal(a.lanterns.filter(l=>l.lit&&l.fuelUnits===6000).length,3);
 const before=structuredClone(a.shades[0].pos);for(let i=0;i<600;i++)stepBenchmark(a);
 assert.notDeepEqual(a.shades[0].pos,before);assert.equal(a.player.flames,3);assert.equal(a.player.carried,0);
 assert.equal(a.shades.length,200);assert.ok(a.shades.every(s=>s.state==='wander'));assert.equal(a.lanterns[0].fuelUnits,6000);
});
test('leaderboard validates, ranks ties by time, trims ten',()=>{
 assert.throws(()=>validateSubmission({name:'<script>',score:1,nights_won:0,seed:42}));
 assert.throws(()=>validateSubmission({name:'May',score:-1,nights_won:0,seed:42}));
 const rows=Array.from({length:12},(_,i)=>({name:`May${i}`,score:100,nights_won:1,seed:42,achieved_at:new Date(i*1000).toISOString()}));
 const ranked=rankEntries(rows.reverse());assert.equal(ranked.length,10);assert.equal(ranked[0].name,'May0');assert.equal(ranked[9].name,'May9');
});
test('disk store survives reopen and preserves corrupt data',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'dao-board-')),file=join(dir,'board.json');
 try{await saveEntry(file,{name:'May',score:120,nights_won:1,seed:42});assert.equal((await loadBoard(file)).entries[0].score,120);
 await writeFile(file,'broken');await assert.rejects(saveEntry(file,{name:'May',score:1,nights_won:0,seed:1}));assert.equal(await readFile(file,'utf8'),'broken');}
 finally{await rm(dir,{recursive:true,force:true});}
});
test('bindings reject conflicts and preserve unclaimed aliases',()=>{
 assert.throws(()=>bindKey(DEFAULT_BINDINGS,'left','KeyD'));
 const b=bindKey(DEFAULT_BINDINGS,'left','KeyJ');assert.ok(pressed(new Set(['KeyJ']),'left',b));assert.ok(!pressed(new Set(['KeyA']),'left',b));
 const c=bindKey(DEFAULT_BINDINGS,'pulse','ArrowLeft');assert.ok(!pressed(new Set(['ArrowLeft']),'left',c));assert.ok(pressed(new Set(['ArrowLeft']),'pulse',c));
});
test('soak input stream reproducible and independent; direction lasts thirty ticks',()=>{
 const a=inputGenerator(7),b=inputGenerator(7);let first;
 for(let i=0;i<90;i++){const x=a(),y=b();assert.deepEqual(x,y);if(i===0)first=x.move;if(i<30)assert.deepEqual(x.move,first);for(const k of ['jump','dash','pulse','interact'])assert.equal(typeof x[k],'boolean');}
});
