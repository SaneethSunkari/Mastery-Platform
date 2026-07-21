import { CourseSlug } from "@/lib/types";
import { courses, getLessonsByWeek, getWeeksByCourse, getWeekById, lessons } from "@/lib/curriculum";

export interface MaterialCodeExample {
  id: string;
  title: string;
  language: "sql" | "python";
  code: string;
  expectedOutput: string;
  explanation: string;
}

export interface MaterialLesson {
  id: string;
  track: CourseSlug;
  weekId: string;
  moduleId: string;
  moduleTitle: string;
  moduleWeekNumber: number;
  monthNumber: number;
  levelBand: string;
  title: string;
  summary: string;
  estimatedReadingMinutes: number;
  objectives: string[];
  prerequisites: string[];
  prerequisiteLessonIds: string[];
  explanation: string;
  mentalModel: string;
  syntaxReference: string[];
  examples: MaterialCodeExample[];
  commonMistakes: string[];
  debuggingGuidance: string[];
  performanceImplications: string[];
  productionRelevance: string[];
  knowledgeCheck: string[];
  guidedExercise: string;
  independentExercise: string;
  summaryPoints: string[];
  masteryHref: string;
  previousLessonId: string | null;
  nextLessonId: string | null;
  breadcrumbLabel: string;
  searchText: string;
}

export interface MaterialModule {
  id: string;
  track: CourseSlug;
  title: string;
  weekId: string;
  weekNumber: number;
  monthNumber: number;
  levelBand: string;
  lessonIds: string[];
}

export interface MaterialValidationIssue {
  code:
    | "DUPLICATE_LESSON_ID"
    | "MISSING_LESSON"
    | "BROKEN_PREREQUISITE"
    | "BROKEN_PREVIOUS_NEXT"
    | "EMPTY_REQUIRED_SECTION"
    | "INVALID_TRACK"
    | "MISSING_EXERCISE"
    | "MISSING_EXPECTED_OUTPUT"
    | "CIRCULAR_DEPENDENCY";
  message: string;
}

type ExampleTemplate = {
  keywords: string[];
  create: (track: CourseSlug) => MaterialCodeExample[];
};

const levelBands = [
  { maxWeek: 1, label: "Level 0 · Beginner" },
  { maxWeek: 4, label: "Level 1 · Foundations" },
  { maxWeek: 8, label: "Level 2 · Working proficiency" },
  { maxWeek: 12, label: "Level 3 · Job-ready" },
  { maxWeek: 14, label: "Level 4 · Advanced" },
  { maxWeek: 15, label: "Level 5 · Senior production practitioner" },
  { maxWeek: Number.POSITIVE_INFINITY, label: "Level 6 · Legend-level synthesis" },
];

function getLevelBand(weekNumber: number) {
  return levelBands.find((item) => weekNumber <= item.maxWeek)?.label ?? levelBands[levelBands.length - 1].label;
}

function buildMasteryHref(track: CourseSlug, weekId: string, lessonId: string) {
  if (track === "sql") {
    return `/sql/week/${weekId}?lesson=${lessonId}`;
  }

  return `/${track}?week=${weekId}&lesson=${lessonId}`;
}

