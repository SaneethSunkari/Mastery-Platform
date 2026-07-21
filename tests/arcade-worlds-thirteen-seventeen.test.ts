import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gradeArcadeLanguage } from "@/lib/arcade-grading";
import { getArcadeBundle } from "@/lib/arcade-bundles";
import {
  arcadeWorldsThirteenSeventeenBundles,
  getArcadeWorldsThirteenSeventeenBundle,
} from "@/lib/arcade-worlds-thirteen-seventeen";
import { getArcadeQuestionId } from "@/lib/questions/ids";
import {
  getArcadeWorldOneValidationAudit,
  getArcadeWorldTwoValidationAudit,
  getArcadeWorldsEightTwelveValidationAudit,
  getArcadeWorldsThirteenSeventeenValidationAudit,
  getArcadeWorldsThreeSevenValidationAudit,
} from "@/lib/practice-audit";

const databaseName = "mastery-platform-db";

async function deleteDatabase() {
  await Dexie.delete(databaseName);
}

describe("arcade worlds thirteen through seventeen permanent bank", () => {
  it("contains exactly 250 contiguous permanent levels from 601 through 850", () => {
    expect(arcadeWorldsThirteenSeventeenBundles).toHaveLength(250);
    expect(
      arcadeWorldsThirteenSeventeenBundles.map((bundle) => getArcadeQuestionId(bundle.levelNumber)),
    ).toEqual(
      Array.from({ length: 250 }, (_, index) => getArcadeQuestionId(index + 601)),
    );
  });

  it("has no duplicate ids or missing ids in the 601-850 range", () => {
    const ids = arcadeWorldsThirteenSeventeenBundles.map((bundle) => getArcadeQuestionId(bundle.levelNumber));
    const expectedIds = Array.from({ length: 250 }, (_, index) => getArcadeQuestionId(index + 601));

    expect(new Set(ids).size).toBe(250);
    expect(expectedIds.filter((id) => !ids.includes(id))).toEqual([]);
  });

  it("keeps 250 unique logic fingerprints and all three validators on every level", () => {
    const fingerprints = arcadeWorldsThirteenSeventeenBundles.map((bundle) => bundle.uniqueLogicFingerprint);

    expect(new Set(fingerprints).size).toBe(250);

    for (const bundle of arcadeWorldsThirteenSeventeenBundles) {
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
    for (let levelNumber = 601; levelNumber <= 850; levelNumber += 1) {
      expect(getArcadeWorldsThirteenSeventeenBundle(levelNumber)?.levelNumber).toBe(levelNumber);
      expect(getArcadeBundle(levelNumber)?.levelNumber).toBe(levelNumber);
    }
  });

  it("audits worlds thirteen through seventeen as 250/250 validator-backed levels", async () => {
    const audit = await getArcadeWorldsThirteenSeventeenValidationAudit();

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
    expect(audit.nextMissingId).toBe("arcade-q-0851");
  });

  it("keeps worlds one through twelve regression audits clean", async () => {
    const worldOne = await getArcadeWorldOneValidationAudit();
    const worldTwo = await getArcadeWorldTwoValidationAudit();
    const worldsThreeSeven = await getArcadeWorldsThreeSevenValidationAudit();
    const worldsEightTwelve = await getArcadeWorldsEightTwelveValidationAudit();

    expect(worldOne.fullyVerifiedCount).toBe(50);
    expect(worldOne.verifiedRequiredSolutionCount).toBe(150);
    expect(worldOne.nextMissingId).toBe("arcade-q-0051");

    expect(worldTwo.fullyVerifiedCount).toBe(50);
    expect(worldTwo.verifiedRequiredSolutionCount).toBe(150);
    expect(worldTwo.nextMissingId).toBe("arcade-q-0101");

    expect(worldsThreeSeven.fullyVerifiedCount).toBe(250);
    expect(worldsThreeSeven.verifiedRequiredSolutionCount).toBe(750);
    expect(worldsThreeSeven.nextMissingId).toBe("arcade-q-0351");

    expect(worldsEightTwelve.fullyVerifiedCount).toBe(250);
    expect(worldsEightTwelve.verifiedRequiredSolutionCount).toBe(750);
    expect(worldsEightTwelve.nextMissingId).toBe("arcade-q-0601");
  });

  it("accepts level 601 references and rejects representative wrong answers", async () => {
    const bundle = getArcadeWorldsThirteenSeventeenBundle(601);
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

describe("arcade worlds thirteen through seventeen progress persistence", () => {
  beforeEach(async () => {
    vi.resetModules();
    await deleteDatabase();
  });

  afterEach(async () => {
    vi.resetModules();
    await deleteDatabase();
  });

  it("keeps level 602 locked when a locked question url is opened before level 601 is solved", async () => {
    const { db, initializeDatabase } = await import("@/lib/db");

    await initializeDatabase();

    const locked = await db.candyArcadeProgress.get(
      "candy-arcade-progress-candy-arcade-level-0602",
    );

    expect(locked?.unlocked).toBe(false);
    expect(getArcadeBundle(602)).toBeTruthy();
  });

  it("does not unlock level 602 until all three level 601 languages pass", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const levelId = "candy-arcade-level-0601";
    const nextLevelId = "candy-arcade-level-0602";
    const level = getArcadeWorldsThirteenSeventeenBundle(601)!;

    const sql = await completeCandyArcadeLanguage(levelId, "sql", level.sql.referenceSolution, true, 13);
    const afterSql = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);
    expect(sql.levelCompleted).toBe(false);
    expect(afterSql?.unlocked).toBe(false);

    const python = await completeCandyArcadeLanguage(levelId, "python", level.python.referenceSolution, true, 13);
    const afterPython = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);
    expect(python.levelCompleted).toBe(false);
    expect(afterPython?.unlocked).toBe(false);

    await completeCandyArcadeLanguage(levelId, "pyspark", level.representativeIncorrectAnswers.pyspark, false, 13);
    const afterWrongPyspark = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);
    expect(afterWrongPyspark?.unlocked).toBe(false);

    const pyspark = await completeCandyArcadeLanguage(levelId, "pyspark", level.pyspark.referenceSolution, true, 13);
    const current = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
    const next = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);

    expect(pyspark.levelCompleted).toBe(true);
    expect(current?.completed).toBe(true);
    expect(next?.unlocked).toBe(true);
  });

  it("preserves level 601 completion and level 602 unlock after reload", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const levelId = "candy-arcade-level-0601";
    const nextLevelId = "candy-arcade-level-0602";
    const level = getArcadeWorldsThirteenSeventeenBundle(601)!;

    await completeCandyArcadeLanguage(levelId, "sql", level.sql.referenceSolution, true, 13);
    await completeCandyArcadeLanguage(levelId, "python", level.python.referenceSolution, true, 13);
    await completeCandyArcadeLanguage(levelId, "pyspark", level.pyspark.referenceSolution, true, 13);

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

  it("unlocks level 851 cleanly after all three level 850 languages pass", async () => {
    const { db, initializeDatabase, completeCandyArcadeLanguage } = await import("@/lib/db");

    await initializeDatabase();
    const levelId = "candy-arcade-level-0850";
    const nextLevelId = "candy-arcade-level-0851";
    const level = getArcadeWorldsThirteenSeventeenBundle(850)!;

    await completeCandyArcadeLanguage(levelId, "sql", level.sql.referenceSolution, true, 17);
    await completeCandyArcadeLanguage(levelId, "python", level.python.referenceSolution, true, 17);
    const completion = await completeCandyArcadeLanguage(levelId, "pyspark", level.pyspark.referenceSolution, true, 17);

    const current = await db.candyArcadeProgress.get(`candy-arcade-progress-${levelId}`);
    const next = await db.candyArcadeProgress.get(`candy-arcade-progress-${nextLevelId}`);

    expect(completion.levelCompleted).toBe(true);
    expect(current?.completed).toBe(true);
    expect(next?.levelId).toBe(nextLevelId);
    expect(next?.unlocked).toBe(true);
  });
});
