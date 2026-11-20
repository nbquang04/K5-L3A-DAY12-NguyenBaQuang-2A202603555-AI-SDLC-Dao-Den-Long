// The camera looks toward +Z at yaw=0, so screen-right is world -X.
// Keep the CLI/core contract (+X for input x=+1); adapt keyboard axes here.
export function keyboardInput(keys, yaw) {
  return {
    move: [(keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) - (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0),
      (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0)],
    cam_yaw_deg: yaw,
    jump: keys.has('Space'), interact: keys.has('KeyE'), pulse: keys.has('KeyQ'),
  };
}
