import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { executePysparkRuntime } from "@/lib/pyspark-runtime-server";
import { PYSPARK_RUNTIME_QUESTION_IDS } from "@/lib/pyspark-runtime-contract";
import { getPysparkRuntimeSpec } from "@/lib/pyspark-runtime-specs";
import { getPysparkWeekOneQuestionById } from "@/lib/questions/pyspark-week-one";

const pythonExecutable = process.env.PYSPARK_PYTHON_BIN ?? "python3";

function commandSucceeds(command: string, args: string[]) {
  const result = spawnSync(command, args, { encoding: "utf8", timeout: 10_000, shell: false });
  return result.status === 0;
}

function hasSparkIntegrationEnvironment() {
  const javaExecutable = process.env.PYSPARK_JAVA_HOME
    ? path.join(process.env.PYSPARK_JAVA_HOME, "bin", "java")
    : "java";

  const javaAvailable =
    process.env.PYSPARK_JAVA_HOME && !existsSync(javaExecutable)
      ? false
      : commandSucceeds(javaExecutable, ["-version"]);
  const pysparkAvailable = commandSucceeds(pythonExecutable, ["-c", "import pyspark"]);

  return javaAvailable && pysparkAvailable;
}

const integrationWhenAvailable =
  process.env.PYSPARK_RUNTIME_INTEGRATION === "true" && hasSparkIntegrationEnvironment()
    ? describe
    : describe.skip;

integrationWhenAvailable("real PySpark runtime", () => {
  it.each([...PYSPARK_RUNTIME_QUESTION_IDS])(
    "executes the reference solution for %s in Spark",
    async (questionId) => {
      const spec = getPysparkRuntimeSpec(questionId);
      const question = getPysparkWeekOneQuestionById(questionId);
      expect(spec).not.toBeNull();
      expect(question).not.toBeNull();
      const result = await executePysparkRuntime(spec!, question!.referenceSolution);
      expect(result.errorCode).toBeUndefined();
      expect(result.sparkVersion).toMatch(/^3\./u);
      expect(result.passed).toBe(true);
      expect(result.score).toBe(100);
    },
    40_000,
  );

  it("rejects source that attempts arbitrary Python execution before Spark starts", async () => {
    const spec = getPysparkRuntimeSpec("pyspark-q-0026");
    const result = await executePysparkRuntime(spec!, "result = __import__('os').system('id')");
    expect(result.passed).toBe(false);
    expect(result.errorCode).toBe("UNSAFE_SOURCE");
  });

  it("executes a safe but incorrect transformation and rejects its output", async () => {
    const spec = getPysparkRuntimeSpec("pyspark-q-0026");
    const result = await executePysparkRuntime(spec!, "result = orders_df.select('order_id')");
    expect(result.errorCode).toBeUndefined();
    expect(result.passed).toBe(false);
  }, 40_000);
});
