(async () => {
  if (document.hidden) throw new Error('Browser tab is hidden; restore the Orca window before live keyboard verification');
  const results = [];
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const fixture = async name => (await fetch(`/validation/${name}.json`)).json();
  const empty = { random_motes: false, random_shades: false, motes: [], shades: [] };
  window.__lab.start();
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
  await new Promise(resolve => setTimeout(resolve, 1000));
  window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }));
  window.__lab.pause();
  const walk = window.__lab.snapshot();
  assert(walk.player.pos[2] > 4, 'W did not move player');
  assert(walk.player.carried > 0, 'Walking did not pick motes');
  results.push({ name: 'keyboard-forward-pickup', pass: true, pos: walk.player.pos, carried: walk.player.carried });

  window.__lab.start(empty); window.__lab.pause();
  const up = window.__lab.advance([{ jump: true }]); assert(up.player.pos[1] > 0, 'Jump did not leave ground');
  const land = window.__lab.advance(Array.from({ length: 120 }, () => ({}))); assert(land.player.pos[1] === 0, 'Held jump repeated');
  results.push({ name: 'jump-and-land', pass: true });

  for (const scenario of ['hit', 'dawn']) {
    window.__lab.start(await fixture(scenario)); window.__lab.pause();
    const state = window.__lab.advance([{}]);
    assert(state.state === 'lost' && !document.getElementById('result').hidden, `${scenario} result UI missing`);
    document.getElementById('restart').click(); window.__lab.pause();
    const reset = window.__lab.snapshot();
    assert(reset.tick === 0 && reset.state === 'playing' && reset.player.flames === 3 && reset.player.carried === 0 && reset.score === 0 && reset.lanterns.every(l => !l.lit), 'Restart did not reset');
    results.push({ name: `${scenario}-loss-ui-and-restart`, pass: true });
  }
  window.__lab.start({ ...empty, player: { carried: 2 }, shades: [{ id: 'S1', pos: [2, 0, 0] }] }); window.__lab.pause();
  const pulse = window.__lab.advance([{ pulse: true }]);
  assert(pulse.player.carried === 0 && pulse.shades[0].state === 'stunned', 'Pulse UI state mismatch');
  results.push({ name: 'pulse-render-state', pass: true });

  const inputs = await fixture('default-play.inputs'); const expected = await fixture('scenario-results');
  window.__lab.start(); window.__lab.pause();
  const final = window.__lab.advance(inputs.frames.map(({ tick, ...patch }) => patch));
  assert(JSON.stringify(final) === JSON.stringify(expected.finalSnapshot), 'Browser/CLI final snapshot mismatch');
  assert(window.__lab.mode === 'result' && !document.getElementById('result').hidden, 'Win screen missing');
  assert(document.getElementById('final-score').textContent === String(final.score), 'Result HUD score mismatch');
  results.push({ name: 'default-play-win-cli-parity', pass: true, tick: final.tick, score: final.score, lit: final.lanterns.filter(l => l.lit).length });
  return { status: 'PASS', results, renderer: window.__lab.renderer, viewport: [innerWidth, innerHeight], userAgent: navigator.userAgent };
})()
