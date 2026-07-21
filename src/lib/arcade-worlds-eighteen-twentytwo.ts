import {
  baseSeed,
  buildBundle,
  byKey,
  commonChecklist,
  commonExpected,
  daysBetween,
  makePysparkRequirements,
  minutesBetween,
  req,
  sortRows,
  sum,
  table,
  tableRows,
  type AdvancedArcadeCategory,
  type AdvancedArcadeLevelBundle,
  type AdvancedSeed,
  type ArcadePrimitive,
  type ArcadeRow,
  type ArcadeTableFixture,
  type FamilyBuilder,
  type FamilyContext,
  type TablesInput,
} from "@/lib/arcade-worlds-three-seven";

const worldThemeByNumber: Record<number, string> = {
  18: "World 18 advanced SCD and CDC",
  19: "World 19 streaming event validation",
  20: "World 20 warehouse reconciliation",
  21: "World 21 lifecycle analytics",
  22: "World 22 production incident debugging",
};

function dateAdd(base: string, days: number) {
  const date = new Date(`${base}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function timestampAdd(base: string, minutes: number) {
  const date = new Date(`${base}Z`);
  date.setUTCMinutes(date.getUTCMinutes() + minutes);
  return date.toISOString().slice(0, 19);
}

function datePart(value: ArcadePrimitive) {
  return String(value).slice(0, 10);
}

function monthPart(value: ArcadePrimitive) {
  return String(value).slice(0, 7);
}

function buildIncidentTables(context: FamilyContext) {
  const offset = context.levelNumber * 100;
  const variant = context.variant;
  const baseDate = variant % 2 === 0 ? "2026-09-01" : "2026-10-01";
  const watermark = `${dateAdd(baseDate, 5)}T00:00:00`;
  const closeDate = dateAdd(baseDate, 12);
  const dimAccountsRows = [
    { account_sk: offset + 11, account_id: 1, plan: "starter", status: "active", effective_from: dateAdd(baseDate, -40), effective_to: dateAdd(baseDate, -1), is_current: 0 },
    { account_sk: offset + 12, account_id: 1, plan: "pro", status: "active", effective_from: baseDate, effective_to: null, is_current: 1 },
    { account_sk: offset + 21, account_id: 2, plan: "team", status: "active", effective_from: dateAdd(baseDate, -20), effective_to: dateAdd(baseDate, 10), is_current: 1 },
    { account_sk: offset + 22, account_id: 2, plan: "business", status: "active", effective_from: dateAdd(baseDate, 7), effective_to: null, is_current: 1 },
    { account_sk: offset + 31, account_id: 3, plan: "trial", status: "active", effective_from: dateAdd(baseDate, -15), effective_to: dateAdd(baseDate, 4), is_current: 0 },
    { account_sk: offset + 32, account_id: 3, plan: "pro", status: "active", effective_from: dateAdd(baseDate, 5), effective_to: null, is_current: 1 },
    { account_sk: offset + 41, account_id: 4, plan: "starter", status: "inactive", effective_from: dateAdd(baseDate, -30), effective_to: null, is_current: 1 },
  ];
  const accountCdcRows = [
    { change_id: offset + 101, account_id: 1, plan: "pro", status: "active", op: "upsert", event_ts: `${dateAdd(baseDate, 1)}T09:00:00`, processing_ts: `${dateAdd(baseDate, 1)}T09:05:00` },
    { change_id: offset + 102, account_id: 2, plan: "team", status: "active", op: "upsert", event_ts: `${dateAdd(baseDate, 2)}T10:00:00`, processing_ts: `${dateAdd(baseDate, 2)}T10:05:00` },
    { change_id: offset + 103, account_id: 2, plan: "enterprise", status: "active", op: "upsert", event_ts: `${dateAdd(baseDate, 8)}T10:00:00`, processing_ts: `${dateAdd(baseDate, 13)}T10:00:00` },
    { change_id: offset + 104, account_id: 3, plan: "pro", status: "active", op: "upsert", event_ts: `${dateAdd(baseDate, 5)}T11:00:00`, processing_ts: `${dateAdd(baseDate, 5)}T11:02:00` },
    { change_id: offset + 105, account_id: 4, plan: "starter", status: "inactive", op: "delete", event_ts: `${dateAdd(baseDate, 9)}T12:00:00`, processing_ts: `${dateAdd(baseDate, 9)}T12:01:00` },
    { change_id: offset + 106, account_id: 5, plan: "starter", status: "active", op: "upsert", event_ts: `${dateAdd(baseDate, 4)}T08:00:00`, processing_ts: `${dateAdd(baseDate, 7)}T08:00:00` },
  ];
  const lateCorrectionsRows = [
    { correction_id: offset + 151, account_id: 2, corrected_plan: "enterprise", correction_ts: `${dateAdd(baseDate, 15)}T09:00:00`, applies_to_date: dateAdd(baseDate, 7) },
    { correction_id: offset + 152, account_id: 3, corrected_plan: "pro", correction_ts: `${dateAdd(baseDate, 14)}T09:00:00`, applies_to_date: dateAdd(baseDate, 5) },
    { correction_id: offset + 153, account_id: 1, corrected_plan: "pro", correction_ts: `${dateAdd(baseDate, 3)}T09:00:00`, applies_to_date: dateAdd(baseDate, 1) },
  ];
  const sourceOrdersRows = [
    { order_id: offset + 201, account_id: 1, order_ts: `${dateAdd(baseDate, 1)}T10:00:00`, amount: 160 + variant * 6, status: "paid", batch_date: dateAdd(baseDate, 1) },
    { order_id: offset + 202, account_id: 2, order_ts: `${dateAdd(baseDate, 8)}T10:00:00`, amount: 280 + variant * 8, status: "paid", batch_date: dateAdd(baseDate, 8) },
    { order_id: offset + 203, account_id: 2, order_ts: `${dateAdd(baseDate, 9)}T11:00:00`, amount: 95 + variant * 4, status: "refunded", batch_date: dateAdd(baseDate, 9) },
    { order_id: offset + 204, account_id: 3, order_ts: `${dateAdd(baseDate, 6)}T12:00:00`, amount: 340 + variant * 9, status: "paid", batch_date: dateAdd(baseDate, 6) },
    { order_id: offset + 205, account_id: 5, order_ts: `${dateAdd(baseDate, 7)}T13:00:00`, amount: 70 + variant * 3, status: "paid", batch_date: dateAdd(baseDate, 7) },
    { order_id: offset + 206, account_id: 99, order_ts: `${dateAdd(baseDate, 10)}T14:00:00`, amount: 44 + variant, status: "paid", batch_date: dateAdd(baseDate, 10) },
  ];
  const targetOrdersRows = [
    { order_id: offset + 201, account_sk: offset + 12, order_date: dateAdd(baseDate, 1), amount: 160 + variant * 6, status: "paid", batch_date: dateAdd(baseDate, 1) },
    { order_id: offset + 202, account_sk: offset + 21, order_date: dateAdd(baseDate, 8), amount: 281 + variant * 8, status: "paid", batch_date: dateAdd(baseDate, 8) },
    { order_id: offset + 204, account_sk: offset + 32, order_date: dateAdd(baseDate, 6), amount: 340 + variant * 9, status: "paid", batch_date: dateAdd(baseDate, 6) },
    { order_id: offset + 207, account_sk: offset + 999, order_date: dateAdd(baseDate, 11), amount: 12, status: "paid", batch_date: dateAdd(baseDate, 11) },
  ];
  const rejectedRows = [
    { reject_id: offset + 301, source_table: "orders", source_id: String(offset + 203), reason: "refunded_status", batch_date: dateAdd(baseDate, 9) },
    { reject_id: offset + 302, source_table: "orders", source_id: String(offset + 206), reason: "missing_account", batch_date: dateAdd(baseDate, 10) },
    { reject_id: offset + 303, source_table: "accounts", source_id: "2", reason: "overlap_effective_dates", batch_date: dateAdd(baseDate, 11) },
    { reject_id: offset + 304, source_table: "events", source_id: String(offset + 401), reason: "duplicate_event_id", batch_date: dateAdd(baseDate, 12) },
  ];
  const streamEventsRows = [
    { event_id: offset + 401, entity_id: 1, event_type: "view", event_ts: `${baseDate}T09:00:00`, processing_ts: `${baseDate}T09:01:00`, sequence_no: 1, partition_date: baseDate },
    { event_id: offset + 402, entity_id: 1, event_type: "cart", event_ts: timestampAdd(`${baseDate}T09:00:00`, 5), processing_ts: timestampAdd(`${baseDate}T09:00:00`, 6), sequence_no: 2, partition_date: baseDate },
    { event_id: offset + 403, entity_id: 1, event_type: "purchase", event_ts: timestampAdd(`${baseDate}T09:00:00`, 20), processing_ts: timestampAdd(`${baseDate}T09:00:00`, 50), sequence_no: 4, partition_date: baseDate },
    { event_id: offset + 404, entity_id: 1, event_type: "checkout", event_ts: timestampAdd(`${baseDate}T09:00:00`, 14), processing_ts: timestampAdd(`${baseDate}T09:00:00`, 55), sequence_no: 3, partition_date: baseDate },
    { event_id: offset + 405, entity_id: 2, event_type: "view", event_ts: `${dateAdd(baseDate, 2)}T10:00:00`, processing_ts: `${dateAdd(baseDate, 2)}T10:01:00`, sequence_no: 1, partition_date: dateAdd(baseDate, 2) },
    { event_id: offset + 405, entity_id: 2, event_type: "view", event_ts: `${dateAdd(baseDate, 2)}T10:00:00`, processing_ts: `${dateAdd(baseDate, 2)}T10:02:00`, sequence_no: 1, partition_date: dateAdd(baseDate, 2) },
    { event_id: offset + 406, entity_id: 3, event_type: "purchase", event_ts: `${dateAdd(baseDate, 1)}T08:00:00`, processing_ts: `${dateAdd(baseDate, 8)}T08:00:00`, sequence_no: 1, partition_date: dateAdd(baseDate, 8) },
  ];
  const customersRows = [
    { customer_id: 1, signup_date: dateAdd(baseDate, -40), cohort_month: monthPart(dateAdd(baseDate, -40)), status: "active" },
    { customer_id: 2, signup_date: dateAdd(baseDate, -34), cohort_month: monthPart(dateAdd(baseDate, -34)), status: "active" },
    { customer_id: 3, signup_date: dateAdd(baseDate, -25), cohort_month: monthPart(dateAdd(baseDate, -25)), status: "at_risk" },
    { customer_id: 4, signup_date: dateAdd(baseDate, -15), cohort_month: monthPart(dateAdd(baseDate, -15)), status: "inactive" },
  ];
  const lifecycleEventsRows = [
    { customer_id: 1, product_id: 10, event_type: "view", event_ts: `${dateAdd(baseDate, 1)}T09:00:00` },
    { customer_id: 1, product_id: 10, event_type: "trial", event_ts: `${dateAdd(baseDate, 2)}T09:00:00` },
    { customer_id: 1, product_id: 10, event_type: "purchase", event_ts: `${dateAdd(baseDate, 5)}T09:00:00` },
    { customer_id: 1, product_id: 20, event_type: "purchase", event_ts: `${dateAdd(baseDate, 18)}T09:00:00` },
    { customer_id: 2, product_id: 10, event_type: "view", event_ts: `${dateAdd(baseDate, 3)}T10:00:00` },
    { customer_id: 2, product_id: 10, event_type: "trial", event_ts: `${dateAdd(baseDate, 4)}T10:00:00` },
    { customer_id: 2, product_id: 20, event_type: "purchase", event_ts: `${dateAdd(baseDate, -10)}T10:00:00` },
    { customer_id: 3, product_id: 30, event_type: "view", event_ts: `${dateAdd(baseDate, 6)}T11:00:00` },
    { customer_id: 3, product_id: 30, event_type: "purchase", event_ts: `${dateAdd(baseDate, 40)}T11:00:00` },
  ];
  const productSnapshotRows = [
    { product_id: 10, category: "platform", snapshot_date: dateAdd(baseDate, 1), is_active: 1 },
    { product_id: 20, category: "analytics", snapshot_date: dateAdd(baseDate, 1), is_active: 1 },
    { product_id: 30, category: "support", snapshot_date: dateAdd(baseDate, 1), is_active: 0 },
    { product_id: 10, category: "platform", snapshot_date: dateAdd(baseDate, 15), is_active: 0 },
  ];
  const orderItemsRows = [
    { order_id: offset + 201, product_id: 10, quantity: 2, unit_price: 80 + variant * 2 },
    { order_id: offset + 202, product_id: 10, quantity: 1, unit_price: 280 + variant * 8 },
    { order_id: offset + 202, product_id: 20, quantity: 2, unit_price: 40 + variant },
    { order_id: offset + 204, product_id: 30, quantity: 1, unit_price: 340 + variant * 9 },
  ];
  const incidentMetricsRows = [
    { metric_name: "paid_revenue", metric_date: dateAdd(baseDate, 8), expected_value: 280 + variant * 8, actual_value: 361 + variant * 10 },
    { metric_name: "paid_orders", metric_date: dateAdd(baseDate, 8), expected_value: 1, actual_value: 2 },
    { metric_name: "active_products", metric_date: dateAdd(baseDate, 15), expected_value: 2, actual_value: 3 },
  ];

  return {
    watermark,
    closeDate,
    dimAccounts: table("dim_accounts", "dim_accounts_df", [
      { name: "account_sk", type: "INTEGER" },
      { name: "account_id", type: "INTEGER" },
      { name: "plan", type: "TEXT" },
      { name: "status", type: "TEXT" },
      { name: "effective_from", type: "TEXT" },
      { name: "effective_to", type: "TEXT" },
      { name: "is_current", type: "INTEGER" },
    ], dimAccountsRows),
    accountCdc: table("account_cdc", "account_cdc_df", [
      { name: "change_id", type: "INTEGER" },
      { name: "account_id", type: "INTEGER" },
      { name: "plan", type: "TEXT" },
      { name: "status", type: "TEXT" },
      { name: "op", type: "TEXT" },
      { name: "event_ts", type: "TEXT" },
      { name: "processing_ts", type: "TEXT" },
    ], accountCdcRows),
    lateCorrections: table("late_corrections", "late_corrections_df", [
      { name: "correction_id", type: "INTEGER" },
      { name: "account_id", type: "INTEGER" },
      { name: "corrected_plan", type: "TEXT" },
      { name: "correction_ts", type: "TEXT" },
      { name: "applies_to_date", type: "TEXT" },
    ], lateCorrectionsRows),
    sourceOrders: table("source_orders", "source_orders_df", [
      { name: "order_id", type: "INTEGER" },
      { name: "account_id", type: "INTEGER" },
      { name: "order_ts", type: "TEXT" },
      { name: "amount", type: "REAL" },
      { name: "status", type: "TEXT" },
      { name: "batch_date", type: "TEXT" },
    ], sourceOrdersRows),
    targetOrders: table("target_orders", "target_orders_df", [
      { name: "order_id", type: "INTEGER" },
      { name: "account_sk", type: "INTEGER" },
      { name: "order_date", type: "TEXT" },
      { name: "amount", type: "REAL" },
      { name: "status", type: "TEXT" },
      { name: "batch_date", type: "TEXT" },
    ], targetOrdersRows),
    rejectedRecords: table("rejected_records", "rejected_records_df", [
      { name: "reject_id", type: "INTEGER" },
      { name: "source_table", type: "TEXT" },
      { name: "source_id", type: "TEXT" },
      { name: "reason", type: "TEXT" },
      { name: "batch_date", type: "TEXT" },
    ], rejectedRows),
    streamEvents: table("stream_events", "stream_events_df", [
      { name: "event_id", type: "INTEGER" },
      { name: "entity_id", type: "INTEGER" },
      { name: "event_type", type: "TEXT" },
      { name: "event_ts", type: "TEXT" },
      { name: "processing_ts", type: "TEXT" },
      { name: "sequence_no", type: "INTEGER" },
      { name: "partition_date", type: "TEXT" },
    ], streamEventsRows),
    customers: table("customers", "customers_df", [
      { name: "customer_id", type: "INTEGER" },
      { name: "signup_date", type: "TEXT" },
      { name: "cohort_month", type: "TEXT" },
      { name: "status", type: "TEXT" },
    ], customersRows),
    lifecycleEvents: table("lifecycle_events", "lifecycle_events_df", [
      { name: "customer_id", type: "INTEGER" },
      { name: "product_id", type: "INTEGER" },
      { name: "event_type", type: "TEXT" },
      { name: "event_ts", type: "TEXT" },
    ], lifecycleEventsRows),
    productSnapshot: table("product_snapshot", "product_snapshot_df", [
      { name: "product_id", type: "INTEGER" },
      { name: "category", type: "TEXT" },
      { name: "snapshot_date", type: "TEXT" },
      { name: "is_active", type: "INTEGER" },
    ], productSnapshotRows),
    orderItems: table("order_items", "order_items_df", [
      { name: "order_id", type: "INTEGER" },
      { name: "product_id", type: "INTEGER" },
      { name: "quantity", type: "INTEGER" },
      { name: "unit_price", type: "REAL" },
    ], orderItemsRows),
    incidentMetrics: table("incident_metrics", "incident_metrics_df", [
      { name: "metric_name", type: "TEXT" },
      { name: "metric_date", type: "TEXT" },
      { name: "expected_value", type: "REAL" },
      { name: "actual_value", type: "REAL" },
    ], incidentMetricsRows),
  };
}

function seed(
  context: FamilyContext,
  tables: ArcadeTableFixture[],
  category: AdvancedArcadeCategory,
  title: string,
  question: string,
  columns: string[],
  deriveExpected: (input: TablesInput) => ArcadeRow[],
  sqlReferenceSolution: string,
  pythonReferenceSolution: string,
  pysparkReferenceSolution: string,
  pysparkRequirements: AdvancedSeed["pysparkRequirements"],
): AdvancedSeed {
  return baseSeed(context, {
    category,
    title,
    theme: worldThemeByNumber[context.worldNumber] ?? "Advanced Arcade",
    businessContext: "Senior production data-engineering task.",
    question,
    tables,
    expectedOutput: commonExpected(columns),
    successChecklist: commonChecklist(columns),
    orderSensitive: true,
    deriveExpected,
    sqlReferenceSolution,
    pythonReferenceSolution,
    pysparkReferenceSolution,
    pysparkRequirements,
  });
}

function currentRows(input: TablesInput) {
  return tableRows(input, "dim_accounts").filter((row) => row.is_current === 1);
}

function cdcCurrentStateFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["account_id", "plan", "status"];
  return seed(
    context,
    [tables.accountCdc],
    "latest-entity-state",
    "CDC current state reconstruction",
    "Return the latest non-delete CDC state per account.",
    columns,
    (input) => {
      const latest = new Map<ArcadePrimitive, ArcadeRow>();
      for (const row of tableRows(input, "account_cdc")) {
        const prior = latest.get(row.account_id);
        if (!prior || String(row.event_ts) > String(prior.event_ts)) latest.set(row.account_id, row);
      }
      return sortRows([...latest.values()].filter((row) => row.op !== "delete").map((row) => ({ account_id: row.account_id, plan: row.plan, status: row.status })), [["account_id", "asc"]]);
    },
    `WITH ranked AS (
  SELECT account_id, plan, status, op,
         ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY event_ts DESC, change_id DESC) AS rn
  FROM account_cdc
)
SELECT account_id, plan, status
FROM ranked
WHERE rn = 1 AND op <> 'delete'
ORDER BY account_id;`,
    `latest = {}
for row in data['account_cdc']:
    prior = latest.get(row['account_id'])
    if prior is None or (row['event_ts'], row['change_id']) > (prior['event_ts'], prior['change_id']):
        latest[row['account_id']] = row
result = sorted([
    {'account_id': row['account_id'], 'plan': row['plan'], 'status': row['status']}
    for row in latest.values()
    if row['op'] != 'delete'
], key=lambda row: row['account_id'])`,
    `w = Window.partitionBy("account_id").orderBy(F.col("event_ts").desc(), F.col("change_id").desc())
result_df = account_cdc_df.withColumn("rn", F.row_number().over(w)).filter((F.col("rn") == 1) & (F.col("op") != "delete")).select("account_id", "plan", "status").orderBy("account_id")`,
    makePysparkRequirements(req.window, req.rowNumber, req.over, req.withColumn, req.filter, req.select),
  );
}

function pointInTimeAccountLookupFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["order_id", "account_sk", "plan"];
  return seed(
    context,
    [tables.sourceOrders, tables.dimAccounts],
    "latest-entity-state",
    "Point-in-time account lookup",
    "Return paid source orders joined to the account dimension effective on order date.",
    columns,
    (input) => sortRows(tableRows(input, "source_orders").filter((order) => order.status === "paid").map((order) => {
      const orderDate = datePart(order.order_ts);
      const dim = tableRows(input, "dim_accounts").find((row) =>
        row.account_id === order.account_id &&
        String(row.effective_from) <= orderDate &&
        (row.effective_to === null || String(row.effective_to) >= orderDate));
      return dim ? { order_id: order.order_id, account_sk: dim.account_sk, plan: dim.plan } : null;
    }).filter(Boolean) as ArcadeRow[], [["order_id", "asc"]]),
    `SELECT o.order_id, d.account_sk, d.plan
FROM source_orders o
JOIN dim_accounts d
  ON d.account_id = o.account_id
 AND d.effective_from <= SUBSTR(o.order_ts, 1, 10)
 AND (d.effective_to IS NULL OR d.effective_to >= SUBSTR(o.order_ts, 1, 10))
WHERE o.status = 'paid'
ORDER BY o.order_id;`,
    `result = []
for order in data['source_orders']:
    if order['status'] != 'paid':
        continue
    order_date = order['order_ts'][:10]
    for dim in data['dim_accounts']:
        if dim['account_id'] == order['account_id'] and dim['effective_from'] <= order_date and (dim['effective_to'] is None or dim['effective_to'] >= order_date):
            result.append({'order_id': order['order_id'], 'account_sk': dim['account_sk'], 'plan': dim['plan']})
            break
result = sorted(result, key=lambda row: row['order_id'])`,
    `result_df = source_orders_df.filter(F.col("status") == "paid").withColumn("order_date", F.to_date("order_ts")).join(dim_accounts_df, (source_orders_df.account_id == dim_accounts_df.account_id) & (F.col("effective_from") <= F.col("order_date")) & (F.col("effective_to").isNull() | (F.col("effective_to") >= F.col("order_date")))).select("order_id", "account_sk", "plan").orderBy("order_id")`,
    makePysparkRequirements(req.filter, req.withColumn, req.date, req.join, req.select),
  );
}

function lateCorrectionImpactFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["correction_id", "account_id", "corrected_plan"];
  return seed(
    context,
    [tables.lateCorrections],
    "pipeline-debugging",
    `Late corrections after ${tables.closeDate}`,
    `Return corrections posted after ${tables.closeDate} that apply to dates on or before ${tables.closeDate}.`,
    columns,
    (input) => sortRows(tableRows(input, "late_corrections").filter((row) => datePart(row.correction_ts) > tables.closeDate && String(row.applies_to_date) <= tables.closeDate).map((row) => ({ correction_id: row.correction_id, account_id: row.account_id, corrected_plan: row.corrected_plan })), [["correction_id", "asc"]]),
    `SELECT correction_id, account_id, corrected_plan
FROM late_corrections
WHERE SUBSTR(correction_ts, 1, 10) > '${tables.closeDate}'
  AND applies_to_date <= '${tables.closeDate}'
ORDER BY correction_id;`,
    `close_date = '${tables.closeDate}'
result = sorted([
    {'correction_id': row['correction_id'], 'account_id': row['account_id'], 'corrected_plan': row['corrected_plan']}
    for row in data['late_corrections']
    if row['correction_ts'][:10] > close_date and row['applies_to_date'] <= close_date
], key=lambda row: row['correction_id'])`,
    `result_df = late_corrections_df.filter((F.to_date("correction_ts") > F.lit("${tables.closeDate}")) & (F.col("applies_to_date") <= F.lit("${tables.closeDate}"))).select("correction_id", "account_id", "corrected_plan").orderBy("correction_id")`,
    makePysparkRequirements(req.filter, req.date, req.select),
  );
}

function effectiveDateConflictFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["account_id", "left_sk", "right_sk"];
  return seed(
    context,
    [tables.dimAccounts],
    "advanced-validation",
    "Effective-date conflict detection",
    "Return account dimension row pairs whose effective date ranges overlap.",
    columns,
    (input) => {
      const rows = tableRows(input, "dim_accounts");
      const conflicts: ArcadeRow[] = [];
      for (const left of rows) {
        for (const right of rows) {
          if (left.account_id !== right.account_id || Number(left.account_sk) >= Number(right.account_sk)) continue;
          const leftTo = left.effective_to ?? "9999-12-31";
          const rightTo = right.effective_to ?? "9999-12-31";
          if (String(left.effective_from) <= String(rightTo) && String(right.effective_from) <= String(leftTo)) {
            conflicts.push({ account_id: left.account_id, left_sk: left.account_sk, right_sk: right.account_sk });
          }
        }
      }
      return sortRows(conflicts, [["account_id", "asc"], ["left_sk", "asc"]]);
    },
    `SELECT l.account_id, l.account_sk AS left_sk, r.account_sk AS right_sk
FROM dim_accounts l
JOIN dim_accounts r
  ON r.account_id = l.account_id
 AND l.account_sk < r.account_sk
 AND l.effective_from <= COALESCE(r.effective_to, '9999-12-31')
 AND r.effective_from <= COALESCE(l.effective_to, '9999-12-31')
ORDER BY l.account_id, l.account_sk;`,
    `result = []
rows = data['dim_accounts']
for left in rows:
    for right in rows:
        if left['account_id'] == right['account_id'] and left['account_sk'] < right['account_sk']:
            left_to = left['effective_to'] or '9999-12-31'
            right_to = right['effective_to'] or '9999-12-31'
            if left['effective_from'] <= right_to and right['effective_from'] <= left_to:
                result.append({'account_id': left['account_id'], 'left_sk': left['account_sk'], 'right_sk': right['account_sk']})
result = sorted(result, key=lambda row: (row['account_id'], row['left_sk']))`,
    `left_df = dim_accounts_df.alias("l")
right_df = dim_accounts_df.alias("r")
result_df = left_df.join(right_df, (F.col("l.account_id") == F.col("r.account_id")) & (F.col("l.account_sk") < F.col("r.account_sk")) & (F.col("l.effective_from") <= F.coalesce(F.col("r.effective_to"), F.lit("9999-12-31"))) & (F.col("r.effective_from") <= F.coalesce(F.col("l.effective_to"), F.lit("9999-12-31")))).select(F.col("l.account_id").alias("account_id"), F.col("l.account_sk").alias("left_sk"), F.col("r.account_sk").alias("right_sk")).orderBy("account_id", "left_sk")`,
    makePysparkRequirements(req.join, req.coalesce, req.select, req.alias),
  );
}

function cdcVsCurrentDimensionMismatchFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["account_id", "cdc_plan", "dim_plan"];
  return seed(
    context,
    [tables.accountCdc, tables.dimAccounts],
    "source-target-checks",
    "CDC versus current dimension mismatch",
    "Return accounts where latest non-delete CDC plan differs from the current dimension plan.",
    columns,
    (input) => {
      const latest = new Map<ArcadePrimitive, ArcadeRow>();
      for (const row of tableRows(input, "account_cdc").filter((item) => item.op !== "delete")) {
        const prior = latest.get(row.account_id);
        if (!prior || String(row.event_ts) > String(prior.event_ts)) latest.set(row.account_id, row);
      }
      const current = byKey(currentRows(input), "account_id");
      return sortRows([...latest.values()].map((row) => {
        const dim = current.get(row.account_id);
        return dim && dim.plan !== row.plan ? { account_id: row.account_id, cdc_plan: row.plan, dim_plan: dim.plan } : null;
      }).filter(Boolean) as ArcadeRow[], [["account_id", "asc"]]);
    },
    `WITH latest AS (
  SELECT account_id, plan,
         ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY event_ts DESC, change_id DESC) AS rn
  FROM account_cdc
  WHERE op <> 'delete'
)
SELECT l.account_id, l.plan AS cdc_plan, d.plan AS dim_plan
FROM latest l
JOIN dim_accounts d ON d.account_id = l.account_id AND d.is_current = 1
WHERE l.rn = 1 AND l.plan <> d.plan
ORDER BY l.account_id;`,
    `latest = {}
