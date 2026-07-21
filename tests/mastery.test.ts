import { describe, expect, it } from "vitest";
import {
  applyHintPenalty,
  buildReviewDueAt,
  createInitialReviewRecord,
  deriveLessonMasteryScore,
  masteryThresholds,
  splitReviewQueue,
  updateReviewRecord,
} from "@/lib/mastery";
import { lessons } from "@/lib/curriculum";
import { LessonProgressRecord, MaterialLessonProgressRecord } from "@/lib/types";

function makeLessonProgress(overrides: Partial<LessonProgressRecord>): LessonProgressRecord {
  return {
    id: "lesson-progress-test",
    createdAt: "2026-07-15T00:00:00.000Z",
    updatedAt: "2026-07-15T00:00:00.000Z",
    courseSlug: "python",
    lessonId: lessons.find((lesson) => lesson.courseSlug === "python")!.id,
    weekId: lessons.find((lesson) => lesson.courseSlug === "python")!.weekId,
    status: "unlocked",
    masteryState: "not_started",
    evidenceType: null,
    score: 0,
    attempts: 0,
    timeSpent: 0,
    hintsUsed: 0,
    lastOpenedAt: null,
    completedAt: null,
    passedAt: null,
    readingCompletedAt: null,
    draftCode: "",
    lastFeedback: null,
    lastSubmissionAt: null,
    ...overrides,
  };
}

function makeMaterialProgress(lessonId: string, overrides: Partial<MaterialLessonProgressRecord>): MaterialLessonProgressRecord {
  return {
    id: `material-progress-${lessonId}`,
    createdAt: "2026-07-15T00:00:00.000Z",
    updatedAt: "2026-07-15T00:00:00.000Z",
    courseSlug: "python",
    lessonId,
    state: "not_started",
    bookmarked: false,
    lastOpenedAt: null,
    completedAt: null,
    ...overrides,
  };
}

describe("mastery scoring and review scheduling", () => {
  it("applies a stable hint penalty without dropping below zero", () => {
    expect(applyHintPenalty(90, 2)).toBe(80);
    expect(applyHintPenalty(10, 5)).toBe(0);
  });

  it("marks a lesson as passed when verified coding evidence clears the threshold", () => {
    const lesson = lessons.find((item) => item.courseSlug === "python")!;
    const score = deriveLessonMasteryScore({
      lessonProgress: makeLessonProgress({
        lessonId: lesson.id,
        weekId: lesson.weekId,
        attempts: 1,
        evidenceType: "python-runtime",
        score: 92,
        passedAt: "2026-07-15T00:00:00.000Z",
      }),
      materialProgress: makeMaterialProgress(lesson.id, { state: "completed" }),
      reviewRecord: createInitialReviewRecord("python", lesson.id, lesson.title, new Date("2026-07-15T00:00:00.000Z")),
      now: new Date("2026-07-15T12:00:00.000Z"),
    });

    expect(score.percent).toBeGreaterThanOrEqual(masteryThresholds.passedPercent);
    expect(score.state).toBe("passed");
  });

  it("marks a previously passed lesson as needing review when the review is overdue", () => {
    const lesson = lessons.find((item) => item.courseSlug === "python")!;
    const review = createInitialReviewRecord("python", lesson.id, lesson.title, new Date("2026-07-10T00:00:00.000Z"));
    review.dueAt = "2026-07-11T00:00:00.000Z";

    const score = deriveLessonMasteryScore({
      lessonProgress: makeLessonProgress({
        lessonId: lesson.id,
        weekId: lesson.weekId,
        attempts: 1,
        evidenceType: "python-runtime",
        score: 90,
        passedAt: "2026-07-10T00:00:00.000Z",
      }),
      materialProgress: makeMaterialProgress(lesson.id, { state: "completed" }),
      reviewRecord: review,
      now: new Date("2026-07-15T00:00:00.000Z"),
    });

    expect(score.state).toBe("needs_review");
  });

  it("can reach mastered after an independent successful review", () => {
    const lesson = lessons.find((item) => item.courseSlug === "python")!;
    const initial = createInitialReviewRecord("python", lesson.id, lesson.title, new Date("2026-07-10T00:00:00.000Z"));
    const reviewed = updateReviewRecord(initial, true, new Date("2026-07-11T00:00:00.000Z"));

    const score = deriveLessonMasteryScore({
      lessonProgress: makeLessonProgress({
        lessonId: lesson.id,
        weekId: lesson.weekId,
        attempts: 1,
        evidenceType: "python-runtime",
        score: 96,
        passedAt: "2026-07-10T00:00:00.000Z",
      }),
      materialProgress: makeMaterialProgress(lesson.id, { state: "completed" }),
      reviewRecord: reviewed,
      now: new Date("2026-07-11T12:00:00.000Z"),
    });

    expect(score.state).toBe("mastered");
  });

  it("schedules reviews deterministically into due today and overdue buckets", () => {
    const dueAt = buildReviewDueAt(new Date("2026-07-10T00:00:00.000Z"), 0);
    expect(dueAt.startsWith("2026-07-11")).toBe(true);

    const queue = [
      {
        ...createInitialReviewRecord("python", "lesson-a", "Topic A", new Date("2026-07-09T00:00:00.000Z")),
        dueAt: "2026-07-14T00:00:00.000Z",
      },
      {
        ...createInitialReviewRecord("python", "lesson-b", "Topic B", new Date("2026-07-14T00:00:00.000Z")),
        dueAt: "2026-07-15T12:00:00.000Z",
      },
      {
        ...createInitialReviewRecord("python", "lesson-c", "Topic C", new Date("2026-07-15T00:00:00.000Z")),
        dueAt: "2026-07-18T00:00:00.000Z",
      },
    ];

    const buckets = splitReviewQueue(queue, new Date("2026-07-15T08:00:00.000Z"));
    expect(buckets.overdue).toHaveLength(1);
    expect(buckets.dueToday).toHaveLength(1);
    expect(buckets.upcoming).toHaveLength(1);
  });
});
