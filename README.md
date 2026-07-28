# Mastery

Mastery is a local-first adaptive AI coding tutor for SQL, Python, and PySpark. The user-facing application contains five routes: `/dashboard`, `/sql`, `/python`, `/pyspark`, and `/arcade`.

## Architecture

- Curriculum map: structured subtopic and skill-dimension nodes in `src/lib/adaptive/curriculum.ts`.
- Adaptive scheduler: deterministic application-side selection across weakness, neighbors, review, new concepts, interview combinations, and stretch work.
- AI teacher: server-only OpenAI Responses API integration with strict structured outputs.
- Execution and validation: isolated SQL and Python runtimes plus explicitly labeled PySpark structural validation when real Spark is unavailable.
- Persistence: minimal progress and review state in browser `localStorage`; evaluation secrets remain server-sealed.

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Set `OPENAI_API_KEY` in the server environment. Without it, the app shows a configuration message and does not invent AI content. `OPENAI_MODEL` defaults to `gpt-5.6-sol`.

## Verification

```bash
npm run validate:content
npm run test
npm run typecheck
npm run lint
npm run build
npm audit --audit-level=high
```

## Render

Use Node 20 or newer, build with `npm ci && npm run build`, and start with `npm run start`. Set `OPENAI_API_KEY`, `OPENAI_MODEL`, and `MASTERY_TOKEN_SECRET`. Keep `PYSPARK_RUNTIME_ENABLED=false` unless the service has an isolated container runtime with Java and PySpark; structural passes never count as real Spark runtime evidence.
