/**
 * Default Values
 * Default values for missing tags
 */

export class DefaultValues {
  /**
   * Get default value for a tag based on its type
   */
  static getDefaultValue(tagName: string): string | number {
    // Audio duration defaults
    if (tagName.includes('audioduration')) {
      return 0;
    }

    // Image URL defaults
    if (tagName.includes('imageurl')) {
      return '';
    }

    // Boolean flags
    if (tagName.includes('enable') || tagName.includes('shuffle') || tagName.includes('mandatory')) {
      return 'false';
    }

    // Speech/content
    if (tagName.includes('speech')) {
      return '';
    }

    // Title/text
    if (tagName.includes('title')) {
      return '';
    }

    // Files uploaded
    if (tagName.includes('files-uploaded')) {
      return '';
    }

    // Localized question
    if (tagName.includes('localized-question')) {
      return '';
    }

    // Default to empty string
    return '';
  }

  /**
   * Fill missing tags with defaults
   */
  static fillMissingTags(existingTags: Record<string, any>, allTagsInTemplate: string[]): Record<string, any> {
    const filledTags = { ...existingTags };

    for (const fullTag of allTagsInTemplate) {
      // Extract tag name from #{[tag-name]}#
      const match = fullTag.match(/#\{\[([^\]]+)\]\}#/);
      if (!match) continue;

      const tagName = match[1];

      // If tag doesn't exist in map, add default
      if (!(tagName in filledTags)) {
        filledTags[tagName] = this.getDefaultValue(tagName);
      }
    }

    return filledTags;
  }
}

