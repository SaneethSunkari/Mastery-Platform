import { type PythonVisibleCase, type PysparkExerciseDefinition } from "@/lib/mastery-exercises";
import { getMasteryQuestionId } from "@/lib/questions/ids";
import { CourseSlug } from "@/lib/types";

type ExtensionQuestionBase = {
  id: string;
  ordinal: number;
  track: Exclude<CourseSlug, "sql">;
  weekNumber: number;
  positionWithinWeek: number;
  title: string;
  prompt: string;
  topic: string;
  uniqueLogicFingerprint: string;
  negativeSubmission: string;
};

export type PythonExtensionQuestion = ExtensionQuestionBase & {
  track: "python";
  functionName: "solve";
  starterCode: string;
  referenceSolution: string;
  visibleCases: PythonVisibleCase[];
  hiddenCases: PythonVisibleCase[];
};

export type PysparkExtensionQuestion = ExtensionQuestionBase & {
  track: "pyspark";
  referenceSolution: string;
  definition: PysparkExerciseDefinition;
};

const extensionOrdinals = [
  ...Array.from({ length: 122 }, (_, index) => index + 129),
  ...Array.from({ length: 122 }, (_, index) => index + 254),
  ...Array.from({ length: 122 }, (_, index) => index + 379),
  ...Array.from({ length: 122 }, (_, index) => index + 504),
  ...Array.from({ length: 122 }, (_, index) => index + 629),
  ...Array.from({ length: 122 }, (_, index) => index + 754),
  ...Array.from({ length: 122 }, (_, index) => index + 879),
  ...Array.from({ length: 122 }, (_, index) => index + 1004),
  ...Array.from({ length: 122 }, (_, index) => index + 1129),
  ...Array.from({ length: 122 }, (_, index) => index + 1254),
  ...Array.from({ length: 122 }, (_, index) => index + 1379),
  ...Array.from({ length: 122 }, (_, index) => index + 1504),
  ...Array.from({ length: 122 }, (_, index) => index + 1629),
  ...Array.from({ length: 122 }, (_, index) => index + 1754),
  ...Array.from({ length: 122 }, (_, index) => index + 1879),
  ...Array.from({ length: 122 }, (_, index) => index + 2004),
  ...Array.from({ length: 122 }, (_, index) => index + 2129),
  ...Array.from({ length: 122 }, (_, index) => index + 2254),
  ...Array.from({ length: 122 }, (_, index) => index + 2379),
  ...Array.from({ length: 122 }, (_, index) => index + 2504),
  ...Array.from({ length: 122 }, (_, index) => index + 2629),
  ...Array.from({ length: 122 }, (_, index) => index + 2754),
  ...Array.from({ length: 122 }, (_, index) => index + 2879),
];

function weekNumberFromOrdinal(ordinal: number) {
  return Math.floor((ordinal - 1) / 125) + 1;
}

function positionFromOrdinal(ordinal: number) {
  return ((ordinal - 1) % 125) + 1;
}

function extensionId(track: Exclude<CourseSlug, "sql">, ordinal: number) {
  return getMasteryQuestionId(track, weekNumberFromOrdinal(ordinal), positionFromOrdinal(ordinal));
}

