"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { splitReviewQueue } from "@/lib/mastery";

const intervals = ["1 day", "3 days", "7 days", "14 days", "30 days"];

export function RevisionView() {
  const queue = useLiveQuery(() => db.revisionQueue.orderBy("dueAt").toArray(), []);
  const buckets = splitReviewQueue(queue ?? []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Revision</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
          Reviews are scheduled locally and adapt later from errors, hint usage, failed attempts, and repeated wins.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Spaced repetition rules</CardTitle>
            <CardDescription>Incorrect answers review sooner. Clean wins move later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6">
            {intervals.map((interval) => (
              <div key={interval} className="rounded-2xl border border-border/70 p-3">
                Review target: {interval}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Current queue</CardTitle>
            <CardDescription>Reviews are now scheduled from verified lesson passes and sorted by urgency.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-border/70 p-3 text-sm">
                <p className="text-muted-foreground">Due today</p>
                <p className="mt-2 text-2xl font-semibold">{buckets.dueToday.length}</p>
              </div>
              <div className="rounded-2xl border border-border/70 p-3 text-sm">
                <p className="text-muted-foreground">Overdue</p>
                <p className="mt-2 text-2xl font-semibold">{buckets.overdue.length}</p>
              </div>
              <div className="rounded-2xl border border-border/70 p-3 text-sm">
                <p className="text-muted-foreground">Upcoming</p>
                <p className="mt-2 text-2xl font-semibold">{buckets.upcoming.length}</p>
              </div>
            </div>
            {queue?.map((item) => (
              <div key={item.id} className="rounded-3xl border border-border/70 p-4">
                <p className="font-medium">{item.topic}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {item.courseSlug.toUpperCase()} due {new Date(item.dueAt).toLocaleDateString()} · stage {(item.reviewStage ?? 0) + 1}
                </p>
              </div>
            ))}
            {!queue?.length ? (
              <div className="rounded-3xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                No reviews are scheduled yet. Pass a verified lesson to create the first review automatically.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
