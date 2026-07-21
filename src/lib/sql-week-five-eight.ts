import { SqlTaskDefinition } from "@/lib/types";

const starterSql = "";

type SqlWeekGeneratedConfig = {
  weekId: string;
  weekNumber: number;
  focus: string;
};

const countryPairs = [
  ["US", "Canada"],
  ["India", "UK"],
  ["US", "India"],
  ["Canada", "UK"],
] as const;

const statuses = ["paid", "pending", "cancelled"] as const;
const gateways = ["stripe", "paypal", "adyen", "razorpay"] as const;
const carriers = ["FedEx", "UPS", "DHL", "BlueDart"] as const;
const severities = ["high", "medium", "critical", "low"] as const;

function makeTask(
  weekId: string,
  stepNumber: number,
  seed: Omit<SqlTaskDefinition, "id" | "weekId" | "stepNumber">,
): SqlTaskDefinition {
  return {
    id: `${weekId}-task-${String(stepNumber).padStart(3, "0")}`,
    weekId,
    stepNumber,
    ...seed,
  };
}

function buildGeneratedSqlWeek(config: SqlWeekGeneratedConfig): SqlTaskDefinition[] {
  const families: Array<(stepNumber: number) => Omit<SqlTaskDefinition, "id" | "weekId" | "stepNumber">> = [
    (stepNumber) => {
      const pair = countryPairs[(stepNumber + config.weekNumber) % countryPairs.length];
      return {
        title: `${config.focus} joined paid revenue by country ${stepNumber}`,
        difficulty: "medium",
        objective: "Join customers to orders, filter paid orders, and aggregate at country grain.",
        instructions: [
          `Return paid revenue for customers in ${pair[0]} or ${pair[1]}.`,
          "Show `country`, `paid_order_count`, and `paid_revenue`.",
          "Sort by `paid_revenue` descending, then `country`.",
        ],
        starterSql,
        solutionSql: `SELECT c.country, COUNT(o.order_id) AS paid_order_count, SUM(o.amount) AS paid_revenue
FROM customers AS c
JOIN orders AS o
  ON o.customer_id = c.customer_id
WHERE o.status = 'paid'
  AND c.country IN ('${pair[0]}', '${pair[1]}')
GROUP BY c.country
ORDER BY paid_revenue DESC, c.country;`,
        orderSensitive: true,
      };
    },
    (stepNumber) => {
      const threshold = 75 + ((stepNumber + config.weekNumber) % 7) * 35;
      return {
        title: `${config.focus} HAVING paid customer threshold ${stepNumber}`,
        difficulty: "medium",
        objective: "Use HAVING to filter grouped customer metrics.",
        instructions: [
          `Return customers with paid revenue greater than ${threshold}.`,
          "Show `customer_id`, `customer_name`, and `paid_revenue`.",
          "Sort by `paid_revenue` descending.",
        ],
        starterSql,
        solutionSql: `SELECT c.customer_id, c.customer_name, SUM(o.amount) AS paid_revenue
FROM customers AS c
JOIN orders AS o
  ON o.customer_id = c.customer_id
WHERE o.status = 'paid'
GROUP BY c.customer_id, c.customer_name
HAVING SUM(o.amount) > ${threshold}
ORDER BY paid_revenue DESC;`,
        orderSensitive: true,
      };
    },
    (stepNumber) => {
      const high = 160 + ((stepNumber + config.weekNumber) % 5) * 30;
      return {
        title: `${config.focus} CASE amount band audit ${stepNumber}`,
        difficulty: "medium",
        objective: "Create business buckets with CASE and aggregate them.",
        instructions: [
          `Use ${high} as the high-value cutoff.`,
          "Return `amount_band`, `order_count`, and `total_amount`.",
          "Sort by `amount_band`.",
        ],
        starterSql,
        solutionSql: `SELECT
  CASE
    WHEN amount >= ${high} THEN 'high'
    WHEN amount >= 100 THEN 'standard'
    ELSE 'low'
  END AS amount_band,
  COUNT(*) AS order_count,
  SUM(amount) AS total_amount
FROM orders
GROUP BY amount_band
ORDER BY amount_band;`,
        orderSensitive: true,
      };
    },
    (stepNumber) => {
      const status = statuses[(stepNumber + config.weekNumber) % statuses.length];
      return {
        title: `${config.focus} CTE status payment reconciliation ${stepNumber}`,
        difficulty: "medium",
        objective: "Use a CTE before reconciling order and payment amounts.",
        instructions: [
          `Use a CTE named ` + "`status_orders`" + ` for ${status} orders.`,
          "Return orders where captured payment amount equals order amount.",
          "Show `order_id`, `amount`, `payment_amount`, and `gateway`.",
        ],
        starterSql,
        solutionSql: `WITH status_orders AS (
  SELECT order_id, amount
  FROM orders
  WHERE status = '${status}'
)
SELECT s.order_id, s.amount, p.payment_amount, p.gateway
FROM status_orders AS s
JOIN payments AS p
  ON p.order_id = s.order_id
WHERE p.payment_status = 'captured'
  AND p.payment_amount = s.amount
ORDER BY s.order_id;`,
        orderSensitive: true,
      };
    },
    (stepNumber) => {
      const gateway = gateways[(stepNumber + config.weekNumber) % gateways.length];
      return {
        title: `${config.focus} gateway refund quality check ${stepNumber}`,
        difficulty: "medium",
        objective: "Find gateway-specific payment quality issues.",
        instructions: [
          `Return ${gateway} payments that failed, refunded, or have a refund amount.`,
          "Show `payment_id`, `order_id`, `payment_status`, and `refund_amount`.",
          "Sort by `payment_id`.",
        ],
        starterSql,
        solutionSql: `SELECT payment_id, order_id, payment_status, refund_amount
FROM payments
WHERE gateway = '${gateway}'
  AND (payment_status IN ('failed', 'refunded') OR refund_amount IS NOT NULL)
ORDER BY payment_id;`,
        orderSensitive: true,
      };
    },
    (stepNumber) => {
      const startDay = String(1 + ((stepNumber + config.weekNumber) % 10)).padStart(2, "0");
      const endDay = String(12 + ((stepNumber + config.weekNumber) % 11)).padStart(2, "0");
      return {
        title: `${config.focus} date-window order extract ${stepNumber}`,
        difficulty: "medium",
        objective: "Use date windows with deterministic ordering.",
        instructions: [
          `Return orders from 2026-04-${startDay} through 2026-04-${endDay}.`,
          "Show `order_id`, `customer_id`, `order_date`, and `amount`.",
          "Sort by `order_date`, then `order_id`.",
        ],
        starterSql,
        solutionSql: `SELECT order_id, customer_id, order_date, amount
FROM orders
WHERE order_date BETWEEN '2026-04-${startDay}' AND '2026-04-${endDay}'
ORDER BY order_date, order_id;`,
        orderSensitive: true,
      };
    },
    (stepNumber) => {
      const carrier = carriers[(stepNumber + config.weekNumber) % carriers.length];
      return {
        title: `${config.focus} shipment SLA exception scan ${stepNumber}`,
        difficulty: "medium",
        objective: "Use joined shipment data to find delivery exceptions.",
        instructions: [
          `Return ${carrier} shipments that are not delivered or have no delivered date.`,
          "Show `shipment_id`, `order_id`, `carrier`, and `shipment_status`.",
          "Sort by `shipment_id`.",
        ],
        starterSql,
        solutionSql: `SELECT shipment_id, order_id, carrier, shipment_status
FROM shipments
WHERE carrier = '${carrier}'
  AND (shipment_status <> 'delivered' OR delivered_date IS NULL)
ORDER BY shipment_id;`,
        orderSensitive: true,
      };
    },
    (stepNumber) => {
      const severity = severities[(stepNumber + config.weekNumber) % severities.length];
      return {
        title: `${config.focus} event payload quality metric ${stepNumber}`,
        difficulty: "medium",
        objective: "Aggregate event quality metrics by source system.",
        instructions: [
          `Return ${severity} event counts and total payload size by source system.`,
          "Show `source_system`, `event_count`, and `total_payload_size`.",
          "Sort by `source_system`.",
        ],
        starterSql,
        solutionSql: `SELECT source_system, COUNT(*) AS event_count, SUM(payload_size) AS total_payload_size
FROM events
WHERE severity = '${severity}'
GROUP BY source_system
ORDER BY source_system;`,
        orderSensitive: true,
      };
    },
    (stepNumber) => ({
      title: `${config.focus} latest order per customer ${stepNumber}`,
      difficulty: "medium",
      objective: "Use a window function to choose the latest order per customer.",
      instructions: [
        "Return the latest order for each customer by `order_date`.",
        "Show `customer_id`, `order_id`, `order_date`, and `amount`.",
        "Sort by `customer_id`.",
      ],
      starterSql,
      solutionSql: `WITH ranked_orders AS (
  SELECT
    customer_id,
    order_id,
    order_date,
    amount,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC) AS rn
  FROM orders
)
SELECT customer_id, order_id, order_date, amount
FROM ranked_orders
WHERE rn = 1
ORDER BY customer_id;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `${config.focus} customer order coverage reconciliation ${stepNumber}`,
      difficulty: "medium",
      objective: "Use a left join to identify missing fact-table matches.",
      instructions: [
        "Return active customers that have no orders.",
        "Show `customer_id`, `customer_name`, and `country`.",
        "Sort by `customer_id`.",
      ],
      starterSql,
      solutionSql: `SELECT c.customer_id, c.customer_name, c.country
FROM customers AS c
LEFT JOIN orders AS o
  ON o.customer_id = c.customer_id
WHERE c.is_active = 1
  AND o.order_id IS NULL
ORDER BY c.customer_id;`,
      orderSensitive: true,
    }),
  ];

  return Array.from({ length: 125 }, (_, index) => {
    const stepNumber = index + 1;
    const task = families[(index + config.weekNumber) % families.length](stepNumber);
    return makeTask(config.weekId, stepNumber, task);
  });
}

export const sqlWeekFiveId = "sql-week-05";
export const sqlWeekSixId = "sql-week-06";
export const sqlWeekSevenId = "sql-week-07";
export const sqlWeekEightId = "sql-week-08";
export const sqlWeekNineId = "sql-week-09";
export const sqlWeekTenId = "sql-week-10";
export const sqlWeekElevenId = "sql-week-11";
export const sqlWeekTwelveId = "sql-week-12";
export const sqlWeekThirteenId = "sql-week-13";
export const sqlWeekFourteenId = "sql-week-14";
export const sqlWeekFifteenId = "sql-week-15";
export const sqlWeekSixteenId = "sql-week-16";
export const sqlWeekSeventeenId = "sql-week-17";
export const sqlWeekEighteenId = "sql-week-18";
export const sqlWeekNineteenId = "sql-week-19";
export const sqlWeekTwentyId = "sql-week-20";
export const sqlWeekTwentyOneId = "sql-week-21";
export const sqlWeekTwentyTwoId = "sql-week-22";
export const sqlWeekTwentyThreeId = "sql-week-23";
export const sqlWeekTwentyFourId = "sql-week-24";

export const sqlWeekFiveTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekFiveId,
  weekNumber: 5,
  focus: "Warehouse joins",
});

export const sqlWeekSixTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekSixId,
  weekNumber: 6,
  focus: "Quality gates",
});

export const sqlWeekSevenTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekSevenId,
  weekNumber: 7,
  focus: "Window logic",
});

export const sqlWeekEightTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekEightId,
  weekNumber: 8,
  focus: "Reconciliation metrics",
});

export const sqlWeekNineTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekNineId,
  weekNumber: 9,
  focus: "Advanced windows",
});

export const sqlWeekTenTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekTenId,
  weekNumber: 10,
  focus: "Cohort funnels",
});

export const sqlWeekElevenTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekElevenId,
  weekNumber: 11,
  focus: "CDC current state",
});

export const sqlWeekTwelveTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekTwelveId,
  weekNumber: 12,
  focus: "Metric debugging",
});

export const sqlWeekThirteenTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekThirteenId,
  weekNumber: 13,
  focus: "Retention windows",
});

export const sqlWeekFourteenTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekFourteenId,
  weekNumber: 14,
  focus: "SCD lookup audits",
});

export const sqlWeekFifteenTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekFifteenId,
  weekNumber: 15,
  focus: "CDC reconciliation",
});

export const sqlWeekSixteenTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekSixteenId,
  weekNumber: 16,
  focus: "Incident metrics",
});

export const sqlWeekSeventeenTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekSeventeenId,
  weekNumber: 17,
  focus: "Session recovery",
});

export const sqlWeekEighteenTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekEighteenId,
  weekNumber: 18,
  focus: "Ledger balancing",
});

export const sqlWeekNineteenTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekNineteenId,
  weekNumber: 19,
  focus: "Identity resolution",
});

export const sqlWeekTwentyTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekTwentyId,
  weekNumber: 20,
  focus: "Late fact repair",
});

export const sqlWeekTwentyOneTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekTwentyOneId,
  weekNumber: 21,
  focus: "SLA monitoring",
});

export const sqlWeekTwentyTwoTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekTwentyTwoId,
  weekNumber: 22,
  focus: "Snapshot validation",
});

export const sqlWeekTwentyThreeTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekTwentyThreeId,
  weekNumber: 23,
  focus: "Backfill safety",
});

export const sqlWeekTwentyFourTasks = buildGeneratedSqlWeek({
  weekId: sqlWeekTwentyFourId,
  weekNumber: 24,
  focus: "Senior warehouse review",
});

export const sqlWeekFiveUnlockMessage = "Complete all 125 Week 5 SQL tasks to unlock Week 6.";
export const sqlWeekSixUnlockMessage = "Complete all 125 Week 6 SQL tasks to unlock Week 7.";
export const sqlWeekSevenUnlockMessage = "Complete all 125 Week 7 SQL tasks to unlock Week 8.";
export const sqlWeekEightUnlockMessage = "Complete all 125 Week 8 SQL tasks to unlock Week 9.";
export const sqlWeekNineUnlockMessage = "Complete all 125 Week 9 SQL tasks to unlock Week 10.";
export const sqlWeekTenUnlockMessage = "Complete all 125 Week 10 SQL tasks to unlock Week 11.";
export const sqlWeekElevenUnlockMessage = "Complete all 125 Week 11 SQL tasks to unlock Week 12.";
export const sqlWeekTwelveUnlockMessage = "Complete all 125 Week 12 SQL tasks to unlock Week 13.";
export const sqlWeekThirteenUnlockMessage = "Complete all 125 Week 13 SQL tasks to unlock Week 14.";
export const sqlWeekFourteenUnlockMessage = "Complete all 125 Week 14 SQL tasks to unlock Week 15.";
export const sqlWeekFifteenUnlockMessage = "Complete all 125 Week 15 SQL tasks to unlock Week 16.";
export const sqlWeekSixteenUnlockMessage = "Complete all 125 Week 16 SQL tasks to unlock Week 17.";
export const sqlWeekSeventeenUnlockMessage = "Complete all 125 Week 17 SQL tasks to unlock Week 18.";
export const sqlWeekEighteenUnlockMessage = "Complete all 125 Week 18 SQL tasks to unlock Week 19.";
export const sqlWeekNineteenUnlockMessage = "Complete all 125 Week 19 SQL tasks to unlock Week 20.";
export const sqlWeekTwentyUnlockMessage = "Complete all 125 Week 20 SQL tasks to unlock Week 21.";
export const sqlWeekTwentyOneUnlockMessage = "Complete all 125 Week 21 SQL tasks to unlock Week 22.";
export const sqlWeekTwentyTwoUnlockMessage = "Complete all 125 Week 22 SQL tasks to unlock Week 23.";
export const sqlWeekTwentyThreeUnlockMessage = "Complete all 125 Week 23 SQL tasks to unlock Week 24.";
export const sqlWeekTwentyFourUnlockMessage = "Complete all 125 Week 24 SQL tasks to finish the 3000-question SQL bank.";
