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
      value: `${summary.dueToday.length} today / ${summary.overdue.length} overdue`,
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
      detail: `${summary.completedSqlTasks} SQL tasks saved locally · mastery ${summary.masteryScores.sql}%`,
    },
    {
      title: "Python",
      percent: summary.pythonCompletion,
      href: "/python",
      detail: `${academyBuildStatus.pythonVerifiedTaskCount} runtime-verified drills live · mastery ${summary.masteryScores.python}%`,
    },
    {
      title: "PySpark",
      percent: summary.pysparkCompletion,
      href: "/pyspark",
      detail: `${academyBuildStatus.pysparkRuntimeVerifiedTaskCount} Spark-runtime validators live · ${academyBuildStatus.pysparkStructurallyVerifiedTaskCount} structural drills · mastery ${summary.masteryScores.pyspark}%`,
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
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Overall mastery</p>
              <p className="mt-2 text-3xl font-semibold">{summary.overallMasteryScore}%</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Due today</p>
              <p className="mt-2 text-3xl font-semibold">{summary.dueToday.length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Overdue reviews</p>
              <p className="mt-2 text-3xl font-semibold">{summary.overdue.length}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/sql/week/sql-week-01" className={cn(buttonVariants(), "rounded-full bg-amber-300 text-slate-950 hover:bg-amber-200")}>
              Start SQL missions
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link href="/materials/sql" className={cn(buttonVariants({ variant: "outline" }), "rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white")}>
              Open materials
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
                  <p>Generated drills live: {track.questionBankCount}</p>
                  <p>Guided live items: {track.weeklyTaskCount}</p>
                  <p>Track game path: {track.arcadeLevelCount} levels</p>
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

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Recommended next lessons</CardTitle>
            <CardDescription>Unlocked work that is ready now.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.recommendedNextLessons.map((item) => (
              <div key={`${item.courseSlug}-${item.lessonId}`} className="rounded-3xl border border-border/70 p-4">
                <p className="font-medium">{item.lessonTitle}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.courseSlug.toUpperCase()}</p>
                <Link
                  href={item.courseSlug === "sql" ? `/sql/week/${item.weekId}?lesson=${item.lessonId}` : `/${item.courseSlug}?week=${item.weekId}&lesson=${item.lessonId}`}
                  className={cn(buttonVariants({ variant: "link" }), "mt-2 px-0")}
                >
                  Open lesson
                </Link>
              </div>
            ))}
            {!summary.recommendedNextLessons.length ? (
              <div className="rounded-3xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                No unlocked next lesson is waiting right now.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Recently mastered or passed</CardTitle>
            <CardDescription>Latest verified evidence recorded locally.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.recentlyMastered.map((item) => (
              <div key={`${item.courseSlug}-${item.lessonId}`} className="rounded-3xl border border-border/70 p-4">
                <p className="font-medium">{item.lessonTitle}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.courseSlug.toUpperCase()} · {item.masteryState.replaceAll("_", " ")}
                </p>
              </div>
            ))}
            {!summary.recentlyMastered.length ? (
              <div className="rounded-3xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                No verified passes recorded yet.
              </div>
            ) : null}
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
              "Materials is a first-class route again with structured track lessons, bookmarks, resume, and lesson-to-exercise links.",
              `${academyBuildStatus.sqlVerifiedTaskCount} SQL, ${academyBuildStatus.pythonVerifiedTaskCount} Python, and ${academyBuildStatus.pysparkStructurallyVerifiedTaskCount} PySpark drills are audit-backed today.`,
              "Dashboard, local progress, and backups work locally in the browser.",
              `${academyBuildStatus.verifiedTriLanguageArcadeQuestionsLive} Candy Arcade levels are live with SQL, Python, and PySpark validators required on each level.`,
              `Python runtime validation is shipped for its drill bank. PySpark has ${academyBuildStatus.pysparkRuntimeVerifiedTaskCount} real Spark-runtime validators and ${academyBuildStatus.pysparkStructurallyVerifiedTaskCount} structural drills.`,
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
              `Full real-runtime parity across SQL, Python, and PySpark is still not complete because PySpark has ${academyBuildStatus.pysparkRuntimeVerifiedTaskCount} real Spark runtime validators today.`,
              `${academyBuildStatus.verifiedTriLanguageArcadeQuestionsLive}/${academyBuildStatus.plannedTriLanguageArcadeCapacity} Arcade levels are validator-backed with ${academyBuildStatus.verifiedTriLanguageArcadeSolutionsLive} required solutions verified.`,
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
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Code Lanes In Detail</h2>
          <p className="text-sm text-muted-foreground">
            Three separate practice-first paths so you can grow each skill from basics to stronger professional depth.
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {academyTracks.map((track) => (
            <Card key={`lane-${track.slug}`}>
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
                  Open {track.shortLabel} code lane
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
              "Each lane is code-first, so you spend more time writing than reading.",
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
              `Free tier goal: SQL Weeks 1-${academyBuildStatus.freeTierSqlWeeksLive}, dashboard, and local progress.`,
              `Python runtime verification is shipped for ${academyBuildStatus.pythonVerifiedTaskCount} drills according to the canonical audit.`,
              `PySpark has ${academyBuildStatus.pysparkRuntimeVerifiedTaskCount} questions that currently record real Spark runtime evidence; structural drills available: ${academyBuildStatus.pysparkStructurallyVerifiedTaskCount}.`,
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