for row in data['account_cdc']:
    if row['op'] != 'delete':
        prior = latest.get(row['account_id'])
        if prior is None or (row['event_ts'], row['change_id']) > (prior['event_ts'], prior['change_id']):
            latest[row['account_id']] = row
current = {row['account_id']: row for row in data['dim_accounts'] if row['is_current'] == 1}
result = sorted([
    {'account_id': row['account_id'], 'cdc_plan': row['plan'], 'dim_plan': current[row['account_id']]['plan']}
    for row in latest.values()
    if row['account_id'] in current and current[row['account_id']]['plan'] != row['plan']
], key=lambda row: row['account_id'])`,
    `w = Window.partitionBy("account_id").orderBy(F.col("event_ts").desc(), F.col("change_id").desc())
latest_df = account_cdc_df.filter(F.col("op") != "delete").withColumn("rn", F.row_number().over(w)).filter(F.col("rn") == 1)
current_dim_df = dim_accounts_df.filter(F.col("is_current") == 1)
result_df = latest_df.join(current_dim_df, "account_id").filter(F.col("account_cdc.plan") != F.col("dim_accounts.plan")).select("account_id", F.col("account_cdc.plan").alias("cdc_plan"), F.col("dim_accounts.plan").alias("dim_plan")).orderBy("account_id")`,
    makePysparkRequirements(req.window, req.rowNumber, req.over, req.filter, req.join, req.select, req.alias),
  );
}

function duplicateEventIdsFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["event_id", "duplicate_rows"];
  return seed(
    context,
    [tables.streamEvents],
    "advanced-validation",
    "Duplicate streaming event IDs",
    "Return event IDs that appear more than once.",
    columns,
    (input) => {
      const counts = new Map<ArcadePrimitive, number>();
      for (const event of tableRows(input, "stream_events")) counts.set(event.event_id, (counts.get(event.event_id) ?? 0) + 1);
      return sortRows([...counts.entries()].filter(([, duplicate_rows]) => duplicate_rows > 1).map(([event_id, duplicate_rows]) => ({ event_id, duplicate_rows })), [["event_id", "asc"]]);
    },
    `SELECT event_id, COUNT(*) AS duplicate_rows
