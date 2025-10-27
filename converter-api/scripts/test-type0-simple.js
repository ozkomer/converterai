const { Type0SimpleService } = require('../dist/services/type0Simple');
const fs = require('fs-extra');
const path = require('path');

async function generateType0Examples() {
  console.log('🎨 Type0 Simple Template Örnekleri oluşturuluyor...\n');

  try {
    const service = new Type0SimpleService();

    // BLUE template için content
    console.log('🔵 BLUE Template oluşturuluyor...');
    const blueContent = {
      title: 'Güvenlik ve İş Sağlığı Eğitimi',
      imageUrl: 'https://ls.elearningsolutions.net//ContentFiles/IdealStudioFiles/611_e12c9d51-de9f-4d6c-925e-9dff8ad77046.png',
      mandatory: true
    };

    const blueResult = service.generate('blue', blueContent);
    console.log('✅ BLUE Template oluşturuldu!');

    const blueOutput = {
      metadata: {
        brand: 'BLUE',
        generatedAt: new Date().toISOString(),
        content: blueContent
      },
      template: blueResult
    };

    const bluePath = path.join(__dirname, '../outputs/type0-blue-example.json');
    await fs.writeJSON(bluePath, blueOutput, { spaces: 2 });
    console.log(`💾 Kaydedildi: ${bluePath}\n`);

    // SOMPO template için content
    console.log('🔴 SOMPO Template oluşturuluyor...');
    const sompoContent = {
      title: 'İş Yerinde Güvenlik Eğitimi',
      imageUrl: 'https://example.com/sompo-image.jpg',
      mandatory: true
    };

    const sompoResult = service.generate('sompo', sompoContent);
    console.log('✅ SOMPO Template oluşturuldu!');

    const sompoOutput = {
      metadata: {
        brand: 'SOMPO',
        generatedAt: new Date().toISOString(),
        content: sompoContent
      },
      template: sompoResult
    };

    const sompoPath = path.join(__dirname, '../outputs/type0-sompo-example.json');
    await fs.writeJSON(sompoPath, sompoOutput, { spaces: 2 });
    console.log(`💾 Kaydedildi: ${sompoPath}\n`);

    // Template içeriğini ekrana yazdır
    console.log('📄 BLUE Template Özeti:');
    console.log(`   - Page ID: ${blueResult.page.id}`);
    console.log(`   - View Name: ${blueResult.page.viewName}`);
    console.log(`   - Is Mandatory: ${blueResult.page.isMandatory}`);
    console.log(`   - Mandatory Type: ${blueResult.page.mandatoryType}`);
    console.log(`   - Text Box ID: ${blueResult.textBox.box.id}`);
    console.log(`   - Image Box ID: ${blueResult.imageBox?.box.id || 'Yok'}\n`);

    console.log('📄 SOMPO Template Özeti:');
    console.log(`   - Page ID: ${sompoResult.page.id}`);
    console.log(`   - View Name: ${sompoResult.page.viewName}`);
    console.log(`   - Is Mandatory: ${sompoResult.page.isMandatory}`);
    console.log(`   - Mandatory Type: ${sompoResult.page.mandatoryType}`);
    console.log(`   - Text Box ID: ${sompoResult.textBox.box.id}`);
    console.log(`   - Image Box ID: ${sompoResult.imageBox?.box.id || 'Yok'}\n`);

    console.log('🎉 Tüm örnekler başarıyla oluşturuldu!');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

generateType0Examples();

