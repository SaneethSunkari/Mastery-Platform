import { CourseSlug } from "@/lib/types";

export interface QuestionBankEntry {
  id: string;
  courseSlug: CourseSlug;
  levelNumber: number;
  stage: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  title: string;
  prompt: string;
  businessGoal: string;
  deliverable: string;
  hints: string[];
  masteryAngle: string;
  relatedChapterId: string;
}

export interface MaterialChapter {
  id: string;
  courseSlug: CourseSlug;
  chapterNumber: number;
  month: number;
  stage: string;
  title: string;
  summary: string;
  whyItMatters: string;
  keyIdeas: string[];
  commonMistakes: string[];
  practiceMoves: string[];
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
    weeklyTaskCount: 60,
    questionBankCount: 3000,
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
    weeklyTaskCount: 48,
    questionBankCount: 3000,
    arcadeLevelCount: 3000,
    capstoneCount: 8,
    projectsCount: 10,
    dailyMinutes: 90,
    continueHref: "/python",
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
    weeklyTaskCount: 48,
    questionBankCount: 3000,
    arcadeLevelCount: 3000,
    capstoneCount: 6,
    projectsCount: 8,
    dailyMinutes: 75,
    continueHref: "/pyspark",
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

const businessGoalsByTrack: Record<CourseSlug, string[]> = {
  sql: [
    "recover a broken warehouse KPI before the business review",
    "build a clean customer revenue view for analytics engineering",
    "validate an incremental load before downstream dashboards refresh",
    "debug duplication and grain mismatch in a finance mart",
    "ship a production-safe reconciliation query for an ETL handoff",
  ],
  python: [
    "clean and validate pipeline input before batch processing starts",
    "build reusable automation for a daily data ingestion job",
    "repair a brittle transformation script that keeps failing in production",
    "create maintainable utility code another engineer can extend safely",
    "write dependable validation and logging around data movement",
  ],
  pyspark: [
    "shape a large event stream into a reliable downstream fact table",
    "stabilize a distributed job before the next scheduled batch window",
    "design a replay-safe incremental transformation at scale",
    "reduce shuffle pain in a wide transformation pipeline",
    "prepare a lakehouse-style batch job for production review",
  ],
};

const deliverablesByTrack: Record<CourseSlug, string[]> = {
  sql: [
    "Return the exact result set with clean naming and explain the output grain.",
    "Write the final query as if it will be reviewed by an analytics engineer.",
    "Keep the logic readable enough for incident debugging at 2 AM.",
    "Solve it with maintainable SQL rather than a lucky one-off answer.",
  ],
  python: [
    "Write clean executable logic with readable function boundaries.",
    "Prefer maintainable code structure over clever shortcuts.",
    "Design the solution the way a data engineer would hand it to a teammate.",
    "Make the transformation steps obvious enough for later debugging.",
  ],
  pyspark: [
    "Express the transformation in DataFrame-style logic with scale awareness.",
    "Keep partition and shuffle implications in mind while solving the task.",
    "Write the code the way a production Spark pipeline would want it.",
    "Use readable staged transformations instead of a tangled notebook blob.",
  ],
};

const hintThemesByTrack: Record<CourseSlug, string[]> = {
  sql: [
    "Start by stating the input table grain before writing the query.",
    "Decide whether this is projection, filtering, aggregation, or comparison first.",
    "Check whether the requested output needs sorting, deduplication, or grouping.",
    "Prefer a readable CTE if the business logic has more than one step.",
  ],
  python: [
    "Name the input and output shape before touching the loop or function.",
    "Break the transformation into small steps you could unit test later.",
    "Reach for clear function boundaries instead of writing everything inline.",
    "Think about validation and failure handling before the happy path only.",
  ],
  pyspark: [
    "Think about row shape and partition behavior before chaining transforms.",
    "Prefer explicit column logic so the transformation stays debuggable.",
    "Ask whether the step is narrow or wide and why that matters.",
    "Keep Spark lazy execution in mind when structuring the solution.",
  ],
};

const masteryAnglesByTrack: Record<CourseSlug, string[]> = {
  sql: [
    "output grain discipline",
    "business-metric correctness",
    "warehouse readability",
    "production debugging clarity",
    "performance-safe thinking",
  ],
  python: [
    "clean code structure",
    "ETL reliability",
    "testability",
    "operational safety",
    "refactoring discipline",
  ],
  pyspark: [
    "distributed transformation thinking",
    "partition awareness",
    "shuffle cost control",
    "schema discipline",
    "pipeline-scale debugging",
  ],
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
    const businessGoal = businessGoalsByTrack[track.slug][index % businessGoalsByTrack[track.slug].length];
    const deliverable = deliverablesByTrack[track.slug][index % deliverablesByTrack[track.slug].length];
    const masteryAngle = masteryAnglesByTrack[track.slug][index % masteryAnglesByTrack[track.slug].length];
    const stage = track.stageLadder[Math.floor((index / track.questionBankCount) * track.stageLadder.length)] ?? track.stageLadder.at(-1) ?? "Mastery";
    const difficulty = difficultyForQuestion(index, track.questionBankCount);
    const levelNumber = index + 1;
    const monthIndex = Math.min(Math.floor(index / (track.questionBankCount / track.monthPlan.length)), track.monthPlan.length - 1);
    const month = track.monthPlan[monthIndex];
    const focusTopic = month?.focus[index % month.focus.length] ?? topic;
    const hints = [
      hintThemesByTrack[track.slug][index % hintThemesByTrack[track.slug].length],
      `Stay aligned with the ${stage.toLowerCase()} stage and keep the answer easy to explain.`,
      `Connect the solution to ${focusTopic.toLowerCase()} so the drill reinforces the current month.`,
    ];

    return {
      id: `${track.slug}-question-${String(levelNumber).padStart(4, "0")}`,
      courseSlug: track.slug,
      levelNumber,
      stage,
      topic,
      difficulty,
      title: `${track.shortLabel} ${levelNumber}: ${verb[0].toUpperCase()}${verb.slice(1)} a ${artifact}`,
      prompt: `Solve a ${difficulty} ${track.shortLabel} challenge about ${topic} for a data-engineering workflow. This drill sits in ${stage.toLowerCase()} and should feel like real project work, not theory-only reading.`,
      businessGoal,
      deliverable,
      hints,
      masteryAngle,
      relatedChapterId: `${track.slug}-chapter-${String(monthIndex * 4 + (index % 4) + 1).padStart(3, "0")}`,
    };
  });

