import "server-only";

import { curriculumById } from "@/lib/adaptive/curriculum";
import { DIAGNOSTIC_NODE_IDS } from "@/lib/adaptive/diagnostic";
import type { Difficulty, GeneratedQuestion, Technology, TestCase } from "@/lib/adaptive/types";

const VARIATIONS_PER_COMPETENCY = 40;
const diagnosticDifficulties: Difficulty[] = [1, 1, 1, 1, 1, 2, 2, 2, 2, 3];

const domains = [
  { name: "orders", singular: "order", label: "customer order" },
  { name: "tickets", singular: "ticket", label: "support ticket" },
  { name: "shipments", singular: "shipment", label: "warehouse shipment" },
  { name: "invoices", singular: "invoice", label: "billing invoice" },
  { name: "jobs", singular: "job", label: "data pipeline job" },
  { name: "events", singular: "event", label: "application event" },
  { name: "products", singular: "product", label: "catalog product" },
  { name: "requests", singular: "request", label: "service request" },
] as const;

const styles = [
  { name: "baseline", instruction: "Return exactly the requested result." },
  { name: "audit", instruction: "Produce a deterministic result suitable for an audit." },
  { name: "quality-check", instruction: "Handle the supplied edge-case rows correctly." },
  { name: "reporting", instruction: "Build the requested reporting output with clear names." },
  { name: "operations", instruction: "Return the result needed by the operations team." },
] as const;

function baseQuestion(technology: Technology, nodeId: string, difficulty: Difficulty, variant: number) {
  const node = curriculumById.get(nodeId);
  if (!node) throw new Error(`Missing diagnostic curriculum node: ${nodeId}`);
  const domain = domains[variant % domains.length]!;
  const style = styles[Math.floor(variant / domains.length)]!;
  return { node, domain, style, difficulty, variant };
}

