/**
 * ShadowWork Type Definitions
 */

export interface TaskFile {
  content: string;
}

export interface TaskFiles {
  [filename: string]: TaskFile | any;
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
}

export interface SlackNotification {
  text: string;
  blocks?: any[];
}

