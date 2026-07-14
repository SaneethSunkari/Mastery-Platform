import {
  CourseSeed,
  CourseSlug,
  DatasetSeed,
  ExerciseSeed,
  LessonRecord,
  ProjectSeed,
  TopicMasteryRecord,
  WeekSeed,
} from "@/lib/types";

const isoNow = "2026-07-10T08:30:00.000Z";

const makeId = (...parts: string[]) =>
  parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const buildRecord = <T extends Record<string, unknown>>(id: string, record: T) => ({
  id,
  createdAt: isoNow,
  updatedAt: isoNow,
  ...record,
});

export const courses: CourseSeed[] = [
  buildRecord("course-sql", {
    slug: "sql" as const,
    name: "SQL Mastery",
    tagline: "Query design, analytics, performance, and production SQL.",
    description:
      "A ruthless 16-week path from relational fundamentals to production debugging, data modeling, and interview-grade SQL.",
    accent: "amber",
    durationWeeks: 16,
    estimatedMinutesPerDay: 90,
  }),
  buildRecord("course-python", {
    slug: "python" as const,
    name: "Python Mastery",
    tagline: "Production Python for automation, data engineering, and interviews.",
    description:
      "A 16-week climb from Python fundamentals to ETL systems, testing, performance, and production-quality engineering habits.",
    accent: "teal",
    durationWeeks: 16,
    estimatedMinutesPerDay: 90,
  }),
  buildRecord("course-pyspark", {
    slug: "pyspark" as const,
    name: "PySpark Mastery",
    tagline: "Distributed data engineering with Spark, DataFrames, and pipeline performance.",
    description:
      "A scale-focused path through Spark fundamentals, PySpark transformations, batch jobs, tuning, and production pipeline debugging.",
    accent: "sky",
    durationWeeks: 16,
    estimatedMinutesPerDay: 75,
  }),
];

type WeekInput = Omit<
  WeekSeed,
  "id" | "createdAt" | "updatedAt" | "courseSlug"
>;