FROM stream_events
GROUP BY event_id
HAVING COUNT(*) > 1
ORDER BY event_id;`,
    `counts = {}
for event in data['stream_events']:
    counts[event['event_id']] = counts.get(event['event_id'], 0) + 1
result = sorted([
    {'event_id': event_id, 'duplicate_rows': count}
    for event_id, count in counts.items()
    if count > 1
], key=lambda row: row['event_id'])`,
    `result_df = stream_events_df.groupBy("event_id").agg(F.count("*").alias("duplicate_rows")).filter(F.col("duplicate_rows") > 1).select("event_id", "duplicate_rows").orderBy("event_id")`,
    makePysparkRequirements(req.group, req.agg, req.alias, req.filter, req.select),
  );
}

function outOfOrderEventTimeFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["event_id", "entity_id", "previous_event_ts"];
  return seed(
    context,
    [tables.streamEvents],
    "window-logic",
    "Out-of-order event-time records",
    "Return events whose event_ts is earlier than the previous event by processing order.",
    columns,
    (input) => {
      const events = sortRows(tableRows(input, "stream_events"), [["entity_id", "asc"], ["processing_ts", "asc"], ["event_id", "asc"]]);
      const prior = new Map<ArcadePrimitive, ArcadeRow>();
      const rows: ArcadeRow[] = [];
      for (const event of events) {
        const prev = prior.get(event.entity_id);
        if (prev && String(event.event_ts) < String(prev.event_ts)) rows.push({ event_id: event.event_id, entity_id: event.entity_id, previous_event_ts: prev.event_ts });
        prior.set(event.entity_id, event);
      }
      return rows;
    },
    `WITH ordered AS (
  SELECT event_id, entity_id, event_ts,
         LAG(event_ts) OVER (PARTITION BY entity_id ORDER BY processing_ts, event_id) AS previous_event_ts
  FROM stream_events
)
SELECT event_id, entity_id, previous_event_ts
FROM ordered
WHERE previous_event_ts IS NOT NULL AND event_ts < previous_event_ts
ORDER BY entity_id, event_id;`,
    `prior = {}
