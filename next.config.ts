import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  outputFileTracingIncludes: {
    "/api/pyspark/run": ["./runtime/pyspark_runner.py"],
  },
  outputFileTracingExcludes: {
    "/api/pyspark/run": [
      "./anaconda_projects/**/*",
      "./docs/**/*",
      "./public/**/*",
      "./src/**/*",
      "./tests/**/*",
      "./tsconfig*.json",
      "./vitest.config.ts",
    ],
  },
  turbopack: {
    ignoreIssue: [
      {
        path: "**/next.config.ts",
        title: "Encountered unexpected file in NFT list",
      },
    ],
  },
};

export default nextConfig;
