"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Play, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdaptiveProgress } from "@/hooks/use-adaptive-progress";
import { applyOutcome } from "@/lib/adaptive/progress";
import type { EvaluationResult, LearnerQuestion, ScheduleReason } from "@/lib/adaptive/types";

type Language = "sql" | "python" | "pyspark";
type Session = { question: LearnerQuestion; evaluationToken: string; scheduleReason: ScheduleReason };

async function post<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(result.error || "Request failed safely.");
  return result;
}

function parseEditors(value: string) {
  try {
    const parsed = JSON.parse(value) as Partial<Record<Language, string>>;
    return { sql: parsed.sql ?? "", python: parsed.python ?? "", pyspark: parsed.pyspark ?? "" };
  } catch { return { sql: "", python: "", pyspark: "" }; }
}

export function ArcadeWorkspace() {
  const { progress, setProgress, ready } = useAdaptiveProgress();
  const [session, setSession] = useState<Session | null>(null);
  const [active, setActive] = useState<Language>("sql");
  const [answers, setAnswers] = useState<Record<Language, string>>({ sql: "", python: "", pyspark: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [runResult, setRunResult] = useState<{ passed: boolean; summary: string } | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const next = useCallback(async () => {
    if (!ready) return;
    setBusy(true); setError(""); setRunResult(null); setEvaluation(null);
    try { const result = await post<Session>("/api/tutor/generate", { technology: "arcade", progress }); setSession(result); setAnswers(parseEditors(result.question.starterCode)); setActive("sql"); }
    catch (cause) { setSession(null); setError(cause instanceof Error ? cause.message : "Mission generation failed."); }
    finally { setBusy(false); }
  }, [progress, ready]);

  useEffect(() => {
    if (!ready || session || error || busy) return;
    const timer = window.setTimeout(() => void next(), 0);
    return () => window.clearTimeout(timer);
  }, [ready, session, error, busy, next]);
  const bundle = JSON.stringify(answers);

  const run = async () => {
    if (!session) return;
    setBusy(true); setError("");
    try { setRunResult(await post("/api/tutor/run", { evaluationToken: session.evaluationToken, code: bundle })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Run failed."); }
    finally { setBusy(false); }
  };

  const submit = async () => {
    if (!session) return;
    setBusy(true); setError("");
    try {
      const result = await post<EvaluationResult>("/api/tutor/evaluate", { evaluationToken: session.evaluationToken, code: bundle });
      setEvaluation(result);
      setProgress((current) => applyOutcome(current, { technology: "arcade", curriculumNodeId: "arcade-cross-language", dimensions: session.question.skillDimensions, evaluation: result, fingerprint: session.question.fingerprint, arcadeComplete: result.verdict === "correct", interview: true }));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Submission failed."); }
    finally { setBusy(false); }
  };

  if (!ready || busy && !session) return <div className="grid min-h-[55vh] place-items-center"><Loader2 className="size-6 animate-spin text-orange-600" /></div>;
  if (!session) return <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center"><h1 className="text-xl font-semibold">AI teacher configuration required</h1><p className="mt-2 text-sm text-slate-600">{error}</p><Button className="mt-5" onClick={next}>Try again</Button></div>;
  const question = session.question;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700"><Sparkles className="size-4" />Cross-language arcade</div><h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{question.title}</h1><p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{question.prompt}</p></section>
      <section className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="eyebrow">Acceptance criteria</p>
          <ul className="mt-4 space-y-3">{question.expectedBehavior.map((item) => <li className="flex gap-2 text-sm leading-6 text-slate-600" key={item}><CheckCircle2 className="mt-1 size-4 shrink-0 text-orange-500" />{item}</li>)}</ul>
          <p className="eyebrow mt-7">Sample data</p><pre className="mt-3 max-h-72 overflow-auto rounded-2xl bg-slate-50 p-4 font-mono text-xs leading-5 text-slate-600">{JSON.stringify(question.sampleData ?? question.schema, null, 2)}</pre>
          <div className="mt-6 rounded-2xl bg-orange-50 p-4 text-sm leading-6 text-orange-950">Progress increases only when all three solutions meet the acceptance criteria.</div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-[#0d1117] shadow-xl shadow-slate-950/10">
          <div className="flex border-b border-white/10 p-2">{(["sql", "python", "pyspark"] as Language[]).map((language, index) => <button key={language} onClick={() => setActive(language)} className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium capitalize transition ${active === language ? "bg-white text-slate-950" : "text-slate-400 hover:text-white"}`}>{index + 1}. {language === "pyspark" ? "PySpark" : language.toUpperCase()}</button>)}</div>
          <textarea aria-label={`${active} arcade code editor`} value={answers[active]} onChange={(event) => setAnswers((current) => ({ ...current, [active]: event.target.value }))} spellCheck={false} className="min-h-[430px] w-full resize-y bg-transparent p-5 font-mono text-sm leading-6 text-slate-100 outline-none" />
          <div className="flex flex-wrap gap-2 border-t border-white/10 p-4"><Button onClick={run} disabled={busy} className="bg-white text-slate-950 hover:bg-slate-200"><Play className="size-4" />Run all three</Button><Button onClick={submit} disabled={busy} className="bg-orange-600 text-white hover:bg-orange-500"><Send className="size-4" />Submit mission</Button><Button onClick={next} disabled={busy} variant="ghost" className="ml-auto text-slate-300 hover:bg-white/10 hover:text-white">Next mission<ArrowRight className="size-4" /></Button></div>
        </div>
      </section>
      {busy ? <div className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-900"><Loader2 className="size-4 animate-spin" />Checking all three approaches…</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</div> : null}
      {runResult ? <div className={`rounded-2xl border p-5 text-sm leading-6 ${runResult.passed ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-700"}`}><p className="font-semibold">{runResult.passed ? "All acceptance checks passed" : "More work is needed"}</p><p className="mt-1 opacity-80">{runResult.summary}</p></div> : null}
      {evaluation ? <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="eyebrow">Cross-language feedback</p><h2 className="mt-2 text-2xl font-semibold capitalize">{evaluation.verdict.replace("-", " ")}</h2></div><span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">{evaluation.score}/100</span></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><Feedback title="Correctness & runtime" text={evaluation.runtimeResult} /><Feedback title="Exact classification" text={evaluation.mistakeClassification} /><Feedback title="Approach comparison" text={evaluation.explanation} /><Feedback title="Next action" text={evaluation.suggestedNextAction} /></div></section> : null}
    </div>
  );
}

function Feedback({ title, text }: { title: string; text: string }) { return <div className="rounded-2xl bg-slate-50 p-4"><p className="eyebrow">{title}</p><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>; }
