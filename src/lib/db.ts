"use client";

import Dexie, { type Table } from "dexie";
import {
  ActivityLogRecord,
  ArcadeLanguage,
  AppBackupPayload,
  BackupRecord,
  CandyArcadeLevelProgressRecord,
  CourseProgressRecord,
  CourseSeed,
  DatasetSeed,
  ErrorLogRecord,
  ExerciseAttemptRecord,
  ExerciseSeed,
  GameLevelProgressRecord,
  LessonProgressRecord,
  LessonRecord,
  NoteRecord,
  ProjectSeed,
  ProjectSubmissionRecord,
  RevisionQueueRecord,
  SettingRecord,
  SqlTaskProgressRecord,
  TopicMasteryRecord,
  WeekProgressRecord,
  WeekSeed,
} from "@/lib/types";
import {
  allWeeks,
  courses,
  datasets,
  exercises,
  getWeeksByCourse,
  lessons,
  projects,
  topicMasterySeeds,
} from "@/lib/curriculum";
import { candyArcadeLevels } from "@/lib/candy-arcade";
import { allGameLevels } from "@/lib/game-levels";
import { sqlWeekOneId, sqlWeekOneUnlockMessage } from "@/lib/sql-week-one";
import { sqlWeekThreeId } from "@/lib/sql-week-three";
import { sqlWeekTwoId } from "@/lib/sql-week-two";
import { sqlWeekFourId } from "@/lib/sql-week-four";
import { sqlAllTasks, sqlWeekDefinitions } from "@/lib/sql-weeks";

class MasteryDexie extends Dexie {
  courses!: Table<CourseSeed, string>;
  weeks!: Table<WeekSeed, string>;
  lessons!: Table<LessonRecord, string>;
  exercises!: Table<ExerciseSeed, string>;
  projects!: Table<ProjectSeed, string>;
  datasets!: Table<DatasetSeed, string>;
  topicMastery!: Table<TopicMasteryRecord, string>;
  courseProgress!: Table<CourseProgressRecord, string>;
  weekProgress!: Table<WeekProgressRecord, string>;
  lessonProgress!: Table<LessonProgressRecord, string>;
  exerciseAttempts!: Table<ExerciseAttemptRecord, string>;
  projectSubmissions!: Table<ProjectSubmissionRecord, string>;
  revisionQueue!: Table<RevisionQueueRecord, string>;
  errorLog!: Table<ErrorLogRecord, string>;
  notes!: Table<NoteRecord, string>;
  activityLog!: Table<ActivityLogRecord, string>;
  settings!: Table<SettingRecord, string>;
  backups!: Table<BackupRecord, string>;
  sqlTaskProgress!: Table<SqlTaskProgressRecord, string>;
  gameLevelProgress!: Table<GameLevelProgressRecord, string>;
  candyArcadeProgress!: Table<CandyArcadeLevelProgressRecord, string>;