const sqlWeeksInput: WeekInput[] = [
  {
    monthNumber: 1,
    weekNumber: 1,
    levelNumber: 1,
    title: "Relational Foundations and Query Flow",
    theme: "Think in sets before syntax.",
    objectives: [
      "Understand tables, rows, columns, keys, and grain.",
      "Explain the logical order of SQL query processing.",
      "Write clean single-table queries with deterministic output.",
    ],
    topics: ["Relational model", "SELECT", "FROM", "WHERE", "DISTINCT", "Aliases"],
    guidedLessons: [
      {
        title: "How SQL Thinks",
        summary: "Set-based thinking, grain, and result-set mental models.",
        estimatedMinutes: 35,
        tags: ["foundations", "mental-model"],
      },
      {
        title: "Single-Table Query Discipline",
        summary: "Project only what you need, filter intentionally, and avoid nondeterministic result sets.",
        estimatedMinutes: 40,
        tags: ["select", "where", "order-by"],
      },
      {
        title: "Schema Reading for Analysts",
        summary: "Reverse-engineer entity relationships before writing your first query.",
        estimatedMinutes: 30,
        tags: ["schema", "keys", "grain"],
      },
    ],
    practice: [
      "Filter active customers and recent orders from realistic e-commerce tables.",
      "Predict result shapes before running 10 short queries.",
      "Rewrite vague business questions into explicit output grain statements.",
    ],
    debugging: "A query meant to show latest orders uses LIMIT without ORDER BY. Diagnose why the result is unsafe.",
    businessCase:
      "Support needs the most recent paid orders for manual review without scanning irrelevant columns.",
    interviewPrompts: [
      "What is the logical order of a SQL query?",
      "Why is SELECT * dangerous in production reporting?",
    ],
    assessment:
      "Write three single-table queries and explain output grain, null behavior, and ordering choices.",
    project: "Map the grain and key structure of an e-commerce schema before any joins are written.",
    revision: [
      "Review logical query order from memory.",
      "Re-solve a single-table filter problem without looking at notes.",
    ],
    masteryCheckpoint: "You can state input grain, output grain, filters, and sort logic before touching the keyboard.",
  },
  {
    monthNumber: 1,
    weekNumber: 2,
    levelNumber: 2,
    title: "Filtering, Boolean Logic, and NULL",
    theme: "Most silent bugs start in predicate logic.",
    objectives: [
      "Use WHERE clauses with precise boolean reasoning.",
      "Handle NULL safely in filters and comparisons.",
      "Apply BETWEEN, IN, LIKE, and negation without accidental exclusions.",
    ],
    topics: ["AND/OR precedence", "NULL", "IS NULL", "BETWEEN", "IN", "LIKE"],
    guidedLessons: [
      {
        title: "Boolean Logic Without Surprises",
        summary: "Write predicates that behave exactly as intended under real business conditions.",
        estimatedMinutes: 35,
        tags: ["logic", "filtering"],
      },
      {
        title: "NULL Is Not a Value",
        summary: "Understand three-valued logic and why null rows disappear.",
        estimatedMinutes: 35,
        tags: ["null", "edge-cases"],
      },
      {
        title: "Precision Filtering",
        summary: "Use pattern matching, set membership, and bounded ranges correctly.",
        estimatedMinutes: 30,
        tags: ["in", "between", "like"],
      },
    ],
    practice: [
      "Classify edge-case filter outcomes with and without NULL values.",
      "Repair five broken WHERE clauses that mis-handle OR logic.",
      "Write audit filters for risky orders and incomplete profiles.",
    ],
    debugging: "A left join loses rows after a status filter. Identify how NULL and WHERE placement caused the regression.",
    businessCase: "Marketing needs non-organic users from the US and Canada without including inactive records.",
    interviewPrompts: [
      "Why does NULL = NULL return unknown?",
      "How would you safely exclude test payments while preserving null payment methods?",
    ],
    assessment:
      "Solve eight predicate exercises and explain exactly why edge rows are included or excluded.",
    project: "Build a risk-segmentation query using multiple business rules and explicit NULL handling.",
    revision: [
      "Revisit three-valued logic truth tables.",
      "Redo the toughest predicate bug from the week.",
    ],
    masteryCheckpoint: "You stop treating NULL like a normal scalar value and stop shipping ambiguous filters.",
  },
  {
    monthNumber: 1,
    weekNumber: 3,
    levelNumber: 3,
    title: "Expressions and Scalar Functions",
    theme: "Transform raw columns into business-ready dimensions.",
    objectives: [
      "Use CASE, COALESCE, NULLIF, and type conversion safely.",
      "Normalize text, numeric, and date values for reporting.",
      "Write derived fields that remain readable and testable.",
    ],
    topics: ["CASE", "COALESCE", "NULLIF", "casts", "date functions", "string functions"],
    guidedLessons: [
      {
        title: "CASE for Business Rules",
        summary: "Turn messy operational states into explicit categories without hiding logic.",
        estimatedMinutes: 40,
        tags: ["case", "classification"],
      },
      {
        title: "Safe Null and Type Handling",
        summary: "Use COALESCE and casts without masking data quality issues.",
        estimatedMinutes: 30,
        tags: ["coalesce", "casting"],
      },
      {
        title: "Dates, Strings, and Numeric Cleanup",
        summary: "Build reporting-friendly columns while preserving semantic meaning.",
        estimatedMinutes: 35,
        tags: ["dates", "strings", "numbers"],
      },
    ],
    practice: [
      "Bucket customers by spend and recency.",
      "Normalize acquisition channels with controlled CASE logic.",
      "Repair a report that breaks because of bad implicit casts.",
    ],
    debugging: "A cast in the WHERE clause makes an indexed date filter painfully slow. Explain the fix.",
    businessCase: "Finance needs a reusable revenue tier, payment health flag, and billing month dimension.",
    interviewPrompts: [
      "When would you use NULLIF instead of CASE?",
      "How do you keep derived columns readable when business rules multiply?",
    ],
    assessment:
      "Create a derived customer profile view with null-safe labels, standardized dates, and type-safe revenue flags.",
    project: "Prepare a clean order fact extract with 10 production-quality derived columns.",
    revision: [
      "Rebuild your CASE buckets from memory.",
      "Review every cast and ask whether it belongs in the predicate or projection.",
    ],
    masteryCheckpoint: "You can build clean derived fields without turning the query into unreadable spaghetti.",
  },
  {
    monthNumber: 1,
    weekNumber: 4,
    levelNumber: 4,
    title: "Aggregations and Metric Correctness",
    theme: "Never lie with GROUP BY.",
    objectives: [
      "Use GROUP BY and HAVING correctly.",
      "Distinguish COUNT(*) from COUNT(column) and COUNT(DISTINCT ...).",
      "Protect metrics from duplicate rows and wrong grain.",
    ],
    topics: ["COUNT", "SUM", "AVG", "GROUP BY", "HAVING", "conditional aggregation"],
    guidedLessons: [
      {
        title: "Aggregation Grain",
        summary: "Know exactly what one row means before aggregating it.",
        estimatedMinutes: 35,
        tags: ["group-by", "grain"],
      },
      {
        title: "Reliable Business Metrics",
        summary: "Write counts, sums, and rates that survive real data issues.",
        estimatedMinutes: 40,
        tags: ["metrics", "count-distinct"],
      },
      {
        title: "Conditional Aggregation",
        summary: "Build multiple KPIs in one pass without breaking readability.",
        estimatedMinutes: 30,
        tags: ["case", "aggregation"],
      },
    ],
    practice: [
      "Calculate daily revenue and cancellation rate by payment method.",
      "Spot inflated metrics caused by duplicate order items.",
      "Create segment-level customer metrics with HAVING filters.",
    ],
    debugging: "A dashboard shows revenue 2x higher after a join. Trace the grain mismatch.",
    businessCase: "Growth needs acquisition-channel KPIs at a weekly level with explicit active-customer definitions.",
    interviewPrompts: [
      "What is the difference between WHERE and HAVING?",
      "When do you need COUNT DISTINCT and what are its tradeoffs?",
    ],
    assessment:
      "Build a weekly KPI table with orders, revenue, payers, AOV, and refund rate from raw transactional tables.",
    project: "Publish a finance-ready metrics query with documented grain and validation checks.",
    revision: [
      "Re-derive COUNT variants from sample null-heavy data.",
      "Review every grouped metric and write its denominator in plain English.",
    ],
    masteryCheckpoint: "You can defend every aggregated number and explain why it is not double counted.",
  },
  {
    monthNumber: 2,
    weekNumber: 5,
    levelNumber: 5,
    title: "Join Fundamentals and Cardinality",
    theme: "Most wrong answers come from wrong joins.",
    objectives: [
      "Master inner, left, right, full, cross, and self joins.",
      "Predict cardinality before executing joins.",
      "Preserve left join semantics under filtering.",
    ],
    topics: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN", "self join"],
    guidedLessons: [
      {
        title: "Join Mental Models",
        summary: "Reason about key coverage and multiplicity before you join.",
        estimatedMinutes: 35,
        tags: ["joins", "cardinality"],
      },
      {
        title: "Protecting Left Join Semantics",
        summary: "Place predicates deliberately and avoid accidental inner joins.",
        estimatedMinutes: 35,
        tags: ["left-join", "filter-placement"],
      },
      {
        title: "Detecting Duplicate Explosions",
        summary: "Use counts, uniqueness checks, and pre-aggregation to control one-to-many relationships.",
        estimatedMinutes: 35,
        tags: ["duplicates", "pre-aggregation"],
      },
    ],
    practice: [
      "Join customers, orders, and payments while preserving unpaid orders.",
      "Write anti-join logic to find products with no reviews.",
      "Debug a self-join for employee-manager relationships.",
    ],
    debugging: "A left join query returns fewer rows than the base customer table. Explain the regression and repair it.",
    businessCase: "Build a customer 360 view that combines profile, order, refund, shipment, and review data.",
    interviewPrompts: [
      "How do you find rows in A with no match in B?",
      "What is the first thing you check when a join doubles your row count?",
    ],
    assessment:
      "Join a realistic e-commerce model and produce one clean customer summary row per customer.",
    project: "Create an order fulfillment quality report spanning orders, shipments, returns, and reviews.",
    revision: [
      "List the grain of every table before each join problem.",
      "Run a row-count sanity check after every new join.",
    ],
    masteryCheckpoint: "You can predict join row counts before running the query and detect when the result violates that prediction.",
  },
  {
    monthNumber: 2,
    weekNumber: 6,
    levelNumber: 6,
    title: "Advanced Joins and Set Operations",
    theme: "Express overlap, exclusion, and comparison cleanly.",
    objectives: [
      "Use self joins, multi-table joins, and set operators correctly.",
      "Choose between UNION and UNION ALL intentionally.",
      "Solve overlap and exclusion problems without awkward query shape.",
    ],
    topics: ["multi-table joins", "UNION", "UNION ALL", "INTERSECT", "EXCEPT", "anti-joins"],
    guidedLessons: [
      {
        title: "Overlap and Exclusion Logic",
        summary: "Represent audience inclusion and exclusion with the cleanest operator for the job.",
        estimatedMinutes: 30,
        tags: ["set-ops", "audiences"],
      },
      {
        title: "Multi-Hop Joins",
        summary: "Traverse three or more tables without losing track of business grain.",
        estimatedMinutes: 40,
        tags: ["multi-table", "relationships"],
      },
      {
        title: "Deduping Across Combined Result Sets",
        summary: "Know when you want duplicate preservation and when you do not.",
        estimatedMinutes: 30,
        tags: ["union", "duplicates"],
      },
    ],
    practice: [
      "Compare active and churned cohorts across subscription snapshots.",
      "Find users present in one marketing audience but absent from another.",
      "Build a department transfer view with self joins and history tables.",
    ],
    debugging: "A UNION removes records that looked unique to the analyst. Identify why duplicate collapsing happened.",
    businessCase: "Growth wants a combined audience of recent buyers and engaged reviewers without double-counting.",
    interviewPrompts: [
      "When is UNION ALL safer than UNION?",
      "How would you compare two populations efficiently?",
    ],
    assessment:
      "Create a marketable audience list using set logic, exclusions, and explicit deduplication rules.",
    project: "Build a cross-channel engagement cohort comparison report.",
    revision: [
      "Practice translating English inclusion/exclusion logic into SQL set operations.",
      "Re-check every combined result for duplicate policy.",
    ],
    masteryCheckpoint: "You can represent overlap, difference, and combined populations without accidental deduplication.",
  },
  {
    monthNumber: 2,
    weekNumber: 7,
    levelNumber: 7,
    title: "Subqueries and CTE Composition",
    theme: "Compose logic without losing clarity.",
    objectives: [
      "Use scalar, tabular, and correlated subqueries well.",
      "Choose EXISTS or joins for existence logic.",
      "Break large queries into readable CTE stages.",
    ],
    topics: ["subqueries", "EXISTS", "NOT EXISTS", "CTEs", "correlated subqueries"],
    guidedLessons: [
      {
        title: "EXISTS Over Memorization",
        summary: "Use existence checks because they express intent, not because they are trendy.",
        estimatedMinutes: 30,
        tags: ["exists", "subqueries"],
      },
      {
        title: "CTEs as Query Architecture",
        summary: "Structure work in named layers that mirror your thinking.",
        estimatedMinutes: 40,
        tags: ["cte", "readability"],
      },
      {
        title: "Correlated Logic Without Fear",
        summary: "Understand what a correlated subquery is doing and when to rewrite it.",
        estimatedMinutes: 35,
        tags: ["correlated", "performance"],
      },
    ],
    practice: [
      "Find customers whose latest order exceeds their historical average.",
      "Use NOT EXISTS to surface missing operational records.",
      "Refactor a monolithic query into stage-based CTEs.",
    ],
    debugging: "A correlated subquery runs too slowly on a large table. Diagnose whether a join or window rewrite is cleaner.",
    businessCase: "Risk operations needs merchants with repeated chargeback patterns across rolling periods.",
    interviewPrompts: [
      "Difference between EXISTS and IN?",
      "When should a CTE be replaced with a derived table or subquery?",
    ],
    assessment:
      "Solve latest-record, exclusion, and comparative-metric problems using both subqueries and staged CTEs.",
    project: "Build an eligibility engine query with clear stage-by-stage CTE documentation.",
    revision: [
      "Translate an English rule into an EXISTS-based solution.",
      "Review where your CTE names improved or obscured logic.",
    ],
    masteryCheckpoint: "You can choose the right composition tool instead of overusing either joins or nested subqueries.",
  },
  {
    monthNumber: 2,
    weekNumber: 8,
    levelNumber: 8,
    title: "Window Functions I",
    theme: "Keep row detail while adding analytical power.",
    objectives: [
      "Use OVER, PARTITION BY, and ORDER BY correctly.",
      "Apply ROW_NUMBER, RANK, DENSE_RANK, LAG, and LEAD.",
      "Separate grouped output from windowed output mentally.",
    ],
    topics: ["OVER", "PARTITION BY", "ROW_NUMBER", "RANK", "LAG", "LEAD"],
    guidedLessons: [
      {
        title: "Window vs Group By",
        summary: "Understand why window functions preserve row detail.",
        estimatedMinutes: 35,
        tags: ["windows", "mental-model"],
      },
      {
        title: "Ranking and Top-N Logic",
        summary: "Handle ties and top-per-group problems cleanly.",
        estimatedMinutes: 35,
        tags: ["ranking", "top-n"],
      },
      {
        title: "Row-to-Row Comparisons",
        summary: "Use lag and lead for change detection, retention, and sequential analysis.",
        estimatedMinutes: 35,
        tags: ["lag", "lead", "sequence"],
      },
    ],
    practice: [
      "Rank products by category revenue.",
      "Compute user event gaps and identify return behavior.",
      "Find the latest order per customer without collapsing rows too early.",
    ],
    debugging: "A row_number solution returns random winners because the ordering is incomplete. Repair it.",
    businessCase: "Streaming analytics needs the first watch, latest watch, and watch-gap metrics per user.",
    interviewPrompts: [
      "How do ROW_NUMBER, RANK, and DENSE_RANK differ?",
      "How would you solve latest row per group with windows?",
    ],
    assessment:
      "Solve ranking, latest-per-group, and lag/lead exercises with clear partition and ordering choices.",
    project: "Create a user activity sequencing report using window functions.",
    revision: [
      "Explain partitioning and ordering in plain language for every window query you write.",
      "Redo one ranking problem with each ranking function.",
    ],
    masteryCheckpoint: "You can choose a window function because you understand the row-level output you need.",
  },
  {
    monthNumber: 3,
    weekNumber: 9,
    levelNumber: 9,
    title: "Window Functions II and Framing",
    theme: "Move from rankings to advanced analytical windows.",
    objectives: [
      "Use frames intentionally for running totals and moving windows.",
      "Compute percentiles and advanced ordered metrics.",
      "Solve top-N-per-group with tie-aware business rules.",
    ],
    topics: ["frames", "running totals", "moving averages", "NTILE", "percentiles", "median"],
    guidedLessons: [
      {
        title: "Window Frames That Match Business Meaning",
        summary: "Control cumulative and rolling calculations instead of hoping defaults work.",
        estimatedMinutes: 35,
        tags: ["frames", "running-totals"],
      },
      {
        title: "Distribution Metrics",
        summary: "Use ntile and percentile logic to segment behavior and benchmark performance.",
        estimatedMinutes: 35,
        tags: ["percentiles", "segmentation"],
      },
      {
        title: "Tie-Aware Ranking Decisions",
        summary: "Encode business rules when ties change downstream decisions.",
        estimatedMinutes: 30,
        tags: ["ties", "ranking"],
      },
    ],
    practice: [
      "Compute rolling 7-day revenue.",
      "Build percentile-based customer spend bands.",
      "Return the top 3 creators per genre with explicit tie handling.",
    ],
    debugging: "A moving average looks wrong because the default frame includes peer rows. Fix the frame.",
    businessCase: "Finance wants rolling revenue and percentile-based merchant risk cohorts.",
    interviewPrompts: [
      "What frame does your engine use by default?",
      "How do you compute a running total that resets per partition?",
    ],
    assessment:
      "Produce cumulative, rolling, ranking, and percentile metrics over the same base event table.",
    project: "Design a subscription-health trend report powered by window frames.",
    revision: [
      "List the frame boundaries for each rolling metric you create.",
      "Review when ordered-set functions differ from simple window ranks.",
    ],
    masteryCheckpoint: "You can explain every row included in a window frame and why it belongs there.",
  },
  {
    monthNumber: 3,
    weekNumber: 10,
    levelNumber: 10,
    title: "Advanced Analytical Patterns",
    theme: "Solve the patterns that show up in real analytics interviews.",
    objectives: [
      "Handle gaps and islands, deduplication, sessionization, and top-N per group.",
      "Solve retention, funnel, and cohort questions from first principles.",
      "Separate event grain from user grain in analytical problems.",
    ],
    topics: ["gaps and islands", "deduplication", "sessionization", "retention", "cohorts", "funnels"],
    guidedLessons: [
      {
        title: "Deduplication Without Guessing",
        summary: "Define the winning record and encode it explicitly.",
        estimatedMinutes: 35,
        tags: ["dedup", "row_number"],
      },
      {
        title: "User Journeys and Funnels",
        summary: "Translate event streams into stage conversion logic.",
        estimatedMinutes: 40,
        tags: ["funnels", "events"],
      },
      {
        title: "Cohorts, Retention, and Streaks",
        summary: "Model time-based customer behavior without mixing grains.",
        estimatedMinutes: 35,
        tags: ["cohorts", "retention", "gaps-islands"],
      },
    ],
    practice: [
      "Deduplicate subscriptions by latest valid snapshot.",
      "Compute day-7 and day-30 retention.",
      "Build a signup-to-purchase funnel with drop-off counts.",
    ],
    debugging: "A retention query counts events instead of users. Repair the grain and denominator.",
    businessCase: "Product analytics needs sessionized events, cohort curves, and funnel loss reasons.",
    interviewPrompts: [
      "How do you detect consecutive-day activity streaks?",
      "What is the difference between retention and resurrection?",
    ],
    assessment:
      "Solve a bundle of cohort, funnel, and streak problems on realistic event data.",
    project: "Create a growth analytics mart for retention and conversion reporting.",
    revision: [
      "Write the user-level denominator before solving retention.",
      "Review your chosen dedup ordering logic and business tie-breakers.",
    ],
    masteryCheckpoint: "You can solve analytical patterns from grain and timeline reasoning rather than memorized snippets.",
  },
  {
    monthNumber: 3,
    weekNumber: 11,
    levelNumber: 11,
    title: "Temporal SQL and Date-Range Logic",
    theme: "Time logic is where solid engineers pull away.",
    objectives: [
      "Handle point-in-time joins and valid-time ranges.",
      "Manage session windows and time zone awareness.",
      "Write precise date filters that remain index-friendly.",
    ],
    topics: ["date ranges", "point-in-time joins", "effective dating", "session windows", "time zones"],
    guidedLessons: [
      {
        title: "As-Of Joins",
        summary: "Join facts to the version of a dimension that was true at that moment.",
        estimatedMinutes: 35,
        tags: ["temporal", "as-of"],
      },
      {
        title: "Safe Date Filters",
        summary: "Use explicit half-open intervals instead of brittle casts and truncation hacks.",
        estimatedMinutes: 30,
        tags: ["dates", "performance"],
      },
      {
        title: "Time Zones and Sessions",
        summary: "Reason about user-local time, UTC storage, and inactivity-based sessions.",
        estimatedMinutes: 35,
        tags: ["time-zones", "sessionization"],
      },
    ],
    practice: [
      "Match orders to the plan in effect at order time.",
      "Create user sessions from event gaps.",
      "Rewrite non-sargable date predicates into range predicates.",
    ],
    debugging: "A day-level dashboard shifts numbers after daylight-saving changes. Find the hidden assumption.",
    businessCase: "Billing needs plan-at-purchase logic and timezone-correct local reporting.",
    interviewPrompts: [
      "How do you join to the latest valid row as of an event timestamp?",
      "Why is DATE(timestamp_column) in a WHERE clause risky?",
    ],
    assessment:
      "Solve temporal join and sessionization problems with precise interval logic.",
    project: "Build a point-in-time entitlement audit for subscriptions and invoices.",
    revision: [
      "Explain half-open intervals from memory.",
      "Review one time-zone bug and write the root cause plainly.",
    ],
    masteryCheckpoint: "You stop writing fuzzy time logic and start defining exact temporal boundaries.",
  },
  {
    monthNumber: 3,
    weekNumber: 12,
    levelNumber: 12,
    title: "Data Engineering SQL",
    theme: "Use SQL to validate and move data, not just analyze it.",
    objectives: [
      "Write SQL for ETL checks, reconciliation, and data quality validation.",
      "Implement incremental patterns and duplicate detection.",
      "Handle SCD-style dimension logic and warehouse-ready transformations.",
    ],
    topics: ["ETL SQL", "incremental loads", "reconciliation", "data quality", "SCDs"],
    guidedLessons: [
      {
        title: "Validation Queries That Catch Real Failures",
        summary: "Use row counts, hash checks, and key checks to protect pipelines.",
        estimatedMinutes: 35,
        tags: ["validation", "quality"],
      },
      {
        title: "Incremental Thinking",
        summary: "Load only what changed while preserving correctness and replayability.",
        estimatedMinutes: 35,
        tags: ["incremental", "etl"],
      },
      {
        title: "Slowly Changing Dimensions",
        summary: "Track changing attributes without corrupting historical analysis.",
        estimatedMinutes: 35,
        tags: ["scd", "dimensions"],
      },
    ],
    practice: [
      "Write source-to-target reconciliation checks.",
      "Detect duplicate natural keys in a staging table.",
      "Create an SCD Type 2 dimension load strategy.",
    ],
    debugging: "A backfill silently duplicated invoices. Design the SQL checks that would have caught it.",
    businessCase: "A data team needs reliable incremental customer and subscription models.",
    interviewPrompts: [
      "How do you validate a load beyond row count matching?",
      "When is a delete+insert safer than merge-style logic?",
    ],
    assessment:
      "Design a batch of SQL checks and transformations for a subscription ETL pipeline.",
    project: "Build a warehouse-ready customer subscription model with quality checks.",
    revision: [
      "Revisit the minimum validation suite for every production load.",
      "Review late-arriving data handling tradeoffs.",
    ],
    masteryCheckpoint: "You can think like a data engineer, not just a dashboard writer.",
  },
  {
    monthNumber: 4,
    weekNumber: 13,
    levelNumber: 13,
    title: "Dimensional Modeling and Warehouse Design",
    theme: "Bad models create fake query complexity.",
    objectives: [
      "Design fact and dimension tables with explicit grain.",
      "Choose between star and snowflake patterns deliberately.",
      "Support analytical use cases with durable schemas.",
    ],
    topics: ["fact tables", "dimension tables", "star schema", "snowflake schema", "surrogate keys"],
    guidedLessons: [
      {
        title: "Fact Table Grain",
        summary: "Define the atomic event or snapshot before choosing columns.",
        estimatedMinutes: 35,
        tags: ["facts", "grain"],
      },
      {
        title: "Dimensions That Age Well",
        summary: "Model descriptive context so queries stay simple and history stays trustworthy.",
        estimatedMinutes: 35,
        tags: ["dimensions", "history"],
      },
      {
        title: "Schema Tradeoffs",
        summary: "Know when normalization helps and when it just burdens analytics.",
        estimatedMinutes: 30,
        tags: ["schema", "design"],
      },
    ],
    practice: [
      "Choose the grain for order, subscription, and event facts.",
      "Model a customer dimension with changing lifecycle attributes.",
      "Draw a star schema for SaaS revenue analytics.",
    ],
    debugging: "A revenue mart mixes invoice-line grain with subscription-level attributes. Find the design flaw.",
    businessCase: "Leadership wants a warehouse model for retention, revenue, and support analytics.",
    interviewPrompts: [
      "How do you choose fact grain?",
      "What belongs in a dimension versus a fact?",
    ],
    assessment:
      "Design a small warehouse for a marketplace or SaaS product and defend every grain decision.",
    project: "Produce a star schema for a subscription business with fact, dimensions, and SCD strategy.",
    revision: [
      "State the grain of each proposed table before naming columns.",
      "Review why dimensional mistakes cause downstream query pain.",
    ],
    masteryCheckpoint: "You can reduce analytical complexity by fixing the model instead of overcomplicating the query.",
  },
  {
    monthNumber: 4,
    weekNumber: 14,
    levelNumber: 14,
    title: "Performance and Query Plans",
    theme: "Measure before tuning, and tune the right thing.",
    objectives: [
      "Read execution plans at a practical level.",
      "Use indexes, predicate pushdown, and join strategy awareness.",
      "Make slow queries faster by fixing cardinality and access patterns.",
    ],
    topics: ["query plans", "indexes", "composite indexes", "covering indexes", "join strategies", "statistics"],
    guidedLessons: [
      {
        title: "Plan Reading for Engineers",
        summary: "Spot scans, sorts, spills, and cardinality pain without cargo-culting the optimizer.",
        estimatedMinutes: 40,
        tags: ["plans", "optimizer"],
      },
      {
        title: "Indexes That Earn Their Keep",
        summary: "Index for access patterns and selective predicates, not because slow is scary.",
        estimatedMinutes: 35,
        tags: ["indexes", "sargability"],
      },
      {
        title: "Tuning by Rewrite",
        summary: "Improve performance with pre-aggregation, predicate cleanup, and smarter joins.",
        estimatedMinutes: 35,
        tags: ["rewrites", "performance"],
      },
    ],
    practice: [
      "Rewrite non-sargable date and text filters.",
      "Tune a join-heavy revenue query with row explosion issues.",
      "Compare execution strategies for several filtering patterns.",
    ],
    debugging: "A query slowed from 3 seconds to 90 seconds after adding one join. Diagnose the likely cardinality mistake.",
    businessCase: "BI dashboards need sub-5-second response on high-volume fact tables.",
    interviewPrompts: [
      "Why can adding an index make some workloads worse?",
      "What signs in an execution plan suggest poor cardinality estimates?",
    ],
    assessment:
      "Tune a realistic slow query and justify every performance change with evidence.",
    project: "Take a reporting query from unacceptable latency to production-grade performance.",
    revision: [
      "Review every tuning change with before/after reasoning.",
      "List three ways to reduce work before the expensive join happens.",
    ],
    masteryCheckpoint: "You diagnose slowness with evidence instead of guesswork.",
  },
  {
    monthNumber: 4,
    weekNumber: 15,
    levelNumber: 15,
    title: "Production SQL Practices",
    theme: "Readable, reviewable, safe SQL wins in real teams.",
    objectives: [
      "Use transactions, constraints, views, and quality checks appropriately.",
      "Review SQL for correctness, readability, scalability, and safety.",
      "Debug broken reports and data incidents systematically.",
    ],
    topics: ["transactions", "constraints", "views", "debugging", "readability", "maintainability"],
    guidedLessons: [
      {
        title: "Production Query Hygiene",
        summary: "Write SQL that teammates can review, trust, and modify safely.",
        estimatedMinutes: 35,
        tags: ["readability", "style"],
      },
      {
        title: "Incident Debugging",
        summary: "Trace metric drift, broken joins, and stale dimensions with a repeatable checklist.",
        estimatedMinutes: 40,
        tags: ["debugging", "incidents"],
      },
      {
        title: "Safety and Constraints",
        summary: "Use database guarantees and transaction boundaries to prevent avoidable mistakes.",
        estimatedMinutes: 30,
        tags: ["transactions", "constraints"],
      },
    ],
    practice: [
      "Review and rewrite messy SQL into production-quality form.",
      "Trace the root cause of a revenue discrepancy.",
      "Design data quality checks around critical pipeline outputs.",
    ],
    debugging: "An update script changed too many rows. Design the preflight checks that should have been used.",
    businessCase: "Finance reports a metric mismatch between the warehouse and billing system hours before close.",
    interviewPrompts: [
      "How do you debug a metric discrepancy in production?",
      "What makes SQL maintainable in a team setting?",
    ],
    assessment:
      "Review several flawed production queries and rewrite them with safety, performance, and clarity improvements.",
    project: "Build a production SQL review checklist and apply it to a realistic incident report.",
    revision: [
      "Practice row-count and distinct-key validation on every rewrite.",
      "Review one incident postmortem and identify the missed guardrail.",
    ],
    masteryCheckpoint: "You start thinking like the person on call, not just the analyst writing a one-off query.",
  },
  {
    monthNumber: 4,
    weekNumber: 16,
    levelNumber: 16,
    title: "Interview Readiness and Capstone",
    theme: "Finish by proving both speed and depth.",
    objectives: [
      "Solve easy, medium, and hard interview patterns under time pressure.",
      "Explain tradeoffs, alternative solutions, and optimizations clearly.",
      "Finish with an end-to-end business capstone that proves production skill.",
    ],
    topics: ["timed rounds", "business cases", "optimization", "alternative solutions", "capstone"],
    guidedLessons: [
      {
        title: "Timed SQL Rounds",
        summary: "Practice clean decomposition, assumption-setting, and efficient coding under pressure.",
        estimatedMinutes: 40,
        tags: ["interview", "speed"],
      },
      {
        title: "Query Explanation and Optimization",
        summary: "Defend your logic, edge-case handling, and performance decisions aloud.",
        estimatedMinutes: 35,
        tags: ["communication", "optimization"],
      },
      {
        title: "Capstone Delivery",
        summary: "Turn a business problem into a modeled, validated, performant SQL solution.",
        estimatedMinutes: 45,
        tags: ["capstone", "production"],
      },
    ],
    practice: [
      "Run timed LeetCode-style and business-style SQL problems.",
      "Explain one solution verbally and then optimize it.",
      "Polish a capstone query pack with validation and comments.",
    ],
    debugging: "An interviewer says your query is correct but too slow. Show how you would analyze and improve it.",
    businessCase: "Deliver a final analytics and operations capstone across SQL modeling, querying, and validation.",
    interviewPrompts: [
      "What assumptions would you clarify before solving?",
      "What alternative solution would you mention if time allowed?",
    ],
    assessment:
      "Complete a timed interview round and a production case study with postmortem notes.",
    project: "Capstone: design and analyze a realistic business domain end to end in SQL.",
    revision: [
      "Review every repeated interview mistake from the last month.",
      "Re-run one hard problem from scratch with no notes.",
    ],
    masteryCheckpoint: "You can solve and explain SQL problems at a level expected by strong data and engineering teams.",
  },
];

