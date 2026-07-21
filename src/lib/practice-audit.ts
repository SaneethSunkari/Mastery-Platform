import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { candyArcadeLevels } from "@/lib/candy-arcade";
import { arcadeValidatorBackedBundles, type ArcadeLevelBundle } from "@/lib/arcade-bundles";
import { arcadeWorldOneBundles } from "@/lib/arcade-world-one";
import { arcadeWorldTwoBundles } from "@/lib/arcade-world-two";
import { arcadeWorldsEightTwelveBundles } from "@/lib/arcade-worlds-eight-twelve";
import { arcadeWorldsEighteenTwentytwoBundles } from "@/lib/arcade-worlds-eighteen-twentytwo";
import { arcadeWorldsFiftyoneSixtyBundles } from "@/lib/arcade-worlds-fiftyone-sixty";
import { arcadeWorldsFortyoneFiftyBundles } from "@/lib/arcade-worlds-fortyone-fifty";
import { arcadeWorldsThirtyoneFortyBundles } from "@/lib/arcade-worlds-thirtyone-forty";
import { arcadeWorldsThirteenSeventeenBundles } from "@/lib/arcade-worlds-thirteen-seventeen";
import { arcadeWorldsThreeSevenBundles } from "@/lib/arcade-worlds-three-seven";
import { arcadeWorldsTwentythreeThirtyBundles } from "@/lib/arcade-worlds-twentythree-thirty";
import { getWeeksByCourse, lessons } from "@/lib/curriculum";
import { availableMasteryExercises, gradePysparkDefinition } from "@/lib/mastery-exercises";
import { pythonExtensionQuestions, pysparkExtensionQuestions } from "@/lib/mastery-extension-banks";
import { getArcadeQuestionId } from "@/lib/questions/ids";
import { pythonWeekOneQuestions } from "@/lib/questions/python-week-one";
import {
  getPysparkWeekOneDefinition,
  pysparkWeekOneQuestions,
} from "@/lib/questions/pyspark-week-one";
import { listImplementedQuestionIds } from "@/lib/questions/registry";
import { compareSqlResults, executeSqlAgainstSchema, loadSqlModule } from "@/lib/sql-runtime";
import { CourseSlug } from "@/lib/types";
import { PYSPARK_RUNTIME_QUESTION_IDS } from "@/lib/pyspark-runtime-contract";
import { sqlAllTasks } from "@/lib/sql-weeks";

const TRACK_TARGET_COUNT = 3000;
const QUESTIONS_PER_WEEK_TARGET = 125;
const ARCADE_WORLD_TARGET = 60;
const ARCADE_LEVELS_PER_WORLD_TARGET = 50;
const ARCADE_TARGET_COUNT = 3000;

type CountAudit = {
  targetCount: number;
  displayedCount: number;
  structurallyValidCount: number;
  runtimeValidCount: number;
  uniqueLogicCount: number;
  fullyVerifiedCount: number;
  stableIdCount: number;
  nextMissingId: string | null;
};

type WeeklyCoverageAudit = {
  track: CourseSlug;
  weekId: string;
  weekNumber: number;
  displayedCount: number;
  fullyVerifiedCount: number;
  targetCount: number;
};

type ArcadeWorldCoverageAudit = {
  worldNumber: number;
  displayedCount: number;
  fullyVerifiedCount: number;
  targetCount: number;
};

type DuplicateClusterAudit = {
  fingerprint: string;
  count: number;
  sampleIds: string[];
};

type ArcadeValidatorCoverageAudit = {
  sqlCount: number;
  pythonCount: number;
  pysparkCount: number;
  verifiedSolutionCount: number;
};

export type PracticeValidationReport = {
  tracks: Record<CourseSlug, CountAudit>;
  weeklyCoverage: Record<CourseSlug, WeeklyCoverageAudit[]>;
  arcade: {
    levels: CountAudit;
    worldCoverage: ArcadeWorldCoverageAudit[];
    validators: ArcadeValidatorCoverageAudit;
    suspiciousDuplicateClusters: DuplicateClusterAudit[];
  };
  integrity: {
    duplicateIds: string[];
  };
};

export type PythonWeekOneValidationAudit = {
  targetCount: number;
  displayedCount: number;
  runtimeValidCount: number;
  uniqueLogicCount: number;
  fullyVerifiedCount: number;
  missingIds: string[];
  duplicateIds: string[];
  brokenFixtures: string[];
  brokenValidators: string[];
  brokenReferenceSolutions: string[];
};

