const request = require('supertest');
const fs = require('fs-extra');
const path = require('path');

// Import the Express app
let app;
try {
  require('ts-node/register');
  app = require('../src/server').app;
} catch (error) {
  console.error('Failed to load app:', error);
  process.exit(1);
}

describe('XL Conversion TDD Tests', () => {
  const testInputsPath = path.join(__dirname, '../../TestCases/inputs/xl-inputs');
  const expectedOutputsPath = path.join(__dirname, '../../TestCases/outputs/xl-outputs');
  
  test('Should load test files successfully', async () => {
    const inputFiles = await fs.readdir(testInputsPath);
    const outputFiles = await fs.readdir(expectedOutputsPath);
    
    expect(inputFiles.length).toBeGreaterThan(0);
    expect(outputFiles.length).toBeGreaterThan(0);
    
    console.log(`Found ${inputFiles.length} input files and ${outputFiles.length} output files`);
  });

  test('Should convert XL input to output format', async () => {
    // Load first available test case
    const inputFiles = await fs.readdir(testInputsPath);
    const inputFile = inputFiles.find(f => f.endsWith('.json'));
    
    if (!inputFile) {
      throw new Error('No input files found');
    }

    const inputPath = path.join(testInputsPath, inputFile);
    const inputData = await fs.readJson(inputPath);
    
    // Load test template
    const templatePath = path.join(__dirname, 'test-template.json');
    const template = await fs.readJson(templatePath);

    // Send conversion request
    const response = await request(app)
      .post('/api/convert')
      .send({
        aiOutput: inputData,
        template: template,
        templateType: 'XL-Blue'
      })
      .expect(200);

    // Verify response structure
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('convertedTemplate');
    expect(response.body.data).toHaveProperty('stats');
    expect(response.body.data).toHaveProperty('templateType', 'XL-Blue');

    // Verify stats
    expect(response.body.data.stats).toHaveProperty('sections');
    expect(response.body.data.stats).toHaveProperty('quizzes');
    expect(response.body.data.stats).toHaveProperty('totalTags');
    expect(response.body.data.stats).toHaveProperty('replacedTags');

    console.log(`✅ Conversion successful: ${response.body.data.stats.sections} sections, ${response.body.data.stats.quizzes} quizzes`);
  });

  test('Should handle empty input gracefully', async () => {
    const emptyInput = {
      CourseInfo: {
        Title: "Test Course",
        Description: "Test Description"
      },
      Sections: [],
      GeneralQuiz: []
    };

    const templatePath = path.join(__dirname, 'test-template.json');
    const template = await fs.readJson(templatePath);

    const response = await request(app)
      .post('/api/convert')
      .send({
        aiOutput: emptyInput,
        template: template,
        templateType: 'XL-Blue'
      })
      .expect(200);

    expect(response.body.data.stats.sections).toBe(0);
    expect(response.body.data.stats.quizzes).toBe(0);
  });

  test('Should validate required fields', async () => {
    const response = await request(app)
      .post('/api/convert')
      .send({
        // Missing aiOutput and template
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  test('Should handle malformed input', async () => {
    const templatePath = path.join(__dirname, 'test-template.json');
    const template = await fs.readJson(templatePath);

    const response = await request(app)
      .post('/api/convert')
      .send({
        aiOutput: null,
        template: template,
        templateType: 'XL-Blue'
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});
