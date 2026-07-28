export type Technology = "sql" | "python" | "pyspark";
export type LearningTechnology = Technology | "arcade";
export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type DifficultyPreference = "recommended" | "beginner" | "intermediate" | "advanced";
export type ExerciseMode = "write_from_scratch" | "code_completion" | "debugging" | "optimization" | "explanation";
export type QuestionAdjustment = "easier" | "harder";

export type CurriculumNode = {
  id: string;
  technology: Technology;
  category: string;
  topic: string;
  subtopic: string;
  prerequisites: string[];
  importance: "core" | "important" | "advanced";
  targetExposure: number;
  skillDimensions: string[];
};

export type SkillState = {
  curriculumNodeId: string;
  attempted: number;
  correct: number;
  recentAccuracy: number;
  currentDifficulty: number;
  hintCount: number;
  solutionRevealCount: number;
  runtimePasses: number;
  validatorPasses: number;
  recentMistakes: string[];
  testedDimensions: string[];
  lastPracticedAt: string;
  nextReviewAt: string;
  masteryScore: number;
  status: "new" | "learning" | "working" | "interview-ready" | "review";
  recentOutcomes: boolean[];
  spacedReviewPasses: number;
  interviewPasses: number;
  passedPatterns: string[];
};

export type QuestionFingerprint = {
  technology: string;
  topic: string;
  subtopic: string;
  pattern: string;
  scenario: string;
  difficulty: Difficulty;
  skills: string[];
  schemaSignature: string;
};

export type TestCase = {
  description: string;
  input?: unknown;
  expected?: unknown;
};

export type GeneratedQuestion = {
  id: string;
  technology: LearningTechnology;
  curriculumNodeId: string;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  exerciseMode: ExerciseMode;
  prerequisiteIds: string[];
  diagnosticQuestion: boolean;
  learnerInstructions: string;
  title: string;
  scenario: string;
  prompt: string;
  schema?: unknown;
  sampleData?: unknown;
  expectedBehavior: string[];
  hiddenTests: TestCase[];
  referenceSolution: string;
  starterCode: string;
  rubric: string[];
  skillDimensions: string[];
  fingerprint: QuestionFingerprint;
  runtime?: {
    setupSql?: string;
    functionName?: string;
    visibleTests?: TestCase[];
    pysparkQuestionId?: string;
  };
};

export type LearnerQuestion = Omit<GeneratedQuestion, "hiddenTests" | "referenceSolution">;

export type EvaluationResult = {
  verdict: "correct" | "partially-correct" | "incorrect";
  score: number;
  doneWell: string[];
  improvements: string[];
  mistakeClassification: string;
  runtimeResult: string;
  explanation: string;
  suggestedNextAction: string;
  hiddenTestsPassed: boolean;
  runtimePassed: boolean;
  validatorPassed: boolean;
};

export type DiagnosticState = {
  started: boolean;
  completedNodeIds: string[];
  shortened: boolean;
};

export type ProgressState = {
  progressVersion: 2;
  version: 2;
  solved: Record<Technology, number>;
  arcadeCompleted: number;
  skills: Record<string, SkillState>;
  recentFingerprints: QuestionFingerprint[];
  currentQuestions: Partial<Record<LearningTechnology, LearnerQuestion>>;
  recentOutcomes: Array<{
    technology: LearningTechnology;
    curriculumNodeId: string;
    correct: boolean;
    at: string;
  }>;
  diagnostics: Record<Technology, DiagnosticState>;
  difficultyPreference: Record<Technology, DifficultyPreference>;
  remediation: Partial<Record<Technology, { curriculumNodeId: string; difficulty: Difficulty }>>;
};

export type ScheduleReason = "diagnostic" | "remediation" | "weak" | "neighbor" | "review" | "new" | "interview" | "stretch";

export type ScheduledTarget = {
  node: CurriculumNode;
  reason: ScheduleReason;
  difficulty: Difficulty;
  targetDimensions: string[];
  diagnosticQuestion: boolean;
  allowedDifficulty: { min: Difficulty; max: Difficulty };
};

export type SchedulerOptions = {
  adjustment?: QuestionAdjustment;
  currentNodeId?: string;
  currentDifficulty?: Difficulty;
};

export type EligibilityResult = { eligible: true } | { eligible: false; reasons: string[] };
