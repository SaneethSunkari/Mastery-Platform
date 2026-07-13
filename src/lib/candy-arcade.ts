import { CandyArcadeLevelDefinition } from "@/lib/types";

const stageBands = [
  { label: "Basics", start: 1, end: 500 },
  { label: "Working Foundations", start: 501, end: 1000 },
  { label: "Data Pipeline Core", start: 1001, end: 1500 },
  { label: "Warehouse and Spark Scale", start: 1501, end: 2000 },
  { label: "Production Debugging", start: 2001, end: 2500 },
  { label: "Senior Data Engineer", start: 2501, end: 3000 },
];

const themes = [
  "selecting the right fields",
  "filtering bad rows",
  "sorting output",
  "handling null values",
  "joining customers and orders",
  "grouping and metrics",
  "date filtering",
  "deduplicating records",
  "window calculations",
  "incremental loading",
  "data quality checks",
  "schema cleanup",
  "sessionization",
  "slowly changing dimensions",
  "late-arriving data",
  "partition strategy",
  "job debugging",
  "pipeline validation",
  "cost-aware optimization",
  "warehouse modeling",
];

const businessContexts = [
  "an e-commerce orders pipeline",
  "a subscription billing platform",
  "a ride-sharing event stream",
  "a food delivery analytics mart",
  "a payments reconciliation flow",
  "an ad-tech clickstream dataset",
  "a healthcare appointment platform",
  "a learning app usage warehouse",
  "a logistics shipment tracker",
  "a marketplace seller dashboard",
];

type ChallengeBlueprint = Pick<
  CandyArcadeLevelDefinition,
  "question" | "dataset" | "expectedOutput" | "successChecklist" | "sqlGoal" | "pythonGoal" | "pysparkGoal"
>;

