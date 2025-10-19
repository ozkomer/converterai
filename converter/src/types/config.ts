/**
 * Configuration Type Definitions
 */

export interface ConverterConfig {
  pageStyleMapping: PageStyleMapping;
  templateTags: TemplateTags;
}

export interface PageStyleMapping {
  [pageStyle: number]: string;
}

export interface TemplateTags {
  global: string[];
  cover: string[];
  section: string[];
  quiz: string[];
}

export interface TagMapping {
  [tag: string]: string | number;
}

