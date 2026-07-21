import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const databaseName = "mastery-platform-db";

async function deleteDatabase() {
  await Dexie.delete(databaseName);
}

describe("pyspark week one permanent progress", () => {
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

    const records = await db.masteryQuestionProgress.where("track").equals("pyspark").toArray();
    const weekOne = records.filter((record) => record.weekNumber === 1);

    expect(weekOne).toHaveLength(125);
    expect(weekOne[0]?.questionId).toBe("pyspark-q-0001");
    expect(weekOne.at(-1)?.questionId).toBe("pyspark-q-0125");
    expect(weekOne[0]?.status).toBe("unlocked");
    expect(weekOne[1]?.status).toBe("locked");
  });

  it("does not unlock the next question after a failed submission", async () => {
    const { db, initializeDatabase, savePysparkQuestionEvaluation } = await import("@/lib/db");

    await initializeDatabase();

    await savePysparkQuestionEvaluation("pyspark-q-0001", {
      passed: false,
      score: 0,
      feedback: "failed",
    });

    const current = await db.masteryQuestionProgress.get("question-progress-pyspark-q-0001");
    const next = await db.masteryQuestionProgress.get("question-progress-pyspark-q-0002");

    expect(current?.attempts).toBe(1);
    expect(current?.passed).toBe(false);
    expect(next?.status).toBe("locked");
  });

  it("unlocks exactly the next question after one pass", async () => {
    const { db, initializeDatabase, savePysparkQuestionEvaluation } = await import("@/lib/db");

    await initializeDatabase();

    const progression = await savePysparkQuestionEvaluation("pyspark-q-0001", {
      passed: true,
      score: 100,
      feedback: "passed",
    });

    const current = await db.masteryQuestionProgress.get("question-progress-pyspark-q-0001");
    const next = await db.masteryQuestionProgress.get("question-progress-pyspark-q-0002");
    const third = await db.masteryQuestionProgress.get("question-progress-pyspark-q-0003");

    expect(progression.nextQuestionId).toBe("pyspark-q-0002");
    expect(current?.passed).toBe(true);
    expect(current?.status).toBe("completed");
    expect(next?.status).toBe("unlocked");
    expect(third?.status).toBe("locked");
  });

  it("persists real Spark evidence distinctly from structural validation", async () => {
    const { db, initializeDatabase, savePysparkQuestionEvaluation } = await import("@/lib/db");

    await initializeDatabase();
    await savePysparkQuestionEvaluation("pyspark-q-0026", {
      passed: true,
      score: 100,
      feedback: "Real Spark output matched.",
      evidenceType: "pyspark-runtime",
    });

    const question = await db.masteryQuestionProgress.get("question-progress-pyspark-q-0026");
    const lesson = question ? await db.lessonProgress.get(`lesson-progress-${question.legacySourceId}`) : null;
    expect(question?.validationMode).toBe("pyspark-runtime");
    expect(lesson?.evidenceType).toBe("pyspark-runtime");
  });

  it("keeps week two locked until question 125 passes, then unlocks it", async () => {
    const { db, initializeDatabase, savePysparkQuestionEvaluation } = await import("@/lib/db");

    await initializeDatabase();

    for (let index = 1; index <= 124; index += 1) {
      await savePysparkQuestionEvaluation(`pyspark-q-${String(index).padStart(4, "0")}`, {
        passed: true,
        score: 100,
        feedback: "passed",
      });
    }

    const pysparkWeekTwo = await db.weekProgress.get("week-progress-pyspark-week-02");
    const question125 = await db.masteryQuestionProgress.get("question-progress-pyspark-q-0125");

    expect(question125?.status).toBe("unlocked");
    expect(pysparkWeekTwo?.status).toBe("locked");

    const progression = await savePysparkQuestionEvaluation("pyspark-q-0125", {
      passed: true,
      score: 100,
      feedback: "passed",
    });

    const pysparkWeekOne = await db.weekProgress.get("week-progress-pyspark-week-01");
    const pysparkWeekTwoAfter = await db.weekProgress.get("week-progress-pyspark-week-02");
    const question125After = await db.masteryQuestionProgress.get("question-progress-pyspark-q-0125");

    expect(progression.nextWeekId).toBe("pyspark-week-02");
    expect(progression.nextQuestionId).toBe("pyspark-q-0126");
    expect(question125After?.passed).toBe(true);
    expect(pysparkWeekOne?.status).toBe("completed");
    expect(pysparkWeekTwoAfter?.status).toBe("unlocked");
  });

  it("persists drafts without unlocking later questions", async () => {
    const { db, initializeDatabase, savePysparkQuestionDraft } = await import("@/lib/db");

    await initializeDatabase();
    await savePysparkQuestionDraft(
      "pyspark-q-0004",
      "from pyspark.sql import functions as F\nresult = orders_df.select('order_id')\n",
    );
    await db.close();
    await db.open();

    const progress = await db.masteryQuestionProgress.get("question-progress-pyspark-q-0004");
    const next = await db.masteryQuestionProgress.get("question-progress-pyspark-q-0005");

    expect(progress?.draftCode).toContain("select");
    expect(progress?.status).toBe("locked");
    expect(next?.status).toBe("locked");
  });
});
