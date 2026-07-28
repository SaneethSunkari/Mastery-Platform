import type { CurriculumNode, Technology } from "@/lib/adaptive/types";

type CategoryBlueprint = {
  category: string;
  importance?: CurriculumNode["importance"];
  exposure?: number;
  subtopics: string;
};

const sqlBlueprints: CategoryBlueprint[] = [
  { category: "Foundations", subtopics: "SELECT|DISTINCT|aliases|expressions|literals|arithmetic|logical query-processing order" },
  { category: "Filtering", subtopics: "WHERE|comparison operators|AND|OR|NOT|BETWEEN|IN|NOT IN|LIKE|regular expressions|date filters|timestamp filters|operator precedence" },
  { category: "NULL handling", subtopics: "IS NULL|IS NOT NULL|COALESCE|NULLIF|IFNULL|NVL|three-valued logic|null-safe comparisons|nulls in joins|nulls in aggregation|null ordering" },
  { category: "Sorting and pagination", subtopics: "ORDER BY|multi-column ordering|ASC|DESC|NULLS FIRST|NULLS LAST|LIMIT|OFFSET|TOP|FETCH|deterministic ordering|keyset pagination" },
  { category: "Conditional logic", subtopics: "CASE|simple CASE|searched CASE|nested CASE|conditional aggregation|bucketing|overlapping conditions" },
  { category: "Aggregation", importance: "important", exposure: 50, subtopics: "COUNT|COUNT DISTINCT|SUM|AVG|MIN|MAX|GROUP BY|HAVING|weighted averages|ratios|percentages|multiple-stage aggregation|conditional aggregation" },
  { category: "Advanced grouping", importance: "advanced", exposure: 80, subtopics: "ROLLUP|CUBE|GROUPING SETS|GROUPING|GROUPING_ID|subtotals" },
  { category: "Joins", importance: "important", exposure: 110, subtopics: "INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|CROSS JOIN|SELF JOIN|semi joins|anti joins|non-equi joins|range joins|temporal joins|composite keys|duplicate amplification|cardinality|null join behavior|multi-table joins|join debugging" },
  { category: "Set operations", subtopics: "UNION|UNION ALL|INTERSECT|EXCEPT|MINUS|set-operation precedence|duplicate behavior" },
  { category: "Subqueries", importance: "important", exposure: 50, subtopics: "scalar subqueries|row subqueries|table subqueries|correlated subqueries|EXISTS|NOT EXISTS|IN versus EXISTS|subqueries in SELECT|subqueries in WHERE|subqueries in FROM|subquery optimization" },
  { category: "Common table expressions", importance: "important", exposure: 60, subtopics: "basic CTE|multiple CTEs|chained CTEs|recursive CTEs|hierarchies|graphs|sequence generation|materialization behavior" },
  { category: "Strings", subtopics: "CONCAT|SUBSTRING|TRIM|REPLACE|LENGTH|UPPER|LOWER|SPLIT|regex extraction|regex replacement|string aggregation|cleansing|parsing" },
  { category: "Dates and timestamps", importance: "important", exposure: 60, subtopics: "parsing|formatting|date arithmetic|intervals|DATEDIFF|DATEADD|extraction|truncation|month-end|fiscal calendars|business days|rolling periods|time zones|timestamp precision" },
  { category: "Numeric operations", subtopics: "ROUND|CEIL|FLOOR|MOD|ABS|powers|logarithms|safe division|decimals|precision|overflow" },
  { category: "Type conversion", subtopics: "CAST|CONVERT|implicit conversion|safe casting|invalid values|type precedence" },
  { category: "Window fundamentals", importance: "important", exposure: 100, subtopics: "OVER|PARTITION BY|ORDER BY in windows|ROWS|RANGE|window frames|unbounded preceding|current row|following|named windows" },
  { category: "Ranking", importance: "important", exposure: 60, subtopics: "ROW_NUMBER|RANK|DENSE_RANK|NTILE|tie handling|top-N per group|deduplication|percentile segmentation" },
  { category: "Offset functions", importance: "important", exposure: 50, subtopics: "LAG|LEAD|offsets|default values|null behavior|change detection|period-over-period analysis|gaps|sessionization|sequence comparison" },
  { category: "Value window functions", importance: "important", exposure: 50, subtopics: "FIRST_VALUE|LAST_VALUE|NTH_VALUE|frame errors|first and last per group" },
  { category: "Aggregate window functions", importance: "important", exposure: 75, subtopics: "running totals|moving averages|rolling counts|cumulative percentages|partition totals|percentage of total|rolling minimum|rolling maximum" },
  { category: "Statistical functions", importance: "advanced", exposure: 85, subtopics: "PERCENT_RANK|CUME_DIST|percentile functions|median|quartiles|distributions|outliers" },
  { category: "Pivoting", importance: "advanced", exposure: 75, subtopics: "PIVOT|UNPIVOT|conditional pivots|dynamic pivot concepts|row-to-column|column-to-row" },
  { category: "Data modification", importance: "important", exposure: 60, subtopics: "INSERT|UPDATE|DELETE|MERGE|UPSERT|bulk loading|idempotent changes|slowly changing dimensions" },
  { category: "Transactions", importance: "advanced", exposure: 100, subtopics: "ACID|COMMIT|ROLLBACK|SAVEPOINT|isolation levels|dirty reads|non-repeatable reads|phantom reads|locking|deadlocks|optimistic concurrency|pessimistic concurrency" },
  { category: "Database objects", subtopics: "tables|views|materialized views|temporary tables|stored procedures|functions|triggers|sequences|synonyms" },
  { category: "Constraints", subtopics: "primary keys|foreign keys|unique constraints|check constraints|defaults|referential integrity|cascade behavior|surrogate keys|natural keys" },
  { category: "Data modeling", importance: "advanced", exposure: 100, subtopics: "normalization|denormalization|1NF|2NF|3NF|star schema|snowflake schema|facts|dimensions|grain|bridge tables|conformed dimensions|slowly changing dimensions" },
  { category: "Indexing", importance: "advanced", exposure: 100, subtopics: "clustered indexes|nonclustered indexes|composite indexes|covering indexes|filtered indexes|selectivity|index order|scans|seeks|included columns|maintenance|over-indexing" },
  { category: "Query optimization", importance: "advanced", exposure: 125, subtopics: "execution plans|logical plans|physical plans|cardinality estimation|sargability|predicate pushdown|scans versus seeks|nested-loop join|hash join|merge join|sorting|memory grants|spills|statistics|partition pruning|cost-based optimization|query rewriting" },
  { category: "Partitioning", importance: "advanced", exposure: 90, subtopics: "range partitioning|hash partitioning|list partitioning|partition elimination|partition maintenance|partition skew" },
  { category: "Advanced analytical patterns", importance: "advanced", exposure: 125, subtopics: "cohort analysis|retention|funnel analysis|churn|customer lifetime value|attribution|time-series comparison|anomaly detection|sessionization patterns|streaks|gaps and islands|overlapping intervals|interval merging" },
  { category: "Temporal data", importance: "advanced", exposure: 85, subtopics: "effective dating|system time|valid time|point-in-time joins|as-of analysis|temporal tables" },
  { category: "Data-engineering SQL", importance: "advanced", exposure: 125, subtopics: "incremental loads|CDC|watermarking|deduplication pipelines|reconciliation|late-arriving data|audit columns|idempotency|data-quality rules|snapshot tables|dimensional loading|schema evolution" },
  { category: "Security", importance: "advanced", exposure: 80, subtopics: "users|roles|GRANT|REVOKE|least privilege|row-level security|column masking|SQL injection|parameterized queries|encryption concepts" },
  { category: "Dialects", importance: "important", exposure: 40, subtopics: "PostgreSQL|SQL Server|MySQL|Oracle|Snowflake|BigQuery|Spark SQL|Databricks SQL" },
];

