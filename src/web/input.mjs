// The camera looks toward +Z at yaw=0, so screen-right is world -X.
// Keep the CLI/core contract (+X for input x=+1); adapt keyboard axes here.
import { pressed, DEFAULT_BINDINGS } from './settings.mjs';
export function keyboardInput(keys, yaw, bindings=DEFAULT_BINDINGS) {
  const down=action=>pressed(keys,action,bindings);
  return {
    move: [(down('left') ? 1 : 0) - (down('right') ? 1 : 0), (down('forward') ? 1 : 0) - (down('back') ? 1 : 0)],
    cam_yaw_deg: yaw,
    jump: down('jump'), interact: down('interact'), pulse: down('pulse'), dash: down('dash'),
  };
}
