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
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2"><span className={`size-2.5 rounded-full ${meta.accent}`} /><span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{meta.name} · adaptive practice</span></div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{question.title}</h1>
          <p className="mt-2 text-sm text-slate-500">{meta.description}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600"><Tag>{question.topic}</Tag><Tag>{question.subtopic}</Tag><Tag>Difficulty {question.difficulty}/5</Tag></div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div><p className="eyebrow">Question</p><p className="mt-3 text-base leading-7 text-slate-700">{question.prompt}</p></div>
          <InfoBlock title="Input schema or sample data" content={schemaText} />
          {question.sampleData ? <InfoBlock title="Sample data" content={JSON.stringify(question.sampleData, null, 2)} /> : null}
          <div><p className="eyebrow">Expected output rules</p><ul className="mt-3 space-y-2">{question.expectedBehavior.map((rule) => <li key={rule} className="flex gap-2 text-sm leading-6 text-slate-600"><CheckCircle2 className="mt-1 size-4 shrink-0 text-slate-400" />{rule}</li>)}</ul></div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-[#0d1117] shadow-xl shadow-slate-950/10">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3"><span className="font-mono text-xs text-slate-400">solution.{technology === "sql" ? "sql" : "py"}</span><span className="text-xs text-slate-500">One question at a time</span></div>
          <textarea aria-label={`${meta.name} code editor`} value={code} onChange={(event) => setCode(event.target.value)} spellCheck={false} className="min-h-[390px] w-full resize-y bg-transparent p-5 font-mono text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-600" />
          <div className="flex flex-wrap gap-2 border-t border-white/10 p-4">
            <Button onClick={run} disabled={!!busy} className="bg-white text-slate-950 hover:bg-slate-200"><Play className="size-4" />Run</Button>
            <Button onClick={submit} disabled={!!busy} className="bg-blue-600 text-white hover:bg-blue-500"><Send className="size-4" />Submit</Button>
            <Button onClick={() => assist("hint")} disabled={!!busy} variant="outline" className="border-white/15 bg-transparent text-slate-200 hover:bg-white/10 hover:text-white"><Lightbulb className="size-4" />Hint</Button>
            <Button onClick={() => assist("explain")} disabled={!!busy} variant="outline" className="border-white/15 bg-transparent text-slate-200 hover:bg-white/10 hover:text-white"><Sparkles className="size-4" />Explain</Button>
            <Button onClick={nextQuestion} disabled={!!busy} variant="ghost" className="ml-auto text-slate-300 hover:bg-white/10 hover:text-white">Next question<ArrowRight className="size-4" /></Button>
          </div>
        </section>
      </div>

      {busy ? <InlineLoading label={busy === "submit" ? "Running hidden checks and asking the AI teacher…" : busy === "run" ? "Running your code…" : "Preparing targeted guidance…"} /> : null}
      {error ? <Notice tone="error" title="Something needs attention" body={error} /> : null}
      {runtime ? <Notice tone={runtime.passed ? "success" : "neutral"} title={runtime.mode === "structural" ? "Structurally evaluated" : runtime.passed ? "Runtime passed" : "Runtime result"} body={runtime.summary} /> : null}
      {teacherMessage ? <Notice tone="neutral" title="AI teacher" body={teacherMessage} /> : null}
      {evaluation ? <Feedback evaluation={evaluation} /> : null}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) { return <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">{children}</span>; }
function InfoBlock({ title, content }: { title: string; content: string }) { return <div><p className="eyebrow">{title}</p><pre className="mt-3 max-h-52 overflow-auto rounded-2xl bg-slate-50 p-4 font-mono text-xs leading-5 text-slate-600">{content}</pre></div>; }
function LoadingState({ label }: { label: string }) { return <div className="grid min-h-[55vh] place-items-center"><div className="text-center"><Loader2 className="mx-auto size-6 animate-spin text-blue-600" /><p className="mt-4 text-sm text-slate-500">{label}</p></div></div>; }
function InlineLoading({ label }: { label: string }) { return <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800"><Loader2 className="size-4 animate-spin" />{label}</div>; }
function ConfigurationState({ error, retry }: { error: string; retry: () => void }) { return <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center"><AlertCircle className="mx-auto size-7 text-amber-600" /><h1 className="mt-4 text-xl font-semibold text-slate-950">AI teacher configuration required</h1><p className="mt-2 text-sm leading-6 text-slate-600">{error || "The AI teacher is unavailable."}</p><Button onClick={retry} className="mt-5">Try again</Button></div>; }
function Notice({ tone, title, body }: { tone: "error" | "success" | "neutral"; title: string; body: string }) { const styles = tone === "error" ? "border-red-200 bg-red-50 text-red-900" : tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-800"; return <div className={`rounded-2xl border p-5 ${styles}`}><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-sm leading-6 opacity-80">{body}</p></div>; }
function Feedback({ evaluation }: { evaluation: EvaluationResult }) { return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">Submission feedback</p><h2 className="mt-2 text-2xl font-semibold capitalize text-slate-950">{evaluation.verdict.replace("-", " ")}</h2></div><span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">{evaluation.score}/100</span></div><div className="mt-6 grid gap-5 md:grid-cols-2"><FeedbackList title="What was done well" items={evaluation.doneWell} /><FeedbackList title="What needs improvement" items={evaluation.improvements} /></div><div className="mt-5 grid gap-4 md:grid-cols-2"><FeedbackText title="Exact mistake classification" text={evaluation.mistakeClassification} /><FeedbackText title="Runtime or validator result" text={evaluation.runtimeResult} /><FeedbackText title="Teacher explanation" text={evaluation.explanation} /><FeedbackText title="Suggested next action" text={evaluation.suggestedNextAction} /></div></section>; }
function FeedbackList({ title, items }: { title: string; items: string[] }) { return <div><p className="eyebrow">{title}</p><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">{items.length ? items.map((item) => <li key={item}>• {item}</li>) : <li>—</li>}</ul></div>; }
function FeedbackText({ title, text }: { title: string; text: string }) { return <div className="rounded-2xl bg-slate-50 p-4"><p className="eyebrow">{title}</p><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>; }