const pythonWeeksInput: WeekInput[] = [
  {
    monthNumber: 1,
    weekNumber: 1,
    levelNumber: 1,
    title: "Python Foundations and Mental Models",
    theme: "Write small, correct programs before clever ones.",
    objectives: [
      "Understand variables, types, operators, input/output, and conversions.",
      "Build a mental model for names, values, and expression evaluation.",
      "Write tiny programs that are explicit and readable.",
    ],
    topics: ["variables", "types", "operators", "input", "output", "casting"],
    guidedLessons: [
      {
        title: "How Python Evaluates Code",
        summary: "Understand values, expressions, assignment, and why mutability matters later.",
        estimatedMinutes: 35,
        tags: ["foundations", "mental-model"],
      },
      {
        title: "Basic I/O with Discipline",
        summary: "Read input, print output, and convert types without guessing what Python will do.",
        estimatedMinutes: 30,
        tags: ["io", "types"],
      },
      {
        title: "Readable First Programs",
        summary: "Name things clearly and avoid beginner code smells from day one.",
        estimatedMinutes: 30,
        tags: ["style", "foundations"],
      },
    ],
    practice: [
      "Build small scripts for price calculations, status labels, and unit conversions.",
      "Classify expressions by resulting type and value.",
      "Repair beginner bugs caused by wrong string/int handling.",
    ],
    debugging: "A script concatenates numbers as strings and prints the wrong total. Trace the type bug.",
    businessCase: "Operations wants a simple command-line shipping estimator with clear outputs.",
    interviewPrompts: [
      "What is the difference between assignment and mutation?",
      "How does Python decide the result type of an expression?",
    ],
    assessment:
      "Write and explain a set of short scripts using input, output, arithmetic, and explicit conversion.",
    project: "Create a mini business calculator with multiple formatted outputs.",
    revision: [
      "Redo basic type-conversion exercises from memory.",
      "Explain the difference between a value and a variable name.",
    ],
    masteryCheckpoint: "You stop being surprised by simple Python expressions and types.",
  },
  {
    monthNumber: 1,
    weekNumber: 2,
    levelNumber: 2,
    title: "Control Flow and Decision Making",
    theme: "Programs are just controlled paths through state changes.",
    objectives: [
      "Use if/elif/else, for, while, break, continue, and pass correctly.",
      "Design conditions and loops deliberately.",
      "Prevent infinite loops and brittle branching logic.",
    ],
    topics: ["if", "elif", "else", "for", "while", "break", "continue"],
    guidedLessons: [
      {
        title: "Branching with Intent",
        summary: "Write conditions that reflect business rules rather than accidental nesting.",
        estimatedMinutes: 35,
        tags: ["conditions", "logic"],
      },
      {
        title: "Looping Without Losing Control",
        summary: "Iterate safely, track loop invariants, and avoid common off-by-one problems.",
        estimatedMinutes: 35,
        tags: ["loops", "debugging"],
      },
      {
        title: "Readable Flow Control",
        summary: "Choose between early exits, nested branches, and loop control statements wisely.",
        estimatedMinutes: 30,
        tags: ["style", "control-flow"],
      },
    ],
    practice: [
      "Build classification scripts with nested conditions.",
      "Write loops over ranges and sequences with edge-case awareness.",
      "Debug infinite and skipped-loop conditions.",
    ],
    debugging: "A while loop never terminates because the update path is hidden behind an impossible branch.",
    businessCase: "Support triage rules need a script that prioritizes tickets based on severity, age, and customer tier.",
    interviewPrompts: [
      "What makes a loop safe?",
      "How do you simplify deeply nested conditionals?",
    ],
    assessment:
      "Solve loop and condition exercises, then explain the path the program takes for tricky inputs.",
    project: "Build a rules-based command-line triage simulator.",
    revision: [
      "Trace loop state changes on paper.",
      "Review one branching bug you misread the first time.",
    ],
    masteryCheckpoint: "You can trace execution confidently instead of mentally guessing.",
  },
  {
    monthNumber: 1,
    weekNumber: 3,
    levelNumber: 3,
    title: "Core Data Structures",
    theme: "Choose the container that matches the work.",
    objectives: [
      "Use strings, lists, tuples, sets, and dictionaries appropriately.",
      "Understand mutability, lookup patterns, and iteration behavior.",
      "Write comprehensions that stay readable.",
    ],
    topics: ["strings", "lists", "tuples", "sets", "dicts", "comprehensions"],
    guidedLessons: [
      {
        title: "Choosing the Right Structure",
        summary: "Map real problems to the right built-in container instead of defaulting to lists.",
        estimatedMinutes: 35,
        tags: ["data-structures", "selection"],
      },
      {
        title: "Dictionary and Set Thinking",
        summary: "Use hash-based structures for fast lookups and deduplication.",
        estimatedMinutes: 35,
        tags: ["dict", "set"],
      },
      {
        title: "Comprehensions With Taste",
        summary: "Write concise transformations without making code unreadable.",
        estimatedMinutes: 30,
        tags: ["comprehensions", "readability"],
      },
    ],
    practice: [
      "Count frequencies, group values, and deduplicate records.",
      "Transform nested data into clean summaries.",
      "Repair list/dict mutation mistakes.",
    ],
    debugging: "A list of dictionaries is reused across records because of accidental shared mutation. Fix it.",
    businessCase: "Analytics needs a script that groups web events and deduplicates sessions.",
    interviewPrompts: [
      "When is a set better than a list?",
      "What are the tradeoffs of tuples versus lists?",
    ],
    assessment:
      "Solve frequency counting, grouping, and transformation tasks across mixed built-in types.",
    project: "Create a compact event-summarization utility using dictionaries and sets.",
    revision: [
      "Re-solve one grouping problem using a different data structure.",
      "Review mutability mistakes until they feel obvious.",
    ],
    masteryCheckpoint: "You pick structures on purpose and can defend the choice.",
  },
  {
    monthNumber: 1,
    weekNumber: 4,
    levelNumber: 4,
    title: "Functions and Scope",
    theme: "Good functions are the unit of professional Python.",
    objectives: [
      "Define functions with parameters, returns, defaults, and scope awareness.",
      "Use *args, **kwargs, lambdas, and keyword arguments when they help.",
      "Decompose scripts into testable functions.",
    ],
    topics: ["functions", "parameters", "returns", "scope", "defaults", "args/kwargs"],
    guidedLessons: [
      {
        title: "Function Design",
        summary: "Give functions one job, meaningful names, and clear return contracts.",
        estimatedMinutes: 35,
        tags: ["functions", "design"],
      },
      {
        title: "Scope Without Confusion",
        summary: "Understand local, global, and closure behavior without magic thinking.",
        estimatedMinutes: 35,
        tags: ["scope", "debugging"],
      },
      {
        title: "Flexible Signatures",
        summary: "Use defaults and keyword arguments to make APIs pleasant and explicit.",
        estimatedMinutes: 30,
        tags: ["api", "signatures"],
      },
    ],
    practice: [
      "Refactor repetitive logic into small functions.",
      "Repair bugs caused by mutable default arguments.",
      "Write functions that validate and normalize records.",
    ],
    debugging: "A helper accumulates state across calls because of a mutable default list. Diagnose and fix it.",
    businessCase: "A recurring data-cleaning workflow needs reusable, composable helper functions.",
    interviewPrompts: [
      "Why are mutable default arguments dangerous?",
      "How do you decide what a function should return?",
    ],
    assessment:
      "Build a small utility module with clear interfaces, testable outputs, and no global-state surprises.",
    project: "Create a record-cleaning toolkit as a reusable Python module.",
    revision: [
      "Rewrite one bad function into two better ones.",
      "Review every place you accidentally mixed side effects and returns.",
    ],
    masteryCheckpoint: "You start structuring code into functions a teammate would actually want to reuse.",
  },
  {
    monthNumber: 2,
    weekNumber: 5,
    levelNumber: 5,
    title: "Files, CSV, JSON, and Paths",
    theme: "Real work starts when code meets files.",
    objectives: [
      "Read and write text, CSV, and JSON safely.",
      "Use pathlib and explicit encodings.",
      "Build predictable file-processing flows.",
    ],
    topics: ["files", "csv", "json", "pathlib", "encodings", "append/write"],
    guidedLessons: [
      {
        title: "Safe File Handling",
        summary: "Use context managers and predictable paths to avoid fragile scripts.",
        estimatedMinutes: 35,
        tags: ["files", "context"],
      },
      {
        title: "CSV and JSON in Practice",
        summary: "Parse, validate, and transform common business data formats.",
        estimatedMinutes: 35,
        tags: ["csv", "json"],
      },
      {
        title: "Pathlib Over Stringly Paths",
        summary: "Make local automation scripts robust across folders and environments.",
        estimatedMinutes: 30,
        tags: ["pathlib", "automation"],
      },
    ],
    practice: [
      "Clean a CSV and write a summary report.",
      "Extract nested fields from JSON payloads.",
      "Build file-based transformations with explicit path handling.",
    ],
    debugging: "A script works from one folder but breaks from another because paths are hardcoded incorrectly.",
    businessCase: "Operations needs a CSV cleaning utility and a JSON audit summary script.",
    interviewPrompts: [
      "Why use pathlib over manual string concatenation?",
      "How do you avoid loading unnecessary file data into memory?",
    ],
    assessment:
      "Read input files, produce clean output files, and explain your validation and path choices.",
    project: "Build a file-processing tool that ingests CSV and emits cleaned JSON summaries.",
    revision: [
      "Revisit encoding, newline, and path gotchas.",
      "Review one broken file script and explain the root cause.",
    ],
    masteryCheckpoint: "You can write practical file-processing code that does not break the moment paths change.",
  },
  {
    monthNumber: 2,
    weekNumber: 6,
    levelNumber: 6,
    title: "Error Handling, Modules, and Environments",
    theme: "Professional code plans for failure and reuse.",
    objectives: [
      "Use try/except/else/finally and raise meaningful exceptions.",
      "Organize code into modules and packages.",
      "Understand environments, pip, and requirements files.",
    ],
    topics: ["exceptions", "raise", "modules", "packages", "venv", "pip"],
    guidedLessons: [
      {
        title: "Exceptions as Control Signals",
        summary: "Catch what you can handle and let the rest fail clearly.",
        estimatedMinutes: 35,
        tags: ["exceptions", "debugging"],
      },
      {
        title: "Module Boundaries",
        summary: "Split code into reusable files with clear imports and responsibilities.",
        estimatedMinutes: 35,
        tags: ["modules", "packages"],
      },
      {
        title: "Environment Hygiene",
        summary: "Keep dependencies reproducible instead of relying on machine luck.",
        estimatedMinutes: 30,
        tags: ["venv", "pip"],
      },
    ],
    practice: [
      "Wrap file parsing with targeted exception handling.",
      "Refactor a long script into modules.",
      "Simulate dependency and import mistakes and repair them.",
    ],
    debugging: "A broad except hides the real failure and silently produces wrong output. Fix the handling strategy.",
    businessCase: "A data script must fail loudly on corrupt inputs and remain easy to package and rerun.",
    interviewPrompts: [
      "When should you raise versus return an error signal?",
      "Why is catching bare Exception usually a smell?",
    ],
    assessment:
      "Submit a modular script with deliberate exception handling and a reproducible dependency story.",
    project: "Package a small data utility with clean imports and robust failure modes.",
    revision: [
      "Review one swallowed exception and why it was dangerous.",
      "Practice explaining your import structure out loud.",
    ],
    masteryCheckpoint: "You stop writing brittle one-file scripts and start thinking in maintainable modules.",
  },
  {
    monthNumber: 2,
    weekNumber: 7,
    levelNumber: 7,
    title: "Object-Oriented Python I",
    theme: "Model behavior, not just data bags.",
    objectives: [
      "Use classes, objects, methods, constructors, and dataclasses well.",
      "Represent domain concepts with clean state and behavior.",
      "Avoid turning classes into fancy dictionaries.",
    ],
    topics: ["classes", "objects", "__init__", "methods", "attributes", "dataclasses"],
    guidedLessons: [
      {
        title: "When a Class Helps",
        summary: "Use objects when behavior and state truly belong together.",
        estimatedMinutes: 35,
        tags: ["oop", "design"],
      },
      {
        title: "Dataclasses and Plain Models",
        summary: "Keep simple data models concise and explicit.",
        estimatedMinutes: 30,
        tags: ["dataclasses", "models"],
      },
      {
        title: "Method Design",
        summary: "Write instance behavior that keeps invariants inside the object instead of scattered outside.",
        estimatedMinutes: 35,
        tags: ["methods", "encapsulation"],
      },
    ],
    practice: [
      "Model bank accounts, invoices, or inventory items as objects.",
      "Refactor procedural code into class-based design where justified.",
      "Spot unnecessary OOP and simplify it.",
    ],
    debugging: "A class lets callers mutate internals in unsafe ways. Tighten the design.",
    businessCase: "Operations needs an inventory domain model that can validate and update stock changes safely.",
    interviewPrompts: [
      "When should you use a class instead of a collection of functions?",
      "What makes a dataclass appropriate?",
    ],
    assessment:
      "Model a small business domain with clear state, methods, and responsibilities.",
    project: "Build a basic inventory management domain layer.",
    revision: [
      "Review whether each class truly owns behavior or just stores fields.",
      "Rewrite one overengineered class into a simpler design.",
    ],
    masteryCheckpoint: "You use classes because they simplify reasoning, not because OOP feels advanced.",
  },
  {
    monthNumber: 2,
    weekNumber: 8,
    levelNumber: 8,
    title: "Object-Oriented Python II",
    theme: "Prefer good design over inheritance reflexes.",
    objectives: [
      "Use inheritance, composition, polymorphism, and abstract classes thoughtfully.",
      "Recognize when composition is simpler than subclassing.",
      "Build small, extensible designs without framework-style bloat.",
    ],
    topics: ["inheritance", "composition", "polymorphism", "abc", "encapsulation"],
    guidedLessons: [
      {
        title: "Inheritance Tradeoffs",
        summary: "Understand the real maintenance cost of deep class hierarchies.",
        estimatedMinutes: 35,
        tags: ["inheritance", "design"],
      },
      {
        title: "Composition for Flexibility",
        summary: "Combine small objects to keep behavior extensible and testable.",
        estimatedMinutes: 35,
        tags: ["composition", "architecture"],
      },
      {
        title: "Interfaces and Abstractions",
        summary: "Use abstract base classes when multiple implementations truly share a contract.",
        estimatedMinutes: 30,
        tags: ["abstractions", "abc"],
      },
    ],
    practice: [
      "Refactor inheritance-heavy examples into composition.",
      "Design interchangeable storage or notification components.",
      "Review polymorphic code for clarity and testability.",
    ],
    debugging: "A subclass overrides behavior in a way that breaks parent assumptions. Repair the design.",
    businessCase: "A pipeline needs interchangeable loaders, validators, and sinks with clean contracts.",
    interviewPrompts: [
      "Composition vs inheritance?",
      "How do you keep OOP code testable and not overbuilt?",
    ],
    assessment:
      "Design a small extensible system with interfaces, composition, and justified abstraction boundaries.",
    project: "Create a pluggable file-ingestion workflow with interchangeable components.",
    revision: [
      "Review one class hierarchy and decide whether composition would be cleaner.",
      "Write down the behavior contract each abstraction promises.",
    ],
    masteryCheckpoint: "You can design objects that are flexible without becoming abstract for the sake of it.",
  },
  {
    monthNumber: 3,
    weekNumber: 9,
    levelNumber: 9,
    title: "Advanced Python Constructs",
    theme: "Use power tools only when they simplify the code.",
    objectives: [
      "Understand iterators, generators, decorators, context managers, closures, and type hints.",
      "Use advanced constructs to reduce memory or improve reuse.",
      "Avoid writing clever code that nobody can debug.",
    ],
    topics: ["iterators", "generators", "decorators", "context managers", "closures", "type hints"],
    guidedLessons: [
      {
        title: "Lazy Iteration",
        summary: "Use generators for streaming and pipeline-style processing when data is large.",
        estimatedMinutes: 35,
        tags: ["generators", "memory"],
      },
      {
        title: "Decorators and Closures",
        summary: "Understand wrapping behavior and keep decorator logic visible and testable.",
        estimatedMinutes: 35,
        tags: ["decorators", "closures"],
      },
      {
        title: "Context Managers and Hints",
        summary: "Make resource handling safer and APIs clearer.",
        estimatedMinutes: 30,
        tags: ["context", "typing"],
      },
    ],
    practice: [
      "Stream large files line by line.",
      "Write a simple timing decorator and a custom context manager.",
      "Improve signatures with targeted type hints.",
    ],
    debugging: "A generator is accidentally exhausted and later code gets no records. Diagnose the bug.",
    businessCase: "A log-processing workflow must stream huge files without blowing memory.",
    interviewPrompts: [
      "When should you prefer a generator over a list?",
      "What does a decorator really do under the hood?",
    ],
    assessment:
      "Build a small streaming pipeline using generators, a context manager, and readable type hints.",
    project: "Create a lazy log-analysis tool for large files.",
    revision: [
      "Review where lazy evaluation changes program behavior.",
      "Re-explain decorators using plain function wrapping language.",
    ],
    masteryCheckpoint: "You use advanced features because they reduce complexity or memory, not to look clever.",
  },
  {
    monthNumber: 3,
    weekNumber: 10,
    levelNumber: 10,
    title: "Testing, Debugging, and Code Quality",
    theme: "If you cannot test it, you do not really trust it.",
    objectives: [
      "Use assertions, pytest, mocking, logging, and tracebacks effectively.",
      "Write code that is easy to debug and verify.",
      "Adopt code quality habits before projects become large.",
    ],
    topics: ["pytest", "assertions", "mocking", "logging", "tracebacks", "linting"],
    guidedLessons: [
      {
        title: "Tests That Matter",
        summary: "Write targeted tests for behavior, edge cases, and regressions.",
        estimatedMinutes: 35,
        tags: ["testing", "quality"],
      },
      {
        title: "Debugging Workflow",
        summary: "Read tracebacks, isolate state, and move from symptom to root cause.",
        estimatedMinutes: 35,
        tags: ["debugging", "tracebacks"],
      },
      {
        title: "Logs and Tooling",
        summary: "Use logs, formatting, and linting to keep code reviewable and operationally useful.",
        estimatedMinutes: 30,
        tags: ["logging", "tooling"],
      },
    ],
    practice: [
      "Write tests for parsing and validation helpers.",
      "Fix broken functions using traceback-driven debugging.",
      "Add logs to a data-processing script without polluting output.",
    ],
    debugging: "A test passes locally but fails on hidden edge cases because it missed malformed input coverage.",
    businessCase: "A nightly pipeline needs tests and logging before it can be trusted in production.",
    interviewPrompts: [
      "How do you test a function with file or API side effects?",
      "What does a useful traceback tell you first?",
    ],
    assessment:
      "Submit a small module with tests, logs, and a debugging write-up for one intentionally broken case.",
    project: "Add a full test harness and logging layer to a data-cleaning utility.",
    revision: [
      "Review failures that escaped because tests were too shallow.",
      "Practice reading tracebacks top to bottom.",
    ],
    masteryCheckpoint: "You start proving code quality instead of assuming it.",
  },
  {
    monthNumber: 3,
    weekNumber: 11,
    levelNumber: 11,
    title: "Data Engineering Python I",
    theme: "Turn Python into a reliable data-work tool.",
    objectives: [
      "Process CSV, JSON, APIs, and validation flows.",
      "Build ETL-like transformations with clean staging.",
      "Handle configuration and logging in data scripts.",
    ],
    topics: ["csv", "json", "api requests", "validation", "etl", "config"],
    guidedLessons: [
      {
        title: "Extract and Validate",
        summary: "Bring raw data in safely and fail early on schema violations.",
        estimatedMinutes: 35,
        tags: ["etl", "validation"],
      },
      {
        title: "Transform with Discipline",
        summary: "Separate extract, transform, and load steps so debugging stays sane.",
        estimatedMinutes: 35,
        tags: ["transforms", "pipeline"],
      },
      {
        title: "Configuration and Logging",
        summary: "Move magic values out of code and make batch runs observable.",
        estimatedMinutes: 30,
        tags: ["config", "logging"],
      },
    ],
    practice: [
      "Normalize CSV records and enrich from JSON config.",
      "Parse API responses into clean internal models.",
      "Write a small staged ETL script with validation errors captured cleanly.",
    ],
    debugging: "A batch script mixes extract and transform logic so badly that a bad record crashes the entire run without context.",
    businessCase: "Data ops needs a reliable pipeline that ingests customer and order files nightly.",
    interviewPrompts: [
      "How do you structure a small ETL pipeline?",
      "Where should validation happen in a batch job?",
    ],
    assessment:
      "Build a staged ETL script with clear input validation, transformation, and output reporting.",
    project: "Create a local file-to-database style ETL workflow.",
    revision: [
      "Review where configuration belongs versus code.",
      "Re-run validation design on a new dataset.",
    ],
    masteryCheckpoint: "You can design small data pipelines that another engineer could maintain.",
  },
  {
    monthNumber: 3,
    weekNumber: 12,
    levelNumber: 12,
    title: "Data Engineering Python II",
    theme: "Scale from scripts to data applications.",
    objectives: [
      "Use Pandas and NumPy for batch analysis where they are appropriate.",
      "Connect Python workflows to databases.",
      "Handle transformations, batching, and reporting more efficiently.",
    ],
    topics: ["pandas", "numpy", "database access", "batching", "cleaning", "transformation"],
    guidedLessons: [
      {
        title: "Pandas Without Sloppiness",
        summary: "Use vectorized operations and explicit data-cleaning steps without losing correctness.",
        estimatedMinutes: 40,
        tags: ["pandas", "dataframes"],
      },
      {
        title: "NumPy and Efficiency",
        summary: "Understand where array operations beat Python loops and why.",
        estimatedMinutes: 30,
        tags: ["numpy", "performance"],
      },
      {
        title: "Database-Coupled Workflows",
        summary: "Fetch, transform, and validate database records inside reliable scripts.",
        estimatedMinutes: 35,
        tags: ["databases", "pipelines"],
      },
    ],
    practice: [
      "Clean and aggregate transaction data with Pandas.",
      "Vectorize a transformation that was previously loop-based.",
      "Pull records from a database-style source and generate output artifacts.",
    ],
    debugging: "A Pandas transform silently changes dtypes and breaks downstream joins. Repair it.",
    businessCase: "Analytics engineering needs repeatable data-prep notebooks converted into production-friendly scripts.",
    interviewPrompts: [
      "When should you prefer Pandas to pure Python?",
      "How do you avoid brittle DataFrame transformations?",
    ],
    assessment:
      "Build a medium-size data workflow using Pandas and justify where vectorization helps.",
    project: "Create a batch analytics pipeline that reads, cleans, joins, and exports business data.",
    revision: [
      "Review dtype assumptions and missing-value behavior.",
      "Re-run one transformation in both loop and vectorized form.",
    ],
    masteryCheckpoint: "You can use data libraries productively without turning every task into opaque notebook code.",
  },
  {
    monthNumber: 4,
    weekNumber: 13,
    levelNumber: 13,
    title: "Performance and Concurrency",
    theme: "Speed matters when you know why the code is slow.",
    objectives: [
      "Reason about time and space complexity.",
      "Profile Python code and choose the right optimization strategy.",
      "Understand generators, vectorization, multithreading, multiprocessing, and async at a practical level.",
    ],
    topics: ["complexity", "profiling", "memory", "vectorization", "threading", "multiprocessing", "async"],
    guidedLessons: [
      {
        title: "Measure Before Optimizing",
        summary: "Use profiling and complexity analysis to find the real bottleneck.",
        estimatedMinutes: 35,
        tags: ["profiling", "complexity"],
      },
      {
        title: "Memory and Throughput",
        summary: "Use generators, batching, and vectorization to reduce waste.",
        estimatedMinutes: 35,
        tags: ["memory", "generators"],
      },
      {
        title: "Concurrency Tradeoffs",
        summary: "Know what multithreading, multiprocessing, and async are good for in Python.",
        estimatedMinutes: 35,
        tags: ["concurrency", "performance"],
      },
    ],
    practice: [
      "Profile a slow script and fix the dominant bottleneck.",
      "Reduce memory usage in a large-file workflow.",
      "Choose an appropriate concurrency model for I/O or CPU work.",
    ],
    debugging: "A concurrency rewrite is slower because the task is CPU-bound and the chosen model was wrong.",
    businessCase: "A daily data job is missing its SLA because of poor batching and unnecessary repeated work.",
    interviewPrompts: [
      "How do you decide whether to optimize time or memory first?",
      "When does multiprocessing beat threading in Python?",
    ],
    assessment:
      "Profile, optimize, and explain one realistic data-processing workload.",
    project: "Tune a batch transformation job to meet a strict runtime target.",
    revision: [
      "Review what the profiler actually measured instead of what you assumed.",
      "Write down why each optimization helped or did not.",
    ],
    masteryCheckpoint: "You optimize with evidence and choose concurrency models based on workload shape.",
  },
  {
    monthNumber: 4,
    weekNumber: 14,
    levelNumber: 14,
    title: "Production Python",
    theme: "Code should survive teammates, reruns, and deployment.",
    objectives: [
      "Structure projects cleanly with config, testing, logging, and packaging.",
      "Use environment variables and maintainable module layouts.",
      "Think about scalability and long-term maintainability.",
    ],
    topics: ["project structure", "config", "env vars", "packaging", "docs", "maintainability"],
    guidedLessons: [
      {
        title: "Project Layout and Boundaries",
        summary: "Organize code so growth does not turn the repo into a junk drawer.",
        estimatedMinutes: 35,
        tags: ["architecture", "structure"],
      },
      {
        title: "Operational Concerns",
        summary: "Use configuration, logs, and failure paths that support real runs.",
        estimatedMinutes: 35,
        tags: ["ops", "config"],
      },
      {
        title: "Packaging and Documentation",
        summary: "Make your code installable, understandable, and easy to hand off.",
        estimatedMinutes: 30,
        tags: ["packaging", "docs"],
      },
    ],
    practice: [
      "Refactor scripts into a small production-style package.",
      "Add environment-based configuration and logging.",
      "Write concise docs and runnable entry points.",
    ],
    debugging: "A script behaves differently across machines because config lives in code and paths are implicit.",
    businessCase: "A team wants to operationalize a useful notebook into a maintainable service-like tool.",
    interviewPrompts: [
      "What makes a Python project production-ready?",
      "How do you keep configuration out of source code responsibly?",
    ],
    assessment:
      "Package a working utility with tests, config, docs, and clean structure.",
    project: "Turn an ETL or analysis workflow into a production-quality Python project.",
    revision: [
      "Review boundaries between CLI, core logic, and I/O.",
      "Audit the project for hidden config and undocumented assumptions.",
    ],
    masteryCheckpoint: "You can turn useful scripts into software another engineer can trust and extend.",
  },
  {
    monthNumber: 4,
    weekNumber: 15,
    levelNumber: 15,
    title: "Interview Patterns and Problem Solving",
    theme: "Under pressure, structure beats panic.",
    objectives: [
      "Practice strings, arrays, hash maps, stacks, queues, recursion, sorting, and searching.",
      "Explain approach, complexity, and edge cases clearly.",
      "Debug intentionally during timed rounds.",
    ],
    topics: ["strings", "arrays", "hash maps", "stacks", "queues", "recursion", "sorting", "searching"],
    guidedLessons: [
      {
        title: "Pattern Recognition",
        summary: "Identify common interview problem families quickly and choose the right structure.",
        estimatedMinutes: 35,
        tags: ["interview", "patterns"],
      },
      {
        title: "Communicating While Coding",
        summary: "Narrate assumptions, tradeoffs, and debugging without rambling.",
        estimatedMinutes: 30,
        tags: ["communication", "interview"],
      },
      {
        title: "Complexity Under Pressure",
        summary: "State runtime and space confidently and know when a brute-force version is acceptable first.",
        estimatedMinutes: 35,
        tags: ["complexity", "speed"],
      },
    ],
    practice: [
      "Run timed coding drills across major data-structure patterns.",
      "Explain two solutions and compare tradeoffs.",
      "Debug a nearly-correct implementation under a short timer.",
    ],
    debugging: "A sliding-window solution misses an edge case when the input is empty. Trace it and repair it quickly.",
    businessCase: "A hiring loop expects both algorithmic clarity and practical debugging.",
    interviewPrompts: [
      "How do you communicate while still making progress?",
      "When do you present an alternative solution?",
    ],
    assessment:
      "Complete a timed mixed-pattern interview set with post-round self-review.",
    project: "Assemble an interview prep pack with solved patterns and failure notes.",
    revision: [
      "Re-run your weakest pattern family with no hints.",
      "Review recurring communication and edge-case misses.",
    ],
    masteryCheckpoint: "You can solve and explain interview problems without losing structure under time pressure.",
  },
  {
    monthNumber: 4,
    weekNumber: 16,
    levelNumber: 16,
    title: "Capstone, Readiness, and Final Review",
    theme: "End by proving real-world competence.",
    objectives: [
      "Deliver a production-style Python project from requirement to tested output.",
      "Review weak topics with spaced repetition and targeted repair work.",
      "Assess readiness for production coding and data-engineering style tasks.",
    ],
    topics: ["capstone", "review", "debugging", "testing", "production", "readiness"],
    guidedLessons: [
      {
        title: "Capstone Planning",
        summary: "Turn an ambiguous business problem into milestones, interfaces, and testable delivery.",
        estimatedMinutes: 35,
        tags: ["capstone", "planning"],
      },
      {
        title: "Delivery and Review",
        summary: "Finalize documentation, quality checks, and production tradeoff explanations.",
        estimatedMinutes: 35,
        tags: ["delivery", "review"],
      },
      {
        title: "Final Weakness Sweep",
        summary: "Use your error log and revision queue to close the biggest remaining gaps.",
        estimatedMinutes: 30,
        tags: ["revision", "mastery"],
      },
    ],
    practice: [
      "Complete a final project milestone with tests and documentation.",
      "Re-solve weak-topic problems under time limits.",
      "Write a short postmortem on your most common mistakes.",
    ],
    debugging: "A final project script passes happy-path tests but fails on malformed inputs. Patch it without breaking clean cases.",
    businessCase: "Deliver a local data utility or pipeline that another engineer could reasonably adopt.",
    interviewPrompts: [
      "What production risks remain in your solution?",
      "Which topics still need deliberate practice and why?",
    ],
    assessment:
      "Submit a capstone and a final targeted review report based on actual weakness data.",
    project: "Capstone: production-quality Python data tool with tests, docs, and error handling.",
    revision: [
      "Review your error log line by line.",
      "Redo one major project task from memory with cleaner architecture.",
    ],
    masteryCheckpoint: "You finish with a believable foundation for real engineering work, not just tutorial familiarity.",
  },
];

