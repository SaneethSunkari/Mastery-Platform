import { describe, expect, it } from "vitest";
import { createSkillState, updateSkillState } from "@/lib/adaptive/mastery";
import type { EvaluationResult } from "@/lib/adaptive/types";

const correct: EvaluationResult = { verdict: "correct", score: 100, doneWell: [], improvements: [], mistakeClassification: "none", runtimeResult: "passed", explanation: "", suggestedNextAction: "", hiddenTestsPassed: true, runtimePassed: true, validatorPassed: true };

describe("mastery progression", () => {
  it("never grants mastery after one correct answer", () => {
    const state = updateSkillState(createSkillState("sql-foundations-select"), correct, ["syntax"]);
    expect(state.status).toBe("learning");
    expect(state.masteryScore).toBeLessThan(50);
  });

  it("penalizes hint dependence and requires spaced review for interview readiness", () => {
    let independent = createSkillState("node");
    let hinted = createSkillState("node");
    const dimensions = ["a", "b", "c", "d", "e", "f"];
    for (let index = 0; index < 35; index += 1) {
      independent = updateSkillState(independent, correct, dimensions, { review: index === 20 || index === 30, interview: index === 34 });
      hinted = updateSkillState(hinted, correct, dimensions, { usedHint: true, review: index === 20 || index === 30, interview: index === 34 });
    }
    expect(independent.status).toBe("interview-ready");
    expect(hinted.status).not.toBe("interview-ready");
    expect(hinted.masteryScore).toBeLessThan(independent.masteryScore);
    expect(new Date(independent.nextReviewAt).getTime()).toBeGreaterThan(new Date(independent.lastPracticedAt).getTime());
  });
});
