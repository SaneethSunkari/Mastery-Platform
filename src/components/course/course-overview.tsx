"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/db";
import { CourseSlug } from "@/lib/types";
import { getCourseBySlug, getWeeksByCourse } from "@/lib/curriculum";
import { cn } from "@/lib/utils";

const courseTheme = {
  sql: {
    hero: "from-amber-500/20 via-orange-500/10 to-transparent",
    badge: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
  },
  python: {
    hero: "from-teal-500/20 via-cyan-500/10 to-transparent",
    badge: "bg-teal-500/15 text-teal-800 dark:text-teal-200",
  },
  pyspark: {
    hero: "from-sky-500/20 via-blue-500/10 to-transparent",
    badge: "bg-sky-500/15 text-sky-800 dark:text-sky-200",
  },
};

export function CourseOverview({ courseSlug }: { courseSlug: CourseSlug }) {
  const course = getCourseBySlug(courseSlug);
  const weeks = getWeeksByCourse(courseSlug);
  const weekProgress = useLiveQuery(
    () => db.weekProgress.where("courseSlug").equals(courseSlug).toArray(),
    [courseSlug],
  );
  const courseProgress = useLiveQuery(
    () => db.courseProgress.get(`course-progress-${courseSlug}`),
    [courseSlug],
  );

  if (!course || !weekProgress || !courseProgress) {
    return <div className="text-sm text-muted-foreground">Loading {courseSlug} roadmap...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className={`border-0 bg-linear-to-br ${courseTheme[courseSlug].hero}`}>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={courseTheme[courseSlug].badge}>{course.name}</Badge>
            <Badge variant="outline">{course.durationWeeks} weeks</Badge>
            <Badge variant="outline">1-2 hours per day</Badge>
          </div>
          <div className="space-y-2">
            <CardTitle className="font-heading text-3xl tracking-tight">{course.tagline}</CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-7 text-muted-foreground">
              {course.description}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className={buttonVariants()}>
              Return to dashboard
            </Link>
            <Link
              href={`/${courseSlug}/lesson/${courseProgress.currentLessonId}`}
              className={buttonVariants({ variant: "outline" })}
            >
              Continue current lesson
            </Link>
            <Link
              href="/arcade"
              className={buttonVariants({ variant: "outline" })}
            >
              Open Candy Arcade
            </Link>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Current week</p>
            <p className="mt-2 font-heading text-2xl font-semibold">
              Week {weeks.find((week) => week.id === courseProgress.currentWeekId)?.weekNumber ?? 1}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Completion</p>
            <p className="mt-2 font-heading text-2xl font-semibold">
              {courseProgress.completionPercent}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Daily target</p>
            <p className="mt-2 font-heading text-2xl font-semibold">
              {course.estimatedMinutesPerDay} min
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Roadmap</h2>
            <p className="text-sm text-muted-foreground">
              Levels unlock sequentially. Lock reasons stay visible so the next requirement is always explicit.
            </p>
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {weeks.map((week) => {
            const progress = weekProgress.find((item) => item.weekId === week.id);
            const unlocked = progress?.status !== "locked";
            return (
              <Card key={week.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="font-heading text-xl">
                        Week {week.weekNumber} {"->"} {week.title}
                      </CardTitle>
                      <CardDescription className="mt-2 text-sm text-muted-foreground">
                        {week.theme}
                      </CardDescription>
                    </div>
                    {unlocked ? (
                      <Badge className="gap-1">
                        <Sparkles className="size-3.5" />
                        {progress?.status === "completed" ? "Completed" : "Unlocked"}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <LockKeyhole className="size-3.5" />
                        Locked
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Objectives</p>
                    <ul className="space-y-2 text-sm leading-6 text-foreground/90">
                      {week.objectives.slice(0, 3).map((objective) => (
                        <li key={objective}>• {objective}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Mastery checkpoint</p>
                    <p className="mt-2 text-sm leading-6 text-foreground/90">{week.masteryCheckpoint}</p>
                  </div>
                  <Progress value={progress?.score ?? 0} />
                  {unlocked ? (
                    <Link
                      href={`/${courseSlug}/week/${week.id}`}
                      className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
                    >
                      Open week
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/40 p-3 text-sm text-muted-foreground">
                      {progress?.lockReason}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
