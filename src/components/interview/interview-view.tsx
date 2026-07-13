import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const lanes = [
  {
    title: "SQL interview readiness",
    score: "14%",
    notes: "Starts low on purpose. The score only rises when accuracy, speed, and optimization evidence improve.",
  },
  {
    title: "Python interview readiness",
    score: "11%",
    notes: "Driven by problem-solving accuracy, debugging speed, and explanation quality.",
  },
  {
    title: "Data engineering readiness",
    score: "9%",
    notes: "Depends on ETL, validation, production review, and project delivery signals.",
  },
  {
    title: "Production coding readiness",
    score: "7%",
    notes: "Held back until tests, maintainability, and debugging quality are demonstrated consistently.",
  },
];

export function InterviewView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Interview Mode</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
          This phase seeds the readiness framework and evaluation lanes. Timed question delivery and answer scoring plug into this screen in later phases.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {lanes.map((lane) => (
          <Card key={lane.title}>
            <CardHeader>
              <CardTitle className="font-heading text-xl">{lane.title}</CardTitle>
              <CardDescription>{lane.notes}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-4xl font-semibold">{lane.score}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