const pythonFamilies = [
  {
    topic: "list-dict transforms",
    title: "Normalize active customer emails",
    prompt: "Write `solve(rows)` to return active customer emails lowercased and sorted.",
    referenceSolution: `def solve(rows):
    return sorted(row["email"].strip().lower() for row in rows if row.get("active") and row.get("email"))`,
    negativeSubmission: `def solve(rows):
    return [row.get("email") for row in rows]`,
    visibleCases: (seed: number): PythonVisibleCase[] => [
      {
        description: "Filters active rows and lowercases emails.",
        input: [
          { email: `A${seed}@EXAMPLE.COM`, active: true },
          { email: `b${seed}@example.com`, active: false },
          { email: ` C${seed}@Example.com `, active: true },
        ],
        expected: [`a${seed}@example.com`, `c${seed}@example.com`],
      },
    ],
    hiddenCases: (seed: number): PythonVisibleCase[] => [
      {
        description: "Skips missing email values.",
        input: [{ email: null, active: true }, { email: `Z${seed}@EXAMPLE.COM`, active: true }],
        expected: [`z${seed}@example.com`],
      },
    ],
  },
  {
    topic: "aggregation",
    title: "Aggregate paid revenue by country",
    prompt: "Write `solve(rows)` to return a dictionary of paid revenue by country.",
    referenceSolution: `def solve(rows):
    totals = {}
    for row in rows:
        if row.get("status") == "paid":
            totals[row["country"]] = totals.get(row["country"], 0) + row.get("amount", 0)
    return totals`,
    negativeSubmission: `def solve(rows):
    return {row["country"]: row.get("amount", 0) for row in rows}`,
    visibleCases: (seed: number): PythonVisibleCase[] => [
      {
        description: "Sums only paid rows.",
        input: [
          { country: "US", status: "paid", amount: 100 + seed },
          { country: "US", status: "pending", amount: 50 },
          { country: "IN", status: "paid", amount: 30 },
        ],
        expected: { US: 100 + seed, IN: 30 },
      },
    ],
    hiddenCases: (): PythonVisibleCase[] => [
      {
        description: "Returns empty dictionary when no rows are paid.",
        input: [{ country: "US", status: "failed", amount: 10 }],
        expected: {},
      },
    ],
  },
  {
    topic: "joins",
    title: "Join orders to customers",
    prompt: "Write `solve(data)` to join `orders` to `customers` and return order id, customer name, and amount.",
    referenceSolution: `def solve(data):
    customers = {row["customer_id"]: row for row in data["customers"]}
    result = []
    for order in data["orders"]:
        customer = customers.get(order["customer_id"])
        if customer:
            result.append({"order_id": order["order_id"], "customer_name": customer["customer_name"], "amount": order["amount"]})
    return sorted(result, key=lambda row: row["order_id"])`,
    negativeSubmission: `def solve(data):
    return data["orders"]`,
    visibleCases: (seed: number): PythonVisibleCase[] => [
      {
        description: "Keeps joined rows only.",
        input: {
          customers: [{ customer_id: 1, customer_name: `Ava ${seed}` }],
          orders: [{ order_id: seed, customer_id: 1, amount: 75 }],
        },
        expected: [{ order_id: seed, customer_name: `Ava ${seed}`, amount: 75 }],
      },
    ],
    hiddenCases: (): PythonVisibleCase[] => [
      {
        description: "Drops orphan orders.",
        input: { customers: [], orders: [{ order_id: 1, customer_id: 9, amount: 10 }] },
        expected: [],
      },
    ],
  },
  {
    topic: "deduplication",
    title: "Keep latest record per key",
    prompt: "Write `solve(rows)` to keep the latest record per `id` by largest `updated_at`.",
    referenceSolution: `def solve(rows):
    latest = {}
    for row in rows:
        current = latest.get(row["id"])
        if current is None or row["updated_at"] > current["updated_at"]:
            latest[row["id"]] = row
    return sorted(latest.values(), key=lambda row: row["id"])`,
    negativeSubmission: `def solve(rows):
    return rows`,
    visibleCases: (seed: number): PythonVisibleCase[] => [
      {
        description: "Keeps the newest row for duplicate ids.",
        input: [
          { id: 1, updated_at: "2026-01-01", status: "old" },
          { id: 1, updated_at: "2026-01-02", status: `new-${seed}` },
          { id: 2, updated_at: "2026-01-01", status: "only" },
        ],
        expected: [
          { id: 1, updated_at: "2026-01-02", status: `new-${seed}` },
          { id: 2, updated_at: "2026-01-01", status: "only" },
        ],
      },
    ],
    hiddenCases: (): PythonVisibleCase[] => [
      { description: "Handles empty input.", input: [], expected: [] },
    ],
  },
  {
    topic: "data quality",
    title: "Find invalid records",
    prompt: "Write `solve(rows)` to return ids where amount is negative or required email is missing.",
    referenceSolution: `def solve(rows):
    bad = []
    for row in rows:
        if row.get("amount", 0) < 0 or not row.get("email"):
            bad.append(row["id"])
    return sorted(bad)`,
    negativeSubmission: `def solve(rows):
    return []`,
    visibleCases: (seed: number): PythonVisibleCase[] => [
      {
        description: "Finds negative amounts and missing email.",
        input: [
          { id: seed, amount: 10, email: "ok@example.com" },
          { id: seed + 1, amount: -1, email: "bad@example.com" },
          { id: seed + 2, amount: 5, email: "" },
        ],
        expected: [seed + 1, seed + 2],
      },
    ],
    hiddenCases: (): PythonVisibleCase[] => [
      { description: "Returns empty list when all records are valid.", input: [{ id: 1, amount: 1, email: "a" }], expected: [] },
    ],
  },
  {
    topic: "dates",
    title: "Filter recent events",
    prompt: "Write `solve(rows)` to return event ids on or after `2026-04-10`.",
    referenceSolution: `def solve(rows):
    return sorted(row["event_id"] for row in rows if row.get("event_date", "") >= "2026-04-10")`,
    negativeSubmission: `def solve(rows):
    return [row["event_id"] for row in rows]`,
    visibleCases: (seed: number): PythonVisibleCase[] => [
      {
        description: "Keeps only recent events.",
        input: [
          { event_id: seed, event_date: "2026-04-09" },
          { event_id: seed + 1, event_date: "2026-04-10" },
          { event_id: seed + 2, event_date: "2026-04-12" },
        ],
        expected: [seed + 1, seed + 2],
      },
    ],
    hiddenCases: (): PythonVisibleCase[] => [
      { description: "Handles no matches.", input: [{ event_id: 1, event_date: "2026-01-01" }], expected: [] },
    ],
  },
] as const;

