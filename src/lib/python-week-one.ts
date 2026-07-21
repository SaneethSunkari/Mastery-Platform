/* eslint-disable @typescript-eslint/no-explicit-any */
import { LessonSeed } from "@/lib/types";

export interface PythonWeekOneCase {
  description: string;
  input: unknown;
  expected: unknown;
}

export interface PythonWeekOneExerciseSeed {
  title: string;
  summary: string;
  tags: string[];
  topic: string;
  difficulty: "easy" | "medium";
  questionType:
    | "write-code"
    | "predict-output"
    | "complete-code"
    | "repair-code"
    | "edge-case"
    | "refactor";
  prompt: string;
  starterCode: string;
  referenceSolution: string;
  visibleCases: PythonWeekOneCase[];
  hiddenCases: PythonWeekOneCase[];
}

type RuntimeQuestionConfig = Omit<
  PythonWeekOneExerciseSeed,
  "visibleCases" | "hiddenCases" | "referenceSolution"
> & {
  visibleInput: unknown;
  hiddenInputs: Array<{ description: string; input: unknown }>;
  visibleDescription: string;
  solver: (input: any) => unknown;
  referenceSolution: string;
};

function buildRuntimeQuestion(config: RuntimeQuestionConfig): PythonWeekOneExerciseSeed {
  return {
    title: config.title,
    summary: config.summary,
    tags: config.tags,
    topic: config.topic,
    difficulty: config.difficulty,
    questionType: config.questionType,
    prompt: config.prompt,
    starterCode: config.starterCode,
    referenceSolution: config.referenceSolution,
    visibleCases: [
      {
        description: config.visibleDescription,
        input: config.visibleInput,
        expected: config.solver(config.visibleInput),
      },
    ],
    hiddenCases: config.hiddenInputs.map((item) => ({
      description: item.description,
      input: item.input,
      expected: config.solver(item.input),
    })),
  };
}

const defaultStarter = "def solve(data):\n    # return the requested result\n    return None\n";

const foundations: PythonWeekOneExerciseSeed[] = [
  buildRuntimeQuestion({
    title: "How Python Evaluates Code",
    summary: "Trace assignment and expression order through a tiny pipeline-style calculation.",
    tags: ["foundations", "variables"],
    topic: "variables",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return the final number after starting from `data['base']`, adding `data['increment']` twice, and then subtracting `data['offset']` once.",
    starterCode: "def solve(data):\n    total = data['base']\n    # finish the reassignment flow\n    return None\n",
    referenceSolution:
      "def solve(data):\n    total = data['base']\n    total = total + data['increment']\n    total = total + data['increment']\n    total = total - data['offset']\n    return total\n",
    visibleInput: { base: 10, increment: 3, offset: 4 },
    visibleDescription: "Tracks multiple reassignments in order.",
    hiddenInputs: [
      { description: "Keeps subtraction at the end.", input: { base: 6, increment: 5, offset: 2 } },
      { description: "Works with zero offset.", input: { base: 1, increment: 2, offset: 0 } },
    ],
    solver: (data) => data.base + data.increment + data.increment - data.offset,
  }),
  buildRuntimeQuestion({
    title: "Basic I/O with Discipline",
    summary: "Return a formatted business message instead of mixing raw types carelessly.",
    tags: ["io", "strings"],
    topic: "strings",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return the string `\"batch=<batch_id> rows=<row_count>\"` using `data['batch_id']` and `data['row_count']`.",
    starterCode: "def solve(data):\n    batch_id = data['batch_id']\n    row_count = data['row_count']\n    return None\n",
    referenceSolution:
      "def solve(data):\n    return f\"batch={data['batch_id']} rows={data['row_count']}\"\n",
    visibleInput: { batch_id: "b-17", row_count: 42 },
    visibleDescription: "Formats both fields into one output string.",
    hiddenInputs: [
      { description: "Works for a zero row count.", input: { batch_id: "empty", row_count: 0 } },
      { description: "Keeps the incoming batch id text.", input: { batch_id: "daily-9", row_count: 7 } },
    ],
    solver: (data) => `batch=${data.batch_id} rows=${data.row_count}`,
  }),
  buildRuntimeQuestion({
    title: "Readable First Programs",
    summary: "Build a clean output label from separate pieces of state.",
    tags: ["style", "foundations"],
    topic: "assignment",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `\"<source_name>:<status>\"` using `data['source_name']` and `data['status']`.",
    starterCode: "def solve(data):\n    source_name = data['source_name']\n    status = data['status']\n    return None\n",
    referenceSolution:
      "def solve(data):\n    return f\"{data['source_name']}:{data['status']}\"\n",
    visibleInput: { source_name: "orders_api", status: "ready" },
    visibleDescription: "Combines two readable string parts.",
    hiddenInputs: [
      { description: "Keeps warning statuses unchanged.", input: { source_name: "shipments", status: "late" } },
      { description: "Supports short source names.", input: { source_name: "crm", status: "ok" } },
    ],
    solver: (data) => `${data.source_name}:${data.status}`,
  }),
  buildRuntimeQuestion({
    title: "Variables: keep the last assignment",
    summary: "Practice that a later assignment replaces the earlier value.",
    tags: ["variables", "integers"],
    topic: "variables",
    difficulty: "easy",
    questionType: "predict-output",
    prompt:
      "Write `solve(data)` and return the last assigned value after setting `rows = data['rows']`, then `rows = rows + data['extra']`, then `rows = rows - data['dropped']`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    rows = data['rows']\n    rows = rows + data['extra']\n    rows = rows - data['dropped']\n    return rows\n",
    visibleInput: { rows: 20, extra: 5, dropped: 3 },
    visibleDescription: "Tracks the final integer after two updates.",
    hiddenInputs: [
      { description: "Works when nothing is dropped.", input: { rows: 9, extra: 4, dropped: 0 } },
      { description: "Handles small totals.", input: { rows: 3, extra: 1, dropped: 2 } },
    ],
    solver: (data) => data.rows + data.extra - data.dropped,
  }),
  buildRuntimeQuestion({
    title: "Integers: add row counts",
    summary: "Combine two integer counters cleanly.",
    tags: ["integers", "arithmetic"],
    topic: "integers",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return the sum of `data['good_rows']` and `data['fixed_rows']`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['good_rows'] + data['fixed_rows']\n",
    visibleInput: { good_rows: 80, fixed_rows: 12 },
    visibleDescription: "Adds two integer counters.",
    hiddenInputs: [
      { description: "Works when fixed rows are zero.", input: { good_rows: 11, fixed_rows: 0 } },
      { description: "Handles larger batches.", input: { good_rows: 240, fixed_rows: 30 } },
    ],
    solver: (data) => data.good_rows + data.fixed_rows,
  }),
  buildRuntimeQuestion({
    title: "Floats: compute an average size",
    summary: "Use float division instead of guessing at the result type.",
    tags: ["floats", "division"],
    topic: "floats",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return the average file size as `total_size / file_count` using float division.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['total_size'] / data['file_count']\n",
    visibleInput: { total_size: 12.0, file_count: 3 },
    visibleDescription: "Returns a float average.",
    hiddenInputs: [
      { description: "Keeps decimal precision.", input: { total_size: 7.5, file_count: 2 } },
      { description: "Works for whole-number totals too.", input: { total_size: 9.0, file_count: 4 } },
    ],
    solver: (data) => data.total_size / data.file_count,
  }),
  buildRuntimeQuestion({
    title: "Strings: join two table names",
    summary: "Build a readable label from two string fields.",
    tags: ["strings", "concatenation"],
    topic: "strings",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `\"<left_table>-><right_table>\"` using the incoming string fields.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['left_table'] + '->' + data['right_table']\n",
    visibleInput: { left_table: "customers", right_table: "orders" },
    visibleDescription: "Connects two table names into one label.",
    hiddenInputs: [
      { description: "Works for staging tables.", input: { left_table: "staging_orders", right_table: "payments" } },
      { description: "Keeps exact casing.", input: { left_table: "CRM", right_table: "events" } },
    ],
    solver: (data) => `${data.left_table}->${data.right_table}`,
  }),
  buildRuntimeQuestion({
    title: "Booleans: invert a flag",
    summary: "Return the opposite boolean value cleanly.",
    tags: ["booleans", "not"],
    topic: "booleans",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return the opposite of `data['is_valid']`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return not data['is_valid']\n",
    visibleInput: { is_valid: true },
    visibleDescription: "Flips a true flag to false.",
    hiddenInputs: [
      { description: "Flips false back to true.", input: { is_valid: false } },
      { description: "Keeps boolean output type.", input: { is_valid: true } },
    ],
    solver: (data) => !data.is_valid,
  }),
  buildRuntimeQuestion({
    title: "None: use a fallback owner",
    summary: "Handle an optional field without dropping the record.",
    tags: ["none", "fallback"],
    topic: "none",
    difficulty: "easy",
    questionType: "edge-case",
    prompt:
      "Write `solve(data)` and return `data['owner']` when it is not `None`; otherwise return `'unassigned'`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['owner'] if data['owner'] is not None else 'unassigned'\n",
    visibleInput: { owner: null },
    visibleDescription: "Uses a fallback when owner is missing.",
    hiddenInputs: [
      { description: "Keeps a real owner name.", input: { owner: "nina" } },
      { description: "Handles short names.", input: { owner: "li" } },
    ],
    solver: (data) => (data.owner === null ? "unassigned" : data.owner),
  }),
  buildRuntimeQuestion({
    title: "Variables: subtract after reassignment",
    summary: "Track the value through both addition and subtraction steps.",
    tags: ["variables", "integers"],
    topic: "assignment",
    difficulty: "easy",
    questionType: "predict-output",
    prompt:
      "Write `solve(data)` and return the final `remaining` value after adding `loaded_rows` and subtracting `bad_rows`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    remaining = data['starting_rows']\n    remaining = remaining + data['loaded_rows']\n    remaining = remaining - data['bad_rows']\n    return remaining\n",
    visibleInput: { starting_rows: 100, loaded_rows: 40, bad_rows: 7 },
    visibleDescription: "Tracks a final remaining count.",
    hiddenInputs: [
      { description: "Works for no bad rows.", input: { starting_rows: 10, loaded_rows: 5, bad_rows: 0 } },
      { description: "Handles small counts.", input: { starting_rows: 4, loaded_rows: 2, bad_rows: 3 } },
    ],
    solver: (data) => data.starting_rows + data.loaded_rows - data.bad_rows,
  }),
  buildRuntimeQuestion({
    title: "Floats: seconds to minutes",
    summary: "Convert one numeric unit into another.",
    tags: ["floats", "conversion"],
    topic: "floats",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return `data['seconds'] / 60`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['seconds'] / 60\n",
    visibleInput: { seconds: 150.0 },
    visibleDescription: "Converts seconds into minutes.",
    hiddenInputs: [
      { description: "Works for a full hour.", input: { seconds: 3600.0 } },
      { description: "Keeps fractional minutes.", input: { seconds: 45.0 } },
    ],
    solver: (data) => data.seconds / 60,
  }),
  buildRuntimeQuestion({
    title: "Strings: build a padded status",
    summary: "Repeat a marker around a status string.",
    tags: ["strings", "operators"],
    topic: "strings",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `\"[\" + status + \"]\"` using `data['status']`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return '[' + data['status'] + ']'\n",
    visibleInput: { status: "ready" },
    visibleDescription: "Wraps the status in brackets.",
    hiddenInputs: [
      { description: "Works for retry labels.", input: { status: "retry" } },
      { description: "Keeps short statuses readable.", input: { status: "ok" } },
    ],
    solver: (data) => `[${data.status}]`,
  }),
  buildRuntimeQuestion({
    title: "Booleans: combine two checks",
    summary: "Return true only when both pipeline checks passed.",
    tags: ["booleans", "and"],
    topic: "booleans",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `True` only when both `data['schema_ok']` and `data['row_count_ok']` are true.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['schema_ok'] and data['row_count_ok']\n",
    visibleInput: { schema_ok: true, row_count_ok: false },
    visibleDescription: "Returns false when only one check passes.",
    hiddenInputs: [
      { description: "Returns true when both checks pass.", input: { schema_ok: true, row_count_ok: true } },
      { description: "Returns false when both fail.", input: { schema_ok: false, row_count_ok: false } },
    ],
    solver: (data) => data.schema_ok && data.row_count_ok,
  }),
  buildRuntimeQuestion({
    title: "None: choose the source name",
    summary: "Return a fallback label when the optional source is missing.",
    tags: ["none", "strings"],
    topic: "none",
    difficulty: "easy",
    questionType: "edge-case",
    prompt:
      "Write `solve(data)` and return `data['source_name']` when present; otherwise return `'unknown_source'`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['source_name'] if data['source_name'] is not None else 'unknown_source'\n",
    visibleInput: { source_name: null },
    visibleDescription: "Uses the fallback label for missing sources.",
    hiddenInputs: [
      { description: "Keeps a source name that exists.", input: { source_name: "billing_api" } },
      { description: "Supports short values.", input: { source_name: "crm" } },
    ],
    solver: (data) => (data.source_name === null ? "unknown_source" : data.source_name),
  }),
  buildRuntimeQuestion({
    title: "Mixed scalars: create a pipeline code",
    summary: "Combine string and integer pieces into one readable label.",
    tags: ["strings", "integers", "variables"],
    topic: "assignment",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `\"<pipeline>-<run_id>\"` using `data['pipeline']` and `data['run_id']`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return f\"{data['pipeline']}-{data['run_id']}\"\n",
    visibleInput: { pipeline: "orders", run_id: 19 },
    visibleDescription: "Builds one final code string.",
    hiddenInputs: [
      { description: "Keeps another pipeline name.", input: { pipeline: "events", run_id: 4 } },
      { description: "Supports larger ids.", input: { pipeline: "shipments", run_id: 120 } },
    ],
    solver: (data) => `${data.pipeline}-${data.run_id}`,
  }),
];

