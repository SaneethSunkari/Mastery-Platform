import { DEFAULT_SQL_DIALECT } from "@/lib/adaptive/curriculum";
import type { ProgressState, ScheduledTarget, Technology } from "@/lib/adaptive/types";

export function generationPrompt(technology: Technology, target: ScheduledTarget, progress: ProgressState) {
  const recentScenarios = progress.recentFingerprints.filter((item) => item.technology === technology).slice(-8).map((item) => item.scenario);
  const runtimeRules = technology === "sql"
    ? "Use SQLite-compatible executable SQL while teaching PostgreSQL semantics. Include CREATE TABLE and INSERT statements in runtime.setupSql. The reference solution must be a read-only SELECT or WITH query."
    : technology === "python"
      ? "Ask for one pure function. Set runtime.functionName and provide JSON-safe visibleTests and hiddenTests with input and expected values. No imports, files, network, input(), eval(), exec(), globals(), or nondeterminism."
      : "Ask for a PySpark DataFrame transformation assigned to result_df. Use only native pyspark.sql functions. Runtime will be structurally evaluated unless a separately configured real Spark validator exists.";

  return `Generate exactly one ${technology === "sql" ? `${DEFAULT_SQL_DIALECT} SQL` : technology === "python" ? "Python 3" : "PySpark DataFrame API"} coding exercise.

Application-selected target:
- category: ${target.node.category}
- topic: ${target.node.topic}
- subtopic: ${target.node.subtopic}
- scheduling reason: ${target.reason}
- difficulty: ${target.difficulty} of 5
- target dimensions: ${target.targetDimensions.join(", ")}

Recent scenarios to avoid: ${recentScenarios.length ? recentScenarios.join(", ") : "none"}.
${runtimeRules}

Create a realistic data-engineering or analytics scenario, concise learner instructions, sample data, expected behavior, a rubric, starter code, visible checks where applicable, hidden tests, a complete reference solution, and a normalized fingerprint. Encode schema, sampleData, and every test input and expected value as valid compact JSON strings. Test the selected dimensions. Make every test deterministic. Never put the reference solution into starterCode, prompt, sampleData, schema, rubric, or expectedBehavior.`;
}

export function arcadePrompt(recentScenarios: string[]) {
  return `Generate one concise data-engineering mission that must be solved three ways: PostgreSQL-style SQL, a pure Python function, and a PySpark DataFrame transformation. Avoid these recent scenarios: ${recentScenarios.join(", ") || "none"}. Use the same business rule and edge cases across all languages. Return one mission question with technology "arcade". starterCode must be JSON text containing keys sql, python, and pyspark. referenceSolution must be JSON text with those same keys. Encode schema, sampleData, and every hidden or visible test input and expected value as valid compact JSON strings. runtime.setupSql must support SQL execution. runtime.functionName must support Python hidden tests. The PySpark answer is structurally evaluated unless a real runtime is explicitly available. The rubric must cover correctness, efficiency, readability, edge cases, runtime behavior, and cross-language conceptual similarity.`;
}

export function evaluationPrompt(input: { technology: string; prompt: string; code: string; rubric: string[]; runtimeSummary: string; passed: boolean }) {
  return `Act as a precise, encouraging coding interviewer. Evaluate the learner's ${input.technology} answer against the rubric and runtime evidence.

Exercise: ${input.prompt}
Rubric: ${input.rubric.join("; ")}
Runtime evidence: ${input.runtimeSummary}
Runtime acceptance passed: ${input.passed}
Learner answer:
${input.code}

Runtime evidence is authoritative. Do not call an answer correct when runtime acceptance failed. Identify one exact mistake category, explain the most important issue briefly, and recommend either a targeted simpler variation after failure or a changed-scenario edge case after success. Do not reveal a full reference solution.`;
}

export function assistancePrompt(input: { kind: "hint" | "explain"; technology: string; prompt: string; code: string; dimensions: string[] }) {
  return `You are an adaptive ${input.technology} tutor. The learner requested a ${input.kind} before submitting.
Exercise: ${input.prompt}
Target dimensions: ${input.dimensions.join(", ")}
Current code: ${input.code || "(empty)"}

Give one short, targeted ${input.kind}. Diagnose the likely conceptual gap. Do not provide the complete solution or hidden expected results.`;
}
