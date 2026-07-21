import type {
  ArcadeDatasetContract,
  ArcadeResultContract,
  ArcadeWorldOneLevelBundle,
} from "@/lib/arcade-world-one";
import type { StructuralRequirement } from "@/lib/mastery-exercises";

export type ArcadePrimitive = string | number | boolean | null;
export type ArcadeRow = Record<string, ArcadePrimitive>;

export type ArcadeColumn = {
  name: string;
  type: "INTEGER" | "REAL" | "TEXT";
};

export type ArcadeTableFixture = {
  name: string;
  frameName: string;
  columns: ArcadeColumn[];
  rows: ArcadeRow[];
};

export type TablesInput = Record<string, ArcadeRow[]>;

export type AdvancedArcadeCategory =
  | "multi-table-joins"
  | "joined-aggregation"
  | "group-ranking"
  | "latest-entity-state"
  | "reconciliation"
  | "window-logic"
  | "cohort-retention"
  | "rolling-metrics"
  | "first-last-event"
  | "business-deduplication"
  | "dirty-cleanup"
  | "null-handling"
  | "schema-normalization"
  | "string-date-parsing"
  | "quality-gates"
  | "pipeline-debugging"
  | "bad-join-debugging"
  | "metric-investigation"
  | "source-target-checks"
  | "anomaly-detection"
  | "customer-lifecycle"
  | "revenue-analysis"
  | "sla-timing"
  | "advanced-validation";

export interface AdvancedArcadeLevelBundle extends Omit<ArcadeWorldOneLevelBundle, "category"> {
  category: AdvancedArcadeCategory;
}

export type AdvancedSeed = {
  levelNumber: number;
  worldNumber: number;
  category: AdvancedArcadeCategory;
  title: string;
  theme: string;
  businessContext: string;
  question: string;
  tables: ArcadeTableFixture[];
  expectedOutput: string[];
  successChecklist: string[];
  orderSensitive: boolean;
  deriveExpected: (input: TablesInput) => ArcadeRow[];
  sqlReferenceSolution: string;
  pythonReferenceSolution: string;
  pysparkReferenceSolution: string;
  pysparkRequirements: StructuralRequirement[];
  pysparkHiddenRequirements?: StructuralRequirement[];
  representativeIncorrectAnswers?: Record<"sql" | "python" | "pyspark", string>;
};

export type FamilyContext = {
  levelNumber: number;
  worldNumber: number;
  familyIndex: number;
  variant: number;
  threshold: number;
  minOrders: number;
  days: number;
  topN: number;
  status: "paid" | "completed";
  country: string;
  channel: string;
  month: string;
};

export type FamilyBuilder = (context: FamilyContext) => AdvancedSeed;

const countryCycle = ["US", "CA", "IN", "GB", "AU"];
const channelCycle = ["web", "mobile", "store", "partner", "api"];

export function cloneRows(rows: ArcadeRow[]) {
  return rows.map((row) => ({ ...row }));
}

export function cloneInput(input: TablesInput) {
  return Object.fromEntries(
    Object.entries(input).map(([name, rows]) => [name, cloneRows(rows)]),
  ) as TablesInput;
}

function reverseInput(input: TablesInput) {
  return Object.fromEntries(
    Object.entries(input).map(([name, rows]) => [name, cloneRows([...rows].reverse())]),
  ) as TablesInput;
}

function toInput(tables: ArcadeTableFixture[]) {
  return Object.fromEntries(tables.map((table) => [table.name, cloneRows(table.rows)])) as TablesInput;
}

export function table(name: string, frameName: string, columns: ArcadeColumn[], rows: ArcadeRow[]): ArcadeTableFixture {
  return { name, frameName, columns, rows };
}

function sqlLiteral(value: ArcadePrimitive) {
  if (value === null) return "NULL";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "1" : "0";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function createSetupSql(tables: ArcadeTableFixture[]) {
  return tables
    .map((fixture) => {
      const createSql = `CREATE TABLE ${fixture.name} (${fixture.columns
        .map((column) => `${column.name} ${column.type}`)
        .join(", ")});`;
      const insertSql = fixture.rows
        .map(
          (row) =>
            `INSERT INTO ${fixture.name} (${fixture.columns.map((column) => column.name).join(", ")}) VALUES (${fixture.columns
              .map((column) => sqlLiteral((row[column.name] ?? null) as ArcadePrimitive))
              .join(", ")});`,
        )
        .join("\n");
      return `${createSql}\n${insertSql}`;
    })
    .join("\n");
}

function comparePrimitive(left: ArcadePrimitive, right: ArcadePrimitive) {
  if (left === right) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  if (typeof left === "number" && typeof right === "number") return left - right;
  return String(left).localeCompare(String(right));
}

export function sortRows(rows: ArcadeRow[], fields: Array<[string, "asc" | "desc"]>) {
  return [...rows].sort((left, right) => {
    for (const [column, direction] of fields) {
      const comparison = comparePrimitive(left[column] ?? null, right[column] ?? null);
      if (comparison !== 0) return direction === "asc" ? comparison : comparison * -1;
    }
    return 0;
  });
}

function normalizeFingerprint(value: string) {
  return value.toLowerCase().replace(/\s+/gu, " ").trim();
}

function buildDatasetContract(levelNumber: number, tables: ArcadeTableFixture[]): ArcadeDatasetContract {
  return {
    datasetId: `arcade-world-${Math.ceil(levelNumber / 50)}-level-${String(levelNumber).padStart(4, "0")}`,
    tables: tables.map((fixture) => ({
      name: fixture.name,
      frameName: fixture.frameName,
      columns: fixture.columns.map((column) => ({ ...column })),
      rows: cloneRows(fixture.rows),
    })),
    primaryTableName: tables[0]?.name ?? "unknown",
    nullBehavior: "Preserve nulls unless the task asks for cleanup or filtering.",
    duplicateBehavior: "Preserve duplicates unless the task asks for deduplication or aggregation.",
    numericComparisonRule: "Match numeric output exactly against the expected rows.",
  };
}

function buildResultContract(expectedRows: ArcadeRow[], orderSensitive: boolean): ArcadeResultContract {
  return {
    requiredOutputColumns: expectedRows[0] ? Object.keys(expectedRows[0]) : [],
    expectedRows: cloneRows(expectedRows),
    orderSensitive,
    nullBehavior: "Null values must match the expected rows exactly.",
    duplicateBehavior: "Duplicate rows must match the expected rows exactly.",
    numericComparisonRule: "Numeric values must match the expected rows exactly.",
  };
}

function buildFingerprint(seed: AdvancedSeed, datasetContract: ArcadeDatasetContract, resultContract: ArcadeResultContract) {
  return normalizeFingerprint(
    [
      seed.worldNumber,
      seed.category,
      seed.question,
      datasetContract.datasetId,
      datasetContract.tables
        .map((fixture) => `${fixture.name}:${fixture.columns.map((column) => column.name).join(",")}:${JSON.stringify(fixture.rows)}`)
        .join("|"),
      JSON.stringify(resultContract.expectedRows),
      resultContract.orderSensitive ? "ordered" : "unordered",
    ].join(" | "),
  );
}

function buildPythonStarter(tables: ArcadeTableFixture[]) {
  return [...tables.map((fixture) => `# use data['${fixture.name}']`), "result = []"].join("\n");
}

function buildPysparkStarter(tables: ArcadeTableFixture[]) {
  return [
    "from pyspark.sql import functions as F",
    "from pyspark.sql import Window",
    "",
    ...tables.map((fixture) => `# assume ${fixture.frameName} already exists`),
    `result_df = ${tables[0]?.frameName ?? "df"}`,
  ].join("\n");
}

export function buildBundle(seed: AdvancedSeed): AdvancedArcadeLevelBundle {
  const visibleInput = toInput(seed.tables);
  const hiddenInput = reverseInput(visibleInput);
  const visibleExpected = seed.deriveExpected(cloneInput(visibleInput));
  const hiddenExpected = seed.deriveExpected(cloneInput(hiddenInput));
  const datasetContract = buildDatasetContract(seed.levelNumber, seed.tables);
  const resultContract = buildResultContract(visibleExpected, seed.orderSensitive);
  const representativeIncorrectAnswers = seed.representativeIncorrectAnswers ?? {
    sql: `SELECT * FROM ${seed.tables[0]?.name};`,
    python: `result = data['${seed.tables[0]?.name}']`,
    pyspark: `result_df = ${seed.tables[0]?.frameName}`,
  };

  return {
    levelNumber: seed.levelNumber,
    category: seed.category,
    sharedTask: seed.question,
    datasetContract,
    resultContract,
    uniqueLogicFingerprint: buildFingerprint(seed, datasetContract, resultContract),
    representativeIncorrectAnswers,
    level: {
      levelNumber: seed.levelNumber,
      title: seed.title,
      theme: seed.theme,
      prompt: `Solve this ${seed.category.replace(/-/g, " ")} arcade task across SQL, Python, and PySpark.`,
      question: seed.question,
      businessContext: seed.businessContext,
      dataset: seed.tables.flatMap((fixture) => [
        `Table: ${fixture.name}`,
        `Columns: ${fixture.columns.map((column) => column.name).join(", ")}`,
        `Python input: data['${fixture.name}']`,
        `PySpark input: ${fixture.frameName}`,
      ]),
      expectedOutput: seed.expectedOutput,
      successChecklist: seed.successChecklist,
      sqlGoal: "Write SQL that returns only the requested result.",
      pythonGoal: "Write Python using data tables and assign the final list to result.",
      pysparkGoal: "Write PySpark using DataFrames and assign the final DataFrame to result_df.",
    },
    sql: {
      starterCode: "",
      referenceSolution: seed.sqlReferenceSolution,
      setupSql: createSetupSql(seed.tables),
      orderSensitive: seed.orderSensitive,
      validatorVersion: 3,
    },
    python: {
      starterCode: buildPythonStarter(seed.tables),
      referenceSolution: seed.pythonReferenceSolution,
      inputVariableName: "data",
      resultVariable: "result",
      visibleCases: [
        {
          description: "Returns the required result for the visible fixture.",
          input: cloneInput(visibleInput),
          expected: visibleExpected,
        },
      ],
      hiddenCases: [
        {
          description: "Keeps the same logic when row order changes.",
          input: cloneInput(hiddenInput),
          expected: hiddenExpected,
        },
      ],
      validatorVersion: 3,
    },
    pyspark: {
      starterCode: buildPysparkStarter(seed.tables),
      referenceSolution: seed.pysparkReferenceSolution,
      requirements: [
        { label: "final dataframe assignment", anyOf: ["result_df ="] },
        ...seed.pysparkRequirements,
      ],
      hiddenRequirements: seed.pysparkHiddenRequirements ?? [],
      forbiddenPatterns: [".collect(", ".toPandas("],
      resultExpectation: seed.expectedOutput.join(" "),
      validatorVersion: 3,
    },
  };
}

function buildTables(context: FamilyContext) {
  const { levelNumber, variant } = context;
  const offset = levelNumber * 10;
  const customers = [
    { customer_id: 1, customer_name: `Ava ${levelNumber}`, country: "US", segment: "enterprise", signup_date: "2026-01-02", tier: "gold" },
    { customer_id: 2, customer_name: `Ben ${levelNumber}`, country: "CA", segment: "smb", signup_date: "2026-01-05", tier: "silver" },
    { customer_id: 3, customer_name: `Cara ${levelNumber}`, country: "IN", segment: "enterprise", signup_date: "2026-02-03", tier: "gold" },
    { customer_id: 4, customer_name: `Drew ${levelNumber}`, country: "GB", segment: "mid-market", signup_date: "2026-02-10", tier: "bronze" },
    { customer_id: 5, customer_name: `Eli ${levelNumber}`, country: "AU", segment: "smb", signup_date: "2026-03-01", tier: "silver" },
    { customer_id: 6, customer_name: `Finn ${levelNumber}`, country: "US", segment: "smb", signup_date: "2026-03-05", tier: "bronze" },
  ];
  const orders = [
    { order_id: offset + 1, customer_id: 1, status: "paid", amount: 120 + variant * 7, order_date: "2026-03-01", channel: "web" },
    { order_id: offset + 2, customer_id: 1, status: "completed", amount: 80 + variant * 5, order_date: "2026-03-06", channel: "mobile" },
    { order_id: offset + 3, customer_id: 2, status: "paid", amount: 55 + variant * 9, order_date: "2026-03-10", channel: "store" },
    { order_id: offset + 4, customer_id: 3, status: "cancelled", amount: 210 + variant * 11, order_date: "2026-03-11", channel: "web" },
    { order_id: offset + 5, customer_id: 3, status: "paid", amount: 190 + variant * 13, order_date: "2026-03-15", channel: "partner" },
    { order_id: offset + 6, customer_id: 4, status: "paid", amount: 45 + variant * 6, order_date: "2026-03-20", channel: "api" },
    { order_id: offset + 7, customer_id: 5, status: "completed", amount: 160 + variant * 4, order_date: "2026-04-02", channel: "web" },
    { order_id: offset + 8, customer_id: 99, status: "paid", amount: 70 + variant * 3, order_date: "2026-04-04", channel: "mobile" },
  ];
  const payments = [
    { order_id: offset + 1, payment_status: "settled", paid_amount: 120 + variant * 7, payment_method: "card", paid_at: "2026-03-01T10:00:00" },
    { order_id: offset + 2, payment_status: "settled", paid_amount: 75 + variant * 5, payment_method: "wallet", paid_at: "2026-03-06T11:00:00" },
    { order_id: offset + 3, payment_status: "failed", paid_amount: 55 + variant * 9, payment_method: "card", paid_at: "2026-03-10T09:00:00" },
    { order_id: offset + 5, payment_status: "settled", paid_amount: 190 + variant * 13, payment_method: "bank", paid_at: "2026-03-15T13:00:00" },
    { order_id: offset + 8, payment_status: "settled", paid_amount: 70 + variant * 3, payment_method: "card", paid_at: "2026-04-04T14:00:00" },
    { order_id: offset + 9, payment_status: "settled", paid_amount: 33 + variant, payment_method: "wallet", paid_at: "2026-04-05T14:00:00" },
  ];
  const orderItems = [
    { order_id: offset + 1, sku: "SKU-A", quantity: 2, unit_price: 50 + variant },
    { order_id: offset + 1, sku: "SKU-B", quantity: 1, unit_price: 20 + variant },
    { order_id: offset + 2, sku: "SKU-C", quantity: 2, unit_price: 40 + variant },
    { order_id: offset + 3, sku: "SKU-A", quantity: 1, unit_price: 55 + variant },
    { order_id: offset + 5, sku: "SKU-D", quantity: 5, unit_price: 38 + variant },
    { order_id: offset + 7, sku: "SKU-B", quantity: 4, unit_price: 40 + variant },
    { order_id: offset + 8, sku: "SKU-X", quantity: 1, unit_price: 70 + variant },
  ];
  const products = [
    { sku: "SKU-A", canonical_sku: "CAN-A", category: "hardware", margin_rate: 0.32 },
    { sku: "SKU-B", canonical_sku: "CAN-B", category: "home", margin_rate: 0.24 },
    { sku: "SKU-C", canonical_sku: "CAN-C", category: "software", margin_rate: 0.55 },
    { sku: "SKU-D", canonical_sku: "CAN-D", category: "hardware", margin_rate: 0.28 },
  ];
  const shipments = [
    { order_id: offset + 1, shipped_at: "2026-03-02T08:00:00", delivered_at: "2026-03-04T12:00:00", carrier: "ups", shipment_status: "delivered" },
    { order_id: offset + 2, shipped_at: "2026-03-08T09:00:00", delivered_at: "2026-03-12T09:00:00", carrier: "dhl", shipment_status: "late" },
    { order_id: offset + 5, shipped_at: "2026-03-16T07:00:00", delivered_at: "2026-03-18T10:00:00", carrier: "fedex", shipment_status: "delivered" },
    { order_id: offset + 6, shipped_at: "2026-03-20T08:00:00", delivered_at: "2026-03-27T08:00:00", carrier: "dhl", shipment_status: "late" },
    { order_id: offset + 7, shipped_at: "2026-04-03T08:00:00", delivered_at: null, carrier: "ups", shipment_status: "in_transit" },
  ];
  const events = [
    { event_id: offset + 101, customer_id: 1, session_id: `s-${levelNumber}-1`, event_type: "visit", event_time: "2026-03-01T08:00:00", priority: 1 },
    { event_id: offset + 102, customer_id: 1, session_id: `s-${levelNumber}-1`, event_type: "checkout", event_time: "2026-03-01T08:10:00", priority: 2 },
    { event_id: offset + 103, customer_id: 1, session_id: `s-${levelNumber}-1`, event_type: "payment", event_time: "2026-03-01T08:20:00", priority: 3 },
    { event_id: offset + 104, customer_id: 2, session_id: `s-${levelNumber}-2`, event_type: "visit", event_time: "2026-03-10T08:00:00", priority: 1 },
    { event_id: offset + 105, customer_id: 2, session_id: `s-${levelNumber}-2`, event_type: "checkout", event_time: "2026-03-10T08:50:00", priority: 2 },
    { event_id: offset + 106, customer_id: 3, session_id: `s-${levelNumber}-3`, event_type: "visit", event_time: "2026-03-15T10:00:00", priority: 1 },
    { event_id: offset + 107, customer_id: 3, session_id: `s-${levelNumber}-3`, event_type: "payment", event_time: "2026-03-15T10:18:00", priority: 3 },
  ];
  const rawCustomers = [
    { raw_id: offset + 201, raw_name: ` ava ${levelNumber} `, raw_email: ` AVA${levelNumber}@EXAMPLE.COM `, raw_country: " us ", raw_signup: "03/01/2026" },
    { raw_id: offset + 202, raw_name: `ben ${levelNumber}`, raw_email: null, raw_country: "ca", raw_signup: "03/05/2026" },
    { raw_id: offset + 203, raw_name: `cara ${levelNumber}`, raw_email: `cara${levelNumber}example.com`, raw_country: "", raw_signup: "bad-date" },
    { raw_id: offset + 204, raw_name: "", raw_email: `drew${levelNumber}@example.com`, raw_country: "gb", raw_signup: "03/12/2026" },
  ];
  const orderAudit = [
    { order_id: offset + 1, source_amount: 120 + variant * 7, target_amount: 120 + variant * 7, target_status: "paid" },
    { order_id: offset + 2, source_amount: 80 + variant * 5, target_amount: 75 + variant * 5, target_status: "paid" },
    { order_id: offset + 5, source_amount: 190 + variant * 13, target_amount: 190 + variant * 13, target_status: "paid" },
    { order_id: offset + 9, source_amount: 33 + variant, target_amount: null, target_status: null },
  ];

  return {
    customers: table("customers", "customers_df", [
      { name: "customer_id", type: "INTEGER" },
      { name: "customer_name", type: "TEXT" },
      { name: "country", type: "TEXT" },
      { name: "segment", type: "TEXT" },
      { name: "signup_date", type: "TEXT" },
      { name: "tier", type: "TEXT" },
    ], customers),
    orders: table("orders", "orders_df", [
      { name: "order_id", type: "INTEGER" },
      { name: "customer_id", type: "INTEGER" },
      { name: "status", type: "TEXT" },
      { name: "amount", type: "REAL" },
      { name: "order_date", type: "TEXT" },
      { name: "channel", type: "TEXT" },
    ], orders),
    payments: table("payments", "payments_df", [
      { name: "order_id", type: "INTEGER" },
      { name: "payment_status", type: "TEXT" },
      { name: "paid_amount", type: "REAL" },
      { name: "payment_method", type: "TEXT" },
      { name: "paid_at", type: "TEXT" },
    ], payments),
    orderItems: table("order_items", "order_items_df", [
      { name: "order_id", type: "INTEGER" },
      { name: "sku", type: "TEXT" },
      { name: "quantity", type: "INTEGER" },
      { name: "unit_price", type: "REAL" },
    ], orderItems),
    products: table("products", "products_df", [
      { name: "sku", type: "TEXT" },
      { name: "canonical_sku", type: "TEXT" },
      { name: "category", type: "TEXT" },
      { name: "margin_rate", type: "REAL" },
    ], products),
    shipments: table("shipments", "shipments_df", [
      { name: "order_id", type: "INTEGER" },
      { name: "shipped_at", type: "TEXT" },
      { name: "delivered_at", type: "TEXT" },
      { name: "carrier", type: "TEXT" },
      { name: "shipment_status", type: "TEXT" },
    ], shipments),
    events: table("events", "events_df", [
      { name: "event_id", type: "INTEGER" },
      { name: "customer_id", type: "INTEGER" },
      { name: "session_id", type: "TEXT" },
      { name: "event_type", type: "TEXT" },
      { name: "event_time", type: "TEXT" },
      { name: "priority", type: "INTEGER" },
    ], events),
    rawCustomers: table("raw_customers", "raw_customers_df", [
      { name: "raw_id", type: "INTEGER" },
      { name: "raw_name", type: "TEXT" },
      { name: "raw_email", type: "TEXT" },
      { name: "raw_country", type: "TEXT" },
      { name: "raw_signup", type: "TEXT" },
    ], rawCustomers),
    orderAudit: table("order_audit", "order_audit_df", [
      { name: "order_id", type: "INTEGER" },
      { name: "source_amount", type: "REAL" },
      { name: "target_amount", type: "REAL" },
      { name: "target_status", type: "TEXT" },
    ], orderAudit),
  };
}

export function tableRows(input: TablesInput, name: string) {
  return input[name] ?? [];
}

export function byKey(rows: ArcadeRow[], key: string) {
  return new Map(rows.map((row) => [row[key], row]));
}

export function sum(values: number[]) {
  return Number(values.reduce((total, value) => total + value, 0).toFixed(2));
}

export function daysBetween(start: ArcadePrimitive, end: ArcadePrimitive) {
  if (!start || !end) return null;
  const startDate = new Date(String(start));
  const endDate = new Date(String(end));
  return Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000);
}

