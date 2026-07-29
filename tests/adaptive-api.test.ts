import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { curriculumById } from "@/lib/adaptive/curriculum";
import { DIAGNOSTIC_NODE_IDS } from "@/lib/adaptive/diagnostic";
import { emptyProgress } from "@/lib/adaptive/progress";
import type { GeneratedQuestion, ProgressState, Technology } from "@/lib/adaptive/types";

vi.mock("server-only", () => ({}));

const diagnosticNodes: Record<Technology, string> = {
  sql: "sql-foundations-select",
  python: "python-foundations-variables",
  pyspark: "pyspark-dataframe-creation-lists",
};

function generatedFor(technology: Technology, diagnosticQuestion = true): GeneratedQuestion {
  const node = curriculumById.get(diagnosticNodes[technology])!;
  const starterCode = technology === "sql"
    ? "-- Write your query here"
    : technology === "python"
      ? "def summarize_batch(rows):\n    pass"
      : "# Write your transformation here\nresult_df = None";
  const referenceSolution = technology === "sql"
    ? "SELECT id FROM orders WHERE valid = 1"
    : technology === "python"
      ? "def summarize_batch(rows):\n    return len(rows)"
      : "result_df = spark.createDataFrame([(1,)], ['id'])";
  return {
    id: "model-id",
    technology,
    curriculumNodeId: node.id,
    topic: node.topic,
    subtopic: node.subtopic,
    difficulty: 1,
    exerciseMode: "write_from_scratch",
    prerequisiteIds: [...node.prerequisites],
    diagnosticQuestion,
    learnerInstructions: "Write the complete solution from scratch.",
    title: "Starter diagnostic",
    scenario: "Order operations",
    prompt: technology === "sql" ? "Return the order identifiers." : "Complete the requested beginner task.",
    schema: { orders: ["id", "valid"] },
    sampleData: [{ id: 1, valid: 1 }],
    expectedBehavior: ["Return the expected result"],
    hiddenTests: [{ description: "hidden row", input: null, expected: null }],
    referenceSolution,
    starterCode,
    rubric: ["Correct output"],
    skillDimensions: [...node.skillDimensions],
    fingerprint: { technology, topic: node.topic, subtopic: node.subtopic, pattern: "starter diagnostic", scenario: "Order operations", difficulty: 1, skills: [...node.skillDimensions], schemaSignature: "orders(id,valid)" },
    runtime: { setupSql: "CREATE TABLE orders(id INTEGER, valid INTEGER); INSERT INTO orders VALUES (1,1),(2,0);", functionName: technology === "python" ? "summarize_batch" : undefined, visibleTests: undefined, pysparkQuestionId: undefined },
  };
}

function afterDiagnostic(technology: Technology): ProgressState {
  const progress = emptyProgress();
  progress.diagnostics[technology] = { started: true, shortened: false, completedNodeIds: [...DIAGNOSTIC_NODE_IDS[technology]] };
  return progress;
}

function providerResponse(value: unknown) {
  return new Response(JSON.stringify({ output_text: JSON.stringify(value) }), { status: 200, headers: { "content-type": "application/json" } });
}

