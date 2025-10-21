const request = require('supertest');
const path = require('path');
const fs = require('fs-extra');
const app = require('../dist/server').app; // Use compiled app

async function testDynamicTemplateCreation() {
  console.log('🚀 Testing Dynamic Template Creation...\n');

  try {
    // Test AI input'u yükle
    const aiInputPath = path.join(__dirname, '../../test_cases/inputs/xl-inputs/5_XL_Blue_AIinput.json');
    const aiOutput = await fs.readJson(aiInputPath);
    
    console.log(`📁 AI Input loaded: ${aiOutput.Sections?.length || 0} sections, ${aiOutput.GeneralQuiz?.length || 0} quizzes`);

    // Farklı template türlerini test et
    const templateTypes = [
      'LSCapsule-default',
      'LSCapsule-blue', 
      'LSXL-default',
      'LSMaxi-samsung',
      'LSMicro-sompo'
    ];

    for (const templateType of templateTypes) {
      console.log(`\n🔄 Testing template type: ${templateType}`);
      
      try {
        const response = await request(app)
          .post('/api/convert/dynamic')
          .send({
            aiOutput: aiOutput,
            templateType: templateType
          })
          .expect(200);

        const result = response.body.data;
        
        console.log(`✅ Success for ${templateType}:`);
        console.log(`   📊 Template Info: ${result.templateInfo.size}-${result.templateInfo.variant}`);
        console.log(`   📦 Boxes Count: ${result.templateInfo.boxesCount}`);
        console.log(`   🎯 Sections Mapped: ${result.templateInfo.sectionsMapped}`);
        console.log(`   ❓ Quizzes Mapped: ${result.templateInfo.quizzesMapped}`);
        console.log(`   📈 Dynamic Boxes Created: ${result.stats.dynamicBoxesCreated}`);
        console.log(`   📏 Template Size: ${result.stats.templateSize}`);
        
        // Template'in geçerli JSON olduğunu kontrol et
        if (result.convertedTemplate && result.convertedTemplate.present) {
          console.log(`   ✅ Valid template structure`);
        } else {
          console.log(`   ❌ Invalid template structure`);
        }

      } catch (error) {
        console.log(`❌ Failed for ${templateType}: ${error.message}`);
      }
    }

    // Template listesini test et
    console.log(`\n📋 Testing template list endpoint...`);
    try {
      const listResponse = await request(app)
        .get('/api/templates/list')
        .expect(200);

      const templates = listResponse.body.data;
      console.log(`✅ Found ${templates.length} available templates`);
      
      // İlk 5 template'i göster
      templates.slice(0, 5).forEach(template => {
        console.log(`   📄 ${template.templateType}: ${template.exists ? '✅' : '❌'} (${template.fileName})`);
      });

    } catch (error) {
      console.log(`❌ Template list failed: ${error.message}`);
    }

    console.log(`\n🎉 Dynamic Template Creation Test Completed!`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test environment'ı ayarla
process.env.NODE_ENV = 'test';

// Test'i çalıştır
testDynamicTemplateCreation().catch(console.error);