const arithmeticAndComparisons: PythonWeekOneExerciseSeed[] = [
  buildRuntimeQuestion({
    title: "Arithmetic: add failed and retried rows",
    summary: "Combine two counts into one total issue count.",
    tags: ["arithmetic", "operators"],
    topic: "arithmetic",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return `failed_rows + retried_rows`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['failed_rows'] + data['retried_rows']\n",
    visibleInput: { failed_rows: 7, retried_rows: 4 },
    visibleDescription: "Adds two row-count fields.",
    hiddenInputs: [
      { description: "Handles zero failed rows.", input: { failed_rows: 0, retried_rows: 6 } },
      { description: "Handles larger totals.", input: { failed_rows: 15, retried_rows: 5 } },
    ],
    solver: (data) => data.failed_rows + data.retried_rows,
  }),
  buildRuntimeQuestion({
    title: "Arithmetic: subtract bad rows from total rows",
    summary: "Compute a cleaned row count with one subtraction.",
    tags: ["arithmetic", "operators"],
    topic: "arithmetic",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return `total_rows - bad_rows`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['total_rows'] - data['bad_rows']\n",
    visibleInput: { total_rows: 44, bad_rows: 9 },
    visibleDescription: "Returns the cleaned row count.",
    hiddenInputs: [
      { description: "Handles no bad rows.", input: { total_rows: 10, bad_rows: 0 } },
      { description: "Handles small totals.", input: { total_rows: 5, bad_rows: 2 } },
    ],
    solver: (data) => data.total_rows - data.bad_rows,
  }),
  buildRuntimeQuestion({
    title: "Arithmetic: multiply files by block size",
    summary: "Use multiplication to estimate bytes processed.",
    tags: ["arithmetic", "operators"],
    topic: "arithmetic",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return `file_count * block_size`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['file_count'] * data['block_size']\n",
    visibleInput: { file_count: 5, block_size: 16 },
    visibleDescription: "Multiplies two numeric fields.",
    hiddenInputs: [
      { description: "Handles a single file.", input: { file_count: 1, block_size: 32 } },
      { description: "Handles zero files.", input: { file_count: 0, block_size: 12 } },
    ],
    solver: (data) => data.file_count * data.block_size,
  }),
  buildRuntimeQuestion({
    title: "Arithmetic: divide a batch into shards",
    summary: "Use integer-friendly division inputs to compute rows per shard.",
    tags: ["division", "floats"],
    topic: "arithmetic",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return `row_count / shard_count`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['row_count'] / data['shard_count']\n",
    visibleInput: { row_count: 120, shard_count: 6 },
    visibleDescription: "Returns rows per shard.",
    hiddenInputs: [
      { description: "Handles uneven division.", input: { row_count: 25, shard_count: 2 } },
      { description: "Handles small batches.", input: { row_count: 9, shard_count: 3 } },
    ],
    solver: (data) => data.row_count / data.shard_count,
  }),
  buildRuntimeQuestion({
    title: "Comparison: check if a batch is large",
    summary: "Return a boolean comparison result directly.",
    tags: ["comparison", "booleans"],
    topic: "comparison",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return whether `row_count > threshold`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['row_count'] > data['threshold']\n",
    visibleInput: { row_count: 51, threshold: 50 },
    visibleDescription: "Returns true when the batch exceeds the threshold.",
    hiddenInputs: [
      { description: "Returns false at the exact threshold.", input: { row_count: 10, threshold: 10 } },
      { description: "Returns false below threshold.", input: { row_count: 3, threshold: 9 } },
    ],
    solver: (data) => data.row_count > data.threshold,
  }),
  buildRuntimeQuestion({
    title: "Comparison: check if a watermark is current",
    summary: "Use greater-than-or-equal for a boundary check.",
    tags: ["comparison", "boundaries"],
    topic: "comparison",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return whether `loaded_version >= expected_version`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['loaded_version'] >= data['expected_version']\n",
    visibleInput: { loaded_version: 8, expected_version: 8 },
    visibleDescription: "Returns true when the version meets the boundary.",
    hiddenInputs: [
      { description: "Returns true when the loaded version is newer.", input: { loaded_version: 9, expected_version: 8 } },
      { description: "Returns false when the loaded version is older.", input: { loaded_version: 7, expected_version: 8 } },
    ],
    solver: (data) => data.loaded_version >= data.expected_version,
  }),
  buildRuntimeQuestion({
    title: "Boolean expressions: both checks must pass",
    summary: "Combine two comparisons in one explicit expression.",
    tags: ["booleans", "comparison"],
    topic: "boolean expressions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return true only when `row_count > min_rows` and `error_count == 0`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['row_count'] > data['min_rows'] and data['error_count'] == 0\n",
    visibleInput: { row_count: 20, min_rows: 10, error_count: 0 },
    visibleDescription: "Returns true only when both checks pass.",
    hiddenInputs: [
      { description: "Returns false when errors exist.", input: { row_count: 20, min_rows: 10, error_count: 2 } },
      { description: "Returns false when the row count is too small.", input: { row_count: 8, min_rows: 10, error_count: 0 } },
    ],
    solver: (data) => data.row_count > data.min_rows && data.error_count === 0,
  }),
  buildRuntimeQuestion({
    title: "Boolean expressions: either alert condition is enough",
    summary: "Use OR when either failure should raise attention.",
    tags: ["booleans", "or"],
    topic: "boolean expressions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return true when either `lag_minutes > max_lag` or `missing_files > 0`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['lag_minutes'] > data['max_lag'] or data['missing_files'] > 0\n",
    visibleInput: { lag_minutes: 61, max_lag: 60, missing_files: 0 },
    visibleDescription: "Returns true when the lag breaches the max.",
    hiddenInputs: [
      { description: "Returns true when files are missing.", input: { lag_minutes: 1, max_lag: 60, missing_files: 2 } },
      { description: "Returns false when neither condition is true.", input: { lag_minutes: 10, max_lag: 60, missing_files: 0 } },
    ],
    solver: (data) => data.lag_minutes > data.max_lag || data.missing_files > 0,
  }),
  buildRuntimeQuestion({
    title: "Operator precedence: multiply before adding",
    summary: "Return the correct value by following arithmetic precedence.",
    tags: ["precedence", "arithmetic"],
    topic: "operator precedence",
    difficulty: "easy",
    questionType: "predict-output",
    prompt:
      "Write `solve(data)` and return `base + increment * multiplier` without changing the intended precedence.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['base'] + data['increment'] * data['multiplier']\n",
    visibleInput: { base: 2, increment: 3, multiplier: 4 },
    visibleDescription: "Keeps multiplication before addition.",
    hiddenInputs: [
      { description: "Works for zero base.", input: { base: 0, increment: 5, multiplier: 2 } },
      { description: "Works for one multiplier.", input: { base: 7, increment: 8, multiplier: 1 } },
    ],
    solver: (data) => data.base + data.increment * data.multiplier,
  }),
  buildRuntimeQuestion({
    title: "Operator precedence: parentheses change the total",
    summary: "Use an explicit grouped expression.",
    tags: ["precedence", "parentheses"],
    topic: "operator precedence",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `(left + right) * multiplier`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return (data['left'] + data['right']) * data['multiplier']\n",
    visibleInput: { left: 2, right: 3, multiplier: 4 },
    visibleDescription: "Uses parentheses before multiplying.",
    hiddenInputs: [
      { description: "Works for zero multiplier.", input: { left: 5, right: 7, multiplier: 0 } },
      { description: "Works for larger values.", input: { left: 10, right: 2, multiplier: 3 } },
    ],
    solver: (data) => (data.left + data.right) * data.multiplier,
  }),
  buildRuntimeQuestion({
    title: "Type conversion: parse a row count string",
    summary: "Convert a numeric string into an integer before using it.",
    tags: ["type conversion", "integers"],
    topic: "type conversion",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return `int(data['row_count']) + data['extra_rows']`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return int(data['row_count']) + data['extra_rows']\n",
    visibleInput: { row_count: "10", extra_rows: 5 },
    visibleDescription: "Parses a count string before adding.",
    hiddenInputs: [
      { description: "Works for a zero string.", input: { row_count: "0", extra_rows: 2 } },
      { description: "Works for larger strings.", input: { row_count: "40", extra_rows: 1 } },
    ],
    solver: (data) => Number.parseInt(data.row_count, 10) + data.extra_rows,
  }),
  buildRuntimeQuestion({
    title: "Type conversion: parse a file-size string",
    summary: "Convert a string to float and scale it.",
    tags: ["type conversion", "floats"],
    topic: "type conversion",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `float(data['size_mb']) * data['replica_count']`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return float(data['size_mb']) * data['replica_count']\n",
    visibleInput: { size_mb: "1.5", replica_count: 3 },
    visibleDescription: "Parses a float string before multiplying.",
    hiddenInputs: [
      { description: "Works for whole-number strings.", input: { size_mb: "2", replica_count: 4 } },
      { description: "Works for single replica.", input: { size_mb: "7.25", replica_count: 1 } },
    ],
    solver: (data) => Number.parseFloat(data.size_mb) * data.replica_count,
  }),
  buildRuntimeQuestion({
    title: "Comparison: exact status match",
    summary: "Return a boolean from a direct equality check.",
    tags: ["comparison", "strings"],
    topic: "comparison",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return whether `data['status'] == 'passed'`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['status'] == 'passed'\n",
    visibleInput: { status: "passed" },
    visibleDescription: "Returns true for the exact matching status.",
    hiddenInputs: [
      { description: "Returns false for another status.", input: { status: "failed" } },
      { description: "Returns false for uppercase text.", input: { status: "PASSED" } },
    ],
    solver: (data) => data.status === "passed",
  }),
  buildRuntimeQuestion({
    title: "Comparison: choose the larger batch",
    summary: "Use a conditional expression after comparing two counts.",
    tags: ["comparison", "arithmetic"],
    topic: "comparison",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return the larger value between `left_rows` and `right_rows`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['left_rows'] if data['left_rows'] > data['right_rows'] else data['right_rows']\n",
    visibleInput: { left_rows: 18, right_rows: 25 },
    visibleDescription: "Returns the larger count.",
    hiddenInputs: [
      { description: "Returns the left value when it is larger.", input: { left_rows: 40, right_rows: 12 } },
      { description: "Returns the right value on ties or larger right.", input: { left_rows: 5, right_rows: 5 } },
    ],
    solver: (data) => (data.left_rows > data.right_rows ? data.left_rows : data.right_rows),
  }),
  buildRuntimeQuestion({
    title: "Type conversion: turn a bool-like number into text",
    summary: "Convert a numeric flag into a readable label.",
    tags: ["type conversion", "booleans"],
    topic: "type conversion",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `'active'` when `int(data['is_active']) == 1`; otherwise return `'inactive'`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return 'active' if int(data['is_active']) == 1 else 'inactive'\n",
    visibleInput: { is_active: "1" },
    visibleDescription: "Converts the numeric flag into readable text.",
    hiddenInputs: [
      { description: "Returns inactive for zero.", input: { is_active: "0" } },
      { description: "Handles integer-like strings.", input: { is_active: "1" } },
    ],
    solver: (data) => (Number.parseInt(data.is_active, 10) === 1 ? "active" : "inactive"),
  }),
];

