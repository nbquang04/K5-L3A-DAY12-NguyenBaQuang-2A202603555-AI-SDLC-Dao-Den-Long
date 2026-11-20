import { readFile, writeFile } from 'node:fs/promises';
import { createGame, step } from '../src/core/simulation.mjs';
import { inputGenerator } from './soak-input.mjs';
const args=process.argv.slice(2),options={seed:7,nights:10,out:'soak.json'};
try{
 for(let i=0;i<args.length;i+=2){const k=args[i].slice(2);if(!args[i].startsWith('--')||!(k in options)||args[i+1]===undefined)throw new Error('Usage: --seed 7 --nights 10 --out soak.json');options[k]=k==='out'?args[i+1]:Number(args[i+1]);}
 if(!Number.isSafeInteger(options.seed)||!Number.isSafeInteger(options.nights)||options.nights<1)throw new Error('Invalid seed/nights');
 const tuning=JSON.parse(await readFile('game.contract.json','utf8')).tuning,start=performance.now(),results=[];let memStart,memEnd,crashes=0,g;
 for(let i=0;i<options.nights;i++){
  const night=i%3+1,seed=options.seed+i;g=createGame(tuning,seed,{},night);
  if(global.gc)global.gc();if(i===0)memStart=process.memoryUsage().rss/1048576;
  const input=inputGenerator(seed);try{while(g.state==='playing')step(g,input());results.push({night,seed,result:g.state,reason:g.reason,ticks:g.sim_tick,score:g.score});}catch(e){crashes++;results.push({night,seed,error:e.message});}
  g=null;if(global.gc)global.gc();memEnd=process.memoryUsage().rss/1048576;
 }
 const report={nights:options.nights,crashes,results:results.map(r=>r.result??'crashed'),mem_start_mb:memStart,mem_end_mb:memEnd,duration_s:(performance.now()-start)/1000};await writeFile(options.out,JSON.stringify(report,null,2)+'\n');await writeFile(`${options.out}.details.json`,JSON.stringify({results,node:process.version,flags:process.execArgv,gc:!!global.gc},null,2)+'\n');console.log(JSON.stringify(report));if(crashes)process.exitCode=1;
}catch(e){console.error(e.message);process.exitCode=2;}
