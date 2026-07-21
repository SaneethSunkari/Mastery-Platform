import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const databaseName = "mastery-platform-db";

async function deleteDatabase() {
  await Dexie.delete(databaseName);
}

describe("python week one permanent progress", () => {
  beforeEach(async () => {
    vi.resetModules();
    await deleteDatabase();
  });

  afterEach(async () => {
    vi.resetModules();
    await deleteDatabase();
  });

  it("seeds all 125 week one question progress records", async () => {
    const { db, initializeDatabase } = await import("@/lib/db");

    await initializeDatabase();

    const records = await db.masteryQuestionProgress.where("track").equals("python").toArray();
    const weekOne = records.filter((record) => record.weekNumber === 1);

    expect(weekOne).toHaveLength(125);
    expect(weekOne[0]?.questionId).toBe("python-q-0001");
    expect(weekOne.at(-1)?.questionId).toBe("python-q-0125");
    expect(weekOne[0]?.status).toBe("unlocked");
    expect(weekOne[1]?.status).toBe("locked");
  });

  it("does not unlock the next question after a failed submission", async () => {
    const { db, initializeDatabase, savePythonQuestionEvaluation } = await import("@/lib/db");

    await initializeDatabase();

    await savePythonQuestionEvaluation("python-q-0001", {
      passed: false,
      score: 0,
      feedback: "failed",
    });

    const current = await db.masteryQuestionProgress.get("question-progress-python-q-0001");
    const next = await db.masteryQuestionProgress.get("question-progress-python-q-0002");

    expect(current?.attempts).toBe(1);
    expect(current?.passed).toBe(false);
    expect(next?.status).toBe("locked");
  });

  it("unlocks exactly the next question after one pass", async () => {
    const { db, initializeDatabase, savePythonQuestionEvaluation } = await import("@/lib/db");

    await initializeDatabase();

    const progression = await savePythonQuestionEvaluation("python-q-0001", {
      passed: true,
      score: 100,
      feedback: "passed",
    });

    const current = await db.masteryQuestionProgress.get("question-progress-python-q-0001");
    const next = await db.masteryQuestionProgress.get("question-progress-python-q-0002");
    const third = await db.masteryQuestionProgress.get("question-progress-python-q-0003");

    expect(progression.nextQuestionId).toBe("python-q-0002");
    expect(current?.passed).toBe(true);
    expect(current?.status).toBe("completed");
    expect(next?.status).toBe("unlocked");
    expect(third?.status).toBe("locked");
  });

  it("keeps week two locked until question 125 passes, then unlocks it", async () => {
    const { db, initializeDatabase, savePythonQuestionEvaluation } = await import("@/lib/db");

    await initializeDatabase();

    for (let index = 1; index <= 124; index += 1) {
      await savePythonQuestionEvaluation(`python-q-${String(index).padStart(4, "0")}`, {
        passed: true,
        score: 100,
        feedback: "passed",
      });
    }

    const pythonWeekTwo = await db.weekProgress.get("week-progress-python-week-02");
    const question125 = await db.masteryQuestionProgress.get("question-progress-python-q-0125");

    expect(question125?.status).toBe("unlocked");
    expect(pythonWeekTwo?.status).toBe("locked");

    const progression = await savePythonQuestionEvaluation("python-q-0125", {
      passed: true,
      score: 100,
      feedback: "passed",
    });

    const pythonWeekOne = await db.weekProgress.get("week-progress-python-week-01");
    const pythonWeekTwoAfter = await db.weekProgress.get("week-progress-python-week-02");
    const question125After = await db.masteryQuestionProgress.get("question-progress-python-q-0125");

    expect(progression.nextWeekId).toBe("python-week-02");
    expect(progression.nextQuestionId).toBe("python-q-0126");
    expect(question125After?.passed).toBe(true);
    expect(pythonWeekOne?.status).toBe("completed");
    expect(pythonWeekTwoAfter?.status).toBe("unlocked");
  });

  it("persists drafts across reopen", async () => {
    const { db, initializeDatabase, savePythonQuestionDraft } = await import("@/lib/db");

    await initializeDatabase();
    await savePythonQuestionDraft("python-q-0004", "def solve(data):\n    return 4\n");
    await db.close();
    await db.open();

    const progress = await db.masteryQuestionProgress.get("question-progress-python-q-0004");

    expect(progress?.draftCode).toContain("return 4");
  });
});
