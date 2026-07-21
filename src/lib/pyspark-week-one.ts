import { LessonSeed } from "@/lib/types";

export interface PysparkWeekOneRequirement {
  label: string;
  anyOf: string[];
}

export interface PysparkWeekOneExerciseSeed {
  title: string;
  summary: string;
  tags: string[];
  topic: string;
  difficulty: "easy" | "medium";
  questionType:
    | "write-code"
    | "predict-output"
    | "complete-code"
    | "repair-code"
    | "edge-case"
    | "refactor";
  prompt: string;
  starterCode: string;
  referenceSolution: string;
  validationKind: "structural" | "conceptual";
  requirements: PysparkWeekOneRequirement[];
  hiddenRequirements: PysparkWeekOneRequirement[];
  forbiddenPatterns?: string[];
  acceptedAnswers?: string[];
  resultExpectation: string;
}

type StructuralQuestionConfig = Omit<
  PysparkWeekOneExerciseSeed,
  "validationKind" | "acceptedAnswers"
>;

type ConceptualQuestionConfig = Omit<
  PysparkWeekOneExerciseSeed,
  "validationKind" | "requirements" | "hiddenRequirements" | "forbiddenPatterns"
> & {
  acceptedAnswers: string[];
};

const conceptualStarter = '# assign your response to `answer`\nanswer = ""\n';

function starterFor(baseFrame = "orders_df") {
  return [
    "from pyspark.sql import functions as F",
    "from pyspark.sql import Window",
    "",
    "# write your PySpark code below",
    `result = ${baseFrame}`,
  ].join("\n");
}

function answerSeed(config: ConceptualQuestionConfig): PysparkWeekOneExerciseSeed {
  return {
    ...config,
    starterCode: config.starterCode || conceptualStarter,
    referenceSolution: config.referenceSolution,
    validationKind: "conceptual",
    requirements: [
      {
        label: "assign your response to `answer`",
        anyOf: ["answer ="],
      },
    ],
    hiddenRequirements: [],
  };
}

function structuralSeed(config: StructuralQuestionConfig): PysparkWeekOneExerciseSeed {
  return {
    ...config,
    validationKind: "structural",
  };
}

const foundations = [
  answerSeed({
    title: "Why distributed processing exists",
    summary: "Explain Spark's purpose in one sentence before touching transformations.",
    tags: ["foundations", "architecture"],
    topic: "distributed purpose",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` explaining why Spark exists for data engineering workloads.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "Spark distributes large-scale data processing across many machines."\n',
    acceptedAnswers: [
      "spark distributes large-scale data processing across many machines",
      "spark processes large datasets in parallel across a cluster",
    ],
    resultExpectation: "A short explanation of distributed processing purpose.",
  }),
  answerSeed({
    title: "Driver responsibility",
    summary: "Pin down what the driver does so later debugging has the right mental model.",
    tags: ["foundations", "driver"],
    topic: "driver",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` describing the main responsibility of the Spark driver.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "The driver builds the plan, coordinates execution, and receives results."\n',
    acceptedAnswers: [
      "the driver builds the plan, coordinates execution, and receives results",
      "the driver coordinates jobs and creates the execution plan",
    ],
    resultExpectation: "A correct explanation of the driver's job.",
  }),
  answerSeed({
    title: "Executor responsibility",
    summary: "State what executors actually do with partitions and tasks.",
    tags: ["foundations", "executors"],
    topic: "executors",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` describing what Spark executors do.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "Executors run tasks on partitions and hold data in memory for computation."\n',
    acceptedAnswers: [
      "executors run tasks on partitions and hold data in memory for computation",
      "executors execute tasks on worker nodes",
    ],
    resultExpectation: "A correct explanation of executor behavior.",
  }),
  answerSeed({
    title: "Cluster manager role",
    summary: "Clarify how resources are allocated before running jobs.",
    tags: ["foundations", "cluster-manager"],
    topic: "cluster manager",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` describing what the cluster manager is responsible for.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "The cluster manager allocates resources and launches executors for Spark applications."\n',
    acceptedAnswers: [
      "the cluster manager allocates resources and launches executors for spark applications",
      "the cluster manager provides and manages cluster resources",
    ],
    resultExpectation: "A correct explanation of cluster management.",
  }),
  answerSeed({
    title: "What a job means",
    summary: "Connect actions to job creation in a single clear statement.",
    tags: ["foundations", "jobs"],
    topic: "jobs",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` defining a Spark job.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "A Spark job is the work started by one action on a DataFrame or RDD lineage."\n',
    acceptedAnswers: [
      "a spark job is the work started by one action on a dataframe or rdd lineage",
      "one action triggers one spark job",
    ],
    resultExpectation: "A correct definition of a Spark job.",
  }),
  answerSeed({
    title: "What a stage means",
    summary: "Name the shuffle boundary concept early so later plans make sense.",
    tags: ["foundations", "stages"],
    topic: "stages",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` defining a Spark stage.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "A stage is a group of tasks that can run together before the next shuffle boundary."\n',
    acceptedAnswers: [
      "a stage is a group of tasks that can run together before the next shuffle boundary",
      "a stage is a set of parallel tasks separated by shuffle boundaries",
    ],
    resultExpectation: "A correct definition of a stage.",
  }),
  answerSeed({
    title: "What a task means",
    summary: "Anchor the smallest execution unit to one data partition.",
    tags: ["foundations", "tasks"],
    topic: "tasks",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` defining a Spark task.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "A task is the smallest unit of execution and usually processes one partition."\n',
    acceptedAnswers: [
      "a task is the smallest unit of execution and usually processes one partition",
      "a spark task works on one partition",
    ],
    resultExpectation: "A correct definition of a task.",
  }),
  answerSeed({
    title: "Why partitions matter",
    summary: "Tie data partitioning back to parallel work instead of memorizing the word.",
    tags: ["foundations", "partitions"],
    topic: "partitions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` explaining why partitions matter in Spark.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "Partitions let Spark process slices of data in parallel across executors."\n',
    acceptedAnswers: [
      "partitions let spark process slices of data in parallel across executors",
      "partitions make parallel processing possible",
    ],
    resultExpectation: "A correct explanation of partitions.",
  }),
  answerSeed({
    title: "What lazy evaluation means",
    summary: "State the planning-first behavior clearly before actions and debugging tasks.",
    tags: ["foundations", "lazy-evaluation"],
    topic: "lazy evaluation",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` explaining lazy evaluation in Spark.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "Spark transformations build a plan first and run only when an action is called."\n',
    acceptedAnswers: [
      "spark transformations build a plan first and run only when an action is called",
      "transformations are lazy until an action triggers execution",
    ],
    resultExpectation: "A correct explanation of lazy evaluation.",
  }),
  answerSeed({
    title: "What triggers execution",
    summary: "Connect the word action to actual cluster work.",
    tags: ["foundations", "actions"],
    topic: "actions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` describing what triggers Spark execution.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "An action such as count, collect, or show triggers Spark execution."\n',
    acceptedAnswers: [
      "an action such as count, collect, or show triggers spark execution",
      "actions trigger execution",
    ],
    resultExpectation: "A correct statement about Spark actions.",
  }),
  answerSeed({
    title: "Why immutability matters",
    summary: "Explain why transforms produce new DataFrames rather than editing the old one.",
    tags: ["foundations", "immutability"],
    topic: "immutability",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` explaining immutability in Spark DataFrames.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "Spark transformations return new DataFrames instead of mutating the original one."\n',
    acceptedAnswers: [
      "spark transformations return new dataframes instead of mutating the original one",
      "dataframes are immutable and transforms create a new dataframe",
    ],
    resultExpectation: "A correct explanation of immutability.",
  }),
  answerSeed({
    title: "Why collect can be dangerous",
    summary: "Teach the main driver-memory trap before it becomes a habit.",
    tags: ["foundations", "collect"],
    topic: "collect danger",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` explaining why `collect()` can be dangerous on large datasets.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "collect() moves all rows to the driver, which can overwhelm driver memory."\n',
    acceptedAnswers: [
      "collect() moves all rows to the driver, which can overwhelm driver memory",
      "collect brings all data to the driver and can cause memory problems",
    ],
    resultExpectation: "A correct warning about collect().",
  }),
  answerSeed({
    title: "Why show is safer than collect for a preview",
    summary: "Separate a quick preview from a full-data pull.",
    tags: ["foundations", "show"],
    topic: "preview actions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` explaining why `show()` is safer than `collect()` for a quick preview.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "show() previews only a few rows instead of pulling the whole dataset to the driver."\n',
    acceptedAnswers: [
      "show() previews only a few rows instead of pulling the whole dataset to the driver",
      "show is safer because it displays a sample instead of all rows",
    ],
    resultExpectation: "A correct preview explanation.",
  }),
  answerSeed({
    title: "Driver memory versus executor memory",
    summary: "Differentiate where local results live and where distributed work happens.",
    tags: ["foundations", "memory"],
    topic: "memory roles",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` contrasting driver memory and executor memory in Spark.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "Driver memory holds coordination and collected results, while executor memory is used for distributed task processing."\n',
    acceptedAnswers: [
      "driver memory holds coordination and collected results, while executor memory is used for distributed task processing",
      "driver memory is local to the coordinator and executor memory supports distributed tasks",
    ],
    resultExpectation: "A correct contrast between driver and executor memory.",
  }),
  answerSeed({
    title: "Why many small tasks can scale",
    summary: "Tie partitions and task units back to cluster parallelism.",
    tags: ["foundations", "scaling"],
    topic: "parallel scaling",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` explaining why many small tasks can help Spark scale.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "Many tasks let Spark schedule work across multiple executors in parallel."\n',
    acceptedAnswers: [
      "many tasks let spark schedule work across multiple executors in parallel",
      "more parallel tasks help the cluster use many executors at once",
    ],
    resultExpectation: "A correct scaling explanation.",
  }),
] as const;