export function minutesBetween(start: ArcadePrimitive, end: ArcadePrimitive) {
  if (!start || !end) return null;
  const startDate = new Date(String(start));
  const endDate = new Date(String(end));
  return Math.round((endDate.getTime() - startDate.getTime()) / 60_000);
}

export function baseSeed(context: FamilyContext, partial: Omit<AdvancedSeed, "levelNumber" | "worldNumber">): AdvancedSeed {
  return {
    ...partial,
    levelNumber: context.levelNumber,
    worldNumber: context.worldNumber,
  };
}

export function commonChecklist(columns: string[]) {
  return [
    `Return columns: ${columns.join(", ")}`,
    "Do not return extra columns.",
    "Match the expected row contract.",
  ];
}

export function commonExpected(columns: string[]) {
  return [
    `Columns: ${columns.join(", ")}`,
    "Rows match the business rule.",
    "No extra rows or columns.",
  ];
}

export function makePysparkRequirements(...requirements: StructuralRequirement[]) {
  return requirements;
}

export const req = {
  select: { label: "projection", anyOf: [".select(", ".selectExpr("] },
  filter: { label: "filtering", anyOf: [".filter(", ".where("] },
  join: { label: "join", anyOf: [".join("] },
  group: { label: "grouping", anyOf: [".groupBy("] },
  agg: { label: "aggregation", anyOf: [".agg(", ".count(", ".sum("] },
  alias: { label: "named output", anyOf: [".alias("] },
  window: { label: "window spec", anyOf: ["Window.partitionBy(", "partitionBy(", "Window.orderBy("] },
  over: { label: "window over", anyOf: [".over("] },
  rowNumber: { label: "row number", anyOf: ["row_number("] },
  rank: { label: "ranking", anyOf: ["dense_rank(", "rank("] },
  withColumn: { label: "derived column", anyOf: [".withColumn("] },
  when: { label: "conditional logic", anyOf: ["F.when(", "when("] },
  coalesce: { label: "null handling", anyOf: ["coalesce(", "fillna("] },
  trim: { label: "trimming", anyOf: ["trim("] },
  lower: { label: "case cleanup", anyOf: ["lower(", "upper("] },
  date: { label: "date logic", anyOf: ["to_date(", "datediff(", "date_format("] },
};

