import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arcadeWorldOneBundles, getArcadeWorldOneBundle } from "@/lib/arcade-world-one";
import { getArcadeQuestionId } from "@/lib/questions/ids";
import { getArcadeWorldOneValidationAudit } from "@/lib/practice-audit";

const databaseName = "mastery-platform-db";

async function deleteDatabase() {
  await Dexie.delete(databaseName);
}

describe("arcade world one permanent bank", () => {
  it("contains exactly 50 contiguous permanent world one levels", () => {
    expect(arcadeWorldOneBundles).toHaveLength(50);
    expect(
      arcadeWorldOneBundles.map((bundle) => getArcadeQuestionId(bundle.levelNumber)),
    ).toEqual(
      Array.from({ length: 50 }, (_, index) => getArcadeQuestionId(index + 1)),
    );
  });

  it("keeps one shared task, one shared dataset contract, and one expected-result contract per level", () => {
    for (const bundle of arcadeWorldOneBundles) {
      expect(bundle.sharedTask.trim().length).toBeGreaterThan(0);
      expect(bundle.datasetContract.datasetId.trim().length).toBeGreaterThan(0);
      expect(bundle.datasetContract.tables).toHaveLength(1);
      expect(bundle.datasetContract.tables[0]?.columns.length).toBeGreaterThan(0);
      expect(bundle.datasetContract.tables[0]?.rows.length).toBeGreaterThan(0);
      expect(bundle.resultContract.requiredOutputColumns.length).toBeGreaterThan(0);
      expect(bundle.resultContract.expectedRows.length).toBeGreaterThan(0);
      expect(bundle.uniqueLogicFingerprint.trim().length).toBeGreaterThan(0);
      expect(bundle.representativeIncorrectAnswers.sql.trim().length).toBeGreaterThan(0);
      expect(bundle.representativeIncorrectAnswers.python.trim().length).toBeGreaterThan(0);
      expect(bundle.representativeIncorrectAnswers.pyspark.trim().length).toBeGreaterThan(0);
    }
  });

  it("resolves every world one level by number", () => {
    for (let levelNumber = 1; levelNumber <= 50; levelNumber += 1) {
      expect(getArcadeWorldOneBundle(levelNumber)?.levelNumber).toBe(levelNumber);
    }
  });

  it("audits world one as fully verified with no missing ids, broken contracts, or duplicate clusters", async () => {
    const audit = await getArcadeWorldOneValidationAudit();

    expect(audit.targetCount).toBe(50);
    expect(audit.displayedCount).toBe(50);
    expect(audit.structurallyValidCount).toBe(50);
    expect(audit.runtimeValidCount).toBe(50);
    expect(audit.uniqueLogicCount).toBe(50);
    expect(audit.fullyVerifiedCount).toBe(50);
    expect(audit.sqlValidatorCount).toBe(50);
    expect(audit.pythonValidatorCount).toBe(50);
    expect(audit.pysparkValidatorCount).toBe(50);
    expect(audit.verifiedRequiredSolutionCount).toBe(150);
    expect(audit.duplicateIds).toEqual([]);
    expect(audit.missingIds).toEqual([]);
    expect(audit.brokenDatasets).toEqual([]);
    expect(audit.brokenContracts).toEqual([]);
    expect(audit.brokenValidators).toEqual([]);
    expect(audit.brokenReferenceSolutions).toEqual([]);
    expect(audit.suspiciousDuplicateClusters).toEqual([]);
    expect(audit.nextMissingId).toBe("arcade-q-0051");
  });
});

describe("arcade world one progress persistence", () => {
  beforeEach(async () => {
    vi.resetModules();
    await deleteDatabase();
  });

  afterEach(async () => {
    vi.resetModules();
    await deleteDatabase();
  });

  it("persists drafts independently after reload", async () => {
    const { db, initializeDatabase, saveCandyArcadeDraft } = await import("@/lib/db");

    await initializeDatabase();
    const levelId = "candy-arcade-level-0001";

    await saveCandyArcadeDraft(levelId, "sql", "SELECT order_id FROM orders;");
    await saveCandyArcadeDraft(levelId, "python", "result = [{'order_id': 101}]");
    await saveCandyArcadeDraft(levelId, "pyspark", "result_df = orders_df.select('order_id')");

    await db.close();
    await db.open();

    const current = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);

    expect(current?.sqlDraft).toContain("SELECT");
    expect(current?.pythonDraft).toContain("result");
    expect(current?.pysparkDraft).toContain("result_df");
    expect(current?.completed).toBe(false);
  });

  it("does not complete the level when only SQL passes", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const levelId = "candy-arcade-level-0001";
    const nextLevelId = "candy-arcade-level-0002";

    await completeCandyArcadeLanguage(levelId, "sql", "SELECT order_id FROM orders;", true, 1);

    const current = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
    const next = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);

    expect(current?.sqlCompleted).toBe(true);
    expect(current?.completed).toBe(false);
    expect(next?.unlocked).toBe(false);
  });

  it("does not complete the level when only Python passes", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const levelId = "candy-arcade-level-0001";
    const nextLevelId = "candy-arcade-level-0002";

    await completeCandyArcadeLanguage(levelId, "python", "result = [{'order_id': 101}]", true, 1);

    const current = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
    const next = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);

    expect(current?.pythonCompleted).toBe(true);
    expect(current?.completed).toBe(false);
    expect(next?.unlocked).toBe(false);
  });

  it("does not complete the level when only PySpark passes", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const levelId = "candy-arcade-level-0001";
    const nextLevelId = "candy-arcade-level-0002";

    await completeCandyArcadeLanguage(
      levelId,
      "pyspark",
      "result_df = orders_df.select('order_id')",
      true,
      1,
    );

    const current = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
    const next = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);

    expect(current?.pysparkCompleted).toBe(true);
    expect(current?.completed).toBe(false);
    expect(next?.unlocked).toBe(false);
  });

  it("persists three passed language states after reload and keeps the next level unlocked", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const levelId = "candy-arcade-level-0001";
    const nextLevelId = "candy-arcade-level-0002";

    await completeCandyArcadeLanguage(levelId, "sql", "SELECT order_id FROM orders;", true, 1);
    await completeCandyArcadeLanguage(levelId, "python", "result = [{'order_id': 101}]", true, 1);
    await completeCandyArcadeLanguage(
      levelId,
      "pyspark",
      "result_df = orders_df.select('order_id')",
      true,
      1,
    );

    await db.close();
    await db.open();

    const current = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
    const next = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);

    expect(current?.sqlCompleted).toBe(true);
    expect(current?.pythonCompleted).toBe(true);
    expect(current?.pysparkCompleted).toBe(true);
    expect(current?.completed).toBe(true);
    expect(next?.unlocked).toBe(true);
  });
});
