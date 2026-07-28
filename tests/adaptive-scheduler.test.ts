import { describe, expect, it } from "vitest";
import { emptyProgress } from "@/lib/adaptive/progress";
import { scheduleTarget } from "@/lib/adaptive/scheduler";
import { createSkillState } from "@/lib/adaptive/mastery";

describe("adaptive scheduler", () => {
  it("maps rolls to the documented distribution", () => {
    const progress = emptyProgress();
    expect(scheduleTarget("sql", progress, 0).reason).toBe("weak");
    expect(scheduleTarget("sql", progress, 45).reason).toBe("neighbor");
    expect(scheduleTarget("sql", progress, 65).reason).toBe("review");
    expect(scheduleTarget("sql", progress, 80).reason).toBe("new");
    expect(scheduleTarget("sql", progress, 90).reason).toBe("interview");
    expect(scheduleTarget("sql", progress, 99).reason).toBe("stretch");
  });

  it("prioritizes due reviews and weak skills deterministically", () => {
    const progress = emptyProgress();
    const due = createSkillState("sql-foundations-select");
    due.attempted = 4; due.masteryScore = 20; due.nextReviewAt = new Date(0).toISOString();
    progress.skills[due.curriculumNodeId] = due;
    expect(scheduleTarget("sql", progress, 65, new Date()).node.id).toBe(due.curriculumNodeId);
    expect(scheduleTarget("sql", progress, 0, new Date()).node.id).toBe(due.curriculumNodeId);
  });
});