const sessionAndSchema = [
  structuralSeed({
    title: "Create a SparkSession builder",
    summary: "Practice the standard entry point for a PySpark application.",
    tags: ["spark-session", "builder"],
    topic: "SparkSession",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that creates a `SparkSession` named `week1_app` and assigns it to `spark`.",
    starterCode: [
      "from pyspark.sql import SparkSession",
      "",
      "# create the session below",
    ].join("\n"),
    referenceSolution:
      'from pyspark.sql import SparkSession\n\nspark = SparkSession.builder.appName("week1_app").getOrCreate()\n',
    requirements: [
      { label: "session assignment", anyOf: ["spark ="] },
      { label: "builder usage", anyOf: ["SparkSession.builder"] },
      { label: "app name", anyOf: ['appName("week1_app")', "appName('week1_app')"] },
    ],
    hiddenRequirements: [{ label: "session creation", anyOf: [".getOrCreate("] }],
    resultExpectation: "A SparkSession assigned to `spark`.",
  }),
  answerSeed({
    title: "What SparkSession represents",
    summary: "Name the entry point clearly before chaining reads and writes.",
    tags: ["spark-session", "mental-model"],
    topic: "SparkSession meaning",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Assign a short sentence to `answer` describing what a `SparkSession` represents.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "SparkSession is the main entry point for reading data and working with DataFrames in Spark."\n',
    acceptedAnswers: [
      "sparksession is the main entry point for reading data and working with dataframes in spark",
      "sparksession is the entry point to spark dataframe work",
    ],
    resultExpectation: "A correct SparkSession description.",
  }),
  answerSeed({
    title: "What a DataFrame represents",
    summary: "Connect the word DataFrame to rows, columns, and schema.",
    tags: ["dataframe", "mental-model"],
    topic: "DataFrames",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Assign a short sentence to `answer` describing what a Spark DataFrame represents.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "A Spark DataFrame is a distributed table with named columns and a schema."\n',
    acceptedAnswers: [
      "a spark dataframe is a distributed table with named columns and a schema",
      "a dataframe is distributed tabular data with columns and schema",
    ],
    resultExpectation: "A correct DataFrame definition.",
  }),
  answerSeed({
    title: "What a Row represents",
    summary: "Name the row-level unit clearly before collect and debugging exercises.",
    tags: ["rows", "mental-model"],
    topic: "Rows",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Assign a short sentence to `answer` describing what a Spark Row represents.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "A Row is one record inside a Spark DataFrame."\n',
    acceptedAnswers: [
      "a row is one record inside a spark dataframe",
      "a row is a single dataframe record",
    ],
    resultExpectation: "A correct Row definition.",
  }),
  answerSeed({
    title: "What a column expression represents",
    summary: "Clarify that Spark columns are expressions, not plain Python values.",
    tags: ["columns", "expressions"],
    topic: "Column expressions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` describing what a Spark column expression represents.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "A Spark column expression describes work to apply to a DataFrame column during execution."\n',
    acceptedAnswers: [
      "a spark column expression describes work to apply to a dataframe column during execution",
      "a column expression is deferred logic for a dataframe column",
    ],
    resultExpectation: "A correct column-expression explanation.",
  }),
  answerSeed({
    title: "What a schema represents",
    summary: "Tie schema to column names and data types.",
    tags: ["schema", "mental-model"],
    topic: "Schemas",
    difficulty: "easy",
    questionType: "write-code",
    prompt: "Assign a short sentence to `answer` describing what a Spark schema represents.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "A schema defines the column names and data types in a Spark DataFrame."\n',
    acceptedAnswers: [
      "a schema defines the column names and data types in a spark dataframe",
      "schema means dataframe column names plus types",
    ],
    resultExpectation: "A correct schema definition.",
  }),
  structuralSeed({
    title: "Define a simple order schema",
    summary: "Practice explicit schemas with basic field types.",
    tags: ["schema", "structtype"],
    topic: "explicit schemas",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that defines `schema` using `StructType` and `StructField` for `order_id` as `IntegerType` and `amount` as `DoubleType`.",
    starterCode: [
      "from pyspark.sql.types import StructType, StructField, IntegerType, DoubleType",
      "",
      "# define schema below",
      "schema = None",
    ].join("\n"),
    referenceSolution:
      "from pyspark.sql.types import StructType, StructField, IntegerType, DoubleType\n\nschema = StructType([\n    StructField('order_id', IntegerType(), True),\n    StructField('amount', DoubleType(), True),\n])\n",
    requirements: [
      { label: "schema assignment", anyOf: ["schema ="] },
      { label: "struct type", anyOf: ["StructType("] },
      { label: "order id field", anyOf: ["StructField('order_id'", 'StructField("order_id"'] },
      { label: "amount field", anyOf: ["StructField('amount'", 'StructField("amount"'] },
    ],
    hiddenRequirements: [
      { label: "integer type", anyOf: ["IntegerType("] },
      { label: "double type", anyOf: ["DoubleType("] },
    ],
    resultExpectation: "An explicit schema assigned to `schema`.",
  }),
  structuralSeed({
    title: "Define a customer schema with strings",
    summary: "Use `StringType` correctly for text fields.",
    tags: ["schema", "strings"],
    topic: "explicit schemas",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that defines `schema` with `customer_id` and `country` as `StringType` fields.",
    starterCode: [
      "from pyspark.sql.types import StructType, StructField, StringType",
      "",
      "schema = None",
    ].join("\n"),
    referenceSolution:
      "from pyspark.sql.types import StructType, StructField, StringType\n\nschema = StructType([\n    StructField('customer_id', StringType(), True),\n    StructField('country', StringType(), True),\n])\n",
    requirements: [
      { label: "schema assignment", anyOf: ["schema ="] },
      { label: "struct type", anyOf: ["StructType("] },
      { label: "customer id field", anyOf: ["customer_id"] },
      { label: "country field", anyOf: ["country"] },
    ],
    hiddenRequirements: [{ label: "string type", anyOf: ["StringType("] }],
    resultExpectation: "A two-column string schema assigned to `schema`.",
  }),
  answerSeed({
    title: "Why explicit schema helps",
    summary: "Explain why data engineers often prefer explicit types.",
    tags: ["schema", "reasoning"],
    topic: "explicit schema",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` explaining why an explicit schema can be better than inference.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "Explicit schemas make types predictable and reduce downstream surprises during reads."\n',
    acceptedAnswers: [
      "explicit schemas make types predictable and reduce downstream surprises during reads",
      "explicit schema helps by making column types predictable",
    ],
    resultExpectation: "A clear explicit-schema benefit.",
  }),
  answerSeed({
    title: "When inference can be acceptable",
    summary: "Recognize the simpler situations where inference is still fine.",
    tags: ["schema", "inference"],
    topic: "schema inference",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` describing when schema inference can be acceptable.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "Schema inference can be acceptable for quick exploration on small, well-behaved data."\n',
    acceptedAnswers: [
      "schema inference can be acceptable for quick exploration on small, well-behaved data",
      "inference is okay for simple exploration on clean sample data",
    ],
    resultExpectation: "A balanced statement about inference.",
  }),
  structuralSeed({
    title: "Select two fields from orders",
    summary: "Project only the fields the downstream step needs.",
    tags: ["dataframes", "select"],
    topic: "select",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that selects `customer_id` and `status` from `orders_df` and assigns the result to `result`.",
    starterCode: starterFor(),
    referenceSolution:
      "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.select('customer_id', 'status')\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "projection", anyOf: [".select("] },
      { label: "customer id", anyOf: ["customer_id"] },
      { label: "status", anyOf: ["status"] },
    ],
    hiddenRequirements: [{ label: "orders dataframe", anyOf: ["orders_df"] }],
    resultExpectation: "A DataFrame with only customer_id and status.",
  }),
  structuralSeed({
    title: "Alias an amount column",
    summary: "Practice readable output naming with aliases.",
    tags: ["dataframes", "aliases"],
    topic: "aliases",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that selects `amount` from `orders_df` and aliases it to `order_amount` in `result`.",
    starterCode: starterFor(),
    referenceSolution:
      "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.select(F.col('amount').alias('order_amount'))\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "select", anyOf: [".select("] },
      { label: "alias", anyOf: [".alias("] },
      { label: "order amount name", anyOf: ["order_amount"] },
    ],
    hiddenRequirements: [{ label: "amount column", anyOf: ["amount"] }],
    resultExpectation: "A DataFrame with amount renamed to order_amount.",
  }),
  structuralSeed({
    title: "Rename a country column for reporting",
    summary: "Use aliasing to produce business-readable output.",
    tags: ["dataframes", "aliases"],
    topic: "aliases",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that selects `country` from `customers_df` and aliases it to `customer_country` in `result`.",
    starterCode: starterFor("customers_df"),
    referenceSolution:
      "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = customers_df.select(F.col('country').alias('customer_country'))\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "select", anyOf: [".select("] },
      { label: "alias", anyOf: [".alias("] },
      { label: "customer country alias", anyOf: ["customer_country"] },
    ],
    hiddenRequirements: [{ label: "customers dataframe", anyOf: ["customers_df"] }],
    resultExpectation: "A DataFrame with country renamed to customer_country.",
  }),
  structuralSeed({
    title: "Project with `col()` expressions",
    summary: "Use column expressions instead of plain Python values.",
    tags: ["columns", "col"],
    topic: "column expressions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that selects `order_id` from `orders_df` using `F.col(...)` and assigns the result to `result`.",
    starterCode: starterFor(),
    referenceSolution:
      "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.select(F.col('order_id'))\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "select", anyOf: [".select("] },
      { label: "column expression", anyOf: ["F.col("] },
      { label: "order id", anyOf: ["order_id"] },
    ],
    hiddenRequirements: [{ label: "orders dataframe", anyOf: ["orders_df"] }],
    resultExpectation: "A DataFrame selected through `F.col`.",
  }),
  structuralSeed({
    title: "Print a schema preview",
    summary: "Use schema inspection before transforming unknown data.",
    tags: ["schema", "inspection"],
    topic: "printSchema",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that inspects `orders_df` by calling `printSchema()`.",
    starterCode: [
      "from pyspark.sql import functions as F",
      "from pyspark.sql import Window",
      "",
      "# inspect the schema below",
    ].join("\n"),
    referenceSolution:
      "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\norders_df.printSchema()\n",
    requirements: [
      { label: "orders dataframe", anyOf: ["orders_df"] },
      { label: "schema inspection", anyOf: [".printSchema("] },
    ],
    hiddenRequirements: [],
    resultExpectation: "A schema inspection call on orders_df.",
  }),
] as const;

