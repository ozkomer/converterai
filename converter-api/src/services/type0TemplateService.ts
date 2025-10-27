import { Logger } from '../utils/logger';
import { Type0Parser, ParsedType0Template } from './type0Parser';

export interface Type0Content {
  title: string;
  imageUrl?: string;
  mandatory: boolean;
}

export interface Type0Template extends ParsedType0Template {}

export interface Type0GenerationResult {
  success: boolean;
  template: any;
  metadata: {
    brand: string;
    sceneIndex: number;
    generatedAt: string;
    contentUsed: Type0Content;
  };
}

export class Type0TemplateService {
  private templateDefinitions: Record<string, Type0Template> = {};
  private readonly type0Parser: Type0Parser;

  constructor() {
    this.type0Parser = new Type0Parser();
    this.loadTemplateDefinitions();
  }

  /**
   * Extract brand variant from template type string
   * Examples: "Capsule-Blue" -> "blue", "LSXL-Samsung" -> "samsung"
   */
  static extractBrandFromTemplateType(templateType: string): string {
    if (!templateType || typeof templateType !== 'string') {
      return 'blue'; // Default fallback
    }

    const parts = templateType.split('-');
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase();
    }
    
    return 'blue'; // Default fallback
  }

  private async loadTemplateDefinitions(): Promise<void> {
    try {
      this.templateDefinitions = await this.type0Parser.parseType0File();
      Logger.info(`Type0 template definitions loaded: ${Object.keys(this.templateDefinitions).length} brands`);
    } catch (error) {
      Logger.error('Failed to load Type0 template definitions:', error);
    }
  }

  /**
   * Generate type0 template for a specific brand
   */
  async generateType0Template(brand: string, content: Type0Content): Promise<Type0GenerationResult> {
    try {
      Logger.info(`Generating Type0 template for brand: ${brand}`);

      const template = this.getTemplateForBrand(brand);
      if (!template) {
        throw new Error(`Template not found for brand: ${brand}`);
      }

      const generatedTemplate = this.buildTemplate(template, content);

      Logger.success(`Type0 template generated for ${brand}`);

      return {
        success: true,
        template: generatedTemplate,
        metadata: {
          brand,
          sceneIndex: template.sceneIndex,
          generatedAt: new Date().toISOString(),
          contentUsed: content
        }
      };
    } catch (error) {
      Logger.error(`Failed to generate Type0 template for ${brand}:`, error);
      throw error;
    }
  }

  /**
   * Generate type0 template from template type string
   * Convenience method that extracts brand from template type
   */
  async generateType0FromTemplateType(templateType: string, content: Type0Content): Promise<Type0GenerationResult> {
    const brand = Type0TemplateService.extractBrandFromTemplateType(templateType);
    return this.generateType0Template(brand, content);
  }

  private getTemplateForBrand(brand: string): Type0Template | null {
    // Brand mapping logic - maps conversion brand variants to type0.txt theme names
    const brandMapping: Record<string, string> = {
      // Direct mappings to type0 themes
      'sompo': 'SOMPO',
      'samsung': 'Samsung',
      'creatio': 'CREATIO',
      'champs': 'CHAMPS',
      'blue': 'BLUE',
      // Aliases and variants (Turkish and English)
      'mavi': 'BLUE',
      'yeşil': 'BLUE', // Green uses Blue theme as fallback
      'black': 'BLUE', // Black uses Blue theme as fallback
      'default': 'BLUE', // Default uses Blue theme as fallback
      'green': 'BLUE'
    };

    const normalizedBrand = brand.toLowerCase().replace(/\s+/g, '-');
    const templateKey = brandMapping[normalizedBrand] || brandMapping[brand.toLowerCase()] || brand.toUpperCase();
    
    Logger.info(`Looking for type0 template: brand="${brand}" -> templateKey="${templateKey}"`);
    return this.templateDefinitions[templateKey] || null;
  }

  private buildTemplate(template: Type0Template, content: Type0Content): any {
    // Template building logic with tag replacement
    const pageConfig = this.replaceTags(template.pageConfig, content);
    const textBox = this.replaceTags(template.textBox, content);
    const imageBox = content.imageUrl ? this.replaceTags(template.imageBox, content) : null;

    return {
      pages: {
        [`pa-${Date.now()}`]: pageConfig
      },
      boxesById: {
        [`bo-text-${Date.now()}`]: textBox,
        ...(imageBox && { [`bo-image-${Date.now()}`]: imageBox })
      },
      specialContent: template.specialContent.map(item => this.replaceTags(item, content))
    };
  }

  private replaceTags(template: any, content: Type0Content): any {
    // Tag replacement logic
    let templateStr = JSON.stringify(template);
    
    templateStr = templateStr.replace(/#\{\[type0:title\]\}#/g, content.title);
    templateStr = templateStr.replace(/#\{\[type0:imageurl\]\}#/g, content.imageUrl || '');
    templateStr = templateStr.replace(/#\{\[ai-mandatory\]\}#/g, content.mandatory.toString());

    return JSON.parse(templateStr);
  }

  async listAvailableBrands(): Promise<string[]> {
    return Object.keys(this.templateDefinitions);
  }

  async getBrandInfo(brand: string): Promise<any> {
    const template = this.getTemplateForBrand(brand);
    if (!template) {
      throw new Error(`Brand not found: ${brand}`);
    }

    return {
      brand,
      sceneIndex: template.sceneIndex,
      hasImage: !!template.imageBox,
      specialContentCount: template.specialContent.length,
      features: this.extractBrandFeatures(template)
    };
  }

  private extractBrandFeatures(template: Type0Template): string[] {
    const features: string[] = [];
    
    if (template.imageBox) features.push('Dynamic Image');
    if (template.specialContent.length > 0) features.push('Special Content');
    
    return features;
  }
}
