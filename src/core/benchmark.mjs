import { createGame, advanceShadeWander } from './simulation.mjs';
export function createBenchmark(tuning,seed=42){
 const g=createGame(tuning,seed,{random_motes:false,random_shades:false,random_drifters:false,wind_enabled:false});
 let state=(seed>>>0)||0x6d2b79f5;const random=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};
 const pos=()=>{const r=40*Math.sqrt(random()),a=random()*Math.PI*2;return [r*Math.cos(a),0,r*Math.sin(a)];};
 g.shades=Array.from({length:200},(_,i)=>({id:`S${i+1}`,pos:pos(),state:'wander',stateLeft:0,drainTicks:0,born:0}));
 g.motes=Array.from({length:100},(_,i)=>({id:`M${i+1}`,pos:pos(),kind:'random',ttl:0,born:0}));
 for(const l of g.lanterns.slice(0,3)){l.lit=true;l.ever_lit=true;l.fuelUnits=6000;}
 return g;
}
export function stepBenchmark(g){g.tick++;g.sim_tick++;for(const s of g.shades){advanceShadeWander(g,s);s.state='wander';}return g;}
