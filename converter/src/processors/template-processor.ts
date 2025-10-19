import * as fs from 'fs';
import * as path from 'path';

export interface TemplateVariable {
  description: string;
  source?: string;
  default?: any;
  type?: string;
  required?: boolean;
}

export interface TemplateConfig {
  global: Record<string, TemplateVariable>;
  pageStyles: Record<string, Record<string, TemplateVariable>>;
  quiz: Record<string, TemplateVariable>;
  audio: Record<string, TemplateVariable>;
  files: Record<string, TemplateVariable>;
}

export class TemplateProcessor {
  private config: TemplateConfig;

  constructor(configPath: string) {
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  /**
   * Template değişkenlerini gerçek değerlerle değiştirir
   */
  public processTemplate(templateContent: string, trainingData: any): string {
    let processedContent = templateContent;

    // Global değişkenleri işle
    processedContent = this.processGlobalVariables(processedContent, trainingData);

    // PageStyle değişkenlerini işle
    processedContent = this.processPageStyleVariables(processedContent, trainingData);

    // Quiz değişkenlerini işle
    processedContent = this.processQuizVariables(processedContent, trainingData);

    // Audio değişkenlerini işle
    processedContent = this.processAudioVariables(processedContent, trainingData);

    // File değişkenlerini işle
    processedContent = this.processFileVariables(processedContent, trainingData);

    return processedContent;
  }

  private processGlobalVariables(content: string, data: any): string {
    for (const [key, variable] of Object.entries(this.config.global)) {
      const pattern = new RegExp(`#\\{\\[${key}\\]\\}#`, 'g');
      const value = this.getValueFromPath(data, variable.source || '');
      content = content.replace(pattern, JSON.stringify(value));
    }
    return content;
  }

  private processPageStyleVariables(content: string, data: any): string {
    for (const [pageStyle, variables] of Object.entries(this.config.pageStyles)) {
      for (const [key, variable] of Object.entries(variables)) {
        const pattern = new RegExp(`#\\{\\[${key}\\]\\}#`, 'g');
        const value = this.getValueFromPath(data, variable.source || '');
        content = content.replace(pattern, JSON.stringify(value));
      }
    }
    return content;
  }

  private processQuizVariables(content: string, data: any): string {
    for (const [key, variable] of Object.entries(this.config.quiz)) {
      const pattern = new RegExp(`#\\{\\[${key}\\]\\}#`, 'g');
      const value = variable.default;
      content = content.replace(pattern, JSON.stringify(value));
    }
    return content;
  }

  private processAudioVariables(content: string, data: any): string {
    for (const [key, variable] of Object.entries(this.config.audio)) {
      const pattern = new RegExp(`#\\{\\[.*:${key}\\]\\}#`, 'g');
      const value = this.getValueFromPath(data, variable.source || '') || variable.default;
      content = content.replace(pattern, JSON.stringify(value));
    }
    return content;
  }

  private processFileVariables(content: string, data: any): string {
    for (const [key, variable] of Object.entries(this.config.files)) {
      const pattern = new RegExp(`#\\{\\[${key}\\]\\}#`, 'g');
      const value = variable.default;
      content = content.replace(pattern, JSON.stringify(value));
    }
    return content;
  }

  private getValueFromPath(obj: any, path: string): any {
    if (!path) return null;
    
    return path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object') {
        // Array index kontrolü
        if (key.includes('[') && key.includes(']')) {
          const arrayKey = key.substring(0, key.indexOf('['));
          const index = parseInt(key.substring(key.indexOf('[') + 1, key.indexOf(']')));
          return current[arrayKey] && current[arrayKey][index];
        }
        return current[key];
      }
      return null;
    }, obj);
  }

  /**
   * JSON geçerliliğini kontrol eder
   */
  public validateJSON(content: string): { valid: boolean; error?: string } {
    try {
      JSON.parse(content);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Template dosyasını işler ve geçerli JSON üretir
   */
  public processTemplateFile(templatePath: string, trainingData: any, outputPath: string): boolean {
    try {
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const processedContent = this.processTemplate(templateContent, trainingData);
      
      // JSON geçerliliğini kontrol et
      const validation = this.validateJSON(processedContent);
      if (!validation.valid) {
        console.error('JSON geçersiz:', validation.error);
        return false;
      }

      // Dosyayı kaydet
      fs.writeFileSync(outputPath, processedContent, 'utf8');
      return true;
    } catch (error) {
      console.error('Template işleme hatası:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }
}
