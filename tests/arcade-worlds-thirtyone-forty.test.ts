import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gradeArcadeLanguage } from "@/lib/arcade-grading";
import { getArcadeBundle } from "@/lib/arcade-bundles";
import {
  arcadeWorldsThirtyoneFortyBundles,
  getArcadeWorldsThirtyoneFortyBundle,
} from "@/lib/arcade-worlds-thirtyone-forty";
import { getArcadeQuestionId } from "@/lib/questions/ids";
import { getArcadeWorldsThirtyoneFortyValidationAudit } from "@/lib/practice-audit";

const databaseName = "mastery-platform-db";

async function deleteDatabase() {
  await Dexie.delete(databaseName);
}

describe("arcade worlds thirty-one through forty permanent bank", () => {
  it("contains exactly 500 contiguous permanent levels from 1501 through 2000", () => {
    expect(arcadeWorldsThirtyoneFortyBundles).toHaveLength(500);
    expect(arcadeWorldsThirtyoneFortyBundles.map((bundle) => getArcadeQuestionId(bundle.levelNumber))).toEqual(
      Array.from({ length: 500 }, (_, index) => getArcadeQuestionId(index + 1501)),
    );
  });

  it("keeps 500 unique logic fingerprints and all three validators on every level", () => {
    const fingerprints = arcadeWorldsThirtyoneFortyBundles.map((bundle) => bundle.uniqueLogicFingerprint);

    expect(new Set(fingerprints).size).toBe(500);

    for (const bundle of arcadeWorldsThirtyoneFortyBundles) {
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
    for (let levelNumber = 1501; levelNumber <= 2000; levelNumber += 1) {
      expect(getArcadeWorldsThirtyoneFortyBundle(levelNumber)?.levelNumber).toBe(levelNumber);
      expect(getArcadeBundle(levelNumber)?.levelNumber).toBe(levelNumber);
    }
  });

  it("audits worlds thirty-one through forty as 500/500 validator-backed levels", async () => {
    const audit = await getArcadeWorldsThirtyoneFortyValidationAudit();

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
    expect(audit.nextMissingId).toBe("arcade-q-2001");
  });

  it("accepts level 1501 SQL and PySpark references and rejects representative wrong answers", async () => {
    const bundle = getArcadeWorldsThirtyoneFortyBundle(1501);
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

describe("arcade worlds thirty-one through forty progress persistence", () => {
  beforeEach(async () => {
    vi.resetModules();
    await deleteDatabase();
  });

  afterEach(async () => {
    vi.resetModules();
    await deleteDatabase();
  });

  it("does not unlock level 1502 until all three level 1501 languages pass", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const level = getArcadeWorldsThirtyoneFortyBundle(1501)!;

    await completeCandyArcadeLanguage("candy-arcade-level-1501", "sql", level.sql.referenceSolution, true, 31);
    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-1502"))?.unlocked).toBe(false);

    await completeCandyArcadeLanguage("candy-arcade-level-1501", "python", level.python.referenceSolution, true, 31);
    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-1502"))?.unlocked).toBe(false);

    await completeCandyArcadeLanguage("candy-arcade-level-1501", "pyspark", level.representativeIncorrectAnswers.pyspark, false, 31);
    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-1502"))?.unlocked).toBe(false);

    await completeCandyArcadeLanguage("candy-arcade-level-1501", "pyspark", level.pyspark.referenceSolution, true, 31);
    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-1501"))?.completed).toBe(true);
    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-1502"))?.unlocked).toBe(true);
  });

  it("preserves level 1501 completion and level 1502 unlock after reload", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const level = getArcadeWorldsThirtyoneFortyBundle(1501)!;

    await completeCandyArcadeLanguage("candy-arcade-level-1501", "sql", level.sql.referenceSolution, true, 31);
    await completeCandyArcadeLanguage("candy-arcade-level-1501", "python", level.python.referenceSolution, true, 31);
    await completeCandyArcadeLanguage("candy-arcade-level-1501", "pyspark", level.pyspark.referenceSolution, true, 31);

    await db.close();
    await db.open();

    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-1501"))?.completed).toBe(true);
    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-1502"))?.unlocked).toBe(true);
  });
});
