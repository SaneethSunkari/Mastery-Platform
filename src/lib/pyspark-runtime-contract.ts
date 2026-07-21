export const PYSPARK_RUNTIME_MAX_SOURCE_BYTES = 16_384;
export const PYSPARK_RUNTIME_QUESTION_IDS = [
  "pyspark-q-0026",
  "pyspark-q-0027",
  "pyspark-q-0028",
  "pyspark-q-0029",
  "pyspark-q-0046",
  "pyspark-q-0047",
  "pyspark-q-0048",
  "pyspark-q-0049",
  "pyspark-q-0050",
] as const;

export function hasPysparkRuntime(questionId: string) {
  return (PYSPARK_RUNTIME_QUESTION_IDS as readonly string[]).includes(questionId);
}

export interface PysparkRuntimeRow {
  [column: string]: boolean | number | string | null;
}

export interface PysparkRuntimeSpec {
  questionId: string;
  fixture: {
    orders: PysparkRuntimeRow[];
    customers: PysparkRuntimeRow[];
  };
  expectedColumns: string[];
  expectedRows: PysparkRuntimeRow[];
}

export interface PysparkRuntimeResult {
  passed: boolean;
  score: number;
  mode: "pyspark-runtime";
  feedback: string[];
  durationMs: number;
  sparkVersion?: string;
  actualColumns?: string[];
  actualRows?: PysparkRuntimeRow[];
  errorCode?:
    | "INVALID_REQUEST"
    | "RUNTIME_DISABLED"
    | "RUNTIME_UNAVAILABLE"
    | "UNSUPPORTED_QUESTION"
    | "UNSAFE_SOURCE"
    | "EXECUTION_FAILED"
    | "RESOURCE_LIMIT";
}