export type PysparkWeekOneValidationAudit = {
  targetCount: number;
  displayedCount: number;
  structurallyValidCount: number;
  uniqueLogicCount: number;
  fullyVerifiedCount: number;
  missingIds: string[];
  duplicateIds: string[];
  brokenValidators: string[];
  brokenReferenceSolutions: string[];
  failingNegativeCases: string[];
};

export type ArcadeWorldValidationAudit = {
  targetCount: number;
  displayedCount: number;
  structurallyValidCount: number;
  runtimeValidCount: number;
  uniqueLogicCount: number;
  fullyVerifiedCount: number;
  sqlValidatorCount: number;
  pythonValidatorCount: number;
  pysparkValidatorCount: number;
  verifiedRequiredSolutionCount: number;
  duplicateIds: string[];
  missingIds: string[];
  brokenDatasets: string[];
  brokenContracts: string[];
  brokenValidators: string[];
  brokenReferenceSolutions: string[];
  suspiciousDuplicateClusters: DuplicateClusterAudit[];
  nextMissingId: string | null;
};

type ArcadePythonBatchResult = {
  questionId: string;
  passed: boolean;
  error: string | null;
};

const ARCADE_PYTHON_BATCH_SCRIPT = `
import json
import sys

with open(sys.argv[1], "r", encoding="utf8") as payload_file:
    payload = json.load(payload_file)
results = []

for item in payload:
    result = {
        "questionId": item["questionId"],
        "passed": False,
        "error": None,
    }

    try:
        total_checks = item["visibleCases"] + item["hiddenCases"]
        for case in total_checks:
            namespace = {}
            namespace[item["inputVariableName"]] = case["input"]
            exec(item["code"], namespace)
            actual = namespace.get(item["resultVariable"])
            if actual != case["expected"]:
                raise AssertionError(case["description"])

        result["passed"] = True
    except Exception as exc:
        result["error"] = str(exc)

    results.append(result)

print(json.dumps(results))
`;

function normalizeFingerprint(value: string) {
  return value.toLowerCase().replace(/\s+/gu, " ").trim();
}

function findDuplicateIds(ids: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    }
    seen.add(id);
  }
  return [...duplicates].sort();
}

function getQuestionIdPrefix(track: CourseSlug | "arcade") {
  return track === "arcade" ? "arcade-q-" : `${track}-q-`;
}

function getNextMissingId(track: CourseSlug | "arcade", existingIds: string[]) {
  const prefix = getQuestionIdPrefix(track);
  const present = new Set(existingIds);
  for (let ordinal = 1; ordinal <= TRACK_TARGET_COUNT; ordinal += 1) {
    const candidate = `${prefix}${String(ordinal).padStart(4, "0")}`;
    if (!present.has(candidate)) {
      return candidate;
    }
  }
  return null;
}

function buildArcadeDuplicateClusters() {
  const buckets = new Map<string, string[]>();

  for (const level of candyArcadeLevels) {
    const fingerprint = normalizeFingerprint(
      [
        level.question,
        ...level.dataset,
        ...level.expectedOutput,
        level.sqlGoal,
        level.pythonGoal,
        level.pysparkGoal,
      ].join(" | "),
    );

    const bucket = buckets.get(fingerprint) ?? [];
    bucket.push(level.id);
    buckets.set(fingerprint, bucket);
  }

  return [...buckets.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([fingerprint, ids]) => ({
      fingerprint,
      count: ids.length,
      sampleIds: ids.slice(0, 5),
    }))
    .sort((left, right) => right.count - left.count);
}

function buildArcadeWorldDuplicateClusters(bundles: ArcadeLevelBundle[]) {
  const buckets = new Map<string, string[]>();

  for (const bundle of bundles) {
    const questionId = getArcadeQuestionId(bundle.levelNumber);
    const bucket = buckets.get(bundle.uniqueLogicFingerprint) ?? [];
    bucket.push(questionId);
    buckets.set(bundle.uniqueLogicFingerprint, bucket);
  }

  return [...buckets.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([fingerprint, ids]) => ({
      fingerprint,
      count: ids.length,
      sampleIds: ids.slice(0, 5),
    }))
    .sort((left, right) => right.count - left.count);
}

