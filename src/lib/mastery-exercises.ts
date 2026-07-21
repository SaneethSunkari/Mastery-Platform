import { getLessonById, getLessonsByWeek, getWeekById, lessons } from "@/lib/curriculum";
import { CourseSlug, ExerciseGradingMode } from "@/lib/types";
import { pythonWeekOneExerciseSeeds } from "@/lib/python-week-one";
import { pysparkWeekOneExerciseSeeds } from "@/lib/pyspark-week-one";

export interface PythonVisibleCase {
  description: string;
  input: unknown;
  expected: unknown;
}

export interface PythonExerciseDefinition {
  functionName: string;
  starterCode: string;
  prompt: string;
  visibleCases: PythonVisibleCase[];
  hiddenCases: PythonVisibleCase[];
  referenceSolution?: string;
}

export interface StructuralRequirement {
  label: string;
  anyOf: string[];
}

export interface PysparkExerciseDefinition {
  starterCode: string;
  prompt?: string;
  requirements: StructuralRequirement[];
  hiddenRequirements: StructuralRequirement[];
  validationKind?: "structural" | "conceptual";
  acceptedAnswers?: string[];
  forbiddenPatterns?: string[];
  referenceSolution?: string;
  resultExpectation: string;
}

export interface MasteryExerciseDefinition {
  id: string;
  courseSlug: CourseSlug;
  lessonId: string;
  weekId: string;
  title: string;
  summary: string;
  gradingMode: ExerciseGradingMode;
  prerequisiteLessonIds: string[];
  relatedLessonHref: string;
  masteryHref: string;
  visibleChecks: string[];
  hiddenCheckCount: number;
  honestLabel: string;
  python?: PythonExerciseDefinition;
  pyspark?: PysparkExerciseDefinition;
}

