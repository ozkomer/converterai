/**
 * Tag Replacer
 * Replaces template tags with actual values
 */

import { TagMapping } from '../types/config';

export class TagReplacer {
  /**
   * Replace all tags in template string
   * Tags format: #{[tag-name]}#
   */
  static replaceTags(templateStr: string, tagMap: TagMapping): string {
    let result = templateStr;

    // Replace each tag
    for (const [tag, value] of Object.entries(tagMap)) {
      // Escape special regex characters in the tag
      const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const tagPattern = `#\\{\\[${escapedTag}\\]\\}#`;
      const regex = new RegExp(tagPattern, 'g');
      
      result = result.replace(regex, String(value));
    }

    return result;
  }

  /**
   * Find all unreplaced tags in string
   */
  static findUnreplacedTags(str: string): string[] {
    const tagPattern = /#\{\[[^\]]+\]\}#/g;
    const matches = str.matchAll(tagPattern);
    const tags: string[] = [];

    for (const match of matches) {
      tags.push(match[0]);
    }

    return tags;
  }

  /**
   * Extract tag name from full tag
   * #{[tag-name]}# => tag-name
   */
  static extractTagName(fullTag: string): string {
    const match = fullTag.match(/#\{\[([^\]]+)\]\}#/);
    return match ? match[1] : fullTag;
  }

  /**
   * Create tag mapping from multiple sources
   */
  static mergeTagMaps(...tagMaps: TagMapping[]): TagMapping {
    return Object.assign({}, ...tagMaps);
  }

  /**
   * Validate tag map (check for missing required tags)
   */
  static validateTagMap(tagMap: TagMapping, requiredTags: string[]): string[] {
    const missing: string[] = [];

    for (const tag of requiredTags) {
      if (!(tag in tagMap)) {
        missing.push(tag);
      }
    }

    return missing;
  }
}

