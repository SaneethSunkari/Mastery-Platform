import { PYSPARK_RUNTIME_MAX_SOURCE_BYTES } from "@/lib/pyspark-runtime-contract";
import { executePysparkRuntime, getPysparkRuntimeStatus } from "@/lib/pyspark-runtime-server";
import { getPysparkRuntimeSpec } from "@/lib/pyspark-runtime-specs";

export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'",
  "X-Content-Type-Options": "nosniff",
};

export async function GET() {
  return Response.json(getPysparkRuntimeStatus(), { headers: responseHeaders });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Cross-origin runtime requests are not allowed." }, { status: 403, headers: responseHeaders });
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > PYSPARK_RUNTIME_MAX_SOURCE_BYTES * 2) {
    return Response.json({ error: "Request is too large." }, { status: 413, headers: responseHeaders });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Expected a JSON request." }, { status: 400, headers: responseHeaders });
  }
  if (
    typeof body !== "object" ||
    body === null ||
    !("questionId" in body) ||
    !("source" in body) ||
    typeof body.questionId !== "string" ||
    typeof body.source !== "string" ||
    Buffer.byteLength(body.source, "utf8") > PYSPARK_RUNTIME_MAX_SOURCE_BYTES
  ) {
    return Response.json({ error: "Invalid runtime request." }, { status: 400, headers: responseHeaders });
  }

  const spec = getPysparkRuntimeSpec(body.questionId);
  if (!spec) {
    return Response.json(
      {
        passed: false,
        score: 0,
        mode: "pyspark-runtime",
        feedback: ["This question does not have a real Spark runtime validator yet."],
        durationMs: 0,
        errorCode: "UNSUPPORTED_QUESTION",
      },
      { status: 422, headers: responseHeaders },
    );
  }

  const result = await executePysparkRuntime(spec, body.source);
  const status = result.errorCode === "RUNTIME_DISABLED" ? 503 : result.errorCode === "RESOURCE_LIMIT" ? 429 : 200;
  return Response.json(result, { status, headers: responseHeaders });
}
