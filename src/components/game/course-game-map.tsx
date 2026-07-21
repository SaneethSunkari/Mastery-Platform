"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowRight, CheckCircle2, Gamepad2, LockKeyhole, Sparkles, Swords } from "lucide-react";
import { academyTrackMap, getTrackQuestionSamples } from "@/lib/academy";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { CourseSlug } from "@/lib/types";
import { allGameLevels } from "@/lib/game-levels";
import { sqlWeekTwoId } from "@/lib/sql-week-two";
import { sqlWeekThreeId } from "@/lib/sql-week-three";
import { sqlWeekFourId } from "@/lib/sql-week-four";
import { cn } from "@/lib/utils";

export function CourseGameMap({ courseSlug }: { courseSlug: CourseSlug }) {
  const track = academyTrackMap[courseSlug];
  const primaryCtaLabel =
    courseSlug === "sql"
      ? "Continue verified lane"
      : courseSlug === "python"
        ? "Continue guided lane"
        : "Continue guided lane";
  const levels = useMemo(
    () => allGameLevels.filter((level) => level.courseSlug === courseSlug),
    [courseSlug],
  );
  const progress = useLiveQuery(
    () => db.gameLevelProgress.where("courseSlug").equals(courseSlug).toArray(),
    [courseSlug],
  );
  const sqlWeekTwoProgress = useLiveQuery(
    async () => (courseSlug === "sql" ? (await db.weekProgress.get(`week-progress-${sqlWeekTwoId}`)) ?? null : null),
    [courseSlug],
  );
  const sqlWeekThreeProgress = useLiveQuery(
    async () => (courseSlug === "sql" ? (await db.weekProgress.get(`week-progress-${sqlWeekThreeId}`)) ?? null : null),
    [courseSlug],
  );
  const sqlWeekFourProgress = useLiveQuery(
    async () => (courseSlug === "sql" ? (await db.weekProgress.get(`week-progress-${sqlWeekFourId}`)) ?? null : null),
    [courseSlug],
  );

  if (!progress) {
    return <div className="text-sm text-muted-foreground">Loading game map...</div>;
  }

  const unlockedCount = progress.filter((item) => item.unlocked).length;
  const completedCount = progress.filter((item) => item.completed).length;
  const currentLevel = progress.find((item) => item.unlocked && !item.completed)?.levelNumber ?? completedCount + 1;
  const visibleLevels = levels.slice(0, 100);
  const questionSamples = getTrackQuestionSamples(courseSlug, 4);
  return (
    <div className="space-y-6">
      <Card className={cn("border-0 bg-linear-to-br text-white", track.surfaceClassName)}>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={track.badgeClassName}>{track.title}</Badge>
            <Badge className="bg-white/10 text-white hover:bg-white/10">{track.questionBankCount} drill bank</Badge>
            <Badge className="bg-white/10 text-white hover:bg-white/10">{track.arcadeLevelCount} game levels</Badge>
            <Badge className="bg-white/10 text-white hover:bg-white/10">{track.weeklyTaskCount} guided live items</Badge>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-semibold tracking-tight">{track.tagline}</CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-7 text-slate-200">
              {track.description} {track.supportCopy}
            </CardDescription>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Completed levels</p>
              <p className="mt-2 text-3xl font-semibold">
                {completedCount}/{track.arcadeLevelCount}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Current level</p>
              <p className="mt-2 text-3xl font-semibold">{Math.min(currentLevel, track.arcadeLevelCount)}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Total levels</p>
              <p className="mt-2 text-3xl font-semibold">{track.arcadeLevelCount}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Guided items</p>
              <p className="mt-2 text-3xl font-semibold">{track.weeklyTaskCount}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={track.continueHref}
              className={cn(buttonVariants(), "inline-flex rounded-full", track.buttonClassName)}
            >
              {primaryCtaLabel}
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "inline-flex border-white/20 text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Open dashboard
            </Link>
            <Link
              href={`/practice?track=${courseSlug}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "inline-flex border-white/20 text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Open 3000 drills
            </Link>
            <Link
              href="/arcade"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "inline-flex border-white/20 text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Open Candy Arcade
            </Link>
            {courseSlug === "sql" && sqlWeekFourProgress?.status === "unlocked" ? (
              <Link
                href="/sql/week/sql-week-04"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "inline-flex border-white/20 text-white hover:bg-white/10 hover:text-white",
                )}
              >
                Jump to Week 4
              </Link>
            ) : courseSlug === "sql" && sqlWeekThreeProgress?.status === "unlocked" ? (
              <Link
                href="/sql/week/sql-week-03"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "inline-flex border-white/20 text-white hover:bg-white/10 hover:text-white",
                )}
              >
                Jump to Week 3
              </Link>
            ) : courseSlug === "sql" && sqlWeekTwoProgress?.status === "unlocked" ? (
              <Link
                href="/sql/week/sql-week-02"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "inline-flex border-white/20 text-white hover:bg-white/10 hover:text-white",
                )}
              >
                Jump to Week 2
              </Link>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">How this track works</CardTitle>
            <CardDescription>
              Guided work teaches the concept. The drill bank and arcade stay separate so repetition does not interrupt learning flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="rounded-3xl border border-border/70 p-4">
              <div className="mb-3 inline-flex rounded-2xl border border-border/70 bg-accent/40 p-3">
                <Sparkles className="size-4" />
              </div>
              <p className="font-medium">Weekly missions</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Step-by-step guided work with blank editors, deliberate unlocks, and code-first repetition.
              </p>
            </div>
            <div className="rounded-3xl border border-border/70 p-4">
              <div className="mb-3 inline-flex rounded-2xl border border-border/70 bg-accent/40 p-3">
                <Gamepad2 className="size-4" />
              </div>
              <p className="font-medium">Track game path</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {track.arcadeLevelCount} bite-size levels that go from easy to expert without showing direct answers first.
              </p>
            </div>
            <div className="rounded-3xl border border-border/70 p-4">
              <div className="mb-3 inline-flex rounded-2xl border border-border/70 bg-accent/40 p-3">
                <Swords className="size-4" />
              </div>
              <p className="font-medium">Production rounds</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The later stages focus on debugging, scale, and senior-level tradeoff thinking.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Foundation to pro ladder</CardTitle>
            <CardDescription>{track.roleFocus}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {track.stageLadder.map((stage, index) => (
              <div key={stage} className="rounded-3xl border border-border/70 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Stage {index + 1}</p>
                <p className="mt-2 font-medium">{stage}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Question bank preview</CardTitle>
            <CardDescription>
              Separate from the weekly labs. These are generated repeat-practice drills you use to sharpen skill at scale.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {questionSamples.map((question) => (
              <div key={question.id} className="rounded-3xl border border-border/70 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{question.topic}</Badge>
                  <Badge variant="outline">{question.difficulty}</Badge>
                </div>
                <p className="mt-3 font-medium">{question.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{question.prompt}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Track focus</CardTitle>
            <CardDescription>
              This lane is aimed at steady code practice from beginner basics to data-engineering depth.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {track.materialPillars.map((pillar) => (
              <div key={pillar} className="rounded-3xl border border-border/70 p-4 text-sm leading-6 text-muted-foreground">
                {pillar}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Target outcomes</CardTitle>
            <CardDescription>The path is designed to move you toward strong senior-level breadth through repeated practice.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {track.targetOutcomes.map((outcome) => (
              <div key={outcome} className="rounded-3xl border border-border/70 p-4 text-sm leading-6 text-muted-foreground">
                {outcome}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Project load</CardTitle>
            <CardDescription>Capstones, mini-projects, and repetition all work together here.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-border/70 p-4">
              <p className="text-sm text-muted-foreground">Mini-projects</p>
              <p className="mt-2 text-3xl font-semibold">{track.projectsCount}</p>
            </div>
            <div className="rounded-3xl border border-border/70 p-4">
              <p className="text-sm text-muted-foreground">Capstones</p>
              <p className="mt-2 text-3xl font-semibold">{track.capstoneCount}</p>
            </div>
            <div className="rounded-3xl border border-border/70 p-4">
              <p className="text-sm text-muted-foreground">Daily target</p>
              <p className="mt-2 text-3xl font-semibold">{track.dailyMinutes} min</p>
            </div>
            <div className="rounded-3xl border border-border/70 p-4">
              <p className="text-sm text-muted-foreground">Unlocked so far</p>
              <p className="mt-2 text-3xl font-semibold">{unlockedCount}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Level path</CardTitle>
          <CardDescription>
            Showing the first 100 levels on the map right now. Your local save tracks all {track.arcadeLevelCount} levels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {Array.from({ length: 4 }, (_, worldIndex) => {
            const worldNumber = worldIndex + 1;
            const worldLevels = visibleLevels.filter((level) => level.worldNumber === worldNumber);
            if (worldLevels.length === 0) return null;

            return (
              <div key={worldNumber} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">World {worldNumber}</p>
                    <p className="font-medium">
                      Levels {worldLevels[0]?.levelNumber} - {worldLevels.at(-1)?.levelNumber}
                    </p>
                  </div>
                  <Badge variant="outline">{worldLevels[0]?.theme}</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-5 lg:grid-cols-10">
                  {worldLevels.map((level) => {
                    const levelProgress = progress.find((item) => item.levelId === level.id);
                    const unlocked = levelProgress?.unlocked ?? false;
                    const completed = levelProgress?.completed ?? false;

                    return (
                      <div
                        key={level.id}
                        className={cn(
                          "flex h-20 flex-col items-center justify-center rounded-3xl border text-center transition-colors",
                          completed
                            ? "border-emerald-500/30 bg-emerald-500/10"
                            : unlocked
                              ? "border-amber-500/30 bg-amber-500/10"
                              : "border-border/70 bg-muted/30 text-muted-foreground",
                        )}
                      >
                        <div className="mb-1">
                          {completed ? (
                            <CheckCircle2 className="mx-auto size-4" />
                          ) : unlocked ? (
                            <Sparkles className="mx-auto size-4" />
                          ) : (
                            <LockKeyhole className="mx-auto size-4" />
                          )}
                        </div>
                        <p className="text-sm font-medium">{level.levelNumber}</p>
                        <p className="px-2 text-[11px] leading-4">{level.difficulty}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
