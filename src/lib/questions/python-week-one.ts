import { lessons, getWeeksByCourse } from "@/lib/curriculum";
import { getMasteryQuestionId } from "@/lib/questions/ids";
import { QuestionDifficulty, QuestionType } from "@/lib/questions/schema";
import { PythonWeekOneExerciseSeed, pythonWeekOneExerciseSeeds } from "@/lib/python-week-one";
import { MasteryQuestionProgressRecord } from "@/lib/types";

export const PYTHON_WEEK_ONE_VALIDATOR_VERSION = 1;
export const PYTHON_WEEK_ONE_TOTAL = 125;

export type PythonWeekOneQuestionRecord = {
  id: string;
  lessonId: string;
  weekId: string;
  weekNumber: number;
  positionWithinWeek: number;
  ordinal: number;
  topic: string;
  difficulty: QuestionDifficulty;
  questionType: QuestionType;
  title: string;
  summary: string;
  prompt: string;
  starterCode: string;
  visibleCases: PythonWeekOneExerciseSeed["visibleCases"];
  hiddenCases: PythonWeekOneExerciseSeed["hiddenCases"];
  referenceSolution: string;
  tags: string[];
  validatorVersion: number;
};

function normalizeDifficulty(
  value: PythonWeekOneExerciseSeed["difficulty"],
): QuestionDifficulty {
  return value === "easy" ? "beginner" : "foundation";
}

function normalizeQuestionType(
  value: PythonWeekOneExerciseSeed["questionType"],
): QuestionType {
  return value;
}

const pythonWeekOne = getWeeksByCourse("python")[0];

if (!pythonWeekOne) {
  throw new Error("Python Week 1 is missing from the curriculum.");
}

const pythonWeekOneLessons = lessons.filter(
  (lesson) => lesson.courseSlug === "python" && lesson.weekId === pythonWeekOne.id,
);

if (pythonWeekOneLessons.length !== PYTHON_WEEK_ONE_TOTAL) {
  throw new Error(
    `Python Week 1 must contain ${PYTHON_WEEK_ONE_TOTAL} lessons. Received ${pythonWeekOneLessons.length}.`,
  );
}

export const pythonWeekOneQuestions: PythonWeekOneQuestionRecord[] =
  pythonWeekOneExerciseSeeds.map((seed, index) => {
    const positionWithinWeek = index + 1;
    const lesson = pythonWeekOneLessons[index];
    const id = getMasteryQuestionId("python", 1, positionWithinWeek);

    if (!lesson) {
      throw new Error(`Missing Python Week 1 lesson mapping for ${id}.`);
    }

    return {
      id,
      lessonId: lesson.id,
      weekId: pythonWeekOne.id,
      weekNumber: 1,
      positionWithinWeek,
      ordinal: positionWithinWeek,
      topic: seed.topic,
      difficulty: normalizeDifficulty(seed.difficulty),
      questionType: normalizeQuestionType(seed.questionType),
      title: seed.title,
      summary: seed.summary,
      prompt: seed.prompt,
      starterCode: seed.starterCode,
      visibleCases: seed.visibleCases,
      hiddenCases: seed.hiddenCases,
      referenceSolution: seed.referenceSolution,
      tags: [...seed.tags],
      validatorVersion: PYTHON_WEEK_ONE_VALIDATOR_VERSION,
    };
  });

export function getPythonWeekOneQuestionIds() {
  return pythonWeekOneQuestions.map((question) => question.id);
}

export function getPythonWeekOneQuestionById(questionId: string) {
  return pythonWeekOneQuestions.find((question) => question.id === questionId) ?? null;
}

export function getPythonWeekOneQuestionByPosition(positionWithinWeek: number) {
  return pythonWeekOneQuestions[positionWithinWeek - 1] ?? null;
}

export function getPythonWeekOneQuestionByLessonId(lessonId: string) {
  return pythonWeekOneQuestions.find((question) => question.lessonId === lessonId) ?? null;
}

type RoutingReason =
  | "requested"
  | "resume"
  | "locked-request"
  | "invalid-request";

export function resolvePythonWeekOneQuestionId(
  questionProgressRecords: Pick<MasteryQuestionProgressRecord, "questionId" | "status">[],
  requestedQuestionId?: string | null,
  currentQuestionId?: string | null,
) {
  const progressById = new Map(
    questionProgressRecords.map((record) => [record.questionId, record]),
  );

  if (requestedQuestionId) {
    const requested = progressById.get(requestedQuestionId);
    if (requested && requested.status !== "locked") {
      return {
        questionId: requestedQuestionId,
        reason: "requested" as RoutingReason,
      };
    }
  }

  const currentUnlocked =
    questionProgressRecords.find((record) => record.status === "in_progress") ??
    questionProgressRecords.find((record) => record.status === "unlocked");

  if (currentUnlocked) {
    return {
      questionId: currentUnlocked.questionId,
      reason: requestedQuestionId ? ("locked-request" as RoutingReason) : ("resume" as RoutingReason),
    };
  }

  if (currentQuestionId) {
    const current = progressById.get(currentQuestionId);
    if (current && current.status !== "locked") {
      return {
        questionId: currentQuestionId,
        reason: requestedQuestionId ? ("invalid-request" as RoutingReason) : ("resume" as RoutingReason),
      };
    }
  }

  return {
    questionId: pythonWeekOneQuestions[0]?.id ?? null,
    reason: requestedQuestionId ? ("invalid-request" as RoutingReason) : ("resume" as RoutingReason),
  };
}