const strings: PythonWeekOneExerciseSeed[] = [
  buildRuntimeQuestion({
    title: "String indexing: first character of a source",
    summary: "Read one character from a string safely for a non-empty input.",
    tags: ["strings", "indexing"],
    topic: "string indexing",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return the first character of `data['source']`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['source'][0]\n",
    visibleInput: { source: "orders" },
    visibleDescription: "Returns the first character.",
    hiddenInputs: [
      { description: "Works for short strings.", input: { source: "db" } },
      { description: "Works for uppercase values.", input: { source: "API" } },
    ],
    solver: (data) => data.source[0],
  }),
  buildRuntimeQuestion({
    title: "String indexing: last character of a filename",
    summary: "Read the last character from a string.",
    tags: ["strings", "indexing"],
    topic: "string indexing",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return the last character of `data['filename']`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['filename'][-1]\n",
    visibleInput: { filename: "daily.csv" },
    visibleDescription: "Returns the last character.",
    hiddenInputs: [
      { description: "Works for JSON names.", input: { filename: "events.json" } },
      { description: "Works for short names.", input: { filename: "x1" } },
    ],
    solver: (data) => data.filename[data.filename.length - 1],
  }),
  buildRuntimeQuestion({
    title: "String slicing: first three letters",
    summary: "Take a prefix slice from a table name.",
    tags: ["strings", "slicing"],
    topic: "string slicing",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return the first three characters of `data['table_name']`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['table_name'][:3]\n",
    visibleInput: { table_name: "customers" },
    visibleDescription: "Returns a simple prefix slice.",
    hiddenInputs: [
      { description: "Works for another table name.", input: { table_name: "payments" } },
      { description: "Works for exactly three letters.", input: { table_name: "log" } },
    ],
    solver: (data) => data.table_name.slice(0, 3),
  }),
  buildRuntimeQuestion({
    title: "String slicing: remove a prefix",
    summary: "Slice past a fixed prefix cleanly.",
    tags: ["strings", "slicing"],
    topic: "string slicing",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and remove the first four characters from `data['batch_code']`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['batch_code'][4:]\n",
    visibleInput: { batch_code: "raw-b100" },
    visibleDescription: "Removes the fixed prefix.",
    hiddenInputs: [
      { description: "Works for another code.", input: { batch_code: "tmp-z9" } },
      { description: "Keeps the remaining suffix.", input: { batch_code: "pre-42" } },
    ],
    solver: (data) => data.batch_code.slice(4),
  }),
  buildRuntimeQuestion({
    title: "String methods: uppercase a country code",
    summary: "Use a built-in string method for normalization.",
    tags: ["strings", "methods"],
    topic: "string methods",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return `data['country_code'].upper()`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['country_code'].upper()\n",
    visibleInput: { country_code: "us" },
    visibleDescription: "Uppercases a lower-case code.",
    hiddenInputs: [
      { description: "Works for mixed case.", input: { country_code: "In" } },
      { description: "Keeps uppercase stable.", input: { country_code: "CA" } },
    ],
    solver: (data) => data.country_code.toUpperCase(),
  }),
  buildRuntimeQuestion({
    title: "String methods: lowercase a system name",
    summary: "Normalize case for a source identifier.",
    tags: ["strings", "methods"],
    topic: "string methods",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return `data['system_name'].lower()`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['system_name'].lower()\n",
    visibleInput: { system_name: "OrdersAPI" },
    visibleDescription: "Lowercases the incoming value.",
    hiddenInputs: [
      { description: "Works for already-lowercase names.", input: { system_name: "events" } },
      { description: "Handles acronyms.", input: { system_name: "CRM" } },
    ],
    solver: (data) => data.system_name.toLowerCase(),
  }),
  buildRuntimeQuestion({
    title: "Whitespace cleanup: trim a filename",
    summary: "Strip surrounding whitespace before returning a value.",
    tags: ["strings", "strip"],
    topic: "whitespace cleanup",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return `data['filename'].strip()`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['filename'].strip()\n",
    visibleInput: { filename: "  daily.csv  " },
    visibleDescription: "Removes leading and trailing spaces.",
    hiddenInputs: [
      { description: "Works with tab-like padding spaces too.", input: { filename: " ready.json " } },
      { description: "Keeps already-clean names unchanged.", input: { filename: "events.parquet" } },
    ],
    solver: (data) => data.filename.trim(),
  }),
  buildRuntimeQuestion({
    title: "Case normalization: title-case a team name",
    summary: "Use a casing method for readability.",
    tags: ["strings", "case"],
    topic: "case normalization",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return `data['team_name'].title()`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['team_name'].title()\n",
    visibleInput: { team_name: "data engineering" },
    visibleDescription: "Title-cases a multi-word label.",
    hiddenInputs: [
      { description: "Works for one word too.", input: { team_name: "platform" } },
      { description: "Normalizes a mixed-case phrase.", input: { team_name: "bIlling ops" } },
    ],
    solver: (data) =>
      data.team_name
        .toLowerCase()
        .split(" ")
        .map((part: string) => (part ? part[0].toUpperCase() + part.slice(1) : part))
        .join(" "),
  }),
  buildRuntimeQuestion({
    title: "f-strings: build a count message",
    summary: "Format multiple values into one readable sentence.",
    tags: ["strings", "f-strings"],
    topic: "f-strings",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `\"loaded <loaded> of <expected> rows\"` using the numeric fields.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return f\"loaded {data['loaded']} of {data['expected']} rows\"\n",
    visibleInput: { loaded: 80, expected: 100 },
    visibleDescription: "Builds a human-readable count message.",
    hiddenInputs: [
      { description: "Works for complete loads.", input: { loaded: 50, expected: 50 } },
      { description: "Works for empty batches.", input: { loaded: 0, expected: 10 } },
    ],
    solver: (data) => `loaded ${data.loaded} of ${data.expected} rows`,
  }),
  buildRuntimeQuestion({
    title: "String methods: replace underscores with dashes",
    summary: "Use string replacement for a cleaner label.",
    tags: ["strings", "methods"],
    topic: "string methods",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `data['job_name']` with every underscore replaced by a dash.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['job_name'].replace('_', '-')\n",
    visibleInput: { job_name: "daily_orders_load" },
    visibleDescription: "Replaces underscores in the job name.",
    hiddenInputs: [
      { description: "Works for one underscore.", input: { job_name: "sync_payments" } },
      { description: "Keeps names with no underscores unchanged.", input: { job_name: "events" } },
    ],
    solver: (data) => data.job_name.replaceAll("_", "-"),
  }),
  buildRuntimeQuestion({
    title: "String slicing: keep the file extension",
    summary: "Take the suffix after the final dot using split logic.",
    tags: ["strings", "slicing"],
    topic: "string slicing",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return the file extension after the final `.` in `data['filename']`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['filename'].split('.')[-1]\n",
    visibleInput: { filename: "daily.orders.csv" },
    visibleDescription: "Returns the last extension segment.",
    hiddenInputs: [
      { description: "Works for JSON files.", input: { filename: "events.json" } },
      { description: "Works for parquet files.", input: { filename: "curated.parquet" } },
    ],
    solver: (data) => data.filename.split(".").at(-1),
  }),
  buildRuntimeQuestion({
    title: "Whitespace cleanup: normalize one side only",
    summary: "Trim a left-padded source label without altering the center text.",
    tags: ["strings", "strip"],
    topic: "whitespace cleanup",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `data['source_label']` with surrounding whitespace removed.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['source_label'].strip()\n",
    visibleInput: { source_label: "   payments-api" },
    visibleDescription: "Trims the source label cleanly.",
    hiddenInputs: [
      { description: "Also trims right padding.", input: { source_label: "shipments   " } },
      { description: "Keeps internal dashes.", input: { source_label: "  crm-sync  " } },
    ],
    solver: (data) => data.source_label.trim(),
  }),
  buildRuntimeQuestion({
    title: "Case normalization: lowercase then append suffix",
    summary: "Combine a method call with string formatting.",
    tags: ["strings", "case"],
    topic: "case normalization",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return the lowercase system name plus `'_ready'`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['system_name'].lower() + '_ready'\n",
    visibleInput: { system_name: "CRM" },
    visibleDescription: "Lowercases then appends a suffix.",
    hiddenInputs: [
      { description: "Works for mixed-case names.", input: { system_name: "OrdersApi" } },
      { description: "Works for lowercase names too.", input: { system_name: "events" } },
    ],
    solver: (data) => `${data.system_name.toLowerCase()}_ready`,
  }),
  buildRuntimeQuestion({
    title: "f-strings: build a partition path",
    summary: "Format a common data-engineering path string.",
    tags: ["strings", "f-strings"],
    topic: "f-strings",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `\"dt=<date>/country=<country>\"` using the incoming values.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return f\"dt={data['date']}/country={data['country']}\"\n",
    visibleInput: { date: "2026-07-15", country: "US" },
    visibleDescription: "Builds a partition-style path.",
    hiddenInputs: [
      { description: "Works for another country.", input: { date: "2026-07-16", country: "IN" } },
      { description: "Keeps the incoming date string unchanged.", input: { date: "2026-08-01", country: "CA" } },
    ],
    solver: (data) => `dt=${data.date}/country=${data.country}`,
  }),
  buildRuntimeQuestion({
    title: "String methods: count separators",
    summary: "Use a built-in string method to count a character.",
    tags: ["strings", "methods"],
    topic: "string methods",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return how many times `'/'` appears in `data['path']`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['path'].count('/')\n",
    visibleInput: { path: "bronze/us/orders" },
    visibleDescription: "Counts path separators.",
    hiddenInputs: [
      { description: "Works for deeper paths.", input: { path: "raw/2026/07/15/file.csv" } },
      { description: "Works for a flat path.", input: { path: "single" } },
    ],
    solver: (data) => [...data.path].filter((char: string) => char === "/").length,
  }),
];

