import { SqlTaskDefinition } from "@/lib/types";

export const sqlWeekTwoId = "sql-week-02";

const sqlWeekTwoBaseTasks: SqlTaskDefinition[] = [
  {
    id: "sql-week-02-task-01",
    weekId: sqlWeekTwoId,
    stepNumber: 1,
    title: "Filter only active customers",
    difficulty: "easy",
    objective: "Use a basic WHERE clause with one exact condition.",
    instructions: [
      "Return `customer_id`, `customer_name`, and `is_active` from `customers`.",
      "Only include rows where the customer is active.",
    ],
    starterSql: "",
    solutionSql: "SELECT customer_id, customer_name, is_active\nFROM customers\nWHERE is_active = 1;",
    orderSensitive: true,
  },
  {
    id: "sql-week-02-task-02",
    weekId: sqlWeekTwoId,
    stepNumber: 2,
    title: "Filter only US customers",
    difficulty: "easy",
    objective: "Use WHERE on a text column.",
    instructions: [
      "Return `customer_id`, `customer_name`, and `country`.",
      "Only include customers from the US.",
    ],
    starterSql: "",
    solutionSql: "SELECT customer_id, customer_name, country\nFROM customers\nWHERE country = 'US';",
    orderSensitive: true,
  },
  {
    id: "sql-week-02-task-03",
    weekId: sqlWeekTwoId,
    stepNumber: 3,
    title: "Paid orders only",
    difficulty: "easy",
    objective: "Filter transactional rows by status.",
    instructions: [
      "Return `order_id`, `status`, and `amount` from `orders`.",
      "Only include paid orders.",
    ],
    starterSql: "",
    solutionSql: "SELECT order_id, status, amount\nFROM orders\nWHERE status = 'paid';",
    orderSensitive: true,
  },
  {
    id: "sql-week-02-task-04",
    weekId: sqlWeekTwoId,
    stepNumber: 4,
    title: "Use a greater-than filter",
    difficulty: "easy",
    objective: "Filter by a numeric threshold.",
    instructions: [
      "Return `order_id` and `amount` for orders above 200.",
      "Sort by `amount` descending.",
    ],
    starterSql: "",
    solutionSql: "SELECT order_id, amount\nFROM orders\nWHERE amount > 200\nORDER BY amount DESC;",
    orderSensitive: true,
  },
  {
    id: "sql-week-02-task-05",
    weekId: sqlWeekTwoId,
    stepNumber: 5,
    title: "Use a less-than filter",
    difficulty: "easy",
    objective: "Filter by the opposite numeric direction.",
    instructions: [
      "Return `order_id`, `amount`, and `status` for orders under 100.",
      "Sort by `order_id`.",
    ],
    starterSql: "",
    solutionSql: "SELECT order_id, amount, status\nFROM orders\nWHERE amount < 100\nORDER BY order_id;",
    orderSensitive: true,
  },
  {
    id: "sql-week-02-task-06",
    weekId: sqlWeekTwoId,
    stepNumber: 6,
    title: "Combine two conditions with AND",
    difficulty: "easy",
    objective: "Apply multiple filters at the same time.",
    instructions: [
      "Return active customers from the US.",
      "Show `customer_id`, `customer_name`, `country`, and `is_active`.",
    ],
    starterSql: "",
    solutionSql: "SELECT customer_id, customer_name, country, is_active\nFROM customers\nWHERE country = 'US'\n  AND is_active = 1;",
    orderSensitive: true,
  },
  {
    id: "sql-week-02-task-07",
    weekId: sqlWeekTwoId,
    stepNumber: 7,
    title: "Combine two values with OR",
    difficulty: "easy",
    objective: "Use OR for alternative matches.",
    instructions: [
      "Return customers from the US or Canada.",
      "Show `customer_id`, `customer_name`, and `country`.",
      "Sort by `customer_id`.",
    ],
    starterSql: "",
    solutionSql: "SELECT customer_id, customer_name, country\nFROM customers\nWHERE country = 'US'\n   OR country = 'Canada'\nORDER BY customer_id;",
    orderSensitive: true,
  },
  {
    id: "sql-week-02-task-08",
    weekId: sqlWeekTwoId,
    stepNumber: 8,
    title: "Use IN for multiple statuses",
    difficulty: "medium",
    objective: "Write cleaner multi-value filters.",
    instructions: [
      "Return orders where status is `paid` or `pending`.",
      "Show `order_id`, `status`, and `amount`.",
      "Sort by `order_id`.",
    ],
    starterSql: "",
    solutionSql: "SELECT order_id, status, amount\nFROM orders\nWHERE status IN ('paid', 'pending')\nORDER BY order_id;",
    orderSensitive: true,
  },
  {
    id: "sql-week-02-task-09",
    weekId: sqlWeekTwoId,
    stepNumber: 9,
    title: "Use BETWEEN on amounts",
    difficulty: "medium",
    objective: "Filter within an inclusive numeric range.",
    instructions: [
      "Return orders with amount between 90 and 200 inclusive.",
      "Show `order_id`, `amount`, and `status`.",
      "Sort by `amount` ascending.",
    ],
    starterSql: "",
    solutionSql: "SELECT order_id, amount, status\nFROM orders\nWHERE amount BETWEEN 90 AND 200\nORDER BY amount;",
    orderSensitive: true,
  },
  {
    id: "sql-week-02-task-10",
    weekId: sqlWeekTwoId,
    stepNumber: 10,
    title: "Use LIKE for text matching",
    difficulty: "medium",
    objective: "Use pattern matching on strings.",
    instructions: [
      "Return customers whose name starts with `A`.",
      "Show `customer_id` and `customer_name`.",
    ],
    starterSql: "",
    solutionSql: "SELECT customer_id, customer_name\nFROM customers\nWHERE customer_name LIKE 'A%';",
    orderSensitive: true,
  },
  {
    id: "sql-week-02-task-11",
    weekId: sqlWeekTwoId,
    stepNumber: 11,
    title: "Find missing emails",
    difficulty: "medium",
    objective: "Handle NULL correctly with IS NULL.",
    instructions: [
      "Return customers that do not have an email address.",
      "Show `customer_id`, `customer_name`, and `email`.",
    ],
    starterSql: "",
    solutionSql: "SELECT customer_id, customer_name, email\nFROM customers\nWHERE email IS NULL;",
    orderSensitive: true,
  },
  {
    id: "sql-week-02-task-12",
    weekId: sqlWeekTwoId,
    stepNumber: 12,
    title: "Find non-null emails",
    difficulty: "medium",
    objective: "Use IS NOT NULL for the opposite case.",
    instructions: [
      "Return customers who do have an email address.",
      "Show `customer_id`, `customer_name`, and `email`.",
      "Sort by `customer_id`.",
    ],
    starterSql: "",
    solutionSql: "SELECT customer_id, customer_name, email\nFROM customers\nWHERE email IS NOT NULL\nORDER BY customer_id;",
    orderSensitive: true,
  },
  {
    id: "sql-week-02-task-13",
    weekId: sqlWeekTwoId,
    stepNumber: 13,
    title: "Filter by date range",
    difficulty: "medium",
    objective: "Apply a time-based filter cleanly.",
    instructions: [
      "Return orders placed on or after `2026-04-10` and on or before `2026-04-20`.",
      "Show `order_id`, `order_date`, and `amount`.",
      "Sort by `order_date` ascending.",
    ],
    starterSql: "",
    solutionSql: "SELECT order_id, order_date, amount\nFROM orders\nWHERE order_date >= '2026-04-10'\n  AND order_date <= '2026-04-20'\nORDER BY order_date;",
    orderSensitive: true,
  },
  {
    id: "sql-week-02-task-14",
    weekId: sqlWeekTwoId,
    stepNumber: 14,
    title: "Use NOT to exclude rows",
    difficulty: "medium",
    objective: "Negate a business rule safely.",
    instructions: [
      "Return orders that are not cancelled.",
      "Show `order_id`, `status`, and `amount`.",
      "Sort by `order_id`.",
    ],
    starterSql: "",
    solutionSql: "SELECT order_id, status, amount\nFROM orders\nWHERE NOT status = 'cancelled'\nORDER BY order_id;",
    orderSensitive: true,
  },
  {
    id: "sql-week-02-task-15",
    weekId: sqlWeekTwoId,
    stepNumber: 15,
    title: "Week 2 filtering challenge",
    difficulty: "medium",
    objective: "Combine several filtering tools in one answer.",
    instructions: [
      "Return paid or pending orders with amount at least 75.",
      "Exclude `bank` payments.",
      "Show `order_id`, `status`, `amount`, and `payment_method`.",
      "Sort by `amount` descending.",
    ],
    starterSql: "",
    solutionSql: "SELECT order_id, status, amount, payment_method\nFROM orders\nWHERE status IN ('paid', 'pending')\n  AND amount >= 75\n  AND payment_method <> 'bank'\nORDER BY amount DESC;",
    orderSensitive: true,
  },
];

