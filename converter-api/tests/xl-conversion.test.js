const request = require('supertest');
const fs = require('fs-extra');
const path = require('path');

// Import the Express app
let app;
try {
  // Try to import the compiled JavaScript version first
  app = require('../dist/server').app;
} catch (error) {
  // Fallback to TypeScript version if compiled version doesn't exist
  console.log('Using TypeScript version for testing...');
  require('ts-node/register');
  app = require('../src/server').app;
}

describe('XL Conversion TDD Tests', () => {
  const testInputsPath = path.join(__dirname, '../../TestCases/inputs/xl-inputs');
  const expectedOutputsPath = path.join(__dirname, '../../TestCases/outputs/xl-outputs');
  
  let testCases = [];

  beforeAll(async () => {
    // Load all test cases from files
    const inputFiles = await fs.readdir(testInputsPath);
    
    for (const inputFile of inputFiles) {
      if (inputFile.endsWith('.json')) {
        const testNumber = inputFile.match(/^(\d+)_/)?.[1];
        if (testNumber) {
          const outputFile = `${testNumber}_XL_Blue_FinalOutput.json`;
          const outputPath = path.join(expectedOutputsPath, outputFile);
          
          if (await fs.pathExists(outputPath)) {
            testCases.push({
              testNumber,
              inputFile,
              outputFile,
              inputPath: path.join(testInputsPath, inputFile),
              outputPath
            });
          }
        }
      }
    }
    
    console.log(`Found ${testCases.length} XL test cases`);
  });

  afterAll(async () => {
    // Cleanup after tests
    if (app && app.close) {
      await app.close();
    }
  });

  describe('XL Input to Output Conversion', () => {
    testCases.forEach(({ testNumber, inputFile, outputFile, inputPath, outputPath }) => {
      test(`Test Case ${testNumber}: ${inputFile} should convert to expected ${outputFile}`, async () => {
        // Arrange: Load input and expected output
        const inputData = await fs.readJson(inputPath);
        const expectedOutput = await fs.readJson(outputPath);
        
        // Load template (use default XL template)
        const templatePath = path.join(__dirname, '../../TestCases/inputs/templates/RawXLTemplates/voiceidealStudioTemplate.json');
        const template = await fs.readJson(templatePath);

        // Act: Send conversion request
        const response = await request(app)
          .post('/api/convert')
          .send({
            aiOutput: inputData,
            template: template,
            templateType: 'XL-Blue'
          })
          .expect(200);

        // Assert: Verify response structure
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('convertedTemplate');
        expect(response.body.data).toHaveProperty('stats');
        expect(response.body.data).toHaveProperty('templateType', 'XL-Blue');

        // Assert: Verify conversion stats
        expect(response.body.data.stats).toHaveProperty('sections');
        expect(response.body.data.stats).toHaveProperty('quizzes');
        expect(response.body.data.stats).toHaveProperty('totalTags');
        expect(response.body.data.stats).toHaveProperty('replacedTags');

        // Assert: Verify converted template structure matches expected
        const convertedTemplate = response.body.data.convertedTemplate;
        expect(convertedTemplate).toBeDefined();
        expect(typeof convertedTemplate).toBe('object');

        // Assert: Key template fields should be present
        expect(convertedTemplate).toHaveProperty('training-title');
        expect(convertedTemplate).toHaveProperty('training-description');

        // Assert: Sections should be converted properly
        if (inputData.Sections && inputData.Sections.length > 0) {
          const firstSection = inputData.Sections[0];
          if (firstSection.Title) {
            // Check if section title is properly mapped
            const sectionTitleKey = `type1_1:title`;
            expect(convertedTemplate).toHaveProperty(sectionTitleKey);
            expect(convertedTemplate[sectionTitleKey]).toBe(firstSection.Title);
          }
        }

        console.log(`✅ Test Case ${testNumber} passed: ${inputData.Sections?.length || 0} sections, ${inputData.GeneralQuiz?.length || 0} quizzes converted`);
      });
    });
  });

  describe('XL Conversion Edge Cases', () => {
    test('Should handle empty sections array', async () => {
      const emptyInput = {
        CourseInfo: {
          Title: "Test Course",
          Description: "Test Description"
        },
        Sections: [],
        GeneralQuiz: []
      };

      const templatePath = path.join(__dirname, '../../TestCases/inputs/templates/RawXLTemplates/voiceidealStudioTemplate.json');
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

    test('Should handle missing CourseInfo', async () => {
      const inputWithoutCourseInfo = {
        Sections: [
          {
            Index: 1,
            Title: "Test Section",
            Content: { paragraph: "Test content" }
          }
        ]
      };

      const templatePath = path.join(__dirname, '../../TestCases/inputs/templates/RawXLTemplates/voiceidealStudioTemplate.json');
      const template = await fs.readJson(templatePath);

      const response = await request(app)
        .post('/api/convert')
        .send({
          aiOutput: inputWithoutCourseInfo,
          template: template,
          templateType: 'XL-Blue'
        })
        .expect(200);

      expect(response.body.data.stats.sections).toBe(1);
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
  });

  describe('XL Template Validation', () => {
    test('Should use correct XL template for XL-Blue type', async () => {
      const testInput = {
        CourseInfo: { Title: "Test", Description: "Test" },
        Sections: [{ Index: 1, Title: "Section 1" }]
      };

      const templatePath = path.join(__dirname, '../../TestCases/inputs/templates/RawXLTemplates/voiceidealStudioTemplate.json');
      const template = await fs.readJson(templatePath);

      const response = await request(app)
        .post('/api/convert')
        .send({
          aiOutput: testInput,
          template: template,
          templateType: 'XL-Blue'
        })
        .expect(200);

      expect(response.body.data.templateType).toBe('XL-Blue');
      expect(response.body.data.convertedTemplate).toBeDefined();
    });

    test('Should handle SOMPO template type', async () => {
      const testInput = {
        CourseInfo: { Title: "SOMPO Test", Description: "SOMPO Test" },
        Sections: [{ Index: 1, Title: "SOMPO Section" }]
      };

      const sompoTemplatePath = path.join(__dirname, '../../TestCases/inputs/templates/RawXLTemplates/voiceidealStudioTemplate_sompo.json');
      const sompoTemplate = await fs.readJson(sompoTemplatePath);

      const response = await request(app)
        .post('/api/convert')
        .send({
          aiOutput: testInput,
          template: sompoTemplate,
          templateType: 'XL-SOMPO'
        })
        .expect(200);

      expect(response.body.data.templateType).toBe('XL-SOMPO');
    });
  });

  describe('XL Performance Tests', () => {
    test('Should handle large XL input efficiently', async () => {
      // Create a large input with many sections
      const largeInput = {
        CourseInfo: { Title: "Large Course", Description: "Large course description" },
        Sections: Array.from({ length: 50 }, (_, i) => ({
          Index: i + 1,
          Title: `Section ${i + 1}`,
          Content: { paragraph: `Content for section ${i + 1}` },
          NarrationText: `Narration for section ${i + 1}`
        })),
        GeneralQuiz: Array.from({ length: 10 }, (_, i) => ({
          Index: i + 1,
          Question: `Question ${i + 1}`,
          Options: [`Option A`, `Option B`, `Option C`, `Option D`],
          CorrectAnswers: [`Option A`]
        }))
      };

      const templatePath = path.join(__dirname, '../../TestCases/inputs/templates/RawXLTemplates/voiceidealStudioTemplate.json');
      const template = await fs.readJson(templatePath);

      const startTime = Date.now();

      const response = await request(app)
        .post('/api/convert')
        .send({
          aiOutput: largeInput,
          template: template,
          templateType: 'XL-Blue'
        })
        .expect(200);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(response.body.data.stats.sections).toBe(50);
      expect(response.body.data.stats.quizzes).toBe(10);
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds

      console.log(`Large XL input processed in ${processingTime}ms`);
    });
  });

  describe('XL Error Handling', () => {
    test('Should handle malformed JSON input gracefully', async () => {
      const templatePath = path.join(__dirname, '../../TestCases/inputs/templates/RawXLTemplates/voiceidealStudioTemplate.json');
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

    test('Should handle missing template gracefully', async () => {
      const testInput = {
        CourseInfo: { Title: "Test", Description: "Test" },
        Sections: [{ Index: 1, Title: "Section 1" }]
      };

      const response = await request(app)
        .post('/api/convert')
        .send({
          aiOutput: testInput,
          template: null,
          templateType: 'XL-Blue'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