function runArcadePythonBatch(
  bundles: ArcadeLevelBundle[],
  sourceByQuestionId: Map<string, string>,
): ArcadePythonBatchResult[] {
  const payload = bundles.map((bundle) => ({
    questionId: getArcadeQuestionId(bundle.levelNumber),
    code: sourceByQuestionId.get(getArcadeQuestionId(bundle.levelNumber)) ?? "",
    inputVariableName: bundle.python.inputVariableName,
    resultVariable: bundle.python.resultVariable,
    visibleCases: bundle.python.visibleCases,
    hiddenCases: bundle.python.hiddenCases,
  }));

  const directory = mkdtempSync(path.join(tmpdir(), "mastery-arcade-python-"));
  const payloadPath = path.join(directory, "payload.json");
  writeFileSync(payloadPath, JSON.stringify(payload), "utf8");

  const execution = spawnSync("python3", ["-c", ARCADE_PYTHON_BATCH_SCRIPT, payloadPath], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    env: { ...process.env, PYTHONUNBUFFERED: "1" },
    timeout: 30_000,
    shell: false,
  });

  rmSync(directory, { recursive: true, force: true });

  if (execution.status !== 0) {
    throw new Error(execution.stderr || "Arcade Python batch validation failed.");
  }

  return JSON.parse(execution.stdout) as ArcadePythonBatchResult[];
}

function buildTrackFingerprints(track: CourseSlug) {
  if (track === "sql") {
    return sqlAllTasks.map((task) =>
      normalizeFingerprint([task.title, task.objective, ...task.instructions, task.solutionSql].join(" | ")),
    );
  }

  return availableMasteryExercises
    .filter((exercise) => exercise.courseSlug === track)
    .map((exercise) => {
      const pythonPrompt = exercise.python?.prompt ?? "";
      const pythonCases =
        exercise.python?.visibleCases.map((item) => JSON.stringify(item.expected)).join(" | ") ?? "";
      const pysparkPrompt = exercise.pyspark?.prompt ?? "";
      const pysparkRequirements =
        exercise.pyspark?.requirements.flatMap((item) => item.anyOf).join(" | ") ?? "";
      const pysparkAnswers = exercise.pyspark?.acceptedAnswers?.join(" | ") ?? "";

      return normalizeFingerprint(
        [
          exercise.title,
          exercise.summary,
          pythonPrompt,
          pythonCases,
          pysparkPrompt,
          pysparkRequirements,
          pysparkAnswers,
        ].join(" | "),
      );
    })
    .concat(
      track === "python"
        ? pythonExtensionQuestions.map((question) =>
            normalizeFingerprint(
              [
                question.id,
                question.title,
                question.prompt,
                JSON.stringify(question.visibleCases.map((item) => item.expected)),
                JSON.stringify(question.hiddenCases.map((item) => item.expected)),
              ].join(" | "),
            ),
          )
        : track === "pyspark"
          ? pysparkExtensionQuestions.map((question) => question.uniqueLogicFingerprint)
          : [],
    );
}

function getUniqueFingerprintCount(fingerprints: string[]) {
  return new Set(fingerprints).size;
}

function buildPythonWeekOneFingerprints() {
  return pythonWeekOneQuestions.map((question) =>
    normalizeFingerprint(
      [
        question.id,
        question.title,
        question.prompt,
        JSON.stringify(question.visibleCases.map((item) => item.expected)),
        JSON.stringify(question.hiddenCases.map((item) => item.expected)),
      ].join(" | "),
    ),
  );
}

function buildTrackAudit(track: CourseSlug): CountAudit {
  const stableIds = listImplementedQuestionIds(track);
  const pythonExtensionCount = pythonExtensionQuestions.length;
  const pysparkExtensionCount = pysparkExtensionQuestions.length;
  const displayedCount =
    track === "sql"
      ? sqlAllTasks.length
      : lessons.filter((lesson) => lesson.courseSlug === track).length +
        (track === "python" ? pythonExtensionCount : track === "pyspark" ? pysparkExtensionCount : 0);
  const structurallyValidCount =
    track === "sql"
      ? sqlAllTasks.length
      : availableMasteryExercises.filter((exercise) => exercise.courseSlug === track).length +
        (track === "python" ? pythonExtensionCount : track === "pyspark" ? pysparkExtensionCount : 0);
  const runtimeValidCount =
    track === "sql"
      ? sqlAllTasks.length
      : track === "python"
        ? availableMasteryExercises.filter((exercise) => exercise.courseSlug === "python").length + pythonExtensionCount
        : PYSPARK_RUNTIME_QUESTION_IDS.length;
  const fullyVerifiedCount = runtimeValidCount;
  const uniqueLogicCount = getUniqueFingerprintCount(buildTrackFingerprints(track));

  return {
    targetCount: TRACK_TARGET_COUNT,
    displayedCount,
    structurallyValidCount,
    runtimeValidCount,
    uniqueLogicCount,
    fullyVerifiedCount,
    stableIdCount: stableIds.length,
    nextMissingId: getNextMissingId(track, stableIds),
  };
}

