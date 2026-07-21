import "server-only";

import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { PysparkRuntimeResult, PysparkRuntimeSpec } from "@/lib/pyspark-runtime-contract";

const TIMEOUT_MS = 30_000;
const MAX_LOG_BYTES = 32_768;
const RESULT_PREFIX = "__MASTERY_SPARK_RESULT__";
let activeRuns = 0;

type RuntimeConfiguration = ReturnType<typeof runtimeConfiguration>;

function runtimeConfiguration() {
  return {
    enabled: process.env.PYSPARK_RUNTIME_ENABLED === "true",
    python: process.env.PYSPARK_PYTHON_BIN ?? "python3",
    javaHome: process.env.PYSPARK_JAVA_HOME,
    maxConcurrency: Math.max(1, Number(process.env.PYSPARK_RUNTIME_MAX_CONCURRENCY ?? "2")),
    isolation:
      process.env.PYSPARK_RUNTIME_ISOLATION === "host" ||
      process.env.PYSPARK_RUNTIME_ISOLATION === "container"
        ? process.env.PYSPARK_RUNTIME_ISOLATION
        : process.env.NODE_ENV === "production"
          ? "container"
          : "host",
    containerRuntime: process.env.PYSPARK_CONTAINER_RUNTIME ?? "docker",
    containerImage:
      process.env.PYSPARK_RUNTIME_IMAGE ?? "mastery-platform-pyspark-runtime:3.5.1",
    production: process.env.NODE_ENV === "production",
  };
}

export function canExecutePysparkWorker(configuration: RuntimeConfiguration) {
  return !configuration.production || configuration.isolation === "container";
}

export function buildPysparkWorkerLaunch(
  configuration: RuntimeConfiguration,
  directory: string,
  inputPath: string,
  runnerPath: string,
) {
  if (configuration.isolation === "container") {
    return {
      executable: configuration.containerRuntime,
      args: [
        "run",
        "--rm",
        "--network=none",
        "--read-only",
        "--cap-drop=ALL",
        "--security-opt=no-new-privileges",
        "--pids-limit=128",
        "--memory=1g",
        "--cpus=1",
        "--tmpfs=/tmp:rw,noexec,nosuid,size=256m",
        `--mount=type=bind,src=${directory},dst=/work,readonly`,
        "--env=SPARK_LOCAL_IP=127.0.0.1",
        "--env=SPARK_LOCAL_DIRS=/tmp/spark",
        configuration.containerImage,
        "/work/input.json",
      ],
      env: { NODE_ENV: process.env.NODE_ENV, PATH: process.env.PATH ?? "" },
    };
  }

  return {
    executable: configuration.python,
    args: [runnerPath, inputPath],
    env: {
      NODE_ENV: process.env.NODE_ENV,
      ...(configuration.javaHome ? { JAVA_HOME: configuration.javaHome } : {}),
      PATH: process.env.PATH ?? "",
      PYSPARK_PYTHON: configuration.python,
      SPARK_LOCAL_IP: "127.0.0.1",
      SPARK_LOCAL_DIRS: directory,
    },
  };
}

export function getPysparkRuntimeStatus() {
  const configuration = runtimeConfiguration();
  return {
    enabled: configuration.enabled,
    availableSlots: Math.max(0, configuration.maxConcurrency - activeRuns),
    isolation: configuration.isolation,
  };
}

export async function executePysparkRuntime(
  spec: PysparkRuntimeSpec,
  source: string,
): Promise<PysparkRuntimeResult> {
  const configuration = runtimeConfiguration();
  if (!configuration.enabled) {
    return {
      passed: false,
      score: 0,
      mode: "pyspark-runtime",
      feedback: ["Real Spark execution is disabled on this server."],
      durationMs: 0,
      errorCode: "RUNTIME_DISABLED",
    };
  }
  if (!canExecutePysparkWorker(configuration)) {
    return {
      passed: false,
      score: 0,
      mode: "pyspark-runtime",
      feedback: ["Production Spark execution requires container isolation."],
      durationMs: 0,
      errorCode: "RUNTIME_UNAVAILABLE",
    };
  }
  if (activeRuns >= configuration.maxConcurrency) {
    return {
      passed: false,
      score: 0,
      mode: "pyspark-runtime",
      feedback: ["The Spark runtime is at capacity. Try again shortly."],
      durationMs: 0,
      errorCode: "RESOURCE_LIMIT",
    };
  }

  activeRuns += 1;
  const directory = await mkdtemp(
    path.join(/*turbopackIgnore: true*/ tmpdir(), "mastery-pyspark-"),
  );
  const inputPath = path.join(directory, "input.json");
  const runnerPath =
    process.env.PYSPARK_RUNNER_PATH ??
    path.join(/*turbopackIgnore: true*/ process.cwd(), "runtime/pyspark_runner.py");
  const started = Date.now();

  try {
    await writeFile(inputPath, JSON.stringify({ ...spec, source }), { mode: 0o600 });
    const launch = buildPysparkWorkerLaunch(configuration, directory, inputPath, runnerPath);
    const outcome = await new Promise<{ timedOut: boolean; logs: string }>((resolve, reject) => {
      const child = spawn(launch.executable, launch.args, {
        cwd: directory,
        detached: process.platform !== "win32",
        env: launch.env,
        shell: false,
        stdio: "pipe",
      });
      child.stdin.end();
      let logs = "";
      let timedOut = false;
      const capture = (chunk: Buffer) => {
        if (logs.length < MAX_LOG_BYTES) logs += chunk.toString("utf8").slice(0, MAX_LOG_BYTES - logs.length);
      };
      child.stdout.on("data", capture);
      child.stderr.on("data", capture);
      child.once("error", reject);
      const timer = setTimeout(() => {
        timedOut = true;
        if (process.platform === "win32") child.kill("SIGKILL");
        else process.kill(-child.pid!, "SIGKILL");
      }, TIMEOUT_MS);
      child.once("close", () => {
        clearTimeout(timer);
        resolve({ timedOut, logs });
      });
    });

    if (outcome.timedOut) {
      return {
        passed: false,
        score: 0,
        mode: "pyspark-runtime",
        feedback: ["Spark execution exceeded the 30 second limit."],
        durationMs: Date.now() - started,
        errorCode: "RESOURCE_LIMIT",
      };
    }

    if (process.env.PYSPARK_RUNTIME_DIAGNOSTICS === "true" && outcome.logs) {
      process.stderr.write(outcome.logs);
    }

    let rawResult: Omit<PysparkRuntimeResult, "score" | "mode">;
    try {
      const markerIndex = outcome.logs.indexOf(RESULT_PREFIX);
      const encodedResult =
        markerIndex >= 0
          ? outcome.logs
              .slice(markerIndex + RESULT_PREFIX.length)
              .split(/\r?\n/u, 1)[0]
              ?.trim()
          : undefined;
      if (!encodedResult) throw new Error("Worker result marker was missing.");
      rawResult = JSON.parse(encodedResult);
    } catch {
      return {
        passed: false,
        score: 0,
        mode: "pyspark-runtime",
        feedback: ["The Spark worker was unavailable. No runtime evidence was recorded."],
        durationMs: Date.now() - started,
        errorCode: "RUNTIME_UNAVAILABLE",
      };
    }
    return {
      ...rawResult,
      passed: rawResult.passed === true,
      score: rawResult.passed === true ? 100 : 0,
      mode: "pyspark-runtime",
      durationMs: rawResult.durationMs ?? Date.now() - started,
    };
  } finally {
    activeRuns -= 1;
    await rm(directory, { recursive: true, force: true });
  }
}