const worldThreeFamilies: FamilyBuilder[] = [
  (context) => {
    const tables = buildTables(context);
    const columns = ["order_id", "customer_name", "country", "amount"];
    return baseSeed(context, {
      category: "multi-table-joins",
      title: "Paid order customer join",
      theme: "World 3 joins",
      businessContext: "Paid orders must carry customer identity.",
      question: `Return paid or completed orders above ${context.threshold} with customer_name and country.`,
      tables: [tables.orders, tables.customers],
      expectedOutput: commonExpected(columns),
      successChecklist: commonChecklist(columns),
      orderSensitive: true,
      deriveExpected: (input) => {
        const customers = byKey(tableRows(input, "customers"), "customer_id");
        return sortRows(tableRows(input, "orders")
          .filter((order) => ["paid", "completed"].includes(String(order.status)) && Number(order.amount) > context.threshold)
          .filter((order) => customers.has(order.customer_id))
          .map((order) => ({
            order_id: order.order_id,
            customer_name: customers.get(order.customer_id)?.customer_name ?? null,
            country: customers.get(order.customer_id)?.country ?? null,
            amount: order.amount,
          })), [["order_id", "asc"]]);
      },
      sqlReferenceSolution: `SELECT o.order_id, c.customer_name, c.country, o.amount
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
WHERE o.status IN ('paid', 'completed') AND o.amount > ${context.threshold}
ORDER BY o.order_id;`,
      pythonReferenceSolution: `customers = {row['customer_id']: row for row in data['customers']}
result = sorted([
    {
        'order_id': order['order_id'],
        'customer_name': customers[order['customer_id']]['customer_name'],
        'country': customers[order['customer_id']]['country'],
        'amount': order['amount'],
    }
    for order in data['orders']
    if order['status'] in ('paid', 'completed') and order['amount'] > ${context.threshold} and order['customer_id'] in customers
], key=lambda row: row['order_id'])`,
      pysparkReferenceSolution: `result_df = orders_df.join(customers_df, "customer_id").filter((F.col("status").isin("paid", "completed")) & (F.col("amount") > ${context.threshold})).select("order_id", "customer_name", "country", "amount").orderBy("order_id")`,
      pysparkRequirements: makePysparkRequirements(req.join, req.filter, req.select),
    });
  },
  (context) => {
    const tables = buildTables(context);
    const columns = ["segment", "paid_revenue"];
    return baseSeed(context, {
      category: "joined-aggregation",
      title: "Revenue by segment",
      theme: "World 3 joins",
      businessContext: "Segment revenue depends on customer and order joins.",
      question: `Sum paid/completed order revenue by customer segment where revenue is above ${context.threshold}.`,
      tables: [tables.orders, tables.customers],
      expectedOutput: commonExpected(columns),
      successChecklist: commonChecklist(columns),
      orderSensitive: true,
      deriveExpected: (input) => {
        const customers = byKey(tableRows(input, "customers"), "customer_id");
        const grouped = new Map<string, number>();
        for (const order of tableRows(input, "orders")) {
          if (!["paid", "completed"].includes(String(order.status)) || !customers.has(order.customer_id)) continue;
          const segment = String(customers.get(order.customer_id)?.segment);
          grouped.set(segment, (grouped.get(segment) ?? 0) + Number(order.amount));
        }
        return sortRows([...grouped.entries()]
          .filter(([, revenue]) => revenue > context.threshold)
          .map(([segment, revenue]) => ({ segment, paid_revenue: sum([revenue]) })), [["segment", "asc"]]);
      },
      sqlReferenceSolution: `SELECT c.segment, SUM(o.amount) AS paid_revenue
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
WHERE o.status IN ('paid', 'completed')
GROUP BY c.segment
HAVING SUM(o.amount) > ${context.threshold}
ORDER BY c.segment;`,
      pythonReferenceSolution: `customers = {row['customer_id']: row for row in data['customers']}
grouped = {}
for order in data['orders']:
    if order['status'] in ('paid', 'completed') and order['customer_id'] in customers:
        segment = customers[order['customer_id']]['segment']
        grouped[segment] = grouped.get(segment, 0) + order['amount']
result = sorted([
    {'segment': segment, 'paid_revenue': round(revenue, 2)}
    for segment, revenue in grouped.items()
    if revenue > ${context.threshold}
], key=lambda row: row['segment'])`,
      pysparkReferenceSolution: `result_df = orders_df.join(customers_df, "customer_id").filter(F.col("status").isin("paid", "completed")).groupBy("segment").agg(F.sum("amount").alias("paid_revenue")).filter(F.col("paid_revenue") > ${context.threshold}).select("segment", "paid_revenue").orderBy("segment")`,
      pysparkRequirements: makePysparkRequirements(req.join, req.filter, req.group, req.agg, req.alias),
    });
  },
  (context) => {
    const tables = buildTables(context);
    const columns = ["country", "order_id", "amount", "country_rank"];
    return baseSeed(context, {
      category: "group-ranking",
      title: "Top order inside each country",
      theme: "World 3 ranking",
      businessContext: "Country dashboards need the highest paid order per country.",
      question: "Rank paid/completed orders within each country by amount and return rank 1 rows.",
      tables: [tables.orders, tables.customers],
      expectedOutput: commonExpected(columns),
      successChecklist: commonChecklist(columns),
      orderSensitive: true,
      deriveExpected: (input) => {
        const customers = byKey(tableRows(input, "customers"), "customer_id");
        const rows = tableRows(input, "orders")
          .filter((order) => ["paid", "completed"].includes(String(order.status)) && customers.has(order.customer_id))
          .map((order) => ({
            country: customers.get(order.customer_id)?.country ?? null,
            order_id: order.order_id,
            amount: order.amount,
          }));
        const result: ArcadeRow[] = [];
        for (const country of [...new Set(rows.map((row) => row.country))]) {
          const winner = sortRows(rows.filter((row) => row.country === country), [["amount", "desc"], ["order_id", "asc"]])[0];
          if (winner) result.push({ ...winner, country_rank: 1 });
        }
        return sortRows(result, [["country", "asc"]]);
      },
      sqlReferenceSolution: `WITH ranked AS (
  SELECT c.country, o.order_id, o.amount,
         ROW_NUMBER() OVER (PARTITION BY c.country ORDER BY o.amount DESC, o.order_id ASC) AS country_rank
  FROM orders o
  JOIN customers c ON c.customer_id = o.customer_id
  WHERE o.status IN ('paid', 'completed')
)
SELECT country, order_id, amount, country_rank
FROM ranked
WHERE country_rank = 1
ORDER BY country;`,
      pythonReferenceSolution: `customers = {row['customer_id']: row for row in data['customers']}
rows = [
    {'country': customers[order['customer_id']]['country'], 'order_id': order['order_id'], 'amount': order['amount']}
    for order in data['orders']
    if order['status'] in ('paid', 'completed') and order['customer_id'] in customers
]
result = []
for country in sorted({row['country'] for row in rows}):
    winner = sorted([row for row in rows if row['country'] == country], key=lambda row: (-row['amount'], row['order_id']))[0]
    result.append({**winner, 'country_rank': 1})`,
      pysparkReferenceSolution: `w = Window.partitionBy("country").orderBy(F.col("amount").desc(), F.col("order_id").asc())
result_df = orders_df.join(customers_df, "customer_id").filter(F.col("status").isin("paid", "completed")).withColumn("country_rank", F.row_number().over(w)).filter(F.col("country_rank") == 1).select("country", "order_id", "amount", "country_rank").orderBy("country")`,
      pysparkRequirements: makePysparkRequirements(req.join, req.filter, req.window, req.over, req.rowNumber, req.select),
    });
  },
  (context) => {
    const tables = buildTables(context);
    const columns = ["customer_id", "order_id", "status", "order_date"];
    return baseSeed(context, {
      category: "latest-entity-state",
      title: "Latest order status per customer",
      theme: "World 3 latest state",
      businessContext: "Customer support needs the most recent order state.",
      question: "Return the latest order status per real customer by order_date.",
      tables: [tables.orders, tables.customers],
      expectedOutput: commonExpected(columns),
      successChecklist: commonChecklist(columns),
      orderSensitive: true,
      deriveExpected: (input) => {
        const customerIds = new Set(tableRows(input, "customers").map((row) => row.customer_id));
        const latest = new Map<ArcadePrimitive, ArcadeRow>();
        for (const order of tableRows(input, "orders")) {
          if (!customerIds.has(order.customer_id)) continue;
          const current = latest.get(order.customer_id);
          if (!current || String(order.order_date) > String(current.order_date)) latest.set(order.customer_id, order);
        }
        return sortRows([...latest.values()].map((order) => ({
          customer_id: order.customer_id,
          order_id: order.order_id,
          status: order.status,
          order_date: order.order_date,
        })), [["customer_id", "asc"]]);
      },
      sqlReferenceSolution: `WITH ranked AS (
  SELECT o.customer_id, o.order_id, o.status, o.order_date,
         ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY o.order_date DESC, o.order_id DESC) AS rn
  FROM orders o
  JOIN customers c ON c.customer_id = o.customer_id
)
SELECT customer_id, order_id, status, order_date
FROM ranked
WHERE rn = 1
ORDER BY customer_id;`,
      pythonReferenceSolution: `customer_ids = {row['customer_id'] for row in data['customers']}
latest = {}
for order in data['orders']:
    if order['customer_id'] in customer_ids:
        current = latest.get(order['customer_id'])
        if current is None or (order['order_date'], order['order_id']) > (current['order_date'], current['order_id']):
            latest[order['customer_id']] = order
result = sorted([
    {'customer_id': order['customer_id'], 'order_id': order['order_id'], 'status': order['status'], 'order_date': order['order_date']}
    for order in latest.values()
], key=lambda row: row['customer_id'])`,
      pysparkReferenceSolution: `w = Window.partitionBy("customer_id").orderBy(F.col("order_date").desc(), F.col("order_id").desc())
result_df = orders_df.join(customers_df.select("customer_id"), "customer_id").withColumn("rn", F.row_number().over(w)).filter(F.col("rn") == 1).select("customer_id", "order_id", "status", "order_date").orderBy("customer_id")`,
      pysparkRequirements: makePysparkRequirements(req.join, req.window, req.over, req.rowNumber, req.filter, req.select),
    });
  },
  (context) => {
    const tables = buildTables(context);
    const columns = ["order_id", "amount", "paid_amount", "amount_gap"];
    return baseSeed(context, {
      category: "reconciliation",
      title: "Payment amount reconciliation",
      theme: "World 3 reconciliation",
      businessContext: "Finance needs order and payment amount mismatches.",
      question: "Return settled payments where paid_amount does not equal order amount.",
      tables: [tables.orders, tables.payments],
      expectedOutput: commonExpected(columns),
      successChecklist: commonChecklist(columns),
      orderSensitive: true,
      deriveExpected: (input) => {
        const orders = byKey(tableRows(input, "orders"), "order_id");
        return sortRows(tableRows(input, "payments")
          .filter((payment) => payment.payment_status === "settled" && orders.has(payment.order_id))
          .map((payment) => {
            const order = orders.get(payment.order_id)!;
            return {
              order_id: payment.order_id,
              amount: order.amount,
              paid_amount: payment.paid_amount,
              amount_gap: Number((Number(order.amount) - Number(payment.paid_amount)).toFixed(2)),
            };
          })
          .filter((row) => row.amount_gap !== 0), [["order_id", "asc"]]);
      },
      sqlReferenceSolution: `SELECT o.order_id, o.amount, p.paid_amount, ROUND(o.amount - p.paid_amount, 2) AS amount_gap
FROM orders o
JOIN payments p ON p.order_id = o.order_id
WHERE p.payment_status = 'settled' AND ROUND(o.amount - p.paid_amount, 2) <> 0
ORDER BY o.order_id;`,
      pythonReferenceSolution: `orders = {row['order_id']: row for row in data['orders']}
result = []
for payment in data['payments']:
    if payment['payment_status'] == 'settled' and payment['order_id'] in orders:
        order = orders[payment['order_id']]
        gap = round(order['amount'] - payment['paid_amount'], 2)
        if gap != 0:
            result.append({'order_id': payment['order_id'], 'amount': order['amount'], 'paid_amount': payment['paid_amount'], 'amount_gap': gap})
result = sorted(result, key=lambda row: row['order_id'])`,
      pysparkReferenceSolution: `result_df = orders_df.join(payments_df, "order_id").filter((F.col("payment_status") == "settled") & (F.round(F.col("amount") - F.col("paid_amount"), 2) != 0)).withColumn("amount_gap", F.round(F.col("amount") - F.col("paid_amount"), 2)).select("order_id", "amount", "paid_amount", "amount_gap").orderBy("order_id")`,
      pysparkRequirements: makePysparkRequirements(req.join, req.filter, req.withColumn, req.select),
    });
  },
  (context) => {
    const tables = buildTables(context);
    const columns = ["order_id", "customer_id", "amount"];
    return baseSeed(context, {
      category: "reconciliation",
      title: "Paid orders missing settlement",
      theme: "World 3 reconciliation",
      businessContext: "Operations reviews paid orders that never settled.",
      question: "Return paid/completed orders without a settled payment row.",
      tables: [tables.orders, tables.payments],
      expectedOutput: commonExpected(columns),
      successChecklist: commonChecklist(columns),
      orderSensitive: true,
      deriveExpected: (input) => {
        const settled = new Set(tableRows(input, "payments").filter((row) => row.payment_status === "settled").map((row) => row.order_id));
        return sortRows(tableRows(input, "orders")
          .filter((order) => ["paid", "completed"].includes(String(order.status)) && !settled.has(order.order_id))
          .map((order) => ({ order_id: order.order_id, customer_id: order.customer_id, amount: order.amount })), [["order_id", "asc"]]);
      },
      sqlReferenceSolution: `SELECT o.order_id, o.customer_id, o.amount
FROM orders o
LEFT JOIN payments p ON p.order_id = o.order_id AND p.payment_status = 'settled'
WHERE o.status IN ('paid', 'completed') AND p.order_id IS NULL
ORDER BY o.order_id;`,
      pythonReferenceSolution: `settled = {row['order_id'] for row in data['payments'] if row['payment_status'] == 'settled'}
result = sorted([
    {'order_id': order['order_id'], 'customer_id': order['customer_id'], 'amount': order['amount']}
    for order in data['orders']
    if order['status'] in ('paid', 'completed') and order['order_id'] not in settled
], key=lambda row: row['order_id'])`,
      pysparkReferenceSolution: `settled_df = payments_df.filter(F.col("payment_status") == "settled").select("order_id")
result_df = orders_df.filter(F.col("status").isin("paid", "completed")).join(settled_df, "order_id", "left_anti").select("order_id", "customer_id", "amount").orderBy("order_id")`,
      pysparkRequirements: makePysparkRequirements(req.filter, req.join, req.select, { label: "anti or left join", anyOf: ["left_anti", "left"] }),
    });
  },
  (context) => {
    const tables = buildTables(context);
    const columns = ["category", "item_revenue"];
    return baseSeed(context, {
      category: "joined-aggregation",
      title: "Product category revenue",
      theme: "World 3 joins",
      businessContext: "Merchandising needs revenue by mapped category.",
      question: `Join items to products and return categories with item revenue above ${context.threshold}.`,
      tables: [tables.orderItems, tables.products],
      expectedOutput: commonExpected(columns),
      successChecklist: commonChecklist(columns),
      orderSensitive: true,
      deriveExpected: (input) => {
        const products = byKey(tableRows(input, "products"), "sku");
        const grouped = new Map<string, number>();
        for (const item of tableRows(input, "order_items")) {
          const product = products.get(item.sku);
          if (!product) continue;
          const category = String(product.category);
          grouped.set(category, (grouped.get(category) ?? 0) + Number(item.quantity) * Number(item.unit_price));
        }
        return sortRows([...grouped.entries()]
          .filter(([, revenue]) => revenue > context.threshold)
          .map(([category, revenue]) => ({ category, item_revenue: sum([revenue]) })), [["category", "asc"]]);
      },
      sqlReferenceSolution: `SELECT p.category, SUM(i.quantity * i.unit_price) AS item_revenue
FROM order_items i
JOIN products p ON p.sku = i.sku
GROUP BY p.category
HAVING SUM(i.quantity * i.unit_price) > ${context.threshold}
ORDER BY p.category;`,
      pythonReferenceSolution: `products = {row['sku']: row for row in data['products']}
grouped = {}
for item in data['order_items']:
    if item['sku'] in products:
        category = products[item['sku']]['category']
        grouped[category] = grouped.get(category, 0) + item['quantity'] * item['unit_price']
result = sorted([
    {'category': category, 'item_revenue': round(revenue, 2)}
    for category, revenue in grouped.items()
    if revenue > ${context.threshold}
], key=lambda row: row['category'])`,
      pysparkReferenceSolution: `result_df = order_items_df.join(products_df, "sku").groupBy("category").agg(F.sum(F.col("quantity") * F.col("unit_price")).alias("item_revenue")).filter(F.col("item_revenue") > ${context.threshold}).select("category", "item_revenue").orderBy("category")`,
      pysparkRequirements: makePysparkRequirements(req.join, req.group, req.agg, req.alias, req.filter),
    });
  },
  (context) => {
    const tables = buildTables(context);
    const columns = ["customer_id", "customer_name"];
    return baseSeed(context, {
      category: "reconciliation",
      title: "Customers without orders",
      theme: "World 3 left joins",
      businessContext: "Activation work starts with customers who never ordered.",
      question: "Return customers with no matching order.",
      tables: [tables.customers, tables.orders],
      expectedOutput: commonExpected(columns),
      successChecklist: commonChecklist(columns),
      orderSensitive: true,
      deriveExpected: (input) => {
        const ordered = new Set(tableRows(input, "orders").map((order) => order.customer_id));
        return sortRows(tableRows(input, "customers")
          .filter((customer) => !ordered.has(customer.customer_id))
          .map((customer) => ({ customer_id: customer.customer_id, customer_name: customer.customer_name })), [["customer_id", "asc"]]);
      },
      sqlReferenceSolution: `SELECT c.customer_id, c.customer_name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL
ORDER BY c.customer_id;`,
      pythonReferenceSolution: `ordered = {row['customer_id'] for row in data['orders']}
result = sorted([
    {'customer_id': customer['customer_id'], 'customer_name': customer['customer_name']}
    for customer in data['customers']
    if customer['customer_id'] not in ordered
], key=lambda row: row['customer_id'])`,
      pysparkReferenceSolution: `result_df = customers_df.join(orders_df.select("customer_id").distinct(), "customer_id", "left_anti").select("customer_id", "customer_name").orderBy("customer_id")`,
      pysparkRequirements: makePysparkRequirements(req.join, req.select, { label: "anti join", anyOf: ["left_anti"] }),
    });
  },
  (context) => {
    const tables = buildTables(context);
    const columns = ["country", "category", "item_revenue"];
    return baseSeed(context, {
      category: "joined-aggregation",
      title: "Country category revenue",
      theme: "World 3 joins",
      businessContext: "Regional category revenue depends on four tables.",
      question: "Join customers, orders, items, and products; return revenue by country and category.",
      tables: [tables.customers, tables.orders, tables.orderItems, tables.products],
      expectedOutput: commonExpected(columns),
      successChecklist: commonChecklist(columns),
      orderSensitive: true,
      deriveExpected: (input) => {
        const customers = byKey(tableRows(input, "customers"), "customer_id");
        const orders = byKey(tableRows(input, "orders"), "order_id");
        const products = byKey(tableRows(input, "products"), "sku");
        const grouped = new Map<string, { country: string; category: string; item_revenue: number }>();
        for (const item of tableRows(input, "order_items")) {
          const order = orders.get(item.order_id);
          const product = products.get(item.sku);
          if (!order || !product || !["paid", "completed"].includes(String(order.status)) || !customers.has(order.customer_id)) continue;
          const country = String(customers.get(order.customer_id)?.country);
          const category = String(product.category);
          const key = `${country}|${category}`;
          const current = grouped.get(key) ?? { country, category, item_revenue: 0 };
          current.item_revenue += Number(item.quantity) * Number(item.unit_price);
          grouped.set(key, current);
        }
        return sortRows([...grouped.values()].map((row) => ({ ...row, item_revenue: sum([row.item_revenue]) })), [["country", "asc"], ["category", "asc"]]);
      },
      sqlReferenceSolution: `SELECT c.country, p.category, SUM(i.quantity * i.unit_price) AS item_revenue
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
JOIN order_items i ON i.order_id = o.order_id
JOIN products p ON p.sku = i.sku
WHERE o.status IN ('paid', 'completed')
GROUP BY c.country, p.category
ORDER BY c.country, p.category;`,
      pythonReferenceSolution: `customers = {row['customer_id']: row for row in data['customers']}
orders = {row['order_id']: row for row in data['orders']}
products = {row['sku']: row for row in data['products']}
grouped = {}
for item in data['order_items']:
    order = orders.get(item['order_id'])
    product = products.get(item['sku'])
    if order and product and order['status'] in ('paid', 'completed') and order['customer_id'] in customers:
        key = (customers[order['customer_id']]['country'], product['category'])
        grouped[key] = grouped.get(key, 0) + item['quantity'] * item['unit_price']
result = sorted([
    {'country': country, 'category': category, 'item_revenue': round(revenue, 2)}
    for (country, category), revenue in grouped.items()
], key=lambda row: (row['country'], row['category']))`,
      pysparkReferenceSolution: `result_df = customers_df.join(orders_df, "customer_id").join(order_items_df, "order_id").join(products_df, "sku").filter(F.col("status").isin("paid", "completed")).groupBy("country", "category").agg(F.sum(F.col("quantity") * F.col("unit_price")).alias("item_revenue")).select("country", "category", "item_revenue").orderBy("country", "category")`,
      pysparkRequirements: makePysparkRequirements(req.join, req.filter, req.group, req.agg, req.alias, req.select),
    });
  },
  (context) => {
    const tables = buildTables(context);
    const columns = ["order_id", "shipment_status", "payment_status"];
    return baseSeed(context, {
      category: "reconciliation",
      title: "Shipment and payment mismatch",
      theme: "World 3 reconciliation",
      businessContext: "Fulfillment should not ship failed payments.",
      question: "Return shipped orders whose payment is not settled or is missing.",
      tables: [tables.shipments, tables.payments],
      expectedOutput: commonExpected(columns),
      successChecklist: commonChecklist(columns),
      orderSensitive: true,
      deriveExpected: (input) => {
        const payments = byKey(tableRows(input, "payments"), "order_id");
        return sortRows(tableRows(input, "shipments")
          .filter((shipment) => shipment.shipment_status !== "cancelled")
          .map((shipment) => ({
            order_id: shipment.order_id,
            shipment_status: shipment.shipment_status,
            payment_status: payments.get(shipment.order_id)?.payment_status ?? null,
          }))
          .filter((row) => row.payment_status !== "settled"), [["order_id", "asc"]]);
      },
      sqlReferenceSolution: `SELECT s.order_id, s.shipment_status, p.payment_status
FROM shipments s
LEFT JOIN payments p ON p.order_id = s.order_id
WHERE s.shipment_status <> 'cancelled' AND COALESCE(p.payment_status, 'missing') <> 'settled'
ORDER BY s.order_id;`,
      pythonReferenceSolution: `payments = {row['order_id']: row for row in data['payments']}
result = []
for shipment in data['shipments']:
    payment_status = payments.get(shipment['order_id'], {}).get('payment_status')
    if shipment['shipment_status'] != 'cancelled' and payment_status != 'settled':
        result.append({'order_id': shipment['order_id'], 'shipment_status': shipment['shipment_status'], 'payment_status': payment_status})
result = sorted(result, key=lambda row: row['order_id'])`,
      pysparkReferenceSolution: `result_df = shipments_df.join(payments_df.select("order_id", "payment_status"), "order_id", "left").filter((F.col("shipment_status") != "cancelled") & (F.coalesce(F.col("payment_status"), F.lit("missing")) != "settled")).select("order_id", "shipment_status", "payment_status").orderBy("order_id")`,
      pysparkRequirements: makePysparkRequirements(req.join, req.filter, req.coalesce, req.select),
    });
  },
];

