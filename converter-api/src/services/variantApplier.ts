import { VariantFeature } from './variantService';

export class VariantApplier {
  apply(template: any, feature: VariantFeature): any {
    if (!template || !template.pages) return template;

    const updated = JSON.parse(JSON.stringify(template));

    for (const pageId of Object.keys(updated.pages)) {
      const page = updated.pages[pageId];

      // Apply background
      if (feature.background.style === 'solid') {
        page.background = feature.background.value;
        page.backgroundAttr = page.backgroundAttr ?? '';
      } else if (feature.background.style === 'image') {
        page.background = feature.background.value;
        page.backgroundAttr = 'full';
      } else if (feature.background.style === 'video') {
        page.background = page.background ?? '#ffffff';
        page.backgroundAttr = page.backgroundAttr ?? '';
      }

      // Apply mandatory settings
      page.isMandatory = feature.mandatory.isMandatory;
      page.mandatoryType = feature.mandatory.type;
    }

    return updated;
  }
}
