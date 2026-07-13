"use client";

import Link from "next/link";
import { BookOpenText, CheckCircle2, NotebookPen } from "lucide-react";
import { academyTrackMap, academyTracks } from "@/lib/academy";
import { CourseSlug } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface MaterialsViewProps {
  initialTrack?: string;
}

export function MaterialsView({ initialTrack }: MaterialsViewProps) {
  const defaultTrack = (initialTrack as CourseSlug) || "sql";
  const activeTrack = academyTrackMap[defaultTrack] ? defaultTrack : "sql";

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-white/12 text-white hover:bg-white/12">Separate materials</Badge>
            <Badge className="bg-amber-500/20 text-amber-200 hover:bg-amber-500/20">Easy notes style</Badge>
            <Badge className="bg-white/12 text-white hover:bg-white/12">End-to-end path</Badge>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-semibold tracking-tight">
              Materials library for SQL, Python, and PySpark
            </CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-7 text-slate-300">
              This page is the separate study area. Use it like easy notes: open one track, read the full path
              from basics to advanced, then jump back into missions or arcade practice.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue={activeTrack} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-muted/35 p-1">
          {academyTracks.map((track) => (
            <TabsTrigger key={track.slug} value={track.slug} className="rounded-xl">
              {track.shortLabel}
            </TabsTrigger>
          ))}
        </TabsList>

        {academyTracks.map((track) => (
          <TabsContent key={track.slug} value={track.slug} className="space-y-6">
            <Card className={cn("border-border/70 bg-linear-to-br", track.surfaceClassName)}>
              <CardHeader className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={track.badgeClassName}>{track.title}</Badge>
                  <Badge variant="outline">{track.arcadeLevelCount} levels</Badge>
                  <Badge variant="outline">6 months</Badge>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-semibold tracking-tight">{track.tagline}</CardTitle>
                  <CardDescription className="max-w-3xl text-sm leading-7 text-muted-foreground">
                    {track.description}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={track.slug === "sql" ? "/sql" : `/${track.slug}`}
                    className={cn(buttonVariants(), "rounded-full", track.buttonClassName)}
                  >
                    Open {track.shortLabel} track
                  </Link>
                  <Link
                    href={track.slug === "sql" ? "/sql/week/sql-week-01" : `/${track.slug}`}
                    className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
                  >
                    Start from basics
                  </Link>
                </div>
              </CardHeader>
            </Card>

            <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Easy notes</CardTitle>
                  <CardDescription>Simple explanation of what this track is trying to teach end to end.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {track.materialPillars.map((pillar) => (
                    <div key={pillar} className="rounded-3xl border border-border/70 p-4 text-sm leading-6 text-muted-foreground">
                      {pillar}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">By the end</CardTitle>
                  <CardDescription>These are the main outcomes this track is aiming for.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {track.targetOutcomes.map((outcome) => (
                    <div key={outcome} className="rounded-3xl border border-border/70 p-4">
                      <p className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                        <span>{outcome}</span>
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">6-month plan</CardTitle>
                <CardDescription>
                  Month-by-month materials so you can study the full path separately from the missions.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 xl:grid-cols-2">
                {track.monthPlan.map((month) => (
                  <div key={`${track.slug}-month-${month.month}`} className="rounded-3xl border border-border/70 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Month {month.month}</p>
                        <p className="mt-2 text-xl font-semibold">{month.title}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-accent/30 p-3">
                        <BookOpenText className="size-4" />
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{month.summary}</p>
                    <div className="mt-4 space-y-2">
                      {month.focus.map((item) => (
                        <div key={item} className="rounded-2xl border border-border/70 p-3 text-sm text-muted-foreground">
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-2xl border border-dashed border-border/70 bg-muted/25 p-3">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <NotebookPen className="size-4" />
                        Deliverable
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{month.deliverable}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
