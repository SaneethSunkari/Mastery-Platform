import { describe, expect, it } from "vitest";
import {
  formatPracticeValidationReport,
  getPysparkWeekOneValidationAudit,
  getPythonWeekOneValidationAudit,
  getPracticeValidationReport,
} from "@/lib/practice-audit";

describe("practice validation audit", () => {
  it("reports target, displayed, and verified counts distinctly", () => {
    const report = getPracticeValidationReport();

    expect(report.tracks.sql.targetCount).toBe(3000);
    expect(report.tracks.sql.displayedCount).toBe(3000);
    expect(report.tracks.sql.runtimeValidCount).toBe(3000);
    expect(report.tracks.sql.fullyVerifiedCount).toBe(3000);
    expect(report.tracks.sql.uniqueLogicCount).toBe(3000);
    expect(report.tracks.sql.stableIdCount).toBe(3000);
    expect(report.tracks.sql.nextMissingId).toBeNull();

    expect(report.tracks.python.displayedCount).toBe(3000);
    expect(report.tracks.python.runtimeValidCount).toBe(3000);
    expect(report.tracks.python.fullyVerifiedCount).toBe(3000);
    expect(report.tracks.python.uniqueLogicCount).toBe(3000);
    expect(report.tracks.python.nextMissingId).toBeNull();

    expect(report.tracks.pyspark.displayedCount).toBe(3000);
    expect(report.tracks.pyspark.structurallyValidCount).toBe(3000);
    expect(report.tracks.pyspark.runtimeValidCount).toBe(9);
    expect(report.tracks.pyspark.fullyVerifiedCount).toBe(9);
    expect(report.tracks.pyspark.uniqueLogicCount).toBe(3000);
    expect(report.tracks.pyspark.nextMissingId).toBeNull();
  });

  it("keeps arcade honesty: all 3000 displayed levels are fully validator-backed", () => {
    const report = getPracticeValidationReport();

    expect(report.arcade.levels.displayedCount).toBe(3000);
    expect(report.arcade.levels.structurallyValidCount).toBe(3000);
    expect(report.arcade.levels.runtimeValidCount).toBe(3000);
    expect(report.arcade.levels.fullyVerifiedCount).toBe(3000);
    expect(report.arcade.levels.stableIdCount).toBe(3000);
    expect(report.arcade.levels.uniqueLogicCount).toBe(3000);
    expect(report.arcade.levels.nextMissingId).toBeNull();
    for (let index = 0; index < 60; index += 1) {
      expect(report.arcade.worldCoverage[index]).toEqual({
        worldNumber: index + 1,
        displayedCount: 50,
        fullyVerifiedCount: 50,
        targetCount: 50,
      });
    }
    expect(report.arcade.worldCoverage[22]).toEqual({
      worldNumber: 23,
      displayedCount: 50,
      fullyVerifiedCount: 50,
      targetCount: 50,
    });
    expect(report.arcade.worldCoverage[30]).toEqual({
      worldNumber: 31,
      displayedCount: 50,
      fullyVerifiedCount: 50,
      targetCount: 50,
    });
    expect(report.arcade.worldCoverage[40]).toEqual({
      worldNumber: 41,
      displayedCount: 50,
      fullyVerifiedCount: 50,
      targetCount: 50,
    });
    expect(report.arcade.validators).toEqual({
      sqlCount: 3000,
      pythonCount: 3000,
      pysparkCount: 3000,
      verifiedSolutionCount: 9000,
    });
    expect(report.arcade.suspiciousDuplicateClusters).toEqual([]);
  });

  it("formats a compact report from calculated values", () => {
    const report = getPracticeValidationReport();
    const textReport = formatPracticeValidationReport(report);

    expect(textReport).toContain("SQL displayed: 3000/3000");
    expect(textReport).toContain("SQL fully verified: 3000/3000");
    expect(textReport).toContain("Arcade displayed: 3000/3000");
    expect(textReport).toContain("Arcade fully verified: 3000/3000");
    expect(textReport).toContain("Duplicate IDs: 0");
  });

  it("calculates the Python Week 1 bank honestly from the registered permanent questions", () => {
    const audit = getPythonWeekOneValidationAudit();

    expect(audit.targetCount).toBe(125);
    expect(audit.displayedCount).toBe(125);
    expect(audit.runtimeValidCount).toBe(125);
    expect(audit.uniqueLogicCount).toBe(125);
    expect(audit.fullyVerifiedCount).toBe(125);
    expect(audit.missingIds).toEqual([]);
    expect(audit.duplicateIds).toEqual([]);
    expect(audit.brokenFixtures).toEqual([]);
    expect(audit.brokenValidators).toEqual([]);
    expect(audit.brokenReferenceSolutions).toEqual([]);
  });

  it("calculates the PySpark Week 1 bank honestly from the registered permanent questions", () => {
    const audit = getPysparkWeekOneValidationAudit();

    expect(audit.targetCount).toBe(125);
    expect(audit.displayedCount).toBe(125);
    expect(audit.structurallyValidCount).toBe(125);
    expect(audit.uniqueLogicCount).toBe(125);
    expect(audit.fullyVerifiedCount).toBe(125);
    expect(audit.missingIds).toEqual([]);
    expect(audit.duplicateIds).toEqual([]);
    expect(audit.brokenValidators).toEqual([]);
    expect(audit.brokenReferenceSolutions).toEqual([]);
    expect(audit.failingNegativeCases).toEqual([]);
  });
});
