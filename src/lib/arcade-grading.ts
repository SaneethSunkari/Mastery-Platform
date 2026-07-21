import { ArcadeLanguage } from "@/lib/types";
import { gradePysparkDefinition } from "@/lib/mastery-exercises";
import { runPythonValidation, type PythonRunResult } from "@/lib/python-runner";
import { compareSqlResults, executeSqlAgainstSchema, loadSqlModule } from "@/lib/sql-runtime";
import type { ArcadeLevelBundle } from "@/lib/arcade-bundles";

export interface ArcadeLanguageRunResult {
  passed: boolean;
  score: number;
  message: string;
  details: string[];
}

export async function gradeArcadeLanguage(
  bundle: ArcadeLevelBundle,
  language: ArcadeLanguage,
  source: string,
): Promise<ArcadeLanguageRunResult> {
  try {
    if (language === "sql") {
      const SQL = await loadSqlModule();
      const actual = executeSqlAgainstSchema(SQL, bundle.sql.setupSql, source);
      const expected = executeSqlAgainstSchema(SQL, bundle.sql.setupSql, bundle.sql.referenceSolution);
      const mismatch = compareSqlResults(actual.result, expected.result, bundle.sql.orderSensitive);

      return {
        passed: mismatch === null,
        score: mismatch === null ? 100 : 0,
        message: mismatch === null ? "SQL validation passed." : mismatch,
        details:
          mismatch === null
            ? [`Returned ${actual.result?.values.length ?? 0} rows.`]
            : ["Run the query locally and compare the output contract again."],
      };
    }

    if (language === "python") {
      const result = await runPythonValidation({
        code: source,
        resultVariable: bundle.python.resultVariable,
        inputVariableName: bundle.python.inputVariableName,
        visibleCases: bundle.python.visibleCases,
        hiddenCases: bundle.python.hiddenCases,
      });

      return summarizePythonRun(result);
    }

    const result = gradePysparkDefinition(bundle.pyspark, source);
    return {
      passed: result.passed,
      score: result.score,
      message:
        result.passed
          ? "PySpark structural validation passed."
          : "PySpark structural validation failed.",
      details: result.feedback,
    };
  } catch (error) {
    return {
      passed: false,
      score: 0,
      message: error instanceof Error ? error.message : "Validation failed unexpectedly.",
      details: ["Review the submitted code and try again."],
    };
  }
}

function summarizePythonRun(result: PythonRunResult): ArcadeLanguageRunResult {
  if (result.error) {
    return {
      passed: false,
      score: result.score,
      message: result.error.message,
      details: result.error.traceback ? [result.error.traceback] : [],
    };
  }

  if (result.passed) {
    return {
      passed: true,
      score: result.score,
      message: "Python validation passed.",
      details: result.visibleResults.map((item) => item.description),
    };
  }

  return {
    passed: false,
    score: result.score,
    message: "Python validation failed.",
    details: [
      ...result.visibleResults
        .filter((item) => !item.passed)
        .map(
          (item) =>
            `${item.description}: expected ${JSON.stringify(item.expected)}, got ${JSON.stringify(item.actual)}.`,
        ),
      ...result.hiddenFailures.map((item) => `Hidden check failed: ${item}.`),
    ],
  };
}
