#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const request = require('supertest');

async function main() {
  // Load express app without starting a server
  let app;
  try {
    require('ts-node/register');
    app = require('../src/server').app;
  } catch (err) {
    console.error('Failed to load app:', err);
    process.exit(1);
  }

  const repoRoot = path.resolve(__dirname, '../../');
  const inputsDir = path.join(repoRoot, 'TestCases/inputs/xl-inputs');
  const templatePath = path.join(__dirname, '../tests/test-template.json');
  const outDir = path.join(repoRoot, 'outputs/converted');

  if (!(await fs.pathExists(inputsDir))) {
    console.error('Inputs directory not found:', inputsDir);
    process.exit(1);
  }
  if (!(await fs.pathExists(templatePath))) {
    console.error('Template not found:', templatePath);
    process.exit(1);
  }

  const template = await fs.readJson(templatePath);
  const files = (await fs.readdir(inputsDir)).filter((f) => f.endsWith('.json'));
  if (files.length === 0) {
    console.error('No input JSON files found in', inputsDir);
    process.exit(1);
  }

  await fs.ensureDir(outDir);
  const saved = [];

  for (const file of files) {
    const inputPath = path.join(inputsDir, file);
    const aiOutput = await fs.readJson(inputPath);

    const res = await request(app)
      .post('/api/convert')
      .send({ aiOutput, template, templateType: 'XL-Blue' })
      .expect(200);

    const { success, data } = res.body || {};
    if (!success || !data || !data.convertedTemplate) {
      console.error('Unexpected response for', file, res.body);
      process.exit(1);
    }

    const base = path.basename(file, '.json');
    const outPath = path.join(
      outDir,
      `${base}-converted-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );
    await fs.writeJson(outPath, data.convertedTemplate, { spaces: 2 });
    console.log('Saved:', outPath);
    saved.push(outPath);
  }

  console.log('\nAll outputs saved:');
  for (const p of saved) console.log(p);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});