const exampleTemplates: ExampleTemplate[] = [
  {
    keywords: ["select", "projection", "single-table", "schema"],
    create: () => [
      {
        id: "sql-select-columns",
        title: "Project only the fields you need",
        language: "sql",
        code: "SELECT customer_id, customer_name\nFROM customers\nWHERE is_active = 1\nORDER BY signup_date DESC;",
        expectedOutput: "Returns active customers with only the requested columns, newest signups first.",
        explanation: "This keeps result shape explicit and avoids the hidden cost of SELECT * in reporting queries.",
      },
      {
        id: "sql-distinct-countries",
        title: "De-duplicate one reporting dimension",
        language: "sql",
        code: "SELECT DISTINCT country\nFROM customers\nORDER BY country;",
        expectedOutput: "One row per country, alphabetically sorted.",
        explanation: "DISTINCT is useful when the business question is about unique values instead of full row detail.",
      },
    ],
  },
  {
    keywords: ["null", "filtering", "logic", "where", "between", "in", "like"],
    create: () => [
      {
        id: "sql-null-filter",
        title: "Handle NULL explicitly",
        language: "sql",
        code: "SELECT order_id, payment_method\nFROM orders\nWHERE payment_method IS NULL\n   OR payment_method = 'card';",
        expectedOutput: "Rows with missing payment method plus rows explicitly paid by card.",
        explanation: "NULL does not behave like a regular string value, so you must test it with IS NULL.",
      },
      {
        id: "sql-predicate-grouping",
        title: "Control boolean precedence",
        language: "sql",
        code: "SELECT order_id, status, amount\nFROM orders\nWHERE status = 'paid'\n  AND (amount >= 100 OR payment_method = 'wire');",
        expectedOutput: "Paid orders meeting either the amount threshold or the wire-payment exception.",
        explanation: "Parentheses remove ambiguity and prevent a filter from silently widening.",
      },
    ],
  },
  {
    keywords: ["case", "coalesce", "dates", "strings", "numbers", "casts"],
    create: (track) =>
      track === "sql"
        ? [
            {
              id: "sql-case-bucket",
              title: "Bucket business states clearly",
              language: "sql",
              code: "SELECT customer_id,\n       CASE\n         WHEN is_active = 0 THEN 'inactive'\n         WHEN signup_date >= '2026-01-01' THEN 'new'\n         ELSE 'existing'\n       END AS customer_stage\nFROM customers;",
              expectedOutput: "Each customer receives one readable stage label.",
              explanation: "CASE is most useful when it turns vague operational fields into business-ready categories.",
            },
            {
              id: "sql-coalesce",
              title: "Fill safe display values",
              language: "sql",
              code: "SELECT customer_id,\n       COALESCE(email, 'missing@example.com') AS contact_email\nFROM customers;",
              expectedOutput: "Missing emails become a visible fallback string.",
              explanation: "COALESCE is good for presentation, but it should not hide upstream data quality issues.",
            },
          ]
        : [
            {
              id: `${track}-python-normalize`,
              title: "Normalize a record before downstream use",
              language: "python",
              code: "record = {'name': '  maria  ', 'country': None}\nresult = {\n    'name': record['name'].strip().title(),\n    'country': record['country'] or 'UNKNOWN',\n}\nprint(result)",
              expectedOutput: "{'name': 'Maria', 'country': 'UNKNOWN'}",
              explanation: "Small normalization steps make later validation and joins far easier.",
            },
            {
              id: `${track}-python-safe-cast`,
              title: "Cast carefully before computing",
              language: "python",
              code: "raw_amount = '125.50'\namount = float(raw_amount)\nprint(round(amount * 1.1, 2))",
              expectedOutput: "138.05",
              explanation: "Make conversions explicit so errors are visible at the right step.",
            },
          ],
  },
  {
    keywords: ["aggregation", "metrics", "group-by", "count-distinct"],
    create: () => [
      {
        id: "sql-group-by-metric",
        title: "Aggregate at a safe grain",
        language: "sql",
        code: "SELECT payment_method,\n       COUNT(*) AS paid_orders,\n       SUM(amount) AS paid_revenue\nFROM orders\nWHERE status = 'paid'\nGROUP BY payment_method;",
        expectedOutput: "One metric row per payment method with paid-order volume and revenue.",
        explanation: "Before grouping, decide exactly what one source row means so the metric stays trustworthy.",
      },
      {
        id: "sql-conditional-agg",
        title: "Calculate multiple KPIs in one pass",
        language: "sql",
        code: "SELECT customer_id,\n       COUNT(*) AS orders_total,\n       SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS paid_revenue\nFROM orders\nGROUP BY customer_id;",
        expectedOutput: "One row per customer with order count and paid revenue.",
        explanation: "Conditional aggregation lets you keep related metrics in the same grouped query.",
      },
    ],
  },
  {
    keywords: ["loop", "loops", "iteration", "control flow"],
    create: () => [
      {
        id: "python-loop-running-total",
        title: "Accumulate while iterating",
        language: "python",
        code: "amounts = [20, 30, 50]\ntotal = 0\nfor amount in amounts:\n    total += amount\nprint(total)",
        expectedOutput: "100",
        explanation: "A loop is most useful when each pass changes explicit state you can reason about.",
      },
      {
        id: "python-filter-loop",
        title: "Filter records with clear intent",
        language: "python",
        code: "countries = ['US', 'IN', 'US', 'CA']\nresult = []\nfor country in countries:\n    if country == 'US':\n        result.append(country)\nprint(result)",
        expectedOutput: "['US', 'US']",
        explanation: "Start with explicit control flow before collapsing logic into compact syntax.",
      },
    ],
  },
  {
    keywords: ["function", "functions", "modular", "modules", "packages"],
    create: () => [
      {
        id: "python-function-transform",
        title: "Isolate one clear responsibility",
        language: "python",
        code: "def normalize_name(name: str) -> str:\n    return name.strip().title()\n\nprint(normalize_name('  aNNa  '))",
        expectedOutput: "Anna",
        explanation: "A good function does one thing clearly and is easy to test.",
      },
      {
        id: "python-function-list",
        title: "Reuse logic across a batch",
        language: "python",
        code: "def active_ids(records):\n    return [row['id'] for row in records if row['active']]\n\nprint(active_ids([{'id': 1, 'active': True}, {'id': 2, 'active': False}]))",
        expectedOutput: "[1]",
        explanation: "Wrap repeated selection logic so the pipeline stays readable.",
      },
    ],
  },
  {
    keywords: ["dict", "lists", "arrays", "sets", "collections", "hash maps"],
    create: () => [
      {
        id: "python-dict-count",
        title: "Count values with a dictionary",
        language: "python",
        code: "statuses = ['paid', 'paid', 'failed']\ncounts = {}\nfor status in statuses:\n    counts[status] = counts.get(status, 0) + 1\nprint(counts)",
        expectedOutput: "{'paid': 2, 'failed': 1}",
        explanation: "Dictionary accumulation is one of the most common small data-engineering patterns.",
      },
      {
        id: "python-set-dedup",
        title: "Use a set for uniqueness",
        language: "python",
        code: "emails = ['a@x.com', 'a@x.com', 'b@x.com']\nprint(sorted(set(emails)))",
        expectedOutput: "['a@x.com', 'b@x.com']",
        explanation: "Sets remove duplicates cheaply when ordering is not the first concern.",
      },
    ],
  },
  {
    keywords: ["file", "files", "json", "api"],
    create: () => [
      {
        id: "python-json-parse",
        title: "Parse one JSON payload",
        language: "python",
        code: "import json\npayload = '{\"order_id\": 10, \"status\": \"paid\"}'\nrecord = json.loads(payload)\nprint(record['status'])",
        expectedOutput: "paid",
        explanation: "Treat external payloads as untrusted until they are parsed and validated.",
      },
      {
        id: "python-file-lines",
        title: "Process line-oriented input safely",
        language: "python",
        code: "raw = 'a\\nb\\n\\n'\nlines = [line for line in raw.splitlines() if line]\nprint(lines)",
        expectedOutput: "['a', 'b']",
        explanation: "Most data files need cleanup before the first transformation step.",
      },
    ],
  },
  {
    keywords: ["exception", "exceptions", "debugging", "testing"],
    create: () => [
      {
        id: "python-try-except",
        title: "Catch the error you expect",
        language: "python",
        code: "def parse_amount(raw: str) -> float | None:\n    try:\n        return float(raw)\n    except ValueError:\n        return None\n\nprint(parse_amount('oops'))",
        expectedOutput: "None",
        explanation: "Catch narrow exceptions so the real failure signal stays visible.",
      },
      {
        id: "python-assert-check",
        title: "Protect assumptions with tests",
        language: "python",
        code: "def normalize(code: str) -> str:\n    return code.strip().upper()\n\nassert normalize(' us ') == 'US'\nprint('ok')",
        expectedOutput: "ok",
        explanation: "Short assertions help you lock in behavior while refactoring.",
      },
    ],
  },
  {
    keywords: ["pyspark", "dataframe", "schema", "spark"],
    create: () => [
      {
        id: "pyspark-select-filter",
        title: "Select and filter with DataFrame flow",
        language: "python",
        code: "result = (\n    df\n    .select('customer_id', 'country')\n    .filter(F.col('country') == 'US')\n)",
        expectedOutput: "Logical plan selects two columns, then filters to US rows.",
        explanation: "PySpark work is easiest to reason about when each transformation step is explicit.",
      },
      {
        id: "pyspark-withcolumn",
        title: "Add one derived column",
        language: "python",
        code: "result = df.withColumn('amount_bucket', F.when(F.col('amount') >= 100, 'high').otherwise('standard'))",
        expectedOutput: "Adds a bucket column from the amount rule.",
        explanation: "withColumn is clearer when each derived business rule stays isolated.",
      },
    ],
  },
  {
    keywords: ["join", "joins", "window", "aggregation", "partition", "optimization", "lakehouse"],
    create: () => [
      {
        id: "pyspark-join-agg",
        title: "Join, then aggregate deliberately",
        language: "python",
        code: "result = (\n    orders.join(customers, 'customer_id', 'inner')\n    .groupBy('country')\n    .agg(F.sum('amount').alias('paid_revenue'))\n)",
        expectedOutput: "Country-level paid revenue after joining orders to customer attributes.",
        explanation: "Distributed joins amplify row-multiplication mistakes, so output grain matters even more.",
      },
      {
        id: "pyspark-window-rank",
        title: "Use a window for ordered partition logic",
        language: "python",
        code: "window_spec = Window.partitionBy('customer_id').orderBy(F.col('order_date').desc())\nresult = df.withColumn('rn', F.row_number().over(window_spec))",
        expectedOutput: "A ranked row number inside each customer partition.",
        explanation: "Spark windows express ordered logic without collapsing the full dataset first.",
      },
    ],
  },
];

