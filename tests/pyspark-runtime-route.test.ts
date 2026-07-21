import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { GET, POST } from "@/app/api/pyspark/run/route";

describe("PySpark runtime route", () => {
  afterEach(() => {
    delete process.env.PYSPARK_RUNTIME_ENABLED;
  });

  it("reports disabled status without exposing executable paths", async () => {
    const response = await GET();
    const body = await response.json();
    expect(body).toEqual({ enabled: false, availableSlots: 2, isolation: "host" });
    expect(JSON.stringify(body)).not.toContain("/opt/");
  });

  it("rejects cross-origin execution requests", async () => {
    const response = await POST(
      new Request("http://localhost/api/pyspark/run", {
        method: "POST",
        headers: { origin: "https://attacker.example", "content-type": "application/json" },
        body: JSON.stringify({ questionId: "pyspark-q-0026", source: "result = orders_df" }),
      }),
    );
    expect(response.status).toBe(403);
  });

  it("rejects unsupported questions without executing a worker", async () => {
    const response = await POST(
      new Request("http://localhost/api/pyspark/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questionId: "pyspark-q-0001", source: "answer = 'x'" }),
      }),
    );
    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body.errorCode).toBe("UNSUPPORTED_QUESTION");
  });

  it("keeps runtime disabled unless the server opts in", async () => {
    const response = await POST(
      new Request("http://localhost/api/pyspark/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          questionId: "pyspark-q-0026",
          source: "result = orders_df.select('customer_id', 'status')",
        }),
      }),
    );
    const body = await response.json();
    expect(response.status).toBe(503);
    expect(body.errorCode).toBe("RUNTIME_DISABLED");
  });
});
