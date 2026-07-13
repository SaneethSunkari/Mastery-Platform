"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { CheckCircle2, ChevronRight, Code2, Gem, Trophy } from "lucide-react";
import { candyArcadeLevels } from "@/lib/candy-arcade";
import { completeCandyArcadeLevel, db, saveCandyArcadeDraft } from "@/lib/db";
import { ArcadeLanguage } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const editorConfigs: Array<{
  language: ArcadeLanguage;
  title: string;
  goalKey: "sqlGoal" | "pythonGoal" | "pysparkGoal";
  themeClass: string;
  monacoLanguage: "sql" | "python";
}> = [
  {
    language: "sql",
    title: "SQL",
    goalKey: "sqlGoal",
    themeClass: "border-amber-500/25 bg-amber-500/8",
    monacoLanguage: "sql",
  },
  {
    language: "python",
    title: "Python",
    goalKey: "pythonGoal",
    themeClass: "border-teal-500/25 bg-teal-500/8",
    monacoLanguage: "python",
  },
  {
    language: "pyspark",
    title: "PySpark",
    goalKey: "pysparkGoal",
    themeClass: "border-sky-500/25 bg-sky-500/8",
    monacoLanguage: "python",
  },
];

export function CandyArcadeView() {
  const progressRecords = useLiveQuery(() => db.candyArcadeProgress.orderBy("levelNumber").toArray(), []);
  const [selectedLevelId, setSelectedLevelId] = useState(candyArcadeLevels[0]?.id ?? "");
  const [localDrafts, setLocalDrafts] = useState<Record<string, string>>({});
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<ArcadeLanguage>("sql");

  const currentPlayableLevelId = useMemo(() => {
    const current = progressRecords?.find((record) => record.unlocked && !record.completed);
    return current?.levelId ?? candyArcadeLevels[0]?.id ?? "";
  }, [progressRecords]);

  const activeLevelId = selectedLevelId || currentPlayableLevelId;
  const level = candyArcadeLevels.find((item) => item.id === activeLevelId) ?? candyArcadeLevels[0];
  const levelProgress = progressRecords?.find((record) => record.levelId === level?.id) ?? null;

  const completedCount = (progressRecords ?? []).filter((record) => record.completed).length;
  const currentLevelNumber =
    progressRecords?.find((record) => record.unlocked && !record.completed)?.levelNumber ?? completedCount + 1;

  const visibleLevels = useMemo(() => {
    if (!level) return [];
    const start = Math.max(level.levelNumber - 12, 1);
    const end = Math.min(start + 35, candyArcadeLevels.length);
    return candyArcadeLevels.slice(start - 1, end);
  }, [level]);

  if (!progressRecords || !level || !levelProgress) {
    return <div className="text-sm text-muted-foreground">Loading candy arcade...</div>;
  }

  const drafts = {
    sql: localDrafts[`${level.id}-sql`] ?? levelProgress.sqlDraft,
    python: localDrafts[`${level.id}-python`] ?? levelProgress.pythonDraft,
    pyspark: localDrafts[`${level.id}-pyspark`] ?? levelProgress.pysparkDraft,
  };

  const nextMissingLanguage = editorConfigs.find((config) => !drafts[config.language].trim())?.language ?? null;

  async function handleDraftChange(language: ArcadeLanguage, value: string | undefined) {
    const nextValue = value ?? "";
    setLocalDrafts((current) => ({
      ...current,
      [`${level.id}-${language}`]: nextValue,
    }));
    await saveCandyArcadeDraft(level.id, language, nextValue);
  }

  async function handleSubmitLevel() {
    if (nextMissingLanguage) {
      setActiveLanguage(nextMissingLanguage);
      setSubmitMessage(`Finish the ${nextMissingLanguage.toUpperCase()} tab before submitting this level.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const result = await completeCandyArcadeLevel(level.id, drafts);
      if (!result.levelCompleted) {
        setSubmitMessage("This level is not complete yet.");
        return;
      }

      const nextLevel = candyArcadeLevels.find((item) => item.levelNumber === level.levelNumber + 1);
      setSubmitMessage("Level submitted. The next level is unlocked.");
      if (nextLevel) {
        setSelectedLevelId(nextLevel.id);
        setActiveLanguage("sql");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleNextTab() {
    const currentIndex = editorConfigs.findIndex((config) => config.language === activeLanguage);
    const nextConfig = editorConfigs[currentIndex + 1];
    if (nextConfig) {
      setActiveLanguage(nextConfig.language);
    }
  }

  function handlePreviousTab() {
    const currentIndex = editorConfigs.findIndex((config) => config.language === activeLanguage);
    const previousConfig = editorConfigs[currentIndex - 1];
    if (previousConfig) {
      setActiveLanguage(previousConfig.language);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-linear-to-br from-fuchsia-950 via-slate-950 to-sky-950 text-white shadow-[0_25px_90px_-45px_rgba(88,28,135,0.75)]">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-pink-400/20 text-pink-100 hover:bg-pink-400/20">Candy Arcade</Badge>
            <Badge className="bg-white/10 text-white hover:bg-white/10">3000 levels</Badge>
            <Badge className="bg-white/10 text-white hover:bg-white/10">Same task in 3 languages</Badge>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-semibold tracking-tight md:text-4xl">
              Pick a level, solve it, submit it, unlock the next one
            </CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-7 text-slate-200">
              This arcade now behaves like an individual coding challenge. Click a level bubble, read the task on the left, write your code on the right, then submit the full level.
            </CardDescription>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Completed</p>
              <p className="mt-2 text-3xl font-semibold">{completedCount}/3000</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Current level</p>
              <p className="mt-2 text-3xl font-semibold">{Math.min(currentLevelNumber, 3000)}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Unlock rule</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">Submit one full level to open the next one.</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Level path</CardTitle>
          <CardDescription>Click any unlocked level to open it like a normal challenge.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: Math.ceil(visibleLevels.length / 12) }, (_, rowIndex) => {
            const rowLevels = visibleLevels.slice(rowIndex * 12, rowIndex * 12 + 12);
            const orderedRow = rowIndex % 2 === 0 ? rowLevels : [...rowLevels].reverse();

            return (
              <div key={`arcade-row-${rowIndex}`} className="flex flex-wrap justify-center gap-3">
                {orderedRow.map((item) => {
                  const itemProgress = progressRecords.find((record) => record.levelId === item.id);
                  const completed = Boolean(itemProgress?.completed);
                  const unlocked = Boolean(itemProgress?.unlocked);
                  const selected = item.id === level.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => {
                        setSelectedLevelId(item.id);
                        setActiveLanguage("sql");
                        setSubmitMessage(null);
                      }}
                      className={cn(
                        "flex h-20 w-20 flex-col items-center justify-center rounded-full border text-center transition",
                        completed
                          ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-50"
                          : selected
                            ? "border-pink-400/60 bg-pink-500/20 text-white shadow-[0_12px_35px_-18px_rgba(244,114,182,1)]"
                            : unlocked
                              ? "border-sky-500/30 bg-sky-500/10 text-foreground"
                              : "border-border/70 bg-muted/40 text-muted-foreground",
                      )}
                    >
                      <span className="text-sm font-semibold">{item.levelNumber}</span>
                      <span className="mt-1 text-[11px]">{completed ? "done" : unlocked ? "open" : "lock"}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="min-h-[760px]">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Level {level.levelNumber}</Badge>
              <Badge variant="outline">{level.difficulty}</Badge>
              <Badge variant="outline">{level.stage}</Badge>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold">{level.title}</CardTitle>
              <CardDescription className="text-sm leading-7 text-muted-foreground">
                {level.prompt}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-border/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Question</p>
              <p className="mt-3 text-sm leading-7 text-foreground">{level.question}</p>
            </div>

            <div className="rounded-3xl border border-border/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Business context</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{level.businessContext}</p>
            </div>

            <div className="rounded-3xl border border-border/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Dataset for this level</p>
              <div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                {level.dataset.map((item) => (
                  <div key={item} className="rounded-2xl border border-border/70 p-3">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Expected output</p>
              <div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                {level.expectedOutput.map((item) => (
                  <div key={item} className="rounded-2xl border border-border/70 p-3">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Write 3 solutions</p>
              <div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                <div className="rounded-2xl border border-border/70 p-3">
                  <p className="font-medium text-foreground">SQL</p>
                  <p className="mt-1">{level.sqlGoal}</p>
                </div>
                <div className="rounded-2xl border border-border/70 p-3">
                  <p className="font-medium text-foreground">Python</p>
                  <p className="mt-1">{level.pythonGoal}</p>
                </div>
                <div className="rounded-2xl border border-border/70 p-3">
                  <p className="font-medium text-foreground">PySpark</p>
                  <p className="mt-1">{level.pysparkGoal}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Success checklist</p>
              <div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                {level.successChecklist.map((item) => (
                  <div key={item} className="rounded-2xl border border-border/70 p-3">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
              Unlock behavior: this level counts as complete only after the whole challenge is submitted.
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[760px]">
          <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl font-semibold">Code editors</CardTitle>
                  <CardDescription>
                    HackerRank-style workspace: problem on the left, code on the right, one submit button at the end.
                  </CardDescription>
              </div>
              {levelProgress.completed ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-200">
                  <CheckCircle2 className="mr-1 size-3.5" />
                  Completed
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs
              value={activeLanguage}
              onValueChange={(value) => setActiveLanguage(value as ArcadeLanguage)}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-muted/40 p-1">
                {editorConfigs.map((config) => {
                  const hasDraft = Boolean(drafts[config.language].trim());
                  return (
                    <TabsTrigger key={config.language} value={config.language} className="rounded-xl">
                      {config.title}
                      {hasDraft ? " done" : ""}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {editorConfigs.map((config) => (
                <TabsContent key={config.language} value={config.language}>
                  <div className={cn("rounded-3xl border p-4", config.themeClass)}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold">{config.title}</p>
                        <p className="text-sm leading-6 text-muted-foreground">{level[config.goalKey]}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background/60 p-3">
                        <Code2 className="size-4" />
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-3xl border border-border/70">
                      <MonacoEditor
                        height="330px"
                        language={config.monacoLanguage}
                        theme="vs-dark"
                        value={drafts[config.language]}
                        onChange={(value) => {
                          void handleDraftChange(config.language, value);
                        }}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 15,
                          lineNumbersMinChars: 3,
                          scrollBeyondLastLine: false,
                          padding: { top: 16, bottom: 16 },
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {submitMessage ? (
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-200">
                {submitMessage}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/70 bg-muted/25 p-4">
              <div className="text-sm leading-6 text-muted-foreground">
                Move tab by tab, then submit the full level after writing all three solutions.
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={handlePreviousTab} disabled={activeLanguage === "sql"}>
                  Previous tab
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextTab}
                  disabled={activeLanguage === "pyspark"}
                >
                  Next tab
                </Button>
                <Button
                  className="rounded-full bg-pink-500 text-white hover:bg-pink-400"
                  disabled={isSubmitting}
                  onClick={() => {
                    void handleSubmitLevel();
                  }}
                >
                  <Trophy className="mr-2 size-4" />
                  Submit level
                  <ChevronRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Candy rules</CardTitle>
          <CardDescription>Short, simple, and task-first.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-border/70 p-4">
            <div className="mb-3 inline-flex rounded-2xl border border-border/70 bg-accent/40 p-3">
              <Gem className="size-4" />
            </div>
            <p className="font-medium">One level = one task</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Each level behaves like a normal individual challenge.</p>
          </div>
          <div className="rounded-3xl border border-border/70 p-4">
            <div className="mb-3 inline-flex rounded-2xl border border-border/70 bg-accent/40 p-3">
              <Code2 className="size-4" />
            </div>
            <p className="font-medium">Three answers</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">The same task is solved in SQL, Python, and PySpark.</p>
          </div>
          <div className="rounded-3xl border border-border/70 p-4">
            <div className="mb-3 inline-flex rounded-2xl border border-border/70 bg-accent/40 p-3">
              <ChevronRight className="size-4" />
            </div>
            <p className="font-medium">Next level unlock</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Submit the level successfully and the next bubble opens automatically.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