function buildSqlWeekTwoGeneratedTasks(): SqlTaskDefinition[] {
  const families: Array<(stepNumber: number) => Omit<SqlTaskDefinition, "id" | "weekId" | "stepNumber">> = [
    (stepNumber) => {
      const minimum = 50 + (stepNumber % 6) * 40;
      return {
        title: `Orders at or above ${minimum} - drill ${stepNumber}`,
        difficulty: "medium",
        objective: "Use a numeric predicate with deterministic ordering.",
        instructions: [
          `Return orders with amount greater than or equal to ${minimum}.`,
          "Show `order_id`, `status`, `amount`, and `payment_method`.",
          "Sort by `amount` descending, then `order_id`.",
        ],
        starterSql: "",
        solutionSql: `SELECT order_id, status, amount, payment_method
FROM orders
WHERE amount >= ${minimum}
ORDER BY amount DESC, order_id;`,
        orderSensitive: true,
      };
    },
    (stepNumber) => {
      const statuses = stepNumber % 2 === 0 ? "'paid', 'pending'" : "'paid', 'cancelled'";
      return {
        title: `Status set filter ${stepNumber}`,
        difficulty: "medium",
        objective: "Use IN to express multi-status business logic.",
        instructions: [
          `Return orders where status is in (${statuses}).`,
          "Show `order_id`, `status`, `amount`, and `order_date`.",
          "Sort by `order_date`, then `order_id`.",
        ],
        starterSql: "",
        solutionSql: `SELECT order_id, status, amount, order_date
FROM orders
WHERE status IN (${statuses})
ORDER BY order_date, order_id;`,
        orderSensitive: true,
      };
    },
    (stepNumber) => {
      const startDay = String(1 + (stepNumber % 12)).padStart(2, "0");
      const endDay = String(12 + (stepNumber % 10)).padStart(2, "0");
      return {
        title: `Date window filter ${stepNumber}`,
        difficulty: "medium",
        objective: "Filter rows within an inclusive date window.",
        instructions: [
          `Return orders between 2026-04-${startDay} and 2026-04-${endDay}.`,
          "Show `order_id`, `order_date`, `status`, and `amount`.",
          "Sort by `order_date`, then `order_id`.",
        ],
        starterSql: "",
        solutionSql: `SELECT order_id, order_date, status, amount
FROM orders
WHERE order_date BETWEEN '2026-04-${startDay}' AND '2026-04-${endDay}'
ORDER BY order_date, order_id;`,
        orderSensitive: true,
      };
    },
    (stepNumber) => {
      const countries = stepNumber % 2 === 0 ? "'US', 'Canada'" : "'India', 'UK'";
      return {
        title: `Customer country set ${stepNumber}`,
        difficulty: "medium",
        objective: "Use IN and boolean predicates on customer rows.",
        instructions: [
          `Return active customers whose country is in (${countries}).`,
          "Show `customer_id`, `customer_name`, `country`, and `is_active`.",
          "Sort by `country`, then `customer_id`.",
        ],
        starterSql: "",
        solutionSql: `SELECT customer_id, customer_name, country, is_active
FROM customers
WHERE is_active = 1
  AND country IN (${countries})
ORDER BY country, customer_id;`,
        orderSensitive: true,
      };
    },
    (stepNumber) => {
      const method = ["card", "paypal", "upi", "bank"][stepNumber % 4];
      return {
        title: `Payment method exclusion ${stepNumber}`,
        difficulty: "medium",
        objective: "Use NOT and a payment-method predicate.",
        instructions: [
          `Return non-cancelled orders where payment method is not ${method}.`,
          "Show `order_id`, `status`, `amount`, and `payment_method`.",
          "Sort by `order_id`.",
        ],
        starterSql: "",
        solutionSql: `SELECT order_id, status, amount, payment_method
FROM orders
WHERE status <> 'cancelled'
  AND payment_method <> '${method}'
ORDER BY order_id;`,
        orderSensitive: true,
      };
    },
    (stepNumber) => {
      const prefix = ["A", "E", "L", "S", "N"][stepNumber % 5];
      return {
        title: `Customer name prefix ${prefix} - drill ${stepNumber}`,
        difficulty: "medium",
        objective: "Use LIKE while preserving the requested projection.",
        instructions: [
          `Return customers whose name starts with ${prefix}.`,
          "Show `customer_id`, `customer_name`, and `email`.",
          "Sort by `customer_id`.",
        ],
        starterSql: "",
        solutionSql: `SELECT customer_id, customer_name, email
FROM customers
WHERE customer_name LIKE '${prefix}%'
ORDER BY customer_id;`,
        orderSensitive: true,
      };
    },
    (stepNumber) => {
      const low = 40 + (stepNumber % 5) * 30;
      const high = low + 120;
      return {
        title: `Paid amount band ${stepNumber}`,
        difficulty: "medium",
        objective: "Combine status and numeric range filters.",
        instructions: [
          `Return paid orders with amount between ${low} and ${high}.`,
          "Show `order_id`, `amount`, and `status`.",
          "Sort by `amount`, then `order_id`.",
        ],
        starterSql: "",
        solutionSql: `SELECT order_id, amount, status
FROM orders
WHERE status = 'paid'
  AND amount BETWEEN ${low} AND ${high}
ORDER BY amount, order_id;`,
        orderSensitive: true,
      };
    },
    (stepNumber) => ({
      title: `Email data quality check ${stepNumber}`,
      difficulty: "medium",
      objective: "Use NULL checks to find contact-quality issues.",
      instructions: [
        "Return inactive customers or customers with missing email.",
        "Show `customer_id`, `customer_name`, `email`, and `is_active`.",
        "Sort by `customer_id`.",
      ],
      starterSql: "",
      solutionSql: `SELECT customer_id, customer_name, email, is_active
FROM customers
WHERE is_active = 0
   OR email IS NULL
ORDER BY customer_id;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Captured payment quality filter ${stepNumber}`,
      difficulty: "medium",
      objective: "Filter payment records with exact status and null refund logic.",
      instructions: [
        "Return captured payments with no refund amount.",
        "Show `payment_id`, `order_id`, `payment_status`, and `payment_amount`.",
        "Sort by `payment_amount` descending.",
      ],
      starterSql: "",
      solutionSql: `SELECT payment_id, order_id, payment_status, payment_amount
FROM payments
WHERE payment_status = 'captured'
  AND refund_amount IS NULL
ORDER BY payment_amount DESC;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Shipment exception filter ${stepNumber}`,
      difficulty: "medium",
      objective: "Use compound shipment-status logic.",
      instructions: [
        "Return shipments that are not delivered or do not have a delivered date.",
        "Show `shipment_id`, `order_id`, `shipment_status`, and `delivered_date`.",
        "Sort by `shipment_id`.",
      ],
      starterSql: "",
      solutionSql: `SELECT shipment_id, order_id, shipment_status, delivered_date
FROM shipments
WHERE shipment_status <> 'delivered'
   OR delivered_date IS NULL
ORDER BY shipment_id;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Event severity and batch filter ${stepNumber}`,
      difficulty: "medium",
      objective: "Combine NULL checks, text filters, and numeric thresholds.",
      instructions: [
        "Return high or medium events with payload size at least 100 or missing batch id.",
        "Show `event_id`, `source_system`, `severity`, `payload_size`, and `batch_id`.",
        "Sort by `severity`, then `event_id`.",
      ],
      starterSql: "",
      solutionSql: `SELECT event_id, source_system, severity, payload_size, batch_id
FROM events
WHERE severity IN ('high', 'medium')
  AND (payload_size >= 100 OR batch_id IS NULL)
ORDER BY severity, event_id;`,
      orderSensitive: true,
    }),
  ];

  return Array.from({ length: 110 }, (_, index) => {
    const stepNumber = index + 16;
    const task = families[index % families.length](stepNumber);
    return {
      id: `sql-week-02-task-${String(stepNumber).padStart(3, "0")}`,
      weekId: sqlWeekTwoId,
      stepNumber,
      ...task,
    };
  });
}

export const sqlWeekTwoTasks: SqlTaskDefinition[] = [
  ...sqlWeekTwoBaseTasks,
  ...buildSqlWeekTwoGeneratedTasks(),
];

export const sqlWeekTwoUnlockMessage =
  "Complete all 15 Week 2 tasks with correct answers to keep climbing into advanced SQL levels.";