result = []
for event in sorted(data['stream_events'], key=lambda row: (row['entity_id'], row['processing_ts'], row['event_id'])):
    previous = prior.get(event['entity_id'])
    if previous and event['event_ts'] < previous['event_ts']:
        result.append({'event_id': event['event_id'], 'entity_id': event['entity_id'], 'previous_event_ts': previous['event_ts']})
    prior[event['entity_id']] = event`,
    `w = Window.partitionBy("entity_id").orderBy("processing_ts", "event_id")
result_df = stream_events_df.withColumn("previous_event_ts", F.lag("event_ts").over(w)).filter(F.col("previous_event_ts").isNotNull() & (F.col("event_ts") < F.col("previous_event_ts"))).select("event_id", "entity_id", "previous_event_ts").orderBy("entity_id", "event_id")`,
    makePysparkRequirements(req.window, req.over, req.withColumn, req.filter, req.select),
  );
}

function watermarkLateEventFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["event_id", "event_ts", "processing_ts"];
  return seed(
    context,
    [tables.streamEvents],
    "anomaly-detection",
    `Watermark-late events after ${tables.watermark}`,
    `Return events with event_ts on or before ${tables.watermark} but processing_ts after it.`,
    columns,
    (input) => sortRows(tableRows(input, "stream_events").filter((event) => String(event.event_ts) <= tables.watermark && String(event.processing_ts) > tables.watermark).map((event) => ({ event_id: event.event_id, event_ts: event.event_ts, processing_ts: event.processing_ts })), [["event_id", "asc"]]),
    `SELECT event_id, event_ts, processing_ts
FROM stream_events
WHERE event_ts <= '${tables.watermark}' AND processing_ts > '${tables.watermark}'
ORDER BY event_id;`,
    `watermark = '${tables.watermark}'
result = sorted([
    {'event_id': event['event_id'], 'event_ts': event['event_ts'], 'processing_ts': event['processing_ts']}
    for event in data['stream_events']
    if event['event_ts'] <= watermark and event['processing_ts'] > watermark
], key=lambda row: row['event_id'])`,
    `result_df = stream_events_df.filter((F.col("event_ts") <= F.lit("${tables.watermark}")) & (F.col("processing_ts") > F.lit("${tables.watermark}"))).select("event_id", "event_ts", "processing_ts").orderBy("event_id")`,
    makePysparkRequirements(req.filter, req.select),
  );
}

function eventProcessingLagFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const maxMinutes = 90 + context.variant * 5;
  const columns = ["event_id", "lag_minutes"];
  return seed(
    context,
    [tables.streamEvents],
    `anomaly-detection`,
    `Processing lag over ${maxMinutes} minutes`,
    `Return events whose processing lag is greater than ${maxMinutes} minutes.`,
    columns,
    (input) => sortRows(tableRows(input, "stream_events").map((event) => {
      const lag = minutesBetween(event.event_ts, event.processing_ts);
      return lag !== null && lag > maxMinutes ? { event_id: event.event_id, lag_minutes: lag } : null;
    }).filter(Boolean) as ArcadeRow[], [["event_id", "asc"]]),
    `SELECT event_id,
       CAST((julianday(processing_ts) - julianday(event_ts)) * 24 * 60 AS INTEGER) AS lag_minutes
FROM stream_events
WHERE (julianday(processing_ts) - julianday(event_ts)) * 24 * 60 > ${maxMinutes}
ORDER BY event_id;`,
    `from datetime import datetime
result = []
for event in data['stream_events']:
    lag = int((datetime.fromisoformat(event['processing_ts']) - datetime.fromisoformat(event['event_ts'])).total_seconds() / 60)
    if lag > ${maxMinutes}:
        result.append({'event_id': event['event_id'], 'lag_minutes': lag})
result = sorted(result, key=lambda row: row['event_id'])`,
    `result_df = stream_events_df.withColumn("lag_minutes", ((F.unix_timestamp("processing_ts") - F.unix_timestamp("event_ts")) / 60).cast("int")).filter(F.col("lag_minutes") > ${maxMinutes}).select("event_id", "lag_minutes").orderBy("event_id")`,
    makePysparkRequirements(req.withColumn, req.filter, req.select),
  );
}

function latestEventBeforeWatermarkFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["entity_id", "event_type", "event_ts"];
  return seed(
    context,
    [tables.streamEvents],
    "latest-entity-state",
    "Latest event-time state before watermark",
    "Return the latest event by event time per entity before the watermark.",
    columns,
    (input) => {
      const latest = new Map<ArcadePrimitive, ArcadeRow>();
      for (const event of tableRows(input, "stream_events").filter((row) => String(row.event_ts) <= tables.watermark)) {
        const prior = latest.get(event.entity_id);
        if (!prior || String(event.event_ts) > String(prior.event_ts)) latest.set(event.entity_id, event);
      }
      return sortRows([...latest.values()].map((event) => ({ entity_id: event.entity_id, event_type: event.event_type, event_ts: event.event_ts })), [["entity_id", "asc"]]);
    },
    `WITH ranked AS (
  SELECT entity_id, event_type, event_ts,
         ROW_NUMBER() OVER (PARTITION BY entity_id ORDER BY event_ts DESC, event_id DESC) AS rn
  FROM stream_events
  WHERE event_ts <= '${tables.watermark}'
)
SELECT entity_id, event_type, event_ts
FROM ranked
WHERE rn = 1
ORDER BY entity_id;`,
    `latest = {}
for event in data['stream_events']:
    if event['event_ts'] <= '${tables.watermark}':
        prior = latest.get(event['entity_id'])
        if prior is None or (event['event_ts'], event['event_id']) > (prior['event_ts'], prior['event_id']):
            latest[event['entity_id']] = event
result = sorted([
    {'entity_id': event['entity_id'], 'event_type': event['event_type'], 'event_ts': event['event_ts']}
    for event in latest.values()
], key=lambda row: row['entity_id'])`,
    `w = Window.partitionBy("entity_id").orderBy(F.col("event_ts").desc(), F.col("event_id").desc())