function sqlQuestion(nodeId: string, difficulty: Difficulty, variant: number): GeneratedQuestion {
  const { node, domain, style } = baseQuestion("sql", nodeId, difficulty, variant);
  const table = domain.name;
  const threshold = 40 + variant % 4 * 10;
  const limit = 2 + variant % 2;
  const commonSetup = `CREATE TABLE ${table}(record_id INTEGER, label TEXT, amount INTEGER, owner TEXT, group_id INTEGER, group_name TEXT, status TEXT); INSERT INTO ${table} VALUES (1,'Alpha',${threshold + 20},'Mina',1,'East','active'),(2,'Beta',${threshold - 10},NULL,1,'East','inactive'),(3,'Gamma',${threshold + 5},'Noah',2,'West','active'),(4,'Delta',${threshold + 30},NULL,2,'West','active');`;
  const definitions: Record<string, { title: string; prompt: string; solution: string; setup?: string; expected: string[] }> = {
    "sql-foundations-select": { title: `Select ${domain.label} columns`, prompt: `Return record_id and label from ${table}. Rename label to record_label.`, solution: `SELECT record_id, label AS record_label FROM ${table}`, expected: ["Returns record_id and record_label", "Includes every row"] },
    "sql-filtering-where": { title: `Filter ${domain.name} by amount`, prompt: `Return record_id and amount from ${table} where amount is at least ${threshold}.`, solution: `SELECT record_id, amount FROM ${table} WHERE amount >= ${threshold}`, expected: [`Keeps rows with amount greater than or equal to ${threshold}`, "Returns only record_id and amount"] },
    "sql-sorting-and-pagination-order-by": { title: `Rank the largest ${domain.name}`, prompt: `Return only record_id and amount for the ${limit} rows with the largest amount. Break ties by record_id ascending.`, solution: `SELECT record_id, amount FROM ${table} ORDER BY amount DESC, record_id ASC LIMIT ${limit}`, expected: ["Returns only record_id and amount", `Returns exactly ${limit} rows`, "Orders amount descending with a deterministic tie-breaker"] },
    "sql-null-handling-is-null": { title: `Find unassigned ${domain.name}`, prompt: `Return record_id and label for rows in ${table} whose owner is missing.`, solution: `SELECT record_id, label FROM ${table} WHERE owner IS NULL`, expected: ["Returns only rows with a NULL owner", "Does not replace missing values"] },
    "sql-conditional-logic-case": { title: `Classify ${domain.name} by amount`, prompt: `Return record_id and a tier that is 'high' when amount is at least ${threshold}, otherwise 'standard'.`, solution: `SELECT record_id, CASE WHEN amount >= ${threshold} THEN 'high' ELSE 'standard' END AS tier FROM ${table}`, expected: ["Returns one tier for every row", `Uses ${threshold} as the inclusive high-tier threshold`] },
    "sql-aggregation-group-by": { title: `Summarize ${domain.name} by group`, prompt: `Return group_name, row count as record_count, and total amount as total_amount for each group.`, solution: `SELECT group_name, COUNT(*) AS record_count, SUM(amount) AS total_amount FROM ${table} GROUP BY group_name`, expected: ["Returns one row per group_name", "Calculates count and total amount"] },
    "sql-joins-inner-join": { title: `Join ${domain.name} to groups`, prompt: `Return each record_id, label, and matching group_name. Exclude rows without a matching group.`, setup: `CREATE TABLE ${table}(record_id INTEGER, label TEXT, group_id INTEGER); INSERT INTO ${table} VALUES (1,'Alpha',1),(2,'Beta',1),(3,'Gamma',2),(4,'Orphan',99); CREATE TABLE ${table}_groups(group_id INTEGER, group_name TEXT); INSERT INTO ${table}_groups VALUES (1,'East'),(2,'West');`, solution: `SELECT r.record_id, r.label, g.group_name FROM ${table} r INNER JOIN ${table}_groups g ON r.group_id = g.group_id`, expected: ["Uses an INNER JOIN on group_id", "Excludes records without a matching group"] },
    "sql-common-table-expressions-basic-cte": { title: `Stage high-value ${domain.name}`, prompt: `Use a CTE named filtered_records to keep rows with amount at least ${threshold}, then return record_id and amount ordered by record_id.`, solution: `WITH filtered_records AS (SELECT record_id, amount FROM ${table} WHERE amount >= ${threshold}) SELECT record_id, amount FROM filtered_records ORDER BY record_id`, expected: ["Defines and reads from filtered_records", "Returns qualifying rows in record_id order"] },
    "sql-window-fundamentals-over": { title: `Show each ${domain.singular}'s group size`, prompt: `Return record_id, group_name, and the number of rows in that group as group_count without collapsing individual rows.`, solution: `SELECT record_id, group_name, COUNT(*) OVER (PARTITION BY group_name) AS group_count FROM ${table}`, expected: ["Preserves one output row per input row", "Uses OVER with PARTITION BY group_name"] },
    "sql-aggregation-conditional-aggregation": { title: `Count active ${domain.name} by group`, prompt: `Return each group_name and the number of active rows as active_count using conditional aggregation.`, solution: `SELECT group_name, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_count FROM ${table} GROUP BY group_name`, expected: ["Returns one row per group_name", "Counts only active rows"] },
  };
  const definition = definitions[nodeId]!;
  return {
    id: `bank-${nodeId}-${variant + 1}`,
    technology: "sql",
    curriculumNodeId: node.id,
    topic: node.topic,
    subtopic: node.subtopic,
    difficulty,
    exerciseMode: "write_from_scratch",
    prerequisiteIds: [...node.prerequisites],
    diagnosticQuestion: true,
    learnerInstructions: `${style.instruction} Write the complete query from scratch.`,
    title: definition.title,
    scenario: `${style.name} ${domain.label} workflow`,
    prompt: definition.prompt,
    schema: { [table]: nodeId.includes("inner-join") ? ["record_id", "label", "group_id"] : ["record_id", "label", "amount", "owner", "group_id", "group_name", "status"] },
    sampleData: [{ record_id: 1, label: "Alpha", amount: threshold + 20, owner: "Mina", group_id: 1, group_name: "East", status: "active" }],
    expectedBehavior: definition.expected,
    hiddenTests: [{ description: "Hidden fixture rows and edge cases" }],
    referenceSolution: definition.solution,
    starterCode: "-- Write your query here",
    rubric: ["Correct columns", "Correct rows", "Correct handling of edge cases"],
    skillDimensions: [...node.skillDimensions],
    fingerprint: { technology: "sql", topic: node.topic, subtopic: node.subtopic, pattern: `${style.name} ${domain.singular} ${node.subtopic} variant ${variant + 1}`, scenario: `${domain.name} ${style.name} batch ${variant + 1}`, difficulty, skills: [...node.skillDimensions], schemaSignature: `${table}-${style.name}-${variant + 1}` },
    runtime: { setupSql: definition.setup ?? commonSetup },
  };
}