const pythonFamilies = [
  {
    prompt: "Write `solve(rows)` and return the uppercase names for rows where `active` is true.",
    createVisibleCases: (seed: number): PythonVisibleCase[] => [
      {
        description: "Keeps only active names and uppercases them.",
        input: [
          { name: `anna-${seed}`, active: true },
          { name: `ben-${seed}`, active: false },
          { name: `cara-${seed}`, active: true },
        ],
        expected: [`ANNA-${seed}`.toUpperCase(), `CARA-${seed}`.toUpperCase()],
      },
    ],
    createHiddenCases: (seed: number): PythonVisibleCase[] => [
      {
        description: "Returns an empty list when nothing is active.",
        input: [{ name: `zoe-${seed}`, active: false }],
        expected: [],
      },
      {
        description: "Preserves incoming order of active rows.",
        input: [
          { name: `x-${seed}`, active: true },
          { name: `y-${seed}`, active: true },
        ],
        expected: [`X-${seed}`.toUpperCase(), `Y-${seed}`.toUpperCase()],
      },
    ],
  },
  {
    prompt: "Write `solve(rows)` and return a dictionary counting how many rows exist for each `country`.",
    createVisibleCases: (): PythonVisibleCase[] => [
      {
        description: "Counts repeated countries.",
        input: [
          { country: "US" },
          { country: "IN" },
          { country: "US" },
        ],
        expected: { US: 2, IN: 1 },
      },
    ],
    createHiddenCases: (): PythonVisibleCase[] => [
      {
        description: "Handles a single-country input.",
        input: [{ country: "CA" }, { country: "CA" }],
        expected: { CA: 2 },
      },
    ],
  },
  {
    prompt: "Write `solve(rows)` and return the total `amount` for rows where `status` is `'paid'`.",
    createVisibleCases: (): PythonVisibleCase[] => [
      {
        description: "Sums only paid rows.",
        input: [
          { amount: 100, status: "paid" },
          { amount: 20, status: "failed" },
          { amount: 30, status: "paid" },
        ],
        expected: 130,
      },
    ],
    createHiddenCases: (): PythonVisibleCase[] => [
      {
        description: "Returns zero when nothing is paid.",
        input: [{ amount: 50, status: "failed" }],
        expected: 0,
      },
    ],
  },
  {
    prompt: "Write `solve(rows)` and return a new list where `country` is uppercased and missing `email` becomes `'missing@example.com'`.",
    createVisibleCases: (): PythonVisibleCase[] => [
      {
        description: "Normalizes case and fills missing email.",
        input: [{ country: "us", email: null }],
        expected: [{ country: "US", email: "missing@example.com" }],
      },
    ],
    createHiddenCases: (): PythonVisibleCase[] => [
      {
        description: "Leaves present email unchanged.",
        input: [{ country: "in", email: "a@example.com" }],
        expected: [{ country: "IN", email: "a@example.com" }],
      },
    ],
  },
  {
    prompt: "Write `solve(values)` and return a list of floats for the valid numeric strings, skipping invalid values.",
    createVisibleCases: (): PythonVisibleCase[] => [
      {
        description: "Skips invalid numbers safely.",
        input: ["10.5", "oops", "3"],
        expected: [10.5, 3.0],
      },
    ],
    createHiddenCases: (): PythonVisibleCase[] => [
      {
        description: "Handles an empty input.",
        input: [],
        expected: [],
      },
    ],
  },
  {
    prompt: "Write `solve(rows)` and return the top 2 rows sorted by `amount` descending.",
    createVisibleCases: (): PythonVisibleCase[] => [
      {
        description: "Returns two highest amounts.",
        input: [
          { id: 1, amount: 50 },
          { id: 2, amount: 90 },
          { id: 3, amount: 70 },
        ],
        expected: [
          { id: 2, amount: 90 },
          { id: 3, amount: 70 },
        ],
      },
    ],
    createHiddenCases: (): PythonVisibleCase[] => [
      {
        description: "Returns all rows when fewer than two exist.",
        input: [{ id: 1, amount: 20 }],
        expected: [{ id: 1, amount: 20 }],
      },
    ],
  },
  {
    prompt: "Write `solve(lines)` and return only the non-empty lines with surrounding whitespace removed.",
    createVisibleCases: (): PythonVisibleCase[] => [
      {
        description: "Removes blanks and trims lines.",
        input: [" a ", "", "b  "],
        expected: ["a", "b"],
      },
    ],
    createHiddenCases: (): PythonVisibleCase[] => [
      {
        description: "Handles all-empty input.",
        input: [" ", ""],
        expected: [],
      },
    ],
  },
  {
    prompt: "Write `solve(rows)` and keep only the latest row per `customer_id` based on the largest `version`.",
    createVisibleCases: (): PythonVisibleCase[] => [
      {
        description: "Keeps the highest version per customer.",
        input: [
          { customer_id: 1, version: 1, status: "old" },
          { customer_id: 1, version: 2, status: "new" },
          { customer_id: 2, version: 1, status: "only" },
        ],
        expected: [
          { customer_id: 1, version: 2, status: "new" },
          { customer_id: 2, version: 1, status: "only" },
        ],
      },
    ],
    createHiddenCases: (): PythonVisibleCase[] => [
      {
        description: "Returns empty list for empty input.",
        input: [],
        expected: [],
      },
    ],
  },
] as const;

