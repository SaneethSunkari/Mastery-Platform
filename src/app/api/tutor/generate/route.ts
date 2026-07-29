import { AiConfigurationError, AiProviderError } from "@/lib/adaptive/server/openai";
import { generateArcadeQuestion, generateQuestion, learnerQuestion, validateProgressPayload } from "@/lib/adaptive/server/service";
import { sealQuestion } from "@/lib/adaptive/server/secure-token";
import type { SchedulerOptions, Technology } from "@/lib/adaptive/types";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 300_000) return Response.json({ error: "Progress payload is too large.", code: "INVALID_REQUEST" }, { status: 413, headers });
    const body = JSON.parse(raw) as { technology?: unknown; progress?: unknown; selection?: unknown };
    if (!["sql", "python", "pyspark", "arcade"].includes(String(body.technology))) return Response.json({ error: "Unknown learning technology.", code: "INVALID_REQUEST" }, { status: 400, headers });
    const progress = validateProgressPayload(body.progress);
    let selection: SchedulerOptions = {};
    if (body.selection !== undefined) {
      if (!body.selection || typeof body.selection !== "object") return Response.json({ error: "Invalid selection request.", code: "INVALID_REQUEST" }, { status: 400, headers });
      const candidate = body.selection as Record<string, unknown>;
      if (candidate.adjustment !== undefined && !["easier", "harder"].includes(String(candidate.adjustment))) return Response.json({ error: "Invalid difficulty adjustment.", code: "INVALID_REQUEST" }, { status: 400, headers });
      if (candidate.currentNodeId !== undefined && typeof candidate.currentNodeId !== "string") return Response.json({ error: "Invalid current curriculum node.", code: "INVALID_REQUEST" }, { status: 400, headers });
      if (candidate.currentDifficulty !== undefined && (![1, 2, 3, 4, 5].includes(Number(candidate.currentDifficulty)))) return Response.json({ error: "Invalid current difficulty.", code: "INVALID_REQUEST" }, { status: 400, headers });
      selection = { adjustment: candidate.adjustment as SchedulerOptions["adjustment"], currentNodeId: candidate.currentNodeId as string | undefined, currentDifficulty: candidate.currentDifficulty as SchedulerOptions["currentDifficulty"] };
    }
    const result = body.technology === "arcade" ? await generateArcadeQuestion(progress) : await generateQuestion(body.technology as Technology, progress, selection);
    return Response.json({ question: learnerQuestion(result.question), evaluationToken: sealQuestion(result.question), scheduleReason: result.reason }, { headers });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof Error && ["INVALID_PROGRESS", "INVALID_LLM_JSON"].includes(error.message)) return Response.json({ error: "The request or AI response was malformed.", code: "INVALID_RESPONSE" }, { status: 422, headers });
    if (error instanceof AiConfigurationError) return Response.json({ error: error.message, code: "OPENAI_NOT_CONFIGURED" }, { status: 503, headers });
    if (error instanceof AiProviderError) return Response.json({ error: error.message, code: "OPENAI_PROVIDER_ERROR" }, { status: error.status, headers });
    if (error instanceof Error && error.message === "DUPLICATE_GENERATION") return Response.json({ error: "The AI repeated a recent exercise. Please try Next Question again.", code: "DUPLICATE_GENERATION" }, { status: 409, headers });
    if (error instanceof Error && error.message === "INELIGIBLE_GENERATION") return Response.json({ error: "The AI could not produce a safe question for the selected skill. Try again shortly.", code: "INELIGIBLE_GENERATION" }, { status: 409, headers });
    if (error instanceof Error && error.message === "DIAGNOSTIC_BANK_EXHAUSTED") return Response.json({ error: "You have completed every available diagnostic variation for this skill.", code: "DIAGNOSTIC_BANK_EXHAUSTED" }, { status: 409, headers });
    return Response.json({ error: "Question generation failed safely.", code: "GENERATION_FAILED" }, { status: 500, headers });
  }
}
