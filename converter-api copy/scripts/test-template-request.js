const request = require('supertest');
const path = require('path');
const fs = require('fs-extra');
const app = require('../dist/server').app; // Use compiled app

async function testTemplateRequest() {
  console.log('🚀 Testing Template Request System...\n');

  try {
    // Test 1: Template listesini al
    console.log('📋 Testing template list...');
    const listResponse = await request(app)
      .get('/api/template/list')
      .expect(200);

    const templates = listResponse.body.data;
    console.log(`✅ Found ${templates.length} available templates`);
    
    // İlk 5 template'i göster
    templates.slice(0, 5).forEach(template => {
      console.log(`   📄 ${template.templateType}: ${template.exists ? '✅' : '❌'} (${template.fileName})`);
    });

    // Test 2: Farklı boyut ve marka kombinasyonlarını test et
    const testCases = [
      { size: 'Capsule', brand: 'creatio' },
      { size: 'Capsule', brand: 'samsung' },
      { size: 'XL', brand: 'default' },
      { size: 'Maxi', brand: 'sompo' },
      { size: 'Micro', brand: 'samsung' },
      { size: 'Midi', brand: 'default' },
      { size: 'Mini', brand: 'sompo' }
    ];

    console.log(`\n🔄 Testing template requests...`);
    
    for (const testCase of testCases) {
      console.log(`\n📦 Testing: ${testCase.size}-${testCase.brand}`);
      
      try {
        const response = await request(app)
          .post('/api/template/request')
          .send(testCase)
          .expect(200);

        const result = response.body;
        
        if (result.success) {
          console.log(`   ✅ Success: ${result.metadata.fileName}`);
          console.log(`   📊 Size: ${result.metadata.fileSize}`);
          console.log(`   📦 Boxes: ${result.metadata.boxesCount}`);
          console.log(`   📅 Modified: ${new Date(result.metadata.lastModified).toLocaleDateString()}`);
          
          // Template'in geçerli JSON olduğunu kontrol et
          if (result.template && result.template.present) {
            console.log(`   ✅ Valid template structure`);
          } else {
            console.log(`   ❌ Invalid template structure`);
          }
        } else {
          console.log(`   ❌ Failed: ${result.message || 'Unknown error'}`);
        }

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    // Test 3: Metadata endpoint'ini test et
    console.log(`\n📊 Testing metadata endpoint...`);
    try {
      const metadataResponse = await request(app)
        .get('/api/template/Capsule/creatio/metadata')
        .expect(200);

      const metadata = metadataResponse.body.data;
      console.log(`✅ Metadata for Capsule-creatio:`);
      console.log(`   📄 File: ${metadata.fileName}`);
      console.log(`   📊 Size: ${metadata.fileSize}`);
      console.log(`   📦 Boxes: ${metadata.boxesCount}`);
      console.log(`   🔢 Version: ${metadata.version}`);
      console.log(`   📅 Modified: ${new Date(metadata.lastModified).toLocaleDateString()}`);

    } catch (error) {
      console.log(`❌ Metadata test failed: ${error.message}`);
    }

    // Test 4: Hatalı request'leri test et
    console.log(`\n❌ Testing error cases...`);
    
    const errorCases = [
      { size: 'InvalidSize', brand: 'creatio' },
      { size: 'Capsule', brand: 'InvalidBrand' },
      { size: '', brand: 'creatio' },
      { size: 'Capsule', brand: '' }
    ];

    for (const errorCase of errorCases) {
      try {
        await request(app)
          .post('/api/template/request')
          .send(errorCase)
          .expect(400);
        console.log(`   ✅ Error case handled: ${JSON.stringify(errorCase)}`);
      } catch (error) {
        console.log(`   ❌ Error case failed: ${error.message}`);
      }
    }

    console.log(`\n🎉 Template Request System Test Completed!`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test environment'ı ayarla
process.env.NODE_ENV = 'test';

// Test'i çalıştır
testTemplateRequest().catch(console.error);
