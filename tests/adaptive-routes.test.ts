import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("product routes", () => {
  it("redirects every legacy user-facing route to the dashboard", async () => {
    const redirects = await nextConfig.redirects?.();
    const sources = redirects?.map((item) => item.source) ?? [];
    expect(sources).toContain("/materials/:path*");
    expect(sources).toContain("/sql/week/:path*");
    expect(sources).toContain("/settings");
    expect(redirects?.every((item) => item.destination === "/dashboard")).toBe(true);
  });
});
