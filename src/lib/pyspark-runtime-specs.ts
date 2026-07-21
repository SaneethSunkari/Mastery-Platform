import "server-only";

import {
  PYSPARK_RUNTIME_QUESTION_IDS,
  type PysparkRuntimeSpec,
} from "@/lib/pyspark-runtime-contract";

const orders = [
  { order_id: 1, customer_id: 101, status: "paid", amount: 12.5 },
  { order_id: 2, customer_id: 102, status: "pending", amount: -8.0 },
  { order_id: 3, customer_id: 101, status: "completed", amount: 21.75 },
];

const customers = [
  { customer_id: 101, customer_name: "Ana", country: "US" },
  { customer_id: 102, customer_name: "Ben", country: "IN" },
  { customer_id: 103, customer_name: "Cy", country: null },
];

type RuntimeTemplate = Omit<PysparkRuntimeSpec, "questionId" | "fixture">;

const templatesByQuestionId: Record<string, RuntimeTemplate> = {
  "pyspark-q-0026": {
    expectedColumns: ["customer_id", "status"],
    expectedRows: [
      { customer_id: 101, status: "paid" },
      { customer_id: 102, status: "pending" },
      { customer_id: 101, status: "completed" },
    ],
  },
  "pyspark-q-0027": {
    expectedColumns: ["order_amount"],
    expectedRows: [{ order_amount: 12.5 }, { order_amount: -8 }, { order_amount: 21.75 }],
  },
  "pyspark-q-0028": {
    expectedColumns: ["customer_country"],
    expectedRows: [
      { customer_country: "US" },
      { customer_country: "IN" },
      { customer_country: null },
    ],
  },
  "pyspark-q-0029": {
    expectedColumns: ["order_id"],
    expectedRows: [{ order_id: 1 }, { order_id: 2 }, { order_id: 3 }],
  },
  "pyspark-q-0046": {
    expectedColumns: ["customer_id"],
    expectedRows: [{ customer_id: 101 }, { customer_id: 102 }, { customer_id: 101 }],
  },
  "pyspark-q-0047": {
    expectedColumns: ["order_id", "status", "amount"],
    expectedRows: [
      { order_id: 1, status: "paid", amount: 12.5 },
      { order_id: 2, status: "pending", amount: -8 },
      { order_id: 3, status: "completed", amount: 21.75 },
    ],
  },
  "pyspark-q-0048": {
    expectedColumns: ["name"],
    expectedRows: [{ name: "Ana" }, { name: "Ben" }, { name: "Cy" }],
  },
  "pyspark-q-0049": {
    expectedColumns: ["order_id", "customer_id", "status", "amount"],
    expectedRows: [{ order_id: 1, customer_id: 101, status: "paid", amount: 12.5 }],
  },
  "pyspark-q-0050": {
    expectedColumns: ["order_id", "customer_id", "status", "amount"],
    expectedRows: [
      { order_id: 1, customer_id: 101, status: "paid", amount: 12.5 },
      { order_id: 3, customer_id: 101, status: "completed", amount: 21.75 },
    ],
  },
};

export function getPysparkRuntimeSpec(questionId: string): PysparkRuntimeSpec | null {
  const template = templatesByQuestionId[questionId];

  if (!template) return null;

  return {
    questionId,
    fixture: { orders, customers },
    ...template,
  };
}

export function getPysparkRuntimeQuestionIds() {
  return [...PYSPARK_RUNTIME_QUESTION_IDS];
}
