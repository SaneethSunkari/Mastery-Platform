"use client";

import Dexie, { type Table } from "dexie";
import {
  ActivityLogRecord,
  ArcadeLanguage,
  AppBackupPayload,
  BackupRecord,
  CandyArcadeLevelProgressRecord,
  CourseSlug,
  CourseProgressRecord,
  CourseSeed,
  DatasetSeed,
  ErrorLogRecord,
  ExerciseAttemptRecord,
  ExerciseSeed,
  GameLevelProgressRecord,
  LegacyQuestionLinkRecord,
  LessonProgressRecord,
  LessonRecord,
  MaterialLessonProgressRecord,
  MasteryQuestionProgressRecord,
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
  getLessonById,
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
import { createInitialReviewRecord } from "@/lib/mastery";
import { getQuestionIdForLesson, getQuestionIdForSqlTask } from "@/lib/questions/registry";
import { parseQuestionId } from "@/lib/questions/ids";
import {
  PYTHON_WEEK_ONE_VALIDATOR_VERSION,
  getPythonWeekOneQuestionById,
  pythonWeekOneQuestions,
} from "@/lib/questions/python-week-one";
import {
  PYSPARK_WEEK_ONE_VALIDATOR_VERSION,
  getPysparkWeekOneQuestionById,
  pysparkWeekOneQuestions,
} from "@/lib/questions/pyspark-week-one";

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
  materialLessonProgress!: Table<MaterialLessonProgressRecord, string>;
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
  masteryQuestionProgress!: Table<MasteryQuestionProgressRecord, string>;
  legacyQuestionLinks!: Table<LegacyQuestionLinkRecord, string>;

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
    this.version(5)
      .stores({
        courses: "id, slug, createdAt, updatedAt",
        weeks: "id, courseSlug, weekNumber, monthNumber, levelNumber, createdAt, updatedAt",
        lessons: "id, courseSlug, weekId, createdAt, updatedAt",
        exercises: "id, courseSlug, difficulty, mode, createdAt, updatedAt",
        projects: "id, courseSlug, createdAt, updatedAt",
        datasets: "id, courseSlug, createdAt, updatedAt",
        topicMastery: "id, courseSlug, topic, score, updatedAt",
        courseProgress: "id, courseSlug, updatedAt",
        weekProgress: "id, courseSlug, weekId, status, updatedAt",
        lessonProgress: "id, courseSlug, lessonId, weekId, status, masteryState, updatedAt",
        materialLessonProgress: "id, courseSlug, lessonId, state, bookmarked, updatedAt",
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
      })
      .upgrade(async (tx) => {
        const lessonProgressTable = tx.table<LessonProgressRecord, string>("lessonProgress");
        const lessonProgressRecords = await lessonProgressTable.toArray();
        for (const record of lessonProgressRecords) {
          await lessonProgressTable.put({
            ...record,
            masteryState:
              record.status === "completed"
                ? "practiced"
                : record.status === "in_progress"
                  ? "reading"
                  : "not_started",
            evidenceType: record.status === "completed" ? "manual-legacy" : null,
            passedAt: null,
            readingCompletedAt: null,
            lastFeedback: null,
            lastSubmissionAt: null,
          });
        }
      });
    this.version(6)
      .stores({
        courses: "id, slug, createdAt, updatedAt",
        weeks: "id, courseSlug, weekNumber, monthNumber, levelNumber, createdAt, updatedAt",
        lessons: "id, courseSlug, weekId, createdAt, updatedAt",
        exercises: "id, courseSlug, difficulty, mode, createdAt, updatedAt",
        projects: "id, courseSlug, createdAt, updatedAt",
        datasets: "id, courseSlug, createdAt, updatedAt",
        topicMastery: "id, courseSlug, topic, score, updatedAt",
        courseProgress: "id, courseSlug, updatedAt",
        weekProgress: "id, courseSlug, weekId, status, updatedAt",
        lessonProgress: "id, courseSlug, lessonId, weekId, status, masteryState, updatedAt",
        materialLessonProgress: "id, courseSlug, lessonId, state, bookmarked, updatedAt",
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
        masteryQuestionProgress: "id, questionId, track, weekNumber, status, updatedAt",
        legacyQuestionLinks: "id, legacyKind, legacyId, questionId, track, updatedAt",
      })
      .upgrade(async (tx) => {
        const sqlTaskProgressTable = tx.table<SqlTaskProgressRecord, string>("sqlTaskProgress");
        const lessonProgressTable = tx.table<LessonProgressRecord, string>("lessonProgress");
        const masteryQuestionProgressTable =
          tx.table<MasteryQuestionProgressRecord, string>("masteryQuestionProgress");
        const legacyQuestionLinksTable =
          tx.table<LegacyQuestionLinkRecord, string>("legacyQuestionLinks");

        const sqlQuestionRecords: MasteryQuestionProgressRecord[] = [];
        const lessonQuestionRecords: MasteryQuestionProgressRecord[] = [];
        const legacyLinkRecords: LegacyQuestionLinkRecord[] = [];

        const sqlTaskProgressRecords = await sqlTaskProgressTable.toArray();
        for (const record of sqlTaskProgressRecords) {
          const task = sqlAllTasks.find((item) => item.id === record.taskId);
          if (!task) continue;

          const questionId = getQuestionIdForSqlTask(task);
          if (!questionId) continue;

          const parsed = parseQuestionId(questionId);
          if (!parsed || parsed.kind !== "mastery") continue;

          legacyLinkRecords.push(
            buildLegacyQuestionLinkRecord({
              legacyKind: "sql-task",
              legacyId: record.taskId,
              questionId,
              track: "sql",
              weekNumber: parsed.weekNumber,
              positionWithinWeek: parsed.positionWithinWeek,
              levelNumber: null,
            }),
          );

          if (!hasSqlTaskActivity(record, task.starterSql)) continue;

          sqlQuestionRecords.push(
            buildMasteryQuestionProgressRecord({
              questionId,
              track: "sql",
              weekNumber: parsed.weekNumber,
              positionWithinWeek: parsed.positionWithinWeek,
              legacySourceKind: "sql-task",
              legacySourceId: record.taskId,
              status: record.completed ? "completed" : record.unlocked ? "in_progress" : "locked",
              passed: record.completed,
              score: record.completed ? 100 : 0,
              attempts: record.attempts,
              draftCode: record.draftSql,
              validationMode: "sql-runtime",
              validatorVersion: 0,
              lastOpenedAt: null,
              lastRunAt: record.lastRunAt,
              lastSubmissionAt: record.lastRunAt,
              completedAt: record.completedAt,
            }),
          );
        }

        const lessonProgressRecords = await lessonProgressTable.toArray();
        for (const record of lessonProgressRecords) {
          const lesson = lessons.find((item) => item.id === record.lessonId);
          if (!lesson || lesson.courseSlug === "sql") continue;

          const questionId = getQuestionIdForLesson(lesson);
          if (!questionId) continue;

          const parsed = parseQuestionId(questionId);
          if (!parsed || parsed.kind !== "mastery") continue;

          legacyLinkRecords.push(
            buildLegacyQuestionLinkRecord({
              legacyKind: "lesson",
              legacyId: record.lessonId,
              questionId,
              track: lesson.courseSlug,
              weekNumber: parsed.weekNumber,
              positionWithinWeek: parsed.positionWithinWeek,
              levelNumber: null,
            }),
          );

          if (!hasLessonActivity(record)) continue;

          lessonQuestionRecords.push(
            buildMasteryQuestionProgressRecord({
              questionId,
              track: lesson.courseSlug,
              weekNumber: parsed.weekNumber,
              positionWithinWeek: parsed.positionWithinWeek,
              legacySourceKind: "lesson",
              legacySourceId: record.lessonId,
              status: record.status,
              passed: record.masteryState === "passed" || record.masteryState === "mastered",
              score: record.score,
              attempts: record.attempts,
              draftCode: record.draftCode ?? "",
              validationMode: lesson.courseSlug === "python" ? "python-runtime" : "pyspark-structural",
              validatorVersion: getValidatorVersionForMasteryQuestion(questionId, lesson.courseSlug),
              lastOpenedAt: record.lastOpenedAt,
              lastRunAt: record.lastSubmissionAt ?? null,
              lastSubmissionAt: record.lastSubmissionAt ?? null,
              completedAt: record.completedAt,
            }),
          );
        }

        if (legacyLinkRecords.length > 0) {
          await legacyQuestionLinksTable.bulkPut(legacyLinkRecords);
        }

        if (sqlQuestionRecords.length > 0 || lessonQuestionRecords.length > 0) {
          await masteryQuestionProgressTable.bulkPut([
            ...sqlQuestionRecords,
            ...lessonQuestionRecords,
          ]);
        }
      });
    this.version(7)
      .stores({
        courses: "id, slug, createdAt, updatedAt",
        weeks: "id, courseSlug, weekNumber, monthNumber, levelNumber, createdAt, updatedAt",
        lessons: "id, courseSlug, weekId, createdAt, updatedAt",
        exercises: "id, courseSlug, difficulty, mode, createdAt, updatedAt",
        projects: "id, courseSlug, createdAt, updatedAt",
        datasets: "id, courseSlug, createdAt, updatedAt",
        topicMastery: "id, courseSlug, topic, score, updatedAt",
        courseProgress: "id, courseSlug, updatedAt",
        weekProgress: "id, courseSlug, weekId, status, updatedAt",
        lessonProgress: "id, courseSlug, lessonId, weekId, status, masteryState, updatedAt",
        materialLessonProgress: "id, courseSlug, lessonId, state, bookmarked, updatedAt",
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
        masteryQuestionProgress: "id, questionId, track, weekNumber, status, updatedAt",
        legacyQuestionLinks: "id, legacyKind, legacyId, questionId, track, updatedAt",
      })
      .upgrade(async (tx) => {
        const candyArcadeTable = tx.table<CandyArcadeLevelProgressRecord, string>("candyArcadeProgress");
        const records = await candyArcadeTable.toArray();
        for (const record of records) {
          await candyArcadeTable.put({
            ...record,
            sqlAttempts: record.sqlAttempts ?? 0,
            pythonAttempts: record.pythonAttempts ?? 0,
            pysparkAttempts: record.pysparkAttempts ?? 0,
            sqlPassedAt: record.sqlPassedAt ?? (record.sqlCompleted ? record.completedAt ?? null : null),
            pythonPassedAt: record.pythonPassedAt ?? (record.pythonCompleted ? record.completedAt ?? null : null),
            pysparkPassedAt: record.pysparkPassedAt ?? (record.pysparkCompleted ? record.completedAt ?? null : null),
            sqlValidatorVersion: record.sqlValidatorVersion ?? 0,
            pythonValidatorVersion: record.pythonValidatorVersion ?? 0,
            pysparkValidatorVersion: record.pysparkValidatorVersion ?? 0,
          });
        }
      });
    this.version(8)
      .stores({
        courses: "id, slug, createdAt, updatedAt",
        weeks: "id, courseSlug, weekNumber, monthNumber, levelNumber, createdAt, updatedAt",
        lessons: "id, courseSlug, weekId, createdAt, updatedAt",
        exercises: "id, courseSlug, difficulty, mode, createdAt, updatedAt",
        projects: "id, courseSlug, createdAt, updatedAt",
        datasets: "id, courseSlug, createdAt, updatedAt",
        topicMastery: "id, courseSlug, topic, score, updatedAt",
        courseProgress: "id, courseSlug, updatedAt",
        weekProgress: "id, courseSlug, weekId, status, updatedAt",
        lessonProgress: "id, courseSlug, lessonId, weekId, status, masteryState, updatedAt",
        materialLessonProgress: "id, courseSlug, lessonId, state, bookmarked, updatedAt",
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
        masteryQuestionProgress: "id, questionId, track, weekNumber, status, updatedAt",
        legacyQuestionLinks: "id, legacyKind, legacyId, questionId, track, updatedAt",
      })
      .upgrade(async (tx) => {
        const masteryQuestionProgressTable =
          tx.table<MasteryQuestionProgressRecord, string>("masteryQuestionProgress");
        const records = await masteryQuestionProgressTable.toArray();
        for (const record of records) {
          await masteryQuestionProgressTable.put({
            ...record,
            validatorVersion:
              record.validatorVersion ??
              getValidatorVersionForMasteryQuestion(record.questionId, record.track),
            updatedAt: nowIso(),
          });
        }
      });
  }
}

