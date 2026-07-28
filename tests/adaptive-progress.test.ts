import { describe, expect, it } from "vitest";
import { applyOutcome, emptyProgress, isDuplicateFingerprint, masteryForTechnology, parseProgress, totalCompleted } from "@/lib/adaptive/progress";
import type { EvaluationResult, QuestionFingerprint } from "@/lib/adaptive/types";

const correct: EvaluationResult = { verdict: "correct", score: 100, doneWell: [], improvements: [], mistakeClassification: "none", runtimeResult: "passed", explanation: "", suggestedNextAction: "", hiddenTestsPassed: true, runtimePassed: true, validatorPassed: true };
const fingerprint: QuestionFingerprint = { technology: "sql", topic: "Ranking", subtopic: "ROW_NUMBER", pattern: "top n per group", scenario: "latest orders", difficulty: 3, skills: ["ties"], schemaSignature: "orders(customer_id,at)" };

describe("adaptive progress", () => {
  it("round-trips persistence, counts dashboard totals, and resets invalid state", () => {
    let progress = emptyProgress();
    progress = applyOutcome(progress, { technology: "sql", curriculumNodeId: "sql-ranking-row-number", dimensions: ["ties"], evaluation: correct, fingerprint });
    progress.arcadeCompleted = 2;
    const restored = parseProgress(JSON.stringify(progress));
    expect(restored.solved.sql).toBe(1);
    expect(totalCompleted(restored)).toBe(3);
    expect(masteryForTechnology(restored, "sql")).toBeGreaterThan(0);
    expect(parseProgress("not-json")).toEqual(emptyProgress());
  });

  it("prevents exact and near-duplicate fingerprints", () => {
    expect(isDuplicateFingerprint(fingerprint, [fingerprint])).toBe(true);
    expect(isDuplicateFingerprint({ ...fingerprint, scenario: "latest customer orders" }, [fingerprint])).toBe(true);
    expect(isDuplicateFingerprint({ ...fingerprint, topic: "Aggregation", subtopic: "SUM", pattern: "monthly totals", scenario: "invoice revenue", skills: ["nulls"], schemaSignature: "invoices(month,amount)" }, [fingerprint])).toBe(false);
  });
});