  constructor() {
    super("mastery-platform-db");
    this.version(1).stores({
      courses: "id, slug, createdAt, updatedAt",
      weeks: "id, courseSlug, weekNumber, monthNumber, levelNumber, createdAt, updatedAt",
      lessons: "id, courseSlug, weekId, createdAt, updatedAt",
      exercises: "id, courseSlug, difficulty, mode, createdAt, updatedAt",
      projects: "id, courseSlug, createdAt, updatedAt",
      datasets: "id, courseSlug, createdAt, updatedAt",
      topicMastery: "id, courseSlug, topic, score, updatedAt",
      courseProgress: "id, courseSlug, updatedAt",
      weekProgress: "id, courseSlug, weekId, status, updatedAt",
      lessonProgress: "id, courseSlug, lessonId, weekId, status, updatedAt",
      exerciseAttempts: "id, courseSlug, exerciseId, createdAt",
      projectSubmissions: "id, courseSlug, projectId, updatedAt",
      revisionQueue: "id, courseSlug, dueAt, priority, updatedAt",
      errorLog: "id, courseSlug, topic, count, updatedAt",
      notes: "id, courseSlug, topic, isImportant, updatedAt",
      activityLog: "id, courseSlug, occurredAt, activityType",
      settings: "id, key, updatedAt",
      backups: "id, updatedAt",
    });
    this.version(2).stores({
      courses: "id, slug, createdAt, updatedAt",
      weeks: "id, courseSlug, weekNumber, monthNumber, levelNumber, createdAt, updatedAt",
      lessons: "id, courseSlug, weekId, createdAt, updatedAt",
      exercises: "id, courseSlug, difficulty, mode, createdAt, updatedAt",
      projects: "id, courseSlug, createdAt, updatedAt",
      datasets: "id, courseSlug, createdAt, updatedAt",
      topicMastery: "id, courseSlug, topic, score, updatedAt",
      courseProgress: "id, courseSlug, updatedAt",
      weekProgress: "id, courseSlug, weekId, status, updatedAt",
      lessonProgress: "id, courseSlug, lessonId, weekId, status, updatedAt",
      exerciseAttempts: "id, courseSlug, exerciseId, createdAt",
      projectSubmissions: "id, courseSlug, projectId, updatedAt",
      revisionQueue: "id, courseSlug, dueAt, priority, updatedAt",
      errorLog: "id, courseSlug, topic, count, updatedAt",
      notes: "id, courseSlug, topic, isImportant, updatedAt",
      activityLog: "id, courseSlug, occurredAt, activityType",
      settings: "id, key, updatedAt",
      backups: "id, updatedAt",
      sqlTaskProgress: "id, weekId, taskId, completed, unlocked, updatedAt",
    });
    this.version(3).stores({
      courses: "id, slug, createdAt, updatedAt",
      weeks: "id, courseSlug, weekNumber, monthNumber, levelNumber, createdAt, updatedAt",
      lessons: "id, courseSlug, weekId, createdAt, updatedAt",
      exercises: "id, courseSlug, difficulty, mode, createdAt, updatedAt",
      projects: "id, courseSlug, createdAt, updatedAt",
      datasets: "id, courseSlug, createdAt, updatedAt",
      topicMastery: "id, courseSlug, topic, score, updatedAt",
      courseProgress: "id, courseSlug, updatedAt",
      weekProgress: "id, courseSlug, weekId, status, updatedAt",
      lessonProgress: "id, courseSlug, lessonId, weekId, status, updatedAt",
      exerciseAttempts: "id, courseSlug, exerciseId, createdAt",
      projectSubmissions: "id, courseSlug, projectId, updatedAt",
      revisionQueue: "id, courseSlug, dueAt, priority, updatedAt",
      errorLog: "id, courseSlug, topic, count, updatedAt",
      notes: "id, courseSlug, topic, isImportant, updatedAt",
      activityLog: "id, courseSlug, occurredAt, activityType",
      settings: "id, key, updatedAt",
      backups: "id, updatedAt",
      sqlTaskProgress: "id, weekId, taskId, completed, unlocked, updatedAt",
      gameLevelProgress: "id, courseSlug, levelNumber, unlocked, completed, updatedAt",
    });
    this.version(4).stores({
      courses: "id, slug, createdAt, updatedAt",
      weeks: "id, courseSlug, weekNumber, monthNumber, levelNumber, createdAt, updatedAt",
      lessons: "id, courseSlug, weekId, createdAt, updatedAt",
      exercises: "id, courseSlug, difficulty, mode, createdAt, updatedAt",
      projects: "id, courseSlug, createdAt, updatedAt",
      datasets: "id, courseSlug, createdAt, updatedAt",
      topicMastery: "id, courseSlug, topic, score, updatedAt",
      courseProgress: "id, courseSlug, updatedAt",
      weekProgress: "id, courseSlug, weekId, status, updatedAt",
      lessonProgress: "id, courseSlug, lessonId, weekId, status, updatedAt",
      exerciseAttempts: "id, courseSlug, exerciseId, createdAt",
      projectSubmissions: "id, courseSlug, projectId, updatedAt",
      revisionQueue: "id, courseSlug, dueAt, priority, updatedAt",
      errorLog: "id, courseSlug, topic, count, updatedAt",
      notes: "id, courseSlug, topic, isImportant, updatedAt",
      activityLog: "id, courseSlug, occurredAt, activityType",
      settings: "id, key, updatedAt",
      backups: "id, updatedAt",
      sqlTaskProgress: "id, weekId, taskId, completed, unlocked, updatedAt",
      gameLevelProgress: "id, courseSlug, levelNumber, unlocked, completed, updatedAt",
      candyArcadeProgress: "id, levelNumber, unlocked, completed, updatedAt",
    });
  }
}

export const db = new MasteryDexie();

const nowIso = () => new Date().toISOString();