const buildMaterialChaptersForTrack = (track: AcademyTrack): MaterialChapter[] =>
  track.monthPlan.flatMap((monthPlan, monthIndex) =>
    monthPlan.focus.map((focus, focusIndex) => {
      const chapterNumber = monthIndex * monthPlan.focus.length + focusIndex + 1;
      const stage =
        track.stageLadder[Math.min(monthIndex, track.stageLadder.length - 1)] ?? track.stageLadder.at(-1) ?? "Mastery";
      const topic = topicsByTrack[track.slug][(monthIndex * monthPlan.focus.length + focusIndex) % topicsByTrack[track.slug].length];
      const verb = verbsByTrack[track.slug][(monthIndex * monthPlan.focus.length + focusIndex) % verbsByTrack[track.slug].length];
      const artifact = artifactsByTrack[track.slug][(monthIndex * monthPlan.focus.length + focusIndex) % artifactsByTrack[track.slug].length];

      return {
        id: `${track.slug}-chapter-${String(chapterNumber).padStart(3, "0")}`,
        courseSlug: track.slug,
        chapterNumber,
        month: monthPlan.month,
        stage,
        title: `${monthPlan.title}: ${focus}`,
        summary: `Easy-notes chapter for ${focus.toLowerCase()} inside ${track.title.toLowerCase()}. Learn the concept simply first, then connect it to the way a data engineer would ${verb} a ${artifact}.`,
        whyItMatters: `${focus} matters in real work because it directly affects ${businessGoalsByTrack[track.slug][(monthIndex + focusIndex) % businessGoalsByTrack[track.slug].length]}.`,
        keyIdeas: [
          `Understand the core mental model behind ${focus.toLowerCase()} before memorizing syntax.`,
          `Tie ${focus.toLowerCase()} back to ${topic} so the concept stays useful under pressure.`,
          `Use ${focus.toLowerCase()} in a way another engineer can read, review, and maintain.`,
        ],
        commonMistakes: [
          `Rushing into code without naming the expected output or business contract for ${focus.toLowerCase()}.`,
          `Treating ${focus.toLowerCase()} like isolated syntax instead of part of a bigger data workflow.`,
          `Skipping readability and operational safety when solving ${focus.toLowerCase()} tasks.`,
        ],
        practiceMoves: [
          `Solve 15-20 drills around ${focus.toLowerCase()} before moving on.`,
          `Explain ${focus.toLowerCase()} out loud in simple language after each study block.`,
          `Rewrite one messy answer into a cleaner production-style solution using ${focus.toLowerCase()}.`,
        ],
      };
    }),
  );

export const academyTracks = trackInputs;
export const academyTrackMap = Object.fromEntries(
  academyTracks.map((track) => [track.slug, track]),
) as Record<CourseSlug, AcademyTrack>;

export const questionBank = academyTracks.flatMap(buildQuestionBankForTrack);
export const materialChapters = academyTracks.flatMap(buildMaterialChaptersForTrack);

export const academyStats = {
  tracks: academyTracks.length,
  totalWeeklyTasks: academyTracks.reduce((sum, track) => sum + track.weeklyTaskCount, 0),
  totalQuestions: questionBank.length,
  totalArcadeLevels: academyTracks.reduce((sum, track) => sum + track.arcadeLevelCount, 0),
  totalCandyArcadeLevels: 3000,
  totalCapstones: academyTracks.reduce((sum, track) => sum + track.capstoneCount, 0),
  totalProjects: academyTracks.reduce((sum, track) => sum + track.projectsCount, 0),
  totalMaterialChapters: materialChapters.length,
};

export const academyBuildStatus = {
  roadmapMonthsTarget: 6,
  roadmapWeeksTarget: 24,
  freeTierSqlWeeksLive: 4,
  sqlVerifiedWeeksLive: 24,
  sqlVerifiedTaskCount: 3000,
  pythonVerifiedTaskCount: 3000,
  pysparkStructurallyVerifiedTaskCount: 3000,
  pysparkRuntimeVerifiedTaskCount: 9,
  pythonVerifiedWeeksLive: 0,
  pysparkVerifiedWeeksLive: 0,
  verifiedTriLanguageArcadeQuestionsLive: 3000,
  verifiedTriLanguageArcadeSolutionsLive: 9000,
  generatedQuestionBankPerTrackLive: 3000,
  generatedTrackGameLevelsPerTrackLive: 3000,
  generatedMaterialChaptersPerTrackLive: 24,
  plannedPerTrackCapacity: 3000,
  plannedTriLanguageArcadeCapacity: 3000,
};

export const getTrackQuestionSamples = (courseSlug: CourseSlug, count = 4) =>
  questionBank.filter((item) => item.courseSlug === courseSlug).slice(0, count);

export const getTrackQuestions = (courseSlug: CourseSlug) =>
  questionBank.filter((item) => item.courseSlug === courseSlug);

export const getTrackMaterialChapters = (courseSlug: CourseSlug) =>
  materialChapters.filter((item) => item.courseSlug === courseSlug);
