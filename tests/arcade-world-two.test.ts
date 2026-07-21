import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gradeArcadeLanguage } from "@/lib/arcade-grading";
import { arcadeWorldTwoBundles, getArcadeWorldTwoBundle } from "@/lib/arcade-world-two";
import { getArcadeQuestionId } from "@/lib/questions/ids";
import { getArcadeWorldTwoValidationAudit } from "@/lib/practice-audit";

const databaseName = "mastery-platform-db";

async function deleteDatabase() {
  await Dexie.delete(databaseName);
}

describe("arcade world two permanent bank", () => {
  it("contains exactly 50 contiguous permanent world two levels", () => {
    expect(arcadeWorldTwoBundles).toHaveLength(50);
    expect(
      arcadeWorldTwoBundles.map((bundle) => getArcadeQuestionId(bundle.levelNumber)),
    ).toEqual(
      Array.from({ length: 50 }, (_, index) => getArcadeQuestionId(index + 51)),
    );
  });

  it("keeps one shared task, one dataset contract, one result contract, and all three validators per level", () => {
    for (const bundle of arcadeWorldTwoBundles) {
      expect(bundle.sharedTask.trim().length).toBeGreaterThan(0);
      expect(bundle.datasetContract.datasetId.trim().length).toBeGreaterThan(0);
      expect(bundle.datasetContract.tables.length).toBeGreaterThan(0);
      expect(bundle.datasetContract.tables.every((table) => table.columns.length > 0)).toBe(true);
      expect(bundle.datasetContract.tables.every((table) => table.rows.length > 0)).toBe(true);
      expect(bundle.resultContract.requiredOutputColumns.length).toBeGreaterThan(0);
      expect(bundle.resultContract.expectedRows.length).toBeGreaterThan(0);
      expect(bundle.uniqueLogicFingerprint.trim().length).toBeGreaterThan(0);
      expect(bundle.sql.referenceSolution.trim().length).toBeGreaterThan(0);
      expect(bundle.sql.setupSql.trim().length).toBeGreaterThan(0);
      expect(bundle.python.referenceSolution.trim().length).toBeGreaterThan(0);
      expect(bundle.python.visibleCases.length).toBeGreaterThan(0);
      expect(bundle.python.hiddenCases.length).toBeGreaterThan(0);
      expect(bundle.pyspark.referenceSolution.trim().length).toBeGreaterThan(0);
      expect(bundle.pyspark.requirements.length).toBeGreaterThan(0);
      expect(bundle.representativeIncorrectAnswers.sql.trim().length).toBeGreaterThan(0);
      expect(bundle.representativeIncorrectAnswers.python.trim().length).toBeGreaterThan(0);
      expect(bundle.representativeIncorrectAnswers.pyspark.trim().length).toBeGreaterThan(0);
    }
  });

  it("resolves every world two level by number", () => {
    for (let levelNumber = 51; levelNumber <= 100; levelNumber += 1) {
      expect(getArcadeWorldTwoBundle(levelNumber)?.levelNumber).toBe(levelNumber);
    }
  });

  it("audits world two as fully verified with no missing ids, broken contracts, or duplicate clusters", async () => {
    const audit = await getArcadeWorldTwoValidationAudit();

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
    expect(audit.nextMissingId).toBe("arcade-q-0101");
  });

  it("accepts world two SQL and PySpark references and rejects representative wrong answers for level 51", async () => {
    const bundle = getArcadeWorldTwoBundle(51);
    expect(bundle).toBeTruthy();

    const sqlPass = await gradeArcadeLanguage(bundle!, "sql", bundle!.sql.referenceSolution);
    const sqlFail = await gradeArcadeLanguage(bundle!, "sql", bundle!.representativeIncorrectAnswers.sql);
    const pysparkPass = await gradeArcadeLanguage(bundle!, "pyspark", bundle!.pyspark.referenceSolution);
    const pysparkFail = await gradeArcadeLanguage(bundle!, "pyspark", bundle!.representativeIncorrectAnswers.pyspark);

    expect(sqlPass.passed).toBe(true);
    expect(sqlFail.passed).toBe(false);
    expect(pysparkPass.passed).toBe(true);
    expect(pysparkFail.passed).toBe(false);
  });
});

describe("arcade world two progress persistence", () => {
  beforeEach(async () => {
    vi.resetModules();
    await deleteDatabase();
  });

  afterEach(async () => {
    vi.resetModules();
    await deleteDatabase();
  });

  it("does not unlock level 52 until all three level 51 languages pass", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const levelId = "candy-arcade-level-0051";
    const nextLevelId = "candy-arcade-level-0052";
    const level = getArcadeWorldTwoBundle(51)!;

    const sql = await completeCandyArcadeLanguage(levelId, "sql", level.sql.referenceSolution, true, 2);
    const afterSql = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);
    expect(sql.levelCompleted).toBe(false);
    expect(afterSql?.unlocked).toBe(false);

    const python = await completeCandyArcadeLanguage(levelId, "python", level.python.referenceSolution, true, 2);
    const afterPython = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);
    expect(python.levelCompleted).toBe(false);
    expect(afterPython?.unlocked).toBe(false);

    await completeCandyArcadeLanguage(levelId, "pyspark", level.representativeIncorrectAnswers.pyspark, false, 2);
    const afterWrongPyspark = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);
    expect(afterWrongPyspark?.unlocked).toBe(false);

    const pyspark = await completeCandyArcadeLanguage(levelId, "pyspark", level.pyspark.referenceSolution, true, 2);
    const current = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
    const next = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);

    expect(pyspark.levelCompleted).toBe(true);
    expect(current?.completed).toBe(true);
    expect(next?.unlocked).toBe(true);
  });

  it("unlocks level 101 cleanly after all three level 100 languages pass", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const levelId = "candy-arcade-level-0100";
    const nextLevelId = "candy-arcade-level-0101";
    const level = getArcadeWorldTwoBundle(100)!;

    await completeCandyArcadeLanguage(levelId, "sql", level.sql.referenceSolution, true, 2);
    await completeCandyArcadeLanguage(levelId, "python", level.python.referenceSolution, true, 2);
    const completion = await completeCandyArcadeLanguage(levelId, "pyspark", level.pyspark.referenceSolution, true, 2);

    const current = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
    const next = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);

    expect(completion.levelCompleted).toBe(true);
    expect(current?.completed).toBe(true);
    expect(next?.levelId).toBe(nextLevelId);
    expect(next?.unlocked).toBe(true);
  });
});
