import { SqlTaskDefinition } from "@/lib/types";

export const sqlWeekThreeId = "sql-week-03";

const sqlWeekThreeBaseTasks: SqlTaskDefinition[] = [
  {
    id: "sql-week-03-task-01",
    weekId: sqlWeekThreeId,
    stepNumber: 1,
    title: "Match each order to the customer name",
    difficulty: "easy",
    objective: "Use an inner join with the shared customer key.",
    instructions: [
      "Join `orders` to `customers` using `customer_id`.",
      "Return `order_id`, `customer_name`, and `amount`.",
      "Sort by `order_id`.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT o.order_id, c.customer_name, o.amount\nFROM orders AS o\nJOIN customers AS c\n  ON o.customer_id = c.customer_id\nORDER BY o.order_id;",
    orderSensitive: true,
  },
  {
    id: "sql-week-03-task-02",
    weekId: sqlWeekThreeId,
    stepNumber: 2,
    title: "Show paid orders with customer country",
    difficulty: "easy",
    objective: "Join then filter on order status.",
    instructions: [
      "Return `order_id`, `customer_name`, `country`, and `status`.",
      "Only include paid orders.",
      "Sort by `order_id`.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT o.order_id, c.customer_name, c.country, o.status\nFROM orders AS o\nJOIN customers AS c\n  ON o.customer_id = c.customer_id\nWHERE o.status = 'paid'\nORDER BY o.order_id;",
    orderSensitive: true,
  },
  {
    id: "sql-week-03-task-03",
    weekId: sqlWeekThreeId,
    stepNumber: 3,
    title: "Join and keep only active customers",
    difficulty: "easy",
    objective: "Filter on the joined customer table.",
    instructions: [
      "Return `order_id`, `customer_name`, and `is_active`.",
      "Only include rows where the customer is active.",
      "Sort by `order_id`.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT o.order_id, c.customer_name, c.is_active\nFROM orders AS o\nJOIN customers AS c\n  ON o.customer_id = c.customer_id\nWHERE c.is_active = 1\nORDER BY o.order_id;",
    orderSensitive: true,
  },
  {
    id: "sql-week-03-task-04",
    weekId: sqlWeekThreeId,
    stepNumber: 4,
    title: "Use aliases in joined output",
    difficulty: "easy",
    objective: "Make joined results easier to read.",
    instructions: [
      "Return `customer_name` as `name` and `order_date` as `placed_on`.",
      "Also include `order_id`.",
      "Sort by `order_id`.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT o.order_id, c.customer_name AS name, o.order_date AS placed_on\nFROM orders AS o\nJOIN customers AS c\n  ON o.customer_id = c.customer_id\nORDER BY o.order_id;",
    orderSensitive: true,
  },
  {
    id: "sql-week-03-task-05",
    weekId: sqlWeekThreeId,
    stepNumber: 5,
    title: "US customers and their orders",
    difficulty: "easy",
    objective: "Filter joined rows by customer geography.",
    instructions: [
      "Return `order_id`, `customer_name`, `country`, and `amount`.",
      "Only include customers from the US.",
      "Sort by `order_id`.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT o.order_id, c.customer_name, c.country, o.amount\nFROM orders AS o\nJOIN customers AS c\n  ON o.customer_id = c.customer_id\nWHERE c.country = 'US'\nORDER BY o.order_id;",
    orderSensitive: true,
  },
  {
    id: "sql-week-03-task-06",
    weekId: sqlWeekThreeId,
    stepNumber: 6,
    title: "Sort joined rows by amount descending",
    difficulty: "easy",
    objective: "Order a joined result set intentionally.",
    instructions: [
      "Return `order_id`, `customer_name`, and `amount`.",
      "Sort by `amount` descending.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT o.order_id, c.customer_name, o.amount\nFROM orders AS o\nJOIN customers AS c\n  ON o.customer_id = c.customer_id\nORDER BY o.amount DESC;",
    orderSensitive: true,
  },
  {
    id: "sql-week-03-task-07",
    weekId: sqlWeekThreeId,
    stepNumber: 7,
    title: "Filter joined rows by date",
    difficulty: "easy",
    objective: "Use a date condition on the order side after joining.",
    instructions: [
      "Return `order_id`, `customer_name`, and `order_date`.",
      "Only include orders on or after `2026-04-12`.",
      "Sort by `order_date`.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT o.order_id, c.customer_name, o.order_date\nFROM orders AS o\nJOIN customers AS c\n  ON o.customer_id = c.customer_id\nWHERE o.order_date >= '2026-04-12'\nORDER BY o.order_date;",
    orderSensitive: true,
  },
  {
    id: "sql-week-03-task-08",
    weekId: sqlWeekThreeId,
    stepNumber: 8,
    title: "Combine join with two filters",
    difficulty: "medium",
    objective: "Use one condition from each table.",
    instructions: [
      "Return `order_id`, `customer_name`, `country`, and `status`.",
      "Only include active customers with paid orders.",
      "Sort by `order_id`.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT o.order_id, c.customer_name, c.country, o.status\nFROM orders AS o\nJOIN customers AS c\n  ON o.customer_id = c.customer_id\nWHERE c.is_active = 1\n  AND o.status = 'paid'\nORDER BY o.order_id;",
    orderSensitive: true,
  },
  {
    id: "sql-week-03-task-09",
    weekId: sqlWeekThreeId,
    stepNumber: 9,
    title: "Show customer email beside each order",
    difficulty: "medium",
    objective: "Bring nullable customer columns into joined output.",
    instructions: [
      "Return `order_id`, `customer_name`, `email`, and `status`.",
      "Sort by `order_id`.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT o.order_id, c.customer_name, c.email, o.status\nFROM orders AS o\nJOIN customers AS c\n  ON o.customer_id = c.customer_id\nORDER BY o.order_id;",
    orderSensitive: true,
  },
  {
    id: "sql-week-03-task-10",
    weekId: sqlWeekThreeId,
    stepNumber: 10,
    title: "Use a left join from customers to orders",
    difficulty: "medium",
    objective: "Practice the left-join shape even when all rows currently match.",
    instructions: [
      "Start from `customers` and left join `orders`.",
      "Return `customer_name`, `order_id`, and `status`.",
      "Sort by `customer_id`, then `order_id`.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT c.customer_name, o.order_id, o.status\nFROM customers AS c\nLEFT JOIN orders AS o\n  ON c.customer_id = o.customer_id\nORDER BY c.customer_id, o.order_id;",
    orderSensitive: true,
  },
  {
    id: "sql-week-03-task-11",
    weekId: sqlWeekThreeId,
    stepNumber: 11,
    title: "Card payments with customer names",
    difficulty: "medium",
    objective: "Filter joined rows by payment method.",
    instructions: [
      "Return `order_id`, `customer_name`, `payment_method`, and `amount`.",
      "Only include card payments.",
      "Sort by `order_id`.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT o.order_id, c.customer_name, o.payment_method, o.amount\nFROM orders AS o\nJOIN customers AS c\n  ON o.customer_id = c.customer_id\nWHERE o.payment_method = 'card'\nORDER BY o.order_id;",
    orderSensitive: true,
  },
  {
    id: "sql-week-03-task-12",
    weekId: sqlWeekThreeId,
    stepNumber: 12,
    title: "Joined amount range filter",
    difficulty: "medium",
    objective: "Use BETWEEN on a joined metric.",
    instructions: [
      "Return `order_id`, `customer_name`, and `amount`.",
      "Only include orders with amount between 90 and 200 inclusive.",
      "Sort by `amount`.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT o.order_id, c.customer_name, o.amount\nFROM orders AS o\nJOIN customers AS c\n  ON o.customer_id = c.customer_id\nWHERE o.amount BETWEEN 90 AND 200\nORDER BY o.amount;",
    orderSensitive: true,
  },
  {
    id: "sql-week-03-task-13",
    weekId: sqlWeekThreeId,
    stepNumber: 13,
    title: "Inactive customer orders",
    difficulty: "medium",
    objective: "Find transactional rows for inactive users.",
    instructions: [
      "Return `order_id`, `customer_name`, `is_active`, and `status`.",
      "Only include inactive customers.",
      "Sort by `order_id`.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT o.order_id, c.customer_name, c.is_active, o.status\nFROM orders AS o\nJOIN customers AS c\n  ON o.customer_id = c.customer_id\nWHERE c.is_active = 0\nORDER BY o.order_id;",
    orderSensitive: true,
  },
  {
    id: "sql-week-03-task-14",
    weekId: sqlWeekThreeId,
    stepNumber: 14,
    title: "Recent paid orders for active customers",
    difficulty: "medium",
    objective: "Combine join, date filtering, and boolean filtering.",
    instructions: [
      "Return `order_id`, `customer_name`, `order_date`, and `status`.",
      "Only include paid orders on or after `2026-04-11` for active customers.",
      "Sort by `order_date` descending.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT o.order_id, c.customer_name, o.order_date, o.status\nFROM orders AS o\nJOIN customers AS c\n  ON o.customer_id = c.customer_id\nWHERE o.status = 'paid'\n  AND c.is_active = 1\n  AND o.order_date >= '2026-04-11'\nORDER BY o.order_date DESC;",
    orderSensitive: true,
  },
  {
    id: "sql-week-03-task-15",
    weekId: sqlWeekThreeId,
    stepNumber: 15,
    title: "Week 3 join challenge",
    difficulty: "medium",
    objective: "Pull customer and order details together in one clean answer.",
    instructions: [
      "Return paid or pending orders for customers from the US or Canada.",
      "Show `order_id`, `customer_name`, `country`, `status`, and `amount`.",
      "Sort by `amount` descending.",
    ],
    starterSql: "",
    solutionSql:
      "SELECT o.order_id, c.customer_name, c.country, o.status, o.amount\nFROM orders AS o\nJOIN customers AS c\n  ON o.customer_id = c.customer_id\nWHERE o.status IN ('paid', 'pending')\n  AND c.country IN ('US', 'Canada')\nORDER BY o.amount DESC;",
    orderSensitive: true,
  },
];

function buildSqlWeekThreeGeneratedTasks(): SqlTaskDefinition[] {
  const families: Array<(stepNumber: number) => Omit<SqlTaskDefinition, "id" | "weekId" | "stepNumber">> = [
    (stepNumber) => ({
      title: `Paid order customer profile ${stepNumber}`,
      difficulty: "medium",
      objective: "Join orders to customers and filter paid transactions.",
      instructions: [
        "Return paid orders with customer identity fields.",
        "Show `order_id`, `customer_name`, `country`, `amount`, and `order_date`.",
        "Sort by `order_date`, then `order_id`.",
      ],
      starterSql: "",
      solutionSql: `SELECT o.order_id, c.customer_name, c.country, o.amount, o.order_date
FROM orders AS o
JOIN customers AS c
  ON c.customer_id = o.customer_id
WHERE o.status = 'paid'
ORDER BY o.order_date, o.order_id;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Left join customer order coverage ${stepNumber}`,
      difficulty: "medium",
      objective: "Use a left join to preserve the customer grain.",
      instructions: [
        "Return every customer with any matching order id.",
        "Show `customer_id`, `customer_name`, `order_id`, and `status`.",
        "Sort by `customer_id`, then `order_id`.",
      ],
      starterSql: "",
      solutionSql: `SELECT c.customer_id, c.customer_name, o.order_id, o.status
FROM customers AS c
LEFT JOIN orders AS o
  ON o.customer_id = c.customer_id
ORDER BY c.customer_id, o.order_id;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Captured payment reconciliation join ${stepNumber}`,
      difficulty: "medium",
      objective: "Join orders to payments and compare amounts.",
      instructions: [
        "Return orders whose payment amount matches the order amount.",
        "Only include captured payments.",
        "Show `order_id`, `amount`, `payment_amount`, and `gateway`.",
      ],
      starterSql: "",
      solutionSql: `SELECT o.order_id, o.amount, p.payment_amount, p.gateway
FROM orders AS o
JOIN payments AS p
  ON p.order_id = o.order_id
WHERE p.payment_status = 'captured'
  AND p.payment_amount = o.amount
ORDER BY o.order_id;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Shipment fulfillment join ${stepNumber}`,
      difficulty: "medium",
      objective: "Join order and shipment state for fulfillment analysis.",
      instructions: [
        "Return paid orders and shipment status where a shipment exists.",
        "Show `order_id`, `status`, `shipment_status`, and `warehouse`.",
        "Sort by `order_id`.",
      ],
      starterSql: "",
      solutionSql: `SELECT o.order_id, o.status, s.shipment_status, s.warehouse
FROM orders AS o
JOIN shipments AS s
  ON s.order_id = o.order_id
WHERE o.status = 'paid'
ORDER BY o.order_id;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Customer payment gateway view ${stepNumber}`,
      difficulty: "medium",
      objective: "Join three tables without changing the transaction grain.",
      instructions: [
        "Join customers, orders, and payments.",
        "Return captured payments with `customer_name`, `order_id`, `gateway`, and `payment_amount`.",
        "Sort by `payment_amount` descending.",
      ],
      starterSql: "",
      solutionSql: `SELECT c.customer_name, o.order_id, p.gateway, p.payment_amount
FROM customers AS c
JOIN orders AS o
  ON o.customer_id = c.customer_id
JOIN payments AS p
  ON p.order_id = o.order_id
WHERE p.payment_status = 'captured'
ORDER BY p.payment_amount DESC;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Order without delivered shipment check ${stepNumber}`,
      difficulty: "medium",
      objective: "Use a left join with a missing-match condition.",
      instructions: [
        "Return paid orders that do not have a delivered shipment.",
        "Show `order_id`, `customer_id`, `status`, and `shipment_status`.",
        "Sort by `order_id`.",
      ],
      starterSql: "",
      solutionSql: `SELECT o.order_id, o.customer_id, o.status, s.shipment_status
FROM orders AS o
LEFT JOIN shipments AS s
  ON s.order_id = o.order_id
WHERE o.status = 'paid'
  AND (s.shipment_status IS NULL OR s.shipment_status <> 'delivered')
ORDER BY o.order_id;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Active customer captured payments ${stepNumber}`,
      difficulty: "medium",
      objective: "Combine joined filters across customer, order, and payment tables.",
      instructions: [
        "Return captured payments for active customers only.",
        "Show `customer_name`, `order_id`, `payment_status`, and `payment_amount`.",
        "Sort by `customer_name`, then `order_id`.",
      ],
      starterSql: "",
      solutionSql: `SELECT c.customer_name, o.order_id, p.payment_status, p.payment_amount
FROM customers AS c
JOIN orders AS o
  ON o.customer_id = c.customer_id
JOIN payments AS p
  ON p.order_id = o.order_id
WHERE c.is_active = 1
  AND p.payment_status = 'captured'
ORDER BY c.customer_name, o.order_id;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `High value card shipment join ${stepNumber}`,
      difficulty: "medium",
      objective: "Join rows then apply amount and payment-method filters.",
      instructions: [
        "Return card orders above 100 with any shipment information.",
        "Show `order_id`, `amount`, `carrier`, and `shipment_status`.",
        "Sort by `amount` descending.",
      ],
      starterSql: "",
      solutionSql: `SELECT o.order_id, o.amount, s.carrier, s.shipment_status
FROM orders AS o
LEFT JOIN shipments AS s
  ON s.order_id = o.order_id
WHERE o.payment_method = 'card'
  AND o.amount > 100
ORDER BY o.amount DESC;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Country payment method join ${stepNumber}`,
      difficulty: "medium",
      objective: "Join customer geography to order payment behavior.",
      instructions: [
        "Return US and Canada customer orders paid by card or paypal.",
        "Show `order_id`, `country`, `payment_method`, and `amount`.",
        "Sort by `country`, then `order_id`.",
      ],
      starterSql: "",
      solutionSql: `SELECT o.order_id, c.country, o.payment_method, o.amount
FROM orders AS o
JOIN customers AS c
  ON c.customer_id = o.customer_id
WHERE c.country IN ('US', 'Canada')
  AND o.payment_method IN ('card', 'paypal')
ORDER BY c.country, o.order_id;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Payment refund customer trace ${stepNumber}`,
      difficulty: "medium",
      objective: "Trace refunded payments back to customer and order context.",
      instructions: [
        "Return refunded payments with customer and order details.",
        "Show `customer_name`, `order_id`, `refund_amount`, and `gateway`.",
        "Sort by `order_id`.",
      ],
      starterSql: "",
      solutionSql: `SELECT c.customer_name, o.order_id, p.refund_amount, p.gateway
FROM payments AS p
JOIN orders AS o
  ON o.order_id = p.order_id
JOIN customers AS c
  ON c.customer_id = o.customer_id
WHERE p.refund_amount IS NOT NULL
ORDER BY o.order_id;`,
      orderSensitive: true,
    }),
    (stepNumber) => ({
      title: `Employee appointment department join-style comparison ${stepNumber}`,
      difficulty: "medium",
      objective: "Compare departmental entities without accidental row loss.",
      instructions: [
        "Return appointment departments that also exist in employee departments.",
        "Show distinct `department` values.",
        "Sort by `department`.",
      ],
      starterSql: "",
      solutionSql: `SELECT DISTINCT a.department
FROM appointments AS a
JOIN employees AS e
  ON e.department = a.department
ORDER BY a.department;`,
      orderSensitive: true,
    }),
  ];

  return Array.from({ length: 110 }, (_, index) => {
    const stepNumber = index + 16;
    const task = families[index % families.length](stepNumber);
    return {
      id: `sql-week-03-task-${String(stepNumber).padStart(3, "0")}`,
      weekId: sqlWeekThreeId,
      stepNumber,
      ...task,
    };
  });
}

export const sqlWeekThreeTasks: SqlTaskDefinition[] = [
  ...sqlWeekThreeBaseTasks,
  ...buildSqlWeekThreeGeneratedTasks(),
];

export const sqlWeekThreeUnlockMessage =
  "Complete all 15 Week 3 tasks with correct answers to unlock Week 4 and keep moving from basics into stronger SQL joins.";