const pythonBlueprints: CategoryBlueprint[] = [
  { category: "Foundations", subtopics: "variables|built-in types|operators|conditions|loops|truthiness|equality versus identity|mutability|scope|input and output" },
  { category: "Collections", importance: "important", exposure: 55, subtopics: "lists|tuples|dictionaries|sets|stacks|queues|deque|heaps|Counter|defaultdict|namedtuple|dataclasses" },
  { category: "Functions", importance: "important", exposure: 80, subtopics: "parameters|returns|positional arguments|keyword arguments|defaults|*args|**kwargs|closures|recursion|lambda|higher-order functions|pure functions|annotations" },
  { category: "Comprehensions", subtopics: "list comprehensions|dictionary comprehensions|set comprehensions|nested comprehensions|conditional comprehensions|readability tradeoffs" },
  { category: "Strings", subtopics: "slicing|searching|replacement|formatting|f-strings|parsing|regular expressions|Unicode|encoding|tokenization" },
  { category: "Iteration", importance: "important", exposure: 55, subtopics: "iterables|iterators|generators|yield|generator expressions|lazy evaluation|enumerate|zip|map|filter|reduce" },
  { category: "Exceptions", importance: "important", exposure: 50, subtopics: "exception hierarchy|try|except|else|finally|raise|custom exceptions|chaining|propagation|retries" },
  { category: "Files and serialization", importance: "important", exposure: 60, subtopics: "text files|binary files|CSV|JSON|XML|YAML concepts|pathlib|directory traversal|compression|large-file streaming|serialization safety" },
  { category: "Object-oriented programming", importance: "important", exposure: 100, subtopics: "classes|instances|constructors|instance methods|class methods|static methods|inheritance|composition|polymorphism|encapsulation|abstract classes|protocols|magic methods|properties|descriptors|multiple inheritance|method-resolution order" },
  { category: "Functional Python", importance: "advanced", exposure: 70, subtopics: "immutability|closures|partial functions|decorators|composition|side effects" },
  { category: "Modules and packaging", importance: "important", exposure: 60, subtopics: "imports|module paths|packages|virtual environments|dependency management|pyproject.toml|versioning|packaging concepts" },
  { category: "Type system", importance: "important", exposure: 70, subtopics: "type hints|Optional|Union|generics|TypeVar|Protocol|TypedDict|overloads|static checking|runtime validation" },
  { category: "Testing", importance: "important", exposure: 90, subtopics: "unit tests|integration tests|pytest|fixtures|parametrization|mocks|patching|property-based testing|coverage|isolation|test doubles" },
  { category: "Debugging", importance: "important", exposure: 70, subtopics: "stack traces|logging|debugger|profiling|memory debugging|reproducibility|exception diagnosis" },
  { category: "Concurrency", importance: "advanced", exposure: 110, subtopics: "threading|multiprocessing|asyncio|async|await|event loops|futures|locks|queues|race conditions|deadlocks|GIL|thread pools|process pools" },
  { category: "Performance", importance: "advanced", exposure: 100, subtopics: "time complexity|space complexity|profiling|caching|memoization|vectorization|generators|memory optimization|algorithm choice" },
  { category: "Algorithms and data structures", importance: "advanced", exposure: 220, subtopics: "arrays|strings|linked lists|stacks|queues|hashing|heaps|trees|tries|graphs|sorting|searching|binary search|recursion|backtracking|dynamic programming|greedy algorithms|divide and conquer|BFS|DFS|sliding window|two pointers|prefix sums|intervals|topological sorting|shortest paths|union-find" },
  { category: "Data engineering", importance: "advanced", exposure: 125, subtopics: "ETL|API ingestion|pagination|retries|rate limits|batch processing|file streaming|schema validation|configuration|checkpointing|idempotency|orchestration|database access|parameterized SQL|parallel ingestion|audit logging" },
  { category: "Pandas", importance: "important", exposure: 100, subtopics: "Series|DataFrames|filtering|indexing|groupby|merges|joins|pivots|nulls|dates|reshaping|vectorization|apply|performance|memory optimization|chunk processing" },
  { category: "APIs and networking", importance: "important", exposure: 75, subtopics: "HTTP|REST|authentication|requests|status codes|pagination|retries|timeouts|JSON|API clients|webhook concepts" },
  { category: "Databases", importance: "important", exposure: 75, subtopics: "DB-API|connections|transactions|parameter binding|connection pools|SQLAlchemy|ORMs|bulk insertion|result processing" },
  { category: "Production Python", importance: "advanced", exposure: 125, subtopics: "environment variables|secrets|logging|structured logging|CLI applications|health checks|retries|circuit breakers|graceful shutdown|dependency injection|containers|security|observability|deployment" },
  { category: "Python internals", importance: "advanced", exposure: 100, subtopics: "object model|references|garbage collection|descriptors|metaclasses|context managers|bytecode concepts|copying|import machinery|serialization internals" },
];