const conditions: PythonWeekOneExerciseSeed[] = [
  buildRuntimeQuestion({
    title: "If: label a passed batch",
    summary: "Use a simple branch to return one of two labels.",
    tags: ["conditions", "if"],
    topic: "conditions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `'passed'` when `data['score'] >= 70`; otherwise return `'retry'`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return 'passed' if data['score'] >= 70 else 'retry'\n",
    visibleInput: { score: 72 },
    visibleDescription: "Returns the pass label above the cutoff.",
    hiddenInputs: [
      { description: "Returns retry below the cutoff.", input: { score: 69 } },
      { description: "Treats the boundary as passed.", input: { score: 70 } },
    ],
    solver: (data) => (data.score >= 70 ? "passed" : "retry"),
  }),
  buildRuntimeQuestion({
    title: "Elif: classify alert severity",
    summary: "Use multiple branches with clear boundaries.",
    tags: ["conditions", "elif"],
    topic: "conditions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `'critical'` when `errors >= 10`, `'warning'` when `errors >= 1`, and `'clean'` otherwise.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    if data['errors'] >= 10:\n        return 'critical'\n    if data['errors'] >= 1:\n        return 'warning'\n    return 'clean'\n",
    visibleInput: { errors: 4 },
    visibleDescription: "Returns the warning band for moderate errors.",
    hiddenInputs: [
      { description: "Returns critical for large error counts.", input: { errors: 12 } },
      { description: "Returns clean for zero errors.", input: { errors: 0 } },
    ],
    solver: (data) => (data.errors >= 10 ? "critical" : data.errors >= 1 ? "warning" : "clean"),
  }),
  buildRuntimeQuestion({
    title: "Else: fill a default queue name",
    summary: "Return a default label when a condition is false.",
    tags: ["conditions", "else"],
    topic: "conditions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `data['queue_name']` when it is truthy; otherwise return `'default_queue'`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['queue_name'] if data['queue_name'] else 'default_queue'\n",
    visibleInput: { queue_name: "" },
    visibleDescription: "Uses the default queue when the name is empty.",
    hiddenInputs: [
      { description: "Keeps a real queue name.", input: { queue_name: "priority" } },
      { description: "Uses the default again for another empty string.", input: { queue_name: "" } },
    ],
    solver: (data) => (data.queue_name ? data.queue_name : "default_queue"),
  }),
  buildRuntimeQuestion({
    title: "Combined conditions: good load only",
    summary: "Require multiple checks before returning a success label.",
    tags: ["conditions", "and"],
    topic: "combined conditions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `'good_load'` only when `row_count > 0` and `error_count == 0`; otherwise return `'needs_review'`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return 'good_load' if data['row_count'] > 0 and data['error_count'] == 0 else 'needs_review'\n",
    visibleInput: { row_count: 12, error_count: 0 },
    visibleDescription: "Returns the success label when both checks pass.",
    hiddenInputs: [
      { description: "Returns review when rows are missing.", input: { row_count: 0, error_count: 0 } },
      { description: "Returns review when errors exist.", input: { row_count: 20, error_count: 1 } },
    ],
    solver: (data) => (data.row_count > 0 && data.error_count === 0 ? "good_load" : "needs_review"),
  }),
  buildRuntimeQuestion({
    title: "Boundary conditions: classify a freshness breach",
    summary: "Treat the exact threshold as still acceptable.",
    tags: ["conditions", "boundaries"],
    topic: "boundary conditions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `'fresh'` when `lag_minutes <= max_lag`; otherwise return `'late'`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return 'fresh' if data['lag_minutes'] <= data['max_lag'] else 'late'\n",
    visibleInput: { lag_minutes: 60, max_lag: 60 },
    visibleDescription: "Treats the exact max lag as fresh.",
    hiddenInputs: [
      { description: "Returns late above the boundary.", input: { lag_minutes: 61, max_lag: 60 } },
      { description: "Returns fresh below the boundary.", input: { lag_minutes: 10, max_lag: 60 } },
    ],
    solver: (data) => (data.lag_minutes <= data.max_lag ? "fresh" : "late"),
  }),
  buildRuntimeQuestion({
    title: "If: check for a paid order",
    summary: "Use a basic text condition on a row-like record.",
    tags: ["conditions", "records"],
    topic: "conditions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `True` when `data['status'] == 'paid'`; otherwise return `False`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['status'] == 'paid'\n",
    visibleInput: { status: "paid" },
    visibleDescription: "Returns true for paid rows.",
    hiddenInputs: [
      { description: "Returns false for pending rows.", input: { status: "pending" } },
      { description: "Returns false for cancelled rows.", input: { status: "cancelled" } },
    ],
    solver: (data) => data.status === "paid",
  }),
  buildRuntimeQuestion({
    title: "Elif: map numeric score to risk bands",
    summary: "Return one of three labels from a score range.",
    tags: ["conditions", "elif"],
    topic: "conditions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `'high'` for scores >= 90, `'medium'` for scores >= 60, and `'low'` otherwise.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    if data['score'] >= 90:\n        return 'high'\n    if data['score'] >= 60:\n        return 'medium'\n    return 'low'\n",
    visibleInput: { score: 75 },
    visibleDescription: "Returns the medium band.",
    hiddenInputs: [
      { description: "Returns high for large scores.", input: { score: 95 } },
      { description: "Returns low below 60.", input: { score: 40 } },
    ],
    solver: (data) => (data.score >= 90 ? "high" : data.score >= 60 ? "medium" : "low"),
  }),
  buildRuntimeQuestion({
    title: "Else: choose an archive action",
    summary: "Return one branch when a row is marked old and another otherwise.",
    tags: ["conditions", "else"],
    topic: "conditions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `'archive'` when `data['days_old'] > 30`; otherwise return `'keep'`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return 'archive' if data['days_old'] > 30 else 'keep'\n",
    visibleInput: { days_old: 31 },
    visibleDescription: "Archives data older than 30 days.",
    hiddenInputs: [
      { description: "Keeps newer data.", input: { days_old: 5 } },
      { description: "Keeps the boundary day.", input: { days_old: 30 } },
    ],
    solver: (data) => (data.days_old > 30 ? "archive" : "keep"),
  }),
  buildRuntimeQuestion({
    title: "Combined conditions: route priority issues",
    summary: "Use OR inside a label decision.",
    tags: ["conditions", "or"],
    topic: "combined conditions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `'priority'` when `vip` is true or `severity == 'critical'`; otherwise return `'normal'`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return 'priority' if data['vip'] or data['severity'] == 'critical' else 'normal'\n",
    visibleInput: { vip: false, severity: "critical" },
    visibleDescription: "Returns priority when severity is critical.",
    hiddenInputs: [
      { description: "Returns priority for VIPs too.", input: { vip: true, severity: "warning" } },
      { description: "Returns normal otherwise.", input: { vip: false, severity: "warning" } },
    ],
    solver: (data) => (data.vip || data.severity === "critical" ? "priority" : "normal"),
  }),
  buildRuntimeQuestion({
    title: "Boundary conditions: exact file count needed",
    summary: "Treat exact expected file count as ready.",
    tags: ["conditions", "boundaries"],
    topic: "boundary conditions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `'ready'` when `found_files >= expected_files`; otherwise return `'wait'`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return 'ready' if data['found_files'] >= data['expected_files'] else 'wait'\n",
    visibleInput: { found_files: 4, expected_files: 4 },
    visibleDescription: "Treats the exact file count as ready.",
    hiddenInputs: [
      { description: "Returns ready above the requirement.", input: { found_files: 6, expected_files: 4 } },
      { description: "Returns wait below the requirement.", input: { found_files: 3, expected_files: 4 } },
    ],
    solver: (data) => (data.found_files >= data.expected_files ? "ready" : "wait"),
  }),
  buildRuntimeQuestion({
    title: "If/elif/else: batch quality label",
    summary: "Combine numeric boundaries into a three-band result.",
    tags: ["conditions", "elif"],
    topic: "conditions",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `'excellent'` for quality >= 95, `'acceptable'` for quality >= 80, and `'poor'` otherwise.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    if data['quality'] >= 95:\n        return 'excellent'\n    if data['quality'] >= 80:\n        return 'acceptable'\n    return 'poor'\n",
    visibleInput: { quality: 83 },
    visibleDescription: "Returns the acceptable band.",
    hiddenInputs: [
      { description: "Returns excellent for top scores.", input: { quality: 97 } },
      { description: "Returns poor below the lower band.", input: { quality: 70 } },
    ],
    solver: (data) => (data.quality >= 95 ? "excellent" : data.quality >= 80 ? "acceptable" : "poor"),
  }),
  buildRuntimeQuestion({
    title: "Combined conditions: retry only when safe",
    summary: "Use AND plus NOT for a slightly richer branch rule.",
    tags: ["conditions", "boolean logic"],
    topic: "combined conditions",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `'retry'` only when `can_retry` is true and `is_fatal` is false; otherwise return `'stop'`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return 'retry' if data['can_retry'] and not data['is_fatal'] else 'stop'\n",
    visibleInput: { can_retry: true, is_fatal: false },
    visibleDescription: "Returns retry only in the safe branch.",
    hiddenInputs: [
      { description: "Returns stop for fatal errors.", input: { can_retry: true, is_fatal: true } },
      { description: "Returns stop when retries are disabled.", input: { can_retry: false, is_fatal: false } },
    ],
    solver: (data) => (data.can_retry && !data.is_fatal ? "retry" : "stop"),
  }),
  buildRuntimeQuestion({
    title: "Boundary conditions: minimum healthy rows",
    summary: "Return a boolean when the exact minimum still qualifies.",
    tags: ["conditions", "boundaries"],
    topic: "boundary conditions",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return whether `healthy_rows >= minimum_rows`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['healthy_rows'] >= data['minimum_rows']\n",
    visibleInput: { healthy_rows: 100, minimum_rows: 100 },
    visibleDescription: "Treats the exact minimum as healthy.",
    hiddenInputs: [
      { description: "Returns true above the minimum.", input: { healthy_rows: 120, minimum_rows: 100 } },
      { description: "Returns false below the minimum.", input: { healthy_rows: 99, minimum_rows: 100 } },
    ],
    solver: (data) => data.healthy_rows >= data.minimum_rows,
  }),
  buildRuntimeQuestion({
    title: "Conditions: choose the next pipeline step",
    summary: "Return a next-step label from a small state machine.",
    tags: ["conditions", "state"],
    topic: "combined conditions",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `'publish'` when `validated` is true and `warnings == 0`, `'review'` when validated is true, and `'fix'` otherwise.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    if data['validated'] and data['warnings'] == 0:\n        return 'publish'\n    if data['validated']:\n        return 'review'\n    return 'fix'\n",
    visibleInput: { validated: true, warnings: 2 },
    visibleDescription: "Returns review when validation passed but warnings remain.",
    hiddenInputs: [
      { description: "Returns publish for a clean validated batch.", input: { validated: true, warnings: 0 } },
      { description: "Returns fix when validation failed.", input: { validated: false, warnings: 0 } },
    ],
    solver: (data) => (data.validated && data.warnings === 0 ? "publish" : data.validated ? "review" : "fix"),
  }),
  buildRuntimeQuestion({
    title: "Conditions: escalate stale failed batches",
    summary: "Mix status checks and age thresholds in a realistic branch rule.",
    tags: ["conditions", "state"],
    topic: "combined conditions",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return `'escalate'` when `status` is `'failed'` and `age_hours` is at least 24; otherwise return `'monitor'`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    if data['status'] == 'failed' and data['age_hours'] >= 24:\n        return 'escalate'\n    return 'monitor'\n",
    visibleInput: { status: "failed", age_hours: 24 },
    visibleDescription: "Escalates an old failed batch at the exact boundary.",
    hiddenInputs: [
      { description: "Keeps fresh failures in monitor.", input: { status: "failed", age_hours: 3 } },
      { description: "Keeps successful batches in monitor.", input: { status: "ok", age_hours: 48 } },
    ],
    solver: (data) => (data.status === "failed" && data.age_hours >= 24 ? "escalate" : "monitor"),
  }),
];

