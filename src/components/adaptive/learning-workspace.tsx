"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Lightbulb, Loader2, Play, Send, Sparkles } from "lucide-react";
import { applyOutcome } from "@/lib/adaptive/progress";
import type { EvaluationResult, LearnerQuestion, ScheduleReason, Technology } from "@/lib/adaptive/types";
import { useAdaptiveProgress } from "@/hooks/use-adaptive-progress";
import { Button } from "@/components/ui/button";

type QuestionResponse = { question: LearnerQuestion; evaluationToken: string; scheduleReason: ScheduleReason };

const labels: Record<Technology, { name: string; accent: string; description: string }> = {
  sql: { name: "SQL", accent: "bg-blue-600", description: "PostgreSQL curriculum · isolated SQLite validation" },
  python: { name: "Python", accent: "bg-emerald-600", description: "Python 3 · isolated hidden-test runtime" },
  pyspark: { name: "PySpark", accent: "bg-orange-600", description: "DataFrame API · honest runtime evidence" },
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(result.error || "Request failed safely.");
  return result;
}

export function LearningWorkspace({ technology }: { technology: Technology }) {
  const { progress, setProgress, ready } = useAdaptiveProgress();
  const [session, setSession] = useState<QuestionResponse | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"generate" | "run" | "submit" | "hint" | "explain" | null>(null);
  const [error, setError] = useState("");
  const [runtime, setRuntime] = useState<{ passed: boolean; mode: string; summary: string } | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [teacherMessage, setTeacherMessage] = useState("");
  const [usedHint, setUsedHint] = useState(false);
  const meta = labels[technology];

  const nextQuestion = useCallback(async () => {
    if (!ready) return;
    setBusy("generate"); setError(""); setRuntime(null); setEvaluation(null); setTeacherMessage(""); setUsedHint(false);
    try {
      const result = await postJson<QuestionResponse>("/api/tutor/generate", { technology, progress });
      setSession(result); setCode(result.question.starterCode);
    } catch (cause) { setSession(null); setError(cause instanceof Error ? cause.message : "Question generation failed."); }
    finally { setBusy(null); }
  }, [progress, ready, technology]);

  useEffect(() => {
    if (!ready || session || error || busy) return;
    const timer = window.setTimeout(() => void nextQuestion(), 0);
    return () => window.clearTimeout(timer);
  }, [ready, session, error, busy, nextQuestion]);

  const run = async () => {
    if (!session) return;
    setBusy("run"); setError("");
    try { setRuntime(await postJson("/api/tutor/run", { evaluationToken: session.evaluationToken, code })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Run failed."); }
    finally { setBusy(null); }
  };

  const submit = async () => {
    if (!session) return;
    setBusy("submit"); setError("");
    try {
      const result = await postJson<EvaluationResult>("/api/tutor/evaluate", { evaluationToken: session.evaluationToken, code });
      setEvaluation(result);
      setProgress((current) => applyOutcome(current, { technology, curriculumNodeId: session.question.curriculumNodeId, dimensions: session.question.skillDimensions, evaluation: result, usedHint, review: session.scheduleReason === "review", interview: session.scheduleReason === "interview", fingerprint: session.question.fingerprint }));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Submission failed."); }
    finally { setBusy(null); }
  };

  const assist = async (kind: "hint" | "explain") => {
    if (!session) return;
    setBusy(kind); setError(""); if (kind === "hint") setUsedHint(true);
    try { const result = await postJson<{ message: string }>("/api/tutor/assist", { evaluationToken: session.evaluationToken, code, kind }); setTeacherMessage(result.message); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Teacher assistance failed."); }
    finally { setBusy(null); }
  };

  const schemaText = useMemo(() => session?.question.schema ? JSON.stringify(session.question.schema, null, 2) : "No input schema is required.", [session]);

  if (!ready || busy === "generate") return <LoadingState label={`Preparing your next ${meta.name} question…`} />;
  if (!session) return <ConfigurationState error={error} retry={nextQuestion} />;
  const question = session.question;

  return (
    <div className="coding-workspace bg-slate-200/70 p-2">
      <div className="mx-auto grid h-full max-w-[1800px] gap-2 lg:grid-cols-[minmax(340px,44%)_minmax(0,56%)]">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${meta.accent}`} />
              <span className="text-sm font-semibold text-slate-800">Problem</span>
              <span className="text-xs text-slate-400">{meta.name}</span>
            </div>
            <Tag>Difficulty {question.difficulty}/5</Tag>
          </div>
          <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-6 sm:px-7 lg:overscroll-contain">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{question.title}</h1>
              <p className="mt-2 text-xs text-slate-500">{meta.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-600"><Tag>{question.topic}</Tag><Tag>{question.subtopic}</Tag></div>
            </div>
            <div><p className="eyebrow">Description</p><p className="mt-3 text-[15px] leading-7 text-slate-700">{question.prompt}</p></div>
            <InfoBlock title="Input schema" content={schemaText} />
            {question.sampleData ? <InfoBlock title="Example" content={JSON.stringify(question.sampleData, null, 2)} /> : null}
            <div><p className="eyebrow">Expected output</p><ul className="mt-3 space-y-2.5">{question.expectedBehavior.map((rule) => <li key={rule} className="flex gap-2.5 text-sm leading-6 text-slate-600"><CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-500" />{rule}</li>)}</ul></div>
          </div>
        </section>

        <section className="flex min-h-[680px] min-w-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#0d1117] shadow-sm lg:min-h-0">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><span className="font-mono text-xs text-slate-300">Code · solution.{technology === "sql" ? "sql" : "py"}</span><span className="text-xs text-slate-500">{question.subtopic}</span></div>
          <textarea aria-label={`${meta.name} code editor`} value={code} onChange={(event) => setCode(event.target.value)} spellCheck={false} className="min-h-[320px] w-full flex-1 resize-none bg-transparent p-5 font-mono text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-600" />
          <div className="flex flex-wrap gap-2 border-y border-white/10 bg-[#11161d] p-3">
            <Button onClick={run} disabled={!!busy} className="bg-white text-slate-950 hover:bg-slate-200"><Play className="size-4" />Run</Button>
            <Button onClick={submit} disabled={!!busy} className="bg-emerald-600 text-white hover:bg-emerald-500"><Send className="size-4" />Submit</Button>
            <Button onClick={() => assist("hint")} disabled={!!busy} variant="outline" className="border-white/15 bg-transparent text-slate-200 hover:bg-white/10 hover:text-white"><Lightbulb className="size-4" />Hint</Button>
            <Button onClick={() => assist("explain")} disabled={!!busy} variant="outline" className="border-white/15 bg-transparent text-slate-200 hover:bg-white/10 hover:text-white"><Sparkles className="size-4" />Explain</Button>
            <Button onClick={nextQuestion} disabled={!!busy} variant="ghost" className="ml-auto text-slate-300 hover:bg-white/10 hover:text-white">Next<ArrowRight className="size-4" /></Button>
          </div>
          <WorkspaceResults busy={busy} error={error} runtime={runtime} teacherMessage={teacherMessage} evaluation={evaluation} />
        </section>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) { return <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">{children}</span>; }
function InfoBlock({ title, content }: { title: string; content: string }) { return <div><p className="eyebrow">{title}</p><pre className="mt-3 max-h-52 overflow-auto rounded-2xl bg-slate-50 p-4 font-mono text-xs leading-5 text-slate-600">{content}</pre></div>; }
function LoadingState({ label }: { label: string }) { return <div className="grid min-h-[55vh] place-items-center"><div className="text-center"><Loader2 className="mx-auto size-6 animate-spin text-blue-600" /><p className="mt-4 text-sm text-slate-500">{label}</p></div></div>; }
function ConfigurationState({ error, retry }: { error: string; retry: () => void }) { return <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center"><AlertCircle className="mx-auto size-7 text-amber-600" /><h1 className="mt-4 text-xl font-semibold text-slate-950">AI teacher configuration required</h1><p className="mt-2 text-sm leading-6 text-slate-600">{error || "The AI teacher is unavailable."}</p><Button onClick={retry} className="mt-5">Try again</Button></div>; }

function WorkspaceResults({ busy, error, runtime, teacherMessage, evaluation }: { busy: string | null; error: string; runtime: { passed: boolean; mode: string; summary: string } | null; teacherMessage: string; evaluation: EvaluationResult | null }) {
  const hasContent = busy || error || runtime || teacherMessage || evaluation;
  return <div className="min-h-40 max-h-[42%] overflow-y-auto bg-[#11161d] p-4 text-slate-200 lg:overscroll-contain"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-semibold text-slate-300">Test result & feedback</p>{evaluation ? <span className={`rounded-md px-2 py-1 text-xs font-semibold ${evaluation.verdict === "correct" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>{evaluation.score}/100</span> : null}</div>{!hasContent ? <p className="text-sm text-slate-500">Run your code to see results here.</p> : null}{busy ? <div className="flex items-center gap-2 text-sm text-blue-300"><Loader2 className="size-4 animate-spin" />{busy === "submit" ? "Running hidden checks and asking the AI teacher…" : busy === "run" ? "Running your code…" : "Preparing targeted guidance…"}</div> : null}{error ? <ResultNotice tone="error" title="Something needs attention" body={error} /> : null}{runtime ? <ResultNotice tone={runtime.passed ? "success" : "neutral"} title={runtime.mode === "structural" ? "Structurally evaluated" : runtime.passed ? "Runtime passed" : "Runtime result"} body={runtime.summary} /> : null}{teacherMessage ? <ResultNotice tone="neutral" title="AI teacher" body={teacherMessage} /> : null}{evaluation ? <EvaluationPanel evaluation={evaluation} /> : null}</div>;
}

function ResultNotice({ tone, title, body }: { tone: "error" | "success" | "neutral"; title: string; body: string }) { const styles = tone === "error" ? "border-red-400/20 bg-red-400/10 text-red-200" : tone === "success" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-white/10 bg-white/5 text-slate-200"; return <div className={`mb-3 rounded-lg border p-3 ${styles}`}><p className="text-xs font-semibold">{title}</p><p className="mt-1 text-xs leading-5 opacity-80">{body}</p></div>; }
function EvaluationPanel({ evaluation }: { evaluation: EvaluationResult }) { return <div className="space-y-4"><h2 className="text-lg font-semibold capitalize text-white">{evaluation.verdict.replace("-", " ")}</h2><div className="grid gap-4 xl:grid-cols-2"><FeedbackList title="What was done well" items={evaluation.doneWell} /><FeedbackList title="What needs improvement" items={evaluation.improvements} /></div><div className="grid gap-3 xl:grid-cols-2"><FeedbackText title="Mistake classification" text={evaluation.mistakeClassification} /><FeedbackText title="Runtime or validator" text={evaluation.runtimeResult} /><FeedbackText title="Teacher explanation" text={evaluation.explanation} /><FeedbackText title="Suggested next action" text={evaluation.suggestedNextAction} /></div></div>; }
function FeedbackList({ title, items }: { title: string; items: string[] }) { return <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p><ul className="mt-2 space-y-1 text-xs leading-5 text-slate-300">{items.length ? items.map((item) => <li key={item}>• {item}</li>) : <li>—</li>}</ul></div>; }
function FeedbackText({ title, text }: { title: string; text: string }) { return <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p><p className="mt-1.5 text-xs leading-5 text-slate-300">{text}</p></div>; }
