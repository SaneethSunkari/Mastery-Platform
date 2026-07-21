import { describe, expect, it } from "vitest";
import { findLessonByQuestionId } from "@/lib/questions/registry";
import {
  getPythonWeekOneQuestionIds,
  pythonWeekOneQuestions,
  resolvePythonWeekOneQuestionId,
} from "@/lib/questions/python-week-one";

describe("python week one permanent bank", () => {
  it("contains exactly 125 contiguous permanent questions", () => {
    const ids = getPythonWeekOneQuestionIds();

    expect(pythonWeekOneQuestions).toHaveLength(125);
    expect(ids).toEqual(
      Array.from({ length: 125 }, (_, index) => `python-q-${String(index + 1).padStart(4, "0")}`),
    );
  });

  it("keeps every question reachable through the registry and fully populated", () => {
    for (const question of pythonWeekOneQuestions) {
      expect(findLessonByQuestionId(question.id)?.id).toBe(question.lessonId);
      expect(question.prompt.trim().length).toBeGreaterThan(0);
      expect(question.referenceSolution.trim().length).toBeGreaterThan(0);
      expect(question.visibleCases.length).toBeGreaterThan(0);
      expect(question.hiddenCases.length).toBeGreaterThan(0);
      expect(question.validatorVersion).toBeGreaterThan(0);
    }
  });

  it("resolves locked and unlocked route requests against the current allowed question", () => {
    const progress = [
      { questionId: "python-q-0001", status: "completed" as const },
      { questionId: "python-q-0002", status: "completed" as const },
      { questionId: "python-q-0003", status: "unlocked" as const },
      { questionId: "python-q-0004", status: "locked" as const },
    ];

    expect(
      resolvePythonWeekOneQuestionId(progress, "python-q-0002", "python-q-0003"),
    ).toEqual({
      questionId: "python-q-0002",
      reason: "requested",
    });

    expect(
      resolvePythonWeekOneQuestionId(progress, "python-q-0004", "python-q-0002"),
    ).toEqual({
      questionId: "python-q-0003",
      reason: "locked-request",
    });

    expect(
      resolvePythonWeekOneQuestionId(progress, null, "python-q-0001"),
    ).toEqual({
      questionId: "python-q-0003",
      reason: "resume",
    });
  });
});