const pysparkFamilies = [
  {
    topic: "select-filter",
    title: "Filter and select active customers",
    prompt: "Filter active customers and select `customer_id`, `customer_name`, and `country` into `result`.",
    referenceSolution: `result = customers_df.filter(F.col("is_active") == 1).select("customer_id", "customer_name", "country")`,
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "filter", anyOf: [".filter(", ".where("] },
      { label: "select", anyOf: [".select(", ".selectexpr("] },
    ],
    hiddenRequirements: [{ label: "active predicate", anyOf: ["is_active"] }],
    resultExpectation: "A DataFrame containing only active customers and the requested columns.",
  },
  {
    topic: "withColumn-case",
    title: "Create amount band",
    prompt: "Add an `amount_band` column with `high` for amount >= 200 and `standard` otherwise.",
    referenceSolution: `result = orders_df.withColumn("amount_band", F.when(F.col("amount") >= 200, "high").otherwise("standard"))`,
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "withColumn", anyOf: [".withcolumn("] },
      { label: "when", anyOf: ["f.when(", "when("] },
    ],
    hiddenRequirements: [{ label: "otherwise", anyOf: [".otherwise("] }],
    resultExpectation: "A DataFrame with the original rows and a deterministic amount band.",
  },
  {
    topic: "aggregation",
    title: "Aggregate revenue by status",
    prompt: "Group orders by `status` and return count plus total amount.",
    referenceSolution: `result = orders_df.groupBy("status").agg(F.count("*").alias("order_count"), F.sum("amount").alias("total_amount"))`,
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "groupBy", anyOf: [".groupby("] },
      { label: "agg", anyOf: [".agg("] },
    ],
    hiddenRequirements: [{ label: "alias", anyOf: [".alias("] }],
    resultExpectation: "A grouped DataFrame with status, order_count, and total_amount.",
  },
  {
    topic: "joins",
    title: "Join orders to customers",
    prompt: "Join orders to customers on `customer_id` and select order/customer fields.",
    referenceSolution: `result = orders_df.join(customers_df, "customer_id").select("order_id", "customer_name", "amount")`,
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "join", anyOf: [".join("] },
      { label: "select", anyOf: [".select(", ".selectexpr("] },
    ],
    hiddenRequirements: [{ label: "join key", anyOf: ["customer_id"] }],
    resultExpectation: "A joined DataFrame at order grain with customer attributes.",
  },
  {
    topic: "windows",
    title: "Rank orders per customer",
    prompt: "Use a window to add row numbers per customer ordered by amount descending.",
    referenceSolution: `w = Window.partitionBy("customer_id").orderBy(F.col("amount").desc())
result = orders_df.withColumn("rn", F.row_number().over(w))`,
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "window", anyOf: ["window.partitionby(", "partitionby("] },
      { label: "over", anyOf: [".over("] },
    ],
    hiddenRequirements: [{ label: "row_number", anyOf: ["row_number("] }],
    resultExpectation: "A DataFrame with a row number per customer ordered by amount.",
  },
  {
    topic: "date-null-dedup",
    title: "Deduplicate latest records",
    prompt: "Use row_number over `id` ordered by `updated_at` descending and keep the latest row.",
    referenceSolution: `w = Window.partitionBy("id").orderBy(F.col("updated_at").desc())
ranked = source_df.withColumn("rn", F.row_number().over(w))
result = ranked.filter(F.col("rn") == 1).drop("rn")`,
    requirements: [
      { label: "window", anyOf: ["window.partitionby(", "partitionby("] },
      { label: "row_number", anyOf: ["row_number("] },
      { label: "filter", anyOf: [".filter(", ".where("] },
    ],
    hiddenRequirements: [{ label: "drop helper column", anyOf: [".drop("] }],
    resultExpectation: "One latest row per id after deterministic deduplication.",
  },
] as const;

