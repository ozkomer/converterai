const request = require('supertest');
const { app } = require('../dist/server');

async function testType0Generation() {
  console.log('🧪 Testing Type0 Template Generation...\n');

  try {
    // Test 1: List available brands
    console.log('1️⃣ Testing brand list...');
    const brandsResponse = await request(app)
      .get('/api/convert/type0/brands')
      .expect(200);

    console.log('✅ Available brands:', brandsResponse.body.brands);
    console.log('');

    // Test 2: Get brand info for Sompo
    console.log('2️⃣ Testing Sompo brand info...');
    const sompoInfoResponse = await request(app)
      .get('/api/convert/type0/brand/sompo/info')
      .expect(200);

    console.log('✅ Sompo brand info:', JSON.stringify(sompoInfoResponse.body.brandInfo, null, 2));
    console.log('');

    // Test 3: Generate Type0 template for Sompo
    console.log('3️⃣ Testing Sompo Type0 generation...');
    const sompoTemplateResponse = await request(app)
      .post('/api/convert/type0/generate')
      .send({
        brand: 'sompo',
        content: {
          title: 'Güvenlik Eğitimi',
          imageUrl: 'https://example.com/sompo-image.jpg',
          mandatory: true
        }
      })
      .expect(200);

    console.log('✅ Sompo template generated successfully');
    console.log('📊 Template metadata:', JSON.stringify(sompoTemplateResponse.body.metadata, null, 2));
    console.log('📄 Template structure keys:', Object.keys(sompoTemplateResponse.body.template));
    console.log('');

    // Test 4: Generate Type0 template for Samsung
    console.log('4️⃣ Testing Samsung Type0 generation...');
    const samsungTemplateResponse = await request(app)
      .post('/api/convert/type0/generate')
      .send({
        brand: 'samsung',
        content: {
          title: 'Teknoloji Eğitimi',
          imageUrl: 'https://example.com/samsung-image.jpg',
          mandatory: false
        }
      })
      .expect(200);

    console.log('✅ Samsung template generated successfully');
    console.log('📊 Template metadata:', JSON.stringify(samsungTemplateResponse.body.metadata, null, 2));
    console.log('');

    // Test 5: Generate Type0 template for Creatio
    console.log('5️⃣ Testing Creatio Type0 generation...');
    const creatioTemplateResponse = await request(app)
      .post('/api/convert/type0/generate')
      .send({
        brand: 'creatio',
        content: {
          title: 'Yaratıcılık Eğitimi',
          mandatory: true
        }
      })
      .expect(200);

    console.log('✅ Creatio template generated successfully');
    console.log('📊 Template metadata:', JSON.stringify(creatioTemplateResponse.body.metadata, null, 2));
    console.log('');

    // Test 6: Test invalid brand
    console.log('6️⃣ Testing invalid brand...');
    const invalidResponse = await request(app)
      .post('/api/convert/type0/generate')
      .send({
        brand: 'invalid',
        content: {
          title: 'Test',
          mandatory: true
        }
      })
      .expect(400);

    console.log('✅ Invalid brand correctly rejected:', invalidResponse.body.message);
    console.log('');

    // Test 7: Test missing content
    console.log('7️⃣ Testing missing content...');
    const missingContentResponse = await request(app)
      .post('/api/convert/type0/generate')
      .send({
        brand: 'sompo'
      })
      .expect(400);

    console.log('✅ Missing content correctly rejected:', missingContentResponse.body.message);
    console.log('');

    console.log('🎉 All Type0 tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response body:', error.response.body);
    }
    process.exit(1);
  }
}

// Run tests
testType0Generation();



