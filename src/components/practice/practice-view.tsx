import { academyStats, academyTracks, getTrackQuestionSamples } from "@/lib/academy";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const modes = [
  {
    title: "Guided Practice",
    description: "Includes examples, structured hints, and checkpoint explanations.",
  },
  {
    title: "Independent Practice",
    description: "Minimal help and no automatic examples until requested.",
  },
  {
    title: "Timed Practice",
    description: "Speed and clarity under a countdown with no hints.",
  },
  {
    title: "Interview Mode",
    description: "One question at a time with explanation quality and alternatives evaluated.",
  },
  {
    title: "Revision Mode",
    description: "Selects questions from weak topics and repeated mistakes.",
  },
  {
    title: "Production Mode",
    description: "Real business requirements that demand maintainable, production-quality answers.",
  },
];

export function PracticeView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Practice</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
          Practice is now split into two lanes: guided weekly missions and a separate large question bank with game-style repetition.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Tracks</p>
            <p className="mt-2 font-heading text-2xl font-semibold">{academyStats.tracks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Question bank</p>
            <p className="mt-2 font-heading text-2xl font-semibold">{academyStats.totalQuestions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Guided tasks</p>
            <p className="mt-2 font-heading text-2xl font-semibold">{academyStats.totalWeeklyTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Arcade levels</p>
            <p className="mt-2 font-heading text-2xl font-semibold">{academyStats.totalArcadeLevels}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modes.map((mode) => (
          <Card key={mode.title}>
            <CardHeader>
              <CardTitle className="font-heading text-xl">{mode.title}</CardTitle>
              <CardDescription>{mode.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {academyTracks.map((track) => (
          <Card key={track.slug}>
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                {track.title}
              </CardTitle>
              <CardDescription>
                {track.questionBankCount} questions, {track.arcadeLevelCount} game levels, {track.weeklyTaskCount} guided tasks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {getTrackQuestionSamples(track.slug, 4).map((question) => (
                <div key={question.id} className="rounded-3xl border border-border/70 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{question.topic}</Badge>
                    <Badge variant="outline">{question.difficulty}</Badge>
                    <Badge variant="outline">{question.stage}</Badge>
                  </div>
                  <p className="mt-3 font-medium">{question.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{question.prompt}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Why the game lane is separate</CardTitle>
            <CardDescription>The weekly tasks teach. The game lane sharpens speed and recall.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Weekly missions walk you through the concept and check correctness step by step.",
              "Game levels are short, repeatable, and intentionally feel different from the weekly study flow.",
              "The question bank grows from easy to expert so practice does not stall after the basics.",
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-border/70 p-4 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Material style</CardTitle>
            <CardDescription>Built for clarity first, then depth.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {academyTracks.flatMap((track) =>
              track.materialPillars.slice(0, 1).map((pillar) => (
                <div key={`${track.slug}-${pillar}`} className="rounded-3xl border border-border/70 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{track.shortLabel}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{pillar}</p>
                </div>
              )),
            )}
            </CardContent>
          </Card>
      </section>
    </div>
  );
}