const listsAndDicts: PythonWeekOneExerciseSeed[] = [
  buildRuntimeQuestion({
    title: "Lists: first record in a batch",
    summary: "Read the first item from a list of row ids.",
    tags: ["lists", "indexing"],
    topic: "basic lists",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return the first item in `data`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data[0]\n",
    visibleInput: [101, 102, 103],
    visibleDescription: "Returns the first list item.",
    hiddenInputs: [
      { description: "Works for short lists.", input: [7, 8] },
      { description: "Works for string items too.", input: ["a", "b", "c"] },
    ],
    solver: (data) => data[0],
  }),
  buildRuntimeQuestion({
    title: "Lists: last file in a batch",
    summary: "Read the final item from a list.",
    tags: ["lists", "indexing"],
    topic: "list indexing",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return the last item in `data`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data[-1]\n",
    visibleInput: ["a.csv", "b.csv", "c.csv"],
    visibleDescription: "Returns the last list item.",
    hiddenInputs: [
      { description: "Works for two items.", input: [1, 2] },
      { description: "Works for text items.", input: ["raw", "clean"] },
    ],
    solver: (data) => data[data.length - 1],
  }),
  buildRuntimeQuestion({
    title: "Lists: keep the first two items",
    summary: "Return a prefix slice from a list.",
    tags: ["lists", "slicing"],
    topic: "list slicing",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return the first two items of the incoming list.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data[:2]\n",
    visibleInput: [1, 2, 3, 4],
    visibleDescription: "Returns a simple list slice.",
    hiddenInputs: [
      { description: "Returns all items when only two exist.", input: ["a", "b"] },
      { description: "Keeps order unchanged.", input: [9, 8, 7] },
    ],
    solver: (data) => data.slice(0, 2),
  }),
  buildRuntimeQuestion({
    title: "Lists: drop the first item",
    summary: "Return the tail of a list after removing one leading item.",
    tags: ["lists", "slicing"],
    topic: "list slicing",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return every item after the first one.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data[1:]\n",
    visibleInput: ["raw", "silver", "gold"],
    visibleDescription: "Returns the list tail.",
    hiddenInputs: [
      { description: "Works for numeric lists.", input: [5, 6, 7] },
      { description: "Returns an empty list when only one item exists.", input: ["only"] },
    ],
    solver: (data) => data.slice(1),
  }),
  buildRuntimeQuestion({
    title: "Dicts: read a customer id",
    summary: "Access one value from a dictionary record.",
    tags: ["dicts", "records"],
    topic: "basic dictionaries",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return `data['customer_id']`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['customer_id']\n",
    visibleInput: { customer_id: 17, name: "Ava" },
    visibleDescription: "Returns the dictionary value by key.",
    hiddenInputs: [
      { description: "Works for another id.", input: { customer_id: 88, name: "Liam" } },
      { description: "Ignores extra fields.", input: { customer_id: 1, name: "Mia", country: "US" } },
    ],
    solver: (data) => data.customer_id,
  }),
  buildRuntimeQuestion({
    title: "Dicts: read a status field",
    summary: "Pull one text value from a row-like dictionary.",
    tags: ["dicts", "records"],
    topic: "record access",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return `data['status']`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data['status']\n",
    visibleInput: { status: "pending", amount: 19 },
    visibleDescription: "Returns a text field from the record.",
    hiddenInputs: [
      { description: "Works for paid rows.", input: { status: "paid", amount: 90 } },
      { description: "Works for cancelled rows.", input: { status: "cancelled", amount: 0 } },
    ],
    solver: (data) => data.status,
  }),
  buildRuntimeQuestion({
    title: "Update a record: add a clean flag",
    summary: "Return a new dictionary with one derived field added.",
    tags: ["dicts", "updates"],
    topic: "updating simple records",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return a new dictionary with all original fields plus `clean: True`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return {**data, 'clean': True}\n",
    visibleInput: { batch_id: "b1", rows: 10 },
    visibleDescription: "Adds one boolean field to the record.",
    hiddenInputs: [
      { description: "Keeps original numeric fields.", input: { batch_id: "b2", rows: 0 } },
      { description: "Works with extra keys too.", input: { batch_id: "b3", rows: 9, source: "crm" } },
    ],
    solver: (data) => ({ ...data, clean: true }),
  }),
  buildRuntimeQuestion({
    title: "Update a record: overwrite a status",
    summary: "Return a copy of the record with one changed field.",
    tags: ["dicts", "updates"],
    topic: "updating simple records",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return a new dictionary with `status` replaced by `'reviewed'`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return {**data, 'status': 'reviewed'}\n",
    visibleInput: { order_id: 1, status: "pending" },
    visibleDescription: "Overwrites the status field in a copied record.",
    hiddenInputs: [
      { description: "Works for another original status.", input: { order_id: 2, status: "failed" } },
      { description: "Keeps extra fields intact.", input: { order_id: 3, status: "paid", amount: 30 } },
    ],
    solver: (data) => ({ ...data, status: "reviewed" }),
  }),
  buildRuntimeQuestion({
    title: "Lists of dicts: keep only row ids",
    summary: "Project one field out of a list of records.",
    tags: ["lists", "dicts", "projection"],
    topic: "record access",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return a list containing only each record's `row_id` value.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return [row['row_id'] for row in data]\n",
    visibleInput: [{ row_id: 1, amount: 10 }, { row_id: 2, amount: 20 }],
    visibleDescription: "Projects row ids from a list of records.",
    hiddenInputs: [
      { description: "Keeps list order.", input: [{ row_id: 7 }, { row_id: 8 }, { row_id: 9 }] },
      { description: "Works for one record.", input: [{ row_id: 99, status: "paid" }] },
    ],
    solver: (data) => data.map((row: any) => row.row_id),
  }),
  buildRuntimeQuestion({
    title: "Lists of dicts: count records",
    summary: "Return the number of rows in the batch.",
    tags: ["lists", "counts"],
    topic: "basic lists",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return how many records are in the incoming list.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return len(data)\n",
    visibleInput: [{ id: 1 }, { id: 2 }, { id: 3 }],
    visibleDescription: "Returns the list length.",
    hiddenInputs: [
      { description: "Returns zero for an empty batch.", input: [] },
      { description: "Works for a single record.", input: [{ id: 1 }] },
    ],
    solver: (data) => data.length,
  }),
  buildRuntimeQuestion({
    title: "Lists of dicts: keep active names",
    summary: "Filter and project from simple row dictionaries.",
    tags: ["lists", "dicts", "filtering"],
    topic: "record access",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return the `name` values for records where `active` is true.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return [row['name'] for row in data if row['active']]\n",
    visibleInput: [
      { name: "Ava", active: true },
      { name: "Noah", active: false },
      { name: "Mia", active: true },
    ],
    visibleDescription: "Keeps names from active rows only.",
    hiddenInputs: [
      { description: "Returns an empty list when no rows are active.", input: [{ name: "Zoe", active: false }] },
      { description: "Keeps the original order of active rows.", input: [{ name: "X", active: true }, { name: "Y", active: true }] },
    ],
    solver: (data) => data.filter((row: any) => row.active).map((row: any) => row.name),
  }),
  buildRuntimeQuestion({
    title: "Lists of dicts: sum paid amounts",
    summary: "Aggregate numeric values from matching records.",
    tags: ["lists", "dicts", "aggregation"],
    topic: "record access",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return the total `amount` for records where `status` is `'paid'`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return sum(row['amount'] for row in data if row['status'] == 'paid')\n",
    visibleInput: [
      { amount: 100, status: "paid" },
      { amount: 30, status: "failed" },
      { amount: 20, status: "paid" },
    ],
    visibleDescription: "Sums amounts from paid rows only.",
    hiddenInputs: [
      { description: "Returns zero when nothing is paid.", input: [{ amount: 90, status: "failed" }] },
      { description: "Handles a single paid row.", input: [{ amount: 55, status: "paid" }] },
    ],
    solver: (data) =>
      data.filter((row: any) => row.status === "paid").reduce((total: number, row: any) => total + row.amount, 0),
  }),
  buildRuntimeQuestion({
    title: "Dictionary records: choose a fallback email",
    summary: "Return a copy with a cleaned nullable field.",
    tags: ["dicts", "null handling"],
    topic: "updating simple records",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return a copy where missing `email` becomes `'missing@example.com'`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    email = data['email'] if data['email'] is not None else 'missing@example.com'\n    return {**data, 'email': email}\n",
    visibleInput: { customer_id: 1, email: null },
    visibleDescription: "Fills a missing email in a copied record.",
    hiddenInputs: [
      { description: "Keeps a real email unchanged.", input: { customer_id: 2, email: "a@example.com" } },
      { description: "Handles another missing email.", input: { customer_id: 3, email: null } },
    ],
    solver: (data) => ({ ...data, email: data.email === null ? "missing@example.com" : data.email }),
  }),
  buildRuntimeQuestion({
    title: "Lists: take the middle two values",
    summary: "Use slicing on a four-item batch.",
    tags: ["lists", "slicing"],
    topic: "list slicing",
    difficulty: "medium",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return the middle two values from the incoming four-item list.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data[1:3]\n",
    visibleInput: [10, 20, 30, 40],
    visibleDescription: "Returns the middle slice.",
    hiddenInputs: [
      { description: "Works for text values too.", input: ["a", "b", "c", "d"] },
      { description: "Keeps the original order.", input: [1, 9, 3, 7] },
    ],
    solver: (data) => data.slice(1, 3),
  }),
  buildRuntimeQuestion({
    title: "Lists of dicts: rename a status field",
    summary: "Return copied rows with one updated field.",
    tags: ["lists", "dicts", "updates"],
    topic: "updating simple records",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return a new list where every row's `status` becomes uppercase.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return [{**row, 'status': row['status'].upper()} for row in data]\n",
    visibleInput: [{ status: "paid" }, { status: "pending" }],
    visibleDescription: "Uppercases each status in copied rows.",
    hiddenInputs: [
      { description: "Works for one row.", input: [{ status: "failed" }] },
      { description: "Keeps list shape unchanged.", input: [{ status: "ok", id: 1 }, { status: "late", id: 2 }] },
    ],
    solver: (data) => data.map((row: any) => ({ ...row, status: String(row.status).toUpperCase() })),
  }),
];

