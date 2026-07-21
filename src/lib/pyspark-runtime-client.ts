import type { PysparkRuntimeResult } from "@/lib/pyspark-runtime-contract";

export async function runPysparkExercise(questionId: string, source: string) {
  const response = await fetch("/api/pyspark/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId, source }),
  });
  const result = (await response.json()) as PysparkRuntimeResult | { error: string };
  if ("mode" in result) return result;
  return {
    passed: false,
    score: 0,
    mode: "pyspark-runtime" as const,
    feedback: [result.error],
    durationMs: 0,
    errorCode: "INVALID_REQUEST" as const,
  };
}
