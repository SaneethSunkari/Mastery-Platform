"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Layers3, Sparkles, Target } from "lucide-react";
import { academyBuildStatus, academyTrackMap, academyStats, academyTracks, getTrackQuestions } from "@/lib/academy";
import { CourseSlug } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const windowSize = 24;

interface PracticeViewProps {
  initialTrack?: string;
}

export function PracticeView({ initialTrack }: PracticeViewProps) {
  const safeInitialTrack = (initialTrack as CourseSlug) || "sql";
  const initialQuestionId = getTrackQuestions(academyTrackMap[safeInitialTrack] ? safeInitialTrack : "sql")[0]?.id ?? null;
  const [activeTrack, setActiveTrack] = useState<CourseSlug>(
    academyTrackMap[safeInitialTrack] ? safeInitialTrack : "sql",
  );
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(initialQuestionId);

  const questions = useMemo(() => getTrackQuestions(activeTrack), [activeTrack]);

  const selectedQuestion =
    questions.find((question) => question.id === selectedQuestionId) ?? questions[0] ?? null;

  const activeWindowIndex = selectedQuestion
    ? Math.floor((selectedQuestion.levelNumber - 1) / windowSize)
    : 0;
  const totalWindows = Math.ceil(questions.length / windowSize);
  const visibleQuestions = questions.slice(
    activeWindowIndex * windowSize,
    activeWindowIndex * windowSize + windowSize,
  );
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-[0_25px_90px_-45px_rgba(15,23,42,0.8)]">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-fuchsia-500/20 text-fuchsia-100 hover:bg-fuchsia-500/20">3000 drill bank per track</Badge>
            <Badge className="bg-white/12 text-white hover:bg-white/12">9000 total generated drills</Badge>
            <Badge className="bg-amber-500/20 text-amber-200 hover:bg-amber-500/20">Honest status</Badge>
          </div>
          <div className="space-y-3">
            <CardTitle className="font-heading text-3xl tracking-tight md:text-4xl">
              Build from zero to legend with a massive drill bank
            </CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-7 text-slate-300">
              This page is the separate practice lane. SQL and Python expose runtime-verified drills, while PySpark clearly separates structural validation from the smaller real Spark runtime slice.
            </CardDescription>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Tracks</p>
              <p className="mt-2 text-3xl font-semibold">{academyStats.tracks}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total drills</p>
              <p className="mt-2 text-3xl font-semibold">{academyStats.totalQuestions}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Per track</p>
              <p className="mt-2 text-3xl font-semibold">{academyBuildStatus.generatedQuestionBankPerTrackLive}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Arcade path</p>
              <p className="mt-2 text-3xl font-semibold">{academyBuildStatus.plannedTriLanguageArcadeCapacity}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs
        value={activeTrack}
        onValueChange={(value) => {
          const nextTrack = value as CourseSlug;
          setActiveTrack(nextTrack);
          setSelectedQuestionId(getTrackQuestions(nextTrack)[0]?.id ?? null);
        }}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-muted/35 p-1">
          {academyTracks.map((track) => (
            <TabsTrigger key={track.slug} value={track.slug} className="rounded-xl">
              {track.shortLabel}
            </TabsTrigger>
          ))}
        </TabsList>

        {academyTracks.map((track) => (
          <TabsContent key={track.slug} value={track.slug} className="space-y-6">
            <Card className={cn("border-0 bg-linear-to-br", track.surfaceClassName)}>
              <CardHeader className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={track.badgeClassName}>{track.title}</Badge>
                  <Badge variant="outline">{track.questionBankCount} generated drills</Badge>
                  <Badge variant="outline">{track.weeklyTaskCount} guided live items</Badge>
                  <Badge variant="outline">{track.arcadeLevelCount} track levels</Badge>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-semibold tracking-tight">{track.tagline}</CardTitle>
                  <CardDescription className="max-w-3xl text-sm leading-7 text-muted-foreground">
                    {track.description}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={track.continueHref} className={cn(buttonVariants(), "rounded-full", track.buttonClassName)}>
                    Open guided lane
                  </Link>
                  <Link href="/arcade" className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
                    Open Candy Arcade
                  </Link>
                </div>
              </CardHeader>
            </Card>

            <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Drill navigator</CardTitle>
                  <CardDescription>
                    Browse the bank in chunks so the practice feels manageable instead of overwhelming.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/70 p-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Current window</p>
                      <p className="mt-2 text-xl font-semibold">
                        {activeWindowIndex * windowSize + 1} - {Math.min((activeWindowIndex + 1) * windowSize, track.questionBankCount)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const previousWindowStart = Math.max(activeWindowIndex - 1, 0) * windowSize;
                          const previousQuestion = questions[previousWindowStart];
                          if (previousQuestion) {
                            setSelectedQuestionId(previousQuestion.id);
                          }
                        }}
                        disabled={activeWindowIndex === 0}
                      >
                        <ArrowLeft className="mr-2 size-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const nextWindowStart = Math.min(activeWindowIndex + 1, totalWindows - 1) * windowSize;
                          const nextQuestion = questions[nextWindowStart];
                          if (nextQuestion) {
                            setSelectedQuestionId(nextQuestion.id);
                          }
                        }}
                        disabled={activeWindowIndex >= totalWindows - 1}
                      >
                        Next
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {visibleQuestions.map((question) => {
                      const selected = question.id === selectedQuestion?.id;
                      return (
                        <button
                          key={question.id}
                          type="button"
                          onClick={() => setSelectedQuestionId(question.id)}
                          className={cn(
                            "rounded-3xl border p-4 text-left transition",
                            selected
                              ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white/10"
                              : "border-border/70 hover:border-foreground/30 hover:bg-accent/20",
                          )}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={selected ? "secondary" : "outline"}>Level {question.levelNumber}</Badge>
                            <Badge variant="outline">{question.difficulty}</Badge>
                          </div>
                          <p className="mt-3 font-medium">{question.title}</p>
                          <p className={cn("mt-2 text-sm leading-6", selected ? "text-slate-200" : "text-muted-foreground")}>
                            {question.prompt}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Selected drill</CardTitle>
                  <CardDescription>
                    Use this as a focused repeat-practice prompt. Solve it in your own editor or pair it with the weekly lane.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedQuestion ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={track.badgeClassName}>Level {selectedQuestion.levelNumber}</Badge>
                        <Badge variant="outline">{selectedQuestion.topic}</Badge>
                        <Badge variant="outline">{selectedQuestion.stage}</Badge>
                        <Badge variant="outline">{selectedQuestion.difficulty}</Badge>
                      </div>
                      <div className="rounded-3xl border border-border/70 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Challenge</p>
                        <p className="mt-3 text-lg font-semibold">{selectedQuestion.title}</p>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">{selectedQuestion.prompt}</p>
                      </div>
                      <div className="rounded-3xl border border-border/70 p-4">
                        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                          <Target className="size-4" />
                          Business goal
                        </p>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">{selectedQuestion.businessGoal}</p>
                      </div>
                      <div className="rounded-3xl border border-border/70 p-4">
                        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                          <CheckCircle2 className="size-4" />
                          Deliverable
                        </p>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">{selectedQuestion.deliverable}</p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-3xl border border-border/70 p-4">
                          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                            <Layers3 className="size-4" />
                            Mastery angle
                          </p>
                          <p className="mt-3 text-sm leading-7 text-muted-foreground">{selectedQuestion.masteryAngle}</p>
                        </div>
                        <div className="rounded-3xl border border-border/70 p-4">
                          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                            <Layers3 className="size-4" />
                            Related chapter
                          </p>
                          <p className="mt-3 text-sm leading-7 text-muted-foreground">{selectedQuestion.relatedChapterId}</p>
                        </div>
                      </div>
                      <div className="rounded-3xl border border-border/70 p-4">
                        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                          <Sparkles className="size-4" />
                          Hints
                        </p>
                        <div className="mt-3 space-y-3">
                          {selectedQuestion.hints.map((hint) => (
                            <div key={hint} className="rounded-2xl border border-border/70 p-3 text-sm leading-6 text-muted-foreground">
                              {hint}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">No drill selected.</div>
                  )}
                </CardContent>
              </Card>
            </section>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Reality check</CardTitle>
                <CardDescription>These numbers are big, so the labeling should stay honest.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <div className="rounded-3xl border border-border/70 p-4 text-sm leading-6 text-muted-foreground">
                  {track.questionBankCount} drills are now generated and browsable for {track.shortLabel}.
                </div>
                <div className="rounded-3xl border border-border/70 p-4 text-sm leading-6 text-muted-foreground">
                  SQL still has the strongest real result verification today through the mission lane.
                </div>
                <div className="rounded-3xl border border-border/70 p-4 text-sm leading-6 text-muted-foreground">
                  The arcade remains separate: one shared challenge, three languages, one unlock path.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