const pysparkBlueprints: CategoryBlueprint[] = [
  { category: "Architecture", importance: "important", exposure: 75, subtopics: "driver|executors|cluster managers|jobs|stages|tasks|DAGs|transformations|actions|lazy evaluation|partitions" },
  { category: "Spark configuration", importance: "important", exposure: 60, subtopics: "SparkSession|SparkContext|local mode|cluster mode|application settings|shuffle partitions|executor settings|memory settings" },
  { category: "DataFrame creation", subtopics: "lists|dictionaries|Rows|RDDs|files|explicit schemas|inferred schemas" },
  { category: "Data types and schemas", importance: "important", exposure: 70, subtopics: "primitive types|arrays|maps|structs|nested schemas|nullable fields|schema evolution|validation|casting" },
  { category: "Selection and expressions", subtopics: "select|col|aliases|selectExpr|expressions|literals|column objects" },
  { category: "Filtering", subtopics: "filter|where|predicates|null-safe filters|string filters|date filters|array filters" },
  { category: "Column transformations", subtopics: "withColumn|withColumnRenamed|drop|cast|when|otherwise|expressions|arithmetic" },
  { category: "Null handling", subtopics: "isNull|isNotNull|fillna|dropna|replace|coalesce|null-safe equality|joins with nulls" },
  { category: "String functions", subtopics: "concat|split|substring|regexp_extract|regexp_replace|trim|lower|upper|length|tokenization" },
  { category: "Date and timestamp functions", importance: "important", exposure: 55, subtopics: "to_date|to_timestamp|date_format|datediff|date_add|date_sub|months_between|truncation|time zones|parsing" },
  { category: "Aggregations", importance: "important", exposure: 75, subtopics: "groupBy|agg|count|sum|avg|min|max|countDistinct|approximate distinct|conditional aggregation|statistics" },
  { category: "Joins", importance: "important", exposure: 110, subtopics: "inner join|left join|right join|full join|cross join|semi join|anti join|broadcast join|non-equi join|multi-column join|duplicate columns|ambiguous references|join strategies|join skew" },
  { category: "Window functions", importance: "important", exposure: 110, subtopics: "Window|partitionBy|orderBy|rowsBetween|rangeBetween|row_number|rank|dense_rank|lag|lead|first|last|running totals|moving averages|top-N|sessionization|deterministic ordering" },
  { category: "Complex data types", importance: "important", exposure: 80, subtopics: "arrays|structs|maps|explode|posexplode|inline|element access|higher-order functions|nested-data flattening" },
  { category: "Reshaping", importance: "important", exposure: 60, subtopics: "pivot|unpivot patterns|stack|wide-to-long|long-to-wide" },
  { category: "Deduplication", importance: "important", exposure: 75, subtopics: "distinct|dropDuplicates|window-based deduplication|latest-record selection|deterministic deduplication|CDC deduplication" },
  { category: "Dataset combination", subtopics: "union|unionByName|schema alignment|missing columns|intersect|subtract|exceptAll" },
  { category: "UDFs", importance: "advanced", exposure: 85, subtopics: "Python UDF|pandas UDF|scalar UDF|grouped UDF|Arrow|serialization cost|native-function alternatives|when not to use UDFs" },
  { category: "RDDs", importance: "advanced", exposure: 80, subtopics: "creation|map|flatMap|reduce|reduceByKey|groupByKey|transformations|actions|partitioners|RDD versus DataFrame" },
  { category: "Input and output", importance: "important", exposure: 90, subtopics: "CSV|JSON|Parquet|ORC|Avro concepts|JDBC|partitioned writes|write modes|compression|schema merge|small-file handling" },
  { category: "Partitioning", importance: "advanced", exposure: 100, subtopics: "repartition|coalesce|partitionBy|hash partitioning|range partitioning|pruning|partition sizing|skew" },
  { category: "Performance", importance: "advanced", exposure: 125, subtopics: "Catalyst|Tungsten|logical plans|physical plans|explain|predicate pushdown|column pruning|broadcast joins|adaptive query execution|cache|persist|checkpoint|shuffle reduction|spills|serialization|file sizing" },
  { category: "Skew", importance: "advanced", exposure: 100, subtopics: "detection|salting|broadcast|adaptive skew joins|repartitioning|hot keys" },
  { category: "Memory", importance: "advanced", exposure: 100, subtopics: "driver memory|executor memory|off-heap memory|garbage collection|persistence levels|spilling|out-of-memory debugging|serialization" },
  { category: "Spark SQL", importance: "important", exposure: 70, subtopics: "temporary views|global views|SQL queries|SQL functions|catalog|SQL and DataFrame interoperability" },
  { category: "Structured Streaming", importance: "advanced", exposure: 140, subtopics: "sources|sinks|triggers|output modes|checkpoints|watermarks|late data|stateful processing|streaming aggregations|stream-stream joins|fault tolerance|exactly-once concepts" },
  { category: "Delta Lake", importance: "advanced", exposure: 125, subtopics: "Delta tables|ACID|MERGE|UPDATE|DELETE|time travel|schema enforcement|schema evolution|OPTIMIZE concepts|VACUUM concepts|change data feed|medallion architecture" },
  { category: "Testing", importance: "important", exposure: 75, subtopics: "local SparkSession|fixtures|schema comparison|DataFrame equality|ordering|null comparisons|integration tests|test factories|external dependency handling" },
  { category: "Debugging", importance: "advanced", exposure: 100, subtopics: "Spark UI|plans|stage failures|task failures|Python worker failures|serialization errors|schema errors|shuffle errors|executor loss|data-quality debugging" },
  { category: "Production pipeline design", importance: "advanced", exposure: 150, subtopics: "batch pipelines|incremental pipelines|CDC|bronze|silver|gold|idempotency|retries|checkpoints|late-arriving data|backfills|audit logging|data quality|orchestration|schema evolution|recovery" },
  { category: "Platforms", importance: "advanced", exposure: 85, subtopics: "Databricks|Azure Databricks|AWS EMR|Google Dataproc|object storage|autoscaling|job clusters|interactive clusters|cluster policies|serverless Spark concepts" },
];

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/(^-|-$)/gu, "");