const pysparkFamilies = [
  {
    prompt: "Write PySpark code that filters active rows and selects `customer_id` plus `customer_name`. Assign the final DataFrame to `result`.",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "projection", anyOf: [".select(", ".selectExpr("] },
      { label: "filtering", anyOf: [".filter(", ".where("] },
    ],
    hiddenRequirements: [{ label: "active condition", anyOf: ["active", "is_active"] }],
    resultExpectation: "A DataFrame with only active rows and the requested columns.",
  },
  {
    prompt: "Write PySpark code that adds a bucket column using `withColumn` and a conditional expression. Assign the final DataFrame to `result`.",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "withColumn", anyOf: [".withColumn("] },
      { label: "conditional rule", anyOf: ["F.when(", "when("] },
    ],
    hiddenRequirements: [{ label: "otherwise branch", anyOf: [".otherwise("] }],
    resultExpectation: "A DataFrame with one derived classification column.",
  },
  {
    prompt: "Write PySpark code that groups by one dimension and calculates an aggregate metric. Assign the final DataFrame to `result`.",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "grouping", anyOf: [".groupBy("] },
      { label: "aggregation", anyOf: [".agg("] },
    ],
    hiddenRequirements: [{ label: "named metric", anyOf: [".alias("] }],
    resultExpectation: "A grouped DataFrame with an explicitly named aggregate metric.",
  },
  {
    prompt: "Write PySpark code that joins two DataFrames and keeps only the needed output fields. Assign the final DataFrame to `result`.",
    requirements: [
      { label: "result assignment", anyOf: ["result ="] },
      { label: "join", anyOf: [".join("] },
      { label: "projection", anyOf: [".select(", ".selectExpr("] },
    ],
    hiddenRequirements: [{ label: "join key", anyOf: ["customer_id", "order_id", "id"] }],
    resultExpectation: "A joined DataFrame with only the output columns required by the business question.",
  },
  {
    prompt: "Write PySpark code that defines a window specification and adds a rank-like column. Assign the final DataFrame to `result`.",
    requirements: [
      { label: "window spec", anyOf: ["Window.partitionBy(", "partitionBy("] },
      { label: "over clause", anyOf: [".over("] },
      { label: "result assignment", anyOf: ["result ="] },
    ],
    hiddenRequirements: [{ label: "row numbering or ranking", anyOf: ["row_number(", "rank(", "dense_rank("] }],
    resultExpectation: "A DataFrame with one window-derived ranking column.",
  },
] as const;

function pythonFamilyFor(weekNumber: number, lessonIndex: number) {
  return pythonFamilies[(weekNumber * 3 + lessonIndex) % pythonFamilies.length];
}

function pysparkFamilyFor(weekNumber: number, lessonIndex: number) {
  return pysparkFamilies[(weekNumber * 3 + lessonIndex) % pysparkFamilies.length];
}

function buildPythonExercise(lessonId: string): MasteryExerciseDefinition | null {
  const lesson = getLessonById(lessonId);
  if (!lesson || lesson.courseSlug !== "python") return null;
  const week = getWeekById(lesson.weekId);
  if (!week) return null;
  const weekLessons = getLessonsByWeek(week.id);
  const lessonIndex = Math.max(0, weekLessons.findIndex((item) => item.id === lessonId));
  if (week.weekNumber === 1) {
    const seed = pythonWeekOneExerciseSeeds[lessonIndex];
    if (!seed) return null;

    return {
      id: `exercise-${lesson.id}`,
      courseSlug: "python",
      lessonId: lesson.id,
      weekId: week.id,
      title: lesson.title,
      summary: lesson.summary,
      gradingMode: "python-runtime",
      prerequisiteLessonIds: lessonIndex > 0 ? [weekLessons[lessonIndex - 1].id] : [],
      relatedLessonHref: `/materials/python/${lesson.id}`,
      masteryHref: `/python?week=${week.id}&lesson=${lesson.id}`,
      visibleChecks: seed.visibleCases.map((item) => item.description),
      hiddenCheckCount: seed.hiddenCases.length,
      honestLabel: "Runtime executed with Pyodide in a worker.",
      python: {
        functionName: "solve",
        starterCode: seed.starterCode,
        prompt: seed.prompt,
        visibleCases: seed.visibleCases,
        hiddenCases: seed.hiddenCases,
        referenceSolution: seed.referenceSolution,
      },
    };
  }

  const family = pythonFamilyFor(week.weekNumber, lessonIndex);
  const visibleCases = family.createVisibleCases(week.weekNumber);
  const hiddenCases = family.createHiddenCases(week.weekNumber);

  return {
    id: `exercise-${lesson.id}`,
    courseSlug: "python",
    lessonId: lesson.id,
    weekId: week.id,
    title: lesson.title,
    summary: lesson.summary,
    gradingMode: "python-runtime",
    prerequisiteLessonIds: lessonIndex > 0 ? [weekLessons[lessonIndex - 1].id] : [],
    relatedLessonHref: `/materials/python/${lesson.id}`,
    masteryHref: `/python?week=${week.id}&lesson=${lesson.id}`,
    visibleChecks: visibleCases.map((item) => item.description),
    hiddenCheckCount: hiddenCases.length,
    honestLabel: "Runtime executed with Pyodide in a worker.",
    python: {
      functionName: "solve",
      starterCode: "def solve(data):\n    # return the requested result\n    return data\n",
      prompt: `${lesson.summary} ${family.prompt} Business context: ${week.businessCase}`,
      visibleCases,
      hiddenCases,
    },
  };
}

