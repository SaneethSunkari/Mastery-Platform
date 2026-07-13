"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowRight, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { CourseSlug } from "@/lib/types";
import { getLessonsByWeek, getWeekById } from "@/lib/curriculum";
import { cn } from "@/lib/utils";

export function WeekView({ weekId, courseSlug }: { weekId: string; courseSlug: CourseSlug }) {
  const week = getWeekById(weekId);
  const lessons = getLessonsByWeek(weekId);
  const weekProgress = useLiveQuery(() => db.weekProgress.get(`week-progress-${weekId}`), [weekId]);

  if (!week || week.courseSlug !== courseSlug) {
    return <div className="text-sm text-muted-foreground">Week not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              Month {week.monthNumber}
            </Badge>
            <Badge variant="outline">Week {week.weekNumber}</Badge>
            <Badge variant="outline">Level {week.levelNumber}</Badge>
          </div>
          <CardTitle className="font-heading text-3xl tracking-tight">{week.title}</CardTitle>
          <CardDescription className="text-sm leading-7 text-muted-foreground">
            {week.theme}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-border/70 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Learning objectives</p>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {week.objectives.map((objective) => (
                <li key={objective}>• {objective}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-border/70 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Core topics</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {week.topics.map((topic) => (
                <Badge key={topic} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-dashed border-border/70 bg-muted/40 p-3">
              <p className="text-sm font-medium">Unlock rule</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {weekProgress?.lockReason ?? "This week is available."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Guided lessons</CardTitle>
            <CardDescription>Each lesson page opens with intuition, mental model, examples, mistakes, and mastery prompts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="flex flex-col gap-3 rounded-3xl border border-border/70 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium">{lesson.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{lesson.summary}</p>
                </div>
                <Link
                  href={`/${courseSlug}/lesson/${lesson.id}`}
                  className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
                >
                  Open lesson
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl">Practice stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6">
              {week.practice.map((item) => (
                <div key={item} className="rounded-2xl border border-border/70 p-3">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl">Assessment and project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6">
              <div className="rounded-2xl border border-border/70 p-3">
                <p className="font-medium">Weekly assessment</p>
                <p className="mt-1 text-muted-foreground">{week.assessment}</p>
              </div>
              <div className="rounded-2xl border border-border/70 p-3">
                <p className="font-medium">Mini project</p>
                <p className="mt-1 text-muted-foreground">{week.project}</p>
              </div>
              <div className="rounded-2xl border border-border/70 p-3">
                <p className="flex items-center gap-2 font-medium">
                  <Target className="size-4" />
                  Mastery checkpoint
                </p>
                <p className="mt-1 text-muted-foreground">{week.masteryCheckpoint}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