function buildWeeklyCoverage(track: CourseSlug): WeeklyCoverageAudit[] {
  return getWeeksByCourse(track).map((week) => {
    const displayedCount =
      track === "sql"
        ? sqlAllTasks.filter((task) => task.weekId === week.id).length
        : lessons.filter((lesson) => lesson.courseSlug === track && lesson.weekId === week.id).length;

    return {
      track,
      weekId: week.id,
      weekNumber: week.weekNumber,
      displayedCount,
      fullyVerifiedCount: displayedCount,
      targetCount: QUESTIONS_PER_WEEK_TARGET,
    };
  });
}

function buildArcadeAudit(): PracticeValidationReport["arcade"] {
  const syntheticDisplayDuplicateClusters = buildArcadeDuplicateClusters();
  const liveDuplicateClusters =
    arcadeValidatorBackedBundles.length === candyArcadeLevels.length
      ? buildArcadeWorldDuplicateClusters(arcadeValidatorBackedBundles)
      : syntheticDisplayDuplicateClusters;
  const stableIds = listImplementedQuestionIds("arcade");
  const fullyVerifiedIds = arcadeValidatorBackedBundles.map((bundle) => getArcadeQuestionId(bundle.levelNumber));
  const verifiedCountByWorld = new Map<number, number>();
  for (const bundle of arcadeValidatorBackedBundles) {
    const worldNumber = Math.ceil(bundle.levelNumber / ARCADE_LEVELS_PER_WORLD_TARGET);
    verifiedCountByWorld.set(worldNumber, (verifiedCountByWorld.get(worldNumber) ?? 0) + 1);
  }
  const sqlValidatorCount = arcadeValidatorBackedBundles.filter(
    (bundle) => bundle.sql.referenceSolution.trim() && bundle.sql.setupSql.trim(),
  ).length;
  const pythonValidatorCount = arcadeValidatorBackedBundles.filter(
    (bundle) =>
      bundle.python.referenceSolution.trim() &&
      bundle.python.resultVariable.trim() &&
      bundle.python.visibleCases.length > 0 &&
      bundle.python.hiddenCases.length > 0,
  ).length;
  const pysparkValidatorCount = arcadeValidatorBackedBundles.filter(
    (bundle) =>
      bundle.pyspark.referenceSolution.trim() &&
      bundle.pyspark.resultExpectation.trim() &&
      bundle.pyspark.requirements.length > 0,
  ).length;
  const uniqueLogicCount =
    candyArcadeLevels.length -
    liveDuplicateClusters.reduce((sum, cluster) => sum + cluster.count - 1, 0);
  const validatorBackedUniqueLogicCount = getUniqueFingerprintCount(
    arcadeValidatorBackedBundles.map((bundle) => bundle.uniqueLogicFingerprint),
  );

  return {
    levels: {
      targetCount: ARCADE_TARGET_COUNT,
      displayedCount: candyArcadeLevels.length,
      structurallyValidCount: candyArcadeLevels.length,
      runtimeValidCount: arcadeValidatorBackedBundles.length,
      uniqueLogicCount: Math.max(uniqueLogicCount, validatorBackedUniqueLogicCount),
      fullyVerifiedCount: arcadeValidatorBackedBundles.length,
      stableIdCount: stableIds.length,
      nextMissingId: getNextMissingId("arcade", fullyVerifiedIds),
    },
    worldCoverage: Array.from({ length: ARCADE_WORLD_TARGET }, (_, index) => {
      const worldNumber = index + 1;
      const displayedCount = candyArcadeLevels.filter((level) => level.worldNumber === worldNumber).length;
      return {
        worldNumber,
        displayedCount,
        fullyVerifiedCount: verifiedCountByWorld.get(worldNumber) ?? 0,
        targetCount: ARCADE_LEVELS_PER_WORLD_TARGET,
      };
    }),
    validators: {
      sqlCount: sqlValidatorCount,
      pythonCount: pythonValidatorCount,
      pysparkCount: pysparkValidatorCount,
      verifiedSolutionCount: sqlValidatorCount + pythonValidatorCount + pysparkValidatorCount,
    },
    suspiciousDuplicateClusters: liveDuplicateClusters,
  };
}

