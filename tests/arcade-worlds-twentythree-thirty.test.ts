import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gradeArcadeLanguage } from "@/lib/arcade-grading";
import { getArcadeBundle } from "@/lib/arcade-bundles";
import {
  arcadeWorldsTwentythreeThirtyBundles,
  getArcadeWorldsTwentythreeThirtyBundle,
} from "@/lib/arcade-worlds-twentythree-thirty";
import { getArcadeQuestionId } from "@/lib/questions/ids";
import { getArcadeWorldsTwentythreeThirtyValidationAudit } from "@/lib/practice-audit";

const databaseName = "mastery-platform-db";

async function deleteDatabase() {
  await Dexie.delete(databaseName);
}

describe("arcade worlds twenty-three through thirty permanent bank", () => {
  it("contains exactly 400 contiguous permanent levels from 1101 through 1500", () => {
    expect(arcadeWorldsTwentythreeThirtyBundles).toHaveLength(400);
    expect(arcadeWorldsTwentythreeThirtyBundles.map((bundle) => getArcadeQuestionId(bundle.levelNumber))).toEqual(
      Array.from({ length: 400 }, (_, index) => getArcadeQuestionId(index + 1101)),
    );
  });

  it("keeps 400 unique logic fingerprints and all three validators on every level", () => {
    const fingerprints = arcadeWorldsTwentythreeThirtyBundles.map((bundle) => bundle.uniqueLogicFingerprint);

    expect(new Set(fingerprints).size).toBe(400);

    for (const bundle of arcadeWorldsTwentythreeThirtyBundles) {
      expect(bundle.sharedTask.trim().length).toBeGreaterThan(0);
      expect(bundle.datasetContract.tables.length).toBeGreaterThan(0);
      expect(bundle.resultContract.requiredOutputColumns.length).toBeGreaterThan(0);
      expect(bundle.resultContract.expectedRows.length).toBeGreaterThan(0);
      expect(bundle.sql.referenceSolution.trim().length).toBeGreaterThan(0);
      expect(bundle.sql.setupSql.trim().length).toBeGreaterThan(0);
      expect(bundle.python.referenceSolution.trim().length).toBeGreaterThan(0);
      expect(bundle.python.visibleCases.length).toBeGreaterThan(0);
      expect(bundle.python.hiddenCases.length).toBeGreaterThan(0);
      expect(bundle.pyspark.referenceSolution.trim().length).toBeGreaterThan(0);
      expect(bundle.pyspark.requirements.length).toBeGreaterThan(0);
    }
  });

  it("resolves every new world level from the shared arcade bundle map", () => {
    for (let levelNumber = 1101; levelNumber <= 1500; levelNumber += 1) {
      expect(getArcadeWorldsTwentythreeThirtyBundle(levelNumber)?.levelNumber).toBe(levelNumber);
      expect(getArcadeBundle(levelNumber)?.levelNumber).toBe(levelNumber);
    }
  });

  it("audits worlds twenty-three through thirty as 400/400 validator-backed levels", async () => {
    const audit = await getArcadeWorldsTwentythreeThirtyValidationAudit();

    expect(audit.targetCount).toBe(400);
    expect(audit.displayedCount).toBe(400);
    expect(audit.structurallyValidCount).toBe(400);
    expect(audit.runtimeValidCount).toBe(400);
    expect(audit.uniqueLogicCount).toBe(400);
    expect(audit.fullyVerifiedCount).toBe(400);
    expect(audit.sqlValidatorCount).toBe(400);
    expect(audit.pythonValidatorCount).toBe(400);
    expect(audit.pysparkValidatorCount).toBe(400);
    expect(audit.verifiedRequiredSolutionCount).toBe(1200);
    expect(audit.duplicateIds).toEqual([]);
    expect(audit.missingIds).toEqual([]);
    expect(audit.brokenDatasets).toEqual([]);
    expect(audit.brokenContracts).toEqual([]);
    expect(audit.brokenValidators).toEqual([]);
    expect(audit.brokenReferenceSolutions).toEqual([]);
    expect(audit.suspiciousDuplicateClusters).toEqual([]);
    expect(audit.nextMissingId).toBe("arcade-q-1501");
  });

  it("accepts level 1101 SQL and PySpark references and rejects representative wrong answers", async () => {
    const bundle = getArcadeWorldsTwentythreeThirtyBundle(1101);
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

describe("arcade worlds twenty-three through thirty progress persistence", () => {
  beforeEach(async () => {
    vi.resetModules();
    await deleteDatabase();
  });

  afterEach(async () => {
    vi.resetModules();
    await deleteDatabase();
  });

  it("does not unlock level 1102 until all three level 1101 languages pass", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const levelId = "candy-arcade-level-1101";
    const nextLevelId = "candy-arcade-level-1102";
    const level = getArcadeWorldsTwentythreeThirtyBundle(1101)!;

    await completeCandyArcadeLanguage(levelId, "sql", level.sql.referenceSolution, true, 23);
    expect((await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`))?.unlocked).toBe(false);

    await completeCandyArcadeLanguage(levelId, "python", level.python.referenceSolution, true, 23);
    expect((await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`))?.unlocked).toBe(false);

    await completeCandyArcadeLanguage(levelId, "pyspark", level.representativeIncorrectAnswers.pyspark, false, 23);
    expect((await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`))?.unlocked).toBe(false);

    await completeCandyArcadeLanguage(levelId, "pyspark", level.pyspark.referenceSolution, true, 23);
    expect((await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`))?.completed).toBe(true);
    expect((await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`))?.unlocked).toBe(true);
  });

  it("preserves level 1101 completion and level 1102 unlock after reload", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const level = getArcadeWorldsTwentythreeThirtyBundle(1101)!;

    await completeCandyArcadeLanguage("candy-arcade-level-1101", "sql", level.sql.referenceSolution, true, 23);
    await completeCandyArcadeLanguage("candy-arcade-level-1101", "python", level.python.referenceSolution, true, 23);
    await completeCandyArcadeLanguage("candy-arcade-level-1101", "pyspark", level.pyspark.referenceSolution, true, 23);

    await db.close();
    await db.open();

    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-1101"))?.completed).toBe(true);
    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-1102"))?.unlocked).toBe(true);
  });
});