function buildPysparkExercise(lessonId: string): MasteryExerciseDefinition | null {
  const lesson = getLessonById(lessonId);
  if (!lesson || lesson.courseSlug !== "pyspark") return null;
  const week = getWeekById(lesson.weekId);
  if (!week) return null;
  const weekLessons = getLessonsByWeek(week.id);
  const lessonIndex = Math.max(0, weekLessons.findIndex((item) => item.id === lessonId));
  if (week.weekNumber === 1) {
    const seed = pysparkWeekOneExerciseSeeds[lessonIndex];
    if (!seed) return null;

    return {
      id: `exercise-${lesson.id}`,
      courseSlug: "pyspark",
      lessonId: lesson.id,
      weekId: week.id,
      title: lesson.title,
      summary: lesson.summary,
      gradingMode: "pyspark-structural",
      prerequisiteLessonIds: lessonIndex > 0 ? [weekLessons[lessonIndex - 1].id] : [],
      relatedLessonHref: `/materials/pyspark/${lesson.id}`,
      masteryHref: `/pyspark?week=${week.id}&lesson=${lesson.id}`,
      visibleChecks: seed.requirements.map((item) => item.label),
      hiddenCheckCount: seed.hiddenRequirements.length,
      honestLabel:
        seed.validationKind === "conceptual"
          ? "Conceptually validated PySpark answer. Real Spark runtime is not available in-browser."
          : "Structurally validated PySpark submission. Real Spark runtime is not available in-browser.",
      pyspark: {
        starterCode: seed.starterCode,
        prompt: seed.prompt,
        requirements: seed.requirements.map((item) => ({
          label: item.label,
          anyOf: [...item.anyOf],
        })),
        hiddenRequirements: seed.hiddenRequirements.map((item) => ({
          label: item.label,
          anyOf: [...item.anyOf],
        })),
        validationKind: seed.validationKind,
        acceptedAnswers: seed.acceptedAnswers ? [...seed.acceptedAnswers] : undefined,
        forbiddenPatterns: seed.forbiddenPatterns ? [...seed.forbiddenPatterns] : undefined,
        referenceSolution: seed.referenceSolution,
        resultExpectation: seed.resultExpectation,
      },
    };
  }

  const family = pysparkFamilyFor(week.weekNumber, lessonIndex);

  return {
    id: `exercise-${lesson.id}`,
    courseSlug: "pyspark",
    lessonId: lesson.id,
    weekId: week.id,
    title: lesson.title,
    summary: lesson.summary,
    gradingMode: "pyspark-structural",
    prerequisiteLessonIds: lessonIndex > 0 ? [weekLessons[lessonIndex - 1].id] : [],
    relatedLessonHref: `/materials/pyspark/${lesson.id}`,
    masteryHref: `/pyspark?week=${week.id}&lesson=${lesson.id}`,
    visibleChecks: family.requirements.map((item) => item.label),
    hiddenCheckCount: family.hiddenRequirements.length,
    honestLabel: "Structurally validated PySpark submission. Real Spark runtime is not available in-browser.",
    pyspark: {
      starterCode:
        "from pyspark.sql import functions as F\nfrom pyspark.sql import Window\n\n# write your transformation and assign the final DataFrame to result\nresult = df\n",
      prompt: `${lesson.summary} ${family.prompt} Business context: ${week.businessCase}`,
      requirements: family.requirements.map((item) => ({
        label: item.label,
        anyOf: [...item.anyOf],
      })),
      hiddenRequirements: family.hiddenRequirements.map((item) => ({
        label: item.label,
        anyOf: [...item.anyOf],
      })),
      resultExpectation: family.resultExpectation,
    },
  };
}

