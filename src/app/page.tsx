import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  BrainCircuit,
  Cpu,
  Database,
  Gem,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { academyBuildStatus, academyStats, academyTracks } from "@/lib/academy";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const trackIcons = {
  sql: Database,
  python: BrainCircuit,
  pyspark: Cpu,
} as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(20,184,166,0.14),_transparent_24%),linear-gradient(180deg,_rgba(255,251,235,0.92),_rgba(255,255,255,1))] px-4 py-4 dark:bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.14),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(20,184,166,0.16),_transparent_24%),linear-gradient(180deg,_rgba(9,11,17,1),_rgba(12,16,24,1))] md:px-6 md:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1500px] flex-col gap-4">
        <header className="rounded-[30px] border border-border/60 bg-card/80 px-5 py-4 shadow-[0_25px_80px_-50px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
                Mastery Stack
              </p>
              <div>
                <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                  SQL + Python + PySpark for data engineering
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                  A practice-first learning platform with weekly unlock missions, separate code lanes, and a tri-language arcade.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className={cn(buttonVariants(), "rounded-full bg-amber-300 text-slate-950 hover:bg-amber-200")}>
                Open dashboard
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link
                href="/materials/sql"
                className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
              >
                Open materials
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden border-0 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-[0_30px_100px_-55px_rgba(15,23,42,0.8)]">
            <CardHeader className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-sky-500/20 text-sky-100 hover:bg-sky-500/20">6-month roadmap</Badge>
                <Badge className="bg-white/12 text-white hover:bg-white/12">Local-first saves</Badge>
                <Badge className="bg-amber-500/20 text-amber-200 hover:bg-amber-500/20">Render-safe homepage</Badge>
              </div>
              <div className="space-y-3">
                <CardTitle className="font-heading text-4xl tracking-tight md:text-5xl">
                  Learn like a data engineer from zero to strong production depth.
                </CardTitle>
                <CardDescription className="max-w-3xl text-sm leading-7 text-slate-300">
                  Start with guided code missions, move through verified SQL progress, then reinforce the same concepts
                  through a 3000-drill practice bank per track and a separate tri-language arcade in SQL, Python, and PySpark.
                  The homepage is now a real landing page, so the site opens cleanly even when Render wakes up from sleep.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/sql/week/sql-week-01"
                  className={cn(buttonVariants(), "rounded-full bg-amber-300 text-slate-950 hover:bg-amber-200")}
                >
                  Start SQL Week 1
                  <ArrowRight className="ml-2 size-4" />
                </Link>
                <Link
                  href="/arcade"
                  className={cn(buttonVariants({ variant: "outline" }), "rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white")}
                >
                  Open Candy Arcade
                </Link>
                <Link
                  href="/materials/sql"
                  className={cn(buttonVariants({ variant: "outline" }), "rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white")}
                >
                  Browse materials
                </Link>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-xl">What is live now</CardTitle>
                <CardDescription>Clear status instead of fake promises.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-3xl border border-border/70 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">SQL verified</p>
                  <p className="mt-2 text-3xl font-semibold">{academyBuildStatus.sqlVerifiedWeeksLive} weeks</p>
                </div>
                <div className="rounded-3xl border border-border/70 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Tri-language arcade</p>
                  <p className="mt-2 text-3xl font-semibold">{academyStats.totalCandyArcadeLevels} levels</p>
                </div>
                <div className="rounded-3xl border border-border/70 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Generated drills</p>
                  <p className="mt-2 text-3xl font-semibold">{academyBuildStatus.generatedQuestionBankPerTrackLive} / track</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-xl">Save behavior</CardTitle>
                <CardDescription>Know how progress persistence works before you begin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                <div className="rounded-3xl border border-border/70 p-4">
                  Saves stay in the current browser and current site domain.
                </div>
                <div className="rounded-3xl border border-border/70 p-4">
                  Settings includes export/import backup so you can keep a manual JSON copy.
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            {
              label: "Tracks",
              value: academyStats.tracks,
              detail: "SQL, Python, PySpark",
            },
            {
              label: "Track levels",
              value: academyStats.totalArcadeLevels,
              detail: "3000 per track",
            },
            {
              label: "Generated drills",
              value: academyStats.totalQuestions,
              detail: "3000 per track",
            },
            {
              label: "Candy Arcade",
              value: academyStats.totalCandyArcadeLevels,
              detail: "same challenge in 3 languages",
            },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{item.label}</p>
                <p className="mt-2 font-heading text-3xl font-semibold">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Choose your path</CardTitle>
              <CardDescription>Three separate learning lanes, each aimed at data engineering work.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-3">
              {academyTracks.map((track) => {
                const Icon = trackIcons[track.slug];
                return (
                  <div key={track.slug} className="rounded-[28px] border border-border/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="rounded-2xl border border-border/70 bg-accent/40 p-3">
                        <Icon className="size-4" />
                      </div>
                      <Badge variant="outline">{track.shortLabel}</Badge>
                    </div>
                    <p className="mt-4 font-medium">{track.title}</p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{track.tagline}</p>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <p>{track.arcadeLevelCount} track levels</p>
                      <p>{track.questionBankCount} question-bank shells</p>
                      <p>{track.dailyMinutes} min/day target</p>
                    </div>
                    <Link
                      href={track.slug === "sql" ? "/sql" : `/${track.slug}`}
                      className={cn(buttonVariants({ variant: "outline" }), "mt-4 inline-flex rounded-full")}
                    >
                      Open {track.shortLabel}
                    </Link>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-2xl">How the product works</CardTitle>
              <CardDescription>The platform is split so learning and repetition do not feel mixed together.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  icon: BookOpenText,
                  title: "Materials",
                  body: "Structured SQL, Python, and PySpark lessons with search, resume, examples, bookmarks, and direct links into mastery steps.",
                },
                {
                  icon: ShieldCheck,
                  title: "Weekly missions",
                  body: "SQL missions unlock one step at a time and verify the result with the local SQL engine.",
                },
                {
                  icon: Gem,
                  title: "Candy Arcade",
                  body: "Short challenge levels where the same problem is solved in SQL, Python, and PySpark.",
                },
                {
                  icon: Sparkles,
                  title: "Local-first workflow",
                  body: "Progress, notes, and backups stay in the browser so the experience works without a backend login.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-3xl border border-border/70 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-border/70 bg-accent/40 p-3">
                        <Icon className="size-4" />
                      </div>
                      <p className="font-medium">{item.title}</p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