const buildWeekLockReason = (weekNumber: number, courseSlug: string) => {
  if (weekNumber === 1) return null;
  if (courseSlug === "sql" && weekNumber === 2) return sqlWeekOneUnlockMessage;
  return `Complete Week ${weekNumber - 1} to unlock this week.`;
};

const courseProgressSeed = (courseSlug: "sql" | "python"): CourseProgressRecord => {
  const weeks = getWeeksByCourse(courseSlug);
  const firstWeek = weeks[0];
  const firstLesson = lessons.find((lesson) => lesson.weekId === firstWeek.id);
  return {
    id: `course-progress-${courseSlug}`,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    courseSlug,
    currentWeekId: firstWeek.id,
    currentLessonId: firstLesson?.id ?? "",
    completionPercent: 0,
    accuracyPercent: 0,
    exercisesSolved: 0,
    streakDays: 0,
    studyMinutesToday: 0,
    studyMinutesThisWeek: 0,
    lastActivityAt: null,
  };
};

const weekProgressSeeds = (): WeekProgressRecord[] =>
  allWeeks.map((week) => ({
    id: `week-progress-${week.id}`,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    courseSlug: week.courseSlug,
    weekId: week.id,
    status: week.weekNumber === 1 ? "unlocked" : "locked",
    score: 0,
    lockReason: buildWeekLockReason(week.weekNumber, week.courseSlug),
  }));

const lessonProgressSeeds = (): LessonProgressRecord[] =>
  lessons.map((lesson) => {
    const week = allWeeks.find((item) => item.id === lesson.weekId);
    const unlocked = week?.weekNumber === 1;
    return {
      id: `lesson-progress-${lesson.id}`,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      courseSlug: lesson.courseSlug,
      lessonId: lesson.id,
      weekId: lesson.weekId,
      status: unlocked ? "unlocked" : "locked",
      score: 0,
      attempts: 0,
      timeSpent: 0,
      hintsUsed: 0,
      lastOpenedAt: null,
      completedAt: null,
    };
  });

const sqlTaskProgressSeeds = (): SqlTaskProgressRecord[] =>
  sqlAllTasks.map((task, index) => ({
    id: `sql-task-progress-${task.id}`,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    taskId: task.id,
    weekId: task.weekId,
    draftSql: task.starterSql,
    completed: false,
    unlocked: index === 0,
    attempts: 0,
    lastRunAt: null,
    completedAt: null,
  }));

const gameLevelProgressSeeds = (): GameLevelProgressRecord[] =>
  allGameLevels.map((level) => ({
    id: `game-progress-${level.id}`,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    levelId: level.id,
    courseSlug: level.courseSlug,
    levelNumber: level.levelNumber,
    unlocked: level.levelNumber === 1,
    completed: false,
    completedAt: null,
  }));

const candyArcadeProgressSeeds = (): CandyArcadeLevelProgressRecord[] =>
  candyArcadeLevels.map((level) => ({
    id: `candy-arcade-progress-${level.id}`,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    levelId: level.id,
    levelNumber: level.levelNumber,
    unlocked: level.levelNumber === 1,
    completed: false,
    completedAt: null,
    sqlDraft: "",
    pythonDraft: "",
    pysparkDraft: "",
    sqlCompleted: false,
    pythonCompleted: false,
    pysparkCompleted: false,
  }));

const revisionSeeds = (): RevisionQueueRecord[] => {
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 1);
  return [
    {
      id: "revision-sql-foundations",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      courseSlug: "sql",
      topic: "Relational Foundations",
      dueAt: nextDay.toISOString(),
      reason: "New topic review after first exposure.",
      priority: 2,
    },
    {
      id: "revision-python-foundations",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      courseSlug: "python",
      topic: "Python Foundations",
      dueAt: nextDay.toISOString(),
      reason: "New topic review after first exposure.",
      priority: 2,
    },
  ];
};

const errorSeeds = (): ErrorLogRecord[] => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return [
    {
      id: "error-sql-null",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      courseSlug: "sql",
      topic: "NULL Handling",
      message: "Forgetting that NULL comparisons return unknown instead of true.",
      count: 0,
      nextReviewAt: tomorrow.toISOString(),
    },
    {
      id: "error-python-types",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      courseSlug: "python",
      topic: "Type Conversion",
      message: "Mixing strings and numeric values without explicit conversion.",
      count: 0,
      nextReviewAt: tomorrow.toISOString(),
    },
  ];
};

