import { lessons, getWeeksByCourse } from "@/lib/curriculum";
import type { PysparkExerciseDefinition } from "@/lib/mastery-exercises";
import {
  PysparkWeekOneExerciseSeed,
  pysparkWeekOneExerciseSeeds,
} from "@/lib/pyspark-week-one";
import { getMasteryQuestionId } from "@/lib/questions/ids";
import { QuestionDifficulty, QuestionType } from "@/lib/questions/schema";
import { MasteryQuestionProgressRecord } from "@/lib/types";

export const PYSPARK_WEEK_ONE_VALIDATOR_VERSION = 1;
export const PYSPARK_WEEK_ONE_TOTAL = 125;

export type PysparkWeekOneQuestionRecord = {
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
  referenceSolution: string;
  tags: string[];
  validationKind: PysparkWeekOneExerciseSeed["validationKind"];
  requirements: PysparkWeekOneExerciseSeed["requirements"];
  hiddenRequirements: PysparkWeekOneExerciseSeed["hiddenRequirements"];
  forbiddenPatterns: string[];
  acceptedAnswers?: string[];
  resultExpectation: string;
  validatorVersion: number;
  uniqueLogicFingerprint: string;
  negativeSubmission: string;
};

function normalizeDifficulty(
  value: PysparkWeekOneExerciseSeed["difficulty"],
): QuestionDifficulty {
  return value === "easy" ? "beginner" : "foundation";
}

function normalizeQuestionType(
  value: PysparkWeekOneExerciseSeed["questionType"],
): QuestionType {
  return value;
}

function normalizeFingerprint(value: string) {
  return value.toLowerCase().replace(/\s+/gu, " ").trim();
}

function buildFingerprint(seed: PysparkWeekOneExerciseSeed, positionWithinWeek: number) {
  return normalizeFingerprint(
    [
      `pyspark-week-1-${positionWithinWeek}`,
      seed.title,
      seed.summary,
      seed.prompt,
      seed.topic,
      seed.validationKind,
      seed.resultExpectation,
      seed.requirements.map((item) => `${item.label}:${item.anyOf.join("&")}`).join("|"),
      seed.hiddenRequirements.map((item) => `${item.label}:${item.anyOf.join("&")}`).join("|"),
      (seed.acceptedAnswers ?? []).join("|"),
      (seed.forbiddenPatterns ?? []).join("|"),
    ].join(" | "),
  );
}

function buildNegativeSubmission(seed: PysparkWeekOneExerciseSeed) {
  if (seed.validationKind === "conceptual") {
    return 'answer = "wrong answer"\n';
  }

  return `${seed.starterCode.trimEnd()}\n`;
}

const pysparkWeekOne = getWeeksByCourse("pyspark")[0];

if (!pysparkWeekOne) {
  throw new Error("PySpark Week 1 is missing from the curriculum.");
}

const pysparkWeekOneLessons = lessons.filter(
  (lesson) => lesson.courseSlug === "pyspark" && lesson.weekId === pysparkWeekOne.id,
);

if (pysparkWeekOneLessons.length !== PYSPARK_WEEK_ONE_TOTAL) {
  throw new Error(
    `PySpark Week 1 must contain ${PYSPARK_WEEK_ONE_TOTAL} lessons. Received ${pysparkWeekOneLessons.length}.`,
  );
}

export const pysparkWeekOneQuestions: PysparkWeekOneQuestionRecord[] =
  pysparkWeekOneExerciseSeeds.map((seed, index) => {
    const positionWithinWeek = index + 1;
    const lesson = pysparkWeekOneLessons[index];
    const id = getMasteryQuestionId("pyspark", 1, positionWithinWeek);

    if (!lesson) {
      throw new Error(`Missing PySpark Week 1 lesson mapping for ${id}.`);
    }

    return {
      id,
      lessonId: lesson.id,
      weekId: pysparkWeekOne.id,
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
      referenceSolution: seed.referenceSolution,
      tags: [...seed.tags],
      validationKind: seed.validationKind,
      requirements: [...seed.requirements],
      hiddenRequirements: [...seed.hiddenRequirements],
      forbiddenPatterns: [...(seed.forbiddenPatterns ?? [])],
      acceptedAnswers: seed.acceptedAnswers ? [...seed.acceptedAnswers] : undefined,
      resultExpectation: seed.resultExpectation,
      validatorVersion: PYSPARK_WEEK_ONE_VALIDATOR_VERSION,
      uniqueLogicFingerprint: buildFingerprint(seed, positionWithinWeek),
      negativeSubmission: buildNegativeSubmission(seed),
    };
  });

export function getPysparkWeekOneQuestionIds() {
  return pysparkWeekOneQuestions.map((question) => question.id);
}

export function getPysparkWeekOneQuestionById(questionId: string) {
  return pysparkWeekOneQuestions.find((question) => question.id === questionId) ?? null;
}

export function getPysparkWeekOneQuestionByPosition(positionWithinWeek: number) {
  return pysparkWeekOneQuestions[positionWithinWeek - 1] ?? null;
}

export function getPysparkWeekOneQuestionByLessonId(lessonId: string) {
  return pysparkWeekOneQuestions.find((question) => question.lessonId === lessonId) ?? null;
}

export function getPysparkWeekOneDefinition(
  question: Pick<
    PysparkWeekOneQuestionRecord,
    | "starterCode"
    | "prompt"
    | "requirements"
    | "hiddenRequirements"
    | "validationKind"
    | "acceptedAnswers"
    | "forbiddenPatterns"
    | "referenceSolution"
    | "resultExpectation"
  >,
): PysparkExerciseDefinition {
  return {
    starterCode: question.starterCode,
    prompt: question.prompt,
    requirements: question.requirements,
    hiddenRequirements: question.hiddenRequirements,
    validationKind: question.validationKind,
    acceptedAnswers: question.acceptedAnswers,
    forbiddenPatterns: question.forbiddenPatterns,
    referenceSolution: question.referenceSolution,
    resultExpectation: question.resultExpectation,
  };
}

type RoutingReason =
  | "requested"
  | "resume"
  | "locked-request"
  | "invalid-request";

export function resolvePysparkWeekOneQuestionId(
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
    questionId: pysparkWeekOneQuestions[0]?.id ?? null,
    reason: requestedQuestionId ? ("invalid-request" as RoutingReason) : ("resume" as RoutingReason),
  };
}