export const pythonExtensionQuestions: PythonExtensionQuestion[] = extensionOrdinals.map((ordinal, index) => {
  const family = pythonFamilies[index % pythonFamilies.length];
  const id = extensionId("python", ordinal);
  return {
    id,
    ordinal,
    track: "python",
    weekNumber: weekNumberFromOrdinal(ordinal),
    positionWithinWeek: positionFromOrdinal(ordinal),
    title: `${family.title} ${ordinal}`,
    prompt: family.prompt,
    topic: family.topic,
    functionName: "solve",
    starterCode: "def solve(data):\n    return data\n",
    referenceSolution: family.referenceSolution,
    visibleCases: family.visibleCases(ordinal),
    hiddenCases: family.hiddenCases(ordinal),
    uniqueLogicFingerprint: `python-extension-${ordinal}-${family.topic}-${family.title}`,
    negativeSubmission: family.negativeSubmission,
  };
});

export const pysparkExtensionQuestions: PysparkExtensionQuestion[] = extensionOrdinals.map((ordinal, index) => {
  const family = pysparkFamilies[index % pysparkFamilies.length];
  const id = extensionId("pyspark", ordinal);
  return {
    id,
    ordinal,
    track: "pyspark",
    weekNumber: weekNumberFromOrdinal(ordinal),
    positionWithinWeek: positionFromOrdinal(ordinal),
    title: `${family.title} ${ordinal}`,
    prompt: family.prompt,
    topic: family.topic,
    referenceSolution: family.referenceSolution,
    definition: {
      starterCode: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = df\n",
      prompt: family.prompt,
      requirements: family.requirements.map((item) => ({
        label: item.label,
        anyOf: [...item.anyOf],
      })),
      hiddenRequirements: family.hiddenRequirements.map((item) => ({
        label: item.label,
        anyOf: [...item.anyOf],
      })),
      forbiddenPatterns: ["toPandas(", ".collect("],
      referenceSolution: family.referenceSolution,
      resultExpectation: family.resultExpectation,
    },
    uniqueLogicFingerprint: `pyspark-extension-${ordinal}-${family.topic}-${family.title}`,
    negativeSubmission: "result = df",
  };
});

export function listMasteryExtensionQuestionIds(track: Exclude<CourseSlug, "sql">) {
  return (track === "python" ? pythonExtensionQuestions : pysparkExtensionQuestions).map((question) => question.id);
}