export async function initializeDatabase() {
  const existingCourses = await db.courses.count();
  if (existingCourses > 0) {
    await ensureWeekProgressLocks();
    await ensureSqlTaskProgress();
    await reconcileSqlWeekUnlocks();
    await ensureGameLevelProgress();
    await ensureCandyArcadeProgress();
    return;
  }

  await db.transaction(
    "rw",
    [
      db.courses,
      db.weeks,
      db.lessons,
      db.exercises,
      db.projects,
      db.datasets,
      db.topicMastery,
      db.courseProgress,
      db.weekProgress,
      db.lessonProgress,
      db.revisionQueue,
      db.errorLog,
      db.settings,
      db.sqlTaskProgress,
      db.gameLevelProgress,
      db.candyArcadeProgress,
    ],
    async () => {
      await db.courses.bulkPut(courses);
      await db.weeks.bulkPut(allWeeks);
      await db.lessons.bulkPut(lessons);
      await db.exercises.bulkPut(exercises);
      await db.projects.bulkPut(projects);
      await db.datasets.bulkPut(datasets);
      await db.topicMastery.bulkPut(topicMasterySeeds);
      await db.courseProgress.bulkPut([courseProgressSeed("sql"), courseProgressSeed("python")]);
      await db.weekProgress.bulkPut(weekProgressSeeds());
      await db.lessonProgress.bulkPut(lessonProgressSeeds());
      await db.revisionQueue.bulkPut(revisionSeeds());
      await db.errorLog.bulkPut(errorSeeds());
      await db.sqlTaskProgress.bulkPut(sqlTaskProgressSeeds());
      await db.gameLevelProgress.bulkPut(gameLevelProgressSeeds());
      await db.candyArcadeProgress.bulkPut(candyArcadeProgressSeeds());
      await db.settings.bulkPut([
        {
          id: "setting-daily-goal",
          createdAt: nowIso(),
          updatedAt: nowIso(),
          key: "dailyGoalMinutes",
          value: "90",
        },
      ]);
    },
  );

  await createAutomaticBackup("initial-seed");
}

async function ensureSqlTaskProgress() {
  const existingRecords = await db.sqlTaskProgress.toArray();
  if (existingRecords.length === 0) {
    await db.sqlTaskProgress.bulkPut(sqlTaskProgressSeeds());
  } else {
    const existingTaskIds = new Set(existingRecords.map((record) => record.taskId));
    const missingRecords = sqlTaskProgressSeeds().filter((record) => !existingTaskIds.has(record.taskId));
    if (missingRecords.length > 0) {
      await db.sqlTaskProgress.bulkPut(missingRecords);
    }

    const weekOneRecords = existingRecords.filter((record) => record.weekId === sqlWeekOneId);
    const cleanedRecords = weekOneRecords.map((record) => {
      const task = sqlAllTasks.find((item) => item.id === record.taskId);
      if (!task) {
        return record;
      }

      const looksLikeSeededAnswer =
        record.draftSql.trim().length > 0 &&
        record.draftSql.trim() === task.solutionSql.trim();

      return looksLikeSeededAnswer
        ? {
            ...record,
            draftSql: "",
            updatedAt: nowIso(),
          }
        : record;
    });

    await db.sqlTaskProgress.bulkPut(cleanedRecords);
  }

  const weekTwoProgress = await db.weekProgress.get("week-progress-sql-week-02");
  if (weekTwoProgress && weekTwoProgress.lockReason !== sqlWeekOneUnlockMessage) {
    await db.weekProgress.put({
      ...weekTwoProgress,
      lockReason: sqlWeekOneUnlockMessage,
      updatedAt: nowIso(),
    });
  }
}

async function ensureGameLevelProgress() {
  const existingRecords = await db.gameLevelProgress.toArray();
  if (existingRecords.length === 0) {
    await db.gameLevelProgress.bulkPut(gameLevelProgressSeeds());
  } else {
    const existingIds = new Set(existingRecords.map((record) => record.levelId));
    const missing = gameLevelProgressSeeds().filter((record) => !existingIds.has(record.levelId));
    if (missing.length > 0) {
      await db.gameLevelProgress.bulkPut(missing);
    }
  }
  await syncSqlGameLevelsFromTasks();
}

