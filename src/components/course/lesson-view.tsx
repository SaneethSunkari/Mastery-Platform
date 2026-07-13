"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Brain, BriefcaseBusiness, Bug, Gauge, Lightbulb, MessagesSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { touchLesson } from "@/lib/db";
import { CourseSlug } from "@/lib/types";
import { getLessonById, getWeekById } from "@/lib/curriculum";
import { cn } from "@/lib/utils";

const lessonIcons = [Lightbulb, Brain, BriefcaseBusiness, Bug, Gauge, MessagesSquare];

export function LessonView({ lessonId, courseSlug }: { lessonId: string; courseSlug: CourseSlug }) {
  const lesson = getLessonById(lessonId);
  const week = lesson ? getWeekById(lesson.weekId) : null;

  useEffect(() => {
    if (lessonId) {
      touchLesson(lessonId);
    }
  }, [lessonId]);

  if (!lesson || !week || lesson.courseSlug !== courseSlug) {
    return <div className="text-sm text-muted-foreground">Lesson not found.</div>;
  }

  const sections = [
    {
      title: "Intuition",
      body: `${lesson.title} matters because ${week.theme.toLowerCase()} In practice, this lesson is about recognizing the shape of the problem before writing syntax.`,
    },
    {
      title: "Mental model",
      body: `Treat ${lesson.title.toLowerCase()} as a way to move from raw state to a result you can explain. Start with input grain, transformation steps, and the exact output contract.`,
    },
    {
      title: "Syntax and structure",
      body: `Use the week topics as your vocabulary: ${week.topics.join(", ")}. The goal is not memorization alone, but knowing which construct matches the real problem.`,
    },
    {
      title: "Real business use case",
      body: week.businessCase,
    },
    {
      title: "Common mistakes",
      body: week.debugging,
    },
    {
      title: "Interview angle",
      body: week.interviewPrompts.join(" "),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{courseSlug.toUpperCase()}</Badge>
            <Badge variant="outline">Week {week.weekNumber}</Badge>
            <Badge variant="outline">{lesson.estimatedMinutes} min</Badge>
          </div>
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">{lesson.title}</h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{lesson.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lesson.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section, index) => {
          const Icon = lessonIcons[index % lessonIcons.length];
          return (
            <Card key={section.title}>
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <div className="rounded-2xl border border-border/70 bg-accent/40 p-3">
                  <Icon className="size-4" />
                </div>
                <CardTitle className="font-heading text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted-foreground">{section.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Practice and mastery check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6">
            {week.practice.map((item) => (
              <div key={item} className="rounded-2xl border border-border/70 p-3">
                {item}
              </div>
            ))}
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/40 p-3">
              <p className="font-medium">Mastery checkpoint</p>
              <p className="mt-1 text-muted-foreground">{week.masteryCheckpoint}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Next steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6">
            <div className="rounded-2xl border border-border/70 p-3">
              <p className="font-medium">Weekly assessment</p>
              <p className="mt-1 text-muted-foreground">{week.assessment}</p>
            </div>
            <div className="rounded-2xl border border-border/70 p-3">
              <p className="font-medium">Revision queue</p>
              <p className="mt-1 text-muted-foreground">{week.revision.join(" ")}</p>
            </div>
            <Link href={`/${courseSlug}/week/${week.id}`} className={cn(buttonVariants(), "inline-flex")}>
              Back to week
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
