import type { ArcadeWorldOneLevelBundle } from "@/lib/arcade-world-one";
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

interface ArcadeDatasetContract {
  datasetId: string;
  tables: ArcadeTableFixture[];
  primaryTableName: string;
  nullBehavior: string;
  duplicateBehavior: string;
  numericComparisonRule: string;
}

interface ArcadeResultContract {
  requiredOutputColumns: string[];
  expectedRows: ArcadeRow[];
  orderSensitive: boolean;
  nullBehavior: string;
  duplicateBehavior: string;
  numericComparisonRule: string;
}

export interface ArcadeWorldTwoLevelBundle extends Omit<ArcadeWorldOneLevelBundle, "category"> {
  category:
    | "joins"
    | "left-joins"
    | "group-metrics"
    | "conditional-aggregation"
    | "deduplication"
    | "latest-record"
    | "date-window"
    | "data-quality"
    | "reconciliation"
    | "normalization"
    | "debugging";
}

type TablesInput = Record<string, ArcadeRow[]>;

type SortField = {
  column: string;
  direction: "asc" | "desc";
};

type WorldTwoSeed = {
  levelNumber: number;
  category: ArcadeWorldTwoLevelBundle["category"];
  title: string;
  theme: string;
  businessContext: string;
  question: string;
  tables: ArcadeTableFixture[];
  expectedOutput: string[];
  successChecklist: string[];
  orderSensitive: boolean;
  deriveExpected: (input: TablesInput) => ArcadeRow[];
  buildHiddenInput?: (input: TablesInput) => TablesInput;
  sqlReferenceSolution: string;
  pythonReferenceSolution: string;
  pysparkReferenceSolution: string;
  pysparkRequirements: StructuralRequirement[];
  pysparkHiddenRequirements?: StructuralRequirement[];
  pysparkForbiddenPatterns?: string[];
  representativeIncorrectAnswers?: Record<"sql" | "python" | "pyspark", string>;
};

function cloneRows(rows: ArcadeRow[]) {
  return rows.map((row) => ({ ...row }));
}

function cloneInput(input: TablesInput) {
  return Object.fromEntries(
    Object.entries(input).map(([name, rows]) => [name, cloneRows(rows)]),
  ) as TablesInput;
}

