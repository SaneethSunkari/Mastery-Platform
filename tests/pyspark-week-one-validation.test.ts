import { describe, expect, it } from "vitest";
import { gradePysparkDefinition } from "@/lib/mastery-exercises";
import {
  getPysparkWeekOneDefinition,
  pysparkWeekOneQuestions,
} from "@/lib/questions/pyspark-week-one";

function buildEquivalentConceptualSubmission(question: (typeof pysparkWeekOneQuestions)[number]) {
  const equivalent =
    question.acceptedAnswers && question.acceptedAnswers.length > 1
      ? question.acceptedAnswers[1]
      : question.acceptedAnswers?.[0];

  return equivalent ? `answer = ${JSON.stringify(equivalent)}\n` : null;
}

describe("pyspark week one validation", () => {
  it("passes every reference solution", () => {
    const failures = pysparkWeekOneQuestions
      .filter((question) => {
        const result = gradePysparkDefinition(
          getPysparkWeekOneDefinition(question),
          question.referenceSolution,
        );
        return !result.passed;
      })
      .map((question) => question.id);

    expect(failures).toEqual([]);
  });

  it("fails representative incorrect submissions for every question", () => {
    const unexpectedPasses = pysparkWeekOneQuestions
      .filter((question) => {
        const result = gradePysparkDefinition(
          getPysparkWeekOneDefinition(question),
          question.negativeSubmission,
        );
        return result.passed;
      })
      .map((question) => question.id);

    expect(unexpectedPasses).toEqual([]);
  });

  it("accepts equivalent conceptual answers where alternate wording is provided", () => {
    const equivalentQuestions = pysparkWeekOneQuestions.filter(
      (question) =>
        question.validationKind === "conceptual" &&
        question.acceptedAnswers &&
        question.acceptedAnswers.length > 1,
    );

    const failures = equivalentQuestions
      .filter((question) => {
        const submission = buildEquivalentConceptualSubmission(question);
        if (!submission) {
          return true;
        }

        const result = gradePysparkDefinition(
          getPysparkWeekOneDefinition(question),
          submission,
        );
        return !result.passed;
      })
      .map((question) => question.id);

    expect(equivalentQuestions.length).toBeGreaterThan(0);
    expect(failures).toEqual([]);
  });
});