async function ensureCandyArcadeProgress() {
  const existingRecords = await db.candyArcadeProgress.toArray();
  if (existingRecords.length === 0) {
    await db.candyArcadeProgress.bulkPut(candyArcadeProgressSeeds());
    return;
  }

  const existingIds = new Set(existingRecords.map((record) => record.levelId));
  const missing = candyArcadeProgressSeeds().filter((record) => !existingIds.has(record.levelId));
  if (missing.length > 0) {
    await db.candyArcadeProgress.bulkPut(missing);
  }
}

async function reconcileSqlWeekUnlocks() {
  for (const weekDefinition of sqlWeekDefinitions) {
    const weekTasks = await db.sqlTaskProgress.where("weekId").equals(weekDefinition.id).toArray();
    const allDone = weekTasks.length > 0 && weekTasks.every((task) => task.completed);

    if (!allDone) {
      continue;
    }

    const currentWeekProgress = await db.weekProgress.get(`week-progress-${weekDefinition.id}`);
    if (currentWeekProgress && currentWeekProgress.status !== "completed") {
      await db.weekProgress.put({
        ...currentWeekProgress,
        status: "completed",
        score: 100,
        lockReason: null,
        updatedAt: nowIso(),
      });
    }

    if (weekDefinition.nextWeekId) {
      const nextWeekProgress = await db.weekProgress.get(`week-progress-${weekDefinition.nextWeekId}`);
      if (nextWeekProgress && nextWeekProgress.status === "locked") {
        await db.weekProgress.put({
          ...nextWeekProgress,
          status: "unlocked",
          lockReason: null,
          updatedAt: nowIso(),
        });
      }

      const firstTask = sqlAllTasks.find(
        (task) => task.weekId === weekDefinition.nextWeekId && task.stepNumber === 1,
      );
      if (firstTask) {
        const firstTaskProgress = await db.sqlTaskProgress.get(`sql-task-progress-${firstTask.id}`);
        if (firstTaskProgress && !firstTaskProgress.unlocked) {
          await db.sqlTaskProgress.put({
            ...firstTaskProgress,
            unlocked: true,
            updatedAt: nowIso(),
          });
        }
      }
    }
  }
}

async function ensureWeekProgressLocks() {
  const existing = await db.weekProgress.toArray();
  const updates = existing
    .map((record) => {
      const week = allWeeks.find((item) => item.id === record.weekId);
      if (!week || record.status === "completed") {
        return null;
      }

      const nextLockReason = buildWeekLockReason(week.weekNumber, week.courseSlug);
      if (record.lockReason === nextLockReason) {
        return null;
      }

      return {
        ...record,
        lockReason: nextLockReason,
        updatedAt: nowIso(),
      };
    })
    .filter(Boolean) as WeekProgressRecord[];

  if (updates.length > 0) {
    await db.weekProgress.bulkPut(updates);
  }
}

export async function logStudyMinutes(courseSlug: "sql" | "python", minutes: number) {
  const progress = await db.courseProgress.get(`course-progress-${courseSlug}`);
  if (!progress) return;

  const entry: ActivityLogRecord = {
    id: `activity-${courseSlug}-${Date.now()}`,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    courseSlug,
    minutes,
    activityType: "study",
    occurredAt: nowIso(),
  };

  await db.transaction("rw", db.activityLog, db.courseProgress, async () => {
    await db.activityLog.put(entry);
    await db.courseProgress.put({
      ...progress,
      studyMinutesToday: progress.studyMinutesToday + minutes,
      studyMinutesThisWeek: progress.studyMinutesThisWeek + minutes,
      streakDays: progress.streakDays === 0 ? 1 : progress.streakDays,
      lastActivityAt: entry.occurredAt,
      updatedAt: nowIso(),
    });
  });
}

export async function touchLesson(lessonId: string) {
  const lesson = await db.lessons.get(lessonId);
  if (!lesson) return;
  const progress = await db.lessonProgress.get(`lesson-progress-${lessonId}`);
  const courseProgress = await db.courseProgress.get(`course-progress-${lesson.courseSlug}`);
  if (!progress || !courseProgress) return;

  await db.transaction("rw", db.lessonProgress, db.courseProgress, async () => {
    await db.lessonProgress.put({
      ...progress,
      status: progress.status === "unlocked" ? "in_progress" : progress.status,
      lastOpenedAt: nowIso(),
      updatedAt: nowIso(),
    });
    await db.courseProgress.put({
      ...courseProgress,
      currentWeekId: lesson.weekId,
      currentLessonId: lesson.id,
      lastActivityAt: nowIso(),
      updatedAt: nowIso(),
    });
  });
}

