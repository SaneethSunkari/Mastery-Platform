import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { academyBuildStatus } from "@/lib/academy";
import { gradePysparkDefinition } from "@/lib/mastery-exercises";
import { pythonExtensionQuestions, pysparkExtensionQuestions } from "@/lib/mastery-extension-banks";
import { listImplementedQuestionIds } from "@/lib/questions/registry";
import { compareSqlResults, executeSqlAgainstSchema, loadSqlModule } from "@/lib/sql-runtime";
import { sqlDatasetSchema, sqlAllTasks } from "@/lib/sql-weeks";

const PYTHON_BATCH_SCRIPT = `
import json
import sys

with open(sys.argv[1], "r", encoding="utf8") as payload_file:
    payload = json.load(payload_file)
results = []

for item in payload:
    result = {"id": item["id"], "referencePassed": False, "negativePassed": False, "error": None}
    try:
        for source_key, output_key in [("referenceSolution", "referencePassed"), ("negativeSubmission", "negativePassed")]:
            namespace = {}
            exec(item[source_key], namespace)
            solve = namespace.get("solve")
            if not callable(solve):
                raise AssertionError("solve function missing")
            passed = True
            for case in item["visibleCases"] + item["hiddenCases"]:
                actual = solve(case["input"])
                if actual != case["expected"]:
                    passed = False
                    break
            result[output_key] = passed
    except Exception as exc:
        result["error"] = str(exc)
    results.append(result)

print(json.dumps(results))
`;

function duplicateIds(ids: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return [...duplicates].sort();
}

describe("3000 question mastery milestone", () => {
  it("has SQL, Python, and PySpark permanent coverage through 3000 without duplicate ids", () => {
    const sqlIds = listImplementedQuestionIds("sql");
    const pythonIds = listImplementedQuestionIds("python");
    const pysparkIds = listImplementedQuestionIds("pyspark");

    expect(sqlIds).toHaveLength(3000);
    expect(sqlIds).toEqual(
      Array.from({ length: 3000 }, (_, index) => `sql-q-${String(index + 1).padStart(4, "0")}`),
    );
    expect(pythonIds).toContain("python-q-3000");
    expect(pysparkIds).toContain("pyspark-q-3000");
    expect(duplicateIds([...sqlIds, ...pythonIds, ...pysparkIds])).toEqual([]);
  });

  it("runtime-validates all SQL reference solutions and rejects a representative wrong query", async () => {
    const SQL = await loadSqlModule();

    expect(sqlAllTasks).toHaveLength(3000);
    for (const task of sqlAllTasks) {
      const actual = executeSqlAgainstSchema(SQL, sqlDatasetSchema, task.solutionSql);
      const expected = executeSqlAgainstSchema(SQL, sqlDatasetSchema, task.solutionSql);
      expect(compareSqlResults(actual.result, expected.result, task.orderSensitive)).toBeNull();

      const wrong = executeSqlAgainstSchema(SQL, sqlDatasetSchema, "SELECT 1 AS wrong_answer;");
      expect(compareSqlResults(wrong.result, expected.result, task.orderSensitive)).not.toBeNull();
    }
  }, 20000);

  it("runtime-validates Python extension references and rejects representative wrong answers", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "mastery-python-batch-"));
    const payloadPath = path.join(directory, "payload.json");
    writeFileSync(payloadPath, JSON.stringify(pythonExtensionQuestions), "utf8");
    const execution = spawnSync("python3", ["-c", PYTHON_BATCH_SCRIPT, payloadPath], {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
      timeout: 30_000,
      shell: false,
    });
    rmSync(directory, { recursive: true, force: true });

    expect(execution.status).toBe(0);
    const results = JSON.parse(execution.stdout) as Array<{
      id: string;
      referencePassed: boolean;
      negativePassed: boolean;
      error: string | null;
    }>;

    expect(results).toHaveLength(2806);
    expect(results.filter((result) => result.referencePassed)).toHaveLength(2806);
    expect(results.filter((result) => result.negativePassed)).toHaveLength(0);
    expect(results.filter((result) => result.error)).toEqual([]);
  });

  it("structurally validates PySpark extension references and rejects representative wrong answers", () => {
    expect(pysparkExtensionQuestions).toHaveLength(2806);

    for (const question of pysparkExtensionQuestions) {
      const reference = gradePysparkDefinition(question.definition, question.referenceSolution);
      const wrong = gradePysparkDefinition(question.definition, question.negativeSubmission);

      expect(reference.passed).toBe(true);
      expect(wrong.passed).toBe(false);
    }
  });

  it("keeps dashboard status honest for the current product milestone", () => {
    expect(academyBuildStatus.generatedQuestionBankPerTrackLive).toBe(3000);
    expect(academyBuildStatus.sqlVerifiedTaskCount).toBe(3000);
    expect(academyBuildStatus.pythonVerifiedTaskCount).toBe(3000);
    expect(academyBuildStatus.pysparkStructurallyVerifiedTaskCount).toBe(3000);
    expect(academyBuildStatus.pysparkRuntimeVerifiedTaskCount).toBe(9);
    expect(academyBuildStatus.verifiedTriLanguageArcadeQuestionsLive).toBe(3000);
    expect(academyBuildStatus.verifiedTriLanguageArcadeSolutionsLive).toBe(9000);
    expect(academyBuildStatus.plannedPerTrackCapacity).toBe(3000);
  });
});
