/**
 * Main Entry Point
 * Export all public APIs
 */

export { AIToTemplateConverter, ConverterOptions } from './converter';
export { PageStyleMapper } from './mappers/pagestyle-mapper';
export { CourseExtractor } from './extractors/course-extractor';
export { SectionExtractor } from './extractors/section-extractor';
export { QuizExtractor } from './extractors/quiz-extractor';
export { TagReplacer } from './processors/tag-replacer';
export { FileUtils } from './utils/file-utils';
export { Logger } from './utils/logger';

// Export types
export * from './types/ai-output';
export * from './types/config';

