import { describe, expect, it } from "vitest";
import {
  availableMasteryExercises,
  getMasteryExerciseForLesson,
  gradePysparkSubmission,
} from "@/lib/mastery-exercises";
import { lessons } from "@/lib/curriculum";

describe("mastery exercises", () => {
  it("creates runtime or structural exercises for every python and pyspark lesson", () => {
    const expectedCount = lessons.filter(
      (lesson) => lesson.courseSlug === "python" || lesson.courseSlug === "pyspark",
    ).length;

    expect(availableMasteryExercises).toHaveLength(expectedCount);
  });

  it("returns a python runtime definition for a python lesson", () => {
    const lesson = lessons.find((item) => item.courseSlug === "python");
    expect(lesson).toBeTruthy();
    const exercise = getMasteryExerciseForLesson(lesson!.id);
    expect(exercise?.gradingMode).toBe("python-runtime");
    expect(exercise?.python?.visibleCases.length).toBeGreaterThan(0);
  });

  it("passes structural validation for a valid pyspark submission", () => {
    const lesson = lessons.find((item) => {
      if (item.courseSlug !== "pyspark") return false;
      const exercise = getMasteryExerciseForLesson(item.id);
      return exercise?.pyspark?.validationKind !== "conceptual";
    });
    expect(lesson).toBeTruthy();
    const exercise = getMasteryExerciseForLesson(lesson!.id);
    expect(exercise?.pyspark).toBeTruthy();

    const passingSource = [
      "from pyspark.sql import functions as F",
      "from pyspark.sql import Window",
      ...exercise!.pyspark!.requirements.map((item) => item.anyOf[0]),
      ...exercise!.pyspark!.hiddenRequirements.map((item) => item.anyOf[0]),
    ].join("\n");

    const result = gradePysparkSubmission(exercise!, passingSource);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
  });

  it("fails structural validation when required transformations are missing", () => {
    const lesson = lessons.find((item) => {
      if (item.courseSlug !== "pyspark") return false;
      const exercise = getMasteryExerciseForLesson(item.id);
      return exercise?.pyspark?.validationKind !== "conceptual";
    });
    expect(lesson).toBeTruthy();
    const exercise = getMasteryExerciseForLesson(lesson!.id);
    const result = gradePysparkSubmission(exercise!, "result = df");
    expect(result.passed).toBe(false);
    expect(result.feedback.length).toBeGreaterThan(0);
  });
});
