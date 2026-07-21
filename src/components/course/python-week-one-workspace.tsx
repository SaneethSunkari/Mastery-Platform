"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { CheckCircle2, ChevronLeft, ChevronRight, LockKeyhole, Play, RotateCcw, Send } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  db,
  initializeDatabase,
  savePythonQuestionDraft,
  savePythonQuestionEvaluation,
  touchPythonQuestion,
} from "@/lib/db";
import { getLessonById, getWeeksByCourse } from "@/lib/curriculum";
import { getQuestionIdForLesson } from "@/lib/questions/registry";
import {
  pythonWeekOneQuestions,
  resolvePythonWeekOneQuestionId,
} from "@/lib/questions/python-week-one";
import { runPythonValidation, resetPythonWorker, type PythonRunResult } from "@/lib/python-runner";
import { cn } from "@/lib/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type RunState =
  | {
      kind: "idle";
    }
  | {
      kind: "done";
      result: PythonRunResult;
    };

const idleRunState: RunState = { kind: "idle" };

const pythonWeekTwo = getWeeksByCourse("python")[1] ?? null;

function buildFailureFeedback(result: PythonRunResult) {
  if (result.error) {
    return result.error.message;
  }

  const visibleFailure = result.visibleResults.find((item) => !item.passed);
  if (visibleFailure) {
    return `${visibleFailure.description}: expected ${JSON.stringify(visibleFailure.expected)}, got ${JSON.stringify(visibleFailure.actual)}.`;
  }

  if (result.hiddenFailures.length > 0) {
    return `Hidden checks failed: ${result.hiddenFailures.join(", ")}.`;
  }

  return "Submission did not pass yet.";
}