const challengeBlueprints: Record<string, (businessContext: string) => ChallengeBlueprint> = {
  "selecting the right fields": (businessContext) => ({
    question: `You are working on ${businessContext}. Return only the fields needed for a clean orders extract. Do not return every column just because it exists.`,
    dataset: [
      "Table: `orders`",
      "Columns available: `order_id`, `customer_id`, `order_date`, `status`, `amount`, `payment_method`, `country`",
      "Assume each row is one order record",
    ],
    expectedOutput: [
      "Return one row per order",
      "Keep only the core reporting fields: `order_id`, `customer_id`, `order_date`, `amount`",
      "Preserve the original row count",
    ],
    successChecklist: [
      "Do not use `SELECT *`",
      "Keep the output narrow and readable",
      "Make the solution easy for another engineer to review",
    ],
    sqlGoal: "Write a query that selects only `order_id`, `customer_id`, `order_date`, and `amount` from `orders`.",
    pythonGoal:
      "Write Python that keeps only `order_id`, `customer_id`, `order_date`, and `amount` from an orders dataset.",
    pysparkGoal:
      "Write PySpark that selects only `order_id`, `customer_id`, `order_date`, and `amount` from the `orders` DataFrame.",
  }),
  "filtering bad rows": (businessContext) => ({
    question: `You are cleaning raw records for ${businessContext}. Remove rows that should not move forward into reporting or downstream jobs.`,
    dataset: [
      "Table: `orders`",
      "Bad rows include cancelled rows, rows with null `order_id`, and rows with non-positive `amount`",
      "Use only valid production-ready orders",
    ],
    expectedOutput: [
      "Return only good rows",
      "Exclude rows where `status = 'cancelled'`",
      "Exclude rows with missing identifiers or invalid amounts",
    ],
    successChecklist: [
      "Filter logic must be explicit",
      "Do not keep broken records for convenience",
      "Aim for readable production cleanup logic",
    ],
    sqlGoal:
      "Write SQL that keeps only valid rows by excluding cancelled orders, null `order_id`, and `amount <= 0`.",
    pythonGoal:
      "Write Python that filters an orders dataset to remove cancelled rows, null `order_id`, and `amount <= 0`.",
    pysparkGoal:
      "Write PySpark that filters the `orders` DataFrame to remove cancelled rows, null `order_id`, and `amount <= 0`.",
  }),
  "sorting output": () => ({
    question: "The analyst wants the most important rows first. Sort the result so the output is immediately useful without extra cleanup.",
    dataset: [
      "Table: `orders`",
      "Columns available: `order_id`, `customer_id`, `order_date`, `status`, `amount`",
      "Higher `amount` should appear before lower `amount`",
    ],
    expectedOutput: [
      "Return the orders sorted by `amount` descending",
      "Break ties by `order_date` descending",
      "Keep the ordering logic explicit",
    ],
    successChecklist: [
      "Use deterministic ordering",
      "Make the highest-value rows appear first",
      "Avoid ambiguous ordering",
    ],
    sqlGoal: "Write SQL that returns orders sorted by `amount` descending and `order_date` descending.",
    pythonGoal: "Write Python that sorts an orders dataset by `amount` descending and then `order_date` descending.",
    pysparkGoal: "Write PySpark that orders the `orders` DataFrame by `amount` descending and `order_date` descending.",
  }),
  "handling null values": () => ({
    question: "Some records have missing values. Handle them safely so the output is still analysis-ready.",
    dataset: [
      "Table: `customers`",
      "Columns available: `customer_id`, `customer_name`, `email`, `country`, `signup_date`",
      "Some rows have null `email` or null `country`",
    ],
    expectedOutput: [
      "Return all customers",
      "Replace null `email` with `'missing_email'`",
      "Replace null `country` with `'unknown'`",
    ],
    successChecklist: [
      "Do not drop rows just because a descriptive field is null",
      "Use clear fallback values",
      "Keep column meaning obvious",
    ],
    sqlGoal: "Write SQL that fills null `email` and `country` values with safe fallback text.",
    pythonGoal: "Write Python that fills missing `email` and `country` values with safe fallback text.",
    pysparkGoal: "Write PySpark that fills null `email` and `country` values with safe fallback text.",
  }),
  "joining customers and orders": () => ({
    question: "Combine customer and order information so a downstream report can show who placed each order.",
    dataset: [
      "Table 1: `customers(customer_id, customer_name, country)`",
      "Table 2: `orders(order_id, customer_id, order_date, amount, status)`",
      "Use the shared key `customer_id`",
    ],
    expectedOutput: [
      "Return `order_id`, `customer_name`, `country`, `order_date`, and `amount`",
      "Keep only rows where the order has a matching customer",
      "One row should represent one joined order record",
    ],
    successChecklist: [
      "Join on the correct key",
      "Avoid duplicate explosion from a wrong join",
      "Keep the output business-readable",
    ],
    sqlGoal: "Write SQL that joins `customers` and `orders` on `customer_id` and returns a readable order report.",
    pythonGoal: "Write Python that merges customers and orders on `customer_id` and keeps the requested columns.",
    pysparkGoal: "Write PySpark that joins `customers` and `orders` on `customer_id` and keeps the requested columns.",
  }),
  "grouping and metrics": () => ({
    question: "Create a simple metrics table that a team lead can use to review business performance by country.",
    dataset: [
      "Table: `orders` joined with `customers`",
      "Use `country` and `amount`",
      "Only paid orders should count toward revenue",
    ],
    expectedOutput: [
      "Return one row per `country`",
      "Show `country`, `paid_orders`, and `total_revenue`",
      "Sort by `total_revenue` descending",
    ],
    successChecklist: [
      "Aggregate at the right grain",
      "Count only paid orders",
      "Name metric columns clearly",
    ],
    sqlGoal: "Write SQL that aggregates paid orders by country and returns order count and revenue.",
    pythonGoal: "Write Python that groups paid orders by country and returns order count and revenue.",
    pysparkGoal: "Write PySpark that groups paid orders by country and returns order count and revenue.",
  }),
  "date filtering": () => ({
    question: "The team only wants recent activity. Filter the data to the requested time window.",
    dataset: [
      "Table: `orders`",
      "Use `order_date` as the business date",
      "Only rows from 2026-01-01 onward should remain",
    ],
    expectedOutput: [
      "Return only recent orders",
      "Exclude anything before `2026-01-01`",
      "Keep the filter logic easy to audit",
    ],
    successChecklist: [
      "Use the date column directly",
      "Make the boundary clear",
      "Do not mix string and date logic carelessly",
    ],
    sqlGoal: "Write SQL that returns only orders with `order_date >= '2026-01-01'`.",
    pythonGoal: "Write Python that filters an orders dataset to `order_date >= '2026-01-01'`.",
    pysparkGoal: "Write PySpark that filters the `orders` DataFrame to `order_date >= '2026-01-01'`.",
  }),
  "deduplicating records": () => ({
    question: "The raw feed contains duplicates. Keep only the latest version of each business record.",
    dataset: [
      "Table: `events`",
      "Columns available: `event_id`, `customer_id`, `event_time`, `updated_at`, `status`",
      "Multiple rows can exist for the same `event_id`",
    ],
    expectedOutput: [
      "Return one row per `event_id`",
      "Keep the row with the latest `updated_at`",
      "Preserve the rest of that winning row",
    ],
    successChecklist: [
      "Deduplicate by business key, not full row text",
      "Use latest `updated_at` as the winner",
      "Do not accidentally keep multiple copies",
    ],
    sqlGoal: "Write SQL that keeps only the latest row per `event_id` using `updated_at`.",
    pythonGoal: "Write Python that keeps only the latest row per `event_id` using `updated_at`.",
    pysparkGoal: "Write PySpark that keeps only the latest row per `event_id` using `updated_at`.",
  }),
  "window calculations": () => ({
    question: "Compute row-level ranking so the team can identify the highest-value orders inside each customer.",
    dataset: [
      "Table: `orders`",
      "Use `customer_id`, `order_id`, and `amount`",
      "Each customer can have many orders",
    ],
    expectedOutput: [
      "Return all orders",
      "Add a rank column showing biggest order first within each `customer_id`",
      "Higher `amount` should receive the better rank",
    ],
    successChecklist: [
      "Partition by the right business key",
      "Order correctly inside the window",
      "Keep the row-level detail",
    ],
    sqlGoal: "Write SQL that ranks orders by `amount` within each `customer_id`.",
    pythonGoal: "Write Python that assigns a within-customer rank based on descending `amount`.",
    pysparkGoal: "Write PySpark that assigns a within-customer rank based on descending `amount`.",
  }),
  "incremental loading": () => ({
    question: "Build the daily load so only new or changed rows move into the next pipeline step.",
    dataset: [
      "Table: `staging_orders`",
      "Columns available: `order_id`, `updated_at`, `status`, `amount`",
      "Previous successful load watermark: `2026-07-01 00:00:00`",
    ],
    expectedOutput: [
      "Return only rows with `updated_at` after the watermark",
      "Keep all required business columns",
      "Prepare the result for an incremental load",
    ],
    successChecklist: [
      "Use the watermark cleanly",
      "Do not reload old unchanged rows",
      "Keep the logic safe for recurring runs",
    ],
    sqlGoal: "Write SQL that selects only rows from `staging_orders` with `updated_at` after the watermark.",
    pythonGoal: "Write Python that filters staged rows using the load watermark.",
    pysparkGoal: "Write PySpark that filters staged rows using the load watermark.",
  }),
  "data quality checks": () => ({
    question: "Create a quick quality check that catches broken rows before they reach the warehouse.",
    dataset: [
      "Table: `orders`",
      "Important fields: `order_id`, `customer_id`, `order_date`, `amount`",
      "Rows are bad if any key field is missing or `amount <= 0`",
    ],
    expectedOutput: [
      "Return only the bad rows",
      "Make it easy for an engineer to inspect failures",
      "Keep the conditions explicit",
    ],
    successChecklist: [
      "Treat missing identifiers as failures",
      "Treat non-positive amounts as failures",
      "Write the validation logic clearly",
    ],
    sqlGoal: "Write SQL that returns only invalid orders for quality review.",
    pythonGoal: "Write Python that returns only invalid orders for quality review.",
    pysparkGoal: "Write PySpark that returns only invalid orders for quality review.",
  }),
  "schema cleanup": () => ({
    question: "Standardize messy raw columns into a cleaner reporting shape.",
    dataset: [
      "Raw columns include spaces and mixed naming style",
      "Fields available: `Order ID`, `Customer Name`, `Order Amount`, `Order Date`",
      "Output should use snake_case naming",
    ],
    expectedOutput: [
      "Return the same data with cleaned column names",
      "Use `order_id`, `customer_name`, `order_amount`, `order_date`",
      "Make the schema easier to reuse downstream",
    ],
    successChecklist: [
      "Normalize column naming",
      "Keep field meaning unchanged",
      "Make the output warehouse-friendly",
    ],
    sqlGoal: "Write SQL that renames raw fields into snake_case aliases.",
    pythonGoal: "Write Python that renames raw columns into snake_case names.",
    pysparkGoal: "Write PySpark that renames raw columns into snake_case names.",
  }),
  sessionization: () => ({
    question: "Group user events into sessions so the product team can analyze behavior bursts.",
    dataset: [
      "Table: `events`",
      "Columns: `user_id`, `event_time`, `event_type`",
      "A new session starts when the gap between events is more than 30 minutes",
    ],
    expectedOutput: [
      "Return each event with a derived session identifier",
      "Keep events from the same user in the same session until the gap exceeds 30 minutes",
      "Preserve event-level detail",
    ],
    successChecklist: [
      "Partition by user",
      "Use event time ordering",
      "Start a new session only when the gap rule is met",
    ],
    sqlGoal: "Write SQL that assigns sessions using a 30-minute inactivity gap.",
    pythonGoal: "Write Python that assigns sessions using a 30-minute inactivity gap.",
    pysparkGoal: "Write PySpark that assigns sessions using a 30-minute inactivity gap.",
  }),
  "slowly changing dimensions": () => ({
    question: "Prepare a Type 2 dimension view so history is preserved when a customer attribute changes.",
    dataset: [
      "Table: `customer_changes`",
      "Columns: `customer_id`, `country`, `effective_start`, `effective_end`, `is_current`",
      "Only one row per customer should be marked current",
    ],
    expectedOutput: [
      "Return the current version of each customer",
      "Keep only rows where `is_current = true`",
      "Preserve the effective date columns",
    ],
    successChecklist: [
      "Use the current-row flag correctly",
      "Avoid returning old historical versions",
      "Keep the output ready for downstream joins",
    ],
    sqlGoal: "Write SQL that returns only the current SCD row for each customer.",
    pythonGoal: "Write Python that keeps only the current SCD row for each customer.",
    pysparkGoal: "Write PySpark that keeps only the current SCD row for each customer.",
  }),
  "late-arriving data": () => ({
    question: "Handle records that arrived after the expected business date without losing them.",
    dataset: [
      "Table: `shipments`",
      "Columns: `shipment_id`, `business_date`, `ingested_at`, `status`",
      "A row is late-arriving when `ingested_at` is later than `business_date`",
    ],
    expectedOutput: [
      "Return only late-arriving rows",
      "Keep `shipment_id`, `business_date`, `ingested_at`, and `status`",
      "Make the lateness logic explicit",
    ],
    successChecklist: [
      "Compare ingestion time with business date",
      "Keep only genuinely late rows",
      "Make the check auditable",
    ],
    sqlGoal: "Write SQL that returns only late-arriving shipment records.",
    pythonGoal: "Write Python that returns only late-arriving shipment records.",
    pysparkGoal: "Write PySpark that returns only late-arriving shipment records.",
  }),
  "partition strategy": () => ({
    question: "Prepare output shaped for partitioned storage so downstream jobs can read efficiently.",
    dataset: [
      "Table: `orders`",
      "Columns include `order_date` and `country`",
      "The target storage layout partitions by `order_date`",
    ],
    expectedOutput: [
      "Return rows with a derived partition column based on `order_date`",
      "Keep the core business fields",
      "Make the partition key obvious in the output",
    ],
    successChecklist: [
      "Use the right partition key",
      "Keep output easy for write jobs to consume",
      "Avoid unnecessary extra columns",
    ],
    sqlGoal: "Write SQL that adds a partition-ready date field from `order_date`.",
    pythonGoal: "Write Python that adds a partition-ready date field from `order_date`.",
    pysparkGoal: "Write PySpark that adds a partition-ready date field from `order_date`.",
  }),
  "job debugging": () => ({
    question: "A pipeline step is producing wrong rows. Rebuild the logic so the output matches the intended business rule.",
    dataset: [
      "Table: `orders`",
      "Only `status = 'paid'` and `amount > 0` rows should remain",
      "The broken job currently mixes valid and invalid rows",
    ],
    expectedOutput: [
      "Return only valid paid rows",
      "Keep the filter logic readable",
      "Make the corrected logic easy to compare against the broken behavior",
    ],
    successChecklist: [
      "Apply every business rule explicitly",
      "Exclude invalid rows",
      "Think like you are fixing a production bug",
    ],
    sqlGoal: "Write SQL that rebuilds the filter correctly for valid paid orders.",
    pythonGoal: "Write Python that rebuilds the filter correctly for valid paid orders.",
    pysparkGoal: "Write PySpark that rebuilds the filter correctly for valid paid orders.",
  }),
  "pipeline validation": () => ({
    question: "Compare source and target counts so the team can quickly spot a broken pipeline run.",
    dataset: [
      "Source table: `staging_orders`",
      "Target table: `warehouse_orders`",
      "Compare row counts by `order_date`",
    ],
    expectedOutput: [
      "Return `order_date`, `source_count`, `target_count`, and `count_diff`",
      "One row per `order_date`",
      "Highlight mismatches clearly",
    ],
    successChecklist: [
      "Aggregate both sides at the same grain",
      "Calculate a clear difference metric",
      "Make mismatch review easy",
    ],
    sqlGoal: "Write SQL that compares source and target row counts by `order_date`.",
    pythonGoal: "Write Python that compares source and target row counts by `order_date`.",
    pysparkGoal: "Write PySpark that compares source and target row counts by `order_date`.",
  }),
  "cost-aware optimization": () => ({
    question: "Reduce unnecessary work by narrowing the data early instead of pushing every row through the whole pipeline.",
    dataset: [
      "Table: `events`",
      "Only rows from the last 7 days and `event_type = 'purchase'` are needed",
      "The raw table is large",
    ],
    expectedOutput: [
      "Return only recent purchase events",
      "Apply the most selective filters clearly",
      "Keep only relevant fields for the next step",
    ],
    successChecklist: [
      "Filter early",
      "Keep the result narrow",
      "Think about scale, not just correctness",
    ],
    sqlGoal: "Write SQL that returns only recent purchase events with narrow output columns.",
    pythonGoal: "Write Python that keeps only recent purchase events with narrow output columns.",
    pysparkGoal: "Write PySpark that keeps only recent purchase events with narrow output columns.",
  }),
  "warehouse modeling": () => ({
    question: "Shape a fact-style result set that can slot cleanly into a warehouse model.",
    dataset: [
      "Use customer and order data together",
      "Focus on keys and additive metrics",
      "The output should look like a clean fact extract",
    ],
    expectedOutput: [
      "Return `order_id`, `customer_id`, `order_date`, `country`, and `amount`",
      "Keep one row per order",
      "Avoid descriptive clutter that does not belong in a fact output",
    ],
    successChecklist: [
      "Keep the fact grain correct",
      "Preserve business keys",
      "Keep the dataset analytics-friendly",
    ],
    sqlGoal: "Write SQL that produces a clean fact-style order dataset.",
    pythonGoal: "Write Python that produces a clean fact-style order dataset.",
    pysparkGoal: "Write PySpark that produces a clean fact-style order dataset.",
  }),
};

