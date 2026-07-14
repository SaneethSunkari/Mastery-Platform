import { CourseSlug } from "@/lib/types";

export interface QuestionBankEntry {
  id: string;
  courseSlug: CourseSlug;
  stage: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  title: string;
  prompt: string;
}

export interface AcademyTrack {
  slug: CourseSlug;
  title: string;
  shortLabel: string;
  tagline: string;
  description: string;
  roleFocus: string;
  weeklyTaskCount: number;
  questionBankCount: number;
  arcadeLevelCount: number;
  capstoneCount: number;
  projectsCount: number;
  dailyMinutes: number;
  continueHref: string;
  supportCopy: string;
  stageLadder: string[];
  materialPillars: string[];
  monthPlan: Array<{
    month: number;
    title: string;
    summary: string;
    focus: string[];
    deliverable: string;
  }>;
  targetOutcomes: string[];
  gameThemes: string[];
  surfaceClassName: string;
  badgeClassName: string;
  buttonClassName: string;
}

const stageDefaults = [
  "Foundations",
  "Working analyst",
  "Pipeline builder",
  "Warehouse engineer",
  "Production debugger",
  "Senior-level scenarios",
];

const trackInputs: AcademyTrack[] = [
  {
    slug: "sql",
    title: "SQL Data Engineering",
    shortLabel: "SQL",
    tagline: "From SELECT basics to warehouse-grade SQL and performance debugging.",
    description:
      "Learn SQL the way a data engineer uses it: schema reading, joins, windows, ETL validation, dimensional modeling, and incident-ready debugging.",
    roleFocus: "Analytics engineering, warehouse SQL, data quality checks, and production troubleshooting.",
    weeklyTaskCount: 1000,
    questionBankCount: 1000,
    arcadeLevelCount: 3000,
    capstoneCount: 8,
    projectsCount: 12,
    dailyMinutes: 90,
    continueHref: "/sql/week/sql-week-01",
    supportCopy: "Start with step-by-step weekly labs, then reinforce the same concepts through a separate arcade lane.",
    stageLadder: stageDefaults,
    materialPillars: [
      "Easy language explanations for tables, keys, grain, and joins.",
      "Real data-engineering SQL: reconciliation, incremental loads, SCD logic, and validation queries.",
      "Interview patterns: gaps and islands, top-N per group, deduplication, cohort logic, and tuning.",
      "Production habits: readable SQL, safe rewrites, and metric debugging under pressure.",
    ],
    monthPlan: [
      {
        month: 1,
        title: "SQL foundations",
        summary: "Learn how tables, rows, filters, sorting, joins, and aggregates really work.",
        focus: ["SELECT and WHERE", "ORDER BY and LIMIT", "JOIN basics", "GROUP BY"],
        deliverable: "Write clean beginner SQL queries from a blank editor.",
      },
      {
        month: 2,
        title: "Intermediate querying",
        summary: "Move into stronger joins, subqueries, CTEs, and multi-step business logic.",
        focus: ["INNER and LEFT JOIN", "subqueries", "CTEs", "CASE logic"],
        deliverable: "Solve realistic analytics and reporting tasks with confidence.",
      },
      {
        month: 3,
        title: "Analytical SQL",
        summary: "Handle ranking, windows, cohorts, and business metrics correctly.",
        focus: ["window functions", "retention", "top-N problems", "deduplication"],
        deliverable: "Answer interview-style analytical SQL problems correctly.",
      },
      {
        month: 4,
        title: "Data engineering SQL",
        summary: "Use SQL for ETL checks, warehouse modeling, and data quality work.",
        focus: ["reconciliation", "incremental loads", "SCD logic", "quality checks"],
        deliverable: "Build trustworthy transformation and validation queries.",
      },
      {
        month: 5,
        title: "Performance and production",
        summary: "Read plans, reason about indexes, and debug broken metrics.",
        focus: ["query plans", "indexes", "sargability", "incident debugging"],
        deliverable: "Tune and repair production-style SQL workflows.",
      },
      {
        month: 6,
        title: "Legend SQL",
        summary: "Finish with capstones, warehouse thinking, and end-to-end business problem solving.",
        focus: ["capstones", "mixed business cases", "review loops", "explanation skill"],
        deliverable: "Think like a strong data engineer, not just a syntax learner.",
      },
    ],
    targetOutcomes: [
      "Write clean reporting and transformation queries from scratch.",
      "Debug wrong metrics, duplicate explosions, and left join regressions.",
      "Design warehouse-ready models and defend query performance choices.",
    ],
    gameThemes: [
      "SELECT basics",
      "Filtering",
      "Sorting",
      "Aliases",
      "Expressions",
      "Aggregations",
      "Joins",
      "Set operations",
      "CTEs",
      "Subqueries",
      "Window functions",
      "Temporal SQL",
      "Data quality",
      "Dimensional modeling",
      "Performance tuning",
      "Production debugging",
    ],
    surfaceClassName: "from-amber-500/20 via-orange-500/10 to-transparent",
    badgeClassName: "bg-amber-400/15 text-amber-200 hover:bg-amber-400/15",
    buttonClassName: "bg-amber-300 text-slate-950 hover:bg-amber-200",
  },
  {
    slug: "python",
    title: "Python for Data Engineering",
    shortLabel: "Python",
    tagline: "From core syntax to automation, testing, ETL code, and production design.",
    description:
      "Build practical Python skill for data engineering: clean fundamentals, file and API handling, transformation code, testing, packaging, and pipeline-friendly design.",
    roleFocus: "Automation, ETL scripts, orchestration support code, testing, and maintainable backend habits.",
    weeklyTaskCount: 1000,
    questionBankCount: 1000,
    arcadeLevelCount: 3000,
    capstoneCount: 8,
    projectsCount: 10,
    dailyMinutes: 90,
    continueHref: "/python/week/python-week-01",
    supportCopy: "Use simple explanations first, then practice with drills, mini-builds, and interview-style coding rounds.",
    stageLadder: stageDefaults,
    materialPillars: [
      "Easy-to-understand basics: variables, loops, functions, collections, and errors.",
      "Data-engineering workflows: files, JSON, APIs, config, logging, and batch automation.",
      "Production code: testing, packaging, debugging, performance, and maintainable structure.",
      "Analysis support: pandas-style transformations, validation utilities, and reusable helpers.",
    ],
    monthPlan: [
      {
        month: 1,
        title: "Python foundations",
        summary: "Start with syntax, variables, loops, functions, and basic collections.",
        focus: ["variables", "loops", "functions", "lists and dicts"],
        deliverable: "Write beginner Python cleanly from a blank editor.",
      },
      {
        month: 2,
        title: "Practical Python",
        summary: "Work with strings, files, JSON, and reusable functions.",
        focus: ["files", "JSON", "exceptions", "modular code"],
        deliverable: "Build useful small scripts instead of isolated toy examples.",
      },
      {
        month: 3,
        title: "Data workflow coding",
        summary: "Use Python to clean data, validate records, and automate repetitive work.",
        focus: ["data cleaning", "validation", "iteration", "light pandas work"],
        deliverable: "Turn raw data tasks into working Python solutions.",
      },
      {
        month: 4,
        title: "Engineering habits",
        summary: "Adopt testing, logging, packaging, and structured code organization.",
        focus: ["pytest", "logging", "project structure", "debugging"],
        deliverable: "Write maintainable code that another engineer can reuse.",
      },
      {
        month: 5,
        title: "Production Python",
        summary: "Handle larger ETL-style scripts, transformations, and operational behavior.",
        focus: ["ETL code", "configuration", "batch logic", "error handling"],
        deliverable: "Build pipeline-friendly Python for real data work.",
      },
      {
        month: 6,
        title: "Legend Python",
        summary: "Finish with capstones, interview-style coding, and strong debugging skill.",
        focus: ["capstones", "interview patterns", "refactoring", "problem decomposition"],
        deliverable: "Use Python like a dependable data engineer, not just a beginner coder.",
      },
    ],
    targetOutcomes: [
      "Write clean transformation and utility code without copy-paste chaos.",
      "Build scripts that read files, call APIs, validate data, and log clearly.",
      "Use tests and modular design like a dependable data engineer, not just a notebook user.",
    ],
    gameThemes: [
      "Variables",
      "Control flow",
      "Lists and dicts",
      "Functions",
      "Strings",
      "Files",
      "Exceptions",
      "Modules",
      "Classes",
      "Testing",
      "Iterators",
      "Data processing",
      "Pandas patterns",
      "Performance",
      "Refactoring",
      "Production Python",
    ],
    surfaceClassName: "from-teal-500/20 via-cyan-500/10 to-transparent",
    badgeClassName: "bg-teal-400/15 text-teal-200 hover:bg-teal-400/15",
    buttonClassName: "bg-teal-300 text-slate-950 hover:bg-teal-200",
  },
  {
    slug: "pyspark",
    title: "PySpark for Large-Scale Pipelines",
    shortLabel: "PySpark",
    tagline: "From DataFrame basics to partitioning, optimization, and lakehouse-scale jobs.",
    description:
      "Learn PySpark like a working data engineer: transformations, joins, windows, Spark execution, partition strategy, incremental jobs, and scale-aware debugging.",
    roleFocus: "Distributed transforms, batch pipelines, Spark tuning, and large-volume data platform work.",
    weeklyTaskCount: 1000,
    questionBankCount: 1000,
    arcadeLevelCount: 3000,
    capstoneCount: 6,
    projectsCount: 8,
    dailyMinutes: 75,
    continueHref: "/pyspark/week/pyspark-week-01",
    supportCopy: "This lane stays separate from weekly missions so you can rehearse Spark thinking with short game-style challenges.",
    stageLadder: stageDefaults,
    materialPillars: [
      "Easy explanations for Spark sessions, DataFrames, lazy execution, and wide vs narrow transforms.",
      "Core engineering patterns: joins, windows, deduplication, partitioning, caching, and schema control.",
      "Pipeline thinking: incremental loads, quality checks, lakehouse tables, and replay-safe jobs.",
      "Performance and debugging: skew, shuffle cost, repartition strategy, and job inspection.",
    ],
    monthPlan: [
      {
        month: 1,
        title: "Spark foundations",
        summary: "Understand Spark sessions, DataFrames, schemas, and lazy execution simply.",
        focus: ["SparkSession", "DataFrames", "schemas", "lazy execution"],
        deliverable: "Read and write basic PySpark transformations confidently.",
      },
      {
        month: 2,
        title: "Transformation basics",
        summary: "Filter, select, derive columns, and shape datasets the PySpark way.",
        focus: ["select", "filter", "withColumn", "column expressions"],
        deliverable: "Solve row-level transformation tasks clearly.",
      },
      {
        month: 3,
        title: "Join and aggregate at scale",
        summary: "Use joins, groupings, and windows while thinking about data size.",
        focus: ["joins", "groupBy", "aggregations", "windows"],
        deliverable: "Translate analytical logic into scalable DataFrame code.",
      },
      {
        month: 4,
        title: "Pipeline thinking",
        summary: "Build incremental jobs, handle duplicates, and run quality checks.",
        focus: ["incremental loads", "deduplication", "quality checks", "schema safety"],
        deliverable: "Think like a pipeline builder, not just a notebook user.",
      },
      {
        month: 5,
        title: "Performance and tuning",
        summary: "Reason about repartitioning, skew, caching, and expensive shuffles.",
        focus: ["partitions", "shuffle cost", "cache", "skew debugging"],
        deliverable: "Spot and improve slow or unstable PySpark logic.",
      },
      {
        month: 6,
        title: "Legend PySpark",
        summary: "Finish with batch pipeline thinking, lakehouse patterns, and production-ready habits.",
        focus: ["lakehouse workflows", "runtime validation", "capstones", "debugging"],
        deliverable: "Understand PySpark as a real data-engineering tool, not just syntax.",
      },
    ],
    targetOutcomes: [
      "Read and write real PySpark transformations with confidence.",
      "Reason about partitions, shuffles, and schema behavior before performance breaks.",
      "Design scalable ETL jobs that match warehouse and lakehouse workflows.",
    ],
    gameThemes: [
      "Spark basics",
      "DataFrames",
      "Schema handling",
      "Column expressions",
      "Filtering",
      "Aggregations",
      "Joins",
      "Windows",
      "Null handling",
      "Deduplication",
      "Partitioning",
      "Caching",
      "Incremental jobs",
      "Quality checks",
      "Performance",
      "Lakehouse patterns",
    ],
    surfaceClassName: "from-sky-500/20 via-blue-500/10 to-transparent",
    badgeClassName: "bg-sky-400/15 text-sky-200 hover:bg-sky-400/15",
    buttonClassName: "bg-sky-300 text-slate-950 hover:bg-sky-200",
  },
];

