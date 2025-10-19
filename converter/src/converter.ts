/**
 * AI to Template Converter
 * Main converter class that orchestrates the conversion process
 */

import { AIOutput } from './types/ai-output';
import { TagMapping } from './types/config';
import { CourseExtractor } from './extractors/course-extractor';
import { SectionExtractor } from './extractors/section-extractor';
import { QuizExtractor } from './extractors/quiz-extractor';
import { TagReplacer } from './processors/tag-replacer';
import { FileUtils } from './utils/file-utils';
import { Logger } from './utils/logger';
import { DefaultValues } from './utils/default-values';

export interface ConverterOptions {
  aiOutputPath: string;
  templatePath: string;
  outputPath: string;
  verbose?: boolean;
}

export class AIToTemplateConverter {
  private aiOutput!: AIOutput;
  private templateStr!: string;
  private tagMap: TagMapping = {};
  private options: ConverterOptions;

  constructor(options: ConverterOptions) {
    this.options = options;
  }

  /**
   * Main conversion method
   */
  async convert(): Promise<void> {
    try {
      Logger.section('🚀 AI to Template Conversion Started');

      // Step 1: Load files
      await this.loadFiles();

      // Step 2: Extract data and build tag map
      await this.buildTagMap();

      // Step 3: Replace tags in template
      await this.replaceTags();

      // Step 4: Save output
      await this.saveOutput();

      Logger.success('\n✨ Conversion completed successfully!');
      Logger.info(`Output saved to: ${this.options.outputPath}`);

    } catch (error) {
      Logger.error(`\n❌ Conversion failed: ${error}`);
      throw error;
    }
  }

  /**
   * Step 1: Load AI output and template files
   */
  private async loadFiles(): Promise<void> {
    Logger.step(1, 4, 'Loading files...');

    // Check if files exist
    if (!(await FileUtils.exists(this.options.aiOutputPath))) {
      throw new Error(`AI output file not found: ${this.options.aiOutputPath}`);
    }

    if (!(await FileUtils.exists(this.options.templatePath))) {
      throw new Error(`Template file not found: ${this.options.templatePath}`);
    }

    // Load AI output as JSON
    this.aiOutput = await FileUtils.readJson<AIOutput>(this.options.aiOutputPath);
    Logger.info(`  ✓ AI output loaded: ${this.options.aiOutputPath}`);

    // Load template as string (to preserve structure for tag replacement)
    this.templateStr = await FileUtils.readString(this.options.templatePath);
    Logger.info(`  ✓ Template loaded: ${this.options.templatePath}`);
  }

  /**
   * Step 2: Extract data from AI output and build tag mapping
   */
  private async buildTagMap(): Promise<void> {
    Logger.step(2, 4, 'Building tag mappings...');

    // Extract cover/course tags
    const coverTags = CourseExtractor.extractCoverTags(this.aiOutput);
    Logger.info(`  ✓ Cover tags extracted: ${Object.keys(coverTags).length} tags`);

    // Extract section tags
    const contentSections = SectionExtractor.extractContentSections(this.aiOutput.Sections);
    const sectionTags: TagMapping = {};
    
    for (const section of contentSections) {
      const tags = SectionExtractor.extractSectionTags(section);
      Object.assign(sectionTags, tags);
    }
    Logger.info(`  ✓ Section tags extracted: ${contentSections.length} sections`);

    // Extract closing section tags
    const closingSections = SectionExtractor.getClosingSections(this.aiOutput.Sections);
    for (const section of closingSections) {
      const tags = SectionExtractor.extractSectionTags(section);
      Object.assign(sectionTags, tags);
    }

    // Extract quiz tags
    const quizSections = QuizExtractor.extractQuizSections(this.aiOutput.Sections);
    const quizTags: TagMapping = {};
    
    for (const quizSection of quizSections) {
      const tags = QuizExtractor.extractQuizTags(quizSection);
      Object.assign(quizTags, tags);
    }
    Logger.info(`  ✓ Quiz tags extracted: ${quizSections.length} quizzes`);

    // Merge all tags
    this.tagMap = TagReplacer.mergeTagMaps(coverTags, sectionTags, quizTags);
    Logger.info(`  ✓ Total tags: ${Object.keys(this.tagMap).length}`);

    if (this.options.verbose) {
      Logger.section('Tag Map Preview:');
      console.log(Object.keys(this.tagMap).slice(0, 10).join(', '), '...');
    }
  }

  /**
   * Step 3: Replace tags in template
   */
  private async replaceTags(): Promise<void> {
    Logger.step(3, 4, 'Replacing tags in template...');

    // Count tags before replacement
    const tagsBefore = TagReplacer.findUnreplacedTags(this.templateStr);
    Logger.info(`  ℹ Tags found in template: ${tagsBefore.length}`);

    // Fill missing tags with defaults
    this.tagMap = DefaultValues.fillMissingTags(this.tagMap, tagsBefore);
    Logger.info(`  ✓ Missing tags filled with defaults`);

    // Replace tags
    this.templateStr = TagReplacer.replaceTags(this.templateStr, this.tagMap);

    // Check remaining unreplaced tags
    const tagsAfter = TagReplacer.findUnreplacedTags(this.templateStr);
    const replacedCount = tagsBefore.length - tagsAfter.length;
    
    Logger.info(`  ✓ Tags replaced: ${replacedCount}`);
    
    if (tagsAfter.length > 0) {
      Logger.warn(`  ⚠ Unreplaced tags remaining: ${tagsAfter.length}`);
      
      if (this.options.verbose) {
        Logger.info('  Unreplaced tags (first 10):');
        tagsAfter.slice(0, 10).forEach(tag => Logger.info(`    - ${tag}`));
      }
    }
  }

  /**
   * Step 4: Save output file
   */
  private async saveOutput(): Promise<void> {
    Logger.step(4, 4, 'Saving output...');

    // Parse string back to JSON to validate
    let outputJson: any;
    try {
      outputJson = JSON.parse(this.templateStr);
    } catch (error) {
      throw new Error(`Failed to parse output as JSON. Template structure may be corrupted.\n${error}`);
    }

    // Write output file
    await FileUtils.writeJson(this.options.outputPath, outputJson, true);
    Logger.info(`  ✓ Output saved`);

    // Show file stats
    const stats = await FileUtils.readString(this.options.outputPath);
    const sizeKB = (Buffer.byteLength(stats, 'utf-8') / 1024).toFixed(2);
    Logger.info(`  ℹ File size: ${sizeKB} KB`);
  }

  /**
   * Get conversion stats
   */
  getStats() {
    return {
      aiOutput: {
        sections: this.aiOutput.Sections.length,
        quizzes: this.aiOutput.GeneralQuiz.length
      },
      tags: {
        total: Object.keys(this.tagMap).length
      }
    };
  }
}

