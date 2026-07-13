# SQL + Python + PySpark Legend Platform

## 1. Product Direction

This platform is a local-first training system for becoming strong in SQL, Python, and PySpark with a clear data-engineering focus.

The target product is a **6-month learning platform** that can be deployed permanently while still keeping the core learner experience local-first:

- real code editors
- real code execution where supported
- unlock-based progression
- browser-persistent progress
- simple deployment and maintenance

Current product truth:

- SQL Weeks 1-4 are the strongest interactive implementation today
- SQL uses `sql.js` and compares real output against expected output
- Python and PySpark tracks exist as structured learning/product surfaces, but they are not yet at the same execution depth as SQL
- Candy Arcade exists as a major interaction surface, but long-term it must be held to the same verification standard as the main mission lanes

## 2. Core Rules

- No fake passing
- No marking a task complete because an editor is non-empty
- IndexedDB remains the main learner data store
- UI state can use lightweight client state only
- SQL, Python, and PySpark must stay distinct enough to feel focused, but connected enough to feel like one data-engineering academy
- The 6-month roadmap must feel beginner-friendly at the start and professionally demanding at the end

## 3. Target 6-Month Shape

The product should be framed as a 24-week plan:

| Month | Focus |
|---|---|
| 1 | SQL basics, Python basics, data mindset |
| 2 | Filtering, joins, Python data structures, Spark basics |
| 3 | Aggregations, functions, files, DataFrames, transformation habits |
| 4 | Intermediate analytics, ETL logic, validation, PySpark joins/windows |
| 5 | Production patterns, debugging, performance, warehousing |
| 6 | Capstones, mixed-language projects, interview-style practice, deployment-ready outcomes |

This 6-month target does **not** mean the current codebase already has 24 fully interactive weeks. It means the architecture, copy, and long-term product plan should all aim there.

## 4. Current Technical Stack

- Next.js 16 App Router
- React
- TypeScript
- Dexie + IndexedDB
- Monaco Editor
- `sql.js` for in-browser SQL execution
- Local UI component system under `src/components/ui`

Key implementation files:

- `src/lib/db.ts`
- `src/lib/academy.ts`
- `src/lib/curriculum.ts`
- `src/lib/sql-weeks.ts`
- `src/lib/candy-arcade.ts`
- `src/components/sql/sql-week-workspace.tsx`
- `src/components/game/candy-arcade-view.tsx`
- `src/components/dashboard/dashboard-view.tsx`

## 5. Current Feature Surfaces

### Dashboard

Purpose:

- explain the platform
- show progress
- show track selection
- show materials and progression

### SQL Mission Lane

Purpose:

- real SQL learning through blank-editor tasks
- week-by-week unlock progression
- real query execution and result checking

Current interactive custom weeks:

- SQL Week 1
- SQL Week 2
- SQL Week 3
- SQL Week 4

### Track Pages

Tracks currently surfaced:

- SQL
- Python
- PySpark

These pages explain:

- track purpose
- question/game counts
- material pillars
- ladder from beginner to advanced

### Candy Arcade

Purpose:

- short challenge flow
- game-like progression
- one task solved across multiple languages

Current behavior:

- one level
- one problem
- SQL, Python, PySpark tabs
- one submit button per level

### Notes / Practice / Projects / Revision / Settings

These exist as product surfaces and local workflow tools, but they are still earlier than the main SQL mission lane in terms of depth.

## 6. Persistence Model

Primary IndexedDB domains include:

- course metadata
- week and lesson progress
- SQL mission task progress
- arcade progression
- notes
- revision data
- backups
- activity logs

Design principle:

- learner state should survive refreshes and return visits without requiring signup

## 7. Execution Model

### SQL

Already real:

- code runs in browser through `sql.js`
- task answers are checked by comparing query output to expected output

### Python

Target direction:

- Pyodide in-browser execution
- real test-case verification
- timeout handling

### PySpark

Target direction:

- structure-check mode for browser-safe validation
- runtime-verified mode for real Spark environments

## 8. Deployment Direction

Permanent deployment target:

- Vercel for the Next.js app
- minimal backend only if needed for billing or license verification
- Stripe-hosted checkout if monetization is introduced
- no always-on database required for the core free local-first product

The permanent deploy model should keep the core app lightweight:

- static App Router pages where possible
- browser-local persistence
- minimal operational burden

## 9. Honest Current Gaps

These gaps should be stated clearly to any future LLM or developer:

- The product is not yet a full 6-month fully interactive academy
- SQL is the only track with strong real grading depth today
- Python and PySpark are still behind SQL in true execution/verification
- Large counts like 1000 tasks/questions are mostly structural/product scaffolding, not proof of full authored depth
- Candy Arcade still needs stronger long-term grading rigor if it is to become production-trustworthy

## 10. What “Done” Looks Like

For the permanent 6-month version, success means:

- 24-week framing
- real learning progression from zero to advanced
- SQL, Python, and PySpark all feel first-class
- strong task verification where technically possible
- local-first free experience remains smooth
- deployment is stable enough for long-term public use
