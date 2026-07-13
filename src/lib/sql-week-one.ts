import { SqlTaskDefinition } from "@/lib/types";

export const sqlWeekOneId = "sql-week-01";

export const sqlWeekOneSchema = `
CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  customer_name TEXT NOT NULL,
  country TEXT NOT NULL,
  email TEXT,
  is_active INTEGER NOT NULL,
  signup_date TEXT NOT NULL
);

CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  amount REAL NOT NULL,
  order_date TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

INSERT INTO customers (customer_id, customer_name, country, email, is_active, signup_date) VALUES
  (1, 'Ava Carter', 'US', 'ava@example.com', 1, '2026-01-03'),
  (2, 'Noah Bennett', 'Canada', 'noah@example.com', 1, '2026-01-11'),
  (3, 'Mia Johnson', 'US', NULL, 0, '2026-02-05'),
  (4, 'Liam Walker', 'India', 'liam@example.com', 1, '2026-02-18'),
  (5, 'Sophia Adams', 'UK', NULL, 1, '2026-03-02'),
  (6, 'Ethan Hall', 'US', 'ethan@example.com', 0, '2026-03-14');

INSERT INTO orders (order_id, customer_id, status, amount, order_date, payment_method) VALUES
  (101, 1, 'paid', 120.00, '2026-04-01', 'card'),
  (102, 2, 'pending', 75.50, '2026-04-03', 'paypal'),
  (103, 1, 'paid', 240.00, '2026-04-08', 'card'),
  (104, 3, 'cancelled', 40.00, '2026-04-10', 'upi'),
  (105, 4, 'paid', 180.00, '2026-04-11', 'card'),
  (106, 5, 'paid', 90.00, '2026-04-12', 'bank'),
  (107, 6, 'pending', 310.00, '2026-04-15', 'card'),
  (108, 2, 'paid', 55.00, '2026-04-18', 'paypal'),
  (109, 5, 'cancelled', 130.00, '2026-04-20', 'card'),
  (110, 4, 'paid', 260.00, '2026-04-22', 'upi');
`;

export const sqlWeekOneDataDictionary = [
  "customers.customer_id: unique customer identifier",
  "customers.customer_name: customer full name",
  "customers.country: customer country",
  "customers.email: nullable email address",
  "customers.is_active: 1 means active, 0 means inactive",
  "customers.signup_date: account creation date",
  "orders.order_id: unique order identifier",
  "orders.customer_id: customer who placed the order",
  "orders.status: paid, pending, or cancelled",
  "orders.amount: order amount in dollars",
  "orders.order_date: date of the order",
  "orders.payment_method: card, paypal, bank, or upi",
];

