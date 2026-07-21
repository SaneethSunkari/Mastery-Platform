import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMasteryExerciseForLesson } from "@/lib/mastery-exercises";
import { lessons } from "@/lib/curriculum";

class FakeWorker {
  static instances: FakeWorker[] = [];
  listeners = new Set<(event: MessageEvent) => void>();
  terminated = false;

  constructor() {
    FakeWorker.instances.push(this);
  }

  addEventListener(_type: string, listener: (event: MessageEvent) => void) {
    this.listeners.add(listener);
  }

  removeEventListener(_type: string, listener: (event: MessageEvent) => void) {
    this.listeners.delete(listener);
  }

  postMessage(message: { id: string; type: string }) {
    const emit = (payload: unknown) => {
      for (const listener of this.listeners) {
        listener({
          data: payload,
        } as MessageEvent);
      }
    };

    emit({
      id: "stale-id",
      type: "python-result",
      payload: {
        passed: false,
        score: 0,
        stdout: "",
        stderr: "",
        visibleResults: [],
        hiddenFailures: [],
        error: { message: "stale", traceback: "" },
      },
    });

    emit({
      id: message.id,
      type: "python-result",
      payload: {
        passed: true,
        score: 100,
        stdout: "ok",
        stderr: "",
        visibleResults: [],
        hiddenFailures: [],
        error: null,
      },
    });
  }

  terminate() {
    this.terminated = true;
  }
}

describe("python runner orchestration", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    FakeWorker.instances.length = 0;
    vi.stubGlobal("Worker", FakeWorker);
    vi.stubGlobal("window", globalThis);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("returns a matching worker result and ignores stale responses", async () => {
    const { runPythonExercise } = await import("@/lib/python-runner");
    const lesson = lessons.find((item) => item.courseSlug === "python")!;
    const exercise = getMasteryExerciseForLesson(lesson.id)!;

    const resultPromise = runPythonExercise(exercise, "def solve(data):\n    return data\n");
    const result = await resultPromise;

    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.error).toBeNull();
  });

  it("resets the worker and surfaces a timeout cleanly", async () => {
    class NeverRespondingWorker extends FakeWorker {
      override postMessage() {}
    }

    vi.stubGlobal("Worker", NeverRespondingWorker);
    const { runPythonExercise, resetPythonWorker } = await import("@/lib/python-runner");
    const lesson = lessons.find((item) => item.courseSlug === "python")!;
    const exercise = getMasteryExerciseForLesson(lesson.id)!;

    const promise = runPythonExercise(exercise, "def solve(data):\n    return data\n", 50);
    await vi.advanceTimersByTimeAsync(60);
    const result = await promise;

    expect(result.passed).toBe(false);
    expect(result.error?.message).toContain("timed out");

    resetPythonWorker();
    expect(NeverRespondingWorker.instances.at(-1)?.terminated).toBe(true);
  });
});
