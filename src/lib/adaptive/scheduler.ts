import { curriculumById, curriculumByTechnology } from "@/lib/adaptive/curriculum";
import { diagnosticComplete, diagnosticSequence, nextDiagnosticNodeId } from "@/lib/adaptive/diagnostic";
import { createSkillState } from "@/lib/adaptive/mastery";
import type { CurriculumNode, Difficulty, DifficultyPreference, ProgressState, ScheduleReason, ScheduledTarget, SchedulerOptions, SkillState, Technology } from "@/lib/adaptive/types";

const MIN_PREREQUISITE_MASTERY = 45;
const distribution: Array<{ max: number; reason: ScheduleReason }> = [
  { max: 40, reason: "weak" },
  { max: 60, reason: "neighbor" },
  { max: 75, reason: "review" },
  { max: 85, reason: "new" },
  { max: 95, reason: "interview" },
  { max: 100, reason: "stretch" },
];

const diagnosticDifficulties: Difficulty[] = [1, 1, 1, 1, 1, 2, 2, 2, 2, 3];

function prerequisitePassed(state: SkillState | undefined) {
  return !!state && state.attempted >= 4 && state.correct >= 3 && state.recentAccuracy >= 0.75 && state.masteryScore >= MIN_PREREQUISITE_MASTERY;
}

export function prerequisitesSatisfied(node: CurriculumNode, progress: ProgressState) {
  return node.prerequisites.every((id) => prerequisitePassed(progress.skills[id]));
}

export function nodeEligible(node: CurriculumNode, progress: ProgressState) {
  if (!diagnosticComplete(progress, node.technology)) return false;
  return prerequisitesSatisfied(node, progress);
}

function evidenceMaximum(state: SkillState) {
  if (state.status === "working" && state.interviewPasses >= 1) return 5 as const;
  if (state.attempted >= 8 && state.recentAccuracy >= 0.85 && state.validatorPasses >= 6 && state.hintCount <= Math.max(1, Math.floor(state.attempted * 0.2))) return 4 as const;
  if (state.attempted >= 6 && state.recentAccuracy >= 0.8 && state.passedPatterns.length >= 2) return 3 as const;
  if (state.attempted >= 4 && state.recentAccuracy >= 0.75 && state.solutionRevealCount <= Math.max(1, Math.floor(state.attempted * 0.2))) return 2 as const;
  return 1 as const;
}

function preferenceMaximum(preference: DifficultyPreference) {
  if (preference === "beginner") return 2 as const;
  if (preference === "intermediate") return 3 as const;
  return 5 as const;
}

export function allowedDifficulty(node: CurriculumNode, progress: ProgressState) {
  const state = progress.skills[node.id] ?? createSkillState(node.id);
  const evidence = evidenceMaximum(state);
  const preference = progress.difficultyPreference[node.technology];
  const max = Math.min(evidence, preferenceMaximum(preference)) as Difficulty;
  const requestedMin = preference === "advanced" ? 3 : preference === "intermediate" ? 2 : 1;
  const min = Math.min(max, requestedMin) as Difficulty;
  return { min, max };
}

function targetDimensions(node: CurriculumNode, state: SkillState) {
  const untested = node.skillDimensions.filter((item) => !state.testedDimensions.includes(item));
  if (untested.length) return untested.slice(0, 3);
  const stage = Math.min(node.skillDimensions.length - 1, Math.floor(state.attempted / 2));
  return node.skillDimensions.slice(stage, stage + 3).length ? node.skillDimensions.slice(stage, stage + 3) : node.skillDimensions.slice(-3);
}

function makeTarget(node: CurriculumNode, progress: ProgressState, reason: ScheduleReason, difficulty: Difficulty, diagnosticQuestion = false): ScheduledTarget {
  const state = progress.skills[node.id] ?? createSkillState(node.id);
  const allowed = diagnosticQuestion ? { min: difficulty, max: difficulty } : allowedDifficulty(node, progress);
  return { node, reason, difficulty: Math.max(allowed.min, Math.min(allowed.max, difficulty)) as Difficulty, targetDimensions: targetDimensions(node, state), diagnosticQuestion, allowedDifficulty: allowed };
}

function diagnosticTarget(technology: Technology, progress: ProgressState) {
  const nodeId = nextDiagnosticNodeId(progress, technology) ?? diagnosticSequence(progress.diagnostics[technology], technology)[0]!;
  const node = curriculumById.get(nodeId);
  if (!node || node.technology !== technology) throw new Error("INVALID_DIAGNOSTIC_CURRICULUM");
  const fullIndex = Math.max(0, diagnosticSequence(progress.diagnostics[technology], technology).indexOf(nodeId));
  const difficulty = progress.diagnostics[technology].shortened ? ([1, 1, 2, 2, 3] as Difficulty[])[fullIndex]! : diagnosticDifficulties[fullIndex]!;
  return makeTarget(node, progress, "diagnostic", difficulty, true);
}

