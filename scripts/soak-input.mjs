export function inputGenerator(seed){
 let state=(seed>>>0)||0x6d2b79f5,tick=0,move=[0,0];const random=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};
 return ()=>{if(tick++%30===0){const a=random()*Math.PI*2;move=[Math.sin(a),Math.cos(a)];}return {move:[...move],jump:random()<.05,dash:random()<.03,pulse:random()<.02,interact:random()<.1};};
}
