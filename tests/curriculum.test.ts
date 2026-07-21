import { describe, expect, it } from "vitest";
import {
  courses,
  getCourseCoverageSummary,
  getLessonsByWeek,
  getWeeksByCourse,
  validateCurriculumStructure,
} from "@/lib/curriculum";
import { validateMaterialsCurriculum } from "@/lib/materials";

describe("curriculum structure", () => {
  it("keeps every track at 24 reachable weeks", () => {
    const coverage = getCourseCoverageSummary();
    const bySlug = Object.fromEntries(coverage.map((item) => [item.courseSlug, item]));

    expect(coverage).toHaveLength(3);
    expect(bySlug.sql).toMatchObject({
      expectedWeeks: 24,
      actualWeeks: 24,
      firstWeek: 1,
      lastWeek: 24,
      lessonCount: 72,
    });
    expect(bySlug.python).toMatchObject({
      expectedWeeks: 24,
      actualWeeks: 24,
      firstWeek: 1,
      lastWeek: 24,
      lessonCount: 194,
    });
    expect(bySlug.pyspark).toMatchObject({
      expectedWeeks: 24,
      actualWeeks: 24,
      firstWeek: 1,
      lastWeek: 24,
      lessonCount: 194,
    });
  });

  it("keeps week numbers contiguous for each course", () => {
    for (const course of courses) {
      const weekNumbers = getWeeksByCourse(course.slug).map((week) => week.weekNumber);
      expect(weekNumbers).toEqual(Array.from({ length: 24 }, (_, index) => index + 1));
    }
  });

  it("ensures each week still maps to the generated lesson lane", () => {
    for (const course of courses) {
      const weeks = getWeeksByCourse(course.slug);
      for (const week of weeks) {
        expect(getLessonsByWeek(week.id)).toHaveLength(week.guidedLessons.length);
        expect(week.guidedLessons.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("passes the raw curriculum validator and the materials validator", () => {
    expect(validateCurriculumStructure()).toEqual([]);
    expect(validateMaterialsCurriculum()).toEqual([]);
  });
});
