import { describe, expect, it, vi } from "vitest";
import { DIAGNOSTIC_NODE_IDS } from "@/lib/adaptive/diagnostic";
import { emptyProgress } from "@/lib/adaptive/progress";
import { scheduleTarget } from "@/lib/adaptive/scheduler";
import type { ProgressState, Technology } from "@/lib/adaptive/types";

vi.mock("server-only", () => ({}));

function progressAtDiagnostic(technology: Technology, index: number): ProgressState {
  const progress = emptyProgress();
  progress.diagnostics[technology].started = true;
  progress.diagnostics[technology].completedNodeIds = DIAGNOSTIC_NODE_IDS[technology].slice(0, index);
  return progress;
}

describe("pre-generated diagnostic question bank", () => {
  it("contains 40 validated variations for each of the 30 competencies", async () => {
    const { diagnosticBankSize, diagnosticQuestionBank, diagnosticVariationsPerCompetency } = await import("@/lib/adaptive/server/diagnostic-question-bank");
    const { validateQuestionEligibility } = await import("@/lib/adaptive/server/eligibility");
    expect(diagnosticVariationsPerCompetency).toBe(40);
    expect(diagnosticQuestionBank.size).toBe(30);
    expect(diagnosticBankSize).toBe(1_200);

    const ids = new Set<string>();
    for (const technology of ["sql", "python", "pyspark"] as const) {
      for (const [index, nodeId] of DIAGNOSTIC_NODE_IDS[technology].entries()) {
        const progress = progressAtDiagnostic(technology, index);
        const target = scheduleTarget(technology, progress, 0);
        const questions = diagnosticQuestionBank.get(nodeId) ?? [];
        expect(target.node.id).toBe(nodeId);
        expect(questions).toHaveLength(40);
        for (const question of questions) {
          ids.add(question.id);
          expect(validateQuestionEligibility(question, progress, target.node, target)).toEqual({ eligible: true });
          expect(question.exerciseMode).toBe("write_from_scratch");
          if (technology === "sql") expect(question.starterCode).toBe("-- Write your query here");
          if (technology === "python") expect(question.starterCode).toMatch(/^def [a-z_]+\([^)]*\):\n {4}pass$/u);
          if (technology === "pyspark") expect(question.starterCode).toBe("# Write your transformation here\nresult_df = None");
        }
      }
    }
    expect(ids.size).toBe(1_200);
  });

  it("accepts a reference solution for every diagnostic competency", async () => {
    const { diagnosticQuestionBank } = await import("@/lib/adaptive/server/diagnostic-question-bank");
    const { executeAnswer } = await import("@/lib/adaptive/server/runtime");
    for (const technology of ["sql", "python", "pyspark"] as const) {
      for (const nodeId of DIAGNOSTIC_NODE_IDS[technology]) {
        const question = diagnosticQuestionBank.get(nodeId)![0]!;
        const result = await executeAnswer(question, question.referenceSolution);
        expect(result.passed, `${nodeId}: ${result.summary}`).toBe(true);
      }
    }
  });
});
