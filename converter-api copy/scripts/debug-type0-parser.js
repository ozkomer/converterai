const fs = require('fs-extra');
const path = require('path');

async function debugType0Parser() {
  console.log('🔍 Debugging Type0 Parser...\n');
  
  try {
    const content = await fs.readFile(path.join(process.cwd(), 'type0.txt'), 'utf8');
    console.log('📄 File loaded successfully');
    
    // Split by theme sections
    const themeSections = content.split('----------------------------------------------------------------------------------');
    console.log(`📊 Found ${themeSections.length} theme sections\n`);
    
    for (let i = 0; i < themeSections.length; i++) {
      const section = themeSections[i];
      if (!section.trim()) continue;
      
      console.log(`🎨 Section ${i + 1}:`);
      const lines = section.split('\n').map(line => line.trim()).filter(line => line);
      
      let brand = '';
      let sceneIndex = 0;
      let pageConfig = null;
      let textBox = null;
      let imageBox = null;
      let specialContent = [];
      
      let currentSection = '';
      let jsonBuffer = '';
      let braceCount = 0;
      let inJsonObject = false;
      
      for (let j = 0; j < lines.length; j++) {
        const line = lines[j];
        
        // Detect theme name
        if (line.includes('THEME') && !brand) {
          brand = line.replace('THEME', '').replace(';', '').trim();
          console.log(`  🏷️  Brand: ${brand}`);
          continue;
        }
        
        // Detect scene index
        if (line.includes('Sahne index')) {
          const match = line.match(/Sahne index;\s*(\d+)/);
          if (match) {
            sceneIndex = parseInt(match[1]);
            console.log(`  📍 Scene Index: ${sceneIndex}`);
          }
          continue;
        }
        
        // Detect sections
        if (line.includes('Sahnenin Kendisi:') || line.includes('Sahnenin kendisi:')) {
          currentSection = 'pageConfig';
          console.log(`  📄 Found pageConfig section`);
          continue;
        }
        
        if (line.includes('Sahne içindeki text')) {
          currentSection = 'textBox';
          console.log(`  📝 Found textBox section`);
          continue;
        }
        
        if (line.includes('#{[type0:imageurl]}#') || line.includes('#{[type0:ImageUrl]}#')) {
          currentSection = 'imageBox';
          console.log(`  🖼️  Found imageBox section`);
          continue;
        }
        
        if (line.includes('ÖZEL İÇERİKLER')) {
          currentSection = 'specialContent';
          console.log(`  ⭐ Found specialContent section`);
          continue;
        }
        
        // Parse JSON objects
        if ((line.startsWith('"') && line.includes(':')) || line.startsWith('{')) {
          if (!inJsonObject) {
            inJsonObject = true;
            jsonBuffer = line;
            braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
            console.log(`  🔍 Started JSON for ${currentSection}: braceCount=${braceCount}`);
          } else {
            jsonBuffer += line;
            braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
          }
          
          // Check if JSON is complete (brace count = 0)
          if (braceCount === 0 && inJsonObject) {
            try {
              const jsonObj = JSON.parse(jsonBuffer);
              console.log(`  ✅ Complete JSON found for ${currentSection}`);
              
              switch (currentSection) {
                case 'pageConfig':
                  pageConfig = jsonObj;
                  break;
                case 'textBox':
                  textBox = jsonObj;
                  break;
                case 'imageBox':
                  imageBox = jsonObj;
                  break;
                case 'specialContent':
                  specialContent.push(jsonObj);
                  break;
              }
              
              jsonBuffer = '';
              inJsonObject = false;
              braceCount = 0;
              currentSection = '';
            } catch (error) {
              console.log(`  ❌ JSON parse error for ${currentSection}: ${error.message}`);
            }
          }
        } else if (inJsonObject) {
          // Continue building JSON buffer for multi-line JSON
          jsonBuffer += line;
          braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
          
          // Check if JSON is complete
          if (braceCount === 0) {
            try {
              const jsonObj = JSON.parse(jsonBuffer);
              console.log(`  ✅ Complete JSON found for ${currentSection} (multi-line)`);
              
              switch (currentSection) {
                case 'pageConfig':
                  pageConfig = jsonObj;
                  break;
                case 'textBox':
                  textBox = jsonObj;
                  break;
                case 'imageBox':
                  imageBox = jsonObj;
                  break;
                case 'specialContent':
                  specialContent.push(jsonObj);
                  break;
              }
              
              jsonBuffer = '';
              inJsonObject = false;
              braceCount = 0;
              currentSection = '';
            } catch (error) {
              console.log(`  ❌ JSON parse error for ${currentSection} (multi-line): ${error.message}`);
            }
          }
        }
      }
      
      console.log(`  📊 Results:`);
      console.log(`    - Brand: ${brand}`);
      console.log(`    - Scene Index: ${sceneIndex}`);
      console.log(`    - Page Config: ${pageConfig ? '✅' : '❌'}`);
      console.log(`    - Text Box: ${textBox ? '✅' : '❌'}`);
      console.log(`    - Image Box: ${imageBox ? '✅' : '❌'}`);
      console.log(`    - Special Content: ${specialContent.length} items`);
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugType0Parser();
