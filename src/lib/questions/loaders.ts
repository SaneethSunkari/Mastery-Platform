import { findArcadeLevelByQuestionId, findLessonByQuestionId, findSqlTaskByQuestionId } from "@/lib/questions/registry";
import { parseQuestionId } from "@/lib/questions/ids";

export async function loadCurrentQuestionById(questionId: string) {
  const parsed = parseQuestionId(questionId);
  if (!parsed) {
    return null;
  }

  if (parsed.kind === "arcade") {
    return findArcadeLevelByQuestionId(questionId);
  }

  if (parsed.track === "sql") {
    return findSqlTaskByQuestionId(questionId);
  }

  return findLessonByQuestionId(questionId);
}

export async function loadCurrentWeekQuestions(track: "sql" | "python" | "pyspark", weekNumber: number) {
  if (track === "sql") {
    switch (weekNumber) {
      case 1:
        return import("@/lib/sql-week-one").then((module) => module.sqlWeekOneTasks);
      case 2:
        return import("@/lib/sql-week-two").then((module) => module.sqlWeekTwoTasks);
      case 3:
        return import("@/lib/sql-week-three").then((module) => module.sqlWeekThreeTasks);
      case 4:
        return import("@/lib/sql-week-four").then((module) => module.sqlWeekFourTasks);
      default:
        return [];
    }
  }

  return [];
}
