const fs = require('fs-extra');
const path = require('path');

async function createType0JSON() {
  console.log('🎨 Type0 JSON dosyaları oluşturuluyor...\n');

  // type0.txt dosyasını oku
  const type0Path = path.join(process.cwd(), 'type0.txt');
  const content = await fs.readFile(type0Path, 'utf8');

  // Sections'ları ayır
  const sections = content.split('----------------------------------------------------------------------------------');
  
  const outputDir = path.join(process.cwd(), 'type0-templates');
  await fs.ensureDir(outputDir);

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    if (!section) continue;

    console.log(`\n📝 Section ${i + 1} işleniyor...`);

    // Brand adını bul
    const brandMatch = section.match(/([A-Z]+)\s+THEME/i);
    if (!brandMatch) continue;
    
    const brand = brandMatch[1];
    console.log(`🏷️  Marka: ${brand}`);

    // Scene index bul
    const indexMatch = section.match(/Sahne index;\s*(\d+)/);
    const sceneIndex = indexMatch ? parseInt(indexMatch[1]) : 1;
    console.log(`📍 Sahne index: ${sceneIndex}`);

    // Page config'i bul (şu satırlardan sonra gelene kadar)
    let pageConfigText = '';
    const pageStart = section.indexOf('Sahnenin Kendisi:') > 0 
      ? section.indexOf('Sahnenin Kendisi:')
      : section.indexOf('Sahnenin kendisi:');
    
    if (pageStart > 0) {
      const remaining = section.substring(pageStart);
      const lines = remaining.split('\n').slice(1); // İlk satırı atla
      
      let braceCount = 0;
      let jsonLines = [];
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        // JavaScript object literal başlangıcı
        if (trimmed.startsWith('"') && trimmed.includes(':')) {
          jsonLines.push(trimmed);
          braceCount = (trimmed.match(/\{/g) || []).length - (trimmed.match(/\}/g) || []).length;
          
          // Eğer tek satırda bitmişse
          if (braceCount === 0) break;
          continue;
        }
        
        if (braceCount > 0) {
          jsonLines.push(trimmed);
          braceCount += (trimmed.match(/\{/g) || []).length - (trimmed.match(/\}/g) || []).length;
          
          if (braceCount === 0) break;
        }
      }
      
      pageConfigText = jsonLines.join('\n');
    }

    // textBox'ı bul
    let textBoxText = '';
    const textStart = section.indexOf('Sahne içindeki text');
    if (textStart > 0) {
      const remaining = section.substring(textStart);
      const lines = remaining.split('\n').slice(1);
      
      let braceCount = 0;
      let jsonLines = [];
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        if (trimmed.startsWith('{')) {
          jsonLines.push(trimmed);
          braceCount = (trimmed.match(/\{/g) || []).length - (trimmed.match(/\}/g) || []).length;
          
          if (braceCount === 0) break;
          continue;
        }
        
        if (braceCount > 0) {
          jsonLines.push(trimmed);
          braceCount += (trimmed.match(/\{/g) || []).length - (trimmed.match(/\}/g) || []).length;
          
          if (braceCount === 0) break;
        }
      }
      
      textBoxText = jsonLines.join('\n');
    }

    // imageBox'ı bul
    let imageBoxText = '';
    const imageUrlPattern = /#\{\[type0:imageurl\]\}#|#\{\[type0:ImageUrl\]\}#/i;
    const imageMatch = section.match(imageUrlPattern);
    if (imageMatch) {
      const startIndex = section.indexOf(imageMatch[0]);
      const lines = section.substring(startIndex).split('\n').slice(1);
      
      let braceCount = 0;
      let jsonLines = [];
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.includes('-YOK-') || trimmed.includes('-Yok-')) break;
        
        if (trimmed.startsWith('{')) {
          jsonLines.push(trimmed);
          braceCount = (trimmed.match(/\{/g) || []).length - (trimmed.match(/\}/g) || []).length;
          
          if (braceCount === 0) break;
          continue;
        }
        
        if (braceCount > 0) {
          jsonLines.push(trimmed);
          braceCount += (trimmed.match(/\{/g) || []).length - (trimmed.match(/\}/g) || []).length;
          
          if (braceCount === 0) break;
        }
      }
      
      imageBoxText = jsonLines.join('\n');
    }

    // JSON objesi oluştur
    const templateData = {
      brand: brand,
      sceneIndex: sceneIndex,
      pageConfigRaw: pageConfigText,
      textBoxRaw: textBoxText,
      imageBoxRaw: imageBoxText
    };

    const outputPath = path.join(outputDir, `type0-${brand.toLowerCase()}.json`);
    await fs.writeJSON(outputPath, templateData, { spaces: 2 });
    console.log(`✅ ${brand} kaydedildi: ${outputPath}`);
  }

  console.log('\n🎉 Tüm type0 template\'leri oluşturuldu!');
}

createType0JSON().catch(console.error);

