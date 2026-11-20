// Procedural audio, authored for this project; never consumes gameplay randomness.
export class GameAudio {
 constructor(volume=.35){this.volume=volume;this.ctx=null;this.notes=0;this.lastMusic=0;this.effects=0;}
 unlock(){if(!this.ctx){this.ctx=new AudioContext();this.gain=this.ctx.createGain();this.gain.connect(this.ctx.destination);this.setVolume(this.volume);}this.ctx.resume();}
 setVolume(v){this.volume=v;if(this.gain)this.gain.gain.value=v;}
 tone(frequency,duration=.14,type='sine',delay=0){if(!this.ctx)return;const o=this.ctx.createOscillator(),e=this.ctx.createGain(),now=this.ctx.currentTime+delay;o.type=type;o.frequency.setValueAtTime(frequency,now);e.gain.setValueAtTime(0,now);e.gain.linearRampToValueAtTime(.11,now+.012);e.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(e);e.connect(this.gain);o.start(now);o.stop(now+duration+.02);this.notes++;}
 effect(name){const f={mote_picked:880,lantern_lit:523,pulse:220,player_hit:110,jump:440,dash:660,won:784,lost:147,shade_spawned:82,countdown:988,wind:185,charm_picked:1175,drifter_steal:165,drifter_drop:698}[name];if(!f)return;this.effects++;this.tone(f,.2,name==='shade_spawned'?'triangle':'sine');if(['won','lantern_lit','charm_picked'].includes(name)){this.tone(f*1.25,.4,'sine',.12);this.tone(f*1.5,.6,'sine',.24);}}
 music(active){if(!this.ctx)return;const now=this.ctx.currentTime;if(active&&now-this.lastMusic>1.4){const notes=[146.83,220,293.66,329.63,293.66,220,196,164.81];this.tone(notes[this.musicIndex??0],1.3);this.musicIndex=((this.musicIndex??0)+1)%notes.length;this.lastMusic=now;}}
}