describe("adaptive AI endpoints", () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-key-not-real";
    process.env.MASTERY_TOKEN_SECRET = "test-token-secret";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.OPENAI_API_KEY;
    delete process.env.MASTERY_TOKEN_SECRET;
  });

  it.each(["sql", "python", "pyspark"])("generates a protected %s question", async (technology) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("@/app/api/tutor/generate/route");
    const response = await POST(new Request("http://localhost/api/tutor/generate", { method: "POST", body: JSON.stringify({ technology, progress: emptyProgress() }) }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.question.technology).toBe(technology);
    expect(body.question.referenceSolution).toBeUndefined();
    expect(body.question.hiddenTests).toBeUndefined();
    expect(body.evaluationToken).toMatch(/^[^.]+\.[^.]+\.[^.]+$/u);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("serves same-node diagnostic difficulty adjustments from the bank", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const progress = emptyProgress();
    progress.diagnostics.sql.started = true;
    const { POST } = await import("@/app/api/tutor/generate/route");
    const response = await POST(new Request("http://localhost/api/tutor/generate", { method: "POST", body: JSON.stringify({ technology: "sql", progress, selection: { adjustment: "harder", currentNodeId: "sql-foundations-select", currentDifficulty: 1 } }) }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.question.curriculumNodeId).toBe("sql-foundations-select");
    expect(body.question.difficulty).toBe(2);
    expect(body.question.learnerInstructions).toContain("Slightly harder variation");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a clear missing-key response without calling a provider", async () => {
    delete process.env.OPENAI_API_KEY;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("@/app/api/tutor/generate/route");
    const response = await POST(new Request("http://localhost/api/tutor/generate", { method: "POST", body: JSON.stringify({ technology: "sql", progress: afterDiagnostic("sql") }) }));
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe("OPENAI_NOT_CONFIGURED");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects malformed model JSON", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => providerResponse({ title: "incomplete" })));
    const { POST } = await import("@/app/api/tutor/generate/route");
    const response = await POST(new Request("http://localhost/api/tutor/generate", { method: "POST", body: JSON.stringify({ technology: "sql", progress: afterDiagnostic("sql") }) }));
    expect(response.status).toBe(422);
    expect((await response.json()).code).toBe("INVALID_RESPONSE");
  });

  it("uses strict-compatible JSON strings for model-generated data", async () => {
    const { questionSchema } = await import("@/lib/adaptive/server/openai");
    const properties = questionSchema.properties as Record<string, { type?: unknown }>;
    expect(properties.schema.type).toBe("string");
    expect(properties.sampleData.type).toBe("string");

    const generated = generatedFor("sql", false);
    const encoded = {
      ...generated,
      schema: JSON.stringify(generated.schema),
      sampleData: JSON.stringify(generated.sampleData),
      hiddenTests: [{ description: "hidden row", input: "null", expected: "null" }],
    };
    vi.stubGlobal("fetch", vi.fn(async () => providerResponse(encoded)));
    const { POST } = await import("@/app/api/tutor/generate/route");
    const response = await POST(new Request("http://localhost/api/tutor/generate", { method: "POST", body: JSON.stringify({ technology: "sql", progress: afterDiagnostic("sql") }) }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.question.schema).toEqual(generated.schema);
    expect(body.question.sampleData).toEqual(generated.sampleData);
    const { openQuestion } = await import("@/lib/adaptive/server/secure-token");
    expect(openQuestion(body.evaluationToken).hiddenTests[0]).toMatchObject({ input: null, expected: null });
  });

  it("evaluates SQL with runtime evidence before teacher feedback", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => providerResponse({ verdict: "correct", score: 95, doneWell: ["Correct predicate"], improvements: [], mistakeClassification: "none", explanation: "The query filters invalid rows.", suggestedNextAction: "Try null validity flags." })));
    const { sealQuestion } = await import("@/lib/adaptive/server/secure-token");
    const { POST } = await import("@/app/api/tutor/evaluate/route");
    const generated = generatedFor("sql");
    const sealedQuestion = { ...generated, runtime: { setupSql: generated.runtime?.setupSql } } as GeneratedQuestion;
    const response = await POST(new Request("http://localhost/api/tutor/evaluate", { method: "POST", body: JSON.stringify({ evaluationToken: sealQuestion(sealedQuestion), code: "SELECT id FROM orders WHERE valid = 1" }) }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.verdict).toBe("correct");
    expect(body.hiddenTestsPassed).toBe(true);
    expect(body.runtimePassed).toBe(true);
  });

  it("regenerates when the model returns a scheduler-ineligible question", async () => {
    const valid = generatedFor("sql", false);
    const invalid = { ...valid, curriculumNodeId: "sql-offset-functions-lag", subtopic: "LAG" };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(providerResponse(invalid))
      .mockResolvedValueOnce(providerResponse(valid));
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("@/app/api/tutor/generate/route");
    const response = await POST(new Request("http://localhost/api/tutor/generate", { method: "POST", body: JSON.stringify({ technology: "sql", progress: afterDiagnostic("sql") }) }));
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect((await response.json()).question.curriculumNodeId).toBe("sql-foundations-select");
  });

  it("fails safely after repeated ineligible model output", async () => {
    const invalid = { ...generatedFor("sql", false), curriculumNodeId: "sql-offset-functions-lag", subtopic: "LAG" };
    vi.stubGlobal("fetch", vi.fn(async () => providerResponse(invalid)));
    const { POST } = await import("@/app/api/tutor/generate/route");
    const response = await POST(new Request("http://localhost/api/tutor/generate", { method: "POST", body: JSON.stringify({ technology: "sql", progress: afterDiagnostic("sql") }) }));
    expect(response.status).toBe(409);
    expect((await response.json()).code).toBe("INELIGIBLE_GENERATION");
  });
});
