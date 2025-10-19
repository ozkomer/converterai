/**
 * AI Output JSON Type Definitions
 */

export interface AIOutput {
  CourseInfo: CourseInfo;
  Sections: Section[];
  GeneralQuiz: Quiz[];
  IsSuccess: boolean;
  ErrorMessage: string;
  ErrorCode?: number;
  ThreadId?: string | null;
  FullDocumentText?: string | null;
  SummaryDocumentText?: string | null;
}

export interface CourseInfo {
  Title: string;
  Description: string;
  Objective: string | null;
  TargetAudience: string | null;
  CourseImageUrl: string;
  AudioDuration: number;
  SpeechAudioUrl: string;
  SpeechFileName: string;
}

export interface Section {
  PageStyle: number;
  YoutubeSearchKeyword: string | null;
  Index: number;
  Title: string;
  Description: string | null;
  Content: SectionContent | string | null;
  NarrationText: string | null;
  Images: ImageData[] | null;
  YoutubeUrl: string | null;
  AudioDuration: number;
  SpeechAudioUrl: string | null;
  SpeechFileName: string | null;
  RelevantDocumentPart: any;
}

export interface SectionContent {
  paragraph?: string;
  paragraph1?: string;
  paragraph2?: string;
  paragraph3?: string;
  list?: string;
  subtitle?: string;
  subtitle1?: string;
  subtitle2?: string;
  subtitle3?: string;
  subtext?: string;
  subtext1?: string;
  subtext2?: string;
  subtext3?: string;
  [key: string]: string | undefined; // Allow dynamic keys
}

export interface ImageData {
  ImagePrompt: string;
  ImageSize: string;
  ImageUrl: string;
  IsSuccess: boolean;
  ErrorMessage: string | null;
}

export interface Quiz {
  Index: number;
  Type: QuizType;
  Question: string;
  Options: string[] | null;
  CorrectAnswers: string[] | null;
  Statements: Statement[] | null;
  IsSuccess: boolean;
  ErrorMessage: string | null;
}

export enum QuizType {
  SingleSelect = 0,
  MultiSelect = 1,
  TrueFalse = 2
}

export interface Statement {
  Statement: string;
  Answer: 'True' | 'False';
}