function chooseExamples(track: CourseSlug, lessonTitle: string, summary: string, topics: string[]) {
  const haystack = `${lessonTitle} ${summary} ${topics.join(" ")}`.toLowerCase();
  const matched = exampleTemplates.filter((template) =>
    template.keywords.some((keyword) => haystack.includes(keyword)),
  );

  if (matched.length > 0) {
    return matched[0].create(track);
  }

  if (track === "sql") {
    return exampleTemplates[0].create(track);
  }

  if (track === "pyspark") {
    return exampleTemplates[9].create(track);
  }

  return exampleTemplates[5].create(track);
}

function buildSyntaxReference(track: CourseSlug, topics: string[]) {
  if (track === "sql") {
    return [
      `Core clauses this lesson touches: ${topics.join(", ")}.`,
      "Always state output grain before you add joins, GROUP BY, or DISTINCT.",
      "Prefer readable aliases, deterministic ORDER BY, and explicit null handling.",
    ];
  }

  if (track === "python") {
    return [
      `Python ideas in play: ${topics.join(", ")}.`,
      "Keep transformations in small functions with clear input and output contracts.",
      "Name intermediate values so another engineer can debug the script quickly.",
    ];
  }

  return [
    `PySpark ideas in play: ${topics.join(", ")}.`,
    "Build transformations as a visible DataFrame chain instead of hiding logic in one giant expression.",
    "Think about schema, partitioning, and shuffle cost while you write each step.",
  ];
}

