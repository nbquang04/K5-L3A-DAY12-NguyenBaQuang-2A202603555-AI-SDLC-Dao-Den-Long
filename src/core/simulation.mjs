import {validateInputPatch,validateScenario} from './validation.mjs';
import {mapFor,surfaces,moveHorizontal} from './maps.mjs';
export const HZ=60;
export const capacity=g=>Math.min(g.t.capacity_max,g.t.carry_capacity+2*g.player.successful_lights);
export const isSafeLantern=(g,l)=>l.lit&&l.fuelUnits>=g.t.low_fuel_threshold*HZ;
export const lightingCost=(g,l)=>l.ever_lit?g.t.relight_cost:g.t.lantern_cost;
const fuelValue=l=>Math.round(l.fuelUnits/HZ*10)/10;
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const direction=(a,b)=>{const d=dist(a,b);return d>1e-12?[(b[0]-a[0])/d,(b[2]-a[2])/d]:[1,0];};
const initialInput=()=>({move:[0,0],cam_yaw_deg:0,jump:false,interact:false,pulse:false,dash:false,pause:false});
function random(g){let x=g.rng>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;g.rng=x>>>0;return g.rng/4294967296;}
const order=(a,b)=>{const x=/^([A-Z]+)(\d+)$/.exec(a.id),y=/^([A-Z]+)(\d+)$/.exec(b.id);return x&&y&&x[1]===y[1]?Number(x[2])-Number(y[2]):a.id<b.id?-1:a.id>b.id?1:0;};
function id(g,list,prefix,key){let value;do{value=`${prefix}${g[key]++}`;}while(list.some(v=>v.id===value)||g.reservedIds?.has(value));return value;}
function mote(g,pos,kind='random',ttl=0){g.motes.push({id:id(g,g.motes,'M','nextMote'),pos:[...pos],kind,ttl,born:g.sim_tick});}
function shade(g,s){g.shades.push({id:s.id??id(g,g.shades,'S','nextShade'),pos:[...s.pos],state:s.state??'spawning',stateLeft:s.state_ticks_left??1,drainTicks:0,pushLeft:0,pushDir:[1,0],wander:random(g)*Math.PI*2,born:g.sim_tick,...s});}
function drop(g,amount,pos){for(let i=0;i<amount;i++){const a=random(g)*Math.PI*2,r=1.5+random(g);const x=pos[0]+Math.cos(a)*r,z=pos[2]+Math.sin(a)*r;const ys=surfaces(g.night,x,z).filter(y=>y<=pos[1]+1.5);mote(g,[x,ys.length?Math.max(...ys):pos[1],z],'dropped',480);}}
export function createGame(tuning,seed=42,scenario={},night=1){
 validateScenario(scenario,tuning,night);const map=mapFor(night),t=structuredClone(tuning);
 const p={pos:night===3?[0,0,-30]:[0,0,0],vel:[0,0,0],grounded:true,carried:0,successful_lights:0,flames:t.flames,invuln:0,dashCd:0,pulseCd:0,charm:0,respawn:0,dashLeft:0,facing:[0,1],dashDir:[0,1],launch:null};
 const g={t,map,night,seed,rng:(seed>>>0)||0x6d2b79f5,tick:0,sim_tick:0,state:'playing',score:0,time_left_s:scenario.time_left_s??t[`night${night}_duration_s`],input:initialInput(),player:p,motes:[],shades:[],drifters:[],charms:map.charms.map((pos,i)=>({id:`C${i+1}`,pos,available:true,respawn:0})),lanterns:map.lanterns.map((pos,i)=>({id:`L${i+1}`,pos,lit:false,deposited:0,fuelUnits:0,ever_lit:false,relit_count:0})),nextMote:1,nextShade:1,nextDrifter:1,wind:{active:false,dir_deg:0,warning:false},random_motes:scenario.random_motes??true,random_shades:scenario.random_shades??true,random_drifters:scenario.random_drifters??true,wind_enabled:scenario.wind_enabled??true};
 g.startTime=g.time_left_s;g.reservedIds=new Set([...(scenario.shades??[]),...(scenario.drifters??[])].map(s=>s.id).filter(Boolean));
 if(scenario.player){const s=structuredClone(scenario.player);for(const k of ['pos','carried','flames','successful_lights'])if(k in s)p[k]=s[k];for(const [key,to]of Object.entries({invuln_ticks:'invuln',dash_cd_ticks:'dashCd',pulse_cd_ticks:'pulseCd',charm_ticks:'charm'}))p[to]=s[key]??0;}
 p.grounded=surfaces(night,...[p.pos[0],p.pos[2]]).some(y=>Math.abs(y-p.pos[1])<1e-8);
 for(const patch of scenario.lanterns??[]){
  const l=g.lanterns.find(v=>v.id===patch.id);Object.assign(l,structuredClone(patch));
  l.ever_lit=patch.ever_lit??false;
  if(l.lit){l.ever_lit=true;l.deposited=patch.deposited??(patch.ever_lit?t.relight_cost:t.lantern_cost);}
  else if(l.deposited===lightingCost(g,l)){l.lit=true;l.ever_lit=true;}
  l.fuelUnits=l.lit?Math.round((patch.fuel??t.fuel_max)*HZ):0;delete l.fuel;
 }
 if(scenario.motes)scenario.motes.forEach(pos=>mote(g,pos));else if(g.random_motes){const points=[...map.motePoints];for(let i=0;i<t.initial_motes&&points.length;i++){const at=Math.floor(random(g)*points.length);mote(g,points.splice(at,1)[0]);}}
 for(const s of scenario.shades??[])shade(g,{...s,state:s.state??'chase',state_ticks_left:s.state_ticks_left??0});
 if(scenario.drifters)g.drifters=scenario.drifters.map(s=>({id:s.id??id(g,g.drifters,'D','nextDrifter'),pos:[...s.pos],state:s.state??'idle',stolen:s.stolen??0,stateLeft:s.state_ticks_left??0,wander:random(g)*Math.PI*2,born:0}));
 if(scenario.charms)g.charms=scenario.charms.map(s=>({id:s.id,pos:s.pos??map.charms[Number(s.id.slice(1))-1]??[0,0,0],available:s.available??true,respawn:s.respawn_ticks??0}));
 return g;
}
function outsideSafety(g,pos){
 const circles=g.lanterns.filter(l=>isSafeLantern(g,l)),r=g.t.safe_radius+1e-7;
 const clear=p=>circles.every(l=>dist(p,l.pos)>=g.t.safe_radius);if(clear(pos))return pos;
 const candidates=[];for(const l of circles){const d=direction(l.pos,pos);candidates.push([l.pos[0]+d[0]*r,pos[1],l.pos[2]+d[1]*r]);}
 for(let i=0;i<circles.length;i++)for(let j=i+1;j<circles.length;j++){const a=circles[i].pos,b=circles[j].pos,d=dist(a,b);if(d<1e-12||d>2*r)continue;const h=Math.sqrt(Math.max(0,r*r-d*d/4)),mx=(a[0]+b[0])/2,mz=(a[2]+b[2])/2,nx=-(b[2]-a[2])/d,nz=(b[0]-a[0])/d;candidates.push([mx+nx*h,pos[1],mz+nz*h],[mx-nx*h,pos[1],mz-nz*h]);}
 return candidates.filter(clear).sort((a,b)=>dist(a,pos)-dist(b,pos))[0]??[Math.max(...circles.map(l=>l.pos[0]+r))+1,pos[1],pos[2]];
}
function moveEnemy(g,s,dir,speed,safe=true){const old=s.pos;s.pos=moveHorizontal(g.night,old,dir[0]*speed/HZ,dir[1]*speed/HZ,true);const ground=surfaces(g.night,s.pos[0],s.pos[2]).filter(y=>Math.abs(y-old[1])<.2);if(!ground.length)s.pos=old;else s.pos[1]=Math.max(...ground);if(safe)s.pos=outsideSafety(g,s.pos);}
export function step(g,patch={}){
 if(g.state==='won'||g.state==='lost')return [];
 validateInputPatch(patch);const prev=g.input,input={...prev,...patch};g.input=input;const edge=k=>input[k]&&!prev[k],p=g.player,t=g.t,events=[];
 g.tick++;const event=(name,data={})=>events.push({type:'event',tick:g.tick,name,data});
 if(edge('pause')){g.state=g.state==='paused'?'playing':'paused';event(g.state==='paused'?'paused':'resumed');}
 if(g.state==='paused')return events;
 g.sim_tick++;if(g.sim_tick===1)event('night_start',{night:g.night});g.time_left_s=Math.max(0,g.startTime-g.sim_tick/HZ);
 // Step 2: aggregate all start-of-tick drainers, then extinguish before interaction.
 for(const l of g.lanterns){
  if(!l.lit)continue;
  const draining=g.shades.filter(v=>v.state==='drain'&&v.target_lantern_id===l.id&&dist(v.pos,l.pos)<=2&&l.fuelUnits<t.low_fuel_threshold*HZ);
  l.fuelUnits=Math.max(0,l.fuelUnits-t.fuel_decay_per_s-draining.length*t.drain_per_s);
  for(const shade of draining){shade.drainTicks++;if(shade.drainTicks%HZ===0)event('fuel_drain',{lantern_id:l.id,shade_id:shade.id,fuel:fuelValue(l)});}
  if(l.fuelUnits===0){l.lit=false;l.deposited=0;event('lantern_out',{lantern_id:l.id});}
 }
 for(const k of ['invuln','dashCd','pulseCd','charm'])p[k]=Math.max(0,p[k]-1);
 for(const s of [...g.shades,...g.drifters])s.stateLeft=Math.max(0,s.stateLeft-1);
 g.motes=g.motes.filter(m=>m.kind!=='dropped'||--m.ttl>0);
 for(const c of g.charms)if(!c.available&&c.respawn>0&&--c.respawn===0)c.available=true;
 if(g.night===3&&g.wind_enabled){const cycle=g.sim_tick%1800;if(cycle===1680){g.wind.dir_deg=random(g)*360;g.wind.warning=true;}if(cycle===0){g.wind.active=true;g.wind.warning=false;}if(cycle===300)g.wind.active=false;}
 let disabled=false;
 if(p.respawn>0){disabled=true;if(--p.respawn===0){p.pos=g.night===3?[0,0,-30]:[0,0,0];p.vel=[0,0,0];p.grounded=true;p.invuln=90;p.launch=null;p.dashLeft=0;}}
 if(!disabled){
  let [mx,mz]=input.move;const len=Math.hypot(mx,mz);if(len>1){mx/=len;mz/=len;}const a=input.cam_yaw_deg*Math.PI/180,dx=mx*Math.cos(a)+mz*Math.sin(a),dz=-mx*Math.sin(a)+mz*Math.cos(a);
  if(Math.hypot(dx,dz)>1e-12)p.facing=direction([0,0,0],[dx,0,dz]);
  if(edge('jump')&&p.grounded){p.vel[1]=t.jump_speed;p.grounded=false;}
  if(edge('dash')&&p.dashLeft===0&&(p.charm>0||p.dashCd===0)){p.dashLeft=12;p.dashCd=p.charm>0?0:90;p.dashDir=[...p.facing];event('dash');}
  if(p.grounded&&!p.launch){const pad=g.map.pads.find(v=>dist(p.pos,v.pos)<=1&&Math.abs(p.pos[1]-v.pos[1])<=.1);if(pad){const d=direction(pad.pos,pad.target);p.launch=[d[0]*pad.speed,d[1]*pad.speed];p.vel[1]=pad.vy;p.grounded=false;}}
  const speed=p.charm>0?7.2:t.player_speed;
  let vx=p.launch?.[0]??dx*speed,vz=p.launch?.[1]??dz*speed;
  const dashing=p.dashLeft>0;if(dashing){vx=p.dashDir[0]*t.dash_speed;vz=p.dashDir[1]*t.dash_speed;}
  if(g.wind.active){const wa=g.wind.dir_deg*Math.PI/180;vx+=Math.cos(wa)*2;vz+=Math.sin(wa)*2;}
  p.vel[0]=vx;p.vel[2]=vz;const oldY=p.pos[1];p.pos=moveHorizontal(g.night,p.pos,vx/HZ,vz/HZ,p.grounded&&!dashing);
  const ground=surfaces(g.night,p.pos[0],p.pos[2]);
  if(p.grounded&&!ground.some(y=>Math.abs(y-p.pos[1])<.17))p.grounded=false;
  if(!p.grounded&&!dashing){p.vel[1]-=t.gravity/HZ;p.pos[1]+=p.vel[1]/HZ;const landing=ground.filter(y=>y<=oldY+1e-9&&y>=p.pos[1]-1e-9);if(p.vel[1]<=0&&landing.length){p.pos[1]=Math.max(...landing);p.vel[1]=0;p.grounded=true;p.launch=null;}}
  if(dashing)p.dashLeft--;
  if(p.pos[1]<-10){const lost=p.carried;p.flames=Math.max(0,p.flames-1);p.carried=0;p.respawn=60;p.vel=[0,0,0];p.dashLeft=0;p.launch=null;disabled=true;event('player_hit',{by:'fall',flames:p.flames,dropped:0,lost});}
 }
 if(!disabled){
  g.motes=g.motes.filter(m=>{if(m.born<g.sim_tick&&p.carried<capacity(g)&&dist(p.pos,m.pos)<=t.pickup_radius&&Math.abs(p.pos[1]-m.pos[1])<=1.5){p.carried++;event('mote_picked',{carried:p.carried});return false;}return true;});
  for(const c of g.charms)if(c.available&&dist(p.pos,c.pos)<=t.pickup_radius&&Math.abs(p.pos[1]-c.pos[1])<=1.5){c.available=false;c.respawn=2700;p.charm=600;event('charm_picked',{charm_id:c.id,charm_ticks:600});}
  if(edge('interact')&&p.carried){
   const l=g.lanterns.filter(l=>(!l.lit||l.fuelUnits<t.fuel_max*HZ)&&dist(p.pos,l.pos)<=t.interact_radius).sort((a,b)=>dist(a.pos,p.pos)-dist(b.pos,p.pos)||order(a,b))[0];
   if(l&&l.lit){
    const amount=Math.min(p.carried,Math.ceil((t.fuel_max*HZ-l.fuelUnits)/(t.fuel_per_mote*HZ)));
    if(amount>0){p.carried-=amount;l.fuelUnits=Math.min(t.fuel_max*HZ,l.fuelUnits+amount*t.fuel_per_mote*HZ);g.score+=amount*t.score.per_mote;event('refuel',{lantern_id:l.id,amount,fuel:fuelValue(l)});}
   }else if(l){
    const cost=lightingCost(g,l),amount=Math.min(p.carried,cost-l.deposited);p.carried-=amount;l.deposited+=amount;g.score+=amount*t.score.per_mote;event('deposit',{lantern_id:l.id,amount,deposited:l.deposited});
    if(l.deposited===cost){const relight=l.ever_lit;l.lit=true;l.fuelUnits=t.fuel_max*HZ;l.ever_lit=true;if(relight)l.relit_count++;p.successful_lights++;g.score+=relight?t.score.per_relight:t.score.per_lantern;event('lantern_lit',{lantern_id:l.id,relight});}
   }
  }
 }
 for(const s of g.shades){s.eject=false;const out=outsideSafety(g,s.pos);if(dist(out,s.pos)>1e-8){s.pos=out;s.eject=true;}}
 if(!disabled&&edge('pulse')&&p.carried>=t.pulse_cost&&p.pulseCd===0){p.carried-=t.pulse_cost;p.pulseCd=180;const stunned_ids=[];const inPulse=s=>Math.hypot(s.pos[0]-p.pos[0],s.pos[1]-p.pos[1],s.pos[2]-p.pos[2])<=t.pulse_radius;
  for(const s of g.shades)if(inPulse(s)){g.score+=s.state==='drain'?t.score.per_drain_stun:t.score.per_stun;s.state='stunned';s.stateLeft=120;s.pushLeft=15;s.pushDir=direction(p.pos,s.pos);stunned_ids.push(s.id);s.drainTicks=0;}
  for(const d of g.drifters)if(inPulse(d)){if(d.state==='chase'){d.state='flee';d.stateLeft=240;}else if(d.state==='flee'&&d.stolen>0){const amount=d.stolen;for(let i=0;i<amount;i++)mote(g,d.pos,'dropped',480);d.stolen=0;d.stateLeft=120;event('drifter_drop',{drifter_id:d.id,amount});}}
  event('pulse',{stunned_ids});
 }
 for(const s of g.shades){if(s.born===g.sim_tick)continue;
  const playerDistance=dist(s.pos,p.pos);
  if(s.state==='stunned'||s.state==='spawning'){if(s.stateLeft===0)s.state='wander';}
  if(s.state==='drain'){
   const target=g.lanterns.find(l=>l.id===s.target_lantern_id);
   if(playerDistance<=6)s.state='chase';
   else if(!target||!target.lit||target.fuelUnits>=t.low_fuel_threshold*HZ||dist(s.pos,target.pos)>2)s.state='wander';
  }
  if(s.state!=='drain')s.drainTicks=0;
  if(s.state==='stunned'){if(s.pushLeft>0){moveEnemy(g,s,s.pushDir,t.pulse_push_m*HZ/15);s.pushLeft--;}}
  else if(s.state==='recoil'){moveEnemy(g,s,s.pushDir,2);if(s.stateLeft===0)s.state='wander';}
  else if(s.state==='wander'||s.state==='chase'){
   if(s.state==='chase'&&playerDistance>18)s.state='wander';
   if(s.state==='wander'&&playerDistance<=12)s.state='chase';
   if(s.state==='chase')moveEnemy(g,s,direction(s.pos,p.pos),Math.min(playerDistance*HZ,g.night===3?4.5:t.shade_speed));
   else{
    const weak=g.lanterns.filter(l=>l.lit&&l.fuelUnits<t.low_fuel_threshold*HZ);
    const targets=weak.length?weak:g.lanterns.filter(l=>!l.lit);
    const target=targets.sort((a,b)=>dist(s.pos,a.pos)-dist(s.pos,b.pos)||order(a,b))[0];
    if(target){s.target_lantern_id=target.id;const distance=dist(s.pos,target.pos);moveEnemy(g,s,direction(s.pos,target.pos),Math.min(2,distance*HZ));if(target.lit&&target.fuelUnits<t.low_fuel_threshold*HZ&&dist(s.pos,target.pos)<=2){s.state='drain';s.drainTicks=0;}}
   }
  }
 }
 for(const d of g.drifters){if(d.born===g.sim_tick)continue;if(d.state==='flee'){if(d.stateLeft===0){d.state='removed';continue;}const v=direction(p.pos,d.pos);d.pos[0]+=v[0]*7/HZ;d.pos[2]+=v[1]*7/HZ;}
  else{d.state=p.carried>=5&&dist(d.pos,p.pos)<=15?'chase':'idle';const v=d.state==='chase'?direction(d.pos,p.pos):[Math.cos(d.wander),Math.sin(d.wander)];const speed=d.state==='chase'?7:2;d.pos[0]+=v[0]*speed/HZ;d.pos[2]+=v[1]*speed/HZ;}
 }
 if(!disabled){for(const d of [...g.drifters].sort(order))if(d.state==='chase'&&d.born<g.sim_tick&&dist(d.pos,p.pos)<=1.2){const amount=Math.min(3,p.carried);p.carried-=amount;d.stolen=amount;d.state='flee';d.stateLeft=240;event('drifter_steal',{drifter_id:d.id,amount,carried:p.carried});}
  const safe=g.lanterns.some(l=>isSafeLantern(g,l)&&dist(p.pos,l.pos)<=t.safe_radius);
  for(const s of [...g.shades].sort(order))if(!safe&&!s.eject&&p.invuln===0&&p.flames>0&&!['stunned','spawning','recoil','drain'].includes(s.state)&&s.born<g.sim_tick&&dist(p.pos,s.pos)<=t.shade_hit_radius&&Math.abs(p.pos[1]-s.pos[1])<=1.5){p.flames--;p.invuln=90;const amount=Math.floor(p.carried/2);p.carried-=amount;drop(g,amount,p.pos);s.state='recoil';s.stateLeft=60;s.pushDir=direction(p.pos,s.pos);event('player_hit',{by:'shade',flames:p.flames,dropped:amount});break;}
 }
 g.drifters=g.drifters.filter(d=>d.state!=='removed');
 if(g.random_motes&&g.sim_tick%240===0&&g.motes.length<t.max_motes){const free=g.map.motePoints.filter(pos=>!g.motes.some(m=>dist(pos,m.pos)<.01&&Math.abs(pos[1]-m.pos[1])<.01));if(free.length)mote(g,free[Math.floor(random(g)*free.length)]);}
 const spawnPoints=()=>g.map.shadePoints.filter(pos=>dist(pos,p.pos)>=15&&!g.lanterns.some(l=>isSafeLantern(g,l)&&dist(pos,l.pos)<t.safe_radius)&&!g.shades.some(s=>dist(pos,s.pos)<1));
 if(g.random_shades&&(g.sim_tick===300||(g.sim_tick>300&&(g.sim_tick-300)%g.map.shadeInterval===0))){const count=g.sim_tick===300?2:1;for(let i=0;i<count&&g.shades.length<g.map.maxShades;i++){const legal=spawnPoints();if(!legal.length)break;shade(g,{pos:legal[Math.floor(random(g)*legal.length)]});event('shade_spawned',{id:g.shades.at(-1).id});}}
 if(g.night>1&&g.random_drifters&&g.sim_tick%1200===0&&g.drifters.length<2){const points=g.map.shadePoints;g.drifters.push({id:id(g,g.drifters,'D','nextDrifter'),pos:[...points[Math.floor(random(g)*points.length)]],state:'idle',stateLeft:0,stolen:0,wander:random(g)*Math.PI*2,born:g.sim_tick});}
 let reason;
 if(p.flames===0){g.state='lost';reason='no_flames';}
 else if(g.time_left_s<=0){if(g.lanterns.filter(l=>l.lit).length>=Math.ceil(t.win_ratio*g.lanterns.length)){g.state='won';reason='dawn_survived';}else{g.state='lost';reason='dawn';}}
 if(reason){g.reason=reason;if(g.state==='won')g.score+=g.lanterns.filter(l=>l.lit).reduce((sum,l)=>sum+t.score.per_lit_at_dawn+Math.floor(l.fuelUnits/HZ),0)+p.flames*t.score.per_flame_left;event('game_over',{result:g.state,reason});}
 return events;
}
const round=v=>{const n=Math.round(v*1000)/1000;return Object.is(n,-0)?0:n;};const pos=p=>p.map(round);
export function snapshot(g){const p=g.player;return {type:'snapshot',tick:g.tick,sim_tick:g.sim_tick,state:g.state,night:g.night,wind:{active:g.wind.active,dir_deg:g.wind.dir_deg},time_left_s:g.time_left_s,score:g.score,player:{pos:pos(p.pos),vel:pos(p.vel),grounded:p.grounded,flames:p.flames,carried:p.carried,capacity:capacity(g),invuln:p.invuln>0,dash_cd_s:p.dashCd/HZ,pulse_cd_s:p.pulseCd/HZ,charm_s:p.charm/HZ},lanterns:g.lanterns.map(l=>({id:l.id,pos:pos(l.pos),lit:l.lit,deposited:l.deposited,fuel:l.lit?fuelValue(l):0,ever_lit:l.ever_lit,relit_count:l.relit_count})),shades:g.shades.map(s=>({id:s.id,pos:pos(s.pos),state:s.state})),motes_active:g.motes.length,motes:g.motes.map(m=>({id:m.id,pos:pos(m.pos),kind:m.kind,ttl_s:m.ttl/HZ})),drifters:g.drifters.map(d=>({id:d.id,pos:pos(d.pos),state:d.state,stolen:d.stolen})),charms:g.charms.map(c=>({id:c.id,available:c.available,respawn_s:c.respawn/HZ}))};}
