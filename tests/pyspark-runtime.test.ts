import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { hasPysparkRuntime, PYSPARK_RUNTIME_QUESTION_IDS } from "@/lib/pyspark-runtime-contract";
import { getPysparkRuntimeQuestionIds, getPysparkRuntimeSpec } from "@/lib/pyspark-runtime-specs";
import { getPysparkWeekOneQuestionById } from "@/lib/questions/pyspark-week-one";

describe("PySpark runtime registry", () => {
  it("maps the runtime slice to stable permanent questions and explicit expectations", () => {
    expect(getPysparkRuntimeQuestionIds()).toEqual(PYSPARK_RUNTIME_QUESTION_IDS);
    for (const questionId of PYSPARK_RUNTIME_QUESTION_IDS) {
      const question = getPysparkWeekOneQuestionById(questionId);
      const spec = getPysparkRuntimeSpec(questionId);
      expect(question?.validationKind).toBe("structural");
      expect(spec?.questionId).toBe(questionId);
      expect(spec?.expectedColumns.length).toBeGreaterThan(0);
      expect(spec?.expectedRows.length).toBeGreaterThan(0);
      expect(hasPysparkRuntime(questionId)).toBe(true);
    }
  });

  it("does not claim runtime support for an unregistered question", () => {
    expect(hasPysparkRuntime("pyspark-q-0001")).toBe(false);
    expect(getPysparkRuntimeSpec("pyspark-q-0001")).toBeNull();
  });
});
