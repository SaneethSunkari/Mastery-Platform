export type CourseSlug = "sql" | "python" | "pyspark";
export type ArcadeLanguage = "sql" | "python" | "pyspark";
export type ProgressStatus = "locked" | "unlocked" | "in_progress" | "completed";

export interface TimestampedRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseSeed extends TimestampedRecord {
  slug: CourseSlug;
  name: string;
  tagline: string;
  description: string;
  accent: string;
  durationWeeks: number;
  estimatedMinutesPerDay: number;
}

export interface LessonSeed {
  title: string;
  summary: string;
  estimatedMinutes: number;
  tags: string[];
}

export interface WeekSeed extends TimestampedRecord {
  courseSlug: CourseSlug;
  monthNumber: number;
  weekNumber: number;
  levelNumber: number;
  title: string;
  theme: string;
  objectives: string[];
  topics: string[];
  guidedLessons: LessonSeed[];
  practice: string[];
  debugging: string;
  businessCase: string;
  interviewPrompts: string[];
  assessment: string;
  project: string;
  revision: string[];
  masteryCheckpoint: string;
}

export interface LessonRecord extends TimestampedRecord {
  courseSlug: CourseSlug;
  weekId: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  tags: string[];
}

export interface ExerciseSeed extends TimestampedRecord {
  courseSlug: CourseSlug;
  topic: string;
  title: string;
  difficulty: "easy" | "medium" | "hard" | "interview" | "debugging";
  mode: "guided" | "independent" | "timed" | "interview" | "revision" | "production";
  prompt: string;
}

export interface ProjectSeed extends TimestampedRecord {
  courseSlug: CourseSlug;
  title: string;
  businessProblem: string;
  milestones: string[];
  acceptanceCriteria: string[];
}

export interface DatasetSeed extends TimestampedRecord {
  courseSlug: CourseSlug;
  name: string;
  domain: string;
  description: string;
  tablesOrFiles: string[];
}

export interface TopicMasteryRecord extends TimestampedRecord {
  courseSlug: CourseSlug;
  topic: string;
  score: number;
  recentTrend: "up" | "down" | "steady";
}

export interface CourseProgressRecord extends TimestampedRecord {
  courseSlug: CourseSlug;
  currentWeekId: string;
  currentLessonId: string;
  completionPercent: number;
  accuracyPercent: number;
  exercisesSolved: number;
  streakDays: number;
  studyMinutesToday: number;
  studyMinutesThisWeek: number;
  lastActivityAt: string | null;
}

export interface WeekProgressRecord extends TimestampedRecord {
  courseSlug: CourseSlug;
  weekId: string;
  status: ProgressStatus;
  score: number;
  lockReason: string | null;
}

export interface LessonProgressRecord extends TimestampedRecord {
  courseSlug: CourseSlug;
  lessonId: string;
  weekId: string;
  status: ProgressStatus;
  score: number;
  attempts: number;
  timeSpent: number;
  hintsUsed: number;
  lastOpenedAt: string | null;
  completedAt: string | null;
}

export interface ExerciseAttemptRecord extends TimestampedRecord {
  courseSlug: CourseSlug;
  exerciseId: string;
  score: number;
  isCorrect: boolean;
  hintsUsed: number;
  timeSpent: number;
  submission: string;
}

export interface SqlTaskDefinition {
  id: string;
  weekId: string;
  stepNumber: number;
  title: string;
  difficulty: "easy" | "medium";
  objective: string;
  instructions: string[];
  starterSql: string;
  solutionSql: string;
  orderSensitive: boolean;
}

export interface SqlWeekDefinition {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  focus: string;
  unlockMessage: string;
  nextWeekId: string | null;
  nextWeekLabel: string | null;
  tasks: SqlTaskDefinition[];
}

export interface SqlTaskProgressRecord extends TimestampedRecord {
  taskId: string;
  weekId: string;
  draftSql: string;
  completed: boolean;
  unlocked: boolean;
  attempts: number;
  lastRunAt: string | null;
  completedAt: string | null;
}

export interface GameLevelDefinition {
  id: string;
  courseSlug: CourseSlug;
  levelNumber: number;
  worldNumber: number;
  title: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  theme: string;
  linkedWeekId: string | null;
}

export interface GameLevelProgressRecord extends TimestampedRecord {
  levelId: string;
  courseSlug: CourseSlug;
  levelNumber: number;
  unlocked: boolean;
  completed: boolean;
  completedAt: string | null;
}

export interface CandyArcadeLevelDefinition {
  id: string;
  levelNumber: number;
  worldNumber: number;
  stage: string;
  title: string;
  theme: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  prompt: string;
  question: string;
  businessContext: string;
  dataset: string[];
  expectedOutput: string[];
  successChecklist: string[];
  sqlGoal: string;
  pythonGoal: string;
  pysparkGoal: string;
}

export interface CandyArcadeLevelProgressRecord extends TimestampedRecord {
  levelId: string;
  levelNumber: number;
  unlocked: boolean;
  completed: boolean;
  completedAt: string | null;
  sqlDraft: string;
  pythonDraft: string;
  pysparkDraft: string;
  sqlCompleted: boolean;
  pythonCompleted: boolean;
  pysparkCompleted: boolean;
}

export interface ProjectSubmissionRecord extends TimestampedRecord {
  courseSlug: CourseSlug;
  projectId: string;
  status: "not_started" | "in_progress" | "submitted" | "completed";
  summary: string;
}

export interface RevisionQueueRecord extends TimestampedRecord {
  courseSlug: CourseSlug;
  topic: string;
  dueAt: string;
  reason: string;
  priority: number;
}

export interface ErrorLogRecord extends TimestampedRecord {
  courseSlug: CourseSlug;
  topic: string;
  message: string;
  count: number;
  nextReviewAt: string;
}

export interface NoteRecord extends TimestampedRecord {
  courseSlug: CourseSlug;
  topic: string;
  title: string;
  body: string;
  isImportant: boolean;
}

export interface ActivityLogRecord extends TimestampedRecord {
  courseSlug: CourseSlug;
  minutes: number;
  activityType: "study" | "practice" | "review" | "project";
  occurredAt: string;
}

export interface SettingRecord extends TimestampedRecord {
  key: string;
  value: string;
}

export interface BackupRecord extends TimestampedRecord {
  name: string;
  payload: string;
}

export interface AppBackupPayload {
  exportedAt: string;
  version: number;
  data: Record<string, unknown[]>;
}

export interface DashboardSummary {
  sqlProgress: CourseProgressRecord | null;
  pythonProgress: CourseProgressRecord | null;
  pysparkProgress: CourseProgressRecord | null;
  sqlCompletion: number;
  pythonCompletion: number;
  pysparkCompletion: number;
  totalExercisesSolved: number;
  completedSqlTasks: number;
  completedArcadeLevels: number;
  combinedAccuracy: number;
  currentStreak: number;
  weakTopics: TopicMasteryRecord[];
  strongTopics: TopicMasteryRecord[];
  revisionDue: RevisionQueueRecord[];
  recentMistakes: ErrorLogRecord[];
}