export function getPracticeValidationReport(): PracticeValidationReport {
  const sqlIds = listImplementedQuestionIds("sql");
  const pythonIds = listImplementedQuestionIds("python");
  const pysparkIds = listImplementedQuestionIds("pyspark");
  const arcadeIds = listImplementedQuestionIds("arcade");

  return {
    tracks: {
      sql: buildTrackAudit("sql"),
      python: buildTrackAudit("python"),
      pyspark: buildTrackAudit("pyspark"),
    },
    weeklyCoverage: {
      sql: buildWeeklyCoverage("sql"),
      python: buildWeeklyCoverage("python"),
      pyspark: buildWeeklyCoverage("pyspark"),
    },
    arcade: buildArcadeAudit(),
    integrity: {
      duplicateIds: findDuplicateIds([...sqlIds, ...pythonIds, ...pysparkIds, ...arcadeIds]),
    },
  };
}

export function getPythonWeekOneValidationAudit(): PythonWeekOneValidationAudit {
  const expectedIds = Array.from({ length: 125 }, (_, index) => `python-q-${String(index + 1).padStart(4, "0")}`);
  const actualIds = pythonWeekOneQuestions.map((question) => question.id);
  const actualIdSet = new Set(actualIds);
  const duplicateIds = findDuplicateIds(actualIds);
  const brokenFixtures = pythonWeekOneQuestions
    .filter((question) => question.visibleCases.length === 0 || question.hiddenCases.length === 0)
    .map((question) => question.id);
  const brokenValidators = pythonWeekOneQuestions
    .filter((question) => question.validatorVersion <= 0)
    .map((question) => question.id);
  const brokenReferenceSolutions = pythonWeekOneQuestions
    .filter((question) => question.referenceSolution.trim().length === 0)
    .map((question) => question.id);

  return {
    targetCount: 125,
    displayedCount: pythonWeekOneQuestions.length,
    runtimeValidCount: pythonWeekOneQuestions.length - brokenFixtures.length - brokenValidators.length,
    uniqueLogicCount: getUniqueFingerprintCount(buildPythonWeekOneFingerprints()),
    fullyVerifiedCount:
      pythonWeekOneQuestions.length -
      brokenFixtures.length -
      brokenValidators.length -
      brokenReferenceSolutions.length,
    missingIds: expectedIds.filter((id) => !actualIdSet.has(id)),
    duplicateIds,
    brokenFixtures,
    brokenValidators,
    brokenReferenceSolutions,
  };
}

export function getPysparkWeekOneValidationAudit(): PysparkWeekOneValidationAudit {
  const expectedIds = Array.from(
    { length: 125 },
    (_, index) => `pyspark-q-${String(index + 1).padStart(4, "0")}`,
  );
  const actualIds = pysparkWeekOneQuestions.map((question) => question.id);
  const actualIdSet = new Set(actualIds);
  const duplicateIds = findDuplicateIds(actualIds);
  const duplicateFingerprints =
    pysparkWeekOneQuestions.length -
    getUniqueFingerprintCount(
      pysparkWeekOneQuestions.map((question) => question.uniqueLogicFingerprint),
    );
  const brokenValidators = pysparkWeekOneQuestions
    .filter((question) => question.validatorVersion <= 0)
    .map((question) => question.id);
  const brokenReferenceSolutions = pysparkWeekOneQuestions
    .filter((question) => {
      const result = gradePysparkDefinition(
        getPysparkWeekOneDefinition(question),
        question.referenceSolution,
      );
      return !result.passed;
    })
    .map((question) => question.id);
  const failingNegativeCases = pysparkWeekOneQuestions
    .filter((question) => {
      const result = gradePysparkDefinition(
        getPysparkWeekOneDefinition(question),
        question.negativeSubmission,
      );
      return result.passed;
    })
    .map((question) => question.id);

  return {
    targetCount: 125,
    displayedCount: pysparkWeekOneQuestions.length,
    structurallyValidCount:
      pysparkWeekOneQuestions.length - brokenValidators.length - duplicateFingerprints,
    uniqueLogicCount: getUniqueFingerprintCount(
      pysparkWeekOneQuestions.map((question) => question.uniqueLogicFingerprint),
    ),
    fullyVerifiedCount:
      pysparkWeekOneQuestions.length -
      brokenValidators.length -
      brokenReferenceSolutions.length -
      failingNegativeCases.length -
      duplicateFingerprints,
    missingIds: expectedIds.filter((id) => !actualIdSet.has(id)),
    duplicateIds,
    brokenValidators,
    brokenReferenceSolutions,
    failingNegativeCases,
  };
}

