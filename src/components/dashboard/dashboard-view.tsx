"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowRight, Clock3, Flame, RefreshCcw, Trophy } from "lucide-react";
import { academyBuildStatus, academyTracks } from "@/lib/academy";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDashboardSummary } from "@/lib/dashboard";
import { logStudyMinutes } from "@/lib/db";
import { cn } from "@/lib/utils";

export function DashboardView() {
  const summary = useLiveQuery(() => getDashboardSummary(), []);

  if (!summary) {
    return <div className="text-sm text-muted-foreground">Loading your local mastery workspace...</div>;
  }

  const cards = [
    {
      label: "Study time today",
      value: `${(summary.sqlProgress?.studyMinutesToday ?? 0) + (summary.pythonProgress?.studyMinutesToday ?? 0)} min`,
      icon: Clock3,
    },
    {
      label: "Current streak",
      value: `${summary.currentStreak} day${summary.currentStreak === 1 ? "" : "s"}`,
      icon: Flame,
    },
    {
      label: "Revision due",
      value: `${summary.revisionDue.length}`,
      icon: RefreshCcw,
    },
    {
      label: "Solved so far",
      value: `${summary.totalExercisesSolved}`,
      icon: Trophy,
    },
  ];

  const progressCards = [
    {
      title: "SQL",
      percent: summary.sqlCompletion,
      href: "/sql/week/sql-week-01",
      detail: `${summary.completedSqlTasks} SQL tasks saved locally · ${academyBuildStatus.sqlVerifiedWeeksLive} verified weeks live`,
    },
    {
      title: "Python",
      percent: summary.pythonCompletion,
      href: "/python",
      detail: `${summary.pythonProgress?.exercisesSolved ?? 0} solved · runtime lane in development`,
    },
    {
      title: "PySpark",
      percent: summary.pysparkCompletion,
      href: "/pyspark/week/pyspark-week-01",
      detail: `${summary.pysparkProgress?.exercisesSolved ?? 0} solved · lesson lane and week structure live`,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-[0_25px_90px_-45px_rgba(15,23,42,0.8)]">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-sky-500/20 text-sky-100 hover:bg-sky-500/20">
              {academyBuildStatus.roadmapMonthsTarget}-month roadmap target
            </Badge>
            <Badge className="bg-white/12 text-white hover:bg-white/12">Data engineering focus</Badge>
            <Badge className="bg-amber-500/20 text-amber-200 hover:bg-amber-500/20">Honest build status</Badge>
            <Badge className="bg-white/12 text-white hover:bg-white/12">Local-first progress</Badge>
          </div>
          <div className="space-y-3">
            <CardTitle className="font-heading text-3xl tracking-tight md:text-4xl">
              Build toward a real 6-month SQL, Python, and PySpark academy
            </CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-7 text-slate-300">
              This dashboard now shows the honest product state: what is truly interactive today, what is still planned,
              and how the platform is moving toward a 24-week permanent-deployment data-engineering academy.
            </CardDescription>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Roadmap target</p>
              <p className="mt-2 text-3xl font-semibold">{academyBuildStatus.roadmapWeeksTarget} weeks</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">SQL verified now</p>
              <p className="mt-2 text-3xl font-semibold">{academyBuildStatus.sqlVerifiedWeeksLive} weeks</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Python graded now</p>
              <p className="mt-2 text-3xl font-semibold">{academyBuildStatus.pythonVerifiedWeeksLive}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">PySpark graded now</p>
              <p className="mt-2 text-3xl font-semibold">{academyBuildStatus.pysparkVerifiedWeeksLive}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/sql/week/sql-week-01" className={cn(buttonVariants(), "rounded-full bg-amber-300 text-slate-950 hover:bg-amber-200")}>
              Start SQL missions
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link href="/arcade" className={cn(buttonVariants({ variant: "outline" }), "rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white")}>
              Open Candy Arcade
            </Link>
            <Link href="/python" className={cn(buttonVariants({ variant: "outline" }), "rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white")}>
              Open Python track
            </Link>
            <Link href="/pyspark" className={cn(buttonVariants({ variant: "outline" }), "rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white")}>
              Open PySpark track
            </Link>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-2 font-heading text-2xl font-semibold">{card.value}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-accent/60 p-3">
                  <Icon className="size-5 text-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Tracks</CardTitle>
            <CardDescription>
              Weekly study, separate arcade practice, and data-engineering outcomes in one place.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            {academyTracks.map((track) => (
              <div key={track.slug} className="rounded-3xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{track.title}</p>
                  <Badge variant="outline">{track.dailyMinutes} min/day</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{track.description}</p>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p>Target capacity: {academyBuildStatus.plannedPerTrackCapacity} tasks/questions</p>
                  <p>Arcade path: {track.arcadeLevelCount} planned level shells</p>
                  <p>Capstones planned: {track.capstoneCount}</p>
                </div>
                <Link
                  href={track.slug === "sql" ? "/sql" : `/${track.slug}`}
                  className={cn(buttonVariants({ variant: "outline" }), "mt-4 inline-flex")}
                >
                  Open track
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Current progress</CardTitle>
            <CardDescription>Simple view of what is already moving locally.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {progressCards.map((item) => (
              <div key={item.title} className="rounded-3xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                  <Badge variant="outline">{item.percent}%</Badge>
                </div>
                <Progress className="mt-4" value={item.percent} />
                <Link href={item.href} className={cn(buttonVariants({ variant: "link" }), "mt-3 px-0")}>
                  Open
                </Link>
              </div>
            ))}
            <div className="rounded-3xl border border-border/70 p-4 text-sm leading-6 text-muted-foreground">
              <p className="font-medium text-foreground">Local save status</p>
              <p className="mt-2">
                Progress is stored in this browser for this exact site origin.
              </p>
              <p className="mt-2">
                If you switch between `localhost`, `mastery-platform.onrender.com`, preview URLs, another browser, or another device, the saved progress will look different.
              </p>
              <p className="mt-2">
                Arcade saved so far: {summary.completedArcadeLevels} completed levels.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => logStudyMinutes("sql", 30)}>
                Log 30 min SQL
              </Button>
              <Button variant="outline" onClick={() => logStudyMinutes("python", 30)}>
                Log 30 min Python
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Live Today</CardTitle>
            <CardDescription>What is actually interactive right now, not just planned.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {[
              `SQL Weeks 1-${academyBuildStatus.sqlVerifiedWeeksLive} are real blank-editor missions with result verification.`,
              "Dashboard, local progress, notes surface, and backups work locally in the browser.",
              "Candy Arcade UI exists, but it is still being brought up to the same honesty standard as the mission lanes.",
              "Python and PySpark tracks currently show roadmap and materials more than full verified mission execution.",
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-border/70 p-4 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Planned, Not Yet Live</CardTitle>
            <CardDescription>These are targets, not features you should assume are already finished.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              `${academyBuildStatus.roadmapWeeksTarget}-week academy target across SQL, Python, and PySpark.`,
              `${academyBuildStatus.plannedPerTrackCapacity} per-track task/question capacity is a structure target, not a verified content count.`,
              `${academyBuildStatus.plannedTriLanguageArcadeCapacity} tri-language arcade target is planned capacity, not current real graded availability.`,
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-border/70 p-4 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Materials In Detail</h2>
          <p className="text-sm text-muted-foreground">
            Three separate study paths so you can learn each skill clearly from zero to stronger professional depth.
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {academyTracks.map((track) => (
            <Card key={`materials-${track.slug}`}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="font-heading text-xl">{track.title}</CardTitle>
                  <Badge variant="outline">{track.shortLabel}</Badge>
                </div>
                <CardDescription>{track.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl border border-border/70 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Zero to legend path</p>
                  <div className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                    <p><span className="font-medium text-foreground">Zero:</span> {track.stageLadder[0]}</p>
                    <p><span className="font-medium text-foreground">Builder:</span> {track.stageLadder[2]}</p>
                    <p><span className="font-medium text-foreground">Legend:</span> {track.stageLadder.at(-1)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {track.materialPillars.map((pillar) => (
                    <div key={pillar} className="rounded-3xl border border-border/70 p-4 text-sm leading-6 text-muted-foreground">
                      {pillar}
                    </div>
                  ))}
                </div>
                <Link
                  href={track.slug === "sql" ? "/sql" : `/${track.slug}`}
                  className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
                >
                  Open {track.shortLabel} materials
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">What makes this easier to use</CardTitle>
            <CardDescription>The structure is now more direct and less reading-heavy.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {[
              "Materials are short, plain-language, and focused on one concept at a time.",
              "Weekly labs unlock in order so you always know what to do next.",
              "The arcade lane is different from the weekly tasks, so repetition does not feel repetitive.",
              "The whole roadmap stays aimed at data engineering instead of generic coding practice.",
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-border/70 p-4 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Current Product Truth</CardTitle>
            <CardDescription>This panel is here so the app stays honest while it grows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              `Free tier goal: SQL Weeks 1-${academyBuildStatus.freeTierSqlWeeksLive}, dashboard, notes, and local progress.`,
              "Python runtime verification is still in development and should not be treated as fully shipped.",
              "PySpark verification modes are still being built and should be labeled honestly as they arrive.",
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-border/70 p-4 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
