# Mandatory Missing Requirements and Final Product Constraints

This file is the repository-local source of truth for mandatory product constraints.

If any earlier architecture note, roadmap note, UI copy, or planning document conflicts with this file, follow this file.

## 1. Final Product Shape

The final academy is:

- a 6-month platform
- a 24-week roadmap
- SQL, Python, and PySpark
- data-engineering focused
- local-first
- permanently deployable

Backward-compatible 16-week files may temporarily remain, but the public product model must support a real 24-week academy.

Do not relabel 16 weeks as 24 weeks without adding genuine weekly content.

## 2. Verification Principle

Every graded task must require learner-written code and platform verification.

Invalid completion rules:

- non-empty editor
- clicked complete
- keyword presence
- viewed lesson
- time spent
- all tabs contain text

Allowed verification labels:

- `Runtime Verified`
- `Result Verified`
- `Test-Case Verified`
- `Structure Checked — Not Runtime Verified`
- `Manual Review Required`
- `Explanation Only — Not Graded`

Only the first three count as fully runtime-verified mastery.

## 3. Generator Foundation

Before large banks exist, the project must support deterministic generator-and-solver contracts.

Implementation target:

- `src/lib/question-generator.ts`

Requirements:

- one generator-and-solver pair per exercise template
- deterministic seed replay
- generator versioning
- engine-derived expected output
- auditable metadata

Expected results must come from real engines:

- `sql.js`
- Pyodide
- approved PySpark validator/runtime adapter

## 4. Variation Quality

Meaningful question variation should come from:

- null placement
- duplicates
- boundaries
- date ranges
- skew
- grouping structure
- join cardinality
- missing relationships
- sorting requirements
- tie conditions
- exception cases
- schema shape
- business rules
- performance constraints

Do not pad banks with cosmetic rewrites just to hit a marketing count.

## 5. Practice Banks

Practice banks are separate from core mission completion.

Rules:

- practice progress must not auto-complete the mission
- mission completion must not auto-complete the practice bank
- practice attempts are stored independently
- capacity target is up to 3,000 verified questions per suitable task

This is a capacity target, not a padded requirement.

## 6. Lazy Generation

Do not eagerly materialize millions of generated questions into IndexedDB.

Use:

- on-demand generation
- cached recent items
- paginated generation
- seed manifests
- regenerable caches

Persist:

- generator version
- seed
- attempt
- result
- completion state
- relevant fixture metadata

## 7. Tri-Language Arcade Bank

The eventual arcade bank must be separate from:

- mission tasks
- per-task practice banks
- the current Candy Arcade shell

Each question must represent one logical problem solved in:

- SQL
- Python
- PySpark

Completion must be tracked by:

- `questionId + language`

Passing SQL must not pass Python or PySpark.

## 8. Candy Arcade Constraint

The old behavior:

- editors contain text
- therefore complete

is forbidden.

Arcade must use real graders or honest visible partial states.

If a language is not yet gradeable:

- disable graded submission
- or label it `Practice — Not Graded`

Never silently award completion.

## 9. Attempt Audit Trail

All submissions must be auditable.

Minimum information:

- task identifier
- language
- submitted code
- pass/fail
- grading mode
- output
- expected output
- error details
- execution time
- timestamp
- generator metadata where relevant

## 10. Python Runtime

Required direction:

- Pyodide
- Web Worker
- hard timeout via worker termination and recreation
- stdout/stderr capture
- syntax/runtime error capture
- test-case support

Do not pretend `Promise.race()` kills infinite loops.

## 11. PySpark Honesty

Two explicit modes are required:

- `Structure Checked — Not Runtime Verified`
- `Runtime Verified`

Do not present structure-only validation as runtime execution.

## 12. Notes

The `/notes` route must eventually support persistent independent tabs:

- SQL
- Python
- PySpark
- General

Each tab must preserve content independently and restore after refresh.

## 13. Free vs Full Access

Free tier should include:

- Dashboard
- SQL Weeks 1–4
- real SQL grading
- Notes
- local progress
- local backups

Full access may include:

- SQL Weeks 5–24
- Python Weeks 1–24
- PySpark Weeks 1–24
- projects
- capstones
- interview mode
- advanced revision
- practice banks
- tri-language arcade bank

## 14. Landing, Pricing, Licensing

Public product requirements:

- honest landing page
- clear free vs full comparison
- no fake scarcity
- no misleading counts

Pricing model:

- `Free`
- `Full Access`

Stripe requirements:

- hosted Stripe Checkout
- minimal serverless routes
- signed license token
- centralized access policy

## 15. Deployment Target

Deploy target:

- Vercel

Core app constraints:

- local-first
- IndexedDB learner data
- no always-on learner database
- no required account

## 16. Required Development Order

1. repository audit
2. stabilize existing product
3. shared grading and attempt model
4. Python runtime
5. honest PySpark validation
6. Candy Arcade repair
7. generator foundation
8. SQL Weeks 5–8
9. Python initial mission batch
10. PySpark initial mission batch
11. practice banks
12. tri-language arcade bank
13. continue 24-week curriculum
14. notes/mastery/revision/projects
15. landing/pricing/licensing
16. permanent deployment hardening

## 17. Final Honesty Rule

Do not claim:

- full 24-week completion
- full tri-language grading
- 3,000 verified banks
- production-ready paid gating

until implementation and tests actually exist.
