import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gradeArcadeLanguage } from "@/lib/arcade-grading";
import { arcadeValidatorBackedLevelCount, getArcadeBundle } from "@/lib/arcade-bundles";
import {
  arcadeWorldsFiftyoneSixtyBundles,
  getArcadeWorldsFiftyoneSixtyBundle,
} from "@/lib/arcade-worlds-fiftyone-sixty";
import { getArcadeQuestionId } from "@/lib/questions/ids";
import { getArcadeWorldsFiftyoneSixtyValidationAudit } from "@/lib/practice-audit";

const databaseName = "mastery-platform-db";

async function deleteDatabase() {
  await Dexie.delete(databaseName);
}

describe("arcade worlds fifty-one through sixty permanent bank", () => {
  it("contains exactly 500 contiguous permanent levels from 2501 through 3000", () => {
    expect(arcadeWorldsFiftyoneSixtyBundles).toHaveLength(500);
    expect(arcadeWorldsFiftyoneSixtyBundles.map((bundle) => getArcadeQuestionId(bundle.levelNumber))).toEqual(
      Array.from({ length: 500 }, (_, index) => getArcadeQuestionId(index + 2501)),
    );
    expect(arcadeValidatorBackedLevelCount).toBe(3000);
  });

  it("keeps 500 unique logic fingerprints and all three validators on every level", () => {
    const fingerprints = arcadeWorldsFiftyoneSixtyBundles.map((bundle) => bundle.uniqueLogicFingerprint);

    expect(new Set(fingerprints).size).toBe(500);

    for (const bundle of arcadeWorldsFiftyoneSixtyBundles) {
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

  it("resolves every final world level from the shared arcade bundle map", () => {
    for (let levelNumber = 2501; levelNumber <= 3000; levelNumber += 1) {
      expect(getArcadeWorldsFiftyoneSixtyBundle(levelNumber)?.levelNumber).toBe(levelNumber);
      expect(getArcadeBundle(levelNumber)?.levelNumber).toBe(levelNumber);
    }
    expect(getArcadeBundle(3001)).toBeNull();
  });

  it("audits worlds fifty-one through sixty as 500/500 validator-backed levels", async () => {
    const audit = await getArcadeWorldsFiftyoneSixtyValidationAudit();

    expect(audit.targetCount).toBe(500);
    expect(audit.displayedCount).toBe(500);
    expect(audit.structurallyValidCount).toBe(500);
    expect(audit.runtimeValidCount).toBe(500);
    expect(audit.uniqueLogicCount).toBe(500);
    expect(audit.fullyVerifiedCount).toBe(500);
    expect(audit.sqlValidatorCount).toBe(500);
    expect(audit.pythonValidatorCount).toBe(500);
    expect(audit.pysparkValidatorCount).toBe(500);
    expect(audit.verifiedRequiredSolutionCount).toBe(1500);
    expect(audit.duplicateIds).toEqual([]);
    expect(audit.missingIds).toEqual([]);
    expect(audit.brokenDatasets).toEqual([]);
    expect(audit.brokenContracts).toEqual([]);
    expect(audit.brokenValidators).toEqual([]);
    expect(audit.brokenReferenceSolutions).toEqual([]);
    expect(audit.suspiciousDuplicateClusters).toEqual([]);
    expect(audit.nextMissingId).toBeNull();
  });

  it("accepts level 2501 SQL and PySpark references and rejects representative wrong answers", async () => {
    const bundle = getArcadeWorldsFiftyoneSixtyBundle(2501);
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

describe("arcade worlds fifty-one through sixty progress persistence", () => {
  beforeEach(async () => {
    vi.resetModules();
    await deleteDatabase();
  });

  afterEach(async () => {
    vi.resetModules();
    await deleteDatabase();
  });

  it("does not unlock level 2502 until all three level 2501 languages pass", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const level = getArcadeWorldsFiftyoneSixtyBundle(2501)!;

    await completeCandyArcadeLanguage("candy-arcade-level-2501", "sql", level.sql.referenceSolution, true, 51);
    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-2502"))?.unlocked).toBe(false);

    await completeCandyArcadeLanguage("candy-arcade-level-2501", "python", level.python.referenceSolution, true, 51);
    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-2502"))?.unlocked).toBe(false);

    await completeCandyArcadeLanguage("candy-arcade-level-2501", "pyspark", level.representativeIncorrectAnswers.pyspark, false, 51);
    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-2502"))?.unlocked).toBe(false);

    await completeCandyArcadeLanguage("candy-arcade-level-2501", "pyspark", level.pyspark.referenceSolution, true, 51);
    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-2501"))?.completed).toBe(true);
    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-2502"))?.unlocked).toBe(true);
  });

  it("completes level 3000 without creating level 3001", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const level = getArcadeWorldsFiftyoneSixtyBundle(3000)!;
    const levelId = "candy-arcade-level-3000";

    await db.candyArcadeProgress.update("candy-arcade-progress-candy-arcade-level-2999", {
      completed: true,
      unlocked: true,
      sqlCompleted: true,
      pythonCompleted: true,
      pysparkCompleted: true,
    });
    await db.candyArcadeProgress.update("candy-arcade-progress-candy-arcade-level-3000", {
      unlocked: true,
    });

    await completeCandyArcadeLanguage(levelId, "sql", level.sql.referenceSolution, true, 60);
    await completeCandyArcadeLanguage(levelId, "python", level.python.referenceSolution, true, 60);
    const result = await completeCandyArcadeLanguage(levelId, "pyspark", level.pyspark.referenceSolution, true, 60);

    const completedCurrent = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
    const impossibleNext = await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-3001");

    expect(result.levelCompleted).toBe(true);
    expect(completedCurrent?.completed).toBe(true);
    expect(impossibleNext).toBeUndefined();
  });
});
