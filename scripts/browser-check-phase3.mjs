(async()=>{
 if(document.hidden)throw Error('Restore visible browser before QA');
 const lab=window.__lab,results=[],assert=(c,m)=>{if(!c)throw Error(m);},frame=()=>new Promise(requestAnimationFrame);
 const regression=await eval(await(await fetch('/validation/browser-check-phase2.mjs')).text());assert(regression.status==='PASS','prior browser regression failed');
 const fixture=await(await fetch('/validation/phase3-results.json')).json();
 for(const c of fixture.results){lab.start(c.scenario,c.night);const dense=[];let at=0;for(let tick=0;tick<c.final.tick;tick++){let p={};if(c.frames[at]?.tick===tick){const{tick:_,...patch}=c.frames[at++];p=patch;}dense.push(p);}const actual=lab.advance(dense);assert(JSON.stringify(actual)===JSON.stringify(c.final),`parity ${c.name}`);results.push({name:`parity-${c.name}`,pass:true});}
 const empty={random_motes:false,random_shades:false,random_drifters:false,wind_enabled:false,motes:[],shades:[],drifters:[],charms:[]};
 lab.start({...empty,time_left_s:20,player:{invuln_ticks:9999},lanterns:[{id:'L1',pos:[0,0,2],lit:true,fuel:25},{id:'L2',pos:[2,0,2]}],shades:[{id:'S1',pos:[3,0,0]}]},1);lab.pause();
 document.getElementById('pause-settings').click();const toggle=document.getElementById('colorblind');toggle.checked=true;toggle.dispatchEvent(new Event('change'));document.getElementById('close-settings').click();await frame();await frame();
 const objects=[];lab.scene.traverse(o=>{if(o.userData.kind)objects.push(o);});const shade=objects.find(o=>o.userData.kind==='shade');assert(shade.userData.eyes.color.getHex()===0x00b3ff&&shade.userData.outline.color.getHex()===0x00b3ff,'accessible shade colors');
 assert(getComputedStyle(document.getElementById('timer')).color==='rgb(255, 255, 255)','warning not white');assert(!document.getElementById('warning-symbol').hidden,'warning symbol missing');assert(JSON.parse(localStorage.getItem('dao-settings')).colorblind===true,'palette not saved');
 const lit=objects.find(o=>o.userData.kind==='lantern'&&o.position.x===0&&o.position.z===2),off=objects.find(o=>o.userData.kind==='lantern'&&o.position.x===2&&o.position.z===2);
 assert(lit.userData.body.scale.y===1&&lit.userData.fuelBar.visible,'lit fuelbar missing');assert(off.userData.body.scale.y===.8&&off.userData.tear.visible&&!off.userData.fuelBar.visible,'unlit noncolor state missing');
 const intensities=new Set(),lamp=lit.children.find(o=>o.isPointLight),begin=performance.now();while(performance.now()-begin<1200){await frame();intensities.add(lamp.intensity);}assert(intensities.has(24)&&intensities.has(5),'lowfuel blink did not alternate');
 results.push({name:'palette-fuelbar-torn-collapse-blink',pass:true,eye:shade.userData.eyes.color.getHexString(),warning:getComputedStyle(document.getElementById('timer')).color,off_scale:off.userData.body.scale.y,intensities:[...intensities]});
 lab.start({...empty,player:{carried:5},lanterns:[{id:'L1',pos:[0,0,1],ever_lit:true}]},1);lab.advance([{interact:true}]);await frame();assert(document.getElementById('capacity').textContent==='12','dynamiccapacityHUD');assert(document.querySelectorAll('#mote-slots i').length===12,'capacityslots');results.push({name:'relight-capacity-HUD',pass:true});
 lab.start({...empty,lanterns:Array.from({length:5},(_,i)=>({id:`L${i+1}`,lit:true}))},1);lab.advance([{}]);assert(lab.snapshot().state==='playing'&&document.getElementById('result').hidden,'earlywinUI');results.push({name:'no-early-win-UI',pass:true});
 lab.pause();return {status:'PASS',regression,results,viewport:[innerWidth,innerHeight],userAgent:navigator.userAgent};
})()