export const db = new MasteryDexie();

const nowIso = () => new Date().toISOString();

function buildMasteryQuestionProgressRecord(
  input: Omit<MasteryQuestionProgressRecord, "id" | "createdAt" | "updatedAt">,
): MasteryQuestionProgressRecord {
  return {
    id: `question-progress-${input.questionId}`,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...input,
  };
}

function buildLegacyQuestionLinkRecord(
  input: Omit<LegacyQuestionLinkRecord, "id" | "createdAt" | "updatedAt">,
): LegacyQuestionLinkRecord {
  return {
    id: `legacy-question-link-${input.legacyKind}-${input.legacyId}`,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...input,
  };
}

function hasSqlTaskActivity(record: SqlTaskProgressRecord, starterSql: string) {
  return (
    record.completed ||
    record.attempts > 0 ||
    Boolean(record.lastRunAt) ||
    record.draftSql.trim() !== starterSql.trim()
  );
}

function hasLessonActivity(record: LessonProgressRecord) {
  return (
    record.attempts > 0 ||
    Boolean(record.lastOpenedAt) ||
    Boolean(record.lastSubmissionAt) ||
    Boolean(record.passedAt) ||
    Boolean(record.draftCode?.trim()) ||
    record.masteryState === "passed" ||
    record.masteryState === "mastered" ||
    record.status === "completed" ||
    record.status === "in_progress"
  );
}

function getQuestionValidationMode(courseSlug: CourseSlug) {
  return courseSlug === "python" ? "python-runtime" : "pyspark-structural";
}

