import type { EvaluationResult, GeneratedQuestion } from "@/lib/adaptive/types";

export function isGeneratedQuestion(value: unknown): value is GeneratedQuestion {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<GeneratedQuestion>;
  return typeof item.id === "string"
    && ["sql", "python", "pyspark", "arcade"].includes(item.technology ?? "")
    && Number.isInteger(item.difficulty) && Number(item.difficulty) >= 1 && Number(item.difficulty) <= 5
    && ["write_from_scratch", "code_completion", "debugging", "optimization", "explanation"].includes(item.exerciseMode ?? "")
    && Array.isArray(item.prerequisiteIds) && item.prerequisiteIds.every((id) => typeof id === "string")
    && typeof item.diagnosticQuestion === "boolean"
    && typeof item.learnerInstructions === "string" && item.learnerInstructions.trim().length > 0
    && typeof item.prompt === "string" && typeof item.referenceSolution === "string" && typeof item.starterCode === "string"
    && Array.isArray(item.hiddenTests) && Array.isArray(item.rubric) && Array.isArray(item.skillDimensions)
    && !!item.fingerprint && typeof item.fingerprint.scenario === "string";
}

export function isEvaluationContent(value: unknown): value is Omit<EvaluationResult, "runtimeResult" | "hiddenTestsPassed" | "runtimePassed" | "validatorPassed"> {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<EvaluationResult>;
  return ["correct", "partially-correct", "incorrect"].includes(item.verdict ?? "") && typeof item.score === "number" && Array.isArray(item.doneWell) && Array.isArray(item.improvements) && typeof item.mistakeClassification === "string" && typeof item.explanation === "string" && typeof item.suggestedNextAction === "string";
}
