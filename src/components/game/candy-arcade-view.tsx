"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { CheckCircle2, ChevronLeft, ChevronRight, Code2, LockKeyhole, Play, RotateCcw, SendHorizonal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { candyArcadeLevels } from "@/lib/candy-arcade";
import { arcadeValidatorBackedLevelCount, getArcadeBundle } from "@/lib/arcade-bundles";
import { gradeArcadeLanguage, type ArcadeLanguageRunResult } from "@/lib/arcade-grading";
import { completeCandyArcadeLanguage, db, saveCandyArcadeDraft } from "@/lib/db";
import { ArcadeLanguage } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { findArcadeLevelByQuestionId } from "@/lib/questions/registry";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

declare global {
  interface Window {
    __arcadeDebug?: {
      setCurrentLevel: (levelNumber: number) => Promise<void>;
      reset: () => Promise<void>;
    };
  }
}

type ArcadeFeedbackState = ArcadeLanguageRunResult & {
  mode: "run" | "submit";
};

const editorConfigs: Array<{
  language: ArcadeLanguage;
  title: string;
  goalKey: "sqlGoal" | "pythonGoal" | "pysparkGoal";
  themeClass: string;
  monacoLanguage: "sql" | "python";
}> = [
  {
    language: "sql",
    title: "SQL",
    goalKey: "sqlGoal",
    themeClass: "border-amber-500/25 bg-amber-500/8",
    monacoLanguage: "sql",
  },
  {
    language: "python",
    title: "Python",
    goalKey: "pythonGoal",
    themeClass: "border-teal-500/25 bg-teal-500/8",
    monacoLanguage: "python",
  },
  {
    language: "pyspark",
    title: "PySpark",
    goalKey: "pysparkGoal",
    themeClass: "border-sky-500/25 bg-sky-500/8",
    monacoLanguage: "python",
  },
];

const completionFieldMap = {
  sql: "sqlCompleted",
  python: "pythonCompleted",
  pyspark: "pysparkCompleted",
} as const;

const attemptsFieldMap = {
  sql: "sqlAttempts",
  python: "pythonAttempts",
  pyspark: "pysparkAttempts",
} as const;

const passedAtFieldMap = {
  sql: "sqlPassedAt",
  python: "pythonPassedAt",
  pyspark: "pysparkPassedAt",
} as const;

const validatorLabelMap: Record<ArcadeLanguage, string> = {
  sql: "Runtime validator",
  python: "Runtime validator",
  pyspark: "Structural validator",
};

const liveWorldCount = Math.floor(arcadeValidatorBackedLevelCount / 50);

