import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const proof = resolve('docs/proof/phase-4'); mkdirSync(proof, { recursive: true });
const commands = [
  ['build', ['build', '-t', 'dao-den-long:phase-4', '.']],
  ['tests', ['run', '--rm', 'dao-den-long:phase-4', 'npm', 'test']],
  ['scenarios', ['run', '--rm', '--mount', `type=bind,source=${proof},target=/proof`, '-e', 'PROOF_DIR=/proof/linux', 'dao-den-long:phase-4', 'node', 'scripts/check-phase3.mjs']],
  ['environment', ['run', '--rm', 'dao-den-long:phase-4', 'node', '-e', 'console.log(JSON.stringify({node:process.version,platform:process.platform,arch:process.arch}))']],
];
const results = [];
for (const [name, args] of commands) {
  const r = spawnSync('docker', args, { encoding: 'utf8', timeout: 240000, maxBuffer: 10 * 1024 * 1024 });
  writeFileSync(`${proof}/linux-${name}.log`, (r.stdout || '') + (r.stderr || '') + (r.error ? '\n' + r.error : ''));
  assert.equal(r.status, 0, `Docker ${name} failed; see linux-${name}.log`);
  results.push({ name, command: ['docker', ...args], exit: r.status });
}
for(const name of ['refuel','relight','out','drain','drain-pulse','capacity','pause-fuel','no-early-win','dawn-night1','dawn-night2','dawn-night3','dawn-loss']) assert.deepEqual(readFileSync(`${proof}/${name}-a.jsonl`), readFileSync(`${proof}/linux/${name}-a.jsonl`));
for(const name of ['dash','fall','pad','drifter','charm','wind','pause','win-night1','win-night2','win-night3']) assert.deepEqual(readFileSync(`${proof}/regression/${name}-a.jsonl`), readFileSync(`${proof}/linux/regression/${name}-a.jsonl`));
results.push({ name: 'windows-linux-byte-parity', status: 'PASS' });
writeFileSync(`${proof}/linux-results.json`, JSON.stringify(results, null, 2) + '\n');
console.log('PASS: Linux clean npm ci/build, unit/CLI tests, scenarios and cross-platform byte parity');