const topicsByTrack: Record<CourseSlug, string[]> = {
  sql: [
    "projection",
    "filters",
    "joins",
    "grouping",
    "windows",
    "temporal logic",
    "warehousing",
    "performance",
    "data quality",
    "debugging",
  ],
  python: [
    "functions",
    "collections",
    "files",
    "exceptions",
    "testing",
    "oop design",
    "etl scripts",
    "data validation",
    "performance",
    "debugging",
  ],
  pyspark: [
    "dataframes",
    "schemas",
    "joins",
    "windows",
    "partitioning",
    "deduplication",
    "incremental loads",
    "quality checks",
    "performance",
    "lakehouse jobs",
  ],
};

const verbsByTrack: Record<CourseSlug, string[]> = {
  sql: ["write", "repair", "optimize", "validate", "compare", "design"],
  python: ["build", "refactor", "debug", "test", "design", "automate"],
  pyspark: ["transform", "tune", "debug", "partition", "validate", "scale"],
};

const artifactsByTrack: Record<CourseSlug, string[]> = {
  sql: ["query", "report", "mart", "quality check", "warehouse model", "incident fix"],
  python: ["script", "utility", "pipeline helper", "test suite", "module", "automation flow"],
  pyspark: ["job", "DataFrame pipeline", "batch load", "Spark transform", "reconciliation check", "lakehouse task"],
};