function buildProductionRelevance(track: CourseSlug, businessCase: string, debugging: string) {
  return [
    `Production relevance: ${businessCase}`,
    `If this goes wrong in production, you would likely see: ${debugging}`,
    track === "sql"
      ? "In data engineering, this lesson supports trustworthy reporting, ETL validation, and warehouse maintenance."
      : track === "python"
        ? "In data engineering, this lesson supports reusable scripts, automations, and maintainable batch jobs."
        : "In data engineering, this lesson supports scalable DataFrame pipelines and Spark job reliability.",
  ];
}

function buildPerformanceImplications(track: CourseSlug, topics: string[]) {
  if (track === "sql") {
    return [
      "Move filters as early as possible when it preserves semantics.",
      "Avoid accidental row multiplication before aggregation.",
      `Watch for these performance-sensitive ideas: ${topics.slice(0, 3).join(", ")}.`,
    ];
  }

  if (track === "python") {
    return [
      "Repeated parsing, nested loops, and unnecessary copies are common first bottlenecks.",
      "Prefer simple data structures before adding abstractions.",
      `For this lesson, performance pressure usually appears around: ${topics.slice(0, 3).join(", ")}.`,
    ];
  }

  return [
    "Wide transformations, shuffles, and skew can dominate runtime.",
    "Be intentional about projection, filters, and partition-aware logic.",
    `This lesson often affects Spark cost through: ${topics.slice(0, 3).join(", ")}.`,
  ];
}

