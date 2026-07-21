"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import initSqlJs, { type QueryExecResult, type SqlJsStatic } from "sql.js";
import { useLiveQuery } from "dexie-react-hooks";
import { CheckCircle2, ChevronRight, LockKeyhole, Play, RotateCcw, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { completeSqlTask, db, markSqlTaskRun, saveSqlTaskDraft } from "@/lib/db";
import { sqlDatasetSchema, getSqlWeekDefinition } from "@/lib/sql-weeks";
import { getLessonsByWeek } from "@/lib/curriculum";
import { findSqlTaskByQuestionId } from "@/lib/questions/registry";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type RunState = {
  kind: "idle" | "success" | "error";
  executionTimeMs: number;
  rowCount: number;
  message: string | null;
  result: QueryExecResult | null;
};

const idleRunState: RunState = {
  kind: "idle",
  executionTimeMs: 0,
  rowCount: 0,
  message: null,
  result: null,
};

function normalizeResult(result: QueryExecResult | null) {
  if (!result) {
    return { columns: [], values: [] as string[][] };
  }

  return {
    columns: result.columns.map((column) => column.trim().toLowerCase()),
    values: result.values.map((row) =>
      row.map((value) => {
        if (value === null || value === undefined) {
          return "null";
        }
        if (typeof value === "number") {
          return Number(value).toFixed(6);
        }
        return String(value).trim().toLowerCase();
      }),
    ),
  };
}

function compareResults(actual: QueryExecResult | null, expected: QueryExecResult | null, orderSensitive: boolean) {
  const normalizedActual = normalizeResult(actual);
  const normalizedExpected = normalizeResult(expected);

  if (normalizedActual.columns.length !== normalizedExpected.columns.length) {
    return "Wrong number of columns.";
  }

  const sameColumns = normalizedActual.columns.every(
    (column, index) => column === normalizedExpected.columns[index],
  );
  if (!sameColumns) {
    return "Column names or column order do not match the expected output.";
  }

  if (normalizedActual.values.length !== normalizedExpected.values.length) {
    return "Row count does not match the expected result.";
  }

  const actualRows = orderSensitive
    ? normalizedActual.values
    : [...normalizedActual.values].sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
  const expectedRows = orderSensitive
    ? normalizedExpected.values
    : [...normalizedExpected.values].sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));

  for (let index = 0; index < expectedRows.length; index += 1) {
    if (JSON.stringify(actualRows[index]) !== JSON.stringify(expectedRows[index])) {
      return orderSensitive
        ? "Rows are not correct, or the sorting is different from the expected answer."
        : "The returned rows do not match the expected answer.";
    }
  }

  return null;
}

function buildDatabase(SQL: SqlJsStatic) {
  const database = new SQL.Database();
  database.run(sqlDatasetSchema);
  return database;
}

function executeQuery(SQL: SqlJsStatic, sql: string) {
  const database = buildDatabase(SQL);
  const startedAt = performance.now();
  const result = database.exec(sql);
  const executionTimeMs = performance.now() - startedAt;
  database.close();
  return {
    result: result[0] ?? null,
    executionTimeMs,
  };
}

