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
  savePysparkQuestionDraft,
  savePysparkQuestionEvaluation,
  touchPysparkQuestion,
} from "@/lib/db";
import { getLessonById, getWeeksByCourse } from "@/lib/curriculum";
import { gradePysparkDefinition } from "@/lib/mastery-exercises";
import { hasPysparkRuntime } from "@/lib/pyspark-runtime-contract";
import { runPysparkExercise } from "@/lib/pyspark-runtime-client";
import { getQuestionIdForLesson } from "@/lib/questions/registry";
import {
  getPysparkWeekOneDefinition,
  pysparkWeekOneQuestions,
  resolvePysparkWeekOneQuestionId,
} from "@/lib/questions/pyspark-week-one";
import { cn } from "@/lib/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type PysparkValidationResult = Awaited<ReturnType<typeof runPysparkExercise>> | ReturnType<typeof gradePysparkDefinition>;
type RunState =
  | { kind: "idle" }
  | { kind: "done"; result: PysparkValidationResult };

const idleRunState: RunState = { kind: "idle" };
const pysparkWeekTwo = getWeeksByCourse("pyspark")[1] ?? null;

function buildFailureFeedback(result: PysparkValidationResult) {
  return result.feedback[0] ?? "Submission did not pass yet.";
}

export function PysparkWeekOneWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedQuestionId = searchParams.get("question");

  const questionProgressRecords = useLiveQuery(
    () => db.masteryQuestionProgress.where("track").equals("pyspark").toArray(),
    [],
  );
  const courseProgress = useLiveQuery(
    () => db.courseProgress.get("course-progress-pyspark"),
    [],
  );
  const weekProgress = useLiveQuery(
    () => db.weekProgress.where("courseSlug").equals("pyspark").toArray(),
    [],
  );

  const [draftsByQuestion, setDraftsByQuestion] = useState<Record<string, string>>({});
  const [runState, setRunState] = useState<RunState>(idleRunState);
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    void initializeDatabase();
  }, []);

  const weekOneProgressRecords = useMemo(
    () =>
      (questionProgressRecords ?? []).filter(
        (record) =>
          record.weekNumber === 1 &&
          pysparkWeekOneQuestions.some((question) => question.id === record.questionId),
      ),
    [questionProgressRecords],
  );

  const questionProgress = useMemo(() => {
    const progressById = new Map(
      weekOneProgressRecords.map((record) => [record.questionId, record]),
    );

    return pysparkWeekOneQuestions.map((question, index) => {
      const record = progressById.get(question.id);
      return (
        record ?? {
          id: `question-progress-${question.id}`,
          createdAt: "",
          updatedAt: "",
          questionId: question.id,
          track: "pyspark" as const,
          weekNumber: 1,
          positionWithinWeek: index + 1,
          legacySourceKind: "lesson" as const,
          legacySourceId: question.lessonId,
          status: index === 0 ? ("unlocked" as const) : ("locked" as const),
          passed: false,
          score: 0,
          attempts: 0,
          draftCode: "",
          validationMode: "pyspark-structural" as const,
          validatorVersion: question.validatorVersion,
          lastOpenedAt: null,
          lastRunAt: null,
          lastSubmissionAt: null,
          completedAt: null,
        }
      );
    });
  }, [weekOneProgressRecords]);

  const questionProgressById = useMemo(
    () => new Map(questionProgress.map((record) => [record.questionId, record])),
    [questionProgress],
  );

  const weekTwoStatus =
    weekProgress?.find((record) => record.weekId === pysparkWeekTwo?.id)?.status ?? "locked";

  const resolvedQuestion = useMemo(() => {
    const currentLesson = courseProgress?.currentLessonId
      ? getLessonById(courseProgress.currentLessonId)
      : null;
    const currentQuestionId = currentLesson ? getQuestionIdForLesson(currentLesson) : null;
    return resolvePysparkWeekOneQuestionId(
      questionProgress,
      requestedQuestionId,
      currentQuestionId,
    );
  }, [courseProgress, questionProgress, requestedQuestionId]);

  const activeQuestionId = resolvedQuestion.questionId ?? pysparkWeekOneQuestions[0]?.id ?? null;
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
    void touchPysparkQuestion(activeQuestionId);
  }, [activeQuestionId, pathname, questionProgress.length, requestedQuestionId, router]);

  const selectedQuestion =
    pysparkWeekOneQuestions.find((question) => question.id === activeQuestionId) ??
    pysparkWeekOneQuestions[0];
  const selectedProgress = questionProgressById.get(selectedQuestion.id);
  const editorValue =
    draftsByQuestion[selectedQuestion.id] ??
    selectedProgress?.draftCode ??
    selectedQuestion.starterCode;
  const selectedIndex = pysparkWeekOneQuestions.findIndex(
    (question) => question.id === selectedQuestion.id,
  );
  const previousQuestion =
    selectedIndex > 0 ? pysparkWeekOneQuestions[selectedIndex - 1] : null;
  const nextQuestion =
    selectedIndex >= 0 ? pysparkWeekOneQuestions[selectedIndex + 1] ?? null : null;
  const nextQuestionLocked = nextQuestion
    ? questionProgressById.get(nextQuestion.id)?.status === "locked"
    : true;
  const completedCount = questionProgress.filter((record) => record.passed).length;
  const runtimeEnabledForQuestion = hasPysparkRuntime(selectedQuestion.id);

  async function gradeSelectedQuestion() {
    if (runtimeEnabledForQuestion) {
      return runPysparkExercise(selectedQuestion.id, editorValue);
    }
    return gradePysparkDefinition(getPysparkWeekOneDefinition(selectedQuestion), editorValue);
  }

  async function selectQuestion(questionId: string) {
    const record = questionProgressById.get(questionId);
    if (!record || record.status === "locked") {
      setMessage("That question is still locked.");
      return;
    }

    setRunState(idleRunState);
    setMessage(null);
    router.replace(`${pathname}?question=${questionId}`, { scroll: false });
    await touchPysparkQuestion(questionId);
  }

  async function handleEditorChange(value: string | undefined) {
    const nextValue = value ?? "";
    setDraftsByQuestion((current) => ({
      ...current,
      [selectedQuestion.id]: nextValue,
    }));
    await savePysparkQuestionDraft(selectedQuestion.id, nextValue);
  }

  async function validateCode() {
    setIsBusy(true);
    setMessage(null);

    try {
      await savePysparkQuestionDraft(selectedQuestion.id, editorValue);
      const result = await gradeSelectedQuestion();
      setRunState({ kind: "done", result });
      setMessage(
        result.passed
          ? runtimeEnabledForQuestion
            ? "Real Spark execution passed."
            : "Structural validation passed."
          : "Validation found issues.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function submitCode() {
    setIsBusy(true);
    setMessage(null);

    try {
      await savePysparkQuestionDraft(selectedQuestion.id, editorValue);
      const result = await gradeSelectedQuestion();
      setRunState({ kind: "done", result });

      const progression = await savePysparkQuestionEvaluation(selectedQuestion.id, {
        passed: result.passed,
        score: result.score,
        feedback: result.passed
          ? runtimeEnabledForQuestion
            ? "Real Spark execution matched the expected schema and rows."
            : "PySpark structural or conceptual validation passed."
          : buildFailureFeedback(result),
        evidenceType: runtimeEnabledForQuestion ? "pyspark-runtime" : "pyspark-structural",
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
        await touchPysparkQuestion(nextQuestionId);
        return;
      }

      setMessage("Passed. PySpark Week 1 is complete and Week 2 is unlocked.");
    } finally {
      setIsBusy(false);
    }
  }

  async function resetDraft() {
    setDraftsByQuestion((current) => ({
      ...current,
      [selectedQuestion.id]: selectedQuestion.starterCode,
    }));
    await savePysparkQuestionDraft(selectedQuestion.id, selectedQuestion.starterCode);
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
              <CardTitle className="text-2xl text-white">PySpark Week 1</CardTitle>
              <p className="mt-2 text-sm text-slate-400">
                125 structurally validator-backed questions. Real Spark runtime is not running in-browser yet.
              </p>
            </div>
            <Badge className="bg-sky-400/15 text-sky-200 hover:bg-sky-400/15">
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
              {pysparkWeekOneQuestions.map((question) => {
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
                      !active &&
                        !locked &&
                        "border-white/10 bg-slate-900/80 text-white hover:border-white/30",
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
              <Badge className="bg-sky-400/15 text-sky-200 hover:bg-sky-400/15">
                Question {selectedQuestion.positionWithinWeek} of 125
              </Badge>
              <Badge variant="outline" className="border-white/10 text-slate-300">
                {selectedQuestion.questionType}
              </Badge>
              <Badge variant="outline" className="border-white/10 text-slate-300">
                {selectedQuestion.topic}
              </Badge>
              <Badge variant="outline" className="border-white/10 text-slate-300">
                {runtimeEnabledForQuestion ? "real Spark runtime" : selectedQuestion.validationKind}
              </Badge>
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-white">{selectedQuestion.title}</h1>
              <p className="mt-2 text-sm leading-7 text-slate-300">{selectedQuestion.prompt}</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Expected result</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {selectedQuestion.resultExpectation}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Validation checks</p>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  {selectedQuestion.requirements.map((requirement) => (
                    <div
                      key={`${selectedQuestion.id}-${requirement.label}`}
                      className="rounded-xl border border-white/10 px-3 py-2"
                    >
                      {requirement.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

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
                  {runtimeEnabledForQuestion
                    ? "Run against server-owned fixtures in real Spark, then submit to unlock the next question."
                    : "Validate the code, then submit to unlock the next question."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="border-white/10"
                  onClick={() => void resetDraft()}
                >
                  <RotateCcw className="mr-2 size-4" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10"
                  onClick={() => void validateCode()}
                  disabled={isBusy}
                >
                  <Play className="mr-2 size-4" />
                  Validate
                </Button>
                <Button
                  className="bg-sky-300 text-slate-950 hover:bg-sky-200"
                  onClick={() => void submitCode()}
                  disabled={isBusy}
                >
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
                  <Badge
                    className={
                      result.passed
                        ? "bg-emerald-500/15 text-emerald-200"
                        : "bg-rose-500/15 text-rose-200"
                    }
                  >
                    {result.passed ? "Passed" : "Not passed"}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 text-slate-300">
                    Score {result.score}
                  </Badge>
                </div>
                <div className="mt-3 space-y-2">
                  {result.feedback.map((line) => (
                    <div
                      key={`${selectedQuestion.id}-${line}`}
                      className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200"
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
