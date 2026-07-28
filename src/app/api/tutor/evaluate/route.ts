import { executeAnswer, executeArcade } from "@/lib/adaptive/server/runtime";
import { AiProviderError } from "@/lib/adaptive/server/openai";
import { openQuestion } from "@/lib/adaptive/server/secure-token";
import { teacherEvaluation } from "@/lib/adaptive/server/service";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function POST(request: Request) {
  try {
    const body = await request.json() as { evaluationToken?: unknown; code?: unknown };
    if (typeof body.evaluationToken !== "string" || typeof body.code !== "string" || body.code.length > 60_000) return Response.json({ error: "Invalid evaluation request." }, { status: 400, headers });
    const question = openQuestion(body.evaluationToken);
    const runtimeResult = question.technology === "arcade" ? await executeArcade(question, body.code) : await executeAnswer(question, body.code);
    try {
      const evaluation = await teacherEvaluation({ question, code: body.code, runtimeSummary: runtimeResult.summary, passed: runtimeResult.passed, runtimePassed: runtimeResult.runtimePassed, validatorPassed: runtimeResult.validatorPassed });
      return Response.json(evaluation, { headers });
    } catch (error) {
      if (!(error instanceof AiProviderError)) throw error;
      return Response.json({
        verdict: runtimeResult.passed ? "correct" : "incorrect",
        score: runtimeResult.passed ? 100 : 0,
        doneWell: runtimeResult.passed ? ["The acceptance checks passed."] : [],
        improvements: runtimeResult.passed ? [] : ["Use the runtime result to revise the failing behavior."],
        mistakeClassification: runtimeResult.passed ? "none" : "acceptance-test failure",
        runtimeResult: runtimeResult.summary,
        explanation: "Runtime evidence is available, but the AI teacher explanation is temporarily unavailable.",
        suggestedNextAction: runtimeResult.passed ? "Try a changed scenario or edge case." : "Correct the failing behavior, then submit again.",
        hiddenTestsPassed: runtimeResult.passed,
        runtimePassed: runtimeResult.runtimePassed,
        validatorPassed: runtimeResult.validatorPassed,
      }, { headers });
    }
  } catch {
    return Response.json({ error: "Evaluation failed safely. The question session may be invalid or expired." }, { status: 400, headers });
  }
}
