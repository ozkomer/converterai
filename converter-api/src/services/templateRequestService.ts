import fs from 'fs-extra';
import path from 'path';
import { Logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

export interface TemplateRequest {
  size: 'Capsule' | 'XL' | 'Maxi' | 'Micro' | 'Midi' | 'Mini';
  brand: 'default' | 'blue' | 'black' | 'green' | 'samsung' | 'sompo' | 'creatio' | 'champs' | 'silent';
}

export interface TemplateResponse {
  success: boolean;
  template: any;
  metadata: {
    size: string;
    brand: string;
    fileName: string;
    fileSize: string;
    boxesCount: number;
    lastModified: string;
  };
}

export class TemplateRequestService {
  // Boyut ve marka mapping'leri
  private readonly sizeMapping = {
    'Capsule': 'LSCapsule',
    'XL': 'LSXL', 
    'Maxi': 'LSMaxi',
    'Micro': 'LSMicro',
    'Midi': 'LSMidi',
    'Mini': 'LSMini'
  };

  private readonly brandMapping = {
    'default': 'default',
    'blue': 'blue',
    'black': 'black', 
    'green': 'green',
    'samsung': 'samsung',
    'sompo': 'sompo',
    'creatio': 'creatio',
    'champs': 'champs',
    'silent': 'silent'
  };

  // Template dosya adları
  private readonly templateFiles: Record<string, Record<string, string>> = {
    'LSCapsule': {
      'default': 'voiceidealStudioTemplate_default.json',
      'blue': 'voiceidealStudioTemplate_blue.json',
      'black': 'voiceidealStudioTemplate_black.json',
      'green': 'voiceidealStudioTemplate_green.json',
      'samsung': 'voiceidealStudioTemplate_samsung.json',
      'sompo': 'voiceidealStudioTemplate_sompo.json',
      'creatio': 'voiceidealStudioTemplate_creatio.json',
      'champs': 'voiceidealStudioTemplate_champs.json',
      'silent': 'silentIIdealStudioTemplate.json'
    },
    'LSXL': {
      'default': 'voiceidealStudioTemplate.json',
      'samsung': 'voiceidealStudioTemplate_samsung.json',
      'sompo': 'voiceidealStudioTemplate_sompo.json'
    },
    'LSMaxi': {
      'default': 'voiceidealStudioTemplate.json',
      'samsung': 'voiceidealStudioTemplate_samsung.json',
      'sompo': 'voiceidealStudioTemplate_sompo.json'
    },
    'LSMicro': {
      'default': 'voiceidealStudioTemplate.json',
      'samsung': 'voiceidealStudioTemplate_samsung.json',
      'sompo': 'voiceidealStudioTemplate_sompo.json'
    },
    'LSMidi': {
      'default': 'voiceidealStudioTemplate.json',
      'samsung': 'voiceidealStudioTemplate_samsung.json',
      'sompo': 'voiceidealStudioTemplate_sompo.json'
    },
    'LSMini': {
      'default': 'voiceidealStudioTemplate.json',
      'samsung': 'voiceidealStudioTemplate_samsung.json',
      'sompo': 'voiceidealStudioTemplate_sompo.json'
    }
  };

  // Template'i getir
  async getTemplate(request: TemplateRequest): Promise<TemplateResponse> {
    try {
      Logger.info(`Getting template: ${request.size}-${request.brand}`);

      // Boyut ve marka mapping'lerini kontrol et
      const sizeKey = this.sizeMapping[request.size];
      const brandKey = this.brandMapping[request.brand];

      if (!sizeKey) {
        throw createError(`Invalid size: ${request.size}. Valid sizes: Capsule, XL, Maxi, Micro, Midi, Mini`, 400);
      }

      if (!brandKey) {
        throw createError(`Invalid brand: ${request.brand}. Valid brands: default, blue, black, green, samsung, sompo, creatio, champs, silent`, 400);
      }

      // Template dosya adını al
      const fileName = this.templateFiles[sizeKey]?.[brandKey];
      if (!fileName) {
        throw createError(`Template not found for ${request.size}-${request.brand}`, 404);
      }

      // Template dosya yolunu oluştur
      const templateDir = path.join(__dirname, '../../../templates', sizeKey);
      const templatePath = path.join(templateDir, fileName);

      // Dosyanın var olup olmadığını kontrol et
      if (!await fs.pathExists(templatePath)) {
        throw createError(`Template file not found: ${templatePath}`, 404);
      }

      // Template'i oku (tag placeholder'ları olabilir)
      const templateStr = await fs.readFile(templatePath, 'utf8');
      
      // Template'i olduğu gibi döndür (temizleme yapmadan)
      const stats = await fs.stat(templatePath);
      const fileSize = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;
      const lastModified = stats.mtime.toISOString();

      Logger.success(`Template loaded: ${request.size}-${request.brand} (${fileSize})`);

      return {
        success: true,
        template: templateStr, // Raw template string (temizlenmemiş)
        metadata: {
          size: request.size,
          brand: request.brand,
          fileName,
          fileSize,
          boxesCount: 0, // Template string olduğu için box sayısı hesaplanamıyor
          lastModified
        }
      };

    } catch (error: any) {
      Logger.error(`Failed to get template ${request.size}-${request.brand}:`, error);
      throw createError(`Failed to get template: ${error.message}`, error.status || 500);
    }
  }

  // Mevcut template'leri listele
  async listAvailableTemplates(): Promise<any[]> {
    const templates: any[] = [];
    
    for (const [sizeKey, sizeName] of Object.entries(this.sizeMapping)) {
      for (const [brandKey, brandName] of Object.entries(this.brandMapping)) {
        const fileName = this.templateFiles[sizeKey as keyof typeof this.templateFiles]?.[brandKey];
        
        if (fileName) {
          const templateDir = path.join(__dirname, '../../../templates', sizeKey);
          const templatePath = path.join(templateDir, fileName);
          const exists = await fs.pathExists(templatePath);
          
          templates.push({
            size: sizeName,
            brand: brandName,
            fileName,
            exists,
            templateType: `${sizeName}-${brandName}`,
            fullPath: templatePath
          });
        }
      }
    }
    
    return templates;
  }

  // Template validation
  async validateTemplate(size: string, brand: string): Promise<boolean> {
    try {
      const request: TemplateRequest = {
        size: size as any,
        brand: brand as any
      };
      
      await this.getTemplate(request);
      return true;
    } catch {
      return false;
    }
  }

  // Template metadata'sını al
  async getTemplateMetadata(size: string, brand: string): Promise<any> {
    try {
      const request: TemplateRequest = {
        size: size as any,
        brand: brand as any
      };
      
      const response = await this.getTemplate(request);
      
      return {
        size: response.metadata.size,
        brand: response.metadata.brand,
        fileName: response.metadata.fileName,
        fileSize: response.metadata.fileSize,
        boxesCount: response.metadata.boxesCount,
        lastModified: response.metadata.lastModified,
        version: response.template.present?.version,
        globalConfig: response.template.present?.globalConfig
      };
    } catch (error: any) {
      throw createError(`Failed to get template metadata: ${error.message}`, 500);
    }
  }
}
