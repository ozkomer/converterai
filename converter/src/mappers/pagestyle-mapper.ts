/**
 * PageStyle to Type Mapper
 * Maps AI Output PageStyle numbers to Template Type names
 */

import { PageStyleMapping } from '../types/config';
import mappings from '../../config/mappings.json';

export class PageStyleMapper {
  private static mapping: PageStyleMapping = mappings.pageStyleMapping;

  /**
   * Convert PageStyle number to Type name
   * @param pageStyle - PageStyle number from AI output
   * @returns Type name (e.g., "type1_1")
   */
  static toType(pageStyle: number): string {
    const typeName = this.mapping[pageStyle];
    
    if (!typeName) {
      console.warn(`⚠️  Unknown PageStyle: ${pageStyle}, using fallback`);
      return `type_unknown_${pageStyle}`;
    }
    
    return typeName;
  }

  /**
   * Get all mappings
   */
  static getAllMappings(): PageStyleMapping {
    return this.mapping;
  }

  /**
   * Check if PageStyle is supported
   */
  static isSupported(pageStyle: number): boolean {
    return pageStyle in this.mapping;
  }
}