function pythonQuestion(nodeId: string, difficulty: Difficulty, variant: number): GeneratedQuestion {
  const { node, domain, style } = baseQuestion("python", nodeId, difficulty, variant);
  const definitions: Record<string, { functionName: string; title: string; prompt: string; solution: string; tests: TestCase[] }> = {
    "python-foundations-variables": { functionName: "double_value", title: "Transform a numeric value", prompt: "Write double_value(value) and return value multiplied by two.", solution: "def double_value(value):\n    result = value * 2\n    return result", tests: [{ description: "positive", input: 7, expected: 14 }, { description: "zero", input: 0, expected: 0 }, { description: "negative", input: -4, expected: -8 }] },
    "python-foundations-conditions": { functionName: "classify_number", title: "Classify a number", prompt: "Write classify_number(value). Return 'positive', 'negative', or 'zero'.", solution: "def classify_number(value):\n    if value > 0:\n        return 'positive'\n    if value < 0:\n        return 'negative'\n    return 'zero'", tests: [{ description: "positive", input: 3, expected: "positive" }, { description: "negative", input: -1, expected: "negative" }, { description: "zero", input: 0, expected: "zero" }] },
    "python-foundations-loops": { functionName: "sum_to", title: "Accumulate values with a loop", prompt: "Write sum_to(limit) and return the sum of all integers from 1 through limit. Return 0 when limit is 0.", solution: "def sum_to(limit):\n    total = 0\n    for value in range(1, limit + 1):\n        total += value\n    return total", tests: [{ description: "five", input: 5, expected: 15 }, { description: "one", input: 1, expected: 1 }, { description: "zero", input: 0, expected: 0 }] },
    "python-collections-lists": { functionName: "unique_sorted", title: "Clean a list", prompt: "Write unique_sorted(values) and return a sorted list with duplicate values removed.", solution: "def unique_sorted(values):\n    return sorted(set(values))", tests: [{ description: "duplicates", input: [3, 1, 3, 2], expected: [1, 2, 3] }, { description: "empty", input: [], expected: [] }, { description: "already unique", input: [2, 1], expected: [1, 2] }] },
    "python-collections-dictionaries": { functionName: "count_values", title: "Build a frequency dictionary", prompt: "Write count_values(values) and return a dictionary containing the frequency of every value.", solution: "def count_values(values):\n    counts = {}\n    for value in values:\n        counts[value] = counts.get(value, 0) + 1\n    return counts", tests: [{ description: "repeated", input: ["a", "b", "a"], expected: { a: 2, b: 1 } }, { description: "empty", input: [], expected: {} }, { description: "one", input: ["x"], expected: { x: 1 } }] },
    "python-strings-slicing": { functionName: "reverse_text", title: "Reverse text with slicing", prompt: "Write reverse_text(text) and return the characters in reverse order.", solution: "def reverse_text(text):\n    return text[::-1]", tests: [{ description: "word", input: "pipeline", expected: "enilepip" }, { description: "empty", input: "", expected: "" }, { description: "single", input: "x", expected: "x" }] },
    "python-functions-parameters": { functionName: "scale_values", title: "Use function parameters", prompt: "Write scale_values(payload). payload contains values and factor. Return a new list where each value is multiplied by factor.", solution: "def scale_values(payload):\n    values = payload['values']\n    factor = payload['factor']\n    return [value * factor for value in values]", tests: [{ description: "scale up", input: { values: [1, 2, 3], factor: 3 }, expected: [3, 6, 9] }, { description: "empty", input: { values: [], factor: 5 }, expected: [] }, { description: "negative factor", input: { values: [2, -1], factor: -2 }, expected: [-4, 2] }] },
    "python-exceptions-try": { functionName: "safe_integer", title: "Handle invalid integer input", prompt: "Write safe_integer(value). Return int(value), or None when conversion raises ValueError or TypeError.", solution: "def safe_integer(value):\n    try:\n        return int(value)\n    except (ValueError, TypeError):\n        return None", tests: [{ description: "numeric text", input: "42", expected: 42 }, { description: "invalid text", input: "nope", expected: null }, { description: "none", input: null, expected: null }] },
    "python-comprehensions-list-comprehensions": { functionName: "positive_squares", title: "Filter and transform with a comprehension", prompt: "Write positive_squares(values) and return the square of each positive number, preserving input order.", solution: "def positive_squares(values):\n    return [value * value for value in values if value > 0]", tests: [{ description: "mixed", input: [-2, 0, 3, 4], expected: [9, 16] }, { description: "none positive", input: [-1, 0], expected: [] }, { description: "all positive", input: [1, 2], expected: [1, 4] }] },
    "python-data-engineering-etl": { functionName: "active_totals", title: "Transform a batch of records", prompt: "Write active_totals(rows). Keep active rows and return a dictionary mapping each group to its summed amount.", solution: "def active_totals(rows):\n    totals = {}\n    for row in rows:\n        if row.get('status') == 'active':\n            group = row.get('group')\n            totals[group] = totals.get(group, 0) + row.get('amount', 0)\n    return totals", tests: [{ description: "mixed statuses", input: [{ group: "a", amount: 2, status: "active" }, { group: "a", amount: 5, status: "inactive" }, { group: "b", amount: 3, status: "active" }], expected: { a: 2, b: 3 } }, { description: "empty", input: [], expected: {} }, { description: "same group", input: [{ group: "x", amount: 2, status: "active" }, { group: "x", amount: 4, status: "active" }], expected: { x: 6 } }] },
  };
  const definition = definitions[nodeId]!;
  return {
    id: `bank-${nodeId}-${variant + 1}`,
    technology: "python",
    curriculumNodeId: node.id,
    topic: node.topic,
    subtopic: node.subtopic,
    difficulty,
    exerciseMode: "write_from_scratch",
    prerequisiteIds: [...node.prerequisites],
    diagnosticQuestion: true,
    learnerInstructions: `${style.instruction} Write the complete function body yourself.`,
    title: `${definition.title} · ${domain.name}`,
    scenario: `${style.name} ${domain.label} utility`,
    prompt: definition.prompt,
    schema: { input: "JSON-safe function argument", output: "JSON-safe return value" },
    sampleData: { input: definition.tests[0]!.input, expected: definition.tests[0]!.expected },
    expectedBehavior: definition.tests.map((test) => test.description),
    hiddenTests: definition.tests,
    referenceSolution: definition.solution,
    starterCode: `def ${definition.functionName}(input_value):\n    pass`.replace("input_value", definition.solution.match(/def\s+\w+\(([^)]*)\)/u)?.[1] ?? "input_value"),
    rubric: ["Correct return value", "Handles empty and boundary inputs", "Uses clear Python"],
    skillDimensions: [...node.skillDimensions],
    fingerprint: { technology: "python", topic: node.topic, subtopic: node.subtopic, pattern: `${style.name} ${domain.singular} ${node.subtopic} variant ${variant + 1}`, scenario: `${domain.name} ${style.name} utility ${variant + 1}`, difficulty, skills: [...node.skillDimensions], schemaSignature: `${definition.functionName}-${style.name}-${variant + 1}` },
    runtime: { functionName: definition.functionName, visibleTests: [definition.tests[0]!] },
  };
}

