import { describe, expect, it } from "vitest";
import { gradeArcadeLanguage } from "@/lib/arcade-grading";
import { arcadeWorldOneBundles, getArcadeWorldOneBundle } from "@/lib/arcade-world-one";
import { pysparkWeekOneExerciseSeeds } from "@/lib/pyspark-week-one";
import { pythonWeekOneExerciseSeeds } from "@/lib/python-week-one";

describe("week one content banks", () => {
  it("keeps Python Week 1 at exactly 125 runtime-authored questions", () => {
    expect(pythonWeekOneExerciseSeeds).toHaveLength(125);
    expect(new Set(pythonWeekOneExerciseSeeds.map((seed) => seed.title)).size).toBe(125);

    for (const seed of pythonWeekOneExerciseSeeds) {
      expect(seed.prompt.trim().length).toBeGreaterThan(0);
      expect(seed.referenceSolution.trim().length).toBeGreaterThan(0);
      expect(seed.visibleCases.length).toBeGreaterThan(0);
      expect(seed.hiddenCases.length).toBeGreaterThan(0);
    }
  });

  it("keeps PySpark Week 1 at exactly 125 structurally or conceptually verified questions", () => {
    expect(pysparkWeekOneExerciseSeeds).toHaveLength(125);
    expect(new Set(pysparkWeekOneExerciseSeeds.map((seed) => seed.title)).size).toBe(125);

    for (const seed of pysparkWeekOneExerciseSeeds) {
      expect(seed.prompt.trim().length).toBeGreaterThan(0);
      expect(seed.referenceSolution.trim().length).toBeGreaterThan(0);
      expect(seed.resultExpectation.trim().length).toBeGreaterThan(0);
      expect(seed.requirements.length).toBeGreaterThan(0);
    }
  });
});

describe("arcade world one", () => {
  it("contains exactly 50 contiguous levels with the required category distribution", () => {
    expect(arcadeWorldOneBundles).toHaveLength(50);
    expect(arcadeWorldOneBundles.map((bundle) => bundle.levelNumber)).toEqual(
      Array.from({ length: 50 }, (_, index) => index + 1),
    );

    const counts = arcadeWorldOneBundles.reduce<Record<string, number>>((acc, bundle) => {
      acc[bundle.category] = (acc[bundle.category] ?? 0) + 1;
      return acc;
    }, {});

    expect(counts).toEqual({
      projection: 8,
      filtering: 8,
      "sorting-limiting": 5,
      "null-handling": 5,
      deduplication: 5,
      "derived-column": 5,
      aggregation: 5,
      "string-cleaning": 4,
      "date-filtering": 3,
      debugging: 2,
    });
  });

  it("keeps all three language validators populated for every World 1 level", () => {
    for (const bundle of arcadeWorldOneBundles) {
      expect(bundle.sql.referenceSolution.trim().length).toBeGreaterThan(0);
      expect(bundle.sql.setupSql.trim().length).toBeGreaterThan(0);
      expect(bundle.python.referenceSolution.trim().length).toBeGreaterThan(0);
      expect(bundle.python.visibleCases.length).toBeGreaterThan(0);
      expect(bundle.python.hiddenCases.length).toBeGreaterThan(0);
      expect(bundle.pyspark.referenceSolution.trim().length).toBeGreaterThan(0);
      expect(bundle.pyspark.requirements.length).toBeGreaterThan(0);
      expect(bundle.pyspark.resultExpectation.trim().length).toBeGreaterThan(0);
    }
  });

  it("accepts reference solutions and rejects representative incorrect SQL and PySpark answers", async () => {
    const bundle = getArcadeWorldOneBundle(1);
    expect(bundle).toBeTruthy();

    const sqlPass = await gradeArcadeLanguage(bundle!, "sql", bundle!.sql.referenceSolution);
    const sqlFail = await gradeArcadeLanguage(bundle!, "sql", "SELECT 1 AS nope;");
    const pysparkPass = await gradeArcadeLanguage(bundle!, "pyspark", bundle!.pyspark.referenceSolution);
    const pysparkFail = await gradeArcadeLanguage(bundle!, "pyspark", "result = orders_df");

    expect(sqlPass.passed).toBe(true);
    expect(sqlFail.passed).toBe(false);
    expect(pysparkPass.passed).toBe(true);
    expect(pysparkFail.passed).toBe(false);
  });
});
