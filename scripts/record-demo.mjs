import { browserRuntime } from './browser-runtime.mjs';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
const proof='docs/proof/phase-4';await mkdir('artifacts/demo',{recursive:true});await mkdir('dist/validation',{recursive:true});
const bench=JSON.parse(await readFile('bench.json','utf8')),soak=JSON.parse(await readFile('soak.json','utf8')),browser=JSON.parse(await readFile(`${proof}/browser-results.json`,'utf8'));
const tests=await readFile(`${proof}/tests.log`,'utf8'),replay=await readFile(`${proof}/replay.log`,'utf8');
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
await writeFile('dist/validation/demo-proof.html',`<!doctype html><meta charset="utf-8"><style>body{background:#0e1430;color:#fff;font:22px/1.4 monospace;margin:30px}pre{white-space:pre-wrap}h1{color:#ffcf80;font-size:32px}</style><h1>Đảo Đèn Lồng · Actual verification</h1><pre>${escape(JSON.stringify({bench,soak,browser:browser.status},null,2))}</pre><h1>Unit/CLI + deterministic replay</h1><pre>${escape(tests.slice(-800)+'\n'+replay.slice(-2500))}</pre>`);
const temp=await mkdtemp(join(tmpdir(),'dao-demo-'));let runtime,context;
try{
 runtime=await browserRuntime({server:{dataPath:join(temp,'board.json')}});context=await runtime.browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:'artifacts/demo',size:{width:1280,height:720}}});const page=await context.newPage(),video=page.video();
 await page.goto(runtime.url);await page.waitForTimeout(2000);await page.click('#start');await page.waitForTimeout(2000);await page.click('#enter-night');
 // Actual keyboard play, without lab hooks or scenario injection.
 for(const key of ['w','a','d']){await page.keyboard.down(key);await page.keyboard.press('Space');await page.waitForTimeout(2000);await page.keyboard.up(key);}await page.keyboard.press('Shift');await page.keyboard.press('e');await page.keyboard.press('q');await page.waitForTimeout(3000);await page.keyboard.press('Escape');await page.click('#pause-settings');await page.waitForTimeout(3000);
 await page.goto(`${runtime.url}/?benchmark=1&seed=42&duration=10`);await page.waitForFunction(()=>window.__benchmark?.done,{},{timeout:30000});
 await page.goto(`${runtime.url}/validation/demo-proof.html`);await page.waitForTimeout(9000);await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));await page.waitForTimeout(9000);
 await context.close();context=null;const input=await video.path();
 const ffmpeg=process.env.FFMPEG_PATH||execFileSync('python',['-c','import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())'],{encoding:'utf8'}).trim();
 execFileSync(ffmpeg,['-y','-i',input,'-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart','artifacts/demo/demo.mp4'],{stdio:'pipe',maxBuffer:4*1024*1024});
 const probe=execFileSync(ffmpeg,['-i','artifacts/demo/demo.mp4','-f','null','-'],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
 await writeFile(`${proof}/video.json`,JSON.stringify({path:'Release asset demo.mp4',source:'actual normal UI + real keyboard input; benchmark scene; actual proof files',recording:input,conversion:'FFmpeg libx264 CRF23 yuv420p',exit:0},null,2)+'\n');console.log('Recorded artifacts/demo/demo.mp4');
}finally{await context?.close();await runtime?.close();await rm(temp,{recursive:true,force:true});}
