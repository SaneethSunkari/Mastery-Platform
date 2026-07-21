import { CandyArcadeLevelDefinition } from "@/lib/types";
import { StructuralRequirement } from "@/lib/mastery-exercises";

type ArcadePrimitive = string | number | boolean | null;
type ArcadeRow = Record<string, ArcadePrimitive>;

interface ArcadeColumn {
  name: string;
  type: "INTEGER" | "REAL" | "TEXT";
}

interface ArcadeTableFixture {
  name: string;
  frameName: string;
  columns: ArcadeColumn[];
  rows: ArcadeRow[];
}

export interface ArcadeDatasetContract {
  datasetId: string;
  tables: ArcadeTableFixture[];
  primaryTableName: string;
  nullBehavior: string;
  duplicateBehavior: string;
  numericComparisonRule: string;
}

export interface ArcadeResultContract {
  requiredOutputColumns: string[];
  expectedRows: ArcadeRow[];
  orderSensitive: boolean;
  nullBehavior: string;
  duplicateBehavior: string;
  numericComparisonRule: string;
}

interface ArcadePythonCase {
  description: string;
  input: Record<string, ArcadeRow[]>;
  expected: unknown;
}

export interface ArcadeSqlValidatorDefinition {
  starterCode: string;
  referenceSolution: string;
  setupSql: string;
  orderSensitive: boolean;
  validatorVersion: number;
}

export interface ArcadePythonValidatorDefinition {
  starterCode: string;
  referenceSolution: string;
  inputVariableName: string;
  resultVariable: string;
  visibleCases: ArcadePythonCase[];
  hiddenCases: ArcadePythonCase[];
  validatorVersion: number;
}

export interface ArcadePysparkValidatorDefinition {
  starterCode: string;
  referenceSolution: string;
  requirements: StructuralRequirement[];
  hiddenRequirements: StructuralRequirement[];
  forbiddenPatterns?: string[];
  resultExpectation: string;
  validatorVersion: number;
}

export interface ArcadeWorldOneLevelBundle {
  levelNumber: number;
  category:
    | "projection"
    | "filtering"
    | "sorting-limiting"
    | "null-handling"
    | "deduplication"
    | "derived-column"
    | "aggregation"
    | "string-cleaning"
    | "date-filtering"
    | "debugging";
  level: Omit<
    CandyArcadeLevelDefinition,
    "id" | "worldNumber" | "stage" | "difficulty"
  >;
  sharedTask: string;
  datasetContract: ArcadeDatasetContract;
  resultContract: ArcadeResultContract;
  uniqueLogicFingerprint: string;
  representativeIncorrectAnswers: Record<"sql" | "python" | "pyspark", string>;
  sql: ArcadeSqlValidatorDefinition;
  python: ArcadePythonValidatorDefinition;
  pyspark: ArcadePysparkValidatorDefinition;
}

interface ProjectionField {
  source: string;
  alias?: string;
}

interface SortField {
  column: string;
  direction: "asc" | "desc";
}

interface ProjectionConfig {
  levelNumber: number;
  category: ArcadeWorldOneLevelBundle["category"];
  title: string;
  theme: string;
  businessContext: string;
  table: ArcadeTableFixture;
  question: string;
  selection: ProjectionField[];
  orderBy?: SortField[];
  limit?: number;
  successChecklist: string[];
  expectedOutput: string[];
  orderSensitive: boolean;
}

interface FilterConfig extends ProjectionConfig {
  predicateDescription: string;
  sqlWhere: string;
  pythonCondition: string;
  predicate: (row: ArcadeRow) => boolean;
  pysparkCondition: string;
  pysparkRequirements: StructuralRequirement[];
  pysparkHiddenRequirements?: StructuralRequirement[];
}

interface NullConfig extends ProjectionConfig {
  mode: "fill" | "keep-null" | "keep-non-null";
  targetColumn: string;
  fallbackValue?: ArcadePrimitive;
  sqlExpr?: string;
  pythonTransform?: (row: ArcadeRow) => ArcadePrimitive;
  pysparkExpression?: string;
  pysparkRequirements: StructuralRequirement[];
}

interface DedupeConfig extends ProjectionConfig {
  keyColumn: string;
  sortColumn: string;
}

interface DerivedConfig extends ProjectionConfig {
  newColumn: string;
  sqlExpr: string;
  pythonExpression: string;
  deriveValue: (row: ArcadeRow) => ArcadePrimitive;
  pysparkExpression: string;
  pysparkRequirements: StructuralRequirement[];
}

interface AggregationConfig {
  levelNumber: number;
  category: ArcadeWorldOneLevelBundle["category"];
  title: string;
  theme: string;
  businessContext: string;
  table: ArcadeTableFixture;
  question: string;
  groupBy: string;
  metricName: string;
  sqlMetricExpr: string;
  pythonAccumulator: (groups: Map<string, ArcadeRow[]>) => ArcadeRow[];
  pythonMetricBody: string;
  successChecklist: string[];
  expectedOutput: string[];
  orderSensitive: boolean;
  pysparkReferenceExpression?: string;
  pysparkRequirements: StructuralRequirement[];
  pysparkHiddenRequirements?: StructuralRequirement[];
}

function cloneRows(rows: ArcadeRow[]) {
  return rows.map((row) => ({ ...row }));
}

