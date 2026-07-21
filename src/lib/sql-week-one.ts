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

CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  is_discontinued INTEGER NOT NULL,
  launched_on TEXT NOT NULL
);

CREATE TABLE employees (
  employee_id INTEGER PRIMARY KEY,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  country TEXT NOT NULL,
  salary REAL NOT NULL,
  is_manager INTEGER NOT NULL,
  hire_date TEXT NOT NULL
);

CREATE TABLE appointments (
  appointment_id INTEGER PRIMARY KEY,
  patient_name TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT NOT NULL,
  appointment_date TEXT NOT NULL,
  fee REAL NOT NULL,
  follow_up_required INTEGER NOT NULL
);

CREATE TABLE payments (
  payment_id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  payment_status TEXT NOT NULL,
  payment_amount REAL NOT NULL,
  processed_at TEXT NOT NULL,
  gateway TEXT NOT NULL,
  refund_amount REAL
);

CREATE TABLE shipments (
  shipment_id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  carrier TEXT NOT NULL,
  shipment_status TEXT NOT NULL,
  shipped_date TEXT NOT NULL,
  delivered_date TEXT,
  warehouse TEXT NOT NULL
);

CREATE TABLE events (
  event_id INTEGER PRIMARY KEY,
  source_system TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date TEXT NOT NULL,
  batch_id TEXT,
  severity TEXT NOT NULL,
  payload_size INTEGER NOT NULL
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

INSERT INTO products (product_id, product_name, category, price, is_discontinued, launched_on) VALUES
  (201, 'Starter Kit', 'Hardware', 49.00, 0, '2025-11-20'),
  (202, 'Workflow Pro', 'Software', 129.00, 0, '2025-12-15'),
  (203, 'Insight Board', 'Analytics', 199.00, 0, '2026-01-10'),
  (204, 'Office Lamp', 'Hardware', 25.00, 1, '2025-08-01'),
  (205, 'Cloud Sync', 'Software', 89.00, 0, '2026-02-03'),
  (206, 'Travel Adapter', 'Hardware', 19.00, 0, '2025-09-14'),
  (207, 'Audit Log Plus', 'Analytics', 149.00, 1, '2026-01-28'),
  (208, 'Meeting Hub', 'Collaboration', 79.00, 0, '2026-03-05');

INSERT INTO employees (employee_id, employee_name, department, country, salary, is_manager, hire_date) VALUES
  (301, 'Alice Green', 'Finance', 'US', 98000, 1, '2021-04-02'),
  (302, 'Brian Cole', 'Finance', 'Canada', 72000, 0, '2022-07-19'),
  (303, 'Chloe Patel', 'Engineering', 'India', 110000, 1, '2020-11-30'),
  (304, 'David Ross', 'Support', 'US', 58000, 0, '2023-01-12'),
  (305, 'Elena Cruz', 'Operations', 'UK', 87000, 1, '2021-09-08'),
  (306, 'Farah Khan', 'Engineering', 'India', 95000, 0, '2024-02-20'),
  (307, 'George Lin', 'Support', 'US', 61000, 0, '2022-05-17'),
  (308, 'Hana Park', 'Operations', 'Canada', 76000, 0, '2023-08-03');

INSERT INTO appointments (appointment_id, patient_name, department, status, appointment_date, fee, follow_up_required) VALUES
  (401, 'Mason Reed', 'Cardiology', 'scheduled', '2026-04-04', 250.00, 1),
  (402, 'Nora Bell', 'Dermatology', 'completed', '2026-04-05', 90.00, 0),
  (403, 'Oliver Price', 'Neurology', 'cancelled', '2026-04-06', 180.00, 1),
  (404, 'Priya Shah', 'Cardiology', 'completed', '2026-04-09', 220.00, 1),
  (405, 'Quinn James', 'Orthopedics', 'scheduled', '2026-04-12', 130.00, 0),
  (406, 'Riya Nair', 'Dermatology', 'scheduled', '2026-04-14', 110.00, 1),
  (407, 'Sam Ortiz', 'Orthopedics', 'completed', '2026-04-17', 150.00, 0),
  (408, 'Tina Young', 'Cardiology', 'scheduled', '2026-04-19', 200.00, 1);

INSERT INTO payments (payment_id, order_id, payment_status, payment_amount, processed_at, gateway, refund_amount) VALUES
  (501, 101, 'captured', 120.00, '2026-04-01', 'stripe', NULL),
  (502, 102, 'pending', 75.50, '2026-04-03', 'paypal', NULL),
  (503, 103, 'captured', 240.00, '2026-04-08', 'stripe', NULL),
  (504, 104, 'failed', 40.00, '2026-04-10', 'razorpay', NULL),
  (505, 105, 'captured', 180.00, '2026-04-11', 'stripe', NULL),
  (506, 106, 'captured', 90.00, '2026-04-12', 'adyen', NULL),
  (507, 107, 'pending', 310.00, '2026-04-15', 'stripe', NULL),
  (508, 108, 'refunded', 55.00, '2026-04-18', 'paypal', 55.00),
  (509, 109, 'failed', 130.00, '2026-04-20', 'stripe', NULL),
  (510, 110, 'captured', 260.00, '2026-04-22', 'razorpay', NULL);

INSERT INTO shipments (shipment_id, order_id, carrier, shipment_status, shipped_date, delivered_date, warehouse) VALUES
  (601, 101, 'FedEx', 'delivered', '2026-04-02', '2026-04-04', 'east'),
  (602, 102, 'UPS', 'in_transit', '2026-04-04', NULL, 'west'),
  (603, 103, 'FedEx', 'delivered', '2026-04-09', '2026-04-12', 'east'),
  (604, 105, 'DHL', 'delivered', '2026-04-12', '2026-04-15', 'central'),
  (605, 106, 'UPS', 'label_created', '2026-04-13', NULL, 'west'),
  (606, 107, 'FedEx', 'in_transit', '2026-04-16', NULL, 'east'),
  (607, 108, 'DHL', 'delivered', '2026-04-19', '2026-04-21', 'central'),
  (608, 110, 'BlueDart', 'in_transit', '2026-04-23', NULL, 'south');

INSERT INTO events (event_id, source_system, event_type, event_date, batch_id, severity, payload_size) VALUES
  (701, 'crm', 'login', '2026-04-01', 'b001', 'low', 45),
  (702, 'crm', 'export', '2026-04-02', 'b001', 'medium', 420),
  (703, 'billing', 'invoice_generated', '2026-04-03', 'b002', 'low', 180),
  (704, 'ops', 'job_failed', '2026-04-05', NULL, 'high', 35),
  (705, 'ops', 'job_retried', '2026-04-05', NULL, 'medium', 30),
  (706, 'warehouse', 'shipment_created', '2026-04-07', 'b003', 'low', 95),
  (707, 'warehouse', 'shipment_delayed', '2026-04-08', 'b003', 'critical', 120),
  (708, 'billing', 'refund_posted', '2026-04-09', 'b004', 'medium', 88);
`;

export const sqlWeekOneDataDictionary = [
  "customers: customer master data with nullable email and active flag",
  "orders: transactional orders with status, amount, order_date, and payment method",
  "products: product catalog with category, price, discontinued flag, and launch date",
  "employees: employee roster with department, country, salary, manager flag, and hire date",
  "appointments: healthcare appointments with status, fee, date, and follow-up flag",
  "payments: payment records with gateway, payment_status, amount, processed_at, and nullable refund_amount",
  "shipments: shipment tracking rows with carrier, status, warehouse, and nullable delivered_date",
  "events: operational events with source system, event type, date, severity, payload size, and nullable batch_id",
];

type SqlTaskSeed = Omit<SqlTaskDefinition, "id" | "weekId" | "stepNumber">;

const makeTask = (stepNumber: number, seed: SqlTaskSeed): SqlTaskDefinition => ({
  id: `sql-week-01-task-${String(stepNumber).padStart(2, "0")}`,
  weekId: sqlWeekOneId,
  stepNumber,
  ...seed,
});

const starter = "";

const baseSeeds: SqlTaskSeed[] = [
  {
    title: "See the full customers table",
    difficulty: "easy",
    objective: "Start with the simplest possible SELECT query.",
    instructions: ["Return every column from the `customers` table.", "Do not filter anything yet."],
    starterSql: starter,
    solutionSql: "SELECT *\nFROM customers;",
    orderSensitive: true,
  },
  {
    title: "Pick only the columns you need",
    difficulty: "easy",
    objective: "Use projection instead of SELECT *.",
    instructions: ["Return `customer_name` and `country` from `customers`.", "Keep the rows in the same natural order as stored."],
    starterSql: starter,
    solutionSql: "SELECT customer_name, country\nFROM customers;",
    orderSensitive: true,
  },
  {
    title: "Use aliases for readable output",
    difficulty: "easy",
    objective: "Rename output columns cleanly.",
    instructions: ["Return `customer_name` as `name` and `signup_date` as `joined_on`.", "Use the `customers` table only."],
    starterSql: starter,
    solutionSql: "SELECT customer_name AS name, signup_date AS joined_on\nFROM customers;",
    orderSensitive: true,
  },
  {
    title: "Find unique countries",
    difficulty: "easy",
    objective: "Use DISTINCT to remove duplicates intentionally.",
    instructions: ["Return one row per unique country from `customers`.", "Sort alphabetically by `country`."],
    starterSql: starter,
    solutionSql: "SELECT DISTINCT country\nFROM customers\nORDER BY country;",
    orderSensitive: true,
  },
  {
    title: "Filter active customers",
    difficulty: "easy",
    objective: "Use WHERE with a simple equality condition.",
    instructions: ["Return `customer_id`, `customer_name`, and `is_active` for active customers only.", "An active customer has `is_active = 1`."],
    starterSql: starter,
    solutionSql: "SELECT customer_id, customer_name, is_active\nFROM customers\nWHERE is_active = 1;",
    orderSensitive: true,
  },
  {
    title: "Filter by numeric comparison",
    difficulty: "easy",
    objective: "Use WHERE with greater-than logic.",
    instructions: ["Return all columns from `orders` where `amount` is greater than 100.", "Sort by `amount` ascending."],
    starterSql: starter,
    solutionSql: "SELECT *\nFROM orders\nWHERE amount > 100\nORDER BY amount;",
    orderSensitive: true,
  },
  {
    title: "Filter by text values",
    difficulty: "easy",
    objective: "Use WHERE on text columns.",
    instructions: ["Return `order_id`, `status`, and `amount` for paid orders only.", "Sort by `order_id`."],
    starterSql: starter,
    solutionSql: "SELECT order_id, status, amount\nFROM orders\nWHERE status = 'paid'\nORDER BY order_id;",
    orderSensitive: true,
  },
  {
    title: "Sort descending",
    difficulty: "easy",
    objective: "Control the result order directly.",
    instructions: ["Return `order_id` and `amount` from `orders`.", "Sort from highest amount to lowest amount."],
    starterSql: starter,
    solutionSql: "SELECT order_id, amount\nFROM orders\nORDER BY amount DESC;",
    orderSensitive: true,
  },
  {
    title: "Limit the result set",
    difficulty: "easy",
    objective: "Return only the top rows you need.",
    instructions: ["Return the 3 highest-value orders.", "Show `order_id` and `amount` only."],
    starterSql: starter,
    solutionSql: "SELECT order_id, amount\nFROM orders\nORDER BY amount DESC\nLIMIT 3;",
    orderSensitive: true,
  },
  {
    title: "Use multiple filters together",
    difficulty: "medium",
    objective: "Combine conditions with AND.",
    instructions: ["Return active customers from the US only.", "Show `customer_id`, `customer_name`, `country`, and `is_active`."],
    starterSql: starter,
    solutionSql: "SELECT customer_id, customer_name, country, is_active\nFROM customers\nWHERE country = 'US'\n  AND is_active = 1;",
    orderSensitive: true,
  },
  {
    title: "Use a date filter",
    difficulty: "medium",
    objective: "Filter rows by a business time window.",
    instructions: ["Return orders placed on or after `2026-04-10`.", "Show `order_id`, `order_date`, and `amount`.", "Sort by `order_date` ascending."],
    starterSql: starter,
    solutionSql: "SELECT order_id, order_date, amount\nFROM orders\nWHERE order_date >= '2026-04-10'\nORDER BY order_date;",
    orderSensitive: true,
  },
  {
    title: "Find missing values",
    difficulty: "medium",
    objective: "Use IS NULL instead of equality with NULL.",
    instructions: ["Return customers who do not have an email address.", "Show `customer_id`, `customer_name`, and `email`."],
    starterSql: starter,
    solutionSql: "SELECT customer_id, customer_name, email\nFROM customers\nWHERE email IS NULL;",
    orderSensitive: true,
  },
  {
    title: "Use IN for multiple values",
    difficulty: "medium",
    objective: "Match a small set of allowed values cleanly.",
    instructions: ["Return orders where the payment method is `card` or `paypal`.", "Show `order_id`, `payment_method`, and `amount`.", "Sort by `order_id`."],
    starterSql: starter,
    solutionSql: "SELECT order_id, payment_method, amount\nFROM orders\nWHERE payment_method IN ('card', 'paypal')\nORDER BY order_id;",
    orderSensitive: true,
  },
  {
    title: "Use BETWEEN for a range",
    difficulty: "medium",
    objective: "Write a clean bounded numeric filter.",
    instructions: ["Return orders with amounts between 80 and 200 inclusive.", "Show `order_id`, `amount`, and `status`.", "Sort by `amount` descending."],
    starterSql: starter,
    solutionSql: "SELECT order_id, amount, status\nFROM orders\nWHERE amount BETWEEN 80 AND 200\nORDER BY amount DESC;",
    orderSensitive: true,
  },
  {
    title: "Final Week 1 challenge",
    difficulty: "medium",
    objective: "Combine projection, filtering, sorting, and limiting in one query.",
    instructions: ["Return the 2 most recent paid orders with amount greater than 100.", "Show `order_id`, `status`, `amount`, and `order_date`.", "Sort by `order_date` descending."],
    starterSql: starter,
    solutionSql: "SELECT order_id, status, amount, order_date\nFROM orders\nWHERE status = 'paid'\n  AND amount > 100\nORDER BY order_date DESC\nLIMIT 2;",
    orderSensitive: true,
  },
];

const generatedSeeds: SqlTaskSeed[] = [
  { title: "See the full products table", difficulty: "easy", objective: "Read another table from top to bottom.", instructions: ["Return every column from `products`.", "Do not filter rows."], starterSql: starter, solutionSql: "SELECT *\nFROM products;", orderSensitive: true },
  { title: "Choose product columns in a specific order", difficulty: "easy", objective: "Control output column order.", instructions: ["Return `product_name`, `price`, and `category` from `products`.", "Keep that exact column order."], starterSql: starter, solutionSql: "SELECT product_name, price, category\nFROM products;", orderSensitive: true },
  { title: "Alias two payment columns", difficulty: "easy", objective: "Use readable column labels.", instructions: ["Return `payment_id` as `id` and `payment_status` as `status` from `payments`.", "Keep the natural row order."], starterSql: starter, solutionSql: "SELECT payment_id AS id, payment_status AS status\nFROM payments;", orderSensitive: true },
  { title: "Read employee names and departments", difficulty: "easy", objective: "Practice narrow projection on a new table.", instructions: ["Return `employee_name` and `department` from `employees`.", "Do not sort."], starterSql: starter, solutionSql: "SELECT employee_name, department\nFROM employees;", orderSensitive: true },
  { title: "Read shipment basics", difficulty: "easy", objective: "Select only the operational fields you need.", instructions: ["Return `shipment_id`, `carrier`, and `shipment_status` from `shipments`.", "Keep the default row order."], starterSql: starter, solutionSql: "SELECT shipment_id, carrier, shipment_status\nFROM shipments;", orderSensitive: true },
  { title: "Read appointment scheduling fields", difficulty: "easy", objective: "Project scheduling columns cleanly.", instructions: ["Return `appointment_id`, `patient_name`, and `appointment_date` from `appointments`.", "Keep the table order."], starterSql: starter, solutionSql: "SELECT appointment_id, patient_name, appointment_date\nFROM appointments;", orderSensitive: true },
  { title: "Alias source-system events", difficulty: "easy", objective: "Rename columns without changing row content.", instructions: ["Return `source_system` as `system_name` and `event_type` as `type` from `events`.", "Do not filter."], starterSql: starter, solutionSql: "SELECT source_system AS system_name, event_type AS type\nFROM events;", orderSensitive: true },
  { title: "Read product launch dates", difficulty: "easy", objective: "Project text and date values together.", instructions: ["Return `product_name` and `launched_on` from `products`.", "Keep the source order."], starterSql: starter, solutionSql: "SELECT product_name, launched_on\nFROM products;", orderSensitive: true },
  { title: "List employee salary fields", difficulty: "easy", objective: "Read numeric columns without extra logic.", instructions: ["Return `employee_id`, `employee_name`, and `salary` from `employees`.", "Keep the table order."], starterSql: starter, solutionSql: "SELECT employee_id, employee_name, salary\nFROM employees;", orderSensitive: true },
  { title: "Read payment processing fields", difficulty: "easy", objective: "Project timestamps with IDs.", instructions: ["Return `payment_id`, `processed_at`, and `gateway` from `payments`.", "Do not sort."], starterSql: starter, solutionSql: "SELECT payment_id, processed_at, gateway\nFROM payments;", orderSensitive: true },

  { title: "Compute a monthly salary estimate", difficulty: "medium", objective: "Use a simple numeric expression in SELECT.", instructions: ["Return `employee_name` and `salary / 12` as `monthly_salary` from `employees`.", "Sort by `employee_id`."], starterSql: starter, solutionSql: "SELECT employee_name, salary / 12 AS monthly_salary\nFROM employees\nORDER BY employee_id;", orderSensitive: true },
  { title: "Add a five-percent buffer to orders", difficulty: "medium", objective: "Create a derived numeric column.", instructions: ["Return `order_id`, `amount`, and `amount * 1.05` as `buffered_amount` from `orders`.", "Sort by `order_id`."], starterSql: starter, solutionSql: "SELECT order_id, amount, amount * 1.05 AS buffered_amount\nFROM orders\nORDER BY order_id;", orderSensitive: true },
  { title: "Create a product label", difficulty: "medium", objective: "Build a text expression in SELECT.", instructions: ["Return `product_name || ' - ' || category` as `product_label` from `products`.", "Sort by `product_id`."], starterSql: starter, solutionSql: "SELECT product_name || ' - ' || category AS product_label\nFROM products\nORDER BY product_id;", orderSensitive: true },
  { title: "Show payment net amount", difficulty: "medium", objective: "Use COALESCE inside a simple expression.", instructions: ["Return `payment_id` and `payment_amount - COALESCE(refund_amount, 0)` as `net_amount` from `payments`.", "Sort by `payment_id`."], starterSql: starter, solutionSql: "SELECT payment_id, payment_amount - COALESCE(refund_amount, 0) AS net_amount\nFROM payments\nORDER BY payment_id;", orderSensitive: true },
  { title: "Create shipment carrier labels", difficulty: "medium", objective: "Combine text columns into one output field.", instructions: ["Return `carrier || ':' || warehouse` as `route_label` from `shipments`.", "Sort by `shipment_id`."], starterSql: starter, solutionSql: "SELECT carrier || ':' || warehouse AS route_label\nFROM shipments\nORDER BY shipment_id;", orderSensitive: true },
  { title: "Double each event payload", difficulty: "medium", objective: "Use a simple arithmetic expression.", instructions: ["Return `event_id` and `payload_size * 2` as `double_payload` from `events`.", "Sort by `event_id`."], starterSql: starter, solutionSql: "SELECT event_id, payload_size * 2 AS double_payload\nFROM events\nORDER BY event_id;", orderSensitive: true },
  { title: "Show appointment fee plus admin charge", difficulty: "medium", objective: "Practice numeric expressions with aliases.", instructions: ["Return `appointment_id` and `fee + 15` as `fee_with_admin` from `appointments`.", "Sort by `appointment_id`."], starterSql: starter, solutionSql: "SELECT appointment_id, fee + 15 AS fee_with_admin\nFROM appointments\nORDER BY appointment_id;", orderSensitive: true },
  { title: "Build a customer contact label", difficulty: "medium", objective: "Concatenate text into a reporting field.", instructions: ["Return `customer_name || ' / ' || country` as `contact_label` from `customers`.", "Sort by `customer_id`."], starterSql: starter, solutionSql: "SELECT customer_name || ' / ' || country AS contact_label\nFROM customers\nORDER BY customer_id;", orderSensitive: true },
  { title: "Count unique product categories", difficulty: "easy", objective: "Use DISTINCT on another dimension table.", instructions: ["Return one row per unique `category` from `products`.", "Sort alphabetically."], starterSql: starter, solutionSql: "SELECT DISTINCT category\nFROM products\nORDER BY category;", orderSensitive: true },
  { title: "Count unique employee countries", difficulty: "easy", objective: "Remove duplicates intentionally.", instructions: ["Return one row per unique `country` from `employees`.", "Sort alphabetically."], starterSql: starter, solutionSql: "SELECT DISTINCT country\nFROM employees\nORDER BY country;", orderSensitive: true },

  { title: "Find discontinued products", difficulty: "easy", objective: "Filter a boolean-style flag.", instructions: ["Return `product_id`, `product_name`, and `is_discontinued` for discontinued products only.", "Sort by `product_id`."], starterSql: starter, solutionSql: "SELECT product_id, product_name, is_discontinued\nFROM products\nWHERE is_discontinued = 1\nORDER BY product_id;", orderSensitive: true },
  { title: "Find managers only", difficulty: "easy", objective: "Filter on a manager flag.", instructions: ["Return `employee_id`, `employee_name`, and `is_manager` for managers only.", "Sort by `employee_id`."], starterSql: starter, solutionSql: "SELECT employee_id, employee_name, is_manager\nFROM employees\nWHERE is_manager = 1\nORDER BY employee_id;", orderSensitive: true },
  { title: "Find scheduled appointments", difficulty: "easy", objective: "Filter text status values on a new table.", instructions: ["Return `appointment_id`, `status`, and `appointment_date` for scheduled appointments only.", "Sort by `appointment_id`."], starterSql: starter, solutionSql: "SELECT appointment_id, status, appointment_date\nFROM appointments\nWHERE status = 'scheduled'\nORDER BY appointment_id;", orderSensitive: true },
  { title: "Find captured payments", difficulty: "easy", objective: "Filter payment rows by exact status.", instructions: ["Return `payment_id`, `payment_status`, and `payment_amount` for captured payments.", "Sort by `payment_id`."], starterSql: starter, solutionSql: "SELECT payment_id, payment_status, payment_amount\nFROM payments\nWHERE payment_status = 'captured'\nORDER BY payment_id;", orderSensitive: true },
  { title: "Find in-transit shipments", difficulty: "easy", objective: "Filter operational rows by one condition.", instructions: ["Return `shipment_id`, `carrier`, and `shipment_status` for in-transit shipments only.", "Sort by `shipment_id`."], starterSql: starter, solutionSql: "SELECT shipment_id, carrier, shipment_status\nFROM shipments\nWHERE shipment_status = 'in_transit'\nORDER BY shipment_id;", orderSensitive: true },
  { title: "Find CRM events", difficulty: "easy", objective: "Filter by source-system name.", instructions: ["Return `event_id`, `source_system`, and `event_type` for `crm` events only.", "Sort by `event_id`."], starterSql: starter, solutionSql: "SELECT event_id, source_system, event_type\nFROM events\nWHERE source_system = 'crm'\nORDER BY event_id;", orderSensitive: true },
  { title: "Products priced at least 100", difficulty: "easy", objective: "Use a greater-than-or-equal comparison.", instructions: ["Return `product_id`, `product_name`, and `price` for products priced at least 100.", "Sort by `price` ascending."], starterSql: starter, solutionSql: "SELECT product_id, product_name, price\nFROM products\nWHERE price >= 100\nORDER BY price, product_id;", orderSensitive: true },
  { title: "Appointments under 150 fee", difficulty: "easy", objective: "Use a less-than numeric filter.", instructions: ["Return `appointment_id`, `patient_name`, and `fee` for appointments under 150.", "Sort by `fee` ascending."], starterSql: starter, solutionSql: "SELECT appointment_id, patient_name, fee\nFROM appointments\nWHERE fee < 150\nORDER BY fee, appointment_id;", orderSensitive: true },
  { title: "Employees hired after 2022", difficulty: "medium", objective: "Use a date comparison on ISO text dates.", instructions: ["Return `employee_id`, `employee_name`, and `hire_date` for employees hired after `2022-12-31`.", "Sort by `hire_date` ascending."], starterSql: starter, solutionSql: "SELECT employee_id, employee_name, hire_date\nFROM employees\nWHERE hire_date > '2022-12-31'\nORDER BY hire_date, employee_id;", orderSensitive: true },
  { title: "Events with payload greater than 100", difficulty: "easy", objective: "Filter integer-sized event payloads.", instructions: ["Return `event_id`, `event_type`, and `payload_size` where `payload_size` is greater than 100.", "Sort by `payload_size` ascending."], starterSql: starter, solutionSql: "SELECT event_id, event_type, payload_size\nFROM events\nWHERE payload_size > 100\nORDER BY payload_size, event_id;", orderSensitive: true },

  { title: "Use IN for product categories", difficulty: "medium", objective: "Filter to a short category list.", instructions: ["Return `product_id`, `product_name`, and `category` for products in `Hardware` or `Software`.", "Sort by `product_id`."], starterSql: starter, solutionSql: "SELECT product_id, product_name, category\nFROM products\nWHERE category IN ('Hardware', 'Software')\nORDER BY product_id;", orderSensitive: true },
  { title: "Use IN for shipment carriers", difficulty: "medium", objective: "Filter by multiple text values cleanly.", instructions: ["Return `shipment_id`, `carrier`, and `warehouse` for shipments carried by `FedEx` or `DHL`.", "Sort by `shipment_id`."], starterSql: starter, solutionSql: "SELECT shipment_id, carrier, warehouse\nFROM shipments\nWHERE carrier IN ('FedEx', 'DHL')\nORDER BY shipment_id;", orderSensitive: true },
  { title: "Use IN for event severity", difficulty: "medium", objective: "Filter to a monitored severity set.", instructions: ["Return `event_id`, `severity`, and `event_type` for events with `high` or `critical` severity.", "Sort by `event_id`."], starterSql: starter, solutionSql: "SELECT event_id, severity, event_type\nFROM events\nWHERE severity IN ('high', 'critical')\nORDER BY event_id;", orderSensitive: true },
  { title: "Use BETWEEN for product prices", difficulty: "medium", objective: "Apply an inclusive numeric range.", instructions: ["Return `product_id`, `product_name`, and `price` for products priced between 20 and 100 inclusive.", "Sort by `price` ascending."], starterSql: starter, solutionSql: "SELECT product_id, product_name, price\nFROM products\nWHERE price BETWEEN 20 AND 100\nORDER BY price, product_id;", orderSensitive: true },
  { title: "Use BETWEEN for salaries", difficulty: "medium", objective: "Practice bounded comparisons on salaries.", instructions: ["Return `employee_id`, `employee_name`, and `salary` for employees paid between 70000 and 100000 inclusive.", "Sort by `salary` ascending."], starterSql: starter, solutionSql: "SELECT employee_id, employee_name, salary\nFROM employees\nWHERE salary BETWEEN 70000 AND 100000\nORDER BY salary, employee_id;", orderSensitive: true },
  { title: "Use BETWEEN for appointment fees", difficulty: "medium", objective: "Filter a billing range.", instructions: ["Return `appointment_id`, `patient_name`, and `fee` for appointments with fee between 100 and 220 inclusive.", "Sort by `fee` descending."], starterSql: starter, solutionSql: "SELECT appointment_id, patient_name, fee\nFROM appointments\nWHERE fee BETWEEN 100 AND 220\nORDER BY fee DESC, appointment_id;", orderSensitive: true },
  { title: "Use LIKE for names starting with A", difficulty: "medium", objective: "Pattern match the first character.", instructions: ["Return `employee_id` and `employee_name` for employees whose name starts with `A`.", "Sort by `employee_id`."], starterSql: starter, solutionSql: "SELECT employee_id, employee_name\nFROM employees\nWHERE employee_name LIKE 'A%'\nORDER BY employee_id;", orderSensitive: true },
  { title: "Use LIKE for products ending with Kit", difficulty: "medium", objective: "Pattern match the end of a string.", instructions: ["Return `product_id` and `product_name` for products whose name ends with `Kit`.", "Sort by `product_id`."], starterSql: starter, solutionSql: "SELECT product_id, product_name\nFROM products\nWHERE product_name LIKE '%Kit'\nORDER BY product_id;", orderSensitive: true },
  { title: "Use LIKE for patients containing i", difficulty: "medium", objective: "Pattern match text anywhere in the value.", instructions: ["Return `appointment_id` and `patient_name` for patients whose name contains `i`.", "Sort by `appointment_id`."], starterSql: starter, solutionSql: "SELECT appointment_id, patient_name\nFROM appointments\nWHERE patient_name LIKE '%i%'\nORDER BY appointment_id;", orderSensitive: true },
  { title: "Use LIKE for gateways starting with p", difficulty: "medium", objective: "Match a prefix in operational text.", instructions: ["Return `payment_id` and `gateway` for payment gateways starting with `p`.", "Sort by `payment_id`."], starterSql: starter, solutionSql: "SELECT payment_id, gateway\nFROM payments\nWHERE gateway LIKE 'p%'\nORDER BY payment_id;", orderSensitive: true },

  { title: "Find shipments missing a delivery date", difficulty: "medium", objective: "Use IS NULL on a logistics field.", instructions: ["Return `shipment_id`, `carrier`, and `delivered_date` for shipments that are still missing a delivery date.", "Sort by `shipment_id`."], starterSql: starter, solutionSql: "SELECT shipment_id, carrier, delivered_date\nFROM shipments\nWHERE delivered_date IS NULL\nORDER BY shipment_id;", orderSensitive: true },
  { title: "Find shipments with a delivery date", difficulty: "medium", objective: "Use IS NOT NULL for the opposite case.", instructions: ["Return `shipment_id`, `carrier`, and `delivered_date` for shipments that already have a delivery date.", "Sort by `shipment_id`."], starterSql: starter, solutionSql: "SELECT shipment_id, carrier, delivered_date\nFROM shipments\nWHERE delivered_date IS NOT NULL\nORDER BY shipment_id;", orderSensitive: true },
  { title: "Find payments with a refund amount", difficulty: "medium", objective: "Detect the rows where a nullable amount exists.", instructions: ["Return `payment_id`, `payment_status`, and `refund_amount` for payments with a refund amount.", "Sort by `payment_id`."], starterSql: starter, solutionSql: "SELECT payment_id, payment_status, refund_amount\nFROM payments\nWHERE refund_amount IS NOT NULL\nORDER BY payment_id;", orderSensitive: true },
  { title: "Find events missing batch ids", difficulty: "medium", objective: "Filter null operational metadata correctly.", instructions: ["Return `event_id`, `event_type`, and `batch_id` for events with a missing batch id.", "Sort by `event_id`."], starterSql: starter, solutionSql: "SELECT event_id, event_type, batch_id\nFROM events\nWHERE batch_id IS NULL\nORDER BY event_id;", orderSensitive: true },
  { title: "Sort employees by salary descending", difficulty: "easy", objective: "Practice ordering on a new table.", instructions: ["Return `employee_id`, `employee_name`, and `salary` from `employees`.", "Sort by `salary` descending."], starterSql: starter, solutionSql: "SELECT employee_id, employee_name, salary\nFROM employees\nORDER BY salary DESC, employee_id;", orderSensitive: true },
  { title: "Sort products by category then price", difficulty: "medium", objective: "Use multi-column ordering.", instructions: ["Return `product_id`, `category`, and `price` from `products`.", "Sort by `category` ascending and `price` descending."], starterSql: starter, solutionSql: "SELECT product_id, category, price\nFROM products\nORDER BY category, price DESC, product_id;", orderSensitive: true },
  { title: "Sort appointments by date then fee", difficulty: "medium", objective: "Use a second sort key for ties.", instructions: ["Return `appointment_id`, `appointment_date`, and `fee` from `appointments`.", "Sort by `appointment_date` ascending and `fee` descending."], starterSql: starter, solutionSql: "SELECT appointment_id, appointment_date, fee\nFROM appointments\nORDER BY appointment_date, fee DESC, appointment_id;", orderSensitive: true },
  { title: "Sort events by severity then payload", difficulty: "medium", objective: "Control a two-key result order.", instructions: ["Return `event_id`, `severity`, and `payload_size` from `events`.", "Sort by `severity` ascending and `payload_size` descending."], starterSql: starter, solutionSql: "SELECT event_id, severity, payload_size\nFROM events\nORDER BY severity, payload_size DESC, event_id;", orderSensitive: true },
  { title: "Top two highest salaries", difficulty: "easy", objective: "Combine sorting and limiting.", instructions: ["Return the 2 highest-paid employees.", "Show `employee_name` and `salary` only."], starterSql: starter, solutionSql: "SELECT employee_name, salary\nFROM employees\nORDER BY salary DESC, employee_id\nLIMIT 2;", orderSensitive: true },
  { title: "Top three latest appointments", difficulty: "easy", objective: "Use LIMIT on date-sorted healthcare rows.", instructions: ["Return the 3 latest appointments.", "Show `appointment_id`, `patient_name`, and `appointment_date`."], starterSql: starter, solutionSql: "SELECT appointment_id, patient_name, appointment_date\nFROM appointments\nORDER BY appointment_date DESC, appointment_id DESC\nLIMIT 3;", orderSensitive: true },

  { title: "Top two largest payment amounts", difficulty: "easy", objective: "Limit after sorting numeric values.", instructions: ["Return the 2 largest payment amounts.", "Show `payment_id` and `payment_amount`."], starterSql: starter, solutionSql: "SELECT payment_id, payment_amount\nFROM payments\nORDER BY payment_amount DESC, payment_id\nLIMIT 2;", orderSensitive: true },
  { title: "Earliest three launched products", difficulty: "easy", objective: "Sort dates from earliest to latest and limit.", instructions: ["Return the 3 earliest product launches.", "Show `product_id`, `product_name`, and `launched_on`."], starterSql: starter, solutionSql: "SELECT product_id, product_name, launched_on\nFROM products\nORDER BY launched_on, product_id\nLIMIT 3;", orderSensitive: true },
  { title: "Highest payload events first", difficulty: "easy", objective: "Sort operational rows by event size.", instructions: ["Return `event_id` and `payload_size` from `events`.", "Sort by `payload_size` descending."], starterSql: starter, solutionSql: "SELECT event_id, payload_size\nFROM events\nORDER BY payload_size DESC, event_id;", orderSensitive: true },
  { title: "US employees only", difficulty: "easy", objective: "Filter by one country value.", instructions: ["Return `employee_id`, `employee_name`, and `country` for employees in the US.", "Sort by `employee_id`."], starterSql: starter, solutionSql: "SELECT employee_id, employee_name, country\nFROM employees\nWHERE country = 'US'\nORDER BY employee_id;", orderSensitive: true },
  { title: "Indian employees only", difficulty: "easy", objective: "Repeat country filtering on a different target.", instructions: ["Return `employee_id`, `employee_name`, and `country` for employees in India.", "Sort by `employee_id`."], starterSql: starter, solutionSql: "SELECT employee_id, employee_name, country\nFROM employees\nWHERE country = 'India'\nORDER BY employee_id;", orderSensitive: true },
  { title: "Orthopedics appointments only", difficulty: "easy", objective: "Filter by department text.", instructions: ["Return `appointment_id`, `patient_name`, and `department` for orthopedics appointments.", "Sort by `appointment_id`."], starterSql: starter, solutionSql: "SELECT appointment_id, patient_name, department\nFROM appointments\nWHERE department = 'Orthopedics'\nORDER BY appointment_id;", orderSensitive: true },
  { title: "Software products only", difficulty: "easy", objective: "Filter by product category.", instructions: ["Return `product_id`, `product_name`, and `category` for software products.", "Sort by `product_id`."], starterSql: starter, solutionSql: "SELECT product_id, product_name, category\nFROM products\nWHERE category = 'Software'\nORDER BY product_id;", orderSensitive: true },
  { title: "Stripe payments only", difficulty: "easy", objective: "Filter by gateway name.", instructions: ["Return `payment_id`, `gateway`, and `payment_status` for Stripe payments.", "Sort by `payment_id`."], starterSql: starter, solutionSql: "SELECT payment_id, gateway, payment_status\nFROM payments\nWHERE gateway = 'stripe'\nORDER BY payment_id;", orderSensitive: true },
  { title: "East warehouse shipments only", difficulty: "easy", objective: "Filter shipment rows by warehouse.", instructions: ["Return `shipment_id`, `warehouse`, and `carrier` for east warehouse shipments.", "Sort by `shipment_id`."], starterSql: starter, solutionSql: "SELECT shipment_id, warehouse, carrier\nFROM shipments\nWHERE warehouse = 'east'\nORDER BY shipment_id;", orderSensitive: true },

  { title: "Follow-up appointments only", difficulty: "easy", objective: "Filter on a second boolean-style flag.", instructions: ["Return `appointment_id`, `patient_name`, and `follow_up_required` for appointments requiring follow-up.", "Sort by `appointment_id`."], starterSql: starter, solutionSql: "SELECT appointment_id, patient_name, follow_up_required\nFROM appointments\nWHERE follow_up_required = 1\nORDER BY appointment_id;", orderSensitive: true },
  { title: "Non-manager employees only", difficulty: "easy", objective: "Filter the false side of a flag.", instructions: ["Return `employee_id`, `employee_name`, and `is_manager` for non-manager employees.", "Sort by `employee_id`."], starterSql: starter, solutionSql: "SELECT employee_id, employee_name, is_manager\nFROM employees\nWHERE is_manager = 0\nORDER BY employee_id;", orderSensitive: true },
  { title: "Latest captured payments above 100", difficulty: "medium", objective: "Combine numeric, text, and ordering logic.", instructions: ["Return captured payments greater than 100.", "Show `payment_id`, `payment_amount`, and `processed_at`.", "Sort by `processed_at` descending."], starterSql: starter, solutionSql: "SELECT payment_id, payment_amount, processed_at\nFROM payments\nWHERE payment_status = 'captured'\n  AND payment_amount > 100\nORDER BY processed_at DESC, payment_id DESC;", orderSensitive: true },
  { title: "Scheduled cardiology appointments", difficulty: "medium", objective: "Combine two text filters.", instructions: ["Return scheduled cardiology appointments only.", "Show `appointment_id`, `patient_name`, and `appointment_date`.", "Sort by `appointment_date`."], starterSql: starter, solutionSql: "SELECT appointment_id, patient_name, appointment_date\nFROM appointments\nWHERE department = 'Cardiology'\n  AND status = 'scheduled'\nORDER BY appointment_date, appointment_id;", orderSensitive: true },
  { title: "FedEx shipments that are not delivered yet", difficulty: "medium", objective: "Combine carrier and status filters.", instructions: ["Return FedEx shipments that are still not delivered.", "Show `shipment_id`, `carrier`, and `shipment_status`.", "Sort by `shipment_id`."], starterSql: starter, solutionSql: "SELECT shipment_id, carrier, shipment_status\nFROM shipments\nWHERE carrier = 'FedEx'\n  AND shipment_status <> 'delivered'\nORDER BY shipment_id;", orderSensitive: true },
  { title: "High or critical operational events", difficulty: "medium", objective: "Use multiple-value severity logic.", instructions: ["Return operational events with high or critical severity.", "Show `event_id`, `severity`, and `source_system`.", "Sort by `event_id`."], starterSql: starter, solutionSql: "SELECT event_id, severity, source_system\nFROM events\nWHERE source_system = 'ops'\n  AND severity IN ('high', 'critical')\nORDER BY event_id;", orderSensitive: true },
  { title: "Active customers with known email", difficulty: "medium", objective: "Combine a boolean filter with IS NOT NULL.", instructions: ["Return active customers that have a non-null email.", "Show `customer_id`, `customer_name`, and `email`.", "Sort by `customer_id`."], starterSql: starter, solutionSql: "SELECT customer_id, customer_name, email\nFROM customers\nWHERE is_active = 1\n  AND email IS NOT NULL\nORDER BY customer_id;", orderSensitive: true },
  { title: "Recently launched software products", difficulty: "medium", objective: "Combine category and date filters.", instructions: ["Return software products launched on or after `2026-01-01`.", "Show `product_id`, `product_name`, and `launched_on`.", "Sort by `launched_on`."], starterSql: starter, solutionSql: "SELECT product_id, product_name, launched_on\nFROM products\nWHERE category = 'Software'\n  AND launched_on >= '2026-01-01'\nORDER BY launched_on, product_id;", orderSensitive: true },
  { title: "Engineering salaries above 90000", difficulty: "medium", objective: "Filter by department and threshold.", instructions: ["Return engineering employees earning above 90000.", "Show `employee_id`, `employee_name`, and `salary`.", "Sort by `salary` descending."], starterSql: starter, solutionSql: "SELECT employee_id, employee_name, salary\nFROM employees\nWHERE department = 'Engineering'\n  AND salary > 90000\nORDER BY salary DESC, employee_id;", orderSensitive: true },
  { title: "Appointment fees on or after April 10", difficulty: "medium", objective: "Combine date filtering with projection.", instructions: ["Return appointments on or after `2026-04-10`.", "Show `appointment_id`, `appointment_date`, and `fee`.", "Sort by `appointment_date`."], starterSql: starter, solutionSql: "SELECT appointment_id, appointment_date, fee\nFROM appointments\nWHERE appointment_date >= '2026-04-10'\nORDER BY appointment_date, appointment_id;", orderSensitive: true },

  { title: "Show shipments from newest shipped date", difficulty: "easy", objective: "Order logistics rows by shipped date.", instructions: ["Return `shipment_id`, `shipped_date`, and `carrier` from `shipments`.", "Sort by `shipped_date` descending."], starterSql: starter, solutionSql: "SELECT shipment_id, shipped_date, carrier\nFROM shipments\nORDER BY shipped_date DESC, shipment_id DESC;", orderSensitive: true },
  { title: "Show products from highest to lowest price", difficulty: "easy", objective: "Sort the catalog by price.", instructions: ["Return `product_id`, `product_name`, and `price` from `products`.", "Sort by `price` descending."], starterSql: starter, solutionSql: "SELECT product_id, product_name, price\nFROM products\nORDER BY price DESC, product_id;", orderSensitive: true },
  { title: "Show appointments from lowest to highest fee", difficulty: "easy", objective: "Sort medical visits by fee.", instructions: ["Return `appointment_id`, `patient_name`, and `fee`.", "Sort by `fee` ascending."], starterSql: starter, solutionSql: "SELECT appointment_id, patient_name, fee\nFROM appointments\nORDER BY fee, appointment_id;", orderSensitive: true },
  { title: "Show payments newest first", difficulty: "easy", objective: "Sort payment rows by processed timestamp.", instructions: ["Return `payment_id`, `processed_at`, and `payment_status`.", "Sort by `processed_at` descending."], starterSql: starter, solutionSql: "SELECT payment_id, processed_at, payment_status\nFROM payments\nORDER BY processed_at DESC, payment_id DESC;", orderSensitive: true },
  { title: "Show events oldest first", difficulty: "easy", objective: "Sort events chronologically.", instructions: ["Return `event_id`, `event_date`, and `event_type`.", "Sort by `event_date` ascending."], starterSql: starter, solutionSql: "SELECT event_id, event_date, event_type\nFROM events\nORDER BY event_date, event_id;", orderSensitive: true },
  { title: "Find customers signed up before March", difficulty: "medium", objective: "Use a date boundary on customer data.", instructions: ["Return customers who signed up before `2026-03-01`.", "Show `customer_id`, `customer_name`, and `signup_date`.", "Sort by `signup_date`."], starterSql: starter, solutionSql: "SELECT customer_id, customer_name, signup_date\nFROM customers\nWHERE signup_date < '2026-03-01'\nORDER BY signup_date, customer_id;", orderSensitive: true },
  { title: "Find products launched in February or later", difficulty: "medium", objective: "Filter by a later launch-date boundary.", instructions: ["Return products launched on or after `2026-02-01`.", "Show `product_id`, `product_name`, and `launched_on`.", "Sort by `launched_on`."], starterSql: starter, solutionSql: "SELECT product_id, product_name, launched_on\nFROM products\nWHERE launched_on >= '2026-02-01'\nORDER BY launched_on, product_id;", orderSensitive: true },
  { title: "Find delivered shipments after April 10", difficulty: "medium", objective: "Mix date and status logic.", instructions: ["Return delivered shipments shipped after `2026-04-10`.", "Show `shipment_id`, `shipment_status`, and `shipped_date`.", "Sort by `shipped_date`."], starterSql: starter, solutionSql: "SELECT shipment_id, shipment_status, shipped_date\nFROM shipments\nWHERE shipment_status = 'delivered'\n  AND shipped_date > '2026-04-10'\nORDER BY shipped_date, shipment_id;", orderSensitive: true },
  { title: "Find billing events on or before April 9", difficulty: "medium", objective: "Use a source-system and end-date boundary.", instructions: ["Return billing events on or before `2026-04-09`.", "Show `event_id`, `source_system`, and `event_date`.", "Sort by `event_date`."], starterSql: starter, solutionSql: "SELECT event_id, source_system, event_date\nFROM events\nWHERE source_system = 'billing'\n  AND event_date <= '2026-04-09'\nORDER BY event_date, event_id;", orderSensitive: true },
  { title: "Find appointments exactly on April 14", difficulty: "medium", objective: "Use one precise date equality check.", instructions: ["Return appointments on `2026-04-14`.", "Show `appointment_id`, `patient_name`, and `appointment_date`."], starterSql: starter, solutionSql: "SELECT appointment_id, patient_name, appointment_date\nFROM appointments\nWHERE appointment_date = '2026-04-14'\nORDER BY appointment_id;", orderSensitive: true },

  { title: "Debug the misspelled customer column", difficulty: "medium", objective: "Repair a broken column reference.", instructions: ["Fix the starter query so it returns `customer_name` and `country` from `customers`.", "Sort by `customer_id`."], starterSql: "SELECT customer_nam, country\nFROM customers\nORDER BY customer_id;", solutionSql: "SELECT customer_name, country\nFROM customers\nORDER BY customer_id;", orderSensitive: true },
  { title: "Debug the wrong order table filter", difficulty: "medium", objective: "Repair a bad status value.", instructions: ["Fix the starter query so it returns only pending orders.", "Show `order_id`, `status`, and `amount`.", "Sort by `order_id`."], starterSql: "SELECT order_id, status, amount\nFROM orders\nWHERE status = 'pendng'\nORDER BY order_id;", solutionSql: "SELECT order_id, status, amount\nFROM orders\nWHERE status = 'pending'\nORDER BY order_id;", orderSensitive: true },
  { title: "Debug the missing IS NULL", difficulty: "medium", objective: "Repair incorrect null comparison syntax.", instructions: ["Fix the starter query so it returns customers with missing emails.", "Show `customer_id` and `customer_name`."], starterSql: "SELECT customer_id, customer_name\nFROM customers\nWHERE email = NULL;", solutionSql: "SELECT customer_id, customer_name\nFROM customers\nWHERE email IS NULL;", orderSensitive: true },
  { title: "Debug the product sort direction", difficulty: "medium", objective: "Repair ordering to match the request.", instructions: ["Fix the starter query so it returns products from highest price to lowest price.", "Show `product_id` and `price`."], starterSql: "SELECT product_id, price\nFROM products\nORDER BY price;", solutionSql: "SELECT product_id, price\nFROM products\nORDER BY price DESC, product_id;", orderSensitive: true },
  { title: "Debug the missing employee comma", difficulty: "medium", objective: "Repair a small syntax issue.", instructions: ["Fix the starter query so it returns `employee_id`, `employee_name`, and `department`.", "Sort by `employee_id`."], starterSql: "SELECT employee_id employee_name, department\nFROM employees\nORDER BY employee_id;", solutionSql: "SELECT employee_id, employee_name, department\nFROM employees\nORDER BY employee_id;", orderSensitive: true },
  { title: "Debug the wrong appointment comparison", difficulty: "medium", objective: "Repair a numeric comparison boundary.", instructions: ["Fix the starter query so it returns appointments with fee greater than 150.", "Show `appointment_id` and `fee`.", "Sort by `fee`."], starterSql: "SELECT appointment_id, fee\nFROM appointments\nWHERE fee < 150\nORDER BY fee;", solutionSql: "SELECT appointment_id, fee\nFROM appointments\nWHERE fee > 150\nORDER BY fee, appointment_id;", orderSensitive: true },
  { title: "Debug the wrong gateway filter", difficulty: "medium", objective: "Repair an incorrect text literal.", instructions: ["Fix the starter query so it returns PayPal payments only.", "Show `payment_id` and `gateway`."], starterSql: "SELECT payment_id, gateway\nFROM payments\nWHERE gateway = 'paypall'\nORDER BY payment_id;", solutionSql: "SELECT payment_id, gateway\nFROM payments\nWHERE gateway = 'paypal'\nORDER BY payment_id;", orderSensitive: true },
  { title: "Debug the shipment null check", difficulty: "medium", objective: "Repair an incorrect null predicate again on a different table.", instructions: ["Fix the starter query so it returns shipments missing a delivery date.", "Show `shipment_id` and `delivered_date`."], starterSql: "SELECT shipment_id, delivered_date\nFROM shipments\nWHERE delivered_date = NULL;", solutionSql: "SELECT shipment_id, delivered_date\nFROM shipments\nWHERE delivered_date IS NULL\nORDER BY shipment_id;", orderSensitive: true },
  { title: "Debug the event limit ordering", difficulty: "medium", objective: "Make a LIMIT deterministic by sorting first.", instructions: ["Fix the starter query so it returns the 2 newest events.", "Show `event_id` and `event_date`."], starterSql: "SELECT event_id, event_date\nFROM events\nLIMIT 2;", solutionSql: "SELECT event_id, event_date\nFROM events\nORDER BY event_date DESC, event_id DESC\nLIMIT 2;", orderSensitive: true },
  { title: "Debug the employee country value", difficulty: "medium", objective: "Repair a text filter and preserve projection.", instructions: ["Fix the starter query so it returns Canadian employees only.", "Show `employee_id`, `employee_name`, and `country`."], starterSql: "SELECT employee_id, employee_name, country\nFROM employees\nWHERE country = 'Canad';", solutionSql: "SELECT employee_id, employee_name, country\nFROM employees\nWHERE country = 'Canada'\nORDER BY employee_id;", orderSensitive: true },

  { title: "Return the 4 newest events above 40 payload", difficulty: "medium", objective: "Mix numeric filtering, sorting, and limiting.", instructions: ["Return events where `payload_size` is greater than 40.", "Show `event_id`, `event_date`, and `payload_size`.", "Sort by newest date first and limit to 4 rows."], starterSql: starter, solutionSql: "SELECT event_id, event_date, payload_size\nFROM events\nWHERE payload_size > 40\nORDER BY event_date DESC, event_id DESC\nLIMIT 4;", orderSensitive: true },
  { title: "Return the 3 cheapest active products", difficulty: "medium", objective: "Combine flag filtering with ascending sorting and limit.", instructions: ["Return active products only.", "Show `product_id`, `product_name`, and `price`.", "Sort by `price` ascending and limit to 3 rows."], starterSql: starter, solutionSql: "SELECT product_id, product_name, price\nFROM products\nWHERE is_discontinued = 0\nORDER BY price, product_id\nLIMIT 3;", orderSensitive: true },
  { title: "Return the 2 highest fees in cardiology", difficulty: "medium", objective: "Use a department filter with descending sort and limit.", instructions: ["Return cardiology appointments only.", "Show `appointment_id`, `patient_name`, and `fee`.", "Sort by `fee` descending and limit to 2 rows."], starterSql: starter, solutionSql: "SELECT appointment_id, patient_name, fee\nFROM appointments\nWHERE department = 'Cardiology'\nORDER BY fee DESC, appointment_id\nLIMIT 2;", orderSensitive: true },
  { title: "Return the newest two shipped rows with no delivery date", difficulty: "medium", objective: "Combine a null filter with date-based ordering.", instructions: ["Return shipments with missing delivery dates.", "Show `shipment_id`, `carrier`, and `shipped_date`.", "Sort by `shipped_date` descending and limit to 2 rows."], starterSql: starter, solutionSql: "SELECT shipment_id, carrier, shipped_date\nFROM shipments\nWHERE delivered_date IS NULL\nORDER BY shipped_date DESC, shipment_id DESC\nLIMIT 2;", orderSensitive: true },
  { title: "Return the two largest captured payments", difficulty: "medium", objective: "Filter, sort, and limit payment rows.", instructions: ["Return captured payments only.", "Show `payment_id`, `payment_amount`, and `gateway`.", "Sort by `payment_amount` descending and limit to 2 rows."], starterSql: starter, solutionSql: "SELECT payment_id, payment_amount, gateway\nFROM payments\nWHERE payment_status = 'captured'\nORDER BY payment_amount DESC, payment_id\nLIMIT 2;", orderSensitive: true },
  { title: "Return the earliest two US customer signups", difficulty: "medium", objective: "Practice date ordering after filtering.", instructions: ["Return US customers only.", "Show `customer_id`, `customer_name`, and `signup_date`.", "Sort by `signup_date` ascending and limit to 2 rows."], starterSql: starter, solutionSql: "SELECT customer_id, customer_name, signup_date\nFROM customers\nWHERE country = 'US'\nORDER BY signup_date, customer_id\nLIMIT 2;", orderSensitive: true },
  { title: "Return finance salaries between 70000 and 100000", difficulty: "medium", objective: "Combine text and range filters.", instructions: ["Return finance employees with salary between 70000 and 100000 inclusive.", "Show `employee_id`, `employee_name`, and `salary`.", "Sort by `salary` descending."], starterSql: starter, solutionSql: "SELECT employee_id, employee_name, salary\nFROM employees\nWHERE department = 'Finance'\n  AND salary BETWEEN 70000 AND 100000\nORDER BY salary DESC, employee_id;", orderSensitive: true },
  { title: "Return operations employees hired before 2023", difficulty: "medium", objective: "Combine department and date filters.", instructions: ["Return operations employees hired before `2023-01-01`.", "Show `employee_id`, `employee_name`, and `hire_date`.", "Sort by `hire_date`."], starterSql: starter, solutionSql: "SELECT employee_id, employee_name, hire_date\nFROM employees\nWHERE department = 'Operations'\n  AND hire_date < '2023-01-01'\nORDER BY hire_date, employee_id;", orderSensitive: true },
  { title: "Return software or analytics products above 100", difficulty: "medium", objective: "Use IN with a numeric threshold.", instructions: ["Return software or analytics products priced above 100.", "Show `product_id`, `product_name`, `category`, and `price`.", "Sort by `price` descending."], starterSql: starter, solutionSql: "SELECT product_id, product_name, category, price\nFROM products\nWHERE category IN ('Software', 'Analytics')\n  AND price > 100\nORDER BY price DESC, product_id;", orderSensitive: true },
  { title: "Return delivered shipments from east or central warehouses", difficulty: "medium", objective: "Use IN across operational dimensions.", instructions: ["Return delivered shipments from east or central warehouses.", "Show `shipment_id`, `warehouse`, `carrier`, and `shipment_status`.", "Sort by `shipment_id`."], starterSql: starter, solutionSql: "SELECT shipment_id, warehouse, carrier, shipment_status\nFROM shipments\nWHERE warehouse IN ('east', 'central')\n  AND shipment_status = 'delivered'\nORDER BY shipment_id;", orderSensitive: true },

  { title: "Return customer names with signup month order", difficulty: "medium", objective: "Use deterministic ordering on text dates.", instructions: ["Return `customer_name` and `signup_date` from `customers`.", "Sort by `signup_date` descending and then `customer_name` ascending."], starterSql: starter, solutionSql: "SELECT customer_name, signup_date\nFROM customers\nORDER BY signup_date DESC, customer_name;", orderSensitive: true },
  { title: "Return distinct payment gateways", difficulty: "easy", objective: "Use DISTINCT on a payment dimension.", instructions: ["Return one row per unique payment `gateway` from `payments`.", "Sort alphabetically."], starterSql: starter, solutionSql: "SELECT DISTINCT gateway\nFROM payments\nORDER BY gateway;", orderSensitive: true },
  { title: "Return distinct appointment departments", difficulty: "easy", objective: "Use DISTINCT on healthcare departments.", instructions: ["Return one row per unique `department` from `appointments`.", "Sort alphabetically."], starterSql: starter, solutionSql: "SELECT DISTINCT department\nFROM appointments\nORDER BY department;", orderSensitive: true },
  { title: "Return distinct event source systems", difficulty: "easy", objective: "Use DISTINCT on operational systems.", instructions: ["Return one row per unique `source_system` from `events`.", "Sort alphabetically."], starterSql: starter, solutionSql: "SELECT DISTINCT source_system\nFROM events\nORDER BY source_system;", orderSensitive: true },
  { title: "Return distinct shipment statuses", difficulty: "easy", objective: "Remove duplicate shipment states.", instructions: ["Return one row per unique `shipment_status` from `shipments`.", "Sort alphabetically."], starterSql: starter, solutionSql: "SELECT DISTINCT shipment_status\nFROM shipments\nORDER BY shipment_status;", orderSensitive: true },
  { title: "Return distinct customer active flags", difficulty: "easy", objective: "Observe the unique values in a boolean-like field.", instructions: ["Return one row per unique `is_active` value from `customers`.", "Sort ascending."], starterSql: starter, solutionSql: "SELECT DISTINCT is_active\nFROM customers\nORDER BY is_active;", orderSensitive: true },
  { title: "Return orders with payment labels", difficulty: "medium", objective: "Use aliases with text filters and ordering.", instructions: ["Return paid or pending orders only.", "Show `order_id` as `id`, `payment_method` as `method`, and `amount`.", "Sort by `amount` descending."], starterSql: starter, solutionSql: "SELECT order_id AS id, payment_method AS method, amount\nFROM orders\nWHERE status IN ('paid', 'pending')\nORDER BY amount DESC, order_id;", orderSensitive: true },
  { title: "Return active customer emails ordered by country", difficulty: "medium", objective: "Combine null avoidance and ordering.", instructions: ["Return active customers with a non-null email.", "Show `customer_name`, `email`, and `country`.", "Sort by `country` and then `customer_name`."], starterSql: starter, solutionSql: "SELECT customer_name, email, country\nFROM customers\nWHERE is_active = 1\n  AND email IS NOT NULL\nORDER BY country, customer_name;", orderSensitive: true },
  { title: "Return operations and support staff outside India", difficulty: "medium", objective: "Use IN with a negative-style country filter.", instructions: ["Return employees in Operations or Support whose country is not India.", "Show `employee_id`, `employee_name`, `department`, and `country`.", "Sort by `department` and `employee_id`."], starterSql: starter, solutionSql: "SELECT employee_id, employee_name, department, country\nFROM employees\nWHERE department IN ('Operations', 'Support')\n  AND country <> 'India'\nORDER BY department, employee_id;", orderSensitive: true },
  { title: "Return appointments needing follow-up after April 8", difficulty: "medium", objective: "Use a flag plus date boundary.", instructions: ["Return follow-up appointments after `2026-04-08`.", "Show `appointment_id`, `patient_name`, `appointment_date`, and `follow_up_required`.", "Sort by `appointment_date`."], starterSql: starter, solutionSql: "SELECT appointment_id, patient_name, appointment_date, follow_up_required\nFROM appointments\nWHERE follow_up_required = 1\n  AND appointment_date > '2026-04-08'\nORDER BY appointment_date, appointment_id;", orderSensitive: true },

  { title: "Return not-cancelled appointments", difficulty: "medium", objective: "Use a not-equal condition safely.", instructions: ["Return appointments that are not cancelled.", "Show `appointment_id`, `status`, and `patient_name`.", "Sort by `appointment_id`."], starterSql: starter, solutionSql: "SELECT appointment_id, status, patient_name\nFROM appointments\nWHERE status <> 'cancelled'\nORDER BY appointment_id;", orderSensitive: true },
  { title: "Return non-failed payments", difficulty: "medium", objective: "Exclude one payment state.", instructions: ["Return payments that are not failed.", "Show `payment_id`, `payment_status`, and `payment_amount`.", "Sort by `payment_id`."], starterSql: starter, solutionSql: "SELECT payment_id, payment_status, payment_amount\nFROM payments\nWHERE payment_status <> 'failed'\nORDER BY payment_id;", orderSensitive: true },
  { title: "Return non-delivered shipments", difficulty: "medium", objective: "Exclude delivered logistics rows.", instructions: ["Return shipments that are not delivered.", "Show `shipment_id`, `shipment_status`, and `carrier`.", "Sort by `shipment_id`."], starterSql: starter, solutionSql: "SELECT shipment_id, shipment_status, carrier\nFROM shipments\nWHERE shipment_status <> 'delivered'\nORDER BY shipment_id;", orderSensitive: true },
  { title: "Return non-critical events", difficulty: "medium", objective: "Exclude one operational severity.", instructions: ["Return events that are not critical.", "Show `event_id`, `severity`, and `event_type`.", "Sort by `event_id`."], starterSql: starter, solutionSql: "SELECT event_id, severity, event_type\nFROM events\nWHERE severity <> 'critical'\nORDER BY event_id;", orderSensitive: true },
  { title: "Return non-discontinued products under 100", difficulty: "medium", objective: "Combine exclusion logic with a numeric cap.", instructions: ["Return products that are not discontinued and cost under 100.", "Show `product_id`, `product_name`, and `price`.", "Sort by `price` ascending."], starterSql: starter, solutionSql: "SELECT product_id, product_name, price\nFROM products\nWHERE is_discontinued = 0\n  AND price < 100\nORDER BY price, product_id;", orderSensitive: true },
  { title: "Return customers from Canada or UK", difficulty: "easy", objective: "Practice multiple-value text filters again on another pair.", instructions: ["Return customers from Canada or the UK.", "Show `customer_id`, `customer_name`, and `country`.", "Sort by `customer_id`."], starterSql: starter, solutionSql: "SELECT customer_id, customer_name, country\nFROM customers\nWHERE country IN ('Canada', 'UK')\nORDER BY customer_id;", orderSensitive: true },
  { title: "Return orders below 100 sorted newest first", difficulty: "medium", objective: "Mix amount filtering with reverse date order.", instructions: ["Return orders below 100.", "Show `order_id`, `amount`, and `order_date`.", "Sort by `order_date` descending."], starterSql: starter, solutionSql: "SELECT order_id, amount, order_date\nFROM orders\nWHERE amount < 100\nORDER BY order_date DESC, order_id DESC;", orderSensitive: true },
  { title: "Return products launched before 2026 and still active", difficulty: "medium", objective: "Combine date and flag logic on the catalog.", instructions: ["Return non-discontinued products launched before `2026-01-01`.", "Show `product_id`, `product_name`, and `launched_on`.", "Sort by `launched_on`."], starterSql: starter, solutionSql: "SELECT product_id, product_name, launched_on\nFROM products\nWHERE is_discontinued = 0\n  AND launched_on < '2026-01-01'\nORDER BY launched_on, product_id;", orderSensitive: true },
  { title: "Return customer rows with missing emails first", difficulty: "medium", objective: "Use ordering to surface data-quality issues.", instructions: ["Return `customer_id`, `customer_name`, and `email` from `customers`.", "Sort by `email` ascending and then `customer_id`."], starterSql: starter, solutionSql: "SELECT customer_id, customer_name, email\nFROM customers\nORDER BY email, customer_id;", orderSensitive: true },
  { title: "Return event ids and batch ids with known batches only", difficulty: "medium", objective: "Combine IS NOT NULL with projection.", instructions: ["Return events with a known batch id.", "Show `event_id` and `batch_id`.", "Sort by `event_id`."], starterSql: starter, solutionSql: "SELECT event_id, batch_id\nFROM events\nWHERE batch_id IS NOT NULL\nORDER BY event_id;", orderSensitive: true },

  { title: "Return all customer names sorted alphabetically", difficulty: "easy", objective: "Separate ordering from storage order.", instructions: ["Return `customer_name` from `customers`.", "Sort alphabetically."], starterSql: starter, solutionSql: "SELECT customer_name\nFROM customers\nORDER BY customer_name;", orderSensitive: true },
  { title: "Return all order dates newest to oldest", difficulty: "easy", objective: "Sort a single date column.", instructions: ["Return `order_id` and `order_date` from `orders`.", "Sort by `order_date` descending."], starterSql: starter, solutionSql: "SELECT order_id, order_date\nFROM orders\nORDER BY order_date DESC, order_id DESC;", orderSensitive: true },
  { title: "Return all product categories with price descending inside category", difficulty: "medium", objective: "Use text then numeric ordering.", instructions: ["Return `category`, `product_name`, and `price` from `products`.", "Sort by `category` ascending and `price` descending."], starterSql: starter, solutionSql: "SELECT category, product_name, price\nFROM products\nORDER BY category, price DESC, product_id;", orderSensitive: true },
  { title: "Return all employee names with hire dates newest first", difficulty: "easy", objective: "Sort a roster by hire recency.", instructions: ["Return `employee_name` and `hire_date` from `employees`.", "Sort by `hire_date` descending."], starterSql: starter, solutionSql: "SELECT employee_name, hire_date\nFROM employees\nORDER BY hire_date DESC, employee_id DESC;", orderSensitive: true },
  { title: "Return all appointment statuses newest first", difficulty: "easy", objective: "Sort dates while projecting status.", instructions: ["Return `appointment_id`, `status`, and `appointment_date` from `appointments`.", "Sort by `appointment_date` descending."], starterSql: starter, solutionSql: "SELECT appointment_id, status, appointment_date\nFROM appointments\nORDER BY appointment_date DESC, appointment_id DESC;", orderSensitive: true },
  { title: "Return all gateways with captured payments only", difficulty: "easy", objective: "Combine projection and filtering on payment state.", instructions: ["Return `payment_id`, `gateway`, and `payment_status` for captured payments.", "Sort by `gateway` and then `payment_id`."], starterSql: starter, solutionSql: "SELECT payment_id, gateway, payment_status\nFROM payments\nWHERE payment_status = 'captured'\nORDER BY gateway, payment_id;", orderSensitive: true },
  { title: "Return all east and west warehouse shipments", difficulty: "medium", objective: "Use IN on warehouses.", instructions: ["Return shipments from east or west warehouses.", "Show `shipment_id`, `warehouse`, and `carrier`.", "Sort by `warehouse` and `shipment_id`."], starterSql: starter, solutionSql: "SELECT shipment_id, warehouse, carrier\nFROM shipments\nWHERE warehouse IN ('east', 'west')\nORDER BY warehouse, shipment_id;", orderSensitive: true },
  { title: "Return all medium severity events", difficulty: "easy", objective: "Filter by another severity value.", instructions: ["Return `event_id`, `severity`, and `source_system` for medium severity events.", "Sort by `event_id`."], starterSql: starter, solutionSql: "SELECT event_id, severity, source_system\nFROM events\nWHERE severity = 'medium'\nORDER BY event_id;", orderSensitive: true },
  { title: "Return products with analytics or collaboration categories", difficulty: "medium", objective: "Use IN across two non-hardware categories.", instructions: ["Return products in analytics or collaboration categories.", "Show `product_id`, `product_name`, and `category`.", "Sort by `category` then `product_id`."], starterSql: starter, solutionSql: "SELECT product_id, product_name, category\nFROM products\nWHERE category IN ('Analytics', 'Collaboration')\nORDER BY category, product_id;", orderSensitive: true },
  { title: "Return all support employees sorted by salary descending", difficulty: "medium", objective: "Filter then sort within a department.", instructions: ["Return support employees only.", "Show `employee_id`, `employee_name`, and `salary`.", "Sort by `salary` descending."], starterSql: starter, solutionSql: "SELECT employee_id, employee_name, salary\nFROM employees\nWHERE department = 'Support'\nORDER BY salary DESC, employee_id;", orderSensitive: true },

  { title: "Return customers with email labels using COALESCE", difficulty: "medium", objective: "Turn nullable email into a visible fallback.", instructions: ["Return `customer_name` and `COALESCE(email, 'missing_email')` as `email_label` from `customers`.", "Sort by `customer_id`."], starterSql: starter, solutionSql: "SELECT customer_name, COALESCE(email, 'missing_email') AS email_label\nFROM customers\nORDER BY customer_id;", orderSensitive: true },
  { title: "Return shipment delivery labels", difficulty: "medium", objective: "Expose null delivery dates with fallback text.", instructions: ["Return `shipment_id` and `COALESCE(delivered_date, 'not_delivered')` as `delivery_label` from `shipments`.", "Sort by `shipment_id`."], starterSql: starter, solutionSql: "SELECT shipment_id, COALESCE(delivered_date, 'not_delivered') AS delivery_label\nFROM shipments\nORDER BY shipment_id;", orderSensitive: true },
  { title: "Return payment refund labels", difficulty: "medium", objective: "Show a fallback for missing refund values.", instructions: ["Return `payment_id` and `COALESCE(refund_amount, 0)` as `refund_value` from `payments`.", "Sort by `payment_id`."], starterSql: starter, solutionSql: "SELECT payment_id, COALESCE(refund_amount, 0) AS refund_value\nFROM payments\nORDER BY payment_id;", orderSensitive: true },
  { title: "Return event batch labels", difficulty: "medium", objective: "Show a fallback when batch metadata is missing.", instructions: ["Return `event_id` and `COALESCE(batch_id, 'missing_batch')` as `batch_label` from `events`.", "Sort by `event_id`."], starterSql: starter, solutionSql: "SELECT event_id, COALESCE(batch_id, 'missing_batch') AS batch_label\nFROM events\nORDER BY event_id;", orderSensitive: true },
  { title: "Return all orders sorted by status then amount descending", difficulty: "medium", objective: "Combine text ordering and numeric tie-breaks.", instructions: ["Return `order_id`, `status`, and `amount` from `orders`.", "Sort by `status` ascending and `amount` descending."], starterSql: starter, solutionSql: "SELECT order_id, status, amount\nFROM orders\nORDER BY status, amount DESC, order_id;", orderSensitive: true },
  { title: "Return captured or refunded payments ordered by newest first", difficulty: "medium", objective: "Use IN with descending timestamp order.", instructions: ["Return payments that are captured or refunded.", "Show `payment_id`, `payment_status`, and `processed_at`.", "Sort by `processed_at` descending."], starterSql: starter, solutionSql: "SELECT payment_id, payment_status, processed_at\nFROM payments\nWHERE payment_status IN ('captured', 'refunded')\nORDER BY processed_at DESC, payment_id DESC;", orderSensitive: true },
  { title: "Return appointments between April 5 and April 17", difficulty: "medium", objective: "Use BETWEEN on an ISO date range.", instructions: ["Return appointments between `2026-04-05` and `2026-04-17` inclusive.", "Show `appointment_id`, `patient_name`, and `appointment_date`.", "Sort by `appointment_date`."], starterSql: starter, solutionSql: "SELECT appointment_id, patient_name, appointment_date\nFROM appointments\nWHERE appointment_date BETWEEN '2026-04-05' AND '2026-04-17'\nORDER BY appointment_date, appointment_id;", orderSensitive: true },
  { title: "Return employee names containing o", difficulty: "medium", objective: "Use a contains pattern on another table.", instructions: ["Return `employee_id` and `employee_name` for employees whose name contains `o`.", "Sort by `employee_id`."], starterSql: starter, solutionSql: "SELECT employee_id, employee_name\nFROM employees\nWHERE employee_name LIKE '%o%'\nORDER BY employee_id;", orderSensitive: true },
  { title: "Return product names starting with C", difficulty: "medium", objective: "Use a prefix LIKE match on the catalog.", instructions: ["Return `product_id` and `product_name` for products whose name starts with `C`.", "Sort by `product_id`."], starterSql: starter, solutionSql: "SELECT product_id, product_name\nFROM products\nWHERE product_name LIKE 'C%'\nORDER BY product_id;", orderSensitive: true },
  { title: "Return orders with card payments above 150", difficulty: "medium", objective: "Combine text and numeric filters on orders.", instructions: ["Return orders paid by card with amount above 150.", "Show `order_id`, `payment_method`, and `amount`.", "Sort by `amount` descending."], starterSql: starter, solutionSql: "SELECT order_id, payment_method, amount\nFROM orders\nWHERE payment_method = 'card'\n  AND amount > 150\nORDER BY amount DESC, order_id;", orderSensitive: true },

  { title: "Return the newest three captured payments over 80", difficulty: "medium", objective: "Practice a compact production-style filter.", instructions: ["Return captured payments over 80.", "Show `payment_id`, `payment_amount`, and `processed_at`.", "Sort by `processed_at` descending and limit to 3 rows."], starterSql: starter, solutionSql: "SELECT payment_id, payment_amount, processed_at\nFROM payments\nWHERE payment_status = 'captured'\n  AND payment_amount > 80\nORDER BY processed_at DESC, payment_id DESC\nLIMIT 3;", orderSensitive: true },
  { title: "Return the first three non-manager salaries alphabetically", difficulty: "medium", objective: "Mix boolean filtering, ordering, and limiting.", instructions: ["Return non-manager employees only.", "Show `employee_name` and `salary`.", "Sort by `employee_name` ascending and limit to 3 rows."], starterSql: starter, solutionSql: "SELECT employee_name, salary\nFROM employees\nWHERE is_manager = 0\nORDER BY employee_name\nLIMIT 3;", orderSensitive: true },
  { title: "Return the latest two scheduled appointments with follow-up", difficulty: "medium", objective: "Combine three simple conditions.", instructions: ["Return scheduled appointments requiring follow-up.", "Show `appointment_id`, `patient_name`, and `appointment_date`.", "Sort by `appointment_date` descending and limit to 2 rows."], starterSql: starter, solutionSql: "SELECT appointment_id, patient_name, appointment_date\nFROM appointments\nWHERE status = 'scheduled'\n  AND follow_up_required = 1\nORDER BY appointment_date DESC, appointment_id DESC\nLIMIT 2;", orderSensitive: true },
  { title: "Return the two most recent east-warehouse shipments", difficulty: "medium", objective: "Use warehouse filtering with descending dates.", instructions: ["Return east warehouse shipments only.", "Show `shipment_id`, `warehouse`, and `shipped_date`.", "Sort by `shipped_date` descending and limit to 2 rows."], starterSql: starter, solutionSql: "SELECT shipment_id, warehouse, shipped_date\nFROM shipments\nWHERE warehouse = 'east'\nORDER BY shipped_date DESC, shipment_id DESC\nLIMIT 2;", orderSensitive: true },
  { title: "Return the two biggest non-critical payloads", difficulty: "medium", objective: "Exclude one severity and sort by payload size.", instructions: ["Return events that are not critical.", "Show `event_id`, `severity`, and `payload_size`.", "Sort by `payload_size` descending and limit to 2 rows."], starterSql: starter, solutionSql: "SELECT event_id, severity, payload_size\nFROM events\nWHERE severity <> 'critical'\nORDER BY payload_size DESC, event_id DESC\nLIMIT 2;", orderSensitive: true },
  { title: "Return the three cheapest hardware or collaboration products", difficulty: "medium", objective: "Use IN, ordering, and limit together.", instructions: ["Return hardware or collaboration products only.", "Show `product_id`, `product_name`, `category`, and `price`.", "Sort by `price` ascending and limit to 3 rows."], starterSql: starter, solutionSql: "SELECT product_id, product_name, category, price\nFROM products\nWHERE category IN ('Hardware', 'Collaboration')\nORDER BY price, product_id\nLIMIT 3;", orderSensitive: true },
  { title: "Return the latest three active customer signups", difficulty: "medium", objective: "Use a boolean filter with descending date order.", instructions: ["Return active customers only.", "Show `customer_id`, `customer_name`, and `signup_date`.", "Sort by `signup_date` descending and limit to 3 rows."], starterSql: starter, solutionSql: "SELECT customer_id, customer_name, signup_date\nFROM customers\nWHERE is_active = 1\nORDER BY signup_date DESC, customer_id DESC\nLIMIT 3;", orderSensitive: true },
  { title: "Return the two highest-fee completed appointments", difficulty: "medium", objective: "Use status filtering with descending numeric sort.", instructions: ["Return completed appointments only.", "Show `appointment_id`, `patient_name`, and `fee`.", "Sort by `fee` descending and limit to 2 rows."], starterSql: starter, solutionSql: "SELECT appointment_id, patient_name, fee\nFROM appointments\nWHERE status = 'completed'\nORDER BY fee DESC, appointment_id\nLIMIT 2;", orderSensitive: true },
  { title: "Return the latest two delivered shipments", difficulty: "medium", objective: "Use a status filter and descending ship date.", instructions: ["Return delivered shipments only.", "Show `shipment_id`, `carrier`, and `shipped_date`.", "Sort by `shipped_date` descending and limit to 2 rows."], starterSql: starter, solutionSql: "SELECT shipment_id, carrier, shipped_date\nFROM shipments\nWHERE shipment_status = 'delivered'\nORDER BY shipped_date DESC, shipment_id DESC\nLIMIT 2;", orderSensitive: true },
  { title: "Week 1 grand review", difficulty: "medium", objective: "Finish the week with a broad but still single-table challenge.", instructions: ["Return the 4 newest non-failed payments processed by Stripe or PayPal.", "Show `payment_id`, `gateway`, `payment_status`, `payment_amount`, and `processed_at`.", "Sort by `processed_at` descending."], starterSql: starter, solutionSql: "SELECT payment_id, gateway, payment_status, payment_amount, processed_at\nFROM payments\nWHERE payment_status <> 'failed'\n  AND gateway IN ('stripe', 'paypal')\nORDER BY processed_at DESC, payment_id DESC\nLIMIT 4;", orderSensitive: true },
];

export const sqlWeekOneTasks: SqlTaskDefinition[] = [...baseSeeds, ...generatedSeeds]
  .slice(0, 125)
  .map((seed, index) => makeTask(index + 1, seed));

export const sqlWeekOneUnlockMessage =
  "Complete all 125 Week 1 tasks with correct answers to unlock Week 2.";
