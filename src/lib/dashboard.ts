"use client";

import { db } from "@/lib/db";
import { DashboardSummary } from "@/lib/types";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [
    sqlProgress,
    pythonProgress,
    pysparkProgress,
    lessonProgress,
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
    revisionDue: revisionQueue
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
      .slice(0, 5),
    recentMistakes: errorLog.sort((a, b) => b.count - a.count).slice(0, 5),
  };
}
