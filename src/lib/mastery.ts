import {
  CourseSlug,
  LessonProgressRecord,
  MasteryScoreCategory,
  MasteryState,
  MaterialLessonProgressRecord,
  RevisionQueueRecord,
} from "@/lib/types";
import { getLessonsByWeek, getWeeksByCourse, lessons } from "@/lib/curriculum";

export const masteryWeights: Record<MasteryScoreCategory, number> = {
  coding: 35,
  assessments: 20,
  projects: 20,
  debugging: 10,
  retention: 10,
  reading: 5,
};

export const masteryThresholds = {
  practicedAttempts: 1,
  passedPercent: 70,
  masteredPercent: 85,
  hintPenaltyPerHint: 5,
  reviewIntervalsDays: [1, 3, 7, 14, 30],
} as const;

export interface ScoreContribution {
  category: MasteryScoreCategory;
  weight: number;
  applicable: boolean;
  earned: number;
  reason: string;
}

export interface DerivedMasteryScore {
  percent: number;
  state: MasteryState;
  contributions: ScoreContribution[];
  missingRequirements: string[];
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function applyHintPenalty(score: number, hintsUsed: number) {
  return clamp(score - hintsUsed * masteryThresholds.hintPenaltyPerHint);
}

export function buildReviewDueAt(baseDate: Date, stage: number) {
  const safeStage = Math.max(0, Math.min(stage, masteryThresholds.reviewIntervalsDays.length - 1));
  const dueAt = new Date(baseDate);
  dueAt.setDate(dueAt.getDate() + masteryThresholds.reviewIntervalsDays[safeStage]);
  return dueAt.toISOString();
}

export function createInitialReviewRecord(
  courseSlug: CourseSlug,
  lessonId: string,
  topic: string,
  now = new Date(),
): RevisionQueueRecord {
  const nowIso = now.toISOString();
  return {
    id: `revision-${lessonId}`,
    createdAt: nowIso,
    updatedAt: nowIso,
    courseSlug,
    lessonId,
    topic,
    dueAt: buildReviewDueAt(now, 0),
    reason: "First review scheduled after verified pass.",
    priority: 2,
    reviewStage: 0,
    lastReviewedAt: null,
    lastOutcome: "pending",
  };
}

export function updateReviewRecord(
  record: RevisionQueueRecord,
  passed: boolean,
  now = new Date(),
): RevisionQueueRecord {
  const nextStage = passed
    ? Math.min((record.reviewStage ?? 0) + 1, masteryThresholds.reviewIntervalsDays.length - 1)
    : 0;

  return {
    ...record,
    dueAt: buildReviewDueAt(now, nextStage),
    reason: passed ? "Successful recall pushed the next review later." : "Review failed and was reset sooner.",
    priority: passed ? Math.max(1, record.priority - 1) : Math.min(5, record.priority + 1),
    reviewStage: nextStage,
    lastReviewedAt: now.toISOString(),
    lastOutcome: passed ? "passed" : "failed",
    updatedAt: now.toISOString(),
  };
}

function isWeekAssessmentLesson(lessonId: string) {
  const lesson = lessons.find((item) => item.id === lessonId);
  if (!lesson) return false;
  const weekLessons = getLessonsByWeek(lesson.weekId);
  return weekLessons[weekLessons.length - 1]?.id === lessonId;
}

function isDebuggingWeightedLesson(lesson: (typeof lessons)[number] | undefined) {
  if (!lesson) return false;
  return lesson.tags.some((tag) => tag.includes("debug") || tag.includes("review"));
}

export function deriveLessonMasteryScore({
  lessonProgress,
  materialProgress,
  reviewRecord,
  now = new Date(),
}: {
  lessonProgress: LessonProgressRecord;
  materialProgress?: MaterialLessonProgressRecord | null;
  reviewRecord?: RevisionQueueRecord | null;
  now?: Date;
}): DerivedMasteryScore {
  const lesson = lessons.find((item) => item.id === lessonProgress.lessonId);
  const adjustedCodingScore =
    lessonProgress.evidenceType && lessonProgress.evidenceType !== "manual-legacy"
      ? applyHintPenalty(lessonProgress.score, lessonProgress.hintsUsed)
      : 0;

  const readingEarned =
    materialProgress?.state === "completed"
      ? masteryWeights.reading
      : materialProgress?.state === "reading"
        ? masteryWeights.reading * 0.4
        : 0;

  const assessmentApplicable = isWeekAssessmentLesson(lessonProgress.lessonId);
  const debuggingApplicable = isDebuggingWeightedLesson(lesson);
  const retentionApplicable = Boolean(lessonProgress.passedAt);
  const retentionEarned =
    reviewRecord?.lastOutcome === "passed"
      ? masteryWeights.retention
      : reviewRecord && new Date(reviewRecord.dueAt) > now
        ? masteryWeights.retention * 0.4
        : 0;

  const contributions: ScoreContribution[] = [
    {
      category: "coding",
      weight: masteryWeights.coding,
      applicable: true,
      earned: (adjustedCodingScore / 100) * masteryWeights.coding,
      reason:
        adjustedCodingScore > 0
          ? `Verified submission score ${adjustedCodingScore} after hint penalty.`
          : "No verified coding evidence yet.",
    },
    {
      category: "assessments",
      weight: masteryWeights.assessments,
      applicable: assessmentApplicable,
      earned: assessmentApplicable ? (adjustedCodingScore / 100) * masteryWeights.assessments : 0,
      reason: assessmentApplicable
        ? "This is the final lesson of the week, so it also contributes assessment weight."
        : "Assessment weight is tracked on the final lesson of the week.",
    },
    {
      category: "projects",
      weight: masteryWeights.projects,
      applicable: false,
      earned: 0,
      reason: "Project scoring is tracked at week or track level, not on an individual lesson.",
    },
    {
      category: "debugging",
      weight: masteryWeights.debugging,
      applicable: debuggingApplicable,
      earned: debuggingApplicable ? (adjustedCodingScore / 100) * masteryWeights.debugging : 0,
      reason: debuggingApplicable
        ? "This lesson includes debugging or review-oriented work."
        : "Debugging weight applies only to lessons tagged as debugging or review heavy.",
    },
    {
      category: "retention",
      weight: masteryWeights.retention,
      applicable: retentionApplicable,
      earned: retentionEarned,
      reason: retentionApplicable
        ? reviewRecord?.lastOutcome === "passed"
          ? "A successful review completed the retention requirement."
          : reviewRecord
            ? "A review is scheduled but not yet passed independently."
            : "Retention becomes active after a verified pass."
        : "Retention applies only after the lesson is first passed.",
    },
    {
      category: "reading",
      weight: masteryWeights.reading,
      applicable: true,
      earned: readingEarned,
      reason:
        materialProgress?.state === "completed"
          ? "Reading notes were completed."
          : materialProgress?.state === "reading"
            ? "The notes were opened but not marked complete."
            : "Reading progress not started.",
    },
  ];

  const applicableWeight = contributions
    .filter((item) => item.applicable)
    .reduce((total, item) => total + item.weight, 0);
  const earnedWeight = contributions
    .filter((item) => item.applicable)
    .reduce((total, item) => total + item.earned, 0);
  const percent = applicableWeight ? Math.round((earnedWeight / applicableWeight) * 100) : 0;
  const overdue = reviewRecord ? new Date(reviewRecord.dueAt) <= now : false;
  const missingRequirements: string[] = [];

  if (!lessonProgress.attempts && materialProgress?.state !== "completed" && materialProgress?.state !== "reading") {
    return {
      percent: 0,
      state: "not_started",
      contributions,
      missingRequirements: ["Open the lesson or attempt the exercise to begin evidence collection."],
    };
  }

  if (materialProgress?.state === "reading" || lessonProgress.masteryState === "reading") {
    missingRequirements.push("Finish the lesson notes or submit a meaningful coding attempt.");
  }

  if (lessonProgress.attempts >= masteryThresholds.practicedAttempts && adjustedCodingScore < masteryThresholds.passedPercent) {
    missingRequirements.push("Verified coding score is still below the pass threshold.");
  }

  if (retentionApplicable && reviewRecord?.lastOutcome !== "passed") {
    missingRequirements.push("A successful retention review is still required for mastery.");
  }

  let state: MasteryState = "practiced";
  if (overdue && lessonProgress.passedAt) {
    state = "needs_review";
  } else if (percent >= masteryThresholds.masteredPercent && reviewRecord?.lastOutcome === "passed") {
    state = "mastered";
  } else if (percent >= masteryThresholds.passedPercent && adjustedCodingScore >= masteryThresholds.passedPercent) {
    state = "passed";
  } else if (materialProgress?.state === "reading" || lessonProgress.masteryState === "reading") {
    state = "reading";
  }

  return {
    percent,
    state,
    contributions,
    missingRequirements,
  };
}

export function deriveCourseMasteryScore({
  courseSlug,
  lessonProgress,
  materialProgress,
  revisionQueue,
  now = new Date(),
}: {
  courseSlug: CourseSlug;
  lessonProgress: LessonProgressRecord[];
  materialProgress: MaterialLessonProgressRecord[];
  revisionQueue: RevisionQueueRecord[];
  now?: Date;
}) {
  const courseLessons = lessons.filter((lesson) => lesson.courseSlug === courseSlug);
  const lessonScores = courseLessons.map((lesson) =>
    deriveLessonMasteryScore({
      lessonProgress:
        lessonProgress.find((item) => item.lessonId === lesson.id) ??
        ({
          attempts: 0,
          hintsUsed: 0,
          score: 0,
          evidenceType: null,
          masteryState: "not_started",
          passedAt: null,
          lessonId: lesson.id,
        } as unknown as LessonProgressRecord),
      materialProgress: materialProgress.find((item) => item.lessonId === lesson.id) ?? null,
      reviewRecord: revisionQueue.find((item) => item.lessonId === lesson.id) ?? null,
      now,
    }),
  );

  const percent = lessonScores.length
    ? Math.round(lessonScores.reduce((sum, score) => sum + score.percent, 0) / lessonScores.length)
    : 0;

  return {
    percent,
    lessonScores,
  };
}

export function splitReviewQueue(queue: RevisionQueueRecord[], now = new Date()) {
  const today = startOfDay(now).getTime();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTime = tomorrow.getTime();

  const sorted = [...queue].sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const dueToday = sorted.filter((item) => {
    const due = new Date(item.dueAt).getTime();
    return due >= today && due < tomorrowTime;
  });
  const overdue = sorted.filter((item) => new Date(item.dueAt).getTime() < today);

  return {
    dueToday,
    overdue,
    upcoming: sorted.filter((item) => new Date(item.dueAt).getTime() >= tomorrowTime),
  };
}

export function getRecommendedNextLessons(courseSlug: CourseSlug, lessonProgress: LessonProgressRecord[]) {
  return getWeeksByCourse(courseSlug)
    .flatMap((week) => getLessonsByWeek(week.id))
    .map((lesson) => ({
      lesson,
      progress: lessonProgress.find((item) => item.lessonId === lesson.id) ?? null,
    }))
    .filter((item) => item.progress?.status === "unlocked" || item.progress?.status === "in_progress")
    .map((item) => ({
      courseSlug,
      lessonId: item.lesson.id,
      lessonTitle: item.lesson.title,
      weekId: item.lesson.weekId,
    }));
}