async function serializeDatabase(): Promise<AppBackupPayload> {
  const tableNames = db.tables.map((table) => table.name);
  const data = Object.fromEntries(
    await Promise.all(
      tableNames.map(async (tableName) => {
        const rows = await db.table(tableName).toArray();
        return [tableName, rows];
      }),
    ),
  );

  return {
    exportedAt: nowIso(),
    version: 2,
    data,
  };
}

export async function exportBackup() {
  return serializeDatabase();
}

export async function importBackup(payload: AppBackupPayload) {
  await db.transaction("rw", db.tables, async () => {
    for (const table of db.tables) {
      await table.clear();
    }
    for (const [tableName, rows] of Object.entries(payload.data)) {
      await db.table(tableName).bulkPut(rows);
    }
  });
}

export async function createAutomaticBackup(name = "auto-backup") {
  const payload = await serializeDatabase();
  const record: BackupRecord = {
    id: `backup-${name}-${Date.now()}`,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    name,
    payload: JSON.stringify(payload),
  };
  await db.backups.put(record);
}

export async function resetAllProgress() {
  await db.delete();
  await db.open();
  await initializeDatabase();
}

export async function resetCourseProgress(courseSlug: "sql" | "python") {
  const weekIds = getWeeksByCourse(courseSlug).map((week) => week.id);
  const lessonIds = lessons.filter((lesson) => lesson.courseSlug === courseSlug).map((lesson) => lesson.id);

  await db.transaction(
    "rw",
    [
      db.courseProgress,
      db.weekProgress,
      db.lessonProgress,
      db.exerciseAttempts,
      db.projectSubmissions,
      db.revisionQueue,
      db.errorLog,
      db.notes,
      db.activityLog,
      db.topicMastery,
      db.sqlTaskProgress,
      db.gameLevelProgress,
    ],
    async () => {
      await db.courseProgress.put(courseProgressSeed(courseSlug));

      for (const weekId of weekIds) {
        const week = allWeeks.find((item) => item.id === weekId);
        await db.weekProgress.put({
          id: `week-progress-${weekId}`,
          createdAt: nowIso(),
          updatedAt: nowIso(),
          courseSlug,
          weekId,
          status: week?.weekNumber === 1 ? "unlocked" : "locked",
          score: 0,
          lockReason: buildWeekLockReason(week?.weekNumber ?? 1, week?.courseSlug ?? courseSlug),
        });
      }

      for (const lessonId of lessonIds) {
        const lesson = lessons.find((item) => item.id === lessonId);
        const week = lesson ? allWeeks.find((item) => item.id === lesson.weekId) : null;
        await db.lessonProgress.put({
          id: `lesson-progress-${lessonId}`,
          createdAt: nowIso(),
          updatedAt: nowIso(),
          courseSlug,
          lessonId,
          weekId: lesson?.weekId ?? "",
          status: week?.weekNumber === 1 ? "unlocked" : "locked",
          score: 0,
          attempts: 0,
          timeSpent: 0,
          hintsUsed: 0,
          lastOpenedAt: null,
          completedAt: null,
        });
      }

      await db.exerciseAttempts.where("courseSlug").equals(courseSlug).delete();
      await db.projectSubmissions.where("courseSlug").equals(courseSlug).delete();
      await db.revisionQueue.where("courseSlug").equals(courseSlug).delete();
      await db.errorLog.where("courseSlug").equals(courseSlug).delete();
      await db.notes.where("courseSlug").equals(courseSlug).delete();
      await db.activityLog.where("courseSlug").equals(courseSlug).delete();
      await db.topicMastery.where("courseSlug").equals(courseSlug).delete();
      await db.topicMastery.bulkPut(topicMasterySeeds.filter((item) => item.courseSlug === courseSlug));
      await db.revisionQueue.bulkPut(revisionSeeds().filter((item) => item.courseSlug === courseSlug));
      await db.errorLog.bulkPut(errorSeeds().filter((item) => item.courseSlug === courseSlug));
      if (courseSlug === "sql") {
        await db.sqlTaskProgress.clear();
        await db.sqlTaskProgress.bulkPut(sqlTaskProgressSeeds());
      }
      await db.gameLevelProgress.where("courseSlug").equals(courseSlug).delete();
      await db.gameLevelProgress.bulkPut(
        gameLevelProgressSeeds().filter((item) => item.courseSlug === courseSlug),
      );
    },
  );

  await createAutomaticBackup(`reset-${courseSlug}`);
}

