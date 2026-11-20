export class DataError extends Error {}
const fail = message => { throw new DataError(message); };
const object = (v, name) => { if (!v || typeof v !== 'object' || Array.isArray(v)) fail(`${name}: expected object`); };
const keys = (v, allowed, name) => { object(v, name); for (const k of Object.keys(v)) if (!allowed.includes(k)) fail(`${name}: unknown field ${k}`); };
const number = (v, name, min = -Infinity, max = Infinity, integer = false) => {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max || (integer && !Number.isSafeInteger(v))) fail(`${name}: invalid number`);
};
const boolean = (v, name) => { if (typeof v !== 'boolean') fail(`${name}: expected boolean`); };
const vector = (v, n, name, min = -Infinity, max = Infinity) => {
  if (!Array.isArray(v) || v.length !== n) fail(`${name}: expected ${n}-vector`);
  v.forEach((x, i) => number(x, `${name}[${i}]`, min, max));
};
const array = (v, name) => { if (!Array.isArray(v)) fail(`${name}: expected array`); };
export function validateInputPatch(frame, withTick = false) {
  keys(frame, ['move', 'cam_yaw_deg', 'jump', 'interact', 'pulse', 'dash', 'pause', ...(withTick ? ['tick'] : [])], 'input');
  if (withTick) number(frame.tick, 'tick', 0, Number.MAX_SAFE_INTEGER, true);
  if ('move' in frame) vector(frame.move, 2, 'move', -1, 1);
  if ('cam_yaw_deg' in frame) number(frame.cam_yaw_deg, 'cam_yaw_deg');
  for (const key of ['jump', 'interact', 'pulse', 'dash', 'pause']) if (key in frame) boolean(frame[key], key);
}
export function validateInputs(value) {
  keys(value, ['frames'], 'inputs'); array(value.frames, 'frames');
  let previous = -1;
  for (const frame of value.frames) {
    validateInputPatch(frame, true);
    if (frame.tick <= previous) fail('frames.tick must be strictly increasing');
    previous = frame.tick;
  }
  return value;
}
export function validateScenario(s, t, night = 1) {
  keys(s, ['player', 'random_motes', 'random_shades', 'random_drifters', 'wind_enabled', 'motes', 'shades', 'lanterns', 'time_left_s', 'drifters', 'charms'], 'scenario');
  if ('player' in s) {
    keys(s.player, ['pos', 'carried', 'flames', 'invuln_ticks', 'dash_cd_ticks', 'pulse_cd_ticks', 'charm_ticks'], 'player');
    for (const k of ['invuln_ticks', 'dash_cd_ticks', 'pulse_cd_ticks', 'charm_ticks']) if(k in s.player) number(s.player[k],k,0,Number.MAX_SAFE_INTEGER,true);
    if ('pos' in s.player) vector(s.player.pos, 3, 'player.pos');
    if ('carried' in s.player) number(s.player.carried, 'player.carried', 0, t.carry_capacity, true);
    if ('flames' in s.player) number(s.player.flames, 'player.flames', 0, t.flames, true);
  }
  for (const key of ['random_motes', 'random_shades', 'random_drifters', 'wind_enabled']) if (key in s) boolean(s[key], key);
  if ('time_left_s' in s) number(s.time_left_s, 'time_left_s', 0);
  if ('motes' in s) { array(s.motes, 'motes'); s.motes.forEach(p => vector(p, 3, 'mote.pos')); }
  if ('shades' in s) {
    array(s.shades, 'shades'); const ids = new Set();
    for (const shade of s.shades) {
      keys(shade, ['id', 'pos', 'state', 'state_ticks_left'], 'shade'); vector(shade.pos, 3, 'shade.pos');
      if('state' in shade && !['spawning','wander','chase','recoil','stunned'].includes(shade.state)) fail('invalid shade.state');
      if('state_ticks_left' in shade) number(shade.state_ticks_left,'state_ticks_left',0,Number.MAX_SAFE_INTEGER,true);
      if ('id' in shade) {
        if (typeof shade.id !== 'string' || !shade.id.length || ids.has(shade.id)) fail('shade.id must be unique nonempty string');
        ids.add(shade.id);
      }
    }
  }
  if ('lanterns' in s) {
    array(s.lanterns, 'lanterns'); const ids = new Set();
    for (const l of s.lanterns) {
      keys(l, ['id', 'pos', 'deposited', 'lit'], 'lantern');
      if (!Array.from({length:night+4},(_,i)=>`L${i+1}`).includes(l.id) || ids.has(l.id)) fail('lantern.id must be unique and valid for night');
      ids.add(l.id);
      if ('pos' in l) vector(l.pos, 3, 'lantern.pos');
      if ('deposited' in l) number(l.deposited, 'lantern.deposited', 0, t.lantern_cost, true);
      if ('lit' in l) boolean(l.lit, 'lantern.lit');
    }
  }
  for(const name of ['drifters','charms']) if(name in s){
    array(s[name],name);const ids=new Set();
    for(const v of s[name]){
      keys(v,name==='drifters'?['id','pos','state','stolen','state_ticks_left']:['id','pos','available','respawn_ticks'],name);
      if(name==='drifters'||'pos' in v)vector(v.pos,3,`${name}.pos`);
      if('id' in v){if(typeof v.id!=='string'||!v.id.length||ids.has(v.id))fail('invalid/duplicate entity id');ids.add(v.id);}
      else if(name==='charms')fail('charm.id required');
      if('state' in v&&!['idle','chase','flee'].includes(v.state))fail('invalid drifter.state');
      if('stolen' in v)number(v.stolen,'stolen',0,3,true);
      for(const k of ['state_ticks_left','respawn_ticks'])if(k in v)number(v[k],k,0,Number.MAX_SAFE_INTEGER,true);
      if('available' in v)boolean(v.available,'available');
    }
  }
  return s;
}
