/**
 * File Utilities
 * Helper functions for file operations
 */

import * as fs from 'fs-extra';
import * as path from 'path';

export class FileUtils {
  /**
   * Read JSON file
   */
  static async readJson<T>(filePath: string): Promise<T> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to read JSON file: ${filePath}\n${error}`);
    }
  }

  /**
   * Write JSON file
   */
  static async writeJson(filePath: string, data: any, pretty = true): Promise<void> {
    try {
      const content = pretty 
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);
      
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write JSON file: ${filePath}\n${error}`);
    }
  }

  /**
   * Read file as string
   */
  static async readString(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file: ${filePath}\n${error}`);
    }
  }

  /**
   * Write string to file
   */
  static async writeString(filePath: string, content: string): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write file: ${filePath}\n${error}`);
    }
  }

  /**
   * Check if file exists
   */
  static async exists(filePath: string): Promise<boolean> {
    return await fs.pathExists(filePath);
  }

  /**
   * Get file extension
   */
  static getExtension(filePath: string): string {
    return path.extname(filePath);
  }

  /**
   * Get filename without extension
   */
  static getBasename(filePath: string): string {
    return path.basename(filePath, path.extname(filePath));
  }
}