function buildKnowledgeCheck(weekTitle: string, topics: string[]) {
  return [
    `How would you explain ${weekTitle.toLowerCase()} to a teammate without using tool jargon first?`,
    `Which topic in this lesson is easiest to misuse under pressure: ${topics.slice(0, 2).join(" or ")}? Why?`,
    "What would make the output wrong even if the code still runs successfully?",
  ];
}

function buildGuidedExercise(track: CourseSlug, businessCase: string, masteryHref: string) {
  return track === "sql"
    ? `Use the related mastery step at ${masteryHref} to produce the exact output the business case asks for: ${businessCase}`
    : `Open the related mastery step at ${masteryHref}, start from the blank editor, and write the smallest working solution for: ${businessCase}`;
}

function buildIndependentExercise(track: CourseSlug, project: string) {
  return track === "sql"
    ? `Rewrite this logic for a second stakeholder question and explain how the output grain changes. Weekly project anchor: ${project}`
    : `Rebuild the same idea without looking at the example and explain what you would test before shipping it. Weekly project anchor: ${project}`;
}

const materialsByTrack = (["sql", "python", "pyspark"] as CourseSlug[]).flatMap((track) => {
  const course = courses.find((item) => item.slug === track);
  const weeks = getWeeksByCourse(track);

  return weeks.flatMap((week) => {
    const weekLessons = getLessonsByWeek(week.id);
    return weekLessons.map((lesson, index) => {
      const previousLesson =
        index > 0
          ? weekLessons[index - 1]
          : weeks
              .find((item) => item.weekNumber === week.weekNumber - 1)
              ? getLessonsByWeek(
                  weeks.find((item) => item.weekNumber === week.weekNumber - 1)!.id,
                ).at(-1) ?? null
              : null;
      const nextLesson =
        index < weekLessons.length - 1
          ? weekLessons[index + 1]
          : weeks
              .find((item) => item.weekNumber === week.weekNumber + 1)
              ? getLessonsByWeek(
                  weeks.find((item) => item.weekNumber === week.weekNumber + 1)!.id,
                )[0] ?? null
              : null;

      const masteryHref = buildMasteryHref(track, week.id, lesson.id);
      const examples = chooseExamples(track, lesson.title, lesson.summary, week.topics);
      const levelBand = getLevelBand(week.weekNumber);

      return {
        id: lesson.id,
        track,
        weekId: week.id,
        moduleId: week.id,
        moduleTitle: `Week ${week.weekNumber}: ${week.title}`,
        moduleWeekNumber: week.weekNumber,
        monthNumber: week.monthNumber,
        levelBand,
        title: lesson.title,
        summary: lesson.summary,
        estimatedReadingMinutes: Math.max(8, Math.round(lesson.estimatedMinutes * 0.6)),
        objectives: [...week.objectives],
        prerequisites: previousLesson
          ? [`Review ${previousLesson.title} before this lesson.`]
          : [`Start with ${course?.name ?? track.toUpperCase()} Week ${week.weekNumber}.`],
        prerequisiteLessonIds: previousLesson ? [previousLesson.id] : [],
        explanation: `${lesson.summary} This lesson belongs to ${week.title.toLowerCase()} and focuses on ${week.topics.join(", ")} with a data-engineering lens.`,
        mentalModel: `${week.theme} For this lesson, think in terms of input grain, transformation rule, and output contract before touching syntax.`,
        syntaxReference: buildSyntaxReference(track, week.topics),
        examples,
        commonMistakes: [
          week.debugging,
          `Rushing through ${lesson.title.toLowerCase()} without naming the expected output clearly.`,
          track === "pyspark"
            ? "Treating a Spark transformation like local Python instead of a distributed plan."
            : "Assuming a correct-looking output is the same as a correct, reusable solution.",
        ],
        debuggingGuidance: [
          `First isolate the failure shape: ${week.debugging}`,
          "Then restate the required input, transformation, and output in plain language.",
          "Finally, test the smallest reproducible case before changing everything at once.",
        ],
        performanceImplications: buildPerformanceImplications(track, week.topics),
        productionRelevance: buildProductionRelevance(track, week.businessCase, week.debugging),
        knowledgeCheck: buildKnowledgeCheck(week.title, week.topics),
        guidedExercise: buildGuidedExercise(track, week.businessCase, masteryHref),
        independentExercise: buildIndependentExercise(track, week.project),
        summaryPoints: [
          lesson.summary,
          `Core topics: ${week.topics.join(", ")}.`,
          `Mastery checkpoint: ${week.masteryCheckpoint}`,
        ],
        masteryHref,
        previousLessonId: previousLesson?.id ?? null,
        nextLessonId: nextLesson?.id ?? null,
        breadcrumbLabel: `${course?.name ?? track.toUpperCase()} / Week ${week.weekNumber} / ${lesson.title}`,
        searchText: [
          lesson.title,
          lesson.summary,
          week.title,
          week.theme,
          week.topics.join(" "),
          lesson.tags.join(" "),
        ].join(" ").toLowerCase(),
      } satisfies MaterialLesson;
    });
  });
});

