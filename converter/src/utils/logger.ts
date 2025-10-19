/**
 * Logger Utility
 * Colored console logging
 */

import chalk from 'chalk';

export class Logger {
  static info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  static success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  static warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  static error(message: string): void {
    console.log(chalk.red('✗'), message);
  }

  static step(step: number, total: number, message: string): void {
    console.log(chalk.cyan(`[${step}/${total}]`), message);
  }

  static section(title: string): void {
    console.log('\n' + chalk.bold.underline(title));
  }

  static json(data: any): void {
    console.log(JSON.stringify(data, null, 2));
  }
}