const toWeeks = (courseSlug: CourseSlug, weeksInput: WeekInput[]): WeekSeed[] =>
  weeksInput.map((week) =>
    buildRecord(makeId(courseSlug, "week", String(week.weekNumber).padStart(2, "0")), {
      courseSlug,
      ...week,
    }),
  );

const pysparkPlanInputs = [
  {
    title: "Spark Foundations and DataFrame Thinking",
    theme: "Think in distributed transformations instead of single-machine scripts.",
    objectives: [
      "Understand SparkSession, DataFrames, and lazy evaluation.",
      "Read schemas and reason about partitions at a high level.",
      "Write simple projections and filters with clean DataFrame code.",
    ],
    topics: ["SparkSession", "DataFrames", "select", "filter", "lazy execution"],
    practice: [
      "Select and filter event records from a mock clickstream DataFrame.",
      "Describe how lazy execution changes debugging strategy.",
      "Predict schema and row counts before running a transform.",
    ],
    debugging: "A DataFrame looks empty after a filter. Trace whether the predicate or the input schema caused the issue.",
    businessCase: "A growth team needs a clean filtered extract from a raw event stream without moving data into pandas.",
    interviewPrompts: [
      "Why does Spark delay execution until an action runs?",
      "When would you choose a DataFrame transformation instead of a Python loop?",
    ],
    assessment: "Build a small DataFrame pipeline with projection, filtering, and a schema check.",
    project: "Prepare a starter Spark notebook that reads, filters, and explains a raw events dataset.",
    revision: [
      "Review lazy execution and action vs transformation.",
      "Rebuild a small select-filter pipeline from memory.",
    ],
    masteryCheckpoint: "You can explain what Spark is doing before and after an action is triggered.",
  },
  {
    title: "Column Expressions and Null Handling",
    theme: "Clean raw fields without hiding data quality issues.",
    objectives: [
      "Use `withColumn`, `when`, `coalesce`, and casts safely.",
      "Handle nulls without dropping useful records accidentally.",
      "Build readable derived fields in PySpark.",
    ],
    topics: ["withColumn", "when", "coalesce", "cast", "null handling"],
    practice: [
      "Standardize status labels and amount fields in a raw orders DataFrame.",
      "Fill null descriptive fields with safe defaults.",
      "Compare cast behavior before and after data cleanup.",
    ],
    debugging: "A cast to integer fails for a subset of rows. Identify whether malformed strings or null behavior is the root cause.",
    businessCase: "A warehouse load needs clean order status, numeric amounts, and safe fallback text before writing a curated table.",
    interviewPrompts: [
      "When is `coalesce` safe, and when can it hide a real quality issue?",
      "How do you keep many derived columns readable in PySpark?",
    ],
    assessment: "Create a cleaned projection with derived fields, casts, and explicit null-safe logic.",
    project: "Build a reusable cleanup stage for a raw orders DataFrame.",
    revision: [
      "Rebuild your null-handling expressions from memory.",
      "Review which fields should be cast and which should be left raw.",
    ],
    masteryCheckpoint: "You can clean raw Spark columns without turning the pipeline into unreadable code.",
  },
  {
    title: "Aggregations and Metric Integrity",
    theme: "Never lose the grain when you summarize data at scale.",
    objectives: [
      "Group and aggregate at the correct business grain.",
      "Use counts, sums, and distinct logic carefully.",
      "Protect metrics from duplicate inflation.",
    ],
    topics: ["groupBy", "agg", "countDistinct", "sum", "metric grain"],
    practice: [
      "Calculate daily revenue and paid order counts by country.",
      "Compare `count` and `countDistinct` on duplicated records.",
      "Create multiple KPIs in one aggregation pass.",
    ],
    debugging: "Revenue doubled after a join. Decide whether the issue is pre-aggregation grain or duplicate keys.",
    businessCase: "Finance needs a trustworthy daily metrics table from high-volume transaction data.",
    interviewPrompts: [
      "What does one row represent before and after a Spark aggregation?",
      "Why is `countDistinct` expensive, and when is it still necessary?",
    ],
    assessment: "Build a grouped metrics table with correct grain and clearly named KPI columns.",
    project: "Create a reusable aggregation layer for an orders fact table.",
    revision: [
      "Revisit grain statements before writing any aggregation.",
      "Redo one metrics task while watching for duplicate inflation.",
    ],
    masteryCheckpoint: "You can explain why a Spark metric is correct, not just show the code that produced it.",
  },
  {
    title: "Joins and Distributed Relationship Logic",
    theme: "Joining at scale means thinking about keys, skew, and row explosion.",
    objectives: [
      "Use inner, left, and anti joins correctly.",
      "Diagnose duplicate explosions and missing-row regressions.",
      "Keep join logic business-readable.",
    ],
    topics: ["join", "join keys", "left join", "anti join", "row explosion"],
    practice: [
      "Join customers and orders into a readable report DataFrame.",
      "Use anti joins to find missing reference data.",
      "Check row counts before and after a join.",
    ],
    debugging: "A left join followed by a filter silently drops unmatched rows. Find where the logic went wrong.",
    businessCase: "A support dashboard needs customer context attached to recent orders without duplicating transactions.",
    interviewPrompts: [
      "How do you debug an unexpected row-count increase after a join?",
      "When is an anti join better than a `NOT IN` style pattern?",
    ],
    assessment: "Build a join pipeline with one fact table, one dimension table, and explicit validation checks.",
    project: "Create a customer-order enrichment job with pre- and post-join quality checks.",
    revision: [
      "Review which key drives each join.",
      "Redo a duplicate-explosion debugging task.",
    ],
    masteryCheckpoint: "You treat joins as data-contract work, not just syntax work.",
  },
  {
    title: "Window Functions in Spark",
    theme: "Keep row-level detail while computing group-level context.",
    objectives: [
      "Use partitions and ordering inside Spark window specs.",
      "Rank, deduplicate, and compare rows within groups.",
      "Pick the correct window function for the business question.",
    ],
    topics: ["Window", "row_number", "rank", "lag", "partitionBy"],
    practice: [
      "Rank orders within each customer by amount.",
      "Use `row_number` to keep the latest record per key.",
      "Compare current and previous event timestamps with `lag`.",
    ],
    debugging: "A deduplication window keeps the wrong row. Check ordering and partition columns.",
    businessCase: "Analytics engineering needs latest-state records and within-customer ranking without losing event-level detail.",
    interviewPrompts: [
      "Why does window ordering matter as much as partitioning?",
      "When would you use `row_number` instead of `rank`?",
    ],
    assessment: "Build one ranking task, one latest-row task, and one lag-based comparison task.",
    project: "Create a latest-customer-state Spark view with clear deduplication logic.",
    revision: [
      "Review partition columns and sort direction for each window.",
      "Redo one latest-row exercise without notes.",
    ],
    masteryCheckpoint: "You can design a window spec by reasoning from grain and business intent.",
  },
  {
    title: "Dates, Time, and Incremental Logic",
    theme: "Production jobs live or die by correct time boundaries.",
    objectives: [
      "Filter by date windows safely.",
      "Use watermark logic for incremental data movement.",
      "Distinguish event time, load time, and business date.",
    ],
    topics: ["date filters", "timestamps", "watermarks", "incremental loads", "event time"],
    practice: [
      "Filter recent events using a clear date boundary.",
      "Select only new or changed rows after a load watermark.",
      "Compare business date and ingestion time for late-arriving data.",
    ],
    debugging: "A daily job reloads too many rows. Trace whether the watermark or timestamp parsing is wrong.",
    businessCase: "An overnight Spark pipeline must move only new records into a warehouse-ready zone.",
    interviewPrompts: [
      "What is the difference between event time and processing time in batch pipelines?",
      "How do you make incremental filters safe for reruns?",
    ],
    assessment: "Write an incremental extraction step with explicit watermark and boundary logic.",
    project: "Build a daily incremental Spark load for transaction data.",
    revision: [
      "Review boundary conditions around start and end dates.",
      "Rebuild one watermark filter from memory.",
    ],
    masteryCheckpoint: "You stop treating time filters like simple strings and start treating them like pipeline contracts.",
  },
  {
    title: "Performance Basics and Wide Transform Awareness",
    theme: "Not every correct Spark job is a scalable Spark job.",
    objectives: [
      "Recognize narrow vs wide transformations.",
      "Understand why shuffles are expensive.",
      "Use basic performance judgment before tuning deeply.",
    ],
    topics: ["shuffles", "wide transforms", "narrow transforms", "execution plan", "cost awareness"],
    practice: [
      "Compare a narrow projection flow with a wide aggregation flow.",
      "Identify where a shuffle is introduced in a plan.",
      "Rewrite a transform sequence to reduce unnecessary data movement.",
    ],
    debugging: "A job is correct but unexpectedly slow. Identify whether a shuffle-heavy step is the likely culprit.",
    businessCase: "A pipeline must finish inside a narrow batch window without upgrading compute wastefully.",
    interviewPrompts: [
      "What makes a transformation wide?",
      "How can you reason about cost before running full-scale data?",
    ],
    assessment: "Explain one slow plan and propose safer transformation ordering.",
    project: "Refactor a shuffle-heavy job into a cleaner, more efficient sequence.",
    revision: [
      "Review where the pipeline triggers data movement.",
      "Re-explain narrow vs wide transforms in your own words.",
    ],
    masteryCheckpoint: "You start noticing data movement costs before they hurt production.",
  },
  {
    title: "Write Paths, Partitioning, and File Layout",
    theme: "Good output structure saves downstream teams from pain.",
    objectives: [
      "Choose sensible partition columns for batch output.",
      "Avoid thoughtless over-partitioning.",
      "Prepare write steps that downstream readers can use efficiently.",
    ],
    topics: ["write", "partitionBy", "file layout", "partition strategy", "batch output"],
    practice: [
      "Add a partition-ready date field to a curated DataFrame.",
      "Reason about why one partition column is better than another.",
      "Describe tradeoffs of too many small output partitions.",
    ],
    debugging: "A downstream reader is slow because the output layout is messy. Identify the likely write-path design issue.",
    businessCase: "A curated daily table must be written in a layout that BI and batch readers can consume efficiently.",
    interviewPrompts: [
      "How do you choose a partition column for Spark output?",
      "Why can too many small files become a production problem?",
    ],
    assessment: "Design a write path with partitioning rationale and downstream-read considerations.",
    project: "Prepare a partitioned output plan for a curated orders dataset.",
    revision: [
      "Review partition choices against business query patterns.",
      "Revisit file layout tradeoffs.",
    ],
    masteryCheckpoint: "You treat write layout as a product decision, not an afterthought.",
  },
  {
    title: "Data Quality Validation in Spark",
    theme: "Batch pipelines need checks, not trust.",
    objectives: [
      "Return invalid rows explicitly for inspection.",
      "Compare source and target counts at matching grain.",
      "Build quality checks into the pipeline flow.",
    ],
    topics: ["validation", "bad-row capture", "reconciliation", "count checks", "quality gates"],
    practice: [
      "Return only invalid order rows for review.",
      "Compare staging and curated row counts by date.",
      "Write a DataFrame check that flags missing keys and non-positive amounts.",
    ],
    debugging: "A curated table looks smaller than staging. Build a validation step to pinpoint the loss.",
    businessCase: "Data engineering needs confidence checks before each write is considered successful.",
    interviewPrompts: [
      "What validation checks belong in almost every Spark batch pipeline?",
      "How do you make bad rows inspectable instead of invisible?",
    ],
    assessment: "Create a validation bundle with row-level and aggregate-level checks.",
    project: "Add quality gates to a Spark job and summarize what each gate protects.",
    revision: [
      "Review the difference between row-level and aggregate-level validation.",
      "Redo a reconciliation check from memory.",
    ],
    masteryCheckpoint: "You build trust into the pipeline instead of checking results only after something breaks.",
  },
  {
    title: "Modular Pipeline Design",
    theme: "Readable Spark code scales better than one giant notebook cell.",
    objectives: [
      "Break a Spark job into understandable stages.",
      "Name intermediate DataFrames for purpose, not just syntax.",
      "Separate extraction, transform, validate, and write concerns.",
    ],
    topics: ["pipeline stages", "modular code", "naming", "readability", "job structure"],
    practice: [
      "Refactor a long transform chain into clear named stages.",
      "Separate quality checks from transformation logic.",
      "Explain what each stage is responsible for in plain language.",
    ],
    debugging: "A monolithic job is too hard to debug. Identify where stage boundaries should be introduced.",
    businessCase: "A team needs a Spark job another engineer can inherit without reverse-engineering every line.",
    interviewPrompts: [
      "What does maintainable Spark code look like in a shared codebase?",
      "Where should validation happen in a multi-step pipeline?",
    ],
    assessment: "Refactor a long Spark flow into a clear stage-based design.",
    project: "Build a modular batch pipeline with named stages and quality checkpoints.",
    revision: [
      "Review each stage name and confirm it matches business purpose.",
      "Re-explain the pipeline in plain English.",
    ],
    masteryCheckpoint: "You write Spark code that another engineer can debug without asking you to translate it first.",
  },
  {
    title: "Join Strategy and Skew Awareness",
    theme: "Hot keys can sink a job even when the logic is right.",
    objectives: [
      "Recognize skewed keys and their performance impact.",
      "Separate logical correctness from distribution problems.",
      "Use join strategy awareness when shaping large inputs.",
    ],
    topics: ["data skew", "join strategy", "hot keys", "distribution", "large joins"],
    practice: [
      "Identify which key distributions might create uneven partitions.",
      "Compare a balanced join scenario with a skewed one.",
      "Explain how filtering before a join can reduce cost.",
    ],
    debugging: "One partition runs far longer than the others after a join. Reason about whether key skew is the likely cause.",
    businessCase: "A very large event dataset must join to reference data without one key overwhelming the job.",
    interviewPrompts: [
      "How would you spot join skew from behavior and data shape?",
      "Why is a logically correct join still risky at scale?",
    ],
    assessment: "Review a large-join scenario and propose a safer execution strategy.",
    project: "Design a skew-aware enrichment plan for a heavy event dataset.",
    revision: [
      "Review symptoms of skew in Spark jobs.",
      "Revisit how data distribution changes join behavior.",
    ],
    masteryCheckpoint: "You think about distribution, not just syntax, when planning large joins.",
  },
  {
    title: "Deduplication and Latest-State Modeling",
    theme: "Production tables often need one trusted record from many candidates.",
    objectives: [
      "Use latest-state logic safely in Spark.",
      "Choose the correct business key and ordering column.",
      "Prepare reliable current-state outputs for downstream consumers.",
    ],
    topics: ["deduplication", "latest state", "business keys", "window latest-row", "current snapshot"],
    practice: [
      "Keep the latest row per business key with window logic.",
      "Explain why a bad ordering column gives the wrong winner.",
      "Prepare a current-state DataFrame for joins.",
    ],
    debugging: "A snapshot table shows stale values. Check whether the deduplication ordering is wrong.",
    businessCase: "A customer dimension needs one current row per customer even though raw changes arrive many times.",
    interviewPrompts: [
      "What columns do you need before trusting latest-row logic?",
      "How do you protect a current-state model from stale winners?",
    ],
    assessment: "Create a latest-state DataFrame and explain the winner-selection logic clearly.",
    project: "Build a current-state snapshot from a raw change history dataset.",
    revision: [
      "Review business key vs ordering key.",
      "Redo one latest-row challenge from scratch.",
    ],
    masteryCheckpoint: "You can explain why the kept row is the correct row, not just that it is the newest row.",
  },
  {
    title: "Reconciliation and Source-to-Target Audits",
    theme: "Good pipelines prove their own correctness.",
    objectives: [
      "Compare source and target counts at matching grain.",
      "Build difference reports for failed loads.",
      "Explain mismatches in business language.",
    ],
    topics: ["reconciliation", "source-target audits", "diffs", "row-count checks", "audit reports"],
    practice: [
      "Compare counts by date across staging and curated layers.",
      "Calculate a difference metric for mismatched outputs.",
      "Return a report that highlights only suspect partitions.",
    ],
    debugging: "A downstream table is missing rows. Build an audit to show where the drop first appears.",
    businessCase: "An analytics warehouse needs daily proof that curated outputs match upstream expectations.",
    interviewPrompts: [
      "What is the first reconciliation check you build after a new Spark pipeline launches?",
      "How do you make audit output actionable for another engineer?",
    ],
    assessment: "Create a source-to-target reconciliation report for one batch pipeline.",
    project: "Build a reusable audit step that compares input and output by business date.",
    revision: [
      "Review the grain used on both sides of the audit.",
      "Redo one difference report without notes.",
    ],
    masteryCheckpoint: "You can prove where a pipeline broke instead of only saying that it broke.",
  },
  {
    title: "Scheduling Mindset and Batch Reliability",
    theme: "A Spark job is part of a larger pipeline contract.",
    objectives: [
      "Think about reruns, idempotence, and operational safety.",
      "Separate one-time transformations from repeatable batch jobs.",
      "Document assumptions that production runs depend on.",
    ],
    topics: ["batch reliability", "reruns", "idempotence", "scheduling", "operational safety"],
    practice: [
      "Explain what a safe rerun requires for a daily batch step.",
      "Identify which steps depend on a watermark or partition contract.",
      "Write a short runbook summary for a Spark batch job.",
    ],
    debugging: "A rerun duplicated output. Identify which part of the job design was not idempotent.",
    businessCase: "Operations needs a Spark pipeline that can be rerun after failure without corrupting the target table.",
    interviewPrompts: [
      "What makes a Spark batch job safe to rerun?",
      "What should a minimal production runbook include?",
    ],
    assessment: "Describe how you would operationalize one Spark job for scheduled daily execution.",
    project: "Write a reliability checklist and rerun plan for a batch pipeline.",
    revision: [
      "Review idempotence and rerun conditions.",
      "Re-explain the operational contract of one job.",
    ],
    masteryCheckpoint: "You start thinking like the engineer who has to own the job at 2 AM.",
  },
  {
    title: "Optimization Review and Practical Tuning",
    theme: "Tune only after you understand the real bottleneck.",
    objectives: [
      "Read high-level execution behavior before changing code blindly.",
      "Connect shuffle, skew, and layout issues to runtime symptoms.",
      "Choose practical next steps instead of premature micro-optimizations.",
    ],
    topics: ["practical tuning", "execution review", "shuffle diagnosis", "layout review", "bottleneck analysis"],
    practice: [
      "Read a slow-job scenario and identify likely dominant cost drivers.",
      "Match runtime symptoms to data movement or skew problems.",
      "Prioritize fixes from biggest to smallest impact.",
    ],
    debugging: "A team wants to tune everything at once. Decide which bottleneck deserves attention first.",
    businessCase: "A production Spark job is breaching its batch window and needs focused tuning, not random changes.",
    interviewPrompts: [
      "How do you choose the first thing to investigate in a slow Spark job?",
      "Why is premature tuning risky in shared pipelines?",
    ],
    assessment: "Produce a short tuning plan with evidence-backed priorities.",
    project: "Review a slow pipeline and write the top three pragmatic fixes.",
    revision: [
      "Review the difference between symptom and root cause.",
      "Rank possible performance fixes by expected impact.",
    ],
    masteryCheckpoint: "You can prioritize Spark tuning work without guessing wildly.",
  },
  {
    title: "Lakehouse-Scale Job Design",
    theme: "Think beyond one transformation to the full platform flow.",
    objectives: [
      "Connect ingestion, transform, validate, and publish stages.",
      "Reason about curated zones and reusable outputs.",
      "Design jobs that fit a broader data platform.",
    ],
    topics: ["lakehouse flow", "curated layers", "publish steps", "platform thinking", "end-to-end design"],
    practice: [
      "Map one job into a multi-layer data platform flow.",
      "Describe what belongs in raw, staging, and curated outputs.",
      "Define which validations belong before publish.",
    ],
    debugging: "A team cannot tell where ownership changes across the pipeline. Clarify the job’s place in the broader platform.",
    businessCase: "A data platform team wants Spark jobs that plug cleanly into a lakehouse-style architecture.",
    interviewPrompts: [
      "How does one Spark job fit into a broader lakehouse flow?",
      "What separates a staging output from a curated output?",
    ],
    assessment: "Design an end-to-end Spark flow from ingest to publish with clear stage boundaries.",
    project: "Blueprint a lakehouse-friendly batch pipeline for product analytics data.",
    revision: [
      "Review layer responsibilities from raw to curated.",
      "Redraw the end-to-end job flow from memory.",
    ],
    masteryCheckpoint: "You can place a Spark job inside a larger platform design instead of treating it like an isolated script.",
  },
  {
    title: "Capstone: Production PySpark Pipeline",
    theme: "Combine transforms, validation, reliability, and performance thinking in one job.",
    objectives: [
      "Deliver an end-to-end PySpark pipeline design.",
      "Explain business grain, data quality, and runtime tradeoffs together.",
      "Finish with a believable data-engineering Spark foundation.",
    ],
    topics: ["capstone", "end-to-end pipeline", "validation", "performance", "production tradeoffs"],
    practice: [
      "Rebuild key transforms without notes.",
      "Explain the validation and partition strategy out loud.",
      "Review the pipeline like a production handoff document.",
    ],
    debugging: "A final capstone pipeline has one logic issue, one data-quality gap, and one runtime risk. Prioritize the fixes.",
    businessCase: "Deliver a PySpark batch pipeline another data engineer could review, extend, and run with confidence.",
    interviewPrompts: [
      "What tradeoffs did you make in your final PySpark design?",
      "What would you improve next if this became a production job?",
    ],
    assessment: "Submit a capstone Spark pipeline plan with transforms, checks, and operational reasoning.",
    project: "Capstone: production-style PySpark batch pipeline with validation, partition strategy, and tuning notes.",
    revision: [
      "Review your biggest Spark weakness from the course.",
      "Redo one high-value transformation or audit from scratch.",
    ],
    masteryCheckpoint: "You leave with a real PySpark pipeline mindset, not just isolated DataFrame syntax.",
  },
] as const;

