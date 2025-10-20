import fs from 'fs-extra';
import path from 'path';
import { Logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

// Import converter types and classes from the main converter
// We'll copy the essential parts here for API use

export interface ConversionResult {
  outputPath: string;
  stats: {
    sections: number;
    quizzes: number;
    totalTags: number;
    replacedTags: number;
  };
  fileSize: string;
}

export interface DataConversionResult {
  convertedTemplate: any;
  stats: {
    sections: number;
    quizzes: number;
    totalTags: number;
    replacedTags: number;
  };
}

export class ConversionService {
  async convert(aiOutputPath: string, templatePath: string): Promise<ConversionResult> {
    try {
      Logger.info('Starting conversion process...');

      // Validate input files
      await this.validateFiles(aiOutputPath, templatePath);

      // Read AI output
      const aiOutput = await fs.readJson(aiOutputPath);
      Logger.info(`AI output loaded: ${aiOutput.Sections?.length || 0} sections, ${aiOutput.GeneralQuiz?.length || 0} quizzes`);

      // Read template
      const templateStr = await fs.readFile(templatePath, 'utf8');
      Logger.info('Template loaded successfully');

      // Build tag mappings
      const tagMap = await this.buildTagMappings(aiOutput);
      Logger.info(`Tag mappings built: ${Object.keys(tagMap).length} tags`);

      // Replace tags in template
      const replacedTemplate = this.replaceTags(templateStr, tagMap);
      Logger.info('Tags replaced in template');

      // Save output
      const outputPath = await this.saveOutput(replacedTemplate);
      Logger.info(`Output saved: ${outputPath}`);

      // Fix empty file fields
      await this.fixFileFields(outputPath);

      const stats = await fs.stat(outputPath);
      const statsData = {
        sections: aiOutput.Sections?.length || 0,
        quizzes: aiOutput.GeneralQuiz?.length || 0,
        totalTags: Object.keys(tagMap).length,
        replacedTags: Object.keys(tagMap).length // Simplified for now
      };

      return {
        outputPath,
        stats: statsData,
        fileSize: `${(stats.size / 1024 / 1024).toFixed(2)} MB`
      };

    } catch (error: any) {
      Logger.error('Conversion failed:', error);
      throw createError(`Conversion failed: ${error.message}`, 500);
    }
  }

  private async validateFiles(aiOutputPath: string, templatePath: string): Promise<void> {
    if (!await fs.pathExists(aiOutputPath)) {
      throw createError(`AI output file not found: ${aiOutputPath}`, 404);
    }
    if (!await fs.pathExists(templatePath)) {
      throw createError(`Template file not found: ${templatePath}`, 404);
    }
  }

  private async buildTagMappings(aiOutput: any): Promise<Record<string, any>> {
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

    // Extract section tags
    if (aiOutput.Sections) {
      aiOutput.Sections.forEach((section: any) => {
        const typeName = this.mapPageStyleToType(section.PageStyle);
        
        tagMap[`${typeName}:title`] = section.Title || '';
        tagMap[`${typeName}:audioduration`] = section.AudioDuration || 0;
        
        if (section.SpeechAudioUrl) {
          tagMap[`${typeName}:speech`] = section.SpeechAudioUrl;
          tagMap[`${typeName}:file`] = section.SpeechAudioUrl;
        }

        if (section.Images && section.Images.length > 0) {
          if (section.Images.length === 1) {
            tagMap[`${typeName}:imageurl`] = section.Images[0].ImageUrl;
          } else if (section.Images.length >= 2) {
            tagMap[`${typeName}:imageurl1`] = section.Images[0].ImageUrl;
            tagMap[`${typeName}:imageurl2`] = section.Images[1].ImageUrl;
          }
        }
      });
    }

    // Fill missing tags with defaults
    this.fillMissingTags(tagMap);

    return tagMap;
  }

  private mapPageStyleToType(pageStyle: number): string {
    const mapping: Record<number, string> = {
      26: 'type1_1',
      27: 'type2_2',
      15: 'type9_9',
      21: 'type8_8',
      4: 'type4_4',
      28: 'type9_9',
      29: 'type6_6',
      30: 'type5_5',
      10: 'type10_10',
      11: 'type11_11',
      12: 'type12_12',
      13: 'type13_13',
      14: 'type14_14',
      100: 'type100',
      101: 'type101'
    };

    return mapping[pageStyle] || `type${pageStyle}`;
  }

  private fillMissingTags(tagMap: Record<string, any>): void {
    const defaults: Record<string, any> = {
      'training-title': 'Eğitim Başlığı',
      'training-description': 'Eğitim Açıklaması',
      'ai-mandatory': 'false',
      'files-uploaded': 'false',
      'localized-question': 'false',
      'question-feedback-enable': 'false',
      'question-feedback-shuffle': 'false',
      'file': 'https://localhost/ContentFiles/IdealStudioFiles/default-audio.mp3',
      'speech': '',
      'imageurl': '',
      'imageurl1': '',
      'imageurl2': '',
      'audioduration': 0,
      'title': 'Başlık'
    };

    for (const [key, value] of Object.entries(defaults)) {
      if (!(key in tagMap)) {
        tagMap[key] = value;
      }
    }
  }

  private replaceTags(templateStr: string, tagMap: Record<string, any>): string {
    let result = templateStr;

    for (const [tag, value] of Object.entries(tagMap)) {
      const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const tagPattern = `#\\{\\[${escapedTag}\\]\\}#`;
      const regex = new RegExp(tagPattern, 'g');
      result = result.replace(regex, String(value));
    }

    return result;
  }

  private async saveOutput(templateStr: string): Promise<string> {
    const outputDir = path.join(__dirname, '../../outputs/converted');
    await fs.ensureDir(outputDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(outputDir, `converted-${timestamp}.json`);

    // Parse and save as valid JSON
    try {
      const jsonData = JSON.parse(templateStr);
      await fs.writeJson(outputPath, jsonData, { spaces: 2 });
    } catch (error) {
      // If parsing fails, save as string
      await fs.writeFile(outputPath, templateStr);
    }

    return outputPath;
  }

  private async fixFileFields(outputPath: string): Promise<void> {
    try {
      const content = await fs.readFile(outputPath, 'utf8');
      const fixedContent = content.replace(
        /"file": ""/g,
        '"file": "https://localhost/ContentFiles/IdealStudioFiles/default-audio.mp3"'
      );
      
      if (content !== fixedContent) {
        await fs.writeFile(outputPath, fixedContent);
        Logger.info('Fixed empty file fields');
      }
    } catch (error: any) {
      Logger.warn('Failed to fix file fields:', error.message);
    }
  }

  async convertFromData(aiOutput: any, template: any, _templateType: string): Promise<DataConversionResult> {
    try {
      Logger.info('Starting data-based conversion process...');

      // Validate input data
      if (!aiOutput || !template) {
        throw createError('Invalid input data provided', 400);
      }

      Logger.info(`AI output loaded: ${aiOutput.Sections?.length || 0} sections, ${aiOutput.GeneralQuiz?.length || 0} quizzes`);

      // Build tag mappings
      const tagMap = await this.buildTagMappings(aiOutput);
      Logger.info(`Tag mappings built: ${Object.keys(tagMap).length} tags`);

      // Convert template object to string for processing
      const templateStr = JSON.stringify(template);

      // Replace tags in template
      const replacedTemplate = this.replaceTags(templateStr, tagMap);
      Logger.info('Tags replaced in template');

      // Parse back to object
      let convertedTemplate;
      try {
        convertedTemplate = JSON.parse(replacedTemplate);
      } catch (error) {
        // If parsing fails, return as string
        convertedTemplate = replacedTemplate;
      }

      // Fix empty file fields in the object
      convertedTemplate = this.fixEmptyFileFieldsInObject(convertedTemplate);

      const statsData = {
        sections: aiOutput.Sections?.length || 0,
        quizzes: aiOutput.GeneralQuiz?.length || 0,
        totalTags: Object.keys(tagMap).length,
        replacedTags: Object.keys(tagMap).length
      };

      Logger.success('Data conversion completed successfully');

      return {
        convertedTemplate,
        stats: statsData
      };

    } catch (error: any) {
      Logger.error('Data conversion failed:', error);
      throw createError(`Data conversion failed: ${error.message}`, 500);
    }
  }

  private fixEmptyFileFieldsInObject(obj: any): any {
    if (typeof obj === 'string') {
      return obj.replace(
        /"file": ""/g,
        '"file": "https://localhost/ContentFiles/IdealStudioFiles/default-audio.mp3"'
      );
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.fixEmptyFileFieldsInObject(item));
    }

    if (obj && typeof obj === 'object') {
      const fixed: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'file' && value === '') {
          fixed[key] = 'https://localhost/ContentFiles/IdealStudioFiles/default-audio.mp3';
        } else {
          fixed[key] = this.fixEmptyFileFieldsInObject(value);
        }
      }
      return fixed;
    }

    return obj;
  }

  // XL helper: load a RawXL template file (with tag placeholders),
  // replace tags using aiOutput, and return parsed object + stats
  async convertXLFromTemplateFile(aiOutput: any, templateFilePath: string): Promise<DataConversionResult> {
    try {
      Logger.info('Starting XL file-based conversion...');

      if (!aiOutput || !templateFilePath) {
        throw createError('Invalid XL input data provided', 400);
      }

      const templateStr = await fs.readFile(templateFilePath, 'utf8');

      const tagMap = await this.buildTagMappings(aiOutput);
      Logger.info(`Tag mappings built: ${Object.keys(tagMap).length} tags`);

      let replacedTemplate = this.replaceTags(templateStr, tagMap);
      Logger.info('Tags replaced in template');

      let convertedTemplate: any;
      try {
        // Remove any leftover placeholders to guarantee valid JSON
        replacedTemplate = replacedTemplate.replace(/#\{\[[^\]]+\]\}#/g, '');
        convertedTemplate = JSON.parse(replacedTemplate);
      } catch (error) {
        throw createError('Failed to parse XL template after replacement', 500);
      }

      convertedTemplate = this.fixEmptyFileFieldsInObject(convertedTemplate);

      const statsData = {
        sections: aiOutput.Sections?.length || 0,
        quizzes: aiOutput.GeneralQuiz?.length || 0,
        totalTags: Object.keys(tagMap).length,
        replacedTags: Object.keys(tagMap).length
      };

      Logger.success('XL file-based conversion completed successfully');

      return {
        convertedTemplate,
        stats: statsData
      };
    } catch (error: any) {
      Logger.error('XL file-based conversion failed:', error);
      throw createError(`XL file-based conversion failed: ${error.message}`, 500);
    }
  }

  // Dynamic: build FinalOutput using skeleton and inject all fields from AI output
  async convertXLUsingSkeleton(aiOutput: any, skeletonPath: string): Promise<DataConversionResult> {
    try {
      const skeleton = await fs.readJson(skeletonPath);
      const tagMap = await this.buildTagMappings(aiOutput);

      // 1. Global config injection
      if (skeleton?.present?.globalConfig) {
        const config = skeleton.present.globalConfig;
        if (tagMap['training-title']) config.title = tagMap['training-title'];
        if (tagMap['training-description']) config.description = tagMap['training-description'];
        if (tagMap['type0:imageurl']) config.thumbnail = tagMap['type0:imageurl'];
        if (tagMap['type0:audioduration']) config.typicalLearningTime = { h: 0, m: Math.floor(tagMap['type0:audioduration'] / 60), s: tagMap['type0:audioduration'] % 60 };
      }

      // 2. Dynamic boxesById mapping based on AI sections
      if (skeleton?.present?.boxesById && aiOutput.Sections) {
        const boxes = skeleton.present.boxesById;
        
        // Map sections to boxes dynamically
        aiOutput.Sections.forEach((section: any, index: number) => {
          const typeName = this.mapPageStyleToType(section.PageStyle);
          
          // Find matching box by type or position
          const matchingBoxId = this.findMatchingBoxId(boxes, typeName, index);
          if (matchingBoxId && boxes[matchingBoxId]) {
            const box = boxes[matchingBoxId];
            
            // Inject section data
            if (section.Title && box.pagination?.title !== undefined) {
              box.pagination.title = section.Title;
            }
            if (section.NarrationText && box.pagination?.narration !== undefined) {
              box.pagination.narration = section.NarrationText;
            }
            if (section.Content?.paragraph && box.pagination?.content !== undefined) {
              box.pagination.content = section.Content.paragraph;
            }
            
            // Handle images
            if (section.Images && section.Images.length > 0) {
              if (box.pagination?.imageurl !== undefined) {
                box.pagination.imageurl = section.Images[0].ImageUrl || '';
              }
              if (section.Images.length > 1 && box.pagination?.imageurl2 !== undefined) {
                box.pagination.imageurl2 = section.Images[1].ImageUrl || '';
              }
            }
            
            // Handle audio
            if (section.SpeechAudioUrl && box.pagination?.speech !== undefined) {
              box.pagination.speech = section.SpeechAudioUrl;
            }
            if (section.AudioDuration && box.pagination?.audioduration !== undefined) {
              box.pagination.audioduration = section.AudioDuration;
            }
          }
        });
      }

      // 3. Quiz mapping
      if (skeleton?.present?.boxesById && aiOutput.GeneralQuiz) {
        const boxes = skeleton.present.boxesById;
        
        aiOutput.GeneralQuiz.forEach((quiz: any, index: number) => {
          const quizBoxId = this.findQuizBoxId(boxes, index);
          if (quizBoxId && boxes[quizBoxId]) {
            const box = boxes[quizBoxId];
            
            if (quiz.Question && box.pagination?.question !== undefined) {
              box.pagination.question = quiz.Question;
            }
            if (quiz.Options && box.pagination?.options !== undefined) {
              box.pagination.options = quiz.Options;
            }
            if (quiz.CorrectAnswers && box.pagination?.correct !== undefined) {
              box.pagination.correct = quiz.CorrectAnswers;
            }
          }
        });
      }

      const statsData = {
        sections: aiOutput.Sections?.length || 0,
        quizzes: aiOutput.GeneralQuiz?.length || 0,
        totalTags: Object.keys(tagMap).length,
        replacedTags: Object.keys(tagMap).length
      };

      return {
        convertedTemplate: skeleton,
        stats: statsData
      };
    } catch (error: any) {
      Logger.error('XL skeleton conversion failed:', error);
      throw createError(`XL skeleton conversion failed: ${error.message}`, 500);
    }
  }

  private findMatchingBoxId(boxes: any, typeName: string, index: number): string | null {
    const boxIds = Object.keys(boxes);
    
    // Try to find by type pattern first
    for (const boxId of boxIds) {
      const box = boxes[boxId];
      if (box?.type === typeName || box?.pagination?.type === typeName) {
        return boxId;
      }
    }
    
    // Fallback to index-based matching
    if (index < boxIds.length) {
      return boxIds[index];
    }
    
    return boxIds[0] || null;
  }

  private findQuizBoxId(boxes: any, quizIndex: number): string | null {
    const boxIds = Object.keys(boxes);
    
    // Look for quiz-type boxes
    for (const boxId of boxIds) {
      const box = boxes[boxId];
      if (box?.type?.includes('quiz') || box?.pagination?.question !== undefined) {
        return boxId;
      }
    }
    
    // Fallback to last boxes (usually quiz sections are at the end)
    const lastBoxes = boxIds.slice(-5); // Check last 5 boxes
    if (quizIndex < lastBoxes.length) {
      return lastBoxes[quizIndex];
    }
    
    return lastBoxes[0] || null;
  }
}
