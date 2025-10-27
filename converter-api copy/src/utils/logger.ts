/**
 * Logger Utility
 * Colored console logging for API
 */

export class Logger {
  static info(message: string, ...args: any[]): void {
    console.log(`\x1b[36m[INFO]\x1b[0m ${message}`, ...args);
  }

  static success(message: string, ...args: any[]): void {
    console.log(`\x1b[32m[SUCCESS]\x1b[0m ${message}`, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    console.log(`\x1b[33m[WARN]\x1b[0m ${message}`, ...args);
  }

  static error(message: string, ...args: any[]): void {
    console.log(`\x1b[31m[ERROR]\x1b[0m ${message}`, ...args);
  }

  static debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`\x1b[90m[DEBUG]\x1b[0m ${message}`, ...args);
    }
  }

  static step(step: number, total: number, message: string): void {
    console.log(`\x1b[35m[${step}/${total}]\x1b[0m ${message}`);
  }

  static section(title: string): void {
    console.log(`\n\x1b[1m\x1b[34m=== ${title.toUpperCase()} ===\x1b[0m`);
  }
}