function getValidatorVersionForMasteryQuestion(questionId: string, track: CourseSlug) {
  const parsed = parseQuestionId(questionId);
  if (track === "python" && parsed?.kind === "mastery" && parsed.weekNumber === 1) {
    return PYTHON_WEEK_ONE_VALIDATOR_VERSION;
  }

  if (track === "pyspark" && parsed?.kind === "mastery" && parsed.weekNumber === 1) {
    return PYSPARK_WEEK_ONE_VALIDATOR_VERSION;
  }

  return 0;
}

function buildPythonWeekOneQuestionProgressRecord(
  question: (typeof pythonWeekOneQuestions)[number],
  lessonProgress: LessonProgressRecord | undefined,
) {
  return buildMasteryQuestionProgressRecord({
    questionId: question.id,
    track: "python",
    weekNumber: question.weekNumber,
    positionWithinWeek: question.positionWithinWeek,
    legacySourceKind: "lesson",
    legacySourceId: question.lessonId,
    status: lessonProgress?.status ?? (question.positionWithinWeek === 1 ? "unlocked" : "locked"),
    passed:
      lessonProgress?.masteryState === "passed" || lessonProgress?.masteryState === "mastered",
    score: lessonProgress?.score ?? 0,
    attempts: lessonProgress?.attempts ?? 0,
    draftCode: lessonProgress?.draftCode ?? "",
    validationMode: "python-runtime",
    validatorVersion: question.validatorVersion,
    lastOpenedAt: lessonProgress?.lastOpenedAt ?? null,
    lastRunAt: lessonProgress?.lastSubmissionAt ?? null,
    lastSubmissionAt: lessonProgress?.lastSubmissionAt ?? null,
    completedAt: lessonProgress?.completedAt ?? null,
  });
}

async function ensurePythonWeekOneQuestionProgress() {
  const existingQuestionRecords = await db.masteryQuestionProgress.where("track").equals("python").toArray();
  const existingQuestionById = new Map(
    existingQuestionRecords.map((record) => [record.questionId, record]),
  );
  const existingLegacyLinks = await db.legacyQuestionLinks.where("track").equals("python").toArray();
  const existingLegacyLinkIds = new Set(existingLegacyLinks.map((record) => record.legacyId));
  const lessonProgressRecords = await db.lessonProgress.where("courseSlug").equals("python").toArray();
  const lessonProgressById = new Map(
    lessonProgressRecords.map((record) => [record.lessonId, record]),
  );

  const nextQuestionRecords: MasteryQuestionProgressRecord[] = [];
  const nextLegacyLinks: LegacyQuestionLinkRecord[] = [];

  for (const question of pythonWeekOneQuestions) {
    const existingQuestion = existingQuestionById.get(question.id);
    const expectedQuestion = buildPythonWeekOneQuestionProgressRecord(
      question,
      lessonProgressById.get(question.lessonId),
    );
    if (!existingQuestion) {
      nextQuestionRecords.push(expectedQuestion);
    } else if (
      existingQuestion.status !== expectedQuestion.status ||
      existingQuestion.passed !== expectedQuestion.passed ||
      existingQuestion.score !== expectedQuestion.score ||
      existingQuestion.attempts !== expectedQuestion.attempts ||
      existingQuestion.draftCode !== expectedQuestion.draftCode ||
      existingQuestion.lastOpenedAt !== expectedQuestion.lastOpenedAt ||
      existingQuestion.lastRunAt !== expectedQuestion.lastRunAt ||
      existingQuestion.lastSubmissionAt !== expectedQuestion.lastSubmissionAt ||
      existingQuestion.completedAt !== expectedQuestion.completedAt ||
      existingQuestion.validatorVersion !== question.validatorVersion
    ) {
      nextQuestionRecords.push({
        ...existingQuestion,
        status: expectedQuestion.status,
        passed: expectedQuestion.passed,
        score: expectedQuestion.score,
        attempts: expectedQuestion.attempts,
        draftCode: expectedQuestion.draftCode,
        validationMode: expectedQuestion.validationMode,
        validatorVersion: question.validatorVersion,
        lastOpenedAt: expectedQuestion.lastOpenedAt,
        lastRunAt: expectedQuestion.lastRunAt,
        lastSubmissionAt: expectedQuestion.lastSubmissionAt,
        completedAt: expectedQuestion.completedAt,
        updatedAt: nowIso(),
      });
    }

    if (!existingLegacyLinkIds.has(question.lessonId)) {
      nextLegacyLinks.push(
        buildLegacyQuestionLinkRecord({
          legacyKind: "lesson",
          legacyId: question.lessonId,
          questionId: question.id,
          track: "python",
          weekNumber: question.weekNumber,
          positionWithinWeek: question.positionWithinWeek,
          levelNumber: null,
        }),
      );
    }
  }

  if (nextQuestionRecords.length === 0 && nextLegacyLinks.length === 0) {
    return;
  }

  await db.transaction("rw", db.masteryQuestionProgress, db.legacyQuestionLinks, async () => {
    if (nextQuestionRecords.length > 0) {
      await db.masteryQuestionProgress.bulkPut(nextQuestionRecords);
    }
    if (nextLegacyLinks.length > 0) {
      await db.legacyQuestionLinks.bulkPut(nextLegacyLinks);
    }
  });
}

function buildPysparkWeekOneQuestionProgressRecord(
  question: (typeof pysparkWeekOneQuestions)[number],
  lessonProgress: LessonProgressRecord | undefined,
) {
  return buildMasteryQuestionProgressRecord({
    questionId: question.id,
    track: "pyspark",
    weekNumber: question.weekNumber,
    positionWithinWeek: question.positionWithinWeek,
    legacySourceKind: "lesson",
    legacySourceId: question.lessonId,
    status: lessonProgress?.status ?? (question.positionWithinWeek === 1 ? "unlocked" : "locked"),
    passed:
      lessonProgress?.masteryState === "passed" || lessonProgress?.masteryState === "mastered",
    score: lessonProgress?.score ?? 0,
    attempts: lessonProgress?.attempts ?? 0,
    draftCode: lessonProgress?.draftCode ?? "",
    validationMode:
      lessonProgress?.evidenceType === "pyspark-runtime"
        ? "pyspark-runtime"
        : "pyspark-structural",
    validatorVersion: question.validatorVersion,
    lastOpenedAt: lessonProgress?.lastOpenedAt ?? null,
    lastRunAt: lessonProgress?.lastSubmissionAt ?? null,
    lastSubmissionAt: lessonProgress?.lastSubmissionAt ?? null,
    completedAt: lessonProgress?.completedAt ?? null,
  });
}

