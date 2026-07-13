import { SqlWeekDefinition } from "@/lib/types";
import {
  sqlWeekOneDataDictionary,
  sqlWeekOneId,
  sqlWeekOneSchema,
  sqlWeekOneTasks,
  sqlWeekOneUnlockMessage,
} from "@/lib/sql-week-one";
import { sqlWeekThreeId, sqlWeekThreeTasks, sqlWeekThreeUnlockMessage } from "@/lib/sql-week-three";
import { sqlWeekTwoId, sqlWeekTwoTasks, sqlWeekTwoUnlockMessage } from "@/lib/sql-week-two";
import { sqlWeekFourId, sqlWeekFourTasks, sqlWeekFourUnlockMessage } from "@/lib/sql-week-four";

export const sqlDatasetSchema = sqlWeekOneSchema;
export const sqlDatasetDictionary = sqlWeekOneDataDictionary;

export const sqlWeekDefinitions: SqlWeekDefinition[] = [
  {
    id: sqlWeekOneId,
    badge: "SQL Week 1",
    title: "Write queries. Run them. Unlock the next step.",
    subtitle: "This week is only about SQL basics.",
    focus:
      "Pick a step, write the query, run it, and submit the correct result to unlock the next one.",
    unlockMessage: sqlWeekOneUnlockMessage,
    nextWeekId: sqlWeekTwoId,
    nextWeekLabel: "Go to Week 2",
    tasks: sqlWeekOneTasks,
  },
  {
    id: sqlWeekTwoId,
    badge: "SQL Week 2",
    title: "Master filtering, nulls, and boolean logic.",
    subtitle: "Week 2 is about writing precise predicates.",
    focus:
      "Use WHERE, AND, OR, IN, BETWEEN, LIKE, IS NULL, and NOT without introducing silent logic bugs.",
    unlockMessage: sqlWeekTwoUnlockMessage,
    nextWeekId: sqlWeekThreeId,
    nextWeekLabel: "Go to Week 3",
    tasks: sqlWeekTwoTasks,
  },
  {
    id: sqlWeekThreeId,
    badge: "SQL Week 3",
    title: "Join customers and orders with confidence.",
    subtitle: "Week 3 is about readable joins and cross-table thinking.",
    focus:
      "Use inner joins and left joins cleanly, keep track of row meaning, and combine filters across both tables.",
    unlockMessage: sqlWeekThreeUnlockMessage,
    nextWeekId: sqlWeekFourId,
    nextWeekLabel: "Go to Week 4",
    tasks: sqlWeekThreeTasks,
  },
  {
    id: sqlWeekFourId,
    badge: "SQL Week 4",
    title: "Aggregate joined data into real business metrics.",
    subtitle: "Week 4 moves from rows into grouped answers.",
    focus:
      "Use COUNT, SUM, AVG, GROUP BY, and HAVING to turn order-level data into customer and country level insights.",
    unlockMessage: sqlWeekFourUnlockMessage,
    nextWeekId: null,
    nextWeekLabel: null,
    tasks: sqlWeekFourTasks,
  },
];

export const sqlAllTasks = sqlWeekDefinitions.flatMap((week) => week.tasks);

export const getSqlWeekDefinition = (weekId: string) =>
  sqlWeekDefinitions.find((week) => week.id === weekId) ?? null;
