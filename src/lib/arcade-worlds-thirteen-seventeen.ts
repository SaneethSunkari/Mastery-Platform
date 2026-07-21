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
  13: "World 13 slowly changing dimensions",
  14: "World 14 incremental loads",
  15: "World 15 fact validation",
  16: "World 16 event sessionization",
  17: "World 17 production debugging",
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

function buildProductionTables(context: FamilyContext) {
  const offset = context.levelNumber * 100;
  const variant = context.variant;
  const baseDate = variant % 2 === 0 ? "2026-07-01" : "2026-08-01";
  const watermark = `${dateAdd(baseDate, 8)}T00:00:00`;
  const customerDimRows = [
    { customer_sk: offset + 11, customer_id: 1, segment: "starter", country: "US", effective_from: dateAdd(baseDate, -60), effective_to: dateAdd(baseDate, -1), is_current: 0 },
    { customer_sk: offset + 12, customer_id: 1, segment: "enterprise", country: "US", effective_from: baseDate, effective_to: null, is_current: 1 },
    { customer_sk: offset + 21, customer_id: 2, segment: "smb", country: "CA", effective_from: dateAdd(baseDate, -40), effective_to: null, is_current: 1 },
    { customer_sk: offset + 22, customer_id: 2, segment: "mid_market", country: "CA", effective_from: dateAdd(baseDate, 5), effective_to: null, is_current: 1 },
    { customer_sk: offset + 31, customer_id: 3, segment: "trial", country: "IN", effective_from: dateAdd(baseDate, -30), effective_to: dateAdd(baseDate, 10), is_current: 0 },
    { customer_sk: offset + 32, customer_id: 3, segment: "smb", country: "IN", effective_from: dateAdd(baseDate, 11), effective_to: null, is_current: 1 },
    { customer_sk: offset + 41, customer_id: 4, segment: "enterprise", country: "GB", effective_from: dateAdd(baseDate, -10), effective_to: null, is_current: 1 },
  ];
  const customerUpdatesRows = [
    { change_id: offset + 101, customer_id: 1, segment: "enterprise", country: "US", op: "update", update_ts: `${dateAdd(baseDate, 9)}T09:00:00` },
    { change_id: offset + 102, customer_id: 2, segment: "mid_market", country: "CA", op: "update", update_ts: `${dateAdd(baseDate, 6)}T10:00:00` },
    { change_id: offset + 103, customer_id: 5, segment: "smb", country: "AU", op: "insert", update_ts: `${dateAdd(baseDate, 12)}T11:00:00` },
    { change_id: offset + 104, customer_id: 3, segment: "smb", country: "IN", op: "update", update_ts: `${dateAdd(baseDate, 14)}T12:00:00` },
    { change_id: offset + 105, customer_id: 4, segment: "enterprise", country: "GB", op: "delete", update_ts: `${dateAdd(baseDate, 16)}T13:00:00` },
    { change_id: offset + 106, customer_id: 6, segment: "trial", country: "US", op: "insert", update_ts: `${dateAdd(baseDate, 4)}T08:00:00` },
  ];
  const stagingCustomersRows = [
    { customer_id: 1, segment: "enterprise", country: "US", source_updated_at: `${dateAdd(baseDate, 9)}T09:00:00` },
    { customer_id: 2, segment: "mid_market", country: "CA", source_updated_at: `${dateAdd(baseDate, 10)}T10:00:00` },
    { customer_id: 3, segment: "smb", country: "IN", source_updated_at: `${dateAdd(baseDate, 14)}T12:00:00` },
    { customer_id: 5, segment: "smb", country: "AU", source_updated_at: `${dateAdd(baseDate, 12)}T11:00:00` },
    { customer_id: 6, segment: "trial", country: "US", source_updated_at: `${dateAdd(baseDate, 4)}T08:00:00` },
  ];
  const ordersRows = [
    { order_id: offset + 1, customer_id: 1, order_ts: `${dateAdd(baseDate, -5)}T09:00:00`, ingest_ts: `${dateAdd(baseDate, 1)}T09:00:00`, updated_at: `${dateAdd(baseDate, 9)}T09:30:00`, amount: 180 + variant * 7, status: "paid", batch_date: dateAdd(baseDate, 1) },
    { order_id: offset + 2, customer_id: 1, order_ts: `${dateAdd(baseDate, 3)}T10:00:00`, ingest_ts: `${dateAdd(baseDate, 3)}T10:05:00`, updated_at: `${dateAdd(baseDate, 3)}T10:05:00`, amount: 90 + variant * 5, status: "paid", batch_date: dateAdd(baseDate, 3) },
    { order_id: offset + 3, customer_id: 2, order_ts: `${dateAdd(baseDate, 7)}T11:00:00`, ingest_ts: `${dateAdd(baseDate, 7)}T11:02:00`, updated_at: `${dateAdd(baseDate, 11)}T11:30:00`, amount: 240 + variant * 8, status: "paid", batch_date: dateAdd(baseDate, 7) },
    { order_id: offset + 4, customer_id: 3, order_ts: `${dateAdd(baseDate, 13)}T12:00:00`, ingest_ts: `${dateAdd(baseDate, 18)}T12:00:00`, updated_at: `${dateAdd(baseDate, 18)}T12:30:00`, amount: 130 + variant * 6, status: "refunded", batch_date: dateAdd(baseDate, 18) },
    { order_id: offset + 5, customer_id: 3, order_ts: `${dateAdd(baseDate, 17)}T13:00:00`, ingest_ts: `${dateAdd(baseDate, 17)}T13:03:00`, updated_at: `${dateAdd(baseDate, 19)}T13:30:00`, amount: 310 + variant * 9, status: "paid", batch_date: dateAdd(baseDate, 17) },
    { order_id: offset + 6, customer_id: 5, order_ts: `${dateAdd(baseDate, 20)}T14:00:00`, ingest_ts: `${dateAdd(baseDate, 20)}T14:01:00`, updated_at: `${dateAdd(baseDate, 20)}T14:10:00`, amount: 75 + variant * 4, status: "paid", batch_date: dateAdd(baseDate, 20) },
  ];
  const factOrdersRows = [
    { fact_order_id: offset + 201, order_id: offset + 1, customer_sk: offset + 11, order_date: dateAdd(baseDate, -5), amount: 180 + variant * 7, status: "paid" },
    { fact_order_id: offset + 202, order_id: offset + 2, customer_sk: offset + 12, order_date: dateAdd(baseDate, 3), amount: 90 + variant * 5, status: "paid" },
    { fact_order_id: offset + 203, order_id: offset + 3, customer_sk: offset + 21, order_date: dateAdd(baseDate, 7), amount: 241 + variant * 8, status: "paid" },
    { fact_order_id: offset + 204, order_id: offset + 3, customer_sk: offset + 22, order_date: dateAdd(baseDate, 7), amount: 240 + variant * 8, status: "paid" },
    { fact_order_id: offset + 205, order_id: offset + 5, customer_sk: offset + 999, order_date: dateAdd(baseDate, 17), amount: 310 + variant * 9, status: "paid" },
    { fact_order_id: offset + 206, order_id: offset + 99, customer_sk: offset + 12, order_date: dateAdd(baseDate, 20), amount: 44, status: "paid" },
  ];
  const eventRows = [
    { event_id: offset + 301, user_id: 1, event_type: "page_view", event_ts: `${baseDate}T09:00:00`, ingest_ts: `${baseDate}T09:01:00`, partition_date: baseDate },
    { event_id: offset + 302, user_id: 1, event_type: "add_to_cart", event_ts: timestampAdd(`${baseDate}T09:00:00`, 8), ingest_ts: timestampAdd(`${baseDate}T09:00:00`, 9), partition_date: baseDate },
    { event_id: offset + 303, user_id: 1, event_type: "checkout", event_ts: timestampAdd(`${baseDate}T09:00:00`, 55), ingest_ts: timestampAdd(`${baseDate}T09:00:00`, 56), partition_date: baseDate },
    { event_id: offset + 304, user_id: 1, event_type: "purchase", event_ts: timestampAdd(`${baseDate}T09:00:00`, 70), ingest_ts: timestampAdd(`${baseDate}T09:00:00`, 70), partition_date: baseDate },
    { event_id: offset + 305, user_id: 2, event_type: "page_view", event_ts: `${dateAdd(baseDate, 1)}T10:00:00`, ingest_ts: `${dateAdd(baseDate, 1)}T10:01:00`, partition_date: dateAdd(baseDate, 1) },
    { event_id: offset + 306, user_id: 2, event_type: "checkout", event_ts: `${dateAdd(baseDate, 1)}T10:20:00`, ingest_ts: `${dateAdd(baseDate, 1)}T10:22:00`, partition_date: dateAdd(baseDate, 1) },
    { event_id: offset + 307, user_id: 2, event_type: "purchase", event_ts: `${dateAdd(baseDate, 1)}T12:00:00`, ingest_ts: `${dateAdd(baseDate, 4)}T12:00:00`, partition_date: dateAdd(baseDate, 4) },
    { event_id: offset + 308, user_id: 3, event_type: "page_view", event_ts: `${dateAdd(baseDate, 2)}T08:00:00`, ingest_ts: `${dateAdd(baseDate, 2)}T07:59:00`, partition_date: dateAdd(baseDate, 2) },
  ];
  const sourceMetricsRows = [
    { metric_date: dateAdd(baseDate, 1), metric_name: "paid_revenue", metric_value: 180 + variant * 7 },
    { metric_date: dateAdd(baseDate, 3), metric_name: "paid_revenue", metric_value: 90 + variant * 5 },
    { metric_date: dateAdd(baseDate, 7), metric_name: "paid_revenue", metric_value: 240 + variant * 8 },
    { metric_date: dateAdd(baseDate, 17), metric_name: "paid_revenue", metric_value: 310 + variant * 9 },
  ];
  const targetMetricsRows = [
    { metric_date: dateAdd(baseDate, 1), metric_name: "paid_revenue", metric_value: 180 + variant * 7 },
    { metric_date: dateAdd(baseDate, 3), metric_name: "paid_revenue", metric_value: 91 + variant * 5 },
    { metric_date: dateAdd(baseDate, 17), metric_name: "paid_revenue", metric_value: 310 + variant * 9 },
    { metric_date: dateAdd(baseDate, 22), metric_name: "paid_revenue", metric_value: 12 },
  ];
  const pipelineOutputRows = [
    { order_id: offset + 1, customer_id: 1, customer_sk: offset + 12, amount: 180 + variant * 7, status: "paid", partition_date: dateAdd(baseDate, 1) },
    { order_id: offset + 2, customer_id: 1, customer_sk: offset + 12, amount: 90 + variant * 5, status: "paid", partition_date: dateAdd(baseDate, 3) },
    { order_id: offset + 3, customer_id: 2, customer_sk: offset + 22, amount: 241 + variant * 8, status: "paid", partition_date: dateAdd(baseDate, 7) },
    { order_id: offset + 4, customer_id: 3, customer_sk: offset + 32, amount: 130 + variant * 6, status: "paid", partition_date: dateAdd(baseDate, 18) },
    { order_id: offset + 5, customer_id: 3, customer_sk: offset + 32, amount: 310 + variant * 9, status: "completed", partition_date: dateAdd(baseDate, 17) },
  ];

  return {
    watermark,
    customerDim: table("customer_dim", "customer_dim_df", [
      { name: "customer_sk", type: "INTEGER" },
      { name: "customer_id", type: "INTEGER" },
      { name: "segment", type: "TEXT" },
      { name: "country", type: "TEXT" },
      { name: "effective_from", type: "TEXT" },
      { name: "effective_to", type: "TEXT" },
      { name: "is_current", type: "INTEGER" },
    ], customerDimRows),
    customerUpdates: table("customer_updates", "customer_updates_df", [
      { name: "change_id", type: "INTEGER" },
      { name: "customer_id", type: "INTEGER" },
      { name: "segment", type: "TEXT" },
      { name: "country", type: "TEXT" },
      { name: "op", type: "TEXT" },
      { name: "update_ts", type: "TEXT" },
    ], customerUpdatesRows),
    stagingCustomers: table("staging_customers", "staging_customers_df", [
      { name: "customer_id", type: "INTEGER" },
      { name: "segment", type: "TEXT" },
      { name: "country", type: "TEXT" },
      { name: "source_updated_at", type: "TEXT" },
    ], stagingCustomersRows),
    orders: table("orders", "orders_df", [
      { name: "order_id", type: "INTEGER" },
      { name: "customer_id", type: "INTEGER" },
      { name: "order_ts", type: "TEXT" },
      { name: "ingest_ts", type: "TEXT" },
      { name: "updated_at", type: "TEXT" },
      { name: "amount", type: "REAL" },
      { name: "status", type: "TEXT" },
      { name: "batch_date", type: "TEXT" },
    ], ordersRows),
    factOrders: table("fact_orders", "fact_orders_df", [
      { name: "fact_order_id", type: "INTEGER" },
      { name: "order_id", type: "INTEGER" },
      { name: "customer_sk", type: "INTEGER" },
      { name: "order_date", type: "TEXT" },
      { name: "amount", type: "REAL" },
      { name: "status", type: "TEXT" },
    ], factOrdersRows),
    events: table("events", "events_df", [
      { name: "event_id", type: "INTEGER" },
      { name: "user_id", type: "INTEGER" },
      { name: "event_type", type: "TEXT" },
      { name: "event_ts", type: "TEXT" },
      { name: "ingest_ts", type: "TEXT" },
      { name: "partition_date", type: "TEXT" },
    ], eventRows),
    sourceMetrics: table("source_metrics", "source_metrics_df", [
      { name: "metric_date", type: "TEXT" },
      { name: "metric_name", type: "TEXT" },
      { name: "metric_value", type: "REAL" },
    ], sourceMetricsRows),
    targetMetrics: table("target_metrics", "target_metrics_df", [
      { name: "metric_date", type: "TEXT" },
      { name: "metric_name", type: "TEXT" },
      { name: "metric_value", type: "REAL" },
    ], targetMetricsRows),
    pipelineOutput: table("pipeline_output", "pipeline_output_df", [
      { name: "order_id", type: "INTEGER" },
      { name: "customer_id", type: "INTEGER" },
      { name: "customer_sk", type: "INTEGER" },
      { name: "amount", type: "REAL" },
      { name: "status", type: "TEXT" },
      { name: "partition_date", type: "TEXT" },
    ], pipelineOutputRows),
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
    businessContext: "Production data-engineering validation task.",
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
  return tableRows(input, "customer_dim").filter((row) => row.is_current === 1);
}

function currentCustomerLookupFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["order_id", "customer_sk", "segment"];
  return seed(
    context,
    [tables.orders, tables.customerDim],
    "latest-entity-state",
    "Current dimension lookup",
    "Return paid orders joined to the current customer dimension.",
    columns,
    (input) => {
      const current = byKey(currentRows(input), "customer_id");
      return sortRows(tableRows(input, "orders").filter((order) => order.status === "paid").map((order) => {
        const dim = current.get(order.customer_id);
        return dim ? { order_id: order.order_id, customer_sk: dim.customer_sk, segment: dim.segment } : null;
      }).filter(Boolean) as ArcadeRow[], [["order_id", "asc"]]);
    },
    `SELECT o.order_id, d.customer_sk, d.segment
FROM orders o
JOIN customer_dim d ON d.customer_id = o.customer_id AND d.is_current = 1
WHERE o.status = 'paid'
ORDER BY o.order_id;`,
    `current = {row['customer_id']: row for row in data['customer_dim'] if row['is_current'] == 1}
result = sorted([
    {'order_id': order['order_id'], 'customer_sk': current[order['customer_id']]['customer_sk'], 'segment': current[order['customer_id']]['segment']}
    for order in data['orders']
    if order['status'] == 'paid' and order['customer_id'] in current
], key=lambda row: row['order_id'])`,
    `current_dim_df = customer_dim_df.filter(F.col("is_current") == 1)
result_df = orders_df.filter(F.col("status") == "paid").join(current_dim_df, "customer_id").select("order_id", "customer_sk", "segment").orderBy("order_id")`,
    makePysparkRequirements(req.filter, req.join, req.select),
  );
}

function historicalOrderDimensionFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["order_id", "customer_sk", "segment"];
  return seed(
    context,
    [tables.orders, tables.customerDim],
    "latest-entity-state",
    "Historical dimension lookup",
    "Return paid orders joined to the customer dimension row effective on order date.",
    columns,
    (input) => sortRows(tableRows(input, "orders").filter((order) => order.status === "paid").map((order) => {
      const orderDate = datePart(order.order_ts);
      const match = tableRows(input, "customer_dim").find((dim) =>
        dim.customer_id === order.customer_id &&
        String(dim.effective_from) <= orderDate &&
        (dim.effective_to === null || String(dim.effective_to) >= orderDate));
      return match ? { order_id: order.order_id, customer_sk: match.customer_sk, segment: match.segment } : null;
    }).filter(Boolean) as ArcadeRow[], [["order_id", "asc"]]),
    `SELECT o.order_id, d.customer_sk, d.segment
FROM orders o
JOIN customer_dim d
  ON d.customer_id = o.customer_id
 AND d.effective_from <= SUBSTR(o.order_ts, 1, 10)
 AND (d.effective_to IS NULL OR d.effective_to >= SUBSTR(o.order_ts, 1, 10))
WHERE o.status = 'paid'
ORDER BY o.order_id;`,
    `result = []
for order in data['orders']:
    if order['status'] != 'paid':
        continue
    order_date = order['order_ts'][:10]
    for dim in data['customer_dim']:
        if dim['customer_id'] == order['customer_id'] and dim['effective_from'] <= order_date and (dim['effective_to'] is None or dim['effective_to'] >= order_date):
            result.append({'order_id': order['order_id'], 'customer_sk': dim['customer_sk'], 'segment': dim['segment']})
            break
result = sorted(result, key=lambda row: row['order_id'])`,
    `result_df = orders_df.filter(F.col("status") == "paid").withColumn("order_date", F.to_date("order_ts")).join(customer_dim_df, (orders_df.customer_id == customer_dim_df.customer_id) & (F.col("effective_from") <= F.col("order_date")) & (F.col("effective_to").isNull() | (F.col("effective_to") >= F.col("order_date")))).select("order_id", "customer_sk", "segment").orderBy("order_id")`,
    makePysparkRequirements(req.filter, req.withColumn, req.date, req.join, req.select),
  );
}

function duplicateCurrentDimensionFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["customer_id", "current_rows"];
  return seed(
    context,
    [tables.customerDim],
    "advanced-validation",
    "Duplicate current dimension rows",
    "Return customers with more than one current dimension row.",
    columns,
    (input) => {
      const counts = new Map<ArcadePrimitive, number>();
      for (const row of currentRows(input)) counts.set(row.customer_id, (counts.get(row.customer_id) ?? 0) + 1);
      return sortRows([...counts.entries()].filter(([, current_rows]) => current_rows > 1).map(([customer_id, current_rows]) => ({ customer_id, current_rows })), [["customer_id", "asc"]]);
    },
    `SELECT customer_id, COUNT(*) AS current_rows
FROM customer_dim
WHERE is_current = 1
GROUP BY customer_id
HAVING COUNT(*) > 1
ORDER BY customer_id;`,
    `counts = {}
for row in data['customer_dim']:
    if row['is_current'] == 1:
        counts[row['customer_id']] = counts.get(row['customer_id'], 0) + 1
result = sorted([
    {'customer_id': customer_id, 'current_rows': count}
    for customer_id, count in counts.items()
    if count > 1
], key=lambda row: row['customer_id'])`,
    `result_df = customer_dim_df.filter(F.col("is_current") == 1).groupBy("customer_id").agg(F.count("*").alias("current_rows")).filter(F.col("current_rows") > 1).select("customer_id", "current_rows").orderBy("customer_id")`,
    makePysparkRequirements(req.filter, req.group, req.agg, req.alias, req.select),
  );
}

function missingHistoricalDimensionFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["order_id", "customer_id"];
  return seed(
    context,
    [tables.orders, tables.customerDim],
    "source-target-checks",
    "Missing historical dimension lookup",
    "Return paid orders that do not have a dimension row effective on order date.",
    columns,
    (input) => sortRows(tableRows(input, "orders").filter((order) => {
      if (order.status !== "paid") return false;
      const orderDate = datePart(order.order_ts);
      return !tableRows(input, "customer_dim").some((dim) =>
        dim.customer_id === order.customer_id &&
        String(dim.effective_from) <= orderDate &&
        (dim.effective_to === null || String(dim.effective_to) >= orderDate));
    }).map((order) => ({ order_id: order.order_id, customer_id: order.customer_id })), [["order_id", "asc"]]),
    `SELECT o.order_id, o.customer_id
FROM orders o
LEFT JOIN customer_dim d
  ON d.customer_id = o.customer_id
 AND d.effective_from <= SUBSTR(o.order_ts, 1, 10)
 AND (d.effective_to IS NULL OR d.effective_to >= SUBSTR(o.order_ts, 1, 10))
WHERE o.status = 'paid' AND d.customer_sk IS NULL
ORDER BY o.order_id;`,
    `result = []
for order in data['orders']:
    if order['status'] != 'paid':
        continue
    order_date = order['order_ts'][:10]
    matched = any(dim['customer_id'] == order['customer_id'] and dim['effective_from'] <= order_date and (dim['effective_to'] is None or dim['effective_to'] >= order_date) for dim in data['customer_dim'])
    if not matched:
        result.append({'order_id': order['order_id'], 'customer_id': order['customer_id']})
result = sorted(result, key=lambda row: row['order_id'])`,
    `result_df = orders_df.filter(F.col("status") == "paid").withColumn("order_date", F.to_date("order_ts")).join(customer_dim_df, (orders_df.customer_id == customer_dim_df.customer_id) & (F.col("effective_from") <= F.col("order_date")) & (F.col("effective_to").isNull() | (F.col("effective_to") >= F.col("order_date"))), "left_anti").select("order_id", "customer_id").orderBy("order_id")`,
    makePysparkRequirements(req.filter, req.withColumn, req.date, req.join, req.select),
  );
}

function segmentHistoryChangeFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["customer_id", "segment_versions"];
  return seed(
    context,
    [tables.customerDim],
    "advanced-validation",
    "Segment history changes",
    "Return customers whose dimension history contains more than one segment.",
    columns,
    (input) => {
      const segments = new Map<ArcadePrimitive, Set<string>>();
      for (const row of tableRows(input, "customer_dim")) {
        segments.set(row.customer_id, (segments.get(row.customer_id) ?? new Set()).add(String(row.segment)));
      }
      return sortRows([...segments.entries()].filter(([, values]) => values.size > 1).map(([customer_id, values]) => ({ customer_id, segment_versions: values.size })), [["customer_id", "asc"]]);
    },
    `SELECT customer_id, COUNT(DISTINCT segment) AS segment_versions
FROM customer_dim
GROUP BY customer_id
HAVING COUNT(DISTINCT segment) > 1
ORDER BY customer_id;`,
    `segments = {}
for row in data['customer_dim']:
    segments.setdefault(row['customer_id'], set()).add(row['segment'])
result = sorted([
    {'customer_id': customer_id, 'segment_versions': len(values)}
    for customer_id, values in segments.items()
    if len(values) > 1
], key=lambda row: row['customer_id'])`,
    `result_df = customer_dim_df.groupBy("customer_id").agg(F.countDistinct("segment").alias("segment_versions")).filter(F.col("segment_versions") > 1).select("customer_id", "segment_versions").orderBy("customer_id")`,
    makePysparkRequirements(req.group, req.agg, req.alias, req.filter, req.select),
  );
}

function changedRecordsAfterWatermarkFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["change_id", "customer_id", "op"];
  return seed(
    context,
    [tables.customerUpdates],
    "pipeline-debugging",
    "Changed records after watermark",
    `Return customer change records with update_ts after ${tables.watermark}.`,
    columns,
    (input) => sortRows(tableRows(input, "customer_updates").filter((row) => String(row.update_ts) > tables.watermark).map((row) => ({ change_id: row.change_id, customer_id: row.customer_id, op: row.op })), [["change_id", "asc"]]),
    `SELECT change_id, customer_id, op
FROM customer_updates
WHERE update_ts > '${tables.watermark}'
ORDER BY change_id;`,
    `watermark = '${tables.watermark}'
result = sorted([
    {'change_id': row['change_id'], 'customer_id': row['customer_id'], 'op': row['op']}
    for row in data['customer_updates']
    if row['update_ts'] > watermark
], key=lambda row: row['change_id'])`,
    `result_df = customer_updates_df.filter(F.col("update_ts") > F.lit("${tables.watermark}")).select("change_id", "customer_id", "op").orderBy("change_id")`,
    makePysparkRequirements(req.filter, req.select),
  );
}

function latestCdcRecordFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["customer_id", "op", "update_ts"];
  return seed(
    context,
    [tables.customerUpdates],
    "latest-entity-state",
    "Latest CDC record",
    "Return the latest customer change record per customer after the watermark.",
    columns,
    (input) => {
      const latest = new Map<ArcadePrimitive, ArcadeRow>();
      for (const row of tableRows(input, "customer_updates").filter((item) => String(item.update_ts) > tables.watermark)) {
        const prior = latest.get(row.customer_id);
        if (!prior || String(row.update_ts) > String(prior.update_ts)) latest.set(row.customer_id, row);
      }
      return sortRows([...latest.values()].map((row) => ({ customer_id: row.customer_id, op: row.op, update_ts: row.update_ts })), [["customer_id", "asc"]]);
    },
    `WITH ranked AS (
  SELECT customer_id, op, update_ts,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY update_ts DESC, change_id DESC) AS rn
  FROM customer_updates
  WHERE update_ts > '${tables.watermark}'
)
SELECT customer_id, op, update_ts
FROM ranked
WHERE rn = 1
ORDER BY customer_id;`,
    `latest = {}
for row in data['customer_updates']:
    if row['update_ts'] > '${tables.watermark}':
        prior = latest.get(row['customer_id'])
        if prior is None or (row['update_ts'], row['change_id']) > (prior['update_ts'], prior['change_id']):
            latest[row['customer_id']] = row
result = sorted([
    {'customer_id': row['customer_id'], 'op': row['op'], 'update_ts': row['update_ts']}
    for row in latest.values()
], key=lambda row: row['customer_id'])`,
    `w = Window.partitionBy("customer_id").orderBy(F.col("update_ts").desc(), F.col("change_id").desc())
result_df = customer_updates_df.filter(F.col("update_ts") > F.lit("${tables.watermark}")).withColumn("rn", F.row_number().over(w)).filter(F.col("rn") == 1).select("customer_id", "op", "update_ts").orderBy("customer_id")`,
    makePysparkRequirements(req.window, req.rowNumber, req.over, req.filter, req.withColumn, req.select),
  );
}

function insertUpdateClassFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["customer_id", "load_action"];
  return seed(
    context,
    [tables.stagingCustomers, tables.customerDim],
    "source-target-checks",
    "Insert versus update classification",
    "Classify staging customers as insert or update against the current dimension.",
    columns,
    (input) => {
      const current = new Set(currentRows(input).map((row) => row.customer_id));
      return sortRows(tableRows(input, "staging_customers").filter((row) => String(row.source_updated_at) > tables.watermark).map((row) => ({ customer_id: row.customer_id, load_action: current.has(row.customer_id) ? "update" : "insert" })), [["customer_id", "asc"]]);
    },
    `SELECT s.customer_id,
       CASE WHEN d.customer_id IS NULL THEN 'insert' ELSE 'update' END AS load_action
FROM staging_customers s
LEFT JOIN customer_dim d ON d.customer_id = s.customer_id AND d.is_current = 1
WHERE s.source_updated_at > '${tables.watermark}'
ORDER BY s.customer_id;`,
    `current = {row['customer_id'] for row in data['customer_dim'] if row['is_current'] == 1}
result = sorted([
    {'customer_id': row['customer_id'], 'load_action': 'update' if row['customer_id'] in current else 'insert'}
    for row in data['staging_customers']
    if row['source_updated_at'] > '${tables.watermark}'
], key=lambda row: row['customer_id'])`,
    `current_dim_df = customer_dim_df.filter(F.col("is_current") == 1).select("customer_id").withColumn("known", F.lit(1))
result_df = staging_customers_df.filter(F.col("source_updated_at") > F.lit("${tables.watermark}")).join(current_dim_df, "customer_id", "left").withColumn("load_action", F.when(F.col("known").isNull(), F.lit("insert")).otherwise(F.lit("update"))).select("customer_id", "load_action").orderBy("customer_id")`,
    makePysparkRequirements(req.filter, req.join, req.withColumn, req.when, req.select),
  );
}

function incrementalOrderWatermarkFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["order_id", "updated_at"];
  return seed(
    context,
    [tables.orders],
    "pipeline-debugging",
    "Incremental order watermark",
    `Return orders updated after ${tables.watermark}.`,
    columns,
    (input) => sortRows(tableRows(input, "orders").filter((order) => String(order.updated_at) > tables.watermark).map((order) => ({ order_id: order.order_id, updated_at: order.updated_at })), [["order_id", "asc"]]),
    `SELECT order_id, updated_at
FROM orders
WHERE updated_at > '${tables.watermark}'
ORDER BY order_id;`,
    `result = sorted([
    {'order_id': order['order_id'], 'updated_at': order['updated_at']}
    for order in data['orders']
    if order['updated_at'] > '${tables.watermark}'
], key=lambda row: row['order_id'])`,
    `result_df = orders_df.filter(F.col("updated_at") > F.lit("${tables.watermark}")).select("order_id", "updated_at").orderBy("order_id")`,
    makePysparkRequirements(req.filter, req.select),
  );
}

function incrementalDeletesFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["customer_id", "change_id"];
  return seed(
    context,
    [tables.customerUpdates],
    "pipeline-debugging",
    "Incremental delete changes",
    "Return delete CDC records after the watermark.",
    columns,
    (input) => sortRows(tableRows(input, "customer_updates").filter((row) => row.op === "delete" && String(row.update_ts) > tables.watermark).map((row) => ({ customer_id: row.customer_id, change_id: row.change_id })), [["customer_id", "asc"]]),
    `SELECT customer_id, change_id
FROM customer_updates
WHERE op = 'delete' AND update_ts > '${tables.watermark}'
ORDER BY customer_id;`,
    `result = sorted([
    {'customer_id': row['customer_id'], 'change_id': row['change_id']}
    for row in data['customer_updates']
    if row['op'] == 'delete' and row['update_ts'] > '${tables.watermark}'
], key=lambda row: row['customer_id'])`,
    `result_df = customer_updates_df.filter((F.col("op") == "delete") & (F.col("update_ts") > F.lit("${tables.watermark}"))).select("customer_id", "change_id").orderBy("customer_id")`,
    makePysparkRequirements(req.filter, req.select),
  );
}

function duplicateFactOrdersFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["order_id", "fact_rows"];
  return seed(
    context,
    [tables.factOrders],
    "advanced-validation",
    "Duplicate fact order grain",
    "Return order_ids that appear more than once in fact_orders.",
    columns,
    (input) => {
      const counts = new Map<ArcadePrimitive, number>();
      for (const row of tableRows(input, "fact_orders")) counts.set(row.order_id, (counts.get(row.order_id) ?? 0) + 1);
      return sortRows([...counts.entries()].filter(([, fact_rows]) => fact_rows > 1).map(([order_id, fact_rows]) => ({ order_id, fact_rows })), [["order_id", "asc"]]);
    },
    `SELECT order_id, COUNT(*) AS fact_rows
FROM fact_orders
GROUP BY order_id
HAVING COUNT(*) > 1
ORDER BY order_id;`,
    `counts = {}
for row in data['fact_orders']:
    counts[row['order_id']] = counts.get(row['order_id'], 0) + 1
result = sorted([
    {'order_id': order_id, 'fact_rows': count}
    for order_id, count in counts.items()
    if count > 1
], key=lambda row: row['order_id'])`,
    `result_df = fact_orders_df.groupBy("order_id").agg(F.count("*").alias("fact_rows")).filter(F.col("fact_rows") > 1).select("order_id", "fact_rows").orderBy("order_id")`,
    makePysparkRequirements(req.group, req.agg, req.alias, req.filter, req.select),
  );
}

function orphanFactCustomerFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["fact_order_id", "customer_sk"];
  return seed(
    context,
    [tables.factOrders, tables.customerDim],
    "source-target-checks",
    "Orphan fact customer keys",
    "Return fact rows whose customer_sk is missing from customer_dim.",
    columns,
    (input) => {
      const dimKeys = new Set(tableRows(input, "customer_dim").map((row) => row.customer_sk));
      return sortRows(tableRows(input, "fact_orders").filter((fact) => !dimKeys.has(fact.customer_sk)).map((fact) => ({ fact_order_id: fact.fact_order_id, customer_sk: fact.customer_sk })), [["fact_order_id", "asc"]]);
    },
    `SELECT f.fact_order_id, f.customer_sk
FROM fact_orders f
LEFT JOIN customer_dim d ON d.customer_sk = f.customer_sk
WHERE d.customer_sk IS NULL
ORDER BY f.fact_order_id;`,
    `dim_keys = {row['customer_sk'] for row in data['customer_dim']}
result = sorted([
    {'fact_order_id': fact['fact_order_id'], 'customer_sk': fact['customer_sk']}
    for fact in data['fact_orders']
    if fact['customer_sk'] not in dim_keys
], key=lambda row: row['fact_order_id'])`,
    `result_df = fact_orders_df.join(customer_dim_df.select("customer_sk"), "customer_sk", "left_anti").select("fact_order_id", "customer_sk").orderBy("fact_order_id")`,
    makePysparkRequirements(req.join, req.select),
  );
}

function factAmountMismatchFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["order_id", "source_amount", "fact_amount", "gap"];
  return seed(
    context,
    [tables.orders, tables.factOrders],
    "metric-investigation",
    "Fact amount reconciliation",
    "Return fact rows where source order amount does not match fact amount.",
    columns,
    (input) => {
      const orders = byKey(tableRows(input, "orders"), "order_id");
      return sortRows(tableRows(input, "fact_orders").map((fact) => {
        const order = orders.get(fact.order_id);
        if (!order) return null;
        const gap = sum([Number(order.amount) - Number(fact.amount)]);
        return gap !== 0 ? { order_id: fact.order_id, source_amount: order.amount, fact_amount: fact.amount, gap } : null;
      }).filter(Boolean) as ArcadeRow[], [["order_id", "asc"], ["fact_amount", "asc"]]);
    },
    `SELECT f.order_id, o.amount AS source_amount, f.amount AS fact_amount,
       ROUND(o.amount - f.amount, 2) AS gap
FROM fact_orders f
JOIN orders o ON o.order_id = f.order_id
WHERE ROUND(o.amount - f.amount, 2) <> 0
ORDER BY f.order_id, f.amount;`,
    `orders = {row['order_id']: row for row in data['orders']}
result = []
for fact in data['fact_orders']:
    order = orders.get(fact['order_id'])
    if order:
        gap = round(order['amount'] - fact['amount'], 2)
        if gap != 0:
            result.append({'order_id': fact['order_id'], 'source_amount': order['amount'], 'fact_amount': fact['amount'], 'gap': gap})
result = sorted(result, key=lambda row: (row['order_id'], row['fact_amount']))`,
    `result_df = fact_orders_df.join(orders_df, "order_id").withColumn("gap", F.round(F.col("orders.amount") - F.col("fact_orders.amount"), 2)).filter(F.col("gap") != 0).select("order_id", F.col("orders.amount").alias("source_amount"), F.col("fact_orders.amount").alias("fact_amount"), "gap").orderBy("order_id", "fact_amount")`,
    makePysparkRequirements(req.join, req.withColumn, req.filter, req.select, req.alias),
  );
}

function orphanFactOrderFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["fact_order_id", "order_id"];
  return seed(
    context,
    [tables.factOrders, tables.orders],
    "source-target-checks",
    "Orphan fact order ids",
    "Return fact rows whose order_id is missing from source orders.",
    columns,
    (input) => {
      const orderIds = new Set(tableRows(input, "orders").map((row) => row.order_id));
      return sortRows(tableRows(input, "fact_orders").filter((fact) => !orderIds.has(fact.order_id)).map((fact) => ({ fact_order_id: fact.fact_order_id, order_id: fact.order_id })), [["fact_order_id", "asc"]]);
    },
    `SELECT f.fact_order_id, f.order_id
FROM fact_orders f
LEFT JOIN orders o ON o.order_id = f.order_id
WHERE o.order_id IS NULL
ORDER BY f.fact_order_id;`,
    `order_ids = {row['order_id'] for row in data['orders']}
result = sorted([
    {'fact_order_id': fact['fact_order_id'], 'order_id': fact['order_id']}
    for fact in data['fact_orders']
    if fact['order_id'] not in order_ids
], key=lambda row: row['fact_order_id'])`,
    `result_df = fact_orders_df.join(orders_df.select("order_id"), "order_id", "left_anti").select("fact_order_id", "order_id").orderBy("fact_order_id")`,
    makePysparkRequirements(req.join, req.select),
  );
}

function dailyMetricReconciliationFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["metric_date", "source_value", "target_value", "gap"];
  return seed(
    context,
    [tables.sourceMetrics, tables.targetMetrics],
    "metric-investigation",
    "Daily metric reconciliation",
    "Return daily metrics where source and target values differ.",
    columns,
    (input) => {
      const targets = new Map(tableRows(input, "target_metrics").map((row) => [`${row.metric_date}|${row.metric_name}`, row]));
      return sortRows(tableRows(input, "source_metrics").map((source) => {
        const target = targets.get(`${source.metric_date}|${source.metric_name}`);
        const gap = target ? sum([Number(source.metric_value) - Number(target.metric_value)]) : 0;
        return target && gap !== 0 ? { metric_date: source.metric_date, source_value: source.metric_value, target_value: target.metric_value, gap } : null;
      }).filter(Boolean) as ArcadeRow[], [["metric_date", "asc"]]);
    },
    `SELECT s.metric_date, s.metric_value AS source_value, t.metric_value AS target_value,
       ROUND(s.metric_value - t.metric_value, 2) AS gap
FROM source_metrics s
JOIN target_metrics t ON t.metric_date = s.metric_date AND t.metric_name = s.metric_name
WHERE ROUND(s.metric_value - t.metric_value, 2) <> 0
ORDER BY s.metric_date;`,
    `targets = {(row['metric_date'], row['metric_name']): row for row in data['target_metrics']}
result = []
for source in data['source_metrics']:
    target = targets.get((source['metric_date'], source['metric_name']))
    if target:
        gap = round(source['metric_value'] - target['metric_value'], 2)
        if gap != 0:
            result.append({'metric_date': source['metric_date'], 'source_value': source['metric_value'], 'target_value': target['metric_value'], 'gap': gap})
result = sorted(result, key=lambda row: row['metric_date'])`,
    `result_df = source_metrics_df.join(target_metrics_df, ["metric_date", "metric_name"]).withColumn("gap", F.round(F.col("source_metrics.metric_value") - F.col("target_metrics.metric_value"), 2)).filter(F.col("gap") != 0).select("metric_date", F.col("source_metrics.metric_value").alias("source_value"), F.col("target_metrics.metric_value").alias("target_value"), "gap").orderBy("metric_date")`,
    makePysparkRequirements(req.join, req.withColumn, req.filter, req.select, req.alias),
  );
}

function sessionizedEvents(input: TablesInput, gapMinutes: number): Array<ArcadeRow & { session_index: number }> {
  const events = sortRows(tableRows(input, "events"), [["user_id", "asc"], ["event_ts", "asc"], ["event_id", "asc"]]);
  const state = new Map<ArcadePrimitive, { lastTs: ArcadePrimitive; sessionIndex: number }>();
  return events.map((event) => {
    const prior = state.get(event.user_id);
    const gap = prior ? minutesBetween(prior.lastTs, event.event_ts) : null;
    const sessionIndex = !prior || gap === null || gap > gapMinutes ? (prior?.sessionIndex ?? 0) + 1 : prior.sessionIndex;
    state.set(event.user_id, { lastTs: event.event_ts, sessionIndex });
    return { ...event, session_index: sessionIndex } as ArcadeRow & { session_index: number };
  });
}

function eventSessionNumberFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const gap = 30 + (context.variant % 2) * 15;
  const columns = ["event_id", "user_id", "session_index"];
  return seed(
    context,
    [tables.events],
    "window-logic",
    "Event session numbers",
    `Return session_index per event using a new session when the gap is greater than ${gap} minutes.`,
    columns,
    (input) => sessionizedEvents(input, gap).map((event) => ({ event_id: event.event_id, user_id: event.user_id, session_index: event.session_index })),
    `WITH ordered AS (
  SELECT event_id, user_id, event_ts,
         LAG(event_ts) OVER (PARTITION BY user_id ORDER BY event_ts, event_id) AS prev_ts
  FROM events
),
flagged AS (
  SELECT event_id, user_id, event_ts,
         CASE WHEN prev_ts IS NULL OR (julianday(event_ts) - julianday(prev_ts)) * 24 * 60 > ${gap} THEN 1 ELSE 0 END AS new_session
  FROM ordered
)
SELECT event_id, user_id,
       SUM(new_session) OVER (PARTITION BY user_id ORDER BY event_ts, event_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS session_index
FROM flagged
ORDER BY user_id, event_ts, event_id;`,
    `from datetime import datetime
events = sorted(data['events'], key=lambda row: (row['user_id'], row['event_ts'], row['event_id']))
state = {}
result = []
for event in events:
    prior = state.get(event['user_id'])
    if prior is None or (datetime.fromisoformat(event['event_ts']) - datetime.fromisoformat(prior[0])).total_seconds() / 60 > ${gap}:
        session_index = (prior[1] if prior else 0) + 1
    else:
        session_index = prior[1]
    state[event['user_id']] = (event['event_ts'], session_index)
    result.append({'event_id': event['event_id'], 'user_id': event['user_id'], 'session_index': session_index})`,
    `w = Window.partitionBy("user_id").orderBy("event_ts", "event_id")
flagged_df = events_df.withColumn("prev_ts", F.lag("event_ts").over(w)).withColumn("new_session", F.when(F.col("prev_ts").isNull() | (F.unix_timestamp("event_ts") - F.unix_timestamp("prev_ts") > ${gap} * 60), F.lit(1)).otherwise(F.lit(0)))
result_df = flagged_df.withColumn("session_index", F.sum("new_session").over(w.rowsBetween(Window.unboundedPreceding, Window.currentRow))).select("event_id", "user_id", "session_index").orderBy("user_id", "event_ts", "event_id")`,
    makePysparkRequirements(req.window, req.over, req.withColumn, req.when, req.select),
  );
}

function sessionDurationFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const gap = 30 + (context.variant % 2) * 15;
  const columns = ["user_id", "session_index", "duration_minutes"];
  return seed(
    context,
    [tables.events],
    "rolling-metrics",
    "Session duration metrics",
    `Return duration_minutes for each session using a ${gap}-minute gap rule.`,
    columns,
    (input) => {
      const sessions = new Map<string, ArcadeRow[]>();
      for (const event of sessionizedEvents(input, gap)) {
        const key = `${event.user_id}|${event.session_index}`;
        sessions.set(key, [...(sessions.get(key) ?? []), event]);
      }
      return sortRows([...sessions.entries()].map(([key, events]) => {
        const [userId, sessionIndex] = key.split("|");
        const ordered = sortRows(events, [["event_ts", "asc"]]);
        return { user_id: Number(userId), session_index: Number(sessionIndex), duration_minutes: minutesBetween(ordered[0].event_ts, ordered.at(-1)?.event_ts ?? ordered[0].event_ts) ?? 0 };
      }), [["user_id", "asc"], ["session_index", "asc"]]);
    },
    `WITH ordered AS (
  SELECT event_id, user_id, event_ts,
         LAG(event_ts) OVER (PARTITION BY user_id ORDER BY event_ts, event_id) AS prev_ts
  FROM events
),
flagged AS (
  SELECT event_id, user_id, event_ts,
         CASE WHEN prev_ts IS NULL OR (julianday(event_ts) - julianday(prev_ts)) * 24 * 60 > ${gap} THEN 1 ELSE 0 END AS new_session
  FROM ordered
),
sessionized AS (
  SELECT event_id, user_id, event_ts,
         SUM(new_session) OVER (PARTITION BY user_id ORDER BY event_ts, event_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS session_index
  FROM flagged
)
SELECT user_id, session_index,
       CAST((julianday(MAX(event_ts)) - julianday(MIN(event_ts))) * 24 * 60 AS INTEGER) AS duration_minutes
FROM sessionized
GROUP BY user_id, session_index
ORDER BY user_id, session_index;`,
    `from datetime import datetime
sessionized = []
state = {}
for event in sorted(data['events'], key=lambda row: (row['user_id'], row['event_ts'], row['event_id'])):
    prior = state.get(event['user_id'])
    if prior is None or (datetime.fromisoformat(event['event_ts']) - datetime.fromisoformat(prior[0])).total_seconds() / 60 > ${gap}:
        session_index = (prior[1] if prior else 0) + 1
    else:
        session_index = prior[1]
    state[event['user_id']] = (event['event_ts'], session_index)
    sessionized.append({**event, 'session_index': session_index})
groups = {}
for event in sessionized:
    groups.setdefault((event['user_id'], event['session_index']), []).append(event['event_ts'])
result = sorted([
    {'user_id': user_id, 'session_index': session_index, 'duration_minutes': int((datetime.fromisoformat(max(times)) - datetime.fromisoformat(min(times))).total_seconds() / 60)}
    for (user_id, session_index), times in groups.items()
], key=lambda row: (row['user_id'], row['session_index']))`,
    `w = Window.partitionBy("user_id").orderBy("event_ts", "event_id")
flagged_df = events_df.withColumn("prev_ts", F.lag("event_ts").over(w)).withColumn("new_session", F.when(F.col("prev_ts").isNull() | (F.unix_timestamp("event_ts") - F.unix_timestamp("prev_ts") > ${gap} * 60), F.lit(1)).otherwise(F.lit(0)))
sessionized_df = flagged_df.withColumn("session_index", F.sum("new_session").over(w.rowsBetween(Window.unboundedPreceding, Window.currentRow)))
result_df = sessionized_df.groupBy("user_id", "session_index").agg(((F.unix_timestamp(F.max("event_ts")) - F.unix_timestamp(F.min("event_ts"))) / 60).cast("int").alias("duration_minutes")).select("user_id", "session_index", "duration_minutes").orderBy("user_id", "session_index")`,
    makePysparkRequirements(req.window, req.over, req.withColumn, req.when, req.group, req.agg, req.alias, req.select),
  );
}

function firstLastEventFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["user_id", "first_event", "last_event"];
  return seed(
    context,
    [tables.events],
    "first-last-event",
    "First and last event per user",
    "Return each user's first_event and last_event by event time.",
    columns,
    (input) => {
      const grouped = new Map<ArcadePrimitive, ArcadeRow[]>();
      for (const event of tableRows(input, "events")) grouped.set(event.user_id, [...(grouped.get(event.user_id) ?? []), event]);
      return sortRows([...grouped.entries()].map(([user_id, events]) => {
        const ordered = sortRows(events, [["event_ts", "asc"], ["event_id", "asc"]]);
        return { user_id, first_event: ordered[0].event_type, last_event: ordered.at(-1)?.event_type ?? null };
      }), [["user_id", "asc"]]);
    },
    `WITH ranked AS (
  SELECT user_id, event_type, event_ts, event_id,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_ts, event_id) AS first_rn,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_ts DESC, event_id DESC) AS last_rn
  FROM events
)
SELECT f.user_id, f.event_type AS first_event, l.event_type AS last_event
FROM ranked f
JOIN ranked l ON l.user_id = f.user_id AND l.last_rn = 1
WHERE f.first_rn = 1
ORDER BY f.user_id;`,
    `groups = {}
for event in data['events']:
    groups.setdefault(event['user_id'], []).append(event)
result = []
for user_id, events in groups.items():
    ordered = sorted(events, key=lambda row: (row['event_ts'], row['event_id']))
    result.append({'user_id': user_id, 'first_event': ordered[0]['event_type'], 'last_event': ordered[-1]['event_type']})
result = sorted(result, key=lambda row: row['user_id'])`,
    `w_first = Window.partitionBy("user_id").orderBy("event_ts", "event_id")
w_last = Window.partitionBy("user_id").orderBy(F.col("event_ts").desc(), F.col("event_id").desc())
ranked_df = events_df.withColumn("first_rn", F.row_number().over(w_first)).withColumn("last_rn", F.row_number().over(w_last))
result_df = ranked_df.filter((F.col("first_rn") == 1) | (F.col("last_rn") == 1)).groupBy("user_id").agg(F.first(F.when(F.col("first_rn") == 1, F.col("event_type")), ignorenulls=True).alias("first_event"), F.first(F.when(F.col("last_rn") == 1, F.col("event_type")), ignorenulls=True).alias("last_event")).select("user_id", "first_event", "last_event").orderBy("user_id")`,
    makePysparkRequirements(req.window, req.rowNumber, req.over, req.withColumn, req.filter, req.group, req.agg, req.alias, req.select),
  );
}

function largeEventGapFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const gap = 30 + (context.variant % 2) * 15;
  const columns = ["event_id", "user_id", "gap_minutes"];
  return seed(
    context,
    [tables.events],
    "anomaly-detection",
    "Large event gaps",
    `Return events whose gap from the previous user event is greater than ${gap} minutes.`,
    columns,
    (input) => {
      const events = sortRows(tableRows(input, "events"), [["user_id", "asc"], ["event_ts", "asc"], ["event_id", "asc"]]);
      const prior = new Map<ArcadePrimitive, ArcadeRow>();
      const rows: ArcadeRow[] = [];
      for (const event of events) {
        const previous = prior.get(event.user_id);
        const gapMinutes = previous ? minutesBetween(previous.event_ts, event.event_ts) : null;
        if (gapMinutes !== null && gapMinutes > gap) rows.push({ event_id: event.event_id, user_id: event.user_id, gap_minutes: gapMinutes });
        prior.set(event.user_id, event);
      }
      return rows;
    },
    `WITH ordered AS (
  SELECT event_id, user_id, event_ts,
         LAG(event_ts) OVER (PARTITION BY user_id ORDER BY event_ts, event_id) AS prev_ts
  FROM events
)
SELECT event_id, user_id,
       CAST((julianday(event_ts) - julianday(prev_ts)) * 24 * 60 AS INTEGER) AS gap_minutes
FROM ordered
WHERE prev_ts IS NOT NULL AND (julianday(event_ts) - julianday(prev_ts)) * 24 * 60 > ${gap}
ORDER BY user_id, event_ts, event_id;`,
    `from datetime import datetime
prior = {}
result = []
for event in sorted(data['events'], key=lambda row: (row['user_id'], row['event_ts'], row['event_id'])):
    previous = prior.get(event['user_id'])
    if previous:
        gap_minutes = int((datetime.fromisoformat(event['event_ts']) - datetime.fromisoformat(previous['event_ts'])).total_seconds() / 60)
        if gap_minutes > ${gap}:
            result.append({'event_id': event['event_id'], 'user_id': event['user_id'], 'gap_minutes': gap_minutes})
    prior[event['user_id']] = event`,
    `w = Window.partitionBy("user_id").orderBy("event_ts", "event_id")
result_df = events_df.withColumn("prev_ts", F.lag("event_ts").over(w)).withColumn("gap_minutes", ((F.unix_timestamp("event_ts") - F.unix_timestamp("prev_ts")) / 60).cast("int")).filter(F.col("gap_minutes") > ${gap}).select("event_id", "user_id", "gap_minutes").orderBy("user_id", "event_ts", "event_id")`,
    makePysparkRequirements(req.window, req.over, req.withColumn, req.filter, req.select),
  );
}

function ingestBeforeEventFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["event_id", "event_ts", "ingest_ts"];
  return seed(
    context,
    [tables.events],
    "advanced-validation",
    "Invalid ingest ordering",
    "Return events where ingest_ts is earlier than event_ts.",
    columns,
    (input) => sortRows(tableRows(input, "events").filter((event) => String(event.ingest_ts) < String(event.event_ts)).map((event) => ({ event_id: event.event_id, event_ts: event.event_ts, ingest_ts: event.ingest_ts })), [["event_id", "asc"]]),
    `SELECT event_id, event_ts, ingest_ts
FROM events
WHERE ingest_ts < event_ts
ORDER BY event_id;`,
    `result = sorted([
    {'event_id': event['event_id'], 'event_ts': event['event_ts'], 'ingest_ts': event['ingest_ts']}
    for event in data['events']
    if event['ingest_ts'] < event['event_ts']
], key=lambda row: row['event_id'])`,
    `result_df = events_df.filter(F.col("ingest_ts") < F.col("event_ts")).select("event_id", "event_ts", "ingest_ts").orderBy("event_id")`,
    makePysparkRequirements(req.filter, req.select),
  );
}

function lateArrivingDataFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const maxDays = 1 + (context.variant % 2);
  const columns = ["event_id", "arrival_lag_days"];
  return seed(
    context,
    [tables.events],
    "anomaly-detection",
    `Late arriving data over ${maxDays} days`,
    `Return events with ingest lag greater than ${maxDays} days.`,
    columns,
    (input) => sortRows(tableRows(input, "events").map((event) => {
      const lag = daysBetween(event.event_ts, event.ingest_ts);
      return lag !== null && lag > maxDays ? { event_id: event.event_id, arrival_lag_days: lag } : null;
    }).filter(Boolean) as ArcadeRow[], [["event_id", "asc"]]),
    `SELECT event_id,
       CAST(julianday(ingest_ts) - julianday(event_ts) AS INTEGER) AS arrival_lag_days
FROM events
WHERE CAST(julianday(ingest_ts) - julianday(event_ts) AS INTEGER) > ${maxDays}
ORDER BY event_id;`,
    `from datetime import datetime
result = []
for event in data['events']:
    lag = (datetime.fromisoformat(event['ingest_ts']) - datetime.fromisoformat(event['event_ts'])).days
    if lag > ${maxDays}:
        result.append({'event_id': event['event_id'], 'arrival_lag_days': lag})
result = sorted(result, key=lambda row: row['event_id'])`,
    `result_df = events_df.withColumn("arrival_lag_days", F.datediff(F.to_date("ingest_ts"), F.to_date("event_ts"))).filter(F.col("arrival_lag_days") > ${maxDays}).select("event_id", "arrival_lag_days").orderBy("event_id")`,
    makePysparkRequirements(req.withColumn, req.date, req.filter, req.select),
  );
}

function wrongPartitionDateFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["event_id", "event_date", "partition_date"];
  return seed(
    context,
    [tables.events],
    "pipeline-debugging",
    "Incorrect event partition date",
    "Return events whose partition_date does not match the event date.",
    columns,
    (input) => sortRows(tableRows(input, "events").filter((event) => datePart(event.event_ts) !== event.partition_date).map((event) => ({ event_id: event.event_id, event_date: datePart(event.event_ts), partition_date: event.partition_date })), [["event_id", "asc"]]),
    `SELECT event_id, SUBSTR(event_ts, 1, 10) AS event_date, partition_date
FROM events
WHERE partition_date <> SUBSTR(event_ts, 1, 10)
ORDER BY event_id;`,
    `result = sorted([
    {'event_id': event['event_id'], 'event_date': event['event_ts'][:10], 'partition_date': event['partition_date']}
    for event in data['events']
    if event['partition_date'] != event['event_ts'][:10]
], key=lambda row: row['event_id'])`,
    `result_df = events_df.withColumn("event_date", F.to_date("event_ts")).filter(F.col("partition_date") != F.col("event_date")).select("event_id", "event_date", "partition_date").orderBy("event_id")`,
    makePysparkRequirements(req.withColumn, req.date, req.filter, req.select),
  );
}

function staleReferenceLookupFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["order_id", "pipeline_sk", "correct_sk"];
  return seed(
    context,
    [tables.pipelineOutput, tables.orders, tables.customerDim],
    "bad-join-debugging",
    "Stale dimension lookup in output",
    "Return pipeline rows whose customer_sk does not match the historical dimension for the order date.",
    columns,
    (input) => {
      const orders = byKey(tableRows(input, "orders"), "order_id");
      return sortRows(tableRows(input, "pipeline_output").map((row) => {
        const order = orders.get(row.order_id);
        if (!order) return null;
        const orderDate = datePart(order.order_ts);
        const correct = tableRows(input, "customer_dim").find((dim) =>
          dim.customer_id === order.customer_id &&
          String(dim.effective_from) <= orderDate &&
          (dim.effective_to === null || String(dim.effective_to) >= orderDate));
        return correct && correct.customer_sk !== row.customer_sk ? { order_id: row.order_id, pipeline_sk: row.customer_sk, correct_sk: correct.customer_sk } : null;
      }).filter(Boolean) as ArcadeRow[], [["order_id", "asc"]]);
    },
    `SELECT p.order_id, p.customer_sk AS pipeline_sk, d.customer_sk AS correct_sk
FROM pipeline_output p
JOIN orders o ON o.order_id = p.order_id
JOIN customer_dim d
  ON d.customer_id = o.customer_id
 AND d.effective_from <= SUBSTR(o.order_ts, 1, 10)
 AND (d.effective_to IS NULL OR d.effective_to >= SUBSTR(o.order_ts, 1, 10))
WHERE p.customer_sk <> d.customer_sk
ORDER BY p.order_id;`,
    `orders = {row['order_id']: row for row in data['orders']}
result = []
for row in data['pipeline_output']:
    order = orders.get(row['order_id'])
    if not order:
        continue
    order_date = order['order_ts'][:10]
    for dim in data['customer_dim']:
        if dim['customer_id'] == order['customer_id'] and dim['effective_from'] <= order_date and (dim['effective_to'] is None or dim['effective_to'] >= order_date):
            if row['customer_sk'] != dim['customer_sk']:
                result.append({'order_id': row['order_id'], 'pipeline_sk': row['customer_sk'], 'correct_sk': dim['customer_sk']})
            break
result = sorted(result, key=lambda row: row['order_id'])`,
    `result_df = pipeline_output_df.join(orders_df, "order_id").withColumn("order_date", F.to_date("order_ts")).join(customer_dim_df, (orders_df.customer_id == customer_dim_df.customer_id) & (F.col("effective_from") <= F.col("order_date")) & (F.col("effective_to").isNull() | (F.col("effective_to") >= F.col("order_date")))).filter(F.col("pipeline_output.customer_sk") != F.col("customer_dim.customer_sk")).select("order_id", F.col("pipeline_output.customer_sk").alias("pipeline_sk"), F.col("customer_dim.customer_sk").alias("correct_sk")).orderBy("order_id")`,
    makePysparkRequirements(req.join, req.withColumn, req.date, req.filter, req.select, req.alias),
  );
}

function pipelineAmountMismatchFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["order_id", "source_amount", "output_amount", "gap"];
  return seed(
    context,
    [tables.orders, tables.pipelineOutput],
    "metric-investigation",
    "Pipeline amount mismatch",
    "Return pipeline output rows where amount differs from the source order.",
    columns,
    (input) => {
      const output = byKey(tableRows(input, "pipeline_output"), "order_id");
      return sortRows(tableRows(input, "orders").map((order) => {
        const row = output.get(order.order_id);
        const gap = row ? sum([Number(order.amount) - Number(row.amount)]) : 0;
        return row && gap !== 0 ? { order_id: order.order_id, source_amount: order.amount, output_amount: row.amount, gap } : null;
      }).filter(Boolean) as ArcadeRow[], [["order_id", "asc"]]);
    },
    `SELECT o.order_id, o.amount AS source_amount, p.amount AS output_amount,
       ROUND(o.amount - p.amount, 2) AS gap
FROM orders o
JOIN pipeline_output p ON p.order_id = o.order_id
WHERE ROUND(o.amount - p.amount, 2) <> 0
ORDER BY o.order_id;`,
    `output = {row['order_id']: row for row in data['pipeline_output']}
result = []
for order in data['orders']:
    row = output.get(order['order_id'])
    if row:
        gap = round(order['amount'] - row['amount'], 2)
        if gap != 0:
            result.append({'order_id': order['order_id'], 'source_amount': order['amount'], 'output_amount': row['amount'], 'gap': gap})
result = sorted(result, key=lambda row: row['order_id'])`,
    `result_df = orders_df.join(pipeline_output_df, "order_id").withColumn("gap", F.round(F.col("orders.amount") - F.col("pipeline_output.amount"), 2)).filter(F.col("gap") != 0).select("order_id", F.col("orders.amount").alias("source_amount"), F.col("pipeline_output.amount").alias("output_amount"), "gap").orderBy("order_id")`,
    makePysparkRequirements(req.join, req.withColumn, req.filter, req.select, req.alias),
  );
}

function brokenStatusMappingFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildProductionTables(context);
  const columns = ["order_id", "source_status", "output_status"];
  return seed(
    context,
    [tables.orders, tables.pipelineOutput],
    "pipeline-debugging",
    "Broken status mapping",
    "Return pipeline rows where output status does not match source status.",
    columns,
    (input) => {
      const output = byKey(tableRows(input, "pipeline_output"), "order_id");
      return sortRows(tableRows(input, "orders").map((order) => {
        const row = output.get(order.order_id);
        return row && row.status !== order.status ? { order_id: order.order_id, source_status: order.status, output_status: row.status } : null;
      }).filter(Boolean) as ArcadeRow[], [["order_id", "asc"]]);
    },
    `SELECT o.order_id, o.status AS source_status, p.status AS output_status
FROM orders o
JOIN pipeline_output p ON p.order_id = o.order_id
WHERE p.status <> o.status
ORDER BY o.order_id;`,
    `output = {row['order_id']: row for row in data['pipeline_output']}
result = sorted([
    {'order_id': order['order_id'], 'source_status': order['status'], 'output_status': output[order['order_id']]['status']}
    for order in data['orders']
    if order['order_id'] in output and output[order['order_id']]['status'] != order['status']
], key=lambda row: row['order_id'])`,
    `result_df = orders_df.join(pipeline_output_df, "order_id").filter(F.col("pipeline_output.status") != F.col("orders.status")).select("order_id", F.col("orders.status").alias("source_status"), F.col("pipeline_output.status").alias("output_status")).orderBy("order_id")`,
    makePysparkRequirements(req.join, req.filter, req.select, req.alias),
  );
}

const worldThirteenFamilies: FamilyBuilder[] = [
  currentCustomerLookupFamily,
  historicalOrderDimensionFamily,
  duplicateCurrentDimensionFamily,
  missingHistoricalDimensionFamily,
  segmentHistoryChangeFamily,
];

const worldFourteenFamilies: FamilyBuilder[] = [
  changedRecordsAfterWatermarkFamily,
  latestCdcRecordFamily,
  insertUpdateClassFamily,
  incrementalOrderWatermarkFamily,
  incrementalDeletesFamily,
];

const worldFifteenFamilies: FamilyBuilder[] = [
  duplicateFactOrdersFamily,
  orphanFactCustomerFamily,
  factAmountMismatchFamily,
  orphanFactOrderFamily,
  dailyMetricReconciliationFamily,
];

const worldSixteenFamilies: FamilyBuilder[] = [
  eventSessionNumberFamily,
  sessionDurationFamily,
  firstLastEventFamily,
  largeEventGapFamily,
  ingestBeforeEventFamily,
];

const worldSeventeenFamilies: FamilyBuilder[] = [
  lateArrivingDataFamily,
  wrongPartitionDateFamily,
  staleReferenceLookupFamily,
  pipelineAmountMismatchFamily,
  brokenStatusMappingFamily,
];

const familiesByWorld: Record<number, FamilyBuilder[]> = {
  13: worldThirteenFamilies,
  14: worldFourteenFamilies,
  15: worldFifteenFamilies,
  16: worldSixteenFamilies,
  17: worldSeventeenFamilies,
};

function buildContext(worldNumber: number, familyIndex: number, variant: number): FamilyContext {
  const levelNumber = 601 + (worldNumber - 13) * 50 + familyIndex * 10 + variant;
  return {
    levelNumber,
    worldNumber,
    familyIndex,
    variant,
    threshold: 160 + (worldNumber - 13) * 20 + familyIndex * 9 + variant,
    minOrders: 2 + (variant % 3),
    days: 2 + ((familyIndex + variant) % 5),
    topN: 2 + (variant % 3),
    status: variant % 2 === 0 ? "paid" : "completed",
    country: ["US", "CA", "IN", "GB", "AU"][(familyIndex + variant) % 5],
    channel: ["web", "mobile", "store", "partner", "api"][(familyIndex + variant) % 5],
    month: variant % 2 === 0 ? "2026-07" : "2026-08",
  };
}

function buildAdvancedBundles() {
  const bundles: AdvancedArcadeLevelBundle[] = [];

  for (let worldNumber = 13; worldNumber <= 17; worldNumber += 1) {
    const families = familiesByWorld[worldNumber];
    for (let familyIndex = 0; familyIndex < families.length; familyIndex += 1) {
      for (let variant = 0; variant < 10; variant += 1) {
        bundles.push(buildBundle(families[familyIndex](buildContext(worldNumber, familyIndex, variant))));
      }
    }
  }

  return bundles;
}

export const arcadeWorldsThirteenSeventeenBundles = buildAdvancedBundles();

if (arcadeWorldsThirteenSeventeenBundles.length !== 250) {
  throw new Error(`Arcade Worlds 13-17 must contain 250 levels. Received ${arcadeWorldsThirteenSeventeenBundles.length}.`);
}

export const arcadeWorldsThirteenSeventeenBundleMap = new Map(
  arcadeWorldsThirteenSeventeenBundles.map((bundle) => [bundle.levelNumber, bundle] as const),
);

export function getArcadeWorldsThirteenSeventeenBundle(levelNumber: number) {
  return arcadeWorldsThirteenSeventeenBundleMap.get(levelNumber) ?? null;
}
