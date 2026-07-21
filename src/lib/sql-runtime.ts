import initSqlJs, { type QueryExecResult, type SqlJsStatic } from "sql.js";

let sqlModulePromise: Promise<SqlJsStatic> | null = null;

export interface SqlExecutionResult {
  result: QueryExecResult | null;
  executionTimeMs: number;
}

function normalizeResult(result: QueryExecResult | null) {
  if (!result) {
    return { columns: [], values: [] as string[][] };
  }

  return {
    columns: result.columns.map((column) => column.trim().toLowerCase()),
    values: result.values.map((row) =>
      row.map((value) => {
        if (value === null || value === undefined) {
          return "null";
        }
        if (typeof value === "number") {
          return Number(value).toFixed(6);
        }
        return String(value).trim().toLowerCase();
      }),
    ),
  };
}

export function compareSqlResults(
  actual: QueryExecResult | null,
  expected: QueryExecResult | null,
  orderSensitive: boolean,
) {
  const normalizedActual = normalizeResult(actual);
  const normalizedExpected = normalizeResult(expected);

  if (normalizedActual.columns.length !== normalizedExpected.columns.length) {
    return "Wrong number of columns.";
  }

  const sameColumns = normalizedActual.columns.every(
    (column, index) => column === normalizedExpected.columns[index],
  );
  if (!sameColumns) {
    return "Column names or column order do not match the expected output.";
  }

  if (normalizedActual.values.length !== normalizedExpected.values.length) {
    return "Row count does not match the expected result.";
  }

  const actualRows = orderSensitive
    ? normalizedActual.values
    : [...normalizedActual.values].sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
  const expectedRows = orderSensitive
    ? normalizedExpected.values
    : [...normalizedExpected.values].sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));

  for (let index = 0; index < expectedRows.length; index += 1) {
    if (JSON.stringify(actualRows[index]) !== JSON.stringify(expectedRows[index])) {
      return orderSensitive
        ? "Rows are not correct, or the sorting is different from the expected answer."
        : "The returned rows do not match the expected answer.";
    }
  }

  return null;
}

export async function loadSqlModule() {
  if (!sqlModulePromise) {
    sqlModulePromise = (async () => {
      if (typeof window === "undefined") {
        const [{ readFile }, path] = await Promise.all([
          import("node:fs/promises"),
          import("node:path"),
        ]);
        const wasmPath = path.join(process.cwd(), "public", "sql-wasm.wasm");
        const wasmBinary = await readFile(wasmPath);
        return initSqlJs({
          wasmBinary: wasmBinary.buffer.slice(
            wasmBinary.byteOffset,
            wasmBinary.byteOffset + wasmBinary.byteLength,
          ) as ArrayBuffer,
        });
      }

      const wasmUrl = new URL("/sql-wasm.wasm", window.location.origin);
      const response = await fetch(wasmUrl.toString());
      if (!response.ok) {
        throw new Error(`Failed to load SQL engine: ${response.status}`);
      }
      const wasmBinary = await response.arrayBuffer();
      return initSqlJs({ wasmBinary });
    })();
  }

  return sqlModulePromise;
}

export function executeSqlAgainstSchema(
  SQL: SqlJsStatic,
  setupSql: string,
  querySql: string,
): SqlExecutionResult {
  const database = new SQL.Database();
  database.run(setupSql);
  const startedAt = performance.now();
  const result = database.exec(querySql);
  const executionTimeMs = performance.now() - startedAt;
  database.close();
  return {
    result: result[0] ?? null,
    executionTimeMs,
  };
}