function dimensions(technology: Technology, category: string, subtopic: string) {
  if (technology === "sql" && subtopic === "LAG") {
    return ["basic syntax", "partitioning", "ordering", "deterministic tie handling", "offsets", "default values", "null behavior", "difference calculation", "percentage change", "date-gap analysis", "change detection", "sessionization", "consecutive-event analysis", "LAG versus LEAD", "LAG versus self-join", "production scenarios", "interview scenarios"];
  }
  return ["syntax and API", "correctness", "edge cases", "debugging", "performance", "production use", "interview reasoning"].map((item) => `${subtopic}: ${item}`);
}

function expand(technology: Technology, blueprints: CategoryBlueprint[]) {
  const foundationId = `${technology}-${slug(blueprints[0]!.category)}-${slug(blueprints[0]!.subtopics.split("|")[0]!)}`;
  return blueprints.flatMap((blueprint, categoryIndex) =>
    blueprint.subtopics.split("|").map((subtopic, subtopicIndex) => ({
      id: `${technology}-${slug(blueprint.category)}-${slug(subtopic)}`,
      technology,
      category: blueprint.category,
      topic: blueprint.category,
      subtopic,
      prerequisites: categoryIndex === 0 && subtopicIndex === 0 ? [] : [foundationId],
      importance: blueprint.importance ?? "core",
      targetExposure: blueprint.exposure ?? 30,
      skillDimensions: dimensions(technology, blueprint.category, subtopic),
    } satisfies CurriculumNode)),
  );
}

