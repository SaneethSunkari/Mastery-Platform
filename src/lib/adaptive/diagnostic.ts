import type { DiagnosticState, ProgressState, Technology } from "@/lib/adaptive/types";

export const DIAGNOSTIC_NODE_IDS: Record<Technology, string[]> = {
  sql: [
    "sql-foundations-select",
    "sql-filtering-where",
    "sql-sorting-and-pagination-order-by",
    "sql-null-handling-is-null",
    "sql-conditional-logic-case",
    "sql-aggregation-group-by",
    "sql-joins-inner-join",
    "sql-common-table-expressions-basic-cte",
    "sql-window-fundamentals-over",
    "sql-aggregation-conditional-aggregation",
  ],
  python: [
    "python-foundations-variables",
    "python-foundations-conditions",
    "python-foundations-loops",
    "python-collections-lists",
    "python-collections-dictionaries",
    "python-strings-slicing",
    "python-functions-parameters",
    "python-exceptions-try",
    "python-comprehensions-list-comprehensions",
    "python-data-engineering-etl",
  ],
  pyspark: [
    "pyspark-dataframe-creation-lists",
    "pyspark-selection-and-expressions-select",
    "pyspark-filtering-filter",
    "pyspark-column-transformations-withcolumn",
    "pyspark-null-handling-isnull",
    "pyspark-string-functions-concat",
    "pyspark-aggregations-groupby",
    "pyspark-joins-inner-join",
    "pyspark-window-functions-window",
    "pyspark-column-transformations-expressions",
  ],
};

export const emptyDiagnosticState = (shortened = false): DiagnosticState => ({ started: false, completedNodeIds: [], shortened });

export function diagnosticSequence(state: DiagnosticState, technology: Technology) {
  const sequence = DIAGNOSTIC_NODE_IDS[technology];
  return state.shortened ? [sequence[0]!, sequence[2]!, sequence[4]!, sequence[6]!, sequence[9]!] : sequence;
}

export function diagnosticComplete(progress: ProgressState, technology: Technology) {
  const state = progress.diagnostics[technology];
  return diagnosticSequence(state, technology).every((id) => state.completedNodeIds.includes(id));
}

export function nextDiagnosticNodeId(progress: ProgressState, technology: Technology) {
  const state = progress.diagnostics[technology];
  return diagnosticSequence(state, technology).find((id) => !state.completedNodeIds.includes(id));
}

export function startDiagnostic(progress: ProgressState, technology: Technology) {
  const next = structuredClone(progress);
  next.diagnostics[technology].started = true;
  return next;
}

export function completeDiagnosticNode(progress: ProgressState, technology: Technology, curriculumNodeId: string) {
  const next = structuredClone(progress);
  const state = next.diagnostics[technology];
  if (!state.completedNodeIds.includes(curriculumNodeId)) state.completedNodeIds.push(curriculumNodeId);
  return next;
}

export function needsDiagnosticWelcome(progress: ProgressState, technology: Technology) {
  return !progress.diagnostics[technology].started && !diagnosticComplete(progress, technology);
}
