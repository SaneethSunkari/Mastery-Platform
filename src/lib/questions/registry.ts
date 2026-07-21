import { candyArcadeLevels } from "@/lib/candy-arcade";
import { getLessonsByWeek, getWeekById, lessons } from "@/lib/curriculum";
import { listMasteryExtensionQuestionIds } from "@/lib/mastery-extension-banks";
import { sqlWeekDefinitions } from "@/lib/sql-weeks";
import { ArcadeLanguage, CourseSlug, LessonRecord, SqlTaskDefinition } from "@/lib/types";
import {
  getArcadeQuestionId,
  getMasteryQuestionId,
  parseQuestionId,
  type ParsedQuestionId,
} from "@/lib/questions/ids";

export type LegacyQuestionKind = "sql-task" | "lesson" | "arcade-level";

export type LegacyQuestionLink = {
  legacyKind: LegacyQuestionKind;
  legacyId: string;
  questionId: string;
  track: CourseSlug | "arcade";
  weekNumber: number | null;
  positionWithinWeek: number | null;
  levelNumber: number | null;
};

function getSqlWeekNumber(weekId: string) {
  return sqlWeekDefinitions.findIndex((week) => week.id === weekId) + 1;
}

export function getQuestionIdForSqlTask(task: Pick<SqlTaskDefinition, "weekId" | "stepNumber">) {
  const weekNumber = getSqlWeekNumber(task.weekId);
  if (weekNumber < 1) {
    return null;
  }

  return getMasteryQuestionId("sql", weekNumber, task.stepNumber);
}

export function getQuestionIdForLesson(lesson: Pick<LessonRecord, "courseSlug" | "weekId" | "id">) {
  const week = getWeekById(lesson.weekId);
  if (!week || lesson.courseSlug === "sql") {
    return null;
  }

  const weekLessons = getLessonsByWeek(lesson.weekId);
  const lessonIndex = weekLessons.findIndex((item) => item.id === lesson.id);
  if (lessonIndex < 0) {
    return null;
  }

  return getMasteryQuestionId(lesson.courseSlug, week.weekNumber, lessonIndex + 1);
}

export function getQuestionIdForArcadeLevel(levelNumber: number) {
  return getArcadeQuestionId(levelNumber);
}

export function findSqlTaskByQuestionId(questionId: string) {
  const parsed = parseQuestionId(questionId);
  if (!parsed || parsed.kind !== "mastery" || parsed.track !== "sql") {
    return null;
  }

  const week = sqlWeekDefinitions[parsed.weekNumber - 1];
  if (!week) {
    return null;
  }

  return week.tasks.find((task) => task.stepNumber === parsed.positionWithinWeek) ?? null;
}

export function findLessonByQuestionId(questionId: string) {
  const parsed = parseQuestionId(questionId);
  if (!parsed || parsed.kind !== "mastery" || parsed.track === "sql") {
    return null;
  }

  const week = lessons.find(
    (lesson) =>
      lesson.courseSlug === parsed.track &&
      getWeekById(lesson.weekId)?.weekNumber === parsed.weekNumber,
  )?.weekId;

  if (!week) {
    return null;
  }

  const weekLessons = getLessonsByWeek(week).filter((lesson) => lesson.courseSlug === parsed.track);
  return weekLessons[parsed.positionWithinWeek - 1] ?? null;
}

export function findArcadeLevelByQuestionId(questionId: string) {
  const parsed = parseQuestionId(questionId);
  if (!parsed || parsed.kind !== "arcade") {
    return null;
  }

  return candyArcadeLevels.find((level) => level.levelNumber === parsed.levelNumber) ?? null;
}

export function getLegacyQuestionLink(
  legacyKind: LegacyQuestionKind,
  legacyId: string,
): LegacyQuestionLink | null {
  if (legacyKind === "sql-task") {
    const task = sqlWeekDefinitions.flatMap((week) => week.tasks).find((item) => item.id === legacyId);
    if (!task) return null;
    const questionId = getQuestionIdForSqlTask(task);
    if (!questionId) return null;
    const parsed = parseQuestionId(questionId);
    if (!parsed || parsed.kind !== "mastery") return null;
    return {
      legacyKind,
      legacyId,
      questionId,
      track: "sql",
      weekNumber: parsed.weekNumber,
      positionWithinWeek: parsed.positionWithinWeek,
      levelNumber: null,
    };
  }

  if (legacyKind === "lesson") {
    const lesson = lessons.find((item) => item.id === legacyId);
    if (!lesson || lesson.courseSlug === "sql") return null;
    const questionId = getQuestionIdForLesson(lesson);
    if (!questionId) return null;
    const parsed = parseQuestionId(questionId);
    if (!parsed || parsed.kind !== "mastery") return null;
    return {
      legacyKind,
      legacyId,
      questionId,
      track: lesson.courseSlug,
      weekNumber: parsed.weekNumber,
      positionWithinWeek: parsed.positionWithinWeek,
      levelNumber: null,
    };
  }

  const arcadeLevel = candyArcadeLevels.find((item) => item.id === legacyId);
  if (!arcadeLevel) {
    return null;
  }

  return {
    legacyKind,
    legacyId,
    questionId: getArcadeQuestionId(arcadeLevel.levelNumber),
    track: "arcade",
    weekNumber: null,
    positionWithinWeek: null,
    levelNumber: arcadeLevel.levelNumber,
  };
}

export function resolveLegacyQuestionLink(questionId: string): LegacyQuestionLink | null {
  const parsed = parseQuestionId(questionId);
  if (!parsed) {
    return null;
  }

  if (parsed.kind === "arcade") {
    const level = findArcadeLevelByQuestionId(questionId);
    return level ? getLegacyQuestionLink("arcade-level", level.id) : null;
  }

  if (parsed.track === "sql") {
    const task = findSqlTaskByQuestionId(questionId);
    return task ? getLegacyQuestionLink("sql-task", task.id) : null;
  }

  const lesson = findLessonByQuestionId(questionId);
  return lesson ? getLegacyQuestionLink("lesson", lesson.id) : null;
}

export function getCurrentQuestionStatusKey(
  questionId: string,
  language?: ArcadeLanguage,
) {
  if (language) {
    return `${questionId}-${language}`;
  }

  return questionId;
}

export function listImplementedQuestionIds(track: CourseSlug | "arcade") {
  if (track === "sql") {
    return sqlWeekDefinitions.flatMap((week) =>
      week.tasks.map((task) => getQuestionIdForSqlTask(task)).filter(Boolean) as string[],
    );
  }

  if (track === "arcade") {
    return candyArcadeLevels.map((level) => getArcadeQuestionId(level.levelNumber));
  }

  const lessonIds = lessons
    .filter((lesson) => lesson.courseSlug === track)
    .map((lesson) => getQuestionIdForLesson(lesson))
    .filter(Boolean) as string[];

  return [...lessonIds, ...listMasteryExtensionQuestionIds(track)];
}

export function getQuestionTrack(questionId: string): ParsedQuestionId["track"] | null {
  return parseQuestionId(questionId)?.track ?? null;
}
