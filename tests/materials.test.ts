import { describe, expect, it } from "vitest";
import {
  getMaterialLesson,
  getMaterialLessonsByTrack,
  getMaterialModulesByTrack,
  searchMaterialLessons,
  validateMaterialsCurriculum,
} from "@/lib/materials";

describe("materials curriculum", () => {
  it("passes validation with no broken lesson links", () => {
    expect(validateMaterialsCurriculum()).toEqual([]);
  });

  it("supports track-scoped search", () => {
    const results = searchMaterialLessons("sql", "null");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((lesson) => lesson.track === "sql")).toBe(true);
  });

  it("keeps previous/next links inside the generated lesson graph", () => {
    const pythonLessons = getMaterialLessonsByTrack("python");
    const sample = pythonLessons[5];
    expect(sample).toBeTruthy();
    expect(sample.previousLessonId).toBeTruthy();
    expect(sample.nextLessonId).toBeTruthy();
    expect(getMaterialLesson("python", sample.previousLessonId!)).not.toBeNull();
    expect(getMaterialLesson("python", sample.nextLessonId!)).not.toBeNull();
  });

  it("builds modules that actually contain lesson ids", () => {
    const modules = getMaterialModulesByTrack("pyspark");
    expect(modules.length).toBeGreaterThan(0);
    expect(modules.every((module) => module.lessonIds.length > 0)).toBe(true);
  });
});
