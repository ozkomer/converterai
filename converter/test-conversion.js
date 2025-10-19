const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Dönüşüm Testi Başlatılıyor...\n');

// Test dosyalarını kontrol et
const testFiles = [
  'SampleOutputs/XLSamples/1_XL_Blue_AIinput.txt',
  'SampleOutputs/XLSamples/2_XL_Blue_AIinput.txt',
  'XLSamples/3_XL_Blue_AIinput.txt',
  'XLSamples/9_XL_SOMPO_AIinput.txt'
];

const templateFiles = [
  'SampleOutputs/XLSamples/RawXLTemplates/voiceidealStudioTemplate.json',
  'XLSamples/RawXLTemplates/voiceidealStudioTemplate.json'
];

console.log('📁 Test dosyaları kontrol ediliyor...');
for (const file of testFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Bulunamadı`);
  }
}

console.log('\n📄 Template dosyaları kontrol ediliyor...');
for (const file of templateFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Bulunamadı`);
  }
}

// Basit dönüşüm testi
console.log('\n🔄 Basit dönüşüm testi...');

try {
  // Önce build yap
  console.log('📦 TypeScript build yapılıyor...');
  execSync('npm run build', { cwd: './converter', stdio: 'inherit' });
  console.log('✅ Build tamamlandı');

  // Test çıktı dizini oluştur
  const outputDir = './converter/test-outputs';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('\n🎯 Test dönüşümleri başlatılıyor...');
  
  // Her test dosyası için dönüşüm yap
  for (const inputFile of testFiles) {
    if (fs.existsSync(inputFile)) {
      const fileName = path.basename(inputFile);
      const baseName = fileName.replace('_AIinput.txt', '');
      const outputFile = path.join(outputDir, `${baseName}_FinalOutput.txt`);
      
      console.log(`\n🔄 ${fileName} dönüştürülüyor...`);
      
      try {
        // Template processor ile basit dönüşüm
        const inputData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
        
        // Template değişkenlerini basit şekilde değiştir
        let templateContent = fs.readFileSync('SampleOutputs/XLSamples/RawXLTemplates/voiceidealStudioTemplate.json', 'utf8');
        
        // Basit değişken değiştirme
        templateContent = templateContent.replace(/#\{\[training-title\]\}#/g, inputData.CourseInfo.Title);
        templateContent = templateContent.replace(/#\{\[training-description\]\}#/g, inputData.CourseInfo.Description);
        
        // JSON geçerliliğini kontrol et
        try {
          JSON.parse(templateContent);
          fs.writeFileSync(outputFile, templateContent, 'utf8');
          console.log(`✅ ${baseName} dönüştürüldü -> ${outputFile}`);
        } catch (jsonError) {
          console.log(`❌ ${baseName} JSON hatası: ${jsonError.message}`);
        }
        
      } catch (error) {
        console.log(`❌ ${baseName} dönüşüm hatası: ${error.message}`);
      }
    }
  }

  console.log('\n🎉 Test tamamlandı!');
  console.log(`📁 Çıktılar: ${outputDir}`);

} catch (error) {
  console.error('❌ Test hatası:', error.message);
}
