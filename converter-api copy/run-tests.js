#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧪 Starting XL Conversion TDD Tests...\n');

// Check if test files exist
const testInputsPath = path.join(__dirname, '../TestCases/inputs/xl-inputs');
const testOutputsPath = path.join(__dirname, '../TestCases/outputs/xl-outputs');

if (!fs.existsSync(testInputsPath)) {
  console.error('❌ Test inputs directory not found:', testInputsPath);
  process.exit(1);
}

if (!fs.existsSync(testOutputsPath)) {
  console.error('❌ Test outputs directory not found:', testOutputsPath);
  process.exit(1);
}

// Count test files
const inputFiles = fs.readdirSync(testInputsPath).filter(f => f.endsWith('.json'));
const outputFiles = fs.readdirSync(testOutputsPath).filter(f => f.endsWith('.json'));

console.log(`📁 Found ${inputFiles.length} XL input files`);
console.log(`📁 Found ${outputFiles.length} XL output files\n`);

// Install dependencies if needed
try {
  console.log('📦 Installing test dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Build the project
try {
  console.log('🔨 Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Project built successfully\n');
} catch (error) {
  console.log('⚠️  Build failed, using TypeScript directly for tests...\n');
}

// Run tests
try {
  console.log('🚀 Running XL Conversion Tests...\n');
  execSync('npm run test:xl', { stdio: 'inherit' });
  console.log('\n✅ All tests completed successfully!');
} catch (error) {
  console.error('\n❌ Tests failed:', error.message);
  process.exit(1);
}
