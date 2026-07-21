"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import {
  ChevronRight,
  FlaskConical,
  LockKeyhole,
  Play,
  RotateCcw,
  Save,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { db, saveLessonDraft, saveLessonEvaluation, touchLesson } from "@/lib/db";
import { getMasteryExerciseForLesson, gradePysparkSubmission } from "@/lib/mastery-exercises";
import { runPythonExercise, resetPythonWorker, type PythonRunResult } from "@/lib/python-runner";
import { CourseSlug } from "@/lib/types";
import { getCourseBySlug, getLessonById, getLessonsByWeek, getWeeksByCourse } from "@/lib/curriculum";
import { cn } from "@/lib/utils";
import { findLessonByQuestionId, getQuestionIdForLesson } from "@/lib/questions/registry";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const courseTheme = {
  python: {
    hero: "from-teal-500/20 via-cyan-500/10 to-transparent",
    badge: "bg-teal-400/15 text-teal-200 hover:bg-teal-400/15",
    button: "bg-teal-300 text-slate-950 hover:bg-teal-200",
  },
  pyspark: {
    hero: "from-sky-500/20 via-blue-500/10 to-transparent",
    badge: "bg-sky-400/15 text-sky-200 hover:bg-sky-400/15",
    button: "bg-sky-300 text-slate-950 hover:bg-sky-200",
  },
} as const;

type SubmissionResult =
  | {
      kind: "idle";
    }
  | {
      kind: "python";
      result: PythonRunResult;
    }
  | {
      kind: "pyspark";
      result: {
        passed: boolean;
        score: number;
        feedback: string[];
        mode: string;
      };
    };

const idleSubmissionResult: SubmissionResult = { kind: "idle" };

function masteryBadgeColor(masteryState: string) {
  switch (masteryState) {
    case "passed":
    case "mastered":
      return "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-200";
    case "practiced":
      return "bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 dark:text-amber-200";
    case "reading":
      return "bg-sky-500/15 text-sky-700 hover:bg-sky-500/15 dark:text-sky-200";
    case "needs_review":
      return "bg-rose-500/15 text-rose-700 hover:bg-rose-500/15 dark:text-rose-200";
    default:
      return "";
  }
}