export function getMasteryExerciseForLesson(lessonId: string): MasteryExerciseDefinition | null {
  const lesson = getLessonById(lessonId);
  if (!lesson) return null;
  if (lesson.courseSlug === "python") return buildPythonExercise(lessonId);
  if (lesson.courseSlug === "pyspark") return buildPysparkExercise(lessonId);
  return null;
}

export function gradePysparkSubmission(exercise: MasteryExerciseDefinition, source: string) {
  if (!exercise.pyspark) {
    return {
      passed: false,
      score: 0,
      feedback: ["No PySpark structural definition exists for this lesson."],
      mode: "self-review" as ExerciseGradingMode,
    };
  }

  return gradePysparkDefinition(exercise.pyspark, source);
}

export function gradePysparkDefinition(
  definition: PysparkExerciseDefinition,
  source: string,
) {
  const normalized = source.toLowerCase().replace(/\s+/g, " ");
  const spacedSource = source.replace(/\s+/g, " ");
  const forbiddenFailures = (definition.forbiddenPatterns ?? [])
    .filter((token) => spacedSource.includes(token.replace(/\s+/g, " ")))
    .map((token) => `Found forbidden pattern: ${token}.`);

  function normalizeConceptAnswer(value: string) {
    return value
      .toLowerCase()
      .replace(/[^\w\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  if (definition.validationKind === "conceptual") {
    const answerMatch = source.match(/answer\s*=\s*["']([\s\S]*?)["']/i);
    const normalizedAnswer = answerMatch?.[1]
      ? normalizeConceptAnswer(answerMatch[1])
      : "";
    const acceptedAnswers = (definition.acceptedAnswers ?? []).map((item) =>
      normalizeConceptAnswer(item),
    );
    const passed = normalizedAnswer.length > 0 && acceptedAnswers.includes(normalizedAnswer) && forbiddenFailures.length === 0;

    return {
      passed,
      score: passed ? 100 : normalizedAnswer.length > 0 ? 50 : 0,
      feedback: passed
        ? [
            "Conceptual validation passed.",
            `Expected outcome: ${definition.resultExpectation}`,
          ]
        : [
            ...forbiddenFailures,
            answerMatch
              ? "The answer text does not match the expected concept yet."
              : "Assign your response to `answer` using a quoted string.",
          ],
      mode: "pyspark-structural" as ExerciseGradingMode,
    };
  }

  const visibleFailures = definition.requirements
    .filter((requirement) => !requirement.anyOf.some((token) => normalized.includes(token.toLowerCase())))
    .map((requirement) => `Missing required pattern: ${requirement.label}.`);
  const hiddenFailures = definition.hiddenRequirements
    .filter((requirement) => !requirement.anyOf.some((token) => normalized.includes(token.toLowerCase())))
    .map((requirement) => `Missing deeper pattern: ${requirement.label}.`);

  const failures = [...visibleFailures, ...hiddenFailures, ...forbiddenFailures];
  const totalChecks =
    definition.requirements.length + definition.hiddenRequirements.length;
  const passedChecks = totalChecks - failures.length;
  const score = Math.max(0, Math.round((passedChecks / totalChecks) * 100));

  return {
    passed: failures.length === 0,
    score,
      feedback:
      failures.length === 0
        ? [
            "Structural validation passed.",
            `Expected outcome: ${definition.resultExpectation}`,
          ]
        : failures,
    mode: "pyspark-structural" as ExerciseGradingMode,
  };
}

export const availableMasteryExercises = lessons
  .filter((lesson) => lesson.courseSlug === "python" || lesson.courseSlug === "pyspark")
  .map((lesson) => getMasteryExerciseForLesson(lesson.id))
  .filter(Boolean) as MasteryExerciseDefinition[];
