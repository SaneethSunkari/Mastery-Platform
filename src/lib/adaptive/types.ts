export type Technology = "sql" | "python" | "pyspark";
export type LearningTechnology = Technology | "arcade";

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
};

export type QuestionFingerprint = {
  technology: string;
  topic: string;
  subtopic: string;
  pattern: string;
  scenario: string;
  difficulty: number;
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
  difficulty: number;
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

export type ProgressState = {
  version: 1;
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
};

export type ScheduleReason = "weak" | "neighbor" | "review" | "new" | "interview" | "stretch";

export type ScheduledTarget = {
  node: CurriculumNode;
  reason: ScheduleReason;
  difficulty: number;
  targetDimensions: string[];
};
