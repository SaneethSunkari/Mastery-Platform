"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  ArrowLeft,
  ArrowRight,
  BookCheck,
  Bookmark,
  ChevronDown,
  ChevronRight,
  Clock3,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getMaterialLesson,
  getMaterialLessonsByTrack,
  getMaterialModulesByTrack,
  getMaterialResumeLessonId,
  getMaterialTracks,
  searchMaterialLessons,
  type MaterialLesson,
} from "@/lib/materials";
import { CourseSlug } from "@/lib/types";
import { db, markMaterialLessonCompleted, toggleMaterialBookmark, touchLesson } from "@/lib/db";
import { cn } from "@/lib/utils";

interface MaterialsViewProps {
  track: CourseSlug;
  lessonId?: string | null;
}

const trackTheme = {
  sql: {
    badge: "bg-amber-400/15 text-amber-200 hover:bg-amber-400/15",
    button: "bg-amber-300 text-slate-950 hover:bg-amber-200",
    surface: "from-amber-500/20 via-orange-500/10 to-transparent",
  },
  python: {
    badge: "bg-teal-400/15 text-teal-200 hover:bg-teal-400/15",
    button: "bg-teal-300 text-slate-950 hover:bg-teal-200",
    surface: "from-teal-500/20 via-cyan-500/10 to-transparent",
  },
  pyspark: {
    badge: "bg-sky-400/15 text-sky-200 hover:bg-sky-400/15",
    button: "bg-sky-300 text-slate-950 hover:bg-sky-200",
    surface: "from-sky-500/20 via-blue-500/10 to-transparent",
  },
} as const;

