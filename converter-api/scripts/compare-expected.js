#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');

function flatten(obj, prefix = '', result = {}) {
  if (obj === null || obj === undefined) return result;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      flatten(obj[i], prefix ? `${prefix}[${i}]` : `[${i}]`, result);
    }
    return result;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      flatten(v, key, result);
    }
    return result;
  }
  result[prefix] = obj;
  return result;
}

async function main() {
  const repoRoot = path.resolve(__dirname, '../../');
  const generatedPath = process.argv[2];
  if (!generatedPath) {
    console.error('Usage: node scripts/compare-expected.js <generated.json> <expected.json>');
    process.exit(1);
  }
  const expectedPath = process.argv[3] || path.join(repoRoot, 'TestCases/outputs/xl-outputs/5_XL_Blue_FinalOutput.json');

  const gen = await fs.readJson(generatedPath);
  const exp = await fs.readJson(expectedPath);

  const flatGen = flatten(gen);
  const flatExp = flatten(exp);

  const genKeys = new Set(Object.keys(flatGen));
  const expKeys = new Set(Object.keys(flatExp));

  const missingInGen = [...expKeys].filter(k => !genKeys.has(k)).slice(0, 50);
  const extraInGen = [...genKeys].filter(k => !expKeys.has(k)).slice(0, 50);

  let valueMismatches = 0;
  const diffs = [];
  for (const k of [...expKeys].slice(0, 5000)) {
    if (genKeys.has(k)) {
      if (flatGen[k] !== flatExp[k]) {
        valueMismatches++;
        if (diffs.length < 50) diffs.push({ key: k, gen: flatGen[k], exp: flatExp[k] });
      }
    }
  }

  console.log('Generated:', generatedPath);
  console.log('Expected :', expectedPath);
  console.log('Keys - expected:', expKeys.size, 'generated:', genKeys.size);
  console.log('Missing keys in generated (first 50):', missingInGen.length);
  missingInGen.forEach(k => console.log('  -', k));
  console.log('Extra keys in generated (first 50):', extraInGen.length);
  extraInGen.forEach(k => console.log('  +', k));
  console.log('Value mismatches (sample up to 50):', valueMismatches);
  diffs.forEach(d => console.log(`  != ${d.key} | gen=`, d.gen, '| exp=', d.exp));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});