const tracingAndPrediction: PythonWeekOneExerciseSeed[] = Array.from({ length: 15 }, (_, index) => {
  const base = index + 1;
  return buildRuntimeQuestion({
    title: `Tracing ${base}: evaluate the final expression`,
    summary: "Practice reading simple state changes and returning the final value.",
    tags: ["tracing", "prediction"],
    topic: "output prediction",
    difficulty: "medium",
    questionType: "predict-output",
    prompt:
      "Write `solve(data)` and return `(data['left'] + data['right']) * data['factor'] - data['offset']`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return (data['left'] + data['right']) * data['factor'] - data['offset']\n",
    visibleInput: { left: base, right: base + 1, factor: 2, offset: 1 },
    visibleDescription: "Evaluates the grouped expression in the right order.",
    hiddenInputs: [
      { description: "Handles different factors.", input: { left: base + 2, right: base, factor: 3, offset: 2 } },
      { description: "Handles zero offset.", input: { left: 1, right: base, factor: 1, offset: 0 } },
    ],
    solver: (data) => (data.left + data.right) * data.factor - data.offset,
  });
});

const debugging: PythonWeekOneExerciseSeed[] = [
  buildRuntimeQuestion({
    title: "Repair a string-plus-int bug",
    summary: "Convert a numeric string before adding it to an integer.",
    tags: ["debugging", "typeerror"],
    topic: "type conversion",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "The starter mixes a numeric string with an integer. Repair it so `solve(data)` returns the correct total.",
    starterCode:
      "def solve(data):\n    total = data['row_count'] + data['extra_rows']\n    return total\n",
    referenceSolution:
      "def solve(data):\n    total = int(data['row_count']) + data['extra_rows']\n    return total\n",
    visibleInput: { row_count: "7", extra_rows: 2 },
    visibleDescription: "Repairs the string-plus-int bug.",
    hiddenInputs: [
      { description: "Handles another numeric string.", input: { row_count: "10", extra_rows: 5 } },
      { description: "Handles a zero string.", input: { row_count: "0", extra_rows: 1 } },
    ],
    solver: (data) => Number.parseInt(data.row_count, 10) + data.extra_rows,
  }),
  buildRuntimeQuestion({
    title: "Repair a boundary condition",
    summary: "Treat the exact threshold as passing instead of failing.",
    tags: ["debugging", "logic"],
    topic: "logic repair",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "Repair the starter so scores at the exact threshold still return `'passed'`.",
    starterCode:
      "def solve(data):\n    if data['score'] > data['threshold']:\n        return 'passed'\n    return 'retry'\n",
    referenceSolution:
      "def solve(data):\n    if data['score'] >= data['threshold']:\n        return 'passed'\n    return 'retry'\n",
    visibleInput: { score: 70, threshold: 70 },
    visibleDescription: "Repairs the exact-threshold case.",
    hiddenInputs: [
      { description: "Still passes larger scores.", input: { score: 90, threshold: 70 } },
      { description: "Still retries smaller scores.", input: { score: 60, threshold: 70 } },
    ],
    solver: (data) => (data.score >= data.threshold ? "passed" : "retry"),
  }),
  buildRuntimeQuestion({
    title: "Repair a None fallback",
    summary: "Use a missing-value fallback instead of returning None directly.",
    tags: ["debugging", "none"],
    topic: "valueerror",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "Repair the starter so missing owners return `'unassigned'` instead of `None`.",
    starterCode:
      "def solve(data):\n    owner = data['owner']\n    return owner\n",
    referenceSolution:
      "def solve(data):\n    owner = data['owner']\n    return owner if owner is not None else 'unassigned'\n",
    visibleInput: { owner: null },
    visibleDescription: "Repairs the missing-owner case.",
    hiddenInputs: [
      { description: "Keeps a real owner unchanged.", input: { owner: "maria" } },
      { description: "Works for another missing value.", input: { owner: null } },
    ],
    solver: (data) => (data.owner === null ? "unassigned" : data.owner),
  }),
  ...Array.from({ length: 12 }, (_, index) => {
    const n = index + 1;
    return buildRuntimeQuestion({
      title: `Debugging checkpoint ${n}`,
      summary: "Repair a small beginner bug in a pipeline-style helper.",
      tags: ["debugging", "repair"],
      topic: "debugging checkpoint",
      difficulty: "medium",
      questionType: "repair-code",
      prompt:
        "Repair the starter so `solve(data)` returns the uppercase source name when `enabled` is true and `'skip'` otherwise.",
      starterCode:
        "def solve(data):\n    if data['enabled']:\n        return data['source_name']\n    return 'skip'\n",
      referenceSolution:
        "def solve(data):\n    if data['enabled']:\n        return data['source_name'].upper()\n    return 'skip'\n",
      visibleInput: { enabled: true, source_name: `feed_${n}` },
      visibleDescription: "Uppercases the source name in the enabled branch.",
      hiddenInputs: [
        { description: "Still returns skip when disabled.", input: { enabled: false, source_name: `feed_${n}` } },
        { description: "Handles another enabled input.", input: { enabled: true, source_name: `api_${n}` } },
      ],
      solver: (data) => (data.enabled ? String(data.source_name).toUpperCase() : "skip"),
    });
  }),
];