export function PythonWeekOneWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedQuestionId = searchParams.get("question");

  const questionProgressRecords = useLiveQuery(
    () => db.masteryQuestionProgress.where("track").equals("python").toArray(),
    [],
  );
  const courseProgress = useLiveQuery(
    () => db.courseProgress.get("course-progress-python"),
    [],
  );
  const weekProgress = useLiveQuery(
    () => db.weekProgress.where("courseSlug").equals("python").toArray(),
    [],
  );

  const [draftsByQuestion, setDraftsByQuestion] = useState<Record<string, string>>({});
  const [runState, setRunState] = useState<RunState>(idleRunState);
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    void initializeDatabase();
  }, []);

  useEffect(() => {
    return () => {
      resetPythonWorker();
    };
  }, []);

  const questionProgress = useMemo(() => {
    const progressById = new Map(
      (questionProgressRecords ?? []).map((record) => [record.questionId, record]),
    );

    return pythonWeekOneQuestions.map((question, index) => {
      const record = progressById.get(question.id);
      return (
        record ?? {
          id: `question-progress-${question.id}`,
          createdAt: "",
          updatedAt: "",
          questionId: question.id,
          track: "python" as const,
          weekNumber: 1,
          positionWithinWeek: index + 1,
          legacySourceKind: "lesson" as const,
          legacySourceId: question.lessonId,
          status: index === 0 ? ("unlocked" as const) : ("locked" as const),
          passed: false,
          score: 0,
          attempts: 0,
          draftCode: "",
          validationMode: "python-runtime" as const,
          validatorVersion: question.validatorVersion,
          lastOpenedAt: null,
          lastRunAt: null,
          lastSubmissionAt: null,
          completedAt: null,
        }
      );
    });
  }, [questionProgressRecords]);

  const questionProgressById = useMemo(
    () => new Map(questionProgress.map((record) => [record.questionId, record])),
    [questionProgress],
  );

  const weekTwoStatus = weekProgress?.find((record) => record.weekId === pythonWeekTwo?.id)?.status ?? "locked";

  const resolvedQuestion = useMemo(() => {
    const currentLesson = courseProgress?.currentLessonId
      ? getLessonById(courseProgress.currentLessonId)
      : null;
    const currentQuestionId = currentLesson ? getQuestionIdForLesson(currentLesson) : null;
    return resolvePythonWeekOneQuestionId(
      questionProgress,
      requestedQuestionId,
      currentQuestionId,
    );
  }, [courseProgress, questionProgress, requestedQuestionId]);

  const activeQuestionId = resolvedQuestion.questionId ?? pythonWeekOneQuestions[0]?.id ?? null;
  const routeNotice =
    resolvedQuestion.reason === "locked-request"
      ? "That question is still locked. Opened your current allowed question instead."
      : null;

  useEffect(() => {
    if (questionProgress.length === 0 || !activeQuestionId) {
      return;
    }
    if (requestedQuestionId !== activeQuestionId) {
      router.replace(`${pathname}?question=${activeQuestionId}`, { scroll: false });
    }
    void touchPythonQuestion(activeQuestionId);
  }, [activeQuestionId, pathname, questionProgress.length, requestedQuestionId, router]);

  const selectedQuestion =
    pythonWeekOneQuestions.find((question) => question.id === activeQuestionId) ??
    pythonWeekOneQuestions[0];
  const selectedProgress = questionProgressById.get(selectedQuestion.id);
  const editorValue =
    draftsByQuestion[selectedQuestion.id] ??
    selectedProgress?.draftCode ??
    selectedQuestion.starterCode;
  const selectedIndex = pythonWeekOneQuestions.findIndex((question) => question.id === selectedQuestion.id);
  const previousQuestion = selectedIndex > 0 ? pythonWeekOneQuestions[selectedIndex - 1] : null;
  const nextQuestion = selectedIndex >= 0 ? pythonWeekOneQuestions[selectedIndex + 1] ?? null : null;
  const nextQuestionLocked = nextQuestion
    ? questionProgressById.get(nextQuestion.id)?.status === "locked"
    : true;
  const completedCount = questionProgress.filter((record) => record.passed).length;

  async function selectQuestion(questionId: string) {
    const record = questionProgressById.get(questionId);
    if (!record || record.status === "locked") {
      setMessage("That question is still locked.");
      return;
    }

    setRunState(idleRunState);
    setMessage(null);
    router.replace(`${pathname}?question=${questionId}`, { scroll: false });
    await touchPythonQuestion(questionId);
  }

  async function handleEditorChange(value: string | undefined) {
    const nextValue = value ?? "";
    setDraftsByQuestion((current) => ({
      ...current,
      [selectedQuestion.id]: nextValue,
    }));
    await savePythonQuestionDraft(selectedQuestion.id, nextValue);
  }

  async function runCode() {
    setIsBusy(true);
    setMessage(null);

    try {
      await savePythonQuestionDraft(selectedQuestion.id, editorValue);
      const result = await runPythonValidation({
        code: editorValue,
        functionName: "solve",
        visibleCases: selectedQuestion.visibleCases,
        hiddenCases: selectedQuestion.hiddenCases,
      });
      setRunState({ kind: "done", result });
      setMessage(result.error ? "Python runtime returned an error." : "Code executed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function submitCode() {
    setIsBusy(true);
    setMessage(null);

    try {
      await savePythonQuestionDraft(selectedQuestion.id, editorValue);
      const result = await runPythonValidation({
        code: editorValue,
        functionName: "solve",
        visibleCases: selectedQuestion.visibleCases,
        hiddenCases: selectedQuestion.hiddenCases,
      });
      setRunState({ kind: "done", result });

      const progression = await savePythonQuestionEvaluation(selectedQuestion.id, {
        passed: result.passed,
        score: result.score,
        feedback: result.passed ? "All visible and hidden Python checks passed." : buildFailureFeedback(result),
      });

      if (!result.passed) {
        setMessage("Submission did not pass yet.");
        return;
      }

      const nextQuestionId =
        progression.nextQuestionId &&
        questionProgressById.get(progression.nextQuestionId)?.weekNumber === 1
          ? progression.nextQuestionId
          : null;

      if (nextQuestionId) {
        setMessage("Passed. The next question is now unlocked.");
        setRunState(idleRunState);
        router.replace(`${pathname}?question=${nextQuestionId}`, { scroll: false });
        await touchPythonQuestion(nextQuestionId);
        return;
      }

      setMessage("Passed. Python Week 1 is complete and Week 2 is unlocked.");
    } finally {
      setIsBusy(false);
    }
  }

  async function resetDraft() {
    setDraftsByQuestion((current) => ({
      ...current,
      [selectedQuestion.id]: selectedQuestion.starterCode,
    }));
    await savePythonQuestionDraft(selectedQuestion.id, selectedQuestion.starterCode);
    setRunState(idleRunState);
    setMessage("Draft reset.");
  }

  const result = runState.kind === "done" ? runState.result : null;

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="border-white/10 bg-slate-950/70 xl:h-[calc(100vh-10rem)]">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-2xl text-white">Python Week 1</CardTitle>
              <p className="mt-2 text-sm text-slate-400">
                125 runtime-graded questions. One question at a time.
              </p>
            </div>
            <Badge className="bg-teal-400/15 text-teal-200 hover:bg-teal-400/15">
              {completedCount}/125 passed
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            <Badge variant="outline" className="border-white/10 text-slate-300">
              Resume uses the current unlocked question
            </Badge>
            <Badge variant="outline" className="border-white/10 text-slate-300">
              Week 2: {weekTwoStatus === "locked" ? "locked" : "unlocked"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="h-[calc(100%-8rem)] overflow-hidden">
          <div className="h-full overflow-y-auto pr-2">
            <div className="grid gap-2">
              {pythonWeekOneQuestions.map((question) => {
                const record = questionProgressById.get(question.id);
                const locked = record?.status === "locked";
                const passed = record?.passed;
                const active = question.id === selectedQuestion.id;

                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => void selectQuestion(question.id)}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-left transition",
                      active && "border-white bg-white text-slate-950",
                      !active && !locked && "border-white/10 bg-slate-900/80 text-white hover:border-white/30",
                      locked && "border-white/10 bg-slate-900/50 text-slate-500",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.28em] opacity-70">
                          Question {question.positionWithinWeek}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm font-semibold">
                          {question.title}
                        </p>
                      </div>
                      {locked ? (
                        <LockKeyhole className="mt-0.5 size-4 shrink-0" />
                      ) : passed ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="border-white/10 bg-slate-950/70">
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-teal-400/15 text-teal-200 hover:bg-teal-400/15">
                Question {selectedQuestion.positionWithinWeek} of 125
              </Badge>
              <Badge variant="outline" className="border-white/10 text-slate-300">
                {selectedQuestion.questionType}
              </Badge>
              <Badge variant="outline" className="border-white/10 text-slate-300">
                {selectedQuestion.topic}
              </Badge>
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-white">{selectedQuestion.title}</h1>
              <p className="mt-2 text-sm leading-7 text-slate-300">{selectedQuestion.prompt}</p>
            </div>

            {selectedQuestion.visibleCases[0] ? (
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Sample fixture</p>
                <p className="mt-3 text-sm text-slate-300">
                  {selectedQuestion.visibleCases[0].description}
                </p>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Input</p>
                    <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-200">
                      {JSON.stringify(selectedQuestion.visibleCases[0].input, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Expected shape</p>
                    <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-200">
                      {JSON.stringify(selectedQuestion.visibleCases[0].expected, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : null}

            {routeNotice ? (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                {routeNotice}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-950/70">
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Editor</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Run locally, then submit to unlock the next question.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="border-white/10" onClick={() => void resetDraft()}>
                  <RotateCcw className="mr-2 size-4" />
                  Reset
                </Button>
                <Button variant="outline" className="border-white/10" onClick={() => void runCode()} disabled={isBusy}>
                  <Play className="mr-2 size-4" />
                  Run
                </Button>
                <Button className="bg-teal-300 text-slate-950 hover:bg-teal-200" onClick={() => void submitCode()} disabled={isBusy}>
                  <Send className="mr-2 size-4" />
                  Submit
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10">
              <MonacoEditor
                height="320px"
                defaultLanguage="python"
                theme="vs-dark"
                value={editorValue}
                onChange={(value) => void handleEditorChange(value)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 15,
                  lineNumbersMinChars: 3,
                  padding: { top: 16, bottom: 16 },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="border-white/10"
                  onClick={() => previousQuestion && void selectQuestion(previousQuestion.id)}
                  disabled={!previousQuestion}
                >
                  <ChevronLeft className="mr-2 size-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10"
                  onClick={() => nextQuestion && void selectQuestion(nextQuestion.id)}
                  disabled={!nextQuestion || nextQuestionLocked}
                >
                  Next
                  <ChevronRight className="ml-2 size-4" />
                </Button>
              </div>
              <div className="text-sm text-slate-400">
                Attempts: {selectedProgress?.attempts ?? 0}
              </div>
            </div>

            {message ? (
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
                {message}
              </div>
            ) : null}

            {result ? (
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={result.passed ? "bg-emerald-500/15 text-emerald-200" : "bg-rose-500/15 text-rose-200"}>
                    {result.passed ? "Passed" : "Not passed"}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 text-slate-300">
                    Score {result.score}
                  </Badge>
                </div>

                {result.error ? (
                  <p className="mt-3 text-sm text-rose-200">{result.error.message}</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {result.visibleResults.map((item) => (
                      <div key={item.description} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200">
                        <span className={item.passed ? "text-emerald-300" : "text-rose-300"}>
                          {item.passed ? "Pass" : "Fail"}
                        </span>{" "}
                        {item.description}
                      </div>
                    ))}
                    {result.hiddenFailures.length > 0 ? (
                      <p className="text-sm text-rose-200">
                        Hidden checks failed: {result.hiddenFailures.join(", ")}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