result_df = stream_events_df.filter(F.col("event_ts") <= F.lit("${tables.watermark}")).withColumn("rn", F.row_number().over(w)).filter(F.col("rn") == 1).select("entity_id", "event_type", "event_ts").orderBy("entity_id")`,
    makePysparkRequirements(req.window, req.rowNumber, req.over, req.filter, req.withColumn, req.select),
  );
}

function rowCountReconciliationFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["batch_date", "source_rows", "target_rows", "row_gap"];
  return seed(
    context,
    [tables.sourceOrders, tables.targetOrders],
    "source-target-checks",
    "Source-to-target row count gaps",
    "Return batch dates where source and target order row counts differ.",
    columns,
    (input) => {
      const source = new Map<string, number>();
      const target = new Map<string, number>();
      for (const row of tableRows(input, "source_orders")) source.set(String(row.batch_date), (source.get(String(row.batch_date)) ?? 0) + 1);
      for (const row of tableRows(input, "target_orders")) target.set(String(row.batch_date), (target.get(String(row.batch_date)) ?? 0) + 1);
      const dates = new Set([...source.keys(), ...target.keys()]);
      return sortRows([...dates].map((batch_date) => ({ batch_date, source_rows: source.get(batch_date) ?? 0, target_rows: target.get(batch_date) ?? 0, row_gap: (source.get(batch_date) ?? 0) - (target.get(batch_date) ?? 0) })).filter((row) => row.row_gap !== 0), [["batch_date", "asc"]]);
    },
    `WITH source_counts AS (
  SELECT batch_date, COUNT(*) AS source_rows FROM source_orders GROUP BY batch_date
),
target_counts AS (
  SELECT batch_date, COUNT(*) AS target_rows FROM target_orders GROUP BY batch_date
),
dates AS (
  SELECT batch_date FROM source_counts UNION SELECT batch_date FROM target_counts
)
SELECT d.batch_date, COALESCE(s.source_rows, 0) AS source_rows,
       COALESCE(t.target_rows, 0) AS target_rows,
       COALESCE(s.source_rows, 0) - COALESCE(t.target_rows, 0) AS row_gap
FROM dates d
LEFT JOIN source_counts s ON s.batch_date = d.batch_date
LEFT JOIN target_counts t ON t.batch_date = d.batch_date
WHERE COALESCE(s.source_rows, 0) <> COALESCE(t.target_rows, 0)
ORDER BY d.batch_date;`,
    `source = {}
target = {}
for row in data['source_orders']:
    source[row['batch_date']] = source.get(row['batch_date'], 0) + 1
for row in data['target_orders']:
    target[row['batch_date']] = target.get(row['batch_date'], 0) + 1
result = sorted([
    {'batch_date': batch_date, 'source_rows': source.get(batch_date, 0), 'target_rows': target.get(batch_date, 0), 'row_gap': source.get(batch_date, 0) - target.get(batch_date, 0)}
    for batch_date in set(source) | set(target)
    if source.get(batch_date, 0) != target.get(batch_date, 0)
], key=lambda row: row['batch_date'])`,
    `source_counts_df = source_orders_df.groupBy("batch_date").agg(F.count("*").alias("source_rows"))
target_counts_df = target_orders_df.groupBy("batch_date").agg(F.count("*").alias("target_rows"))
result_df = source_counts_df.join(target_counts_df, "batch_date", "full").fillna(0, subset=["source_rows", "target_rows"]).withColumn("row_gap", F.col("source_rows") - F.col("target_rows")).filter(F.col("row_gap") != 0).select("batch_date", "source_rows", "target_rows", "row_gap").orderBy("batch_date")`,
    makePysparkRequirements(req.group, req.agg, req.join, req.coalesce, req.withColumn, req.filter, req.select),
  );
}

function aggregateBalanceCheckFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["order_date", "source_amount", "target_amount", "amount_gap"];
  return seed(
    context,
    [tables.sourceOrders, tables.targetOrders],
    "metric-investigation",
    "Aggregate paid amount balance",
    "Return order dates where paid source amount differs from target amount.",
    columns,
    (input) => {
      const source = new Map<string, number>();
      const target = new Map<string, number>();
      for (const row of tableRows(input, "source_orders").filter((item) => item.status === "paid")) source.set(datePart(row.order_ts), (source.get(datePart(row.order_ts)) ?? 0) + Number(row.amount));
      for (const row of tableRows(input, "target_orders").filter((item) => item.status === "paid")) target.set(String(row.order_date), (target.get(String(row.order_date)) ?? 0) + Number(row.amount));
      const dates = new Set([...source.keys(), ...target.keys()]);
      return sortRows([...dates].map((order_date) => ({ order_date, source_amount: sum([source.get(order_date) ?? 0]), target_amount: sum([target.get(order_date) ?? 0]), amount_gap: sum([(source.get(order_date) ?? 0) - (target.get(order_date) ?? 0)]) })).filter((row) => row.amount_gap !== 0), [["order_date", "asc"]]);
    },
    `WITH source_amounts AS (
  SELECT SUBSTR(order_ts, 1, 10) AS order_date, SUM(amount) AS source_amount
  FROM source_orders
  WHERE status = 'paid'
  GROUP BY SUBSTR(order_ts, 1, 10)
),
target_amounts AS (
  SELECT order_date, SUM(amount) AS target_amount
  FROM target_orders
  WHERE status = 'paid'
  GROUP BY order_date
),
dates AS (
  SELECT order_date FROM source_amounts UNION SELECT order_date FROM target_amounts
)
SELECT d.order_date, COALESCE(s.source_amount, 0) AS source_amount,
       COALESCE(t.target_amount, 0) AS target_amount,
       ROUND(COALESCE(s.source_amount, 0) - COALESCE(t.target_amount, 0), 2) AS amount_gap
FROM dates d
LEFT JOIN source_amounts s ON s.order_date = d.order_date
LEFT JOIN target_amounts t ON t.order_date = d.order_date
WHERE ROUND(COALESCE(s.source_amount, 0) - COALESCE(t.target_amount, 0), 2) <> 0
ORDER BY d.order_date;`,
    `source = {}
target = {}
for row in data['source_orders']:
    if row['status'] == 'paid':
        order_date = row['order_ts'][:10]
        source[order_date] = source.get(order_date, 0) + row['amount']
for row in data['target_orders']:
    if row['status'] == 'paid':
        target[row['order_date']] = target.get(row['order_date'], 0) + row['amount']
result = sorted([
    {'order_date': order_date, 'source_amount': round(source.get(order_date, 0), 2), 'target_amount': round(target.get(order_date, 0), 2), 'amount_gap': round(source.get(order_date, 0) - target.get(order_date, 0), 2)}
    for order_date in set(source) | set(target)
    if round(source.get(order_date, 0) - target.get(order_date, 0), 2) != 0
], key=lambda row: row['order_date'])`,
    `source_amounts_df = source_orders_df.filter(F.col("status") == "paid").withColumn("order_date", F.to_date("order_ts")).groupBy("order_date").agg(F.sum("amount").alias("source_amount"))
target_amounts_df = target_orders_df.filter(F.col("status") == "paid").groupBy("order_date").agg(F.sum("amount").alias("target_amount"))
result_df = source_amounts_df.join(target_amounts_df, "order_date", "full").fillna(0, subset=["source_amount", "target_amount"]).withColumn("amount_gap", F.round(F.col("source_amount") - F.col("target_amount"), 2)).filter(F.col("amount_gap") != 0).select("order_date", "source_amount", "target_amount", "amount_gap").orderBy("order_date")`,
    makePysparkRequirements(req.filter, req.withColumn, req.date, req.group, req.agg, req.join, req.coalesce, req.select),
  );
}

function orphanDimensionKeyFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["order_id", "account_sk"];
  return seed(
    context,
    [tables.targetOrders, tables.dimAccounts],
    "source-target-checks",
    "Orphan target dimension keys",
    "Return target orders whose account_sk is missing from dim_accounts.",
    columns,
    (input) => {
      const dimKeys = new Set(tableRows(input, "dim_accounts").map((row) => row.account_sk));
      return sortRows(tableRows(input, "target_orders").filter((row) => !dimKeys.has(row.account_sk)).map((row) => ({ order_id: row.order_id, account_sk: row.account_sk })), [["order_id", "asc"]]);
    },
    `SELECT t.order_id, t.account_sk
FROM target_orders t
LEFT JOIN dim_accounts d ON d.account_sk = t.account_sk
WHERE d.account_sk IS NULL
ORDER BY t.order_id;`,
    `dim_keys = {row['account_sk'] for row in data['dim_accounts']}
result = sorted([
    {'order_id': row['order_id'], 'account_sk': row['account_sk']}
    for row in data['target_orders']
    if row['account_sk'] not in dim_keys
], key=lambda row: row['order_id'])`,
    `result_df = target_orders_df.join(dim_accounts_df.select("account_sk"), "account_sk", "left_anti").select("order_id", "account_sk").orderBy("order_id")`,
    makePysparkRequirements(req.join, req.select),
  );
}

function missingTargetOrderFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["order_id", "account_id"];
  return seed(
    context,
    [tables.sourceOrders, tables.targetOrders],
    "source-target-checks",
    "Paid source orders missing target",
    "Return paid source orders that are missing from target_orders.",
    columns,
    (input) => {
      const targetIds = new Set(tableRows(input, "target_orders").map((row) => row.order_id));
      return sortRows(tableRows(input, "source_orders").filter((row) => row.status === "paid" && !targetIds.has(row.order_id)).map((row) => ({ order_id: row.order_id, account_id: row.account_id })), [["order_id", "asc"]]);
    },
    `SELECT s.order_id, s.account_id
