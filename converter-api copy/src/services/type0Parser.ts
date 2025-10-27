import fs from 'fs-extra';
import path from 'path';
import { Logger } from '../utils/logger';

export interface ParsedType0Template {
  brand: string;
  sceneIndex: number;
  pageConfig: any;
  textBox: any;
  imageBox?: any;
  specialContent: any[];
}

export class Type0Parser {
  private readonly type0FilePath: string;

  constructor() {
    // type0.txt dosyasını bul - converter-api dizininde veya root dizinde olabilir
    const possiblePaths = [
      path.join(process.cwd(), 'type0.txt'),
      path.join(process.cwd(), 'converter-api', 'type0.txt'),
      path.resolve(__dirname, '../../type0.txt'),
      path.resolve(__dirname, '../../../converter-api/type0.txt')
    ];
    
    this.type0FilePath = possiblePaths[2]; // Geçici olarak doğrudan path kullan
  }

  async parseType0File(): Promise<Record<string, ParsedType0Template>> {
    try {
      Logger.info('Parsing Type0 template file...');
      
      const content = await fs.readFile(this.type0FilePath, 'utf8');
      const templates: Record<string, ParsedType0Template> = {};

      // Split by theme sections
      const themeSections = content.split('----------------------------------------------------------------------------------');
      
      for (const section of themeSections) {
        if (section.trim()) {
          const template = this.parseThemeSection(section);
          if (template) {
            templates[template.brand] = template;
          }
        }
      }

      Logger.success(`Parsed ${Object.keys(templates).length} Type0 templates`);
      return templates;
    } catch (error) {
      Logger.error('Failed to parse Type0 file:', error);
      throw error;
    }
  }

  private parseThemeSection(section: string): ParsedType0Template | null {
    const lines = section.split('\n').map(line => line.trim()).filter(line => line);
    
    let brand = '';
    let sceneIndex = 0;
    let pageConfig: any = null;
    let textBox: any = null;
    let imageBox: any = null;
    let specialContent: any[] = [];

    let currentSection = '';
    let jsonBuffer = '';
    let braceCount = 0;
    let inJsonObject = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect theme name
      if (line.includes('THEME') && !brand) {
        brand = line.replace('THEME', '').replace(';', '').trim();
        continue;
      }

      // Detect scene index
      if (line.includes('Sahne index')) {
        const match = line.match(/Sahne index;\s*(\d+)/);
        if (match) {
          sceneIndex = parseInt(match[1]);
        }
        continue;
      }

      // Detect sections
      if (line.includes('Sahnenin Kendisi:') || line.includes('Sahnenin kendisi:')) {
        currentSection = 'pageConfig';
        continue;
      }

      if (line.includes('Sahne içindeki text')) {
        currentSection = 'textBox';
        continue;
      }

      if (line.includes('#{[type0:imageurl]}#') || line.includes('#{[type0:ImageUrl]}#')) {
        currentSection = 'imageBox';
        continue;
      }

      if (line.includes('ÖZEL İÇERİKLER')) {
        currentSection = 'specialContent';
        continue;
      }

      // Parse JSON objects - look for lines that start with quotes (JSON keys) or curly braces
      if ((line.startsWith('"') && line.includes(':')) || line.startsWith('{')) {
        if (!inJsonObject) {
          inJsonObject = true;
          jsonBuffer = line;
          braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        } else {
          jsonBuffer += line;
          braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        }
        
        // Check if JSON is complete (brace count = 0)
        if (braceCount === 0 && inJsonObject) {
          try {
            let jsonObj;
            
            // Handle JavaScript object literal format (pageConfig)
            if (currentSection === 'pageConfig' && jsonBuffer.includes('": {')) {
              // Convert JS object literal to JSON
              const jsObjectStr = `{${jsonBuffer}}`;
              jsonObj = JSON.parse(jsObjectStr);
            } else {
              // Handle regular JSON format
              jsonObj = JSON.parse(jsonBuffer);
            }
            
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
            // Continue building JSON buffer
          }
        }
      } else if (inJsonObject) {
        // Continue building JSON buffer for multi-line JSON
        jsonBuffer += line;
        braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        
        // Check if JSON is complete
        if (braceCount === 0) {
          try {
            let jsonObj;
            
            // Handle JavaScript object literal format (pageConfig)
            if (currentSection === 'pageConfig' && jsonBuffer.includes('": {')) {
              // Convert JS object literal to JSON
              const jsObjectStr = `{${jsonBuffer}}`;
              jsonObj = JSON.parse(jsObjectStr);
            } else {
              // Handle regular JSON format
              jsonObj = JSON.parse(jsonBuffer);
            }
            
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
            // Continue building JSON buffer
          }
        }
      }
    }

    if (!brand) {
      Logger.warn(`No brand found in section`);
      return null;
    }

    if (!pageConfig || !textBox) {
      Logger.warn(`Incomplete template for brand: ${brand} - missing pageConfig or textBox`);
      return null;
    }

    return {
      brand,
      sceneIndex,
      pageConfig,
      textBox,
      imageBox,
      specialContent
    };
  }

  async validateTemplate(template: ParsedType0Template): Promise<boolean> {
    try {
      // Validate required fields
      if (!template.brand || !template.pageConfig || !template.textBox) {
        return false;
      }

      // Validate JSON structures
      JSON.stringify(template.pageConfig);
      JSON.stringify(template.textBox);
      if (template.imageBox) {
        JSON.stringify(template.imageBox);
      }
      template.specialContent.forEach(item => JSON.stringify(item));

      return true;
    } catch {
      return false;
    }
  }
}