const readingInputs = [
  structuralSeed({
    title: "Read a CSV with a header",
    summary: "Use the common CSV reader options directly.",
    tags: ["reads", "csv"],
    topic: "reading csv",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that reads `/tmp/orders.csv` as `orders_df` with `header=True`.",
    starterCode: [
      "from pyspark.sql import SparkSession",
      "",
      "# assume spark already exists",
      "orders_df = None",
    ].join("\n"),
    referenceSolution:
      "from pyspark.sql import SparkSession\n\norders_df = spark.read.option('header', True).csv('/tmp/orders.csv')\n",
    requirements: [
      { label: "orders assignment", anyOf: ["orders_df ="] },
      { label: "csv reader", anyOf: [".csv("] },
      { label: "header option", anyOf: [".option('header', True)", '.option("header", True)'] },
    ],
    hiddenRequirements: [{ label: "orders path", anyOf: ["/tmp/orders.csv"] }],
    resultExpectation: "A CSV DataFrame read with headers enabled.",
  }),
  structuralSeed({
    title: "Read a CSV with inferred types",
    summary: "Turn on inference when the exercise asks for it explicitly.",
    tags: ["reads", "csv"],
    topic: "reading csv",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that reads `/tmp/orders.csv` as `orders_df` with `header=True` and `inferSchema=True`.",
    starterCode: [
      "orders_df = None",
    ].join("\n"),
    referenceSolution:
      "orders_df = spark.read.option('header', True).option('inferSchema', True).csv('/tmp/orders.csv')\n",
    requirements: [
      { label: "orders assignment", anyOf: ["orders_df ="] },
      { label: "csv reader", anyOf: [".csv("] },
      { label: "header option", anyOf: ["header", "option('header'"] },
      { label: "infer schema", anyOf: ["inferSchema", "option('inferSchema'"] },
    ],
    hiddenRequirements: [{ label: "orders path", anyOf: ["/tmp/orders.csv"] }],
    resultExpectation: "A CSV DataFrame with inferred schema.",
  }),
  structuralSeed({
    title: "Read a CSV with an explicit schema",
    summary: "Connect the read path to an already-defined schema variable.",
    tags: ["reads", "csv", "schema"],
    topic: "reading csv",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that reads `/tmp/orders.csv` using `schema` and assigns the DataFrame to `orders_df`.",
    starterCode: "orders_df = None\n",
    referenceSolution:
      "orders_df = spark.read.option('header', True).schema(schema).csv('/tmp/orders.csv')\n",
    requirements: [
      { label: "orders assignment", anyOf: ["orders_df ="] },
      { label: "schema usage", anyOf: [".schema("] },
      { label: "csv reader", anyOf: [".csv("] },
    ],
    hiddenRequirements: [{ label: "schema variable", anyOf: ["schema"] }],
    resultExpectation: "A CSV read that uses an explicit schema.",
  }),
  structuralSeed({
    title: "Read a pipe-delimited CSV",
    summary: "Handle a non-default delimiter explicitly.",
    tags: ["reads", "csv"],
    topic: "CSV options",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that reads `/tmp/orders_pipe.csv` with `header=True` and delimiter `|` into `orders_df`.",
    starterCode: "orders_df = None\n",
    referenceSolution:
      "orders_df = spark.read.option('header', True).option('sep', '|').csv('/tmp/orders_pipe.csv')\n",
    requirements: [
      { label: "orders assignment", anyOf: ["orders_df ="] },
      { label: "separator option", anyOf: ["option('sep', '|')", 'option("sep", "|")'] },
      { label: "csv reader", anyOf: [".csv("] },
    ],
    hiddenRequirements: [{ label: "pipe path", anyOf: ["/tmp/orders_pipe.csv"] }],
    resultExpectation: "A CSV read with a custom separator.",
  }),
  structuralSeed({
    title: "Read a CSV with malformed rows dropped",
    summary: "Use parse mode options deliberately.",
    tags: ["reads", "csv"],
    topic: "CSV options",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that reads `/tmp/orders.csv` with parse mode `DROPMALFORMED` into `orders_df`.",
    starterCode: "orders_df = None\n",
    referenceSolution:
      "orders_df = spark.read.option('header', True).option('mode', 'DROPMALFORMED').csv('/tmp/orders.csv')\n",
    requirements: [
      { label: "orders assignment", anyOf: ["orders_df ="] },
      { label: "mode option", anyOf: ["DROPMALFORMED"] },
      { label: "csv reader", anyOf: [".csv("] },
    ],
    hiddenRequirements: [{ label: "header option", anyOf: ["header"] }],
    resultExpectation: "A CSV read configured to drop malformed rows.",
  }),
  structuralSeed({
    title: "Read a JSON file",
    summary: "Use the JSON reader directly for semi-structured input.",
    tags: ["reads", "json"],
    topic: "reading json",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that reads `/tmp/events.json` into `events_df`.",
    starterCode: "events_df = None\n",
    referenceSolution:
      "events_df = spark.read.json('/tmp/events.json')\n",
    requirements: [
      { label: "events assignment", anyOf: ["events_df ="] },
      { label: "json reader", anyOf: [".json("] },
      { label: "events path", anyOf: ["/tmp/events.json"] },
    ],
    hiddenRequirements: [],
    resultExpectation: "A JSON DataFrame assigned to events_df.",
  }),
  structuralSeed({
    title: "Read multiline JSON",
    summary: "Handle a common JSON formatting option explicitly.",
    tags: ["reads", "json"],
    topic: "JSON options",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that reads `/tmp/events.json` with `multiLine=True` into `events_df`.",
    starterCode: "events_df = None\n",
    referenceSolution:
      "events_df = spark.read.option('multiLine', True).json('/tmp/events.json')\n",
    requirements: [
      { label: "events assignment", anyOf: ["events_df ="] },
      { label: "multiline option", anyOf: ["multiLine"] },
      { label: "json reader", anyOf: [".json("] },
    ],
    hiddenRequirements: [{ label: "events path", anyOf: ["/tmp/events.json"] }],
    resultExpectation: "A JSON DataFrame read with multiline enabled.",
  }),
  structuralSeed({
    title: "Read JSON with an explicit schema",
    summary: "Attach a schema to semi-structured input intentionally.",
    tags: ["reads", "json", "schema"],
    topic: "reading json",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that reads `/tmp/events.json` using `schema` into `events_df`.",
    starterCode: "events_df = None\n",
    referenceSolution:
      "events_df = spark.read.schema(schema).json('/tmp/events.json')\n",
    requirements: [
      { label: "events assignment", anyOf: ["events_df ="] },
      { label: "schema usage", anyOf: [".schema("] },
      { label: "json reader", anyOf: [".json("] },
    ],
    hiddenRequirements: [{ label: "schema variable", anyOf: ["schema"] }],
    resultExpectation: "A JSON DataFrame read with an explicit schema.",
  }),
  structuralSeed({
    title: "Read a Parquet dataset",
    summary: "Use the Parquet reader with its schema-preserving behavior.",
    tags: ["reads", "parquet"],
    topic: "reading parquet",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that reads `/tmp/orders_parquet` into `orders_df`.",
    starterCode: "orders_df = None\n",
    referenceSolution:
      "orders_df = spark.read.parquet('/tmp/orders_parquet')\n",
    requirements: [
      { label: "orders assignment", anyOf: ["orders_df ="] },
      { label: "parquet reader", anyOf: [".parquet("] },
      { label: "parquet path", anyOf: ["/tmp/orders_parquet"] },
    ],
    hiddenRequirements: [],
    resultExpectation: "A Parquet DataFrame assigned to orders_df.",
  }),
  answerSeed({
    title: "Why Parquet is useful",
    summary: "Explain the practical advantage of Parquet in beginner-friendly language.",
    tags: ["reads", "parquet"],
    topic: "parquet reasoning",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` explaining one reason Parquet is useful in data engineering.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "Parquet keeps schema information and supports efficient columnar reads."\n',
    acceptedAnswers: [
      "parquet keeps schema information and supports efficient columnar reads",
      "parquet is useful because it is columnar and preserves schema",
    ],
    resultExpectation: "A valid Parquet advantage.",
  }),
  structuralSeed({
    title: "Read CSV with header and select core fields",
    summary: "Chain a read and a narrow projection together.",
    tags: ["reads", "select"],
    topic: "reading csv",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that reads `/tmp/orders.csv` with `header=True`, then selects `order_id` and `amount` into `result`.",
    starterCode: "result = None\n",
    referenceSolution:
      "result = spark.read.option('header', True).csv('/tmp/orders.csv').select('order_id', 'amount')\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "csv reader", anyOf: [".csv("] },
      { label: "header option", anyOf: ["header"] },
      { label: "select", anyOf: [".select("] },
    ],
    hiddenRequirements: [{ label: "projected columns", anyOf: ["order_id", "amount"] }],
    resultExpectation: "A projected DataFrame coming directly from a CSV read.",
  }),
  structuralSeed({
    title: "Treat `NA` as null during CSV read",
    summary: "Use null value options intentionally at read time.",
    tags: ["reads", "csv", "nulls"],
    topic: "CSV options",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that reads `/tmp/customers.csv` and treats `NA` as null while assigning the DataFrame to `customers_df`.",
    starterCode: "customers_df = None\n",
    referenceSolution:
      "customers_df = spark.read.option('header', True).option('nullValue', 'NA').csv('/tmp/customers.csv')\n",
    requirements: [
      { label: "customers assignment", anyOf: ["customers_df ="] },
      { label: "null value option", anyOf: ["nullValue"] },
      { label: "csv reader", anyOf: [".csv("] },
    ],
    hiddenRequirements: [{ label: "NA token", anyOf: ["NA"] }],
    resultExpectation: "A CSV read that maps NA to null.",
  }),
  answerSeed({
    title: "Why wrong schema leads to nulls",
    summary: "Explain a common beginner surprise after bad type assumptions.",
    tags: ["reads", "schema"],
    topic: "read errors",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` explaining why a wrong schema can lead to null values during reads.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "If Spark cannot parse a value into the declared type, the read can produce nulls or malformed records."\n',
    acceptedAnswers: [
      "if spark cannot parse a value into the declared type, the read can produce nulls or malformed records",
      "wrong declared types can make spark parse values as null",
    ],
    resultExpectation: "A correct schema-error explanation.",
  }),
  answerSeed({
    title: "Why header handling matters",
    summary: "State the risk of forgetting header configuration on CSV data.",
    tags: ["reads", "csv"],
    topic: "read errors",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` explaining why forgetting the CSV header option can break downstream logic.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "Without the header option, the first data line can be treated as a row instead of column names."\n',
    acceptedAnswers: [
      "without the header option, the first data line can be treated as a row instead of column names",
      "missing the header option can turn headers into data rows",
    ],
    resultExpectation: "A correct header-handling explanation.",
  }),
  structuralSeed({
    title: "Read JSON and keep non-null ids",
    summary: "Practice a simple read-plus-filter flow.",
    tags: ["reads", "json", "filter"],
    topic: "reading json",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that reads `/tmp/events.json`, filters non-null `event_id`, and assigns the result to `result`.",
    starterCode: "result = None\n",
    referenceSolution:
      "result = spark.read.json('/tmp/events.json').filter(F.col('event_id').isNotNull())\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "json reader", anyOf: [".json("] },
      { label: "filter", anyOf: [".filter(", ".where("] },
      { label: "non-null check", anyOf: [".isNotNull("] },
    ],
    hiddenRequirements: [{ label: "event id", anyOf: ["event_id"] }],
    resultExpectation: "A filtered JSON DataFrame that keeps non-null event_id values.",
  }),
] as const;

const dataframeTransforms = [
  structuralSeed({
    title: "Select one column",
    summary: "Begin with the smallest possible projection.",
    tags: ["transforms", "select"],
    topic: "select",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that selects only `customer_id` from `orders_df` into `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.select('customer_id')\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "select", anyOf: [".select("] },
      { label: "customer id", anyOf: ["customer_id"] },
    ],
    hiddenRequirements: [{ label: "orders dataframe", anyOf: ["orders_df"] }],
    resultExpectation: "A one-column DataFrame of customer_id values.",
  }),
  structuralSeed({
    title: "Select multiple columns",
    summary: "Project exactly the needed business fields.",
    tags: ["transforms", "select"],
    topic: "select",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that selects `order_id`, `status`, and `amount` from `orders_df` into `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.select('order_id', 'status', 'amount')\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "select", anyOf: [".select("] },
      { label: "order id", anyOf: ["order_id"] },
      { label: "status and amount", anyOf: ["status", "amount"] },
    ],
    hiddenRequirements: [],
    resultExpectation: "A three-column projection from orders_df.",
  }),
  structuralSeed({
    title: "Select with alias",
    summary: "Rename one output field while projecting.",
    tags: ["transforms", "aliases"],
    topic: "aliases",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that selects `customer_name` from `customers_df` and aliases it to `name` in `result`.",
    starterCode: starterFor("customers_df"),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = customers_df.select(F.col('customer_name').alias('name'))\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "select", anyOf: [".select("] },
      { label: "alias", anyOf: [".alias("] },
      { label: "name alias", anyOf: ["name"] },
    ],
    hiddenRequirements: [{ label: "customer_name", anyOf: ["customer_name"] }],
    resultExpectation: "A projected DataFrame with customer_name renamed to name.",
  }),
  structuralSeed({
    title: "Filter paid rows",
    summary: "Use a simple equality predicate in a DataFrame filter.",
    tags: ["transforms", "filter"],
    topic: "filter",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that keeps only rows where `status` is `paid` from `orders_df` into `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.filter(F.col('status') == 'paid')\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "filter", anyOf: [".filter(", ".where("] },
      { label: "status column", anyOf: ["status"] },
      { label: "paid value", anyOf: ["paid"] },
    ],
    hiddenRequirements: [{ label: "column expression or string filter", anyOf: ["F.col(", "status ="] }],
    resultExpectation: "A DataFrame containing only paid rows.",
  }),
  structuralSeed({
    title: "Filter amount greater than zero",
    summary: "Use a basic numeric comparison predicate.",
    tags: ["transforms", "filter"],
    topic: "comparisons",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that keeps only rows where `amount > 0` from `orders_df` into `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.filter(F.col('amount') > 0)\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "filter", anyOf: [".filter(", ".where("] },
      { label: "amount comparison", anyOf: ["amount", "> 0"] },
    ],
    hiddenRequirements: [{ label: "column expression or SQL string", anyOf: ["F.col(", "amount > 0"] }],
    resultExpectation: "A DataFrame containing only positive amount rows.",
  }),
  structuralSeed({
    title: "Filter with two conditions",
    summary: "Combine status and country rules explicitly.",
    tags: ["transforms", "filter"],
    topic: "combined conditions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that keeps only rows from `customers_df` where `is_active` is true and `country` is `US`, assigning the result to `result`.",
    starterCode: starterFor("customers_df"),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = customers_df.filter((F.col('is_active') == True) & (F.col('country') == 'US'))\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "filter", anyOf: [".filter(", ".where("] },
      { label: "active check", anyOf: ["is_active"] },
      { label: "country check", anyOf: ["country", "US"] },
    ],
    hiddenRequirements: [{ label: "combined boolean logic", anyOf: ["&", " and "] }],
    resultExpectation: "A DataFrame filtered by active flag and US country.",
  }),
  structuralSeed({
    title: "Filter recent orders by date",
    summary: "Apply a date boundary directly in the predicate.",
    tags: ["transforms", "filter", "dates"],
    topic: "date filters",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that keeps only rows where `order_date >= '2026-01-01'` from `orders_df` into `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.filter(F.col('order_date') >= '2026-01-01')\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "filter", anyOf: [".filter(", ".where("] },
      { label: "order date condition", anyOf: ["order_date", "2026-01-01"] },
    ],
    hiddenRequirements: [],
    resultExpectation: "A DataFrame filtered by the requested date boundary.",
  }),
  structuralSeed({
    title: "Keep rows with null email",
    summary: "Use the DataFrame null predicate instead of Python null logic.",
    tags: ["transforms", "nulls"],
    topic: "null filtering",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that keeps only rows where `email` is null from `customers_df` into `result`.",
    starterCode: starterFor("customers_df"),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = customers_df.filter(F.col('email').isNull())\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "filter", anyOf: [".filter(", ".where("] },
      { label: "null check", anyOf: [".isNull("] },
      { label: "email column", anyOf: ["email"] },
    ],
    hiddenRequirements: [],
    resultExpectation: "A DataFrame containing only rows with null email.",
  }),
  structuralSeed({
    title: "Keep rows with non-null email",
    summary: "Use the inverse null predicate explicitly.",
    tags: ["transforms", "nulls"],
    topic: "null filtering",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that keeps only rows where `email` is not null from `customers_df` into `result`.",
    starterCode: starterFor("customers_df"),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = customers_df.filter(F.col('email').isNotNull())\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "filter", anyOf: [".filter(", ".where("] },
      { label: "non-null check", anyOf: [".isNotNull("] },
      { label: "email column", anyOf: ["email"] },
    ],
    hiddenRequirements: [],
    resultExpectation: "A DataFrame containing only rows with non-null email.",
  }),
  structuralSeed({
    title: "Add amount cents with `withColumn`",
    summary: "Create a derived numeric column from an existing field.",
    tags: ["transforms", "withColumn"],
    topic: "derived columns",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that adds `amount_cents = amount * 100` on `orders_df` and assigns the DataFrame to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.withColumn('amount_cents', F.col('amount') * 100)\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "withColumn", anyOf: [".withColumn("] },
      { label: "new column name", anyOf: ["amount_cents"] },
      { label: "amount column", anyOf: ["amount"] },
    ],
    hiddenRequirements: [{ label: "multiplication", anyOf: ["* 100"] }],
    resultExpectation: "A DataFrame with a derived amount_cents column.",
  }),
  structuralSeed({
    title: "Create a revenue bucket",
    summary: "Use `when` and `otherwise` for a simple classification.",
    tags: ["transforms", "when"],
    topic: "derived columns",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that adds `revenue_bucket` on `orders_df`: use `high` when `amount >= 500`, otherwise `standard`, and assign the DataFrame to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.withColumn('revenue_bucket', F.when(F.col('amount') >= 500, 'high').otherwise('standard'))\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "withColumn", anyOf: [".withColumn("] },
      { label: "when clause", anyOf: ["when("] },
      { label: "bucket column", anyOf: ["revenue_bucket"] },
    ],
    hiddenRequirements: [{ label: "otherwise branch", anyOf: [".otherwise("] }],
    resultExpectation: "A DataFrame with a conditional revenue_bucket column.",
  }),
  structuralSeed({
    title: "Normalize country to uppercase",
    summary: "Apply a built-in string transform inside `withColumn`.",
    tags: ["transforms", "strings"],
    topic: "derived columns",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that uppercases `country` into a new column named `country_upper` on `customers_df` and assigns the DataFrame to `result`.",
    starterCode: starterFor("customers_df"),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = customers_df.withColumn('country_upper', F.upper(F.col('country')))\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "withColumn", anyOf: [".withColumn("] },
      { label: "upper function", anyOf: ["upper("] },
      { label: "country_upper column", anyOf: ["country_upper"] },
    ],
    hiddenRequirements: [{ label: "country column", anyOf: ["country"] }],
    resultExpectation: "A DataFrame with an uppercased country column.",
  }),
  structuralSeed({
    title: "Add a boolean flag for large orders",
    summary: "Create a readable boolean classification column.",
    tags: ["transforms", "withColumn"],
    topic: "derived columns",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that adds `is_large` when `amount > 500` on `orders_df` and assigns the DataFrame to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.withColumn('is_large', F.col('amount') > 500)\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "withColumn", anyOf: [".withColumn("] },
      { label: "is_large column", anyOf: ["is_large"] },
      { label: "amount comparison", anyOf: ["> 500"] },
    ],
    hiddenRequirements: [{ label: "amount column", anyOf: ["amount"] }],
    resultExpectation: "A DataFrame with a boolean is_large column.",
  }),
  structuralSeed({
    title: "Drop duplicate customers",
    summary: "Use the DataFrame deduplication helper with one business key.",
    tags: ["transforms", "dedupe"],
    topic: "deduplication",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that removes duplicate `customer_id` rows from `customers_df` and assigns the result to `result`.",
    starterCode: starterFor("customers_df"),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = customers_df.dropDuplicates(['customer_id'])\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "drop duplicates", anyOf: [".dropDuplicates("] },
      { label: "customer id key", anyOf: ["customer_id"] },
    ],
    hiddenRequirements: [],
    resultExpectation: "A deduplicated DataFrame keyed by customer_id.",
  }),
  structuralSeed({
    title: "Order by amount descending",
    summary: "Sort highest-value records first.",
    tags: ["transforms", "ordering"],
    topic: "sorting",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that orders `orders_df` by `amount` descending and assigns the result to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.orderBy(F.col('amount').desc())\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "ordering", anyOf: [".orderBy("] },
      { label: "descending sort", anyOf: [".desc("] },
      { label: "amount column", anyOf: ["amount"] },
    ],
    hiddenRequirements: [],
    resultExpectation: "A DataFrame sorted by amount descending.",
  }),
  structuralSeed({
    title: "Order by country then amount",
    summary: "Use a multi-column ordering sequence.",
    tags: ["transforms", "ordering"],
    topic: "sorting",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that orders `orders_df` by `country` ascending and `amount` descending, assigning the result to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.orderBy(F.col('country').asc(), F.col('amount').desc())\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "ordering", anyOf: [".orderBy("] },
      { label: "country sort", anyOf: ["country"] },
      { label: "amount sort", anyOf: ["amount"] },
    ],
    hiddenRequirements: [{ label: "descending amount", anyOf: [".desc("] }],
    resultExpectation: "A DataFrame sorted by country and amount.",
  }),
  structuralSeed({
    title: "Sort and keep the top ten rows",
    summary: "Combine ordering and limiting in one flow.",
    tags: ["transforms", "limit"],
    topic: "sorting and limiting",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that orders `orders_df` by `amount` descending, keeps the top 10 rows, and assigns the result to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.orderBy(F.col('amount').desc()).limit(10)\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "ordering", anyOf: [".orderBy("] },
      { label: "descending amount", anyOf: [".desc("] },
      { label: "limit", anyOf: [".limit("] },
    ],
    hiddenRequirements: [{ label: "top ten", anyOf: ["10"] }],
    resultExpectation: "A top-10 DataFrame ordered by amount descending.",
  }),
  structuralSeed({
    title: "Cast amount to double",
    summary: "Use explicit casting before downstream arithmetic.",
    tags: ["transforms", "casting"],
    topic: "casts",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that casts `amount` to double in a new column named `amount_double` on `orders_df`, assigning the result to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.withColumn('amount_double', F.col('amount').cast('double'))\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "withColumn", anyOf: [".withColumn("] },
      { label: "cast usage", anyOf: [".cast("] },
      { label: "amount_double column", anyOf: ["amount_double"] },
    ],
    hiddenRequirements: [{ label: "double type", anyOf: ["double"] }],
    resultExpectation: "A DataFrame with amount cast to a double column.",
  }),
  structuralSeed({
    title: "Filter with `F.col` explicitly",
    summary: "Use column expressions rather than Python booleans.",
    tags: ["transforms", "filter"],
    topic: "column expressions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that filters `orders_df` to `amount > 0` using `F.col(...)` and assigns the result to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.filter(F.col('amount') > 0)\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "filter", anyOf: [".filter("] },
      { label: "F.col usage", anyOf: ["F.col("] },
      { label: "amount comparison", anyOf: ["amount", "> 0"] },
    ],
    hiddenRequirements: [],
    resultExpectation: "A DataFrame filtered using F.col.",
  }),
  structuralSeed({
    title: "Filter with a SQL string",
    summary: "Use a string predicate when the prompt asks for it.",
    tags: ["transforms", "filter"],
    topic: "string filters",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that filters `orders_df` with the SQL string `status = 'paid'` and assigns the result to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.filter(\"status = 'paid'\")\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "filter", anyOf: [".filter("] },
      { label: "sql string", anyOf: ["status = 'paid'", 'status = "paid"'] },
    ],
    hiddenRequirements: [],
    resultExpectation: "A DataFrame filtered using a SQL-style string predicate.",
  }),
  structuralSeed({
    title: "Use `selectExpr` for projection",
    summary: "Practice `selectExpr` with aliases.",
    tags: ["transforms", "selectExpr"],
    topic: "projection",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that uses `selectExpr` on `orders_df` to return `order_id` and `amount as revenue`, assigning the DataFrame to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.selectExpr('order_id', 'amount as revenue')\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "selectExpr", anyOf: [".selectExpr("] },
      { label: "revenue alias", anyOf: ["revenue"] },
      { label: "order id", anyOf: ["order_id"] },
    ],
    hiddenRequirements: [],
    resultExpectation: "A DataFrame projected with selectExpr aliases.",
  }),
  structuralSeed({
    title: "Fill missing email with coalesce",
    summary: "Use a null-safe expression to create a fallback value.",
    tags: ["transforms", "nulls"],
    topic: "null handling",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that creates `email_filled` on `customers_df` using `coalesce(email, 'missing@example.com')`, assigning the DataFrame to `result`.",
    starterCode: starterFor("customers_df"),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = customers_df.withColumn('email_filled', F.coalesce(F.col('email'), F.lit('missing@example.com')))\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "withColumn", anyOf: [".withColumn("] },
      { label: "coalesce", anyOf: ["coalesce("] },
      { label: "email_filled column", anyOf: ["email_filled"] },
    ],
    hiddenRequirements: [{ label: "fallback literal", anyOf: ["missing@example.com"] }],
    resultExpectation: "A DataFrame with a null-safe email_filled column.",
  }),
  structuralSeed({
    title: "Lowercase a status field",
    summary: "Normalize text through a built-in string function.",
    tags: ["transforms", "strings"],
    topic: "string cleanup",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that adds `status_lower` by lowercasing `status` on `orders_df`, assigning the DataFrame to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.withColumn('status_lower', F.lower(F.col('status')))\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "withColumn", anyOf: [".withColumn("] },
      { label: "lower function", anyOf: ["lower("] },
      { label: "status_lower column", anyOf: ["status_lower"] },
    ],
    hiddenRequirements: [{ label: "status column", anyOf: ["status"] }],
    resultExpectation: "A DataFrame with a lowercased status column.",
  }),
  structuralSeed({
    title: "Filter with `isin`",
    summary: "Keep rows from several allowed countries clearly.",
    tags: ["transforms", "filter"],
    topic: "membership filters",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that keeps only `US` and `CA` rows from `customers_df` using `isin`, assigning the result to `result`.",
    starterCode: starterFor("customers_df"),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = customers_df.filter(F.col('country').isin('US', 'CA'))\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "filter", anyOf: [".filter("] },
      { label: "isin", anyOf: [".isin("] },
      { label: "country column", anyOf: ["country"] },
    ],
    hiddenRequirements: [{ label: "US and CA", anyOf: ["US", "CA"] }],
    resultExpectation: "A DataFrame filtered by an allowed-country set.",
  }),
  structuralSeed({
    title: "Trim a customer name",
    summary: "Clean surrounding whitespace in a derived column.",
    tags: ["transforms", "strings"],
    topic: "string cleanup",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that adds `customer_name_clean` by trimming `customer_name` on `customers_df`, assigning the DataFrame to `result`.",
    starterCode: starterFor("customers_df"),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = customers_df.withColumn('customer_name_clean', F.trim(F.col('customer_name')))\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "withColumn", anyOf: [".withColumn("] },
      { label: "trim function", anyOf: ["trim("] },
      { label: "clean column", anyOf: ["customer_name_clean"] },
    ],
    hiddenRequirements: [{ label: "customer_name", anyOf: ["customer_name"] }],
    resultExpectation: "A DataFrame with a trimmed customer_name_clean column.",
  }),
] as const;