async function ensurePysparkWeekOneQuestionProgress() {
  const existingQuestionRecords = await db.masteryQuestionProgress.where("track").equals("pyspark").toArray();
  const existingQuestionById = new Map(
    existingQuestionRecords.map((record) => [record.questionId, record]),
  );
  const existingLegacyLinks = await db.legacyQuestionLinks.where("track").equals("pyspark").toArray();
  const existingLegacyLinkIds = new Set(existingLegacyLinks.map((record) => record.legacyId));
  const lessonProgressRecords = await db.lessonProgress.where("courseSlug").equals("pyspark").toArray();
  const lessonProgressById = new Map(
    lessonProgressRecords.map((record) => [record.lessonId, record]),
  );

  const nextQuestionRecords: MasteryQuestionProgressRecord[] = [];
  const nextLegacyLinks: LegacyQuestionLinkRecord[] = [];

  for (const question of pysparkWeekOneQuestions) {
    const existingQuestion = existingQuestionById.get(question.id);
    const expectedQuestion = buildPysparkWeekOneQuestionProgressRecord(
      question,
      lessonProgressById.get(question.lessonId),
    );
    if (!existingQuestion) {
      nextQuestionRecords.push(expectedQuestion);
    } else if (
      existingQuestion.status !== expectedQuestion.status ||
      existingQuestion.passed !== expectedQuestion.passed ||
      existingQuestion.score !== expectedQuestion.score ||
      existingQuestion.attempts !== expectedQuestion.attempts ||
      existingQuestion.draftCode !== expectedQuestion.draftCode ||
      existingQuestion.lastOpenedAt !== expectedQuestion.lastOpenedAt ||
      existingQuestion.lastRunAt !== expectedQuestion.lastRunAt ||
      existingQuestion.lastSubmissionAt !== expectedQuestion.lastSubmissionAt ||
      existingQuestion.completedAt !== expectedQuestion.completedAt ||
      existingQuestion.validatorVersion !== question.validatorVersion
    ) {
      nextQuestionRecords.push({
        ...existingQuestion,
        status: expectedQuestion.status,
        passed: expectedQuestion.passed,
        score: expectedQuestion.score,
        attempts: expectedQuestion.attempts,
        draftCode: expectedQuestion.draftCode,
        validationMode: expectedQuestion.validationMode,
        validatorVersion: question.validatorVersion,
        lastOpenedAt: expectedQuestion.lastOpenedAt,
        lastRunAt: expectedQuestion.lastRunAt,
        lastSubmissionAt: expectedQuestion.lastSubmissionAt,
        completedAt: expectedQuestion.completedAt,
        updatedAt: nowIso(),
      });
    }

    if (!existingLegacyLinkIds.has(question.lessonId)) {
      nextLegacyLinks.push(
        buildLegacyQuestionLinkRecord({
          legacyKind: "lesson",
          legacyId: question.lessonId,
          questionId: question.id,
          track: "pyspark",
          weekNumber: question.weekNumber,
          positionWithinWeek: question.positionWithinWeek,
          levelNumber: null,
        }),
      );
    }
  }

  if (nextQuestionRecords.length === 0 && nextLegacyLinks.length === 0) {
    return;
  }

  await db.transaction("rw", db.masteryQuestionProgress, db.legacyQuestionLinks, async () => {
    if (nextQuestionRecords.length > 0) {
      await db.masteryQuestionProgress.bulkPut(nextQuestionRecords);
    }
    if (nextLegacyLinks.length > 0) {
      await db.legacyQuestionLinks.bulkPut(nextLegacyLinks);
    }
  });
}

const buildWeekLockReason = (weekNumber: number, courseSlug: string) => {
  if (weekNumber === 1) return null;
  if (courseSlug === "sql" && weekNumber === 2) return sqlWeekOneUnlockMessage;
  return `Complete Week ${weekNumber - 1} to unlock this week.`;
};

const courseProgressSeed = (courseSlug: CourseSlug): CourseProgressRecord => {
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
    const weekLessons = lessons.filter((item) => item.weekId === lesson.weekId);
    const lessonIndex = weekLessons.findIndex((item) => item.id === lesson.id);
    const unlocked =
      week?.weekNumber === 1 &&
      (lesson.courseSlug === "sql" || lessonIndex === 0);
    return {
      id: `lesson-progress-${lesson.id}`,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      courseSlug: lesson.courseSlug,
      lessonId: lesson.id,
      weekId: lesson.weekId,
      status: unlocked ? "unlocked" : "locked",
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
    };
  });

const materialLessonProgressSeeds = (): MaterialLessonProgressRecord[] =>
  lessons.map((lesson) => ({
    id: `material-progress-${lesson.id}`,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    courseSlug: lesson.courseSlug,
    lessonId: lesson.id,
    state: "not_started",
    bookmarked: false,
    lastOpenedAt: null,
    completedAt: null,
  }));

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
    sqlAttempts: 0,
    pythonAttempts: 0,
    pysparkAttempts: 0,
    sqlPassedAt: null,
    pythonPassedAt: null,
    pysparkPassedAt: null,
    sqlValidatorVersion: 0,
    pythonValidatorVersion: 0,
    pysparkValidatorVersion: 0,
  }));

