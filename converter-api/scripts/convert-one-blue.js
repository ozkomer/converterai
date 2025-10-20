#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');

async function main() {
  const repoRoot = path.resolve(__dirname, '../../');
  const inputPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(repoRoot, 'TestCases/inputs/xl-inputs/9_XL_SOMPO_AIinput.json');
  const templatePath = path.join(repoRoot, 'TestCases/inputs/templates/RawXLTemplates/voiceidealStudioTemplate.json');
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

  const response = await fetch('http://127.0.0.1:3000/api/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aiOutput, template, templateType: 'XL-Blue' })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('HTTP error:', response.status, text);
    process.exit(1);
  }

  const body = await response.json();
  const { success, data } = body || {};
  if (!success || !data || !data.convertedTemplate) {
    console.error('Unexpected response:', body);
    process.exit(1);
  }

  await fs.ensureDir(outDir);
  const outPath = path.join(
    outDir,
    `converted-BLUE-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
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



