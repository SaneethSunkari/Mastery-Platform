import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { pythonWeekOneQuestions } from "@/lib/questions/python-week-one";

const PYTHON_BATCH_SCRIPT = `
import json
import sys
import traceback

with open(sys.argv[1], "r", encoding="utf8") as payload_file:
    payload = json.load(payload_file)
results = []

for item in payload:
    namespace = {}
    result = {
        "questionId": item["questionId"],
        "passed": False,
        "score": 0,
        "visibleFailures": [],
        "hiddenFailures": [],
        "error": None,
    }

    try:
        exec(item["code"], namespace)
        fn = namespace.get("solve")
        if fn is None:
            raise AssertionError("Expected a function named solve.")

        total_checks = len(item["visibleCases"]) + len(item["hiddenCases"])
        passed_checks = 0

        for case in item["visibleCases"]:
            actual = fn(case["input"])
            passed = actual == case["expected"]
            if passed:
                passed_checks += 1
            else:
                result["visibleFailures"].append(case["description"])

        for case in item["hiddenCases"]:
            actual = fn(case["input"])
            passed = actual == case["expected"]
            if passed:
                passed_checks += 1
            else:
                result["hiddenFailures"].append(case["description"])

        result["passed"] = passed_checks == total_checks
        result["score"] = int((passed_checks / total_checks) * 100) if total_checks else 0
    except Exception as exc:
        result["error"] = {
            "message": str(exc),
            "traceback": traceback.format_exc(),
        }

    results.append(result)

print(json.dumps(results))
`;

function buildEquivalentSolution(referenceSolution: string) {
  const lines = referenceSolution.trimEnd().split("\n");
  const returnIndex = [...lines].findLastIndex((line) => line.trim().startsWith("return "));

  if (returnIndex < 0) {
    return `${referenceSolution}\n`;
  }

  const indent = lines[returnIndex].match(/^\s*/u)?.[0] ?? "";
  const expression = lines[returnIndex].trim().slice("return ".length);
  lines[returnIndex] = `${indent}result = ${expression}`;
  lines.splice(returnIndex + 1, 0, `${indent}return result`);
  return `${lines.join("\n")}\n`;
}

function buildIncorrectValue(expected: unknown): unknown {
  if (typeof expected === "number") {
    return expected + 1;
  }

  if (typeof expected === "string") {
    return "__wrong__";
  }

  if (typeof expected === "boolean") {
    return !expected;
  }

  if (Array.isArray(expected)) {
    return expected.length === 0 ? ["wrong"] : expected.slice(1);
  }

  if (expected && typeof expected === "object") {
    return { __wrong__: true };
  }

  return "__wrong__";
}

function buildIncorrectSolution(expected: unknown) {
  return [
    "import json",
    "",
    "def solve(data):",
    `    return json.loads(${JSON.stringify(JSON.stringify(buildIncorrectValue(expected)))})`,
    "",
  ].join("\n");
}

function runBatch(
  questions: Array<{
    questionId: string;
    code: string;
    visibleCases: unknown[];
    hiddenCases: unknown[];
  }>,
) {
  const directory = mkdtempSync(path.join(tmpdir(), "mastery-python-week-one-"));
  const payloadPath = path.join(directory, "payload.json");
  writeFileSync(payloadPath, JSON.stringify(questions), "utf8");

  const execution = spawnSync("python3", ["-c", PYTHON_BATCH_SCRIPT, payloadPath], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    env: { ...process.env, PYTHONUNBUFFERED: "1" },
    timeout: 30_000,
    shell: false,
  });

  rmSync(directory, { recursive: true, force: true });

  if (execution.status !== 0) {
    throw new Error(execution.stderr || "Python batch validation failed.");
  }

  return JSON.parse(execution.stdout) as Array<{
    questionId: string;
    passed: boolean;
    score: number;
    visibleFailures: string[];
    hiddenFailures: string[];
    error: { message: string; traceback: string } | null;
  }>;
}

describe("python week one runtime validation", () => {
  it("passes every reference solution", () => {
    const results = runBatch(
      pythonWeekOneQuestions.map((question) => ({
        questionId: question.id,
        code: question.referenceSolution,
        visibleCases: question.visibleCases,
        hiddenCases: question.hiddenCases,
      })),
    );

    const failures = results.filter((result) => !result.passed);
    expect(failures).toEqual([]);
  });

  it("passes equivalent correct solutions for every question", () => {
    const results = runBatch(
      pythonWeekOneQuestions.map((question) => ({
        questionId: question.id,
        code: buildEquivalentSolution(question.referenceSolution),
        visibleCases: question.visibleCases,
        hiddenCases: question.hiddenCases,
      })),
    );

    const failures = results.filter((result) => !result.passed);
    expect(failures).toEqual([]);
  });

  it("fails representative incorrect solutions for every question", () => {
    const results = runBatch(
      pythonWeekOneQuestions.map((question) => ({
        questionId: question.id,
        code: buildIncorrectSolution(question.visibleCases[0]?.expected),
        visibleCases: question.visibleCases,
        hiddenCases: question.hiddenCases,
      })),
    );

    const unexpectedPasses = results.filter((result) => result.passed).map((result) => result.questionId);
    expect(unexpectedPasses).toEqual([]);
  });
});
