#!/usr/bin/env node
/**
 * CLI Interface
 * Command line interface for the converter
 */

import { Command } from 'commander';
import { AIToTemplateConverter } from './converter';
import { Logger } from './utils/logger';
import * as path from 'path';

const program = new Command();

program
  .name('ai-to-template')
  .description('Convert AI Output JSON to Template JSON')
  .version('1.0.0');

program
  .command('convert')
  .description('Convert AI output to template')
  .requiredOption('-a, --ai-output <path>', 'Path to AI output JSON file')
  .requiredOption('-t, --template <path>', 'Path to template JSON file')
  .requiredOption('-o, --output <path>', 'Path for output JSON file')
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (options) => {
    try {
      const converter = new AIToTemplateConverter({
        aiOutputPath: path.resolve(options.aiOutput),
        templatePath: path.resolve(options.template),
        outputPath: path.resolve(options.output),
        verbose: options.verbose
      });

      await converter.convert();

      if (options.verbose) {
        const stats = converter.getStats();
        Logger.section('Conversion Stats:');
        Logger.json(stats);
      }

    } catch (error) {
      Logger.error(`Conversion failed: ${error}`);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate AI output JSON structure')
  .requiredOption('-a, --ai-output <path>', 'Path to AI output JSON file')
  .action(async (options) => {
    try {
      const fs = require('fs-extra');
      const aiOutput = await fs.readJson(path.resolve(options.aiOutput));

      Logger.info('Validating AI output structure...');

      // Basic validation
      const required = ['CourseInfo', 'Sections', 'GeneralQuiz'];
      const missing = required.filter(field => !(field in aiOutput));

      if (missing.length > 0) {
        Logger.error(`Missing required fields: ${missing.join(', ')}`);
        process.exit(1);
      }

      Logger.success('✓ AI output structure is valid');
      Logger.info(`  - Sections: ${aiOutput.Sections.length}`);
      Logger.info(`  - Quizzes: ${aiOutput.GeneralQuiz.length}`);

    } catch (error) {
      Logger.error(`Validation failed: ${error}`);
      process.exit(1);
    }
  });

program.parse();