const pysparkWeeksInput: WeekInput[] = pysparkPlanInputs.map((plan, index) => ({
  monthNumber: Math.floor(index / 4) + 1,
  weekNumber: index + 1,
  levelNumber: index + 1,
  title: plan.title,
  theme: plan.theme,
  objectives: [...plan.objectives],
  topics: [...plan.topics],
  guidedLessons: [
    {
      title: `${plan.title}: mental model`,
      summary: `Build intuition for ${plan.topics[0]} and ${plan.topics[1] ?? plan.topics[0]} in a distributed-data setting.`,
      estimatedMinutes: 30,
      tags: ["mental-model", plan.topics[0].toLowerCase().replace(/\s+/g, "-")],
    },
    {
      title: `${plan.title}: practical transforms`,
      summary: `Apply ${plan.topics.slice(0, 3).join(", ")} to a realistic data-engineering problem.`,
      estimatedMinutes: 35,
      tags: ["practice", plan.topics[1].toLowerCase().replace(/\s+/g, "-")],
    },
    {
      title: `${plan.title}: debugging and review`,
      summary: `Use the week ideas to inspect failure modes, tradeoffs, and production behavior.`,
      estimatedMinutes: 30,
      tags: ["debugging", "review"],
    },
  ],
  practice: [...plan.practice],
  debugging: plan.debugging,
  businessCase: plan.businessCase,
  interviewPrompts: [...plan.interviewPrompts],
  assessment: plan.assessment,
  project: plan.project,
  revision: [...plan.revision],
  masteryCheckpoint: plan.masteryCheckpoint,
}));

