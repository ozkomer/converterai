import fs from 'fs-extra';
import path from 'path';

export type MandatoryConfig = {
  isMandatory: boolean;
  type: 'waitForSound' | 'waitForVideo' | 'waitForOneClick';
};

export type BackgroundConfig =
  | { style: 'solid'; value: string }
  | { style: 'image'; value: string }
  | { style: 'video'; value: 'full-bleed' | string };

export type VariantFeature = {
  brandName: string;
  colorPalette: string[];
  background: BackgroundConfig;
  logo: { present: boolean; position: string | null; size: 'xs' | 'sm' | 'md' };
  typography: { contrast: 'low' | 'normal' | 'medium' | 'high' | 'very-high'; notes?: string };
  media: { video: boolean; image: boolean };
  mandatory: MandatoryConfig;
  animations: { level: 'low' | 'medium' | 'high'; presets: string[] };
  layout: { emphasis: 'balanced' | 'headline' | 'copy' | 'visual' | 'brand' | 'quiz' | 'media'; headlinePlacement: string };
  useCases: string[];
};

export type TemplateVariants = {
  LSCapsule: Record<string, VariantFeature>;
};

export class VariantService {
  private variantsCache: TemplateVariants | null = null;

  private async resolvePath(): Promise<string> {
    const candidates = [
      // dist runtime
      path.join(__dirname, '../config/templateVariants.json'),
      // src runtime
      path.join(process.cwd(), 'converter-api/src/config/templateVariants.json'),
      path.join(process.cwd(), 'src/config/templateVariants.json'),
      // project root (when running from dist at project root)
      path.join(process.cwd(), 'converter-api/dist/config/templateVariants.json')
    ];
    for (const p of candidates) {
      if (await fs.pathExists(p)) return p;
    }
    throw new Error('templateVariants.json not found in known paths');
  }

  async load(): Promise<TemplateVariants> {
    if (this.variantsCache) return this.variantsCache as TemplateVariants;
    const variantsPath = await this.resolvePath();
    const raw = await fs.readFile(variantsPath, 'utf8');
    const parsed: TemplateVariants = JSON.parse(raw);
    this.variantsCache = parsed;
    return parsed;
  }

  async getCapsuleVariant(variant: string): Promise<VariantFeature | null> {
    const v = await this.load();
    const key = (variant || '').toLowerCase();
    return (v.LSCapsule as any)[key] || null;
  }
}
