"use client";

import { db } from "@/lib/db";
import { DashboardSummary } from "@/lib/types";
import { deriveCourseMasteryScore, getRecommendedNextLessons, splitReviewQueue } from "@/lib/mastery";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [
    sqlProgress,
    pythonProgress,
    pysparkProgress,
    lessonProgress,
    materialProgress,
    sqlLessons,
    pythonLessons,
    pysparkLessons,
    sqlTaskProgress,
    candyArcadeProgress,
    topicMastery,
    revisionQueue,
    errorLog,
  ] = await Promise.all([
    db.courseProgress.get("course-progress-sql"),
    db.courseProgress.get("course-progress-python"),
    db.courseProgress.get("course-progress-pyspark"),
    db.lessonProgress.toArray(),
    db.materialLessonProgress.toArray(),
    db.lessons.where("courseSlug").equals("sql").toArray(),
    db.lessons.where("courseSlug").equals("python").toArray(),
    db.lessons.where("courseSlug").equals("pyspark").toArray(),
    db.sqlTaskProgress.toArray(),
    db.candyArcadeProgress.toArray(),
    db.topicMastery.toArray(),
    db.revisionQueue.toArray(),
    db.errorLog.toArray(),
  ]);

  const completedSqlLessons = lessonProgress.filter(
    (item) => item.courseSlug === "sql" && item.status === "completed",
  ).length;
  const completedPythonLessons = lessonProgress.filter(
    (item) => item.courseSlug === "python" && item.status === "completed",
  ).length;
  const completedPysparkLessons = lessonProgress.filter(
    (item) => item.courseSlug === "pyspark" && item.status === "completed",
  ).length;

  const sqlCompletion = sqlLessons.length
    ? Math.round((completedSqlLessons / sqlLessons.length) * 100)
    : 0;
  const pythonCompletion = pythonLessons.length
    ? Math.round((completedPythonLessons / pythonLessons.length) * 100)
    : 0;
  const pysparkCompletion = pysparkLessons.length
    ? Math.round((completedPysparkLessons / pysparkLessons.length) * 100)
    : 0;

  const completedSqlTasks = sqlTaskProgress.filter((item) => item.completed).length;
  const completedArcadeLevels = candyArcadeProgress.filter((item) => item.completed).length;
  const totalExercisesSolved = completedSqlTasks + completedArcadeLevels;

  const combinedAccuracy = Math.round(
    ((sqlProgress?.accuracyPercent ?? 0) + (pythonProgress?.accuracyPercent ?? 0)) / 2,
  );
  const masteryScores = {
    sql: deriveCourseMasteryScore({
      courseSlug: "sql",
      lessonProgress,
      materialProgress,
      revisionQueue,
    }).percent,
    python: deriveCourseMasteryScore({
      courseSlug: "python",
      lessonProgress,
      materialProgress,
      revisionQueue,
    }).percent,
    pyspark: deriveCourseMasteryScore({
      courseSlug: "pyspark",
      lessonProgress,
      materialProgress,
      revisionQueue,
    }).percent,
  };
  const overallMasteryScore = Math.round(
    (masteryScores.sql + masteryScores.python + masteryScores.pyspark) / 3,
  );
  const reviewBuckets = splitReviewQueue(revisionQueue);
  const recentlyMastered = [...lessonProgress]
    .filter((item) => item.masteryState === "passed" || item.masteryState === "mastered")
    .sort((a, b) => (b.passedAt ?? "").localeCompare(a.passedAt ?? ""))
    .slice(0, 6)
    .map((item) => ({
      courseSlug: item.courseSlug,
      lessonId: item.lessonId,
      lessonTitle:
        [...sqlLessons, ...pythonLessons, ...pysparkLessons].find((lesson) => lesson.id === item.lessonId)?.title ??
        item.lessonId,
      masteryState: item.masteryState,
      passedAt: item.passedAt ?? null,
    }));
  const recommendedNextLessons = [
    ...getRecommendedNextLessons("sql", lessonProgress),
    ...getRecommendedNextLessons("python", lessonProgress),
    ...getRecommendedNextLessons("pyspark", lessonProgress),
  ].slice(0, 6);

  return {
    sqlProgress: sqlProgress ?? null,
    pythonProgress: pythonProgress ?? null,
    pysparkProgress: pysparkProgress ?? null,
    sqlCompletion,
    pythonCompletion,
    pysparkCompletion,
    totalExercisesSolved,
    completedSqlTasks,
    completedArcadeLevels,
    combinedAccuracy,
    currentStreak: Math.max(
      sqlProgress?.streakDays ?? 0,
      pythonProgress?.streakDays ?? 0,
      pysparkProgress?.streakDays ?? 0,
    ),
    weakTopics: topicMastery
      .filter((item) => item.score < 60)
      .sort((a, b) => a.score - b.score)
      .slice(0, 5),
    strongTopics: topicMastery
      .filter((item) => item.score >= 80)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5),
    revisionDue: [...revisionQueue].sort((a, b) => a.dueAt.localeCompare(b.dueAt)).slice(0, 5),
    dueToday: reviewBuckets.dueToday,
    overdue: reviewBuckets.overdue,
    recentlyMastered,
    recommendedNextLessons,
    masteryScores,
    overallMasteryScore,
    recentMistakes: errorLog.sort((a, b) => b.count - a.count).slice(0, 5),
  };
}
