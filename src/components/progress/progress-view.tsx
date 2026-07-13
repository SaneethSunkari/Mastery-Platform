"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

export function ProgressView() {
  const mastery = useLiveQuery(() => db.topicMastery.toArray(), []);
  const activity = useLiveQuery(() => db.activityLog.toArray(), []);

  const masteryData = useMemo(
    () =>
      mastery?.map((item) => ({
        topic: item.topic,
        score: item.score,
      })) ?? [],
    [mastery],
  );

  const activityData = useMemo(() => {
    const totals = new Map<string, number>();
    activity?.forEach((item) => {
      const day = item.occurredAt.slice(5, 10);
      totals.set(day, (totals.get(day) ?? 0) + item.minutes);
    });
    return Array.from(totals.entries()).map(([day, minutes]) => ({ day, minutes }));
  }, [activity]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Progress</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
          These charts are driven from IndexedDB. As phases 2 through 6 land, they will reflect real attempts, assessments, interview rounds, and project outcomes.
        </p>
      </div>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Topic mastery</CardTitle>
            <CardDescription>Mastery starts near zero and must be earned through repeated evidence.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={masteryData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="topic" />
                <Radar dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.32} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Logged study time</CardTitle>
            <CardDescription>Use the dashboard quick actions to verify persistence right now.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <XAxis dataKey="day" stroke="currentColor" />
                <YAxis stroke="currentColor" />
                <Line type="monotone" dataKey="minutes" stroke="#14b8a6" strokeWidth={3} />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