export const materialLessons: MaterialLesson[] = materialsByTrack;

export const materialModules: MaterialModule[] = getModules();

function getModules() {
  return (["sql", "python", "pyspark"] as CourseSlug[]).flatMap((track) =>
    getWeeksByCourse(track).map((week) => ({
      id: week.id,
      track,
      title: `Week ${week.weekNumber}: ${week.title}`,
      weekId: week.id,
      weekNumber: week.weekNumber,
      monthNumber: week.monthNumber,
      levelBand: getLevelBand(week.weekNumber),
      lessonIds: getLessonsByWeek(week.id).map((lesson) => lesson.id),
    })),
  );
}

export function getMaterialTracks() {
  return courses.map((course) => ({
    track: course.slug,
    title: course.name,
    tagline: course.tagline,
    description: course.description,
    lessonCount: materialLessons.filter((lesson) => lesson.track === course.slug).length,
    moduleCount: materialModules.filter((module) => module.track === course.slug).length,
  }));
}

export function getMaterialModulesByTrack(track: CourseSlug) {
  return materialModules.filter((module) => module.track === track);
}

export function getMaterialLessonsByTrack(track: CourseSlug) {
  return materialLessons.filter((lesson) => lesson.track === track);
}

export function getMaterialLesson(track: CourseSlug, lessonId: string) {
  return materialLessons.find((lesson) => lesson.track === track && lesson.id === lessonId) ?? null;
}

export function getMaterialResumeLessonId(track: CourseSlug) {
  return getMaterialLessonsByTrack(track)[0]?.id ?? null;
}

export function searchMaterialLessons(track: CourseSlug, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return getMaterialLessonsByTrack(track);
  }

  return getMaterialLessonsByTrack(track).filter((lesson) => lesson.searchText.includes(normalized));
}