export function MaterialsView({ track, lessonId }: MaterialsViewProps) {
  const tracks = getMaterialTracks();
  const materialLessons = getMaterialLessonsByTrack(track);
  const resumeLessonId = getMaterialResumeLessonId(track);
  const [query, setQuery] = useState("");
  const [expandedModuleIds, setExpandedModuleIds] = useState<Record<string, boolean>>({});

  const materialProgress = useLiveQuery(
    () => db.materialLessonProgress.where("courseSlug").equals(track).toArray(),
    [track],
  );
  const lessonProgress = useLiveQuery(
    () => db.lessonProgress.where("courseSlug").equals(track).toArray(),
    [track],
  );

  const filteredLessons = useMemo(() => searchMaterialLessons(track, query), [track, query]);
  const filteredLessonIds = new Set(filteredLessons.map((lesson) => lesson.id));
  const modules = getMaterialModulesByTrack(track).filter((module) =>
    module.lessonIds.some((id) => filteredLessonIds.has(id)),
  );

  const activeLesson =
    (lessonId ? getMaterialLesson(track, lessonId) : null) ??
    (() => {
      if (!materialProgress) return materialLessons[0] ?? null;
      const lastOpened = [...materialProgress]
        .filter((item) => item.lastOpenedAt)
        .sort((left, right) => (right.lastOpenedAt ?? "").localeCompare(left.lastOpenedAt ?? ""))[0];
      return (
        (lastOpened ? getMaterialLesson(track, lastOpened.lessonId) : null) ??
        materialLessons[0] ??
        null
      );
    })();

  if (!activeLesson || !materialProgress || !lessonProgress) {
    return <div className="text-sm text-muted-foreground">Loading materials...</div>;
  }

  const materialProgressRecords = materialProgress;

  const activeMaterialProgress =
    materialProgressRecords.find((item) => item.lessonId === activeLesson.id) ?? null;
  const activeMasteryProgress =
    lessonProgress.find((item) => item.lessonId === activeLesson.id) ?? null;
  const previousLesson = activeLesson.previousLessonId
    ? getMaterialLesson(track, activeLesson.previousLessonId)
    : null;
  const nextLesson = activeLesson.nextLessonId
    ? getMaterialLesson(track, activeLesson.nextLessonId)
    : null;
  const completedReadCount = materialProgressRecords.filter((item) => item.state === "completed").length;
  const bookmarkedCount = materialProgressRecords.filter((item) => item.bookmarked).length;

  const relatedWeekState = activeMasteryProgress?.status ?? "locked";
  const masteryState = activeMasteryProgress?.masteryState ?? "not_started";

  function isModuleExpanded(moduleId: string) {
    if (expandedModuleIds[moduleId] !== undefined) {
      return expandedModuleIds[moduleId];
    }

    return moduleId === activeLesson.moduleId;
  }

  function toggleModule(moduleId: string) {
    setExpandedModuleIds((current) => ({
      ...current,
      [moduleId]: !isModuleExpanded(moduleId),
    }));
  }

  function lessonButtonState(lesson: MaterialLesson) {
    const progress = materialProgressRecords.find((item) => item.lessonId === lesson.id);
    if (progress?.state === "completed") return "Completed";
    if (progress?.state === "reading") return "Reading";
    return "Unread";
  }

  return (
    <div className="space-y-6">
      <Card className={cn("border-0 bg-linear-to-br text-white", trackTheme[track].surface)}>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={trackTheme[track].badge}>Materials</Badge>
            <Badge className="bg-white/10 text-white hover:bg-white/10">Structured learning</Badge>
            <Badge className="bg-white/10 text-white hover:bg-white/10">Reference + mastery links</Badge>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-semibold tracking-tight md:text-4xl">
              {tracks.find((item) => item.track === track)?.title} materials
            </CardTitle>
            <CardDescription className="max-w-4xl text-sm leading-7 text-slate-200">
              Learn concepts here, then open the related coding step to prove the skill in the mastery lane.
            </CardDescription>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Lessons</p>
              <p className="mt-2 text-3xl font-semibold">{materialLessons.length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Read complete</p>
              <p className="mt-2 text-3xl font-semibold">{completedReadCount}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Bookmarks</p>
              <p className="mt-2 text-3xl font-semibold">{bookmarkedCount}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Resume</p>
              <p className="mt-2 text-sm leading-6 text-slate-100">
                {resumeLessonId ? "Last lesson is tracked locally." : "Start from the first lesson."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {tracks.map((item) => (
              <Link
                key={item.track}
                href={`/materials/${item.track}`}
                className={cn(
                  buttonVariants(item.track === track ? undefined : { variant: "outline" }),
                  "rounded-full",
                  item.track === track
                    ? trackTheme[item.track].button
                    : "border-white/20 text-white hover:bg-white/10 hover:text-white",
                )}
              >
                {item.title}
              </Link>
            ))}
            {resumeLessonId ? (
              <Link
                href={`/materials/${track}/${activeMaterialProgress?.lastOpenedAt ? activeLesson.id : resumeLessonId}`}
                className={cn(buttonVariants({ variant: "outline" }), "rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white")}
              >
                Resume reading
              </Link>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="xl:sticky xl:top-6 xl:h-[calc(100vh-7rem)] xl:overflow-hidden">
          <CardHeader className="space-y-4 border-b border-border/60">
            <div>
              <CardTitle className="text-xl font-semibold">Topic navigation</CardTitle>
              <CardDescription>
                Search, open modules, and jump directly to the lesson you want.
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search materials"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search topics, tags, and weeks"
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-[calc(100vh-15rem)] space-y-4 overflow-y-auto p-4">
            {modules.map((module) => {
              const moduleLessons = materialLessons.filter(
                (lesson) => lesson.moduleId === module.id && filteredLessonIds.has(lesson.id),
              );
              const expanded = isModuleExpanded(module.id);
              return (
                <div key={module.id} className="rounded-3xl border border-border/70">
                  <button
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    aria-expanded={expanded}
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        Month {module.monthNumber} · {module.levelBand}
                      </p>
                      <p className="mt-1 font-medium">{module.title}</p>
                    </div>
                    {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  </button>
                  {expanded ? (
                    <div className="space-y-2 border-t border-border/60 px-3 py-3">
                      {moduleLessons.map((lesson) => {
                        const active = lesson.id === activeLesson.id;
                        const state = lessonButtonState(lesson);
                        return (
                          <Link
                            key={lesson.id}
                            href={`/materials/${track}/${lesson.id}`}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "block rounded-2xl border px-3 py-3 transition",
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border/70 hover:border-foreground/20 hover:bg-accent/20",
                            )}
                          >
                            <p className="text-[11px] uppercase tracking-[0.24em] opacity-70">
                              {lesson.levelBand}
                            </p>
                            <p className="mt-2 text-sm font-medium leading-6">{lesson.title}</p>
                            <p className="mt-2 text-xs opacity-75">{state}</p>
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Link href="/materials/sql" className="hover:text-foreground">Materials</Link>
                <ChevronRight className="size-4" />
                <Link href={`/materials/${track}`} className="hover:text-foreground">
                  {track.toUpperCase()}
                </Link>
                <ChevronRight className="size-4" />
                <span className="text-foreground">{activeLesson.title}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={trackTheme[track].badge}>{activeLesson.levelBand}</Badge>
                <Badge variant="outline">Week {activeLesson.moduleWeekNumber}</Badge>
                <Badge variant="outline">{activeLesson.estimatedReadingMinutes} min read</Badge>
                <Badge variant="outline">Read state: {activeMaterialProgress?.state ?? "not_started"}</Badge>
                <Badge variant="outline">Mastery state: {masteryState}</Badge>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-semibold tracking-tight">{activeLesson.title}</CardTitle>
                <CardDescription className="max-w-4xl text-sm leading-7 text-muted-foreground">
                  {activeLesson.summary}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    void toggleMaterialBookmark(activeLesson.id);
                  }}
                >
                  <Bookmark className="mr-2 size-4" />
                  {activeMaterialProgress?.bookmarked ? "Remove bookmark" : "Bookmark"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    void markMaterialLessonCompleted(activeLesson.id);
                  }}
                >
                  <BookCheck className="mr-2 size-4" />
                  Mark reading complete
                </Button>
                <Link
                  href={activeLesson.masteryHref}
                  className={cn(buttonVariants(), "rounded-full", trackTheme[track].button)}
                  onClick={() => {
                    void touchLesson(activeLesson.id);
                  }}
                >
                  Try it yourself
                </Link>
              </div>
            </CardHeader>
          </Card>

          <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Lesson map</CardTitle>
                <CardDescription>Start simple, build the mental model, then prove it in the exercise.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-7">
                <div className="rounded-3xl border border-border/70 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Learning objectives</p>
                  <ul className="mt-3 space-y-2">
                    {activeLesson.objectives.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl border border-border/70 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Prerequisites</p>
                  <ul className="mt-3 space-y-2">
                    {activeLesson.prerequisites.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl border border-border/70 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Plain-language explanation</p>
                  <p className="mt-3 text-muted-foreground">{activeLesson.explanation}</p>
                </div>
                <div className="rounded-3xl border border-border/70 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Mental model</p>
                  <p className="mt-3 text-muted-foreground">{activeLesson.mentalModel}</p>
                </div>
                <div className="rounded-3xl border border-border/70 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Syntax or API reference</p>
                  <ul className="mt-3 space-y-2">
                    {activeLesson.syntaxReference.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Mastery connection</CardTitle>
                <CardDescription>
                  Reading teaches the concept. The mastery lane tests whether you can actually do it.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-7">
                <div className="rounded-3xl border border-border/70 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Related challenge</p>
                  <p className="mt-3 text-muted-foreground">
                    Current unlock state: {relatedWeekState}. Current mastery state: {masteryState}.
                  </p>
                  <Link href={activeLesson.masteryHref} className={cn(buttonVariants({ variant: "outline" }), "mt-4 inline-flex")}>
                    Open related mastery challenge
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </div>
                <div className="rounded-3xl border border-border/70 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Guided exercise</p>
                  <p className="mt-3 text-muted-foreground">{activeLesson.guidedExercise}</p>
                </div>
                <div className="rounded-3xl border border-border/70 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Independent exercise</p>
                  <p className="mt-3 text-muted-foreground">{activeLesson.independentExercise}</p>
                </div>
                <div className="rounded-3xl border border-border/70 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Knowledge check</p>
                  <ul className="mt-3 space-y-2 text-muted-foreground">
                    {activeLesson.knowledgeCheck.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Progressive examples</CardTitle>
              <CardDescription>Each example includes code, expected output, and why it matters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeLesson.examples.map((example) => (
                <div key={example.id} className="rounded-3xl border border-border/70 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{example.language.toUpperCase()}</Badge>
                    <Badge variant="outline">{example.title}</Badge>
                  </div>
                  <pre className="mt-4 overflow-x-auto rounded-2xl border border-border/70 bg-slate-950 p-4 text-sm text-slate-100">
                    <code>{example.code}</code>
                  </pre>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-border/70 p-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Expected output</p>
                      <p className="mt-2 text-sm text-muted-foreground">{example.expectedOutput}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 p-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Why this example matters</p>
                      <p className="mt-2 text-sm text-muted-foreground">{example.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <section className="grid gap-4 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Common mistakes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                {activeLesson.commonMistakes.map((item) => (
                  <div key={item} className="rounded-2xl border border-border/70 p-3">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Debugging guidance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                {activeLesson.debuggingGuidance.map((item) => (
                  <div key={item} className="rounded-2xl border border-border/70 p-3">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Performance and production</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                {[...activeLesson.performanceImplications, ...activeLesson.productionRelevance].map((item) => (
                  <div key={item} className="rounded-2xl border border-border/70 p-3">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Summary and navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-border/70 p-4">
                <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                  {activeLesson.summaryPoints.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-3">
                {previousLesson ? (
                  <Link href={`/materials/${track}/${previousLesson.id}`} className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}>
                    <ArrowLeft className="mr-2 size-4" />
                    Previous lesson
                  </Link>
                ) : null}
                {nextLesson ? (
                  <Link href={`/materials/${track}/${nextLesson.id}`} className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}>
                    Next lesson
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                ) : null}
                <div className="inline-flex items-center rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground">
                  <Clock3 className="mr-2 size-4" />
                  {activeLesson.estimatedReadingMinutes} minute read
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
