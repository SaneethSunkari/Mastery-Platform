import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emptyProgress } from "@/lib/adaptive/progress";
import type { GeneratedQuestion } from "@/lib/adaptive/types";

vi.mock("server-only", () => ({}));

const generated = {
  id: "model-id",
  technology: "sql",
  curriculumNodeId: "ignored",
  topic: "Ignored",
  subtopic: "Ignored",
  difficulty: 2,
  title: "Latest valid order",
  scenario: "Order operations",
  prompt: "Return every valid order.",
  schema: { orders: ["id", "valid"] },
  sampleData: [{ id: 1, valid: 1 }],
  expectedBehavior: ["Return id 1"],
  hiddenTests: [{ description: "hidden row", input: null, expected: null }],
  referenceSolution: "SELECT id FROM orders WHERE valid = 1",
  starterCode: "SELECT\n  -- write your query",
  rubric: ["Correct rows"],
  skillDimensions: ["filtering"],
  fingerprint: { technology: "sql", topic: "Filtering", subtopic: "WHERE", pattern: "valid rows", scenario: "Order operations", difficulty: 2, skills: ["filtering"], schemaSignature: "orders(id,valid)" },
  runtime: { setupSql: "CREATE TABLE orders(id INTEGER, valid INTEGER); INSERT INTO orders VALUES (1,1),(2,0);", functionName: null, visibleTests: null, pysparkQuestionId: null },
};

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
    vi.stubGlobal("fetch", vi.fn(async () => providerResponse({ ...generated, technology })));
    const { POST } = await import("@/app/api/tutor/generate/route");
    const response = await POST(new Request("http://localhost/api/tutor/generate", { method: "POST", body: JSON.stringify({ technology, progress: emptyProgress() }) }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.question.technology).toBe(technology);
    expect(body.question.referenceSolution).toBeUndefined();
    expect(body.question.hiddenTests).toBeUndefined();
    expect(body.evaluationToken).toMatch(/^[^.]+\.[^.]+\.[^.]+$/u);
  });

  it("returns a clear missing-key response without calling a provider", async () => {
    delete process.env.OPENAI_API_KEY;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("@/app/api/tutor/generate/route");
    const response = await POST(new Request("http://localhost/api/tutor/generate", { method: "POST", body: JSON.stringify({ technology: "sql", progress: emptyProgress() }) }));
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe("OPENAI_NOT_CONFIGURED");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects malformed model JSON", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => providerResponse({ title: "incomplete" })));
    const { POST } = await import("@/app/api/tutor/generate/route");
    const response = await POST(new Request("http://localhost/api/tutor/generate", { method: "POST", body: JSON.stringify({ technology: "sql", progress: emptyProgress() }) }));
    expect(response.status).toBe(422);
    expect((await response.json()).code).toBe("INVALID_RESPONSE");
  });

  it("uses strict-compatible JSON strings for model-generated data", async () => {
    const { questionSchema } = await import("@/lib/adaptive/server/openai");
    const properties = questionSchema.properties as Record<string, { type?: unknown }>;
    expect(properties.schema.type).toBe("string");
    expect(properties.sampleData.type).toBe("string");

    const encoded = {
      ...generated,
      schema: JSON.stringify(generated.schema),
      sampleData: JSON.stringify(generated.sampleData),
      hiddenTests: [{ description: "hidden row", input: "null", expected: "null" }],
    };
    vi.stubGlobal("fetch", vi.fn(async () => providerResponse(encoded)));
    const { POST } = await import("@/app/api/tutor/generate/route");
    const response = await POST(new Request("http://localhost/api/tutor/generate", { method: "POST", body: JSON.stringify({ technology: "sql", progress: emptyProgress() }) }));
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
    const sealedQuestion = { ...generated, technology: "sql" as const, runtime: { setupSql: generated.runtime.setupSql } } as GeneratedQuestion;
    const response = await POST(new Request("http://localhost/api/tutor/evaluate", { method: "POST", body: JSON.stringify({ evaluationToken: sealQuestion(sealedQuestion), code: "SELECT id FROM orders WHERE valid = 1" }) }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.verdict).toBe("correct");
    expect(body.hiddenTestsPassed).toBe(true);
    expect(body.runtimePassed).toBe(true);
  });
});
