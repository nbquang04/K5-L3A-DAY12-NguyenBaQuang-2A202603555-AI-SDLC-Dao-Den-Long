import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const proof=process.env.PROOF_DIR||'docs/proof/phase-4';mkdirSync(proof,{recursive:true});
const run=(args,env=process.env)=>{const r=spawnSync(process.execPath,args,{env,encoding:'utf8',maxBuffer:10*1024*1024});assert.equal(r.status,0,r.stderr);return r;};
const replay=run(['scripts/check-phase3.mjs'],{...process.env,PROOF_DIR:proof});writeFileSync(`${proof}/replay.log`,replay.stdout+replay.stderr);
const soak=run(['--jitless','--max-semi-space-size=1','--expose-gc','scripts/soak.mjs','--seed','7','--nights','10','--out',`${proof}/soak.json`]);writeFileSync(`${proof}/soak.log`,soak.stdout+soak.stderr);
const result=JSON.parse(readFileSync(`${proof}/soak.json`));assert.equal(result.crashes,0);assert.equal(result.results.length,10);assert.ok(result.mem_end_mb<=1.2*result.mem_start_mb,`RSS ratio ${result.mem_end_mb/result.mem_start_mb}`);
console.log('PASS: 22 retained replay scenarios, ten same-process seeded nights, RSS <=120%');
