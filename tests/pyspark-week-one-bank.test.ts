import { describe, expect, it } from "vitest";
import { findLessonByQuestionId } from "@/lib/questions/registry";
import {
  getPysparkWeekOneQuestionIds,
  pysparkWeekOneQuestions,
  resolvePysparkWeekOneQuestionId,
} from "@/lib/questions/pyspark-week-one";

describe("pyspark week one permanent bank", () => {
  it("contains exactly 125 contiguous permanent questions", () => {
    const ids = getPysparkWeekOneQuestionIds();

    expect(pysparkWeekOneQuestions).toHaveLength(125);
    expect(ids).toEqual(
      Array.from(
        { length: 125 },
        (_, index) => `pyspark-q-${String(index + 1).padStart(4, "0")}`,
      ),
    );
  });

  it("keeps every question reachable, fingerprinted, and validator-backed", () => {
    expect(
      new Set(pysparkWeekOneQuestions.map((question) => question.uniqueLogicFingerprint)).size,
    ).toBe(125);

    for (const question of pysparkWeekOneQuestions) {
      expect(findLessonByQuestionId(question.id)?.id).toBe(question.lessonId);
      expect(question.prompt.trim().length).toBeGreaterThan(0);
      expect(question.referenceSolution.trim().length).toBeGreaterThan(0);
      expect(question.resultExpectation.trim().length).toBeGreaterThan(0);
      expect(question.requirements.length).toBeGreaterThan(0);
      expect(question.validatorVersion).toBeGreaterThan(0);
      expect(question.negativeSubmission.trim().length).toBeGreaterThan(0);
    }
  });

  it("resolves locked and unlocked route requests against the current allowed question", () => {
    const progress = [
      { questionId: "pyspark-q-0001", status: "completed" as const },
      { questionId: "pyspark-q-0002", status: "completed" as const },
      { questionId: "pyspark-q-0003", status: "unlocked" as const },
      { questionId: "pyspark-q-0004", status: "locked" as const },
    ];

    expect(
      resolvePysparkWeekOneQuestionId(progress, "pyspark-q-0002", "pyspark-q-0003"),
    ).toEqual({
      questionId: "pyspark-q-0002",
      reason: "requested",
    });

    expect(
      resolvePysparkWeekOneQuestionId(progress, "pyspark-q-0004", "pyspark-q-0002"),
    ).toEqual({
      questionId: "pyspark-q-0003",
      reason: "locked-request",
    });

    expect(
      resolvePysparkWeekOneQuestionId(progress, null, "pyspark-q-0001"),
    ).toEqual({
      questionId: "pyspark-q-0003",
      reason: "resume",
    });
  });
});
