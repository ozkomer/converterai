#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ScenePredictor servisini kullan
const { ScenePredictor } = require('../dist/services/scenePredictor');

// JSON dosyasını oku
const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Usage: node analyze-scenes.js <template-file.json>');
  process.exit(1);
}

const resolvedPath = path.resolve(jsonPath);
if (!fs.existsSync(resolvedPath)) {
  console.error(`File not found: ${resolvedPath}`);
  process.exit(1);
}

const jsonContent = fs.readFileSync(resolvedPath, 'utf8');
const templateData = JSON.parse(jsonContent);

const predictor = new ScenePredictor();
const analysis = predictor.getSceneAnalysis(templateData);

console.log('\n🎬 SAHNE ANALİZİ\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📊 Toplam Sahne Sayısı: ${analysis.summary.totalScenes}`);
console.log(`📦 Toplam Box Sayısı: ${analysis.summary.totalBoxes}`);
console.log('\n📋 Sahne Tipleri Dağılımı:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
Object.entries(analysis.summary.sceneTypes)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`  ${type}: ${count} sahne`);
  });

console.log('\n\n🎯 Detaylı Sahne Analizi:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

analysis.scenes.forEach((scene, index) => {
  console.log(`\n${index + 1}. ${scene.pageId}`);
  console.log(`   Tahmini Tip: ${scene.estimatedSceneType || 'Bilinmiyor'}`);
  console.log(`   📝 Text: ${scene.textCount} | 🖼️ Image: ${scene.imageCount} | 🎵 Audio: ${scene.audioCount} | 🎬 Video: ${scene.videoCount} | ❓ Diğer: ${scene.otherCount}`);
  console.log(`   Toplam Box: ${scene.totalBoxes}`);
  
  if (scene.boxes.length > 0) {
    console.log(`   Box'lar:`);
    scene.boxes.slice(0, 5).forEach(box => {
      console.log(`     - ${box.boxId} (${box.type})`);
    });
    if (scene.boxes.length > 5) {
      console.log(`     ... ve ${scene.boxes.length - 5} box daha`);
    }
  }
});

console.log('\n');

