import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildPysparkWorkerLaunch, canExecutePysparkWorker } from "@/lib/pyspark-runtime-server";

const baseConfiguration = {
  enabled: true,
  python: "/runtime/python",
  javaHome: "/runtime/java",
  maxConcurrency: 2,
  isolation: "container" as const,
  containerRuntime: "docker",
  containerImage: "mastery-platform-pyspark-runtime:3.5.1",
  production: false,
};

describe("PySpark runtime isolation", () => {
  it("constructs a locked-down container launch without mounting the repository", () => {
    const launch = buildPysparkWorkerLaunch(
      baseConfiguration,
      "/private/tmp/mastery-run",
      "/private/tmp/mastery-run/input.json",
      "/repo/runtime/pyspark_runner.py",
    );

    expect(launch.executable).toBe("docker");
    expect(launch.args).toEqual(
      expect.arrayContaining([
        "--network=none",
        "--read-only",
        "--cap-drop=ALL",
        "--security-opt=no-new-privileges",
        "--pids-limit=128",
        "--memory=1g",
        "--cpus=1",
        "--mount=type=bind,src=/private/tmp/mastery-run,dst=/work,readonly",
      ]),
    );
    expect(launch.args.join(" ")).not.toContain("/repo");
    expect(launch.args.at(-1)).toBe("/work/input.json");
  });

  it("refuses host-process execution in production", () => {
    expect(
      canExecutePysparkWorker({
        ...baseConfiguration,
        production: true,
        isolation: "host",
      }),
    ).toBe(false);
    expect(
      canExecutePysparkWorker({
        ...baseConfiguration,
        production: true,
        isolation: "container",
      }),
    ).toBe(true);
  });
});
