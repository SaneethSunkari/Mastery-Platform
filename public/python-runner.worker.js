let pyodidePromise = null;
let pyodide = null;

async function ensurePyodide() {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js");
      pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/",
      });
      return pyodide;
    })();
  }

  return pyodidePromise;
}

function escapeTripleQuotedJson(value) {
  return JSON.stringify(value).replace(/\\/g, "\\\\").replace(/"""/g, '\\"\\"\\"');
}

self.onmessage = async (event) => {
  const { id, type, payload } = event.data ?? {};

  if (type !== "run-python") {
    return;
  }

  try {
    const runtime = await ensurePyodide();
    const code = payload?.code ?? "";
    const functionName = payload?.functionName ?? null;
    const resultVariable = payload?.resultVariable ?? null;
    const inputVariableName = payload?.inputVariableName ?? "data";
    const visibleCases = payload?.visibleCases ?? [];
    const hiddenCases = payload?.hiddenCases ?? [];

    const pythonScript = `
import contextlib
import io
import json
import traceback

USER_CODE = ${JSON.stringify(code)}
VISIBLE_CASES = json.loads("""${escapeTripleQuotedJson(visibleCases)}""")
HIDDEN_CASES = json.loads("""${escapeTripleQuotedJson(hiddenCases)}""")
FUNCTION_NAME = ${functionName ? JSON.stringify(functionName) : "None"}
RESULT_VARIABLE = ${resultVariable ? JSON.stringify(resultVariable) : "None"}
INPUT_VARIABLE_NAME = ${JSON.stringify(inputVariableName)}

stdout_buffer = io.StringIO()
stderr_buffer = io.StringIO()
namespace = {}

def normalize(value):
    return value

def run_case(case):
    if FUNCTION_NAME:
        fn = namespace.get(FUNCTION_NAME)
        if fn is None:
            raise AssertionError(f"Expected a function named {FUNCTION_NAME}.")
        return normalize(fn(case["input"]))

    case_namespace = {
        INPUT_VARIABLE_NAME: case["input"],
    }
    exec(USER_CODE, case_namespace)
    if not RESULT_VARIABLE:
        raise AssertionError("Python validation needs either functionName or resultVariable.")
    if RESULT_VARIABLE not in case_namespace:
        raise AssertionError(f"Expected a variable named {RESULT_VARIABLE}.")
    return normalize(case_namespace[RESULT_VARIABLE])

result_payload = {
    "passed": False,
    "score": 0,
    "stdout": "",
    "stderr": "",
    "visibleResults": [],
    "hiddenFailures": [],
    "error": None,
}

with contextlib.redirect_stdout(stdout_buffer), contextlib.redirect_stderr(stderr_buffer):
    try:
        if FUNCTION_NAME:
            exec(USER_CODE, namespace)
        passed_checks = 0
        total_checks = len(VISIBLE_CASES) + len(HIDDEN_CASES)

        for case in VISIBLE_CASES:
            actual = run_case(case)
            passed = actual == case["expected"]
            if passed:
                passed_checks += 1
            result_payload["visibleResults"].append({
                "description": case["description"],
                "passed": passed,
                "expected": case["expected"],
                "actual": actual,
            })

        for case in HIDDEN_CASES:
            actual = run_case(case)
            passed = actual == case["expected"]
            if passed:
                passed_checks += 1
            else:
                result_payload["hiddenFailures"].append(case["description"])

        result_payload["passed"] = passed_checks == total_checks
        result_payload["score"] = int((passed_checks / total_checks) * 100) if total_checks else 0
    except Exception as exc:
        result_payload["error"] = {
            "message": str(exc),
            "traceback": traceback.format_exc(),
        }

result_payload["stdout"] = stdout_buffer.getvalue()
result_payload["stderr"] = stderr_buffer.getvalue()
RESULT_JSON = json.dumps(result_payload)
`;

    await runtime.runPythonAsync(pythonScript);
    const resultJson = runtime.globals.get("RESULT_JSON");
    const parsed = JSON.parse(resultJson);
    if (typeof resultJson.destroy === "function") {
      resultJson.destroy();
    }
    self.postMessage({
      id,
      type: "python-result",
      payload: parsed,
    });
  } catch (error) {
    self.postMessage({
      id,
      type: "python-result",
      payload: {
        passed: false,
        score: 0,
        stdout: "",
        stderr: "",
        visibleResults: [],
        hiddenFailures: [],
        error: {
          message: error instanceof Error ? error.message : "Unknown Python worker error.",
          traceback: "",
        },
      },
    });
  }
};
