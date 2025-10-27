const { Type0TemplateService, Type0Content } = require('../dist/services/type0TemplateService');

async function generateExampleTemplate() {
  console.log('🎨 Type0 Template Oluşturuluyor...\n');

  try {
    // Type0TemplateService instance oluştur
    const type0Service = new Type0TemplateService();
    
    // Mevcut markaları listele
    console.log('📋 Mevcut Markalar:');
    const brands = await type0Service.listAvailableBrands();
    console.log(brands);
    console.log('\n');

    // BLUE markası için content hazırla
    const blueContent = {
      title: 'Güvenlik ve İş Sağlığı Eğitimi',
      imageUrl: 'https://ls.elearningsolutions.net//ContentFiles/IdealStudioFiles/611_e12c9d51-de9f-4d6c-925e-9dff8ad77046.png',
      mandatory: true
    };

    console.log('🔵 BLUE markası için template üretiliyor...');
    const blueResult = await type0Service.generateType0Template('blue', blueContent);
    
    console.log('✅ Template başarıyla oluşturuldu!');
    console.log('\n📊 Template Metadata:');
    console.log(JSON.stringify(blueResult.metadata, null, 2));
    
    console.log('\n📄 Template Yapısı:');
    console.log(JSON.stringify(blueResult.template, null, 2));

    // Output dosyasına kaydet
    const fs = require('fs-extra');
    const path = require('path');
    const outputPath = path.join(__dirname, '../outputs/type0-blue-example.json');
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeJSON(outputPath, blueResult, { spaces: 2 });
    
    console.log(`\n💾 Template kaydedildi: ${outputPath}`);

    // SOMPO markası için de bir örnek
    console.log('\n\n🔴 SOMPO markası için template üretiliyor...');
    const sompoContent = {
      title: 'İş Yerinde Güvenlik',
      imageUrl: 'https://example.com/sompo-image.jpg',
      mandatory: true
    };
    
    const sompoResult = await type0Service.generateType0Template('sompo', sompoContent);
    console.log('✅ SOMPO Template başarıyla oluşturuldu!');
    console.log('\n📊 Template Metadata:');
    console.log(JSON.stringify(sompoResult.metadata, null, 2));

    const sompoOutputPath = path.join(__dirname, '../outputs/type0-sompo-example.json');
    await fs.writeJSON(sompoOutputPath, sompoResult, { spaces: 2 });
    console.log(`💾 Template kaydedildi: ${sompoOutputPath}`);

    console.log('\n🎉 Tüm örnekler başarıyla oluşturuldu!');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Scripti çalıştır
generateExampleTemplate();

