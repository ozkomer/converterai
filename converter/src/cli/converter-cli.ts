#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { TrainingConverter, ConversionConfig } from '../converters/training-converter';

interface CLIOptions {
  input: string;
  output: string;
  template: string;
  config: string;
  schema: string;
  batch: boolean;
  help: boolean;
}

class ConverterCLI {
  private options: CLIOptions;

  constructor() {
    this.options = this.parseArguments();
  }

  public async run(): Promise<void> {
    if (this.options.help) {
      this.showHelp();
      return;
    }

    try {
      const config: ConversionConfig = {
        inputDir: this.options.input,
        outputDir: this.options.output,
        templateDir: path.dirname(this.options.template),
        templateConfigPath: this.options.config,
        schemaPath: this.options.schema
      };

      const converter = new TrainingConverter(config);

      if (this.options.batch) {
        await this.runBatchConversion(converter, config);
      } else {
        await this.runSingleConversion(converter);
      }
    } catch (error) {
      console.error('Hata:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  private async runBatchConversion(converter: TrainingConverter, config: ConversionConfig): Promise<void> {
    console.log('Toplu dönüşüm başlatılıyor...');
    
    const results = await converter.batchConvert(config);
    
    console.log(`\nDönüşüm tamamlandı. ${results.length} dosya işlendi:`);
    
    let successCount = 0;
    let errorCount = 0;

    for (const result of results) {
      if (result.success) {
        console.log(`✅ ${path.basename(result.inputFile)} -> ${path.basename(result.outputFile)}`);
        successCount++;
      } else {
        console.log(`❌ ${path.basename(result.inputFile)}: ${result.error}`);
        errorCount++;
      }
    }

    console.log(`\nÖzet: ${successCount} başarılı, ${errorCount} hatalı`);
  }

  private async runSingleConversion(converter: TrainingConverter): Promise<void> {
    const inputFile = this.options.input;
    const outputFile = this.options.output;
    const templateName = path.basename(this.options.template, '.json');

    console.log(`Dönüşüm başlatılıyor: ${inputFile} -> ${outputFile}`);

    const result = await converter.convertAIInputToFinalOutput(
      inputFile,
      templateName,
      outputFile
    );

    if (result.success) {
      console.log('✅ Dönüşüm başarılı!');
    } else {
      console.log(`❌ Dönüşüm başarısız: ${result.error}`);
      process.exit(1);
    }
  }

  private parseArguments(): CLIOptions {
    const args = process.argv.slice(2);
    const options: CLIOptions = {
      input: '',
      output: '',
      template: '',
      config: 'src/templates/template-variables.json',
      schema: 'src/schemas/training-schema.json',
      batch: false,
      help: false
    };

    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '-i':
        case '--input':
          options.input = args[++i];
          break;
        case '-o':
        case '--output':
          options.output = args[++i];
          break;
        case '-t':
        case '--template':
          options.template = args[++i];
          break;
        case '-c':
        case '--config':
          options.config = args[++i];
          break;
        case '-s':
        case '--schema':
          options.schema = args[++i];
          break;
        case '-b':
        case '--batch':
          options.batch = true;
          break;
        case '-h':
        case '--help':
          options.help = true;
          break;
      }
    }

    return options;
  }

  private showHelp(): void {
    console.log(`
Eğitim İçeriği Dönüştürücü

Kullanım:
  npm run convert [seçenekler]

Seçenekler:
  -i, --input <dosya>     Giriş dosyası (AI Input)
  -o, --output <dosya>    Çıkış dosyası (Final Output)
  -t, --template <dosya>  Template dosyası
  -c, --config <dosya>    Template değişken konfigürasyonu (varsayılan: src/templates/template-variables.json)
  -s, --schema <dosya>    JSON Schema dosyası (varsayılan: src/schemas/training-schema.json)
  -b, --batch             Toplu dönüşüm modu
  -h, --help              Bu yardım mesajını göster

Örnekler:
  # Tek dosya dönüşümü
  npm run convert -i input.json -o output.json -t template.json

  # Toplu dönüşüm
  npm run convert --batch -i ./inputs -o ./outputs -t template.json
`);
  }
}

// CLI'yi çalıştır
if (require.main === module) {
  const cli = new ConverterCLI();
  cli.run().catch(console.error);
}

export { ConverterCLI };
