# 6-Month Permanent Deployment Handoff

Use this document when handing the project to another LLM or engineer.

Companion documents:

- `docs/final-product-constraints.md`
- `docs/implementation-audit.md`

If this handoff conflicts with the mandatory constraints document, the mandatory constraints document wins.

## Project Summary

This is a local-first Next.js 16 + TypeScript platform for learning **SQL, Python, and PySpark** with a **data-engineering** focus.

Stack:

- Next.js 16
- React
- TypeScript
- Dexie / IndexedDB
- Monaco Editor
- `sql.js`

Important current files:

- `src/lib/db.ts`
- `src/lib/academy.ts`
- `src/lib/curriculum.ts`
- `src/lib/sql-weeks.ts`
- `src/lib/sql-week-one.ts`
- `src/lib/sql-week-two.ts`
- `src/lib/sql-week-three.ts`
- `src/lib/sql-week-four.ts`
- `src/lib/candy-arcade.ts`
- `src/components/sql/sql-week-workspace.tsx`
- `src/components/game/candy-arcade-view.tsx`
- `src/components/dashboard/dashboard-view.tsx`

## What the Product Should Be

The target is a **6-month deployable legend platform**:

- 24-week roadmap
- zero-to-advanced data-engineering path
- permanent deployment
- simple free local-first experience
- later paid unlocks if desired

The product should feel:

- easy to understand at the start
- practice-first, not reading-heavy
- unlock-based
- game-supported, but not fake-graded
- serious enough for long-term deployment
- honest about what is graded versus what is practice

## Honest Current State

These points must be preserved honestly:

- SQL Weeks 1-4 are the most real working mission implementation
- SQL grading is real through `sql.js`
- SQL Week 5 onward is not yet implemented as the same fully playable mission system
- Python and PySpark do not yet have true mission-lane execution parity with SQL
- Candy Arcade is a strong UI and progression surface, but not yet fully compliant with the mandatory grading constraints
- Large counts like 1000 tasks/questions per track are product-structure counts, not evidence of 1000 fully authored verified items

## 6-Month Product Target

Frame the academy as:

- Month 1: foundations
- Month 2: core querying / Python structures / Spark basics
- Month 3: transformations and real practice
- Month 4: data engineering patterns
- Month 5: debugging, warehousing, performance
- Month 6: capstones, mixed-language work, job-ready practice

## Permanent Deployment Target

Deployment target:

- Vercel for the app
- environment variables only for payment/licensing if introduced
- keep core app browser-local for learner data

Deployment rules:

- no heavy always-on backend unless absolutely necessary
- keep free tier usable with zero signup
- keep UX stable for a public permanent deployment

## Required Product Standards

- Never mark tasks complete because editors are non-empty
- Real grading where possible
- Clear labeling where runtime grading is not yet possible
- Keep SQL, Python, and PySpark separate enough to learn well
- Keep the UI simple and consistent
- Follow the revised mandatory development order from the constraints document

## Immediate Priorities

1. Extend SQL mission lane beyond Week 4 to the full planned depth.
2. Build real Python execution and grading.
3. Build honest PySpark structure/runtime workflow.
4. Strengthen Candy Arcade grading.
5. Expand materials from prototype wording into a true 6-month public product.
6. Prepare landing, pricing, gating, and deployment surface for permanent hosting.

## Suggested Instruction Prompt

```text
You are continuing a local-first Next.js 16 + TypeScript learning platform for SQL, Python, and PySpark focused on data engineering.

Current strong implementation:
- SQL Weeks 1-4 with real grading via sql.js
- Dashboard, track pages, local IndexedDB persistence
- Candy Arcade UI with level progression

Current truth:
- This is not yet a full 6-month fully interactive academy
- Python and PySpark are behind SQL in real execution depth
- Large task/question counts are structural, not proof of authored depth

Target:
- turn it into a permanent-deployment 6-month data-engineering platform
- 24-week zero-to-advanced progression
- local-first free tier
- stable Vercel deployment
- strong honesty around grading and unlocks

Do not fake task completion. Prefer real execution and verification.
Preserve the current SQL mission lane as the reference bar for quality.
```
