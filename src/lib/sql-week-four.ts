import { SqlTaskDefinition } from "@/lib/types";

export const sqlWeekFourId = "sql-week-04";

export const sqlWeekFourTasks: SqlTaskDefinition[] = [
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

export const sqlWeekFourUnlockMessage =
  "Complete all 15 Week 4 tasks with correct answers to finish this current SQL mission block and move into deeper zero-to-legend materials.";