export function CourseMasteryWorkspace({
  courseSlug,
  initialWeekId,
  initialLessonId,
  initialQuestionId,
}: {
  courseSlug: Exclude<CourseSlug, "sql">;
  initialWeekId?: string | null;
  initialLessonId?: string | null;
  initialQuestionId?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const course = getCourseBySlug(courseSlug);
  const weeks = useMemo(() => getWeeksByCourse(courseSlug), [courseSlug]);

  const weekProgress = useLiveQuery(
    () => db.weekProgress.where("courseSlug").equals(courseSlug).toArray(),
    [courseSlug],
  );
  const lessonProgress = useLiveQuery(
    () => db.lessonProgress.where("courseSlug").equals(courseSlug).toArray(),
    [courseSlug],
  );
  const courseProgress = useLiveQuery(
    () => db.courseProgress.get(`course-progress-${courseSlug}`),
    [courseSlug],
  );

  const [selectedWeekId, setSelectedWeekId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [draftsByLesson, setDraftsByLesson] = useState<Record<string, string>>({});
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult>(idleSubmissionResult);
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  if (!course || !weekProgress || !lessonProgress || !courseProgress) {
    return <div className="text-sm text-muted-foreground">Loading mastery workspace...</div>;
  }

  const currentUnlockedWeek =
    weeks.find((week) => {
      const progress = weekProgress.find((item) => item.weekId === week.id);
      return progress?.status === "unlocked" || progress?.status === "in_progress";
    }) ?? weeks.find((week) => week.id === courseProgress.currentWeekId) ?? weeks[0] ?? null;

  if (!currentUnlockedWeek) {
    return <div className="text-sm text-muted-foreground">No course weeks found.</div>;
  }

  const activeWeek =
    weeks.find((week) => week.id === selectedWeekId) ??
    (initialQuestionId
      ? (() => {
          const lesson = findLessonByQuestionId(initialQuestionId);
          return lesson?.courseSlug === courseSlug
            ? weeks.find((week) => week.id === lesson.weekId)
            : null;
        })()
      : null) ??
    weeks.find((week) => week.id === initialWeekId) ??
    weeks.find((week) => week.id === courseProgress.currentWeekId) ??
    currentUnlockedWeek;
  const activeLessons = getLessonsByWeek(activeWeek.id);
  const resolvedSelectedLesson =
    activeLessons.find((lesson) => lesson.id === selectedLessonId) ??
    (initialQuestionId
      ? (() => {
          const lesson = findLessonByQuestionId(initialQuestionId);
          return lesson?.courseSlug === courseSlug ? activeLessons.find((item) => item.id === lesson.id) : null;
        })()
      : null) ??
    activeLessons.find((lesson) => lesson.id === initialLessonId) ??
    activeLessons.find((lesson) => lesson.id === courseProgress.currentLessonId) ??
    activeLessons.find((lesson) => {
      const progress = lessonProgress.find((item) => item.lessonId === lesson.id);
      return progress?.status === "unlocked" || progress?.status === "in_progress";
    }) ??
    activeLessons.find((lesson) => {
      const progress = lessonProgress.find((item) => item.lessonId === lesson.id);
      return progress?.status === "completed";
    }) ??
    activeLessons[0] ??
    null;

  if (!resolvedSelectedLesson) {
    return <div className="text-sm text-muted-foreground">No lessons found for this week.</div>;
  }

  const selectedLessonIndex = activeLessons.findIndex((lesson) => lesson.id === resolvedSelectedLesson.id);
  const selectedLessonProgress =
    lessonProgress.find((item) => item.lessonId === resolvedSelectedLesson.id) ?? null;
  const editorValue =
    draftsByLesson[resolvedSelectedLesson.id] ??
    selectedLessonProgress?.draftCode ??
    "";
  const passedCount = activeLessons.filter((lesson) => {
    const progress = lessonProgress.find((item) => item.lessonId === lesson.id);
    return progress?.masteryState === "passed" || progress?.masteryState === "mastered";
  }).length;
  const progressPercent = Math.round((passedCount / activeLessons.length) * 100);
  const nextWeek = weeks.find((week) => week.weekNumber === activeWeek.weekNumber + 1) ?? null;
  const nextWeekProgress = nextWeek
    ? weekProgress.find((item) => item.weekId === nextWeek.id) ?? null
    : null;
  const exercise = getMasteryExerciseForLesson(resolvedSelectedLesson.id);

  function syncRouteToLesson(lessonId: string, weekId: string) {
    const lesson = getLessonById(lessonId);
    if (!lesson || lesson.courseSlug !== courseSlug) {
      return;
    }

    const questionId = getQuestionIdForLesson(lesson);
    const nextParams = new URLSearchParams();

    if (questionId) {
      nextParams.set("question", questionId);
    } else {
      nextParams.set("week", weekId);
      nextParams.set("lesson", lessonId);
    }

    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }

  async function selectLesson(lessonId: string) {
    const lesson = activeLessons.find((item) => item.id === lessonId);
    if (!lesson) {
      return;
    }

    setSelectedWeekId(lesson.weekId);
    setSelectedLessonId(lessonId);
    setMessage(null);
    setSubmissionResult(idleSubmissionResult);
    await touchLesson(lessonId);
    syncRouteToLesson(lessonId, lesson.weekId);
  }

  async function handleEditorChange(value: string | undefined) {
    const nextValue = value ?? "";
    setDraftsByLesson((current) => ({
      ...current,
      [resolvedSelectedLesson.id]: nextValue,
    }));
    await saveLessonDraft(resolvedSelectedLesson.id, nextValue);
  }

  async function handleReset() {
    setDraftsByLesson((current) => ({
      ...current,
      [resolvedSelectedLesson.id]: "",
    }));
    await saveLessonDraft(resolvedSelectedLesson.id, "");
    setSubmissionResult(idleSubmissionResult);
    setMessage(null);
  }

  async function handleSaveDraft() {
    await saveLessonDraft(resolvedSelectedLesson.id, editorValue);
    setMessage("Draft saved locally.");
  }

  async function handleRun() {
    if (!exercise) {
      setMessage("No exercise definition exists for this lesson yet.");
      return;
    }

    setIsBusy(true);
    setMessage(null);

    try {
      await saveLessonDraft(resolvedSelectedLesson.id, editorValue);
      if (exercise.gradingMode === "python-runtime") {
        const result = await runPythonExercise(exercise, editorValue);
        setSubmissionResult({ kind: "python", result });
        setMessage(result.error ? "Python runtime returned an error." : "Code executed. Review the test results below.");
        return;
      }

      const result = gradePysparkSubmission(exercise, editorValue);
      setSubmissionResult({ kind: "pyspark", result });
      setMessage("Structural validation finished. Review the feedback below.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSubmit() {
    if (!exercise) {
      setMessage("No exercise definition exists for this lesson yet.");
      return;
    }

    setIsBusy(true);
    setMessage(null);

    try {
      await saveLessonDraft(resolvedSelectedLesson.id, editorValue);

      if (exercise.gradingMode === "python-runtime") {
        const result = await runPythonExercise(exercise, editorValue);
        setSubmissionResult({ kind: "python", result });

        const feedback = result.error
          ? result.error.message
          : result.passed
            ? "All visible and hidden Python tests passed."
            : [
                ...result.visibleResults
                  .filter((item) => !item.passed)
                  .map((item) => `${item.description}: expected ${JSON.stringify(item.expected)}, got ${JSON.stringify(item.actual)}.`),
                ...result.hiddenFailures.map((item) => `Hidden test failed: ${item}.`),
              ].join(" ");

        const progression = await saveLessonEvaluation(resolvedSelectedLesson.id, {
          passed: result.passed,
          score: result.score,
          feedback,
          evidenceType: "python-runtime",
        });

        if (result.passed && progression.nextWeekId && progression.nextWeekId !== activeWeek.id) {
          setSelectedWeekId(progression.nextWeekId);
          setSelectedLessonId(progression.nextLessonId ?? "");
          if (progression.nextLessonId) {
            syncRouteToLesson(progression.nextLessonId, progression.nextWeekId);
          }
          setMessage("Passed. The next week is now unlocked.");
        } else if (result.passed && progression.nextLessonId) {
          setSelectedLessonId(progression.nextLessonId);
          syncRouteToLesson(progression.nextLessonId, activeWeek.id);
          setMessage("Passed. The next lesson is now unlocked.");
        } else if (result.passed) {
          syncRouteToLesson(resolvedSelectedLesson.id, activeWeek.id);
          setMessage("Passed. This lesson has verified runtime evidence.");
        } else {
          setMessage("Submission did not pass yet. Review the failed checks below.");
        }
        return;
      }

      const result = gradePysparkSubmission(exercise, editorValue);
      setSubmissionResult({ kind: "pyspark", result });

      const feedback = result.feedback.join(" ");
      const progression = await saveLessonEvaluation(resolvedSelectedLesson.id, {
        passed: result.passed,
        score: result.score,
        feedback,
        evidenceType: "pyspark-structural",
      });

      if (result.passed && progression.nextWeekId && progression.nextWeekId !== activeWeek.id) {
        setSelectedWeekId(progression.nextWeekId);
        setSelectedLessonId(progression.nextLessonId ?? "");
        if (progression.nextLessonId) {
          syncRouteToLesson(progression.nextLessonId, progression.nextWeekId);
        }
        setMessage("Passed structural validation. The next week is now unlocked.");
      } else if (result.passed && progression.nextLessonId) {
        setSelectedLessonId(progression.nextLessonId);
        syncRouteToLesson(progression.nextLessonId, activeWeek.id);
        setMessage("Passed structural validation. The next lesson is now unlocked.");
      } else if (result.passed) {
        syncRouteToLesson(resolvedSelectedLesson.id, activeWeek.id);
        setMessage("Passed structural validation for this lesson.");
      } else {
        setMessage("Submission did not pass structural validation yet.");
      }
    } finally {
      setIsBusy(false);
    }
  }

  const honestLabel =
    exercise?.honestLabel ??
    (courseSlug === "python"
      ? "Runtime execution is not defined for this lesson yet."
      : "Structural validation is not defined for this lesson yet.");

  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={courseTheme[courseSlug].badge}>Week {activeWeek.weekNumber}</Badge>
            <Badge variant="outline">{activeLessons.length} questions</Badge>
            <Badge variant="outline">
              {exercise?.gradingMode === "python-runtime" ? "Runtime graded" : "Structurally validated"}
            </Badge>
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">{activeWeek.title}</CardTitle>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Passed</p>
              <p className="mt-2 text-3xl font-semibold">{passedCount}/{activeLessons.length}</p>
            </div>
            <div className="rounded-2xl border border-border/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Unlock rule</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Pass the current question to unlock the next one.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Next status</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {nextWeek
                  ? nextWeekProgress?.status === "unlocked" || nextWeekProgress?.status === "in_progress" || nextWeekProgress?.status === "completed"
                    ? "Next week unlocked"
                    : "Next week still locked"
                  : "This is the last week in the current lane"}
              </p>
            </div>
          </div>
          <Progress value={progressPercent} />
        </CardHeader>
      </Card>

      {message ? (
        <div className="rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground">
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Week steps</CardTitle>
            <CardDescription>Each step connects to a lesson in Materials and a validated mastery challenge here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeLessons.map((lesson, index) => {
              const progress = lessonProgress.find((item) => item.lessonId === lesson.id);
              const unlocked = progress?.status !== "locked";
              const selected = resolvedSelectedLesson.id === lesson.id;
              return (
                <button
                  key={lesson.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => {
                    void selectLesson(lesson.id);
                  }}
                  className={cn(
                    "w-full rounded-3xl border p-4 text-left transition",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : unlocked
                        ? "border-border/70 hover:border-foreground/20 hover:bg-accent/20"
                        : "border-border/70 bg-muted/30 text-muted-foreground",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] opacity-70">Step {index + 1}</p>
                      <p className="mt-2 font-medium">{lesson.title}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge className={masteryBadgeColor(progress?.masteryState ?? "not_started")}>
                          {(progress?.masteryState ?? "not_started").replaceAll("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    {unlocked ? <ChevronRight className="size-5 shrink-0" /> : <LockKeyhole className="size-5 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Step {selectedLessonIndex + 1}</Badge>
                <Badge variant="outline">Week {activeWeek.weekNumber}</Badge>
                <Badge variant="outline">{resolvedSelectedLesson.estimatedMinutes} min</Badge>
                <Badge variant="outline">{exercise?.gradingMode ?? "ungraded"}</Badge>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-semibold">{resolvedSelectedLesson.title}</CardTitle>
                <CardDescription className="text-sm leading-7 text-muted-foreground">
                  {exercise?.python?.prompt ?? exercise?.pyspark?.prompt ?? resolvedSelectedLesson.summary}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-border/70 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">What to do</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
                  <li>• Start from the blank editor and solve the exact challenge for this lesson.</li>
                  <li>• Use the visible checks as your debugging guide before you submit.</li>
                  <li>• This step unlocks only when the grading mode for this lesson passes.</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-border/70 p-4">
                <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                  {exercise?.prerequisiteLessonIds.length ? (
                    <div className="rounded-2xl border border-border/70 p-3">
                      Prerequisites: complete the earlier unlocked step in this week before expecting this one to pass.
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-border/70 p-3">No prerequisite lesson beyond the current week entry point.</div>
                  )}
                  <div className="rounded-2xl border border-border/70 p-3">{honestLabel}</div>
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Visible checks</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  {(exercise?.visibleChecks ?? ["Exercise definition not found."]).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">
                {courseSlug === "python" ? "Python practice editor" : "PySpark practice editor"}
              </CardTitle>
              <CardDescription>
                Drafts save locally. Mastery state changes only after a validated submission.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-3xl border border-border/70">
                <MonacoEditor
                  height="360px"
                  language="python"
                  theme="vs-dark"
                  value={editorValue || exercise?.python?.starterCode || exercise?.pyspark?.starterCode || ""}
                  onChange={(value) => {
                    void handleEditorChange(value);
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 15,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => void handleReset()} disabled={isBusy}>
                  <RotateCcw className="mr-2 size-4" />
                  Reset
                </Button>
                <Button variant="outline" onClick={() => void handleSaveDraft()} disabled={isBusy}>
                  <Save className="mr-2 size-4" />
                  Save draft
                </Button>
                <Button variant="outline" onClick={() => void handleRun()} disabled={isBusy}>
                  <Play className="mr-2 size-4" />
                  Run checks
                </Button>
                {courseSlug === "python" ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetPythonWorker();
                      setMessage("Python runtime reset.");
                    }}
                    disabled={isBusy}
                  >
                    <FlaskConical className="mr-2 size-4" />
                    Reset runtime
                  </Button>
                ) : null}
                <Button onClick={() => void handleSubmit()} disabled={isBusy} className={courseTheme[courseSlug].button}>
                  <Send className="mr-2 size-4" />
                  Submit for mastery
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Result and feedback</CardTitle>
              <CardDescription>
                This is where the product explains why the submission passed or failed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6">
              {submissionResult.kind === "idle" ? (
                <div className="rounded-3xl border border-dashed border-border/70 bg-muted/30 p-4 text-muted-foreground">
                  No run yet for this lesson.
                </div>
              ) : null}

              {submissionResult.kind === "python" ? (
                <>
                  <div className="rounded-3xl border border-border/70 p-4">
                    <p className="font-medium">
                      {submissionResult.result.passed ? "Passed all configured tests." : "Did not pass all configured tests yet."}
                    </p>
                    <p className="mt-2 text-muted-foreground">Score: {submissionResult.result.score}%</p>
                    {submissionResult.result.error ? (
                      <div className="mt-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-700 dark:text-rose-200">
                        {submissionResult.result.error.message}
                      </div>
                    ) : null}
                  </div>
                  {submissionResult.result.visibleResults.map((item) => (
                    <div key={item.description} className="rounded-3xl border border-border/70 p-4">
                      <p className="font-medium">{item.description}</p>
                      <p className="mt-2 text-muted-foreground">
                        {item.passed
                          ? "Passed"
                          : `Failed. Expected ${JSON.stringify(item.expected)}, got ${JSON.stringify(item.actual)}.`}
                      </p>
                    </div>
                  ))}
                  {submissionResult.result.hiddenFailures.length ? (
                    <div className="rounded-3xl border border-border/70 p-4">
                      <p className="font-medium">Hidden test feedback</p>
                      <ul className="mt-2 space-y-2 text-muted-foreground">
                        {submissionResult.result.hiddenFailures.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {(submissionResult.result.stdout || submissionResult.result.stderr) ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-3xl border border-border/70 p-4">
                        <p className="font-medium">stdout</p>
                        <pre className="mt-2 whitespace-pre-wrap text-muted-foreground">{submissionResult.result.stdout || "(empty)"}</pre>
                      </div>
                      <div className="rounded-3xl border border-border/70 p-4">
                        <p className="font-medium">stderr</p>
                        <pre className="mt-2 whitespace-pre-wrap text-muted-foreground">{submissionResult.result.stderr || "(empty)"}</pre>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}

              {submissionResult.kind === "pyspark" ? (
                <>
                  <div className="rounded-3xl border border-border/70 p-4">
                    <p className="font-medium">
                      {submissionResult.result.passed ? "Passed structural validation." : "Did not pass structural validation yet."}
                    </p>
                    <p className="mt-2 text-muted-foreground">
                      Score: {submissionResult.result.score}% · Mode: {submissionResult.result.mode}
                    </p>
                  </div>
                  {submissionResult.result.feedback.map((item) => (
                    <div key={item} className="rounded-3xl border border-border/70 p-4 text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </>
              ) : null}

              {selectedLessonProgress?.lastFeedback ? (
                <div className="rounded-3xl border border-border/70 p-4">
                  <p className="font-medium">Latest saved feedback</p>
                  <p className="mt-2 text-muted-foreground">{selectedLessonProgress.lastFeedback}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