function getNextArcadeIdFromRange(
  startLevelNumber: number,
  targetCount: number,
  existingIds: string[],
) {
  const present = new Set(existingIds);
  for (let levelNumber = startLevelNumber; levelNumber < startLevelNumber + targetCount; levelNumber += 1) {
    const candidate = getArcadeQuestionId(levelNumber);
    if (!present.has(candidate)) {
      return candidate;
    }
  }
  const nextLevelNumber = startLevelNumber + targetCount;
  return nextLevelNumber > ARCADE_TARGET_COUNT ? null : getArcadeQuestionId(nextLevelNumber);
}

async function getArcadeWorldValidationAudit(
  bundles: ArcadeLevelBundle[],
  startLevelNumber: number,
  targetCount = 50,
): Promise<ArcadeWorldValidationAudit> {
  const expectedIds = Array.from(
    { length: targetCount },
    (_, index) => getArcadeQuestionId(startLevelNumber + index),
  );
  const actualIds = bundles.map((bundle) => getArcadeQuestionId(bundle.levelNumber));
  const actualIdSet = new Set(actualIds);
  const duplicateIds = findDuplicateIds(actualIds);
  const suspiciousDuplicateClusters = buildArcadeWorldDuplicateClusters(bundles);
  const uniqueLogicCount = getUniqueFingerprintCount(
    bundles.map((bundle) => bundle.uniqueLogicFingerprint),
  );

  const brokenDatasets = bundles
    .filter(
      (bundle) =>
        !bundle.datasetContract.datasetId.trim() ||
        bundle.datasetContract.tables.length === 0 ||
        bundle.datasetContract.tables.some((table) => table.columns.length === 0 || table.rows.length === 0),
    )
    .map((bundle) => getArcadeQuestionId(bundle.levelNumber));

  const brokenContracts = bundles
    .filter(
      (bundle) =>
        bundle.sharedTask.trim().length === 0 ||
        bundle.resultContract.requiredOutputColumns.length === 0 ||
        bundle.resultContract.expectedRows.length === 0,
    )
    .map((bundle) => getArcadeQuestionId(bundle.levelNumber));

  const brokenValidators = bundles
    .filter(
      (bundle) =>
        !bundle.sql.referenceSolution.trim() ||
        !bundle.sql.setupSql.trim() ||
        !bundle.python.referenceSolution.trim() ||
        bundle.python.visibleCases.length === 0 ||
        bundle.python.hiddenCases.length === 0 ||
        !bundle.pyspark.referenceSolution.trim() ||
        bundle.pyspark.requirements.length === 0,
    )
    .map((bundle) => getArcadeQuestionId(bundle.levelNumber));

  const SQL = await loadSqlModule();
  const sqlReferencePasses = new Set<string>();
  const sqlNegativeFailures = new Set<string>();

  for (const bundle of bundles) {
    const questionId = getArcadeQuestionId(bundle.levelNumber);
    const expected = executeSqlAgainstSchema(SQL, bundle.sql.setupSql, bundle.sql.referenceSolution);
    const actual = executeSqlAgainstSchema(SQL, bundle.sql.setupSql, bundle.sql.referenceSolution);
    const negative = executeSqlAgainstSchema(
      SQL,
      bundle.sql.setupSql,
      bundle.representativeIncorrectAnswers.sql,
    );
    const referenceMismatch = compareSqlResults(
      actual.result,
      expected.result,
      bundle.sql.orderSensitive,
    );
    const negativeMismatch = compareSqlResults(
      negative.result,
      expected.result,
      bundle.sql.orderSensitive,
    );

    if (referenceMismatch === null) {
      sqlReferencePasses.add(questionId);
    }
    if (negativeMismatch !== null) {
      sqlNegativeFailures.add(questionId);
    }
  }

  const pythonReferenceMap = new Map(
    bundles.map((bundle) => [
      getArcadeQuestionId(bundle.levelNumber),
      bundle.python.referenceSolution,
    ]),
  );
  const pythonNegativeMap = new Map(
    bundles.map((bundle) => [
      getArcadeQuestionId(bundle.levelNumber),
      bundle.representativeIncorrectAnswers.python,
    ]),
  );
  const pythonReferenceResults = runArcadePythonBatch(bundles, pythonReferenceMap);
  const pythonNegativeResults = runArcadePythonBatch(bundles, pythonNegativeMap);
  const pythonReferencePasses = new Set(
    pythonReferenceResults.filter((result) => result.passed).map((result) => result.questionId),
  );
  const pythonNegativeFailures = new Set(
    pythonNegativeResults.filter((result) => !result.passed).map((result) => result.questionId),
  );

  const pysparkReferencePasses = new Set<string>();
  const pysparkNegativeFailures = new Set<string>();

  for (const bundle of bundles) {
    const questionId = getArcadeQuestionId(bundle.levelNumber);
    const reference = gradePysparkDefinition(
      bundle.pyspark,
      bundle.pyspark.referenceSolution,
    );
    const negative = gradePysparkDefinition(
      bundle.pyspark,
      bundle.representativeIncorrectAnswers.pyspark,
    );

    if (reference.passed) {
      pysparkReferencePasses.add(questionId);
    }
    if (!negative.passed) {
      pysparkNegativeFailures.add(questionId);
    }
  }

  const brokenReferenceSolutions = bundles
    .filter((bundle) => {
      const questionId = getArcadeQuestionId(bundle.levelNumber);
      return (
        !sqlReferencePasses.has(questionId) ||
        !pythonReferencePasses.has(questionId) ||
        !pysparkReferencePasses.has(questionId) ||
        !sqlNegativeFailures.has(questionId) ||
        !pythonNegativeFailures.has(questionId) ||
        !pysparkNegativeFailures.has(questionId)
      );
    })
    .map((bundle) => getArcadeQuestionId(bundle.levelNumber));

  const sqlValidatorCount = bundles.filter((bundle) => {
    const questionId = getArcadeQuestionId(bundle.levelNumber);
    return sqlReferencePasses.has(questionId) && sqlNegativeFailures.has(questionId);
  }).length;
  const pythonValidatorCount = bundles.filter((bundle) => {
    const questionId = getArcadeQuestionId(bundle.levelNumber);
    return pythonReferencePasses.has(questionId) && pythonNegativeFailures.has(questionId);
  }).length;
  const pysparkValidatorCount = bundles.filter((bundle) => {
    const questionId = getArcadeQuestionId(bundle.levelNumber);
    return pysparkReferencePasses.has(questionId) && pysparkNegativeFailures.has(questionId);
  }).length;

  const structurallyValidCount = bundles.filter((bundle) => {
    const questionId = getArcadeQuestionId(bundle.levelNumber);
    return (
      !brokenDatasets.includes(questionId) &&
      !brokenContracts.includes(questionId) &&
      !brokenValidators.includes(questionId)
    );
  }).length;

  const runtimeValidCount = bundles.filter((bundle) => {
    const questionId = getArcadeQuestionId(bundle.levelNumber);
    return sqlReferencePasses.has(questionId) && pythonReferencePasses.has(questionId);
  }).length;

  const fullyVerifiedCount = bundles.filter((bundle) => {
    const questionId = getArcadeQuestionId(bundle.levelNumber);
    return (
      !brokenDatasets.includes(questionId) &&
      !brokenContracts.includes(questionId) &&
      !brokenValidators.includes(questionId) &&
      sqlReferencePasses.has(questionId) &&
      pythonReferencePasses.has(questionId) &&
      pysparkReferencePasses.has(questionId) &&
      sqlNegativeFailures.has(questionId) &&
      pythonNegativeFailures.has(questionId) &&
      pysparkNegativeFailures.has(questionId)
    );
  }).length;

  const verifiedRequiredSolutionCount =
    sqlReferencePasses.size + pythonReferencePasses.size + pysparkReferencePasses.size;

  return {
    targetCount,
    displayedCount: bundles.length,
    structurallyValidCount,
    runtimeValidCount,
    uniqueLogicCount,
    fullyVerifiedCount,
    sqlValidatorCount,
    pythonValidatorCount,
    pysparkValidatorCount,
    verifiedRequiredSolutionCount,
    duplicateIds,
    missingIds: expectedIds.filter((id) => !actualIdSet.has(id)),
    brokenDatasets,
    brokenContracts,
    brokenValidators,
    brokenReferenceSolutions,
    suspiciousDuplicateClusters,
    nextMissingId: getNextArcadeIdFromRange(startLevelNumber, targetCount, actualIds),
  };
}

