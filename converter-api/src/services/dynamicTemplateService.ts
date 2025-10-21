import fs from 'fs-extra';
import path from 'path';
import { Logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

export interface DynamicTemplateResult {
  convertedTemplate: any;
  templateInfo: {
    size: string;
    variant: string;
    fileName: string;
    boxesCount: number;
    sectionsMapped: number;
    quizzesMapped: number;
  };
  stats: {
    sections: number;
    quizzes: number;
    totalTags: number;
    replacedTags: number;
    templateSize: string;
    dynamicBoxesCreated: number;
  };
}

export class DynamicTemplateService {
  // Referans template'ler - finalize edilmiş template'ler
  private readonly referenceTemplates: Record<string, Record<string, string>> = {
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

  // Referans template'i yükle
  private async loadReferenceTemplate(templateType: string): Promise<any> {
    const { size, variant } = this.parseTemplateType(templateType);
    const templateDir = path.join(__dirname, '../../../templates', size);
    const fileName = this.referenceTemplates[size]?.[variant] || this.referenceTemplates[size]?.default;
    
    if (!fileName) {
      throw createError(`Reference template not found for type: ${templateType}`, 404);
    }
    
    const templatePath = path.join(templateDir, fileName);
    
    if (!await fs.pathExists(templatePath)) {
      throw createError(`Reference template file not found: ${templatePath}`, 404);
    }

    const templateStr = await fs.readFile(templatePath, 'utf8');
    return JSON.parse(templateStr);
  }

  // PageStyle'ı template type'a map et
  private mapPageStyleToType(pageStyle: number): string {
    const styleMap: Record<number, string> = {
      1: 'type1_1',
      2: 'type1_2', 
      3: 'type1_3',
      4: 'type2_1',
      5: 'type2_2',
      6: 'type2_3',
      7: 'type3_1',
      8: 'type3_2',
      9: 'type3_3',
      10: 'type4_1',
      11: 'type4_2',
      12: 'type4_3',
      13: 'type5_1',
      14: 'type5_2',
      15: 'type5_3',
      16: 'type6_1',
      17: 'type6_2',
      18: 'type6_3',
      19: 'type7_1',
      20: 'type7_2',
      21: 'type7_3',
      22: 'type8_1',
      23: 'type8_2',
      24: 'type8_3',
      25: 'type9_1',
      26: 'type9_2',
      27: 'type9_3',
      28: 'type10_1',
      29: 'type10_2',
      30: 'type10_3'
    };
    
    return styleMap[pageStyle] || 'type1_1';
  }

  // Box ID'yi bul
  private findMatchingBoxId(boxesById: any, typeName: string, index: number): string | null {
    const boxIds = Object.keys(boxesById);
    
    // Önce type'a göre ara
    for (const boxId of boxIds) {
      const box = boxesById[boxId];
      if (box.type === typeName) {
        return boxId;
      }
    }
    
    // Type bulunamazsa index'e göre ara
    if (index < boxIds.length) {
      return boxIds[index];
    }
    
    // Hiçbiri bulunamazsa ilk box'ı döndür
    return boxIds[0] || null;
  }

  // Quiz box ID'yi bul
  private findQuizBoxId(boxesById: any, index: number): string | null {
    const boxIds = Object.keys(boxesById);
    
    // Quiz type'larını ara
    const quizTypes = ['quiz', 'question', 'test'];
    for (const boxId of boxIds) {
      const box = boxesById[boxId];
      if (box.type && quizTypes.some(qt => box.type.toLowerCase().includes(qt))) {
        return boxId;
      }
    }
    
    // Quiz bulunamazsa son box'ları dene
    const lastBoxes = boxIds.slice(-3); // Son 3 box
    if (index < lastBoxes.length) {
      return lastBoxes[index];
    }
    
    return boxIds[boxIds.length - 1] || null;
  }

  // Dinamik template oluştur
  async createDynamicTemplate(aiOutput: any, templateType: string): Promise<DynamicTemplateResult> {
    try {
      Logger.info(`Creating dynamic template for type: ${templateType}`);

      // Referans template'i yükle
      const referenceTemplate = await this.loadReferenceTemplate(templateType);
      Logger.info(`Reference template loaded: ${templateType}`);

      // Template'i klonla
      const dynamicTemplate = JSON.parse(JSON.stringify(referenceTemplate));
      
      // Global config'i güncelle
      this.updateGlobalConfig(dynamicTemplate, aiOutput);
      
      // Sections'ları dinamik olarak map et
      const sectionsMapped = this.mapSectionsToBoxes(dynamicTemplate, aiOutput);
      
      // Quiz'leri dinamik olarak map et
      const quizzesMapped = this.mapQuizzesToBoxes(dynamicTemplate, aiOutput);
      
      // Template metadata'sını al
      const templateStats = await fs.stat(this.getTemplatePath(templateType));
      const templateSize = `${(templateStats.size / 1024 / 1024).toFixed(2)} MB`;
      
      const stats = {
        sections: aiOutput.Sections?.length || 0,
        quizzes: aiOutput.GeneralQuiz?.length || 0,
        totalTags: this.countTotalTags(aiOutput),
        replacedTags: sectionsMapped + quizzesMapped,
        templateSize,
        dynamicBoxesCreated: sectionsMapped + quizzesMapped
      };

      const templateInfo = {
        size: this.parseTemplateType(templateType).size,
        variant: this.parseTemplateType(templateType).variant,
        fileName: this.referenceTemplates[this.parseTemplateType(templateType).size]?.[this.parseTemplateType(templateType).variant] || 'unknown',
        boxesCount: Object.keys(dynamicTemplate.present?.boxesById || {}).length,
        sectionsMapped,
        quizzesMapped
      };

      Logger.success(`Dynamic template created for ${templateType}: ${sectionsMapped} sections, ${quizzesMapped} quizzes mapped`);

      return {
        convertedTemplate: dynamicTemplate,
        templateInfo,
        stats
      };

    } catch (error: any) {
      Logger.error('Dynamic template creation failed:', error);
      throw createError(`Dynamic template creation failed: ${error.message}`, 500);
    }
  }

  // Global config'i güncelle
  private updateGlobalConfig(template: any, aiOutput: any): void {
    if (!template.present?.globalConfig) return;

    const config = template.present.globalConfig;
    
    if (aiOutput.CourseInfo) {
      const course = aiOutput.CourseInfo;
      
      if (course.Title) {
        config.title = course.Title;
      }
      
      if (course.Description) {
        config.description = course.Description;
      }
      
      if (course.CourseImageUrl) {
        config.thumbnail = course.CourseImageUrl;
      }
      
      if (course.AudioDuration) {
        const minutes = Math.floor(course.AudioDuration / 60);
        const seconds = course.AudioDuration % 60;
        config.typicalLearningTime = {
          h: 0,
          m: minutes,
          s: seconds
        };
      }
    }
  }

  // Sections'ları boxesById'e map et
  private mapSectionsToBoxes(template: any, aiOutput: any): number {
    if (!template.present?.boxesById || !aiOutput.Sections) return 0;

    const boxes = template.present.boxesById;
    let mappedCount = 0;

    aiOutput.Sections.forEach((section: any, index: number) => {
      const typeName = this.mapPageStyleToType(section.PageStyle || (index + 1));
      const matchingBoxId = this.findMatchingBoxId(boxes, typeName, index);
      
      if (matchingBoxId && boxes[matchingBoxId]) {
        const box = boxes[matchingBoxId];
        
        // Title mapping
        if (section.Title && box.pagination?.title !== undefined) {
          box.pagination.title = section.Title;
        }
        
        // Narration mapping
        if (section.NarrationText && box.pagination?.narration !== undefined) {
          box.pagination.narration = section.NarrationText;
        }
        
        // Content mapping
        if (section.Content) {
          let contentText = '';
          if (typeof section.Content === 'string') {
            contentText = section.Content;
          } else if (section.Content.paragraph) {
            contentText = section.Content.paragraph;
          }
          
          if (contentText && box.pagination?.content !== undefined) {
            box.pagination.content = contentText;
          }
        }
        
        // Images mapping
        if (section.Images && Array.isArray(section.Images)) {
          section.Images.forEach((image: any, imgIndex: number) => {
            if (image.ImageUrl && box.pagination?.images?.[imgIndex] !== undefined) {
              box.pagination.images[imgIndex] = image.ImageUrl;
            }
          });
        }
        
        // Audio mapping
        if (section.SpeechAudioUrl && box.pagination?.audio !== undefined) {
          box.pagination.audio = section.SpeechAudioUrl;
        }
        
        mappedCount++;
      }
    });

    return mappedCount;
  }

  // Quiz'leri boxesById'e map et
  private mapQuizzesToBoxes(template: any, aiOutput: any): number {
    if (!template.present?.boxesById || !aiOutput.GeneralQuiz) return 0;

    const boxes = template.present.boxesById;
    let mappedCount = 0;

    aiOutput.GeneralQuiz.forEach((quiz: any, index: number) => {
      const quizBoxId = this.findQuizBoxId(boxes, index);
      
      if (quizBoxId && boxes[quizBoxId]) {
        const box = boxes[quizBoxId];
        
        // Question mapping
        if (quiz.Question && box.pagination?.question !== undefined) {
          box.pagination.question = quiz.Question;
        }
        
        // Options mapping
        if (quiz.Options && Array.isArray(quiz.Options)) {
          quiz.Options.forEach((option: string, optIndex: number) => {
            if (box.pagination?.options?.[optIndex] !== undefined) {
              box.pagination.options[optIndex] = option;
            }
          });
        }
        
        // Correct answers mapping
        if (quiz.CorrectAnswers && Array.isArray(quiz.CorrectAnswers)) {
          if (box.pagination?.correctAnswers !== undefined) {
            box.pagination.correctAnswers = quiz.CorrectAnswers;
          }
        }
        
        mappedCount++;
      }
    });

    return mappedCount;
  }

  // Toplam tag sayısını hesapla
  private countTotalTags(aiOutput: any): number {
    let count = 0;
    
    if (aiOutput.CourseInfo) count += 5; // Title, description, image, audio, duration
    
    if (aiOutput.Sections) {
      aiOutput.Sections.forEach((section: any) => {
        count += 3; // Title, narration, content
        if (section.Images) count += section.Images.length;
        if (section.SpeechAudioUrl) count += 1;
      });
    }
    
    if (aiOutput.GeneralQuiz) {
      aiOutput.GeneralQuiz.forEach((quiz: any) => {
        count += 1; // Question
        if (quiz.Options) count += quiz.Options.length;
        if (quiz.CorrectAnswers) count += 1;
      });
    }
    
    return count;
  }

  // Template path'i al
  private getTemplatePath(templateType: string): string {
    const { size, variant } = this.parseTemplateType(templateType);
    const templateDir = path.join(__dirname, '../../../templates', size);
    const fileName = this.referenceTemplates[size]?.[variant] || this.referenceTemplates[size]?.default;
    return path.join(templateDir, fileName);
  }

  // Template validation
  async validateTemplate(templateType: string): Promise<boolean> {
    try {
      const templatePath = this.getTemplatePath(templateType);
      return await fs.pathExists(templatePath);
    } catch {
      return false;
    }
  }

  // Tüm mevcut template'leri listele
  async listAvailableTemplates(): Promise<any[]> {
    const templates: any[] = [];
    
    for (const [size, variants] of Object.entries(this.referenceTemplates)) {
      for (const [variant, fileName] of Object.entries(variants)) {
        const templateDir = path.join(__dirname, '../../../templates', size);
        const fullPath = path.join(templateDir, fileName);
        const exists = await fs.pathExists(fullPath);
        
        templates.push({
          size,
          variant,
          fileName,
          fullPath,
          exists,
          templateType: `${size}-${variant}`
        });
      }
    }
    
    return templates;
  }
}