const actionsAndExecution = [
  structuralSeed({
    title: "Count all rows",
    summary: "Use a simple action and store the result in a Python variable.",
    tags: ["actions", "count"],
    topic: "actions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that counts all rows in `orders_df` and assigns the number to `result_count`.",
    starterCode: "result_count = None\n",
    referenceSolution: "result_count = orders_df.count()\n",
    requirements: [
      { label: "count assignment", anyOf: ["result_count ="] },
      { label: "count action", anyOf: [".count("] },
      { label: "orders dataframe", anyOf: ["orders_df"] },
    ],
    hiddenRequirements: [],
    resultExpectation: "A row count assigned to result_count.",
  }),
  structuralSeed({
    title: "Show a five-row preview",
    summary: "Use `show` for a quick look at the data.",
    tags: ["actions", "show"],
    topic: "actions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that previews `orders_df` with `show(5)`.",
    starterCode: "# preview rows below\n",
    referenceSolution: "orders_df.show(5)\n",
    requirements: [
      { label: "show action", anyOf: [".show("] },
      { label: "row preview size", anyOf: ["5"] },
      { label: "orders dataframe", anyOf: ["orders_df"] },
    ],
    hiddenRequirements: [],
    resultExpectation: "A five-row preview call using show(5).",
  }),
  structuralSeed({
    title: "Collect only two rows after a limit",
    summary: "Use a narrow collect pattern instead of pulling everything.",
    tags: ["actions", "collect"],
    topic: "actions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that limits `orders_df` to 2 rows, collects them, and assigns the local result to `result_rows`.",
    starterCode: "result_rows = None\n",
    referenceSolution: "result_rows = orders_df.limit(2).collect()\n",
    requirements: [
      { label: "local result assignment", anyOf: ["result_rows ="] },
      { label: "limit", anyOf: [".limit("] },
      { label: "collect action", anyOf: [".collect("] },
    ],
    hiddenRequirements: [{ label: "two rows", anyOf: ["2"] }],
    resultExpectation: "A limited collect call stored in a local variable.",
  }),
  structuralSeed({
    title: "Take three rows",
    summary: "Use another small action that returns local data.",
    tags: ["actions", "take"],
    topic: "actions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Write PySpark code that takes 3 rows from `orders_df` and assigns them to `result_rows`.",
    starterCode: "result_rows = None\n",
    referenceSolution: "result_rows = orders_df.take(3)\n",
    requirements: [
      { label: "local result assignment", anyOf: ["result_rows ="] },
      { label: "take action", anyOf: [".take("] },
      { label: "three rows", anyOf: ["3"] },
    ],
    hiddenRequirements: [],
    resultExpectation: "A take(3) action stored in a local variable.",
  }),
  answerSeed({
    title: "Transformation versus action",
    summary: "Separate plan-building code from execution-triggering code.",
    tags: ["actions", "mental-model"],
    topic: "transformations versus actions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` explaining the difference between a Spark transformation and a Spark action.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "Transformations build a new plan, while actions trigger execution and return results."\n',
    acceptedAnswers: [
      "transformations build a new plan, while actions trigger execution and return results",
      "transforms are lazy plan steps and actions run the work",
    ],
    resultExpectation: "A correct transformation-versus-action explanation.",
  }),
  answerSeed({
    title: "Why filter alone does not run",
    summary: "Reinforce lazy evaluation with a concrete method example.",
    tags: ["actions", "lazy-evaluation"],
    topic: "lazy evaluation",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` explaining why `df.filter(...)` alone does not run a Spark job.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "filter is a transformation, so Spark waits until an action is called before running the job."\n',
    acceptedAnswers: [
      "filter is a transformation, so spark waits until an action is called before running the job",
      "filter is lazy and does not execute until an action happens",
    ],
    resultExpectation: "A correct explanation of why a filter alone does not execute.",
  }),
  answerSeed({
    title: "Why count triggers a job",
    summary: "Connect an action to actual execution.",
    tags: ["actions", "count"],
    topic: "actions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` explaining why `count()` triggers a Spark job.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "count() is an action, so Spark must execute the plan to produce the final number."\n',
    acceptedAnswers: [
      "count() is an action, so spark must execute the plan to produce the final number",
      "count triggers execution because it is an action",
    ],
    resultExpectation: "A correct explanation of count().",
  }),
  answerSeed({
    title: "Why show is fine for a preview",
    summary: "Contrast small previews with full data pulls.",
    tags: ["actions", "show"],
    topic: "preview actions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` explaining why `show()` is reasonable for a quick preview.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "show() is reasonable for a preview because it displays only a small sample of rows."\n',
    acceptedAnswers: [
      "show() is reasonable for a preview because it displays only a small sample of rows",
      "show previews a small sample instead of all rows",
    ],
    resultExpectation: "A correct preview explanation.",
  }),
  answerSeed({
    title: "Why immutable DataFrames help reasoning",
    summary: "Connect immutability to debugging and reproducibility.",
    tags: ["actions", "immutability"],
    topic: "immutability",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` explaining why immutable DataFrames help reasoning about Spark code.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "Immutability makes each transformation step explicit and avoids hidden in-place changes."\n',
    acceptedAnswers: [
      "immutability makes each transformation step explicit and avoids hidden in-place changes",
      "immutable dataframes help because each step creates a clear new result",
    ],
    resultExpectation: "A correct immutability explanation.",
  }),
  structuralSeed({
    title: "Cache a reused DataFrame",
    summary: "Mark reused data explicitly for repeated downstream work.",
    tags: ["actions", "cache"],
    topic: "caching",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write PySpark code that caches `orders_df` and assigns the cached DataFrame to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.cache()\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "cache call", anyOf: [".cache("] },
      { label: "orders dataframe", anyOf: ["orders_df"] },
    ],
    hiddenRequirements: [],
    resultExpectation: "A cached DataFrame assigned to result.",
  }),
  structuralSeed({
    title: "Explain a query plan",
    summary: "Use plan inspection without executing a full write.",
    tags: ["actions", "explain"],
    topic: "query plans",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write PySpark code that explains the plan for `orders_df.filter(F.col('status') == 'paid')`.",
    starterCode: "from pyspark.sql import functions as F\n\n# explain the plan below\n",
    referenceSolution: "from pyspark.sql import functions as F\n\norders_df.filter(F.col('status') == 'paid').explain()\n",
    requirements: [
      { label: "filter", anyOf: [".filter("] },
      { label: "status check", anyOf: ["status", "paid"] },
      { label: "explain call", anyOf: [".explain("] },
    ],
    hiddenRequirements: [],
    resultExpectation: "An explain() call on a filtered DataFrame.",
  }),
  answerSeed({
    title: "Why collect is still risky after many transforms",
    summary: "Keep the memory warning visible even after nice-looking lineage code.",
    tags: ["actions", "collect"],
    topic: "driver memory",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` explaining why `collect()` can still be risky after many transformations.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "The lineage can be elegant, but collect() still pulls the final full result set into driver memory."\n',
    acceptedAnswers: [
      "the lineage can be elegant, but collect() still pulls the final full result set into driver memory",
      "collect is risky because the final result still lands on the driver",
    ],
    resultExpectation: "A correct collect-risk explanation.",
  }),
  answerSeed({
    title: "Why actions return local results",
    summary: "Explain where results go after execution finishes.",
    tags: ["actions", "driver"],
    topic: "actions",
    difficulty: "easy",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` explaining why actions like `count()` return local results to the driver.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "Actions compute the distributed result and then return a final value or sample to the driver."\n',
    acceptedAnswers: [
      "actions compute the distributed result and then return a final value or sample to the driver",
      "actions send the final result back to the driver",
    ],
    resultExpectation: "A correct statement about action results.",
  }),
  structuralSeed({
    title: "Filter then count active rows",
    summary: "Combine one transformation and one action cleanly.",
    tags: ["actions", "filter", "count"],
    topic: "actions",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write PySpark code that filters `customers_df` to `is_active = true`, counts the rows, and assigns the number to `result_count`.",
    starterCode: "result_count = None\n",
    referenceSolution: "from pyspark.sql import functions as F\n\nresult_count = customers_df.filter(F.col('is_active') == True).count()\n",
    requirements: [
      { label: "result count assignment", anyOf: ["result_count ="] },
      { label: "filter", anyOf: [".filter("] },
      { label: "active predicate", anyOf: ["is_active"] },
      { label: "count action", anyOf: [".count("] },
    ],
    hiddenRequirements: [],
    resultExpectation: "A filtered row count assigned to result_count.",
  }),
  structuralSeed({
    title: "Select then collect a narrow preview",
    summary: "Pull only the columns you actually need.",
    tags: ["actions", "collect", "select"],
    topic: "actions",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write PySpark code that selects `order_id` from `orders_df`, limits to 3 rows, collects them, and assigns the local result to `result_rows`.",
    starterCode: "result_rows = None\n",
    referenceSolution: "result_rows = orders_df.select('order_id').limit(3).collect()\n",
    requirements: [
      { label: "local result assignment", anyOf: ["result_rows ="] },
      { label: "select", anyOf: [".select("] },
      { label: "limit", anyOf: [".limit("] },
      { label: "collect", anyOf: [".collect("] },
    ],
    hiddenRequirements: [{ label: "order id column", anyOf: ["order_id"] }],
    resultExpectation: "A narrow collected preview stored locally.",
  }),
] as const;

const predictionsAndReasoning = [
  answerSeed({
    title: "Predict no execution yet",
    summary: "Recognize a lazy transformation chain that has not run.",
    tags: ["prediction", "lazy-evaluation"],
    topic: "output prediction",
    difficulty: "easy",
    questionType: "predict-output",
    prompt:
      "Assign a short sentence to `answer`: if code only does `df = orders_df.filter(F.col('amount') > 0)` and nothing else, has Spark already executed the job?",
    starterCode: conceptualStarter,
    referenceSolution: 'answer = "No. A filter alone is lazy and does not execute until an action is called."\n',
    acceptedAnswers: [
      "no. a filter alone is lazy and does not execute until an action is called",
      "no, spark has not executed yet because filter is a transformation",
    ],
    resultExpectation: "A correct no-execution prediction.",
  }),
  answerSeed({
    title: "Predict which line triggers the job",
    summary: "Spot the action inside a short sequence.",
    tags: ["prediction", "actions"],
    topic: "output prediction",
    difficulty: "easy",
    questionType: "predict-output",
    prompt:
      "Assign a short sentence to `answer`: in a sequence with `filtered = orders_df.filter(...)` and then `filtered.count()`, which line triggers the job?",
    starterCode: conceptualStarter,
    referenceSolution: 'answer = "filtered.count() triggers the job because count is the action."\n',
    acceptedAnswers: [
      "filtered.count() triggers the job because count is the action",
      "the count line triggers execution",
    ],
    resultExpectation: "A correct action-trigger prediction.",
  }),
  answerSeed({
    title: "Predict column count after select",
    summary: "Reason about the output shape of a projection.",
    tags: ["prediction", "select"],
    topic: "projection reasoning",
    difficulty: "easy",
    questionType: "predict-output",
    prompt:
      "Assign a short sentence to `answer`: after `orders_df.select('order_id', 'amount')`, how many columns does the result have?",
    starterCode: conceptualStarter,
    referenceSolution: 'answer = "The result has 2 columns: order_id and amount."\n',
    acceptedAnswers: [
      "the result has 2 columns: order_id and amount",
      "2 columns",
    ],
    resultExpectation: "A correct column-count prediction.",
  }),
  answerSeed({
    title: "Predict alias output name",
    summary: "Track how aliases change the output schema.",
    tags: ["prediction", "aliases"],
    topic: "projection reasoning",
    difficulty: "easy",
    questionType: "predict-output",
    prompt:
      "Assign a short sentence to `answer`: after `orders_df.select(F.col('amount').alias('revenue'))`, what is the output column name?",
    starterCode: conceptualStarter,
    referenceSolution: 'answer = "The output column name is revenue."\n',
    acceptedAnswers: [
      "the output column name is revenue",
      "revenue",
    ],
    resultExpectation: "A correct alias prediction.",
  }),
  answerSeed({
    title: "Predict null-filter behavior",
    summary: "Know exactly which rows survive `isNull()`.",
    tags: ["prediction", "nulls"],
    topic: "null reasoning",
    difficulty: "easy",
    questionType: "predict-output",
    prompt:
      "Assign a short sentence to `answer`: what kind of rows remain after `customers_df.filter(F.col('email').isNull())`?",
    starterCode: conceptualStarter,
    referenceSolution: 'answer = "Only rows where email is null remain."\n',
    acceptedAnswers: [
      "only rows where email is null remain",
      "rows with null email remain",
    ],
    resultExpectation: "A correct null-filter prediction.",
  }),
  answerSeed({
    title: "Predict immutability after filtering",
    summary: "State what happens to the original DataFrame after a transform.",
    tags: ["prediction", "immutability"],
    topic: "immutability",
    difficulty: "easy",
    questionType: "predict-output",
    prompt:
      "Assign a short sentence to `answer`: after `filtered = orders_df.filter(...)`, what happens to `orders_df` itself?",
    starterCode: conceptualStarter,
    referenceSolution: 'answer = "orders_df stays unchanged because Spark transformations create a new DataFrame."\n',
    acceptedAnswers: [
      "orders_df stays unchanged because spark transformations create a new dataframe",
      "the original dataframe is unchanged",
    ],
    resultExpectation: "A correct immutability prediction.",
  }),
  answerSeed({
    title: "Predict `collect()` return style",
    summary: "Know the local shape returned by a collect action.",
    tags: ["prediction", "collect"],
    topic: "actions",
    difficulty: "easy",
    questionType: "predict-output",
    prompt:
      "Assign a short sentence to `answer`: what kind of object does `collect()` return to Python?",
    starterCode: conceptualStarter,
    referenceSolution: 'answer = "collect() returns a local Python list of Row objects."\n',
    acceptedAnswers: [
      "collect() returns a local python list of row objects",
      "a local list of rows",
    ],
    resultExpectation: "A correct collect() return-type prediction.",
  }),
  answerSeed({
    title: "Predict `show()` return style",
    summary: "Separate printed preview from returned values.",
    tags: ["prediction", "show"],
    topic: "actions",
    difficulty: "easy",
    questionType: "predict-output",
    prompt:
      "Assign a short sentence to `answer`: does `show()` mainly print a preview or return a full local dataset?",
    starterCode: conceptualStarter,
    referenceSolution: 'answer = "show() mainly prints a preview; it does not return the full dataset as a local object."\n',
    acceptedAnswers: [
      "show() mainly prints a preview; it does not return the full dataset as a local object",
      "show prints a preview instead of returning the full dataset",
    ],
    resultExpectation: "A correct show() behavior prediction.",
  }),
  answerSeed({
    title: "Predict deduplication effect",
    summary: "Track the row-grain change after `dropDuplicates`.",
    tags: ["prediction", "dedupe"],
    topic: "deduplication reasoning",
    difficulty: "easy",
    questionType: "predict-output",
    prompt:
      "Assign a short sentence to `answer`: after `dropDuplicates(['customer_id'])`, how many rows should exist for each `customer_id` value?",
    starterCode: conceptualStarter,
    referenceSolution: 'answer = "There should be at most one row per customer_id value."\n',
    acceptedAnswers: [
      "there should be at most one row per customer_id value",
      "one row per customer_id at most",
    ],
    resultExpectation: "A correct deduplication prediction.",
  }),
  answerSeed({
    title: "Predict descending sort order",
    summary: "State which values appear first after a desc sort.",
    tags: ["prediction", "ordering"],
    topic: "sorting reasoning",
    difficulty: "easy",
    questionType: "predict-output",
    prompt:
      "Assign a short sentence to `answer`: after `orderBy(F.col('amount').desc())`, do larger or smaller amounts appear first?",
    starterCode: conceptualStarter,
    referenceSolution: 'answer = "Larger amounts appear first."\n',
    acceptedAnswers: [
      "larger amounts appear first",
      "the highest amounts appear first",
    ],
    resultExpectation: "A correct descending-sort prediction.",
  }),
  answerSeed({
    title: "Why explicit schema beats stringly types",
    summary: "Explain the operational reason to avoid accidental strings.",
    tags: ["reasoning", "schema"],
    topic: "logical-plan reasoning",
    difficulty: "easy",
    questionType: "predict-output",
    prompt:
      "Assign a short sentence to `answer` explaining why explicit schema is safer than leaving numeric columns as strings.",
    starterCode: conceptualStarter,
    referenceSolution: 'answer = "Explicit schema prevents numeric columns from being treated like strings during filters and aggregations."\n',
    acceptedAnswers: [
      "explicit schema prevents numeric columns from being treated like strings during filters and aggregations",
      "explicit schema keeps numeric columns typed correctly for filters and aggregates",
    ],
    resultExpectation: "A correct schema-typing explanation.",
  }),
  answerSeed({
    title: "Why filtering before collect is cheaper",
    summary: "Make the scale-aware reasoning explicit.",
    tags: ["reasoning", "cost-awareness"],
    topic: "logical-plan reasoning",
    difficulty: "easy",
    questionType: "predict-output",
    prompt:
      "Assign a short sentence to `answer` explaining why filtering before `collect()` is cheaper than collecting first.",
    starterCode: conceptualStarter,
    referenceSolution: 'answer = "Filtering first reduces the amount of data sent back to the driver during collect()."\n',
    acceptedAnswers: [
      "filtering first reduces the amount of data sent back to the driver during collect()",
      "filter first so less data is moved to the driver",
    ],
    resultExpectation: "A correct scale-aware explanation.",
  }),
  answerSeed({
    title: "Why Parquet usually beats CSV for typed pipelines",
    summary: "Reason about storage format in beginner-friendly terms.",
    tags: ["reasoning", "parquet"],
    topic: "logical-plan reasoning",
    difficulty: "easy",
    questionType: "predict-output",
    prompt:
      "Assign a short sentence to `answer` explaining why Parquet usually fits typed pipelines better than CSV.",
    starterCode: conceptualStarter,
    referenceSolution: 'answer = "Parquet preserves schema and reads only needed columns more efficiently than CSV."\n',
    acceptedAnswers: [
      "parquet preserves schema and reads only needed columns more efficiently than csv",
      "parquet is better because it keeps schema and supports efficient column reads",
    ],
    resultExpectation: "A correct Parquet-versus-CSV explanation.",
  }),
  answerSeed({
    title: "Why `isNull()` beats Python `None` checks",
    summary: "Explain the DataFrame-expression mindset clearly.",
    tags: ["reasoning", "nulls"],
    topic: "logical-plan reasoning",
    difficulty: "easy",
    questionType: "predict-output",
    prompt:
      "Assign a short sentence to `answer` explaining why Spark null checks use `isNull()` instead of Python `is None` on DataFrame columns.",
    starterCode: conceptualStarter,
    referenceSolution: 'answer = "Spark columns are expressions inside a plan, so null checks must use DataFrame column methods like isNull()."\n',
    acceptedAnswers: [
      "spark columns are expressions inside a plan, so null checks must use dataframe column methods like isnull()",
      "spark column null checks use isnull because columns are expressions, not plain python values",
    ],
    resultExpectation: "A correct Spark-column null-check explanation.",
  }),
  answerSeed({
    title: "Why groupBy changes the grain",
    summary: "State the output-grain shift after aggregation.",
    tags: ["reasoning", "aggregation"],
    topic: "logical-plan reasoning",
    difficulty: "easy",
    questionType: "predict-output",
    prompt:
      "Assign a short sentence to `answer` explaining how `groupBy('country').agg(...)` changes the output grain.",
    starterCode: conceptualStarter,
    referenceSolution: 'answer = "The output grain becomes one row per country instead of one row per original input record."\n',
    acceptedAnswers: [
      "the output grain becomes one row per country instead of one row per original input record",
      "groupby changes the result to one row per group",
    ],
    resultExpectation: "A correct groupBy grain explanation.",
  }),
] as const;

const repairAndDebugging = [
  structuralSeed({
    title: "Repair a missing `F` import",
    summary: "Fix the common bug where functions are used without importing them.",
    tags: ["debugging", "imports"],
    topic: "repairing code",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "Write the corrected PySpark code that uses `withColumn` and `F.upper` to create `country_upper` from `customers_df`, making sure the import is correct and the DataFrame is assigned to `result`.",
    starterCode: starterFor("customers_df"),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = customers_df.withColumn('country_upper', F.upper(F.col('country')))\n",
    requirements: [
      { label: "functions import", anyOf: ["from pyspark.sql import functions as F"] },
      { label: "withColumn", anyOf: [".withColumn("] },
      { label: "upper call", anyOf: ["upper("] },
      { label: "result assignment", anyOf: ["result ="] },
    ],
    hiddenRequirements: [{ label: "country_upper", anyOf: ["country_upper"] }],
    forbiddenPatterns: ["functions.upper("],
    resultExpectation: "A corrected import plus transformation.",
  }),
  structuralSeed({
    title: "Repair a wrong column name",
    summary: "Replace a misspelled column with the real one.",
    tags: ["debugging", "columns"],
    topic: "repairing code",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "Write corrected PySpark code that filters `orders_df` by the real column `order_id` being non-null and assigns the result to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.filter(F.col('order_id').isNotNull())\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "filter", anyOf: [".filter("] },
      { label: "real column name", anyOf: ["order_id"] },
      { label: "non-null check", anyOf: [".isNotNull("] },
    ],
    hiddenRequirements: [],
    forbiddenPatterns: ["orderid", "order-id"],
    resultExpectation: "A corrected filter using order_id.",
  }),
  structuralSeed({
    title: "Repair bracket-based select misuse",
    summary: "Use the DataFrame API correctly instead of list-style syntax.",
    tags: ["debugging", "select"],
    topic: "repairing code",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "Write corrected PySpark code that selects `customer_id` from `customers_df` and assigns the DataFrame to `result` using the proper `select(...)` call.",
    starterCode: starterFor("customers_df"),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = customers_df.select('customer_id')\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "proper select call", anyOf: [".select("] },
      { label: "customer id", anyOf: ["customer_id"] },
    ],
    hiddenRequirements: [],
    forbiddenPatterns: ["select[", "select {", "select['"],
    resultExpectation: "A corrected select(...) call.",
  }),
  structuralSeed({
    title: "Repair a broken amount comparison",
    summary: "Use a column expression instead of a Python string comparison.",
    tags: ["debugging", "filter"],
    topic: "repairing code",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "Write corrected PySpark code that keeps only rows where `amount > 0` from `orders_df`, assigning the DataFrame to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.filter(F.col('amount') > 0)\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "filter", anyOf: [".filter("] },
      { label: "amount column", anyOf: ["amount"] },
      { label: "positive comparison", anyOf: ["> 0"] },
    ],
    hiddenRequirements: [{ label: "F.col usage", anyOf: ["F.col("] }],
    forbiddenPatterns: ['"amount" > 0', "'amount' > 0"],
    resultExpectation: "A corrected numeric filter expression.",
  }),
  structuralSeed({
    title: "Repair a null check",
    summary: "Replace Python `None` logic with the DataFrame API.",
    tags: ["debugging", "nulls"],
    topic: "repairing code",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "Write corrected PySpark code that keeps rows where `email` is null from `customers_df`, assigning the DataFrame to `result`.",
    starterCode: starterFor("customers_df"),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = customers_df.filter(F.col('email').isNull())\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "filter", anyOf: [".filter("] },
      { label: "email column", anyOf: ["email"] },
      { label: "isNull check", anyOf: [".isNull("] },
    ],
    hiddenRequirements: [],
    forbiddenPatterns: ["== None", "is None"],
    resultExpectation: "A corrected null filter using isNull().",
  }),
  structuralSeed({
    title: "Repair a lowercase `groupby` call",
    summary: "Use the correct camelCase DataFrame method.",
    tags: ["debugging", "aggregation"],
    topic: "repairing code",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "Write corrected PySpark code that groups `orders_df` by `country` and counts rows into `result` using the right method name.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.groupBy('country').count()\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "groupBy method", anyOf: [".groupBy("] },
      { label: "count action", anyOf: [".count("] },
      { label: "country key", anyOf: ["country"] },
    ],
    hiddenRequirements: [],
    forbiddenPatterns: [".groupby("],
    resultExpectation: "A corrected groupBy(...).count() chain.",
  }),
  structuralSeed({
    title: "Repair descending sort syntax",
    summary: "Use the column desc method for a descending order.",
    tags: ["debugging", "ordering"],
    topic: "repairing code",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "Write corrected PySpark code that sorts `orders_df` by `amount` descending into `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.orderBy(F.col('amount').desc())\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "orderBy", anyOf: [".orderBy("] },
      { label: "amount column", anyOf: ["amount"] },
      { label: "descending method", anyOf: [".desc("] },
    ],
    hiddenRequirements: [],
    forbiddenPatterns: [".descending(", "reverse=True"],
    resultExpectation: "A corrected descending sort.",
  }),
  structuralSeed({
    title: "Repair a CSV read missing headers",
    summary: "Add the read option required by a header-based CSV file.",
    tags: ["debugging", "reads"],
    topic: "repairing code",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "Write corrected PySpark code that reads `/tmp/orders.csv` with headers into `orders_df`.",
    starterCode: "orders_df = None\n",
    referenceSolution: "orders_df = spark.read.option('header', True).csv('/tmp/orders.csv')\n",
    requirements: [
      { label: "orders assignment", anyOf: ["orders_df ="] },
      { label: "header option", anyOf: ["header"] },
      { label: "csv reader", anyOf: [".csv("] },
    ],
    hiddenRequirements: [{ label: "path", anyOf: ["/tmp/orders.csv"] }],
    forbiddenPatterns: [".text(", ".json("],
    resultExpectation: "A corrected CSV read with header support.",
  }),
  structuralSeed({
    title: "Repair `dropduplicates` casing",
    summary: "Use the actual DataFrame deduplication method name.",
    tags: ["debugging", "dedupe"],
    topic: "repairing code",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "Write corrected PySpark code that removes duplicate `customer_id` rows from `customers_df` into `result` using the proper method name.",
    starterCode: starterFor("customers_df"),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = customers_df.dropDuplicates(['customer_id'])\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "dropDuplicates method", anyOf: [".dropDuplicates("] },
      { label: "customer id key", anyOf: ["customer_id"] },
    ],
    hiddenRequirements: [],
    forbiddenPatterns: [".dropduplicates("],
    resultExpectation: "A corrected deduplication call.",
  }),
  structuralSeed({
    title: "Repair `withcolumn` casing",
    summary: "Use the correct camelCase method for derived fields.",
    tags: ["debugging", "withColumn"],
    topic: "repairing code",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "Write corrected PySpark code that adds `status_lower` from `status` on `orders_df` and assigns the DataFrame to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.withColumn('status_lower', F.lower(F.col('status')))\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "withColumn method", anyOf: [".withColumn("] },
      { label: "status_lower", anyOf: ["status_lower"] },
      { label: "lower function", anyOf: ["lower("] },
    ],
    hiddenRequirements: [],
    forbiddenPatterns: [".withcolumn("],
    resultExpectation: "A corrected withColumn transformation.",
  }),
  structuralSeed({
    title: "Repair transformation order for filtering",
    summary: "Keep the filter before collecting the local result.",
    tags: ["debugging", "actions"],
    topic: "repairing code",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "Write corrected PySpark code that filters `orders_df` to paid rows, then collects the result into `result_rows`.",
    starterCode: "result_rows = None\n",
    referenceSolution: "from pyspark.sql import functions as F\n\nresult_rows = orders_df.filter(F.col('status') == 'paid').collect()\n",
    requirements: [
      { label: "local result assignment", anyOf: ["result_rows ="] },
      { label: "filter", anyOf: [".filter("] },
      { label: "collect", anyOf: [".collect("] },
      { label: "paid status", anyOf: ["paid"] },
    ],
    hiddenRequirements: [],
    forbiddenPatterns: ["collect().filter", "collect () .filter"],
    resultExpectation: "A corrected filter-then-collect flow.",
  }),
  structuralSeed({
    title: "Repair a missing result assignment",
    summary: "Make the final DataFrame explicit for the grading contract.",
    tags: ["debugging", "result"],
    topic: "repairing code",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "Write corrected PySpark code that filters `orders_df` to positive `amount` values and assigns the final DataFrame to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.filter(F.col('amount') > 0)\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "filter", anyOf: [".filter("] },
      { label: "amount column", anyOf: ["amount"] },
      { label: "positive comparison", anyOf: ["> 0"] },
    ],
    hiddenRequirements: [],
    forbiddenPatterns: ["filtered =", "output =", "final_df ="],
    resultExpectation: "A corrected final DataFrame assignment to result.",
  }),
  structuralSeed({
    title: "Repair a latest-row window",
    summary: "Use a window spec and row number instead of vague sorting only.",
    tags: ["debugging", "windows"],
    topic: "repairing code",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "Write corrected PySpark code that keeps the latest row per `customer_id` using descending `updated_at` and `row_number`, assigning the result to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nwindow_spec = Window.partitionBy('customer_id').orderBy(F.col('updated_at').desc())\nresult = orders_df.withColumn('row_num', F.row_number().over(window_spec)).filter(F.col('row_num') == 1)\n",
    requirements: [
      { label: "window partition", anyOf: ["Window.partitionBy("] },
      { label: "row_number", anyOf: ["row_number("] },
      { label: "latest filter", anyOf: ["row_num", "== 1"] },
      { label: "result assignment", anyOf: ["result ="] },
    ],
    hiddenRequirements: [{ label: "updated_at desc", anyOf: ["updated_at", ".desc("] }],
    forbiddenPatterns: [".dropDuplicates(", "groupBy("],
    resultExpectation: "A corrected latest-row window solution.",
  }),
  structuralSeed({
    title: "Repair a grouped sum alias",
    summary: "Name the metric instead of leaving it as an anonymous aggregate.",
    tags: ["debugging", "aggregation"],
    topic: "repairing code",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "Write corrected PySpark code that groups `orders_df` by `country`, sums `amount`, aliases the metric as `total_revenue`, and assigns the DataFrame to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.groupBy('country').agg(F.sum('amount').alias('total_revenue'))\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "groupBy", anyOf: [".groupBy("] },
      { label: "agg", anyOf: [".agg("] },
      { label: "metric alias", anyOf: ["total_revenue"] },
    ],
    hiddenRequirements: [{ label: "sum amount", anyOf: ["sum('amount')", 'sum("amount")'] }],
    forbiddenPatterns: [
      ".groupBy('country').sum('amount')",
      '.groupBy("country").sum("amount")',
    ],
    resultExpectation: "A grouped sum with an explicit alias.",
  }),
  structuralSeed({
    title: "Repair a bad active-row comparison",
    summary: "Use a proper column expression instead of a Python truthy shortcut.",
    tags: ["debugging", "filter"],
    topic: "repairing code",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "Write corrected PySpark code that keeps rows where `is_active` is true from `customers_df`, assigning the DataFrame to `result`.",
    starterCode: starterFor("customers_df"),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = customers_df.filter(F.col('is_active') == True)\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "filter", anyOf: [".filter("] },
      { label: "is_active column", anyOf: ["is_active"] },
      { label: "boolean comparison", anyOf: ["== True", "==True"] },
    ],
    hiddenRequirements: [{ label: "F.col usage", anyOf: ["F.col("] }],
    forbiddenPatterns: [".filter(is_active)", ".filter('is_active')"],
    resultExpectation: "A corrected active-row boolean filter.",
  }),
] as const;

