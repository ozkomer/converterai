import * as fs from 'fs';
import * as path from 'path';
import { TemplateProcessor } from '../processors/template-processor';
import Ajv from 'ajv';

export interface ConversionConfig {
  inputDir: string;
  outputDir: string;
  templateDir: string;
  templateConfigPath: string;
  schemaPath: string;
}

export class TrainingConverter {
  private templateProcessor: TemplateProcessor;
  private ajv: Ajv;
  private schema: any;

  constructor(config: ConversionConfig) {
    this.templateProcessor = new TemplateProcessor(config.templateConfigPath);
    this.ajv = new Ajv();
    this.schema = JSON.parse(fs.readFileSync(config.schemaPath, 'utf8'));
  }

  /**
   * AI Input dosyasını Final Output'a dönüştürür
   */
  public async convertAIInputToFinalOutput(
    aiInputPath: string,
    templateName: string,
    outputPath: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. AI Input dosyasını oku ve doğrula
      const aiInputData = this.loadAndValidateAIInput(aiInputPath);
      if (!aiInputData) {
        return { success: false, error: 'AI Input dosyası geçersiz' };
      }

      // 2. Template dosyasını bul
      const templatePath = this.findTemplateFile(templateName);
      if (!templatePath) {
        return { success: false, error: `Template bulunamadı: ${templateName}` };
      }

      // 3. Template'i işle
      const success = this.templateProcessor.processTemplateFile(
        templatePath,
        aiInputData,
        outputPath
      );

      if (!success) {
        return { success: false, error: 'Template işleme başarısız' };
      }

      // 4. Çıktıyı doğrula
      const validationResult = this.validateFinalOutput(outputPath);
      if (!validationResult.valid) {
        return { success: false, error: `Çıktı doğrulama hatası: ${validationResult.error}` };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Toplu dönüşüm işlemi
   */
  public async batchConvert(config: ConversionConfig): Promise<ConversionResult[]> {
    const results: ConversionResult[] = [];
    const inputFiles = this.findAIInputFiles(config.inputDir);

    for (const inputFile of inputFiles) {
      const result = await this.convertSingleFile(inputFile, config);
      results.push(result);
    }

    return results;
  }

  private loadAndValidateAIInput(filePath: string): any | null {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      // Schema doğrulaması
      const valid = this.ajv.validate(this.schema, data);
      if (!valid) {
        console.error('Schema doğrulama hatası:', this.ajv.errors);
        return null;
      }

      return data;
    } catch (error) {
      console.error('AI Input yükleme hatası:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  private findTemplateFile(templateName: string): string | null {
    const possiblePaths = [
      `templates/${templateName}.json`,
      `RawXLTemplates/${templateName}.json`,
      `RawXLTemplates/voiceidealStudioTemplate_${templateName}.json`
    ];

    for (const templatePath of possiblePaths) {
      if (fs.existsSync(templatePath)) {
        return templatePath;
      }
    }

    return null;
  }

  private findAIInputFiles(inputDir: string): string[] {
    const files: string[] = [];
    
    const scanDir = (dir: string) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (item.endsWith('_AIinput.txt')) {
          files.push(fullPath);
        }
      }
    };

    scanDir(inputDir);
    return files;
  }

  private validateFinalOutput(filePath: string): { valid: boolean; error?: string } {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      JSON.parse(content);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async convertSingleFile(inputFile: string, config: ConversionConfig): Promise<ConversionResult> {
    const fileName = path.basename(inputFile);
    const baseName = fileName.replace('_AIinput.txt', '');
    const outputFile = path.join(config.outputDir, `${baseName}_FinalOutput.txt`);
    
    // Template adını dosya adından çıkar
    const templateName = this.extractTemplateName(baseName);
    
    const result = await this.convertAIInputToFinalOutput(
      inputFile,
      templateName,
      outputFile
    );

    return {
      inputFile,
      outputFile,
      success: result.success,
      error: result.error
    };
  }

  private extractTemplateName(baseName: string): string {
    // Dosya adından template türünü çıkar
    // Örnek: "1_XL_Blue" -> "blue", "9_XL_SOMPO" -> "sompo"
    const parts = baseName.split('_');
    if (parts.length >= 3) {
      return parts[2].toLowerCase();
    }
    return 'default';
  }
}

export interface ConversionResult {
  inputFile: string;
  outputFile: string;
  success: boolean;
  error?: string;
}
