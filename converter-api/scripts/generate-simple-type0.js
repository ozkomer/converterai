const fs = require('fs-extra');
const path = require('path');

async function generateType0Example() {
  console.log('🎨 Basit Type0 Template Örneği oluşturuluyor...\n');

  const outputDir = path.join(process.cwd(), 'outputs');
  await fs.ensureDir(outputDir);

  // BLUE markası için örnek template
  const blueContent = {
    title: 'Güvenlik ve İş Sağlığı Eğitimi',
    imageUrl: 'https://ls.elearningsolutions.net//ContentFiles/IdealStudioFiles/611_e12c9d51-de9f-4d6c-925e-9dff8ad77046.png',
    mandatory: true
  };

  // Template HTML title'ı oluştur
  const escapedTitle = blueContent.title
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const htmlTitle = `%3Cp%3E%3Cspan%20style=%22font-size:3.5714285714285716em;%22%3E%3Cspan%20style=%22font-family:Alata,sans-serif;%22%3E%3Cspan%20style=%22color:#ffffff;%22%3E${encodeURIComponent(escapedTitle)}%3C/span%3E%3C/span%3E%3C/span%3E%3C/p%3E%0A`;

  const type0Template = {
    pages: {
      "pa-type0-blue-example": {
        "id": "pa-type0-blue-example",
        "breadcrumb": "hidden",
        "doc_type": "slide",
        "viewName": blueContent.title,
        "courseTitle": "hidden",
        "documentSubtitle": "hidden",
        "documentSubtitleContent": "Alt Başlık",
        "documentTitle": "hidden",
        "documentTitleContent": "",
        "numPage": "hidden",
        "numPageContent": 1,
        "customSize": 0,
        "aspectRatio": true,
        "background": "https://ls.elearningsolutions.net//ContentFiles/IdealStudioFiles/611_e12c9d51-de9f-4d6c-925e-9dff8ad77046.png",
        "backgroundAttr": "full",
        "backgroundZoom": 100,
        "backgroundOpacity": 100,
        "isMandatory": blueContent.mandatory,
        "mandatoryType": "waitForSound"
      }
    },
    boxesById: {
      "bo-type0-text-example": {
        "box": {
          "id": "bo-type0-text-example",
          "parent": "pa-type0-blue-example",
          "container": 0,
          "level": 0,
          "col": 0,
          "row": 0,
          "position": {
            "x": "47.586200000000005%",
            "y": "30.790200000000002%",
            "type": "absolute"
          },
          "content": {},
          "draggable": true,
          "resizable": true,
          "showTextEditor": false,
          "fragment": {},
          "children": [],
          "sortableContainers": {},
          "containedViews": []
        },
        "toolbar": {
          "id": "bo-type0-text-example",
          "pluginId": "BasicText",
          "state": {
            "__text": htmlTitle
          },
          "structure": {
            "height": "auto",
            "width": 51.40380952380952,
            "widthUnit": "%",
            "heightUnit": "%",
            "rotation": 0,
            "aspectRatio": false,
            "position": "absolute",
            "x": "47.586200000000005%",
            "y": "30.790200000000002%"
          },
          "style": {
            "padding": 7,
            "backgroundColor": "rgba(255,255,255,0)",
            "borderWidth": 0,
            "borderStyle": "solid",
            "borderColor": "#000000",
            "borderRadius": 0,
            "opacity": 1
          },
          "showTextEditor": false,
          "position": {
            "x": "47.586200000000005%",
            "y": "30.790200000000002%",
            "type": "absolute"
          }
        },
        "marks": {},
        "childBoxes": {},
        "childToolbars": {}
      },
      "bo-type0-image-example": {
        "box": {
          "id": "bo-type0-image-example",
          "parent": "pa-type0-blue-example",
          "container": 0,
          "level": 0,
          "col": 0,
          "row": 0,
          "position": {
            "x": "3%",
            "y": "20.29972752043597%",
            "type": "absolute"
          },
          "content": {},
          "draggable": true,
          "resizable": true,
          "showTextEditor": false,
          "fragment": {},
          "children": [],
          "sortableContainers": {},
          "containedViews": []
        },
        "toolbar": {
          "id": "bo-type0-image-example",
          "pluginId": "HotspotImages",
          "state": {
            "url": blueContent.imageUrl,
            "allowDeformed": true
          },
          "structure": {
            "height": 54.504359673024524,
            "width": 37.18153256704981,
            "widthUnit": "%",
            "heightUnit": "%",
            "rotation": 0,
            "aspectRatio": true,
            "position": "absolute",
            "x": "11.08%",
            "y": "24.82%"
          },
          "style": {
            "padding": 0,
            "backgroundColor": "rgba(255,255,255,0)",
            "borderWidth": 0,
            "borderStyle": "solid",
            "borderColor": "#000000",
            "borderRadius": 0,
            "opacity": 1
          },
          "showTextEditor": false,
          "position": {
            "x": "3%",
            "y": "20.29972752043597%",
            "type": "absolute"
          }
        },
        "marks": {},
        "childBoxes": {},
        "childToolbars": {}
      }
    }
  };

  const metadata = {
    brand: 'BLUE',
    sceneIndex: 1,
    generatedAt: new Date().toISOString(),
    content: blueContent
  };

  const output = {
    metadata,
    template: type0Template
  };

  const outputPath = path.join(outputDir, 'type0-blue-template-example.json');
  await fs.writeJSON(outputPath, output, { spaces: 2 });

  console.log('✅ Type0 Template oluşturuldu!');
  console.log(`💾 Kaydedildi: ${outputPath}`);
  console.log('\n📊 Template Özeti:');
  console.log(`   Marka: BLUE`);
  console.log(`   Sahne Index: 1`);
  console.log(`   Başlık: ${blueContent.title}`);
  console.log(`   Mandatory: ${blueContent.mandatory}`);
  console.log(`   Mandatory Type: waitForSound`);
  console.log(`   Sayfa ID: pa-type0-blue-example`);
  console.log(`   Text Box ID: bo-type0-text-example`);
  console.log(`   Image Box ID: bo-type0-image-example`);

  console.log('\n🎉 Template başarıyla oluşturuldu!');
}

generateType0Example().catch(console.error);

