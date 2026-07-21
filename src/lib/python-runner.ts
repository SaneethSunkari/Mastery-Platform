import { MasteryExerciseDefinition } from "@/lib/mastery-exercises";

export interface PythonRunResult {
  passed: boolean;
  score: number;
  stdout: string;
  stderr: string;
  visibleResults: Array<{
    description: string;
    passed: boolean;
    expected: unknown;
    actual: unknown;
  }>;
  hiddenFailures: string[];
  error: {
    message: string;
    traceback: string;
  } | null;
}

let workerInstance: Worker | null = null;

export interface PythonRunnerRequest {
  code: string;
  functionName?: string | null;
  resultVariable?: string | null;
  inputVariableName?: string;
  visibleCases: Array<{
    description: string;
    input: unknown;
    expected: unknown;
  }>;
  hiddenCases: Array<{
    description: string;
    input: unknown;
    expected: unknown;
  }>;
}

function createWorker() {
  return new Worker("/python-runner.worker.js");
}

function getWorker() {
  if (!workerInstance) {
    workerInstance = createWorker();
  }

  return workerInstance;
}

export function resetPythonWorker() {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
  }
}

export function runPythonExercise(
  exercise: MasteryExerciseDefinition,
  code: string,
  timeoutMs = 7000,
) {
  const pythonExercise = exercise.python;

  if (!pythonExercise) {
    return Promise.resolve<PythonRunResult>({
      passed: false,
      score: 0,
      stdout: "",
      stderr: "",
      visibleResults: [],
      hiddenFailures: [],
      error: {
        message: "No Python exercise definition exists for this lesson.",
        traceback: "",
      },
    });
  }

  return runPythonValidation(
    {
      code,
      functionName: pythonExercise.functionName,
      visibleCases: pythonExercise.visibleCases,
      hiddenCases: pythonExercise.hiddenCases,
    },
    timeoutMs,
  );
}

export function runPythonValidation(
  request: PythonRunnerRequest,
  timeoutMs = 7000,
) {
  const worker = getWorker();
  const requestId = `python-run-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  return new Promise<PythonRunResult>((resolve) => {
    const timeout = window.setTimeout(() => {
      resetPythonWorker();
      resolve({
        passed: false,
        score: 0,
        stdout: "",
        stderr: "",
        visibleResults: [],
        hiddenFailures: [],
        error: {
          message: `Python execution timed out after ${timeoutMs}ms.`,
          traceback: "",
        },
      });
    }, timeoutMs);

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.id !== requestId || event.data?.type !== "python-result") {
        return;
      }

      window.clearTimeout(timeout);
      worker.removeEventListener("message", handleMessage);
      resolve(event.data.payload as PythonRunResult);
    };

    worker.addEventListener("message", handleMessage);
    worker.postMessage({
      id: requestId,
      type: "run-python",
      payload: request,
    });
  });
}
