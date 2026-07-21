import {
  baseSeed,
  buildBundle,
  byKey,
  commonChecklist,
  commonExpected,
  daysBetween,
  makePysparkRequirements,
  req,
  sortRows,
  sum,
  table,
  tableRows,
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
  8: "World 8 advanced joins",
  9: "World 9 time series",
  10: "World 10 customer analytics",
  11: "World 11 data quality",
  12: "World 12 pipeline debugging",
};

function dateAdd(base: string, days: number) {
  const date = new Date(`${base}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function monthOf(value: ArcadePrimitive) {
  return String(value).slice(0, 7);
}

function buildHardTables(context: FamilyContext) {
  const offset = context.levelNumber * 100;
  const variant = context.variant;
  const baseDate = variant % 2 === 0 ? "2026-05-01" : "2026-06-01";
  const customers = [
    { customer_id: 1, customer_name: `Nova ${context.levelNumber}`, segment: "enterprise", country: "US", signup_date: dateAdd(baseDate, -90), status: "active" },
    { customer_id: 2, customer_name: `Orion ${context.levelNumber}`, segment: "smb", country: "CA", signup_date: dateAdd(baseDate, -70), status: "active" },
    { customer_id: 3, customer_name: `Pax ${context.levelNumber}`, segment: "mid-market", country: "IN", signup_date: dateAdd(baseDate, -45), status: "at_risk" },
    { customer_id: 4, customer_name: `Quinn ${context.levelNumber}`, segment: "enterprise", country: "GB", signup_date: dateAdd(baseDate, -20), status: "active" },
    { customer_id: 5, customer_name: `Rey ${context.levelNumber}`, segment: "smb", country: "AU", signup_date: dateAdd(baseDate, -12), status: "inactive" },
    { customer_id: 6, customer_name: `Sol ${context.levelNumber}`, segment: "mid-market", country: "US", signup_date: dateAdd(baseDate, -5), status: "active" },
  ];
  const orders = [
    { order_id: offset + 1, customer_id: 1, order_ts: `${dateAdd(baseDate, 0)}T09:00:00`, status: "paid", amount: 240 + variant * 8, channel: "web" },
    { order_id: offset + 2, customer_id: 1, order_ts: `${dateAdd(baseDate, 7)}T10:00:00`, status: "paid", amount: 120 + variant * 5, channel: "mobile" },
    { order_id: offset + 3, customer_id: 2, order_ts: `${dateAdd(baseDate, 9)}T11:00:00`, status: "refunded", amount: 80 + variant * 3, channel: "web" },
    { order_id: offset + 4, customer_id: 2, order_ts: `${dateAdd(baseDate, 18)}T12:00:00`, status: "paid", amount: 145 + variant * 4, channel: "store" },
    { order_id: offset + 5, customer_id: 3, order_ts: `${dateAdd(baseDate, 24)}T13:00:00`, status: "paid", amount: 310 + variant * 6, channel: "partner" },
    { order_id: offset + 6, customer_id: 4, order_ts: `${dateAdd(baseDate, 31)}T14:00:00`, status: "cancelled", amount: 60 + variant, channel: "api" },
    { order_id: offset + 7, customer_id: 4, order_ts: `${dateAdd(baseDate, 38)}T15:00:00`, status: "paid", amount: 500 + variant * 9, channel: "web" },
    { order_id: offset + 8, customer_id: 5, order_ts: `${dateAdd(baseDate, 46)}T16:00:00`, status: "paid", amount: 95 + variant * 2, channel: "mobile" },
    { order_id: offset + 9, customer_id: 99, order_ts: `${dateAdd(baseDate, 52)}T17:00:00`, status: "paid", amount: 77 + variant, channel: "api" },
    { order_id: offset + 10, customer_id: 6, order_ts: `${dateAdd(baseDate, 59)}T18:00:00`, status: "paid", amount: 190 + variant * 7, channel: "web" },
  ];
  const orderItems = [
    { order_id: offset + 1, product_id: 101, quantity: 2, unit_price: 70 + variant },
    { order_id: offset + 1, product_id: 102, quantity: 1, unit_price: 100 + variant },
    { order_id: offset + 2, product_id: 103, quantity: 3, unit_price: 40 + variant },
    { order_id: offset + 3, product_id: 104, quantity: 1, unit_price: 80 + variant },
    { order_id: offset + 4, product_id: 102, quantity: 1, unit_price: 145 + variant },
    { order_id: offset + 5, product_id: 105, quantity: 5, unit_price: 62 + variant },
    { order_id: offset + 7, product_id: 101, quantity: 4, unit_price: 125 + variant },
    { order_id: offset + 8, product_id: 106, quantity: 1, unit_price: 95 + variant },
    { order_id: offset + 10, product_id: 103, quantity: 2, unit_price: 95 + variant },
  ];
  const products = [
    { product_id: 101, category: "hardware", product_name: "Edge Router", active: 1, margin_rate: 0.3 },
    { product_id: 102, category: "software", product_name: "Sync License", active: 1, margin_rate: 0.55 },
    { product_id: 103, category: "analytics", product_name: "Insight Pack", active: 1, margin_rate: 0.42 },
    { product_id: 104, category: "support", product_name: "Care Plan", active: 0, margin_rate: 0.25 },
    { product_id: 105, category: "hardware", product_name: "Sensor Kit", active: 1, margin_rate: 0.34 },
  ];
  const promotions = [
    { promo_id: 1, campaign: "spring_launch", promo_type: "coupon", start_date: dateAdd(baseDate, -2), end_date: dateAdd(baseDate, 20) },
    { promo_id: 2, campaign: "retention_boost", promo_type: "credit", start_date: dateAdd(baseDate, 5), end_date: dateAdd(baseDate, 40) },
    { promo_id: 3, campaign: "enterprise_bundle", promo_type: "bundle", start_date: dateAdd(baseDate, 15), end_date: dateAdd(baseDate, 70) },
  ];
  const orderPromotions = [
    { order_id: offset + 1, promo_id: 1 },
    { order_id: offset + 1, promo_id: 3 },
    { order_id: offset + 2, promo_id: 1 },
    { order_id: offset + 4, promo_id: 2 },
    { order_id: offset + 5, promo_id: 2 },
    { order_id: offset + 5, promo_id: 3 },
    { order_id: offset + 7, promo_id: 3 },
    { order_id: offset + 10, promo_id: 99 },
  ];
  const events = [
    { event_id: offset + 201, customer_id: 1, entity_id: offset + 1, event_name: "order_created", event_ts: `${dateAdd(baseDate, 0)}T08:50:00`, ingest_ts: `${dateAdd(baseDate, 0)}T09:05:00`, source: "web" },
    { event_id: offset + 202, customer_id: 1, entity_id: offset + 1, event_name: "paid", event_ts: `${dateAdd(baseDate, 0)}T09:00:00`, ingest_ts: `${dateAdd(baseDate, 0)}T09:06:00`, source: "web" },
    { event_id: offset + 203, customer_id: 1, entity_id: offset + 2, event_name: "paid", event_ts: `${dateAdd(baseDate, 7)}T10:00:00`, ingest_ts: `${dateAdd(baseDate, 10)}T10:00:00`, source: "mobile" },
    { event_id: offset + 204, customer_id: 2, entity_id: offset + 4, event_name: "paid", event_ts: `${dateAdd(baseDate, 18)}T12:00:00`, ingest_ts: `${dateAdd(baseDate, 18)}T12:02:00`, source: "store" },
    { event_id: offset + 205, customer_id: 3, entity_id: offset + 5, event_name: "paid", event_ts: `${dateAdd(baseDate, 24)}T13:00:00`, ingest_ts: `${dateAdd(baseDate, 25)}T13:00:00`, source: "partner" },
    { event_id: offset + 206, customer_id: 4, entity_id: offset + 7, event_name: "shipment_started", event_ts: `${dateAdd(baseDate, 39)}T08:00:00`, ingest_ts: `${dateAdd(baseDate, 39)}T08:05:00`, source: "fulfillment" },
    { event_id: offset + 207, customer_id: 4, entity_id: offset + 7, event_name: "delivered", event_ts: `${dateAdd(baseDate, 43)}T08:00:00`, ingest_ts: `${dateAdd(baseDate, 43)}T08:01:00`, source: "fulfillment" },
    { event_id: offset + 208, customer_id: 6, entity_id: offset + 10, event_name: "paid", event_ts: `${dateAdd(baseDate, 59)}T18:00:00`, ingest_ts: `${dateAdd(baseDate, 65)}T18:00:00`, source: "web" },
  ];
  const shipments = [
    { shipment_id: offset + 301, order_id: offset + 1, shipped_ts: `${dateAdd(baseDate, 1)}T08:00:00`, delivered_ts: `${dateAdd(baseDate, 3)}T08:00:00`, carrier: "ups", promised_days: 3 },
    { shipment_id: offset + 302, order_id: offset + 2, shipped_ts: `${dateAdd(baseDate, 8)}T08:00:00`, delivered_ts: `${dateAdd(baseDate, 13)}T08:00:00`, carrier: "dhl", promised_days: 3 },
    { shipment_id: offset + 303, order_id: offset + 5, shipped_ts: `${dateAdd(baseDate, 25)}T08:00:00`, delivered_ts: `${dateAdd(baseDate, 27)}T08:00:00`, carrier: "fedex", promised_days: 2 },
    { shipment_id: offset + 304, order_id: offset + 7, shipped_ts: `${dateAdd(baseDate, 39)}T08:00:00`, delivered_ts: `${dateAdd(baseDate, 43)}T08:00:00`, carrier: "ups", promised_days: 2 },
  ];
  const rawOrders = [
    { raw_order_id: ` ${offset + 1} `, raw_customer_id: "1", raw_amount: String(240 + variant * 8), raw_status: " PAID ", raw_order_date: dateAdd(baseDate, 0) },
    { raw_order_id: `${offset + 2}`, raw_customer_id: "", raw_amount: "bad", raw_status: "paid", raw_order_date: dateAdd(baseDate, 7) },
    { raw_order_id: `${offset + 5}`, raw_customer_id: "3", raw_amount: String(310 + variant * 6), raw_status: "paid", raw_order_date: "not-a-date" },
    { raw_order_id: `${offset + 11}`, raw_customer_id: "7", raw_amount: "44", raw_status: "paid", raw_order_date: dateAdd(baseDate, 20) },
  ];
  const targetOrders = [
    { order_id: offset + 1, customer_id: 1, amount: 240 + variant * 8, status: "paid" },
    { order_id: offset + 2, customer_id: 2, amount: 119 + variant * 5, status: "paid" },
    { order_id: offset + 5, customer_id: 3, amount: 310 + variant * 6, status: "completed" },
    { order_id: offset + 99, customer_id: 8, amount: 10, status: "paid" },
  ];
  const sourceMetrics = [
    { metric_date: dateAdd(baseDate, 0), metric_name: "paid_revenue", metric_value: 240 + variant * 8 },
    { metric_date: dateAdd(baseDate, 7), metric_name: "paid_revenue", metric_value: 120 + variant * 5 },
    { metric_date: dateAdd(baseDate, 24), metric_name: "paid_revenue", metric_value: 310 + variant * 6 },
    { metric_date: dateAdd(baseDate, 38), metric_name: "paid_revenue", metric_value: 500 + variant * 9 },
  ];
  const targetMetrics = [
    { metric_date: dateAdd(baseDate, 0), metric_name: "paid_revenue", metric_value: 240 + variant * 8 },
    { metric_date: dateAdd(baseDate, 7), metric_name: "paid_revenue", metric_value: 121 + variant * 5 },
    { metric_date: dateAdd(baseDate, 24), metric_name: "paid_revenue", metric_value: 310 + variant * 6 },
  ];

  return {
    customers: table("customers", "customers_df", [
      { name: "customer_id", type: "INTEGER" },
      { name: "customer_name", type: "TEXT" },
      { name: "segment", type: "TEXT" },
      { name: "country", type: "TEXT" },
      { name: "signup_date", type: "TEXT" },
      { name: "status", type: "TEXT" },
    ], customers),
    orders: table("orders", "orders_df", [
      { name: "order_id", type: "INTEGER" },
      { name: "customer_id", type: "INTEGER" },
      { name: "order_ts", type: "TEXT" },
      { name: "status", type: "TEXT" },
      { name: "amount", type: "REAL" },
      { name: "channel", type: "TEXT" },
    ], orders),
    orderItems: table("order_items", "order_items_df", [
      { name: "order_id", type: "INTEGER" },
      { name: "product_id", type: "INTEGER" },
      { name: "quantity", type: "INTEGER" },
      { name: "unit_price", type: "REAL" },
    ], orderItems),
    products: table("products", "products_df", [
      { name: "product_id", type: "INTEGER" },
      { name: "category", type: "TEXT" },
      { name: "product_name", type: "TEXT" },
      { name: "active", type: "INTEGER" },
      { name: "margin_rate", type: "REAL" },
    ], products),
    promotions: table("promotions", "promotions_df", [
      { name: "promo_id", type: "INTEGER" },
      { name: "campaign", type: "TEXT" },
      { name: "promo_type", type: "TEXT" },
      { name: "start_date", type: "TEXT" },
      { name: "end_date", type: "TEXT" },
    ], promotions),
    orderPromotions: table("order_promotions", "order_promotions_df", [
      { name: "order_id", type: "INTEGER" },
      { name: "promo_id", type: "INTEGER" },
    ], orderPromotions),
    events: table("events", "events_df", [
      { name: "event_id", type: "INTEGER" },
      { name: "customer_id", type: "INTEGER" },
      { name: "entity_id", type: "INTEGER" },
      { name: "event_name", type: "TEXT" },
      { name: "event_ts", type: "TEXT" },
      { name: "ingest_ts", type: "TEXT" },
      { name: "source", type: "TEXT" },
    ], events),
    shipments: table("shipments", "shipments_df", [
      { name: "shipment_id", type: "INTEGER" },
      { name: "order_id", type: "INTEGER" },
      { name: "shipped_ts", type: "TEXT" },
      { name: "delivered_ts", type: "TEXT" },
      { name: "carrier", type: "TEXT" },
      { name: "promised_days", type: "INTEGER" },
    ], shipments),
    rawOrders: table("raw_orders", "raw_orders_df", [
      { name: "raw_order_id", type: "TEXT" },
      { name: "raw_customer_id", type: "TEXT" },
      { name: "raw_amount", type: "TEXT" },
      { name: "raw_status", type: "TEXT" },
      { name: "raw_order_date", type: "TEXT" },
    ], rawOrders),
    targetOrders: table("target_orders", "target_orders_df", [
      { name: "order_id", type: "INTEGER" },
      { name: "customer_id", type: "INTEGER" },
      { name: "amount", type: "REAL" },
      { name: "status", type: "TEXT" },
    ], targetOrders),
    sourceMetrics: table("source_metrics", "source_metrics_df", [
      { name: "metric_date", type: "TEXT" },
      { name: "metric_name", type: "TEXT" },
      { name: "metric_value", type: "REAL" },
    ], sourceMetrics),
    targetMetrics: table("target_metrics", "target_metrics_df", [
      { name: "metric_date", type: "TEXT" },
      { name: "metric_name", type: "TEXT" },
      { name: "metric_value", type: "REAL" },
    ], targetMetrics),
  };
}

function paidOrders(input: TablesInput) {
  return tableRows(input, "orders").filter((order) => order.status === "paid");
}

function itemRevenue(item: ArcadeRow) {
  return Number(item.quantity) * Number(item.unit_price);
}

function seed(
  context: FamilyContext,
  tables: ArcadeTableFixture[],
  category: AdvancedSeed["category"],
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
    businessContext: "Advanced data-engineering validation task.",
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

function campaignDistinctRevenueFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["campaign", "paid_revenue"];
  return seed(
    context,
    [tables.orderPromotions, tables.promotions, tables.orders],
    "multi-table-joins",
    "Campaign distinct paid revenue",
    "Return paid order revenue by campaign without double counting bridge rows.",
    columns,
    (input) => {
      const orders = byKey(paidOrders(input), "order_id");
      const promotions = byKey(tableRows(input, "promotions"), "promo_id");
      const seen = new Set<string>();
      const grouped = new Map<string, number>();
      for (const bridge of tableRows(input, "order_promotions")) {
        const order = orders.get(bridge.order_id);
        const promo = promotions.get(bridge.promo_id);
        if (!order || !promo) continue;
        const key = `${promo.campaign}|${order.order_id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        grouped.set(String(promo.campaign), (grouped.get(String(promo.campaign)) ?? 0) + Number(order.amount));
      }
      return sortRows([...grouped.entries()].map(([campaign, paid_revenue]) => ({ campaign, paid_revenue: sum([paid_revenue]) })), [["campaign", "asc"]]);
    },
    `SELECT p.campaign, SUM(o.amount) AS paid_revenue
FROM (
  SELECT DISTINCT op.order_id, op.promo_id
  FROM order_promotions op
) op
JOIN promotions p ON p.promo_id = op.promo_id
JOIN orders o ON o.order_id = op.order_id
WHERE o.status = 'paid'
GROUP BY p.campaign
ORDER BY p.campaign;`,
    `orders = {row['order_id']: row for row in data['orders'] if row['status'] == 'paid'}
promotions = {row['promo_id']: row for row in data['promotions']}
seen = set()
grouped = {}
for bridge in data['order_promotions']:
    order = orders.get(bridge['order_id'])
    promo = promotions.get(bridge['promo_id'])
    if order and promo:
        key = (promo['campaign'], order['order_id'])
        if key not in seen:
            seen.add(key)
            grouped[promo['campaign']] = grouped.get(promo['campaign'], 0) + order['amount']
result = sorted([
    {'campaign': campaign, 'paid_revenue': round(value, 2)}
    for campaign, value in grouped.items()
], key=lambda row: row['campaign'])`,
    `dedup_promos_df = order_promotions_df.select("order_id", "promo_id").distinct()
result_df = dedup_promos_df.join(promotions_df, "promo_id").join(orders_df, "order_id").filter(F.col("status") == "paid").groupBy("campaign").agg(F.sum("amount").alias("paid_revenue")).select("campaign", "paid_revenue").orderBy("campaign")`,
    makePysparkRequirements(req.select, { label: "dedupe bridge", anyOf: [".distinct(", ".dropDuplicates("] }, req.join, req.filter, req.group, req.agg, req.alias),
  );
}

function categoryCampaignOrderCountFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["category", "campaign", "order_count"];
  return seed(
    context,
    [tables.orderItems, tables.products, tables.orderPromotions, tables.promotions, tables.orders],
    "joined-aggregation",
    "Category campaign order count",
    "Return distinct paid order counts by product category and campaign.",
    columns,
    (input) => {
      const products = byKey(tableRows(input, "products"), "product_id");
      const promos = byKey(tableRows(input, "promotions"), "promo_id");
      const paid = new Set(paidOrders(input).map((order) => order.order_id));
      const categories = new Map<ArcadePrimitive, Set<string>>();
      for (const item of tableRows(input, "order_items")) {
        const product = products.get(item.product_id);
        if (product && paid.has(item.order_id)) categories.set(item.order_id, (categories.get(item.order_id) ?? new Set()).add(String(product.category)));
      }
      const buckets = new Map<string, Set<ArcadePrimitive>>();
      for (const bridge of tableRows(input, "order_promotions")) {
        const promo = promos.get(bridge.promo_id);
        const cats = categories.get(bridge.order_id);
        if (!promo || !cats) continue;
        for (const category of cats) {
          const key = `${category}|${promo.campaign}`;
          buckets.set(key, (buckets.get(key) ?? new Set()).add(bridge.order_id));
        }
      }
      return sortRows([...buckets.entries()].map(([key, ids]) => {
        const [category, campaign] = key.split("|");
        return { category, campaign, order_count: ids.size };
      }), [["category", "asc"], ["campaign", "asc"]]);
    },
    `WITH paid_items AS (
  SELECT DISTINCT i.order_id, p.category
  FROM order_items i
  JOIN products p ON p.product_id = i.product_id
  JOIN orders o ON o.order_id = i.order_id
  WHERE o.status = 'paid'
)
SELECT pi.category, pr.campaign, COUNT(DISTINCT pi.order_id) AS order_count
FROM paid_items pi
JOIN order_promotions op ON op.order_id = pi.order_id
JOIN promotions pr ON pr.promo_id = op.promo_id
GROUP BY pi.category, pr.campaign
ORDER BY pi.category, pr.campaign;`,
    `products = {row['product_id']: row for row in data['products']}
paid_ids = {row['order_id'] for row in data['orders'] if row['status'] == 'paid'}
promos = {row['promo_id']: row for row in data['promotions']}
categories = {}
for item in data['order_items']:
    if item['order_id'] in paid_ids and item['product_id'] in products:
        categories.setdefault(item['order_id'], set()).add(products[item['product_id']]['category'])
buckets = {}
for bridge in data['order_promotions']:
    if bridge['order_id'] in categories and bridge['promo_id'] in promos:
        for category in categories[bridge['order_id']]:
            buckets.setdefault((category, promos[bridge['promo_id']]['campaign']), set()).add(bridge['order_id'])
result = sorted([
    {'category': category, 'campaign': campaign, 'order_count': len(ids)}
    for (category, campaign), ids in buckets.items()
], key=lambda row: (row['category'], row['campaign']))`,
    `paid_items_df = order_items_df.join(products_df, "product_id").join(orders_df, "order_id").filter(F.col("status") == "paid").select("order_id", "category").distinct()
result_df = paid_items_df.join(order_promotions_df, "order_id").join(promotions_df, "promo_id").groupBy("category", "campaign").agg(F.countDistinct("order_id").alias("order_count")).select("category", "campaign", "order_count").orderBy("category", "campaign")`,
    makePysparkRequirements(req.join, req.filter, req.select, { label: "distinct order grain", anyOf: [".distinct(", "countDistinct("] }, req.group, req.agg, req.alias),
  );
}

function invalidBridgeRowsFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["order_id", "promo_id", "issue"];
  return seed(
    context,
    [tables.orderPromotions, tables.orders, tables.promotions],
    "reconciliation",
    "Invalid promotion bridge rows",
    "Return order promotion bridge rows with a missing order or missing promotion.",
    columns,
    (input) => {
      const orderIds = new Set(tableRows(input, "orders").map((row) => row.order_id));
      const promoIds = new Set(tableRows(input, "promotions").map((row) => row.promo_id));
      return sortRows(tableRows(input, "order_promotions").map((row) => {
        const issue = !orderIds.has(row.order_id) ? "missing_order" : !promoIds.has(row.promo_id) ? "missing_promo" : null;
        return issue ? { order_id: row.order_id, promo_id: row.promo_id, issue } : null;
      }).filter(Boolean) as ArcadeRow[], [["order_id", "asc"], ["promo_id", "asc"]]);
    },
    `SELECT op.order_id, op.promo_id,
       CASE WHEN o.order_id IS NULL THEN 'missing_order' ELSE 'missing_promo' END AS issue
FROM order_promotions op
LEFT JOIN orders o ON o.order_id = op.order_id
LEFT JOIN promotions p ON p.promo_id = op.promo_id
WHERE o.order_id IS NULL OR p.promo_id IS NULL
ORDER BY op.order_id, op.promo_id;`,
    `order_ids = {row['order_id'] for row in data['orders']}
promo_ids = {row['promo_id'] for row in data['promotions']}
result = []
for row in data['order_promotions']:
    issue = 'missing_order' if row['order_id'] not in order_ids else ('missing_promo' if row['promo_id'] not in promo_ids else None)
    if issue:
        result.append({'order_id': row['order_id'], 'promo_id': row['promo_id'], 'issue': issue})
result = sorted(result, key=lambda row: (row['order_id'], row['promo_id']))`,
    `result_df = order_promotions_df.join(orders_df.select("order_id").withColumn("has_order", F.lit(1)), "order_id", "left").join(promotions_df.select("promo_id").withColumn("has_promo", F.lit(1)), "promo_id", "left").withColumn("issue", F.when(F.col("has_order").isNull(), F.lit("missing_order")).when(F.col("has_promo").isNull(), F.lit("missing_promo"))).filter(F.col("issue").isNotNull()).select("order_id", "promo_id", "issue").orderBy("order_id", "promo_id")`,
    makePysparkRequirements(req.join, req.withColumn, req.when, req.filter, req.select),
  );
}

function customerCategoryBreadthFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["customer_id", "category_count"];
  return seed(
    context,
    [tables.customers, tables.orders, tables.orderItems, tables.products],
    "multi-table-joins",
    "Customer category breadth",
    "Return customers buying at least two distinct product categories in paid orders.",
    columns,
    (input) => {
      const customerIds = new Set(tableRows(input, "customers").map((row) => row.customer_id));
      const products = byKey(tableRows(input, "products"), "product_id");
      const orders = byKey(paidOrders(input).filter((order) => customerIds.has(order.customer_id)), "order_id");
      const buckets = new Map<ArcadePrimitive, Set<string>>();
      for (const item of tableRows(input, "order_items")) {
        const order = orders.get(item.order_id);
        const product = products.get(item.product_id);
        if (order && product) buckets.set(order.customer_id, (buckets.get(order.customer_id) ?? new Set()).add(String(product.category)));
      }
      return sortRows([...buckets.entries()].filter(([, cats]) => cats.size >= 2).map(([customer_id, cats]) => ({ customer_id, category_count: cats.size })), [["customer_id", "asc"]]);
    },
    `SELECT o.customer_id, COUNT(DISTINCT p.category) AS category_count
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
JOIN order_items i ON i.order_id = o.order_id
JOIN products p ON p.product_id = i.product_id
WHERE o.status = 'paid'
GROUP BY o.customer_id
HAVING COUNT(DISTINCT p.category) >= 2
ORDER BY o.customer_id;`,
    `products = {row['product_id']: row for row in data['products']}
customer_ids = {row['customer_id'] for row in data['customers']}
orders = {row['order_id']: row for row in data['orders'] if row['status'] == 'paid' and row['customer_id'] in customer_ids}
buckets = {}
for item in data['order_items']:
    order = orders.get(item['order_id'])
    product = products.get(item['product_id'])
    if order and product:
        buckets.setdefault(order['customer_id'], set()).add(product['category'])
result = sorted([
    {'customer_id': customer_id, 'category_count': len(categories)}
    for customer_id, categories in buckets.items()
    if len(categories) >= 2
], key=lambda row: row['customer_id'])`,
    `result_df = orders_df.join(customers_df, "customer_id").join(order_items_df, "order_id").join(products_df, "product_id").filter(F.col("status") == "paid").groupBy("customer_id").agg(F.countDistinct("category").alias("category_count")).filter(F.col("category_count") >= 2).select("customer_id", "category_count").orderBy("customer_id")`,
    makePysparkRequirements(req.join, req.filter, req.group, req.agg, req.alias, req.select, { label: "distinct categories", anyOf: ["countDistinct("] }),
  );
}

function bridgeExplosionRiskFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["order_id", "item_rows", "promo_rows", "exploded_rows"];
  return seed(
    context,
    [tables.orderItems, tables.orderPromotions],
    "metric-investigation",
    "Bridge explosion risk",
    "Return orders where item rows multiplied by promo rows would exceed two rows.",
    columns,
    (input) => {
      const itemCounts = new Map<ArcadePrimitive, number>();
      const promoCounts = new Map<ArcadePrimitive, number>();
      for (const item of tableRows(input, "order_items")) itemCounts.set(item.order_id, (itemCounts.get(item.order_id) ?? 0) + 1);
      for (const promo of tableRows(input, "order_promotions")) promoCounts.set(promo.order_id, (promoCounts.get(promo.order_id) ?? 0) + 1);
      return sortRows([...itemCounts.entries()].map(([order_id, item_rows]) => {
        const promo_rows = promoCounts.get(order_id) ?? 0;
        return { order_id, item_rows, promo_rows, exploded_rows: item_rows * promo_rows };
      }).filter((row) => row.exploded_rows > 2), [["order_id", "asc"]]);
    },
    `WITH item_counts AS (
  SELECT order_id, COUNT(*) AS item_rows FROM order_items GROUP BY order_id
),
promo_counts AS (
  SELECT order_id, COUNT(*) AS promo_rows FROM order_promotions GROUP BY order_id
)
SELECT i.order_id, i.item_rows, p.promo_rows, i.item_rows * p.promo_rows AS exploded_rows
FROM item_counts i
JOIN promo_counts p ON p.order_id = i.order_id
WHERE i.item_rows * p.promo_rows > 2
ORDER BY i.order_id;`,
    `item_counts = {}
promo_counts = {}
for item in data['order_items']:
    item_counts[item['order_id']] = item_counts.get(item['order_id'], 0) + 1
for promo in data['order_promotions']:
    promo_counts[promo['order_id']] = promo_counts.get(promo['order_id'], 0) + 1
result = sorted([
    {'order_id': order_id, 'item_rows': item_rows, 'promo_rows': promo_counts[order_id], 'exploded_rows': item_rows * promo_counts[order_id]}
    for order_id, item_rows in item_counts.items()
    if order_id in promo_counts and item_rows * promo_counts[order_id] > 2
], key=lambda row: row['order_id'])`,
    `item_counts_df = order_items_df.groupBy("order_id").agg(F.count("*").alias("item_rows"))
promo_counts_df = order_promotions_df.groupBy("order_id").agg(F.count("*").alias("promo_rows"))
result_df = item_counts_df.join(promo_counts_df, "order_id").withColumn("exploded_rows", F.col("item_rows") * F.col("promo_rows")).filter(F.col("exploded_rows") > 2).select("order_id", "item_rows", "promo_rows", "exploded_rows").orderBy("order_id")`,
    makePysparkRequirements(req.group, req.agg, req.join, req.withColumn, req.filter, req.select),
  );
}

function monthlyPaidRevenueFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["order_month", "paid_revenue"];
  return seed(
    context,
    [tables.orders],
    "rolling-metrics",
    "Monthly paid revenue",
    "Return paid revenue grouped by order month.",
    columns,
    (input) => sortRows([...paidOrders(input).reduce((map, order) => {
      const month = monthOf(order.order_ts);
      map.set(month, (map.get(month) ?? 0) + Number(order.amount));
      return map;
    }, new Map<string, number>()).entries()].map(([order_month, paid_revenue]) => ({ order_month, paid_revenue: sum([paid_revenue]) })), [["order_month", "asc"]]),
    `SELECT SUBSTR(order_ts, 1, 7) AS order_month, SUM(amount) AS paid_revenue
FROM orders
WHERE status = 'paid'
GROUP BY SUBSTR(order_ts, 1, 7)
ORDER BY order_month;`,
    `grouped = {}
for order in data['orders']:
    if order['status'] == 'paid':
        month = order['order_ts'][:7]
        grouped[month] = grouped.get(month, 0) + order['amount']
result = sorted([
    {'order_month': month, 'paid_revenue': round(value, 2)}
    for month, value in grouped.items()
], key=lambda row: row['order_month'])`,
    `result_df = orders_df.filter(F.col("status") == "paid").withColumn("order_month", F.date_format(F.to_date("order_ts"), "yyyy-MM")).groupBy("order_month").agg(F.sum("amount").alias("paid_revenue")).select("order_month", "paid_revenue").orderBy("order_month")`,
    makePysparkRequirements(req.filter, req.withColumn, req.date, req.group, req.agg, req.alias, req.select),
  );
}

function rollingThreeEventCountFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["customer_id", "event_id", "rolling_three_events"];
  return seed(
    context,
    [tables.events],
    "window-logic",
    "Rolling three event count",
    "Return rolling three-event count by customer ordered by event time.",
    columns,
    (input) => {
      const events = sortRows(tableRows(input, "events"), [["customer_id", "asc"], ["event_ts", "asc"], ["event_id", "asc"]]);
      const seen = new Map<ArcadePrimitive, ArcadeRow[]>();
      return events.map((event) => {
        const prior = [...(seen.get(event.customer_id) ?? []), event].slice(-3);
        seen.set(event.customer_id, prior);
        return { customer_id: event.customer_id, event_id: event.event_id, rolling_three_events: prior.length };
      });
    },
    `SELECT customer_id, event_id,
       COUNT(*) OVER (PARTITION BY customer_id ORDER BY event_ts, event_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS rolling_three_events
FROM events
ORDER BY customer_id, event_ts, event_id;`,
    `events = sorted(data['events'], key=lambda row: (row['customer_id'], row['event_ts'], row['event_id']))
seen = {}
result = []
for event in events:
    bucket = (seen.get(event['customer_id'], []) + [event])[-3:]
    seen[event['customer_id']] = bucket
    result.append({'customer_id': event['customer_id'], 'event_id': event['event_id'], 'rolling_three_events': len(bucket)})`,
    `w = Window.partitionBy("customer_id").orderBy("event_ts", "event_id").rowsBetween(-2, Window.currentRow)
result_df = events_df.withColumn("rolling_three_events", F.count("*").over(w)).select("customer_id", "event_id", "rolling_three_events").orderBy("customer_id", "event_ts", "event_id")`,
    makePysparkRequirements(req.window, req.over, req.withColumn, req.select),
  );
}

function lateArrivingEventsFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["event_id", "event_name", "arrival_lag_days"];
  const maxDays = 2 + (context.variant % 2);
  return seed(
    context,
    [tables.events],
    "anomaly-detection",
    "Late arriving events",
    `Return events where ingest lag is greater than ${maxDays} days.`,
    columns,
    (input) => sortRows(tableRows(input, "events").map((event) => {
      const lag = daysBetween(event.event_ts, event.ingest_ts);
      return lag !== null && lag > maxDays ? { event_id: event.event_id, event_name: event.event_name, arrival_lag_days: lag } : null;
    }).filter(Boolean) as ArcadeRow[], [["event_id", "asc"]]),
    `SELECT event_id, event_name,
       CAST(julianday(ingest_ts) - julianday(event_ts) AS INTEGER) AS arrival_lag_days
FROM events
WHERE CAST(julianday(ingest_ts) - julianday(event_ts) AS INTEGER) > ${maxDays}
ORDER BY event_id;`,
    `from datetime import datetime
result = []
for event in data['events']:
    lag = (datetime.fromisoformat(event['ingest_ts']) - datetime.fromisoformat(event['event_ts'])).days
    if lag > ${maxDays}:
        result.append({'event_id': event['event_id'], 'event_name': event['event_name'], 'arrival_lag_days': lag})
result = sorted(result, key=lambda row: row['event_id'])`,
    `result_df = events_df.withColumn("arrival_lag_days", F.datediff(F.to_date("ingest_ts"), F.to_date("event_ts"))).filter(F.col("arrival_lag_days") > ${maxDays}).select("event_id", "event_name", "arrival_lag_days").orderBy("event_id")`,
    makePysparkRequirements(req.withColumn, req.date, req.filter, req.select),
  );
}

function firstLastEventGapFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["customer_id", "first_event_ts", "last_event_ts", "active_days"];
  return seed(
    context,
    [tables.events],
    "first-last-event",
    "Customer event span",
    "Return each customer first event, last event, and active day span.",
    columns,
    (input) => {
      const grouped = new Map<ArcadePrimitive, ArcadeRow[]>();
      for (const event of tableRows(input, "events")) grouped.set(event.customer_id, [...(grouped.get(event.customer_id) ?? []), event]);
      return sortRows([...grouped.entries()].map(([customer_id, events]) => {
        const ordered = sortRows(events, [["event_ts", "asc"], ["event_id", "asc"]]);
        return {
          customer_id,
          first_event_ts: ordered[0].event_ts,
          last_event_ts: ordered[ordered.length - 1].event_ts,
          active_days: daysBetween(ordered[0].event_ts, ordered[ordered.length - 1].event_ts),
        };
      }), [["customer_id", "asc"]]);
    },
    `WITH bounds AS (
  SELECT customer_id, MIN(event_ts) AS first_event_ts, MAX(event_ts) AS last_event_ts
  FROM events
  GROUP BY customer_id
)
SELECT customer_id, first_event_ts, last_event_ts,
       CAST(julianday(last_event_ts) - julianday(first_event_ts) AS INTEGER) AS active_days
FROM bounds
ORDER BY customer_id;`,
    `grouped = {}
from datetime import datetime
for event in data['events']:
    grouped.setdefault(event['customer_id'], []).append(event)
result = []
for customer_id, events in grouped.items():
    ordered = sorted(events, key=lambda row: (row['event_ts'], row['event_id']))
    active_days = (datetime.fromisoformat(ordered[-1]['event_ts']) - datetime.fromisoformat(ordered[0]['event_ts'])).days
    result.append({'customer_id': customer_id, 'first_event_ts': ordered[0]['event_ts'], 'last_event_ts': ordered[-1]['event_ts'], 'active_days': active_days})
result = sorted(result, key=lambda row: row['customer_id'])`,
    `bounds_df = events_df.groupBy("customer_id").agg(F.min("event_ts").alias("first_event_ts"), F.max("event_ts").alias("last_event_ts"))
result_df = bounds_df.withColumn("active_days", F.datediff(F.to_date("last_event_ts"), F.to_date("first_event_ts"))).select("customer_id", "first_event_ts", "last_event_ts", "active_days").orderBy("customer_id")`,
    makePysparkRequirements(req.group, req.agg, req.alias, req.withColumn, req.date, req.select),
  );
}

function eventSequenceNumberFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["customer_id", "event_id", "event_sequence"];
  return seed(
    context,
    [tables.events],
    "window-logic",
    "Event sequence number",
    "Return each event with its sequence number inside the customer timeline.",
    columns,
    (input) => {
      const events = sortRows(tableRows(input, "events"), [["customer_id", "asc"], ["event_ts", "asc"], ["event_id", "asc"]]);
      const counts = new Map<ArcadePrimitive, number>();
      return events.map((event) => {
        const sequence = (counts.get(event.customer_id) ?? 0) + 1;
        counts.set(event.customer_id, sequence);
        return { customer_id: event.customer_id, event_id: event.event_id, event_sequence: sequence };
      });
    },
    `SELECT customer_id, event_id,
       ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY event_ts, event_id) AS event_sequence
FROM events
ORDER BY customer_id, event_ts, event_id;`,
    `events = sorted(data['events'], key=lambda row: (row['customer_id'], row['event_ts'], row['event_id']))
counts = {}
result = []
for event in events:
    counts[event['customer_id']] = counts.get(event['customer_id'], 0) + 1
    result.append({'customer_id': event['customer_id'], 'event_id': event['event_id'], 'event_sequence': counts[event['customer_id']]})`,
    `w = Window.partitionBy("customer_id").orderBy("event_ts", "event_id")
result_df = events_df.withColumn("event_sequence", F.row_number().over(w)).select("customer_id", "event_id", "event_sequence").orderBy("customer_id", "event_ts", "event_id")`,
    makePysparkRequirements(req.window, req.over, req.rowNumber, req.withColumn, req.select),
  );
}

function lifecycleValueTierFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["customer_id", "paid_revenue", "value_tier"];
  return seed(
    context,
    [tables.customers, tables.orders],
    "customer-lifecycle",
    "Lifecycle value tier",
    "Return customers with paid revenue and value_tier high or standard.",
    columns,
    (input) => {
      const customerIds = new Set(tableRows(input, "customers").map((row) => row.customer_id));
      const grouped = new Map<ArcadePrimitive, number>();
      for (const order of paidOrders(input)) {
        if (customerIds.has(order.customer_id)) grouped.set(order.customer_id, (grouped.get(order.customer_id) ?? 0) + Number(order.amount));
      }
      return sortRows([...grouped.entries()].map(([customer_id, value]) => ({ customer_id, paid_revenue: sum([value]), value_tier: value >= 350 ? "high" : "standard" })), [["paid_revenue", "desc"], ["customer_id", "asc"]]);
    },
    `SELECT c.customer_id, SUM(o.amount) AS paid_revenue,
       CASE WHEN SUM(o.amount) >= 350 THEN 'high' ELSE 'standard' END AS value_tier
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
WHERE o.status = 'paid'
GROUP BY c.customer_id
ORDER BY paid_revenue DESC, c.customer_id;`,
    `customer_ids = {row['customer_id'] for row in data['customers']}
grouped = {}
for order in data['orders']:
    if order['status'] == 'paid' and order['customer_id'] in customer_ids:
        grouped[order['customer_id']] = grouped.get(order['customer_id'], 0) + order['amount']
result = sorted([
    {'customer_id': customer_id, 'paid_revenue': round(value, 2), 'value_tier': 'high' if value >= 350 else 'standard'}
    for customer_id, value in grouped.items()
], key=lambda row: (-row['paid_revenue'], row['customer_id']))`,
    `result_df = customers_df.join(orders_df, "customer_id").filter(F.col("status") == "paid").groupBy("customer_id").agg(F.sum("amount").alias("paid_revenue")).withColumn("value_tier", F.when(F.col("paid_revenue") >= 350, F.lit("high")).otherwise(F.lit("standard"))).select("customer_id", "paid_revenue", "value_tier").orderBy(F.col("paid_revenue").desc(), "customer_id")`,
    makePysparkRequirements(req.join, req.filter, req.group, req.agg, req.alias, req.withColumn, req.when, req.select),
  );
}

function repeatPurchaseLagFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["customer_id", "first_paid_ts", "second_paid_ts", "days_to_repeat"];
  return seed(
    context,
    [tables.orders],
    "cohort-retention",
    "Repeat purchase lag",
    "Return customers with a second paid purchase and days_to_repeat.",
    columns,
    (input) => {
      const grouped = new Map<ArcadePrimitive, ArcadeRow[]>();
      for (const order of paidOrders(input)) grouped.set(order.customer_id, [...(grouped.get(order.customer_id) ?? []), order]);
      const rows: ArcadeRow[] = [];
      for (const [customer_id, orders] of grouped.entries()) {
        const ordered = sortRows(orders, [["order_ts", "asc"], ["order_id", "asc"]]);
        if (ordered.length >= 2) rows.push({ customer_id, first_paid_ts: ordered[0].order_ts, second_paid_ts: ordered[1].order_ts, days_to_repeat: daysBetween(ordered[0].order_ts, ordered[1].order_ts) });
      }
      return sortRows(rows, [["customer_id", "asc"]]);
    },
    `WITH ranked AS (
  SELECT customer_id, order_ts,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_ts, order_id) AS rn
  FROM orders
  WHERE status = 'paid'
)
SELECT f.customer_id, f.order_ts AS first_paid_ts, s.order_ts AS second_paid_ts,
       CAST(julianday(s.order_ts) - julianday(f.order_ts) AS INTEGER) AS days_to_repeat
FROM ranked f
JOIN ranked s ON s.customer_id = f.customer_id AND s.rn = 2
WHERE f.rn = 1
ORDER BY f.customer_id;`,
    `from datetime import datetime
grouped = {}
for order in data['orders']:
    if order['status'] == 'paid':
        grouped.setdefault(order['customer_id'], []).append(order)
result = []
for customer_id, orders in grouped.items():
    ordered = sorted(orders, key=lambda row: (row['order_ts'], row['order_id']))
    if len(ordered) >= 2:
        days = (datetime.fromisoformat(ordered[1]['order_ts']) - datetime.fromisoformat(ordered[0]['order_ts'])).days
        result.append({'customer_id': customer_id, 'first_paid_ts': ordered[0]['order_ts'], 'second_paid_ts': ordered[1]['order_ts'], 'days_to_repeat': days})
result = sorted(result, key=lambda row: row['customer_id'])`,
    `w = Window.partitionBy("customer_id").orderBy("order_ts", "order_id")
ranked_df = orders_df.filter(F.col("status") == "paid").withColumn("rn", F.row_number().over(w))
first_df = ranked_df.filter(F.col("rn") == 1).select("customer_id", F.col("order_ts").alias("first_paid_ts"))
second_df = ranked_df.filter(F.col("rn") == 2).select("customer_id", F.col("order_ts").alias("second_paid_ts"))
result_df = first_df.join(second_df, "customer_id").withColumn("days_to_repeat", F.datediff(F.to_date("second_paid_ts"), F.to_date("first_paid_ts"))).select("customer_id", "first_paid_ts", "second_paid_ts", "days_to_repeat").orderBy("customer_id")`,
    makePysparkRequirements(req.filter, req.window, req.over, req.rowNumber, req.join, req.withColumn, req.date, req.select),
  );
}

function churnSignalFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["customer_id", "last_paid_date", "days_since_last_paid", "churn_signal"];
  const asOfDate = dateAdd(context.variant % 2 === 0 ? "2026-07-20" : "2026-08-20", 0);
  return seed(
    context,
    [tables.customers, tables.orders],
    "customer-lifecycle",
    "Churn signal from last paid order",
    `Return active customers with days since last paid order as of ${asOfDate}.`,
    columns,
    (input) => {
      const activeIds = new Set(tableRows(input, "customers").filter((c) => c.status === "active").map((c) => c.customer_id));
      const latest = new Map<ArcadePrimitive, ArcadePrimitive>();
      for (const order of paidOrders(input)) {
        if (!activeIds.has(order.customer_id)) continue;
        const current = latest.get(order.customer_id);
        if (!current || String(order.order_ts) > String(current)) latest.set(order.customer_id, order.order_ts);
      }
      return sortRows([...latest.entries()].map(([customer_id, order_ts]) => {
        const days = daysBetween(order_ts, asOfDate);
        return { customer_id, last_paid_date: String(order_ts).slice(0, 10), days_since_last_paid: days, churn_signal: Number(days) > 45 ? "watch" : "ok" };
      }), [["customer_id", "asc"]]);
    },
    `WITH latest AS (
  SELECT c.customer_id, MAX(o.order_ts) AS last_paid_ts
  FROM customers c
  JOIN orders o ON o.customer_id = c.customer_id
  WHERE c.status = 'active' AND o.status = 'paid'
  GROUP BY c.customer_id
)
SELECT customer_id, SUBSTR(last_paid_ts, 1, 10) AS last_paid_date,
       CAST(julianday('${asOfDate}') - julianday(last_paid_ts) AS INTEGER) AS days_since_last_paid,
       CASE WHEN CAST(julianday('${asOfDate}') - julianday(last_paid_ts) AS INTEGER) > 45 THEN 'watch' ELSE 'ok' END AS churn_signal
FROM latest
ORDER BY customer_id;`,
    `from datetime import datetime
active_ids = {row['customer_id'] for row in data['customers'] if row['status'] == 'active'}
latest = {}
for order in data['orders']:
    if order['status'] == 'paid' and order['customer_id'] in active_ids:
        if order['customer_id'] not in latest or order['order_ts'] > latest[order['customer_id']]:
            latest[order['customer_id']] = order['order_ts']
result = []
as_of = datetime.fromisoformat('${asOfDate}')
for customer_id, ts in latest.items():
    days = (as_of - datetime.fromisoformat(ts)).days
    result.append({'customer_id': customer_id, 'last_paid_date': ts[:10], 'days_since_last_paid': days, 'churn_signal': 'watch' if days > 45 else 'ok'})
result = sorted(result, key=lambda row: row['customer_id'])`,
    `latest_df = customers_df.join(orders_df, "customer_id").filter((F.col("customers.status") == "active") & (F.col("orders.status") == "paid")).groupBy("customer_id").agg(F.max("order_ts").alias("last_paid_ts"))
result_df = latest_df.withColumn("last_paid_date", F.to_date("last_paid_ts")).withColumn("days_since_last_paid", F.datediff(F.lit("${asOfDate}"), F.to_date("last_paid_ts"))).withColumn("churn_signal", F.when(F.col("days_since_last_paid") > 45, F.lit("watch")).otherwise(F.lit("ok"))).select("customer_id", "last_paid_date", "days_since_last_paid", "churn_signal").orderBy("customer_id")`,
    makePysparkRequirements(req.join, req.filter, req.group, req.agg, req.alias, req.withColumn, req.date, req.when, req.select),
  );
}

function acquisitionCohortRevenueFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["signup_month", "paid_customers", "paid_revenue"];
  return seed(
    context,
    [tables.customers, tables.orders],
    "cohort-retention",
    "Acquisition cohort revenue",
    "Return paid customer count and paid revenue by signup month.",
    columns,
    (input) => {
      const customers = byKey(tableRows(input, "customers"), "customer_id");
      const grouped = new Map<string, { ids: Set<ArcadePrimitive>; revenue: number }>();
      for (const order of paidOrders(input)) {
        const customer = customers.get(order.customer_id);
        if (!customer) continue;
        const month = monthOf(customer.signup_date);
        const current = grouped.get(month) ?? { ids: new Set(), revenue: 0 };
        current.ids.add(order.customer_id);
        current.revenue += Number(order.amount);
        grouped.set(month, current);
      }
      return sortRows([...grouped.entries()].map(([signup_month, value]) => ({ signup_month, paid_customers: value.ids.size, paid_revenue: sum([value.revenue]) })), [["signup_month", "asc"]]);
    },
    `SELECT SUBSTR(c.signup_date, 1, 7) AS signup_month,
       COUNT(DISTINCT c.customer_id) AS paid_customers,
       SUM(o.amount) AS paid_revenue
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
WHERE o.status = 'paid'
GROUP BY SUBSTR(c.signup_date, 1, 7)
ORDER BY signup_month;`,
    `customers = {row['customer_id']: row for row in data['customers']}
grouped = {}
for order in data['orders']:
    customer = customers.get(order['customer_id'])
    if order['status'] == 'paid' and customer:
        month = customer['signup_date'][:7]
        grouped.setdefault(month, {'ids': set(), 'revenue': 0})
        grouped[month]['ids'].add(order['customer_id'])
        grouped[month]['revenue'] += order['amount']
result = sorted([
    {'signup_month': month, 'paid_customers': len(value['ids']), 'paid_revenue': round(value['revenue'], 2)}
    for month, value in grouped.items()
], key=lambda row: row['signup_month'])`,
    `result_df = customers_df.join(orders_df, "customer_id").filter(F.col("status") == "paid").withColumn("signup_month", F.date_format(F.to_date("signup_date"), "yyyy-MM")).groupBy("signup_month").agg(F.countDistinct("customer_id").alias("paid_customers"), F.sum("amount").alias("paid_revenue")).select("signup_month", "paid_customers", "paid_revenue").orderBy("signup_month")`,
    makePysparkRequirements(req.join, req.filter, req.withColumn, req.date, req.group, req.agg, req.alias, req.select),
  );
}

function firstPurchaseChannelFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["customer_id", "first_paid_order_id", "first_paid_channel"];
  return seed(
    context,
    [tables.orders],
    "window-logic",
    "First purchase channel",
    "Return each customer first paid order and first paid channel.",
    columns,
    (input) => {
      const first = new Map<ArcadePrimitive, ArcadeRow>();
      for (const order of paidOrders(input)) {
        const current = first.get(order.customer_id);
        if (!current || String(order.order_ts) < String(current.order_ts)) first.set(order.customer_id, order);
      }
      return sortRows([...first.values()].map((order) => ({ customer_id: order.customer_id, first_paid_order_id: order.order_id, first_paid_channel: order.channel })), [["customer_id", "asc"]]);
    },
    `WITH ranked AS (
  SELECT customer_id, order_id, channel,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_ts, order_id) AS rn
  FROM orders
  WHERE status = 'paid'
)
SELECT customer_id, order_id AS first_paid_order_id, channel AS first_paid_channel
FROM ranked
WHERE rn = 1
ORDER BY customer_id;`,
    `first = {}
for order in data['orders']:
    if order['status'] == 'paid':
        current = first.get(order['customer_id'])
        if current is None or (order['order_ts'], order['order_id']) < (current['order_ts'], current['order_id']):
            first[order['customer_id']] = order
result = sorted([
    {'customer_id': order['customer_id'], 'first_paid_order_id': order['order_id'], 'first_paid_channel': order['channel']}
    for order in first.values()
], key=lambda row: row['customer_id'])`,
    `w = Window.partitionBy("customer_id").orderBy("order_ts", "order_id")
result_df = orders_df.filter(F.col("status") == "paid").withColumn("rn", F.row_number().over(w)).filter(F.col("rn") == 1).select("customer_id", F.col("order_id").alias("first_paid_order_id"), F.col("channel").alias("first_paid_channel")).orderBy("customer_id")`,
    makePysparkRequirements(req.filter, req.window, req.over, req.rowNumber, req.withColumn, req.select, req.alias),
  );
}

function invalidRawOrderFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["raw_order_id", "reject_reason"];
  return seed(
    context,
    [tables.rawOrders],
    "quality-gates",
    "Invalid raw order rows",
    "Return raw orders rejected for missing_customer, bad_amount, or bad_date.",
    columns,
    (input) => sortRows(tableRows(input, "raw_orders").map((row) => {
      const customer = String(row.raw_customer_id ?? "").trim();
      const amount = Number(row.raw_amount);
      const date = String(row.raw_order_date ?? "");
      const reason = customer === "" ? "missing_customer" : Number.isNaN(amount) ? "bad_amount" : !date.includes("-") ? "bad_date" : null;
      return reason ? { raw_order_id: String(row.raw_order_id).trim(), reject_reason: reason } : null;
    }).filter(Boolean) as ArcadeRow[], [["raw_order_id", "asc"]]),
    `SELECT TRIM(raw_order_id) AS raw_order_id,
       CASE
         WHEN TRIM(COALESCE(raw_customer_id, '')) = '' THEN 'missing_customer'
         WHEN CAST(raw_amount AS REAL) = 0 AND raw_amount NOT IN ('0', '0.0') THEN 'bad_amount'
         WHEN raw_order_date NOT LIKE '____-__-__' THEN 'bad_date'
       END AS reject_reason
FROM raw_orders
WHERE TRIM(COALESCE(raw_customer_id, '')) = ''
   OR (CAST(raw_amount AS REAL) = 0 AND raw_amount NOT IN ('0', '0.0'))
   OR raw_order_date NOT LIKE '____-__-__'
ORDER BY raw_order_id;`,
    `result = []
for row in data['raw_orders']:
    customer = (row.get('raw_customer_id') or '').strip()
    amount_text = row.get('raw_amount') or ''
    date_text = row.get('raw_order_date') or ''
    try:
        float(amount_text)
        bad_amount = False
    except ValueError:
        bad_amount = True
    reason = 'missing_customer' if customer == '' else ('bad_amount' if bad_amount else ('bad_date' if '-' not in date_text else None))
    if reason:
        result.append({'raw_order_id': row['raw_order_id'].strip(), 'reject_reason': reason})
result = sorted(result, key=lambda row: row['raw_order_id'])`,
    `result_df = raw_orders_df.withColumn("reject_reason", F.when(F.trim(F.coalesce(F.col("raw_customer_id"), F.lit(""))) == "", F.lit("missing_customer")).when(F.col("raw_amount").cast("double").isNull(), F.lit("bad_amount")).when(~F.col("raw_order_date").like("____-__-__"), F.lit("bad_date"))).filter(F.col("reject_reason").isNotNull()).select(F.trim("raw_order_id").alias("raw_order_id"), "reject_reason").orderBy("raw_order_id")`,
    makePysparkRequirements(req.withColumn, req.when, req.coalesce, req.filter, req.select, req.alias),
  );
}

function missingReferenceProductFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["product_id", "item_rows"];
  return seed(
    context,
    [tables.orderItems, tables.products],
    "source-target-checks",
    "Missing product references",
    "Return product_ids from item rows missing from products.",
    columns,
    (input) => {
      const products = new Set(tableRows(input, "products").map((row) => row.product_id));
      const counts = new Map<ArcadePrimitive, number>();
      for (const item of tableRows(input, "order_items")) if (!products.has(item.product_id)) counts.set(item.product_id, (counts.get(item.product_id) ?? 0) + 1);
      return sortRows([...counts.entries()].map(([product_id, item_rows]) => ({ product_id, item_rows })), [["product_id", "asc"]]);
    },
    `SELECT i.product_id, COUNT(*) AS item_rows
FROM order_items i
LEFT JOIN products p ON p.product_id = i.product_id
WHERE p.product_id IS NULL
GROUP BY i.product_id
ORDER BY i.product_id;`,
    `product_ids = {row['product_id'] for row in data['products']}
counts = {}
for item in data['order_items']:
    if item['product_id'] not in product_ids:
        counts[item['product_id']] = counts.get(item['product_id'], 0) + 1
result = sorted([
    {'product_id': product_id, 'item_rows': count}
    for product_id, count in counts.items()
], key=lambda row: row['product_id'])`,
    `result_df = order_items_df.join(products_df.select("product_id"), "product_id", "left_anti").groupBy("product_id").agg(F.count("*").alias("item_rows")).select("product_id", "item_rows").orderBy("product_id")`,
    makePysparkRequirements(req.join, req.group, req.agg, req.alias, req.select, { label: "anti join", anyOf: ["left_anti"] }),
  );
}

function sourceTargetMismatchFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["order_id", "source_amount", "target_amount", "amount_gap"];
  return seed(
    context,
    [tables.orders, tables.targetOrders],
    "reconciliation",
    "Source target amount mismatch",
    "Return source orders where target amount differs from source amount.",
    columns,
    (input) => {
      const targets = byKey(tableRows(input, "target_orders"), "order_id");
      return sortRows(tableRows(input, "orders").map((order) => {
        const target = targets.get(order.order_id);
        const gap = target ? sum([Number(order.amount) - Number(target.amount)]) : 0;
        return target && gap !== 0 ? { order_id: order.order_id, source_amount: order.amount, target_amount: target.amount, amount_gap: gap } : null;
      }).filter(Boolean) as ArcadeRow[], [["order_id", "asc"]]);
    },
    `SELECT o.order_id, o.amount AS source_amount, t.amount AS target_amount,
       ROUND(o.amount - t.amount, 2) AS amount_gap
FROM orders o
JOIN target_orders t ON t.order_id = o.order_id
WHERE ROUND(o.amount - t.amount, 2) <> 0
ORDER BY o.order_id;`,
    `targets = {row['order_id']: row for row in data['target_orders']}
result = []
for order in data['orders']:
    target = targets.get(order['order_id'])
    if target:
        gap = round(order['amount'] - target['amount'], 2)
        if gap != 0:
            result.append({'order_id': order['order_id'], 'source_amount': order['amount'], 'target_amount': target['amount'], 'amount_gap': gap})
result = sorted(result, key=lambda row: row['order_id'])`,
    `result_df = orders_df.join(target_orders_df, "order_id").withColumn("amount_gap", F.round(F.col("amount") - F.col("target_orders.amount"), 2)).filter(F.col("amount_gap") != 0).select("order_id", F.col("orders.amount").alias("source_amount"), F.col("target_orders.amount").alias("target_amount"), "amount_gap").orderBy("order_id")`,
    makePysparkRequirements(req.join, req.withColumn, req.filter, req.select, req.alias),
  );
}

function missingTargetMetricFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["metric_date", "metric_name", "source_value"];
  return seed(
    context,
    [tables.sourceMetrics, tables.targetMetrics],
    "source-target-checks",
    "Missing target metrics",
    "Return source metric rows that do not exist in the target metric table.",
    columns,
    (input) => {
      const targets = new Set(tableRows(input, "target_metrics").map((row) => `${row.metric_date}|${row.metric_name}`));
      return sortRows(tableRows(input, "source_metrics").filter((row) => !targets.has(`${row.metric_date}|${row.metric_name}`)).map((row) => ({ metric_date: row.metric_date, metric_name: row.metric_name, source_value: row.metric_value })), [["metric_date", "asc"]]);
    },
    `SELECT s.metric_date, s.metric_name, s.metric_value AS source_value
FROM source_metrics s
LEFT JOIN target_metrics t
  ON t.metric_date = s.metric_date AND t.metric_name = s.metric_name
WHERE t.metric_date IS NULL
ORDER BY s.metric_date;`,
    `targets = {(row['metric_date'], row['metric_name']) for row in data['target_metrics']}
result = sorted([
    {'metric_date': row['metric_date'], 'metric_name': row['metric_name'], 'source_value': row['metric_value']}
    for row in data['source_metrics']
    if (row['metric_date'], row['metric_name']) not in targets
], key=lambda row: row['metric_date'])`,
    `result_df = source_metrics_df.join(target_metrics_df.select("metric_date", "metric_name"), ["metric_date", "metric_name"], "left_anti").select("metric_date", "metric_name", F.col("metric_value").alias("source_value")).orderBy("metric_date")`,
    makePysparkRequirements(req.join, req.select, req.alias, { label: "anti join", anyOf: ["left_anti"] }),
  );
}

function lateShipmentSlaFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["shipment_id", "order_id", "delivery_days", "promised_days"];
  return seed(
    context,
    [tables.shipments],
    "quality-gates",
    "Shipment SLA failures",
    "Return shipments delivered after promised_days.",
    columns,
    (input) => sortRows(tableRows(input, "shipments").map((row) => {
      const days = daysBetween(row.shipped_ts, row.delivered_ts);
      return days !== null && days > Number(row.promised_days) ? { shipment_id: row.shipment_id, order_id: row.order_id, delivery_days: days, promised_days: row.promised_days } : null;
    }).filter(Boolean) as ArcadeRow[], [["shipment_id", "asc"]]),
    `SELECT shipment_id, order_id,
       CAST(julianday(delivered_ts) - julianday(shipped_ts) AS INTEGER) AS delivery_days,
       promised_days
FROM shipments
WHERE CAST(julianday(delivered_ts) - julianday(shipped_ts) AS INTEGER) > promised_days
ORDER BY shipment_id;`,
    `from datetime import datetime
result = []
for row in data['shipments']:
    days = (datetime.fromisoformat(row['delivered_ts']) - datetime.fromisoformat(row['shipped_ts'])).days
    if days > row['promised_days']:
        result.append({'shipment_id': row['shipment_id'], 'order_id': row['order_id'], 'delivery_days': days, 'promised_days': row['promised_days']})
result = sorted(result, key=lambda row: row['shipment_id'])`,
    `result_df = shipments_df.withColumn("delivery_days", F.datediff(F.to_date("delivered_ts"), F.to_date("shipped_ts"))).filter(F.col("delivery_days") > F.col("promised_days")).select("shipment_id", "order_id", "delivery_days", "promised_days").orderBy("shipment_id")`,
    makePysparkRequirements(req.withColumn, req.date, req.filter, req.select),
  );
}

function wrongJoinKeyInvestigationFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["order_id", "correct_customer_id", "target_customer_id"];
  return seed(
    context,
    [tables.orders, tables.targetOrders],
    "pipeline-debugging",
    "Wrong customer join key",
    "Return target rows where customer_id does not match the source order customer_id.",
    columns,
    (input) => {
      const targets = byKey(tableRows(input, "target_orders"), "order_id");
      return sortRows(tableRows(input, "orders").map((order) => {
        const target = targets.get(order.order_id);
        return target && target.customer_id !== order.customer_id ? { order_id: order.order_id, correct_customer_id: order.customer_id, target_customer_id: target.customer_id } : null;
      }).filter(Boolean) as ArcadeRow[], [["order_id", "asc"]]);
    },
    `SELECT o.order_id, o.customer_id AS correct_customer_id, t.customer_id AS target_customer_id
FROM orders o
JOIN target_orders t ON t.order_id = o.order_id
WHERE o.customer_id <> t.customer_id
ORDER BY o.order_id;`,
    `targets = {row['order_id']: row for row in data['target_orders']}
result = sorted([
    {'order_id': order['order_id'], 'correct_customer_id': order['customer_id'], 'target_customer_id': targets[order['order_id']]['customer_id']}
    for order in data['orders']
    if order['order_id'] in targets and targets[order['order_id']]['customer_id'] != order['customer_id']
], key=lambda row: row['order_id'])`,
    `result_df = orders_df.join(target_orders_df, "order_id").filter(F.col("orders.customer_id") != F.col("target_orders.customer_id")).select("order_id", F.col("orders.customer_id").alias("correct_customer_id"), F.col("target_orders.customer_id").alias("target_customer_id")).orderBy("order_id")`,
    makePysparkRequirements(req.join, req.filter, req.select, req.alias),
  );
}

function wrongAggregationGrainFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["order_id", "source_amount", "item_total", "gap"];
  return seed(
    context,
    [tables.orders, tables.orderItems],
    "bad-join-debugging",
    "Wrong aggregation grain",
    "Return orders where item grain total does not match the order amount.",
    columns,
    (input) => {
      const itemTotals = new Map<ArcadePrimitive, number>();
      for (const item of tableRows(input, "order_items")) itemTotals.set(item.order_id, (itemTotals.get(item.order_id) ?? 0) + itemRevenue(item));
      return sortRows(paidOrders(input).map((order) => {
        const total = sum([itemTotals.get(order.order_id) ?? 0]);
        const gap = sum([Number(order.amount) - total]);
        return gap !== 0 ? { order_id: order.order_id, source_amount: order.amount, item_total: total, gap } : null;
      }).filter(Boolean) as ArcadeRow[], [["order_id", "asc"]]);
    },
    `WITH item_totals AS (
  SELECT order_id, SUM(quantity * unit_price) AS item_total
  FROM order_items
  GROUP BY order_id
)
SELECT o.order_id, o.amount AS source_amount, COALESCE(i.item_total, 0) AS item_total,
       ROUND(o.amount - COALESCE(i.item_total, 0), 2) AS gap
FROM orders o
LEFT JOIN item_totals i ON i.order_id = o.order_id
WHERE o.status = 'paid' AND ROUND(o.amount - COALESCE(i.item_total, 0), 2) <> 0
ORDER BY o.order_id;`,
    `item_totals = {}
for item in data['order_items']:
    item_totals[item['order_id']] = item_totals.get(item['order_id'], 0) + item['quantity'] * item['unit_price']
result = []
for order in data['orders']:
    if order['status'] == 'paid':
        total = round(item_totals.get(order['order_id'], 0), 2)
        gap = round(order['amount'] - total, 2)
        if gap != 0:
            result.append({'order_id': order['order_id'], 'source_amount': order['amount'], 'item_total': total, 'gap': gap})
result = sorted(result, key=lambda row: row['order_id'])`,
    `item_totals_df = order_items_df.groupBy("order_id").agg(F.sum(F.col("quantity") * F.col("unit_price")).alias("item_total"))
result_df = orders_df.join(item_totals_df, "order_id", "left").withColumn("item_total", F.coalesce(F.col("item_total"), F.lit(0))).withColumn("gap", F.round(F.col("amount") - F.col("item_total"), 2)).filter((F.col("status") == "paid") & (F.col("gap") != 0)).select("order_id", F.col("amount").alias("source_amount"), "item_total", "gap").orderBy("order_id")`,
    makePysparkRequirements(req.group, req.agg, req.join, req.coalesce, req.withColumn, req.filter, req.select, req.alias),
  );
}

function duplicatedFactDetectorFamily(context: FamilyContext): AdvancedSeed {
  return bridgeExplosionRiskFamily(context);
}

function incorrectFilterAuditFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["order_id", "status", "amount"];
  return seed(
    context,
    [tables.orders],
    "pipeline-debugging",
    "Incorrect paid filter audit",
    "Return non-paid orders that would be incorrectly included by amount-only logic.",
    columns,
    (input) => sortRows(tableRows(input, "orders").filter((order) => order.status !== "paid" && Number(order.amount) > 50).map((order) => ({ order_id: order.order_id, status: order.status, amount: order.amount })), [["order_id", "asc"]]),
    `SELECT order_id, status, amount
FROM orders
WHERE status <> 'paid' AND amount > 50
ORDER BY order_id;`,
    `result = sorted([
    {'order_id': order['order_id'], 'status': order['status'], 'amount': order['amount']}
    for order in data['orders']
    if order['status'] != 'paid' and order['amount'] > 50
], key=lambda row: row['order_id'])`,
    `result_df = orders_df.filter((F.col("status") != "paid") & (F.col("amount") > 50)).select("order_id", "status", "amount").orderBy("order_id")`,
    makePysparkRequirements(req.filter, req.select),
  );
}

function metricMismatchInvestigationFamily(context: FamilyContext): AdvancedSeed {
  const tables = buildHardTables(context);
  const columns = ["metric_date", "source_value", "target_value", "gap"];
  return seed(
    context,
    [tables.sourceMetrics, tables.targetMetrics],
    "metric-investigation",
    "Metric mismatch investigation",
    "Return target metrics where source and target values differ.",
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

const worldEightFamilies: FamilyBuilder[] = [
  campaignDistinctRevenueFamily,
  categoryCampaignOrderCountFamily,
  invalidBridgeRowsFamily,
  customerCategoryBreadthFamily,
  bridgeExplosionRiskFamily,
];

const worldNineFamilies: FamilyBuilder[] = [
  monthlyPaidRevenueFamily,
  rollingThreeEventCountFamily,
  lateArrivingEventsFamily,
  firstLastEventGapFamily,
  eventSequenceNumberFamily,
];

const worldTenFamilies: FamilyBuilder[] = [
  lifecycleValueTierFamily,
  repeatPurchaseLagFamily,
  churnSignalFamily,
  acquisitionCohortRevenueFamily,
  firstPurchaseChannelFamily,
];

const worldElevenFamilies: FamilyBuilder[] = [
  invalidRawOrderFamily,
  missingReferenceProductFamily,
  sourceTargetMismatchFamily,
  missingTargetMetricFamily,
  lateShipmentSlaFamily,
];

const worldTwelveFamilies: FamilyBuilder[] = [
  wrongJoinKeyInvestigationFamily,
  wrongAggregationGrainFamily,
  duplicatedFactDetectorFamily,
  incorrectFilterAuditFamily,
  metricMismatchInvestigationFamily,
];

const familiesByWorld: Record<number, FamilyBuilder[]> = {
  8: worldEightFamilies,
  9: worldNineFamilies,
  10: worldTenFamilies,
  11: worldElevenFamilies,
  12: worldTwelveFamilies,
};

function buildContext(worldNumber: number, familyIndex: number, variant: number): FamilyContext {
  const levelNumber = 351 + (worldNumber - 8) * 50 + familyIndex * 10 + variant;
  return {
    levelNumber,
    worldNumber,
    familyIndex,
    variant,
    threshold: 120 + (worldNumber - 8) * 15 + familyIndex * 7 + variant,
    minOrders: 2 + (variant % 3),
    days: 2 + ((familyIndex + variant) % 5),
    topN: 2 + (variant % 3),
    status: variant % 2 === 0 ? "paid" : "completed",
    country: ["US", "CA", "IN", "GB", "AU"][(familyIndex + variant) % 5],
    channel: ["web", "mobile", "store", "partner", "api"][(familyIndex + variant) % 5],
    month: variant % 2 === 0 ? "2026-05" : "2026-06",
  };
}

function buildAdvancedBundles() {
  const bundles: AdvancedArcadeLevelBundle[] = [];

  for (let worldNumber = 8; worldNumber <= 12; worldNumber += 1) {
    const families = familiesByWorld[worldNumber];
    for (let familyIndex = 0; familyIndex < families.length; familyIndex += 1) {
      for (let variant = 0; variant < 10; variant += 1) {
        bundles.push(buildBundle(families[familyIndex](buildContext(worldNumber, familyIndex, variant))));
      }
    }
  }

  return bundles;
}

export const arcadeWorldsEightTwelveBundles = buildAdvancedBundles();

if (arcadeWorldsEightTwelveBundles.length !== 250) {
  throw new Error(`Arcade Worlds 8-12 must contain 250 levels. Received ${arcadeWorldsEightTwelveBundles.length}.`);
}

export const arcadeWorldsEightTwelveBundleMap = new Map(
  arcadeWorldsEightTwelveBundles.map((bundle) => [bundle.levelNumber, bundle] as const),
);

export function getArcadeWorldsEightTwelveBundle(levelNumber: number) {
  return arcadeWorldsEightTwelveBundleMap.get(levelNumber) ?? null;
}
