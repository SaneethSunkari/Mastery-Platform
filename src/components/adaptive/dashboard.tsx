"use client";

import Link from "next/link";
import { ArrowRight, Braces, Database, Flame, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdaptiveProgress } from "@/hooks/use-adaptive-progress";
import { masteryForTechnology, totalCompleted } from "@/lib/adaptive/progress";
import type { Technology } from "@/lib/adaptive/types";

const cards: Array<{ technology: Technology | "arcade"; label: string; href: string; icon: typeof Database; color: string }> = [
  { technology: "sql", label: "SQL", href: "/sql", icon: Database, color: "bg-blue-50 text-blue-700" },
  { technology: "python", label: "Python", href: "/python", icon: Braces, color: "bg-emerald-50 text-emerald-700" },
  { technology: "pyspark", label: "PySpark", href: "/pyspark", icon: Sparkles, color: "bg-orange-50 text-orange-700" },
  { technology: "arcade", label: "Arcade", href: "/arcade", icon: Flame, color: "bg-violet-50 text-violet-700" },
];

export function AdaptiveDashboard() {
  const { progress, reset, ready } = useAdaptiveProgress();
  if (!ready) return <div className="min-h-[50vh]" />;
  const resetProgress = () => { if (window.confirm("Reset all mastery progress on this browser? This cannot be undone.")) reset(); };
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Your practice</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Keep the loop simple.</h1><p className="mt-3 text-base text-slate-500">One question, clear feedback, then the right next step.</p></div><Button onClick={resetProgress} variant="ghost" className="self-start text-slate-500 hover:bg-red-50 hover:text-red-700"><Trash2 className="size-4" />Reset progress</Button></section>
      <section className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => { const Icon = card.icon; const count = card.technology === "arcade" ? progress.arcadeCompleted : progress.solved[card.technology]; const mastery = card.technology === "arcade" ? null : masteryForTechnology(progress, card.technology); return <Link key={card.href} href={card.href} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"><div className="flex items-start justify-between"><div className={`grid size-11 place-items-center rounded-2xl ${card.color}`}><Icon className="size-5" /></div><ArrowRight className="size-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700" /></div><div className="mt-8 flex items-end justify-between"><div><h2 className="text-xl font-semibold text-slate-950">{card.label}</h2><p className="mt-1 text-sm text-slate-500">{card.technology === "arcade" ? "completed" : "solved"}</p></div><div className="text-right"><p className="text-4xl font-semibold tracking-tight text-slate-950">{count}</p>{mastery !== null ? <p className="mt-1 text-xs font-medium text-slate-400">{mastery}% mastery</p> : null}</div></div></Link>; })}
      </section>
      <section className="flex items-center justify-between rounded-3xl bg-slate-950 p-6 text-white sm:p-8"><div><p className="text-sm text-slate-400">Total completed</p><p className="mt-2 text-4xl font-semibold">{totalCompleted(progress)}</p></div><div className="max-w-xs text-right text-sm leading-6 text-slate-400">Progress and review timing stay on this device.</div></section>
    </div>
  );
}
