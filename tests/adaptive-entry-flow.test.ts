import { describe, expect, it, vi } from "vitest";
import { curriculumById } from "@/lib/adaptive/curriculum";
import { DIAGNOSTIC_NODE_IDS } from "@/lib/adaptive/diagnostic";
import { createSkillState } from "@/lib/adaptive/mastery";
import { emptyProgress, parseProgress } from "@/lib/adaptive/progress";
import { allowedDifficulty, nodeEligible, scheduleTarget } from "@/lib/adaptive/scheduler";
import type { GeneratedQuestion, ProgressState, Technology } from "@/lib/adaptive/types";

vi.mock("server-only", () => ({}));

function completeDiagnostic(progress: ProgressState, technology: Technology) {
  progress.diagnostics[technology] = { started: true, shortened: false, completedNodeIds: [...DIAGNOSTIC_NODE_IDS[technology]] };
}

function passPrerequisite(progress: ProgressState, nodeId: string) {
  const state = createSkillState(nodeId);
  state.attempted = 4;
  state.correct = 3;
  state.recentAccuracy = 0.75;
  state.masteryScore = 50;
  state.currentDifficulty = 2;
  state.testedDimensions = ["syntax", "correctness"];
  progress.skills[nodeId] = state;
}

describe("adaptive learning entry and progression", () => {
  it.each([
    ["sql", "sql-foundations-select"],
    ["python", "python-foundations-variables"],
    ["pyspark", "pyspark-dataframe-creation-lists"],
  ] as const)("starts %s with the first controlled diagnostic", (technology, firstNodeId) => {
    const progress = emptyProgress();
    expect(scheduleTarget(technology, progress, 99).node.id).toBe(firstNodeId);
    progress.diagnostics[technology].started = true;
    for (const expectedNodeId of DIAGNOSTIC_NODE_IDS[technology]) {
      expect(scheduleTarget(technology, progress, 99).node.id).toBe(expectedNodeId);
      progress.diagnostics[technology].completedNodeIds.push(expectedNodeId);
    }
  });

  it("never unlocks LAG after a single correct SELECT answer", () => {
    const progress = emptyProgress();
    completeDiagnostic(progress, "sql");
    const select = createSkillState("sql-foundations-select");
    select.attempted = 1;
    select.correct = 1;
    select.recentAccuracy = 1;
    select.masteryScore = 30;
    progress.skills[select.curriculumNodeId] = select;
    expect(allowedDifficulty(curriculumById.get(select.curriculumNodeId)!, progress).max).toBe(1);
    expect(nodeEligible(curriculumById.get("sql-offset-functions-lag")!, progress)).toBe(false);
    for (const roll of [0, 40, 80, 99]) expect(scheduleTarget("sql", progress, roll).node.id).not.toBe("sql-offset-functions-lag");
  });

  it("requires every explicit prerequisite before an advanced SQL node is eligible", () => {
    const progress = emptyProgress();
    completeDiagnostic(progress, "sql");
    const lag = curriculumById.get("sql-offset-functions-lag")!;
    lag.prerequisites.slice(0, -1).forEach((id) => passPrerequisite(progress, id));
    expect(nodeEligible(lag, progress)).toBe(false);
    passPrerequisite(progress, lag.prerequisites.at(-1)!);
    expect(nodeEligible(lag, progress)).toBe(true);
  });

  it("raises difficulty only after repeated independent evidence", () => {
    const progress = emptyProgress();
    completeDiagnostic(progress, "sql");
    const node = curriculumById.get("sql-foundations-select")!;
    const state = createSkillState(node.id);
    progress.skills[node.id] = state;
    expect(allowedDifficulty(node, progress).max).toBe(1);
    Object.assign(state, { attempted: 4, correct: 3, recentAccuracy: 0.75, solutionRevealCount: 0 });
    expect(allowedDifficulty(node, progress).max).toBe(2);
    Object.assign(state, { attempted: 6, correct: 5, recentAccuracy: 0.84, passedPatterns: ["projection", "aliases"] });
    expect(allowedDifficulty(node, progress).max).toBe(3);
    Object.assign(state, { attempted: 8, correct: 7, recentAccuracy: 0.875, validatorPasses: 7, hintCount: 1 });
    expect(allowedDifficulty(node, progress).max).toBe(4);
  });

  it("keeps difficulty adjustments on the same diagnostic node", () => {
    const progress = emptyProgress();
    progress.diagnostics.sql.started = true;
    const easier = scheduleTarget("sql", progress, 50, new Date(), { adjustment: "easier", currentNodeId: "sql-foundations-select", currentDifficulty: 2 });
    const harder = scheduleTarget("sql", progress, 50, new Date(), { adjustment: "harder", currentNodeId: "sql-foundations-select", currentDifficulty: 1 });
    expect(easier.node.id).toBe("sql-foundations-select");
    expect(easier.difficulty).toBe(1);
    expect(harder.node.id).toBe("sql-foundations-select");
    expect(harder.difficulty).toBe(2);
  });

  it("does not let Too easy bypass prerequisites", () => {
    const progress = emptyProgress();
    completeDiagnostic(progress, "sql");
    const target = scheduleTarget("sql", progress, 99, new Date(), { adjustment: "harder", currentNodeId: "sql-offset-functions-lag", currentDifficulty: 2 });
    expect(target.node.id).not.toBe("sql-offset-functions-lag");
    expect(target.difficulty).toBe(1);
  });

  it("migrates counts-only v1 learners into a shortened diagnostic", () => {
    const migrated = parseProgress(JSON.stringify({ version: 1, solved: { sql: 7, python: 0, pyspark: 0 }, arcadeCompleted: 0, skills: {}, recentFingerprints: [], currentQuestions: {}, recentOutcomes: [] }));
    expect(migrated.version).toBe(2);
    expect(migrated.progressVersion).toBe(2);
    expect(migrated.solved.sql).toBe(7);
    expect(migrated.diagnostics.sql.shortened).toBe(true);
    expect(migrated.diagnostics.sql.completedNodeIds).toEqual([]);
  });

  it("accepts only neutral beginner starter code and exact scheduler metadata", async () => {
    const progress = emptyProgress();
    const target = scheduleTarget("sql", progress);
    const node = target.node;
    const base: GeneratedQuestion = {
      id: "q", technology: "sql", curriculumNodeId: node.id, topic: node.topic, subtopic: node.subtopic,
      difficulty: 1, exerciseMode: "write_from_scratch", prerequisiteIds: [...node.prerequisites], diagnosticQuestion: true,
      learnerInstructions: "Write the complete query from scratch.", title: "Select columns", scenario: "orders", prompt: "Return order identifiers.",
      schema: {}, sampleData: [], expectedBehavior: [], hiddenTests: [], referenceSolution: "SELECT id FROM orders", starterCode: "-- Write your query here",
      rubric: [], skillDimensions: [...node.skillDimensions],
      fingerprint: { technology: "sql", topic: node.topic, subtopic: node.subtopic, pattern: "basic projection", scenario: "orders", difficulty: 1, skills: [...node.skillDimensions], schemaSignature: "orders(id)" },
    };
    const { validateQuestionEligibility } = await import("@/lib/adaptive/server/eligibility");
    expect(validateQuestionEligibility(base, progress, node, target).eligible).toBe(true);
    expect(validateQuestionEligibility({ ...base, starterCode: "SELECT id FROM orders" }, progress, node, target).eligible).toBe(false);
    expect(validateQuestionEligibility({ ...base, curriculumNodeId: "sql-offset-functions-lag" }, progress, node, target).eligible).toBe(false);
  });

  it("requires code-completion exercises to be clearly labeled", async () => {
    const progress = emptyProgress();
    completeDiagnostic(progress, "sql");
    const node = curriculumById.get("sql-foundations-select")!;
    const target = { node, reason: "neighbor" as const, difficulty: 3 as const, allowedDifficulty: { min: 1 as const, max: 3 as const }, diagnosticQuestion: false, targetDimensions: [...node.skillDimensions] };
    const base: GeneratedQuestion = {
      id: "completion", technology: "sql", curriculumNodeId: node.id, topic: node.topic, subtopic: node.subtopic,
      difficulty: 3, exerciseMode: "code_completion", prerequisiteIds: [], diagnosticQuestion: false,
      learnerInstructions: "Finish the exercise.", title: "Projection", scenario: "orders", prompt: "Fill in the missing expression.", schema: {}, sampleData: [], expectedBehavior: [], hiddenTests: [],
      referenceSolution: "SELECT id FROM orders", starterCode: "SELECT __ FROM orders", rubric: [], skillDimensions: [...node.skillDimensions],
      fingerprint: { technology: "sql", topic: node.topic, subtopic: node.subtopic, pattern: "completion projection", scenario: "orders", difficulty: 3, skills: [...node.skillDimensions], schemaSignature: "orders(id)" },
    };
    const { validateQuestionEligibility } = await import("@/lib/adaptive/server/eligibility");
    expect(validateQuestionEligibility(base, progress, node, target).eligible).toBe(false);
    expect(validateQuestionEligibility({ ...base, learnerInstructions: "Complete the query." }, progress, node, target).eligible).toBe(true);
  });
});
