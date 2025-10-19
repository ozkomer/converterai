/**
 * Course Info Extractor
 * Extracts cover page data from AI Output
 */

import { AIOutput, CourseInfo } from '../types/ai-output';
import { TagMapping } from '../types/config';

export class CourseExtractor {
  /**
   * Extract cover page tag mappings from CourseInfo
   */
  static extractCoverTags(aiOutput: AIOutput): TagMapping {
    const courseInfo = aiOutput.CourseInfo;
    
    return {
      // Global tags
      'training-title': courseInfo.Title,
      'training-description': courseInfo.Description,
      
      // Cover page tags (type0)
      'type0:title': courseInfo.Title,
      'type0:imageurl': courseInfo.CourseImageUrl,
      'type0:audioduration': courseInfo.AudioDuration,
      
      // Note: Speech is usually embedded as file path, not direct text
      // We'll handle audio file paths separately
    };
  }

  /**
   * Get course info object
   */
  static getCourseInfo(aiOutput: AIOutput): CourseInfo {
    return aiOutput.CourseInfo;
  }
}

