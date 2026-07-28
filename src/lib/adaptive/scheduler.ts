import { curriculumByTechnology } from "@/lib/adaptive/curriculum";
import { createSkillState } from "@/lib/adaptive/mastery";
import type { ProgressState, ScheduleReason, ScheduledTarget, Technology } from "@/lib/adaptive/types";

const distribution: Array<{ max: number; reason: ScheduleReason }> = [
  { max: 40, reason: "weak" },
  { max: 60, reason: "neighbor" },
  { max: 75, reason: "review" },
  { max: 85, reason: "new" },
  { max: 95, reason: "interview" },
  { max: 100, reason: "stretch" },
];

export function scheduleTarget(technology: Technology, progress: ProgressState, roll = Math.random() * 100, now = new Date()): ScheduledTarget {
  const nodes = curriculumByTechnology(technology);
  const reason = distribution.find((bucket) => roll < bucket.max)?.reason ?? "stretch";
  const weakNodes = nodes.filter((node) => (progress.skills[node.id]?.masteryScore ?? 0) < 50 && (progress.skills[node.id]?.attempted ?? 0) > 0);
  const neighborIds = new Set(weakNodes.flatMap((node) => [
    ...node.prerequisites,
    ...nodes.filter((candidate) => candidate.category === node.category && candidate.id !== node.id).slice(0, 3).map((candidate) => candidate.id),
  ]));
  const scored = nodes.map((node, index) => {
    const state = progress.skills[node.id] ?? createSkillState(node.id);
    const due = state.nextReviewAt ? new Date(state.nextReviewAt) <= now : true;
    let score = 0;
    if (reason === "weak") score = state.attempted > 0 ? 140 - state.masteryScore + state.recentMistakes.length * 8 + state.hintCount * 2 : 10 - index / nodes.length;
    if (reason === "review") score = due && state.attempted > 0 ? 200 + (100 - state.masteryScore) : -100;
    if (reason === "new") score = state.attempted === 0 ? 200 - index / nodes.length : -state.attempted;
    if (reason === "neighbor") score = neighborIds.has(node.id) ? 180 - state.masteryScore : state.status === "learning" ? 120 - state.masteryScore : 20 - index / nodes.length;
    if (reason === "interview") score = state.status === "working" ? 160 : state.masteryScore;
    if (reason === "stretch") score = state.masteryScore + state.currentDifficulty * 8;
    return { node, state, score };
  });
  scored.sort((a, b) => b.score - a.score || a.node.id.localeCompare(b.node.id));
  const selected = scored[0]!;
  const untested = selected.node.skillDimensions.filter((item) => !selected.state.testedDimensions.includes(item));
  return {
    node: selected.node,
    reason,
    difficulty: Math.max(1, Math.min(5, Math.round(selected.state.currentDifficulty + (reason === "stretch" ? 1 : reason === "interview" ? 0.5 : 0)))),
    targetDimensions: (untested.length ? untested : selected.node.skillDimensions).slice(0, 3),
  };
}