const mixedMastery = [
  structuralSeed({
    title: "Read, filter, and select active customers",
    summary: "Combine a CSV read with a simple cleanup flow.",
    tags: ["mastery", "reads", "filter"],
    topic: "mixed mastery",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write PySpark code that reads `/tmp/customers.csv` with headers, filters `is_active = true`, selects `customer_id` and `country`, and assigns the DataFrame to `result`.",
    starterCode: "result = None\n",
    referenceSolution: "result = spark.read.option('header', True).csv('/tmp/customers.csv').filter(F.col('is_active') == True).select('customer_id', 'country')\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "csv reader", anyOf: [".csv("] },
      { label: "filter", anyOf: [".filter("] },
      { label: "select", anyOf: [".select("] },
    ],
    hiddenRequirements: [{ label: "customer output fields", anyOf: ["customer_id", "country"] }],
    resultExpectation: "A read-filter-select flow for active customers.",
  }),
  structuralSeed({
    title: "Filter paid rows and derive a bucket",
    summary: "Mix predicate logic with a beginner classification.",
    tags: ["mastery", "filter", "withColumn"],
    topic: "mixed mastery",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write PySpark code that filters `orders_df` to paid rows, adds `size_bucket` using `amount >= 100` as `large` otherwise `small`, and assigns the DataFrame to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.filter(F.col('status') == 'paid').withColumn('size_bucket', F.when(F.col('amount') >= 100, 'large').otherwise('small'))\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "filter", anyOf: [".filter("] },
      { label: "withColumn", anyOf: [".withColumn("] },
      { label: "when clause", anyOf: ["when("] },
    ],
    hiddenRequirements: [{ label: "size bucket name", anyOf: ["size_bucket"] }],
    resultExpectation: "A paid-orders DataFrame with a size_bucket classification.",
  }),
  structuralSeed({
    title: "Dedupe events then keep the newest first",
    summary: "Mix deduplication and ordering in one readable pipeline step.",
    tags: ["mastery", "dedupe", "ordering"],
    topic: "mixed mastery",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write PySpark code that removes duplicate `event_id` rows from `events_df`, orders by `updated_at` descending, and assigns the DataFrame to `result`.",
    starterCode: starterFor("events_df"),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = events_df.dropDuplicates(['event_id']).orderBy(F.col('updated_at').desc())\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "dropDuplicates", anyOf: [".dropDuplicates("] },
      { label: "orderBy", anyOf: [".orderBy("] },
      { label: "descending order", anyOf: [".desc("] },
    ],
    hiddenRequirements: [{ label: "event key", anyOf: ["event_id"] }],
    resultExpectation: "A deduplicated event DataFrame ordered by newest updates first.",
  }),
  answerSeed({
    title: "Interview checkpoint: explicit schema and early filters",
    summary: "Summarize two Week 1 habits in one concise answer.",
    tags: ["mastery", "interview"],
    topic: "mixed mastery",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` explaining why explicit schema and early filters are both good beginner PySpark habits.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "Explicit schema keeps types reliable, and early filters reduce the data Spark has to process downstream."\n',
    acceptedAnswers: [
      "explicit schema keeps types reliable, and early filters reduce the data spark has to process downstream",
      "explicit types prevent surprises and early filters reduce work",
    ],
    resultExpectation: "A combined schema-and-filter reasoning answer.",
  }),
  structuralSeed({
    title: "Read JSON, keep valid user ids, and project fields",
    summary: "Blend read options, filtering, and projection in one task.",
    tags: ["mastery", "reads", "filter", "select"],
    topic: "mixed mastery",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write PySpark code that reads `/tmp/events.json`, keeps non-null `user_id`, selects `event_id` and `user_id`, and assigns the DataFrame to `result`.",
    starterCode: "result = None\n",
    referenceSolution: "result = spark.read.json('/tmp/events.json').filter(F.col('user_id').isNotNull()).select('event_id', 'user_id')\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "json reader", anyOf: [".json("] },
      { label: "filter", anyOf: [".filter("] },
      { label: "select", anyOf: [".select("] },
    ],
    hiddenRequirements: [{ label: "event and user ids", anyOf: ["event_id", "user_id"] }],
    resultExpectation: "A filtered JSON projection of event_id and user_id.",
  }),
  structuralSeed({
    title: "Trim and lowercase email text",
    summary: "Apply two text-cleaning steps in one derived column.",
    tags: ["mastery", "strings"],
    topic: "mixed mastery",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write PySpark code that adds `email_clean` on `customers_df` by trimming and lowercasing `email`, assigning the DataFrame to `result`.",
    starterCode: starterFor("customers_df"),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = customers_df.withColumn('email_clean', F.lower(F.trim(F.col('email'))))\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "withColumn", anyOf: [".withColumn("] },
      { label: "trim", anyOf: ["trim("] },
      { label: "lower", anyOf: ["lower("] },
    ],
    hiddenRequirements: [{ label: "email_clean column", anyOf: ["email_clean"] }],
    resultExpectation: "A DataFrame with a trimmed, lowercased email_clean column.",
  }),
  structuralSeed({
    title: "Group paid rows by country and name the metric",
    summary: "End the week with a clear grouped metric pattern.",
    tags: ["mastery", "aggregation"],
    topic: "mixed mastery",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write PySpark code that filters paid rows from `orders_df`, groups by `country`, counts them as `paid_orders`, and assigns the DataFrame to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.filter(F.col('status') == 'paid').groupBy('country').agg(F.count('*').alias('paid_orders'))\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "filter", anyOf: [".filter("] },
      { label: "groupBy", anyOf: [".groupBy("] },
      { label: "agg", anyOf: [".agg("] },
    ],
    hiddenRequirements: [{ label: "paid_orders alias", anyOf: ["paid_orders"] }],
    resultExpectation: "A grouped count of paid orders by country.",
  }),
  structuralSeed({
    title: "Filter recent orders then count them",
    summary: "Mix a date boundary with a final action.",
    tags: ["mastery", "dates", "actions"],
    topic: "mixed mastery",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Write PySpark code that filters `orders_df` to `order_date >= '2026-01-01'`, counts the rows, and assigns the number to `result_count`.",
    starterCode: "result_count = None\n",
    referenceSolution: "from pyspark.sql import functions as F\n\nresult_count = orders_df.filter(F.col('order_date') >= '2026-01-01').count()\n",
    requirements: [
      { label: "result count assignment", anyOf: ["result_count ="] },
      { label: "filter", anyOf: [".filter("] },
      { label: "order date condition", anyOf: ["order_date", "2026-01-01"] },
      { label: "count", anyOf: [".count("] },
    ],
    hiddenRequirements: [],
    resultExpectation: "A count of recent orders stored in result_count.",
  }),
  structuralSeed({
    title: "Debug a null-safe paid filter",
    summary: "Combine a valid status check with a non-null identifier rule.",
    tags: ["mastery", "debugging"],
    topic: "debugging checkpoint",
    difficulty: "medium",
    questionType: "repair-code",
    prompt:
      "Write corrected PySpark code that keeps only paid rows from `orders_df` where `order_id` is not null, assigning the DataFrame to `result`.",
    starterCode: starterFor(),
    referenceSolution: "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\nresult = orders_df.filter((F.col('status') == 'paid') & F.col('order_id').isNotNull())\n",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "paid filter", anyOf: ["paid"] },
      { label: "non-null order id", anyOf: ["order_id", ".isNotNull("] },
      { label: "filter", anyOf: [".filter("] },
    ],
    hiddenRequirements: [],
    forbiddenPatterns: ["== None", "is None"],
    resultExpectation: "A corrected paid-and-valid-id filter.",
  }),
  answerSeed({
    title: "Final Week 1 checkpoint",
    summary: "Close the week by linking driver, transformations, and actions in one sentence.",
    tags: ["mastery", "checkpoint"],
    topic: "final checkpoint",
    difficulty: "medium",
    questionType: "write-code",
    prompt:
      "Assign a short sentence to `answer` connecting the driver, lazy transformations, and actions in one beginner-friendly explanation.",
    starterCode: conceptualStarter,
    referenceSolution:
      'answer = "The driver builds the lazy transformation plan, and actions trigger executors to run that plan on the cluster."\n',
    acceptedAnswers: [
      "the driver builds the lazy transformation plan, and actions trigger executors to run that plan on the cluster",
      "the driver plans the lazy work and actions make executors run it",
    ],
    resultExpectation: "A final Week 1 summary connecting driver, laziness, and actions.",
  }),
] as const;

export const pysparkWeekOneExerciseSeeds = [
  ...foundations,
  ...sessionAndSchema,
  ...readingInputs,
  ...dataframeTransforms,
  ...actionsAndExecution,
  ...predictionsAndReasoning,
  ...repairAndDebugging,
  ...mixedMastery,
];

if (pysparkWeekOneExerciseSeeds.length !== 125) {
  throw new Error(`PySpark Week 1 must contain 125 questions. Received ${pysparkWeekOneExerciseSeeds.length}.`);
}

export const pysparkWeekOneGuidedLessons: LessonSeed[] = pysparkWeekOneExerciseSeeds.map((seed) => ({
  title: seed.title,
  summary: seed.summary,
  estimatedMinutes: seed.difficulty === "easy" ? 18 : 22,
  tags: seed.tags,
}));
