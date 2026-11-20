import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const root=resolve(process.argv[2]||'artifacts/package-smoke'),temp=await mkdtemp(join(tmpdir(),'dao-package-')),dataPath=join(temp,'board.json');
const {startServer}=await import(pathToFileURL(join(root,'scripts/server.mjs')));const server=await startServer({root:join(root,'dist'),port:0,dataPath}),checks=[];
try{
 const url=`http://127.0.0.1:${server.address().port}`;
 for(const path of ['/','/src/web/main.mjs','/src/shared/edge-indicator.mjs','/vendor/three.module.js','/api/leaderboard']){const r=await fetch(url+path);assert.equal(r.status,200,path);checks.push({path,status:r.status});}
 const input={name:'Smoke',score:100,nights_won:1,seed:42};const response=await fetch(`${url}/api/leaderboard`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});assert.ok(response.ok);const board=await response.json();
 const out=join(temp,'export.json'),exported=spawnSync(process.execPath,['scripts/serve.mjs','--export-leaderboard',out],{cwd:root,env:{...process.env,LEADERBOARD_PATH:dataPath},encoding:'utf8'});assert.equal(exported.status,0,exported.stderr);assert.deepEqual(JSON.parse(await readFile(out,'utf8')),board);
 const hash=path=>readFile(path).then(data=>({bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')}));
 await writeFile('docs/proof/phase-4/package-smoke.json',JSON.stringify({status:'PASS',root,checks,leaderboard:'POST and packaged CLI export identical',export_exit:exported.status,zip:await hash('artifacts/dao-den-long-v1.0.0.zip'),video:await hash('artifacts/demo/demo.mp4'),node:process.version,platform:process.platform},null,2)+'\n');console.log('PASS extracted package HTTP/API/CLI export; SHA256 recorded');
}finally{await new Promise(done=>server.close(done));await rm(temp,{recursive:true,force:true});}
