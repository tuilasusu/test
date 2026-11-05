export type IssueCategory = 'spelling' | 'grammar' | 'style' | 'conciseness' | 'punctuation';

export type IssueSeverity = 'error' | 'warning' | 'suggestion';

export type ToneType = 'professional' | 'formal' | 'persuasive' | 'concise' | 'friendly';

export interface QCIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  originalText: string;
  suggestedText: string;
  explanation: string;
  ruleTitle: string;
  startIndex?: number;
  endIndex?: number;
  alternativeSuggestions?: string[];
}

export interface ToneAssessment {
  currentTone: string;
  toneMatchesTarget: boolean;
  score: number; // 0-100
  strengths: string[];
  improvements: string[];
}

export interface QCReport {
  overallScore: number; // 0-100
  readabilityLevel: 'Rất dễ đọc' | 'Chuẩn công sở' | 'Khá phức tạp' | 'Cần tinh gọn';
  summary: string;
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  paragraphCount: number;
  readingTimeMinutes: number;
  issues: QCIssue[];
  categoryCounts: {
    spelling: number;
    grammar: number;
    style: number;
    conciseness: number;
    punctuation: number;
  };
  toneAssessment: ToneAssessment;
  suggestedFullRewrite: string;
}

export interface ToneRewriteOption {
  tone: ToneType;
  toneLabel: string;
  text: string;
  highlights: string[];
}

export interface DocumentHistoryItem {
  id: string;
  title: string;
  timestamp: number;
  text: string;
  score: number;
  targetTone: ToneType;
  issueCount: number;
}
