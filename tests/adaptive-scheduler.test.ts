import { describe, expect, it } from "vitest";
import { emptyProgress } from "@/lib/adaptive/progress";
import { scheduleTarget } from "@/lib/adaptive/scheduler";
import { createSkillState } from "@/lib/adaptive/mastery";
import { DIAGNOSTIC_NODE_IDS } from "@/lib/adaptive/diagnostic";

function completeDiagnostic(progress: ReturnType<typeof emptyProgress>, technology: "sql" | "python" | "pyspark") {
  progress.diagnostics[technology] = { started: true, shortened: false, completedNodeIds: [...DIAGNOSTIC_NODE_IDS[technology]] };
}

describe("adaptive scheduler", () => {
  it("always starts a new learner with the controlled diagnostic", () => {
    const progress = emptyProgress();
    for (const roll of [0, 45, 65, 80, 90, 99]) {
      const target = scheduleTarget("sql", progress, roll);
      expect(target.reason).toBe("diagnostic");
      expect(target.node.id).toBe("sql-foundations-select");
      expect(target.difficulty).toBe(1);
    }
  });

  it("maps rolls to the documented distribution after diagnostics", () => {
    const progress = emptyProgress();
    completeDiagnostic(progress, "sql");
    expect(scheduleTarget("sql", progress, 0).reason).toBe("weak");
    expect(scheduleTarget("sql", progress, 45).reason).toBe("neighbor");
    expect(scheduleTarget("sql", progress, 65).reason).toBe("review");
    expect(scheduleTarget("sql", progress, 80).reason).toBe("new");
    expect(scheduleTarget("sql", progress, 90).reason).toBe("interview");
    expect(scheduleTarget("sql", progress, 99).reason).toBe("stretch");
  });

  it("prioritizes due reviews and weak skills deterministically", () => {
    const progress = emptyProgress();
    completeDiagnostic(progress, "sql");
    const due = createSkillState("sql-foundations-select");
    due.attempted = 4; due.masteryScore = 20; due.nextReviewAt = new Date(0).toISOString();
    progress.skills[due.curriculumNodeId] = due;
    expect(scheduleTarget("sql", progress, 65, new Date()).node.id).toBe(due.curriculumNodeId);
    expect(scheduleTarget("sql", progress, 0, new Date()).node.id).toBe(due.curriculumNodeId);
  });
});
