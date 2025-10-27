#!/usr/bin/env node

const path = require('path');
const { ConversionService } = require('../dist/services/conversionService');

async function main() {
  // Accept args or use defaults
  const repoRoot = path.resolve(__dirname, '../../');
  const aiInput = process.argv[2] || path.join(repoRoot, 'TestCases/inputs/xl-inputs/5_XL_Blue_AIinput.json');
  const templatePath = process.argv[3] || path.join(repoRoot, 'TestCases/inputs/templates/RawXLTemplates/voiceidealStudioTemplate.json');

  const service = new ConversionService();
  const result = await service.convert(aiInput, templatePath);

  console.log('Stats:', result.stats);
  console.log('Output:', result.outputPath);
  console.log('File size:', result.fileSize);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});