const difficultyForLevel = (levelNumber: number): CandyArcadeLevelDefinition["difficulty"] => {
  const ratio = levelNumber / 3000;
  if (ratio <= 0.3) return "easy";
  if (ratio <= 0.6) return "medium";
  if (ratio <= 0.85) return "hard";
  return "expert";
};

const getStageForLevel = (levelNumber: number) =>
  stageBands.find((band) => levelNumber >= band.start && levelNumber <= band.end)?.label ?? "Mastery";

export const candyArcadeLevels: CandyArcadeLevelDefinition[] = Array.from({ length: 3000 }, (_, index) => {
  const levelNumber = index + 1;
  const theme = themes[index % themes.length];
  const businessContext = businessContexts[index % businessContexts.length];
  const stage = getStageForLevel(levelNumber);
  const worldNumber = Math.floor(index / 25) + 1;
  const blueprint =
    challengeBlueprints[theme]?.(businessContext) ??
    challengeBlueprints["selecting the right fields"](businessContext);

  return {
    id: `candy-arcade-level-${String(levelNumber).padStart(4, "0")}`,
    levelNumber,
    worldNumber,
    stage,
    theme,
    difficulty: difficultyForLevel(levelNumber),
    title: `Level ${levelNumber}: ${theme[0].toUpperCase()}${theme.slice(1)}`,
    prompt: `Solve one data-engineering challenge about ${theme} for ${businessContext}. Keep the logic clear, practical, and production-aware.`,
    question: blueprint.question,
    businessContext,
    dataset: blueprint.dataset,
    expectedOutput: blueprint.expectedOutput,
    successChecklist: blueprint.successChecklist,
    sqlGoal: blueprint.sqlGoal,
    pythonGoal: blueprint.pythonGoal,
    pysparkGoal: blueprint.pysparkGoal,
  };
});

export const getCandyArcadeLevel = (levelId: string) =>
  candyArcadeLevels.find((level) => level.id === levelId) ?? null;
