/**
 * ShadowWork Type Definitions
 */

export interface TaskFile {
  content: string;
}

export interface TaskFiles {
  [filename: string]: TaskFile | any;
}

export interface CodeFileSnapshot {
  path: string;
  content: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  category: string;
  techStack: string[];
  estimatedTime: number;
  requirements: string[];
  files: TaskFiles;
}

export interface RecordingEvent {
  type: number;
  data: any;
  timestamp: number;
}

export interface SubmissionData {
  userId: string;
  taskId: string;
  recordingUrl: string;
  completedAt: string;
  difficulty: number;
  category: string;
  codeSnapshot?: CodeFileSnapshot[];
  evaluation?: EvaluationResult;
}

export interface EvaluationScores {
  understanding: number;
  implementation: number;
  validation: number;
  communication: number;
  total: number;
  matchScore: number;
}

export interface EvaluationRationale {
  understanding: string[];
  implementation: string[];
  validation: string[];
  communication: string[];
}

export interface EvaluationResult {
  scores: EvaluationScores;
  rationale: EvaluationRationale;
  risks: string[];
  nextInterviewQuestions: string[];
}

export interface SlackNotification {
  text: string;
  blocks?: any[];
}

export interface SubmissionPointsSummary {
  earned: number;
  base: number;
  bonus: number;
  total: number;
}

export interface SubmissionResponsePayload {
  success: boolean;
  recordingUrl: string | null;
  offerQualified?: boolean;
  message?: string;
  points?: SubmissionPointsSummary;
  evaluation?: EvaluationResult | null;
}
