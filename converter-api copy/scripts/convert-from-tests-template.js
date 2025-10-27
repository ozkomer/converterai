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
  const inputPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(repoRoot, 'TestCases/inputs/xl-inputs/9_XL_SOMPO_AIinput.json');
  const templatePath = path.join(__dirname, '../tests/test-template.json');
  const outDir = path.join(repoRoot, 'outputs/converted');

  if (!(await fs.pathExists(inputPath))) {
    console.error('Input not found:', inputPath);
    process.exit(1);
  }
  if (!(await fs.pathExists(templatePath))) {
    console.error('Template not found:', templatePath);
    process.exit(1);
  }

  const aiOutput = await fs.readJson(inputPath);
  const template = await fs.readJson(templatePath);

  const res = await request(app)
    .post('/api/convert')
    .send({ aiOutput, template, templateType: 'XL-Blue' })
    .expect(200);

  const { success, data } = res.body || {};
  if (!success || !data || !data.convertedTemplate) {
    console.error('Unexpected response:', res.body);
    process.exit(1);
  }

  await fs.ensureDir(outDir);
  const outPath = path.join(
    outDir,
    `converted-XL-Blue-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  );
  await fs.writeJson(outPath, data.convertedTemplate, { spaces: 2 });

  console.log('TemplateType:', data.templateType);
  console.log('Stats:', data.stats);
  console.log('Saved converted template to:', outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});