export const sqlWeeks = toWeeks("sql", sqlWeeksInput);
export const pythonWeeks = toWeeks("python", pythonWeeksInput);
export const pysparkWeeks = toWeeks("pyspark", pysparkWeeksInput);
export const allWeeks = [...sqlWeeks, ...pythonWeeks, ...pysparkWeeks];

export const lessons: LessonRecord[] = allWeeks.flatMap((week) =>
  week.guidedLessons.map((lesson) =>
    buildRecord(makeId(week.courseSlug, "lesson", week.weekNumber.toString(), lesson.title), {
      courseSlug: week.courseSlug,
      weekId: week.id,
      title: lesson.title,
      summary: lesson.summary,
      estimatedMinutes: lesson.estimatedMinutes,
      tags: lesson.tags,
    }),
  ),
);

export const exercises: ExerciseSeed[] = [
  buildRecord("exercise-sql-joins-1", {
    courseSlug: "sql" as const,
    topic: "Joins",
    title: "Customer 360 Join Audit",
    difficulty: "medium" as const,
    mode: "guided" as const,
    prompt: "Return one row per customer with latest paid order date, lifetime revenue, and whether they ever returned an item.",
  }),
  buildRecord("exercise-sql-window-1", {
    courseSlug: "sql" as const,
    topic: "Window Functions",
    title: "Top Creator per Genre",
    difficulty: "hard" as const,
    mode: "independent" as const,
    prompt: "Use window functions to return the highest-viewed creator per genre with explicit tie handling.",
  }),
  buildRecord("exercise-sql-debug-1", {
    courseSlug: "sql" as const,
    topic: "Aggregation",
    title: "Inflated Revenue Debug",
    difficulty: "debugging" as const,
    mode: "revision" as const,
    prompt: "A revenue query doubled after joining order items. Find the grain issue and repair the metric.",
  }),
  buildRecord("exercise-sql-interview-1", {
    courseSlug: "sql" as const,
    topic: "Retention",
    title: "Day-7 Retention",
    difficulty: "interview" as const,
    mode: "interview" as const,
    prompt: "Calculate day-7 retention from a user signup table and an events table.",
  }),
  buildRecord("exercise-python-dicts-1", {
    courseSlug: "python" as const,
    topic: "Data Structures",
    title: "Purchase Frequency Counter",
    difficulty: "easy" as const,
    mode: "guided" as const,
    prompt: "Given a list of purchases, return a frequency dictionary and the top repeated customer.",
  }),
  buildRecord("exercise-python-functions-1", {
    courseSlug: "python" as const,
    topic: "Functions",
    title: "Clean Record Pipeline",
    difficulty: "medium" as const,
    mode: "independent" as const,
    prompt: "Write a reusable function pipeline that normalizes, validates, and enriches raw customer records.",
  }),
  buildRecord("exercise-python-debug-1", {
    courseSlug: "python" as const,
    topic: "Testing and Debugging",
    title: "Mutable Default Trap",
    difficulty: "debugging" as const,
    mode: "revision" as const,
    prompt: "Repair a helper that leaks state across calls because of a mutable default argument.",
  }),
  buildRecord("exercise-python-interview-1", {
    courseSlug: "python" as const,
    topic: "Sliding Window",
    title: "Longest Unique Substring",
    difficulty: "interview" as const,
    mode: "timed" as const,
    prompt: "Return the length of the longest substring without repeating characters and explain the complexity.",
  }),
];

