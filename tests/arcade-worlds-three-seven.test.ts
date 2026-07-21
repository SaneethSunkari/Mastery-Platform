import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gradeArcadeLanguage } from "@/lib/arcade-grading";
import { getArcadeBundle } from "@/lib/arcade-bundles";
import {
  arcadeWorldsThreeSevenBundles,
  getArcadeWorldsThreeSevenBundle,
} from "@/lib/arcade-worlds-three-seven";
import { getArcadeQuestionId } from "@/lib/questions/ids";
import {
  getArcadeWorldOneValidationAudit,
  getArcadeWorldTwoValidationAudit,
  getArcadeWorldsThreeSevenValidationAudit,
} from "@/lib/practice-audit";

const databaseName = "mastery-platform-db";

async function deleteDatabase() {
  await Dexie.delete(databaseName);
}

describe("arcade worlds three through seven permanent bank", () => {
  it("contains exactly 250 contiguous permanent levels from 101 through 350", () => {
    expect(arcadeWorldsThreeSevenBundles).toHaveLength(250);
    expect(
      arcadeWorldsThreeSevenBundles.map((bundle) => getArcadeQuestionId(bundle.levelNumber)),
    ).toEqual(
      Array.from({ length: 250 }, (_, index) => getArcadeQuestionId(index + 101)),
    );
  });

  it("has no duplicate ids or missing ids in the 101-350 range", () => {
    const ids = arcadeWorldsThreeSevenBundles.map((bundle) => getArcadeQuestionId(bundle.levelNumber));
    const expectedIds = Array.from({ length: 250 }, (_, index) => getArcadeQuestionId(index + 101));

    expect(new Set(ids).size).toBe(250);
    expect(expectedIds.filter((id) => !ids.includes(id))).toEqual([]);
  });

  it("keeps 250 unique logic fingerprints and all three validators on every level", () => {
    const fingerprints = arcadeWorldsThreeSevenBundles.map((bundle) => bundle.uniqueLogicFingerprint);

    expect(new Set(fingerprints).size).toBe(250);

    for (const bundle of arcadeWorldsThreeSevenBundles) {
      expect(bundle.sharedTask.trim().length).toBeGreaterThan(0);
      expect(bundle.datasetContract.tables.length).toBeGreaterThan(0);
      expect(bundle.datasetContract.tables.every((table) => table.columns.length > 0)).toBe(true);
      expect(bundle.datasetContract.tables.every((table) => table.rows.length > 0)).toBe(true);
      expect(bundle.resultContract.requiredOutputColumns.length).toBeGreaterThan(0);
      expect(bundle.resultContract.expectedRows.length).toBeGreaterThan(0);
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

  it("resolves every new world level from the shared arcade bundle map", () => {
    for (let levelNumber = 101; levelNumber <= 350; levelNumber += 1) {
      expect(getArcadeWorldsThreeSevenBundle(levelNumber)?.levelNumber).toBe(levelNumber);
      expect(getArcadeBundle(levelNumber)?.levelNumber).toBe(levelNumber);
    }
  });

  it("audits worlds three through seven as 250/250 validator-backed levels", async () => {
    const audit = await getArcadeWorldsThreeSevenValidationAudit();

    expect(audit.targetCount).toBe(250);
    expect(audit.displayedCount).toBe(250);
    expect(audit.structurallyValidCount).toBe(250);
    expect(audit.runtimeValidCount).toBe(250);
    expect(audit.uniqueLogicCount).toBe(250);
    expect(audit.fullyVerifiedCount).toBe(250);
    expect(audit.sqlValidatorCount).toBe(250);
    expect(audit.pythonValidatorCount).toBe(250);
    expect(audit.pysparkValidatorCount).toBe(250);
    expect(audit.verifiedRequiredSolutionCount).toBe(750);
    expect(audit.duplicateIds).toEqual([]);
    expect(audit.missingIds).toEqual([]);
    expect(audit.brokenDatasets).toEqual([]);
    expect(audit.brokenContracts).toEqual([]);
    expect(audit.brokenValidators).toEqual([]);
    expect(audit.brokenReferenceSolutions).toEqual([]);
    expect(audit.suspiciousDuplicateClusters).toEqual([]);
    expect(audit.nextMissingId).toBe("arcade-q-0351");
  });

  it("keeps worlds one and two regression audits clean", async () => {
    const worldOne = await getArcadeWorldOneValidationAudit();
    const worldTwo = await getArcadeWorldTwoValidationAudit();

    expect(worldOne.fullyVerifiedCount).toBe(50);
    expect(worldOne.verifiedRequiredSolutionCount).toBe(150);
    expect(worldOne.nextMissingId).toBe("arcade-q-0051");

    expect(worldTwo.fullyVerifiedCount).toBe(50);
    expect(worldTwo.verifiedRequiredSolutionCount).toBe(150);
    expect(worldTwo.nextMissingId).toBe("arcade-q-0101");
  });

  it("accepts level 101 references and rejects representative wrong answers", async () => {
    const bundle = getArcadeWorldsThreeSevenBundle(101);
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

describe("arcade worlds three through seven progress persistence", () => {
  beforeEach(async () => {
    vi.resetModules();
    await deleteDatabase();
  });

  afterEach(async () => {
    vi.resetModules();
    await deleteDatabase();
  });

  it("keeps level 102 locked when a locked question url is opened before level 101 is solved", async () => {
    const { db, initializeDatabase } = await import("@/lib/db");

    await initializeDatabase();

    const locked = await db.candyArcadeProgress.get(
      "candy-arcade-progress-candy-arcade-level-0102",
    );

    expect(locked?.unlocked).toBe(false);
    expect(getArcadeBundle(102)).toBeTruthy();
  });

  it("does not unlock level 102 until all three level 101 languages pass", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const levelId = "candy-arcade-level-0101";
    const nextLevelId = "candy-arcade-level-0102";
    const level = getArcadeWorldsThreeSevenBundle(101)!;

    const sql = await completeCandyArcadeLanguage(levelId, "sql", level.sql.referenceSolution, true, 3);
    const afterSql = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);
    expect(sql.levelCompleted).toBe(false);
    expect(afterSql?.unlocked).toBe(false);

    const python = await completeCandyArcadeLanguage(levelId, "python", level.python.referenceSolution, true, 3);
    const afterPython = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);
    expect(python.levelCompleted).toBe(false);
    expect(afterPython?.unlocked).toBe(false);

    await completeCandyArcadeLanguage(levelId, "pyspark", level.representativeIncorrectAnswers.pyspark, false, 3);
    const afterWrongPyspark = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);
    expect(afterWrongPyspark?.unlocked).toBe(false);

    const pyspark = await completeCandyArcadeLanguage(levelId, "pyspark", level.pyspark.referenceSolution, true, 3);
    const current = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
    const next = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);

    expect(pyspark.levelCompleted).toBe(true);
    expect(current?.completed).toBe(true);
    expect(next?.unlocked).toBe(true);
  });

  it("preserves level 101 completion and level 102 unlock after reload", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const levelId = "candy-arcade-level-0101";
    const nextLevelId = "candy-arcade-level-0102";
    const level = getArcadeWorldsThreeSevenBundle(101)!;

    await completeCandyArcadeLanguage(levelId, "sql", level.sql.referenceSolution, true, 3);
    await completeCandyArcadeLanguage(levelId, "python", level.python.referenceSolution, true, 3);
    await completeCandyArcadeLanguage(levelId, "pyspark", level.pyspark.referenceSolution, true, 3);

    await db.close();
    await db.open();

    const current = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
    const next = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);

    expect(current?.completed).toBe(true);
    expect(current?.sqlCompleted).toBe(true);
    expect(current?.pythonCompleted).toBe(true);
    expect(current?.pysparkCompleted).toBe(true);
    expect(next?.unlocked).toBe(true);
  });

  it("unlocks level 351 cleanly after all three level 350 languages pass", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const levelId = "candy-arcade-level-0350";
    const nextLevelId = "candy-arcade-level-0351";
    const level = getArcadeWorldsThreeSevenBundle(350)!;

    await completeCandyArcadeLanguage(levelId, "sql", level.sql.referenceSolution, true, 7);
    await completeCandyArcadeLanguage(levelId, "python", level.python.referenceSolution, true, 7);
    const completion = await completeCandyArcadeLanguage(levelId, "pyspark", level.pyspark.referenceSolution, true, 7);

    const current = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
    const next = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);

    expect(completion.levelCompleted).toBe(true);
    expect(current?.completed).toBe(true);
    expect(next?.levelId).toBe(nextLevelId);
    expect(next?.unlocked).toBe(true);
  });
});