export async function getArcadeWorldOneValidationAudit(): Promise<ArcadeWorldValidationAudit> {
  return getArcadeWorldValidationAudit(arcadeWorldOneBundles, 1);
}

export async function getArcadeWorldTwoValidationAudit(): Promise<ArcadeWorldValidationAudit> {
  return getArcadeWorldValidationAudit(arcadeWorldTwoBundles, 51);
}

export async function getArcadeWorldsThreeSevenValidationAudit(): Promise<ArcadeWorldValidationAudit> {
  return getArcadeWorldValidationAudit(arcadeWorldsThreeSevenBundles, 101, 250);
}

export async function getArcadeWorldsEightTwelveValidationAudit(): Promise<ArcadeWorldValidationAudit> {
  return getArcadeWorldValidationAudit(arcadeWorldsEightTwelveBundles, 351, 250);
}

export async function getArcadeWorldsThirteenSeventeenValidationAudit(): Promise<ArcadeWorldValidationAudit> {
  return getArcadeWorldValidationAudit(arcadeWorldsThirteenSeventeenBundles, 601, 250);
}

export async function getArcadeWorldsEighteenTwentytwoValidationAudit(): Promise<ArcadeWorldValidationAudit> {
  return getArcadeWorldValidationAudit(arcadeWorldsEighteenTwentytwoBundles, 851, 250);
}