export async function resetCandyArcadeProgress() {
  await db.candyArcadeProgress.clear();
  await db.candyArcadeProgress.bulkPut(candyArcadeProgressSeeds());
  await createAutomaticBackup("reset-candy-arcade");
}

export async function saveSqlTaskDraft(taskId: string, draftSql: string) {
  const record = await db.sqlTaskProgress.get(`sql-task-progress-${taskId}`);
  if (!record) return;
  await db.sqlTaskProgress.put({
    ...record,
    draftSql,
    updatedAt: nowIso(),
  });
}

export async function markSqlTaskRun(taskId: string, draftSql: string) {
  const record = await db.sqlTaskProgress.get(`sql-task-progress-${taskId}`);
  if (!record) return;
  await db.sqlTaskProgress.put({
    ...record,
    draftSql,
    attempts: record.attempts + 1,
    lastRunAt: nowIso(),
    updatedAt: nowIso(),
  });
}

export async function completeSqlTask(taskId: string, draftSql: string) {
  const record = await db.sqlTaskProgress.get(`sql-task-progress-${taskId}`);
  if (!record) return;

  const weekDefinition = sqlWeekDefinitions.find((week) => week.id === record.weekId);
  const weekTasks = weekDefinition?.tasks ?? [];
  const taskIndex = weekTasks.findIndex((task) => task.id === taskId);
  const nextTask = weekTasks[taskIndex + 1];

  await db.transaction("rw", [db.sqlTaskProgress, db.weekProgress, db.gameLevelProgress], async () => {
    await db.sqlTaskProgress.put({
      ...record,
      draftSql,
      completed: true,
      unlocked: true,
      completedAt: record.completedAt ?? nowIso(),
      updatedAt: nowIso(),
    });

    if (nextTask) {
      const nextRecord = await db.sqlTaskProgress.get(`sql-task-progress-${nextTask.id}`);
      if (nextRecord && !nextRecord.unlocked) {
        await db.sqlTaskProgress.put({
          ...nextRecord,
          unlocked: true,
          updatedAt: nowIso(),
        });
      }
    }

    const currentProgress = await db.sqlTaskProgress.where("weekId").equals(record.weekId).toArray();
    const allDone = currentProgress
      .map((item) => (item.taskId === taskId ? { ...item, completed: true } : item))
      .every((item) => item.completed);

    if (allDone) {
      const currentWeek = await db.weekProgress.get(`week-progress-${record.weekId}`);
      const nextWeekId = weekDefinition?.nextWeekId ?? null;
      const nextWeek = nextWeekId ? await db.weekProgress.get(`week-progress-${nextWeekId}`) : null;
      if (currentWeek) {
        await db.weekProgress.put({
          ...currentWeek,
          status: "completed",
          score: 100,
          lockReason: null,
          updatedAt: nowIso(),
        });
      }
      if (nextWeek) {
        await db.weekProgress.put({
          ...nextWeek,
          status: "unlocked",
          lockReason: null,
          updatedAt: nowIso(),
        });
      }

      if (nextWeekId) {
        const firstTask = sqlAllTasks.find((task) => task.weekId === nextWeekId && task.stepNumber === 1);
        if (firstTask) {
          const firstTaskProgress = await db.sqlTaskProgress.get(`sql-task-progress-${firstTask.id}`);
          if (firstTaskProgress && !firstTaskProgress.unlocked) {
            await db.sqlTaskProgress.put({
              ...firstTaskProgress,
              unlocked: true,
              updatedAt: nowIso(),
            });
          }
        }
      }
    }

    await syncSqlGameLevelsFromTasks();
  });
}

