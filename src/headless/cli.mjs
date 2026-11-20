import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createGame, step, snapshot } from '../core/simulation.mjs';
import { DataError, validateInputs, validateScenario } from '../core/validation.mjs';

function parse(args) {
  const allowed = new Set(['seed', 'night', 'scenario', 'inputs', 'ticks', 'out', 'snapshot-every']);
  const result = { seed: 1, 'snapshot-every': 10 };
  for (let i = 0; i < args.length; i += 2) {
    const name = args[i].slice(2);
    if (!args[i].startsWith('--') || !allowed.has(name) || args[i + 1] === undefined || args[i + 1].startsWith('--')) throw new DataError(`Invalid argument: ${args[i]}`);
    if (Object.hasOwn(result, name) && !['seed', 'snapshot-every'].includes(name)) throw new DataError(`Duplicate argument: ${name}`);
    result[name] = args[i + 1];
  }
  for (const name of ['seed', 'night', 'ticks', 'snapshot-every']) {
    const raw = result[name]; const n = Number(raw);
    if (raw === undefined || !/^-?\d+$/.test(String(raw)) || !Number.isSafeInteger(n)) throw new DataError(`${name} must be an integer`);
    result[name] = n;
  }
  if (![1,2,3].includes(result.night) || result.ticks < 0 || result['snapshot-every'] <= 0 || !result.out) throw new DataError('Require --night 1/2/3 --ticks >=0 --out path; snapshot-every >0');
  return result;
}
async function json(path) {
  const raw = await readFile(path, 'utf8');
  try { return JSON.parse(raw.replace(/^\uFEFF/, '')); } catch (e) { throw new DataError(`Invalid JSON in ${path}: ${e.message}`); }
}
try {
  const args = parse(process.argv.slice(2));
  const { tuning } = await json(new URL('../../game.contract.json', import.meta.url));
  const scenario = args.scenario ? validateScenario(await json(args.scenario), tuning, args.night) : {};
  const inputs = args.inputs ? validateInputs(await json(args.inputs)) : { frames: [] };
  const g = createGame(tuning, args.seed, scenario, args.night); const lines = [JSON.stringify(snapshot(g))];
  let cursor = 0;
  for (let k = 0; k < args.ticks && !['won','lost'].includes(g.state); k++) {
    let patch = {};
    if (inputs.frames[cursor]?.tick === k) { const { tick, ...frame } = inputs.frames[cursor++]; patch = frame; }
    for (const event of step(g, patch)) lines.push(JSON.stringify(event));
    if (g.tick % args['snapshot-every'] === 0) lines.push(JSON.stringify(snapshot(g)));
  }
  lines.push(JSON.stringify({ type: 'end', ticks: g.tick, state: g.state, score: g.score }));
  await mkdir(dirname(args.out), { recursive: true });
  await writeFile(args.out, lines.join('\n') + '\n', 'utf8');
} catch (e) {
  console.error(e.message); process.exitCode = e instanceof DataError ? 2 : 1;
}
