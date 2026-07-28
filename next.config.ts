import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      "/materials/:path*",
      "/settings",
      "/interview",
      "/notes",
      "/practice",
      "/projects",
      "/revision",
      "/progress",
      "/sql/week/:path*",
      "/sql/lesson/:path*",
      "/python/week/:path*",
      "/python/lesson/:path*",
      "/pyspark/week/:path*",
      "/pyspark/lesson/:path*",
    ].map((source) => ({ source, destination: "/dashboard", permanent: false }));
  },
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
