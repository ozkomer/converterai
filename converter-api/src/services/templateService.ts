import fs from 'fs-extra';
import path from 'path';
import { Logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

export interface TemplateInfo {
  size: string;
  variant: string;
  fileName: string;
  fullPath: string;
  exists: boolean;
}

export interface TemplateConversionResult {
  convertedTemplate: any;
  templateInfo: TemplateInfo;
  stats: {
    sections: number;
    quizzes: number;
    totalTags: number;
    replacedTags: number;
    templateSize: string;
  };
}

export class TemplateService {
  // Template boyutları ve dosya yolları mapping'i
  private readonly templateMappings: Record<string, Record<string, string>> = {
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

  // Template boyutunu ve varyantını parse et
  parseTemplateType(templateType: string): { size: string; variant: string } {
    const parts = templateType.split('-');
    if (parts.length === 1) {
      return { size: 'LSCapsule', variant: 'default' };
    }
    if (parts.length === 2) {
      return { size: parts[0], variant: parts[1].toLowerCase() };
    }
    return { size: 'LSCapsule', variant: 'default' };
  }

  // Template dosya yolunu oluştur
  getTemplatePath(templateType: string): string {
    const { size, variant } = this.parseTemplateType(templateType);
    const templateDir = path.join(__dirname, '../../../templates', size);
    const fileName = this.templateMappings[size]?.[variant] || this.templateMappings[size]?.default;
    
    if (!fileName) {
      throw createError(`Template not found for type: ${templateType}`, 404);
    }
    
    return path.join(templateDir, fileName);
  }

  // Template bilgilerini al
  async getTemplateInfo(templateType: string): Promise<TemplateInfo> {
    const { size, variant } = this.parseTemplateType(templateType);
    const templateDir = path.join(__dirname, '../../../templates', size);
    const fileName = this.templateMappings[size]?.[variant] || this.templateMappings[size]?.default;
    const fullPath = path.join(templateDir, fileName);
    
    if (!fileName) {
      throw createError(`Template not found for type: ${templateType}`, 404);
    }

    const exists = await fs.pathExists(fullPath);
    
    return {
      size,
      variant,
      fileName,
      fullPath,
      exists
    };
  }

  // Tüm mevcut template'leri listele
  async listAvailableTemplates(): Promise<TemplateInfo[]> {
    const templates: TemplateInfo[] = [];
    
    for (const [size, variants] of Object.entries(this.templateMappings)) {
      for (const [variant, fileName] of Object.entries(variants)) {
        const templateDir = path.join(__dirname, '../../../templates', size);
        const fullPath = path.join(templateDir, fileName);
        const exists = await fs.pathExists(fullPath);
        
        templates.push({
          size,
          variant,
          fileName,
          fullPath,
          exists
        });
      }
    }
    
    return templates;
  }

  // Template'i oku
  async loadTemplate(templateType: string): Promise<string> {
    const templatePath = this.getTemplatePath(templateType);
    
    if (!await fs.pathExists(templatePath)) {
      throw createError(`Template file not found: ${templatePath}`, 404);
    }

    return await fs.readFile(templatePath, 'utf8');
  }

  // Tag mappings oluştur
  async buildTagMappings(aiOutput: any): Promise<Record<string, any>> {
    const tagMap: Record<string, any> = {};

    // Extract course info
    if (aiOutput.CourseInfo) {
      const course = aiOutput.CourseInfo;
      tagMap['training-title'] = course.Title || '';
      tagMap['training-description'] = course.Description || '';
      tagMap['type0:title'] = course.Title || '';
      tagMap['type0:imageurl'] = course.CourseImageUrl || '';
      tagMap['type0:audioduration'] = course.AudioDuration || 0;
    }

    // Extract sections
    if (aiOutput.Sections && Array.isArray(aiOutput.Sections)) {
      aiOutput.Sections.forEach((section: any, index: number) => {
        const sectionPrefix = `type${section.PageStyle || index + 1}`;
        
        // Title
        if (section.Title) {
          tagMap[`${sectionPrefix}:title`] = section.Title;
        }
        
        // Narration
        if (section.NarrationText) {
          tagMap[`${sectionPrefix}:narration`] = section.NarrationText;
        }
        
        // Content
        if (section.Content) {
          if (typeof section.Content === 'string') {
            tagMap[`${sectionPrefix}:content`] = section.Content;
          } else if (section.Content.paragraph) {
            tagMap[`${sectionPrefix}:content`] = section.Content.paragraph;
          }
        }
        
        // Images
        if (section.Images && Array.isArray(section.Images)) {
          section.Images.forEach((image: any, imgIndex: number) => {
            if (image.ImageUrl) {
              tagMap[`${sectionPrefix}:image${imgIndex + 1}`] = image.ImageUrl;
            }
          });
        }
        
        // Audio
        if (section.SpeechAudioUrl) {
          tagMap[`${sectionPrefix}:audio`] = section.SpeechAudioUrl;
        }
        
        if (section.AudioDuration) {
          tagMap[`${sectionPrefix}:audioduration`] = section.AudioDuration;
        }
      });
    }

    // Extract quizzes
    if (aiOutput.GeneralQuiz && Array.isArray(aiOutput.GeneralQuiz)) {
      aiOutput.GeneralQuiz.forEach((quiz: any, index: number) => {
        const quizPrefix = `quiz${index + 1}`;
        
        if (quiz.Question) {
          tagMap[`${quizPrefix}:question`] = quiz.Question;
        }
        
        if (quiz.Options && Array.isArray(quiz.Options)) {
          quiz.Options.forEach((option: string, optIndex: number) => {
            tagMap[`${quizPrefix}:option${optIndex + 1}`] = option;
          });
        }
        
        if (quiz.CorrectAnswers && Array.isArray(quiz.CorrectAnswers)) {
          tagMap[`${quizPrefix}:correct`] = quiz.CorrectAnswers.join(',');
        }
      });
    }

    // Fill missing tags with defaults
    this.fillMissingTags(tagMap);

    return tagMap;
  }

  // Missing tag'leri default değerlerle doldur
  private fillMissingTags(tagMap: Record<string, any>): void {
    const defaultTags = {
      'training-title': 'Untitled Training',
      'training-description': 'Training Description',
      'type0:title': 'Course Title',
      'type0:imageurl': 'https://via.placeholder.com/800x600',
      'type0:audioduration': 0
    };

    Object.entries(defaultTags).forEach(([key, defaultValue]) => {
      if (!tagMap[key]) {
        tagMap[key] = defaultValue;
      }
    });
  }

  // Tag'leri replace et
  replaceTags(templateStr: string, tagMap: Record<string, any>): string {
    let result = templateStr;
    
    Object.entries(tagMap).forEach(([tag, value]) => {
      const placeholder = `#{[${tag}]}#`;
      const stringValue = String(value || '');
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), stringValue);
    });
    
    return result;
  }

  // Empty file fields'ları düzelt
  fixEmptyFileFieldsInObject(obj: any): void {
    if (typeof obj !== 'object' || obj === null) return;
    
    if (Array.isArray(obj)) {
      obj.forEach(item => this.fixEmptyFileFieldsInObject(item));
    } else {
      Object.keys(obj).forEach(key => {
        if (key === 'file' && obj[key] === '') {
          obj[key] = 'https://via.placeholder.com/audio.mp3';
        } else if (typeof obj[key] === 'object') {
          this.fixEmptyFileFieldsInObject(obj[key]);
        }
      });
    }
  }

  // Ana conversion metodu
  async convertTemplate(aiOutput: any, templateType: string): Promise<TemplateConversionResult> {
    try {
      Logger.info(`Starting template conversion for type: ${templateType}`);

      // Template bilgilerini al
      const templateInfo = await this.getTemplateInfo(templateType);
      
      if (!templateInfo.exists) {
        throw createError(`Template file not found: ${templateInfo.fullPath}`, 404);
      }

      // Template'i oku
      const templateStr = await this.loadTemplate(templateType);
      Logger.info(`Template loaded: ${templateInfo.fileName}`);

      // Tag mappings oluştur
      const tagMap = await this.buildTagMappings(aiOutput);
      Logger.info(`Tag mappings built: ${Object.keys(tagMap).length} tags`);

      // Tag'leri replace et
      const replacedTemplate = this.replaceTags(templateStr, tagMap);
      Logger.info('Tags replaced in template');

      // JSON parse et
      let convertedTemplate;
      try {
        convertedTemplate = JSON.parse(replacedTemplate);
      } catch (parseError: any) {
        Logger.error('JSON parse error after tag replacement:', parseError.message);
        throw createError(`Invalid JSON after tag replacement: ${parseError.message}`, 500);
      }

      // Empty file fields'ları düzelt
      this.fixEmptyFileFieldsInObject(convertedTemplate);

      // Template dosya boyutunu al
      const templateStats = await fs.stat(templateInfo.fullPath);
      const templateSize = `${(templateStats.size / 1024 / 1024).toFixed(2)} MB`;

      const statsData = {
        sections: aiOutput.Sections?.length || 0,
        quizzes: aiOutput.GeneralQuiz?.length || 0,
        totalTags: Object.keys(tagMap).length,
        replacedTags: Object.keys(tagMap).length,
        templateSize
      };

      Logger.success(`Template conversion completed for ${templateType}`);
      return {
        convertedTemplate,
        templateInfo,
        stats: statsData
      };

    } catch (error: any) {
      Logger.error('Template conversion failed:', error);
      throw createError(`Template conversion failed: ${error.message}`, 500);
    }
  }

  // Template validation
  async validateTemplate(templateType: string): Promise<boolean> {
    try {
      const templateInfo = await this.getTemplateInfo(templateType);
      return templateInfo.exists;
    } catch {
      return false;
    }
  }

  // Template metadata
  async getTemplateMetadata(templateType: string): Promise<any> {
    try {
      const templateStr = await this.loadTemplate(templateType);
      const template = JSON.parse(templateStr);
      
      return {
        version: template.present?.version,
        globalConfig: template.present?.globalConfig,
        boxesCount: Object.keys(template.present?.boxesById || {}).length,
        templateType,
        lastActionDispatched: template.present?.lastActionDispatched
      };
    } catch (error: any) {
      throw createError(`Failed to get template metadata: ${error.message}`, 500);
    }
  }
}
