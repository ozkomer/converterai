#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const request = require('supertest');

function countKeysDeep(obj) {
  let count = 0;
  const stack = [obj];
  while (stack.length) {
    const cur = stack.pop();
    if (cur && typeof cur === 'object') {
      for (const [k, v] of Object.entries(cur)) {
        count++;
        if (v && typeof v === 'object') stack.push(v);
      }
    }
  }
  return count;
}

async function main() {
  const { app } = require('../dist/server');

  const repoRoot = path.resolve(__dirname, '../../');
  const aiPath = process.argv[2] || path.join(repoRoot, 'TestCases/inputs/xl-inputs/9_XL_SOMPO_AIinput.json');
  const expectedPath = process.argv[3] || path.join(repoRoot, 'TestCases/outputs/xl-outputs/9_XL_SOMPO_FinalOutput.json');

  const aiOutput = await fs.readJson(aiPath);
  const expected = await fs.readJson(expectedPath);

  const res = await request(app)
    .post('/api/convert')
    .send({ aiOutput, templateType: 'XL-SOMPO' })
    .expect(200);

  const body = res.body;
  const full = body?.data?.convertedTemplate;
  if (!full) {
    console.error('No convertedTemplate in response');
    process.exit(1);
  }

  const kFull = countKeysDeep(full);
  const kExp = countKeysDeep(expected);
  console.log('Keys (response vs expected):', kFull, '/', kExp);
  console.log('TemplateType:', body?.data?.templateType);
  console.log('Stats:', body?.data?.stats);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});