const baseCurriculum: CurriculumNode[] = [
  ...expand("sql", sqlBlueprints),
  ...expand("python", pythonBlueprints),
  ...expand("pyspark", pysparkBlueprints),
];

const prerequisiteOverrides: Record<string, string[]> = {
  "sql-offset-functions-lag": ["sql-foundations-select", "sql-sorting-and-pagination-order-by", "sql-window-fundamentals-over", "sql-window-fundamentals-partition-by"],
  "sql-aggregate-window-functions-moving-averages": ["sql-aggregation-group-by", "sql-window-fundamentals-over", "sql-window-fundamentals-rows"],
  "sql-advanced-analytical-patterns-anomaly-detection": ["sql-aggregate-window-functions-moving-averages", "sql-null-handling-is-null", "sql-filtering-comparison-operators", "sql-common-table-expressions-basic-cte"],
  "python-data-engineering-etl": ["python-foundations-variables", "python-foundations-conditions", "python-foundations-loops", "python-collections-dictionaries", "python-functions-parameters"],
  "pyspark-window-functions-window": ["pyspark-selection-and-expressions-select", "pyspark-filtering-filter", "pyspark-aggregations-groupby"],
  "pyspark-performance-adaptive-query-execution": ["pyspark-architecture-dags", "pyspark-partitioning-repartition", "pyspark-joins-join-strategies"],
};

export const curriculum: CurriculumNode[] = baseCurriculum.map((node) => ({ ...node, prerequisites: prerequisiteOverrides[node.id] ?? node.prerequisites }));

export const curriculumByTechnology = (technology: Technology) => curriculum.filter((node) => node.technology === technology);
export const curriculumById = new Map(curriculum.map((node) => [node.id, node]));
export const DEFAULT_SQL_DIALECT = "PostgreSQL";