export function validateMaterialsCurriculum() {
  const issues: MaterialValidationIssue[] = [];
  const ids = new Set<string>();
  const byId = new Map(materialLessons.map((lesson) => [lesson.id, lesson]));

  for (const lesson of materialLessons) {
    if (!["sql", "python", "pyspark"].includes(lesson.track)) {
      issues.push({
        code: "INVALID_TRACK",
        message: `Lesson ${lesson.id} has invalid track ${lesson.track}.`,
      });
    }

    if (ids.has(lesson.id)) {
      issues.push({
        code: "DUPLICATE_LESSON_ID",
        message: `Duplicate material lesson id: ${lesson.id}.`,
      });
    }
    ids.add(lesson.id);

    const requiredArrays = [
      ["objectives", lesson.objectives],
      ["syntaxReference", lesson.syntaxReference],
      ["commonMistakes", lesson.commonMistakes],
      ["debuggingGuidance", lesson.debuggingGuidance],
      ["performanceImplications", lesson.performanceImplications],
      ["productionRelevance", lesson.productionRelevance],
      ["knowledgeCheck", lesson.knowledgeCheck],
      ["summaryPoints", lesson.summaryPoints],
    ] as const;

    for (const [label, value] of requiredArrays) {
      if (value.length === 0 || value.some((item) => !item.trim())) {
        issues.push({
          code: "EMPTY_REQUIRED_SECTION",
          message: `Lesson ${lesson.id} has an empty required section: ${label}.`,
        });
      }
    }

    if (!lesson.title.trim() || !lesson.summary.trim() || !lesson.guidedExercise.trim() || !lesson.independentExercise.trim()) {
      issues.push({
        code: "EMPTY_REQUIRED_SECTION",
        message: `Lesson ${lesson.id} is missing required narrative content.`,
      });
    }

    if (!lesson.masteryHref.trim()) {
      issues.push({
        code: "MISSING_EXERCISE",
        message: `Lesson ${lesson.id} is missing its related mastery link.`,
      });
    }

    if (lesson.examples.length === 0 || lesson.examples.some((example) => !example.expectedOutput.trim())) {
      issues.push({
        code: "MISSING_EXPECTED_OUTPUT",
        message: `Lesson ${lesson.id} is missing example output text.`,
      });
    }

    for (const prerequisiteId of lesson.prerequisiteLessonIds) {
      if (!byId.has(prerequisiteId)) {
        issues.push({
          code: "BROKEN_PREREQUISITE",
          message: `Lesson ${lesson.id} references missing prerequisite ${prerequisiteId}.`,
        });
      }
    }

    if (lesson.previousLessonId && !byId.has(lesson.previousLessonId)) {
      issues.push({
        code: "BROKEN_PREVIOUS_NEXT",
        message: `Lesson ${lesson.id} has a broken previous lesson link.`,
      });
    }

    if (lesson.nextLessonId && !byId.has(lesson.nextLessonId)) {
      issues.push({
        code: "BROKEN_PREVIOUS_NEXT",
        message: `Lesson ${lesson.id} has a broken next lesson link.`,
      });
    }
  }

  if (materialLessons.length !== lessons.length) {
    issues.push({
      code: "MISSING_LESSON",
      message: `Expected ${lessons.length} material lessons but found ${materialLessons.length}.`,
    });
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  function dfs(id: string) {
    if (visiting.has(id)) {
      issues.push({
        code: "CIRCULAR_DEPENDENCY",
        message: `Circular prerequisite dependency detected at ${id}.`,
      });
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    const lesson = byId.get(id);
    for (const prerequisiteId of lesson?.prerequisiteLessonIds ?? []) {
      if (byId.has(prerequisiteId)) {
        dfs(prerequisiteId);
      }
    }
    visiting.delete(id);
    visited.add(id);
  }

  for (const lesson of materialLessons) {
    dfs(lesson.id);
  }

  return issues;
}

const materialValidationIssues = validateMaterialsCurriculum();

if (materialValidationIssues.length > 0) {
  throw new Error(
    `Materials curriculum validation failed:\n${materialValidationIssues
      .map((issue) => `- [${issue.code}] ${issue.message}`)
      .join("\n")}`,
  );
}

export function getWeekForMaterialLesson(lessonId: string) {
  const lesson = materialLessons.find((item) => item.id === lessonId);
  return lesson ? getWeekById(lesson.weekId) : null;
}
