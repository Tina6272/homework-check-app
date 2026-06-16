export type ViewMode = "student" | "teacher" | "parent";

export type AssignmentStatus = "draft" | "open" | "closed";

export type AssignmentTemplate = {
  id: string;
  name: string;
  subject: string;
  defaultMinutes: number;
  selfCheckItems: string[];
};

export type Assignment = {
  id: string;
  classCode: string;
  templateId: string;
  subject: string;
  title: string;
  description: string;
  questionRange: string;
  suggestedMinutes: number;
  selfCheckItems: string[];
  requiresPeerCheck: boolean;
  status: AssignmentStatus;
};

export type SubmissionStatus =
  | "notStarted"
  | "inProgress"
  | "selfCheck"
  | "needsCorrection"
  | "teacherReview"
  | "done"
  | "stuck";

export type ConfidenceLevel = "high" | "someUncertain" | "manyUncertain" | "needHelp";

export type Submission = {
  id: string;
  classCode: string;
  studentSeat: string;
  assignmentId: string;
  status: SubmissionStatus;
  startedAt?: string;
  finishedAt?: string;
  targetMinutes: number;
  actualMinutes?: number;
  checkedItems: string[];
  confidence?: ConfidenceLevel;
  uncertainQuestions: string[];
  correctedQuestions: string[];
  stuckQuestions: string[];
  riskFlags: string[];
  peerCheckerSeat?: string;
  teacherNote?: string;
  updatedAt: string;
};

export type StudentStats = {
  seat: string;
  classCode: string;
  points: number;
  streak: number;
  pending: number;
};