const revisionSeeds = (): RevisionQueueRecord[] => {
  return [];
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
    await ensureCourseProgressRecords();
    await ensureWeekProgressRecords();
    await ensureLessonProgressRecords();
    await ensureMaterialLessonProgressRecords();
    await ensurePythonWeekOneSequentialLessonProgress();
    await ensurePysparkWeekOneSequentialLessonProgress();
    await ensureWeekProgressLocks();
    await ensureSqlTaskProgress();
    await reconcileSqlWeekUnlocks();
    await ensureGameLevelProgress();
    await ensureCandyArcadeProgress();
    await ensurePythonWeekOneQuestionProgress();
    await ensurePysparkWeekOneQuestionProgress();
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
      db.materialLessonProgress,
      db.revisionQueue,
      db.errorLog,
      db.settings,
      db.sqlTaskProgress,
      db.gameLevelProgress,
      db.candyArcadeProgress,
      db.masteryQuestionProgress,
      db.legacyQuestionLinks,
    ],
    async () => {
      await db.courses.bulkPut(courses);
      await db.weeks.bulkPut(allWeeks);
      await db.lessons.bulkPut(lessons);
      await db.exercises.bulkPut(exercises);
      await db.projects.bulkPut(projects);
      await db.datasets.bulkPut(datasets);
      await db.topicMastery.bulkPut(topicMasterySeeds);
      await db.courseProgress.bulkPut(courses.map((course) => courseProgressSeed(course.slug)));
      await db.weekProgress.bulkPut(weekProgressSeeds());
      await db.lessonProgress.bulkPut(lessonProgressSeeds());
      await db.materialLessonProgress.bulkPut(materialLessonProgressSeeds());
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

  await ensurePythonWeekOneQuestionProgress();
  await ensurePysparkWeekOneSequentialLessonProgress();
  await ensurePysparkWeekOneQuestionProgress();
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

async function ensureCourseProgressRecords() {
  const existing = await db.courseProgress.toArray();
  const existingSlugs = new Set(existing.map((record) => record.courseSlug));
  const missing = courses
    .filter((course) => !existingSlugs.has(course.slug))
    .map((course) => courseProgressSeed(course.slug));

  if (missing.length > 0) {
    await db.courseProgress.bulkPut(missing);
  }
}

async function ensureWeekProgressRecords() {
  const existing = await db.weekProgress.toArray();
  const existingIds = new Set(existing.map((record) => record.weekId));
  const missing = weekProgressSeeds().filter((record) => !existingIds.has(record.weekId));

  if (missing.length > 0) {
    await db.weekProgress.bulkPut(missing);
  }
}

async function ensureLessonProgressRecords() {
  const existing = await db.lessonProgress.toArray();
  const existingIds = new Set(existing.map((record) => record.lessonId));
  const missing = lessonProgressSeeds().filter((record) => !existingIds.has(record.lessonId));

  if (missing.length > 0) {
    await db.lessonProgress.bulkPut(missing);
  }
}

async function ensureMaterialLessonProgressRecords() {
  const existing = await db.materialLessonProgress.toArray();
  const existingIds = new Set(existing.map((record) => record.lessonId));
  const missing = materialLessonProgressSeeds().filter((record) => !existingIds.has(record.lessonId));

  if (missing.length > 0) {
    await db.materialLessonProgress.bulkPut(missing);
  }
}

async function ensurePythonWeekOneSequentialLessonProgress() {
  const lessonProgressRecords = await db.lessonProgress.where("courseSlug").equals("python").toArray();
  const progressByLessonId = new Map(
    lessonProgressRecords.map((record) => [record.lessonId, record]),
  );
  const highestPassedIndex = pythonWeekOneQuestions.reduce((maxIndex, question, index) => {
    const progress = progressByLessonId.get(question.lessonId);
    if (
      progress &&
      (progress.masteryState === "passed" ||
        progress.masteryState === "mastered" ||
        progress.status === "completed")
    ) {
      return index;
    }
    return maxIndex;
  }, -1);

  const nextUnlockedIndex =
    highestPassedIndex >= pythonWeekOneQuestions.length - 1
      ? -1
      : highestPassedIndex + 1;

  const updates: LessonProgressRecord[] = [];

  for (const [index, question] of pythonWeekOneQuestions.entries()) {
    const progress = progressByLessonId.get(question.lessonId);
    if (!progress) {
      continue;
    }

    const nextStatus =
      index <= highestPassedIndex
        ? "completed"
        : index === nextUnlockedIndex
          ? progress.status === "in_progress"
            ? "in_progress"
            : "unlocked"
          : "locked";

    if (progress.status !== nextStatus) {
      updates.push({
        ...progress,
        status: nextStatus,
        updatedAt: nowIso(),
      });
    }
  }

  if (updates.length > 0) {
    await db.lessonProgress.bulkPut(updates);
  }
}

async function ensurePysparkWeekOneSequentialLessonProgress() {
  const lessonProgressRecords = await db.lessonProgress.where("courseSlug").equals("pyspark").toArray();
  const progressByLessonId = new Map(
    lessonProgressRecords.map((record) => [record.lessonId, record]),
  );
  const highestPassedIndex = pysparkWeekOneQuestions.reduce((maxIndex, question, index) => {
    const progress = progressByLessonId.get(question.lessonId);
    if (
      progress &&
      (progress.masteryState === "passed" ||
        progress.masteryState === "mastered" ||
        progress.status === "completed")
    ) {
      return index;
    }
    return maxIndex;
  }, -1);

  const nextUnlockedIndex =
    highestPassedIndex >= pysparkWeekOneQuestions.length - 1
      ? -1
      : highestPassedIndex + 1;

  const updates: LessonProgressRecord[] = [];

  for (const [index, question] of pysparkWeekOneQuestions.entries()) {
    const progress = progressByLessonId.get(question.lessonId);
    if (!progress) {
      continue;
    }

    const nextStatus =
      index <= highestPassedIndex
        ? "completed"
        : index === nextUnlockedIndex
          ? progress.status === "in_progress"
            ? "in_progress"
            : "unlocked"
          : "locked";

    if (progress.status !== nextStatus) {
      updates.push({
        ...progress,
        status: nextStatus,
        updatedAt: nowIso(),
      });
    }
  }

  if (updates.length > 0) {
    await db.lessonProgress.bulkPut(updates);
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

async function syncQuestionProgressFromLessonRecord(
  lessonId: string,
  progressOverride?: LessonProgressRecord,
) {
  const lesson = await db.lessons.get(lessonId);
  if (!lesson || lesson.courseSlug === "sql") return;

  const progress = progressOverride ?? (await db.lessonProgress.get(`lesson-progress-${lessonId}`));
  if (!progress) return;

  const questionId = getQuestionIdForLesson(lesson);
  if (!questionId) return;

  const parsed = parseQuestionId(questionId);
  if (!parsed || parsed.kind !== "mastery") return;

  const questionProgress = buildMasteryQuestionProgressRecord({
    questionId,
    track: lesson.courseSlug,
    weekNumber: parsed.weekNumber,
    positionWithinWeek: parsed.positionWithinWeek,
    legacySourceKind: "lesson",
    legacySourceId: lessonId,
    status: progress.status,
    passed: progress.masteryState === "passed" || progress.masteryState === "mastered",
    score: progress.score,
    attempts: progress.attempts,
    draftCode: progress.draftCode ?? "",
    validationMode:
      lesson.courseSlug === "pyspark" && progress.evidenceType === "pyspark-runtime"
        ? "pyspark-runtime"
        : getQuestionValidationMode(lesson.courseSlug),
    validatorVersion: getValidatorVersionForMasteryQuestion(questionId, lesson.courseSlug),
    lastOpenedAt: progress.lastOpenedAt ?? null,
    lastRunAt: progress.lastSubmissionAt ?? null,
    lastSubmissionAt: progress.lastSubmissionAt ?? null,
    completedAt: progress.completedAt,
  });

  const legacyLink = buildLegacyQuestionLinkRecord({
    legacyKind: "lesson",
    legacyId: lessonId,
    questionId,
    track: lesson.courseSlug,
    weekNumber: parsed.weekNumber,
    positionWithinWeek: parsed.positionWithinWeek,
    levelNumber: null,
  });

  await db.transaction("rw", db.masteryQuestionProgress, db.legacyQuestionLinks, async () => {
    await db.masteryQuestionProgress.put(questionProgress);
    await db.legacyQuestionLinks.put(legacyLink);
  });
}

async function syncQuestionProgressFromSqlTaskRecord(
  taskId: string,
  progressOverride?: SqlTaskProgressRecord,
) {
  const task = sqlAllTasks.find((item) => item.id === taskId);
  if (!task) return;

  const progress = progressOverride ?? (await db.sqlTaskProgress.get(`sql-task-progress-${taskId}`));
  if (!progress) return;

  const questionId = getQuestionIdForSqlTask(task);
  if (!questionId) return;

  const parsed = parseQuestionId(questionId);
  if (!parsed || parsed.kind !== "mastery") return;

  const questionProgress = buildMasteryQuestionProgressRecord({
    questionId,
    track: "sql",
    weekNumber: parsed.weekNumber,
    positionWithinWeek: parsed.positionWithinWeek,
    legacySourceKind: "sql-task",
    legacySourceId: taskId,
    status: progress.completed ? "completed" : progress.unlocked ? "in_progress" : "locked",
    passed: progress.completed,
    score: progress.completed ? 100 : 0,
    attempts: progress.attempts,
    draftCode: progress.draftSql,
    validationMode: "sql-runtime",
    validatorVersion: 0,
    lastOpenedAt: null,
    lastRunAt: progress.lastRunAt,
    lastSubmissionAt: progress.lastRunAt,
    completedAt: progress.completedAt,
  });

  const legacyLink = buildLegacyQuestionLinkRecord({
    legacyKind: "sql-task",
    legacyId: taskId,
    questionId,
    track: "sql",
    weekNumber: parsed.weekNumber,
    positionWithinWeek: parsed.positionWithinWeek,
    levelNumber: null,
  });

  await db.transaction("rw", db.masteryQuestionProgress, db.legacyQuestionLinks, async () => {
    await db.masteryQuestionProgress.put(questionProgress);
    await db.legacyQuestionLinks.put(legacyLink);
  });
}

export async function logStudyMinutes(courseSlug: CourseSlug, minutes: number) {
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
  const materialProgress = await db.materialLessonProgress.get(`material-progress-${lessonId}`);
  if (!progress || !courseProgress) return;

  let nextLessonProgressRecord: LessonProgressRecord | null = null;

  await db.transaction("rw", db.lessonProgress, db.courseProgress, db.materialLessonProgress, async () => {
    nextLessonProgressRecord = {
      ...progress,
      status: progress.status === "unlocked" ? "in_progress" : progress.status,
      masteryState: progress.masteryState === "not_started" ? "reading" : progress.masteryState,
      lastOpenedAt: nowIso(),
      updatedAt: nowIso(),
    };

    await db.lessonProgress.put({
      ...nextLessonProgressRecord,
    });
    if (materialProgress) {
      await db.materialLessonProgress.put({
        ...materialProgress,
        state: materialProgress.state === "not_started" ? "reading" : materialProgress.state,
        lastOpenedAt: nowIso(),
        updatedAt: nowIso(),
      });
    }
    await db.courseProgress.put({
      ...courseProgress,
      currentWeekId: lesson.weekId,
      currentLessonId: lesson.id,
      lastActivityAt: nowIso(),
      updatedAt: nowIso(),
    });
  });

  if (nextLessonProgressRecord) {
    await syncQuestionProgressFromLessonRecord(lessonId, nextLessonProgressRecord);
  }
}

export async function saveLessonDraft(lessonId: string, draftCode: string) {
  const progress = await db.lessonProgress.get(`lesson-progress-${lessonId}`);
  if (!progress) return;

  const nextProgress = {
    ...progress,
    draftCode,
    updatedAt: nowIso(),
  };

  await db.lessonProgress.put(nextProgress);
  await syncQuestionProgressFromLessonRecord(lessonId, nextProgress);
}

async function refreshPythonQuestionValidatorVersion(questionId: string) {
  const question = getPythonWeekOneQuestionById(questionId);
  if (!question) {
    return;
  }

  const progress = await db.masteryQuestionProgress.get(`question-progress-${questionId}`);
  if (!progress || progress.validatorVersion === question.validatorVersion) {
    return;
  }

  await db.masteryQuestionProgress.put({
    ...progress,
    validatorVersion: question.validatorVersion,
    updatedAt: nowIso(),
  });
}

async function refreshPysparkQuestionValidatorVersion(questionId: string) {
  const question = getPysparkWeekOneQuestionById(questionId);
  if (!question) {
    return;
  }

  const progress = await db.masteryQuestionProgress.get(`question-progress-${questionId}`);
  if (!progress || progress.validatorVersion === question.validatorVersion) {
    return;
  }

  await db.masteryQuestionProgress.put({
    ...progress,
    validatorVersion: question.validatorVersion,
    updatedAt: nowIso(),
  });
}

export async function touchPythonQuestion(questionId: string) {
  const question = getPythonWeekOneQuestionById(questionId);
  if (!question) {
    return;
  }

  await ensurePythonWeekOneQuestionProgress();
  const questionProgress = await db.masteryQuestionProgress.get(`question-progress-${questionId}`);
  const lessonProgress = await db.lessonProgress.get(`lesson-progress-${question.lessonId}`);

  if (questionProgress?.passed || questionProgress?.status === "completed") {
    await db.transaction("rw", db.masteryQuestionProgress, db.lessonProgress, async () => {
      if (questionProgress) {
        await db.masteryQuestionProgress.put({
          ...questionProgress,
          lastOpenedAt: nowIso(),
          updatedAt: nowIso(),
        });
      }

      if (lessonProgress) {
        await db.lessonProgress.put({
          ...lessonProgress,
          lastOpenedAt: nowIso(),
          updatedAt: nowIso(),
        });
      }
    });
    await refreshPythonQuestionValidatorVersion(questionId);
    return;
  }

  await touchLesson(question.lessonId);
  await refreshPythonQuestionValidatorVersion(questionId);
}

export async function savePythonQuestionDraft(questionId: string, draftCode: string) {
  const question = getPythonWeekOneQuestionById(questionId);
  if (!question) {
    return;
  }

  await ensurePythonWeekOneQuestionProgress();
  await saveLessonDraft(question.lessonId, draftCode);
  await refreshPythonQuestionValidatorVersion(questionId);
}

export async function touchPysparkQuestion(questionId: string) {
  const question = getPysparkWeekOneQuestionById(questionId);
  if (!question) {
    return;
  }

  await ensurePysparkWeekOneQuestionProgress();
  const questionProgress = await db.masteryQuestionProgress.get(`question-progress-${questionId}`);
  const lessonProgress = await db.lessonProgress.get(`lesson-progress-${question.lessonId}`);

  if (questionProgress?.passed || questionProgress?.status === "completed") {
    await db.transaction("rw", db.masteryQuestionProgress, db.lessonProgress, async () => {
      if (questionProgress) {
        await db.masteryQuestionProgress.put({
          ...questionProgress,
          lastOpenedAt: nowIso(),
          updatedAt: nowIso(),
        });
      }

      if (lessonProgress) {
        await db.lessonProgress.put({
          ...lessonProgress,
          lastOpenedAt: nowIso(),
          updatedAt: nowIso(),
        });
      }
    });
    await refreshPysparkQuestionValidatorVersion(questionId);
    return;
  }

  await touchLesson(question.lessonId);
  await refreshPysparkQuestionValidatorVersion(questionId);
}

export async function savePysparkQuestionDraft(questionId: string, draftCode: string) {
  const question = getPysparkWeekOneQuestionById(questionId);
  if (!question) {
    return;
  }

  await ensurePysparkWeekOneQuestionProgress();
  await saveLessonDraft(question.lessonId, draftCode);
  await refreshPysparkQuestionValidatorVersion(questionId);
}

export async function toggleMaterialBookmark(lessonId: string) {
  const progress = await db.materialLessonProgress.get(`material-progress-${lessonId}`);
  if (!progress) return;

  await db.materialLessonProgress.put({
    ...progress,
    bookmarked: !progress.bookmarked,
    updatedAt: nowIso(),
  });
}

export async function markMaterialLessonCompleted(lessonId: string) {
  const materialProgress = await db.materialLessonProgress.get(`material-progress-${lessonId}`);
  const lessonProgress = await db.lessonProgress.get(`lesson-progress-${lessonId}`);
  if (!materialProgress || !lessonProgress) return;

  await db.transaction("rw", db.materialLessonProgress, db.lessonProgress, async () => {
    await db.materialLessonProgress.put({
      ...materialProgress,
      state: "completed",
      completedAt: materialProgress.completedAt ?? nowIso(),
      lastOpenedAt: materialProgress.lastOpenedAt ?? nowIso(),
      updatedAt: nowIso(),
    });
    await db.lessonProgress.put({
      ...lessonProgress,
      masteryState:
        lessonProgress.masteryState === "not_started" || lessonProgress.masteryState === "reading"
          ? "practiced"
          : lessonProgress.masteryState,
      readingCompletedAt: lessonProgress.readingCompletedAt ?? nowIso(),
      updatedAt: nowIso(),
    });
  });
}

export async function saveLessonEvaluation(
  lessonId: string,
  {
    passed,
    score,
    feedback,
    evidenceType,
  }: {
    passed: boolean;
    score: number;
    feedback: string;
    evidenceType: Exclude<LessonProgressRecord["evidenceType"], "manual-legacy" | "reading" | null>;
  },
) {
  const lesson = await db.lessons.get(lessonId);
  if (!lesson) {
    return { nextLessonId: null, nextWeekId: null };
  }

  const progress = await db.lessonProgress.get(`lesson-progress-${lessonId}`);
  if (!progress) {
    return { nextLessonId: null, nextWeekId: null };
  }

  const attemptRecord: ExerciseAttemptRecord = {
    id: `attempt-${lessonId}-${Date.now()}`,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    courseSlug: lesson.courseSlug,
    exerciseId: lessonId,
    score,
    isCorrect: passed,
    hintsUsed: progress.hintsUsed,
    timeSpent: progress.timeSpent,
    submission: progress.draftCode ?? "",
  };

  await db.transaction("rw", db.lessonProgress, db.exerciseAttempts, db.revisionQueue, async () => {
    await db.exerciseAttempts.put(attemptRecord);
    await db.lessonProgress.put({
      ...progress,
      attempts: progress.attempts + 1,
      score,
      lastFeedback: feedback,
      lastSubmissionAt: nowIso(),
      evidenceType: passed ? evidenceType : progress.evidenceType,
      masteryState: passed ? "passed" : progress.masteryState === "not_started" ? "practiced" : progress.masteryState,
      passedAt: passed ? progress.passedAt ?? nowIso() : progress.passedAt ?? null,
      updatedAt: nowIso(),
    });

    if (passed) {
      const existingReview = await db.revisionQueue.get(`revision-${lessonId}`);
      if (!existingReview) {
        await db.revisionQueue.put(
          createInitialReviewRecord(lesson.courseSlug, lesson.id, lesson.title, new Date()),
        );
      }
    }
  });

  if (passed) {
    await syncQuestionProgressFromLessonRecord(lessonId);
    return completeLesson(lessonId);
  }

  await syncQuestionProgressFromLessonRecord(lessonId);

  return { nextLessonId: null, nextWeekId: null };
}

export async function savePythonQuestionEvaluation(
  questionId: string,
  {
    passed,
    score,
    feedback,
  }: {
    passed: boolean;
    score: number;
    feedback: string;
  },
) {
  const question = getPythonWeekOneQuestionById(questionId);
  if (!question) {
    return { nextQuestionId: null, nextWeekId: null, nextLessonId: null };
  }

  await ensurePythonWeekOneQuestionProgress();
  const progression = await saveLessonEvaluation(question.lessonId, {
    passed,
    score,
    feedback,
    evidenceType: "python-runtime",
  });
  await refreshPythonQuestionValidatorVersion(questionId);

  const nextLesson = progression.nextLessonId
    ? getLessonById(progression.nextLessonId)
    : null;
  const nextQuestionId = nextLesson ? getQuestionIdForLesson(nextLesson) : null;

  if (nextQuestionId) {
    await refreshPythonQuestionValidatorVersion(nextQuestionId);
  }

  return {
    ...progression,
    nextQuestionId,
  };
}

export async function savePysparkQuestionEvaluation(
  questionId: string,
  {
    passed,
    score,
    feedback,
    evidenceType = "pyspark-structural",
  }: {
    passed: boolean;
    score: number;
    feedback: string;
    evidenceType?: "pyspark-structural" | "pyspark-runtime";
  },
) {
  const question = getPysparkWeekOneQuestionById(questionId);
  if (!question) {
    return { nextQuestionId: null, nextWeekId: null, nextLessonId: null };
  }

  await ensurePysparkWeekOneQuestionProgress();
  const progression = await saveLessonEvaluation(question.lessonId, {
    passed,
    score,
    feedback,
    evidenceType,
  });
  await refreshPysparkQuestionValidatorVersion(questionId);

  const nextLesson = progression.nextLessonId
    ? getLessonById(progression.nextLessonId)
    : null;
  const nextQuestionId = nextLesson ? getQuestionIdForLesson(nextLesson) : null;

  if (nextQuestionId) {
    await refreshPysparkQuestionValidatorVersion(nextQuestionId);
  }

  return {
    ...progression,
    nextQuestionId,
  };
}

export async function completeLesson(lessonId: string) {
  const lesson = await db.lessons.get(lessonId);
  if (!lesson) {
    return { nextLessonId: null, nextWeekId: null };
  }

  const progress = await db.lessonProgress.get(`lesson-progress-${lessonId}`);
  const courseProgress = await db.courseProgress.get(`course-progress-${lesson.courseSlug}`);
  if (!progress || !courseProgress) {
    return { nextLessonId: null, nextWeekId: null };
  }

  const courseWeeks = getWeeksByCourse(lesson.courseSlug);
  const currentWeekIndex = courseWeeks.findIndex((week) => week.id === lesson.weekId);
  const nextWeek = currentWeekIndex >= 0 ? courseWeeks[currentWeekIndex + 1] ?? null : null;
  const weekLessons = lessons.filter((item) => item.weekId === lesson.weekId);
  const lessonIndex = weekLessons.findIndex((item) => item.id === lessonId);
  const nextLesson = lessonIndex >= 0 ? weekLessons[lessonIndex + 1] ?? null : null;
  const firstLessonOfNextWeek = nextWeek
    ? lessons.find((item) => item.weekId === nextWeek.id) ?? null
    : null;

  let nextLessonId: string | null = nextLesson?.id ?? null;
  let nextWeekId: string | null = null;

  await db.transaction("rw", db.lessonProgress, db.weekProgress, db.courseProgress, async () => {
    const lessonProgressRecords = await db.lessonProgress
      .where("courseSlug")
      .equals(lesson.courseSlug)
      .toArray();

    const updatedCurrentLesson = {
      ...progress,
      status: "completed" as const,
      score: Math.max(progress.score, 70),
      attempts: Math.max(progress.attempts, 1),
      completedAt: progress.completedAt ?? nowIso(),
      lastOpenedAt: progress.lastOpenedAt ?? nowIso(),
      updatedAt: nowIso(),
    };

    await db.lessonProgress.put(updatedCurrentLesson);

    if (nextLesson) {
      const nextLessonProgress = await db.lessonProgress.get(`lesson-progress-${nextLesson.id}`);
      if (nextLessonProgress && nextLessonProgress.status === "locked") {
        await db.lessonProgress.put({
          ...nextLessonProgress,
          status: "unlocked",
          updatedAt: nowIso(),
        });
      }
    }

    const updatedLessonRecords = lessonProgressRecords.map((record) =>
      record.lessonId === lessonId ? updatedCurrentLesson : record,
    );

    const weekLessonIds = new Set(weekLessons.map((item) => item.id));
    const completedWeekLessons = updatedLessonRecords.filter(
      (record) => weekLessonIds.has(record.lessonId) && record.status === "completed",
    ).length;
    const weekScore = Math.round((completedWeekLessons / weekLessons.length) * 100);
    const currentWeekProgress = await db.weekProgress.get(`week-progress-${lesson.weekId}`);

    if (currentWeekProgress) {
      await db.weekProgress.put({
        ...currentWeekProgress,
        status: completedWeekLessons === weekLessons.length ? "completed" : "in_progress",
        score: weekScore,
        lockReason: null,
        updatedAt: nowIso(),
      });
    }

    if (completedWeekLessons === weekLessons.length) {
      if (nextWeek) {
        const nextWeekProgress = await db.weekProgress.get(`week-progress-${nextWeek.id}`);
        if (nextWeekProgress && nextWeekProgress.status === "locked") {
          await db.weekProgress.put({
            ...nextWeekProgress,
            status: "unlocked",
            lockReason: null,
            updatedAt: nowIso(),
          });
        }

        if (firstLessonOfNextWeek) {
          const firstLessonProgress = await db.lessonProgress.get(`lesson-progress-${firstLessonOfNextWeek.id}`);
          if (firstLessonProgress && firstLessonProgress.status === "locked") {
            await db.lessonProgress.put({
              ...firstLessonProgress,
              status: "unlocked",
              updatedAt: nowIso(),
            });
          }
        }

        nextWeekId = nextWeek.id;
        nextLessonId = firstLessonOfNextWeek?.id ?? null;
      } else {
        nextLessonId = null;
        nextWeekId = null;
      }
    }

    const courseLessonIds = new Set(lessons.filter((item) => item.courseSlug === lesson.courseSlug).map((item) => item.id));
    const completedCourseLessons = updatedLessonRecords.filter(
      (record) => courseLessonIds.has(record.lessonId) && record.status === "completed",
    ).length;
    const totalCourseLessons = courseLessonIds.size;
    const completionPercent = totalCourseLessons
      ? Math.round((completedCourseLessons / totalCourseLessons) * 100)
      : 0;

    await db.courseProgress.put({
      ...courseProgress,
      currentWeekId:
        nextLessonId && nextWeekId && firstLessonOfNextWeek?.id === nextLessonId
          ? nextWeekId
          : lesson.weekId,
      currentLessonId: nextLessonId ?? lessonId,
      completionPercent,
      exercisesSolved: completedCourseLessons,
      lastActivityAt: nowIso(),
      streakDays: courseProgress.streakDays === 0 ? 1 : courseProgress.streakDays,
      updatedAt: nowIso(),
    });
  });

  await syncQuestionProgressFromLessonRecord(lessonId);
  if (nextLessonId) {
    await syncQuestionProgressFromLessonRecord(nextLessonId);
  }

  return { nextLessonId, nextWeekId };
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

export async function resetCourseProgress(courseSlug: CourseSlug) {
  const weekIds = getWeeksByCourse(courseSlug).map((week) => week.id);
  const lessonIds = lessons.filter((lesson) => lesson.courseSlug === courseSlug).map((lesson) => lesson.id);

  await db.transaction(
    "rw",
    [
      db.courseProgress,
      db.weekProgress,
      db.lessonProgress,
      db.materialLessonProgress,
      db.exerciseAttempts,
      db.projectSubmissions,
      db.revisionQueue,
      db.errorLog,
      db.notes,
      db.activityLog,
      db.topicMastery,
      db.sqlTaskProgress,
      db.gameLevelProgress,
      db.masteryQuestionProgress,
      db.legacyQuestionLinks,
    ],
    async () => {
      await db.courseProgress.put(courseProgressSeed(courseSlug));
      await db.materialLessonProgress.where("courseSlug").equals(courseSlug).delete();
      await db.masteryQuestionProgress.where("track").equals(courseSlug).delete();
      await db.legacyQuestionLinks.where("track").equals(courseSlug).delete();

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
          status:
            week?.weekNumber === 1 &&
            (courseSlug !== "python" ||
              lessons
                .filter((item) => item.weekId === lesson?.weekId)
                .findIndex((item) => item.id === lessonId) === 0)
              ? "unlocked"
              : "locked",
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
        });
        await db.materialLessonProgress.put({
          id: `material-progress-${lessonId}`,
          createdAt: nowIso(),
          updatedAt: nowIso(),
          courseSlug,
          lessonId,
          state: "not_started",
          bookmarked: false,
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

  if (courseSlug === "python") {
    await ensurePythonWeekOneQuestionProgress();
  }

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
  const nextRecord = {
    ...record,
    draftSql,
    updatedAt: nowIso(),
  };
  await db.sqlTaskProgress.put(nextRecord);
  await syncQuestionProgressFromSqlTaskRecord(taskId, nextRecord);
}

export async function markSqlTaskRun(taskId: string, draftSql: string) {
  const record = await db.sqlTaskProgress.get(`sql-task-progress-${taskId}`);
  if (!record) return;
  const nextRecord = {
    ...record,
    draftSql,
    attempts: record.attempts + 1,
    lastRunAt: nowIso(),
    updatedAt: nowIso(),
  };
  await db.sqlTaskProgress.put(nextRecord);
  await syncQuestionProgressFromSqlTaskRecord(taskId, nextRecord);
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

  await syncQuestionProgressFromSqlTaskRecord(taskId);
  if (nextTask) {
    await syncQuestionProgressFromSqlTaskRecord(nextTask.id);
  }
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
  passed = false,
  validatorVersion = 0,
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
  const attemptsFieldMap = {
    sql: "sqlAttempts",
    python: "pythonAttempts",
    pyspark: "pysparkAttempts",
  } as const;
  const passedAtFieldMap = {
    sql: "sqlPassedAt",
    python: "pythonPassedAt",
    pyspark: "pysparkPassedAt",
  } as const;
  const validatorVersionFieldMap = {
    sql: "sqlValidatorVersion",
    python: "pythonValidatorVersion",
    pyspark: "pysparkValidatorVersion",
  } as const;

  const nextRecord = {
    ...record,
    [draftFieldMap[language]]: draft,
    [completedFieldMap[language]]: record[completedFieldMap[language]] || passed,
    [attemptsFieldMap[language]]: (record[attemptsFieldMap[language]] ?? 0) + 1,
    [passedAtFieldMap[language]]:
      record[completedFieldMap[language]] || passed
        ? record[passedAtFieldMap[language]] ?? nowIso()
        : null,
    [validatorVersionFieldMap[language]]: validatorVersion,
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
    Boolean(record.sqlCompleted) &&
    Boolean(record.pythonCompleted) &&
    Boolean(record.pysparkCompleted);

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

    const nextLevel =
      record.levelNumber < candyArcadeLevels.length
        ? await db.candyArcadeProgress.get(
            `candy-arcade-progress-candy-arcade-level-${String(record.levelNumber + 1).padStart(4, "0")}`,
          )
        : null;
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