export function CandyArcadeView({ initialQuestionId }: { initialQuestionId?: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedQuestionId = searchParams.get("question") ?? initialQuestionId ?? null;
  const progressRecords = useLiveQuery(() => db.candyArcadeProgress.orderBy("levelNumber").toArray(), []);
  const [selectedLevelId, setSelectedLevelId] = useState(candyArcadeLevels[0]?.id ?? "");
  const [localDrafts, setLocalDrafts] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [feedbackByLanguage, setFeedbackByLanguage] = useState<Record<string, ArcadeFeedbackState>>({});
  const [busyLanguage, setBusyLanguage] = useState<ArcadeLanguage | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<ArcadeLanguage>("sql");
  const progressList = useMemo(() => progressRecords ?? [], [progressRecords]);

  const currentPlayableLevelId = useMemo(() => {
    const current = progressList.find((record) => record.unlocked && !record.completed);
    return current?.levelId ?? candyArcadeLevels[0]?.id ?? "";
  }, [progressList]);

  const requestedLevelId = useMemo(
    () => (requestedQuestionId ? findArcadeLevelByQuestionId(requestedQuestionId)?.id ?? null : null),
    [requestedQuestionId],
  );

  const unlockedSelectedLevelId = useMemo(() => {
    if (!selectedLevelId) {
      return null;
    }

    return progressList.find((record) => record.levelId === selectedLevelId)?.unlocked
      ? selectedLevelId
      : null;
  }, [progressList, selectedLevelId]);

  const requestedUnlockedLevelId = useMemo(() => {
    if (!requestedLevelId) {
      return null;
    }

    return progressList.find((record) => record.levelId === requestedLevelId)?.unlocked
      ? requestedLevelId
      : null;
  }, [progressList, requestedLevelId]);

  const activeLevelId =
    requestedUnlockedLevelId ??
    unlockedSelectedLevelId ??
    currentPlayableLevelId;
  const level = candyArcadeLevels.find((item) => item.id === activeLevelId) ?? candyArcadeLevels[0];
  const levelProgress = progressList.find((record) => record.levelId === level?.id) ?? null;
  const validatorBackedBundle = useMemo(() => getArcadeBundle(level?.levelNumber ?? 0), [level?.levelNumber]);

  const completedCount = progressList.filter((record) => record.completed).length;
  const currentLevelNumber =
    progressList.find((record) => record.unlocked && !record.completed)?.levelNumber ?? completedCount + 1;

  const setLocalArcadeQaLevel = useCallback(async (levelNumber: number) => {
    const now = new Date().toISOString();
    const validatorVersionFor = (language: ArcadeLanguage, currentLevelNumber: number) => {
      const bundle = getArcadeBundle(currentLevelNumber);
      if (!bundle) return 0;
      if (language === "sql") return bundle.sql.validatorVersion;
      if (language === "python") return bundle.python.validatorVersion;
      return bundle.pyspark.validatorVersion;
    };

    await db.transaction("rw", db.candyArcadeProgress, async () => {
      const records = await db.candyArcadeProgress.toArray();
      const existingIds = new Set(records.map((record) => record.levelId));
      const missingRecords = candyArcadeLevels
        .filter((arcadeLevel) => !existingIds.has(arcadeLevel.id))
        .map((arcadeLevel) => ({
          id: `candy-arcade-progress-${arcadeLevel.id}`,
          createdAt: now,
          updatedAt: now,
          levelId: arcadeLevel.id,
          levelNumber: arcadeLevel.levelNumber,
          unlocked: arcadeLevel.levelNumber === 1,
          completed: false,
          completedAt: null,
          sqlDraft: "",
          pythonDraft: "",
          pysparkDraft: "",
          sqlCompleted: false,
          pythonCompleted: false,
          pysparkCompleted: false,
          sqlAttempts: 0,
          pythonAttempts: 0,
          pysparkAttempts: 0,
          sqlPassedAt: null,
          pythonPassedAt: null,
          pysparkPassedAt: null,
          sqlValidatorVersion: 0,
          pythonValidatorVersion: 0,
          pysparkValidatorVersion: 0,
        }));
      const allRecords = [...records, ...missingRecords];

      for (const record of allRecords) {
        const completed = record.levelNumber < levelNumber;
        const unlocked = record.levelNumber <= levelNumber;
        await db.candyArcadeProgress.put({
          ...record,
          unlocked,
          completed,
          completedAt: completed ? now : null,
          sqlDraft: completed ? record.sqlDraft : "",
          pythonDraft: completed ? record.pythonDraft : "",
          pysparkDraft: completed ? record.pysparkDraft : "",
          sqlCompleted: completed,
          pythonCompleted: completed,
          pysparkCompleted: completed,
          sqlAttempts: completed ? Math.max(record.sqlAttempts, 1) : 0,
          pythonAttempts: completed ? Math.max(record.pythonAttempts, 1) : 0,
          pysparkAttempts: completed ? Math.max(record.pysparkAttempts, 1) : 0,
          sqlPassedAt: completed ? now : null,
          pythonPassedAt: completed ? now : null,
          pysparkPassedAt: completed ? now : null,
          sqlValidatorVersion: completed ? validatorVersionFor("sql", record.levelNumber) : 0,
          pythonValidatorVersion: completed ? validatorVersionFor("python", record.levelNumber) : 0,
          pysparkValidatorVersion: completed ? validatorVersionFor("pyspark", record.levelNumber) : 0,
          updatedAt: now,
        });
      }
    });
  }, []);

  const visibleLevels = useMemo(() => {
    if (!level) return [];
    const start = Math.max(level.levelNumber - 12, 1);
    const end = Math.min(start + 35, candyArcadeLevels.length);
    return candyArcadeLevels.slice(start - 1, end);
  }, [level]);

  const worldOneLevels = useMemo(() => candyArcadeLevels.slice(0, 50), []);

  useEffect(() => {
    if (!level || !progressRecords) {
      return;
    }

    const nextQuestionId = `arcade-q-${String(level.levelNumber).padStart(4, "0")}`;
    if (requestedQuestionId !== nextQuestionId) {
      router.replace(`${pathname}?question=${nextQuestionId}`, { scroll: false });
    }
  }, [level, pathname, progressRecords, requestedQuestionId, router]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const isLocalBrowser =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "[::1]";

    if (!isLocalBrowser) {
      return;
    }

    window.__arcadeDebug = {
      async setCurrentLevel(levelNumber: number) {
        await setLocalArcadeQaLevel(levelNumber);
      },
      async reset() {
        const now = new Date().toISOString();
        await db.transaction("rw", db.candyArcadeProgress, async () => {
          const records = await db.candyArcadeProgress.toArray();
          for (const record of records) {
            const unlocked = record.levelNumber === 1;
            await db.candyArcadeProgress.put({
              ...record,
              unlocked,
              completed: false,
              completedAt: null,
              sqlDraft: "",
              pythonDraft: "",
              pysparkDraft: "",
              sqlCompleted: false,
              pythonCompleted: false,
              pysparkCompleted: false,
              sqlAttempts: 0,
              pythonAttempts: 0,
              pysparkAttempts: 0,
              sqlPassedAt: null,
              pythonPassedAt: null,
              pysparkPassedAt: null,
              sqlValidatorVersion: 0,
              pythonValidatorVersion: 0,
              pysparkValidatorVersion: 0,
              updatedAt: now,
            });
          }
        });
      },
    };

    return () => {
      delete window.__arcadeDebug;
    };
  }, [setLocalArcadeQaLevel]);

  useEffect(() => {
    if (typeof window === "undefined" || !progressRecords) {
      return;
    }

    const isLocalBrowser =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "[::1]";
    const qaLevel = Number(searchParams.get("qaLevel"));

    if (!isLocalBrowser || !Number.isInteger(qaLevel) || qaLevel < 1 || qaLevel > candyArcadeLevels.length) {
      return;
    }

    const nextQuestionId = `arcade-q-${String(qaLevel).padStart(4, "0")}`;
    const nextLevelId = `candy-arcade-level-${String(qaLevel).padStart(4, "0")}`;
    void setLocalArcadeQaLevel(qaLevel).then(() => {
      setSelectedLevelId(nextLevelId);
      router.replace(`${pathname}?question=${nextQuestionId}`, { scroll: false });
    });
  }, [pathname, progressRecords, router, searchParams, setLocalArcadeQaLevel]);

  if (!progressRecords || !level || !levelProgress) {
    return <div className="text-sm text-muted-foreground">Loading candy arcade...</div>;
  }

  const drafts = {
    sql: localDrafts[`${level.id}-sql`] ?? levelProgress.sqlDraft,
    python: localDrafts[`${level.id}-python`] ?? levelProgress.pythonDraft,
    pyspark: localDrafts[`${level.id}-pyspark`] ?? levelProgress.pysparkDraft,
  };

  const nextMissingLanguage = editorConfigs.find((config) => !drafts[config.language].trim())?.language ?? null;
  const activeFeedback = feedbackByLanguage[`${level.id}-${activeLanguage}`] ?? null;
  const previousLevel =
    level.levelNumber > 1
      ? candyArcadeLevels.find((item) => item.levelNumber === level.levelNumber - 1) ?? null
      : null;
  const nextLevel =
    candyArcadeLevels.find((item) => item.levelNumber === level.levelNumber + 1) ?? null;
  const nextLevelProgress = nextLevel
    ? progressList.find((record) => record.levelId === nextLevel.id) ?? null
    : null;

  async function handleDraftChange(language: ArcadeLanguage, value: string | undefined) {
    const nextValue = value ?? "";
    setLocalDrafts((current) => ({
      ...current,
      [`${level.id}-${language}`]: nextValue,
    }));
    await saveCandyArcadeDraft(level.id, language, nextValue);
  }

  async function handleResetEditor(language: ArcadeLanguage) {
    await handleDraftChange(language, "");
    setFeedbackByLanguage((current) => {
      const next = { ...current };
      delete next[`${level.id}-${language}`];
      return next;
    });
    setStatusMessage(`${language.toUpperCase()} editor cleared.`);
  }

  function getValidatorVersion(language: ArcadeLanguage) {
    if (!validatorBackedBundle) return 0;
    if (language === "sql") return validatorBackedBundle.sql.validatorVersion;
    if (language === "python") return validatorBackedBundle.python.validatorVersion;
    return validatorBackedBundle.pyspark.validatorVersion;
  }

  async function handleRunOrSubmit(language: ArcadeLanguage, mode: "run" | "submit") {
    if (!validatorBackedBundle) {
      setStatusMessage(`Only Arcade Worlds 1-${liveWorldCount} levels 1-${arcadeValidatorBackedLevelCount} are validator-backed right now.`);
      return;
    }

    const draft = drafts[language];
    if (!draft.trim()) {
      setActiveLanguage(language);
      setStatusMessage(`Write ${language.toUpperCase()} code before ${mode === "run" ? "running" : "submitting"}.`);
      return;
    }

    setBusyLanguage(language);
    setStatusMessage(null);

    try {
      const feedback = await gradeArcadeLanguage(validatorBackedBundle, language, draft);
      setFeedbackByLanguage((current) => ({
        ...current,
        [`${level.id}-${language}`]: {
          ...feedback,
          mode,
        },
      }));

      if (mode === "run") {
        setStatusMessage(
          feedback.passed
            ? `${language.toUpperCase()} run passed. Submit it to keep the pass state.`
            : `${language.toUpperCase()} run failed. Fix the feedback, then submit again.`,
        );
        return;
      }

      const completion = await completeCandyArcadeLanguage(
        level.id,
        language,
        draft,
        feedback.passed,
        getValidatorVersion(language),
      );

      if (!feedback.passed) {
        setStatusMessage(
          `${language.toUpperCase()} submission failed. The level stays locked until all three validators pass.`,
        );
        return;
      }

      if (completion.levelCompleted) {
        setStatusMessage(
          nextLevel
            ? `All three languages passed. Level ${level.levelNumber} is complete and Level ${nextLevel.levelNumber} is unlocked.`
            : `All three languages passed. Level ${level.levelNumber} is complete.`,
        );
      } else {
        const remaining = editorConfigs
          .filter((config) => config.language !== language)
          .filter((config) => !levelProgress?.[completionFieldMap[config.language]])
          .map((config) => config.title)
          .join(" and ");
        setStatusMessage(
          remaining
            ? `${language.toUpperCase()} passed. Finish ${remaining} to unlock the next level.`
            : `${language.toUpperCase()} passed.`,
        );
      }
    } finally {
      setBusyLanguage(null);
    }
  }

  function selectLevel(levelId: string) {
    const nextRecord = progressList.find((record) => record.levelId === levelId);
    if (!nextRecord?.unlocked) {
      setStatusMessage("That level is still locked.");
      return;
    }

    setSelectedLevelId(levelId);
    setActiveLanguage("sql");
    setStatusMessage(null);

    const nextLevelNumber = candyArcadeLevels.find((item) => item.id === levelId)?.levelNumber;
    if (!nextLevelNumber) {
      return;
    }

    const nextQuestionId = `arcade-q-${String(nextLevelNumber).padStart(4, "0")}`;
    if (requestedQuestionId !== nextQuestionId) {
      router.replace(`${pathname}?question=${nextQuestionId}`, { scroll: false });
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="border-border/70 xl:h-[calc(100vh-10rem)]">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-2xl font-semibold tracking-tight">Candy Arcade</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                Worlds 1-{liveWorldCount} are validator-backed. One shared task, three languages, next level unlocks only after all three pass.
              </p>
            </div>
            <Badge className="bg-pink-400/20 text-pink-100 hover:bg-pink-400/20">
              {arcadeValidatorBackedLevelCount}/3000 live
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">Current level {Math.min(currentLevelNumber, 3000)}</Badge>
            <Badge variant="outline">Worlds 1-{liveWorldCount} live: {arcadeValidatorBackedLevelCount} levels</Badge>
            <Badge variant="outline">3 validators required</Badge>
          </div>
        </CardHeader>
        <CardContent className="h-[calc(100%-8rem)] overflow-hidden">
          <div className="h-full overflow-y-auto pr-2">
            <div className="grid gap-2">
              {(level.levelNumber <= 50 ? worldOneLevels : visibleLevels).map((item) => {
                const itemProgress = progressList.find((record) => record.levelId === item.id);
                const completed = Boolean(itemProgress?.completed);
                const unlocked = Boolean(itemProgress?.unlocked);
                const selected = item.id === level.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => selectLevel(item.id)}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-left transition",
                      selected && "border-white bg-white text-slate-950",
                      !selected && unlocked && "border-border/70 bg-card hover:border-white/30",
                      !unlocked && "border-border/70 bg-muted/40 text-muted-foreground",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.28em] opacity-70">
                          Level {item.levelNumber}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm font-semibold">{item.title}</p>
                      </div>
                      {completed ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                      ) : unlocked ? null : (
                        <LockKeyhole className="mt-0.5 size-4 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="border-border/70">
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-pink-400/20 text-pink-100 hover:bg-pink-400/20">
                Level {level.levelNumber}
              </Badge>
              <Badge variant="outline">{level.difficulty}</Badge>
              <Badge variant="outline">{level.stage}</Badge>
              <Badge variant="outline">
                {levelProgress.completed ? "Complete" : "Incomplete"}
              </Badge>
            </div>

            <div>
              <h1 className="text-2xl font-semibold">{level.title}</h1>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{level.question}</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Shared dataset</p>
                {validatorBackedBundle ? (
                  <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">Dataset ID:</span>{" "}
                      {validatorBackedBundle.datasetContract.datasetId}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Schema:</span>{" "}
                      {validatorBackedBundle.datasetContract.tables
                        .map(
                          (table) =>
                            `${table.name}(${table.columns.map((column) => `${column.name}:${column.type}`).join(", ")})`,
                        )
                        .join(" · ")}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Rows:</span>{" "}
                      {validatorBackedBundle.datasetContract.tables.reduce(
                        (total, table) => total + table.rows.length,
                        0,
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    This level is visible, but only Arcade levels 1-{arcadeValidatorBackedLevelCount} are fully validator-backed right now.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Expected result contract</p>
                {validatorBackedBundle ? (
                  <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">Columns:</span>{" "}
                      {validatorBackedBundle.resultContract.requiredOutputColumns.join(", ")}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Expected rows:</span>{" "}
                      {validatorBackedBundle.resultContract.expectedRows.length}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Row order:</span>{" "}
                      {validatorBackedBundle.resultContract.orderSensitive ? "matters" : "does not matter"}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Later worlds are still display-only placeholders right now.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              Drafts save locally, but a level is complete only when SQL, Python, and PySpark all pass.
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="outline">SQL {levelProgress.sqlCompleted ? "passed" : "not passed"}</Badge>
              <Badge variant="outline">Python {levelProgress.pythonCompleted ? "passed" : "not passed"}</Badge>
              <Badge variant="outline">PySpark {levelProgress.pysparkCompleted ? "passed" : "not passed"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-2xl font-semibold">Code editors</CardTitle>
                <CardDescription>
                  One active editor, run or submit the current language, and unlock the next level only after all three pass.
                </CardDescription>
              </div>
              {levelProgress.completed ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-200">
                  <CheckCircle2 className="mr-1 size-3.5" />
                  Completed
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs
              value={activeLanguage}
              onValueChange={(value) => setActiveLanguage(value as ArcadeLanguage)}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-muted/40 p-1">
                {editorConfigs.map((config) => {
                  const hasDraft = Boolean(drafts[config.language].trim());
                  const passed = levelProgress[completionFieldMap[config.language]];
                  const attempts = levelProgress[attemptsFieldMap[config.language]];
                  return (
                    <TabsTrigger key={config.language} value={config.language} className="rounded-xl">
                      {config.title}
                      {passed ? " passed" : hasDraft ? ` draft (${attempts})` : ""}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {editorConfigs.map((config) => (
                <TabsContent key={config.language} value={config.language}>
                  <div className={cn("rounded-3xl border p-4", config.themeClass)}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold">{config.title}</p>
                          <Badge variant="outline">{validatorLabelMap[config.language]}</Badge>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">{level[config.goalKey]}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Attempts: {levelProgress[attemptsFieldMap[config.language]]} · Status:{" "}
                          {levelProgress[completionFieldMap[config.language]] ? "passed" : "not passed"}
                          {levelProgress[passedAtFieldMap[config.language]]
                            ? ` · Saved pass: ${new Date(levelProgress[passedAtFieldMap[config.language]]!).toLocaleString()}`
                            : ""}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background/60 p-3">
                        <Code2 className="size-4" />
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-3xl border border-border/70">
                      <MonacoEditor
                        height="330px"
                        language={config.monacoLanguage}
                        theme="vs-dark"
                        value={drafts[config.language]}
                        onChange={(value) => {
                          void handleDraftChange(config.language, value);
                        }}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 15,
                          lineNumbersMinChars: 3,
                          scrollBeyondLastLine: false,
                          padding: { top: 16, bottom: 16 },
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {activeFeedback ? (
              <div
                className={cn(
                  "rounded-3xl border p-4 text-sm",
                  activeFeedback.passed
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-50"
                    : "border-amber-500/30 bg-amber-500/10 text-foreground",
                )}
              >
                <p className="font-medium">
                  {activeFeedback.mode === "submit" ? "Last submit" : "Last run"}: {activeFeedback.message}
                </p>
                {activeFeedback.details.length > 0 ? (
                  <div className="mt-2 space-y-2 text-xs leading-6 text-muted-foreground">
                    {activeFeedback.details.slice(0, 4).map((detail) => (
                      <p key={detail}>{detail}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {statusMessage ? (
              <div className="rounded-3xl border border-border/70 bg-muted/30 p-4 text-sm text-foreground">
                {statusMessage}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/70 bg-muted/25 p-4">
              <div className="text-sm leading-6 text-muted-foreground">
                Status: SQL {levelProgress.sqlCompleted ? "passed" : "not passed"} · Python{" "}
                {levelProgress.pythonCompleted ? "passed" : "not passed"} · PySpark{" "}
                {levelProgress.pysparkCompleted ? "passed" : "not passed"}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (previousLevel) {
                      selectLevel(previousLevel.id);
                    }
                  }}
                  disabled={!previousLevel}
                >
                  <ChevronLeft className="mr-2 size-4" />
                  Previous level
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (nextLevelProgress?.unlocked && nextLevel) {
                      selectLevel(nextLevel.id);
                    }
                  }}
                  disabled={!nextLevel || !nextLevelProgress?.unlocked}
                >
                  Next level
                  <ChevronRight className="ml-2 size-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    void handleResetEditor(activeLanguage);
                  }}
                >
                  <RotateCcw className="mr-2 size-4" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  disabled={busyLanguage === activeLanguage || !validatorBackedBundle}
                  onClick={() => {
                    void handleRunOrSubmit(activeLanguage, "run");
                  }}
                >
                  <Play className="mr-2 size-4" />
                  Run {activeLanguage.toUpperCase()}
                </Button>
                <Button
                  className="rounded-full bg-pink-500 text-white hover:bg-pink-400"
                  disabled={busyLanguage === activeLanguage || !validatorBackedBundle}
                  onClick={() => {
                    void handleRunOrSubmit(activeLanguage, "submit");
                  }}
                >
                  <SendHorizonal className="mr-2 size-4" />
                  Submit {activeLanguage.toUpperCase()}
                </Button>
              </div>
            </div>

            {nextMissingLanguage && !levelProgress.completed ? (
              <p className="text-xs leading-6 text-muted-foreground">
                Empty editors do not count. The next missing draft is {nextMissingLanguage.toUpperCase()}.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