async function syncSqlGameLevelsFromTasks() {
  const sqlTaskProgress = await db.sqlTaskProgress.toArray();
  const updates: GameLevelProgressRecord[] = [];

  for (const taskProgress of sqlTaskProgress) {
    const task = sqlAllTasks.find((item) => item.id === taskProgress.taskId);
    if (!task) continue;

    let levelNumber = task.stepNumber;
    if (task.weekId === sqlWeekTwoId) {
      levelNumber += 15;
    } else if (task.weekId === sqlWeekThreeId) {
      levelNumber += 30;
    } else if (task.weekId === sqlWeekFourId) {
      levelNumber += 45;
    }

    const levelRecord = await db.gameLevelProgress.get(`game-progress-sql-level-${String(levelNumber).padStart(3, "0")}`);
    if (!levelRecord) continue;

    updates.push({
      ...levelRecord,
      unlocked: levelRecord.unlocked || taskProgress.unlocked,
      completed: taskProgress.completed,
      completedAt: taskProgress.completed ? taskProgress.completedAt ?? nowIso() : null,
      updatedAt: nowIso(),
    });

    if (taskProgress.completed) {
      const nextLevelRecord = await db.gameLevelProgress.get(
        `game-progress-sql-level-${String(levelNumber + 1).padStart(3, "0")}`,
      );
      if (nextLevelRecord) {
        updates.push({
          ...nextLevelRecord,
          unlocked: true,
          updatedAt: nowIso(),
        });
      }
    }
  }

  if (updates.length > 0) {
    await db.gameLevelProgress.bulkPut(updates);
  }
}

export async function saveCandyArcadeDraft(
  levelId: string,
  language: ArcadeLanguage,
  draft: string,
) {
  const record = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
  if (!record) return;

  const fieldMap = {
    sql: "sqlDraft",
    python: "pythonDraft",
    pyspark: "pysparkDraft",
  } as const;

  await db.candyArcadeProgress.put({
    ...record,
    [fieldMap[language]]: draft,
    updatedAt: nowIso(),
  });
}

export async function completeCandyArcadeLanguage(
  levelId: string,
  language: ArcadeLanguage,
  draft: string,
) {
  const record = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
  if (!record) return { levelCompleted: false };

  const draftFieldMap = {
    sql: "sqlDraft",
    python: "pythonDraft",
    pyspark: "pysparkDraft",
  } as const;

  const completedFieldMap = {
    sql: "sqlCompleted",
    python: "pythonCompleted",
    pyspark: "pysparkCompleted",
  } as const;

  const nextRecord = {
    ...record,
    [draftFieldMap[language]]: draft,
    [completedFieldMap[language]]: true,
    updatedAt: nowIso(),
  };

  const nowCompleted =
    Boolean(nextRecord.sqlCompleted) &&
    Boolean(nextRecord.pythonCompleted) &&
    Boolean(nextRecord.pysparkCompleted);

  await db.transaction("rw", db.candyArcadeProgress, async () => {
    await db.candyArcadeProgress.put({
      ...nextRecord,
      completed: nowCompleted,
      completedAt: nowCompleted ? nextRecord.completedAt ?? nowIso() : nextRecord.completedAt,
    });

    if (nowCompleted) {
      const nextLevel = await db.candyArcadeProgress.get(
        `candy-arcade-progress-candy-arcade-level-${String(record.levelNumber + 1).padStart(4, "0")}`,
      );
      if (nextLevel && !nextLevel.unlocked) {
        await db.candyArcadeProgress.put({
          ...nextLevel,
          unlocked: true,
          updatedAt: nowIso(),
        });
      }
    }
  });

  return { levelCompleted: nowCompleted };
}

export async function completeCandyArcadeLevel(
  levelId: string,
  drafts: Record<ArcadeLanguage, string>,
) {
  const record = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
  if (!record) return { levelCompleted: false };

  const nowCompleted =
    drafts.sql.trim().length > 0 &&
    drafts.python.trim().length > 0 &&
    drafts.pyspark.trim().length > 0;

  if (!nowCompleted) {
    return { levelCompleted: false };
  }

  await db.transaction("rw", db.candyArcadeProgress, async () => {
    await db.candyArcadeProgress.put({
      ...record,
      sqlDraft: drafts.sql,
      pythonDraft: drafts.python,
      pysparkDraft: drafts.pyspark,
      sqlCompleted: true,
      pythonCompleted: true,
      pysparkCompleted: true,
      completed: true,
      completedAt: record.completedAt ?? nowIso(),
      updatedAt: nowIso(),
    });

    const nextLevel = await db.candyArcadeProgress.get(
      `candy-arcade-progress-candy-arcade-level-${String(record.levelNumber + 1).padStart(4, "0")}`,
    );
    if (nextLevel && !nextLevel.unlocked) {
      await db.candyArcadeProgress.put({
        ...nextLevel,
        unlocked: true,
        updatedAt: nowIso(),
      });
    }
  });

  return { levelCompleted: true };
}
