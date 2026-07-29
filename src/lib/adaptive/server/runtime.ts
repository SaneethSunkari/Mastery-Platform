import "server-only";

import { spawn } from "node:child_process";
import path from "node:path";
import initSqlJs from "sql.js";
import type { GeneratedQuestion } from "@/lib/adaptive/types";

export type RuntimeOutcome = { passed: boolean; validatorPassed: boolean; runtimePassed: boolean; mode: "real-runtime" | "structural"; summary: string; details?: unknown };

const blockedSql = /\b(attach|detach|pragma|vacuum|load_extension|insert|update|delete|drop|alter|create|replace|truncate)\b/iu;

async function runSql(question: GeneratedQuestion, source: string): Promise<RuntimeOutcome> {
  if (!question.runtime?.setupSql || !question.referenceSolution) return { passed: false, validatorPassed: false, runtimePassed: false, mode: "real-runtime", summary: "This exercise is missing its SQL runtime fixture." };
  if (source.length > 16_384 || blockedSql.test(source)) return { passed: false, validatorPassed: false, runtimePassed: false, mode: "real-runtime", summary: "Only a read-only SELECT or WITH query is allowed." };
  try {
    const SQL = await initSqlJs({ locateFile: () => path.join(process.cwd(), "public/sql-wasm.wasm") });
    const database = new SQL.Database();
    database.run(question.runtime.setupSql);
    const actual = database.exec(source)[0];
    const expected = database.exec(question.referenceSolution)[0];
    database.close();
    const normalize = (result: typeof actual) => ({ columns: result?.columns.map((item) => item.toLowerCase()) ?? [], rows: (result?.values ?? []).map((row) => row.map((value) => value === null ? null : typeof value === "number" ? Number(value.toFixed(8)) : String(value))).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))) });
    const normalizedActual = normalize(actual);
    const normalizedExpected = normalize(expected);
    const passed = JSON.stringify(normalizedActual) === JSON.stringify(normalizedExpected);
    const columnsMatch = JSON.stringify(normalizedActual.columns) === JSON.stringify(normalizedExpected.columns);
    const failureSummary = !columnsMatch
      ? `SQL executed, but the output columns did not match. Expected ${normalizedExpected.columns.join(", ") || "no columns"}; received ${normalizedActual.columns.join(", ") || "no columns"}.`
      : `SQL executed with the expected columns, but the rows did not match the hidden expected result. Expected ${normalizedExpected.rows.length} row(s); received ${normalizedActual.rows.length}.`;
    return { passed, validatorPassed: passed, runtimePassed: passed, mode: "real-runtime", summary: passed ? `SQL executed successfully and matched ${expected?.values.length ?? 0} expected row(s), including hidden fixture cases.` : failureSummary, details: { columns: actual?.columns ?? [], expectedColumns: expected?.columns ?? [], rowCount: actual?.values.length ?? 0, expectedRowCount: expected?.values.length ?? 0 } };
  } catch (error) {
    return { passed: false, validatorPassed: false, runtimePassed: false, mode: "real-runtime", summary: `SQL execution failed: ${error instanceof Error ? error.message : "unknown error"}` };
  }
}

async function runPython(question: GeneratedQuestion, source: string): Promise<RuntimeOutcome> {
  const functionName = question.runtime?.functionName;
  if (!functionName || !question.hiddenTests.length) return { passed: false, validatorPassed: false, runtimePassed: false, mode: "real-runtime", summary: "This exercise is missing Python runtime tests." };
  if (source.length > 16_384) return { passed: false, validatorPassed: false, runtimePassed: false, mode: "real-runtime", summary: "Python source exceeds the 16 KB limit." };
  const runner = path.join(process.cwd(), "runtime/python_adaptive_runner.py");
  return new Promise((resolve) => {
    const child = spawn(process.env.PYTHON_BIN || "python3", ["-I", "-S", runner], { shell: false, stdio: "pipe", env: { NODE_ENV: process.env.NODE_ENV ?? "production", PATH: process.env.PATH ?? "" } });
    let output = "";
    let errorOutput = "";
    const timer = setTimeout(() => child.kill("SIGKILL"), 5_000);
    child.stdout.on("data", (chunk: Buffer) => { output += chunk.toString().slice(0, 32_768 - output.length); });
    child.stderr.on("data", (chunk: Buffer) => { errorOutput += chunk.toString().slice(0, 8_192 - errorOutput.length); });
    child.once("error", (error) => { clearTimeout(timer); resolve({ passed: false, validatorPassed: false, runtimePassed: false, mode: "real-runtime", summary: `Python runtime unavailable: ${error.message}` }); });
    child.once("close", (code, signal) => {
      clearTimeout(timer);
      if (signal === "SIGKILL") return resolve({ passed: false, validatorPassed: false, runtimePassed: false, mode: "real-runtime", summary: "Python execution exceeded the 5 second limit." });
      try {
        const result = JSON.parse(output) as { passed: boolean; results: unknown[] };
        return resolve({ passed: result.passed, validatorPassed: result.passed, runtimePassed: result.passed, mode: "real-runtime", summary: result.passed ? `Python executed in an isolated process and passed ${result.results.length} hidden test(s).` : "Python executed, but one or more hidden tests failed.", details: result.results });
      } catch {
        return resolve({ passed: false, validatorPassed: false, runtimePassed: false, mode: "real-runtime", summary: `Python execution failed${code ? ` (exit ${code})` : ""}: ${errorOutput.split("\n").at(-2) || "invalid output"}` });
      }
    });
    child.stdin.end(JSON.stringify({ source, functionName, tests: question.hiddenTests }));
  });
}