function reverseInput(input: TablesInput) {
  return Object.fromEntries(
    Object.entries(input).map(([name, rows]) => [name, cloneRows([...rows].reverse())]),
  ) as TablesInput;
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

function sortRows(rows: ArcadeRow[], orderBy: SortField[]) {
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

function sqlLiteral(value: ArcadePrimitive) {
  if (value === null) return "NULL";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "1" : "0";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function createSetupSql(tables: ArcadeTableFixture[]) {
  return tables
    .map((table) => {
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
    })
    .join("\n");
}

function normalizeFingerprint(value: string) {
  return value.toLowerCase().replace(/\s+/gu, " ").trim();
}

function buildDatasetContract(levelNumber: number, tables: ArcadeTableFixture[]): ArcadeDatasetContract {
  return {
    datasetId: `arcade-world-2-level-${String(levelNumber).padStart(4, "0")}`,
    tables: tables.map((table) => ({
      name: table.name,
      frameName: table.frameName,
      columns: table.columns.map((column) => ({ ...column })),
      rows: cloneRows(table.rows),
    })),
    primaryTableName: tables[0]?.name ?? "unknown",
    nullBehavior: "Preserve fixture nulls exactly unless the task explicitly requests cleanup or exclusion.",
    duplicateBehavior: "Preserve duplicates exactly unless the task explicitly requests deduplication or aggregation.",
    numericComparisonRule: "Compare numeric values exactly against the expected output contract.",
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

function buildFingerprint(
  category: ArcadeWorldTwoLevelBundle["category"],
  question: string,
  datasetContract: ArcadeDatasetContract,
  resultContract: ArcadeResultContract,
) {
  return normalizeFingerprint(
    [
      category,
      question,
      datasetContract.datasetId,
      datasetContract.tables
        .map(
          (table) =>
            `${table.name}:${table.columns.map((column) => `${column.name}:${column.type}`).join(",")}:${JSON.stringify(table.rows)}`,
        )
        .join(" | "),
      JSON.stringify(resultContract.expectedRows),
      resultContract.orderSensitive ? "ordered" : "unordered",
    ].join(" | "),
  );
}

function buildPythonStarter(tables: ArcadeTableFixture[]) {
  const lines = tables.map((table) => `# use data['${table.name}']`);
  return [...lines, "result = []"].join("\n");
}

function buildPysparkStarter(tables: ArcadeTableFixture[]) {
  const lines = [
    "from pyspark.sql import functions as F",
    "from pyspark.sql import Window",
    "",
    ...tables.map((table) => `# assume ${table.frameName} already exists`),
    `result_df = ${tables[0]?.frameName ?? "df"}`,
  ];
  return lines.join("\n");
}

function toInput(tables: ArcadeTableFixture[]) {
  return Object.fromEntries(tables.map((table) => [table.name, cloneRows(table.rows)])) as TablesInput;
}

function mapBy<T extends ArcadeRow>(rows: T[], key: keyof T) {
  const result = new Map<ArcadePrimitive, T>();
  for (const row of rows) {
    result.set(row[key] ?? null, row);
  }
  return result;
}

function normalizeText(value: ArcadePrimitive) {
  return String(value ?? "").trim().toUpperCase();
}

function toNumber(value: ArcadePrimitive) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function latestRows(rows: ArcadeRow[], keyColumn: string, sortColumn: string) {
  const latest = new Map<string, ArcadeRow>();
  for (const row of rows) {
    const key = String(row[keyColumn]);
    const current = latest.get(key);
    if (!current || compareSortable(current[sortColumn] ?? null, row[sortColumn] ?? null) < 0) {
      latest.set(key, { ...row });
    }
  }
  return [...latest.values()];
}

function buildBundle(seed: WorldTwoSeed): ArcadeWorldTwoLevelBundle {
  const visibleInput = toInput(seed.tables);
  const hiddenInput = seed.buildHiddenInput ? seed.buildHiddenInput(cloneInput(visibleInput)) : reverseInput(visibleInput);
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
    uniqueLogicFingerprint: buildFingerprint(seed.category, seed.question, datasetContract, resultContract),
    representativeIncorrectAnswers,
    level: {
      levelNumber: seed.levelNumber,
      title: seed.title,
      theme: seed.theme,
      prompt: `Solve this ${seed.category.replace(/-/g, " ")} arcade task across SQL, Python, and PySpark.`,
      question: seed.question,
      businessContext: seed.businessContext,
      dataset: seed.tables.flatMap((table) => [
        `Table: ${table.name}`,
        `Columns: ${table.columns.map((column) => column.name).join(", ")}`,
        `Python input: data['${table.name}']`,
        `PySpark input: ${table.frameName}`,
      ]),
      expectedOutput: seed.expectedOutput,
      successChecklist: seed.successChecklist,
      sqlGoal: "Write SQL that returns only the required result for this level.",
      pythonGoal: "Write Python using the provided data tables and assign the final list to result.",
      pysparkGoal: "Write PySpark using the provided DataFrames and assign the final DataFrame to result_df.",
    },
    sql: {
      starterCode: "",
      referenceSolution: seed.sqlReferenceSolution,
      setupSql: createSetupSql(seed.tables),
      orderSensitive: seed.orderSensitive,
      validatorVersion: 2,
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
          description: "Keeps the same business logic on a hidden fixture variant.",
          input: cloneInput(hiddenInput),
          expected: hiddenExpected,
        },
      ],
      validatorVersion: 2,
    },
    pyspark: {
      starterCode: buildPysparkStarter(seed.tables),
      referenceSolution: seed.pysparkReferenceSolution,
      requirements: [
        { label: "final dataframe assignment", anyOf: ["result_df ="] },
        ...seed.pysparkRequirements,
      ],
      hiddenRequirements: seed.pysparkHiddenRequirements ?? [],
      forbiddenPatterns: seed.pysparkForbiddenPatterns ?? [".collect(", ".toPandas("],
      resultExpectation: seed.expectedOutput.join(" "),
      validatorVersion: 2,
    },
  };
}

function table(
  name: string,
  frameName: string,
  columns: ArcadeColumn[],
  rows: ArcadeRow[],
): ArcadeTableFixture {
  return { name, frameName, columns, rows };
}

const customersTable = table(
  "customers",
  "customers_df",
  [
    { name: "customer_id", type: "INTEGER" },
    { name: "customer_name", type: "TEXT" },
    { name: "country", type: "TEXT" },
    { name: "segment", type: "TEXT" },
  ],
  [
    { customer_id: 1, customer_name: "Ava", country: "US", segment: "enterprise" },
    { customer_id: 2, customer_name: "Ben", country: "CA", segment: "smb" },
    { customer_id: 3, customer_name: "Cara", country: "IN", segment: "enterprise" },
    { customer_id: 4, customer_name: "Drew", country: "US", segment: "smb" },
    { customer_id: 5, customer_name: "Eli", country: "GB", segment: "mid-market" },
    { customer_id: 6, customer_name: "Faye", country: "AU", segment: "enterprise" },
  ],
);

const ordersTable = table(
  "orders",
  "orders_df",
  [
    { name: "order_id", type: "INTEGER" },
    { name: "customer_id", type: "INTEGER" },
    { name: "status", type: "TEXT" },
    { name: "amount", type: "REAL" },
    { name: "order_date", type: "TEXT" },
    { name: "channel", type: "TEXT" },
  ],
  [
    { order_id: 1001, customer_id: 1, status: "paid", amount: 120, order_date: "2026-07-01", channel: "web" },
    { order_id: 1002, customer_id: 2, status: "cancelled", amount: 40, order_date: "2026-07-02", channel: "store" },
    { order_id: 1003, customer_id: 3, status: "paid", amount: 80, order_date: "2026-07-03", channel: "web" },
    { order_id: 1004, customer_id: 1, status: "completed", amount: 60, order_date: "2026-07-04", channel: "mobile" },
    { order_id: 1005, customer_id: 4, status: "paid", amount: 200, order_date: "2026-07-05", channel: "partner" },
    { order_id: 1006, customer_id: 5, status: "paid", amount: 150, order_date: "2026-07-08", channel: "web" },
  ],
);

const paymentsTable = table(
  "payments",
  "payments_df",
  [
    { name: "order_id", type: "INTEGER" },
    { name: "payment_status", type: "TEXT" },
    { name: "paid_amount", type: "REAL" },
    { name: "payment_method", type: "TEXT" },
    { name: "paid_at", type: "TEXT" },
  ],
  [
    { order_id: 1001, payment_status: "settled", paid_amount: 120, payment_method: "card", paid_at: "2026-07-01T09:10:00" },
    { order_id: 1003, payment_status: "failed", paid_amount: 80, payment_method: "upi", paid_at: "2026-07-03T10:00:00" },
    { order_id: 1004, payment_status: "settled", paid_amount: 60, payment_method: "wallet", paid_at: "2026-07-04T11:00:00" },
    { order_id: 1005, payment_status: "settled", paid_amount: 180, payment_method: "bank", paid_at: "2026-07-05T13:00:00" },
  ],
);

const shipmentsTable = table(
  "shipments",
  "shipments_df",
  [
    { name: "order_id", type: "INTEGER" },
    { name: "shipped_at", type: "TEXT" },
    { name: "delivered_at", type: "TEXT" },
    { name: "carrier", type: "TEXT" },
    { name: "shipment_status", type: "TEXT" },
  ],
  [
    { order_id: 1001, shipped_at: "2026-07-02T08:00:00", delivered_at: "2026-07-04T10:00:00", carrier: "ups", shipment_status: "delivered" },
    { order_id: 1003, shipped_at: "2026-07-04T09:00:00", delivered_at: null, carrier: "dhl", shipment_status: "in_transit" },
    { order_id: 1004, shipped_at: "2026-07-05T07:30:00", delivered_at: "2026-07-05T20:00:00", carrier: "fedex", shipment_status: "delivered" },
    { order_id: 1005, shipped_at: "2026-07-08T06:00:00", delivered_at: "2026-07-11T12:00:00", carrier: "ups", shipment_status: "delayed" },
  ],
);

const orderItemsTable = table(
  "order_items",
  "order_items_df",
  [
    { name: "order_id", type: "INTEGER" },
    { name: "raw_sku", type: "TEXT" },
    { name: "quantity", type: "INTEGER" },
    { name: "unit_price", type: "REAL" },
  ],
  [
    { order_id: 1001, raw_sku: "SKU-1", quantity: 2, unit_price: 50 },
    { order_id: 1001, raw_sku: "SKU-2", quantity: 1, unit_price: 20 },
    { order_id: 1003, raw_sku: "SKU-3", quantity: 4, unit_price: 20 },
    { order_id: 1004, raw_sku: "SKU-4", quantity: 3, unit_price: 20 },
    { order_id: 1005, raw_sku: "SKU-2", quantity: 5, unit_price: 40 },
    { order_id: 1006, raw_sku: "SKU-X", quantity: 1, unit_price: 150 },
  ],
);

const productMapTable = table(
  "product_map",
  "product_map_df",
  [
    { name: "raw_sku", type: "TEXT" },
    { name: "canonical_sku", type: "TEXT" },
    { name: "category", type: "TEXT" },
  ],
  [
    { raw_sku: "SKU-1", canonical_sku: "CAN-1", category: "gadgets" },
    { raw_sku: "SKU-2", canonical_sku: "CAN-2", category: "home" },
    { raw_sku: "SKU-3", canonical_sku: "CAN-3", category: "gadgets" },
  ],
);

const ticketsTable = table(
  "support_tickets",
  "support_tickets_df",
  [
    { name: "ticket_id", type: "INTEGER" },
    { name: "customer_id", type: "INTEGER" },
    { name: "opened_at", type: "TEXT" },
    { name: "severity", type: "TEXT" },
    { name: "ticket_status", type: "TEXT" },
  ],
  [
    { ticket_id: 2001, customer_id: 1, opened_at: "2026-07-06T10:00:00", severity: "high", ticket_status: "open" },
    { ticket_id: 2002, customer_id: 2, opened_at: "2026-07-06T12:00:00", severity: "low", ticket_status: "closed" },
    { ticket_id: 2003, customer_id: 3, opened_at: "2026-07-07T09:30:00", severity: "medium", ticket_status: "open" },
    { ticket_id: 2004, customer_id: 9, opened_at: "2026-07-08T08:45:00", severity: "high", ticket_status: "open" },
  ],
);

const payoutsTable = table(
  "seller_payouts",
  "seller_payouts_df",
  [
    { name: "order_id", type: "INTEGER" },
    { name: "payout_amount", type: "REAL" },
    { name: "payout_status", type: "TEXT" },
  ],
  [
    { order_id: 1001, payout_amount: 110, payout_status: "sent" },
    { order_id: 1003, payout_amount: 80, payout_status: "pending" },
    { order_id: 1004, payout_amount: 60, payout_status: "sent" },
    { order_id: 1005, payout_amount: 150, payout_status: "sent" },
  ],
);

const profilesTable = table(
  "profiles",
  "profiles_df",
  [
    { name: "customer_id", type: "INTEGER" },
    { name: "tier", type: "TEXT" },
    { name: "updated_at", type: "TEXT" },
  ],
  [
    { customer_id: 1, tier: "bronze", updated_at: "2026-07-01T08:00:00" },
    { customer_id: 1, tier: "gold", updated_at: "2026-07-05T09:00:00" },
    { customer_id: 2, tier: "silver", updated_at: "2026-07-02T08:00:00" },
    { customer_id: 2, tier: "gold", updated_at: "2026-07-03T07:30:00" },
    { customer_id: 3, tier: "silver", updated_at: "2026-07-01T06:00:00" },
  ],
);

const eventsTable = table(
  "events",
  "events_df",
  [
    { name: "event_id", type: "TEXT" },
    { name: "device_id", type: "TEXT" },
    { name: "event_type", type: "TEXT" },
    { name: "event_time", type: "TEXT" },
    { name: "ingest_time", type: "TEXT" },
  ],
  [
    { event_id: "e1", device_id: "d1", event_type: "click", event_time: "2026-07-01T10:00:00", ingest_time: "2026-07-01T10:05:00" },
    { event_id: "e1", device_id: "d1", event_type: "click", event_time: "2026-07-01T10:00:00", ingest_time: "2026-07-01T10:07:00" },
    { event_id: "e2", device_id: "d2", event_type: "view", event_time: "2026-07-01T11:00:00", ingest_time: "2026-07-01T11:03:00" },
    { event_id: "e3", device_id: "d3", event_type: "click", event_time: "2026-07-01T12:00:00", ingest_time: "2026-07-01T12:01:00" },
  ],
);

const orderSnapshotsTable = table(
  "order_snapshots",
  "order_snapshots_df",
  [
    { name: "order_id", type: "INTEGER" },
    { name: "snapshot_status", type: "TEXT" },
    { name: "snapshot_at", type: "TEXT" },
  ],
  [
    { order_id: 1001, snapshot_status: "pending", snapshot_at: "2026-07-01T08:00:00" },
    { order_id: 1001, snapshot_status: "paid", snapshot_at: "2026-07-01T09:15:00" },
    { order_id: 1003, snapshot_status: "pending", snapshot_at: "2026-07-03T09:00:00" },
    { order_id: 1003, snapshot_status: "failed", snapshot_at: "2026-07-03T10:05:00" },
    { order_id: 1005, snapshot_status: "created", snapshot_at: "2026-07-05T11:00:00" },
  ],
);

const accountsExtractTable = table(
  "account_extracts",
  "account_extracts_df",
  [
    { name: "account_id", type: "TEXT" },
    { name: "country_code_raw", type: "TEXT" },
    { name: "active_flag_raw", type: "TEXT" },
    { name: "loaded_at", type: "TEXT" },
  ],
  [
    { account_id: "a1", country_code_raw: "us", active_flag_raw: "Y", loaded_at: "2026-07-01T08:00:00" },
    { account_id: "a1", country_code_raw: "us", active_flag_raw: "Y", loaded_at: "2026-07-03T08:00:00" },
    { account_id: "a2", country_code_raw: "ca", active_flag_raw: "Y", loaded_at: "2026-07-02T08:00:00" },
    { account_id: "a3", country_code_raw: "in", active_flag_raw: "N", loaded_at: "2026-07-02T08:00:00" },
  ],
);

const subscriptionsTable = table(
  "subscriptions",
  "subscriptions_df",
  [
    { name: "subscription_id", type: "TEXT" },
    { name: "plan", type: "TEXT" },
    { name: "changed_at", type: "TEXT" },
  ],
  [
    { subscription_id: "s1", plan: "trial", changed_at: "2026-07-01T00:00:00" },
    { subscription_id: "s1", plan: "active", changed_at: "2026-07-04T00:00:00" },
    { subscription_id: "s2", plan: "paused", changed_at: "2026-07-02T00:00:00" },
    { subscription_id: "s2", plan: "active", changed_at: "2026-07-05T00:00:00" },
  ],
);

const paymentAttemptsTable = table(
  "payment_attempts",
  "payment_attempts_df",
  [
    { name: "order_id", type: "INTEGER" },
    { name: "attempt_status", type: "TEXT" },
    { name: "attempt_amount", type: "REAL" },
    { name: "attempted_at", type: "TEXT" },
  ],
  [
    { order_id: 1001, attempt_status: "failed", attempt_amount: 120, attempted_at: "2026-07-01T09:00:00" },
    { order_id: 1001, attempt_status: "settled", attempt_amount: 120, attempted_at: "2026-07-01T09:10:00" },
    { order_id: 1003, attempt_status: "failed", attempt_amount: 80, attempted_at: "2026-07-03T10:00:00" },
    { order_id: 1004, attempt_status: "pending", attempt_amount: 60, attempted_at: "2026-07-04T10:00:00" },
    { order_id: 1004, attempt_status: "settled", attempt_amount: 60, attempted_at: "2026-07-04T11:00:00" },
    { order_id: 1005, attempt_status: "settled", attempt_amount: 180, attempted_at: "2026-07-05T13:00:00" },
  ],
);

const shipmentEventsTable = table(
  "shipment_events",
  "shipment_events_df",
  [
    { name: "order_id", type: "INTEGER" },
    { name: "event_status", type: "TEXT" },
    { name: "updated_at", type: "TEXT" },
  ],
  [
    { order_id: 1001, event_status: "packed", updated_at: "2026-07-02T08:00:00" },
    { order_id: 1001, event_status: "delivered", updated_at: "2026-07-04T10:00:00" },
    { order_id: 1003, event_status: "packed", updated_at: "2026-07-04T09:00:00" },
    { order_id: 1003, event_status: "in_transit", updated_at: "2026-07-05T10:00:00" },
    { order_id: 1005, event_status: "packed", updated_at: "2026-07-08T07:00:00" },
    { order_id: 1005, event_status: "delayed", updated_at: "2026-07-10T14:00:00" },
  ],
);

const balancesTable = table(
  "daily_balances",
  "daily_balances_df",
  [
    { name: "customer_id", type: "INTEGER" },
    { name: "snapshot_date", type: "TEXT" },
    { name: "plan", type: "TEXT" },
    { name: "balance", type: "REAL" },
  ],
  [
    { customer_id: 1, snapshot_date: "2026-07-01", plan: "basic", balance: 10 },
    { customer_id: 1, snapshot_date: "2026-07-03", plan: "pro", balance: 25 },
    { customer_id: 2, snapshot_date: "2026-07-02", plan: "basic", balance: 5 },
    { customer_id: 2, snapshot_date: "2026-07-04", plan: "basic", balance: 7 },
    { customer_id: 3, snapshot_date: "2026-07-03", plan: "pro", balance: 20 },
  ],
);

const planChangesTable = table(
  "plan_changes",
  "plan_changes_df",
  [
    { name: "account_id", type: "TEXT" },
    { name: "plan_name", type: "TEXT" },
    { name: "changed_at", type: "TEXT" },
  ],
  [
    { account_id: "a1", plan_name: "basic", changed_at: "2026-07-01T00:00:00" },
    { account_id: "a1", plan_name: "pro", changed_at: "2026-07-06T00:00:00" },
    { account_id: "a2", plan_name: "basic", changed_at: "2026-07-03T00:00:00" },
    { account_id: "a2", plan_name: "plus", changed_at: "2026-07-05T00:00:00" },
    { account_id: "a3", plan_name: "trial", changed_at: "2026-07-02T00:00:00" },
  ],
);

const rawAccountsTable = table(
  "raw_accounts",
  "raw_accounts_df",
  [
    { name: "account_id", type: "TEXT" },
    { name: "country_code_raw", type: "TEXT" },
    { name: "active_flag_raw", type: "TEXT" },
  ],
  [
    { account_id: "a1", country_code_raw: " us ", active_flag_raw: "Y" },
    { account_id: "a2", country_code_raw: "", active_flag_raw: "Y" },
    { account_id: "a3", country_code_raw: null, active_flag_raw: "N" },
    { account_id: "a4", country_code_raw: "gb", active_flag_raw: "Y" },
    { account_id: "a5", country_code_raw: "zz", active_flag_raw: "Y" },
  ],
);

const countryDimTable = table(
  "country_dim",
  "country_dim_df",
  [
    { name: "country_code", type: "TEXT" },
    { name: "country_name", type: "TEXT" },
  ],
  [
    { country_code: "US", country_name: "United States" },
    { country_code: "CA", country_name: "Canada" },
    { country_code: "IN", country_name: "India" },
    { country_code: "GB", country_name: "United Kingdom" },
  ],
);

const customerSummaryTable = table(
  "customer_order_summary",
  "customer_order_summary_df",
  [
    { name: "customer_id", type: "INTEGER" },
    { name: "recorded_order_count", type: "INTEGER" },
  ],
  [
    { customer_id: 1, recorded_order_count: 2 },
    { customer_id: 2, recorded_order_count: 2 },
    { customer_id: 3, recorded_order_count: 1 },
    { customer_id: 4, recorded_order_count: 1 },
    { customer_id: 5, recorded_order_count: 0 },
  ],
);

const rawSkuLinesTable = table(
  "raw_sku_lines",
  "raw_sku_lines_df",
  [
    { name: "line_id", type: "INTEGER" },
    { name: "raw_sku_text", type: "TEXT" },
    { name: "line_status", type: "TEXT" },
  ],
  [
    { line_id: 1, raw_sku_text: " sku-1 ", line_status: "fulfilled" },
    { line_id: 2, raw_sku_text: "SKU-2", line_status: "fulfilled" },
    { line_id: 3, raw_sku_text: "sku-4", line_status: "fulfilled" },
    { line_id: 4, raw_sku_text: "sku-3 ", line_status: "pending" },
  ],
);

const joinSeeds: WorldTwoSeed[] = [
  {
    levelNumber: 51,
    category: "joins",
    title: "Level 51: Paid order customers",
    theme: "intermediate joins",
    businessContext: "an order-to-customer reporting extract",
    question: "Join paid orders to customers and return `order_id`, `customer_name`, `segment`, and `amount`.",
    tables: [customersTable, ordersTable],
    expectedOutput: [
      "Keep only paid orders with a matching customer.",
      "Return columns: order_id, customer_name, segment, amount.",
      "Sort by order_id ascending.",
    ],
    successChecklist: [
      "Use the customer_id join key.",
      "Filter to paid orders only.",
      "Return one row per kept order.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const customers = mapBy(input.customers, "customer_id");
      return sortRows(
        input.orders
          .filter((row) => row.status === "paid")
          .flatMap((row) => {
            const customer = customers.get(row.customer_id ?? null);
            return customer
              ? [
                  {
                    order_id: row.order_id,
                    customer_name: customer.customer_name,
                    segment: customer.segment,
                    amount: row.amount,
                  },
                ]
              : [];
          }),
        [{ column: "order_id", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT o.order_id, c.customer_name, c.segment, o.amount
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
WHERE o.status = 'paid'
ORDER BY o.order_id;`,
    pythonReferenceSolution: `customers_by_id = {row['customer_id']: row for row in data['customers']}
result = []
for row in data['orders']:
    if row['status'] == 'paid' and row['customer_id'] in customers_by_id:
        customer = customers_by_id[row['customer_id']]
        result.append({
            'order_id': row['order_id'],
            'customer_name': customer['customer_name'],
            'segment': customer['segment'],
            'amount': row['amount'],
        })
result = sorted(result, key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `result_df = orders_df.join(customers_df, on='customer_id', how='inner').filter(F.col('status') == 'paid').select('order_id', 'customer_name', 'segment', 'amount').orderBy('order_id')`,
    pysparkRequirements: [
      { label: "join", anyOf: [".join("] },
      { label: "paid filter", anyOf: ["status", "paid"] },
      { label: "customer source", anyOf: ["customers_df"] },
      { label: "order source", anyOf: ["orders_df"] },
      { label: "projection", anyOf: [".select("] },
      { label: "ordering", anyOf: [".orderBy("] },
    ],
  },
  {
    levelNumber: 52,
    category: "joins",
    title: "Level 52: Canonical item mapping",
    theme: "intermediate joins",
    businessContext: "a product mapping cleanup step",
    question: "Join order items to the product map and return mapped rows as `order_id`, `canonical_sku`, `category`, and `quantity`.",
    tables: [orderItemsTable, productMapTable],
    expectedOutput: [
      "Keep only rows with a matching product map entry.",
      "Return columns: order_id, canonical_sku, category, quantity.",
      "Sort by order_id then canonical_sku.",
    ],
    successChecklist: [
      "Join raw_sku to the product map.",
      "Drop unmapped rows.",
      "Return only the requested output columns.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const mapping = mapBy(input.product_map, "raw_sku");
      return sortRows(
        input.order_items.flatMap((row) => {
          const mapped = mapping.get(row.raw_sku ?? null);
          return mapped
            ? [
                {
                  order_id: row.order_id,
                  canonical_sku: mapped.canonical_sku,
                  category: mapped.category,
                  quantity: row.quantity,
                },
              ]
            : [];
        }),
        [
          { column: "order_id", direction: "asc" },
          { column: "canonical_sku", direction: "asc" },
        ],
      );
    },
    sqlReferenceSolution: `SELECT i.order_id, m.canonical_sku, m.category, i.quantity
FROM order_items i
JOIN product_map m ON m.raw_sku = i.raw_sku
ORDER BY i.order_id, m.canonical_sku;`,
    pythonReferenceSolution: `mapping = {row['raw_sku']: row for row in data['product_map']}
result = []
for row in data['order_items']:
    mapped = mapping.get(row['raw_sku'])
    if mapped:
        result.append({
            'order_id': row['order_id'],
            'canonical_sku': mapped['canonical_sku'],
            'category': mapped['category'],
            'quantity': row['quantity'],
        })
result = sorted(result, key=lambda row: (row['order_id'], row['canonical_sku']))`,
    pysparkReferenceSolution: `result_df = order_items_df.join(product_map_df, on='raw_sku', how='inner').select('order_id', 'canonical_sku', 'category', 'quantity').orderBy('order_id', 'canonical_sku')`,
    pysparkRequirements: [
      { label: "join", anyOf: [".join("] },
      { label: "product map source", anyOf: ["product_map_df"] },
      { label: "order items source", anyOf: ["order_items_df"] },
      { label: "projection", anyOf: [".select("] },
      { label: "ordering", anyOf: [".orderBy("] },
      { label: "sku join key", anyOf: ["raw_sku"] },
    ],
  },
  {
    levelNumber: 53,
    category: "joins",
    title: "Level 53: Delivered shipment facts",
    theme: "intermediate joins",
    businessContext: "a shipment milestone extract",
    question: "Join delivered shipments to orders and return `order_id`, `order_date`, `carrier`, and `delivered_at`.",
    tables: [ordersTable, shipmentsTable],
    expectedOutput: [
      "Keep only delivered shipments with a matching order.",
      "Return columns: order_id, order_date, carrier, delivered_at.",
      "Sort by delivered_at ascending.",
    ],
    successChecklist: [
      "Join shipments to orders on order_id.",
      "Keep only delivered shipments.",
      "Preserve the delivered timestamp.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const orders = mapBy(input.orders, "order_id");
      return sortRows(
        input.shipments.flatMap((row) => {
          const order = orders.get(row.order_id ?? null);
          return order && row.delivered_at
            ? [
                {
                  order_id: row.order_id,
                  order_date: order.order_date,
                  carrier: row.carrier,
                  delivered_at: row.delivered_at,
                },
              ]
            : [];
        }),
        [{ column: "delivered_at", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT s.order_id, o.order_date, s.carrier, s.delivered_at
FROM shipments s
JOIN orders o ON o.order_id = s.order_id
WHERE s.delivered_at IS NOT NULL
ORDER BY s.delivered_at;`,
    pythonReferenceSolution: `orders_by_id = {row['order_id']: row for row in data['orders']}
result = []
for row in data['shipments']:
    order = orders_by_id.get(row['order_id'])
    if order and row['delivered_at'] is not None:
        result.append({
            'order_id': row['order_id'],
            'order_date': order['order_date'],
            'carrier': row['carrier'],
            'delivered_at': row['delivered_at'],
        })
result = sorted(result, key=lambda row: row['delivered_at'])`,
    pysparkReferenceSolution: `result_df = shipments_df.join(orders_df, on='order_id', how='inner').filter(F.col('delivered_at').isNotNull()).select('order_id', 'order_date', 'carrier', 'delivered_at').orderBy('delivered_at')`,
    pysparkRequirements: [
      { label: "join", anyOf: [".join("] },
      { label: "not-null delivery filter", anyOf: [".isNotNull()", "delivered_at"] },
      { label: "orders source", anyOf: ["orders_df"] },
      { label: "shipments source", anyOf: ["shipments_df"] },
      { label: "ordering", anyOf: [".orderBy("] },
    ],
  },
  {
    levelNumber: 54,
    category: "joins",
    title: "Level 54: Open ticket geography",
    theme: "intermediate joins",
    businessContext: "a support operations queue",
    question: "Join open tickets to customers and return `ticket_id`, `country`, and `severity`.",
    tables: [ticketsTable, customersTable],
    expectedOutput: [
      "Keep only open tickets with a matching customer.",
      "Return columns: ticket_id, country, severity.",
      "Sort by ticket_id ascending.",
    ],
    successChecklist: [
      "Join tickets to customers on customer_id.",
      "Filter to open tickets only.",
      "Exclude unmatched tickets.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const customers = mapBy(input.customers, "customer_id");
      return sortRows(
        input.support_tickets.flatMap((row) => {
          const customer = customers.get(row.customer_id ?? null);
          return customer && row.ticket_status === "open"
            ? [{ ticket_id: row.ticket_id, country: customer.country, severity: row.severity }]
            : [];
        }),
        [{ column: "ticket_id", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT t.ticket_id, c.country, t.severity
FROM support_tickets t
JOIN customers c ON c.customer_id = t.customer_id
WHERE t.ticket_status = 'open'
ORDER BY t.ticket_id;`,
    pythonReferenceSolution: `customers_by_id = {row['customer_id']: row for row in data['customers']}
result = []
for row in data['support_tickets']:
    customer = customers_by_id.get(row['customer_id'])
    if customer and row['ticket_status'] == 'open':
        result.append({
            'ticket_id': row['ticket_id'],
            'country': customer['country'],
            'severity': row['severity'],
        })
result = sorted(result, key=lambda row: row['ticket_id'])`,
    pysparkReferenceSolution: `result_df = support_tickets_df.join(customers_df, on='customer_id', how='inner').filter(F.col('ticket_status') == 'open').select('ticket_id', 'country', 'severity').orderBy('ticket_id')`,
    pysparkRequirements: [
      { label: "join", anyOf: [".join("] },
      { label: "open filter", anyOf: ["ticket_status", "open"] },
      { label: "tickets source", anyOf: ["support_tickets_df"] },
      { label: "customers source", anyOf: ["customers_df"] },
      { label: "projection", anyOf: [".select("] },
    ],
  },
  {
    levelNumber: 55,
    category: "joins",
    title: "Level 55: Settled payment matches",
    theme: "intermediate joins",
    businessContext: "a cash application feed",
    question: "Join settled payments to orders and customers and return `order_id`, `customer_name`, `paid_amount`, and `payment_method`.",
    tables: [ordersTable, paymentsTable, customersTable],
    expectedOutput: [
      "Keep only settled payments with matching orders and customers.",
      "Return columns: order_id, customer_name, paid_amount, payment_method.",
      "Sort by order_id ascending.",
    ],
    successChecklist: [
      "Filter to settled payments only.",
      "Join both order and customer details.",
      "Return one row per settled payment row.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const orders = mapBy(input.orders, "order_id");
      const customers = mapBy(input.customers, "customer_id");
      return sortRows(
        input.payments.flatMap((payment) => {
          const order = orders.get(payment.order_id ?? null);
          const customer = order ? customers.get(order.customer_id ?? null) : null;
          return payment.payment_status === "settled" && order && customer
            ? [
                {
                  order_id: payment.order_id,
                  customer_name: customer.customer_name,
                  paid_amount: payment.paid_amount,
                  payment_method: payment.payment_method,
                },
              ]
            : [];
        }),
        [{ column: "order_id", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT p.order_id, c.customer_name, p.paid_amount, p.payment_method
FROM payments p
JOIN orders o ON o.order_id = p.order_id
JOIN customers c ON c.customer_id = o.customer_id
WHERE p.payment_status = 'settled'
ORDER BY p.order_id;`,
    pythonReferenceSolution: `orders_by_id = {row['order_id']: row for row in data['orders']}
customers_by_id = {row['customer_id']: row for row in data['customers']}
result = []
for payment in data['payments']:
    order = orders_by_id.get(payment['order_id'])
    customer = customers_by_id.get(order['customer_id']) if order else None
    if payment['payment_status'] == 'settled' and order and customer:
        result.append({
            'order_id': payment['order_id'],
            'customer_name': customer['customer_name'],
            'paid_amount': payment['paid_amount'],
            'payment_method': payment['payment_method'],
        })
result = sorted(result, key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `result_df = payments_df.join(orders_df, on='order_id', how='inner').join(customers_df, on='customer_id', how='inner').filter(F.col('payment_status') == 'settled').select('order_id', 'customer_name', 'paid_amount', 'payment_method').orderBy('order_id')`,
    pysparkRequirements: [
      { label: "two joins", anyOf: [".join("] },
      { label: "settled filter", anyOf: ["payment_status", "settled"] },
      { label: "payments source", anyOf: ["payments_df"] },
      { label: "orders source", anyOf: ["orders_df"] },
      { label: "customers source", anyOf: ["customers_df"] },
      { label: "projection", anyOf: [".select("] },
    ],
    pysparkHiddenRequirements: [{ label: "customer join key", anyOf: ["customer_id"] }],
  },
  {
    levelNumber: 56,
    category: "joins",
    title: "Level 56: Completed item revenue lines",
    theme: "intermediate joins",
    businessContext: "a downstream fulfillment mart",
    question: "Join completed or paid orders to items and return `order_id`, `channel`, `quantity`, and `line_revenue`.",
    tables: [ordersTable, orderItemsTable],
    expectedOutput: [
      "Keep only paid or completed orders.",
      "Return columns: order_id, channel, quantity, line_revenue.",
      "Sort by order_id then quantity descending.",
    ],
    successChecklist: [
      "Join items to orders on order_id.",
      "Calculate line_revenue as quantity * unit_price.",
      "Drop cancelled orders.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const orders = mapBy(input.orders.filter((row) => row.status === "paid" || row.status === "completed"), "order_id");
      return sortRows(
        input.order_items.flatMap((item) => {
          const order = orders.get(item.order_id ?? null);
          return order
            ? [
                {
                  order_id: item.order_id,
                  channel: order.channel,
                  quantity: item.quantity,
                  line_revenue: toNumber(item.quantity) * toNumber(item.unit_price),
                },
              ]
            : [];
        }),
        [
          { column: "order_id", direction: "asc" },
          { column: "quantity", direction: "desc" },
        ],
      );
    },
    sqlReferenceSolution: `SELECT i.order_id, o.channel, i.quantity, i.quantity * i.unit_price AS line_revenue
FROM order_items i
JOIN orders o ON o.order_id = i.order_id
WHERE o.status IN ('paid', 'completed')
ORDER BY i.order_id, i.quantity DESC;`,
    pythonReferenceSolution: `orders_by_id = {
    row['order_id']: row
    for row in data['orders']
    if row['status'] in ('paid', 'completed')
}
result = []
for item in data['order_items']:
    order = orders_by_id.get(item['order_id'])
    if order:
        result.append({
            'order_id': item['order_id'],
            'channel': order['channel'],
            'quantity': item['quantity'],
            'line_revenue': item['quantity'] * item['unit_price'],
        })
result = sorted(result, key=lambda row: (row['order_id'], -row['quantity']))`,
    pysparkReferenceSolution: `result_df = order_items_df.join(orders_df, on='order_id', how='inner').filter(F.col('status').isin('paid', 'completed')).withColumn('line_revenue', F.col('quantity') * F.col('unit_price')).select('order_id', 'channel', 'quantity', 'line_revenue').orderBy(F.col('order_id').asc(), F.col('quantity').desc())`,
    pysparkRequirements: [
      { label: "join", anyOf: [".join("] },
      { label: "status filter", anyOf: [".isin(", "paid", "completed"] },
      { label: "derived revenue", anyOf: [".withColumn(", "line_revenue"] },
      { label: "projection", anyOf: [".select("] },
    ],
  },
  {
    levelNumber: 57,
    category: "joins",
    title: "Level 57: Customer tier snapshot",
    theme: "intermediate joins",
    businessContext: "a profile enrichment step",
    question: "Join customers to profiles and return every profile row as `customer_name`, `tier`, and `updated_at`.",
    tables: [customersTable, profilesTable],
    expectedOutput: [
      "Keep all profile rows with a matching customer.",
      "Return columns: customer_name, tier, updated_at.",
      "Sort by customer_name then updated_at.",
    ],
    successChecklist: [
      "Join profiles to customers on customer_id.",
      "Keep historical profile rows.",
      "Sort the output deterministically.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const customers = mapBy(input.customers, "customer_id");
      return sortRows(
        input.profiles.flatMap((profile) => {
          const customer = customers.get(profile.customer_id ?? null);
          return customer
            ? [{ customer_name: customer.customer_name, tier: profile.tier, updated_at: profile.updated_at }]
            : [];
        }),
        [
          { column: "customer_name", direction: "asc" },
          { column: "updated_at", direction: "asc" },
        ],
      );
    },
    sqlReferenceSolution: `SELECT c.customer_name, p.tier, p.updated_at
FROM profiles p
JOIN customers c ON c.customer_id = p.customer_id
ORDER BY c.customer_name, p.updated_at;`,
    pythonReferenceSolution: `customers_by_id = {row['customer_id']: row for row in data['customers']}
result = []
for profile in data['profiles']:
    customer = customers_by_id.get(profile['customer_id'])
    if customer:
        result.append({
            'customer_name': customer['customer_name'],
            'tier': profile['tier'],
            'updated_at': profile['updated_at'],
        })
result = sorted(result, key=lambda row: (row['customer_name'], row['updated_at']))`,
    pysparkReferenceSolution: `result_df = profiles_df.join(customers_df, on='customer_id', how='inner').select('customer_name', 'tier', 'updated_at').orderBy('customer_name', 'updated_at')`,
    pysparkRequirements: [
      { label: "join", anyOf: [".join("] },
      { label: "profiles source", anyOf: ["profiles_df"] },
      { label: "customers source", anyOf: ["customers_df"] },
      { label: "projection", anyOf: [".select("] },
      { label: "ordering", anyOf: [".orderBy("] },
    ],
  },
  {
    levelNumber: 58,
    category: "joins",
    title: "Level 58: Delayed shipment watchlist",
    theme: "intermediate joins",
    businessContext: "a delivery escalation board",
    question: "Join delayed shipments to orders and customers and return `order_id`, `customer_name`, `country`, and `delivered_at`.",
    tables: [shipmentsTable, ordersTable, customersTable],
    expectedOutput: [
      "Keep only delayed shipments with matched orders and customers.",
      "Return columns: order_id, customer_name, country, delivered_at.",
      "Sort by delivered_at descending.",
    ],
    successChecklist: [
      "Use delayed shipment rows only.",
      "Join order and customer context.",
      "Keep the delivered timestamp visible.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const orders = mapBy(input.orders, "order_id");
      const customers = mapBy(input.customers, "customer_id");
      return sortRows(
        input.shipments.flatMap((shipment) => {
          const order = orders.get(shipment.order_id ?? null);
          const customer = order ? customers.get(order.customer_id ?? null) : null;
          return shipment.shipment_status === "delayed" && order && customer
            ? [
                {
                  order_id: shipment.order_id,
                  customer_name: customer.customer_name,
                  country: customer.country,
                  delivered_at: shipment.delivered_at,
                },
              ]
            : [];
        }),
        [{ column: "delivered_at", direction: "desc" }],
      );
    },
    sqlReferenceSolution: `SELECT s.order_id, c.customer_name, c.country, s.delivered_at
FROM shipments s
JOIN orders o ON o.order_id = s.order_id
JOIN customers c ON c.customer_id = o.customer_id
WHERE s.shipment_status = 'delayed'
ORDER BY s.delivered_at DESC;`,
    pythonReferenceSolution: `orders_by_id = {row['order_id']: row for row in data['orders']}
customers_by_id = {row['customer_id']: row for row in data['customers']}
result = []
for shipment in data['shipments']:
    order = orders_by_id.get(shipment['order_id'])
    customer = customers_by_id.get(order['customer_id']) if order else None
    if shipment['shipment_status'] == 'delayed' and order and customer:
        result.append({
            'order_id': shipment['order_id'],
            'customer_name': customer['customer_name'],
            'country': customer['country'],
            'delivered_at': shipment['delivered_at'],
        })
result = sorted(result, key=lambda row: row['delivered_at'], reverse=True)`,
    pysparkReferenceSolution: `result_df = shipments_df.join(orders_df, on='order_id', how='inner').join(customers_df, on='customer_id', how='inner').filter(F.col('shipment_status') == 'delayed').select('order_id', 'customer_name', 'country', 'delivered_at').orderBy(F.col('delivered_at').desc())`,
    pysparkRequirements: [
      { label: "join", anyOf: [".join("] },
      { label: "delayed filter", anyOf: ["shipment_status", "delayed"] },
      { label: "projection", anyOf: [".select("] },
      { label: "descending order", anyOf: [".desc()"] },
      { label: "customers source", anyOf: ["customers_df"] },
    ],
  },
];

const leftJoinSeeds: WorldTwoSeed[] = [
  {
    levelNumber: 59,
    category: "left-joins",
    title: "Level 59: Customers with no orders",
    theme: "missing matches",
    businessContext: "a dormant customer review",
    question: "Return customers who have no orders as `customer_id`, `customer_name`, and `country`.",
    tables: [customersTable, ordersTable],
    expectedOutput: [
      "Keep only customers with no matched order rows.",
      "Return columns: customer_id, customer_name, country.",
      "Sort by customer_id ascending.",
    ],
    successChecklist: [
      "Use a left join pattern.",
      "Filter to missing matches only.",
      "Do not return customers who have any order row.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const orderCustomerIds = new Set(input.orders.map((row) => row.customer_id));
      return sortRows(
        input.customers
          .filter((row) => !orderCustomerIds.has(row.customer_id))
          .map((row) => ({
            customer_id: row.customer_id,
            customer_name: row.customer_name,
            country: row.country,
          })),
        [{ column: "customer_id", direction: "asc" }],
      );
    },
    buildHiddenInput: (input) => {
      input.orders.push({
        order_id: 1010,
        customer_id: 5,
        status: "paid",
        amount: 99,
        order_date: "2026-07-09",
        channel: "web",
      });
      return input;
    },
    sqlReferenceSolution: `SELECT c.customer_id, c.customer_name, c.country
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL
ORDER BY c.customer_id;`,
    pythonReferenceSolution: `order_customer_ids = {row['customer_id'] for row in data['orders']}
result = [
    {
        'customer_id': row['customer_id'],
        'customer_name': row['customer_name'],
        'country': row['country'],
    }
    for row in data['customers']
    if row['customer_id'] not in order_customer_ids
]
result = sorted(result, key=lambda row: row['customer_id'])`,
    pysparkReferenceSolution: `result_df = customers_df.join(orders_df, on='customer_id', how='left').filter(F.col('order_id').isNull()).select('customer_id', 'customer_name', 'country').orderBy('customer_id')`,
    pysparkRequirements: [
      { label: "left join", anyOf: ["how='left'", "how=\"left\"", "left"] },
      { label: "missing match filter", anyOf: [".isNull()", "order_id"] },
      { label: "customers source", anyOf: ["customers_df"] },
      { label: "orders source", anyOf: ["orders_df"] },
      { label: "projection", anyOf: [".select("] },
    ],
  },
  {
    levelNumber: 60,
    category: "left-joins",
    title: "Level 60: Orders missing payment",
    theme: "missing matches",
    businessContext: "a payment lag monitor",
    question: "Return orders with no payment row as `order_id`, `customer_id`, and `amount`.",
    tables: [ordersTable, paymentsTable],
    expectedOutput: [
      "Keep only orders with no payment match.",
      "Return columns: order_id, customer_id, amount.",
      "Sort by order_id ascending.",
    ],
    successChecklist: [
      "Use a left join from orders.",
      "Filter to missing payment rows.",
      "Do not drop the order amount.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const paidOrderIds = new Set(input.payments.map((row) => row.order_id));
      return sortRows(
        input.orders
          .filter((row) => !paidOrderIds.has(row.order_id))
          .map((row) => ({
            order_id: row.order_id,
            customer_id: row.customer_id,
            amount: row.amount,
          })),
        [{ column: "order_id", direction: "asc" }],
      );
    },
    buildHiddenInput: (input) => {
      input.payments.push({
        order_id: 1006,
        payment_status: "settled",
        paid_amount: 150,
        payment_method: "card",
        paid_at: "2026-07-08T10:00:00",
      });
      return input;
    },
    sqlReferenceSolution: `SELECT o.order_id, o.customer_id, o.amount
FROM orders o
LEFT JOIN payments p ON p.order_id = o.order_id
WHERE p.order_id IS NULL
ORDER BY o.order_id;`,
    pythonReferenceSolution: `payment_order_ids = {row['order_id'] for row in data['payments']}
result = [
    {
        'order_id': row['order_id'],
        'customer_id': row['customer_id'],
        'amount': row['amount'],
    }
    for row in data['orders']
    if row['order_id'] not in payment_order_ids
]
result = sorted(result, key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `result_df = orders_df.join(payments_df, on='order_id', how='left').filter(F.col('payment_status').isNull()).select('order_id', 'customer_id', 'amount').orderBy('order_id')`,
    pysparkRequirements: [
      { label: "left join", anyOf: ["how='left'", "how=\"left\"", "left"] },
      { label: "missing payment filter", anyOf: [".isNull()", "payment_status"] },
      { label: "orders source", anyOf: ["orders_df"] },
      { label: "payments source", anyOf: ["payments_df"] },
      { label: "projection", anyOf: [".select("] },
    ],
  },
  {
    levelNumber: 61,
    category: "left-joins",
    title: "Level 61: Orders missing shipment",
    theme: "missing matches",
    businessContext: "a warehouse handoff tracker",
    question: "Return orders with no shipment row as `order_id`, `status`, and `order_date`.",
    tables: [ordersTable, shipmentsTable],
    expectedOutput: [
      "Keep only orders without a shipment row.",
      "Return columns: order_id, status, order_date.",
      "Sort by order_id ascending.",
    ],
    successChecklist: [
      "Use a left join from orders to shipments.",
      "Filter to missing shipment matches.",
      "Keep the original order status visible.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const shippedOrderIds = new Set(input.shipments.map((row) => row.order_id));
      return sortRows(
        input.orders
          .filter((row) => !shippedOrderIds.has(row.order_id))
          .map((row) => ({
            order_id: row.order_id,
            status: row.status,
            order_date: row.order_date,
          })),
        [{ column: "order_id", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT o.order_id, o.status, o.order_date
FROM orders o
LEFT JOIN shipments s ON s.order_id = o.order_id
WHERE s.order_id IS NULL
ORDER BY o.order_id;`,
    pythonReferenceSolution: `shipment_order_ids = {row['order_id'] for row in data['shipments']}
result = [
    {
        'order_id': row['order_id'],
        'status': row['status'],
        'order_date': row['order_date'],
    }
    for row in data['orders']
    if row['order_id'] not in shipment_order_ids
]
result = sorted(result, key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `result_df = orders_df.join(shipments_df, on='order_id', how='left').filter(F.col('shipment_status').isNull()).select('order_id', 'status', 'order_date').orderBy('order_id')`,
    pysparkRequirements: [
      { label: "left join", anyOf: ["how='left'", "how=\"left\"", "left"] },
      { label: "missing shipment filter", anyOf: [".isNull()", "shipment_status"] },
      { label: "orders source", anyOf: ["orders_df"] },
      { label: "shipments source", anyOf: ["shipments_df"] },
      { label: "projection", anyOf: [".select("] },
    ],
  },
  {
    levelNumber: 62,
    category: "left-joins",
    title: "Level 62: Unmapped SKUs",
    theme: "missing matches",
    businessContext: "a catalog exception queue",
    question: "Return order item rows with no product map match as `order_id`, `raw_sku`, and `quantity`.",
    tables: [orderItemsTable, productMapTable],
    expectedOutput: [
      "Keep only unmapped raw_sku rows.",
      "Return columns: order_id, raw_sku, quantity.",
      "Sort by order_id ascending.",
    ],
    successChecklist: [
      "Use a left join from order items.",
      "Filter to missing map matches only.",
      "Keep the raw sku visible.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const mappedSkus = new Set(input.product_map.map((row) => row.raw_sku));
      return sortRows(
        input.order_items
          .filter((row) => !mappedSkus.has(row.raw_sku))
          .map((row) => ({
            order_id: row.order_id,
            raw_sku: row.raw_sku,
            quantity: row.quantity,
          })),
        [{ column: "order_id", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT i.order_id, i.raw_sku, i.quantity
FROM order_items i
LEFT JOIN product_map m ON m.raw_sku = i.raw_sku
WHERE m.raw_sku IS NULL
ORDER BY i.order_id;`,
    pythonReferenceSolution: `mapped_skus = {row['raw_sku'] for row in data['product_map']}
result = [
    {
        'order_id': row['order_id'],
        'raw_sku': row['raw_sku'],
        'quantity': row['quantity'],
    }
    for row in data['order_items']
    if row['raw_sku'] not in mapped_skus
]
result = sorted(result, key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `result_df = order_items_df.join(product_map_df, on='raw_sku', how='left').filter(F.col('canonical_sku').isNull()).select('order_id', 'raw_sku', 'quantity').orderBy('order_id')`,
    pysparkRequirements: [
      { label: "left join", anyOf: ["how='left'", "how=\"left\"", "left"] },
      { label: "missing map filter", anyOf: [".isNull()", "canonical_sku"] },
      { label: "order items source", anyOf: ["order_items_df"] },
      { label: "product map source", anyOf: ["product_map_df"] },
      { label: "projection", anyOf: [".select("] },
    ],
  },
  {
    levelNumber: 63,
    category: "left-joins",
    title: "Level 63: Orphan tickets",
    theme: "missing matches",
    businessContext: "a customer master cleanup",
    question: "Return ticket rows with no customer match as `ticket_id`, `customer_id`, and `severity`.",
    tables: [ticketsTable, customersTable],
    expectedOutput: [
      "Keep only tickets whose customer_id is missing from customers.",
      "Return columns: ticket_id, customer_id, severity.",
      "Sort by ticket_id ascending.",
    ],
    successChecklist: [
      "Use a left join from tickets to customers.",
      "Filter to unmatched customer rows only.",
      "Keep the raw customer_id for triage.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const customerIds = new Set(input.customers.map((row) => row.customer_id));
      return sortRows(
        input.support_tickets
          .filter((row) => !customerIds.has(row.customer_id))
          .map((row) => ({
            ticket_id: row.ticket_id,
            customer_id: row.customer_id,
            severity: row.severity,
          })),
        [{ column: "ticket_id", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT t.ticket_id, t.customer_id, t.severity
FROM support_tickets t
LEFT JOIN customers c ON c.customer_id = t.customer_id
WHERE c.customer_id IS NULL
ORDER BY t.ticket_id;`,
    pythonReferenceSolution: `customer_ids = {row['customer_id'] for row in data['customers']}
result = [
    {
        'ticket_id': row['ticket_id'],
        'customer_id': row['customer_id'],
        'severity': row['severity'],
    }
    for row in data['support_tickets']
    if row['customer_id'] not in customer_ids
]
result = sorted(result, key=lambda row: row['ticket_id'])`,
    pysparkReferenceSolution: `result_df = support_tickets_df.join(customers_df, on='customer_id', how='left').filter(F.col('customer_name').isNull()).select('ticket_id', 'customer_id', 'severity').orderBy('ticket_id')`,
    pysparkRequirements: [
      { label: "left join", anyOf: ["how='left'", "how=\"left\"", "left"] },
      { label: "missing customer filter", anyOf: [".isNull()", "customer_name"] },
      { label: "tickets source", anyOf: ["support_tickets_df"] },
      { label: "customers source", anyOf: ["customers_df"] },
      { label: "projection", anyOf: [".select("] },
    ],
  },
  {
    levelNumber: 64,
    category: "left-joins",
    title: "Level 64: Missing seller payouts",
    theme: "missing matches",
    businessContext: "a marketplace payout follow-up list",
    question: "Return paid orders with no seller payout row as `order_id`, `customer_id`, and `amount`.",
    tables: [ordersTable, payoutsTable],
    expectedOutput: [
      "Keep only paid orders without a payout row.",
      "Return columns: order_id, customer_id, amount.",
      "Sort by order_id ascending.",
    ],
    successChecklist: [
      "Filter to paid orders first.",
      "Use a left join to payouts.",
      "Keep only missing payout matches.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const payoutIds = new Set(input.seller_payouts.map((row) => row.order_id));
      return sortRows(
        input.orders
          .filter((row) => row.status === "paid" && !payoutIds.has(row.order_id))
          .map((row) => ({
            order_id: row.order_id,
            customer_id: row.customer_id,
            amount: row.amount,
          })),
        [{ column: "order_id", direction: "asc" }],
      );
    },
    buildHiddenInput: (input) => {
      input.seller_payouts.push({ order_id: 1006, payout_amount: 140, payout_status: "sent" });
      return input;
    },
    sqlReferenceSolution: `SELECT o.order_id, o.customer_id, o.amount
FROM orders o
LEFT JOIN seller_payouts p ON p.order_id = o.order_id
WHERE o.status = 'paid'
  AND p.order_id IS NULL
ORDER BY o.order_id;`,
    pythonReferenceSolution: `payout_ids = {row['order_id'] for row in data['seller_payouts']}
result = [
    {
        'order_id': row['order_id'],
        'customer_id': row['customer_id'],
        'amount': row['amount'],
    }
    for row in data['orders']
    if row['status'] == 'paid' and row['order_id'] not in payout_ids
]
result = sorted(result, key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `result_df = orders_df.join(seller_payouts_df, on='order_id', how='left').filter((F.col('status') == 'paid') & F.col('payout_amount').isNull()).select('order_id', 'customer_id', 'amount').orderBy('order_id')`,
    pysparkRequirements: [
      { label: "left join", anyOf: ["how='left'", "how=\"left\"", "left"] },
      { label: "paid filter", anyOf: ["status", "paid"] },
      { label: "missing payout filter", anyOf: [".isNull()", "payout_amount"] },
      { label: "payout source", anyOf: ["seller_payouts_df"] },
      { label: "projection", anyOf: [".select("] },
    ],
  },
];

const metricSeeds: WorldTwoSeed[] = [
  {
    levelNumber: 65,
    category: "group-metrics",
    title: "Level 65: Paid revenue by country",
    theme: "group metrics",
    businessContext: "a finance scorecard",
    question: "Group paid orders by country and return `country`, `paid_orders`, and `total_revenue`.",
    tables: [ordersTable, customersTable],
    expectedOutput: [
      "Count only paid orders.",
      "Return one row per country with paid_orders and total_revenue.",
      "Sort by total_revenue descending then country.",
    ],
    successChecklist: [
      "Join order and customer country.",
      "Filter to paid orders only.",
      "Name the aggregate columns clearly.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const customers = mapBy(input.customers, "customer_id");
      const metrics = new Map<string, { paid_orders: number; total_revenue: number }>();
      for (const order of input.orders) {
        if (order.status !== "paid") continue;
        const customer = customers.get(order.customer_id ?? null);
        if (!customer) continue;
        const bucket = metrics.get(String(customer.country)) ?? { paid_orders: 0, total_revenue: 0 };
        bucket.paid_orders += 1;
        bucket.total_revenue += toNumber(order.amount);
        metrics.set(String(customer.country), bucket);
      }
      return sortRows(
        [...metrics.entries()].map(([country, value]) => ({
          country,
          paid_orders: value.paid_orders,
          total_revenue: value.total_revenue,
        })),
        [
          { column: "total_revenue", direction: "desc" },
          { column: "country", direction: "asc" },
        ],
      );
    },
    sqlReferenceSolution: `SELECT c.country, COUNT(*) AS paid_orders, SUM(o.amount) AS total_revenue
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
WHERE o.status = 'paid'
GROUP BY c.country
ORDER BY total_revenue DESC, c.country;`,
    pythonReferenceSolution: `customers_by_id = {row['customer_id']: row for row in data['customers']}
metrics = {}
for row in data['orders']:
    if row['status'] != 'paid':
        continue
    customer = customers_by_id.get(row['customer_id'])
    if not customer:
        continue
    country = customer['country']
    bucket = metrics.setdefault(country, {'paid_orders': 0, 'total_revenue': 0})
    bucket['paid_orders'] += 1
    bucket['total_revenue'] += row['amount']
result = [
    {'country': country, 'paid_orders': values['paid_orders'], 'total_revenue': values['total_revenue']}
    for country, values in metrics.items()
]
result = sorted(result, key=lambda row: (-row['total_revenue'], row['country']))`,
    pysparkReferenceSolution: `result_df = orders_df.join(customers_df, on='customer_id', how='inner').filter(F.col('status') == 'paid').groupBy('country').agg(F.count('*').alias('paid_orders'), F.sum('amount').alias('total_revenue')).orderBy(F.col('total_revenue').desc(), F.col('country').asc())`,
    pysparkRequirements: [
      { label: "join", anyOf: [".join("] },
      { label: "paid filter", anyOf: ["status", "paid"] },
      { label: "grouping", anyOf: [".groupBy("] },
      { label: "aggregation", anyOf: [".agg("] },
      { label: "count metric", anyOf: ["paid_orders"] },
      { label: "sum metric", anyOf: ["total_revenue"] },
    ],
  },
  {
    levelNumber: 66,
    category: "group-metrics",
    title: "Level 66: Completed order count by channel",
    theme: "group metrics",
    businessContext: "a channel operations review",
    question: "Group completed or paid orders by channel and return `channel` and `kept_orders`.",
    tables: [ordersTable],
    expectedOutput: [
      "Keep only paid or completed orders.",
      "Return one row per channel with kept_orders.",
      "Sort by kept_orders descending then channel.",
    ],
    successChecklist: [
      "Filter out cancelled orders.",
      "Aggregate at channel grain.",
      "Sort by the kept_orders metric.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const metrics = new Map<string, number>();
      for (const row of input.orders) {
        if (row.status !== "paid" && row.status !== "completed") continue;
        metrics.set(String(row.channel), (metrics.get(String(row.channel)) ?? 0) + 1);
      }
      return sortRows(
        [...metrics.entries()].map(([channel, kept_orders]) => ({ channel, kept_orders })),
        [
          { column: "kept_orders", direction: "desc" },
          { column: "channel", direction: "asc" },
        ],
      );
    },
    sqlReferenceSolution: `SELECT channel, COUNT(*) AS kept_orders
FROM orders
WHERE status IN ('paid', 'completed')
GROUP BY channel
ORDER BY kept_orders DESC, channel;`,
    pythonReferenceSolution: `metrics = {}
for row in data['orders']:
    if row['status'] in ('paid', 'completed'):
        metrics[row['channel']] = metrics.get(row['channel'], 0) + 1
result = [{'channel': channel, 'kept_orders': count} for channel, count in metrics.items()]
result = sorted(result, key=lambda row: (-row['kept_orders'], row['channel']))`,
    pysparkReferenceSolution: `result_df = orders_df.filter(F.col('status').isin('paid', 'completed')).groupBy('channel').agg(F.count('*').alias('kept_orders')).orderBy(F.col('kept_orders').desc(), F.col('channel').asc())`,
    pysparkRequirements: [
      { label: "status filter", anyOf: [".isin(", "paid", "completed"] },
      { label: "grouping", anyOf: [".groupBy("] },
      { label: "aggregation", anyOf: [".agg("] },
      { label: "kept_orders alias", anyOf: ["kept_orders"] },
    ],
  },
  {
    levelNumber: 67,
    category: "group-metrics",
    title: "Level 67: Open tickets by country",
    theme: "group metrics",
    businessContext: "a support staffing board",
    question: "Group open tickets by country and return `country` and `open_tickets`.",
    tables: [ticketsTable, customersTable],
    expectedOutput: [
      "Count only open tickets with a matching customer.",
      "Return one row per country with open_tickets.",
      "Sort by open_tickets descending then country.",
    ],
    successChecklist: [
      "Join ticket geography from customers.",
      "Keep only open tickets.",
      "Group at country level.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const customers = mapBy(input.customers, "customer_id");
      const metrics = new Map<string, number>();
      for (const row of input.support_tickets) {
        if (row.ticket_status !== "open") continue;
        const customer = customers.get(row.customer_id ?? null);
        if (!customer) continue;
        metrics.set(String(customer.country), (metrics.get(String(customer.country)) ?? 0) + 1);
      }
      return sortRows(
        [...metrics.entries()].map(([country, open_tickets]) => ({ country, open_tickets })),
        [
          { column: "open_tickets", direction: "desc" },
          { column: "country", direction: "asc" },
        ],
      );
    },
    sqlReferenceSolution: `SELECT c.country, COUNT(*) AS open_tickets
FROM support_tickets t
JOIN customers c ON c.customer_id = t.customer_id
WHERE t.ticket_status = 'open'
GROUP BY c.country
ORDER BY open_tickets DESC, c.country;`,
    pythonReferenceSolution: `customers_by_id = {row['customer_id']: row for row in data['customers']}
metrics = {}
for row in data['support_tickets']:
    if row['ticket_status'] != 'open':
        continue
    customer = customers_by_id.get(row['customer_id'])
    if customer:
        country = customer['country']
        metrics[country] = metrics.get(country, 0) + 1
result = [{'country': country, 'open_tickets': count} for country, count in metrics.items()]
result = sorted(result, key=lambda row: (-row['open_tickets'], row['country']))`,
    pysparkReferenceSolution: `result_df = support_tickets_df.join(customers_df, on='customer_id', how='inner').filter(F.col('ticket_status') == 'open').groupBy('country').agg(F.count('*').alias('open_tickets')).orderBy(F.col('open_tickets').desc(), F.col('country').asc())`,
    pysparkRequirements: [
      { label: "join", anyOf: [".join("] },
      { label: "open filter", anyOf: ["ticket_status", "open"] },
      { label: "grouping", anyOf: [".groupBy("] },
      { label: "aggregation", anyOf: [".agg("] },
      { label: "metric alias", anyOf: ["open_tickets"] },
    ],
  },
  {
    levelNumber: 68,
    category: "group-metrics",
    title: "Level 68: Quantity by category",
    theme: "group metrics",
    businessContext: "a merch planning report",
    question: "Group mapped order items by category and return `category` and `total_quantity`.",
    tables: [orderItemsTable, productMapTable],
    expectedOutput: [
      "Use only mapped item rows.",
      "Return one row per category with total_quantity.",
      "Sort by total_quantity descending then category.",
    ],
    successChecklist: [
      "Join to the product map first.",
      "Sum quantity by category.",
      "Exclude unmapped raw_sku rows.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const mapping = mapBy(input.product_map, "raw_sku");
      const metrics = new Map<string, number>();
      for (const item of input.order_items) {
        const mapped = mapping.get(item.raw_sku ?? null);
        if (!mapped) continue;
        metrics.set(String(mapped.category), (metrics.get(String(mapped.category)) ?? 0) + toNumber(item.quantity));
      }
      return sortRows(
        [...metrics.entries()].map(([category, total_quantity]) => ({ category, total_quantity })),
        [
          { column: "total_quantity", direction: "desc" },
          { column: "category", direction: "asc" },
        ],
      );
    },
    sqlReferenceSolution: `SELECT m.category, SUM(i.quantity) AS total_quantity
FROM order_items i
JOIN product_map m ON m.raw_sku = i.raw_sku
GROUP BY m.category
ORDER BY total_quantity DESC, m.category;`,
    pythonReferenceSolution: `mapping = {row['raw_sku']: row for row in data['product_map']}
metrics = {}
for item in data['order_items']:
    mapped = mapping.get(item['raw_sku'])
    if mapped:
        category = mapped['category']
        metrics[category] = metrics.get(category, 0) + item['quantity']
result = [{'category': category, 'total_quantity': quantity} for category, quantity in metrics.items()]
result = sorted(result, key=lambda row: (-row['total_quantity'], row['category']))`,
    pysparkReferenceSolution: `result_df = order_items_df.join(product_map_df, on='raw_sku', how='inner').groupBy('category').agg(F.sum('quantity').alias('total_quantity')).orderBy(F.col('total_quantity').desc(), F.col('category').asc())`,
    pysparkRequirements: [
      { label: "join", anyOf: [".join("] },
      { label: "grouping", anyOf: [".groupBy("] },
      { label: "sum", anyOf: ["F.sum(", ".sum("] },
      { label: "metric alias", anyOf: ["total_quantity"] },
    ],
  },
  {
    levelNumber: 69,
    category: "group-metrics",
    title: "Level 69: Delivered shipments by carrier",
    theme: "group metrics",
    businessContext: "a logistics scorecard",
    question: "Group delivered shipments by carrier and return `carrier` and `delivered_shipments`.",
    tables: [shipmentsTable],
    expectedOutput: [
      "Count only delivered shipments.",
      "Return one row per carrier with delivered_shipments.",
      "Sort by carrier ascending.",
    ],
    successChecklist: [
      "Filter to delivered shipment_status.",
      "Aggregate at carrier level.",
      "Use a clear delivered_shipments alias.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const metrics = new Map<string, number>();
      for (const row of input.shipments) {
        if (row.shipment_status !== "delivered") continue;
        metrics.set(String(row.carrier), (metrics.get(String(row.carrier)) ?? 0) + 1);
      }
      return sortRows(
        [...metrics.entries()].map(([carrier, delivered_shipments]) => ({ carrier, delivered_shipments })),
        [{ column: "carrier", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT carrier, COUNT(*) AS delivered_shipments
FROM shipments
WHERE shipment_status = 'delivered'
GROUP BY carrier
ORDER BY carrier;`,
    pythonReferenceSolution: `metrics = {}
for row in data['shipments']:
    if row['shipment_status'] == 'delivered':
        metrics[row['carrier']] = metrics.get(row['carrier'], 0) + 1
result = [{'carrier': carrier, 'delivered_shipments': count} for carrier, count in metrics.items()]
result = sorted(result, key=lambda row: row['carrier'])`,
    pysparkReferenceSolution: `result_df = shipments_df.filter(F.col('shipment_status') == 'delivered').groupBy('carrier').agg(F.count('*').alias('delivered_shipments')).orderBy('carrier')`,
    pysparkRequirements: [
      { label: "delivered filter", anyOf: ["shipment_status", "delivered"] },
      { label: "grouping", anyOf: [".groupBy("] },
      { label: "aggregation", anyOf: [".agg("] },
      { label: "metric alias", anyOf: ["delivered_shipments"] },
    ],
  },
  {
    levelNumber: 70,
    category: "group-metrics",
    title: "Level 70: Average paid amount by segment",
    theme: "group metrics",
    businessContext: "an account management review",
    question: "Group paid orders by segment and return `segment` and `avg_paid_amount`.",
    tables: [ordersTable, customersTable],
    expectedOutput: [
      "Count only paid orders with a matching customer.",
      "Return one row per segment with avg_paid_amount.",
      "Sort by avg_paid_amount descending then segment.",
    ],
    successChecklist: [
      "Join orders to customer segment.",
      "Average only paid order amounts.",
      "Keep the segment grain correct.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const customers = mapBy(input.customers, "customer_id");
      const sums = new Map<string, { total: number; count: number }>();
      for (const row of input.orders) {
        if (row.status !== "paid") continue;
        const customer = customers.get(row.customer_id ?? null);
        if (!customer) continue;
        const bucket = sums.get(String(customer.segment)) ?? { total: 0, count: 0 };
        bucket.total += toNumber(row.amount);
        bucket.count += 1;
        sums.set(String(customer.segment), bucket);
      }
      return sortRows(
        [...sums.entries()].map(([segment, value]) => ({
          segment,
          avg_paid_amount: value.total / value.count,
        })),
        [
          { column: "avg_paid_amount", direction: "desc" },
          { column: "segment", direction: "asc" },
        ],
      );
    },
    sqlReferenceSolution: `SELECT c.segment, AVG(o.amount) AS avg_paid_amount
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
WHERE o.status = 'paid'
GROUP BY c.segment
ORDER BY avg_paid_amount DESC, c.segment;`,
    pythonReferenceSolution: `customers_by_id = {row['customer_id']: row for row in data['customers']}
metrics = {}
for row in data['orders']:
    if row['status'] != 'paid':
        continue
    customer = customers_by_id.get(row['customer_id'])
    if not customer:
        continue
    bucket = metrics.setdefault(customer['segment'], {'total': 0, 'count': 0})
    bucket['total'] += row['amount']
    bucket['count'] += 1
result = [
    {'segment': segment, 'avg_paid_amount': values['total'] / values['count']}
    for segment, values in metrics.items()
]
result = sorted(result, key=lambda row: (-row['avg_paid_amount'], row['segment']))`,
    pysparkReferenceSolution: `result_df = orders_df.join(customers_df, on='customer_id', how='inner').filter(F.col('status') == 'paid').groupBy('segment').agg(F.avg('amount').alias('avg_paid_amount')).orderBy(F.col('avg_paid_amount').desc(), F.col('segment').asc())`,
    pysparkRequirements: [
      { label: "join", anyOf: [".join("] },
      { label: "paid filter", anyOf: ["status", "paid"] },
      { label: "grouping", anyOf: [".groupBy("] },
      { label: "avg metric", anyOf: ["F.avg(", "avg_paid_amount"] },
    ],
  },
  {
    levelNumber: 71,
    category: "group-metrics",
    title: "Level 71: Buyers by country",
    theme: "group metrics",
    businessContext: "a regional buyer count view",
    question: "Group paid orders by country and return `country` and `unique_buyers`.",
    tables: [ordersTable, customersTable],
    expectedOutput: [
      "Count distinct customers with paid orders.",
      "Return one row per country with unique_buyers.",
      "Sort by unique_buyers descending then country.",
    ],
    successChecklist: [
      "Join country from customers.",
      "Use distinct customer_id per country.",
      "Count only paid orders.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const customers = mapBy(input.customers, "customer_id");
      const buyerSets = new Map<string, Set<ArcadePrimitive>>();
      for (const order of input.orders) {
        if (order.status !== "paid") continue;
        const customer = customers.get(order.customer_id ?? null);
        if (!customer) continue;
        const set = buyerSets.get(String(customer.country)) ?? new Set<ArcadePrimitive>();
        set.add(order.customer_id);
        buyerSets.set(String(customer.country), set);
      }
      return sortRows(
        [...buyerSets.entries()].map(([country, buyers]) => ({ country, unique_buyers: buyers.size })),
        [
          { column: "unique_buyers", direction: "desc" },
          { column: "country", direction: "asc" },
        ],
      );
    },
    sqlReferenceSolution: `SELECT c.country, COUNT(DISTINCT o.customer_id) AS unique_buyers
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
WHERE o.status = 'paid'
GROUP BY c.country
ORDER BY unique_buyers DESC, c.country;`,
    pythonReferenceSolution: `customers_by_id = {row['customer_id']: row for row in data['customers']}
buyers = {}
for row in data['orders']:
    if row['status'] != 'paid':
        continue
    customer = customers_by_id.get(row['customer_id'])
    if customer:
        buyers.setdefault(customer['country'], set()).add(row['customer_id'])
result = [{'country': country, 'unique_buyers': len(customer_ids)} for country, customer_ids in buyers.items()]
result = sorted(result, key=lambda row: (-row['unique_buyers'], row['country']))`,
    pysparkReferenceSolution: `result_df = orders_df.join(customers_df, on='customer_id', how='inner').filter(F.col('status') == 'paid').groupBy('country').agg(F.countDistinct('customer_id').alias('unique_buyers')).orderBy(F.col('unique_buyers').desc(), F.col('country').asc())`,
    pysparkRequirements: [
      { label: "join", anyOf: [".join("] },
      { label: "paid filter", anyOf: ["status", "paid"] },
      { label: "grouping", anyOf: [".groupBy("] },
      { label: "distinct count", anyOf: ["countDistinct", "unique_buyers"] },
    ],
  },
  {
    levelNumber: 72,
    category: "group-metrics",
    title: "Level 72: Payment count by method",
    theme: "group metrics",
    businessContext: "a payment method usage panel",
    question: "Group settled payments by payment_method and return `payment_method` and `settled_payments`.",
    tables: [paymentsTable],
    expectedOutput: [
      "Count only settled payment rows.",
      "Return one row per payment_method with settled_payments.",
      "Sort by payment_method ascending.",
    ],
    successChecklist: [
      "Filter to settled rows only.",
      "Group at payment_method grain.",
      "Use a clear metric alias.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const metrics = new Map<string, number>();
      for (const row of input.payments) {
        if (row.payment_status !== "settled") continue;
        metrics.set(String(row.payment_method), (metrics.get(String(row.payment_method)) ?? 0) + 1);
      }
      return sortRows(
        [...metrics.entries()].map(([payment_method, settled_payments]) => ({ payment_method, settled_payments })),
        [{ column: "payment_method", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT payment_method, COUNT(*) AS settled_payments
FROM payments
WHERE payment_status = 'settled'
GROUP BY payment_method
ORDER BY payment_method;`,
    pythonReferenceSolution: `metrics = {}
for row in data['payments']:
    if row['payment_status'] == 'settled':
        metrics[row['payment_method']] = metrics.get(row['payment_method'], 0) + 1
result = [{'payment_method': method, 'settled_payments': count} for method, count in metrics.items()]
result = sorted(result, key=lambda row: row['payment_method'])`,
    pysparkReferenceSolution: `result_df = payments_df.filter(F.col('payment_status') == 'settled').groupBy('payment_method').agg(F.count('*').alias('settled_payments')).orderBy('payment_method')`,
    pysparkRequirements: [
      { label: "settled filter", anyOf: ["payment_status", "settled"] },
      { label: "grouping", anyOf: [".groupBy("] },
      { label: "aggregation", anyOf: [".agg("] },
      { label: "metric alias", anyOf: ["settled_payments"] },
    ],
  },
];

const conditionalSeeds: WorldTwoSeed[] = [
  {
    levelNumber: 73,
    category: "conditional-aggregation",
    title: "Level 73: Payment status counts by country",
    theme: "conditional aggregation",
    businessContext: "a payment operations dashboard",
    question: "Return one row per country with `settled_count` and `failed_count` from payment rows.",
    tables: [paymentsTable, ordersTable, customersTable],
    expectedOutput: [
      "Join payments to country through orders and customers.",
      "Count settled and failed payment rows separately.",
      "Sort by country ascending.",
    ],
    successChecklist: [
      "Use conditional aggregation.",
      "Keep settled and failed counts in separate columns.",
      "Aggregate at country grain.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const orders = mapBy(input.orders, "order_id");
      const customers = mapBy(input.customers, "customer_id");
      const metrics = new Map<string, { settled_count: number; failed_count: number }>();
      for (const payment of input.payments) {
        const order = orders.get(payment.order_id ?? null);
        const customer = order ? customers.get(order.customer_id ?? null) : null;
        if (!customer) continue;
        const bucket = metrics.get(String(customer.country)) ?? { settled_count: 0, failed_count: 0 };
        if (payment.payment_status === "settled") bucket.settled_count += 1;
        if (payment.payment_status === "failed") bucket.failed_count += 1;
        metrics.set(String(customer.country), bucket);
      }
      return sortRows(
        [...metrics.entries()].map(([country, value]) => ({
          country,
          settled_count: value.settled_count,
          failed_count: value.failed_count,
        })),
        [{ column: "country", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT c.country,
       SUM(CASE WHEN p.payment_status = 'settled' THEN 1 ELSE 0 END) AS settled_count,
       SUM(CASE WHEN p.payment_status = 'failed' THEN 1 ELSE 0 END) AS failed_count
FROM payments p
JOIN orders o ON o.order_id = p.order_id
JOIN customers c ON c.customer_id = o.customer_id
GROUP BY c.country
ORDER BY c.country;`,
    pythonReferenceSolution: `orders_by_id = {row['order_id']: row for row in data['orders']}
customers_by_id = {row['customer_id']: row for row in data['customers']}
metrics = {}
for payment in data['payments']:
    order = orders_by_id.get(payment['order_id'])
    customer = customers_by_id.get(order['customer_id']) if order else None
    if not customer:
        continue
    bucket = metrics.setdefault(customer['country'], {'settled_count': 0, 'failed_count': 0})
    if payment['payment_status'] == 'settled':
        bucket['settled_count'] += 1
    if payment['payment_status'] == 'failed':
        bucket['failed_count'] += 1
result = [{'country': country, 'settled_count': values['settled_count'], 'failed_count': values['failed_count']} for country, values in metrics.items()]
result = sorted(result, key=lambda row: row['country'])`,
    pysparkReferenceSolution: `result_df = payments_df.join(orders_df, on='order_id', how='inner').join(customers_df, on='customer_id', how='inner').groupBy('country').agg(F.sum(F.when(F.col('payment_status') == 'settled', 1).otherwise(0)).alias('settled_count'), F.sum(F.when(F.col('payment_status') == 'failed', 1).otherwise(0)).alias('failed_count')).orderBy('country')`,
    pysparkRequirements: [
      { label: "joins", anyOf: [".join("] },
      { label: "grouping", anyOf: [".groupBy("] },
      { label: "conditional logic", anyOf: ["F.when(", ".otherwise("] },
      { label: "settled metric", anyOf: ["settled_count"] },
      { label: "failed metric", anyOf: ["failed_count"] },
    ],
  },
  {
    levelNumber: 74,
    category: "conditional-aggregation",
    title: "Level 74: Segment value bands",
    theme: "conditional aggregation",
    businessContext: "a segment value review",
    question: "Return one row per segment with `high_value_orders` for amount >= 100 and `standard_orders` for amount < 100 from paid or completed orders.",
    tables: [ordersTable, customersTable],
    expectedOutput: [
      "Use only paid or completed orders.",
      "Split counts into high_value_orders and standard_orders.",
      "Sort by segment ascending.",
    ],
    successChecklist: [
      "Join orders to segment.",
      "Use conditional aggregation by amount band.",
      "Count only paid or completed orders.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const customers = mapBy(input.customers, "customer_id");
      const metrics = new Map<string, { high_value_orders: number; standard_orders: number }>();
      for (const row of input.orders) {
        if (row.status !== "paid" && row.status !== "completed") continue;
        const customer = customers.get(row.customer_id ?? null);
        if (!customer) continue;
        const bucket = metrics.get(String(customer.segment)) ?? { high_value_orders: 0, standard_orders: 0 };
        if (toNumber(row.amount) >= 100) bucket.high_value_orders += 1;
        if (toNumber(row.amount) < 100) bucket.standard_orders += 1;
        metrics.set(String(customer.segment), bucket);
      }
      return sortRows(
        [...metrics.entries()].map(([segment, value]) => ({
          segment,
          high_value_orders: value.high_value_orders,
          standard_orders: value.standard_orders,
        })),
        [{ column: "segment", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT c.segment,
       SUM(CASE WHEN o.amount >= 100 THEN 1 ELSE 0 END) AS high_value_orders,
       SUM(CASE WHEN o.amount < 100 THEN 1 ELSE 0 END) AS standard_orders
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
WHERE o.status IN ('paid', 'completed')
GROUP BY c.segment
ORDER BY c.segment;`,
    pythonReferenceSolution: `customers_by_id = {row['customer_id']: row for row in data['customers']}
metrics = {}
for row in data['orders']:
    if row['status'] not in ('paid', 'completed'):
        continue
    customer = customers_by_id.get(row['customer_id'])
    if not customer:
        continue
    bucket = metrics.setdefault(customer['segment'], {'high_value_orders': 0, 'standard_orders': 0})
    if row['amount'] >= 100:
        bucket['high_value_orders'] += 1
    else:
        bucket['standard_orders'] += 1
result = [{'segment': segment, 'high_value_orders': values['high_value_orders'], 'standard_orders': values['standard_orders']} for segment, values in metrics.items()]
result = sorted(result, key=lambda row: row['segment'])`,
    pysparkReferenceSolution: `result_df = orders_df.join(customers_df, on='customer_id', how='inner').filter(F.col('status').isin('paid', 'completed')).groupBy('segment').agg(F.sum(F.when(F.col('amount') >= 100, 1).otherwise(0)).alias('high_value_orders'), F.sum(F.when(F.col('amount') < 100, 1).otherwise(0)).alias('standard_orders')).orderBy('segment')`,
    pysparkRequirements: [
      { label: "join", anyOf: [".join("] },
      { label: "status filter", anyOf: [".isin(", "paid", "completed"] },
      { label: "conditional logic", anyOf: ["F.when(", ".otherwise("] },
      { label: "high value metric", anyOf: ["high_value_orders"] },
      { label: "standard metric", anyOf: ["standard_orders"] },
    ],
  },
  {
    levelNumber: 75,
    category: "conditional-aggregation",
    title: "Level 75: Carrier delivery states",
    theme: "conditional aggregation",
    businessContext: "a carrier performance report",
    question: "Return one row per carrier with `delivered_count` and `delayed_count`.",
    tables: [shipmentsTable],
    expectedOutput: [
      "Split shipment counts by delivered and delayed states.",
      "Return one row per carrier.",
      "Sort by carrier ascending.",
    ],
    successChecklist: [
      "Group at carrier grain.",
      "Use conditional aggregation on shipment_status.",
      "Keep both metrics in the output.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const metrics = new Map<string, { delivered_count: number; delayed_count: number }>();
      for (const row of input.shipments) {
        const bucket = metrics.get(String(row.carrier)) ?? { delivered_count: 0, delayed_count: 0 };
        if (row.shipment_status === "delivered") bucket.delivered_count += 1;
        if (row.shipment_status === "delayed") bucket.delayed_count += 1;
        metrics.set(String(row.carrier), bucket);
      }
      return sortRows(
        [...metrics.entries()].map(([carrier, value]) => ({
          carrier,
          delivered_count: value.delivered_count,
          delayed_count: value.delayed_count,
        })),
        [{ column: "carrier", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT carrier,
       SUM(CASE WHEN shipment_status = 'delivered' THEN 1 ELSE 0 END) AS delivered_count,
       SUM(CASE WHEN shipment_status = 'delayed' THEN 1 ELSE 0 END) AS delayed_count
FROM shipments
GROUP BY carrier
ORDER BY carrier;`,
    pythonReferenceSolution: `metrics = {}
for row in data['shipments']:
    bucket = metrics.setdefault(row['carrier'], {'delivered_count': 0, 'delayed_count': 0})
    if row['shipment_status'] == 'delivered':
        bucket['delivered_count'] += 1
    if row['shipment_status'] == 'delayed':
        bucket['delayed_count'] += 1
result = [{'carrier': carrier, 'delivered_count': values['delivered_count'], 'delayed_count': values['delayed_count']} for carrier, values in metrics.items()]
result = sorted(result, key=lambda row: row['carrier'])`,
    pysparkReferenceSolution: `result_df = shipments_df.groupBy('carrier').agg(F.sum(F.when(F.col('shipment_status') == 'delivered', 1).otherwise(0)).alias('delivered_count'), F.sum(F.when(F.col('shipment_status') == 'delayed', 1).otherwise(0)).alias('delayed_count')).orderBy('carrier')`,
    pysparkRequirements: [
      { label: "grouping", anyOf: [".groupBy("] },
      { label: "conditional logic", anyOf: ["F.when(", ".otherwise("] },
      { label: "delivered metric", anyOf: ["delivered_count"] },
      { label: "delayed metric", anyOf: ["delayed_count"] },
    ],
  },
  {
    levelNumber: 76,
    category: "conditional-aggregation",
    title: "Level 76: Channel revenue and cancellations",
    theme: "conditional aggregation",
    businessContext: "a channel health dashboard",
    question: "Return one row per channel with `paid_revenue` and `cancelled_orders`.",
    tables: [ordersTable],
    expectedOutput: [
      "Sum amount only for paid orders.",
      "Count cancelled orders separately.",
      "Sort by channel ascending.",
    ],
    successChecklist: [
      "Use conditional aggregation, not two separate outputs.",
      "Keep paid_revenue numeric.",
      "Keep cancelled_orders as a count.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const metrics = new Map<string, { paid_revenue: number; cancelled_orders: number }>();
      for (const row of input.orders) {
        const bucket = metrics.get(String(row.channel)) ?? { paid_revenue: 0, cancelled_orders: 0 };
        if (row.status === "paid") bucket.paid_revenue += toNumber(row.amount);
        if (row.status === "cancelled") bucket.cancelled_orders += 1;
        metrics.set(String(row.channel), bucket);
      }
      return sortRows(
        [...metrics.entries()].map(([channel, value]) => ({
          channel,
          paid_revenue: value.paid_revenue,
          cancelled_orders: value.cancelled_orders,
        })),
        [{ column: "channel", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT channel,
       SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS paid_revenue,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders
FROM orders
GROUP BY channel
ORDER BY channel;`,
    pythonReferenceSolution: `metrics = {}
for row in data['orders']:
    bucket = metrics.setdefault(row['channel'], {'paid_revenue': 0, 'cancelled_orders': 0})
    if row['status'] == 'paid':
        bucket['paid_revenue'] += row['amount']
    if row['status'] == 'cancelled':
        bucket['cancelled_orders'] += 1
result = [{'channel': channel, 'paid_revenue': values['paid_revenue'], 'cancelled_orders': values['cancelled_orders']} for channel, values in metrics.items()]
result = sorted(result, key=lambda row: row['channel'])`,
    pysparkReferenceSolution: `result_df = orders_df.groupBy('channel').agg(F.sum(F.when(F.col('status') == 'paid', F.col('amount')).otherwise(F.lit(0))).alias('paid_revenue'), F.sum(F.when(F.col('status') == 'cancelled', 1).otherwise(0)).alias('cancelled_orders')).orderBy('channel')`,
    pysparkRequirements: [
      { label: "grouping", anyOf: [".groupBy("] },
      { label: "conditional logic", anyOf: ["F.when(", ".otherwise("] },
      { label: "paid revenue metric", anyOf: ["paid_revenue"] },
      { label: "cancelled metric", anyOf: ["cancelled_orders"] },
    ],
  },
  {
    levelNumber: 77,
    category: "conditional-aggregation",
    title: "Level 77: Customer shipment coverage",
    theme: "conditional aggregation",
    businessContext: "an order coverage review",
    question: "Return one row per customer_id with `orders_with_shipment` and `orders_without_shipment`.",
    tables: [ordersTable, shipmentsTable],
    expectedOutput: [
      "Count orders with and without a shipment row.",
      "Return one row per customer_id.",
      "Sort by customer_id ascending.",
    ],
    successChecklist: [
      "Use a left join from orders to shipments.",
      "Separate shipped and missing-shipment counts.",
      "Do not collapse different customers together.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const shipmentIds = new Set(input.shipments.map((row) => row.order_id));
      const metrics = new Map<string, { orders_with_shipment: number; orders_without_shipment: number }>();
      for (const order of input.orders) {
        const key = String(order.customer_id);
        const bucket = metrics.get(key) ?? { orders_with_shipment: 0, orders_without_shipment: 0 };
        if (shipmentIds.has(order.order_id)) bucket.orders_with_shipment += 1;
        else bucket.orders_without_shipment += 1;
        metrics.set(key, bucket);
      }
      return sortRows(
        [...metrics.entries()].map(([customer_id, value]) => ({
          customer_id: Number(customer_id),
          orders_with_shipment: value.orders_with_shipment,
          orders_without_shipment: value.orders_without_shipment,
        })),
        [{ column: "customer_id", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT o.customer_id,
       SUM(CASE WHEN s.order_id IS NOT NULL THEN 1 ELSE 0 END) AS orders_with_shipment,
       SUM(CASE WHEN s.order_id IS NULL THEN 1 ELSE 0 END) AS orders_without_shipment
FROM orders o
LEFT JOIN shipments s ON s.order_id = o.order_id
GROUP BY o.customer_id
ORDER BY o.customer_id;`,
    pythonReferenceSolution: `shipment_ids = {row['order_id'] for row in data['shipments']}
metrics = {}
for order in data['orders']:
    bucket = metrics.setdefault(order['customer_id'], {'orders_with_shipment': 0, 'orders_without_shipment': 0})
    if order['order_id'] in shipment_ids:
        bucket['orders_with_shipment'] += 1
    else:
        bucket['orders_without_shipment'] += 1
result = [{'customer_id': customer_id, 'orders_with_shipment': values['orders_with_shipment'], 'orders_without_shipment': values['orders_without_shipment']} for customer_id, values in metrics.items()]
result = sorted(result, key=lambda row: row['customer_id'])`,
    pysparkReferenceSolution: `result_df = orders_df.join(shipments_df, on='order_id', how='left').groupBy('customer_id').agg(F.sum(F.when(F.col('shipment_status').isNotNull(), 1).otherwise(0)).alias('orders_with_shipment'), F.sum(F.when(F.col('shipment_status').isNull(), 1).otherwise(0)).alias('orders_without_shipment')).orderBy('customer_id')`,
    pysparkRequirements: [
      { label: "left join", anyOf: ["how='left'", "how=\"left\"", "left"] },
      { label: "grouping", anyOf: [".groupBy("] },
      { label: "conditional logic", anyOf: ["F.when(", ".otherwise("] },
      { label: "with shipment metric", anyOf: ["orders_with_shipment"] },
      { label: "without shipment metric", anyOf: ["orders_without_shipment"] },
    ],
  },
  {
    levelNumber: 78,
    category: "conditional-aggregation",
    title: "Level 78: Category mapped vs unmapped lines",
    theme: "conditional aggregation",
    businessContext: "a catalog quality summary",
    question: "Return one row per category bucket with `mapped_lines` and `unmapped_lines`, using `UNMAPPED` for missing product map rows.",
    tables: [orderItemsTable, productMapTable],
    expectedOutput: [
      "Use UNMAPPED as the category bucket when no product map row exists.",
      "Count mapped and unmapped lines separately.",
      "Sort by category_bucket ascending.",
    ],
    successChecklist: [
      "Use a left join from order items.",
      "Create a category bucket for missing matches.",
      "Split mapped and unmapped counts into separate columns.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const mapping = mapBy(input.product_map, "raw_sku");
      const metrics = new Map<string, { mapped_lines: number; unmapped_lines: number }>();
      for (const item of input.order_items) {
        const mapped = mapping.get(item.raw_sku ?? null);
        const categoryBucket = mapped ? String(mapped.category) : "UNMAPPED";
        const bucket = metrics.get(categoryBucket) ?? { mapped_lines: 0, unmapped_lines: 0 };
        if (mapped) bucket.mapped_lines += 1;
        else bucket.unmapped_lines += 1;
        metrics.set(categoryBucket, bucket);
      }
      return sortRows(
        [...metrics.entries()].map(([category_bucket, value]) => ({
          category_bucket,
          mapped_lines: value.mapped_lines,
          unmapped_lines: value.unmapped_lines,
        })),
        [{ column: "category_bucket", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT COALESCE(m.category, 'UNMAPPED') AS category_bucket,
       SUM(CASE WHEN m.raw_sku IS NOT NULL THEN 1 ELSE 0 END) AS mapped_lines,
       SUM(CASE WHEN m.raw_sku IS NULL THEN 1 ELSE 0 END) AS unmapped_lines
FROM order_items i
LEFT JOIN product_map m ON m.raw_sku = i.raw_sku
GROUP BY COALESCE(m.category, 'UNMAPPED')
ORDER BY category_bucket;`,
    pythonReferenceSolution: `mapping = {row['raw_sku']: row for row in data['product_map']}
metrics = {}
for item in data['order_items']:
    mapped = mapping.get(item['raw_sku'])
    bucket_name = mapped['category'] if mapped else 'UNMAPPED'
    bucket = metrics.setdefault(bucket_name, {'mapped_lines': 0, 'unmapped_lines': 0})
    if mapped:
        bucket['mapped_lines'] += 1
    else:
        bucket['unmapped_lines'] += 1
result = [{'category_bucket': name, 'mapped_lines': values['mapped_lines'], 'unmapped_lines': values['unmapped_lines']} for name, values in metrics.items()]
result = sorted(result, key=lambda row: row['category_bucket'].lower())`,
    pysparkReferenceSolution: `result_df = order_items_df.join(product_map_df, on='raw_sku', how='left').withColumn('category_bucket', F.coalesce(F.col('category'), F.lit('UNMAPPED'))).groupBy('category_bucket').agg(F.sum(F.when(F.col('canonical_sku').isNotNull(), 1).otherwise(0)).alias('mapped_lines'), F.sum(F.when(F.col('canonical_sku').isNull(), 1).otherwise(0)).alias('unmapped_lines')).orderBy('category_bucket')`,
    pysparkRequirements: [
      { label: "left join", anyOf: ["how='left'", "how=\"left\"", "left"] },
      { label: "bucket column", anyOf: ["category_bucket", ".withColumn("] },
      { label: "conditional logic", anyOf: ["F.when(", ".otherwise("] },
      { label: "mapped metric", anyOf: ["mapped_lines"] },
      { label: "unmapped metric", anyOf: ["unmapped_lines"] },
    ],
  },
];

const dedupeSeeds: WorldTwoSeed[] = [
  {
    levelNumber: 79,
    category: "deduplication",
    title: "Level 79: Latest profile row",
    theme: "deduplication",
    businessContext: "a profile state repair",
    question: "Keep the latest profile row per customer_id using the largest updated_at.",
    tables: [profilesTable],
    expectedOutput: [
      "Return one row per customer_id.",
      "Keep the row with the largest updated_at.",
      "Sort by customer_id ascending.",
    ],
    successChecklist: [
      "Deduplicate by customer_id.",
      "Use updated_at as the winner rule.",
      "Return the full winning row.",
    ],
    orderSensitive: true,
    deriveExpected: (input) =>
      sortRows(
        latestRows(input.profiles, "customer_id", "updated_at").map((row) => ({
          customer_id: row.customer_id,
          tier: row.tier,
          updated_at: row.updated_at,
        })),
        [{ column: "customer_id", direction: "asc" }],
      ),
    sqlReferenceSolution: `WITH ranked AS (
  SELECT customer_id, tier, updated_at,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) AS rn
  FROM profiles
)
SELECT customer_id, tier, updated_at
FROM ranked
WHERE rn = 1
ORDER BY customer_id;`,
    pythonReferenceSolution: `latest = {}
for row in data['profiles']:
    current = latest.get(row['customer_id'])
    if current is None or row['updated_at'] > current['updated_at']:
        latest[row['customer_id']] = row
result = [
    {
        'customer_id': row['customer_id'],
        'tier': row['tier'],
        'updated_at': row['updated_at'],
    }
    for row in latest.values()
]
result = sorted(result, key=lambda row: row['customer_id'])`,
    pysparkReferenceSolution: `window_spec = Window.partitionBy('customer_id').orderBy(F.col('updated_at').desc())
result_df = profiles_df.withColumn('row_num', F.row_number().over(window_spec)).filter(F.col('row_num') == 1).select('customer_id', 'tier', 'updated_at').orderBy('customer_id')`,
    pysparkRequirements: [
      { label: "window", anyOf: ["Window.partitionBy("] },
      { label: "row number", anyOf: ["row_number("] },
      { label: "winner filter", anyOf: ["row_num", "== 1"] },
      { label: "ordering", anyOf: [".orderBy("] },
    ],
  },
  {
    levelNumber: 80,
    category: "deduplication",
    title: "Level 80: Latest ingested event row",
    theme: "deduplication",
    businessContext: "an event ingest repair",
    question: "Keep the latest event row per event_id using the largest ingest_time.",
    tables: [eventsTable],
    expectedOutput: [
      "Return one row per event_id.",
      "Keep the row with the largest ingest_time.",
      "Sort by event_id ascending.",
    ],
    successChecklist: [
      "Deduplicate by event_id.",
      "Use ingest_time as the winner rule.",
      "Return the winning device_id and event_type.",
    ],
    orderSensitive: true,
    deriveExpected: (input) =>
      sortRows(
        latestRows(input.events, "event_id", "ingest_time").map((row) => ({
          event_id: row.event_id,
          device_id: row.device_id,
          event_type: row.event_type,
          ingest_time: row.ingest_time,
        })),
        [{ column: "event_id", direction: "asc" }],
      ),
    sqlReferenceSolution: `WITH ranked AS (
  SELECT event_id, device_id, event_type, ingest_time,
         ROW_NUMBER() OVER (PARTITION BY event_id ORDER BY ingest_time DESC) AS rn
  FROM events
)
SELECT event_id, device_id, event_type, ingest_time
FROM ranked
WHERE rn = 1
ORDER BY event_id;`,
    pythonReferenceSolution: `latest = {}
for row in data['events']:
    current = latest.get(row['event_id'])
    if current is None or row['ingest_time'] > current['ingest_time']:
        latest[row['event_id']] = row
result = [
    {
        'event_id': row['event_id'],
        'device_id': row['device_id'],
        'event_type': row['event_type'],
        'ingest_time': row['ingest_time'],
    }
    for row in latest.values()
]
result = sorted(result, key=lambda row: row['event_id'])`,
    pysparkReferenceSolution: `window_spec = Window.partitionBy('event_id').orderBy(F.col('ingest_time').desc())
result_df = events_df.withColumn('row_num', F.row_number().over(window_spec)).filter(F.col('row_num') == 1).select('event_id', 'device_id', 'event_type', 'ingest_time').orderBy('event_id')`,
    pysparkRequirements: [
      { label: "window", anyOf: ["Window.partitionBy("] },
      { label: "row number", anyOf: ["row_number("] },
      { label: "winner filter", anyOf: ["row_num", "== 1"] },
      { label: "ordering", anyOf: [".orderBy("] },
    ],
  },
  {
    levelNumber: 81,
    category: "deduplication",
    title: "Level 81: Latest order snapshot",
    theme: "deduplication",
    businessContext: "a state-history collapse step",
    question: "Keep the latest order snapshot per order_id using the largest snapshot_at.",
    tables: [orderSnapshotsTable],
    expectedOutput: [
      "Return one row per order_id.",
      "Keep the row with the largest snapshot_at.",
      "Sort by order_id ascending.",
    ],
    successChecklist: [
      "Deduplicate by order_id.",
      "Use snapshot_at as the winner rule.",
      "Return snapshot_status from the winner row.",
    ],
    orderSensitive: true,
    deriveExpected: (input) =>
      sortRows(
        latestRows(input.order_snapshots, "order_id", "snapshot_at").map((row) => ({
          order_id: row.order_id,
          snapshot_status: row.snapshot_status,
          snapshot_at: row.snapshot_at,
        })),
        [{ column: "order_id", direction: "asc" }],
      ),
    sqlReferenceSolution: `WITH ranked AS (
  SELECT order_id, snapshot_status, snapshot_at,
         ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY snapshot_at DESC) AS rn
  FROM order_snapshots
)
SELECT order_id, snapshot_status, snapshot_at
FROM ranked
WHERE rn = 1
ORDER BY order_id;`,
    pythonReferenceSolution: `latest = {}
for row in data['order_snapshots']:
    current = latest.get(row['order_id'])
    if current is None or row['snapshot_at'] > current['snapshot_at']:
        latest[row['order_id']] = row
result = [
    {
        'order_id': row['order_id'],
        'snapshot_status': row['snapshot_status'],
        'snapshot_at': row['snapshot_at'],
    }
    for row in latest.values()
]
result = sorted(result, key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `window_spec = Window.partitionBy('order_id').orderBy(F.col('snapshot_at').desc())
result_df = order_snapshots_df.withColumn('row_num', F.row_number().over(window_spec)).filter(F.col('row_num') == 1).select('order_id', 'snapshot_status', 'snapshot_at').orderBy('order_id')`,
    pysparkRequirements: [
      { label: "window", anyOf: ["Window.partitionBy("] },
      { label: "row number", anyOf: ["row_number("] },
      { label: "winner filter", anyOf: ["row_num", "== 1"] },
      { label: "ordering", anyOf: [".orderBy("] },
    ],
  },
  {
    levelNumber: 82,
    category: "deduplication",
    title: "Level 82: Latest account extract",
    theme: "deduplication",
    businessContext: "a CRM landing cleanup",
    question: "Keep the latest account extract row per account_id using the largest loaded_at.",
    tables: [accountsExtractTable],
    expectedOutput: [
      "Return one row per account_id.",
      "Keep the row with the largest loaded_at.",
      "Sort by account_id ascending.",
    ],
    successChecklist: [
      "Deduplicate by account_id.",
      "Use loaded_at as the winner rule.",
      "Return the latest raw flags intact.",
    ],
    orderSensitive: true,
    deriveExpected: (input) =>
      sortRows(
        latestRows(input.account_extracts, "account_id", "loaded_at").map((row) => ({
          account_id: row.account_id,
          country_code_raw: row.country_code_raw,
          active_flag_raw: row.active_flag_raw,
          loaded_at: row.loaded_at,
        })),
        [{ column: "account_id", direction: "asc" }],
      ),
    sqlReferenceSolution: `WITH ranked AS (
  SELECT account_id, country_code_raw, active_flag_raw, loaded_at,
         ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY loaded_at DESC) AS rn
  FROM account_extracts
)
SELECT account_id, country_code_raw, active_flag_raw, loaded_at
FROM ranked
WHERE rn = 1
ORDER BY account_id;`,
    pythonReferenceSolution: `latest = {}
for row in data['account_extracts']:
    current = latest.get(row['account_id'])
    if current is None or row['loaded_at'] > current['loaded_at']:
        latest[row['account_id']] = row
result = [
    {
        'account_id': row['account_id'],
        'country_code_raw': row['country_code_raw'],
        'active_flag_raw': row['active_flag_raw'],
        'loaded_at': row['loaded_at'],
    }
    for row in latest.values()
]
result = sorted(result, key=lambda row: row['account_id'])`,
    pysparkReferenceSolution: `window_spec = Window.partitionBy('account_id').orderBy(F.col('loaded_at').desc())
result_df = account_extracts_df.withColumn('row_num', F.row_number().over(window_spec)).filter(F.col('row_num') == 1).select('account_id', 'country_code_raw', 'active_flag_raw', 'loaded_at').orderBy('account_id')`,
    pysparkRequirements: [
      { label: "window", anyOf: ["Window.partitionBy("] },
      { label: "row number", anyOf: ["row_number("] },
      { label: "winner filter", anyOf: ["row_num", "== 1"] },
      { label: "ordering", anyOf: [".orderBy("] },
    ],
  },
  {
    levelNumber: 83,
    category: "deduplication",
    title: "Level 83: Latest ticket per customer",
    theme: "deduplication",
    businessContext: "a support recency snapshot",
    question: "Keep the latest support ticket row per customer_id using the largest opened_at.",
    tables: [ticketsTable],
    expectedOutput: [
      "Return one row per customer_id.",
      "Keep the row with the largest opened_at.",
      "Sort by customer_id ascending.",
    ],
    successChecklist: [
      "Deduplicate by customer_id.",
      "Use opened_at as the winner rule.",
      "Keep the winning ticket_id and severity.",
    ],
    orderSensitive: true,
    deriveExpected: (input) =>
      sortRows(
        latestRows(input.support_tickets, "customer_id", "opened_at").map((row) => ({
          customer_id: row.customer_id,
          ticket_id: row.ticket_id,
          severity: row.severity,
          opened_at: row.opened_at,
        })),
        [{ column: "customer_id", direction: "asc" }],
      ),
    sqlReferenceSolution: `WITH ranked AS (
  SELECT customer_id, ticket_id, severity, opened_at,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY opened_at DESC) AS rn
  FROM support_tickets
)
SELECT customer_id, ticket_id, severity, opened_at
FROM ranked
WHERE rn = 1
ORDER BY customer_id;`,
    pythonReferenceSolution: `latest = {}
for row in data['support_tickets']:
    current = latest.get(row['customer_id'])
    if current is None or row['opened_at'] > current['opened_at']:
        latest[row['customer_id']] = row
result = [
    {
        'customer_id': row['customer_id'],
        'ticket_id': row['ticket_id'],
        'severity': row['severity'],
        'opened_at': row['opened_at'],
    }
    for row in latest.values()
]
result = sorted(result, key=lambda row: row['customer_id'])`,
    pysparkReferenceSolution: `window_spec = Window.partitionBy('customer_id').orderBy(F.col('opened_at').desc())
result_df = support_tickets_df.withColumn('row_num', F.row_number().over(window_spec)).filter(F.col('row_num') == 1).select('customer_id', 'ticket_id', 'severity', 'opened_at').orderBy('customer_id')`,
    pysparkRequirements: [
      { label: "window", anyOf: ["Window.partitionBy("] },
      { label: "row number", anyOf: ["row_number("] },
      { label: "winner filter", anyOf: ["row_num", "== 1"] },
      { label: "ordering", anyOf: [".orderBy("] },
    ],
  },
  {
    levelNumber: 84,
    category: "deduplication",
    title: "Level 84: Latest subscription plan",
    theme: "deduplication",
    businessContext: "a subscription state snapshot",
    question: "Keep the latest subscription row per subscription_id using the largest changed_at.",
    tables: [subscriptionsTable],
    expectedOutput: [
      "Return one row per subscription_id.",
      "Keep the row with the largest changed_at.",
      "Sort by subscription_id ascending.",
    ],
    successChecklist: [
      "Deduplicate by subscription_id.",
      "Use changed_at as the winner rule.",
      "Return the latest plan.",
    ],
    orderSensitive: true,
    deriveExpected: (input) =>
      sortRows(
        latestRows(input.subscriptions, "subscription_id", "changed_at").map((row) => ({
          subscription_id: row.subscription_id,
          plan: row.plan,
          changed_at: row.changed_at,
        })),
        [{ column: "subscription_id", direction: "asc" }],
      ),
    sqlReferenceSolution: `WITH ranked AS (
  SELECT subscription_id, plan, changed_at,
         ROW_NUMBER() OVER (PARTITION BY subscription_id ORDER BY changed_at DESC) AS rn
  FROM subscriptions
)
SELECT subscription_id, plan, changed_at
FROM ranked
WHERE rn = 1
ORDER BY subscription_id;`,
    pythonReferenceSolution: `latest = {}
for row in data['subscriptions']:
    current = latest.get(row['subscription_id'])
    if current is None or row['changed_at'] > current['changed_at']:
        latest[row['subscription_id']] = row
result = [
    {
        'subscription_id': row['subscription_id'],
        'plan': row['plan'],
        'changed_at': row['changed_at'],
    }
    for row in latest.values()
]
result = sorted(result, key=lambda row: row['subscription_id'])`,
    pysparkReferenceSolution: `window_spec = Window.partitionBy('subscription_id').orderBy(F.col('changed_at').desc())
result_df = subscriptions_df.withColumn('row_num', F.row_number().over(window_spec)).filter(F.col('row_num') == 1).select('subscription_id', 'plan', 'changed_at').orderBy('subscription_id')`,
    pysparkRequirements: [
      { label: "window", anyOf: ["Window.partitionBy("] },
      { label: "row number", anyOf: ["row_number("] },
      { label: "winner filter", anyOf: ["row_num", "== 1"] },
      { label: "ordering", anyOf: [".orderBy("] },
    ],
  },
];

const latestRecordSeeds: WorldTwoSeed[] = [
  {
    levelNumber: 85,
    category: "latest-record",
    title: "Level 85: Latest successful payment attempt",
    theme: "latest record",
    businessContext: "a retry-payment summary",
    question: "Return the latest successful payment attempt per order as `order_id`, `attempt_amount`, and `attempted_at`.",
    tables: [paymentAttemptsTable],
    expectedOutput: [
      "Keep only settled attempts.",
      "Return the latest settled attempt per order.",
      "Sort by order_id ascending.",
    ],
    successChecklist: [
      "Filter to settled attempts before ranking.",
      "Use attempted_at as the latest rule.",
      "Return one row per order_id.",
    ],
    orderSensitive: true,
    deriveExpected: (input) =>
      sortRows(
        latestRows(
          input.payment_attempts.filter((row) => row.attempt_status === "settled"),
          "order_id",
          "attempted_at",
        ).map((row) => ({
          order_id: row.order_id,
          attempt_amount: row.attempt_amount,
          attempted_at: row.attempted_at,
        })),
        [{ column: "order_id", direction: "asc" }],
      ),
    sqlReferenceSolution: `WITH ranked AS (
  SELECT order_id, attempt_amount, attempted_at,
         ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY attempted_at DESC) AS rn
  FROM payment_attempts
  WHERE attempt_status = 'settled'
)
SELECT order_id, attempt_amount, attempted_at
FROM ranked
WHERE rn = 1
ORDER BY order_id;`,
    pythonReferenceSolution: `latest = {}
for row in data['payment_attempts']:
    if row['attempt_status'] != 'settled':
        continue
    current = latest.get(row['order_id'])
    if current is None or row['attempted_at'] > current['attempted_at']:
        latest[row['order_id']] = row
result = [
    {
        'order_id': row['order_id'],
        'attempt_amount': row['attempt_amount'],
        'attempted_at': row['attempted_at'],
    }
    for row in latest.values()
]
result = sorted(result, key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `window_spec = Window.partitionBy('order_id').orderBy(F.col('attempted_at').desc())
result_df = payment_attempts_df.filter(F.col('attempt_status') == 'settled').withColumn('row_num', F.row_number().over(window_spec)).filter(F.col('row_num') == 1).select('order_id', 'attempt_amount', 'attempted_at').orderBy('order_id')`,
    pysparkRequirements: [
      { label: "settled filter", anyOf: ["attempt_status", "settled"] },
      { label: "window", anyOf: ["Window.partitionBy("] },
      { label: "row number", anyOf: ["row_number("] },
      { label: "winner filter", anyOf: ["row_num", "== 1"] },
    ],
  },
  {
    levelNumber: 86,
    category: "latest-record",
    title: "Level 86: Latest shipment event",
    theme: "latest record",
    businessContext: "a shipment state surface",
    question: "Return the latest shipment event per order as `order_id`, `event_status`, and `updated_at`.",
    tables: [shipmentEventsTable],
    expectedOutput: [
      "Return one row per order_id.",
      "Keep the row with the largest updated_at.",
      "Sort by order_id ascending.",
    ],
    successChecklist: [
      "Use the latest updated_at per order.",
      "Return the winning event_status.",
      "Keep one row per order_id.",
    ],
    orderSensitive: true,
    deriveExpected: (input) =>
      sortRows(
        latestRows(input.shipment_events, "order_id", "updated_at").map((row) => ({
          order_id: row.order_id,
          event_status: row.event_status,
          updated_at: row.updated_at,
        })),
        [{ column: "order_id", direction: "asc" }],
      ),
    sqlReferenceSolution: `WITH ranked AS (
  SELECT order_id, event_status, updated_at,
         ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY updated_at DESC) AS rn
  FROM shipment_events
)
SELECT order_id, event_status, updated_at
FROM ranked
WHERE rn = 1
ORDER BY order_id;`,
    pythonReferenceSolution: `latest = {}
for row in data['shipment_events']:
    current = latest.get(row['order_id'])
    if current is None or row['updated_at'] > current['updated_at']:
        latest[row['order_id']] = row
result = [
    {
        'order_id': row['order_id'],
        'event_status': row['event_status'],
        'updated_at': row['updated_at'],
    }
    for row in latest.values()
]
result = sorted(result, key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `window_spec = Window.partitionBy('order_id').orderBy(F.col('updated_at').desc())
result_df = shipment_events_df.withColumn('row_num', F.row_number().over(window_spec)).filter(F.col('row_num') == 1).select('order_id', 'event_status', 'updated_at').orderBy('order_id')`,
    pysparkRequirements: [
      { label: "window", anyOf: ["Window.partitionBy("] },
      { label: "row number", anyOf: ["row_number("] },
      { label: "winner filter", anyOf: ["row_num", "== 1"] },
      { label: "ordering", anyOf: [".orderBy("] },
    ],
  },
  {
    levelNumber: 87,
    category: "latest-record",
    title: "Level 87: Latest balance snapshot",
    theme: "latest record",
    businessContext: "a balance snapshot export",
    question: "Return the latest daily balance row per customer as `customer_id`, `plan`, `balance`, and `snapshot_date`.",
    tables: [balancesTable],
    expectedOutput: [
      "Return one row per customer_id.",
      "Keep the row with the largest snapshot_date.",
      "Sort by customer_id ascending.",
    ],
    successChecklist: [
      "Use snapshot_date as the recency rule.",
      "Return plan and balance from the winner row.",
      "Keep one row per customer.",
    ],
    orderSensitive: true,
    deriveExpected: (input) =>
      sortRows(
        latestRows(input.daily_balances, "customer_id", "snapshot_date").map((row) => ({
          customer_id: row.customer_id,
          plan: row.plan,
          balance: row.balance,
          snapshot_date: row.snapshot_date,
        })),
        [{ column: "customer_id", direction: "asc" }],
      ),
    sqlReferenceSolution: `WITH ranked AS (
  SELECT customer_id, plan, balance, snapshot_date,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY snapshot_date DESC) AS rn
  FROM daily_balances
)
SELECT customer_id, plan, balance, snapshot_date
FROM ranked
WHERE rn = 1
ORDER BY customer_id;`,
    pythonReferenceSolution: `latest = {}
for row in data['daily_balances']:
    current = latest.get(row['customer_id'])
    if current is None or row['snapshot_date'] > current['snapshot_date']:
        latest[row['customer_id']] = row
result = [
    {
        'customer_id': row['customer_id'],
        'plan': row['plan'],
        'balance': row['balance'],
        'snapshot_date': row['snapshot_date'],
    }
    for row in latest.values()
]
result = sorted(result, key=lambda row: row['customer_id'])`,
    pysparkReferenceSolution: `window_spec = Window.partitionBy('customer_id').orderBy(F.col('snapshot_date').desc())
result_df = daily_balances_df.withColumn('row_num', F.row_number().over(window_spec)).filter(F.col('row_num') == 1).select('customer_id', 'plan', 'balance', 'snapshot_date').orderBy('customer_id')`,
    pysparkRequirements: [
      { label: "window", anyOf: ["Window.partitionBy("] },
      { label: "row number", anyOf: ["row_number("] },
      { label: "winner filter", anyOf: ["row_num", "== 1"] },
      { label: "ordering", anyOf: [".orderBy("] },
    ],
  },
  {
    levelNumber: 88,
    category: "latest-record",
    title: "Level 88: Latest plan change",
    theme: "latest record",
    businessContext: "an account plan snapshot",
    question: "Return the latest plan change per account as `account_id`, `plan_name`, and `changed_at`.",
    tables: [planChangesTable],
    expectedOutput: [
      "Return one row per account_id.",
      "Keep the row with the largest changed_at.",
      "Sort by account_id ascending.",
    ],
    successChecklist: [
      "Use changed_at as the recency rule.",
      "Return the latest plan_name.",
      "Keep one row per account_id.",
    ],
    orderSensitive: true,
    deriveExpected: (input) =>
      sortRows(
        latestRows(input.plan_changes, "account_id", "changed_at").map((row) => ({
          account_id: row.account_id,
          plan_name: row.plan_name,
          changed_at: row.changed_at,
        })),
        [{ column: "account_id", direction: "asc" }],
      ),
    sqlReferenceSolution: `WITH ranked AS (
  SELECT account_id, plan_name, changed_at,
         ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY changed_at DESC) AS rn
  FROM plan_changes
)
SELECT account_id, plan_name, changed_at
FROM ranked
WHERE rn = 1
ORDER BY account_id;`,
    pythonReferenceSolution: `latest = {}
for row in data['plan_changes']:
    current = latest.get(row['account_id'])
    if current is None or row['changed_at'] > current['changed_at']:
        latest[row['account_id']] = row
result = [
    {
        'account_id': row['account_id'],
        'plan_name': row['plan_name'],
        'changed_at': row['changed_at'],
    }
    for row in latest.values()
]
result = sorted(result, key=lambda row: row['account_id'])`,
    pysparkReferenceSolution: `window_spec = Window.partitionBy('account_id').orderBy(F.col('changed_at').desc())
result_df = plan_changes_df.withColumn('row_num', F.row_number().over(window_spec)).filter(F.col('row_num') == 1).select('account_id', 'plan_name', 'changed_at').orderBy('account_id')`,
    pysparkRequirements: [
      { label: "window", anyOf: ["Window.partitionBy("] },
      { label: "row number", anyOf: ["row_number("] },
      { label: "winner filter", anyOf: ["row_num", "== 1"] },
      { label: "ordering", anyOf: [".orderBy("] },
    ],
  },
];

const dateWindowSeeds: WorldTwoSeed[] = [
  {
    levelNumber: 89,
    category: "date-window",
    title: "Level 89: July settled payments",
    theme: "date windows",
    businessContext: "a monthly settlement extract",
    question: "Return settled payment rows from 2026-07-01 through 2026-07-04 inclusive as `order_id`, `paid_amount`, and `paid_at`.",
    tables: [paymentsTable],
    expectedOutput: [
      "Keep only settled payments inside the stated paid_at window.",
      "Return columns: order_id, paid_amount, paid_at.",
      "Sort by paid_at ascending.",
    ],
    successChecklist: [
      "Use the paid_at field for the window.",
      "Filter to settled rows only.",
      "Keep the time window inclusive.",
    ],
    orderSensitive: true,
    deriveExpected: (input) =>
      sortRows(
        input.payments
          .filter(
            (row) =>
              row.payment_status === "settled" &&
              String(row.paid_at) >= "2026-07-01T00:00:00" &&
              String(row.paid_at) <= "2026-07-04T23:59:59",
          )
          .map((row) => ({
            order_id: row.order_id,
            paid_amount: row.paid_amount,
            paid_at: row.paid_at,
          })),
        [{ column: "paid_at", direction: "asc" }],
      ),
    buildHiddenInput: (input) => {
      input.payments.push({
        order_id: 1007,
        payment_status: "settled",
        paid_amount: 70,
        payment_method: "card",
        paid_at: "2026-07-04T23:00:00",
      });
      return input;
    },
    sqlReferenceSolution: `SELECT order_id, paid_amount, paid_at
FROM payments
WHERE payment_status = 'settled'
  AND paid_at >= '2026-07-01T00:00:00'
  AND paid_at <= '2026-07-04T23:59:59'
ORDER BY paid_at;`,
    pythonReferenceSolution: `result = [
    {
        'order_id': row['order_id'],
        'paid_amount': row['paid_amount'],
        'paid_at': row['paid_at'],
    }
    for row in data['payments']
    if row['payment_status'] == 'settled'
    and row['paid_at'] >= '2026-07-01T00:00:00'
    and row['paid_at'] <= '2026-07-04T23:59:59'
]
result = sorted(result, key=lambda row: row['paid_at'])`,
    pysparkReferenceSolution: `result_df = payments_df.filter((F.col('payment_status') == 'settled') & (F.col('paid_at') >= '2026-07-01T00:00:00') & (F.col('paid_at') <= '2026-07-04T23:59:59')).select('order_id', 'paid_amount', 'paid_at').orderBy('paid_at')`,
    pysparkRequirements: [
      { label: "filter", anyOf: [".filter(", ".where("] },
      { label: "settled condition", anyOf: ["payment_status", "settled"] },
      { label: "window start", anyOf: ["2026-07-01T00:00:00"] },
      { label: "window end", anyOf: ["2026-07-04T23:59:59"] },
      { label: "projection", anyOf: [".select("] },
    ],
  },
  {
    levelNumber: 90,
    category: "date-window",
    title: "Level 90: Launch week orders",
    theme: "date windows",
    businessContext: "a launch-week revenue slice",
    question: "Return paid or completed orders from 2026-07-03 through 2026-07-08 inclusive as `order_id`, `status`, and `order_date`.",
    tables: [ordersTable],
    expectedOutput: [
      "Keep only paid or completed orders in the stated order_date window.",
      "Return columns: order_id, status, order_date.",
      "Sort by order_date then order_id.",
    ],
    successChecklist: [
      "Use order_date for the window.",
      "Exclude cancelled rows.",
      "Keep the date boundaries inclusive.",
    ],
    orderSensitive: true,
    deriveExpected: (input) =>
      sortRows(
        input.orders
          .filter(
            (row) =>
              (row.status === "paid" || row.status === "completed") &&
              String(row.order_date) >= "2026-07-03" &&
              String(row.order_date) <= "2026-07-08",
          )
          .map((row) => ({
            order_id: row.order_id,
            status: row.status,
            order_date: row.order_date,
          })),
        [
          { column: "order_date", direction: "asc" },
          { column: "order_id", direction: "asc" },
        ],
      ),
    sqlReferenceSolution: `SELECT order_id, status, order_date
FROM orders
WHERE status IN ('paid', 'completed')
  AND order_date >= '2026-07-03'
  AND order_date <= '2026-07-08'
ORDER BY order_date, order_id;`,
    pythonReferenceSolution: `result = [
    {
        'order_id': row['order_id'],
        'status': row['status'],
        'order_date': row['order_date'],
    }
    for row in data['orders']
    if row['status'] in ('paid', 'completed')
    and row['order_date'] >= '2026-07-03'
    and row['order_date'] <= '2026-07-08'
]
result = sorted(result, key=lambda row: (row['order_date'], row['order_id']))`,
    pysparkReferenceSolution: `result_df = orders_df.filter(F.col('status').isin('paid', 'completed') & (F.col('order_date') >= '2026-07-03') & (F.col('order_date') <= '2026-07-08')).select('order_id', 'status', 'order_date').orderBy('order_date', 'order_id')`,
    pysparkRequirements: [
      { label: "filter", anyOf: [".filter(", ".where("] },
      { label: "status condition", anyOf: [".isin(", "paid", "completed"] },
      { label: "window start", anyOf: ["2026-07-03"] },
      { label: "window end", anyOf: ["2026-07-08"] },
      { label: "ordering", anyOf: [".orderBy("] },
    ],
  },
  {
    levelNumber: 91,
    category: "date-window",
    title: "Level 91: Delivery weekend window",
    theme: "date windows",
    businessContext: "a weekend delivery check",
    question: "Return shipment rows delivered between 2026-07-04T00:00:00 and 2026-07-05T23:59:59 as `order_id`, `carrier`, and `delivered_at`.",
    tables: [shipmentsTable],
    expectedOutput: [
      "Keep only rows with delivered_at inside the stated window.",
      "Return columns: order_id, carrier, delivered_at.",
      "Sort by delivered_at ascending.",
    ],
    successChecklist: [
      "Use delivered_at for the window.",
      "Exclude null delivered_at rows.",
      "Keep the time boundaries inclusive.",
    ],
    orderSensitive: true,
    deriveExpected: (input) =>
      sortRows(
        input.shipments
          .filter(
            (row) =>
              row.delivered_at !== null &&
              String(row.delivered_at) >= "2026-07-04T00:00:00" &&
              String(row.delivered_at) <= "2026-07-05T23:59:59",
          )
          .map((row) => ({
            order_id: row.order_id,
            carrier: row.carrier,
            delivered_at: row.delivered_at,
          })),
        [{ column: "delivered_at", direction: "asc" }],
      ),
    sqlReferenceSolution: `SELECT order_id, carrier, delivered_at
FROM shipments
WHERE delivered_at IS NOT NULL
  AND delivered_at >= '2026-07-04T00:00:00'
  AND delivered_at <= '2026-07-05T23:59:59'
ORDER BY delivered_at;`,
    pythonReferenceSolution: `result = [
    {
        'order_id': row['order_id'],
        'carrier': row['carrier'],
        'delivered_at': row['delivered_at'],
    }
    for row in data['shipments']
    if row['delivered_at'] is not None
    and row['delivered_at'] >= '2026-07-04T00:00:00'
    and row['delivered_at'] <= '2026-07-05T23:59:59'
]
result = sorted(result, key=lambda row: row['delivered_at'])`,
    pysparkReferenceSolution: `result_df = shipments_df.filter(F.col('delivered_at').isNotNull() & (F.col('delivered_at') >= '2026-07-04T00:00:00') & (F.col('delivered_at') <= '2026-07-05T23:59:59')).select('order_id', 'carrier', 'delivered_at').orderBy('delivered_at')`,
    pysparkRequirements: [
      { label: "filter", anyOf: [".filter(", ".where("] },
      { label: "not-null delivery", anyOf: [".isNotNull()", "delivered_at"] },
      { label: "window start", anyOf: ["2026-07-04T00:00:00"] },
      { label: "window end", anyOf: ["2026-07-05T23:59:59"] },
      { label: "projection", anyOf: [".select("] },
    ],
  },
  {
    levelNumber: 92,
    category: "date-window",
    title: "Level 92: Outage-hour events",
    theme: "date windows",
    businessContext: "an incident replay extract",
    question: "Return event rows between 2026-07-01T10:00:00 and 2026-07-01T11:00:00 inclusive as `event_id`, `device_id`, and `event_time`.",
    tables: [eventsTable],
    expectedOutput: [
      "Use event_time for the outage-hour window.",
      "Return columns: event_id, device_id, event_time.",
      "Sort by event_time then event_id.",
    ],
    successChecklist: [
      "Filter by the event_time window.",
      "Keep the boundaries inclusive.",
      "Return only the requested columns.",
    ],
    orderSensitive: true,
    deriveExpected: (input) =>
      sortRows(
        input.events
          .filter(
            (row) =>
              String(row.event_time) >= "2026-07-01T10:00:00" &&
              String(row.event_time) <= "2026-07-01T11:00:00",
          )
          .map((row) => ({
            event_id: row.event_id,
            device_id: row.device_id,
            event_time: row.event_time,
          })),
        [
          { column: "event_time", direction: "asc" },
          { column: "event_id", direction: "asc" },
        ],
      ),
    sqlReferenceSolution: `SELECT event_id, device_id, event_time
FROM events
WHERE event_time >= '2026-07-01T10:00:00'
  AND event_time <= '2026-07-01T11:00:00'
ORDER BY event_time, event_id;`,
    pythonReferenceSolution: `result = [
    {
        'event_id': row['event_id'],
        'device_id': row['device_id'],
        'event_time': row['event_time'],
    }
    for row in data['events']
    if row['event_time'] >= '2026-07-01T10:00:00'
    and row['event_time'] <= '2026-07-01T11:00:00'
]
result = sorted(result, key=lambda row: (row['event_time'], row['event_id']))`,
    pysparkReferenceSolution: `result_df = events_df.filter((F.col('event_time') >= '2026-07-01T10:00:00') & (F.col('event_time') <= '2026-07-01T11:00:00')).select('event_id', 'device_id', 'event_time').orderBy('event_time', 'event_id')`,
    pysparkRequirements: [
      { label: "filter", anyOf: [".filter(", ".where("] },
      { label: "window start", anyOf: ["2026-07-01T10:00:00"] },
      { label: "window end", anyOf: ["2026-07-01T11:00:00"] },
      { label: "ordering", anyOf: [".orderBy("] },
      { label: "projection", anyOf: [".select("] },
    ],
  },
];

const qualitySeeds: WorldTwoSeed[] = [
  {
    levelNumber: 93,
    category: "data-quality",
    title: "Level 93: Payment amount mismatch",
    theme: "data quality",
    businessContext: "a payment reconciliation exception list",
    question: "Return orders where settled paid_amount does not equal order amount as `order_id`, `amount`, and `paid_amount`.",
    tables: [ordersTable, paymentsTable],
    expectedOutput: [
      "Compare order amount to settled paid_amount.",
      "Keep only mismatches.",
      "Sort by order_id ascending.",
    ],
    successChecklist: [
      "Join orders to payments on order_id.",
      "Check only settled payments.",
      "Return both compared values.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const orders = mapBy(input.orders, "order_id");
      return sortRows(
        input.payments
          .filter((payment) => payment.payment_status === "settled")
          .flatMap((payment) => {
            const order = orders.get(payment.order_id ?? null);
            return order && toNumber(order.amount) !== toNumber(payment.paid_amount)
              ? [{ order_id: payment.order_id, amount: order.amount, paid_amount: payment.paid_amount }]
              : [];
          }),
        [{ column: "order_id", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT p.order_id, o.amount, p.paid_amount
FROM payments p
JOIN orders o ON o.order_id = p.order_id
WHERE p.payment_status = 'settled'
  AND p.paid_amount <> o.amount
ORDER BY p.order_id;`,
    pythonReferenceSolution: `orders_by_id = {row['order_id']: row for row in data['orders']}
result = []
for payment in data['payments']:
    order = orders_by_id.get(payment['order_id'])
    if payment['payment_status'] == 'settled' and order and payment['paid_amount'] != order['amount']:
        result.append({
            'order_id': payment['order_id'],
            'amount': order['amount'],
            'paid_amount': payment['paid_amount'],
        })
result = sorted(result, key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `result_df = payments_df.join(orders_df, on='order_id', how='inner').filter((F.col('payment_status') == 'settled') & (F.col('paid_amount') != F.col('amount'))).select('order_id', 'amount', 'paid_amount').orderBy('order_id')`,
    pysparkRequirements: [
      { label: "join", anyOf: [".join("] },
      { label: "settled filter", anyOf: ["payment_status", "settled"] },
      { label: "mismatch condition", anyOf: ["paid_amount", "amount", "!="] },
      { label: "projection", anyOf: [".select("] },
    ],
  },
  {
    levelNumber: 94,
    category: "data-quality",
    title: "Level 94: Blank country customers",
    theme: "data quality",
    businessContext: "a customer dimension cleanup",
    question: "Return raw account rows where trimmed country_code_raw is blank or null as `account_id` and `country_code_raw`.",
    tables: [rawAccountsTable],
    expectedOutput: [
      "Trim the raw country code before checking it.",
      "Keep only blank or null values.",
      "Sort by account_id ascending.",
    ],
    successChecklist: [
      "Treat null and trimmed empty strings as missing.",
      "Return the raw country code for triage.",
      "Do not include valid codes.",
    ],
    orderSensitive: true,
    deriveExpected: (input) =>
      sortRows(
        input.raw_accounts
          .filter((row) => normalizeText(row.country_code_raw).length === 0)
          .map((row) => ({ account_id: row.account_id, country_code_raw: row.country_code_raw })),
        [{ column: "account_id", direction: "asc" }],
      ),
    sqlReferenceSolution: `SELECT account_id, country_code_raw
FROM raw_accounts
WHERE country_code_raw IS NULL
   OR TRIM(country_code_raw) = ''
ORDER BY account_id;`,
    pythonReferenceSolution: `result = [
    {
        'account_id': row['account_id'],
        'country_code_raw': row['country_code_raw'],
    }
    for row in data['raw_accounts']
    if row['country_code_raw'] is None or str(row['country_code_raw']).strip() == ''
]
result = sorted(result, key=lambda row: row['account_id'])`,
    pysparkReferenceSolution: `result_df = raw_accounts_df.filter(F.col('country_code_raw').isNull() | (F.trim(F.col('country_code_raw')) == '')).select('account_id', 'country_code_raw').orderBy('account_id')`,
    pysparkRequirements: [
      { label: "filter", anyOf: [".filter(", ".where("] },
      { label: "null check", anyOf: [".isNull()", "country_code_raw"] },
      { label: "trim blank check", anyOf: ["F.trim(", "== ''"] },
      { label: "projection", anyOf: [".select("] },
    ],
  },
  {
    levelNumber: 95,
    category: "data-quality",
    title: "Level 95: Impossible delivery timing",
    theme: "data quality",
    businessContext: "a shipment data quality check",
    question: "Return shipment rows where delivered_at is earlier than shipped_at as `order_id`, `shipped_at`, and `delivered_at`.",
    tables: [
      table(
        shipmentsTable.name,
        shipmentsTable.frameName,
        shipmentsTable.columns,
        [...shipmentsTable.rows, { order_id: 1011, shipped_at: "2026-07-06T12:00:00", delivered_at: "2026-07-06T11:00:00", carrier: "dhl", shipment_status: "delivered" }],
      ),
    ],
    expectedOutput: [
      "Keep only impossible delivery timing rows.",
      "Return columns: order_id, shipped_at, delivered_at.",
      "Sort by order_id ascending.",
    ],
    successChecklist: [
      "Compare delivered_at to shipped_at directly.",
      "Exclude rows with valid or null delivery times.",
      "Return the bad timestamps for debugging.",
    ],
    orderSensitive: true,
    deriveExpected: (input) =>
      sortRows(
        input.shipments
          .filter((row) => row.delivered_at !== null && String(row.delivered_at) < String(row.shipped_at))
          .map((row) => ({
            order_id: row.order_id,
            shipped_at: row.shipped_at,
            delivered_at: row.delivered_at,
          })),
        [{ column: "order_id", direction: "asc" }],
      ),
    sqlReferenceSolution: `SELECT order_id, shipped_at, delivered_at
FROM shipments
WHERE delivered_at IS NOT NULL
  AND delivered_at < shipped_at
ORDER BY order_id;`,
    pythonReferenceSolution: `result = [
    {
        'order_id': row['order_id'],
        'shipped_at': row['shipped_at'],
        'delivered_at': row['delivered_at'],
    }
    for row in data['shipments']
    if row['delivered_at'] is not None and row['delivered_at'] < row['shipped_at']
]
result = sorted(result, key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `result_df = shipments_df.filter(F.col('delivered_at').isNotNull() & (F.col('delivered_at') < F.col('shipped_at'))).select('order_id', 'shipped_at', 'delivered_at').orderBy('order_id')`,
    pysparkRequirements: [
      { label: "filter", anyOf: [".filter(", ".where("] },
      { label: "not-null delivery", anyOf: [".isNotNull()", "delivered_at"] },
      { label: "comparison", anyOf: ["<", "shipped_at"] },
      { label: "projection", anyOf: [".select("] },
    ],
  },
  {
    levelNumber: 96,
    category: "data-quality",
    title: "Level 96: Unknown country codes",
    theme: "data quality",
    businessContext: "a reference-data coverage check",
    question: "Return active raw account rows whose normalized country code has no match in the country dimension as `account_id` and `normalized_country_code`.",
    tables: [rawAccountsTable, countryDimTable],
    expectedOutput: [
      "Normalize country codes with trim and upper first.",
      "Keep only active rows with no country_dim match.",
      "Sort by account_id ascending.",
    ],
    successChecklist: [
      "Normalize before joining to the dimension.",
      "Ignore inactive rows.",
      "Return only missing reference matches.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const validCodes = new Set(input.country_dim.map((row) => row.country_code));
      return sortRows(
        input.raw_accounts
          .filter((row) => row.active_flag_raw === "Y")
          .map((row) => ({
            account_id: row.account_id,
            normalized_country_code: normalizeText(row.country_code_raw),
          }))
          .filter((row) => row.normalized_country_code.length > 0 && !validCodes.has(row.normalized_country_code)),
        [{ column: "account_id", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT r.account_id, UPPER(TRIM(r.country_code_raw)) AS normalized_country_code
FROM raw_accounts r
LEFT JOIN country_dim d ON d.country_code = UPPER(TRIM(r.country_code_raw))
WHERE r.active_flag_raw = 'Y'
  AND TRIM(COALESCE(r.country_code_raw, '')) <> ''
  AND d.country_code IS NULL
ORDER BY r.account_id;`,
    pythonReferenceSolution: `valid_codes = {row['country_code'] for row in data['country_dim']}
result = []
for row in data['raw_accounts']:
    code = '' if row['country_code_raw'] is None else str(row['country_code_raw']).strip().upper()
    if row['active_flag_raw'] == 'Y' and code and code not in valid_codes:
        result.append({
            'account_id': row['account_id'],
            'normalized_country_code': code,
        })
result = sorted(result, key=lambda row: row['account_id'])`,
    pysparkReferenceSolution: `normalized_df = raw_accounts_df.withColumn('normalized_country_code', F.upper(F.trim(F.col('country_code_raw'))))
result_df = normalized_df.join(country_dim_df, normalized_df.normalized_country_code == country_dim_df.country_code, how='left').filter((F.col('active_flag_raw') == 'Y') & (F.col('normalized_country_code') != '') & F.col('country_name').isNull()).select('account_id', 'normalized_country_code').orderBy('account_id')`,
    pysparkRequirements: [
      { label: "normalization", anyOf: ["F.upper(", "F.trim("] },
      { label: "left join", anyOf: ["how='left'", "how=\"left\"", "left"] },
      { label: "active filter", anyOf: ["active_flag_raw", "Y"] },
      { label: "missing dimension filter", anyOf: [".isNull()", "country_name"] },
      { label: "projection", anyOf: [".select("] },
    ],
  },
];

const reconciliationSeeds: WorldTwoSeed[] = [
  {
    levelNumber: 97,
    category: "reconciliation",
    title: "Level 97: Order to payout difference",
    theme: "reconciliation",
    businessContext: "a seller settlement reconciliation",
    question: "Return orders that have a payout row with a non-zero difference as `order_id`, `amount`, `payout_amount`, and `difference`.",
    tables: [ordersTable, payoutsTable],
    expectedOutput: [
      "Join orders to payouts on order_id.",
      "Keep only rows where amount - payout_amount is not zero.",
      "Sort by order_id ascending.",
    ],
    successChecklist: [
      "Calculate the difference directly.",
      "Keep only non-zero differences.",
      "Return both source amounts for reconciliation.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const payouts = mapBy(input.seller_payouts, "order_id");
      return sortRows(
        input.orders.flatMap((order) => {
          const payout = payouts.get(order.order_id ?? null);
          const difference = payout ? toNumber(order.amount) - toNumber(payout.payout_amount) : 0;
          return payout && difference !== 0
            ? [{ order_id: order.order_id, amount: order.amount, payout_amount: payout.payout_amount, difference }]
            : [];
        }),
        [{ column: "order_id", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT o.order_id, o.amount, p.payout_amount, o.amount - p.payout_amount AS difference
FROM orders o
JOIN seller_payouts p ON p.order_id = o.order_id
WHERE o.amount - p.payout_amount <> 0
ORDER BY o.order_id;`,
    pythonReferenceSolution: `payouts_by_id = {row['order_id']: row for row in data['seller_payouts']}
result = []
for order in data['orders']:
    payout = payouts_by_id.get(order['order_id'])
    if payout:
        difference = order['amount'] - payout['payout_amount']
        if difference != 0:
            result.append({
                'order_id': order['order_id'],
                'amount': order['amount'],
                'payout_amount': payout['payout_amount'],
                'difference': difference,
            })
result = sorted(result, key=lambda row: row['order_id'])`,
    pysparkReferenceSolution: `result_df = orders_df.join(seller_payouts_df, on='order_id', how='inner').withColumn('difference', F.col('amount') - F.col('payout_amount')).filter(F.col('difference') != 0).select('order_id', 'amount', 'payout_amount', 'difference').orderBy('order_id')`,
    pysparkRequirements: [
      { label: "join", anyOf: [".join("] },
      { label: "difference column", anyOf: ["difference", ".withColumn("] },
      { label: "non-zero filter", anyOf: ["!= 0", ".filter("] },
      { label: "projection", anyOf: [".select("] },
    ],
  },
  {
    levelNumber: 98,
    category: "reconciliation",
    title: "Level 98: Customer order count mismatch",
    theme: "reconciliation",
    businessContext: "a summary-table reconciliation",
    question: "Return customers where actual order count does not equal recorded_order_count as `customer_id`, `actual_order_count`, and `recorded_order_count`.",
    tables: [ordersTable, customerSummaryTable],
    expectedOutput: [
      "Count actual orders per customer from orders.",
      "Compare to recorded_order_count in the summary table.",
      "Keep only mismatches and sort by customer_id ascending.",
    ],
    successChecklist: [
      "Aggregate actual counts from orders first.",
      "Join to the summary table.",
      "Keep only mismatch rows.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const actual = new Map<string, number>();
      for (const order of input.orders) {
        const key = String(order.customer_id);
        actual.set(key, (actual.get(key) ?? 0) + 1);
      }
      return sortRows(
        input.customer_order_summary
          .map((row) => ({
            customer_id: row.customer_id,
            actual_order_count: actual.get(String(row.customer_id)) ?? 0,
            recorded_order_count: row.recorded_order_count,
          }))
          .filter((row) => row.actual_order_count !== row.recorded_order_count),
        [{ column: "customer_id", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `WITH actual AS (
  SELECT customer_id, COUNT(*) AS actual_order_count
  FROM orders
  GROUP BY customer_id
)
SELECT s.customer_id,
       COALESCE(a.actual_order_count, 0) AS actual_order_count,
       s.recorded_order_count
FROM customer_order_summary s
LEFT JOIN actual a ON a.customer_id = s.customer_id
WHERE COALESCE(a.actual_order_count, 0) <> s.recorded_order_count
ORDER BY s.customer_id;`,
    pythonReferenceSolution: `actual = {}
for row in data['orders']:
    actual[row['customer_id']] = actual.get(row['customer_id'], 0) + 1
result = []
for row in data['customer_order_summary']:
    actual_count = actual.get(row['customer_id'], 0)
    if actual_count != row['recorded_order_count']:
        result.append({
            'customer_id': row['customer_id'],
            'actual_order_count': actual_count,
            'recorded_order_count': row['recorded_order_count'],
        })
result = sorted(result, key=lambda row: row['customer_id'])`,
    pysparkReferenceSolution: `actual_df = orders_df.groupBy('customer_id').agg(F.count('*').alias('actual_order_count'))
result_df = customer_order_summary_df.join(actual_df, on='customer_id', how='left').fillna({'actual_order_count': 0}).filter(F.col('actual_order_count') != F.col('recorded_order_count')).select('customer_id', 'actual_order_count', 'recorded_order_count').orderBy('customer_id')`,
    pysparkRequirements: [
      { label: "grouping", anyOf: [".groupBy("] },
      { label: "actual count alias", anyOf: ["actual_order_count"] },
      { label: "left join", anyOf: ["how='left'", "how=\"left\"", "left"] },
      { label: "mismatch filter", anyOf: ["recorded_order_count", "!="] },
      { label: "projection", anyOf: [".select("] },
    ],
  },
];

const finishingSeeds: WorldTwoSeed[] = [
  {
    levelNumber: 99,
    category: "normalization",
    title: "Level 99: Normalize active country codes",
    theme: "normalization",
    businessContext: "a clean reference-data join",
    question: "Normalize active raw account country codes with trim and upper, join to the country dimension, and return `account_id`, `country_code`, and `country_name`.",
    tables: [rawAccountsTable, countryDimTable],
    expectedOutput: [
      "Keep only active rows with a valid normalized country code match.",
      "Return columns: account_id, country_code, country_name.",
      "Sort by account_id ascending.",
    ],
    successChecklist: [
      "Normalize before joining.",
      "Filter to active_flag_raw = Y.",
      "Drop blank and unmatched codes.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const countries = mapBy(input.country_dim, "country_code");
      return sortRows(
        input.raw_accounts
          .filter((row) => row.active_flag_raw === "Y")
          .map((row) => {
            const code = normalizeText(row.country_code_raw);
            const country = countries.get(code);
            return country
              ? {
                  account_id: row.account_id,
                  country_code: code,
                  country_name: country.country_name,
                }
              : null;
          })
          .filter(Boolean) as ArcadeRow[],
        [{ column: "account_id", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT r.account_id,
       UPPER(TRIM(r.country_code_raw)) AS country_code,
       d.country_name
FROM raw_accounts r
JOIN country_dim d ON d.country_code = UPPER(TRIM(r.country_code_raw))
WHERE r.active_flag_raw = 'Y'
  AND TRIM(COALESCE(r.country_code_raw, '')) <> ''
ORDER BY r.account_id;`,
    pythonReferenceSolution: `countries = {row['country_code']: row for row in data['country_dim']}
result = []
for row in data['raw_accounts']:
    if row['active_flag_raw'] != 'Y':
        continue
    code = '' if row['country_code_raw'] is None else str(row['country_code_raw']).strip().upper()
    country = countries.get(code)
    if code and country:
        result.append({
            'account_id': row['account_id'],
            'country_code': code,
            'country_name': country['country_name'],
        })
result = sorted(result, key=lambda row: row['account_id'])`,
    pysparkReferenceSolution: `normalized_df = raw_accounts_df.filter(F.col('active_flag_raw') == 'Y').withColumn('country_code', F.upper(F.trim(F.col('country_code_raw'))))
result_df = normalized_df.filter(F.col('country_code') != '').join(country_dim_df, normalized_df.country_code == country_dim_df.country_code, how='inner').select('account_id', 'country_code', 'country_name').orderBy('account_id')`,
    pysparkRequirements: [
      { label: "active filter", anyOf: ["active_flag_raw", "Y"] },
      { label: "normalization", anyOf: ["F.upper(", "F.trim("] },
      { label: "inner join", anyOf: [".join("] },
      { label: "projection", anyOf: [".select("] },
      { label: "country name", anyOf: ["country_name"] },
    ],
  },
  {
    levelNumber: 100,
    category: "debugging",
    title: "Level 100: Fix fulfilled SKU matching",
    theme: "debugging",
    businessContext: "a fulfillment mapping bug",
    question: "Normalize fulfilled raw_sku_text with trim and upper, join to the product map, and return `line_id`, `canonical_sku`, and `category`.",
    tables: [rawSkuLinesTable, productMapTable],
    expectedOutput: [
      "Keep only fulfilled rows with a valid normalized sku match.",
      "Return columns: line_id, canonical_sku, category.",
      "Sort by line_id ascending.",
    ],
    successChecklist: [
      "Normalize before joining to product_map.",
      "Filter to line_status = fulfilled.",
      "Drop unmatched SKU text after normalization.",
    ],
    orderSensitive: true,
    deriveExpected: (input) => {
      const mapping = mapBy(input.product_map, "raw_sku");
      return sortRows(
        input.raw_sku_lines
          .filter((row) => row.line_status === "fulfilled")
          .flatMap((row) => {
            const normalizedSku = normalizeText(row.raw_sku_text);
            const mapped = mapping.get(normalizedSku);
            return mapped
              ? [{ line_id: row.line_id, canonical_sku: mapped.canonical_sku, category: mapped.category }]
              : [];
          }),
        [{ column: "line_id", direction: "asc" }],
      );
    },
    sqlReferenceSolution: `SELECT l.line_id, m.canonical_sku, m.category
FROM raw_sku_lines l
JOIN product_map m ON m.raw_sku = UPPER(TRIM(l.raw_sku_text))
WHERE l.line_status = 'fulfilled'
ORDER BY l.line_id;`,
    pythonReferenceSolution: `mapping = {row['raw_sku']: row for row in data['product_map']}
result = []
for row in data['raw_sku_lines']:
    if row['line_status'] != 'fulfilled':
        continue
    normalized_sku = str(row['raw_sku_text']).strip().upper()
    mapped = mapping.get(normalized_sku)
    if mapped:
        result.append({
            'line_id': row['line_id'],
            'canonical_sku': mapped['canonical_sku'],
            'category': mapped['category'],
        })
result = sorted(result, key=lambda row: row['line_id'])`,
    pysparkReferenceSolution: `normalized_df = raw_sku_lines_df.filter(F.col('line_status') == 'fulfilled').withColumn('normalized_sku', F.upper(F.trim(F.col('raw_sku_text'))))
result_df = normalized_df.join(product_map_df, normalized_df.normalized_sku == product_map_df.raw_sku, how='inner').select('line_id', 'canonical_sku', 'category').orderBy('line_id')`,
    pysparkRequirements: [
      { label: "fulfilled filter", anyOf: ["line_status", "fulfilled"] },
      { label: "normalization", anyOf: ["F.upper(", "F.trim("] },
      { label: "join", anyOf: [".join("] },
      { label: "projection", anyOf: [".select("] },
      { label: "canonical output", anyOf: ["canonical_sku", "category"] },
    ],
  },
];

export const arcadeWorldTwoBundles = [
  ...joinSeeds,
  ...leftJoinSeeds,
  ...metricSeeds,
  ...conditionalSeeds,
  ...dedupeSeeds,
  ...latestRecordSeeds,
  ...dateWindowSeeds,
  ...qualitySeeds,
  ...reconciliationSeeds,
  ...finishingSeeds,
].map((seed) => buildBundle(seed));

if (arcadeWorldTwoBundles.length !== 50) {
  throw new Error(`Arcade World 2 must contain 50 levels. Received ${arcadeWorldTwoBundles.length}.`);
}

export const arcadeWorldTwoBundleMap = new Map(
  arcadeWorldTwoBundles.map((bundle) => [bundle.levelNumber, bundle] as const),
);

export function getArcadeWorldTwoBundle(levelNumber: number) {
  return arcadeWorldTwoBundleMap.get(levelNumber) ?? null;
}