const worldFourFamilies: FamilyBuilder[] = [
  (context) => firstOrderFamily(context),
  (context) => cumulativeRevenueFamily(context),
  (context) => rollingRevenueFamily(context),
  (context) => retainedCustomersFamily(context),
  (context) => latestSessionEventFamily(context),
  (context) => firstLastEventFamily(context),
  (context) => dedupePriorityEventFamily(context),
  (context) => cohortMonthFamily(context),
  (context) => paymentFailureRankFamily(context),
  (context) => secondOrderLagFamily(context),
];

function firstOrderFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["customer_id", "first_order_id", "first_order_date"];
  return baseSeed(context, {
    category: "window-logic",
    title: "First order per customer",
    theme: "World 4 windows",
    businessContext: "Lifecycle work starts at each customer first order.",
    question: "Return the first order per real customer.",
    tables: [tables.orders, tables.customers],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const customerIds = new Set(tableRows(input, "customers").map((row) => row.customer_id));
      const first = new Map<ArcadePrimitive, ArcadeRow>();
      for (const order of tableRows(input, "orders")) {
        if (!customerIds.has(order.customer_id)) continue;
        const current = first.get(order.customer_id);
        if (!current || String(order.order_date) < String(current.order_date)) first.set(order.customer_id, order);
      }
      return sortRows([...first.values()].map((order) => ({
        customer_id: order.customer_id,
        first_order_id: order.order_id,
        first_order_date: order.order_date,
      })), [["customer_id", "asc"]]);
    },
    sqlReferenceSolution: `WITH ranked AS (
  SELECT o.customer_id, o.order_id, o.order_date,
         ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY o.order_date ASC, o.order_id ASC) AS rn
  FROM orders o
  JOIN customers c ON c.customer_id = o.customer_id
)
SELECT customer_id, order_id AS first_order_id, order_date AS first_order_date
FROM ranked
WHERE rn = 1
ORDER BY customer_id;`,
    pythonReferenceSolution: `customer_ids = {row['customer_id'] for row in data['customers']}
first = {}
for order in data['orders']:
    if order['customer_id'] in customer_ids:
        current = first.get(order['customer_id'])
        if current is None or (order['order_date'], order['order_id']) < (current['order_date'], current['order_id']):
            first[order['customer_id']] = order
result = sorted([
    {'customer_id': order['customer_id'], 'first_order_id': order['order_id'], 'first_order_date': order['order_date']}
    for order in first.values()
], key=lambda row: row['customer_id'])`,
    pysparkReferenceSolution: `w = Window.partitionBy("customer_id").orderBy(F.col("order_date").asc(), F.col("order_id").asc())
result_df = orders_df.join(customers_df.select("customer_id"), "customer_id").withColumn("rn", F.row_number().over(w)).filter(F.col("rn") == 1).select("customer_id", F.col("order_id").alias("first_order_id"), F.col("order_date").alias("first_order_date")).orderBy("customer_id")`,
    pysparkRequirements: makePysparkRequirements(req.join, req.window, req.over, req.rowNumber, req.filter, req.select),
  });
}

function cumulativeRevenueFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["customer_id", "order_id", "amount", "running_revenue"];
  return baseSeed(context, {
    category: "window-logic",
    title: "Customer running revenue",
    theme: "World 4 windows",
    businessContext: "Revenue monitoring needs cumulative totals.",
    question: "Return paid/completed orders with running revenue per customer.",
    tables: [tables.orders],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const result: ArcadeRow[] = [];
      const rows = sortRows(tableRows(input, "orders").filter((order) => ["paid", "completed"].includes(String(order.status))), [["customer_id", "asc"], ["order_date", "asc"], ["order_id", "asc"]]);
      const totals = new Map<ArcadePrimitive, number>();
      for (const order of rows) {
        const running = (totals.get(order.customer_id) ?? 0) + Number(order.amount);
        totals.set(order.customer_id, running);
        result.push({ customer_id: order.customer_id, order_id: order.order_id, amount: order.amount, running_revenue: sum([running]) });
      }
      return result;
    },
    sqlReferenceSolution: `SELECT customer_id, order_id, amount,
       SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date, order_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_revenue
FROM orders
WHERE status IN ('paid', 'completed')
ORDER BY customer_id, order_date, order_id;`,
    pythonReferenceSolution: `rows = sorted([
    order for order in data['orders']
    if order['status'] in ('paid', 'completed')
], key=lambda row: (row['customer_id'], row['order_date'], row['order_id']))
totals = {}
result = []
for order in rows:
    running = totals.get(order['customer_id'], 0) + order['amount']
    totals[order['customer_id']] = running
    result.append({'customer_id': order['customer_id'], 'order_id': order['order_id'], 'amount': order['amount'], 'running_revenue': round(running, 2)})`,
    pysparkReferenceSolution: `w = Window.partitionBy("customer_id").orderBy("order_date", "order_id").rowsBetween(Window.unboundedPreceding, Window.currentRow)
result_df = orders_df.filter(F.col("status").isin("paid", "completed")).withColumn("running_revenue", F.sum("amount").over(w)).select("customer_id", "order_id", "amount", "running_revenue").orderBy("customer_id", "order_date", "order_id")`,
    pysparkRequirements: makePysparkRequirements(req.filter, req.window, req.over, req.withColumn, req.select),
  });
}

function rollingRevenueFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["channel", "order_id", "rolling_two_revenue"];
  return baseSeed(context, {
    category: "rolling-metrics",
    title: "Rolling channel revenue",
    theme: "World 4 rolling metrics",
    businessContext: "Channel health needs a rolling two-order revenue metric.",
    question: "Return paid/completed orders with rolling two-order revenue by channel.",
    tables: [tables.orders],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const rows = sortRows(tableRows(input, "orders").filter((order) => ["paid", "completed"].includes(String(order.status))), [["channel", "asc"], ["order_date", "asc"], ["order_id", "asc"]]);
      return rows.map((order, index) => {
        const previous = rows.slice(0, index).reverse().find((item) => item.channel === order.channel);
        return { channel: order.channel, order_id: order.order_id, rolling_two_revenue: sum([Number(order.amount), previous ? Number(previous.amount) : 0]) };
      });
    },
    sqlReferenceSolution: `SELECT channel, order_id,
       SUM(amount) OVER (PARTITION BY channel ORDER BY order_date, order_id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS rolling_two_revenue
FROM orders
WHERE status IN ('paid', 'completed')
ORDER BY channel, order_date, order_id;`,
    pythonReferenceSolution: `rows = sorted([
    order for order in data['orders']
    if order['status'] in ('paid', 'completed')
], key=lambda row: (row['channel'], row['order_date'], row['order_id']))
seen = {}
result = []
for order in rows:
    previous = seen.get(order['channel'])
    result.append({'channel': order['channel'], 'order_id': order['order_id'], 'rolling_two_revenue': round(order['amount'] + (previous['amount'] if previous else 0), 2)})
    seen[order['channel']] = order`,
    pysparkReferenceSolution: `w = Window.partitionBy("channel").orderBy("order_date", "order_id").rowsBetween(-1, Window.currentRow)
result_df = orders_df.filter(F.col("status").isin("paid", "completed")).withColumn("rolling_two_revenue", F.sum("amount").over(w)).select("channel", "order_id", "rolling_two_revenue").orderBy("channel", "order_date", "order_id")`,
    pysparkRequirements: makePysparkRequirements(req.filter, req.window, req.over, req.withColumn, req.select),
  });
}

function retainedCustomersFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["customer_id", "first_order_date", "second_order_date", "days_to_second_order"];
  const retentionDays = Math.max(context.days, 5);
  return baseSeed(context, {
    category: "cohort-retention",
    title: "Second order retention",
    theme: "World 4 retention",
    businessContext: "Retention asks whether the second purchase came quickly enough.",
    question: `Return customers whose second paid/completed order happened within ${retentionDays} days.`,
    tables: [tables.orders],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const grouped = new Map<ArcadePrimitive, ArcadeRow[]>();
      for (const order of tableRows(input, "orders").filter((row) => ["paid", "completed"].includes(String(row.status)))) {
        grouped.set(order.customer_id, [...(grouped.get(order.customer_id) ?? []), order]);
      }
      const result: ArcadeRow[] = [];
      for (const [customerId, orders] of grouped.entries()) {
        const sorted = sortRows(orders, [["order_date", "asc"], ["order_id", "asc"]]);
        if (sorted.length < 2) continue;
        const diff = daysBetween(sorted[0].order_date, sorted[1].order_date);
        if (diff !== null && diff <= retentionDays) {
          result.push({ customer_id: customerId, first_order_date: sorted[0].order_date, second_order_date: sorted[1].order_date, days_to_second_order: diff });
        }
      }
      return sortRows(result, [["customer_id", "asc"]]);
    },
    sqlReferenceSolution: `WITH ranked AS (
  SELECT customer_id, order_date,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS rn
  FROM orders
  WHERE status IN ('paid', 'completed')
),
pairs AS (
  SELECT f.customer_id, f.order_date AS first_order_date, s.order_date AS second_order_date,
         CAST(julianday(s.order_date) - julianday(f.order_date) AS INTEGER) AS days_to_second_order
  FROM ranked f
  JOIN ranked s ON s.customer_id = f.customer_id AND s.rn = 2
  WHERE f.rn = 1
)
SELECT customer_id, first_order_date, second_order_date, days_to_second_order
FROM pairs
WHERE days_to_second_order <= ${retentionDays}
ORDER BY customer_id;`,
    pythonReferenceSolution: `grouped = {}
for order in data['orders']:
    if order['status'] in ('paid', 'completed'):
        grouped.setdefault(order['customer_id'], []).append(order)
result = []
from datetime import datetime
for customer_id, orders in grouped.items():
    sorted_orders = sorted(orders, key=lambda row: (row['order_date'], row['order_id']))
    if len(sorted_orders) >= 2:
        diff = (datetime.fromisoformat(sorted_orders[1]['order_date']) - datetime.fromisoformat(sorted_orders[0]['order_date'])).days
        if diff <= ${retentionDays}:
            result.append({'customer_id': customer_id, 'first_order_date': sorted_orders[0]['order_date'], 'second_order_date': sorted_orders[1]['order_date'], 'days_to_second_order': diff})
result = sorted(result, key=lambda row: row['customer_id'])`,
    pysparkReferenceSolution: `w = Window.partitionBy("customer_id").orderBy("order_date", "order_id")
ranked_df = orders_df.filter(F.col("status").isin("paid", "completed")).withColumn("rn", F.row_number().over(w))
first_df = ranked_df.filter(F.col("rn") == 1).select("customer_id", F.col("order_date").alias("first_order_date"))
second_df = ranked_df.filter(F.col("rn") == 2).select("customer_id", F.col("order_date").alias("second_order_date"))
result_df = first_df.join(second_df, "customer_id").withColumn("days_to_second_order", F.datediff("second_order_date", "first_order_date")).filter(F.col("days_to_second_order") <= ${retentionDays}).select("customer_id", "first_order_date", "second_order_date", "days_to_second_order").orderBy("customer_id")`,
    pysparkRequirements: makePysparkRequirements(req.filter, req.window, req.over, req.rowNumber, req.join, req.date, req.select),
  });
}

function latestSessionEventFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["session_id", "event_type", "event_time"];
  return baseSeed(context, {
    category: "first-last-event",
    title: "Latest event per session",
    theme: "World 4 events",
    businessContext: "Session state should reflect the last event.",
    question: "Return the latest event per session.",
    tables: [tables.events],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const latest = new Map<ArcadePrimitive, ArcadeRow>();
      for (const event of tableRows(input, "events")) {
        const current = latest.get(event.session_id);
        if (!current || String(event.event_time) > String(current.event_time)) latest.set(event.session_id, event);
      }
      return sortRows([...latest.values()].map((event) => ({ session_id: event.session_id, event_type: event.event_type, event_time: event.event_time })), [["session_id", "asc"]]);
    },
    sqlReferenceSolution: `WITH ranked AS (
  SELECT session_id, event_type, event_time,
         ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY event_time DESC, event_id DESC) AS rn
  FROM events
)
SELECT session_id, event_type, event_time
FROM ranked
WHERE rn = 1
ORDER BY session_id;`,
    pythonReferenceSolution: `latest = {}
for event in data['events']:
    current = latest.get(event['session_id'])
    if current is None or (event['event_time'], event['event_id']) > (current['event_time'], current['event_id']):
        latest[event['session_id']] = event
result = sorted([
    {'session_id': event['session_id'], 'event_type': event['event_type'], 'event_time': event['event_time']}
    for event in latest.values()
], key=lambda row: row['session_id'])`,
    pysparkReferenceSolution: `w = Window.partitionBy("session_id").orderBy(F.col("event_time").desc(), F.col("event_id").desc())
result_df = events_df.withColumn("rn", F.row_number().over(w)).filter(F.col("rn") == 1).select("session_id", "event_type", "event_time").orderBy("session_id")`,
    pysparkRequirements: makePysparkRequirements(req.window, req.over, req.rowNumber, req.filter, req.select),
  });
}

function firstLastEventFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["session_id", "first_event", "last_event"];
  return baseSeed(context, {
    category: "first-last-event",
    title: "Session first and last event",
    theme: "World 4 events",
    businessContext: "Funnel QA compares session entry and exit events.",
    question: "Return first_event and last_event per session.",
    tables: [tables.events],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const grouped = new Map<string, ArcadeRow[]>();
      for (const event of tableRows(input, "events")) grouped.set(String(event.session_id), [...(grouped.get(String(event.session_id)) ?? []), event]);
      return sortRows([...grouped.entries()].map(([sessionId, events]) => {
        const sorted = sortRows(events, [["event_time", "asc"], ["event_id", "asc"]]);
        return { session_id: sessionId, first_event: sorted[0].event_type, last_event: sorted[sorted.length - 1].event_type };
      }), [["session_id", "asc"]]);
    },
    sqlReferenceSolution: `WITH ranked AS (
  SELECT session_id, event_type, event_time,
         ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY event_time ASC, event_id ASC) AS first_rn,
         ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY event_time DESC, event_id DESC) AS last_rn
  FROM events
)
SELECT f.session_id, f.event_type AS first_event, l.event_type AS last_event
FROM ranked f
JOIN ranked l ON l.session_id = f.session_id AND l.last_rn = 1
WHERE f.first_rn = 1
ORDER BY f.session_id;`,
    pythonReferenceSolution: `grouped = {}
for event in data['events']:
    grouped.setdefault(event['session_id'], []).append(event)
result = []
for session_id, events in grouped.items():
    sorted_events = sorted(events, key=lambda row: (row['event_time'], row['event_id']))
    result.append({'session_id': session_id, 'first_event': sorted_events[0]['event_type'], 'last_event': sorted_events[-1]['event_type']})
result = sorted(result, key=lambda row: row['session_id'])`,
    pysparkReferenceSolution: `first_w = Window.partitionBy("session_id").orderBy(F.col("event_time").asc(), F.col("event_id").asc())
last_w = Window.partitionBy("session_id").orderBy(F.col("event_time").desc(), F.col("event_id").desc())
ranked_df = events_df.withColumn("first_rn", F.row_number().over(first_w)).withColumn("last_rn", F.row_number().over(last_w))
first_df = ranked_df.filter(F.col("first_rn") == 1).select("session_id", F.col("event_type").alias("first_event"))
last_df = ranked_df.filter(F.col("last_rn") == 1).select("session_id", F.col("event_type").alias("last_event"))
result_df = first_df.join(last_df, "session_id").select("session_id", "first_event", "last_event").orderBy("session_id")`,
    pysparkRequirements: makePysparkRequirements(req.window, req.over, req.rowNumber, req.filter, req.join, req.select),
  });
}

function dedupePriorityEventFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["session_id", "event_type", "priority"];
  return baseSeed(context, {
    category: "business-deduplication",
    title: "Priority event per session",
    theme: "World 4 deduplication",
    businessContext: "Session summaries keep the highest priority event.",
    question: "Return the highest priority event per session, breaking ties by latest event_time.",
    tables: [tables.events],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const best = new Map<ArcadePrimitive, ArcadeRow>();
      for (const event of tableRows(input, "events")) {
        const current = best.get(event.session_id);
        if (!current || Number(event.priority) > Number(current.priority) || (event.priority === current.priority && String(event.event_time) > String(current.event_time))) {
          best.set(event.session_id, event);
        }
      }
      return sortRows([...best.values()].map((event) => ({ session_id: event.session_id, event_type: event.event_type, priority: event.priority })), [["session_id", "asc"]]);
    },
    sqlReferenceSolution: `WITH ranked AS (
  SELECT session_id, event_type, priority,
         ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY priority DESC, event_time DESC, event_id DESC) AS rn
  FROM events
)
SELECT session_id, event_type, priority
FROM ranked
WHERE rn = 1
ORDER BY session_id;`,
    pythonReferenceSolution: `best = {}
for event in data['events']:
    current = best.get(event['session_id'])
    if current is None or (event['priority'], event['event_time'], event['event_id']) > (current['priority'], current['event_time'], current['event_id']):
        best[event['session_id']] = event
result = sorted([
    {'session_id': event['session_id'], 'event_type': event['event_type'], 'priority': event['priority']}
    for event in best.values()
], key=lambda row: row['session_id'])`,
    pysparkReferenceSolution: `w = Window.partitionBy("session_id").orderBy(F.col("priority").desc(), F.col("event_time").desc(), F.col("event_id").desc())
result_df = events_df.withColumn("rn", F.row_number().over(w)).filter(F.col("rn") == 1).select("session_id", "event_type", "priority").orderBy("session_id")`,
    pysparkRequirements: makePysparkRequirements(req.window, req.over, req.rowNumber, req.filter, req.select),
  });
}

function cohortMonthFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["signup_month", "paid_customers"];
  return baseSeed(context, {
    category: "cohort-retention",
    title: "Signup cohort paid customers",
    theme: "World 4 cohorts",
    businessContext: "Cohorts count customers with at least one paid order.",
    question: "Return paid customer count by signup month.",
    tables: [tables.customers, tables.orders],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const paidCustomerIds = new Set(tableRows(input, "orders").filter((order) => ["paid", "completed"].includes(String(order.status))).map((order) => order.customer_id));
      const grouped = new Map<string, Set<ArcadePrimitive>>();
      for (const customer of tableRows(input, "customers")) {
        if (!paidCustomerIds.has(customer.customer_id)) continue;
        const month = String(customer.signup_date).slice(0, 7);
        grouped.set(month, (grouped.get(month) ?? new Set()).add(customer.customer_id));
      }
      return sortRows([...grouped.entries()].map(([signup_month, ids]) => ({ signup_month, paid_customers: ids.size })), [["signup_month", "asc"]]);
    },
    sqlReferenceSolution: `SELECT SUBSTR(c.signup_date, 1, 7) AS signup_month,
       COUNT(DISTINCT c.customer_id) AS paid_customers
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
WHERE o.status IN ('paid', 'completed')
GROUP BY SUBSTR(c.signup_date, 1, 7)
ORDER BY signup_month;`,
    pythonReferenceSolution: `paid_ids = {order['customer_id'] for order in data['orders'] if order['status'] in ('paid', 'completed')}
grouped = {}
for customer in data['customers']:
    if customer['customer_id'] in paid_ids:
        month = customer['signup_date'][:7]
        grouped.setdefault(month, set()).add(customer['customer_id'])
result = sorted([
    {'signup_month': month, 'paid_customers': len(ids)}
    for month, ids in grouped.items()
], key=lambda row: row['signup_month'])`,
    pysparkReferenceSolution: `result_df = customers_df.join(orders_df, "customer_id").filter(F.col("status").isin("paid", "completed")).withColumn("signup_month", F.date_format(F.to_date("signup_date"), "yyyy-MM")).groupBy("signup_month").agg(F.countDistinct("customer_id").alias("paid_customers")).select("signup_month", "paid_customers").orderBy("signup_month")`,
    pysparkRequirements: makePysparkRequirements(req.join, req.filter, req.date, req.group, req.agg, req.alias),
  });
}

function paymentFailureRankFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["payment_method", "failed_count", "failure_rank"];
  return baseSeed(context, {
    category: "window-logic",
    title: "Payment failure rank",
    theme: "World 4 windows",
    businessContext: "Payment operations rank methods by failure count.",
    question: "Count failed payments by method and rank methods by failed_count descending.",
    tables: [tables.payments],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const grouped = new Map<string, number>();
      for (const payment of tableRows(input, "payments")) {
        if (payment.payment_status === "failed") grouped.set(String(payment.payment_method), (grouped.get(String(payment.payment_method)) ?? 0) + 1);
      }
      return sortRows([...grouped.entries()].map(([payment_method, failed_count], index) => ({ payment_method, failed_count, failure_rank: index + 1 })), [["failed_count", "desc"], ["payment_method", "asc"]]);
    },
    sqlReferenceSolution: `WITH failures AS (
  SELECT payment_method, COUNT(*) AS failed_count
  FROM payments
  WHERE payment_status = 'failed'
  GROUP BY payment_method
)
SELECT payment_method, failed_count,
       DENSE_RANK() OVER (ORDER BY failed_count DESC, payment_method ASC) AS failure_rank
FROM failures
ORDER BY failed_count DESC, payment_method ASC;`,
    pythonReferenceSolution: `grouped = {}
for payment in data['payments']:
    if payment['payment_status'] == 'failed':
        grouped[payment['payment_method']] = grouped.get(payment['payment_method'], 0) + 1
result = []
for index, (method, count) in enumerate(sorted(grouped.items(), key=lambda item: (-item[1], item[0])), start=1):
    result.append({'payment_method': method, 'failed_count': count, 'failure_rank': index})`,
    pysparkReferenceSolution: `failures_df = payments_df.filter(F.col("payment_status") == "failed").groupBy("payment_method").agg(F.count("*").alias("failed_count"))
w = Window.orderBy(F.col("failed_count").desc(), F.col("payment_method").asc())
result_df = failures_df.withColumn("failure_rank", F.dense_rank().over(w)).select("payment_method", "failed_count", "failure_rank").orderBy(F.col("failed_count").desc(), "payment_method")`,
    pysparkRequirements: makePysparkRequirements(req.filter, req.group, req.agg, req.window, req.over, req.rank, req.select),
  });
}

function secondOrderLagFamily(context: FamilyContext): AdvancedSeed {
  const seed = retainedCustomersFamily(context);
  return {
    ...seed,
    category: "cohort-retention",
    title: "Second order lag monitor",
    question: `Return customers whose second paid/completed order lag is greater than 0 and no more than ${context.days} days.`,
  };
}

const worldFiveFamilies: FamilyBuilder[] = [
  (context) => cleanEmailFamily(context),
  (context) => normalizeCountryFamily(context),
  (context) => parseSkuFamily(context),
  (context) => validEmailFamily(context),
  (context) => cleanSignupDateFamily(context),
  (context) => fillPaymentMethodFamily(context),
  (context) => normalizeStatusFamily(context),
  (context) => splitNameFamily(context),
  (context) => validRawCustomerGateFamily(context),
  (context) => canonicalProductFamily(context),
];

function cleanEmailFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["raw_id", "clean_email"];
  return baseSeed(context, {
    category: "dirty-cleanup",
    title: "Clean customer email",
    theme: "World 5 cleanup",
    businessContext: "Raw customer email must be trimmed and lowercased.",
    question: "Return raw_id and clean_email for rows with a present email.",
    tables: [tables.rawCustomers],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => sortRows(tableRows(input, "raw_customers")
      .filter((row) => row.raw_email !== null && String(row.raw_email).trim() !== "")
      .map((row) => ({ raw_id: row.raw_id, clean_email: String(row.raw_email).trim().toLowerCase() })), [["raw_id", "asc"]]),
    sqlReferenceSolution: `SELECT raw_id, LOWER(TRIM(raw_email)) AS clean_email
FROM raw_customers
WHERE raw_email IS NOT NULL AND TRIM(raw_email) <> ''
ORDER BY raw_id;`,
    pythonReferenceSolution: `result = sorted([
    {'raw_id': row['raw_id'], 'clean_email': row['raw_email'].strip().lower()}
    for row in data['raw_customers']
    if row['raw_email'] is not None and row['raw_email'].strip() != ''
], key=lambda row: row['raw_id'])`,
    pysparkReferenceSolution: `result_df = raw_customers_df.filter(F.col("raw_email").isNotNull() & (F.trim("raw_email") != "")).withColumn("clean_email", F.lower(F.trim("raw_email"))).select("raw_id", "clean_email").orderBy("raw_id")`,
    pysparkRequirements: makePysparkRequirements(req.filter, req.withColumn, req.trim, req.lower, req.select),
  });
}

function normalizeCountryFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["raw_id", "clean_country"];
  return baseSeed(context, {
    category: "null-handling",
    title: "Normalize country",
    theme: "World 5 cleanup",
    businessContext: "Country codes need uppercase values and UNKNOWN for blanks.",
    question: "Return raw_id and clean_country with trimmed uppercase country, using UNKNOWN for blanks.",
    tables: [tables.rawCustomers],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => sortRows(tableRows(input, "raw_customers").map((row) => {
      const clean = String(row.raw_country ?? "").trim().toUpperCase();
      return { raw_id: row.raw_id, clean_country: clean || "UNKNOWN" };
    }), [["raw_id", "asc"]]),
    sqlReferenceSolution: `SELECT raw_id,
       CASE WHEN TRIM(COALESCE(raw_country, '')) = '' THEN 'UNKNOWN' ELSE UPPER(TRIM(raw_country)) END AS clean_country
FROM raw_customers
ORDER BY raw_id;`,
    pythonReferenceSolution: `result = sorted([
    {'raw_id': row['raw_id'], 'clean_country': (row.get('raw_country') or '').strip().upper() or 'UNKNOWN'}
    for row in data['raw_customers']
], key=lambda row: row['raw_id'])`,
    pysparkReferenceSolution: `result_df = raw_customers_df.withColumn("clean_country", F.when(F.trim(F.coalesce(F.col("raw_country"), F.lit(""))) == "", F.lit("UNKNOWN")).otherwise(F.upper(F.trim("raw_country")))).select("raw_id", "clean_country").orderBy("raw_id")`,
    pysparkRequirements: makePysparkRequirements(req.withColumn, req.when, req.coalesce, req.trim, req.lower, req.select),
  });
}

function parseSkuFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["sku", "canonical_sku"];
  return baseSeed(context, {
    category: "schema-normalization",
    title: "Canonical SKU mapping",
    theme: "World 5 normalization",
    businessContext: "Item feeds need only mapped canonical SKUs.",
    question: "Return distinct sku and canonical_sku for order items that have a product mapping.",
    tables: [tables.orderItems, tables.products],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const products = byKey(tableRows(input, "products"), "sku");
      const seen = new Map<string, ArcadeRow>();
      for (const item of tableRows(input, "order_items")) {
        const product = products.get(item.sku);
        if (product) seen.set(String(item.sku), { sku: item.sku, canonical_sku: product.canonical_sku });
      }
      return sortRows([...seen.values()], [["sku", "asc"]]);
    },
    sqlReferenceSolution: `SELECT DISTINCT i.sku, p.canonical_sku
FROM order_items i
JOIN products p ON p.sku = i.sku
ORDER BY i.sku;`,
    pythonReferenceSolution: `products = {row['sku']: row for row in data['products']}
seen = {}
for item in data['order_items']:
    if item['sku'] in products:
        seen[item['sku']] = {'sku': item['sku'], 'canonical_sku': products[item['sku']]['canonical_sku']}
result = sorted(seen.values(), key=lambda row: row['sku'])`,
    pysparkReferenceSolution: `result_df = order_items_df.join(products_df, "sku").select("sku", "canonical_sku").distinct().orderBy("sku")`,
    pysparkRequirements: makePysparkRequirements(req.join, req.select, { label: "deduplicate", anyOf: [".distinct(", ".dropDuplicates("] }),
  });
}

function validEmailFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["raw_id", "email_quality"];
  return baseSeed(context, {
    category: "quality-gates",
    title: "Email quality flag",
    theme: "World 5 quality",
    businessContext: "Email quality gates flag missing and malformed emails.",
    question: "Return raw_id and email_quality as missing, invalid, or valid.",
    tables: [tables.rawCustomers],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => sortRows(tableRows(input, "raw_customers").map((row) => {
      const email = String(row.raw_email ?? "").trim();
      return { raw_id: row.raw_id, email_quality: email === "" ? "missing" : email.includes("@") ? "valid" : "invalid" };
    }), [["raw_id", "asc"]]),
    sqlReferenceSolution: `SELECT raw_id,
       CASE
         WHEN TRIM(COALESCE(raw_email, '')) = '' THEN 'missing'
         WHEN INSTR(raw_email, '@') > 0 THEN 'valid'
         ELSE 'invalid'
       END AS email_quality
FROM raw_customers
ORDER BY raw_id;`,
    pythonReferenceSolution: `result = []
for row in data['raw_customers']:
    email = (row.get('raw_email') or '').strip()
    quality = 'missing' if email == '' else ('valid' if '@' in email else 'invalid')
    result.append({'raw_id': row['raw_id'], 'email_quality': quality})
result = sorted(result, key=lambda row: row['raw_id'])`,
    pysparkReferenceSolution: `result_df = raw_customers_df.withColumn("email_quality", F.when(F.trim(F.coalesce(F.col("raw_email"), F.lit(""))) == "", F.lit("missing")).when(F.instr(F.col("raw_email"), "@") > 0, F.lit("valid")).otherwise(F.lit("invalid"))).select("raw_id", "email_quality").orderBy("raw_id")`,
    pysparkRequirements: makePysparkRequirements(req.withColumn, req.when, req.coalesce, req.select),
  });
}

function cleanSignupDateFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["raw_id", "signup_date"];
  return baseSeed(context, {
    category: "string-date-parsing",
    title: "Parse signup date",
    theme: "World 5 dates",
    businessContext: "Raw dates arrive as MM/DD/YYYY and invalid text.",
    question: "Return raw_id and signup_date as YYYY-MM-DD for rows with a parseable raw_signup.",
    tables: [tables.rawCustomers],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => sortRows(tableRows(input, "raw_customers")
      .filter((row) => String(row.raw_signup).includes("/"))
      .map((row) => {
        const [month, day, year] = String(row.raw_signup).split("/");
        return { raw_id: row.raw_id, signup_date: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}` };
      }), [["raw_id", "asc"]]),
    sqlReferenceSolution: `SELECT raw_id,
       SUBSTR(raw_signup, 7, 4) || '-' || SUBSTR(raw_signup, 1, 2) || '-' || SUBSTR(raw_signup, 4, 2) AS signup_date
FROM raw_customers
WHERE raw_signup LIKE '__/__/____'
ORDER BY raw_id;`,
    pythonReferenceSolution: `result = []
for row in data['raw_customers']:
    raw = row['raw_signup']
    if '/' in raw:
        month, day, year = raw.split('/')
        result.append({'raw_id': row['raw_id'], 'signup_date': f"{year}-{month.zfill(2)}-{day.zfill(2)}"})
result = sorted(result, key=lambda row: row['raw_id'])`,
    pysparkReferenceSolution: `result_df = raw_customers_df.filter(F.col("raw_signup").like("__/__/____")).withColumn("signup_date", F.to_date("raw_signup", "MM/dd/yyyy")).select("raw_id", "signup_date").orderBy("raw_id")`,
    pysparkRequirements: makePysparkRequirements(req.filter, req.withColumn, req.date, req.select),
  });
}

function fillPaymentMethodFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["order_id", "payment_method"];
  return baseSeed(context, {
    category: "null-handling",
    title: "Fill payment method",
    theme: "World 5 nulls",
    businessContext: "Missing payment rows should surface as unknown_method.",
    question: "Return paid/completed orders with payment_method, using unknown_method when no payment exists.",
    tables: [tables.orders, tables.payments],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const payments = byKey(tableRows(input, "payments"), "order_id");
      return sortRows(tableRows(input, "orders")
        .filter((order) => ["paid", "completed"].includes(String(order.status)))
        .map((order) => ({ order_id: order.order_id, payment_method: payments.get(order.order_id)?.payment_method ?? "unknown_method" })), [["order_id", "asc"]]);
    },
    sqlReferenceSolution: `SELECT o.order_id, COALESCE(p.payment_method, 'unknown_method') AS payment_method
FROM orders o
LEFT JOIN payments p ON p.order_id = o.order_id
WHERE o.status IN ('paid', 'completed')
ORDER BY o.order_id;`,
    pythonReferenceSolution: `payments = {row['order_id']: row for row in data['payments']}
result = sorted([
    {'order_id': order['order_id'], 'payment_method': payments.get(order['order_id'], {}).get('payment_method', 'unknown_method')}
    for order in data['orders']
    if order['status'] in ('paid', 'completed')
], key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `result_df = orders_df.filter(F.col("status").isin("paid", "completed")).join(payments_df.select("order_id", "payment_method"), "order_id", "left").withColumn("payment_method", F.coalesce(F.col("payment_method"), F.lit("unknown_method"))).select("order_id", "payment_method").orderBy("order_id")`,
    pysparkRequirements: makePysparkRequirements(req.filter, req.join, req.withColumn, req.coalesce, req.select),
  });
}

function normalizeStatusFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["order_id", "normalized_status"];
  return baseSeed(context, {
    category: "schema-normalization",
    title: "Normalize order status",
    theme: "World 5 normalization",
    businessContext: "Completed and paid are both recognized as settled business status.",
    question: "Return order_id and normalized_status where paid/completed become settled, cancelled stays cancelled.",
    tables: [tables.orders],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => sortRows(tableRows(input, "orders").map((order) => ({
      order_id: order.order_id,
      normalized_status: ["paid", "completed"].includes(String(order.status)) ? "settled" : String(order.status),
    })), [["order_id", "asc"]]),
    sqlReferenceSolution: `SELECT order_id,
       CASE WHEN status IN ('paid', 'completed') THEN 'settled' ELSE status END AS normalized_status
FROM orders
ORDER BY order_id;`,
    pythonReferenceSolution: `result = sorted([
    {'order_id': order['order_id'], 'normalized_status': 'settled' if order['status'] in ('paid', 'completed') else order['status']}
    for order in data['orders']
], key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `result_df = orders_df.withColumn("normalized_status", F.when(F.col("status").isin("paid", "completed"), F.lit("settled")).otherwise(F.col("status"))).select("order_id", "normalized_status").orderBy("order_id")`,
    pysparkRequirements: makePysparkRequirements(req.withColumn, req.when, req.select),
  });
}

function splitNameFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["raw_id", "clean_name"];
  return baseSeed(context, {
    category: "dirty-cleanup",
    title: "Clean raw name",
    theme: "World 5 cleanup",
    businessContext: "Names are stripped before identity matching.",
    question: "Return raw_id and clean_name for nonblank names.",
    tables: [tables.rawCustomers],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => sortRows(tableRows(input, "raw_customers")
      .filter((row) => String(row.raw_name ?? "").trim() !== "")
      .map((row) => ({ raw_id: row.raw_id, clean_name: String(row.raw_name).trim() })), [["raw_id", "asc"]]),
    sqlReferenceSolution: `SELECT raw_id, TRIM(raw_name) AS clean_name
FROM raw_customers
WHERE TRIM(COALESCE(raw_name, '')) <> ''
ORDER BY raw_id;`,
    pythonReferenceSolution: `result = sorted([
    {'raw_id': row['raw_id'], 'clean_name': row['raw_name'].strip()}
    for row in data['raw_customers']
    if (row.get('raw_name') or '').strip() != ''
], key=lambda row: row['raw_id'])`,
    pysparkReferenceSolution: `result_df = raw_customers_df.filter(F.trim(F.coalesce(F.col("raw_name"), F.lit(""))) != "").withColumn("clean_name", F.trim("raw_name")).select("raw_id", "clean_name").orderBy("raw_id")`,
    pysparkRequirements: makePysparkRequirements(req.filter, req.withColumn, req.trim, req.select),
  });
}

function validRawCustomerGateFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["raw_id", "reject_reason"];
  return baseSeed(context, {
    category: "quality-gates",
    title: "Raw customer reject reason",
    theme: "World 5 quality",
    businessContext: "Bad raw customer rows need an explainable reject reason.",
    question: "Return invalid raw customer rows with reject_reason missing_name, bad_email, or bad_signup.",
    tables: [tables.rawCustomers],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => sortRows(tableRows(input, "raw_customers").map((row) => {
      const name = String(row.raw_name ?? "").trim();
      const email = String(row.raw_email ?? "").trim();
      const signup = String(row.raw_signup ?? "");
      const reason = name === "" ? "missing_name" : !email.includes("@") ? "bad_email" : !signup.includes("/") ? "bad_signup" : null;
      return reason ? { raw_id: row.raw_id, reject_reason: reason } : null;
    }).filter(Boolean) as ArcadeRow[], [["raw_id", "asc"]]),
    sqlReferenceSolution: `SELECT raw_id,
       CASE
         WHEN TRIM(COALESCE(raw_name, '')) = '' THEN 'missing_name'
         WHEN INSTR(COALESCE(raw_email, ''), '@') = 0 THEN 'bad_email'
         WHEN raw_signup NOT LIKE '__/__/____' THEN 'bad_signup'
       END AS reject_reason
FROM raw_customers
WHERE TRIM(COALESCE(raw_name, '')) = ''
   OR INSTR(COALESCE(raw_email, ''), '@') = 0
   OR raw_signup NOT LIKE '__/__/____'
ORDER BY raw_id;`,
    pythonReferenceSolution: `result = []
for row in data['raw_customers']:
    name = (row.get('raw_name') or '').strip()
    email = (row.get('raw_email') or '').strip()
    signup = row.get('raw_signup') or ''
    reason = 'missing_name' if name == '' else ('bad_email' if '@' not in email else ('bad_signup' if '/' not in signup else None))
    if reason:
        result.append({'raw_id': row['raw_id'], 'reject_reason': reason})
result = sorted(result, key=lambda row: row['raw_id'])`,
    pysparkReferenceSolution: `result_df = raw_customers_df.withColumn("reject_reason", F.when(F.trim(F.coalesce(F.col("raw_name"), F.lit(""))) == "", F.lit("missing_name")).when(F.instr(F.coalesce(F.col("raw_email"), F.lit("")), "@") == 0, F.lit("bad_email")).when(~F.col("raw_signup").like("__/__/____"), F.lit("bad_signup"))).filter(F.col("reject_reason").isNotNull()).select("raw_id", "reject_reason").orderBy("raw_id")`,
    pysparkRequirements: makePysparkRequirements(req.withColumn, req.when, req.coalesce, req.filter, req.select),
  });
}

function canonicalProductFamily(context: FamilyContext): AdvancedSeed {
  return parseSkuFamily({
    ...context,
    threshold: context.threshold + 1,
  });
}

const worldSixFamilies: FamilyBuilder[] = [
  (context) => duplicateJoinRiskFamily(context),
  (context) => itemAmountMismatchFamily(context),
  (context) => sourceTargetMissingFamily(context),
  (context) => duplicateOrderIdFamily(context),
  (context) => highAmountAnomalyFamily(context),
  (context) => orphanPaymentFamily(context),
  (context) => lateShipmentFamily(context),
  (context) => negativeOrZeroQuantityFamily(context),
  (context) => statusMismatchFamily(context),
  (context) => channelRevenueAnomalyFamily(context),
];

function duplicateJoinRiskFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["order_id", "item_rows"];
  return baseSeed(context, {
    category: "bad-join-debugging",
    title: "Bad join duplicate risk",
    theme: "World 6 debugging",
    businessContext: "Order joins to items can duplicate order rows.",
    question: "Return order_ids that would duplicate after joining to order_items.",
    tables: [tables.orders, tables.orderItems],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const counts = new Map<ArcadePrimitive, number>();
      for (const item of tableRows(input, "order_items")) counts.set(item.order_id, (counts.get(item.order_id) ?? 0) + 1);
      return sortRows([...counts.entries()].filter(([, count]) => count > 1).map(([order_id, item_rows]) => ({ order_id, item_rows })), [["order_id", "asc"]]);
    },
    sqlReferenceSolution: `SELECT o.order_id, COUNT(i.sku) AS item_rows
FROM orders o
JOIN order_items i ON i.order_id = o.order_id
GROUP BY o.order_id
HAVING COUNT(i.sku) > 1
ORDER BY o.order_id;`,
    pythonReferenceSolution: `counts = {}
order_ids = {row['order_id'] for row in data['orders']}
for item in data['order_items']:
    if item['order_id'] in order_ids:
        counts[item['order_id']] = counts.get(item['order_id'], 0) + 1
result = sorted([
    {'order_id': order_id, 'item_rows': count}
    for order_id, count in counts.items()
    if count > 1
], key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `result_df = orders_df.join(order_items_df, "order_id").groupBy("order_id").agg(F.count("sku").alias("item_rows")).filter(F.col("item_rows") > 1).select("order_id", "item_rows").orderBy("order_id")`,
    pysparkRequirements: makePysparkRequirements(req.join, req.group, req.agg, req.filter, req.select),
  });
}

function itemAmountMismatchFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["order_id", "amount", "item_total", "gap"];
  return baseSeed(context, {
    category: "metric-investigation",
    title: "Order amount versus item total",
    theme: "World 6 metrics",
    businessContext: "Revenue bugs show up when order amount differs from item total.",
    question: "Return orders where order amount differs from summed item total.",
    tables: [tables.orders, tables.orderItems],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const itemTotals = new Map<ArcadePrimitive, number>();
      for (const item of tableRows(input, "order_items")) itemTotals.set(item.order_id, (itemTotals.get(item.order_id) ?? 0) + Number(item.quantity) * Number(item.unit_price));
      return sortRows(tableRows(input, "orders").map((order) => {
        const itemTotal = itemTotals.get(order.order_id) ?? 0;
        return { order_id: order.order_id, amount: order.amount, item_total: sum([itemTotal]), gap: sum([Number(order.amount) - itemTotal]) };
      }).filter((row) => row.gap !== 0), [["order_id", "asc"]]);
    },
    sqlReferenceSolution: `WITH item_totals AS (
  SELECT order_id, SUM(quantity * unit_price) AS item_total
  FROM order_items
  GROUP BY order_id
)
SELECT o.order_id, o.amount, COALESCE(i.item_total, 0) AS item_total,
       ROUND(o.amount - COALESCE(i.item_total, 0), 2) AS gap
FROM orders o
LEFT JOIN item_totals i ON i.order_id = o.order_id
WHERE ROUND(o.amount - COALESCE(i.item_total, 0), 2) <> 0
ORDER BY o.order_id;`,
    pythonReferenceSolution: `item_totals = {}
for item in data['order_items']:
    item_totals[item['order_id']] = item_totals.get(item['order_id'], 0) + item['quantity'] * item['unit_price']
result = []
for order in data['orders']:
    item_total = round(item_totals.get(order['order_id'], 0), 2)
    gap = round(order['amount'] - item_total, 2)
    if gap != 0:
        result.append({'order_id': order['order_id'], 'amount': order['amount'], 'item_total': item_total, 'gap': gap})
result = sorted(result, key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `item_totals_df = order_items_df.groupBy("order_id").agg(F.sum(F.col("quantity") * F.col("unit_price")).alias("item_total"))
result_df = orders_df.join(item_totals_df, "order_id", "left").withColumn("item_total", F.coalesce(F.col("item_total"), F.lit(0))).withColumn("gap", F.round(F.col("amount") - F.col("item_total"), 2)).filter(F.col("gap") != 0).select("order_id", "amount", "item_total", "gap").orderBy("order_id")`,
    pysparkRequirements: makePysparkRequirements(req.group, req.agg, req.join, req.coalesce, req.withColumn, req.filter, req.select),
  });
}

function sourceTargetMissingFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["order_id", "source_amount"];
  return baseSeed(context, {
    category: "source-target-checks",
    title: "Source orders missing target",
    theme: "World 6 reconciliation",
    businessContext: "Source-to-target checks find orders that failed to load.",
    question: "Return source order audit rows with no target_amount.",
    tables: [tables.orderAudit],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => sortRows(tableRows(input, "order_audit")
      .filter((row) => row.target_amount === null)
      .map((row) => ({ order_id: row.order_id, source_amount: row.source_amount })), [["order_id", "asc"]]),
    sqlReferenceSolution: `SELECT order_id, source_amount
FROM order_audit
WHERE target_amount IS NULL
ORDER BY order_id;`,
    pythonReferenceSolution: `result = sorted([
    {'order_id': row['order_id'], 'source_amount': row['source_amount']}
    for row in data['order_audit']
    if row['target_amount'] is None
], key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `result_df = order_audit_df.filter(F.col("target_amount").isNull()).select("order_id", "source_amount").orderBy("order_id")`,
    pysparkRequirements: makePysparkRequirements(req.filter, req.select),
  });
}

function duplicateOrderIdFamily(context: FamilyContext): AdvancedSeed {
  return duplicateJoinRiskFamily({ ...context, threshold: context.threshold + 2 });
}

function highAmountAnomalyFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["order_id", "channel", "amount"];
  return baseSeed(context, {
    category: "anomaly-detection",
    title: "High amount anomaly",
    theme: "World 6 anomalies",
    businessContext: "Revenue monitoring flags extreme order amounts.",
    question: `Return orders above ${context.threshold} as amount anomalies.`,
    tables: [tables.orders],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => sortRows(tableRows(input, "orders")
      .filter((row) => Number(row.amount) > context.threshold)
      .map((row) => ({ order_id: row.order_id, channel: row.channel, amount: row.amount })), [["amount", "desc"], ["order_id", "asc"]]),
    sqlReferenceSolution: `SELECT order_id, channel, amount
FROM orders
WHERE amount > ${context.threshold}
ORDER BY amount DESC, order_id;`,
    pythonReferenceSolution: `result = sorted([
    {'order_id': row['order_id'], 'channel': row['channel'], 'amount': row['amount']}
    for row in data['orders']
    if row['amount'] > ${context.threshold}
], key=lambda row: (-row['amount'], row['order_id']))`,
    pysparkReferenceSolution: `result_df = orders_df.filter(F.col("amount") > ${context.threshold}).select("order_id", "channel", "amount").orderBy(F.col("amount").desc(), "order_id")`,
    pysparkRequirements: makePysparkRequirements(req.filter, req.select),
  });
}

function orphanPaymentFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["order_id", "payment_status", "paid_amount"];
  return baseSeed(context, {
    category: "source-target-checks",
    title: "Orphan payments",
    theme: "World 6 checks",
    businessContext: "Payments with no source order should be isolated.",
    question: "Return payment rows whose order_id does not exist in orders.",
    tables: [tables.payments, tables.orders],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const orderIds = new Set(tableRows(input, "orders").map((row) => row.order_id));
      return sortRows(tableRows(input, "payments")
        .filter((row) => !orderIds.has(row.order_id))
        .map((row) => ({ order_id: row.order_id, payment_status: row.payment_status, paid_amount: row.paid_amount })), [["order_id", "asc"]]);
    },
    sqlReferenceSolution: `SELECT p.order_id, p.payment_status, p.paid_amount
FROM payments p
LEFT JOIN orders o ON o.order_id = p.order_id
WHERE o.order_id IS NULL
ORDER BY p.order_id;`,
    pythonReferenceSolution: `order_ids = {row['order_id'] for row in data['orders']}
result = sorted([
    {'order_id': row['order_id'], 'payment_status': row['payment_status'], 'paid_amount': row['paid_amount']}
    for row in data['payments']
    if row['order_id'] not in order_ids
], key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `result_df = payments_df.join(orders_df.select("order_id"), "order_id", "left_anti").select("order_id", "payment_status", "paid_amount").orderBy("order_id")`,
    pysparkRequirements: makePysparkRequirements(req.join, req.select, { label: "anti join", anyOf: ["left_anti"] }),
  });
}

function lateShipmentFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["order_id", "delivery_days"];
  return baseSeed(context, {
    category: "anomaly-detection",
    title: "Late shipment check",
    theme: "World 6 anomalies",
    businessContext: "Late shipments violate fulfillment expectations.",
    question: `Return delivered shipments taking more than ${context.days} days from shipped_at to delivered_at.`,
    tables: [tables.shipments],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => sortRows(tableRows(input, "shipments").map((row) => ({
      order_id: row.order_id,
      delivery_days: daysBetween(row.shipped_at, row.delivered_at),
    })).filter((row) => row.delivery_days !== null && Number(row.delivery_days) > context.days) as ArcadeRow[], [["order_id", "asc"]]),
    sqlReferenceSolution: `SELECT order_id,
       CAST(julianday(delivered_at) - julianday(shipped_at) AS INTEGER) AS delivery_days
FROM shipments
WHERE delivered_at IS NOT NULL
  AND CAST(julianday(delivered_at) - julianday(shipped_at) AS INTEGER) > ${context.days}
ORDER BY order_id;`,
    pythonReferenceSolution: `from datetime import datetime
result = []
for row in data['shipments']:
    if row['delivered_at'] is not None:
        days = (datetime.fromisoformat(row['delivered_at']) - datetime.fromisoformat(row['shipped_at'])).days
        if days > ${context.days}:
            result.append({'order_id': row['order_id'], 'delivery_days': days})
result = sorted(result, key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `result_df = shipments_df.filter(F.col("delivered_at").isNotNull()).withColumn("delivery_days", F.datediff(F.to_date("delivered_at"), F.to_date("shipped_at"))).filter(F.col("delivery_days") > ${context.days}).select("order_id", "delivery_days").orderBy("order_id")`,
    pysparkRequirements: makePysparkRequirements(req.filter, req.withColumn, req.date, req.select),
  });
}

function negativeOrZeroQuantityFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["order_id", "sku", "quantity"];
  return baseSeed(context, {
    category: "quality-gates",
    title: "Low quantity item check",
    theme: "World 6 quality",
    businessContext: "Item rows must have positive quantity.",
    question: "Return item rows where quantity is less than or equal to 1.",
    tables: [tables.orderItems],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => sortRows(tableRows(input, "order_items")
      .filter((row) => Number(row.quantity) <= 1)
      .map((row) => ({ order_id: row.order_id, sku: row.sku, quantity: row.quantity })), [["order_id", "asc"], ["sku", "asc"]]),
    sqlReferenceSolution: `SELECT order_id, sku, quantity
FROM order_items
WHERE quantity <= 1
ORDER BY order_id, sku;`,
    pythonReferenceSolution: `result = sorted([
    {'order_id': row['order_id'], 'sku': row['sku'], 'quantity': row['quantity']}
    for row in data['order_items']
    if row['quantity'] <= 1
], key=lambda row: (row['order_id'], row['sku']))`,
    pysparkReferenceSolution: `result_df = order_items_df.filter(F.col("quantity") <= 1).select("order_id", "sku", "quantity").orderBy("order_id", "sku")`,
    pysparkRequirements: makePysparkRequirements(req.filter, req.select),
  });
}

function statusMismatchFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["order_id", "status", "target_status"];
  return baseSeed(context, {
    category: "metric-investigation",
    title: "Status mismatch investigation",
    theme: "World 6 debugging",
    businessContext: "Target order status should match source order status.",
    question: "Return audit rows where source status from orders differs from target_status.",
    tables: [tables.orders, tables.orderAudit],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const orders = byKey(tableRows(input, "orders"), "order_id");
      return sortRows(tableRows(input, "order_audit")
        .filter((audit) => audit.target_status !== null && orders.has(audit.order_id) && orders.get(audit.order_id)?.status !== audit.target_status)
        .map((audit) => ({ order_id: audit.order_id, status: orders.get(audit.order_id)?.status ?? null, target_status: audit.target_status })), [["order_id", "asc"]]);
    },
    sqlReferenceSolution: `SELECT a.order_id, o.status, a.target_status
FROM order_audit a
JOIN orders o ON o.order_id = a.order_id
WHERE a.target_status IS NOT NULL AND o.status <> a.target_status
ORDER BY a.order_id;`,
    pythonReferenceSolution: `orders = {row['order_id']: row for row in data['orders']}
result = sorted([
    {'order_id': row['order_id'], 'status': orders[row['order_id']]['status'], 'target_status': row['target_status']}
    for row in data['order_audit']
    if row['target_status'] is not None and row['order_id'] in orders and orders[row['order_id']]['status'] != row['target_status']
], key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `result_df = order_audit_df.join(orders_df.select("order_id", "status"), "order_id").filter(F.col("target_status").isNotNull() & (F.col("status") != F.col("target_status"))).select("order_id", "status", "target_status").orderBy("order_id")`,
    pysparkRequirements: makePysparkRequirements(req.join, req.filter, req.select),
  });
}

function channelRevenueAnomalyFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["channel", "paid_revenue"];
  return baseSeed(context, {
    category: "anomaly-detection",
    title: "Channel revenue anomaly",
    theme: "World 6 anomalies",
    businessContext: "Channels above threshold need investigation.",
    question: `Return channels where paid/completed revenue is above ${context.threshold}.`,
    tables: [tables.orders],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const grouped = new Map<string, number>();
      for (const order of tableRows(input, "orders")) {
        if (["paid", "completed"].includes(String(order.status))) grouped.set(String(order.channel), (grouped.get(String(order.channel)) ?? 0) + Number(order.amount));
      }
      return sortRows([...grouped.entries()]
        .filter(([, revenue]) => revenue > context.threshold)
        .map(([channel, paid_revenue]) => ({ channel, paid_revenue: sum([paid_revenue]) })), [["paid_revenue", "desc"], ["channel", "asc"]]);
    },
    sqlReferenceSolution: `SELECT channel, SUM(amount) AS paid_revenue
FROM orders
WHERE status IN ('paid', 'completed')
GROUP BY channel
HAVING SUM(amount) > ${context.threshold}
ORDER BY paid_revenue DESC, channel;`,
    pythonReferenceSolution: `grouped = {}
for order in data['orders']:
    if order['status'] in ('paid', 'completed'):
        grouped[order['channel']] = grouped.get(order['channel'], 0) + order['amount']
result = sorted([
    {'channel': channel, 'paid_revenue': round(revenue, 2)}
    for channel, revenue in grouped.items()
    if revenue > ${context.threshold}
], key=lambda row: (-row['paid_revenue'], row['channel']))`,
    pysparkReferenceSolution: `result_df = orders_df.filter(F.col("status").isin("paid", "completed")).groupBy("channel").agg(F.sum("amount").alias("paid_revenue")).filter(F.col("paid_revenue") > ${context.threshold}).select("channel", "paid_revenue").orderBy(F.col("paid_revenue").desc(), "channel")`,
    pysparkRequirements: makePysparkRequirements(req.filter, req.group, req.agg, req.alias, req.select),
  });
}

const worldSevenFamilies: FamilyBuilder[] = [
  (context) => customerLifetimeValueFamily(context),
  (context) => lifecycleStageFamily(context),
  (context) => productMarginFamily(context),
  (context) => shipmentSlaFamily(context),
  (context) => checkoutToPaymentFamily(context),
  (context) => refundImpactFamily(context),
  (context) => cohortRevenueFamily(context),
  (context) => goldenCustomerFamily(context),
  (context) => productCoverageFamily(context),
  (context) => validationSummaryFamily(context),
];

function customerLifetimeValueFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["customer_id", "customer_name", "lifetime_value"];
  return baseSeed(context, {
    category: "customer-lifecycle",
    title: "Customer lifetime value",
    theme: "World 7 lifecycle",
    businessContext: "Lifecycle scoring starts with paid revenue per customer.",
    question: `Return customers with lifetime paid/completed revenue above ${context.threshold}.`,
    tables: [tables.customers, tables.orders],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const customers = byKey(tableRows(input, "customers"), "customer_id");
      const grouped = new Map<ArcadePrimitive, number>();
      for (const order of tableRows(input, "orders")) {
        if (customers.has(order.customer_id) && ["paid", "completed"].includes(String(order.status))) grouped.set(order.customer_id, (grouped.get(order.customer_id) ?? 0) + Number(order.amount));
      }
      return sortRows([...grouped.entries()]
        .filter(([, value]) => value > context.threshold)
        .map(([customer_id, value]) => ({ customer_id, customer_name: customers.get(customer_id)?.customer_name ?? null, lifetime_value: sum([value]) })), [["lifetime_value", "desc"], ["customer_id", "asc"]]);
    },
    sqlReferenceSolution: `SELECT c.customer_id, c.customer_name, SUM(o.amount) AS lifetime_value
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
WHERE o.status IN ('paid', 'completed')
GROUP BY c.customer_id, c.customer_name
HAVING SUM(o.amount) > ${context.threshold}
ORDER BY lifetime_value DESC, c.customer_id;`,
    pythonReferenceSolution: `customers = {row['customer_id']: row for row in data['customers']}
grouped = {}
for order in data['orders']:
    if order['customer_id'] in customers and order['status'] in ('paid', 'completed'):
        grouped[order['customer_id']] = grouped.get(order['customer_id'], 0) + order['amount']
result = sorted([
    {'customer_id': customer_id, 'customer_name': customers[customer_id]['customer_name'], 'lifetime_value': round(value, 2)}
    for customer_id, value in grouped.items()
    if value > ${context.threshold}
], key=lambda row: (-row['lifetime_value'], row['customer_id']))`,
    pysparkReferenceSolution: `result_df = customers_df.join(orders_df, "customer_id").filter(F.col("status").isin("paid", "completed")).groupBy("customer_id", "customer_name").agg(F.sum("amount").alias("lifetime_value")).filter(F.col("lifetime_value") > ${context.threshold}).select("customer_id", "customer_name", "lifetime_value").orderBy(F.col("lifetime_value").desc(), "customer_id")`,
    pysparkRequirements: makePysparkRequirements(req.join, req.filter, req.group, req.agg, req.alias, req.select),
  });
}

function lifecycleStageFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["customer_id", "order_count", "lifecycle_stage"];
  return baseSeed(context, {
    category: "customer-lifecycle",
    title: "Customer lifecycle stage",
    theme: "World 7 lifecycle",
    businessContext: "Lifecycle labels depend on paid order counts.",
    question: "Classify customers as repeat if they have at least 2 paid/completed orders, else starter.",
    tables: [tables.customers, tables.orders],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const counts = new Map<ArcadePrimitive, number>();
      for (const order of tableRows(input, "orders")) {
        if (["paid", "completed"].includes(String(order.status))) counts.set(order.customer_id, (counts.get(order.customer_id) ?? 0) + 1);
      }
      return sortRows(tableRows(input, "customers").map((customer) => {
        const orderCount = counts.get(customer.customer_id) ?? 0;
        return { customer_id: customer.customer_id, order_count: orderCount, lifecycle_stage: orderCount >= 2 ? "repeat" : "starter" };
      }), [["customer_id", "asc"]]);
    },
    sqlReferenceSolution: `SELECT c.customer_id,
       COUNT(o.order_id) AS order_count,
       CASE WHEN COUNT(o.order_id) >= 2 THEN 'repeat' ELSE 'starter' END AS lifecycle_stage
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id AND o.status IN ('paid', 'completed')
GROUP BY c.customer_id
ORDER BY c.customer_id;`,
    pythonReferenceSolution: `counts = {}
for order in data['orders']:
    if order['status'] in ('paid', 'completed'):
        counts[order['customer_id']] = counts.get(order['customer_id'], 0) + 1
result = sorted([
    {'customer_id': customer['customer_id'], 'order_count': counts.get(customer['customer_id'], 0), 'lifecycle_stage': 'repeat' if counts.get(customer['customer_id'], 0) >= 2 else 'starter'}
    for customer in data['customers']
], key=lambda row: row['customer_id'])`,
    pysparkReferenceSolution: `counts_df = orders_df.filter(F.col("status").isin("paid", "completed")).groupBy("customer_id").agg(F.count("order_id").alias("order_count"))
result_df = customers_df.join(counts_df, "customer_id", "left").withColumn("order_count", F.coalesce(F.col("order_count"), F.lit(0))).withColumn("lifecycle_stage", F.when(F.col("order_count") >= 2, F.lit("repeat")).otherwise(F.lit("starter"))).select("customer_id", "order_count", "lifecycle_stage").orderBy("customer_id")`,
    pysparkRequirements: makePysparkRequirements(req.filter, req.group, req.agg, req.join, req.coalesce, req.withColumn, req.when, req.select),
  });
}

function productMarginFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["category", "gross_margin"];
  return baseSeed(context, {
    category: "revenue-analysis",
    title: "Category gross margin",
    theme: "World 7 revenue",
    businessContext: "Margin analysis uses product mapping and item revenue.",
    question: "Return gross margin by product category.",
    tables: [tables.orderItems, tables.products],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const products = byKey(tableRows(input, "products"), "sku");
      const grouped = new Map<string, number>();
      for (const item of tableRows(input, "order_items")) {
        const product = products.get(item.sku);
        if (!product) continue;
        const margin = Number(item.quantity) * Number(item.unit_price) * Number(product.margin_rate);
        grouped.set(String(product.category), (grouped.get(String(product.category)) ?? 0) + margin);
      }
      return sortRows([...grouped.entries()].map(([category, gross_margin]) => ({ category, gross_margin: Number(gross_margin.toFixed(2)) })), [["category", "asc"]]);
    },
    sqlReferenceSolution: `SELECT p.category, ROUND(SUM(i.quantity * i.unit_price * p.margin_rate), 2) AS gross_margin
FROM order_items i
JOIN products p ON p.sku = i.sku
GROUP BY p.category
ORDER BY p.category;`,
    pythonReferenceSolution: `products = {row['sku']: row for row in data['products']}
grouped = {}
for item in data['order_items']:
    if item['sku'] in products:
        product = products[item['sku']]
        grouped[product['category']] = grouped.get(product['category'], 0) + item['quantity'] * item['unit_price'] * product['margin_rate']
result = sorted([
    {'category': category, 'gross_margin': round(value, 2)}
    for category, value in grouped.items()
], key=lambda row: row['category'])`,
    pysparkReferenceSolution: `result_df = order_items_df.join(products_df, "sku").groupBy("category").agg(F.round(F.sum(F.col("quantity") * F.col("unit_price") * F.col("margin_rate")), 2).alias("gross_margin")).select("category", "gross_margin").orderBy("category")`,
    pysparkRequirements: makePysparkRequirements(req.join, req.group, req.agg, req.alias, req.select),
  });
}

function shipmentSlaFamily(context: FamilyContext): AdvancedSeed {
  return lateShipmentFamily(context);
}

function checkoutToPaymentFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["session_id", "minutes_to_payment"];
  return baseSeed(context, {
    category: "sla-timing",
    title: "Checkout to payment timing",
    theme: "World 7 timing",
    businessContext: "Checkout sessions should reach payment quickly.",
    question: `Return sessions where checkout to payment took no more than ${context.days * 10} minutes.`,
    tables: [tables.events],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const grouped = new Map<string, ArcadeRow[]>();
      for (const event of tableRows(input, "events")) grouped.set(String(event.session_id), [...(grouped.get(String(event.session_id)) ?? []), event]);
      const result: ArcadeRow[] = [];
      for (const [sessionId, events] of grouped.entries()) {
        const checkout = events.find((event) => event.event_type === "checkout");
        const payment = events.find((event) => event.event_type === "payment");
        const minutes = minutesBetween(checkout?.event_time ?? null, payment?.event_time ?? null);
        if (minutes !== null && minutes <= context.days * 10) result.push({ session_id: sessionId, minutes_to_payment: minutes });
      }
      return sortRows(result, [["session_id", "asc"]]);
    },
    sqlReferenceSolution: `SELECT c.session_id,
       CAST((julianday(p.event_time) - julianday(c.event_time)) * 24 * 60 AS INTEGER) AS minutes_to_payment
FROM events c
JOIN events p ON p.session_id = c.session_id AND p.event_type = 'payment'
WHERE c.event_type = 'checkout'
  AND CAST((julianday(p.event_time) - julianday(c.event_time)) * 24 * 60 AS INTEGER) <= ${context.days * 10}
ORDER BY c.session_id;`,
    pythonReferenceSolution: `from datetime import datetime
grouped = {}
for event in data['events']:
    grouped.setdefault(event['session_id'], []).append(event)
result = []
for session_id, events in grouped.items():
    checkout = next((event for event in events if event['event_type'] == 'checkout'), None)
    payment = next((event for event in events if event['event_type'] == 'payment'), None)
    if checkout and payment:
        minutes = int((datetime.fromisoformat(payment['event_time']) - datetime.fromisoformat(checkout['event_time'])).total_seconds() / 60)
        if minutes <= ${context.days * 10}:
            result.append({'session_id': session_id, 'minutes_to_payment': minutes})
result = sorted(result, key=lambda row: row['session_id'])`,
    pysparkReferenceSolution: `checkout_df = events_df.filter(F.col("event_type") == "checkout").select("session_id", F.col("event_time").alias("checkout_time"))
payment_df = events_df.filter(F.col("event_type") == "payment").select("session_id", F.col("event_time").alias("payment_time"))
result_df = checkout_df.join(payment_df, "session_id").withColumn("minutes_to_payment", ((F.unix_timestamp("payment_time") - F.unix_timestamp("checkout_time")) / 60).cast("int")).filter(F.col("minutes_to_payment") <= ${context.days * 10}).select("session_id", "minutes_to_payment").orderBy("session_id")`,
    pysparkRequirements: makePysparkRequirements(
      req.filter,
      req.join,
      req.withColumn,
      { label: "timestamp difference", anyOf: ["unix_timestamp(", "to_timestamp("] },
      req.select,
    ),
  });
}

function refundImpactFamily(context: FamilyContext): AdvancedSeed {
  return itemAmountMismatchFamily(context);
}

function cohortRevenueFamily(context: FamilyContext): AdvancedSeed {
  const seed = customerLifetimeValueFamily(context);
  return {
    ...seed,
    category: "customer-lifecycle",
    title: "Cohort revenue customer list",
    question: `Return customers whose paid lifetime value is above ${context.threshold} for lifecycle review.`,
  };
}

function goldenCustomerFamily(context: FamilyContext): AdvancedSeed {
  const seed = cleanEmailFamily(context);
  return {
    ...seed,
    category: "advanced-validation",
    title: "Golden customer email",
    question: "Return cleaned raw customer emails for golden-record matching.",
  };
}

function productCoverageFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildTables(context);
  const columns = ["sku", "missing_mapping_count"];
  return baseSeed(context, {
    category: "advanced-validation",
    title: "Missing product mappings",
    theme: "World 7 validation",
    businessContext: "Unmapped SKUs break downstream product analytics.",
    question: "Return SKUs in order_items that do not have a product mapping.",
    tables: [tables.orderItems, tables.products],
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected: (input) => {
      const products = new Set(tableRows(input, "products").map((row) => row.sku));
      const counts = new Map<string, number>();
      for (const item of tableRows(input, "order_items")) {
        if (!products.has(item.sku)) counts.set(String(item.sku), (counts.get(String(item.sku)) ?? 0) + 1);
      }
      return sortRows([...counts.entries()].map(([sku, missing_mapping_count]) => ({ sku, missing_mapping_count })), [["sku", "asc"]]);
    },
    sqlReferenceSolution: `SELECT i.sku, COUNT(*) AS missing_mapping_count
FROM order_items i
LEFT JOIN products p ON p.sku = i.sku
WHERE p.sku IS NULL
GROUP BY i.sku
ORDER BY i.sku;`,
    pythonReferenceSolution: `mapped = {row['sku'] for row in data['products']}
counts = {}
for item in data['order_items']:
    if item['sku'] not in mapped:
        counts[item['sku']] = counts.get(item['sku'], 0) + 1
result = sorted([
    {'sku': sku, 'missing_mapping_count': count}
    for sku, count in counts.items()
], key=lambda row: row['sku'])`,
    pysparkReferenceSolution: `result_df = order_items_df.join(products_df.select("sku"), "sku", "left_anti").groupBy("sku").agg(F.count("*").alias("missing_mapping_count")).select("sku", "missing_mapping_count").orderBy("sku")`,
    pysparkRequirements: makePysparkRequirements(req.join, req.group, req.agg, req.alias, req.select, { label: "anti join", anyOf: ["left_anti"] }),
  });
}

function validationSummaryFamily(context: FamilyContext): AdvancedSeed {
  const seed = validRawCustomerGateFamily(context);
  return {
    ...seed,
    category: "advanced-validation",
    title: "Customer validation exceptions",
    question: "Return customer validation exceptions with the first reject reason.",
  };
}

const familiesByWorld: Record<number, FamilyBuilder[]> = {
  3: worldThreeFamilies,
  4: worldFourFamilies,
  5: worldFiveFamilies,
  6: worldSixFamilies,
  7: worldSevenFamilies,
};

function buildContext(worldNumber: number, familyIndex: number, variant: number): FamilyContext {
  const levelNumber = 101 + (worldNumber - 3) * 50 + familyIndex * 5 + variant;
  return {
    levelNumber,
    worldNumber,
    familyIndex,
    variant,
    threshold: 70 + (worldNumber - 3) * 20 + familyIndex * 8 + variant * 5,
    minOrders: 1 + (variant % 3),
    days: 2 + ((familyIndex + variant) % 4),
    topN: 1 + (variant % 2),
    status: variant % 2 === 0 ? "paid" : "completed",
    country: countryCycle[(familyIndex + variant) % countryCycle.length],
    channel: channelCycle[(familyIndex + variant) % channelCycle.length],
    month: `2026-${String(3 + (variant % 2)).padStart(2, "0")}`,
  };
}

function buildAdvancedBundles() {
  const bundles: AdvancedArcadeLevelBundle[] = [];

  for (let worldNumber = 3; worldNumber <= 7; worldNumber += 1) {
    const families = familiesByWorld[worldNumber];
    for (let familyIndex = 0; familyIndex < families.length; familyIndex += 1) {
      for (let variant = 0; variant < 5; variant += 1) {
        bundles.push(buildBundle(families[familyIndex](buildContext(worldNumber, familyIndex, variant))));
      }
    }
  }

  return bundles;
}

export const arcadeWorldsThreeSevenBundles = buildAdvancedBundles();

if (arcadeWorldsThreeSevenBundles.length !== 250) {
  throw new Error(`Arcade Worlds 3-7 must contain 250 levels. Received ${arcadeWorldsThreeSevenBundles.length}.`);
}

export const arcadeWorldsThreeSevenBundleMap = new Map(
  arcadeWorldsThreeSevenBundles.map((bundle) => [bundle.levelNumber, bundle] as const),
);

export function getArcadeWorldsThreeSevenBundle(levelNumber: number) {
  return arcadeWorldsThreeSevenBundleMap.get(levelNumber) ?? null;
}

export function getArcadeWorldBundles(worldNumber: number) {
  return arcadeWorldsThreeSevenBundles.filter((bundle) => Math.ceil(bundle.levelNumber / 50) === worldNumber);
}