const dataEngineeringBasics: PythonWeekOneExerciseSeed[] = [
  buildRuntimeQuestion({
    title: "Data rows: count only valid rows",
    summary: "Return how many rows are marked valid in a tiny batch.",
    tags: ["data-engineering", "rows"],
    topic: "row counts",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return how many records have `valid` set to true.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return sum(1 for row in data if row['valid'])\n",
    visibleInput: [{ valid: true }, { valid: false }, { valid: true }],
    visibleDescription: "Counts only valid records.",
    hiddenInputs: [
      { description: "Returns zero when none are valid.", input: [{ valid: false }] },
      { description: "Counts all records when all are valid.", input: [{ valid: true }, { valid: true }] },
    ],
    solver: (data) => data.filter((row: any) => row.valid).length,
  }),
  buildRuntimeQuestion({
    title: "Batch ids: keep only the known batch ids",
    summary: "Project one field from row dictionaries for downstream logging.",
    tags: ["data-engineering", "batch"],
    topic: "batch identifiers",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return the `batch_id` values for rows where `batch_id` is not `None`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return [row['batch_id'] for row in data if row['batch_id'] is not None]\n",
    visibleInput: [{ batch_id: "b1" }, { batch_id: null }, { batch_id: "b2" }],
    visibleDescription: "Keeps only non-null batch ids.",
    hiddenInputs: [
      { description: "Returns an empty list when none exist.", input: [{ batch_id: null }] },
      { description: "Keeps order for multiple ids.", input: [{ batch_id: "x" }, { batch_id: "y" }] },
    ],
    solver: (data) => data.filter((row: any) => row.batch_id !== null).map((row: any) => row.batch_id),
  }),
  buildRuntimeQuestion({
    title: "Filenames: keep only CSV files",
    summary: "Filter a list of filenames by extension.",
    tags: ["data-engineering", "files"],
    topic: "filenames",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return only filenames that end with `.csv`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return [name for name in data if name.endswith('.csv')]\n",
    visibleInput: ["a.csv", "b.json", "c.csv"],
    visibleDescription: "Keeps only CSV names.",
    hiddenInputs: [
      { description: "Returns an empty list when no CSV files exist.", input: ["a.json"] },
      { description: "Keeps order for multiple CSV names.", input: ["x.csv", "y.csv"] },
    ],
    solver: (data) => data.filter((name: string) => name.endsWith(".csv")),
  }),
  buildRuntimeQuestion({
    title: "Pipeline status: choose the latest label",
    summary: "Return the last status from a list of status updates.",
    tags: ["data-engineering", "status"],
    topic: "pipeline status",
    difficulty: "medium",
    questionType: "write-code",
    prompt: "Write `solve(data)` and return the final item in the list of status labels.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return data[-1]\n",
    visibleInput: ["queued", "running", "passed"],
    visibleDescription: "Returns the latest status label.",
    hiddenInputs: [
      { description: "Works for failure flows too.", input: ["queued", "failed"] },
      { description: "Works for a one-item list.", input: ["ready"] },
    ],
    solver: (data) => data[data.length - 1],
  }),
  buildRuntimeQuestion({
    title: "File sizes: total only positive files",
    summary: "Ignore invalid zero or negative file sizes.",
    tags: ["data-engineering", "sizes"],
    topic: "file sizes",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return the total of all sizes greater than zero.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return sum(size for size in data if size > 0)\n",
    visibleInput: [10, 0, 5, -2],
    visibleDescription: "Sums only positive sizes.",
    hiddenInputs: [
      { description: "Returns zero when none are positive.", input: [0, -1, -3] },
      { description: "Handles all-positive inputs.", input: [4, 6, 8] },
    ],
    solver: (data) => data.filter((size: number) => size > 0).reduce((total: number, size: number) => total + size, 0),
  }),
  buildRuntimeQuestion({
    title: "Quality flags: find failed checks",
    summary: "Return the names of checks that failed.",
    tags: ["data-engineering", "quality"],
    topic: "data-quality flags",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return the `check_name` values for records where `passed` is false.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return [row['check_name'] for row in data if not row['passed']]\n",
    visibleInput: [
      { check_name: "row_count", passed: true },
      { check_name: "null_keys", passed: false },
      { check_name: "freshness", passed: false },
    ],
    visibleDescription: "Returns only the failed check names.",
    hiddenInputs: [
      { description: "Returns an empty list when all checks passed.", input: [{ check_name: "shape", passed: true }] },
      { description: "Keeps order for multiple failures.", input: [{ check_name: "a", passed: false }, { check_name: "b", passed: false }] },
    ],
    solver: (data) => data.filter((row: any) => !row.passed).map((row: any) => row.check_name),
  }),
  buildRuntimeQuestion({
    title: "Source-system records: group counts by source",
    summary: "Count how many rows belong to each source system.",
    tags: ["data-engineering", "dicts"],
    topic: "source-system records",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return a dictionary counting rows by `source_system`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    counts = {}\n    for row in data:\n        source = row['source_system']\n        counts[source] = counts.get(source, 0) + 1\n    return counts\n",
    visibleInput: [{ source_system: "crm" }, { source_system: "billing" }, { source_system: "crm" }],
    visibleDescription: "Counts repeated source systems.",
    hiddenInputs: [
      { description: "Handles a single system.", input: [{ source_system: "ops" }, { source_system: "ops" }] },
      { description: "Handles one row.", input: [{ source_system: "warehouse" }] },
    ],
    solver: (data) =>
      data.reduce((counts: Record<string, number>, row: any) => {
        counts[row.source_system] = (counts[row.source_system] ?? 0) + 1;
        return counts;
      }, {}),
  }),
  buildRuntimeQuestion({
    title: "Mixed mastery: normalize and filter active rows",
    summary: "Combine filtering and string normalization in one beginner task.",
    tags: ["mastery", "rows"],
    topic: "mixed mastery",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return uppercased `name` values for rows where `active` is true.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return [row['name'].upper() for row in data if row['active']]\n",
    visibleInput: [
      { name: "ava", active: true },
      { name: "noah", active: false },
      { name: "mia", active: true },
    ],
    visibleDescription: "Filters active rows and uppercases names.",
    hiddenInputs: [
      { description: "Returns an empty list when none are active.", input: [{ name: "zoe", active: false }] },
      { description: "Keeps order across multiple active rows.", input: [{ name: "a", active: true }, { name: "b", active: true }] },
    ],
    solver: (data) => data.filter((row: any) => row.active).map((row: any) => String(row.name).toUpperCase()),
  }),
  buildRuntimeQuestion({
    title: "Timed beginner: top two amounts",
    summary: "Sort a tiny list and keep only the top values.",
    tags: ["mastery", "sorting"],
    topic: "timed beginner",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return the top two records sorted by `amount` descending.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return sorted(data, key=lambda row: row['amount'], reverse=True)[:2]\n",
    visibleInput: [
      { id: 1, amount: 10 },
      { id: 2, amount: 30 },
      { id: 3, amount: 20 },
    ],
    visibleDescription: "Keeps the top two records by amount.",
    hiddenInputs: [
      { description: "Returns all rows when fewer than two exist.", input: [{ id: 1, amount: 5 }] },
      { description: "Handles ties by keeping stable sorted rows.", input: [{ id: 1, amount: 9 }, { id: 2, amount: 9 }, { id: 3, amount: 1 }] },
    ],
    solver: (data) => [...data].sort((left: any, right: any) => right.amount - left.amount).slice(0, 2),
  }),
  buildRuntimeQuestion({
    title: "Debugging mastery: latest record per customer",
    summary: "Keep the highest version per customer id from a small row set.",
    tags: ["mastery", "debugging"],
    topic: "debugging checkpoint",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return only the latest row per `customer_id` using the largest `version`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    latest = {}\n    for row in data:\n        current = latest.get(row['customer_id'])\n        if current is None or row['version'] > current['version']:\n            latest[row['customer_id']] = row\n    return list(latest.values())\n",
    visibleInput: [
      { customer_id: 1, version: 1, status: "old" },
      { customer_id: 1, version: 2, status: "new" },
      { customer_id: 2, version: 1, status: "only" },
    ],
    visibleDescription: "Keeps only the latest row per customer.",
    hiddenInputs: [
      { description: "Returns an empty list for empty input.", input: [] },
      { description: "Keeps separate customers independently.", input: [{ customer_id: 3, version: 5, status: "a" }, { customer_id: 3, version: 4, status: "b" }] },
    ],
    solver: (data) => {
      const latest = new Map<number, any>();
      for (const row of data as Array<any>) {
        const current = latest.get(row.customer_id);
        if (!current || row.version > current.version) {
          latest.set(row.customer_id, row);
        }
      }
      return [...latest.values()];
    },
  }),
];

