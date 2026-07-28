import { AiConfigurationError, AiProviderError } from "@/lib/adaptive/server/openai";
import { generateArcadeQuestion, generateQuestion, learnerQuestion, validateProgressPayload } from "@/lib/adaptive/server/service";
import { sealQuestion } from "@/lib/adaptive/server/secure-token";
import type { Technology } from "@/lib/adaptive/types";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 300_000) return Response.json({ error: "Progress payload is too large.", code: "INVALID_REQUEST" }, { status: 413, headers });
    const body = JSON.parse(raw) as { technology?: unknown; progress?: unknown };
    if (!["sql", "python", "pyspark", "arcade"].includes(String(body.technology))) return Response.json({ error: "Unknown learning technology.", code: "INVALID_REQUEST" }, { status: 400, headers });
    const progress = validateProgressPayload(body.progress);
    const result = body.technology === "arcade" ? await generateArcadeQuestion(progress) : await generateQuestion(body.technology as Technology, progress);
    return Response.json({ question: learnerQuestion(result.question), evaluationToken: sealQuestion(result.question), scheduleReason: result.reason }, { headers });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof Error && ["INVALID_PROGRESS", "INVALID_LLM_JSON"].includes(error.message)) return Response.json({ error: "The request or AI response was malformed.", code: "INVALID_RESPONSE" }, { status: 422, headers });
    if (error instanceof AiConfigurationError) return Response.json({ error: error.message, code: "OPENAI_NOT_CONFIGURED" }, { status: 503, headers });
    if (error instanceof AiProviderError) return Response.json({ error: error.message, code: "OPENAI_PROVIDER_ERROR" }, { status: error.status, headers });
    if (error instanceof Error && error.message === "DUPLICATE_GENERATION") return Response.json({ error: "The AI repeated a recent exercise. Please try Next Question again.", code: "DUPLICATE_GENERATION" }, { status: 409, headers });
    return Response.json({ error: "Question generation failed safely.", code: "GENERATION_FAILED" }, { status: 500, headers });
  }
}