function sqlLiteral(value: ArcadePrimitive) {
  if (value === null) return "NULL";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "1" : "0";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function createSetupSql(table: ArcadeTableFixture) {
  const createSql = `CREATE TABLE ${table.name} (${table.columns
    .map((column) => `${column.name} ${column.type}`)
    .join(", ")});`;
  const insertSql = table.rows
    .map(
      (row) =>
        `INSERT INTO ${table.name} (${table.columns.map((column) => column.name).join(", ")}) VALUES (${table.columns
          .map((column) => sqlLiteral((row[column.name] ?? null) as ArcadePrimitive))
          .join(", ")});`,
    )
    .join("\n");
  return `${createSql}\n${insertSql}`;
}

function projectRow(row: ArcadeRow, selection: ProjectionField[]) {
  const output: ArcadeRow = {};
  for (const field of selection) {
    output[field.alias ?? field.source] = row[field.source] ?? null;
  }
  return output;
}

function compareSortable(left: ArcadePrimitive, right: ArcadePrimitive) {
  if (left === right) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  return String(left).localeCompare(String(right));
}

function sortRows(rows: ArcadeRow[], orderBy: SortField[] = []) {
  if (orderBy.length === 0) {
    return rows;
  }

  return [...rows].sort((left, right) => {
    for (const sortField of orderBy) {
      const comparison = compareSortable(left[sortField.column] ?? null, right[sortField.column] ?? null);
      if (comparison !== 0) {
        return sortField.direction === "asc" ? comparison : comparison * -1;
      }
    }
    return 0;
  });
}

function pythonSelectionDict(selection: ProjectionField[]) {
  return `{${selection
    .map((field) => `'${field.alias ?? field.source}': row['${field.source}']`)
    .join(", ")}}`;
}

function sqlSelectionList(selection: ProjectionField[]) {
  return selection
    .map((field) => (field.alias ? `${field.source} AS ${field.alias}` : field.source))
    .join(", ");
}

function pysparkSelectionList(selection: ProjectionField[]) {
  return selection
    .map((field) =>
      field.alias
        ? `F.col('${field.source}').alias('${field.alias}')`
        : `F.col('${field.source}')`,
    )
    .join(", ");
}

function buildPythonSortStatements(orderBy: SortField[] = []) {
  if (orderBy.length === 0) {
    return "";
  }

  return (
    orderBy
      .slice()
      .reverse()
      .map(
        (item) =>
          `result = sorted(result, key=lambda row: row['${item.column}'], reverse=${item.direction === "desc" ? "True" : "False"})`,
      )
      .join("\n") + "\n"
  );
}

function pysparkSelectionWithDerivedColumn(selection: ProjectionField[], newColumn: string) {
  const existingColumns = pysparkSelectionList(selection);
  return existingColumns.length > 0
    ? `${existingColumns}, F.col('${newColumn}')`
    : `F.col('${newColumn}')`;
}

function pythonCaseInput(table: ArcadeTableFixture) {
  return {
    [table.name]: cloneRows(table.rows),
  };
}

function pythonCaseInputFromRows(table: ArcadeTableFixture, rows: ArcadeRow[]) {
  return {
    [table.name]: cloneRows(rows),
  };
}

function reversedFixtureRows(table: ArcadeTableFixture) {
  return cloneRows([...table.rows].reverse());
}

function starterForPython(tableName: string) {
  return [
    `# use data['${tableName}'] and assign the final output to result`,
    "result = []",
  ].join("\n");
}

function starterForPyspark(frameName: string) {
  return [
    "from pyspark.sql import functions as F",
    "from pyspark.sql import Window",
    "",
    `# assume ${frameName} already exists`,
    `result_df = ${frameName}`,
  ].join("\n");
}

function normalizeFingerprint(value: string) {
  return value.toLowerCase().replace(/\s+/gu, " ").trim();
}

function buildDatasetContract(
  levelNumber: number,
  table: ArcadeTableFixture,
): ArcadeDatasetContract {
  return {
    datasetId: `arcade-world-1-level-${String(levelNumber).padStart(4, "0")}-${table.name}`,
    tables: [
      {
        name: table.name,
        frameName: table.frameName,
        columns: table.columns.map((column) => ({ ...column })),
        rows: cloneRows(table.rows),
      },
    ],
    primaryTableName: table.name,
    nullBehavior: "Preserve fixture nulls exactly unless the task explicitly requests replacement or filtering.",
    duplicateBehavior: "Preserve fixture duplicates exactly unless the task explicitly requests deduplication.",
    numericComparisonRule: "Compare numeric values exactly using the shared expected-result contract.",
  };
}

function buildResultContract(
  expectedRows: ArcadeRow[],
  orderSensitive: boolean,
): ArcadeResultContract {
  return {
    requiredOutputColumns:
      expectedRows[0] ? Object.keys(expectedRows[0]) : [],
    expectedRows: cloneRows(expectedRows),
    orderSensitive,
    nullBehavior: "Null values must match the expected rows exactly.",
    duplicateBehavior: "Duplicate rows must match the expected rows exactly.",
    numericComparisonRule: "Numeric values must match the expected rows exactly.",
  };
}

function buildLevelFingerprint(
  category: ArcadeWorldOneLevelBundle["category"],
  task: string,
  datasetContract: ArcadeDatasetContract,
  resultContract: ArcadeResultContract,
) {
  return normalizeFingerprint(
    [
      category,
      task,
      datasetContract.datasetId,
      datasetContract.tables
        .map(
          (table) =>
            `${table.name}:${table.columns
              .map((column) => `${column.name}:${column.type}`)
              .join(",")}:${JSON.stringify(table.rows)}`,
        )
        .join(" | "),
      resultContract.requiredOutputColumns.join(","),
      JSON.stringify(resultContract.expectedRows),
      resultContract.orderSensitive ? "ordered" : "unordered",
    ].join(" | "),
  );
}

function buildProjectionLevel(config: ProjectionConfig): ArcadeWorldOneLevelBundle {
  const mappedRows = sortRows(
    cloneRows(config.table.rows).map((row) => projectRow(row, config.selection)),
    config.orderBy,
  );
  const limitedRows = typeof config.limit === "number" ? mappedRows.slice(0, config.limit) : mappedRows;
  const hiddenSourceRows = reversedFixtureRows(config.table);
  const hiddenMappedRows = sortRows(
    hiddenSourceRows.map((row) => projectRow(row, config.selection)),
    config.orderBy,
  );
  const hiddenLimitedRows =
    typeof config.limit === "number" ? hiddenMappedRows.slice(0, config.limit) : hiddenMappedRows;
  const sqlOrder =
    config.orderBy && config.orderBy.length > 0
      ? ` ORDER BY ${config.orderBy
          .map((item) => `${item.column} ${item.direction.toUpperCase()}`)
          .join(", ")}`
      : "";
  const sqlLimit = typeof config.limit === "number" ? ` LIMIT ${config.limit}` : "";
  const datasetContract = buildDatasetContract(config.levelNumber, config.table);
  const resultContract = buildResultContract(limitedRows, config.orderSensitive);
  const representativeIncorrectAnswers = {
    sql: `SELECT * FROM ${config.table.name};`,
    python: "result = []\n",
    pyspark: `result_df = ${config.table.frameName}\n`,
  } as const;

  return {
    levelNumber: config.levelNumber,
    category: config.category,
    sharedTask: config.question,
    datasetContract,
    resultContract,
    uniqueLogicFingerprint: buildLevelFingerprint(
      config.category,
      config.question,
      datasetContract,
      resultContract,
    ),
    representativeIncorrectAnswers,
    level: {
      levelNumber: config.levelNumber,
      title: config.title,
      theme: config.theme,
      prompt: `Solve this ${config.category.replace("-", " ")} arcade task across SQL, Python, and PySpark.`,
      question: config.question,
      businessContext: config.businessContext,
      dataset: [
        `Table: ${config.table.name}`,
        `Columns: ${config.table.columns.map((column) => column.name).join(", ")}`,
        `Python input: data['${config.table.name}']`,
        `PySpark input: ${config.table.frameName}`,
      ],
      expectedOutput: config.expectedOutput,
      successChecklist: config.successChecklist,
      sqlGoal: `Write SQL that returns the requested output from \`${config.table.name}\`.`,
      pythonGoal: `Write Python using \`data['${config.table.name}']\` and assign the final list to \`result\`.`,
      pysparkGoal: `Write PySpark assuming \`${config.table.frameName}\` exists and assign the final DataFrame to \`result_df\`.`,
    },
    sql: {
      starterCode: "",
      referenceSolution: `SELECT ${sqlSelectionList(config.selection)} FROM ${config.table.name}${sqlOrder}${sqlLimit};`,
      setupSql: createSetupSql(config.table),
      orderSensitive: config.orderSensitive,
      validatorVersion: 1,
    },
    python: {
      starterCode: starterForPython(config.table.name),
      referenceSolution:
        `result = [` +
        `${pythonSelectionDict(config.selection)} for row in data['${config.table.name}']` +
        `]\n` +
        buildPythonSortStatements(config.orderBy) +
        (typeof config.limit === "number" ? `result = result[:${config.limit}]\n` : ""),
      inputVariableName: "data",
      resultVariable: "result",
      visibleCases: [
        {
          description: "Returns the requested projected result.",
          input: pythonCaseInput(config.table),
          expected: limitedRows,
        },
      ],
      hiddenCases: [
        {
          description: "Handles the same logic when the source rows arrive in reverse order.",
          input: pythonCaseInputFromRows(config.table, hiddenSourceRows),
          expected: hiddenLimitedRows,
        },
      ],
      validatorVersion: 1,
    },
    pyspark: {
      starterCode: starterForPyspark(config.table.frameName),
      referenceSolution: `result_df = ${config.table.frameName}.select(${pysparkSelectionList(config.selection)})${
        config.orderBy && config.orderBy.length > 0
          ? `.orderBy(${config.orderBy
              .map((item) =>
                item.direction === "asc"
                  ? `F.col('${item.column}').asc()`
                  : `F.col('${item.column}').desc()`,
              )
              .join(", ")})`
          : ""
      }${typeof config.limit === "number" ? `.limit(${config.limit})` : ""}\n`,
      requirements: [
        { label: "final dataframe assignment", anyOf: ["result_df ="] },
        { label: "projection", anyOf: [".select("] },
        { label: "source dataframe", anyOf: [config.table.frameName] },
        ...config.selection.map((field) => ({
          label: `uses ${field.source}`,
          anyOf: [field.source],
        })),
      ],
      hiddenRequirements: [
        ...config.selection
          .filter((field) => field.alias)
          .map((field) => ({
            label: `aliases ${field.alias}`,
            anyOf: [field.alias ?? ""],
          })),
        ...(config.orderBy && config.orderBy.length > 0
          ? [{ label: "ordering", anyOf: [".orderBy("] }]
          : []),
        ...(typeof config.limit === "number"
          ? [{ label: "limit", anyOf: [".limit("] }]
          : []),
      ],
      resultExpectation: config.expectedOutput.join(" "),
      validatorVersion: 1,
    },
  };
}

function buildFilterLevel(config: FilterConfig): ArcadeWorldOneLevelBundle {
  const filteredRows = cloneRows(config.table.rows)
    .filter((row) => config.predicate(row))
    .map((row) => projectRow(row, config.selection));
  const hiddenSourceRows = reversedFixtureRows(config.table);
  const hiddenFilteredRowsBase = hiddenSourceRows
    .filter((row) => config.predicate(row))
    .map((row) => projectRow(row, config.selection));
  const hiddenFilteredRows = sortRows(hiddenFilteredRowsBase, config.orderBy);
  const hiddenFilteredLimitedRows =
    typeof config.limit === "number" ? hiddenFilteredRows.slice(0, config.limit) : hiddenFilteredRows;
  const datasetContract = buildDatasetContract(config.levelNumber, config.table);
  const resultContract = buildResultContract(filteredRows, config.orderSensitive);
  const representativeIncorrectAnswers = {
    sql: `SELECT ${sqlSelectionList(config.selection)} FROM ${config.table.name};`,
    python: `result = [${pythonSelectionDict(config.selection)} for row in data['${config.table.name}']]\n`,
    pyspark: `result_df = ${config.table.frameName}.select(${pysparkSelectionList(config.selection)})\n`,
  } as const;

  return {
    ...buildProjectionLevel({
      ...config,
      orderBy: config.orderBy,
      limit: config.limit,
      orderSensitive: config.orderSensitive,
    }),
    sql: {
      starterCode: "",
      referenceSolution: `SELECT ${sqlSelectionList(config.selection)} FROM ${config.table.name} WHERE ${config.sqlWhere}${
        config.orderBy && config.orderBy.length > 0
          ? ` ORDER BY ${config.orderBy
              .map((item) => `${item.column} ${item.direction.toUpperCase()}`)
              .join(", ")}`
          : ""
      }${typeof config.limit === "number" ? ` LIMIT ${config.limit}` : ""};`,
      setupSql: createSetupSql(config.table),
      orderSensitive: config.orderSensitive,
      validatorVersion: 1,
    },
    sharedTask: config.question,
    datasetContract,
    resultContract,
    uniqueLogicFingerprint: buildLevelFingerprint(
      config.category,
      config.question,
      datasetContract,
      resultContract,
    ),
    representativeIncorrectAnswers,
    python: {
      starterCode: starterForPython(config.table.name),
      referenceSolution:
        `result = [` +
        `${pythonSelectionDict(config.selection)} for row in data['${config.table.name}'] if ${config.pythonCondition}` +
        `]\n` +
        buildPythonSortStatements(config.orderBy) +
        (typeof config.limit === "number" ? `result = result[:${config.limit}]\n` : ""),
      inputVariableName: "data",
      resultVariable: "result",
      visibleCases: [
        {
          description: config.predicateDescription,
          input: pythonCaseInput(config.table),
          expected: filteredRows,
        },
      ],
      hiddenCases: [
        {
          description: "Applies the same filter when source row order changes.",
          input: pythonCaseInputFromRows(config.table, hiddenSourceRows),
          expected: hiddenFilteredLimitedRows,
        },
      ],
      validatorVersion: 1,
    },
    pyspark: {
      starterCode: starterForPyspark(config.table.frameName),
      referenceSolution: `result_df = ${config.table.frameName}.filter(${config.pysparkCondition}).select(${pysparkSelectionList(config.selection)})\n`,
      requirements: [
        { label: "final dataframe assignment", anyOf: ["result_df ="] },
        { label: "filter", anyOf: [".filter(", ".where("] },
        { label: "source dataframe", anyOf: [config.table.frameName] },
        ...config.pysparkRequirements,
      ],
      hiddenRequirements: config.pysparkHiddenRequirements ?? [],
      resultExpectation: config.expectedOutput.join(" "),
      validatorVersion: 1,
    },
  };
}

function buildNullLevel(config: NullConfig): ArcadeWorldOneLevelBundle {
  const transformedRows = cloneRows(config.table.rows)
    .filter((row) => {
      if (config.mode === "keep-null") return row[config.targetColumn] === null;
      if (config.mode === "keep-non-null") return row[config.targetColumn] !== null;
      return true;
    })
    .map((row) => {
      const outputRow = projectRow(row, config.selection);
      if (config.mode === "fill" && config.pythonTransform) {
        outputRow[config.targetColumn] = config.pythonTransform(row);
      }
      return outputRow;
    });
  const hiddenSourceRows = reversedFixtureRows(config.table);
  const hiddenTransformedRows = hiddenSourceRows
    .filter((row) => {
      if (config.mode === "keep-null") return row[config.targetColumn] === null;
      if (config.mode === "keep-non-null") return row[config.targetColumn] !== null;
      return true;
    })
    .map((row) => {
      const outputRow = projectRow(row, config.selection);
      if (config.mode === "fill" && config.pythonTransform) {
        outputRow[config.targetColumn] = config.pythonTransform(row);
      }
      return outputRow;
    });

  const pythonBody =
    config.mode === "fill"
      ? `result = []\nfor row in data['${config.table.name}']:\n    result.append(${pythonSelectionDict(config.selection).replace(
          `'${config.targetColumn}': row['${config.targetColumn}']`,
          `'${config.targetColumn}': (${JSON.stringify(config.fallbackValue)} if row['${config.targetColumn}'] is None else row['${config.targetColumn}'])`,
        )})\n`
      : `result = [${pythonSelectionDict(config.selection)} for row in data['${config.table.name}'] if row['${config.targetColumn}'] ${
          config.mode === "keep-null" ? "is None" : "is not None"
        }]\n`;
  const datasetContract = buildDatasetContract(config.levelNumber, config.table);
  const resultContract = buildResultContract(transformedRows, config.orderSensitive);
  const representativeIncorrectAnswers = {
    sql: `SELECT ${sqlSelectionList(config.selection)} FROM ${config.table.name};`,
    python: `result = [${pythonSelectionDict(config.selection)} for row in data['${config.table.name}']]\n`,
    pyspark: `result_df = ${config.table.frameName}\n`,
  } as const;

  return {
    ...buildProjectionLevel(config),
    sharedTask: config.question,
    datasetContract,
    resultContract,
    uniqueLogicFingerprint: buildLevelFingerprint(
      config.category,
      config.question,
      datasetContract,
      resultContract,
    ),
    representativeIncorrectAnswers,
    sql: {
      starterCode: "",
      referenceSolution:
        config.mode === "fill"
          ? `SELECT ${config.selection
              .map((field) =>
                field.source === config.targetColumn
                  ? `${config.sqlExpr ?? `COALESCE(${field.source}, ${sqlLiteral(config.fallbackValue ?? null)})`} AS ${field.alias ?? field.source}`
                  : field.alias
                    ? `${field.source} AS ${field.alias}`
                    : field.source,
              )
              .join(", ")} FROM ${config.table.name};`
          : `SELECT ${sqlSelectionList(config.selection)} FROM ${config.table.name} WHERE ${config.targetColumn} IS ${
              config.mode === "keep-null" ? "" : "NOT "
            }NULL;`,
      setupSql: createSetupSql(config.table),
      orderSensitive: config.orderSensitive,
      validatorVersion: 1,
    },
    python: {
      starterCode: starterForPython(config.table.name),
      referenceSolution: pythonBody,
      inputVariableName: "data",
      resultVariable: "result",
      visibleCases: [
        {
          description: "Applies the requested null-handling rule.",
          input: pythonCaseInput(config.table),
          expected: transformedRows,
        },
      ],
      hiddenCases: [
        {
          description: "Applies the null rule when row order changes.",
          input: pythonCaseInputFromRows(config.table, hiddenSourceRows),
          expected: hiddenTransformedRows,
        },
      ],
      validatorVersion: 1,
    },
    pyspark: {
      starterCode: starterForPyspark(config.table.frameName),
      referenceSolution:
        config.mode === "fill"
          ? `result_df = ${config.table.frameName}.withColumn('${config.targetColumn}', ${
              config.pysparkExpression ??
              `F.coalesce(F.col('${config.targetColumn}'), F.lit(${sqlLiteral(config.fallbackValue ?? null)}))`
            }).select(${pysparkSelectionList(config.selection)})\n`
          : `result_df = ${config.table.frameName}.filter(${
              config.pysparkExpression ??
              `F.col('${config.targetColumn}').${config.mode === "keep-null" ? "isNull" : "isNotNull"}()`
            }).select(${pysparkSelectionList(config.selection)})\n`,
      requirements: [
        { label: "final dataframe assignment", anyOf: ["result_df ="] },
        { label: "source dataframe", anyOf: [config.table.frameName] },
        ...config.pysparkRequirements,
      ],
      hiddenRequirements: [],
      resultExpectation: config.expectedOutput.join(" "),
      validatorVersion: 1,
    },
  };
}

function buildDedupeLevel(config: DedupeConfig): ArcadeWorldOneLevelBundle {
  const winners = new Map<string, ArcadeRow>();
  for (const row of config.table.rows) {
    const key = String(row[config.keyColumn]);
    const existing = winners.get(key);
    if (!existing || compareSortable(existing[config.sortColumn] ?? null, row[config.sortColumn] ?? null) < 0) {
      winners.set(key, { ...row });
    }
  }
  const expectedRows = sortRows(
    [...winners.values()].map((row) => projectRow(row, config.selection)),
    config.orderBy,
  );
  const hiddenSourceRows = reversedFixtureRows(config.table);
  const hiddenWinners = new Map<string, ArcadeRow>();
  for (const row of hiddenSourceRows) {
    const key = String(row[config.keyColumn]);
    const existing = hiddenWinners.get(key);
    if (!existing || compareSortable(existing[config.sortColumn] ?? null, row[config.sortColumn] ?? null) < 0) {
      hiddenWinners.set(key, { ...row });
    }
  }
  const hiddenExpectedRows = sortRows(
    [...hiddenWinners.values()].map((row) => projectRow(row, config.selection)),
    config.orderBy,
  );
  const sqlSelect = sqlSelectionList(config.selection);
  const datasetContract = buildDatasetContract(config.levelNumber, config.table);
  const resultContract = buildResultContract(expectedRows, config.orderSensitive);
  const representativeIncorrectAnswers = {
    sql: `SELECT ${sqlSelect} FROM ${config.table.name};`,
    python: `result = [${pythonSelectionDict(config.selection)} for row in data['${config.table.name}']]\n`,
    pyspark: `result_df = ${config.table.frameName}\n`,
  } as const;

  return {
    ...buildProjectionLevel(config),
    sharedTask: config.question,
    datasetContract,
    resultContract,
    uniqueLogicFingerprint: buildLevelFingerprint(
      config.category,
      config.question,
      datasetContract,
      resultContract,
    ),
    representativeIncorrectAnswers,
    sql: {
      starterCode: "",
      referenceSolution: `WITH ranked AS (
  SELECT *,
         ROW_NUMBER() OVER (PARTITION BY ${config.keyColumn} ORDER BY ${config.sortColumn} DESC) AS rn
  FROM ${config.table.name}
)
SELECT ${sqlSelect}
FROM ranked
WHERE rn = 1${config.orderBy && config.orderBy.length > 0 ? ` ORDER BY ${config.orderBy.map((item) => `${item.column} ${item.direction.toUpperCase()}`).join(", ")}` : ""};`,
      setupSql: createSetupSql(config.table),
      orderSensitive: config.orderSensitive,
      validatorVersion: 1,
    },
    python: {
      starterCode: starterForPython(config.table.name),
      referenceSolution: [
        "latest = {}",
        `for row in data['${config.table.name}']:`,
        `    key = row['${config.keyColumn}']`,
        "    current = latest.get(key)",
        `    if current is None or row['${config.sortColumn}'] > current['${config.sortColumn}']:`,
        "        latest[key] = row",
        `result = [${pythonSelectionDict(config.selection)} for row in latest.values()]`,
      ].join("\n"),
      inputVariableName: "data",
      resultVariable: "result",
      visibleCases: [
        {
          description: "Keeps only the latest row per business key.",
          input: pythonCaseInput(config.table),
          expected: expectedRows,
        },
      ],
      hiddenCases: [
        {
          description: "Keeps the same latest-row logic when rows arrive in reverse order.",
          input: pythonCaseInputFromRows(config.table, hiddenSourceRows),
          expected: hiddenExpectedRows,
        },
      ],
      validatorVersion: 1,
    },
    pyspark: {
      starterCode: starterForPyspark(config.table.frameName),
      referenceSolution: [
        `window_spec = Window.partitionBy('${config.keyColumn}').orderBy(F.col('${config.sortColumn}').desc())`,
        `result_df = ${config.table.frameName}.withColumn('row_num', F.row_number().over(window_spec)).filter(F.col('row_num') == 1).select(${pysparkSelectionList(config.selection)})`,
      ].join("\n"),
      requirements: [
        { label: "final dataframe assignment", anyOf: ["result_df ="] },
        { label: "window partition", anyOf: ["Window.partitionBy("] },
        { label: "row number", anyOf: ["row_number("] },
        { label: "latest row filter", anyOf: ["row_num", "== 1"] },
      ],
      hiddenRequirements: [
        { label: "sort column", anyOf: [config.sortColumn] },
        { label: "business key", anyOf: [config.keyColumn] },
      ],
      resultExpectation: config.expectedOutput.join(" "),
      validatorVersion: 1,
    },
  };
}

function buildDerivedLevel(config: DerivedConfig): ArcadeWorldOneLevelBundle {
  const expectedRows = cloneRows(config.table.rows).map((row) => {
    const outputRow = projectRow(row, config.selection);
    outputRow[config.newColumn] = config.deriveValue(row);
    return outputRow;
  });
  const hiddenSourceRows = reversedFixtureRows(config.table);
  const hiddenExpectedRows = hiddenSourceRows.map((row) => {
    const outputRow = projectRow(row, config.selection);
    outputRow[config.newColumn] = config.deriveValue(row);
    return outputRow;
  });
  const datasetContract = buildDatasetContract(config.levelNumber, config.table);
  const resultContract = buildResultContract(expectedRows, config.orderSensitive);
  const representativeIncorrectAnswers = {
    sql: `SELECT ${sqlSelectionList(config.selection)} FROM ${config.table.name};`,
    python: `result = [${pythonSelectionDict(config.selection)} for row in data['${config.table.name}']]\n`,
    pyspark: `result_df = ${config.table.frameName}\n`,
  } as const;

  return {
    ...buildProjectionLevel(config),
    sharedTask: config.question,
    datasetContract,
    resultContract,
    uniqueLogicFingerprint: buildLevelFingerprint(
      config.category,
      config.question,
      datasetContract,
      resultContract,
    ),
    representativeIncorrectAnswers,
    sql: {
      starterCode: "",
      referenceSolution: `SELECT ${config.selection
        .map((field) => (field.alias ? `${field.source} AS ${field.alias}` : field.source))
        .join(", ")}, ${config.sqlExpr} AS ${config.newColumn} FROM ${config.table.name};`,
      setupSql: createSetupSql(config.table),
      orderSensitive: config.orderSensitive,
      validatorVersion: 1,
    },
    python: {
      starterCode: starterForPython(config.table.name),
      referenceSolution: `result = []\nfor row in data['${config.table.name}']:\n    result.append({${config.selection
        .map((field) => `'${field.alias ?? field.source}': row['${field.source}']`)
        .join(", ")}, '${config.newColumn}': ${config.pythonExpression}})\n`,
      inputVariableName: "data",
      resultVariable: "result",
      visibleCases: [
        {
          description: "Adds the requested derived column.",
          input: pythonCaseInput(config.table),
          expected: expectedRows,
        },
      ],
      hiddenCases: [
        {
          description: "Builds the same derived column when the input rows are reversed.",
          input: pythonCaseInputFromRows(config.table, hiddenSourceRows),
          expected: hiddenExpectedRows,
        },
      ],
      validatorVersion: 1,
    },
    pyspark: {
      starterCode: starterForPyspark(config.table.frameName),
      referenceSolution: `result_df = ${config.table.frameName}.withColumn('${config.newColumn}', ${config.pysparkExpression}).select(${pysparkSelectionWithDerivedColumn(config.selection, config.newColumn)})\n`,
      requirements: [
        { label: "final dataframe assignment", anyOf: ["result_df ="] },
        { label: "withColumn", anyOf: [".withColumn("] },
        { label: "new column name", anyOf: [config.newColumn] },
        ...config.pysparkRequirements,
      ],
      hiddenRequirements: [],
      resultExpectation: config.expectedOutput.join(" "),
      validatorVersion: 1,
    },
  };
}

function buildAggregationLevel(config: AggregationConfig): ArcadeWorldOneLevelBundle {
  const grouped = new Map<string, ArcadeRow[]>();
  for (const row of config.table.rows) {
    const key = String(row[config.groupBy]);
    const bucket = grouped.get(key) ?? [];
    bucket.push({ ...row });
    grouped.set(key, bucket);
  }
  const expectedRows = config.pythonAccumulator(grouped);
  const hiddenSourceRows = reversedFixtureRows(config.table);
  const hiddenGrouped = new Map<string, ArcadeRow[]>();
  for (const row of hiddenSourceRows) {
    const key = String(row[config.groupBy]);
    const bucket = hiddenGrouped.get(key) ?? [];
    bucket.push({ ...row });
    hiddenGrouped.set(key, bucket);
  }
  const hiddenExpectedRows = config.pythonAccumulator(hiddenGrouped);
  const datasetContract = buildDatasetContract(config.levelNumber, config.table);
  const resultContract = buildResultContract(expectedRows, config.orderSensitive);
  const representativeIncorrectAnswers = {
    sql: `SELECT ${config.groupBy} FROM ${config.table.name} GROUP BY ${config.groupBy};`,
    python: "result = []\n",
    pyspark: `result_df = ${config.table.frameName}\n`,
  } as const;

  return {
    levelNumber: config.levelNumber,
    category: config.category,
    sharedTask: config.question,
    datasetContract,
    resultContract,
    uniqueLogicFingerprint: buildLevelFingerprint(
      config.category,
      config.question,
      datasetContract,
      resultContract,
    ),
    representativeIncorrectAnswers,
    level: {
      levelNumber: config.levelNumber,
      title: config.title,
      theme: config.theme,
      prompt: `Solve this ${config.category.replace("-", " ")} arcade task across SQL, Python, and PySpark.`,
      question: config.question,
      businessContext: config.businessContext,
      dataset: [
        `Table: ${config.table.name}`,
        `Columns: ${config.table.columns.map((column) => column.name).join(", ")}`,
        `Python input: data['${config.table.name}']`,
        `PySpark input: ${config.table.frameName}`,
      ],
      expectedOutput: config.expectedOutput,
      successChecklist: config.successChecklist,
      sqlGoal: `Write SQL that returns the requested grouped metric from \`${config.table.name}\`.`,
      pythonGoal: `Write Python using \`data['${config.table.name}']\` and assign the grouped output to \`result\`.`,
      pysparkGoal: `Write PySpark assuming \`${config.table.frameName}\` exists and assign the grouped DataFrame to \`result_df\`.`,
    },
    sql: {
      starterCode: "",
      referenceSolution: `SELECT ${config.groupBy}, ${config.sqlMetricExpr} AS ${config.metricName} FROM ${config.table.name} GROUP BY ${config.groupBy}${
        config.orderSensitive ? ` ORDER BY ${config.groupBy} ASC` : ""
      };`,
      setupSql: createSetupSql(config.table),
      orderSensitive: config.orderSensitive,
      validatorVersion: 1,
    },
    python: {
      starterCode: starterForPython(config.table.name),
      referenceSolution: [
        "groups = {}",
        `for row in data['${config.table.name}']:`,
        `    key = row['${config.groupBy}']`,
        "    groups.setdefault(key, []).append(row)",
        "result = []",
        "for key, rows in groups.items():",
        `    result.append(${config.pythonMetricBody})`,
        ...(config.orderSensitive ? [`result = sorted(result, key=lambda row: row['${config.groupBy}'])`] : []),
      ].join("\n"),
      inputVariableName: "data",
      resultVariable: "result",
      visibleCases: [
        {
          description: "Returns the grouped metric at the requested grain.",
          input: pythonCaseInput(config.table),
          expected: expectedRows,
        },
      ],
      hiddenCases: [
        {
          description: "Keeps the grouped metric correct when source row order changes.",
          input: pythonCaseInputFromRows(config.table, hiddenSourceRows),
          expected: hiddenExpectedRows,
        },
      ],
      validatorVersion: 1,
    },
    pyspark: {
      starterCode: starterForPyspark(config.table.frameName),
      referenceSolution: `result_df = ${config.table.frameName}.groupBy('${config.groupBy}').agg(${
        config.pysparkReferenceExpression ??
        (config.pysparkRequirements
          .flatMap((item) => item.anyOf)
          .find((token) => token.includes("F.") || token.includes(".alias(")) ?? "F.count('*')")
      })\n`,
      requirements: [
        { label: "final dataframe assignment", anyOf: ["result_df ="] },
        { label: "groupBy", anyOf: [".groupBy("] },
        { label: "aggregation", anyOf: [".agg("] },
        ...config.pysparkRequirements,
      ],
      hiddenRequirements: config.pysparkHiddenRequirements ?? [],
      resultExpectation: config.expectedOutput.join(" "),
      validatorVersion: 1,
    },
  };
}

const projectionLevels = [
  buildProjectionLevel({
    levelNumber: 1,
    category: "projection",
    title: "Level 1: Core order extract",
    theme: "projection",
    businessContext: "A reporting job needs the narrowest useful order extract.",
    table: {
      name: "orders",
      frameName: "orders_df",
      columns: [
        { name: "order_id", type: "INTEGER" },
        { name: "customer_id", type: "INTEGER" },
        { name: "status", type: "TEXT" },
        { name: "amount", type: "REAL" },
        { name: "order_date", type: "TEXT" },
      ],
      rows: [
        { order_id: 101, customer_id: 1, status: "paid", amount: 99.5, order_date: "2026-01-03" },
        { order_id: 102, customer_id: 2, status: "pending", amount: 45, order_date: "2026-01-04" },
        { order_id: 103, customer_id: 3, status: "paid", amount: 120, order_date: "2026-01-05" },
      ],
    },
    question: "Return only `order_id`, `customer_id`, and `amount` from `orders`.",
    selection: [
      { source: "order_id" },
      { source: "customer_id" },
      { source: "amount" },
    ],
    successChecklist: [
      "Keep only the requested fields.",
      "Do not return every column.",
      "Preserve one row per order.",
    ],
    expectedOutput: [
      "Columns: order_id, customer_id, amount",
      "One row per order",
      "Keep the original row count",
    ],
    orderSensitive: false,
  }),
  buildProjectionLevel({
    levelNumber: 2,
    category: "projection",
    title: "Level 2: Customer contact slice",
    theme: "projection",
    businessContext: "Support needs a lightweight customer contact slice.",
    table: {
      name: "customers",
      frameName: "customers_df",
      columns: [
        { name: "customer_id", type: "INTEGER" },
        { name: "customer_name", type: "TEXT" },
        { name: "email", type: "TEXT" },
        { name: "country", type: "TEXT" },
      ],
      rows: [
        { customer_id: 1, customer_name: "Ava", email: "ava@example.com", country: "US" },
        { customer_id: 2, customer_name: "Mia", email: "mia@example.com", country: "IN" },
        { customer_id: 3, customer_name: "Liam", email: "liam@example.com", country: "CA" },
      ],
    },
    question: "Return only `customer_name`, `email`, and `country` from `customers`.",
    selection: [{ source: "customer_name" }, { source: "email" }, { source: "country" }],
    successChecklist: [
      "Keep only the contact fields.",
      "Leave customer_id out of this slice.",
      "Preserve row-level detail.",
    ],
    expectedOutput: [
      "Columns: customer_name, email, country",
      "One row per customer",
      "No extra columns",
    ],
    orderSensitive: false,
  }),
  buildProjectionLevel({
    levelNumber: 3,
    category: "projection",
    title: "Level 3: Alias readable revenue",
    theme: "projection",
    businessContext: "A stakeholder wants a cleaner metric name in the extract.",
    table: {
      name: "orders",
      frameName: "orders_df",
      columns: [
        { name: "order_id", type: "INTEGER" },
        { name: "amount", type: "REAL" },
        { name: "status", type: "TEXT" },
      ],
      rows: [
        { order_id: 201, amount: 15, status: "paid" },
        { order_id: 202, amount: 48, status: "paid" },
        { order_id: 203, amount: 9, status: "failed" },
      ],
    },
    question: "Return `order_id` and rename `amount` to `revenue`.",
    selection: [{ source: "order_id" }, { source: "amount", alias: "revenue" }],
    successChecklist: [
      "Rename the metric clearly.",
      "Keep the row grain unchanged.",
      "Return only two columns.",
    ],
    expectedOutput: [
      "Columns: order_id, revenue",
      "One row per order",
      "Use the alias revenue",
    ],
    orderSensitive: false,
  }),
  buildProjectionLevel({
    levelNumber: 4,
    category: "projection",
    title: "Level 4: Event identity view",
    theme: "projection",
    businessContext: "Analytics needs only the event identity fields for a later join.",
    table: {
      name: "events",
      frameName: "events_df",
      columns: [
        { name: "event_id", type: "INTEGER" },
        { name: "user_id", type: "INTEGER" },
        { name: "event_type", type: "TEXT" },
        { name: "event_time", type: "TEXT" },
      ],
      rows: [
        { event_id: 1, user_id: 10, event_type: "open", event_time: "2026-02-01T10:00:00" },
        { event_id: 2, user_id: 10, event_type: "purchase", event_time: "2026-02-01T10:05:00" },
        { event_id: 3, user_id: 11, event_type: "open", event_time: "2026-02-01T11:00:00" },
      ],
    },
    question: "Return only `event_id`, `user_id`, and `event_type` from `events`.",
    selection: [{ source: "event_id" }, { source: "user_id" }, { source: "event_type" }],
    successChecklist: [
      "Keep identity fields only.",
      "Leave timestamps out of this extract.",
      "Return one row per event.",
    ],
    expectedOutput: [
      "Columns: event_id, user_id, event_type",
      "One row per event",
      "No extra columns",
    ],
    orderSensitive: false,
  }),
  buildProjectionLevel({
    levelNumber: 5,
    category: "projection",
    title: "Level 5: Contact alias for outreach",
    theme: "projection",
    businessContext: "An outreach export wants a clearer email field name.",
    table: {
      name: "customers",
      frameName: "customers_df",
      columns: [
        { name: "customer_id", type: "INTEGER" },
        { name: "email", type: "TEXT" },
        { name: "signup_date", type: "TEXT" },
      ],
      rows: [
        { customer_id: 7, email: "nina@example.com", signup_date: "2026-01-01" },
        { customer_id: 8, email: "ryan@example.com", signup_date: "2026-01-04" },
        { customer_id: 9, email: "sofia@example.com", signup_date: "2026-01-06" },
      ],
    },
    question: "Return `customer_id` and rename `email` to `contact_email`.",
    selection: [{ source: "customer_id" }, { source: "email", alias: "contact_email" }],
    successChecklist: [
      "Use the alias contact_email.",
      "Keep signup_date out of the output.",
      "Preserve one row per customer.",
    ],
    expectedOutput: [
      "Columns: customer_id, contact_email",
      "One row per customer",
      "Use the alias contact_email",
    ],
    orderSensitive: false,
  }),
  buildProjectionLevel({
    levelNumber: 6,
    category: "projection",
    title: "Level 6: Shipment state slice",
    theme: "projection",
    businessContext: "Operations only wants the shipment identifier and state columns.",
    table: {
      name: "shipments",
      frameName: "shipments_df",
      columns: [
        { name: "shipment_id", type: "INTEGER" },
        { name: "carrier", type: "TEXT" },
        { name: "status", type: "TEXT" },
        { name: "updated_at", type: "TEXT" },
      ],
      rows: [
        { shipment_id: 501, carrier: "UPS", status: "packed", updated_at: "2026-03-02T09:00:00" },
        { shipment_id: 502, carrier: "FedEx", status: "shipped", updated_at: "2026-03-02T10:00:00" },
        { shipment_id: 503, carrier: "DHL", status: "labelled", updated_at: "2026-03-02T11:00:00" },
      ],
    },
    question: "Return only `shipment_id` and `status` from `shipments`.",
    selection: [{ source: "shipment_id" }, { source: "status" }],
    successChecklist: [
      "Keep just the state fields.",
      "Leave carrier and timestamps out.",
      "Preserve one row per shipment.",
    ],
    expectedOutput: [
      "Columns: shipment_id, status",
      "One row per shipment",
      "No extra columns",
    ],
    orderSensitive: false,
  }),
  buildProjectionLevel({
    levelNumber: 7,
    category: "projection",
    title: "Level 7: Product label extract",
    theme: "projection",
    businessContext: "Catalog QA needs a compact product labeling extract.",
    table: {
      name: "products",
      frameName: "products_df",
      columns: [
        { name: "product_id", type: "INTEGER" },
        { name: "product_name", type: "TEXT" },
        { name: "category", type: "TEXT" },
        { name: "list_price", type: "REAL" },
      ],
      rows: [
        { product_id: 1, product_name: "Phone Stand", category: "accessories", list_price: 12.5 },
        { product_id: 2, product_name: "Mouse Pad", category: "office", list_price: 8.75 },
        { product_id: 3, product_name: "Desk Lamp", category: "lighting", list_price: 35.0 },
      ],
    },
    question: "Return `product_name`, `category`, and `list_price` from `products`.",
    selection: [{ source: "product_name" }, { source: "category" }, { source: "list_price" }],
    successChecklist: [
      "Return only the display fields.",
      "Leave product_id out of this view.",
      "Keep one row per product.",
    ],
    expectedOutput: [
      "Columns: product_name, category, list_price",
      "One row per product",
      "No extra columns",
    ],
    orderSensitive: false,
  }),
  buildProjectionLevel({
    levelNumber: 8,
    category: "projection",
    title: "Level 8: Payment review columns",
    theme: "projection",
    businessContext: "Finance needs only the payment-review columns.",
    table: {
      name: "payments",
      frameName: "payments_df",
      columns: [
        { name: "payment_id", type: "INTEGER" },
        { name: "order_id", type: "INTEGER" },
        { name: "status", type: "TEXT" },
        { name: "amount", type: "REAL" },
        { name: "method", type: "TEXT" },
      ],
      rows: [
        { payment_id: 9001, order_id: 301, status: "settled", amount: 55.0, method: "card" },
        { payment_id: 9002, order_id: 302, status: "failed", amount: 24.0, method: "card" },
        { payment_id: 9003, order_id: 303, status: "pending", amount: 12.0, method: "wallet" },
      ],
    },
    question: "Return only `payment_id`, `status`, and `method` from `payments`.",
    selection: [{ source: "payment_id" }, { source: "status" }, { source: "method" }],
    successChecklist: [
      "Keep only the review columns.",
      "Leave amount out of this slice.",
      "Preserve one row per payment.",
    ],
    expectedOutput: [
      "Columns: payment_id, status, method",
      "One row per payment",
      "No extra columns",
    ],
    orderSensitive: false,
  }),
] as const;

const filteringLevels = [
  buildFilterLevel({
    levelNumber: 9,
    category: "filtering",
    title: "Level 9: Keep only paid orders",
    theme: "filtering",
    businessContext: "Billing wants only completed paid rows for a reconciliation preview.",
    table: projectionLevels[0].level.dataset ? {
      name: "orders",
      frameName: "orders_df",
      columns: [
        { name: "order_id", type: "INTEGER" },
        { name: "customer_id", type: "INTEGER" },
        { name: "status", type: "TEXT" },
        { name: "amount", type: "REAL" },
      ],
      rows: [
        { order_id: 401, customer_id: 1, status: "paid", amount: 32.0 },
        { order_id: 402, customer_id: 2, status: "pending", amount: 18.0 },
        { order_id: 403, customer_id: 3, status: "paid", amount: 75.0 },
      ],
    } : null as never,
    question: "Return only paid rows from `orders`.",
    selection: [{ source: "order_id" }, { source: "customer_id" }, { source: "status" }, { source: "amount" }],
    predicateDescription: "Keeps only status = paid rows.",
    sqlWhere: "status = 'paid'",
    pythonCondition: "row['status'] == 'paid'",
    predicate: (row) => row.status === "paid",
    pysparkCondition: "F.col('status') == 'paid'",
    pysparkRequirements: [
      { label: "status column", anyOf: ["status"] },
      { label: "paid value", anyOf: ["paid"] },
      { label: "column filter", anyOf: ["F.col('status') == 'paid'", 'F.col("status") == "paid"', "status = 'paid'"] },
    ],
    successChecklist: ["Use one explicit status filter.", "Keep only paid rows.", "Return all requested columns."],
    expectedOutput: ["Only paid rows", "Columns: order_id, customer_id, status, amount", "Preserve row detail"],
    orderSensitive: false,
  }),
  buildFilterLevel({
    levelNumber: 10,
    category: "filtering",
    title: "Level 10: Active customers only",
    theme: "filtering",
    businessContext: "CRM cleanup needs only active customer records.",
    table: {
      name: "customers",
      frameName: "customers_df",
      columns: [
        { name: "customer_id", type: "INTEGER" },
        { name: "customer_name", type: "TEXT" },
        { name: "is_active", type: "TEXT" },
        { name: "country", type: "TEXT" },
      ],
      rows: [
        { customer_id: 11, customer_name: "Owen", is_active: "true", country: "US" },
        { customer_id: 12, customer_name: "Isla", is_active: "false", country: "UK" },
        { customer_id: 13, customer_name: "Zara", is_active: "true", country: "CA" },
      ],
    },
    question: "Return only rows where `is_active` is `true` from `customers`.",
    selection: [{ source: "customer_id" }, { source: "customer_name" }, { source: "is_active" }, { source: "country" }],
    predicateDescription: "Keeps only active customers.",
    sqlWhere: "is_active = 'true'",
    pythonCondition: "row['is_active'] == 'true'",
    predicate: (row) => row.is_active === "true",
    pysparkCondition: "F.col('is_active') == 'true'",
    pysparkRequirements: [
      { label: "active flag", anyOf: ["is_active"] },
      { label: "true value", anyOf: ["true"] },
      { label: "filter condition", anyOf: ["F.col('is_active') == 'true'", "is_active = 'true'"] },
    ],
    successChecklist: ["Use the active flag directly.", "Keep only active rows.", "Return all requested columns."],
    expectedOutput: ["Only active customers", "Columns: customer_id, customer_name, is_active, country", "Preserve row detail"],
    orderSensitive: false,
  }),
  buildFilterLevel({
    levelNumber: 11,
    category: "filtering",
    title: "Level 11: Large orders only",
    theme: "filtering",
    businessContext: "Finance wants to inspect only higher-value orders.",
    table: {
      name: "orders",
      frameName: "orders_df",
      columns: [
        { name: "order_id", type: "INTEGER" },
        { name: "status", type: "TEXT" },
        { name: "amount", type: "REAL" },
      ],
      rows: [
        { order_id: 511, status: "paid", amount: 80.0 },
        { order_id: 512, status: "paid", amount: 150.0 },
        { order_id: 513, status: "pending", amount: 225.0 },
      ],
    },
    question: "Return only rows where `amount > 100` from `orders`.",
    selection: [{ source: "order_id" }, { source: "status" }, { source: "amount" }],
    predicateDescription: "Keeps only rows above the numeric threshold.",
    sqlWhere: "amount > 100",
    pythonCondition: "row['amount'] > 100",
    predicate: (row) => Number(row.amount) > 100,
    pysparkCondition: "F.col('amount') > 100",
    pysparkRequirements: [
      { label: "amount comparison", anyOf: ["> 100", "amount > 100"] },
      { label: "amount column", anyOf: ["amount"] },
    ],
    successChecklist: ["Use a numeric comparison.", "Exclude threshold misses.", "Return the requested columns."],
    expectedOutput: ["Only rows with amount > 100", "Columns: order_id, status, amount", "Preserve row detail"],
    orderSensitive: false,
  }),
  buildFilterLevel({
    levelNumber: 12,
    category: "filtering",
    title: "Level 12: Keep US and CA orders",
    theme: "filtering",
    businessContext: "A region preview needs only North America rows.",
    table: {
      name: "orders",
      frameName: "orders_df",
      columns: [
        { name: "order_id", type: "INTEGER" },
        { name: "country", type: "TEXT" },
        { name: "amount", type: "REAL" },
      ],
      rows: [
        { order_id: 601, country: "US", amount: 30.0 },
        { order_id: 602, country: "IN", amount: 20.0 },
        { order_id: 603, country: "CA", amount: 50.0 },
      ],
    },
    question: "Return only rows where `country` is `US` or `CA`.",
    selection: [{ source: "order_id" }, { source: "country" }, { source: "amount" }],
    predicateDescription: "Keeps only US and CA rows.",
    sqlWhere: "country IN ('US', 'CA')",
    pythonCondition: "row['country'] in {'US', 'CA'}",
    predicate: (row) => row.country === "US" || row.country === "CA",
    pysparkCondition: "F.col('country').isin('US', 'CA')",
    pysparkRequirements: [
      { label: "country column", anyOf: ["country"] },
      { label: "allowed countries", anyOf: ["US", "CA"] },
      { label: "membership filter", anyOf: [".isin(", "IN ('US', 'CA')"] },
    ],
    successChecklist: ["Keep only the allowed countries.", "Use one clear membership rule.", "Return the requested columns."],
    expectedOutput: ["Only US and CA rows", "Columns: order_id, country, amount", "Preserve row detail"],
    orderSensitive: false,
  }),
  buildFilterLevel({
    levelNumber: 13,
    category: "filtering",
    title: "Level 13: Purchase events only",
    theme: "filtering",
    businessContext: "Product wants only conversion events for a quick check.",
    table: {
      name: "events",
      frameName: "events_df",
      columns: [
        { name: "event_id", type: "INTEGER" },
        { name: "event_type", type: "TEXT" },
        { name: "user_id", type: "INTEGER" },
      ],
      rows: [
        { event_id: 1, event_type: "open", user_id: 20 },
        { event_id: 2, event_type: "purchase", user_id: 20 },
        { event_id: 3, event_type: "close", user_id: 21 },
      ],
    },
    question: "Return only rows where `event_type` is `purchase`.",
    selection: [{ source: "event_id" }, { source: "event_type" }, { source: "user_id" }],
    predicateDescription: "Keeps only purchase events.",
    sqlWhere: "event_type = 'purchase'",
    pythonCondition: "row['event_type'] == 'purchase'",
    predicate: (row) => row.event_type === "purchase",
    pysparkCondition: "F.col('event_type') == 'purchase'",
    pysparkRequirements: [
      { label: "event_type column", anyOf: ["event_type"] },
      { label: "purchase value", anyOf: ["purchase"] },
      { label: "filter condition", anyOf: ["F.col('event_type') == 'purchase'", "event_type = 'purchase'"] },
    ],
    successChecklist: ["Filter to purchase only.", "Exclude non-conversion events.", "Return the requested columns."],
    expectedOutput: ["Only purchase events", "Columns: event_id, event_type, user_id", "Preserve row detail"],
    orderSensitive: false,
  }),
  buildFilterLevel({
    levelNumber: 14,
    category: "filtering",
    title: "Level 14: Valid settled payments",
    theme: "filtering",
    businessContext: "Payments ops needs only settled positive-value rows.",
    table: {
      name: "payments",
      frameName: "payments_df",
      columns: [
        { name: "payment_id", type: "INTEGER" },
        { name: "status", type: "TEXT" },
        { name: "amount", type: "REAL" },
      ],
      rows: [
        { payment_id: 7001, status: "settled", amount: 40.0 },
        { payment_id: 7002, status: "settled", amount: 0.0 },
        { payment_id: 7003, status: "failed", amount: 12.0 },
      ],
    },
    question: "Return only rows where `status` is `settled` and `amount > 0`.",
    selection: [{ source: "payment_id" }, { source: "status" }, { source: "amount" }],
    predicateDescription: "Keeps settled payments with positive amounts.",
    sqlWhere: "status = 'settled' AND amount > 0",
    pythonCondition: "row['status'] == 'settled' and row['amount'] > 0",
    predicate: (row) => row.status === "settled" && Number(row.amount) > 0,
    pysparkCondition: "(F.col('status') == 'settled') & (F.col('amount') > 0)",
    pysparkRequirements: [
      { label: "settled status", anyOf: ["settled"] },
      { label: "positive amount", anyOf: ["> 0"] },
      { label: "combined filter", anyOf: ["&", " AND "] },
    ],
    successChecklist: ["Apply both rules.", "Exclude zero-value rows.", "Return the requested columns."],
    expectedOutput: ["Only settled rows with amount > 0", "Columns: payment_id, status, amount", "Preserve row detail"],
    orderSensitive: false,
  }),
  buildFilterLevel({
    levelNumber: 15,
    category: "filtering",
    title: "Level 15: Exclude cancelled shipments",
    theme: "filtering",
    businessContext: "Operations wants only active shipment states.",
    table: {
      name: "shipments",
      frameName: "shipments_df",
      columns: [
        { name: "shipment_id", type: "INTEGER" },
        { name: "status", type: "TEXT" },
        { name: "carrier", type: "TEXT" },
      ],
      rows: [
        { shipment_id: 801, status: "packed", carrier: "UPS" },
        { shipment_id: 802, status: "cancelled", carrier: "UPS" },
        { shipment_id: 803, status: "shipped", carrier: "DHL" },
      ],
    },
    question: "Return only rows where `status` is not `cancelled`.",
    selection: [{ source: "shipment_id" }, { source: "status" }, { source: "carrier" }],
    predicateDescription: "Excludes cancelled rows.",
    sqlWhere: "status <> 'cancelled'",
    pythonCondition: "row['status'] != 'cancelled'",
    predicate: (row) => row.status !== "cancelled",
    pysparkCondition: "F.col('status') != 'cancelled'",
    pysparkRequirements: [
      { label: "status column", anyOf: ["status"] },
      { label: "cancelled value", anyOf: ["cancelled"] },
      { label: "not-equal logic", anyOf: ["!=", "<>"] },
    ],
    successChecklist: ["Exclude only cancelled rows.", "Keep the active shipment states.", "Return the requested columns."],
    expectedOutput: ["Rows where status is not cancelled", "Columns: shipment_id, status, carrier", "Preserve row detail"],
    orderSensitive: false,
  }),
  buildFilterLevel({
    levelNumber: 16,
    category: "filtering",
    title: "Level 16: Open high-priority tickets",
    theme: "filtering",
    businessContext: "Support ops wants only unresolved high-priority work.",
    table: {
      name: "tickets",
      frameName: "tickets_df",
      columns: [
        { name: "ticket_id", type: "INTEGER" },
        { name: "priority", type: "TEXT" },
        { name: "status", type: "TEXT" },
      ],
      rows: [
        { ticket_id: 1, priority: "high", status: "open" },
        { ticket_id: 2, priority: "low", status: "open" },
        { ticket_id: 3, priority: "high", status: "closed" },
      ],
    },
    question: "Return only rows where `priority` is `high` and `status` is `open`.",
    selection: [{ source: "ticket_id" }, { source: "priority" }, { source: "status" }],
    predicateDescription: "Keeps open high-priority tickets.",
    sqlWhere: "priority = 'high' AND status = 'open'",
    pythonCondition: "row['priority'] == 'high' and row['status'] == 'open'",
    predicate: (row) => row.priority === "high" && row.status === "open",
    pysparkCondition: "(F.col('priority') == 'high') & (F.col('status') == 'open')",
    pysparkRequirements: [
      { label: "high priority", anyOf: ["high"] },
      { label: "open status", anyOf: ["open"] },
      { label: "combined filter", anyOf: ["&", " AND "] },
    ],
    successChecklist: ["Apply both priority and status rules.", "Exclude resolved or low-priority rows.", "Return the requested columns."],
    expectedOutput: ["Only open high-priority tickets", "Columns: ticket_id, priority, status", "Preserve row detail"],
    orderSensitive: false,
  }),
] as const;

const sortingAndLimitingLevels = [
  buildProjectionLevel({
    levelNumber: 17,
    category: "sorting-limiting",
    title: "Level 17: Top three orders by amount",
    theme: "sorting",
    businessContext: "Finance wants the highest-value orders first.",
    table: {
      name: "orders",
      frameName: "orders_df",
      columns: [
        { name: "order_id", type: "INTEGER" },
        { name: "amount", type: "REAL" },
      ],
      rows: [
        { order_id: 900, amount: 25.0 },
        { order_id: 901, amount: 140.0 },
        { order_id: 902, amount: 75.0 },
        { order_id: 903, amount: 180.0 },
      ],
    },
    question: "Return the top 3 orders sorted by `amount` descending.",
    selection: [{ source: "order_id" }, { source: "amount" }],
    orderBy: [{ column: "amount", direction: "desc" }],
    limit: 3,
    successChecklist: ["Sort descending by amount.", "Keep only three rows.", "Return the requested columns."],
    expectedOutput: ["Top 3 rows by amount descending", "Columns: order_id, amount", "Row order matters"],
    orderSensitive: true,
  }),
  buildProjectionLevel({
    levelNumber: 18,
    category: "sorting-limiting",
    title: "Level 18: Latest two events",
    theme: "sorting",
    businessContext: "A debugging view needs the most recent events first.",
    table: {
      name: "events",
      frameName: "events_df",
      columns: [
        { name: "event_id", type: "INTEGER" },
        { name: "event_time", type: "TEXT" },
        { name: "event_type", type: "TEXT" },
      ],
      rows: [
        { event_id: 1, event_time: "2026-05-01T10:00:00", event_type: "open" },
        { event_id: 2, event_time: "2026-05-01T10:05:00", event_type: "scroll" },
        { event_id: 3, event_time: "2026-05-01T10:12:00", event_type: "purchase" },
      ],
    },
    question: "Return the latest 2 events sorted by `event_time` descending.",
    selection: [{ source: "event_id" }, { source: "event_time" }, { source: "event_type" }],
    orderBy: [{ column: "event_time", direction: "desc" }],
    limit: 2,
    successChecklist: ["Sort descending by event_time.", "Keep only two rows.", "Return the requested columns."],
    expectedOutput: ["Latest 2 rows by event_time", "Columns: event_id, event_time, event_type", "Row order matters"],
    orderSensitive: true,
  }),
  buildProjectionLevel({
    levelNumber: 19,
    category: "sorting-limiting",
    title: "Level 19: Lowest three latency rows",
    theme: "sorting",
    businessContext: "Platform ops wants the smallest latency values first.",
    table: {
      name: "latency_checks",
      frameName: "latency_df",
      columns: [
        { name: "check_id", type: "INTEGER" },
        { name: "latency_ms", type: "REAL" },
        { name: "region", type: "TEXT" },
      ],
      rows: [
        { check_id: 1, latency_ms: 210.0, region: "us-east" },
        { check_id: 2, latency_ms: 90.0, region: "us-west" },
        { check_id: 3, latency_ms: 130.0, region: "eu" },
        { check_id: 4, latency_ms: 70.0, region: "apac" },
      ],
    },
    question: "Return the lowest 3 latency rows sorted by `latency_ms` ascending.",
    selection: [{ source: "check_id" }, { source: "latency_ms" }, { source: "region" }],
    orderBy: [{ column: "latency_ms", direction: "asc" }],
    limit: 3,
    successChecklist: ["Sort ascending by latency.", "Keep only three rows.", "Return the requested columns."],
    expectedOutput: ["Lowest 3 rows by latency_ms", "Columns: check_id, latency_ms, region", "Row order matters"],
    orderSensitive: true,
  }),
  buildProjectionLevel({
    levelNumber: 20,
    category: "sorting-limiting",
    title: "Level 20: Earliest four signups",
    theme: "sorting",
    businessContext: "Growth wants the earliest signup records first.",
    table: {
      name: "customers",
      frameName: "customers_df",
      columns: [
        { name: "customer_id", type: "INTEGER" },
        { name: "customer_name", type: "TEXT" },
        { name: "signup_date", type: "TEXT" },
      ],
      rows: [
        { customer_id: 1, customer_name: "Ava", signup_date: "2026-01-04" },
        { customer_id: 2, customer_name: "Noah", signup_date: "2026-01-01" },
        { customer_id: 3, customer_name: "Liam", signup_date: "2026-01-03" },
        { customer_id: 4, customer_name: "Mia", signup_date: "2026-01-02" },
        { customer_id: 5, customer_name: "Ella", signup_date: "2026-01-05" },
      ],
    },
    question: "Return the earliest 4 signups sorted by `signup_date` ascending.",
    selection: [{ source: "customer_id" }, { source: "customer_name" }, { source: "signup_date" }],
    orderBy: [{ column: "signup_date", direction: "asc" }],
    limit: 4,
    successChecklist: ["Sort ascending by signup_date.", "Keep only four rows.", "Return the requested columns."],
    expectedOutput: ["Earliest 4 signups", "Columns: customer_id, customer_name, signup_date", "Row order matters"],
    orderSensitive: true,
  }),
  buildProjectionLevel({
    levelNumber: 21,
    category: "sorting-limiting",
    title: "Level 21: Carrier status priority view",
    theme: "sorting",
    businessContext: "Ops wants grouped shipment states with the newest updates first inside each state.",
    table: {
      name: "shipments",
      frameName: "shipments_df",
      columns: [
        { name: "shipment_id", type: "INTEGER" },
        { name: "status", type: "TEXT" },
        { name: "updated_at", type: "TEXT" },
      ],
      rows: [
        { shipment_id: 1, status: "labelled", updated_at: "2026-06-01T09:00:00" },
        { shipment_id: 2, status: "labelled", updated_at: "2026-06-01T11:00:00" },
        { shipment_id: 3, status: "shipped", updated_at: "2026-06-01T10:00:00" },
      ],
    },
    question: "Return all rows sorted by `status` ascending and `updated_at` descending.",
    selection: [{ source: "shipment_id" }, { source: "status" }, { source: "updated_at" }],
    orderBy: [
      { column: "status", direction: "asc" },
      { column: "updated_at", direction: "desc" },
    ],
    successChecklist: ["Sort status ascending.", "Sort updated_at descending inside each status.", "Return the requested columns."],
    expectedOutput: ["All rows sorted by status then updated_at", "Columns: shipment_id, status, updated_at", "Row order matters"],
    orderSensitive: true,
  }),
] as const;

const nullHandlingLevels = [
  buildNullLevel({
    levelNumber: 22,
    category: "null-handling",
    title: "Level 22: Fill missing email",
    theme: "null-handling",
    businessContext: "Support exports need a visible fallback for missing email values.",
    table: {
      name: "customers",
      frameName: "customers_df",
      columns: [
        { name: "customer_id", type: "INTEGER" },
        { name: "email", type: "TEXT" },
      ],
      rows: [
        { customer_id: 1, email: "ava@example.com" },
        { customer_id: 2, email: null },
        { customer_id: 3, email: "mia@example.com" },
      ],
    },
    question: "Return `customer_id` and `email`, but replace null `email` with `missing_email`.",
    selection: [{ source: "customer_id" }, { source: "email" }],
    mode: "fill",
    targetColumn: "email",
    fallbackValue: "missing_email",
    sqlExpr: "COALESCE(email, 'missing_email')",
    pythonTransform: (row) => row.email ?? "missing_email",
    pysparkRequirements: [
      { label: "withColumn or select logic", anyOf: [".withColumn(", "coalesce("] },
      { label: "email fallback", anyOf: ["missing_email"] },
      { label: "email column", anyOf: ["email"] },
    ],
    successChecklist: ["Keep every row.", "Replace only missing email values.", "Return the requested columns."],
    expectedOutput: ["Columns: customer_id, email", "Null email becomes missing_email", "Preserve row count"],
    orderSensitive: false,
  }),
  buildNullLevel({
    levelNumber: 23,
    category: "null-handling",
    title: "Level 23: Fill missing country",
    theme: "null-handling",
    businessContext: "Regional reporting wants a clear fallback for unknown countries.",
    table: {
      name: "customers",
      frameName: "customers_df",
      columns: [
        { name: "customer_id", type: "INTEGER" },
        { name: "country", type: "TEXT" },
      ],
      rows: [
        { customer_id: 1, country: "US" },
        { customer_id: 2, country: null },
        { customer_id: 3, country: "CA" },
      ],
    },
    question: "Return `customer_id` and `country`, but replace null `country` with `unknown`.",
    selection: [{ source: "customer_id" }, { source: "country" }],
    mode: "fill",
    targetColumn: "country",
    fallbackValue: "unknown",
    sqlExpr: "COALESCE(country, 'unknown')",
    pythonTransform: (row) => row.country ?? "unknown",
    pysparkRequirements: [
      { label: "withColumn or select logic", anyOf: [".withColumn(", "coalesce("] },
      { label: "country fallback", anyOf: ["unknown"] },
      { label: "country column", anyOf: ["country"] },
    ],
    successChecklist: ["Keep every row.", "Replace only missing country values.", "Return the requested columns."],
    expectedOutput: ["Columns: customer_id, country", "Null country becomes unknown", "Preserve row count"],
    orderSensitive: false,
  }),
  buildNullLevel({
    levelNumber: 24,
    category: "null-handling",
    title: "Level 24: Keep rows missing refund reason",
    theme: "null-handling",
    businessContext: "Refund QA wants rows still missing an explanation field.",
    table: {
      name: "refunds",
      frameName: "refunds_df",
      columns: [
        { name: "refund_id", type: "INTEGER" },
        { name: "refund_reason", type: "TEXT" },
        { name: "amount", type: "REAL" },
      ],
      rows: [
        { refund_id: 1, refund_reason: null, amount: 12.0 },
        { refund_id: 2, refund_reason: "duplicate", amount: 8.0 },
        { refund_id: 3, refund_reason: null, amount: 14.0 },
      ],
    },
    question: "Return only rows where `refund_reason` is null.",
    selection: [{ source: "refund_id" }, { source: "refund_reason" }, { source: "amount" }],
    mode: "keep-null",
    targetColumn: "refund_reason",
    pysparkRequirements: [
      { label: "filter", anyOf: [".filter(", ".where("] },
      { label: "null check", anyOf: [".isNull("] },
      { label: "refund_reason column", anyOf: ["refund_reason"] },
    ],
    successChecklist: ["Keep only missing refund reasons.", "Exclude explained rows.", "Return the requested columns."],
    expectedOutput: ["Only rows where refund_reason is null", "Columns: refund_id, refund_reason, amount", "Preserve row detail"],
    orderSensitive: false,
  }),
  buildNullLevel({
    levelNumber: 25,
    category: "null-handling",
    title: "Level 25: Keep rows with a real customer name",
    theme: "null-handling",
    businessContext: "A review screen wants only records that already have a customer name.",
    table: {
      name: "customers",
      frameName: "customers_df",
      columns: [
        { name: "customer_id", type: "INTEGER" },
        { name: "customer_name", type: "TEXT" },
        { name: "country", type: "TEXT" },
      ],
      rows: [
        { customer_id: 1, customer_name: "Ava", country: "US" },
        { customer_id: 2, customer_name: null, country: "CA" },
        { customer_id: 3, customer_name: "Mia", country: "IN" },
      ],
    },
    question: "Return only rows where `customer_name` is not null.",
    selection: [{ source: "customer_id" }, { source: "customer_name" }, { source: "country" }],
    mode: "keep-non-null",
    targetColumn: "customer_name",
    pysparkRequirements: [
      { label: "filter", anyOf: [".filter(", ".where("] },
      { label: "non-null check", anyOf: [".isNotNull("] },
      { label: "customer_name column", anyOf: ["customer_name"] },
    ],
    successChecklist: ["Keep only rows with customer_name.", "Exclude unnamed rows.", "Return the requested columns."],
    expectedOutput: ["Only rows where customer_name is not null", "Columns: customer_id, customer_name, country", "Preserve row detail"],
    orderSensitive: false,
  }),
  buildNullLevel({
    levelNumber: 26,
    category: "null-handling",
    title: "Level 26: Fill missing amount with zero",
    theme: "null-handling",
    businessContext: "A diagnostic view wants explicit zeroes for missing amounts.",
    table: {
      name: "payments",
      frameName: "payments_df",
      columns: [
        { name: "payment_id", type: "INTEGER" },
        { name: "amount", type: "REAL" },
      ],
      rows: [
        { payment_id: 1, amount: 12.0 },
        { payment_id: 2, amount: null },
        { payment_id: 3, amount: 7.5 },
      ],
    },
    question: "Return `payment_id` and `amount`, but replace null `amount` with `0`.",
    selection: [{ source: "payment_id" }, { source: "amount" }],
    mode: "fill",
    targetColumn: "amount",
    fallbackValue: 0,
    sqlExpr: "COALESCE(amount, 0)",
    pythonTransform: (row) => row.amount ?? 0,
    pysparkRequirements: [
      { label: "withColumn or select logic", anyOf: [".withColumn(", "coalesce("] },
      { label: "amount column", anyOf: ["amount"] },
      { label: "zero fallback", anyOf: ["0"] },
    ],
    successChecklist: ["Keep every row.", "Replace only missing amount values.", "Return the requested columns."],
    expectedOutput: ["Columns: payment_id, amount", "Null amount becomes 0", "Preserve row count"],
    orderSensitive: false,
  }),
] as const;

const dedupeLevels = [
  buildDedupeLevel({
    levelNumber: 27,
    category: "deduplication",
    title: "Level 27: Latest event per event_id",
    theme: "deduplication",
    businessContext: "An event feed sends multiple versions of the same event.",
    table: {
      name: "events",
      frameName: "events_df",
      columns: [
        { name: "event_id", type: "INTEGER" },
        { name: "status", type: "TEXT" },
        { name: "updated_at", type: "TEXT" },
      ],
      rows: [
        { event_id: 1, status: "queued", updated_at: "2026-05-01T10:00:00" },
        { event_id: 1, status: "processed", updated_at: "2026-05-01T10:05:00" },
        { event_id: 2, status: "processed", updated_at: "2026-05-01T10:02:00" },
      ],
    },
    question: "Keep only the latest row per `event_id` using the largest `updated_at`.",
    selection: [{ source: "event_id" }, { source: "status" }, { source: "updated_at" }],
    keyColumn: "event_id",
    sortColumn: "updated_at",
    successChecklist: ["Deduplicate by event_id.", "Use updated_at as the winner rule.", "Return one row per event_id."],
    expectedOutput: ["One row per event_id", "Columns: event_id, status, updated_at", "Keep the latest updated_at row"],
    orderSensitive: false,
  }),
  buildDedupeLevel({
    levelNumber: 28,
    category: "deduplication",
    title: "Level 28: Latest payment per payment_id",
    theme: "deduplication",
    businessContext: "A payment mirror can resend the same identifier with newer status.",
    table: {
      name: "payments",
      frameName: "payments_df",
      columns: [
        { name: "payment_id", type: "INTEGER" },
        { name: "status", type: "TEXT" },
        { name: "updated_at", type: "TEXT" },
      ],
      rows: [
        { payment_id: 10, status: "pending", updated_at: "2026-04-01T09:00:00" },
        { payment_id: 10, status: "settled", updated_at: "2026-04-01T09:03:00" },
        { payment_id: 11, status: "failed", updated_at: "2026-04-01T09:05:00" },
      ],
    },
    question: "Keep only the latest row per `payment_id` using the largest `updated_at`.",
    selection: [{ source: "payment_id" }, { source: "status" }, { source: "updated_at" }],
    keyColumn: "payment_id",
    sortColumn: "updated_at",
    successChecklist: ["Deduplicate by payment_id.", "Use updated_at as the winner rule.", "Return one row per payment_id."],
    expectedOutput: ["One row per payment_id", "Columns: payment_id, status, updated_at", "Keep the latest updated_at row"],
    orderSensitive: false,
  }),
  buildDedupeLevel({
    levelNumber: 29,
    category: "deduplication",
    title: "Level 29: Latest customer profile",
    theme: "deduplication",
    businessContext: "Profile syncs can send multiple versions of the same customer record.",
    table: {
      name: "customer_profiles",
      frameName: "profiles_df",
      columns: [
        { name: "customer_id", type: "INTEGER" },
        { name: "country", type: "TEXT" },
        { name: "version", type: "INTEGER" },
      ],
      rows: [
        { customer_id: 1, country: "US", version: 1 },
        { customer_id: 1, country: "CA", version: 2 },
        { customer_id: 2, country: "IN", version: 1 },
      ],
    },
    question: "Keep only the latest row per `customer_id` using the largest `version`.",
    selection: [{ source: "customer_id" }, { source: "country" }, { source: "version" }],
    keyColumn: "customer_id",
    sortColumn: "version",
    successChecklist: ["Deduplicate by customer_id.", "Use version as the winner rule.", "Return one row per customer_id."],
    expectedOutput: ["One row per customer_id", "Columns: customer_id, country, version", "Keep the highest version row"],
    orderSensitive: false,
  }),
  buildDedupeLevel({
    levelNumber: 30,
    category: "deduplication",
    title: "Level 30: Latest inventory snapshot",
    theme: "deduplication",
    businessContext: "Inventory snapshots can repeat the same sku across updates.",
    table: {
      name: "inventory",
      frameName: "inventory_df",
      columns: [
        { name: "sku", type: "TEXT" },
        { name: "qty", type: "INTEGER" },
        { name: "snapshot_ts", type: "TEXT" },
      ],
      rows: [
        { sku: "A1", qty: 4, snapshot_ts: "2026-05-02T08:00:00" },
        { sku: "A1", qty: 6, snapshot_ts: "2026-05-02T09:00:00" },
        { sku: "B2", qty: 1, snapshot_ts: "2026-05-02T08:30:00" },
      ],
    },
    question: "Keep only the latest row per `sku` using the largest `snapshot_ts`.",
    selection: [{ source: "sku" }, { source: "qty" }, { source: "snapshot_ts" }],
    keyColumn: "sku",
    sortColumn: "snapshot_ts",
    successChecklist: ["Deduplicate by sku.", "Use snapshot_ts as the winner rule.", "Return one row per sku."],
    expectedOutput: ["One row per sku", "Columns: sku, qty, snapshot_ts", "Keep the latest snapshot row"],
    orderSensitive: false,
  }),
  buildDedupeLevel({
    levelNumber: 31,
    category: "deduplication",
    title: "Level 31: Latest shipment state",
    theme: "deduplication",
    businessContext: "Shipment tracking can replay the same id with newer state.",
    table: {
      name: "shipments",
      frameName: "shipments_df",
      columns: [
        { name: "shipment_id", type: "INTEGER" },
        { name: "status", type: "TEXT" },
        { name: "updated_at", type: "TEXT" },
      ],
      rows: [
        { shipment_id: 1, status: "packed", updated_at: "2026-06-01T09:00:00" },
        { shipment_id: 1, status: "shipped", updated_at: "2026-06-01T10:00:00" },
        { shipment_id: 2, status: "labelled", updated_at: "2026-06-01T09:30:00" },
      ],
    },
    question: "Keep only the latest row per `shipment_id` using the largest `updated_at`.",
    selection: [{ source: "shipment_id" }, { source: "status" }, { source: "updated_at" }],
    keyColumn: "shipment_id",
    sortColumn: "updated_at",
    successChecklist: ["Deduplicate by shipment_id.", "Use updated_at as the winner rule.", "Return one row per shipment_id."],
    expectedOutput: ["One row per shipment_id", "Columns: shipment_id, status, updated_at", "Keep the latest updated_at row"],
    orderSensitive: false,
  }),
] as const;

const derivedLevels = [
  buildDerivedLevel({
    levelNumber: 32,
    category: "derived-column",
    title: "Level 32: Flag large orders",
    theme: "derived-column",
    businessContext: "Finance wants a boolean-style large-order marker.",
    table: {
      name: "orders",
      frameName: "orders_df",
      columns: [
        { name: "order_id", type: "INTEGER" },
        { name: "amount", type: "REAL" },
      ],
      rows: [
        { order_id: 1, amount: 45.0 },
        { order_id: 2, amount: 180.0 },
        { order_id: 3, amount: 120.0 },
      ],
    },
    question: "Return `order_id`, `amount`, and add `is_large` where `amount >= 100`.",
    selection: [{ source: "order_id" }, { source: "amount" }],
    newColumn: "is_large",
    sqlExpr: "CASE WHEN amount >= 100 THEN 'true' ELSE 'false' END",
    pythonExpression: "'true' if row['amount'] >= 100 else 'false'",
    deriveValue: (row) => (Number(row.amount) >= 100 ? "true" : "false"),
    pysparkExpression:
      "F.when(F.col('amount') >= 100, F.lit('true')).otherwise(F.lit('false'))",
    pysparkRequirements: [
      { label: "conditional logic", anyOf: ["when(", "F.col('amount') >= 100"] },
      { label: "amount column", anyOf: ["amount"] },
    ],
    successChecklist: ["Add the new derived flag.", "Use amount >= 100.", "Return the requested columns."],
    expectedOutput: ["Columns: order_id, amount, is_large", "is_large is true when amount >= 100", "Preserve row detail"],
    orderSensitive: false,
  }),
  buildDerivedLevel({
    levelNumber: 33,
    category: "derived-column",
    title: "Level 33: Build an amount bucket",
    theme: "derived-column",
    businessContext: "Ops wants a simple amount bucket for triage.",
    table: {
      name: "orders",
      frameName: "orders_df",
      columns: [
        { name: "order_id", type: "INTEGER" },
        { name: "amount", type: "REAL" },
      ],
      rows: [
        { order_id: 10, amount: 12.0 },
        { order_id: 11, amount: 75.0 },
        { order_id: 12, amount: 150.0 },
      ],
    },
    question: "Return `order_id`, `amount`, and add `amount_bucket`: `small` when amount < 50, otherwise `large`.",
    selection: [{ source: "order_id" }, { source: "amount" }],
    newColumn: "amount_bucket",
    sqlExpr: "CASE WHEN amount < 50 THEN 'small' ELSE 'large' END",
    pythonExpression: "'small' if row['amount'] < 50 else 'large'",
    deriveValue: (row) => (Number(row.amount) < 50 ? "small" : "large"),
    pysparkExpression:
      "F.when(F.col('amount') < 50, F.lit('small')).otherwise(F.lit('large'))",
    pysparkRequirements: [
      { label: "conditional logic", anyOf: ["when(", "amount < 50"] },
      { label: "new bucket name", anyOf: ["amount_bucket"] },
    ],
    successChecklist: ["Add the bucket column.", "Use the threshold 50.", "Return the requested columns."],
    expectedOutput: ["Columns: order_id, amount, amount_bucket", "Bucket is small below 50 and large otherwise", "Preserve row detail"],
    orderSensitive: false,
  }),
  buildDerivedLevel({
    levelNumber: 34,
    category: "derived-column",
    title: "Level 34: Extract email domain",
    theme: "derived-column",
    businessContext: "Marketing wants the domain portion of each email address.",
    table: {
      name: "customers",
      frameName: "customers_df",
      columns: [
        { name: "customer_id", type: "INTEGER" },
        { name: "email", type: "TEXT" },
      ],
      rows: [
        { customer_id: 1, email: "ava@example.com" },
        { customer_id: 2, email: "mia@sample.org" },
        { customer_id: 3, email: "liam@test.net" },
      ],
    },
    question: "Return `customer_id`, `email`, and add `email_domain` as the part after `@`.",
    selection: [{ source: "customer_id" }, { source: "email" }],
    newColumn: "email_domain",
    sqlExpr: "SUBSTR(email, INSTR(email, '@') + 1)",
    pythonExpression: "row['email'].split('@')[1]",
    deriveValue: (row) => String(row.email).split("@")[1],
    pysparkExpression: "F.split(F.col('email'), '@').getItem(1)",
    pysparkRequirements: [
      { label: "split logic", anyOf: ["split(", "substring("] },
      { label: "new domain column", anyOf: ["email_domain"] },
    ],
    successChecklist: ["Extract the part after @.", "Keep the original email.", "Return the requested columns."],
    expectedOutput: ["Columns: customer_id, email, email_domain", "email_domain contains the text after @", "Preserve row detail"],
    orderSensitive: false,
  }),
  buildDerivedLevel({
    levelNumber: 35,
    category: "derived-column",
    title: "Level 35: Build a full name",
    theme: "derived-column",
    businessContext: "A customer preview needs one display name column.",
    table: {
      name: "profiles",
      frameName: "profiles_df",
      columns: [
        { name: "first_name", type: "TEXT" },
        { name: "last_name", type: "TEXT" },
      ],
      rows: [
        { first_name: "Ava", last_name: "Stone" },
        { first_name: "Mia", last_name: "Cole" },
        { first_name: "Noah", last_name: "Reed" },
      ],
    },
    question: "Return `first_name`, `last_name`, and add `full_name` as `first_name + ' ' + last_name`.",
    selection: [{ source: "first_name" }, { source: "last_name" }],
    newColumn: "full_name",
    sqlExpr: "first_name || ' ' || last_name",
    pythonExpression: "row['first_name'] + ' ' + row['last_name']",
    deriveValue: (row) => `${row.first_name} ${row.last_name}`,
    pysparkExpression: "F.concat(F.col('first_name'), F.lit(' '), F.col('last_name'))",
    pysparkRequirements: [
      { label: "concatenation", anyOf: ["concat(", "concat_ws("] },
      { label: "full name column", anyOf: ["full_name"] },
    ],
    successChecklist: ["Build full_name from both name parts.", "Keep first_name and last_name too.", "Return the requested columns."],
    expectedOutput: ["Columns: first_name, last_name, full_name", "full_name combines first and last name", "Preserve row detail"],
    orderSensitive: false,
  }),
  buildDerivedLevel({
    levelNumber: 36,
    category: "derived-column",
    title: "Level 36: Derive order month",
    theme: "derived-column",
    businessContext: "A finance preview needs the month portion of each order date.",
    table: {
      name: "orders",
      frameName: "orders_df",
      columns: [
        { name: "order_id", type: "INTEGER" },
        { name: "order_date", type: "TEXT" },
      ],
      rows: [
        { order_id: 1, order_date: "2026-01-03" },
        { order_id: 2, order_date: "2026-02-17" },
        { order_id: 3, order_date: "2026-02-28" },
      ],
    },
    question: "Return `order_id`, `order_date`, and add `order_month` as the `YYYY-MM` portion of `order_date`.",
    selection: [{ source: "order_id" }, { source: "order_date" }],
    newColumn: "order_month",
    sqlExpr: "SUBSTR(order_date, 1, 7)",
    pythonExpression: "row['order_date'][:7]",
    deriveValue: (row) => String(row.order_date).slice(0, 7),
    pysparkExpression: "F.substring(F.col('order_date'), 1, 7)",
    pysparkRequirements: [
      { label: "substring logic", anyOf: ["substring(", "substr("] },
      { label: "order_month column", anyOf: ["order_month"] },
    ],
    successChecklist: ["Take the YYYY-MM portion.", "Keep the original order_date.", "Return the requested columns."],
    expectedOutput: ["Columns: order_id, order_date, order_month", "order_month is the YYYY-MM prefix", "Preserve row detail"],
    orderSensitive: false,
  }),
] as const;

const aggregationLevels = [
  buildAggregationLevel({
    levelNumber: 37,
    category: "aggregation",
    title: "Level 37: Count paid orders by country",
    theme: "aggregation",
    businessContext: "A weekly summary needs the paid-order count per country.",
    table: {
      name: "orders",
      frameName: "orders_df",
      columns: [
        { name: "order_id", type: "INTEGER" },
        { name: "country", type: "TEXT" },
        { name: "status", type: "TEXT" },
      ],
      rows: [
        { order_id: 1, country: "US", status: "paid" },
        { order_id: 2, country: "US", status: "pending" },
        { order_id: 3, country: "CA", status: "paid" },
        { order_id: 4, country: "US", status: "paid" },
      ],
    },
    question: "Return one row per `country` with `paid_orders`, counting only rows where `status` is `paid`.",
    groupBy: "country",
    metricName: "paid_orders",
    sqlMetricExpr: "SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END)",
    pythonAccumulator: (groups) =>
      [...groups.entries()]
        .map(([country, rows]) => ({
          country,
          paid_orders: rows.filter((row) => row.status === "paid").length,
        }))
        .sort((a, b) => String(a.country).localeCompare(String(b.country))),
    pythonMetricBody: "{'country': key, 'paid_orders': sum(1 for row in rows if row['status'] == 'paid')}",
    successChecklist: ["Group by country.", "Count only paid rows.", "Name the metric paid_orders."],
    expectedOutput: ["One row per country", "Columns: country, paid_orders", "Count only paid rows"],
    orderSensitive: true,
    pysparkReferenceExpression:
      "F.sum(F.when(F.col('status') == 'paid', F.lit(1)).otherwise(F.lit(0))).alias('paid_orders')",
    pysparkRequirements: [
      { label: "count metric", anyOf: ["F.sum(", "F.count("] },
      { label: "paid_orders alias", anyOf: ["paid_orders"] },
      { label: "country group", anyOf: ["country"] },
    ],
  }),
  buildAggregationLevel({
    levelNumber: 38,
    category: "aggregation",
    title: "Level 38: Sum revenue by country",
    theme: "aggregation",
    businessContext: "Leadership wants revenue totals by country.",
    table: {
      name: "orders",
      frameName: "orders_df",
      columns: [
        { name: "country", type: "TEXT" },
        { name: "amount", type: "REAL" },
      ],
      rows: [
        { country: "US", amount: 40.0 },
        { country: "US", amount: 60.0 },
        { country: "CA", amount: 25.0 },
      ],
    },
    question: "Return one row per `country` with `total_revenue` as the sum of `amount`.",
    groupBy: "country",
    metricName: "total_revenue",
    sqlMetricExpr: "SUM(amount)",
    pythonAccumulator: (groups) =>
      [...groups.entries()]
        .map(([country, rows]) => ({
          country,
          total_revenue: rows.reduce((sum, row) => sum + Number(row.amount), 0),
        }))
        .sort((a, b) => String(a.country).localeCompare(String(b.country))),
    pythonMetricBody: "{'country': key, 'total_revenue': sum(row['amount'] for row in rows)}",
    successChecklist: ["Group by country.", "Sum amount into total_revenue.", "Name the metric clearly."],
    expectedOutput: ["One row per country", "Columns: country, total_revenue", "Sum all amount values"],
    orderSensitive: true,
    pysparkReferenceExpression: "F.sum('amount').alias('total_revenue')",
    pysparkRequirements: [
      { label: "sum metric", anyOf: ["F.sum('amount').alias('total_revenue')", 'F.sum("amount").alias("total_revenue")'] },
      { label: "country group", anyOf: ["country"] },
    ],
  }),
  buildAggregationLevel({
    levelNumber: 39,
    category: "aggregation",
    title: "Level 39: Average amount by payment method",
    theme: "aggregation",
    businessContext: "A payments review needs the average amount by method.",
    table: {
      name: "payments",
      frameName: "payments_df",
      columns: [
        { name: "method", type: "TEXT" },
        { name: "amount", type: "REAL" },
      ],
      rows: [
        { method: "card", amount: 20.0 },
        { method: "card", amount: 40.0 },
        { method: "wallet", amount: 30.0 },
      ],
    },
    question: "Return one row per `method` with `avg_amount` as the average of `amount`.",
    groupBy: "method",
    metricName: "avg_amount",
    sqlMetricExpr: "AVG(amount)",
    pythonAccumulator: (groups) =>
      [...groups.entries()]
        .map(([method, rows]) => ({
          method,
          avg_amount: rows.reduce((sum, row) => sum + Number(row.amount), 0) / rows.length,
        }))
        .sort((a, b) => String(a.method).localeCompare(String(b.method))),
    pythonMetricBody:
      "{'method': key, 'avg_amount': sum(row['amount'] for row in rows) / len(rows)}",
    successChecklist: ["Group by method.", "Average the amount column.", "Name the metric avg_amount."],
    expectedOutput: ["One row per method", "Columns: method, avg_amount", "Average amount values"],
    orderSensitive: true,
    pysparkReferenceExpression: "F.avg('amount').alias('avg_amount')",
    pysparkRequirements: [
      { label: "avg metric", anyOf: ["F.avg('amount').alias('avg_amount')", 'F.avg("amount").alias("avg_amount")'] },
      { label: "method group", anyOf: ["method"] },
    ],
  }),
  buildAggregationLevel({
    levelNumber: 40,
    category: "aggregation",
    title: "Level 40: Count distinct customers by status",
    theme: "aggregation",
    businessContext: "Operations wants the number of unique customers in each status bucket.",
    table: {
      name: "orders",
      frameName: "orders_df",
      columns: [
        { name: "status", type: "TEXT" },
        { name: "customer_id", type: "INTEGER" },
      ],
      rows: [
        { status: "paid", customer_id: 1 },
        { status: "paid", customer_id: 1 },
        { status: "paid", customer_id: 2 },
        { status: "pending", customer_id: 3 },
      ],
    },
    question: "Return one row per `status` with `unique_customers` as the distinct count of `customer_id`.",
    groupBy: "status",
    metricName: "unique_customers",
    sqlMetricExpr: "COUNT(DISTINCT customer_id)",
    pythonAccumulator: (groups) =>
      [...groups.entries()]
        .map(([status, rows]) => ({
          status,
          unique_customers: new Set(rows.map((row) => row.customer_id)).size,
        }))
        .sort((a, b) => String(a.status).localeCompare(String(b.status))),
    pythonMetricBody:
      "{'status': key, 'unique_customers': len({row['customer_id'] for row in rows})}",
    successChecklist: ["Group by status.", "Count distinct customer_id values.", "Name the metric unique_customers."],
    expectedOutput: ["One row per status", "Columns: status, unique_customers", "Use distinct customer counts"],
    orderSensitive: true,
    pysparkReferenceExpression: "F.countDistinct('customer_id').alias('unique_customers')",
    pysparkRequirements: [
      { label: "distinct customer count", anyOf: ["countDistinct('customer_id').alias('unique_customers')", 'countDistinct("customer_id").alias("unique_customers")'] },
      { label: "status group", anyOf: ["status"] },
    ],
  }),
  buildAggregationLevel({
    levelNumber: 41,
    category: "aggregation",
    title: "Level 41: Count files by source system",
    theme: "aggregation",
    businessContext: "A pipeline summary wants the number of files by source system.",
    table: {
      name: "file_loads",
      frameName: "loads_df",
      columns: [
        { name: "source_system", type: "TEXT" },
        { name: "file_name", type: "TEXT" },
      ],
      rows: [
        { source_system: "crm", file_name: "crm_01.csv" },
        { source_system: "billing", file_name: "bill_01.csv" },
        { source_system: "crm", file_name: "crm_02.csv" },
      ],
    },
    question: "Return one row per `source_system` with `file_count` as the number of files.",
    groupBy: "source_system",
    metricName: "file_count",
    sqlMetricExpr: "COUNT(*)",
    pythonAccumulator: (groups) =>
      [...groups.entries()]
        .map(([source_system, rows]) => ({
          source_system,
          file_count: rows.length,
        }))
        .sort((a, b) => String(a.source_system).localeCompare(String(b.source_system))),
    pythonMetricBody: "{'source_system': key, 'file_count': len(rows)}",
    successChecklist: ["Group by source_system.", "Count files with COUNT(*).", "Name the metric file_count."],
    expectedOutput: ["One row per source_system", "Columns: source_system, file_count", "Count all rows in each group"],
    orderSensitive: true,
    pysparkReferenceExpression: "F.count('*').alias('file_count')",
    pysparkRequirements: [
      { label: "count all rows", anyOf: ["F.count('*').alias('file_count')", 'F.count("*").alias("file_count")'] },
      { label: "source system group", anyOf: ["source_system"] },
    ],
  }),
] as const;

const stringCleaningLevels = [
  buildDerivedLevel({
    levelNumber: 42,
    category: "string-cleaning",
    title: "Level 42: Trim and lowercase email",
    theme: "string-cleaning",
    businessContext: "A customer export needs normalized email text.",
    table: {
      name: "customers",
      frameName: "customers_df",
      columns: [
        { name: "customer_id", type: "INTEGER" },
        { name: "email", type: "TEXT" },
      ],
      rows: [
        { customer_id: 1, email: " Ava@Example.com " },
        { customer_id: 2, email: "MIA@SAMPLE.ORG " },
        { customer_id: 3, email: " liam@test.net" },
      ],
    },
    question: "Return `customer_id`, `email`, and add `email_clean` by trimming and lowercasing `email`.",
    selection: [{ source: "customer_id" }, { source: "email" }],
    newColumn: "email_clean",
    sqlExpr: "LOWER(TRIM(email))",
    pythonExpression: "row['email'].strip().lower()",
    deriveValue: (row) => String(row.email).trim().toLowerCase(),
    pysparkExpression: "F.lower(F.trim(F.col('email')))",
    pysparkRequirements: [
      { label: "trim and lower", anyOf: ["trim(", "lower("] },
      { label: "email_clean column", anyOf: ["email_clean"] },
    ],
    successChecklist: ["Trim surrounding whitespace.", "Lowercase the text.", "Keep the original email too."],
    expectedOutput: ["Columns: customer_id, email, email_clean", "email_clean is trimmed and lowercased", "Preserve row detail"],
    orderSensitive: false,
  }),
  buildDerivedLevel({
    levelNumber: 43,
    category: "string-cleaning",
    title: "Level 43: Uppercase country code",
    theme: "string-cleaning",
    businessContext: "A geography feed needs normalized country code text.",
    table: {
      name: "customers",
      frameName: "customers_df",
      columns: [
        { name: "customer_id", type: "INTEGER" },
        { name: "country", type: "TEXT" },
      ],
      rows: [
        { customer_id: 1, country: "us" },
        { customer_id: 2, country: "ca" },
        { customer_id: 3, country: "in" },
      ],
    },
    question: "Return `customer_id`, `country`, and add `country_upper` by uppercasing `country`.",
    selection: [{ source: "customer_id" }, { source: "country" }],
    newColumn: "country_upper",
    sqlExpr: "UPPER(country)",
    pythonExpression: "row['country'].upper()",
    deriveValue: (row) => String(row.country).toUpperCase(),
    pysparkExpression: "F.upper(F.col('country'))",
    pysparkRequirements: [
      { label: "upper function", anyOf: ["upper("] },
      { label: "country_upper column", anyOf: ["country_upper"] },
    ],
    successChecklist: ["Uppercase the country code.", "Keep the original country too.", "Return the requested columns."],
    expectedOutput: ["Columns: customer_id, country, country_upper", "country_upper is uppercase text", "Preserve row detail"],
    orderSensitive: false,
  }),
  buildDerivedLevel({
    levelNumber: 44,
    category: "string-cleaning",
    title: "Level 44: Normalize status text",
    theme: "string-cleaning",
    businessContext: "A feed mixes status casing and padding that need cleanup.",
    table: {
      name: "orders",
      frameName: "orders_df",
      columns: [
        { name: "order_id", type: "INTEGER" },
        { name: "status", type: "TEXT" },
      ],
      rows: [
        { order_id: 1, status: " Paid " },
        { order_id: 2, status: "PENDING " },
        { order_id: 3, status: " failed" },
      ],
    },
    question: "Return `order_id`, `status`, and add `status_clean` by trimming and lowercasing `status`.",
    selection: [{ source: "order_id" }, { source: "status" }],
    newColumn: "status_clean",
    sqlExpr: "LOWER(TRIM(status))",
    pythonExpression: "row['status'].strip().lower()",
    deriveValue: (row) => String(row.status).trim().toLowerCase(),
    pysparkExpression: "F.lower(F.trim(F.col('status')))",
    pysparkRequirements: [
      { label: "trim and lower", anyOf: ["trim(", "lower("] },
      { label: "status_clean column", anyOf: ["status_clean"] },
    ],
    successChecklist: ["Trim whitespace.", "Lowercase the text.", "Keep the original status too."],
    expectedOutput: ["Columns: order_id, status, status_clean", "status_clean is trimmed and lowercased", "Preserve row detail"],
    orderSensitive: false,
  }),
  buildDerivedLevel({
    levelNumber: 45,
    category: "string-cleaning",
    title: "Level 45: Replace spaces in product names",
    theme: "string-cleaning",
    businessContext: "A file export wants product labels without spaces.",
    table: {
      name: "products",
      frameName: "products_df",
      columns: [
        { name: "product_id", type: "INTEGER" },
        { name: "product_name", type: "TEXT" },
      ],
      rows: [
        { product_id: 1, product_name: "Phone Stand" },
        { product_id: 2, product_name: "Mouse Pad" },
        { product_id: 3, product_name: "Desk Lamp" },
      ],
    },
    question: "Return `product_id`, `product_name`, and add `product_slug` by replacing spaces with underscores in `product_name`.",
    selection: [{ source: "product_id" }, { source: "product_name" }],
    newColumn: "product_slug",
    sqlExpr: "REPLACE(product_name, ' ', '_')",
    pythonExpression: "row['product_name'].replace(' ', '_')",
    deriveValue: (row) => String(row.product_name).replace(/ /g, "_"),
    pysparkExpression: "F.regexp_replace(F.col('product_name'), ' ', '_')",
    pysparkRequirements: [
      { label: "replace logic", anyOf: ["replace(", "regexp_replace("] },
      { label: "product_slug column", anyOf: ["product_slug"] },
    ],
    successChecklist: ["Replace spaces with underscores.", "Keep the original product_name too.", "Return the requested columns."],
    expectedOutput: ["Columns: product_id, product_name, product_slug", "product_slug replaces spaces with underscores", "Preserve row detail"],
    orderSensitive: false,
  }),
] as const;

const dateFilteringLevels = [
  buildFilterLevel({
    levelNumber: 46,
    category: "date-filtering",
    title: "Level 46: Orders on or after January 1",
    theme: "date-filtering",
    businessContext: "A YTD preview needs only more recent orders.",
    table: {
      name: "orders",
      frameName: "orders_df",
      columns: [
        { name: "order_id", type: "INTEGER" },
        { name: "order_date", type: "TEXT" },
        { name: "amount", type: "REAL" },
      ],
      rows: [
        { order_id: 1, order_date: "2025-12-31", amount: 10.0 },
        { order_id: 2, order_date: "2026-01-01", amount: 12.0 },
        { order_id: 3, order_date: "2026-01-05", amount: 18.0 },
      ],
    },
    question: "Return only rows where `order_date >= '2026-01-01'`.",
    selection: [{ source: "order_id" }, { source: "order_date" }, { source: "amount" }],
    predicateDescription: "Keeps only rows on or after 2026-01-01.",
    sqlWhere: "order_date >= '2026-01-01'",
    pythonCondition: "row['order_date'] >= '2026-01-01'",
    predicate: (row) => String(row.order_date) >= "2026-01-01",
    pysparkCondition: "F.col('order_date') >= '2026-01-01'",
    pysparkRequirements: [
      { label: "date filter", anyOf: ["order_date", "2026-01-01"] },
      { label: "comparison", anyOf: [">=", ">="] },
    ],
    successChecklist: ["Use the date boundary directly.", "Keep only recent rows.", "Return the requested columns."],
    expectedOutput: ["Rows on or after 2026-01-01", "Columns: order_id, order_date, amount", "Preserve row detail"],
    orderSensitive: false,
  }),
  buildFilterLevel({
    levelNumber: 47,
    category: "date-filtering",
    title: "Level 47: Events in a May window",
    theme: "date-filtering",
    businessContext: "Product wants only events from a specific May window.",
    table: {
      name: "events",
      frameName: "events_df",
      columns: [
        { name: "event_id", type: "INTEGER" },
        { name: "event_time", type: "TEXT" },
        { name: "event_type", type: "TEXT" },
      ],
      rows: [
        { event_id: 1, event_time: "2026-04-30T23:59:00", event_type: "open" },
        { event_id: 2, event_time: "2026-05-10T10:00:00", event_type: "purchase" },
        { event_id: 3, event_time: "2026-05-20T14:00:00", event_type: "open" },
        { event_id: 4, event_time: "2026-06-01T00:00:00", event_type: "close" },
      ],
    },
    question: "Return only rows where `event_time` is between `2026-05-01` and `2026-05-31T23:59:59`.",
    selection: [{ source: "event_id" }, { source: "event_time" }, { source: "event_type" }],
    predicateDescription: "Keeps only events inside the May window.",
    sqlWhere: "event_time >= '2026-05-01' AND event_time <= '2026-05-31T23:59:59'",
    pythonCondition: "row['event_time'] >= '2026-05-01' and row['event_time'] <= '2026-05-31T23:59:59'",
    predicate: (row) => String(row.event_time) >= "2026-05-01" && String(row.event_time) <= "2026-05-31T23:59:59",
    pysparkCondition:
      "(F.col('event_time') >= '2026-05-01') & (F.col('event_time') <= '2026-05-31T23:59:59')",
    pysparkRequirements: [
      { label: "date lower bound", anyOf: ["2026-05-01"] },
      { label: "date upper bound", anyOf: ["2026-05-31T23:59:59"] },
      { label: "combined condition", anyOf: ["&", " AND "] },
    ],
    successChecklist: ["Apply both date boundaries.", "Exclude rows outside the window.", "Return the requested columns."],
    expectedOutput: ["Rows inside the May date window", "Columns: event_id, event_time, event_type", "Preserve row detail"],
    orderSensitive: false,
  }),
  buildFilterLevel({
    levelNumber: 48,
    category: "date-filtering",
    title: "Level 48: Shipments in July only",
    theme: "date-filtering",
    businessContext: "Ops wants the July shipment slice only.",
    table: {
      name: "shipments",
      frameName: "shipments_df",
      columns: [
        { name: "shipment_id", type: "INTEGER" },
        { name: "business_date", type: "TEXT" },
        { name: "status", type: "TEXT" },
      ],
      rows: [
        { shipment_id: 1, business_date: "2026-06-30", status: "packed" },
        { shipment_id: 2, business_date: "2026-07-05", status: "shipped" },
        { shipment_id: 3, business_date: "2026-07-28", status: "delivered" },
      ],
    },
    question: "Return only rows where `business_date` is in July 2026.",
    selection: [{ source: "shipment_id" }, { source: "business_date" }, { source: "status" }],
    predicateDescription: "Keeps only July 2026 shipments.",
    sqlWhere: "business_date >= '2026-07-01' AND business_date <= '2026-07-31'",
    pythonCondition: "row['business_date'] >= '2026-07-01' and row['business_date'] <= '2026-07-31'",
    predicate: (row) => String(row.business_date) >= "2026-07-01" && String(row.business_date) <= "2026-07-31",
    pysparkCondition:
      "(F.col('business_date') >= '2026-07-01') & (F.col('business_date') <= '2026-07-31')",
    pysparkRequirements: [
      { label: "july lower bound", anyOf: ["2026-07-01"] },
      { label: "july upper bound", anyOf: ["2026-07-31"] },
      { label: "combined condition", anyOf: ["&", " AND "] },
    ],
    successChecklist: ["Apply the July start date.", "Apply the July end date.", "Return the requested columns."],
    expectedOutput: ["Rows in July 2026", "Columns: shipment_id, business_date, status", "Preserve row detail"],
    orderSensitive: false,
  }),
] as const;

const debuggingLevels = [
  buildFilterLevel({
    levelNumber: 49,
    category: "debugging",
    title: "Level 49: Fix valid paid order logic",
    theme: "debugging",
    businessContext: "A broken cleanup step is mixing valid and invalid paid rows.",
    table: {
      name: "orders",
      frameName: "orders_df",
      columns: [
        { name: "order_id", type: "INTEGER" },
        { name: "status", type: "TEXT" },
        { name: "amount", type: "REAL" },
      ],
      rows: [
        { order_id: 1, status: "paid", amount: 50.0 },
        { order_id: 2, status: "paid", amount: 0.0 },
        { order_id: 3, status: "failed", amount: 20.0 },
      ],
    },
    question: "Return only valid paid rows: `status = 'paid'` and `amount > 0`.",
    selection: [{ source: "order_id" }, { source: "status" }, { source: "amount" }],
    predicateDescription: "Keeps only valid paid rows.",
    sqlWhere: "status = 'paid' AND amount > 0",
    pythonCondition: "row['status'] == 'paid' and row['amount'] > 0",
    predicate: (row) => row.status === "paid" && Number(row.amount) > 0,
    pysparkCondition: "(F.col('status') == 'paid') & (F.col('amount') > 0)",
    pysparkRequirements: [
      { label: "paid status", anyOf: ["paid"] },
      { label: "positive amount", anyOf: ["> 0"] },
      { label: "combined condition", anyOf: ["&", " AND "] },
    ],
    successChecklist: ["Apply both business rules.", "Exclude invalid paid rows.", "Return the requested columns."],
    expectedOutput: ["Only valid paid rows", "Columns: order_id, status, amount", "Preserve row detail"],
    orderSensitive: false,
  }),
  buildDedupeLevel({
    levelNumber: 50,
    category: "debugging",
    title: "Level 50: Fix the latest profile winner",
    theme: "debugging",
    businessContext: "A sync bug is keeping stale customer profile rows.",
    table: {
      name: "profiles",
      frameName: "profiles_df",
      columns: [
        { name: "customer_id", type: "INTEGER" },
        { name: "status", type: "TEXT" },
        { name: "updated_at", type: "TEXT" },
      ],
      rows: [
        { customer_id: 1, status: "old", updated_at: "2026-07-01T09:00:00" },
        { customer_id: 1, status: "current", updated_at: "2026-07-01T10:00:00" },
        { customer_id: 2, status: "current", updated_at: "2026-07-01T09:30:00" },
      ],
    },
    question: "Return only the latest row per `customer_id` using the largest `updated_at`.",
    selection: [{ source: "customer_id" }, { source: "status" }, { source: "updated_at" }],
    keyColumn: "customer_id",
    sortColumn: "updated_at",
    successChecklist: ["Deduplicate by customer_id.", "Use updated_at as the winner rule.", "Return one row per customer_id."],
    expectedOutput: ["One row per customer_id", "Columns: customer_id, status, updated_at", "Keep the latest updated_at row"],
    orderSensitive: false,
  }),
] as const;

export const arcadeWorldOneBundles = [
  ...projectionLevels,
  ...filteringLevels,
  ...sortingAndLimitingLevels,
  ...nullHandlingLevels,
  ...dedupeLevels,
  ...derivedLevels,
  ...aggregationLevels,
  ...stringCleaningLevels,
  ...dateFilteringLevels,
  ...debuggingLevels,
];

if (arcadeWorldOneBundles.length !== 50) {
  throw new Error(`Arcade World 1 must contain 50 levels. Received ${arcadeWorldOneBundles.length}.`);
}

export const arcadeWorldOneBundleMap = new Map(
  arcadeWorldOneBundles.map((bundle) => [bundle.levelNumber, bundle]),
);

export function getArcadeWorldOneBundle(levelNumber: number) {
  return arcadeWorldOneBundleMap.get(levelNumber) ?? null;
}