function pysparkQuestion(nodeId: string, difficulty: Difficulty, variant: number): GeneratedQuestion {
  const { node, domain, style } = baseQuestion("pyspark", nodeId, difficulty, variant);
  const definitions: Record<string, { title: string; prompt: string; solution: string; expected: string[] }> = {
    "pyspark-dataframe-creation-lists": { title: "Create a DataFrame from rows", prompt: "Create result_df from rows using columns record_id, label, and amount.", solution: "result_df = spark.createDataFrame(rows, ['record_id', 'label', 'amount'])", expected: ["Creates a DataFrame from rows", "Uses the requested column names"] },
    "pyspark-selection-and-expressions-select": { title: "Select and alias columns", prompt: "From input_df, select record_id and rename label to record_label in result_df.", solution: "result_df = input_df.select('record_id', F.col('label').alias('record_label'))", expected: ["Selects only two columns", "Aliases label as record_label"] },
    "pyspark-filtering-filter": { title: "Filter rows by amount", prompt: "Set result_df to rows from input_df whose amount is at least 50.", solution: "result_df = input_df.filter(F.col('amount') >= 50)", expected: ["Uses a native filter expression", "Keeps the complete qualifying rows"] },
    "pyspark-column-transformations-withcolumn": { title: "Add a derived amount column", prompt: "Set result_df to input_df with amount_with_tax equal to amount multiplied by 1.1.", solution: "result_df = input_df.withColumn('amount_with_tax', F.col('amount') * F.lit(1.1))", expected: ["Uses withColumn", "Preserves existing columns"] },
    "pyspark-null-handling-isnull": { title: "Find rows with a missing owner", prompt: "Set result_df to rows from input_df where owner is null.", solution: "result_df = input_df.filter(F.col('owner').isNull())", expected: ["Uses a native null predicate", "Keeps only null-owner rows"] },
    "pyspark-string-functions-concat": { title: "Build a display label", prompt: "Set result_df to input_df with display_label formed by concatenating label, a dash, and status.", solution: "result_df = input_df.withColumn('display_label', F.concat(F.col('label'), F.lit('-'), F.col('status')))", expected: ["Uses concat with a literal separator", "Adds display_label"] },
    "pyspark-aggregations-groupby": { title: "Aggregate each group", prompt: "Set result_df to one row per group_name with record_count and total_amount.", solution: "result_df = input_df.groupBy('group_name').agg(F.count('*').alias('record_count'), F.sum('amount').alias('total_amount'))", expected: ["Groups by group_name", "Calculates count and total amount"] },
    "pyspark-joins-inner-join": { title: "Join records to groups", prompt: "Inner join records_df to groups_df on group_id and assign the result to result_df.", solution: "result_df = records_df.join(groups_df, on='group_id', how='inner')", expected: ["Uses an inner join", "Joins on group_id"] },
    "pyspark-window-functions-window": { title: "Count rows in each window partition", prompt: "Add group_count to input_df using a Window partitioned by group_name, then assign it to result_df.", solution: "window_spec = Window.partitionBy('group_name')\nresult_df = input_df.withColumn('group_count', F.count('*').over(window_spec))", expected: ["Defines a Window partition", "Preserves individual rows"] },
    "pyspark-column-transformations-expressions": { title: "Build an intermediate transformation", prompt: "Filter input_df to active rows, add doubled_amount equal to amount times two, and select record_id, group_name, and doubled_amount into result_df.", solution: "result_df = input_df.filter(F.col('status') == 'active').withColumn('doubled_amount', F.col('amount') * 2).select('record_id', 'group_name', 'doubled_amount')", expected: ["Filters active rows", "Adds doubled_amount", "Selects the requested output columns"] },
  };
  const definition = definitions[nodeId]!;
  return {
    id: `bank-${nodeId}-${variant + 1}`,
    technology: "pyspark",
    curriculumNodeId: node.id,
    topic: node.topic,
    subtopic: node.subtopic,
    difficulty,
    exerciseMode: "write_from_scratch",
    prerequisiteIds: [...node.prerequisites],
    diagnosticQuestion: true,
    learnerInstructions: `${style.instruction} Use native PySpark DataFrame APIs and assign the final DataFrame to result_df.`,
    title: `${definition.title} · ${domain.name}`,
    scenario: `${style.name} ${domain.label} DataFrame`,
    prompt: definition.prompt,
    schema: { input_df: ["record_id", "label", "amount", "owner", "group_id", "group_name", "status"] },
    sampleData: [{ record_id: 1, label: "Alpha", amount: 60, owner: "Mina", group_id: 1, group_name: "East", status: "active" }],
    expectedBehavior: definition.expected,
    hiddenTests: [{ description: "Structural validation against required native APIs" }],
    referenceSolution: definition.solution,
    starterCode: "# Write your transformation here\nresult_df = None",
    rubric: ["Uses native DataFrame operations", "Assigns result_df", "Avoids driver-side collection"],
    skillDimensions: [...node.skillDimensions],
    fingerprint: { technology: "pyspark", topic: node.topic, subtopic: node.subtopic, pattern: `${style.name} ${domain.singular} ${node.subtopic} variant ${variant + 1}`, scenario: `${domain.name} ${style.name} dataframe ${variant + 1}`, difficulty, skills: [...node.skillDimensions], schemaSignature: `input-df-${style.name}-${variant + 1}` },
    runtime: {},
  };
}

function buildBank() {
  const bank = new Map<string, GeneratedQuestion[]>();
  for (const technology of ["sql", "python", "pyspark"] as const) {
    DIAGNOSTIC_NODE_IDS[technology].forEach((nodeId, diagnosticIndex) => {
      const difficulty = diagnosticDifficulties[diagnosticIndex]!;
      const questions = Array.from({ length: VARIATIONS_PER_COMPETENCY }, (_, variant) => technology === "sql" ? sqlQuestion(nodeId, difficulty, variant) : technology === "python" ? pythonQuestion(nodeId, difficulty, variant) : pysparkQuestion(nodeId, difficulty, variant));
      bank.set(nodeId, questions);
    });
  }
  return bank;
}

export const diagnosticQuestionBank = buildBank();
export const diagnosticBankSize = [...diagnosticQuestionBank.values()].reduce((total, questions) => total + questions.length, 0);
export const diagnosticVariationsPerCompetency = VARIATIONS_PER_COMPETENCY;
