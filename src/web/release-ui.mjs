import { DEFAULT_BINDINGS, bindKey, normalizeBindings } from './settings.mjs';
import * as THREE from 'three';
import { edgeIndicator } from '../shared/edge-indicator.mjs';
export function installReleaseUI({settings,getState,getScores,getMode,menu}){
 const $=id=>document.getElementById(id);settings.bindings=normalizeBindings(settings.bindings);
 settings.reducedMotion=settings.reducedMotion===true;settings.largeText=settings.largeText===true;
 const save=()=>{try{localStorage.setItem('dao-settings',JSON.stringify(settings));}catch{}document.body.classList.toggle('reduced-motion',settings.reducedMotion);document.body.classList.toggle('large-text',settings.largeText);};save();
 $('settings').insertAdjacentHTML('beforeend','<div class="release-options"><label>Giảm chuyển động <input id="reducedMotion" type="checkbox"></label><label>Chữ lớn 125% <input id="largeText" type="checkbox"></label><div id="bindings"></div><p id="binding-status" role="status"></p><button id="reset-bindings" class="secondary">Khôi phục phím mặc định</button></div>');
 const labels={forward:'Tiến',back:'Lùi',left:'Trái',right:'Phải',jump:'Nhảy',dash:'Lướt',interact:'Tương tác',pulse:'Tỏa sáng',pause:'Tạm dừng'};
 let capture=null,submitted=false,spawn=null;
 const keyName=code=>code.replace(/^Key/,'').replace(/^Digit/,'');
 function bindings(){const box=$('bindings');box.replaceChildren();for(const action of Object.keys(DEFAULT_BINDINGS)){const button=document.createElement('button');button.className='secondary';button.dataset.action=action;button.textContent=`${labels[action]}: ${keyName(settings.bindings[action])}`;button.onclick=()=>{capture=action;$('binding-status').textContent=`${labels[action]}: nhấn phím mới`;};box.append(button);}
  document.querySelector('.controls').textContent=`${['forward','back','left','right','jump','dash','interact','pulse','pause'].map(a=>`${labels[a]} ${keyName(settings.bindings[a])}`).join(' · ')} · Kéo chuột xoay`;
 }
 bindings();$('reset-bindings').onclick=()=>{settings.bindings={...DEFAULT_BINDINGS};capture=null;$('binding-status').textContent='Đã khôi phục';bindings();save();};
 for(const id of ['reducedMotion','largeText']){$(id).checked=settings[id];$(id).onchange=()=>{settings[id]=$(id).checked;save();};}
 $('menu-settings').addEventListener('click',()=>{capture=null;});
 const board=document.createElement('section');board.id='leaderboard';board.className='panel result';board.hidden=true;board.innerHTML='<h2>Bảng sáng</h2><ol id="board-entries"></ol><p id="board-error" role="status"></p><button id="close-board" class="primary">Về menu</button>';document.querySelector('main').append(board);
 const button=document.createElement('button');button.id='show-board';button.className='secondary';button.textContent='Bảng xếp hạng';$('welcome').append(button);
 button.onclick=async()=>{$('welcome').hidden=true;board.hidden=false;$('board-error').textContent='';try{const response=await fetch('/api/leaderboard');if(!response.ok)throw new Error('Không đọc được dữ liệu');const data=await response.json();$('board-entries').replaceChildren();for(const e of data.entries){const li=document.createElement('li');li.textContent=`${e.name} · ${e.score} điểm · ${e.nights_won}/3 đêm`;$('board-entries').append(li);}if(!data.entries.length)$('board-error').textContent='Chưa có điểm. Hãy bắt đầu hành trình.';}catch{$('board-error').textContent='Cần chạy Node server để lưu bảng xếp hạng.';}};
 $('close-board').onclick=()=>{board.hidden=true;menu();};
 const form=document.createElement('form');form.id='score-form';form.hidden=true;form.innerHTML='<label>Tên người giữ đèn <input id="player-name" name="name" minlength="3" maxlength="12" pattern="[A-Za-z0-9_]{3,12}" required autocomplete="nickname" placeholder="May_01"></label><button id="save-score" class="secondary" type="submit">Lưu điểm hành trình</button><p id="save-status" role="status"></p>';$('result').append(form);
 form.onsubmit=async e=>{e.preventDefault();if(submitted||!form.reportValidity())return;const scores=getScores(),g=getState();$('save-score').disabled=true;try{const response=await fetch('/api/leaderboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:$('player-name').value,score:scores.reduce((a,b)=>a+b,0),nights_won:scores.filter(v=>v!==null).length,seed:g.seed})});const result=await response.json();if(!response.ok)throw new Error(result.error);submitted=true;$('save-status').textContent='Đã lưu điểm trên máy này.';}catch(e){$('save-status').textContent=e.message;$('save-score').disabled=false;}};
 const captions=document.createElement('div');captions.id='captions';captions.setAttribute('role','status');document.body.append(captions);
 const arrow=document.createElement('div');arrow.id='spawn-arrow';arrow.hidden=true;arrow.textContent='➤';arrow.setAttribute('aria-label','Hướng Bóng Mực vừa xuất hiện');document.body.append(arrow);
 return {
  capture(e){if(getMode()!=='settings'){capture=null;return false;}if(!capture)return false;e.preventDefault();e.stopImmediatePropagation();try{settings.bindings=bindKey(settings.bindings,capture,e.code);capture=null;$('binding-status').textContent='Đã lưu phím';bindings();save();}catch(error){$('binding-status').textContent=error.message;}return true;},
  start(){submitted=false;form.hidden=true;$('save-score').disabled=false;$('save-status').textContent='';spawn=null;},
  finish(won,night){form.hidden=won&&night<3;},
  event(event){if(event.name==='shade_spawned'){const g=getState(),s=g.shades.find(s=>s.id===event.data.id);if(s)spawn={pos:[...s.pos],until:performance.now()+3000};}},
  update(camera){arrow.hidden=true;if(getMode()!=='playing'){captions.textContent='';return;}const g=getState(),messages=[];
   if(g.wind.warning)messages.push('⚠ Gió mạnh sắp đến');if(g.time_left_s<=10)messages.push(`⚠ Còn ${Math.ceil(g.time_left_s)} giây`);
   const low=g.lanterns.filter(l=>l.lit&&l.fuelUnits<1800);if(low.length)messages.push(`⚠ Đèn ít dầu: ${low.map(l=>l.id).join(', ')}`);
   if(spawn&&performance.now()<spawn.until){const v=new THREE.Vector3(...spawn.pos);v.y+=1;v.applyMatrix4(camera.matrixWorldInverse);const behind=v.z>0;
    const projected=new THREE.Vector3(spawn.pos[0],spawn.pos[1]+1,spawn.pos[2]).project(camera),edge=edgeIndicator(projected.x,projected.y,innerWidth,innerHeight,behind);
    arrow.hidden=false;arrow.style.left=`${edge.x}px`;arrow.style.top=`${edge.y}px`;arrow.style.transform=`translate(-50%,-50%) rotate(${edge.angle}rad)`;messages.push('⚠ Bóng Mực vừa xuất hiện');}captions.textContent=messages.join(' · ');
  }
 };
}