const difficultyForQuestion = (index: number, total: number): QuestionBankEntry["difficulty"] => {
  const ratio = (index + 1) / total;
  if (ratio <= 0.3) return "easy";
  if (ratio <= 0.6) return "medium";
  if (ratio <= 0.85) return "hard";
  return "expert";
};

const buildQuestionBankForTrack = (track: AcademyTrack): QuestionBankEntry[] =>
  Array.from({ length: track.questionBankCount }, (_, index) => {
    const topic = topicsByTrack[track.slug][index % topicsByTrack[track.slug].length];
    const verb = verbsByTrack[track.slug][index % verbsByTrack[track.slug].length];
    const artifact = artifactsByTrack[track.slug][index % artifactsByTrack[track.slug].length];
    const stage = track.stageLadder[Math.floor((index / track.questionBankCount) * track.stageLadder.length)] ?? track.stageLadder.at(-1) ?? "Mastery";
    const difficulty = difficultyForQuestion(index, track.questionBankCount);

    return {
      id: `${track.slug}-question-${String(index + 1).padStart(4, "0")}`,
      courseSlug: track.slug,
      stage,
      topic,
      difficulty,
      title: `${track.shortLabel} ${index + 1}: ${verb[0].toUpperCase()}${verb.slice(1)} a ${artifact}`,
      prompt: `Solve a ${difficulty} ${track.shortLabel} challenge about ${topic}. Keep the answer clean, production-aware, and easy to explain.`,
    };
  });

