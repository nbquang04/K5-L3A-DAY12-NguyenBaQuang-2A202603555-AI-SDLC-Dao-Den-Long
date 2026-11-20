import { writeFile } from 'node:fs/promises';
import { platform, release, arch } from 'node:os';
import { browserRuntime } from './browser-runtime.mjs';
const o={seed:42,duration:30,out:'bench.json'},args=process.argv.slice(2);let runtime;
try{
 for(let i=0;i<args.length;i+=2){const k=args[i].slice(2);if(!args[i].startsWith('--')||!(k in o)||args[i+1]===undefined)throw new Error('Usage: --seed 42 --duration 30 --out bench.json');o[k]=k==='out'?args[i+1]:Number(args[i+1]);}
 if(!Number.isSafeInteger(o.seed)||!Number.isFinite(o.duration)||o.duration<=0)throw new Error('Invalid seed/duration');
 runtime=await browserRuntime();const page=await runtime.browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});let load;
 await page.exposeFunction('benchmarkFirstFrame',()=>{load=process.uptime()*1000;});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`${runtime.url}/?benchmark=1&seed=${o.seed}&duration=${o.duration}`);
 await page.waitForFunction(()=>window.__benchmark?.done,{},{timeout:(o.duration+60)*1000});
 const measured=await page.evaluate(()=>({data:window.__benchmark,renderer:document.querySelector('canvas').getContext('webgl2').getParameter(7937)}));
 if(errors.length)throw new Error(errors.join('\n'));const {avg_fps,p1_low_fps,frame_ms_p95,frames}=measured.data;
 const report={contract_version:'1.3',avg_fps,p1_low_fps,frame_ms_p95,frames,load_ms:load,peak_mem_mb:null,vsync_off:false,renderer:`Three.js 0.181.2 / ${measured.renderer}`,os:`${platform()} ${release()} ${arch()}`};
 await writeFile(o.out,JSON.stringify(report,null,2)+'\n');await writeFile(`${o.out}.frames.json`,JSON.stringify({...measured.data,browser:runtime.executablePath,seed:o.seed,duration:o.duration,viewport:[1280,720],errors},null,2)+'\n');console.log(JSON.stringify(report));
}catch(e){console.error(e.stack);process.exitCode=2;}finally{await runtime?.close();}