export function scheduleTarget(technology: Technology, progress: ProgressState, roll = Math.random() * 100, now = new Date(), options: SchedulerOptions = {}): ScheduledTarget {
  if (options.adjustment && options.currentNodeId && !diagnosticComplete(progress, technology)) {
    const node = curriculumById.get(options.currentNodeId);
    const isDiagnosticNode = diagnosticSequence(progress.diagnostics[technology], technology).includes(options.currentNodeId);
    if (node?.technology === technology && isDiagnosticNode) {
      const current = options.currentDifficulty ?? 1;
      const desired = options.adjustment === "easier" ? Math.max(1, current - 1) : Math.min(3, current + 1);
      return makeTarget(node, progress, options.adjustment === "easier" ? "remediation" : "diagnostic", desired as Difficulty, true);
    }
  }
  if (!diagnosticComplete(progress, technology)) return diagnosticTarget(technology, progress);
  const nodes = curriculumByTechnology(technology);

  if (options.adjustment && options.currentNodeId) {
    const node = curriculumById.get(options.currentNodeId);
    if (node?.technology === technology && nodeEligible(node, progress)) {
      const allowed = allowedDifficulty(node, progress);
      const current = options.currentDifficulty ?? allowed.max;
      const desired = options.adjustment === "easier" ? Math.max(1, current - 1) : Math.min(5, current + 1);
      return makeTarget(node, progress, options.adjustment === "easier" ? "remediation" : "neighbor", desired as Difficulty);
    }
  }

  const remediation = progress.remediation[technology];
  if (remediation) {
    const node = curriculumById.get(remediation.curriculumNodeId);
    if (node?.technology === technology && nodeEligible(node, progress)) return makeTarget(node, progress, "remediation", Math.max(1, remediation.difficulty - 1) as Difficulty);
  }

  const eligibleNodes = nodes.filter((node) => nodeEligible(node, progress));
  const safeNodes = eligibleNodes.length ? eligibleNodes : nodes.filter((node) => node.prerequisites.length === 0).slice(0, 1);
  const reason = distribution.find((bucket) => roll < bucket.max)?.reason ?? "stretch";
  const weakNodes = safeNodes.filter((node) => (progress.skills[node.id]?.masteryScore ?? 0) < 50 && (progress.skills[node.id]?.attempted ?? 0) > 0);
  const neighborIds = new Set(weakNodes.flatMap((node) => [
    ...node.prerequisites,
    ...safeNodes.filter((candidate) => candidate.category === node.category && candidate.id !== node.id).slice(0, 3).map((candidate) => candidate.id),
  ]));
  const scored = safeNodes.map((node, index) => {
    const state = progress.skills[node.id] ?? createSkillState(node.id);
    const due = state.nextReviewAt ? new Date(state.nextReviewAt) <= now : true;
    let score = 0;
    if (reason === "weak") score = state.attempted > 0 ? 140 - state.masteryScore + state.recentMistakes.length * 8 + state.hintCount * 2 : 10 - index / safeNodes.length;
    if (reason === "review") score = due && state.attempted > 0 ? 200 + (100 - state.masteryScore) : -100;
    if (reason === "new") score = state.attempted === 0 ? 200 - index / safeNodes.length : -state.attempted;
    if (reason === "neighbor") score = neighborIds.has(node.id) ? 180 - state.masteryScore : state.status === "learning" ? 120 - state.masteryScore : 20 - index / safeNodes.length;
    if (reason === "interview") score = state.status === "working" ? 160 : state.masteryScore;
    if (reason === "stretch") score = state.status === "working" ? state.masteryScore + state.currentDifficulty * 8 : -100 + state.masteryScore;
    return { node, state, score };
  });
  scored.sort((a, b) => b.score - a.score || safeNodes.indexOf(a.node) - safeNodes.indexOf(b.node));
  const selected = scored[0]!;
  const allowed = allowedDifficulty(selected.node, progress);
  const bump = reason === "stretch" ? 1 : reason === "interview" ? 0.5 : 0;
  const desired = Math.round(selected.state.currentDifficulty + bump) as Difficulty;
  return makeTarget(selected.node, progress, reason, Math.min(allowed.max, Math.max(allowed.min, desired)) as Difficulty);
}