export const academyTracks = trackInputs;
export const academyTrackMap = Object.fromEntries(
  academyTracks.map((track) => [track.slug, track]),
) as Record<CourseSlug, AcademyTrack>;

export const questionBank = academyTracks.flatMap(buildQuestionBankForTrack);

export const academyStats = {
  tracks: academyTracks.length,
  totalWeeklyTasks: academyTracks.reduce((sum, track) => sum + track.weeklyTaskCount, 0),
  totalQuestions: questionBank.length,
  totalArcadeLevels: academyTracks.reduce((sum, track) => sum + track.arcadeLevelCount, 0),
  totalCandyArcadeLevels: 3000,
  totalCapstones: academyTracks.reduce((sum, track) => sum + track.capstoneCount, 0),
  totalProjects: academyTracks.reduce((sum, track) => sum + track.projectsCount, 0),
};

export const academyBuildStatus = {
  roadmapMonthsTarget: 6,
  roadmapWeeksTarget: 24,
  freeTierSqlWeeksLive: 4,
  sqlVerifiedWeeksLive: 4,
  pythonVerifiedWeeksLive: 0,
  pysparkVerifiedWeeksLive: 0,
  verifiedTriLanguageArcadeQuestionsLive: 0,
  plannedPerTrackCapacity: 1000,
  plannedTriLanguageArcadeCapacity: 3000,
};

export const getTrackQuestionSamples = (courseSlug: CourseSlug, count = 4) =>
  questionBank.filter((item) => item.courseSlug === courseSlug).slice(0, count);
