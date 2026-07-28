import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("adaptive runtime honesty", () => {
  it("labels PySpark structural validation without awarding runtime evidence", async () => {
    const { executeAnswer } = await import("@/lib/adaptive/server/runtime");
    const result = await executeAnswer({
      id: "spark", technology: "pyspark", curriculumNodeId: "pyspark-selection-select", topic: "Selection", subtopic: "select", difficulty: 1, exerciseMode: "write_from_scratch", prerequisiteIds: [], diagnosticQuestion: false, learnerInstructions: "Write the transformation.", title: "Select", scenario: "orders", prompt: "Select id", schema: {}, sampleData: {}, expectedBehavior: [], hiddenTests: [], referenceSolution: "result_df = orders_df.select('id')", starterCode: "# Write your transformation here\nresult_df = None", rubric: [], skillDimensions: ["select"], fingerprint: { technology: "pyspark", topic: "Selection", subtopic: "select", pattern: "projection", scenario: "orders", difficulty: 1, skills: ["select"], schemaSignature: "orders(id)" },
    }, "result_df = orders_df.select('id')");
    expect(result.passed).toBe(true);
    expect(result.mode).toBe("structural");
    expect(result.runtimePassed).toBe(false);
    expect(result.summary).toContain("Real Spark was not executed");
  });
});
