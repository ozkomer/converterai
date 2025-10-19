/**
 * Quiz Extractor
 * Extracts quiz/question data from AI Output
 */

import { Quiz, Section } from '../types/ai-output';
import { TagMapping } from '../types/config';

export class QuizExtractor {
  /**
   * Extract quiz sections from Sections array
   */
  static extractQuizSections(sections: Section[]): Section[] {
    return sections.filter(s => s.PageStyle >= 12 && s.PageStyle <= 14);
  }

  /**
   * Extract tag mappings for quiz sections
   */
  static extractQuizTags(quizSection: Section): TagMapping {
    const tags: TagMapping = {};
    
    // Quiz sections use type12_12, type13_13, type14_14
    const typeName = `type${quizSection.PageStyle}_${quizSection.PageStyle}`;
    
    tags[`${typeName}:audioduration`] = quizSection.AudioDuration || 0;
    
    // Speech audio will be handled separately
    
    return tags;
  }

  /**
   * Get quiz data from GeneralQuiz array
   */
  static getQuizData(quizzes: Quiz[]): Quiz[] {
    return quizzes;
  }

  /**
   * Format quiz for embedding in template
   */
  static formatQuizForTemplate(quiz: Quiz): any {
    const formatted: any = {
      Index: quiz.Index,
      Type: quiz.Type,
      Question: quiz.Question
    };

    if (quiz.Type === 0 || quiz.Type === 1) {
      // SingleSelect or MultiSelect
      formatted.Options = quiz.Options || [];
      formatted.CorrectAnswers = quiz.CorrectAnswers || [];
    } else if (quiz.Type === 2) {
      // TrueFalse
      formatted.Statements = quiz.Statements || [];
    }

    return formatted;
  }
}

