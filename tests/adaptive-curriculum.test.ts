import { describe, expect, it } from "vitest";
import { curriculum, curriculumById, curriculumByTechnology, DEFAULT_SQL_DIALECT } from "@/lib/adaptive/curriculum";

describe("adaptive curriculum integrity", () => {
  it("has unique ids and valid prerequisites", () => {
    expect(new Set(curriculum.map((node) => node.id)).size).toBe(curriculum.length);
    for (const node of curriculum) {
      expect(node.skillDimensions.length).toBeGreaterThanOrEqual(7);
      expect(node.targetExposure).toBeGreaterThanOrEqual(20);
      for (const prerequisite of node.prerequisites) expect(curriculumById.has(prerequisite)).toBe(true);
    }
  });

  it("covers comprehensive SQL, Python, and PySpark production areas", () => {
    expect(curriculumByTechnology("sql").length).toBeGreaterThan(250);
    expect(curriculumByTechnology("python").length).toBeGreaterThan(180);
    expect(curriculumByTechnology("pyspark").length).toBeGreaterThan(200);
    expect(DEFAULT_SQL_DIALECT).toBe("PostgreSQL");
    expect(curriculum.some((node) => node.technology === "sql" && node.subtopic === "LAG" && node.skillDimensions.includes("deterministic tie handling"))).toBe(true);
    expect(curriculum.some((node) => node.technology === "python" && node.subtopic === "dynamic programming" && node.targetExposure >= 200)).toBe(true);
    expect(curriculum.some((node) => node.technology === "pyspark" && node.subtopic === "adaptive query execution" && node.targetExposure >= 100)).toBe(true);
  });
});
