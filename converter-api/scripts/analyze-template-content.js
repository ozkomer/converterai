#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// JSON dosyasını oku veya stdin'den al
let jsonContent;
if (process.argv[2]) {
  const jsonPath = process.argv[2];
  jsonContent = fs.readFileSync(jsonPath, 'utf8');
} else {
  // stdin'den oku
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  let lines = [];
  rl.on('line', (line) => {
    lines.push(line);
  });
  
  rl.on('close', () => {
    jsonContent = lines.join('\n');
    processJson();
  });
  
  // Eğer stdin kapalıysa, dosyadan oku
  if (process.stdin.isTTY) {
    const jsonPath = path.join(__dirname, '../example-variant-request.json');
    jsonContent = fs.readFileSync(jsonPath, 'utf8');
    processJson();
  }
}

function processJson() {
  const data = JSON.parse(jsonContent);
  analyzeTemplate(data);
}

function analyzeTemplate(data) {

  // Template'i bul
  const template = data.base?.template || data;

  let textCount = 0;
  let imageCount = 0;
  let audioCount = 0;
  let videoCount = 0;
  let otherCount = 0;
  const foundPluginIds = new Set(); // Duplicate saymayı önlemek için

  // pluginToolbarsById içinde ara
  if (template.present?.pluginToolbarsById) {
    const toolbars = template.present.pluginToolbarsById;
    for (const boxId of Object.keys(toolbars)) {
      const toolbar = toolbars[boxId];
      const pluginId = toolbar?.pluginId || '';
      
      if (!pluginId || foundPluginIds.has(boxId)) continue;
      foundPluginIds.add(boxId);
      
      if (pluginId === 'BasicText' || pluginId === 'RichText') {
        textCount++;
      } else if (pluginId === 'ImageBox' || pluginId === 'HotspotImages' || pluginId === 'Image') {
        imageCount++;
      } else if (pluginId === 'AudioBox' || pluginId === 'SoundBox' || pluginId === 'Audio') {
        audioCount++;
      } else if (pluginId === 'VideoBox' || pluginId === 'Video') {
        videoCount++;
      } else if (pluginId) {
        otherCount++;
      }
    }
  }

  // viewToolbarsById içinde de ara
  if (template.present?.viewToolbarsById) {
    const toolbars = template.present.viewToolbarsById;
    for (const boxId of Object.keys(toolbars)) {
      const toolbar = toolbars[boxId];
      const pluginId = toolbar?.pluginId || '';
      
      if (!pluginId || foundPluginIds.has(boxId)) continue;
      foundPluginIds.add(boxId);
      
      if (pluginId === 'BasicText' || pluginId === 'RichText') {
        textCount++;
      } else if (pluginId === 'ImageBox' || pluginId === 'HotspotImages' || pluginId === 'Image') {
        imageCount++;
      } else if (pluginId === 'AudioBox' || pluginId === 'SoundBox' || pluginId === 'Audio') {
        audioCount++;
      } else if (pluginId === 'VideoBox' || pluginId === 'Video') {
        videoCount++;
      } else if (pluginId) {
        otherCount++;
      }
    }
  }

  // boxesById içinde de ara (eğer pluginId orada varsa)
  if (template.present?.boxesById) {
    for (const boxId of Object.keys(template.present.boxesById)) {
      // Eğer zaten pluginToolbarsById'de bulunduysa, tekrar sayma
      if (foundPluginIds.has(boxId)) continue;
      
      const box = template.present.boxesById[boxId];
      let pluginId = '';
      
      // Eğer box içinde toolbar varsa
      if (box.toolbar) {
        pluginId = box.toolbar?.pluginId || '';
      }
      // Eğer doğrudan pluginId varsa
      else if (box.pluginId) {
        pluginId = box.pluginId;
      }
      
      if (!pluginId) continue;
      foundPluginIds.add(boxId);
      
      if (pluginId === 'BasicText' || pluginId === 'RichText') {
        textCount++;
      } else if (pluginId === 'ImageBox' || pluginId === 'HotspotImages' || pluginId === 'Image') {
        imageCount++;
      } else if (pluginId === 'AudioBox' || pluginId === 'SoundBox' || pluginId === 'Audio') {
        audioCount++;
      } else if (pluginId === 'VideoBox' || pluginId === 'Video') {
        videoCount++;
      } else {
        otherCount++;
      }
    }
  }

  // Sonuçları göster
  console.log('\n📊 Template İçerik Analizi\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📝 Text (Metin):        ${textCount}`);
  console.log(`🖼️  Resim (Image):      ${imageCount}`);
  console.log(`🎵 Müzik/Ses (Audio):   ${audioCount}`);
  console.log(`🎬 Video:              ${videoCount}`);
  console.log(`❓ Diğer:               ${otherCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📦 Toplam Box:          ${textCount + imageCount + audioCount + videoCount + otherCount}`);
  console.log('');
}

// Eğer dosya argümanı verilmişse veya stdin TTY ise, hemen çalıştır
if (process.argv[2] || process.stdin.isTTY) {
  processJson();
}