const mixedMasteryCheckpoints: PythonWeekOneExerciseSeed[] = [
  buildRuntimeQuestion({
    title: "Mixed mastery: keep paid amounts over threshold",
    summary: "Combine filtering, numeric comparison, and projection in one quick task.",
    tags: ["mastery", "filtering"],
    topic: "mixed mastery checkpoint",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return the `amount` values for rows where `status` is `'paid'` and `amount` is greater than `data['threshold']`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return [row['amount'] for row in data['rows'] if row['status'] == 'paid' and row['amount'] > data['threshold']]\n",
    visibleInput: {
      threshold: 50,
      rows: [
        { status: "paid", amount: 75 },
        { status: "paid", amount: 40 },
        { status: "failed", amount: 90 },
      ],
    },
    visibleDescription: "Keeps only paid amounts above the threshold.",
    hiddenInputs: [
      {
        description: "Returns an empty list when nothing qualifies.",
        input: { threshold: 100, rows: [{ status: "paid", amount: 20 }] },
      },
      {
        description: "Keeps multiple qualifying rows in order.",
        input: {
          threshold: 10,
          rows: [
            { status: "paid", amount: 11 },
            { status: "paid", amount: 12 },
            { status: "pending", amount: 15 },
          ],
        },
      },
    ],
    solver: (data) =>
      data.rows
        .filter((row: any) => row.status === "paid" && row.amount > data.threshold)
        .map((row: any) => row.amount),
  }),
  buildRuntimeQuestion({
    title: "Timed beginner: trim and keep non-empty tags",
    summary: "Move quickly through string cleanup without losing order.",
    tags: ["mastery", "strings"],
    topic: "timed beginner challenge",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return a list of trimmed tag values, skipping any tag that becomes an empty string.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return [tag.strip() for tag in data if tag.strip()]\n",
    visibleInput: [" alpha ", " ", "beta  "],
    visibleDescription: "Trims tags and removes blank entries.",
    hiddenInputs: [
      { description: "Returns an empty list for all-blank input.", input: [" ", ""] },
      { description: "Keeps exact order after cleanup.", input: [" a ", "b", " c"] },
    ],
    solver: (data) => data.map((tag: string) => tag.trim()).filter(Boolean),
  }),
  buildRuntimeQuestion({
    title: "Checkpoint: find the first failed pipeline step",
    summary: "Scan a tiny process list and stop at the first failure.",
    tags: ["mastery", "lists"],
    topic: "debugging checkpoint",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return the `step` value from the first row where `ok` is false. Return `'all_passed'` if every row passed.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    for row in data:\n        if not row['ok']:\n            return row['step']\n    return 'all_passed'\n",
    visibleInput: [
      { step: "extract", ok: true },
      { step: "transform", ok: false },
      { step: "load", ok: false },
    ],
    visibleDescription: "Returns the first failed step only.",
    hiddenInputs: [
      { description: "Returns the fallback when all steps passed.", input: [{ step: "extract", ok: true }] },
      { description: "Handles failure at the first row.", input: [{ step: "stage", ok: false }, { step: "load", ok: true }] },
    ],
    solver: (data) => {
      const failed = data.find((row: any) => !row.ok);
      return failed ? failed.step : "all_passed";
    },
  }),
  buildRuntimeQuestion({
    title: "Mixed mastery: build source-to-table labels",
    summary: "Create readable labels from nested row values.",
    tags: ["mastery", "formatting"],
    topic: "mixed mastery checkpoint",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return labels in the form `\"<source>:<table>\"` for every row in `data`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return [f\"{row['source']}:{row['table']}\" for row in data]\n",
    visibleInput: [
      { source: "crm", table: "customers" },
      { source: "billing", table: "payments" },
    ],
    visibleDescription: "Builds one label per row.",
    hiddenInputs: [
      { description: "Handles one row.", input: [{ source: "ops", table: "jobs" }] },
      { description: "Keeps incoming order.", input: [{ source: "a", table: "x" }, { source: "b", table: "y" }] },
    ],
    solver: (data) => data.map((row: any) => `${row.source}:${row.table}`),
  }),
  buildRuntimeQuestion({
    title: "Timed beginner: collect active customer ids",
    summary: "Project ids only after applying a boolean filter.",
    tags: ["mastery", "projection"],
    topic: "timed beginner challenge",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return the `customer_id` values for rows where `is_active` is true.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return [row['customer_id'] for row in data if row['is_active']]\n",
    visibleInput: [
      { customer_id: 1, is_active: true },
      { customer_id: 2, is_active: false },
      { customer_id: 3, is_active: true },
    ],
    visibleDescription: "Projects active customer ids only.",
    hiddenInputs: [
      { description: "Returns an empty list when none are active.", input: [{ customer_id: 9, is_active: false }] },
      { description: "Handles a single active row.", input: [{ customer_id: 7, is_active: true }] },
    ],
    solver: (data) => data.filter((row: any) => row.is_active).map((row: any) => row.customer_id),
  }),
  buildRuntimeQuestion({
    title: "Debugging checkpoint: repair a wrong fallback size",
    summary: "Use the declared fallback size instead of a hardcoded number.",
    tags: ["mastery", "debugging"],
    topic: "debugging checkpoint",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "Repair the starter so missing `size_mb` values use `data['fallback_size']` instead of the wrong hardcoded value.",
    starterCode:
      "def solve(data):\n    sizes = []\n    for row in data['rows']:\n        sizes.append(row['size_mb'] if row['size_mb'] is not None else 0)\n    return sizes\n",
    referenceSolution:
      "def solve(data):\n    sizes = []\n    for row in data['rows']:\n        sizes.append(row['size_mb'] if row['size_mb'] is not None else data['fallback_size'])\n    return sizes\n",
    visibleInput: {
      fallback_size: 8,
      rows: [{ size_mb: 5 }, { size_mb: null }],
    },
    visibleDescription: "Replaces the wrong hardcoded fallback.",
    hiddenInputs: [
      {
        description: "Uses another fallback value correctly.",
        input: { fallback_size: 2, rows: [{ size_mb: null }, { size_mb: 9 }] },
      },
      {
        description: "Keeps real sizes untouched.",
        input: { fallback_size: 10, rows: [{ size_mb: 1 }, { size_mb: 3 }] },
      },
    ],
    solver: (data) =>
      data.rows.map((row: any) => (row.size_mb === null ? data.fallback_size : row.size_mb)),
  }),
  buildRuntimeQuestion({
    title: "Mixed mastery: summarize file counts by extension",
    summary: "Build a compact dictionary summary from repeated file types.",
    tags: ["mastery", "dicts"],
    topic: "mixed mastery checkpoint",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return a dictionary counting rows by `extension`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    counts = {}\n    for row in data:\n        ext = row['extension']\n        counts[ext] = counts.get(ext, 0) + 1\n    return counts\n",
    visibleInput: [{ extension: "csv" }, { extension: "json" }, { extension: "csv" }],
    visibleDescription: "Counts each extension correctly.",
    hiddenInputs: [
      { description: "Handles a single extension.", input: [{ extension: "parquet" }, { extension: "parquet" }] },
      { description: "Handles one row.", input: [{ extension: "txt" }] },
    ],
    solver: (data) =>
      data.reduce((counts: Record<string, number>, row: any) => {
        counts[row.extension] = (counts[row.extension] ?? 0) + 1;
        return counts;
      }, {}),
  }),
  buildRuntimeQuestion({
    title: "Timed beginner: normalize yes/no flags",
    summary: "Turn simple text flags into booleans for downstream logic.",
    tags: ["mastery", "booleans"],
    topic: "timed beginner challenge",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return booleans where `'yes'` becomes `True` and every other value becomes `False`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return [value == 'yes' for value in data]\n",
    visibleInput: ["yes", "no", "yes"],
    visibleDescription: "Normalizes yes/no flags into booleans.",
    hiddenInputs: [
      { description: "Treats unexpected values as false.", input: ["maybe", "yes"] },
      { description: "Handles an empty list.", input: [] },
    ],
    solver: (data) => data.map((value: string) => value === "yes"),
  }),
  buildRuntimeQuestion({
    title: "Checkpoint: keep the highest score per key",
    summary: "Use dictionary state carefully while scanning repeated keys.",
    tags: ["mastery", "state"],
    topic: "debugging checkpoint",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return a dictionary with the highest `score` seen for each `key`.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    best = {}\n    for row in data:\n        key = row['key']\n        score = row['score']\n        if key not in best or score > best[key]:\n            best[key] = score\n    return best\n",
    visibleInput: [
      { key: "a", score: 2 },
      { key: "a", score: 5 },
      { key: "b", score: 1 },
    ],
    visibleDescription: "Keeps only the highest score per key.",
    hiddenInputs: [
      { description: "Handles one key only.", input: [{ key: "x", score: 3 }, { key: "x", score: 1 }] },
      { description: "Returns an empty dict for empty input.", input: [] },
    ],
    solver: (data) => {
      const best: Record<string, number> = {};
      for (const row of data as Array<any>) {
        if (!(row.key in best) || row.score > best[row.key]) {
          best[row.key] = row.score;
        }
      }
      return best;
    },
  }),
  buildRuntimeQuestion({
    title: "Final Week 1 checkpoint: derive ready batch labels",
    summary: "Finish the week with a small transformation that mixes filtering and formatting.",
    tags: ["mastery", "final"],
    topic: "mixed mastery checkpoint",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write `solve(data)` and return labels in the form `\"<batch_id>-<row_count>\"` for rows where `ready` is true.",
    starterCode: defaultStarter,
    referenceSolution:
      "def solve(data):\n    return [f\"{row['batch_id']}-{row['row_count']}\" for row in data if row['ready']]\n",
    visibleInput: [
      { batch_id: "b1", row_count: 10, ready: true },
      { batch_id: "b2", row_count: 5, ready: false },
      { batch_id: "b3", row_count: 8, ready: true },
    ],
    visibleDescription: "Builds labels only for ready batches.",
    hiddenInputs: [
      { description: "Returns an empty list when nothing is ready.", input: [{ batch_id: "x", row_count: 1, ready: false }] },
      { description: "Handles one ready row.", input: [{ batch_id: "solo", row_count: 99, ready: true }] },
    ],
    solver: (data) =>
      data
        .filter((row: any) => row.ready)
        .map((row: any) => `${row.batch_id}-${row.row_count}`),
  }),
];

export const pythonWeekOneExerciseSeeds = [
  ...foundations,
  ...arithmeticAndComparisons,
  ...strings,
  ...conditions,
  ...listsAndDicts,
  ...tracingAndPrediction,
  ...debugging,
  ...dataEngineeringBasics,
  ...mixedMasteryCheckpoints,
];

if (pythonWeekOneExerciseSeeds.length !== 125) {
  throw new Error(`Python Week 1 must contain 125 questions. Received ${pythonWeekOneExerciseSeeds.length}.`);
}

export const pythonWeekOneGuidedLessons: LessonSeed[] = pythonWeekOneExerciseSeeds.map((seed) => ({
  title: seed.title,
  summary: seed.summary,
  estimatedMinutes: seed.difficulty === "easy" ? 18 : 22,
  tags: seed.tags,
}));
