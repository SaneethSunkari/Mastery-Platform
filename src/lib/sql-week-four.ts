import { SqlTaskDefinition } from "@/lib/types";

export const sqlWeekFourId = "sql-week-04";

const sqlWeekFourBaseTasks: SqlTaskDefinition[] = [
  {
    id: "sql-week-04-task-01",
    weekId: sqlWeekFourId,
    stepNumber: 1,
    title: "Count all orders",
    difficulty: "easy",
    objective: "Start with the simplest aggregation.",
    instructions: [
      "Return the total number of rows in `orders` as `order_count`.",
    ],
    starterSql: "",
    solutionSql: "SELECT COUNT(*) AS order_count\nFROM orders;",
    orderSensitive: true,
  },
  {
    id: "sql-week-04-task-02",
    weekId: sqlWeekFourId,
    stepNumber: 2,
    title: "Count paid orders",
    difficulty: "easy",
    objective: "Aggregate after filtering.",
    instructions: [
      "Return the number of paid orders as `paid_order_count`.",
    ],
    starterSql: "",
    solutionSql: "SELECT COUNT(*) AS paid_order_count\nFROM orders\nWHERE status = 'paid';",
    orderSensitive: true,
  },
  {
    id: "sql-week-04-task-03",
    weekId: sqlWeekFourId,
    stepNumber: 3,
    title: "Find total revenue",
    difficulty: "easy",
    objective: "Use SUM on a numeric column.",
    instructions: [
      "Return the sum of `amount` from all orders as `total_revenue`.",
    ],
    starterSql: "",
    solutionSql: "SELECT SUM(amount) AS total_revenue\nFROM orders;",
    orderSensitive: true,
  },
  {
    id: "sql-week-04-task-04",
    weekId: sqlWeekFourId,
    stepNumber: 4,
    title: "Average paid order amount",
    difficulty: "easy",
    objective: "Use AVG with a filter.",
    instructions: [
      "Return the average `amount` for paid orders as `avg_paid_amount`.",
    ],
    starterSql: "",
    solutionSql: "SELECT AVG(amount) AS avg_paid_amount\nFROM orders\nWHERE status = 'paid';",
    orderSensitive: true,
  },
  {
    id: "sql-week-04-task-05",
    weekId: sqlWeekFourId,
    stepNumber: 5,
    title: "Revenue by status",
    difficulty: "easy",
    objective: "Use GROUP BY on one business dimension.",
    instructions: [
      "Return `status` and the total `amount` as `revenue`.",
      "Sort by `status`.",
    ],
    starterSql: "",
    solutionSql: "SELECT status, SUM(amount) AS revenue\nFROM orders\nGROUP BY status\nORDER BY status;",
    orderSensitive: true,
  },
  {
    id: "sql-week-04-task-06",
    weekId: sqlWeekFourId,
    stepNumber: 6,
    title: "Orders per payment method",
    difficulty: "easy",
    objective: "Count grouped rows.",
    instructions: [
      "Return `payment_method` and the number of orders as `order_count`.",
      "Sort by `payment_method`.",
    ],
    starterSql: "",
    solutionSql: "SELECT payment_method, COUNT(*) AS order_count\nFROM orders\nGROUP BY payment_method\nORDER BY payment_method;",
    orderSensitive: true,
  },
  {
    id: "sql-week-04-task-07",
    weekId: sqlWeekFourId,
    stepNumber: 7,
    title: "Revenue by customer",
    difficulty: "medium",
    objective: "Group joined rows by customer.",
    instructions: [
      "Join `customers` and `orders`.",
      "Return `customer_name` and total `amount` as `lifetime_revenue`.",
      "Sort by `lifetime_revenue` descending.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT c.customer_name, SUM(o.amount) AS lifetime_revenue\nFROM customers AS c\nJOIN orders AS o\n  ON c.customer_id = o.customer_id\nGROUP BY c.customer_name\nORDER BY lifetime_revenue DESC;",
    orderSensitive: true,
  },
  {
    id: "sql-week-04-task-08",
    weekId: sqlWeekFourId,
    stepNumber: 8,
    title: "Paid orders per customer",
    difficulty: "medium",
    objective: "Group joined rows after filtering.",
    instructions: [
      "Return `customer_name` and the number of paid orders as `paid_order_count`.",
      "Only count paid orders.",
      "Sort by `paid_order_count` descending, then `customer_name`.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT c.customer_name, COUNT(*) AS paid_order_count\nFROM customers AS c\nJOIN orders AS o\n  ON c.customer_id = o.customer_id\nWHERE o.status = 'paid'\nGROUP BY c.customer_name\nORDER BY paid_order_count DESC, c.customer_name;",
    orderSensitive: true,
  },
  {
    id: "sql-week-04-task-09",
    weekId: sqlWeekFourId,
    stepNumber: 9,
    title: "Average order amount by country",
    difficulty: "medium",
    objective: "Aggregate across a join and customer dimension.",
    instructions: [
      "Return `country` and average order `amount` as `avg_amount`.",
      "Sort by `country`.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT c.country, AVG(o.amount) AS avg_amount\nFROM customers AS c\nJOIN orders AS o\n  ON c.customer_id = o.customer_id\nGROUP BY c.country\nORDER BY c.country;",
    orderSensitive: true,
  },
  {
    id: "sql-week-04-task-10",
    weekId: sqlWeekFourId,
    stepNumber: 10,
    title: "Countries with more than one order",
    difficulty: "medium",
    objective: "Use HAVING with grouped results.",
    instructions: [
      "Return `country` and order count as `order_count`.",
      "Only include countries with more than 1 order.",
      "Sort by `order_count` descending.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT c.country, COUNT(*) AS order_count\nFROM customers AS c\nJOIN orders AS o\n  ON c.customer_id = o.customer_id\nGROUP BY c.country\nHAVING COUNT(*) > 1\nORDER BY order_count DESC;",
    orderSensitive: true,
  },
  {
    id: "sql-week-04-task-11",
    weekId: sqlWeekFourId,
    stepNumber: 11,
    title: "Latest order date per customer",
    difficulty: "medium",
    objective: "Use MAX on grouped joined rows.",
    instructions: [
      "Return `customer_name` and latest `order_date` as `latest_order_date`.",
      "Sort by `latest_order_date` descending.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT c.customer_name, MAX(o.order_date) AS latest_order_date\nFROM customers AS c\nJOIN orders AS o\n  ON c.customer_id = o.customer_id\nGROUP BY c.customer_name\nORDER BY latest_order_date DESC;",
    orderSensitive: true,
  },
  {
    id: "sql-week-04-task-12",
    weekId: sqlWeekFourId,
    stepNumber: 12,
    title: "Minimum and maximum order amount by status",
    difficulty: "medium",
    objective: "Use multiple aggregates in one grouped query.",
    instructions: [
      "Return `status`, minimum `amount` as `min_amount`, and maximum `amount` as `max_amount`.",
      "Sort by `status`.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT status, MIN(amount) AS min_amount, MAX(amount) AS max_amount\nFROM orders\nGROUP BY status\nORDER BY status;",
    orderSensitive: true,
  },
  {
    id: "sql-week-04-task-13",
    weekId: sqlWeekFourId,
    stepNumber: 13,
    title: "Active customer revenue only",
    difficulty: "medium",
    objective: "Aggregate after filtering joined customer state.",
    instructions: [
      "Return total revenue from active customers only as `active_customer_revenue`.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT SUM(o.amount) AS active_customer_revenue\nFROM orders AS o\nJOIN customers AS c\n  ON o.customer_id = c.customer_id\nWHERE c.is_active = 1;",
    orderSensitive: true,
  },
  {
    id: "sql-week-04-task-14",
    weekId: sqlWeekFourId,
    stepNumber: 14,
    title: "Paid revenue by country",
    difficulty: "medium",
    objective: "Group joined rows with multiple business rules.",
    instructions: [
      "Return `country` and total paid revenue as `paid_revenue`.",
      "Only include paid orders.",
      "Sort by `paid_revenue` descending.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT c.country, SUM(o.amount) AS paid_revenue\nFROM customers AS c\nJOIN orders AS o\n  ON c.customer_id = o.customer_id\nWHERE o.status = 'paid'\nGROUP BY c.country\nORDER BY paid_revenue DESC;",
    orderSensitive: true,
  },
  {
    id: "sql-week-04-task-15",
    weekId: sqlWeekFourId,
    stepNumber: 15,
    title: "Week 4 aggregation challenge",
    difficulty: "medium",
    objective: "Combine joins, grouping, filtering, and ordering into one report.",
    instructions: [
      "Return `customer_name`, the number of paid orders as `paid_orders`, and total paid revenue as `paid_revenue`.",
      "Only include customers with at least 1 paid order.",
      "Sort by `paid_revenue` descending.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT c.customer_name, COUNT(*) AS paid_orders, SUM(o.amount) AS paid_revenue\nFROM customers AS c\nJOIN orders AS o\n  ON c.customer_id = o.customer_id\nWHERE o.status = 'paid'\nGROUP BY c.customer_name\nHAVING COUNT(*) >= 1\nORDER BY paid_revenue DESC;",
    orderSensitive: true,
  },
];

function buildSqlWeekFourGeneratedTasks(): SqlTaskDefinition[] {
  const families: Array<(stepNumber: number) => Omit<SqlTaskDefinition, "id" | "weekId" | "stepNumber">> = [
    (stepNumber) => ({
      title: `Revenue by status metric ${stepNumber}`,
      difficulty: "medium",
      objective: "Aggregate order revenue by status.",
      instructions: [
        "Return `status`, order count as `order_count`, and total amount as `total_amount`.",
        "Sort by `status`.",
      ],
      starterSql: "",
      solutionSql: `SELECT status, COUNT(*) AS order_count, SUM(amount) AS total_amount
FROM orders
GROUP BY status
ORDER BY status;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Payment gateway reconciliation ${stepNumber}`,
      difficulty: "medium",
      objective: "Aggregate payment amounts by gateway for reconciliation.",
      instructions: [
        "Return `gateway`, captured payment count, and captured payment total.",
        "Use aliases `captured_count` and `captured_total`.",
        "Sort by `captured_total` descending.",
      ],
      starterSql: "",
      solutionSql: `SELECT gateway, COUNT(*) AS captured_count, SUM(payment_amount) AS captured_total
FROM payments
WHERE payment_status = 'captured'
GROUP BY gateway
ORDER BY captured_total DESC;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Country paid revenue HAVING ${stepNumber}`,
      difficulty: "medium",
      objective: "Use HAVING after joining and grouping.",
      instructions: [
        "Return countries with paid revenue above 100.",
        "Show `country` and `paid_revenue`.",
        "Sort by `paid_revenue` descending.",
      ],
      starterSql: "",
      solutionSql: `SELECT c.country, SUM(o.amount) AS paid_revenue
FROM customers AS c
JOIN orders AS o
  ON o.customer_id = c.customer_id
WHERE o.status = 'paid'
GROUP BY c.country
HAVING SUM(o.amount) > 100
ORDER BY paid_revenue DESC;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `CASE order value bands ${stepNumber}`,
      difficulty: "medium",
      objective: "Use CASE to create deterministic value bands before grouping.",
      instructions: [
        "Bucket orders into `high`, `medium`, and `low` using amount >= 200 and amount >= 100.",
        "Return `amount_band` and `order_count`.",
        "Sort by `amount_band`.",
      ],
      starterSql: "",
      solutionSql: `SELECT
  CASE
    WHEN amount >= 200 THEN 'high'
    WHEN amount >= 100 THEN 'medium'
    ELSE 'low'
  END AS amount_band,
  COUNT(*) AS order_count
FROM orders
GROUP BY amount_band
ORDER BY amount_band;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `CTE paid customer revenue ${stepNumber}`,
      difficulty: "medium",
      objective: "Use a CTE to isolate paid orders before aggregation.",
      instructions: [
        "Use a CTE named `paid_orders`.",
        "Return `customer_name` and `paid_revenue`.",
        "Sort by `paid_revenue` descending.",
      ],
      starterSql: "",
      solutionSql: `WITH paid_orders AS (
  SELECT customer_id, amount
  FROM orders
  WHERE status = 'paid'
)
SELECT c.customer_name, SUM(p.amount) AS paid_revenue
FROM paid_orders AS p
JOIN customers AS c
  ON c.customer_id = p.customer_id
GROUP BY c.customer_name
ORDER BY paid_revenue DESC;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Subquery above average orders ${stepNumber}`,
      difficulty: "medium",
      objective: "Use a scalar subquery for above-average filtering.",
      instructions: [
        "Return orders with amount greater than the average order amount.",
        "Show `order_id`, `amount`, and `status`.",
        "Sort by `amount` descending.",
      ],
      starterSql: "",
      solutionSql: `SELECT order_id, amount, status
FROM orders
WHERE amount > (SELECT AVG(amount) FROM orders)
ORDER BY amount DESC;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Payment order amount mismatch ${stepNumber}`,
      difficulty: "medium",
      objective: "Reconcile order amount to payment amount.",
      instructions: [
        "Return payment rows where payment amount differs from order amount.",
        "Show `order_id`, `amount`, `payment_amount`, and `payment_status`.",
        "Sort by `order_id`.",
      ],
      starterSql: "",
      solutionSql: `SELECT o.order_id, o.amount, p.payment_amount, p.payment_status
FROM orders AS o
JOIN payments AS p
  ON p.order_id = o.order_id
WHERE p.payment_amount <> o.amount
ORDER BY o.order_id;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Latest order per customer CTE ${stepNumber}`,
      difficulty: "medium",
      objective: "Use a CTE and grouped max date to find latest customer orders.",
      instructions: [
        "Return each customer's latest order date.",
        "Show `customer_name` and `latest_order_date`.",
        "Sort by `latest_order_date` descending.",
      ],
      starterSql: "",
      solutionSql: `WITH latest AS (
  SELECT customer_id, MAX(order_date) AS latest_order_date
  FROM orders
  GROUP BY customer_id
)
SELECT c.customer_name, l.latest_order_date
FROM latest AS l
JOIN customers AS c
  ON c.customer_id = l.customer_id
ORDER BY l.latest_order_date DESC;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Window ranked orders ${stepNumber}`,
      difficulty: "medium",
      objective: "Use row_number-style window logic for ranked transactions.",
      instructions: [
        "Return the highest amount order for each customer.",
        "Show `customer_id`, `order_id`, `amount`, and `amount_rank`.",
        "Sort by `customer_id`.",
      ],
      starterSql: "",
      solutionSql: `WITH ranked AS (
  SELECT
    customer_id,
    order_id,
    amount,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC, order_id) AS amount_rank
  FROM orders
)
SELECT customer_id, order_id, amount, amount_rank
FROM ranked
WHERE amount_rank = 1
ORDER BY customer_id;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Shipment SLA summary ${stepNumber}`,
      difficulty: "medium",
      objective: "Aggregate fulfillment durations with null-safe filtering.",
      instructions: [
        "Return delivered shipment count by carrier.",
        "Also return average delivery days as `avg_delivery_days`.",
        "Sort by `carrier`.",
      ],
      starterSql: "",
      solutionSql: `SELECT carrier, COUNT(*) AS delivered_count, AVG(julianday(delivered_date) - julianday(shipped_date)) AS avg_delivery_days
FROM shipments
WHERE delivered_date IS NOT NULL
GROUP BY carrier
ORDER BY carrier;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Event source quality summary ${stepNumber}`,
      difficulty: "medium",
      objective: "Use conditional aggregation for event quality checks.",
      instructions: [
        "Return `source_system`, total events, and missing batch count.",
        "Use aliases `event_count` and `missing_batch_count`.",
        "Sort by `source_system`.",
      ],
      starterSql: "",
      solutionSql: `SELECT
  source_system,
  COUNT(*) AS event_count,
  SUM(CASE WHEN batch_id IS NULL THEN 1 ELSE 0 END) AS missing_batch_count
FROM events
GROUP BY source_system
ORDER BY source_system;`,
      orderSensitive: true,
    }),
  ];

  return Array.from({ length: 110 }, (_, index) => {
    const stepNumber = index + 16;
    const task = families[index % families.length](stepNumber);
    return {
      id: `sql-week-04-task-${String(stepNumber).padStart(3, "0")}`,
      weekId: sqlWeekFourId,
      stepNumber,
      ...task,
    };
  });
}

export const sqlWeekFourTasks: SqlTaskDefinition[] = [
  ...sqlWeekFourBaseTasks,
  ...buildSqlWeekFourGeneratedTasks(),
];

export const sqlWeekFourUnlockMessage =
  "Complete all 15 Week 4 tasks with correct answers to finish this current SQL mission block and move into deeper zero-to-legend practice.";
