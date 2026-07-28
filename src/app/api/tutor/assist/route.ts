import { AiConfigurationError, AiProviderError } from "@/lib/adaptive/server/openai";
import { openQuestion } from "@/lib/adaptive/server/secure-token";
import { teacherAssistance } from "@/lib/adaptive/server/service";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function POST(request: Request) {
  try {
    const body = await request.json() as { evaluationToken?: unknown; code?: unknown; kind?: unknown };
    if (typeof body.evaluationToken !== "string" || typeof body.code !== "string" || !["hint", "explain"].includes(String(body.kind))) return Response.json({ error: "Invalid assistance request." }, { status: 400, headers });
    const question = openQuestion(body.evaluationToken);
    return Response.json({ message: await teacherAssistance({ kind: body.kind as "hint" | "explain", question, code: body.code }) }, { headers });
  } catch (error) {
    if (error instanceof AiConfigurationError) return Response.json({ error: error.message, code: "OPENAI_NOT_CONFIGURED" }, { status: 503, headers });
    if (error instanceof AiProviderError) return Response.json({ error: error.message, code: "OPENAI_PROVIDER_ERROR" }, { status: error.status, headers });
    return Response.json({ error: "Assistance failed safely." }, { status: 400, headers });
  }
}