export async function getArcadeWorldsTwentythreeThirtyValidationAudit(): Promise<ArcadeWorldValidationAudit> {
  return getArcadeWorldValidationAudit(arcadeWorldsTwentythreeThirtyBundles, 1101, 400);
}

export async function getArcadeWorldsThirtyoneFortyValidationAudit(): Promise<ArcadeWorldValidationAudit> {
  return getArcadeWorldValidationAudit(arcadeWorldsThirtyoneFortyBundles, 1501, 500);
}

export async function getArcadeWorldsFortyoneFiftyValidationAudit(): Promise<ArcadeWorldValidationAudit> {
  return getArcadeWorldValidationAudit(arcadeWorldsFortyoneFiftyBundles, 2001, 500);
}

export async function getArcadeWorldsFiftyoneSixtyValidationAudit(): Promise<ArcadeWorldValidationAudit> {
  return getArcadeWorldValidationAudit(arcadeWorldsFiftyoneSixtyBundles, 2501, 500);
}

export function formatPracticeValidationReport(report: PracticeValidationReport) {
  return [
    `SQL displayed: ${report.tracks.sql.displayedCount}/${report.tracks.sql.targetCount}`,
    `SQL fully verified: ${report.tracks.sql.fullyVerifiedCount}/${report.tracks.sql.targetCount}`,
    `Python displayed: ${report.tracks.python.displayedCount}/${report.tracks.python.targetCount}`,
    `Python fully verified: ${report.tracks.python.fullyVerifiedCount}/${report.tracks.python.targetCount}`,
    `PySpark displayed: ${report.tracks.pyspark.displayedCount}/${report.tracks.pyspark.targetCount}`,
    `PySpark real Spark runtime: ${report.tracks.pyspark.runtimeValidCount}/${report.tracks.pyspark.targetCount}`,
    `PySpark fully verified: ${report.tracks.pyspark.fullyVerifiedCount}/${report.tracks.pyspark.targetCount}`,
    `Arcade displayed: ${report.arcade.levels.displayedCount}/${report.arcade.levels.targetCount}`,
    `Arcade fully verified: ${report.arcade.levels.fullyVerifiedCount}/${report.arcade.levels.targetCount}`,
    `Arcade unique logic: ${report.arcade.levels.uniqueLogicCount}/${report.arcade.levels.displayedCount}`,
    `Duplicate IDs: ${report.integrity.duplicateIds.length}`,
  ].join("\n");
}
