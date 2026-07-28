import { describe, expect, it } from "vitest";
import { applyOutcome, emptyProgress } from "@/lib/adaptive/progress";
import type { EvaluationResult } from "@/lib/adaptive/types";

const result = (correct: boolean): EvaluationResult => ({ verdict: correct ? "correct" : "incorrect", score: correct ? 100 : 0, doneWell: [], improvements: [], mistakeClassification: correct ? "none" : "failure", runtimeResult: "", explanation: "", suggestedNextAction: "", hiddenTestsPassed: correct, runtimePassed: false, validatorPassed: correct });

describe("arcade completion", () => {
  it("increments only when the full three-solution mission passes", () => {
    const initial = emptyProgress();
    const failed = applyOutcome(initial, { technology: "arcade", curriculumNodeId: "arcade-cross-language", dimensions: [], evaluation: result(false), arcadeComplete: false });
    expect(failed.arcadeCompleted).toBe(0);
    const passed = applyOutcome(failed, { technology: "arcade", curriculumNodeId: "arcade-cross-language", dimensions: [], evaluation: result(true), arcadeComplete: true });
    expect(passed.arcadeCompleted).toBe(1);
  });
});