export function SqlWeekWorkspace({
  weekId,
  initialLessonId,
  initialQuestionId,
}: {
  weekId: string;
  initialLessonId?: string | null;
  initialQuestionId?: string | null;
}) {
  const router = useRouter();
  const weekDefinition = getSqlWeekDefinition(weekId);
  const [sqlModule, setSqlModule] = useState<SqlJsStatic | null>(null);
  const [sqlInitError, setSqlInitError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState(weekDefinition?.tasks[0]?.id ?? "");
  const [draftsByTask, setDraftsByTask] = useState<Record<string, string>>({});
  const [runState, setRunState] = useState<RunState>(idleRunState);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const progressRecords = useLiveQuery(
    () => db.sqlTaskProgress.where("weekId").equals(weekId).toArray(),
    [weekId],
  );
  const nextWeekProgress = useLiveQuery(
    async () =>
      weekDefinition?.nextWeekId
        ? (await db.weekProgress.get(`week-progress-${weekDefinition.nextWeekId}`)) ?? null
        : null,
    [weekDefinition?.nextWeekId],
  );

  useEffect(() => {
    let isCancelled = false;
    async function loadSqlModule() {
      try {
        const wasmUrl = new URL("/sql-wasm.wasm", window.location.origin);
        const response = await fetch(wasmUrl.toString());
        if (!response.ok) {
          throw new Error(`Failed to load SQL engine: ${response.status}`);
        }

        const wasmBinary = await response.arrayBuffer();
        const SQL = await initSqlJs({ wasmBinary });

        if (!isCancelled) {
          setSqlModule(SQL);
          setSqlInitError(null);
        }
      } catch (error) {
        if (!isCancelled) {
          setSqlInitError(error instanceof Error ? error.message : "Failed to load the SQL engine.");
        }
      }
    }

    void loadSqlModule();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (!weekDefinition) {
    return <div className="text-sm text-muted-foreground">Week not found.</div>;
  }

  const activeWeek = weekDefinition;
  const queryLessonIndex = initialLessonId
    ? getLessonsByWeek(weekId).findIndex((lesson) => lesson.id === initialLessonId)
    : -1;
  const queryQuestionTask = initialQuestionId ? findSqlTaskByQuestionId(initialQuestionId) : null;
  const queryTask =
    queryQuestionTask && queryQuestionTask.weekId === weekId
      ? queryQuestionTask
      :
    queryLessonIndex >= 0
      ? activeWeek.tasks.find((task) => Math.floor((task.stepNumber - 1) / 5) === queryLessonIndex)
      : null;

  const selectedTask =
    activeWeek.tasks.find((task) => task.id === selectedTaskId) ??
    queryTask ??
    activeWeek.tasks[0];
  const relatedLessons = getLessonsByWeek(weekId);
  const relatedLesson = relatedLessons[Math.floor((selectedTask.stepNumber - 1) / 5)] ?? null;
  const selectedProgress = progressRecords?.find((record) => record.taskId === selectedTask.id);
  const editorValue = draftsByTask[selectedTask.id] ?? selectedProgress?.draftSql ?? "";
  const completedCount = (progressRecords ?? []).filter((record) => record.completed).length;
  const progressPercent = Math.round((completedCount / activeWeek.tasks.length) * 100);
  const weekComplete = completedCount === activeWeek.tasks.length;

  async function handleRun() {
    if (!sqlModule) {
      setRunState({
        ...idleRunState,
        kind: "error",
        message: sqlInitError ?? "SQL engine is still loading.",
      });
      return;
    }

    setIsBusy(true);
    setSubmitMessage(null);

    try {
      const executed = executeQuery(sqlModule, editorValue);
      await markSqlTaskRun(selectedTask.id, editorValue);
      setRunState({
        kind: "success",
        executionTimeMs: executed.executionTimeMs,
        rowCount: executed.result?.values.length ?? 0,
        message: null,
        result: executed.result,
      });
    } catch (error) {
      await markSqlTaskRun(selectedTask.id, editorValue);
      setRunState({
        kind: "error",
        executionTimeMs: 0,
        rowCount: 0,
        message: error instanceof Error ? error.message : "Unknown SQL error.",
        result: null,
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSubmit() {
    if (!sqlModule) {
      setSubmitMessage(sqlInitError ?? "SQL engine is still loading.");
      return;
    }

    setIsBusy(true);
    setSubmitMessage(null);

    try {
      const executed = executeQuery(sqlModule, editorValue);
      const expected = executeQuery(sqlModule, selectedTask.solutionSql);
      const mismatch = compareResults(executed.result, expected.result, selectedTask.orderSensitive);

      await markSqlTaskRun(selectedTask.id, editorValue);
      setRunState({
        kind: "success",
        executionTimeMs: executed.executionTimeMs,
        rowCount: executed.result?.values.length ?? 0,
        message: null,
        result: executed.result,
      });

      if (mismatch) {
        setSubmitMessage(mismatch);
        return;
      }

      const wasAlreadyCompleted = Boolean(selectedProgress?.completed);
      await completeSqlTask(selectedTask.id, editorValue);
      const isFinalNewCompletion =
        !wasAlreadyCompleted && completedCount + 1 === activeWeek.tasks.length;

      if (isFinalNewCompletion && activeWeek.nextWeekId) {
        router.push(`/sql/week/${activeWeek.nextWeekId}`);
        return;
      }

      setSubmitMessage("Correct. This step is complete.");

      const nextTask = activeWeek.tasks.find(
        (task) => task.stepNumber === selectedTask.stepNumber + 1,
      );
      if (nextTask) {
        setSelectedTaskId(nextTask.id);
      }
    } catch (error) {
      await markSqlTaskRun(selectedTask.id, editorValue);
      setRunState({
        kind: "error",
        executionTimeMs: 0,
        rowCount: 0,
        message: error instanceof Error ? error.message : "Unknown SQL error.",
        result: null,
      });
      setSubmitMessage("The query did not run successfully.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleReset() {
    setDraftsByTask((current) => ({
      ...current,
      [selectedTask.id]: "",
    }));
    await saveSqlTaskDraft(selectedTask.id, "");
    setRunState(idleRunState);
    setSubmitMessage(null);
  }

  async function handleEditorChange(value: string | undefined) {
    const nextValue = value ?? "";
    setDraftsByTask((current) => ({
      ...current,
      [selectedTask.id]: nextValue,
    }));
    await saveSqlTaskDraft(selectedTask.id, nextValue);
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-amber-400/15 text-amber-200 hover:bg-amber-400/15">{weekDefinition.badge}</Badge>
            <Badge variant="outline">15 questions</Badge>
            {activeWeek.nextWeekId ? (
              <Badge variant="outline">Sequential unlocks</Badge>
            ) : null}
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">{activeWeek.title}</CardTitle>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Completed</p>
              <p className="mt-2 text-3xl font-semibold">{completedCount}/{activeWeek.tasks.length}</p>
            </div>
            <div className="rounded-2xl border border-border/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Unlock rule</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{activeWeek.unlockMessage}</p>
            </div>
            <div className="rounded-2xl border border-border/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Next status</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {activeWeek.nextWeekId
                  ? nextWeekProgress?.status === "unlocked"
                    ? "Next week unlocked"
                    : "Next week still locked"
                  : "This week ends the current playable track"}
              </p>
            </div>
          </div>
          <Progress value={progressPercent} />
          {weekComplete && activeWeek.nextWeekId ? (
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/sql/week/${activeWeek.nextWeekId}`}
                className={cn(buttonVariants(), "inline-flex rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300")}
              >
                {activeWeek.nextWeekLabel}
              </Link>
              <Link href="/sql" className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}>
                Open SQL level map
              </Link>
            </div>
          ) : null}
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Week steps</CardTitle>
            <CardDescription>Finish each unlocked task to open the next one.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeWeek.tasks.map((task) => {
              const progress = progressRecords?.find((record) => record.taskId === task.id);
              const isSelected = task.id === selectedTaskId;
              const isUnlocked = progress?.unlocked ?? false;
              const isCompleted = progress?.completed ?? false;

              return (
                <button
                  key={task.id}
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`w-full rounded-3xl border p-4 text-left transition-colors ${
                    isSelected
                      ? "border-slate-900 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                      : isUnlocked
                        ? "border-border/70 bg-background hover:bg-accent"
                        : "border-border/70 bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em]">Step {task.stepNumber}</p>
                      <p className="mt-2 font-medium">{task.title}</p>
                    </div>
                    {isCompleted ? (
                      <CheckCircle2 className="size-5" />
                    ) : isUnlocked ? (
                      <ChevronRight className="size-5" />
                    ) : (
                      <LockKeyhole className="size-5" />
                    )}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Step {selectedTask.stepNumber}</Badge>
                <Badge variant="outline">{selectedTask.difficulty}</Badge>
                {selectedProgress?.completed ? (
                  <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-200">
                    Completed
                  </Badge>
                ) : null}
              </div>
              <CardTitle className="text-2xl font-semibold">{selectedTask.title}</CardTitle>
              <CardDescription>{selectedTask.objective}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-border/70 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">What to do</p>
                <ul className="mt-3 space-y-2 text-sm leading-6">
                  {selectedTask.instructions.map((instruction) => (
                    <li key={instruction}>• {instruction}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-border/70 bg-muted/25 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Dataset for this week</p>
                <div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">customers</p>
                    <p className="break-words font-mono text-xs sm:text-sm">
                      customer_id, customer_name, country, email, is_active, signup_date
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">orders</p>
                    <p className="break-words font-mono text-xs sm:text-sm">
                      order_id, customer_id, status, amount, order_date, payment_method
                    </p>
                  </div>
                  <p>
                    Attempts: {selectedProgress?.attempts ?? 0}
                    {" · "}
                    Last run:{" "}
                    {selectedProgress?.lastRunAt
                      ? new Date(selectedProgress.lastRunAt).toLocaleString()
                      : "Not run yet"}
                  </p>
                </div>
              </div>
              {relatedLesson ? (
                <div className="rounded-3xl border border-border/70 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Related week concept</p>
                  <p className="mt-3 font-medium">{relatedLesson.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{relatedLesson.summary}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Practice editor</CardTitle>
              <CardDescription>Write the query, run it locally, then submit when the output looks right.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-3xl border border-border/70">
                <MonacoEditor
                  height="360px"
                  defaultLanguage="sql"
                  language="sql"
                  theme="vs-dark"
                  value={editorValue}
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    tabSize: 2,
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleRun} disabled={isBusy || !sqlModule}>
                  <Play className="mr-2 size-4" />
                  Run query
                </Button>
                <Button onClick={handleSubmit} disabled={isBusy || !sqlModule}>
                  <Send className="mr-2 size-4" />
                  Submit task
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2 size-4" />
                  Reset query
                </Button>
              </div>
              {sqlInitError ? (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
                  {sqlInitError}
                </div>
              ) : null}
              {submitMessage ? (
                <div className={`rounded-2xl border px-4 py-3 text-sm ${
                  submitMessage.startsWith("Correct")
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                }`}>
                  {submitMessage}
                </div>
              ) : null}
              <div className="rounded-3xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">Results</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {runState.kind === "success"
                      ? `${runState.rowCount} rows in ${runState.executionTimeMs.toFixed(2)} ms`
                      : "Waiting for a run"}
                  </p>
                </div>
                {runState.kind === "error" ? (
                  <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
                    {runState.message}
                  </div>
                ) : null}
                {runState.kind === "success" && runState.result ? (
                  <div className="mt-4 overflow-auto rounded-2xl border border-border/70">
                    <table className="min-w-full text-sm">
                      <thead className="bg-muted/60 text-left">
                        <tr>
                          {runState.result.columns.map((column) => (
                            <th key={column} className="px-3 py-2 font-medium">
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {runState.result.values.map((row, rowIndex) => (
                          <tr key={`${selectedTask.id}-${rowIndex}`} className="border-t border-border/70">
                            {row.map((cell, cellIndex) => (
                              <td key={`${selectedTask.id}-${rowIndex}-${cellIndex}`} className="px-3 py-2">
                                {cell === null ? "NULL" : String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