FROM source_orders s
LEFT JOIN target_orders t ON t.order_id = s.order_id
WHERE s.status = 'paid' AND t.order_id IS NULL
ORDER BY s.order_id;`,
    `target_ids = {row['order_id'] for row in data['target_orders']}
result = sorted([
    {'order_id': row['order_id'], 'account_id': row['account_id']}
    for row in data['source_orders']
    if row['status'] == 'paid' and row['order_id'] not in target_ids
], key=lambda row: row['order_id'])`,
    `result_df = source_orders_df.filter(F.col("status") == "paid").join(target_orders_df.select("order_id"), "order_id", "left_anti").select("order_id", "account_id").orderBy("order_id")`,
    makePysparkRequirements(req.filter, req.join, req.select),
  );
}

function rejectedReasonAnalysisFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["reason", "rejected_rows"];
  return seed(
    context,
    [tables.rejectedRecords],
    "quality-gates",
    "Rejected-record reason counts",
    "Return rejected record counts by reason.",
    columns,
    (input) => {
      const counts = new Map<string, number>();
      for (const row of tableRows(input, "rejected_records")) counts.set(String(row.reason), (counts.get(String(row.reason)) ?? 0) + 1);
      return sortRows([...counts.entries()].map(([reason, rejected_rows]) => ({ reason, rejected_rows })), [["reason", "asc"]]);
    },
    `SELECT reason, COUNT(*) AS rejected_rows
FROM rejected_records
GROUP BY reason
ORDER BY reason;`,
    `counts = {}
for row in data['rejected_records']:
    counts[row['reason']] = counts.get(row['reason'], 0) + 1
result = sorted([
    {'reason': reason, 'rejected_rows': count}
    for reason, count in counts.items()
], key=lambda row: row['reason'])`,
    `result_df = rejected_records_df.groupBy("reason").agg(F.count("*").alias("rejected_rows")).select("reason", "rejected_rows").orderBy("reason")`,
    makePysparkRequirements(req.group, req.agg, req.alias, req.select),
  );
}

function funnelDropoffFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["stage", "customer_count"];
  return seed(
    context,
    [tables.lifecycleEvents],
    "customer-lifecycle",
    "Funnel stage customer counts",
    "Return distinct customer counts for view, trial, and purchase stages.",
    columns,
    (input) => {
      const stages = ["view", "trial", "purchase"];
      return stages.map((stage) => ({ stage, customer_count: new Set(tableRows(input, "lifecycle_events").filter((event) => event.event_type === stage).map((event) => event.customer_id)).size }));
    },
    `SELECT 'view' AS stage, COUNT(DISTINCT customer_id) AS customer_count FROM lifecycle_events WHERE event_type = 'view'
UNION ALL
SELECT 'trial' AS stage, COUNT(DISTINCT customer_id) AS customer_count FROM lifecycle_events WHERE event_type = 'trial'
UNION ALL
SELECT 'purchase' AS stage, COUNT(DISTINCT customer_id) AS customer_count FROM lifecycle_events WHERE event_type = 'purchase';`,
    `stages = ['view', 'trial', 'purchase']
result = [
    {'stage': stage, 'customer_count': len({event['customer_id'] for event in data['lifecycle_events'] if event['event_type'] == stage})}
    for stage in stages
]`,
    `result_df = lifecycle_events_df.filter(F.col("event_type").isin("view", "trial", "purchase")).groupBy("event_type").agg(F.countDistinct("customer_id").alias("customer_count")).select(F.col("event_type").alias("stage"), "customer_count")`,
    makePysparkRequirements(req.filter, req.group, req.agg, req.alias, req.select),
  );
}

function repeatPurchaseDetectionFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["customer_id", "purchase_days"];
  return seed(
    context,
    [tables.lifecycleEvents],
    "customer-lifecycle",
    "Repeat purchase customers",
    "Return customers with purchases on at least two distinct days.",
    columns,
    (input) => {
      const days = new Map<ArcadePrimitive, Set<string>>();
      for (const event of tableRows(input, "lifecycle_events").filter((row) => row.event_type === "purchase")) {
        days.set(event.customer_id, (days.get(event.customer_id) ?? new Set()).add(datePart(event.event_ts)));
      }
      return sortRows([...days.entries()].filter(([, values]) => values.size >= 2).map(([customer_id, values]) => ({ customer_id, purchase_days: values.size })), [["customer_id", "asc"]]);
    },
    `SELECT customer_id, COUNT(DISTINCT SUBSTR(event_ts, 1, 10)) AS purchase_days
FROM lifecycle_events
WHERE event_type = 'purchase'
GROUP BY customer_id
HAVING COUNT(DISTINCT SUBSTR(event_ts, 1, 10)) >= 2
ORDER BY customer_id;`,
    `days = {}
for event in data['lifecycle_events']:
    if event['event_type'] == 'purchase':
        days.setdefault(event['customer_id'], set()).add(event['event_ts'][:10])
result = sorted([
    {'customer_id': customer_id, 'purchase_days': len(values)}
    for customer_id, values in days.items()
    if len(values) >= 2
], key=lambda row: row['customer_id'])`,
    `result_df = lifecycle_events_df.filter(F.col("event_type") == "purchase").withColumn("purchase_date", F.to_date("event_ts")).groupBy("customer_id").agg(F.countDistinct("purchase_date").alias("purchase_days")).filter(F.col("purchase_days") >= 2).select("customer_id", "purchase_days").orderBy("customer_id")`,
    makePysparkRequirements(req.filter, req.withColumn, req.date, req.group, req.agg, req.select),
  );
}

function cohortRetentionSummaryFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const retentionDays = 30 + (context.variant % 2) * 15;
  const columns = ["cohort_month", "retained_customers"];
  return seed(
    context,
    [tables.customers, tables.lifecycleEvents],
    "cohort-retention",
    `Cohort retention within ${retentionDays} days`,
    `Return customers with a purchase within ${retentionDays} days of signup by cohort month.`,
    columns,
    (input) => {
      const customers = byKey(tableRows(input, "customers"), "customer_id");
      const retained = new Map<string, Set<ArcadePrimitive>>();
      for (const event of tableRows(input, "lifecycle_events").filter((row) => row.event_type === "purchase")) {
        const customer = customers.get(event.customer_id);
        const days = customer ? daysBetween(customer.signup_date, event.event_ts) : null;
        if (customer && days !== null && days <= retentionDays) {
          retained.set(String(customer.cohort_month), (retained.get(String(customer.cohort_month)) ?? new Set()).add(event.customer_id));
        }
      }
      return sortRows([...retained.entries()].map(([cohort_month, ids]) => ({ cohort_month, retained_customers: ids.size })), [["cohort_month", "asc"]]);
    },
    `SELECT c.cohort_month, COUNT(DISTINCT e.customer_id) AS retained_customers
FROM customers c
JOIN lifecycle_events e ON e.customer_id = c.customer_id
WHERE e.event_type = 'purchase'
  AND julianday(e.event_ts) - julianday(c.signup_date) <= ${retentionDays}
GROUP BY c.cohort_month
ORDER BY c.cohort_month;`,
    `from datetime import datetime
customers = {row['customer_id']: row for row in data['customers']}
retained = {}
for event in data['lifecycle_events']:
    if event['event_type'] == 'purchase' and event['customer_id'] in customers:
        customer = customers[event['customer_id']]
        days = (datetime.fromisoformat(event['event_ts']) - datetime.fromisoformat(customer['signup_date'])).total_seconds() / 86400
        if days <= ${retentionDays}:
            retained.setdefault(customer['cohort_month'], set()).add(event['customer_id'])
result = sorted([
    {'cohort_month': month, 'retained_customers': len(ids)}
    for month, ids in retained.items()
], key=lambda row: row['cohort_month'])`,
    `result_df = customers_df.join(lifecycle_events_df, "customer_id").filter(F.col("event_type") == "purchase").withColumn("days_to_purchase", F.datediff(F.to_date("event_ts"), F.to_date("signup_date"))).filter(F.col("days_to_purchase") <= ${retentionDays}).groupBy("cohort_month").agg(F.countDistinct("customer_id").alias("retained_customers")).select("cohort_month", "retained_customers").orderBy("cohort_month")`,
    makePysparkRequirements(req.join, req.filter, req.withColumn, req.date, req.group, req.agg, req.select),
  );
}

function churnRiskIndicatorFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const cutoffDate = dateAdd(context.variant % 2 === 0 ? "2026-09-01" : "2026-10-01", 25);
  const columns = ["customer_id", "last_purchase_date"];
  return seed(
    context,
    [tables.customers, tables.lifecycleEvents],
    "customer-lifecycle",
    `Churn risk before ${cutoffDate}`,
    `Return active customers whose last purchase date is before ${cutoffDate}.`,
    columns,
    (input) => {
      const last = new Map<ArcadePrimitive, string>();
      for (const event of tableRows(input, "lifecycle_events").filter((row) => row.event_type === "purchase")) {
        const day = datePart(event.event_ts);
        if (!last.get(event.customer_id) || day > String(last.get(event.customer_id))) last.set(event.customer_id, day);
      }
      return sortRows(tableRows(input, "customers").filter((customer) => customer.status === "active" && last.has(customer.customer_id) && String(last.get(customer.customer_id)) < cutoffDate).map((customer) => ({ customer_id: customer.customer_id, last_purchase_date: last.get(customer.customer_id) ?? null })), [["customer_id", "asc"]]);
    },
    `WITH last_purchase AS (
  SELECT customer_id, MAX(SUBSTR(event_ts, 1, 10)) AS last_purchase_date
  FROM lifecycle_events
  WHERE event_type = 'purchase'
  GROUP BY customer_id
)
SELECT c.customer_id, l.last_purchase_date
FROM customers c
JOIN last_purchase l ON l.customer_id = c.customer_id
WHERE c.status = 'active' AND l.last_purchase_date < '${cutoffDate}'
ORDER BY c.customer_id;`,
    `last = {}
