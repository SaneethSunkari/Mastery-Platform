import { CourseSlug } from "@/lib/types";

export type QuestionTrack = CourseSlug | "arcade";
export type QuestionDifficulty =
  | "beginner"
  | "foundation"
  | "intermediate"
  | "job-ready"
  | "advanced"
  | "senior";

export type QuestionType =
  | "write-code"
  | "predict-output"
  | "complete-code"
  | "repair-code"
  | "edge-case"
  | "refactor"
  | "optimize"
  | "interpret-error"
  | "production-incident"
  | "interview-challenge";

export type ValidationMode =
  | "sql-runtime"
  | "python-runtime"
  | "pyspark-structural"
  | "conceptual"
  | "manual-review";

export interface PracticeQuestionBase {
  id: string;
  ordinal: number;
  track: QuestionTrack;
  topic: string;
  subtopic: string;
  difficulty: QuestionDifficulty;
  questionType: QuestionType;
  title: string;
  prompt: string;
  datasetId: string | null;
  starterCode: string;
  validatorId: string;
  validatorVersion: number;
  validationMode: ValidationMode;
  prerequisiteIds: string[];
  estimatedMinutes: number;
  tags: string[];
}

export interface MasteryQuestionDefinition extends PracticeQuestionBase {
  track: CourseSlug;
  weekNumber: number;
  positionWithinWeek: number;
}

export interface ArcadeLevelDefinition extends PracticeQuestionBase {
  track: "arcade";
  worldNumber: number;
  levelNumber: number;
  sharedTask: string;
}
