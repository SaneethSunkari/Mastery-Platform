import { executeAnswer, executeArcade } from "@/lib/adaptive/server/runtime";
import { openQuestion } from "@/lib/adaptive/server/secure-token";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function POST(request: Request) {
  try {
    const body = await request.json() as { evaluationToken?: unknown; code?: unknown };
    if (typeof body.evaluationToken !== "string" || typeof body.code !== "string" || body.code.length > 60_000) return Response.json({ error: "Invalid run request." }, { status: 400, headers });
    const question = openQuestion(body.evaluationToken);
    const result = question.technology === "arcade" ? await executeArcade(question, body.code) : await executeAnswer(question, body.code);
    return Response.json(result, { headers });
  } catch {
    return Response.json({ error: "This question session is invalid or expired." }, { status: 400, headers });
  }
}
