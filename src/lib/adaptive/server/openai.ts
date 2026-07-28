import "server-only";

const API_URL = "https://api.openai.com/v1/responses";

type JsonSchema = Record<string, unknown>;

export class AiConfigurationError extends Error {}
export class AiProviderError extends Error {
  constructor(message: string, public status = 502) { super(message); }
}

function extractOutput(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const response = payload as { output_text?: unknown; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  if (typeof response.output_text === "string") return response.output_text;
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") return content.text;
    }
  }
  return null;
}

export async function requestStructuredJson<T>(name: string, prompt: string, schema: JsonSchema, signal?: AbortSignal): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new AiConfigurationError("OpenAI is not configured. Add OPENAI_API_KEY to the server environment.");
  const timeout = AbortSignal.timeout(30_000);
  const combinedSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.6-sol",
        reasoning: { effort: "low" },
        input: [{ role: "developer", content: "Return only the requested structured result. Be deterministic, concise, and follow every schema invariant." }, { role: "user", content: prompt }],
        text: { verbosity: "low", format: { type: "json_schema", name, strict: true, schema } },
      }),
      signal: combinedSignal,
    });
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) throw new AiProviderError("The AI request timed out. Try again.", 504);
    throw new AiProviderError("The AI provider could not be reached.");
  }
  if (!response.ok) {
    const message = response.status === 429 ? "The AI service is rate limited. Try again shortly." : `The AI provider returned ${response.status}.`;
    throw new AiProviderError(message, response.status === 429 ? 429 : 502);
  }
  const text = extractOutput(await response.json());
  if (!text) throw new AiProviderError("The AI provider returned no structured output.");
  try { return JSON.parse(text) as T; } catch { throw new AiProviderError("The AI provider returned invalid JSON."); }
}

const stringArray = { type: "array", items: { type: "string" } };
const jsonString = { type: "string", description: "A valid JSON-encoded value." };
const testCase = { type: "object", additionalProperties: false, properties: { description: { type: "string" }, input: jsonString, expected: jsonString }, required: ["description", "input", "expected"] };

export const questionSchema: JsonSchema = {
  type: "object", additionalProperties: false,
  properties: {
    id: { type: "string" }, technology: { enum: ["sql", "python", "pyspark", "arcade"] }, curriculumNodeId: { type: "string" }, topic: { type: "string" }, subtopic: { type: "string" }, difficulty: { type: "integer", minimum: 1, maximum: 5 }, exerciseMode: { enum: ["write_from_scratch", "code_completion", "debugging", "optimization", "explanation"] }, prerequisiteIds: stringArray, diagnosticQuestion: { type: "boolean" }, learnerInstructions: { type: "string" }, title: { type: "string" }, scenario: { type: "string" }, prompt: { type: "string" }, schema: jsonString, sampleData: jsonString, expectedBehavior: stringArray, hiddenTests: { type: "array", items: testCase }, referenceSolution: { type: "string" }, starterCode: { type: "string" }, rubric: stringArray, skillDimensions: stringArray,
    fingerprint: { type: "object", additionalProperties: false, properties: { technology: { type: "string" }, topic: { type: "string" }, subtopic: { type: "string" }, pattern: { type: "string" }, scenario: { type: "string" }, difficulty: { type: "integer" }, skills: stringArray, schemaSignature: { type: "string" } }, required: ["technology", "topic", "subtopic", "pattern", "scenario", "difficulty", "skills", "schemaSignature"] },
    runtime: { type: "object", additionalProperties: false, properties: { setupSql: { type: ["string", "null"] }, functionName: { type: ["string", "null"] }, visibleTests: { type: ["array", "null"], items: testCase }, pysparkQuestionId: { type: ["string", "null"] } }, required: ["setupSql", "functionName", "visibleTests", "pysparkQuestionId"] },
  },
  required: ["id", "technology", "curriculumNodeId", "topic", "subtopic", "difficulty", "exerciseMode", "prerequisiteIds", "diagnosticQuestion", "learnerInstructions", "title", "scenario", "prompt", "schema", "sampleData", "expectedBehavior", "hiddenTests", "referenceSolution", "starterCode", "rubric", "skillDimensions", "fingerprint", "runtime"],
};

export const evaluationSchema: JsonSchema = {
  type: "object", additionalProperties: false,
  properties: { verdict: { enum: ["correct", "partially-correct", "incorrect"] }, score: { type: "integer", minimum: 0, maximum: 100 }, doneWell: stringArray, improvements: stringArray, mistakeClassification: { type: "string" }, explanation: { type: "string" }, suggestedNextAction: { type: "string" } },
  required: ["verdict", "score", "doneWell", "improvements", "mistakeClassification", "explanation", "suggestedNextAction"],
};

export const assistanceSchema: JsonSchema = { type: "object", additionalProperties: false, properties: { message: { type: "string" } }, required: ["message"] };