function runPyspark(question: GeneratedQuestion, source: string): RuntimeOutcome {
  const banned = /\b(collect|toPandas|rdd|open|requests|socket|subprocess|os\.|sys\.)\b/iu;
  const requiredTokens = question.skillDimensions.flatMap((dimension) => dimension.toLowerCase().match(/\b(join|groupby|window|partitionby|orderby|lag|lead|filter|select|withcolumn|explode|repartition|coalesce|broadcast|when)\b/gu) ?? []);
  const includesApi = /(?:result_df\s*=|\.select\(|\.filter\(|\.where\(|\.groupBy\(|\.join\(|\.withColumn\()/u.test(source);
  const missing = [...new Set(requiredTokens)].filter((token) => !source.toLowerCase().includes(token));
  const passed = source.length >= 24 && includesApi && !banned.test(source) && missing.length === 0;
  return { passed, validatorPassed: passed, runtimePassed: false, mode: "structural", summary: passed ? "Structurally evaluated: the DataFrame plan uses the required native APIs. Real Spark was not executed, so no runtime mastery evidence was awarded." : `Structurally evaluated only; the answer is incomplete or unsafe${missing.length ? `. Missing target construct(s): ${missing.join(", ")}` : ""}. Real Spark was not executed.` };
}

export async function executeAnswer(question: GeneratedQuestion, source: string): Promise<RuntimeOutcome> {
  if (question.technology === "sql") return runSql(question, source);
  if (question.technology === "python") return runPython(question, source);
  if (question.technology === "pyspark") return runPyspark(question, source);
  return { passed: false, validatorPassed: false, runtimePassed: false, mode: "structural", summary: "Arcade submissions must be evaluated as a three-language bundle." };
}

export async function executeArcade(question: GeneratedQuestion, source: string): Promise<RuntimeOutcome> {
  let answers: { sql?: string; python?: string; pyspark?: string };
  try { answers = JSON.parse(source); } catch { return { passed: false, validatorPassed: false, runtimePassed: false, mode: "structural", summary: "Arcade answers were not a valid three-language bundle." }; }
  if (!answers.sql || !answers.python || !answers.pyspark) return { passed: false, validatorPassed: false, runtimePassed: false, mode: "structural", summary: "SQL, Python, and PySpark solutions are all required." };
  const references: { sql?: string; python?: string; pyspark?: string } = (() => {
    try { return JSON.parse(question.referenceSolution); } catch { return {}; }
  })();
  const sqlQuestion = { ...question, technology: "sql" as const, referenceSolution: references.sql ?? question.referenceSolution };
  const pythonQuestion = { ...question, technology: "python" as const };
  const pysparkQuestion = { ...question, technology: "pyspark" as const };
  const [sql, python, pyspark] = await Promise.all([runSql(sqlQuestion, answers.sql), runPython(pythonQuestion, answers.python), Promise.resolve(runPyspark(pysparkQuestion, answers.pyspark))]);
  const passed = sql.passed && python.passed && pyspark.passed;
  return { passed, validatorPassed: passed, runtimePassed: sql.runtimePassed && python.runtimePassed, mode: "structural", summary: `SQL: ${sql.summary} Python: ${python.summary} PySpark: ${pyspark.summary}`, details: { sql, python, pyspark } };
}
