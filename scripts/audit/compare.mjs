import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = mode => JSON.parse(readFileSync(`output/audit/${mode}/summary.json`, 'utf8'));
const reference = read('static');
const runtime = read('runtime');
assert.equal(reference.length, runtime.length, 'bank count');
const differences = reference.flatMap((bank, i) => {
  const actual = runtime[i];
  return JSON.stringify(bank) === JSON.stringify(actual) ? [] : [{ reference: bank, actual }];
});
writeFileSync('output/audit/engine-differences.json', JSON.stringify(differences, null, 2));
console.log(JSON.stringify({ banks: reference.length, differences: differences.length }));
assert.equal(differences.length, 0, 'static and lazy-loaded classroom engines must match');
for (const mode of ['static', 'runtime']) {
  const result = JSON.parse(readFileSync(`output/audit/${mode}/result.json`, 'utf8'));
  assert.deepEqual(result.flags, {}, `${mode}: review findings remain`);
}