export const projects: ProjectSeed[] = [
  buildRecord("project-sql-ecommerce", {
    courseSlug: "sql" as const,
    title: "E-commerce Sales and Retention Analysis",
    businessProblem: "Leadership wants a trusted KPI pack for revenue, repeat purchase, returns, and customer retention.",
    milestones: [
      "Model key entities and grain assumptions.",
      "Build revenue, customer, and returns KPI queries.",
      "Add retention and cohort analysis.",
      "Validate metrics against source-level checks.",
    ],
    acceptanceCriteria: [
      "All metrics have explicit grain definitions.",
      "Queries handle nulls and duplicates correctly.",
      "A short data-quality checklist accompanies the output.",
    ],
  }),
  buildRecord("project-sql-saas", {
    courseSlug: "sql" as const,
    title: "SaaS Revenue and Churn Warehouse Case",
    businessProblem: "Build a warehouse-ready subscription analytics layer for MRR, churn, expansion, and plan movement.",
    milestones: [
      "Define fact and dimension grain.",
      "Build subscription and invoice transformations.",
      "Calculate MRR movement metrics.",
      "Tune the final reporting queries.",
    ],
    acceptanceCriteria: [
      "Warehouse model supports revenue and retention reporting.",
      "Plan-change history is preserved correctly.",
      "Performance and validation notes are included.",
    ],
  }),
  buildRecord("project-python-etl", {
    courseSlug: "python" as const,
    title: "CSV Cleaning and ETL Pipeline",
    businessProblem: "Operations needs a local pipeline that cleans daily CSV drops and emits validated JSON summaries.",
    milestones: [
      "Design the input schema and validation rules.",
      "Implement staged extract, transform, and output functions.",
      "Add tests and logging.",
      "Package the tool for repeatable runs.",
    ],
    acceptanceCriteria: [
      "Malformed records are reported clearly.",
      "The pipeline is testable and modular.",
      "Outputs are deterministic and documented.",
    ],
  }),
  buildRecord("project-python-logs", {
    courseSlug: "python" as const,
    title: "Large-Scale Log Analyzer",
    businessProblem: "Support needs a tool that scans massive log files, identifies critical failures, and outputs summaries fast.",
    milestones: [
      "Implement streaming file processing.",
      "Classify errors and aggregate counts.",
      "Add performance profiling and optimization.",
      "Ship a CLI with docs and tests.",
    ],
    acceptanceCriteria: [
      "The analyzer streams instead of loading the entire file.",
      "Performance bottlenecks are measured and documented.",
      "CLI outputs are clear and production-friendly.",
    ],
  }),
];

