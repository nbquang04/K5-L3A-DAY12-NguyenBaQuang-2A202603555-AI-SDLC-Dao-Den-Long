import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { startServer } from '../scripts/server.mjs';
test('server API rejects invalid/cross-origin, serializes concurrent writes; export after restart',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'dao-api-')),dataPath=join(dir,'board.json');let server=await startServer({port:0,dataPath});
 try{const url=`http://127.0.0.1:${server.address().port}/api/leaderboard`;
  assert.deepEqual(await(await fetch(url)).json(),{entries:[]});
  const submit=(name,score,headers={})=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify({name,score,nights_won:1,seed:42})});
  assert.equal((await submit('bad name',1)).status,400);assert.equal((await submit('May',1,{Origin:'https://other.test'})).status,403);
  const replies=await Promise.all(Array.from({length:12},(_,i)=>submit(`May${i}`,i)));assert.ok(replies.every(r=>r.ok));
  await new Promise(done=>server.close(done));server=await startServer({port:0,dataPath});const rows=await(await fetch(`http://127.0.0.1:${server.address().port}/api/leaderboard`)).json();assert.equal(rows.entries.length,10);assert.equal(rows.entries[0].score,11);
  const out=join(dir,'export.json'),cli=spawnSync(process.execPath,['scripts/serve.mjs','--export-leaderboard',out],{env:{...process.env,LEADERBOARD_PATH:dataPath},encoding:'utf8'});assert.equal(cli.status,0,cli.stderr);assert.deepEqual(JSON.parse(await readFile(out,'utf8')),rows);
 }finally{await new Promise(done=>server.close(done));await rm(dir,{recursive:true,force:true});}
});
