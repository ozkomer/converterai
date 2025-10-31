import { VariantFeature } from './variantService';

export class VariantApplier {
  apply(template: any, feature: VariantFeature): any {
    if (!template || !template.pages) return template;

    const updated = JSON.parse(JSON.stringify(template));

    // Apply background and mandatory to all pages in template
    for (const pageId of Object.keys(updated.pages)) {
      const page = updated.pages[pageId];
      // Background
      if (feature.background.style === 'solid') {
        page.background = feature.background.value;
        page.backgroundAttr = page.backgroundAttr ?? '';
      } else if (feature.background.style === 'image') {
        page.background = feature.background.value; // consumer should resolve to actual image url by key
        page.backgroundAttr = 'full';
      } else if (feature.background.style === 'video') {
        // leave background plain; video usually handled as a full-screen box
        page.background = page.background ?? '#ffffff';
        page.backgroundAttr = page.backgroundAttr ?? '';
      }

      // Mandatory
      page.isMandatory = feature.mandatory.isMandatory;
      page.mandatoryType = feature.mandatory.type;
    }

    return updated;
  }
}
