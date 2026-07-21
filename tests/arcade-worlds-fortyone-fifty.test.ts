import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gradeArcadeLanguage } from "@/lib/arcade-grading";
import { getArcadeBundle } from "@/lib/arcade-bundles";
import {
  arcadeWorldsFortyoneFiftyBundles,
  getArcadeWorldsFortyoneFiftyBundle,
} from "@/lib/arcade-worlds-fortyone-fifty";
import { getArcadeQuestionId } from "@/lib/questions/ids";
import { getArcadeWorldsFortyoneFiftyValidationAudit } from "@/lib/practice-audit";

const databaseName = "mastery-platform-db";

async function deleteDatabase() {
  await Dexie.delete(databaseName);
}

describe("arcade worlds forty-one through fifty permanent bank", () => {
  it("contains exactly 500 contiguous permanent levels from 2001 through 2500", () => {
    expect(arcadeWorldsFortyoneFiftyBundles).toHaveLength(500);
    expect(arcadeWorldsFortyoneFiftyBundles.map((bundle) => getArcadeQuestionId(bundle.levelNumber))).toEqual(
      Array.from({ length: 500 }, (_, index) => getArcadeQuestionId(index + 2001)),
    );
  });

  it("keeps 500 unique logic fingerprints and all three validators on every level", () => {
    const fingerprints = arcadeWorldsFortyoneFiftyBundles.map((bundle) => bundle.uniqueLogicFingerprint);

    expect(new Set(fingerprints).size).toBe(500);

    for (const bundle of arcadeWorldsFortyoneFiftyBundles) {
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
    for (let levelNumber = 2001; levelNumber <= 2500; levelNumber += 1) {
      expect(getArcadeWorldsFortyoneFiftyBundle(levelNumber)?.levelNumber).toBe(levelNumber);
      expect(getArcadeBundle(levelNumber)?.levelNumber).toBe(levelNumber);
    }
  });

  it("audits worlds forty-one through fifty as 500/500 validator-backed levels", async () => {
    const audit = await getArcadeWorldsFortyoneFiftyValidationAudit();

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
    expect(audit.nextMissingId).toBe("arcade-q-2501");
  });

  it("accepts level 2001 SQL and PySpark references and rejects representative wrong answers", async () => {
    const bundle = getArcadeWorldsFortyoneFiftyBundle(2001);
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

describe("arcade worlds forty-one through fifty progress persistence", () => {
  beforeEach(async () => {
    vi.resetModules();
    await deleteDatabase();
  });

  afterEach(async () => {
    vi.resetModules();
    await deleteDatabase();
  });

  it("does not unlock level 2002 until all three level 2001 languages pass", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const level = getArcadeWorldsFortyoneFiftyBundle(2001)!;

    await completeCandyArcadeLanguage("candy-arcade-level-2001", "sql", level.sql.referenceSolution, true, 41);
    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-2002"))?.unlocked).toBe(false);

    await completeCandyArcadeLanguage("candy-arcade-level-2001", "python", level.python.referenceSolution, true, 41);
    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-2002"))?.unlocked).toBe(false);

    await completeCandyArcadeLanguage("candy-arcade-level-2001", "pyspark", level.representativeIncorrectAnswers.pyspark, false, 41);
    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-2002"))?.unlocked).toBe(false);

    await completeCandyArcadeLanguage("candy-arcade-level-2001", "pyspark", level.pyspark.referenceSolution, true, 41);
    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-2001"))?.completed).toBe(true);
    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-2002"))?.unlocked).toBe(true);
  });

  it("preserves level 2001 completion and level 2002 unlock after reload", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const level = getArcadeWorldsFortyoneFiftyBundle(2001)!;

    await completeCandyArcadeLanguage("candy-arcade-level-2001", "sql", level.sql.referenceSolution, true, 41);
    await completeCandyArcadeLanguage("candy-arcade-level-2001", "python", level.python.referenceSolution, true, 41);
    await completeCandyArcadeLanguage("candy-arcade-level-2001", "pyspark", level.pyspark.referenceSolution, true, 41);

    await db.close();
    await db.open();

    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-2001"))?.completed).toBe(true);
    expect((await db.candyArcadeProgress.get("candy-arcade-progress-candy-arcade-level-2002"))?.unlocked).toBe(true);
  });
});
