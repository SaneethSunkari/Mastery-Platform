import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { lessons } from "@/lib/curriculum";

const databaseName = "mastery-platform-db";

async function deleteDatabase() {
  await Dexie.delete(databaseName);
}

async function closeAppDatabase() {
  try {
    const { db } = await import("@/lib/db");
    db.close();
  } catch {
    // The module may not be loaded yet in some tests.
  }
}

describe("database progress and migration", () => {
  beforeEach(async () => {
    await closeAppDatabase();
    vi.resetModules();
    await deleteDatabase();
  });

  afterEach(async () => {
    await closeAppDatabase();
    vi.resetModules();
    await deleteDatabase();
  });

  it("seeds material progress and preserves reading/bookmark actions", async () => {
    const {
      db,
      initializeDatabase,
      markMaterialLessonCompleted,
      toggleMaterialBookmark,
      touchLesson,
    } = await import("@/lib/db");

    await initializeDatabase();

    const lesson = lessons.find((item) => item.courseSlug === "python");
    expect(lesson).toBeTruthy();

    await touchLesson(lesson!.id);
    await toggleMaterialBookmark(lesson!.id);
    await markMaterialLessonCompleted(lesson!.id);

    const materialProgress = await db.materialLessonProgress.get(`material-progress-${lesson!.id}`);
    const lessonProgress = await db.lessonProgress.get(`lesson-progress-${lesson!.id}`);

    expect(materialProgress?.bookmarked).toBe(true);
    expect(materialProgress?.state).toBe("completed");
    expect(lessonProgress?.masteryState).toBe("practiced");
  });

  it("migrates legacy self-completed lessons to practiced instead of passed", async () => {
    const lesson = lessons.find((item) => item.courseSlug === "python");
    expect(lesson).toBeTruthy();

    const legacyDb = new Dexie(databaseName);
    legacyDb.version(4).stores({
      lessonProgress: "id, courseSlug, lessonId, weekId, status, updatedAt",
    });
    await legacyDb.open();
    await legacyDb.table("lessonProgress").put({
      id: `lesson-progress-${lesson!.id}`,
      createdAt: "2026-07-10T00:00:00.000Z",
      updatedAt: "2026-07-10T00:00:00.000Z",
      courseSlug: lesson!.courseSlug,
      lessonId: lesson!.id,
      weekId: lesson!.weekId,
      status: "completed",
      score: 100,
      attempts: 1,
      timeSpent: 0,
      hintsUsed: 0,
      lastOpenedAt: "2026-07-10T00:00:00.000Z",
      completedAt: "2026-07-10T00:00:00.000Z",
      draftCode: "print('legacy')",
    });
    await legacyDb.close();

    const { db } = await import("@/lib/db");
    await db.open();

    const migrated = await db.lessonProgress.get(`lesson-progress-${lesson!.id}`);
    expect(migrated?.status).toBe("completed");
    expect(migrated?.masteryState).toBe("practiced");
    expect(migrated?.evidenceType).toBe("manual-legacy");
    expect(migrated?.draftCode).toBe("print('legacy')");
  });

  it("creates permanent question links and question progress during version 6 migration", async () => {
    const lesson = lessons.find((item) => item.courseSlug === "python");
    expect(lesson).toBeTruthy();

    const legacyDb = new Dexie(databaseName);
    legacyDb.version(5).stores({
      lessonProgress: "id, courseSlug, lessonId, weekId, status, masteryState, updatedAt",
      sqlTaskProgress: "id, weekId, taskId, completed, unlocked, updatedAt",
    });
    await legacyDb.open();
    await legacyDb.table("sqlTaskProgress").put({
      id: "sql-task-progress-sql-week-01-task-01",
      createdAt: "2026-07-10T00:00:00.000Z",
      updatedAt: "2026-07-10T00:00:00.000Z",
      taskId: "sql-week-01-task-01",
      weekId: "sql-week-01",
      draftSql: "SELECT * FROM customers;",
      completed: true,
      unlocked: true,
      attempts: 1,
      lastRunAt: "2026-07-10T00:00:00.000Z",
      completedAt: "2026-07-10T00:00:00.000Z",
    });
    await legacyDb.table("lessonProgress").put({
      id: `lesson-progress-${lesson!.id}`,
      createdAt: "2026-07-10T00:00:00.000Z",
      updatedAt: "2026-07-10T00:00:00.000Z",
      courseSlug: lesson!.courseSlug,
      lessonId: lesson!.id,
      weekId: lesson!.weekId,
      status: "completed",
      masteryState: "passed",
      evidenceType: "python-runtime",
      score: 92,
      attempts: 2,
      timeSpent: 0,
      hintsUsed: 0,
      lastOpenedAt: "2026-07-10T00:00:00.000Z",
      completedAt: "2026-07-10T00:00:00.000Z",
      passedAt: "2026-07-10T00:00:00.000Z",
      readingCompletedAt: "2026-07-10T00:00:00.000Z",
      draftCode: "def solve(rows):\n    return []",
      lastFeedback: "passed",
      lastSubmissionAt: "2026-07-10T00:00:00.000Z",
    });
    await legacyDb.close();

    const { db } = await import("@/lib/db");
    await db.open();

    const sqlLink = await db.legacyQuestionLinks.get(
      "legacy-question-link-sql-task-sql-week-01-task-01",
    );
    const sqlQuestionProgress = await db.masteryQuestionProgress.get(
      "question-progress-sql-q-0001",
    );
    const pythonLink = await db.legacyQuestionLinks.get(
      `legacy-question-link-lesson-${lesson!.id}`,
    );
    const pythonQuestionProgress = await db.masteryQuestionProgress.get(
      "question-progress-python-q-0001",
    );

    expect(sqlLink?.questionId).toBe("sql-q-0001");
    expect(sqlQuestionProgress?.questionId).toBe("sql-q-0001");
    expect(sqlQuestionProgress?.passed).toBe(true);

    expect(pythonLink?.questionId).toBe("python-q-0001");
    expect(pythonQuestionProgress?.questionId).toBe("python-q-0001");
    expect(pythonQuestionProgress?.validationMode).toBe("python-runtime");
    expect(pythonQuestionProgress?.passed).toBe(true);
  });

  it("schedules the first review after a verified pass", async () => {
    const {
      db,
      initializeDatabase,
      saveLessonEvaluation,
    } = await import("@/lib/db");

    await initializeDatabase();

    const lesson = lessons.find((item) => item.courseSlug === "python");
    expect(lesson).toBeTruthy();

    const result = await saveLessonEvaluation(lesson!.id, {
      passed: true,
      score: 88,
      feedback: "passed",
      evidenceType: "python-runtime",
    });

    const review = await db.revisionQueue.get(`revision-${lesson!.id}`);
    const courseProgress = await db.courseProgress.get("course-progress-python");
    const firstWeekPythonLessons = lessons.filter(
      (item) => item.courseSlug === "python" && item.weekId === lesson!.weekId,
    );

    expect(review?.lessonId).toBe(lesson!.id);
    expect(review?.topic).toBe(lesson!.title);
    expect(review?.lastOutcome).toBe("pending");
    expect(result.nextWeekId).toBeNull();
    expect(result.nextLessonId).toBe(firstWeekPythonLessons[1]?.id ?? null);
    expect(courseProgress?.currentLessonId).toBe(firstWeekPythonLessons[1]?.id ?? null);
  });

  it("unlocks the next week only after the last lesson in the current week passes", async () => {
    const {
      initializeDatabase,
      saveLessonEvaluation,
    } = await import("@/lib/db");

    await initializeDatabase();

    const firstPythonWeek = lessons.find((item) => item.courseSlug === "python")?.weekId;
    expect(firstPythonWeek).toBeTruthy();

    const firstWeekPythonLessons = lessons.filter(
      (item) => item.courseSlug === "python" && item.weekId === firstPythonWeek,
    );
    const lastLesson = firstWeekPythonLessons.at(-1);

    expect(lastLesson).toBeTruthy();

    for (const lesson of firstWeekPythonLessons.slice(0, -1)) {
      await saveLessonEvaluation(lesson.id, {
        passed: true,
        score: 100,
        feedback: "passed",
        evidenceType: "python-runtime",
      });
    }

    const result = await saveLessonEvaluation(lastLesson!.id, {
      passed: true,
      score: 100,
      feedback: "passed",
      evidenceType: "python-runtime",
    });

    expect(result.nextWeekId).toBeTruthy();
    expect(result.nextLessonId).toBeTruthy();
  });

  it("does not unlock the next arcade level just because drafts are non-empty", async () => {
    const {
      db,
      initializeDatabase,
      completeCandyArcadeLevel,
      saveCandyArcadeDraft,
    } = await import("@/lib/db");

    await initializeDatabase();

    const levelId = "candy-arcade-level-0001";
    const nextLevelId = "candy-arcade-level-0002";

    await saveCandyArcadeDraft(levelId, "sql", "select 1");
    await saveCandyArcadeDraft(levelId, "python", "print(1)");
    await saveCandyArcadeDraft(levelId, "pyspark", "result = df");

    const result = await completeCandyArcadeLevel(levelId, {
      sql: "select 1",
      python: "print(1)",
      pyspark: "result = df",
    });

    const current = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
    const next = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);

    expect(result.levelCompleted).toBe(false);
    expect(current?.completed).toBe(false);
    expect(next?.unlocked).toBe(false);
  });

  it("does not complete an arcade level when only two languages are passed", async () => {
    const {
      db,
      initializeDatabase,
      completeCandyArcadeLevel,
    } = await import("@/lib/db");

    await initializeDatabase();

    const levelId = "candy-arcade-level-0001";
    const nextLevelId = "candy-arcade-level-0002";
    const current = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
    expect(current).toBeTruthy();

    await db.candyArcadeProgress.put({
      ...current!,
      sqlCompleted: true,
      pythonCompleted: true,
      pysparkCompleted: false,
    });

    const result = await completeCandyArcadeLevel(levelId, {
      sql: "select 1",
      python: "print(1)",
      pyspark: "result = df",
    });

    const updatedCurrent = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
    const next = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);

    expect(result.levelCompleted).toBe(false);
    expect(updatedCurrent?.completed).toBe(false);
    expect(next?.unlocked).toBe(false);
  });

  it("preserves an earned arcade language pass after a later failed attempt", async () => {
    const {
      db,
      initializeDatabase,
      completeCandyArcadeLanguage,
    } = await import("@/lib/db");

    await initializeDatabase();

    const levelId = "candy-arcade-level-0001";

    await completeCandyArcadeLanguage(levelId, "sql", "SELECT order_id FROM orders;", true, 1);
    await completeCandyArcadeLanguage(levelId, "sql", "SELECT * FROM missing_table;", false, 1);

    const current = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);

    expect(current?.sqlCompleted).toBe(true);
    expect(current?.sqlAttempts).toBe(2);
    expect(current?.sqlPassedAt).toBeTruthy();
    expect(current?.completed).toBe(false);
  });

  it("unlocks the next arcade level only after the third language passes through the live language path", async () => {
    const {
      db,
      initializeDatabase,
      completeCandyArcadeLanguage,
    } = await import("@/lib/db");

    await initializeDatabase();

    const levelId = "candy-arcade-level-0001";
    const nextLevelId = "candy-arcade-level-0002";

    await completeCandyArcadeLanguage(levelId, "sql", "SELECT order_id FROM orders;", true, 1);
    await completeCandyArcadeLanguage(levelId, "python", "result = []", true, 1);

    let current = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
    let next = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);

    expect(current?.completed).toBe(false);
    expect(next?.unlocked).toBe(false);

    const completion = await completeCandyArcadeLanguage(levelId, "pyspark", "result = df.select('id')", true, 1);

    current = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
    next = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);

    expect(completion.levelCompleted).toBe(true);
    expect(current?.completed).toBe(true);
    expect(next?.unlocked).toBe(true);
  });

  it("does not attempt to unlock level 3001 when level 3000 completes", async () => {
    const {
      db,
      initializeDatabase,
      completeCandyArcadeLevel,
    } = await import("@/lib/db");

    await initializeDatabase();

    const levelId = "candy-arcade-level-3000";
    const current = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
    expect(current).toBeTruthy();

    await db.candyArcadeProgress.put({
      ...current!,
      sqlCompleted: true,
      pythonCompleted: true,
      pysparkCompleted: true,
    });

    const result = await completeCandyArcadeLevel(levelId, {
      sql: "select 1",
      python: "print(1)",
      pyspark: "result = df",
    });

    const completedCurrent = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
    const impossibleNext = await db.candyArcadeProgress.get(
      "candy-arcade-progress-candy-arcade-level-3001",
    );

    expect(result.levelCompleted).toBe(true);
    expect(completedCurrent?.completed).toBe(true);
    expect(impossibleNext).toBeUndefined();
  });
});