for event in data['lifecycle_events']:
    if event['event_type'] == 'purchase':
        day = event['event_ts'][:10]
        if event['customer_id'] not in last or day > last[event['customer_id']]:
            last[event['customer_id']] = day
result = sorted([
    {'customer_id': customer['customer_id'], 'last_purchase_date': last[customer['customer_id']]}
    for customer in data['customers']
    if customer['status'] == 'active' and customer['customer_id'] in last and last[customer['customer_id']] < '${cutoffDate}'
], key=lambda row: row['customer_id'])`,
    `last_purchase_df = lifecycle_events_df.filter(F.col("event_type") == "purchase").withColumn("purchase_date", F.to_date("event_ts")).groupBy("customer_id").agg(F.max("purchase_date").alias("last_purchase_date"))
result_df = customers_df.join(last_purchase_df, "customer_id").filter((F.col("status") == "active") & (F.col("last_purchase_date") < F.lit("${cutoffDate}"))).select("customer_id", "last_purchase_date").orderBy("customer_id")`,
    makePysparkRequirements(req.filter, req.withColumn, req.date, req.group, req.agg, req.join, req.select),
  );
}

function inactiveProductPurchaseFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["customer_id", "product_id"];
  return seed(
    context,
    [tables.lifecycleEvents, tables.productSnapshot],
    "advanced-validation",
    "Inactive product purchase leakage",
    "Return purchases for products marked inactive in the latest product snapshot.",
    columns,
    (input) => {
      const latest = new Map<ArcadePrimitive, ArcadeRow>();
      for (const product of tableRows(input, "product_snapshot")) {
        const prior = latest.get(product.product_id);
        if (!prior || String(product.snapshot_date) > String(prior.snapshot_date)) latest.set(product.product_id, product);
      }
      return sortRows(tableRows(input, "lifecycle_events").filter((event) => event.event_type === "purchase" && latest.get(event.product_id)?.is_active === 0).map((event) => ({ customer_id: event.customer_id, product_id: event.product_id })), [["customer_id", "asc"], ["product_id", "asc"]]);
    },
    `WITH latest_product AS (
  SELECT product_id, is_active,
         ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY snapshot_date DESC) AS rn
  FROM product_snapshot
)
SELECT e.customer_id, e.product_id
FROM lifecycle_events e
JOIN latest_product p ON p.product_id = e.product_id AND p.rn = 1
WHERE e.event_type = 'purchase' AND p.is_active = 0
ORDER BY e.customer_id, e.product_id;`,
    `latest = {}
for product in data['product_snapshot']:
    prior = latest.get(product['product_id'])
    if prior is None or product['snapshot_date'] > prior['snapshot_date']:
        latest[product['product_id']] = product
result = sorted([
    {'customer_id': event['customer_id'], 'product_id': event['product_id']}
    for event in data['lifecycle_events']
    if event['event_type'] == 'purchase' and latest.get(event['product_id'], {}).get('is_active') == 0
], key=lambda row: (row['customer_id'], row['product_id']))`,
    `w = Window.partitionBy("product_id").orderBy(F.col("snapshot_date").desc())
latest_product_df = product_snapshot_df.withColumn("rn", F.row_number().over(w)).filter(F.col("rn") == 1)
result_df = lifecycle_events_df.join(latest_product_df, "product_id").filter((F.col("event_type") == "purchase") & (F.col("is_active") == 0)).select("customer_id", "product_id").orderBy("customer_id", "product_id")`,
    makePysparkRequirements(req.window, req.rowNumber, req.over, req.withColumn, req.filter, req.join, req.select),
  );
}

function incorrectAggregationGrainIncidentFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["order_id", "order_amount", "item_amount", "amount_gap"];
  return seed(
    context,
    [tables.sourceOrders, tables.orderItems],
    "bad-join-debugging",
    "Order versus item grain mismatch",
    "Return paid orders where item total does not match order amount.",
    columns,
    (input) => {
      const itemTotals = new Map<ArcadePrimitive, number>();
      for (const item of tableRows(input, "order_items")) itemTotals.set(item.order_id, (itemTotals.get(item.order_id) ?? 0) + Number(item.quantity) * Number(item.unit_price));
      return sortRows(tableRows(input, "source_orders").filter((order) => order.status === "paid").map((order) => {
        const itemAmount = sum([itemTotals.get(order.order_id) ?? 0]);
        const gap = sum([Number(order.amount) - itemAmount]);
        return gap !== 0 ? { order_id: order.order_id, order_amount: order.amount, item_amount: itemAmount, amount_gap: gap } : null;
      }).filter(Boolean) as ArcadeRow[], [["order_id", "asc"]]);
    },
    `WITH item_totals AS (
  SELECT order_id, SUM(quantity * unit_price) AS item_amount
  FROM order_items
  GROUP BY order_id
)
SELECT o.order_id, o.amount AS order_amount, COALESCE(i.item_amount, 0) AS item_amount,
       ROUND(o.amount - COALESCE(i.item_amount, 0), 2) AS amount_gap
FROM source_orders o
LEFT JOIN item_totals i ON i.order_id = o.order_id
WHERE o.status = 'paid' AND ROUND(o.amount - COALESCE(i.item_amount, 0), 2) <> 0
ORDER BY o.order_id;`,
    `item_totals = {}
for item in data['order_items']:
    item_totals[item['order_id']] = item_totals.get(item['order_id'], 0) + item['quantity'] * item['unit_price']
result = []
for order in data['source_orders']:
    if order['status'] == 'paid':
        item_amount = round(item_totals.get(order['order_id'], 0), 2)
        gap = round(order['amount'] - item_amount, 2)
        if gap != 0:
            result.append({'order_id': order['order_id'], 'order_amount': order['amount'], 'item_amount': item_amount, 'amount_gap': gap})
result = sorted(result, key=lambda row: row['order_id'])`,
    `item_totals_df = order_items_df.groupBy("order_id").agg(F.sum(F.col("quantity") * F.col("unit_price")).alias("item_amount"))
result_df = source_orders_df.join(item_totals_df, "order_id", "left").withColumn("item_amount", F.coalesce(F.col("item_amount"), F.lit(0))).withColumn("amount_gap", F.round(F.col("amount") - F.col("item_amount"), 2)).filter((F.col("status") == "paid") & (F.col("amount_gap") != 0)).select("order_id", F.col("amount").alias("order_amount"), "item_amount", "amount_gap").orderBy("order_id")`,
    makePysparkRequirements(req.group, req.agg, req.join, req.coalesce, req.withColumn, req.filter, req.select, req.alias),
  );
}

function joinInflationIncidentFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["order_id", "item_rows", "dim_rows", "inflated_rows"];
  return seed(
    context,
    [tables.orderItems, tables.dimAccounts, tables.sourceOrders],
    "bad-join-debugging",
    "Join inflation row detector",
    "Return orders where joining items to all account dimension rows inflates row count.",
    columns,
    (input) => {
      const orders = byKey(tableRows(input, "source_orders"), "order_id");
      const itemCounts = new Map<ArcadePrimitive, number>();
      const dimCounts = new Map<ArcadePrimitive, number>();
      for (const item of tableRows(input, "order_items")) itemCounts.set(item.order_id, (itemCounts.get(item.order_id) ?? 0) + 1);
      for (const dim of tableRows(input, "dim_accounts")) dimCounts.set(dim.account_id, (dimCounts.get(dim.account_id) ?? 0) + 1);
      return sortRows([...itemCounts.entries()].map(([order_id, item_rows]) => {
        const order = orders.get(order_id);
        const dim_rows = order ? dimCounts.get(order.account_id) ?? 0 : 0;
        return { order_id, item_rows, dim_rows, inflated_rows: item_rows * dim_rows };
      }).filter((row) => row.inflated_rows > row.item_rows), [["order_id", "asc"]]);
    },
    `WITH item_counts AS (
  SELECT order_id, COUNT(*) AS item_rows FROM order_items GROUP BY order_id
),
dim_counts AS (
  SELECT account_id, COUNT(*) AS dim_rows FROM dim_accounts GROUP BY account_id
)
SELECT i.order_id, i.item_rows, d.dim_rows, i.item_rows * d.dim_rows AS inflated_rows
FROM item_counts i
JOIN source_orders o ON o.order_id = i.order_id
JOIN dim_counts d ON d.account_id = o.account_id
WHERE i.item_rows * d.dim_rows > i.item_rows
ORDER BY i.order_id;`,
    `orders = {row['order_id']: row for row in data['source_orders']}
item_counts = {}
dim_counts = {}
for item in data['order_items']:
    item_counts[item['order_id']] = item_counts.get(item['order_id'], 0) + 1
for dim in data['dim_accounts']:
    dim_counts[dim['account_id']] = dim_counts.get(dim['account_id'], 0) + 1
result = sorted([
    {'order_id': order_id, 'item_rows': item_rows, 'dim_rows': dim_counts[orders[order_id]['account_id']], 'inflated_rows': item_rows * dim_counts[orders[order_id]['account_id']]}
    for order_id, item_rows in item_counts.items()
    if order_id in orders and item_rows * dim_counts.get(orders[order_id]['account_id'], 0) > item_rows
], key=lambda row: row['order_id'])`,
    `item_counts_df = order_items_df.groupBy("order_id").agg(F.count("*").alias("item_rows"))
