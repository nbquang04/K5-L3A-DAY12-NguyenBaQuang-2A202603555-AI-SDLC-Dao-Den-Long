import { frameMetrics } from '../shared/metrics.mjs';
export function benchmarkSession(duration){
 let first,last,samples=[],done=false;
 const result={done:false,scene:{night:1,shades:200,motes:100,lit:3,fuel:100},samples};window.__benchmark=result;
 return {camera(camera,now){if(first===undefined)return camera.position.set(30,15,0),camera.lookAt(0,0,0);const a=(now-first)/1000*Math.PI*2/15;camera.position.set(30*Math.cos(a),15,-30*Math.sin(a));camera.lookAt(0,0,0);},frame(now){
  if(first===undefined){first=last=now;window.benchmarkFirstFrame?.();return;}
  if(done)return;const elapsed=(now-first)/1000;if(elapsed>3&&elapsed<=3+duration&&last>=first+3000)samples.push(now-last);last=now;
  if(elapsed>=3+duration){done=true;Object.assign(result,frameMetrics(samples),{done:true,elapsed_s:elapsed,warmup_s:3});}
 }};
}
