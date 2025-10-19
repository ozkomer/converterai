/**
 * Section Extractor
 * Extracts section data from AI Output
 */

import { Section, SectionContent } from '../types/ai-output';
import { TagMapping } from '../types/config';
import { PageStyleMapper } from '../mappers/pagestyle-mapper';

export class SectionExtractor {
  /**
   * Extract tag mappings for a single section
   */
  static extractSectionTags(section: Section): TagMapping {
    const typeName = PageStyleMapper.toType(section.PageStyle);
    const tags: TagMapping = {};

    // Title
    tags[`${typeName}:title`] = section.Title || '';

    // Audio duration
    tags[`${typeName}:audioduration`] = section.AudioDuration || 0;

    // Speech Audio URL -> Speech mapping only
    if (section.SpeechAudioUrl) {
      tags[`${typeName}:speech`] = section.SpeechAudioUrl;
    }

    // Images
    if (section.Images && section.Images.length > 0) {
      if (section.Images.length === 1) {
        tags[`${typeName}:imageurl`] = section.Images[0].ImageUrl;
      } else if (section.Images.length >= 2) {
        tags[`${typeName}:imageurl1`] = section.Images[0].ImageUrl;
        tags[`${typeName}:imageurl2`] = section.Images[1].ImageUrl;
      }
    }

    // Content - will be embedded in template, not as tags

    return tags;
  }

  /**
   * Extract all content sections (excluding quiz, video, closing pages)
   */
  static extractContentSections(sections: Section[]): Section[] {
    return sections.filter(s => 
      s.PageStyle < 11 || // Content sections
      (s.PageStyle > 14 && s.PageStyle < 100) // Extra content if any
    );
  }

  /**
   * Get video section if exists
   */
  static getVideoSection(sections: Section[]): Section | null {
    return sections.find(s => s.PageStyle === 11) || null;
  }

  /**
   * Get closing sections (100, 101)
   */
  static getClosingSections(sections: Section[]): Section[] {
    return sections.filter(s => s.PageStyle >= 100);
  }

  /**
   * Parse content object based on PageStyle
   */
  static parseContent(section: Section): string {
    if (!section.Content) return '';
    
    // If Content is string (HTML encoded for closing pages)
    if (typeof section.Content === 'string') {
      return section.Content;
    }

    // If Content is object, parse based on structure
    const content = section.Content as SectionContent;
    let result = '';

    // Handle different content structures
    if (content.paragraph) {
      result += content.paragraph;
    }
    
    if (content.paragraph1) {
      result += content.paragraph1;
      if (content.paragraph2) result += '\n\n' + content.paragraph2;
      if (content.paragraph3) result += '\n\n' + content.paragraph3;
    }

    if (content.list) {
      result += '\n' + content.list;
    }

    if (content.subtitle1 && content.subtext1) {
      result += `\n\n${content.subtitle1}\n${content.subtext1}`;
    }
    
    if (content.subtitle2 && content.subtext2) {
      result += `\n\n${content.subtitle2}\n${content.subtext2}`;
    }

    if (content.subtitle3 && content.subtext3) {
      result += `\n\n${content.subtitle3}\n${content.subtext3}`;
    }

    return result.trim();
  }
}

