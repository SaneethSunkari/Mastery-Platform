import { describe, expect, it } from "vitest";
import {
  getArcadeQuestionId,
  getMasteryQuestionId,
  getPositionWithinWeek,
  getWeekFromQuestionId,
  parseQuestionId,
} from "@/lib/questions/ids";
import {
  findArcadeLevelByQuestionId,
  findLessonByQuestionId,
  findSqlTaskByQuestionId,
  getQuestionIdForLesson,
  getQuestionIdForSqlTask,
  resolveLegacyQuestionLink,
} from "@/lib/questions/registry";
import { getWeeksByCourse, lessons } from "@/lib/curriculum";
import { sqlWeekOneTasks } from "@/lib/sql-week-one";
import { sqlWeekDefinitions } from "@/lib/sql-weeks";

describe("permanent question ids", () => {
  it("builds mastery ids with the required week formula", () => {
    expect(getMasteryQuestionId("sql", 1, 1)).toBe("sql-q-0001");
    expect(getMasteryQuestionId("sql", 2, 1)).toBe("sql-q-0126");
    expect(getMasteryQuestionId("sql", 24, 125)).toBe("sql-q-3000");

    expect(getMasteryQuestionId("python", 1, 1)).toBe("python-q-0001");
    expect(getMasteryQuestionId("pyspark", 24, 125)).toBe("pyspark-q-3000");
  });

  it("builds arcade ids with the required level formula", () => {
    expect(getArcadeQuestionId(1)).toBe("arcade-q-0001");
    expect(getArcadeQuestionId(50)).toBe("arcade-q-0050");
    expect(getArcadeQuestionId(3000)).toBe("arcade-q-3000");
  });

  it("parses ids back into week, position, and level details", () => {
    expect(parseQuestionId("sql-q-0126")).toEqual({
      kind: "mastery",
      track: "sql",
      ordinal: 126,
      weekNumber: 2,
      positionWithinWeek: 1,
    });

    expect(getWeekFromQuestionId("python-q-0300")).toBe(3);
    expect(getPositionWithinWeek("python-q-0300")).toBe(50);

    expect(parseQuestionId("arcade-q-3000")).toEqual({
      kind: "arcade",
      track: "arcade",
      ordinal: 3000,
      levelNumber: 3000,
    });
  });
});

describe("current content registry", () => {
  it("maps current SQL tasks into permanent ids and resolves them back", () => {
    const weekOneFirstTask = sqlWeekDefinitions[0].tasks[0];
    const weekFourFirstTask = sqlWeekDefinitions[3].tasks[0];

    expect(getQuestionIdForSqlTask(weekOneFirstTask)).toBe("sql-q-0001");
    expect(getQuestionIdForSqlTask(weekFourFirstTask)).toBe("sql-q-0376");

    expect(findSqlTaskByQuestionId("sql-q-0001")?.id).toBe(weekOneFirstTask.id);
    expect(findSqlTaskByQuestionId("sql-q-0376")?.id).toBe(weekFourFirstTask.id);
  });

  it("fills the full Week 1 SQL permanent range through sql-q-0125", () => {
    const weekOneLastTask = sqlWeekOneTasks.at(-1);

    expect(sqlWeekOneTasks).toHaveLength(125);
    expect(weekOneLastTask?.stepNumber).toBe(125);
    expect(getQuestionIdForSqlTask(weekOneLastTask!)).toBe("sql-q-0125");
    expect(findSqlTaskByQuestionId("sql-q-0125")?.id).toBe(weekOneLastTask?.id);
  });

  it("maps current Python and PySpark lessons into permanent ids", () => {
    const pythonLesson = lessons.find((lesson) => lesson.courseSlug === "python");
    const pysparkLesson = lessons.find((lesson) => lesson.courseSlug === "pyspark");

    expect(pythonLesson).toBeTruthy();
    expect(pysparkLesson).toBeTruthy();

    expect(getQuestionIdForLesson(pythonLesson!)).toBe("python-q-0001");
    expect(getQuestionIdForLesson(pysparkLesson!)).toBe("pyspark-q-0001");

    expect(findLessonByQuestionId("python-q-0001")?.id).toBe(pythonLesson!.id);
    expect(findLessonByQuestionId("pyspark-q-0001")?.id).toBe(pysparkLesson!.id);
  });

  it("fills the full Week 1 Python and PySpark permanent ranges through question 125", () => {
    const pythonWeekOne = getWeeksByCourse("python")[0];
    const pysparkWeekOne = getWeeksByCourse("pyspark")[0];
    const pythonLessons = lessons.filter((lesson) => lesson.weekId === pythonWeekOne.id);
    const pysparkLessons = lessons.filter((lesson) => lesson.weekId === pysparkWeekOne.id);
    const lastPythonLesson = pythonLessons.at(-1);
    const lastPysparkLesson = pysparkLessons.at(-1);

    expect(pythonLessons).toHaveLength(125);
    expect(pysparkLessons).toHaveLength(125);

    expect(getQuestionIdForLesson(lastPythonLesson!)).toBe("python-q-0125");
    expect(findLessonByQuestionId("python-q-0125")?.id).toBe(lastPythonLesson?.id);

    expect(getQuestionIdForLesson(lastPysparkLesson!)).toBe("pyspark-q-0125");
    expect(findLessonByQuestionId("pyspark-q-0125")?.id).toBe(lastPysparkLesson?.id);
  });

  it("resolves arcade stable ids back to current levels and legacy links", () => {
    expect(findArcadeLevelByQuestionId("arcade-q-0001")?.levelNumber).toBe(1);
    expect(resolveLegacyQuestionLink("arcade-q-0001")?.legacyId).toBe("candy-arcade-level-0001");
  });
});