export const datasets: DatasetSeed[] = [
  buildRecord("dataset-sql-ecommerce", {
    courseSlug: "sql" as const,
    name: "E-commerce",
    domain: "Transactions",
    description: "Customers, products, orders, order_items, payments, shipments, returns, and reviews.",
    tablesOrFiles: ["customers", "products", "categories", "orders", "order_items", "payments", "shipments", "returns", "reviews"],
  }),
  buildRecord("dataset-sql-healthcare", {
    courseSlug: "sql" as const,
    name: "Healthcare",
    domain: "Operations",
    description: "Synthetic patient, appointment, encounter, and claims data for temporal and quality problems.",
    tablesOrFiles: ["patients", "providers", "appointments", "encounters", "diagnoses", "claims", "lab_results"],
  }),
  buildRecord("dataset-sql-saas", {
    courseSlug: "sql" as const,
    name: "SaaS",
    domain: "Subscriptions",
    description: "Organizations, plans, subscriptions, invoices, events, and support ticket workflows.",
    tablesOrFiles: ["organizations", "users", "plans", "subscriptions", "invoices", "events", "support_tickets"],
  }),
  buildRecord("dataset-python-files", {
    courseSlug: "python" as const,
    name: "Data Files Pack",
    domain: "File Processing",
    description: "Synthetic CSV, JSON, logs, and API-style payloads for Python transformations.",
    tablesOrFiles: ["customers.csv", "orders.csv", "transactions.csv", "system_logs.txt", "products.json", "api_response.json"],
  }),
  buildRecord("dataset-python-events", {
    courseSlug: "python" as const,
    name: "Web and Sensor Streams",
    domain: "Streaming Data",
    description: "Event and telemetry-style datasets suited for batching, validation, and aggregation practice.",
    tablesOrFiles: ["web_events.csv", "sensor_readings.csv", "healthcare_records.csv"],
  }),
];

export const topicMasterySeeds: TopicMasteryRecord[] = [
  buildRecord("mastery-sql-foundations", {
    courseSlug: "sql" as const,
    topic: "Relational Foundations",
    score: 18,
    recentTrend: "steady" as const,
  }),
  buildRecord("mastery-sql-joins", {
    courseSlug: "sql" as const,
    topic: "Joins",
    score: 12,
    recentTrend: "steady" as const,
  }),
  buildRecord("mastery-sql-window", {
    courseSlug: "sql" as const,
    topic: "Window Functions",
    score: 5,
    recentTrend: "steady" as const,
  }),
  buildRecord("mastery-python-foundations", {
    courseSlug: "python" as const,
    topic: "Python Foundations",
    score: 15,
    recentTrend: "steady" as const,
  }),
  buildRecord("mastery-python-functions", {
    courseSlug: "python" as const,
    topic: "Functions",
    score: 8,
    recentTrend: "steady" as const,
  }),
  buildRecord("mastery-python-testing", {
    courseSlug: "python" as const,
    topic: "Testing and Debugging",
    score: 0,
    recentTrend: "steady" as const,
  }),
];

export const getCourseBySlug = (slug: CourseSlug) => courses.find((course) => course.slug === slug) ?? null;

export const getWeeksByCourse = (slug: CourseSlug) =>
  allWeeks.filter((week) => week.courseSlug === slug).sort((a, b) => a.weekNumber - b.weekNumber);

export const getWeekById = (weekId: string) => allWeeks.find((week) => week.id === weekId) ?? null;

export const getLessonsByWeek = (weekId: string) =>
  lessons.filter((lesson) => lesson.weekId === weekId);

export const getLessonById = (lessonId: string) => lessons.find((lesson) => lesson.id === lessonId) ?? null;