export const sqlWeekOneTasks: SqlTaskDefinition[] = [
  {
    id: "sql-week-01-task-01",
    weekId: sqlWeekOneId,
    stepNumber: 1,
    title: "See the full customers table",
    difficulty: "easy",
    objective: "Start with the simplest possible SELECT query.",
    instructions: [
      "Return every column from the `customers` table.",
      "Do not filter anything yet.",
    ],
    starterSql: "",
    solutionSql: "SELECT *\nFROM customers;",
    orderSensitive: true,
  },
  {
    id: "sql-week-01-task-02",
    weekId: sqlWeekOneId,
    stepNumber: 2,
    title: "Pick only the columns you need",
    difficulty: "easy",
    objective: "Use projection instead of SELECT *.",
    instructions: [
      "Return `customer_name` and `country` from `customers`.",
      "Keep the rows in the same natural order as stored.",
    ],
    starterSql: "",
    solutionSql: "SELECT customer_name, country\nFROM customers;",
    orderSensitive: true,
  },
  {
    id: "sql-week-01-task-03",
    weekId: sqlWeekOneId,
    stepNumber: 3,
    title: "Use aliases for readable output",
    difficulty: "easy",
    objective: "Rename output columns cleanly.",
    instructions: [
      "Return `customer_name` as `name` and `signup_date` as `joined_on`.",
      "Use the `customers` table only.",
    ],
    starterSql: "",
    solutionSql: "SELECT customer_name AS name, signup_date AS joined_on\nFROM customers;",
    orderSensitive: true,
  },
  {
    id: "sql-week-01-task-04",
    weekId: sqlWeekOneId,
    stepNumber: 4,
    title: "Find unique countries",
    difficulty: "easy",
    objective: "Use DISTINCT to remove duplicates intentionally.",
    instructions: [
      "Return one row per unique country from `customers`.",
      "Sort alphabetically by `country`.",
    ],
    starterSql: "",
    solutionSql: "SELECT DISTINCT country\nFROM customers\nORDER BY country;",
    orderSensitive: true,
  },
  {
    id: "sql-week-01-task-05",
    weekId: sqlWeekOneId,
    stepNumber: 5,
    title: "Filter active customers",
    difficulty: "easy",
    objective: "Use WHERE with a simple equality condition.",
    instructions: [
      "Return `customer_id`, `customer_name`, and `is_active` for active customers only.",
      "An active customer has `is_active = 1`.",
    ],
    starterSql: "",
    solutionSql: "SELECT customer_id, customer_name, is_active\nFROM customers\nWHERE is_active = 1;",
    orderSensitive: true,
  },
  {
    id: "sql-week-01-task-06",
    weekId: sqlWeekOneId,
    stepNumber: 6,
    title: "Filter by numeric comparison",
    difficulty: "easy",
    objective: "Use WHERE with greater-than logic.",
    instructions: [
      "Return all columns from `orders` where `amount` is greater than 100.",
      "Sort by `amount` ascending.",
    ],
    starterSql: "",
    solutionSql: "SELECT *\nFROM orders\nWHERE amount > 100\nORDER BY amount;",
    orderSensitive: true,
  },
  {
    id: "sql-week-01-task-07",
    weekId: sqlWeekOneId,
    stepNumber: 7,
    title: "Filter by text values",
    difficulty: "easy",
    objective: "Use WHERE on text columns.",
    instructions: [
      "Return `order_id`, `status`, and `amount` for paid orders only.",
      "Sort by `order_id`.",
    ],
    starterSql: "",
    solutionSql: "SELECT order_id, status, amount\nFROM orders\nWHERE status = 'paid'\nORDER BY order_id;",
    orderSensitive: true,
  },
  {
    id: "sql-week-01-task-08",
    weekId: sqlWeekOneId,
    stepNumber: 8,
    title: "Sort descending",
    difficulty: "easy",
    objective: "Control the result order directly.",
    instructions: [
      "Return `order_id` and `amount` from `orders`.",
      "Sort from highest amount to lowest amount.",
    ],
    starterSql: "",
    solutionSql: "SELECT order_id, amount\nFROM orders\nORDER BY amount DESC;",
    orderSensitive: true,
  },
  {
    id: "sql-week-01-task-09",
    weekId: sqlWeekOneId,
    stepNumber: 9,
    title: "Limit the result set",
    difficulty: "easy",
    objective: "Return only the top rows you need.",
    instructions: [
      "Return the 3 highest-value orders.",
      "Show `order_id` and `amount` only.",
    ],
    starterSql: "",
    solutionSql: "SELECT order_id, amount\nFROM orders\nORDER BY amount DESC\nLIMIT 3;",
    orderSensitive: true,
  },
  {
    id: "sql-week-01-task-10",
    weekId: sqlWeekOneId,
    stepNumber: 10,
    title: "Use multiple filters together",
    difficulty: "medium",
    objective: "Combine conditions with AND.",
    instructions: [
      "Return active customers from the US only.",
      "Show `customer_id`, `customer_name`, `country`, and `is_active`.",
    ],
    starterSql: "",
    solutionSql: "SELECT customer_id, customer_name, country, is_active\nFROM customers\nWHERE country = 'US'\n  AND is_active = 1;",
    orderSensitive: true,
  },
  {
    id: "sql-week-01-task-11",
    weekId: sqlWeekOneId,
    stepNumber: 11,
    title: "Use a date filter",
    difficulty: "medium",
    objective: "Filter rows by a business time window.",
    instructions: [
      "Return orders placed on or after `2026-04-10`.",
      "Show `order_id`, `order_date`, and `amount`.",
      "Sort by `order_date` ascending.",
    ],
    starterSql: "",
    solutionSql: "SELECT order_id, order_date, amount\nFROM orders\nWHERE order_date >= '2026-04-10'\nORDER BY order_date;",
    orderSensitive: true,
  },
  {
    id: "sql-week-01-task-12",
    weekId: sqlWeekOneId,
    stepNumber: 12,
    title: "Find missing values",
    difficulty: "medium",
    objective: "Use IS NULL instead of equality with NULL.",
    instructions: [
      "Return customers who do not have an email address.",
      "Show `customer_id`, `customer_name`, and `email`.",
    ],
    starterSql: "",
    solutionSql: "SELECT customer_id, customer_name, email\nFROM customers\nWHERE email IS NULL;",
    orderSensitive: true,
  },
  {
    id: "sql-week-01-task-13",
    weekId: sqlWeekOneId,
    stepNumber: 13,
    title: "Use IN for multiple values",
    difficulty: "medium",
    objective: "Match a small set of allowed values cleanly.",
    instructions: [
      "Return orders where the payment method is `card` or `paypal`.",
      "Show `order_id`, `payment_method`, and `amount`.",
      "Sort by `order_id`.",
    ],
    starterSql: "",
    solutionSql: "SELECT order_id, payment_method, amount\nFROM orders\nWHERE payment_method IN ('card', 'paypal')\nORDER BY order_id;",
    orderSensitive: true,
  },
  {
    id: "sql-week-01-task-14",
    weekId: sqlWeekOneId,
    stepNumber: 14,
    title: "Use BETWEEN for a range",
    difficulty: "medium",
    objective: "Write a clean bounded numeric filter.",
    instructions: [
      "Return orders with amounts between 80 and 200 inclusive.",
      "Show `order_id`, `amount`, and `status`.",
      "Sort by `amount` descending.",
    ],
    starterSql: "",
    solutionSql: "SELECT order_id, amount, status\nFROM orders\nWHERE amount BETWEEN 80 AND 200\nORDER BY amount DESC;",
    orderSensitive: true,
  },
  {
    id: "sql-week-01-task-15",
    weekId: sqlWeekOneId,
    stepNumber: 15,
    title: "Final Week 1 challenge",
    difficulty: "medium",
    objective: "Combine projection, filtering, sorting, and limiting in one query.",
    instructions: [
      "Return the 2 most recent paid orders with amount greater than 100.",
      "Show `order_id`, `status`, `amount`, and `order_date`.",
      "Sort by `order_date` descending.",
    ],
    starterSql: "",
    solutionSql: "SELECT order_id, status, amount, order_date\nFROM orders\nWHERE status = 'paid'\n  AND amount > 100\nORDER BY order_date DESC\nLIMIT 2;",
    orderSensitive: true,
  },
];

export const sqlWeekOneUnlockMessage =
  "Complete all 15 Week 1 tasks with correct answers to unlock Week 2.";
