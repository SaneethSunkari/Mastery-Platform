import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("canonical content validation command", () => {
  it("uses deterministic Vitest discovery instead of a stale manual file list", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts["validate:content"]).toBe("vitest run --maxWorkers=1");
    expect(packageJson.scripts["validate:content"]).not.toContain("tests/");
    expect(packageJson.scripts["validate:content"]).not.toContain("timeout");
  });
});