dim_counts_df = dim_accounts_df.groupBy("account_id").agg(F.count("*").alias("dim_rows"))
result_df = item_counts_df.join(source_orders_df, "order_id").join(dim_counts_df, "account_id").withColumn("inflated_rows", F.col("item_rows") * F.col("dim_rows")).filter(F.col("inflated_rows") > F.col("item_rows")).select("order_id", "item_rows", "dim_rows", "inflated_rows").orderBy("order_id")`,
    makePysparkRequirements(req.group, req.agg, req.join, req.withColumn, req.filter, req.select),
  );
}

function missingFilterLeakageFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["order_id", "status", "amount"];
  return seed(
    context,
    [tables.sourceOrders],
    "pipeline-debugging",
    "Missing paid-filter leakage",
    "Return non-paid source orders that would leak into amount-only revenue logic.",
    columns,
    (input) => sortRows(tableRows(input, "source_orders").filter((order) => order.status !== "paid" && Number(order.amount) > 50).map((order) => ({ order_id: order.order_id, status: order.status, amount: order.amount })), [["order_id", "asc"]]),
    `SELECT order_id, status, amount
FROM source_orders
WHERE status <> 'paid' AND amount > 50
ORDER BY order_id;`,
    `result = sorted([
    {'order_id': order['order_id'], 'status': order['status'], 'amount': order['amount']}
    for order in data['source_orders']
    if order['status'] != 'paid' and order['amount'] > 50
], key=lambda row: row['order_id'])`,
    `result_df = source_orders_df.filter((F.col("status") != "paid") & (F.col("amount") > 50)).select("order_id", "status", "amount").orderBy("order_id")`,
    makePysparkRequirements(req.filter, req.select),
  );
}

function staleSnapshotComparisonFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["product_id", "old_active", "latest_active"];
  return seed(
    context,
    [tables.productSnapshot],
    "source-target-checks",
    "Stale product snapshot comparison",
    "Return products whose earliest and latest active flags differ.",
    columns,
    (input) => {
      const groups = new Map<ArcadePrimitive, ArcadeRow[]>();
      for (const row of tableRows(input, "product_snapshot")) groups.set(row.product_id, [...(groups.get(row.product_id) ?? []), row]);
      return sortRows([...groups.entries()].map(([product_id, rows]) => {
        const ordered = sortRows(rows, [["snapshot_date", "asc"]]);
        const first = ordered[0];
        const last = ordered[ordered.length - 1];
        return first.is_active !== last.is_active ? { product_id, old_active: first.is_active, latest_active: last.is_active } : null;
      }).filter(Boolean) as ArcadeRow[], [["product_id", "asc"]]);
    },
    `WITH ranked AS (
  SELECT product_id, is_active, snapshot_date,
         ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY snapshot_date) AS first_rn,
         ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY snapshot_date DESC) AS last_rn
  FROM product_snapshot
),
firsts AS (
  SELECT product_id, is_active AS old_active FROM ranked WHERE first_rn = 1
),
lasts AS (
  SELECT product_id, is_active AS latest_active FROM ranked WHERE last_rn = 1
)
SELECT f.product_id, f.old_active, l.latest_active
FROM firsts f
JOIN lasts l ON l.product_id = f.product_id
WHERE f.old_active <> l.latest_active
ORDER BY f.product_id;`,
    `groups = {}
for row in data['product_snapshot']:
    groups.setdefault(row['product_id'], []).append(row)
result = []
for product_id, rows in groups.items():
    ordered = sorted(rows, key=lambda row: row['snapshot_date'])
    if ordered[0]['is_active'] != ordered[-1]['is_active']:
        result.append({'product_id': product_id, 'old_active': ordered[0]['is_active'], 'latest_active': ordered[-1]['is_active']})
result = sorted(result, key=lambda row: row['product_id'])`,
    `w_first = Window.partitionBy("product_id").orderBy("snapshot_date")
w_last = Window.partitionBy("product_id").orderBy(F.col("snapshot_date").desc())
ranked_df = product_snapshot_df.withColumn("first_rn", F.row_number().over(w_first)).withColumn("last_rn", F.row_number().over(w_last))
firsts_df = ranked_df.filter(F.col("first_rn") == 1).select("product_id", F.col("is_active").alias("old_active"))
lasts_df = ranked_df.filter(F.col("last_rn") == 1).select("product_id", F.col("is_active").alias("latest_active"))
result_df = firsts_df.join(lasts_df, "product_id").filter(F.col("old_active") != F.col("latest_active")).select("product_id", "old_active", "latest_active").orderBy("product_id")`,
    makePysparkRequirements(req.window, req.rowNumber, req.over, req.withColumn, req.filter, req.join, req.select, req.alias),
  );
}

function incidentMetricMismatchFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildIncidentTables(context);
  const columns = ["metric_name", "metric_date", "value_gap"];
  return seed(
    context,
    [tables.incidentMetrics],
    "metric-investigation",
    "Incident metric mismatch",
    "Return incident metrics where actual value differs from expected value.",
    columns,
    (input) => sortRows(tableRows(input, "incident_metrics").filter((row) => Number(row.actual_value) !== Number(row.expected_value)).map((row) => ({ metric_name: row.metric_name, metric_date: row.metric_date, value_gap: sum([Number(row.actual_value) - Number(row.expected_value)]) })), [["metric_name", "asc"], ["metric_date", "asc"]]),
    `SELECT metric_name, metric_date,
       ROUND(actual_value - expected_value, 2) AS value_gap
FROM incident_metrics
WHERE ROUND(actual_value - expected_value, 2) <> 0
ORDER BY metric_name, metric_date;`,
    `result = sorted([
    {'metric_name': row['metric_name'], 'metric_date': row['metric_date'], 'value_gap': round(row['actual_value'] - row['expected_value'], 2)}
    for row in data['incident_metrics']
    if round(row['actual_value'] - row['expected_value'], 2) != 0
], key=lambda row: (row['metric_name'], row['metric_date']))`,
    `result_df = incident_metrics_df.withColumn("value_gap", F.round(F.col("actual_value") - F.col("expected_value"), 2)).filter(F.col("value_gap") != 0).select("metric_name", "metric_date", "value_gap").orderBy("metric_name", "metric_date")`,
    makePysparkRequirements(req.withColumn, req.filter, req.select),
  );
}

const worldEighteenFamilies: FamilyBuilder[] = [
  cdcCurrentStateFamily,
  pointInTimeAccountLookupFamily,
  lateCorrectionImpactFamily,
  effectiveDateConflictFamily,
  cdcVsCurrentDimensionMismatchFamily,
];

const worldNineteenFamilies: FamilyBuilder[] = [
  duplicateEventIdsFamily,
  outOfOrderEventTimeFamily,
  watermarkLateEventFamily,
  eventProcessingLagFamily,
  latestEventBeforeWatermarkFamily,
];

const worldTwentyFamilies: FamilyBuilder[] = [
  rowCountReconciliationFamily,
  aggregateBalanceCheckFamily,
  orphanDimensionKeyFamily,
  missingTargetOrderFamily,
  rejectedReasonAnalysisFamily,
];

const worldTwentyOneFamilies: FamilyBuilder[] = [
  funnelDropoffFamily,
  repeatPurchaseDetectionFamily,
  cohortRetentionSummaryFamily,
  churnRiskIndicatorFamily,
  inactiveProductPurchaseFamily,
];

const worldTwentyTwoFamilies: FamilyBuilder[] = [
  incorrectAggregationGrainIncidentFamily,
  joinInflationIncidentFamily,
  missingFilterLeakageFamily,
  staleSnapshotComparisonFamily,
  incidentMetricMismatchFamily,
];

const familiesByWorld: Record<number, FamilyBuilder[]> = {
  18: worldEighteenFamilies,
  19: worldNineteenFamilies,
  20: worldTwentyFamilies,
  21: worldTwentyOneFamilies,
  22: worldTwentyTwoFamilies,
};

function buildContext(worldNumber: number, familyIndex: number, variant: number): FamilyContext {
  const levelNumber = 851 + (worldNumber - 18) * 50 + familyIndex * 10 + variant;
  return {
    levelNumber,
    worldNumber,
    familyIndex,
    variant,
    threshold: 200 + (worldNumber - 18) * 25 + familyIndex * 11 + variant,
    minOrders: 2 + (variant % 3),
    days: 3 + ((familyIndex + variant) % 6),
    topN: 2 + (variant % 3),
    status: variant % 2 === 0 ? "paid" : "completed",
    country: ["US", "CA", "IN", "GB", "AU"][(familyIndex + variant) % 5],
    channel: ["web", "mobile", "store", "partner", "api"][(familyIndex + variant) % 5],
    month: variant % 2 === 0 ? "2026-09" : "2026-10",
  };
}

function buildAdvancedBundles() {
  const bundles: AdvancedArcadeLevelBundle[] = [];

  for (let worldNumber = 18; worldNumber <= 22; worldNumber += 1) {
    const families = familiesByWorld[worldNumber];
    for (let familyIndex = 0; familyIndex < families.length; familyIndex += 1) {
      for (let variant = 0; variant < 10; variant += 1) {
        bundles.push(buildBundle(families[familyIndex](buildContext(worldNumber, familyIndex, variant))));
      }
    }
  }

  return bundles;
}

export const arcadeWorldsEighteenTwentytwoBundles = buildAdvancedBundles();

if (arcadeWorldsEighteenTwentytwoBundles.length !== 250) {
  throw new Error(`Arcade Worlds 18-22 must contain 250 levels. Received ${arcadeWorldsEighteenTwentytwoBundles.length}.`);
}

export const arcadeWorldsEighteenTwentytwoBundleMap = new Map(
  arcadeWorldsEighteenTwentytwoBundles.map((bundle) => [bundle.levelNumber, bundle] as const),
);

export function getArcadeWorldsEighteenTwentytwoBundle(levelNumber: number) {
  return arcadeWorldsEighteenTwentytwoBundleMap.get(levelNumber) ?? null;
}
