import type { EvaluationResult, SkillState } from "@/lib/adaptive/types";

export function createSkillState(curriculumNodeId: string): SkillState {
  return {
    curriculumNodeId,
    attempted: 0,
    correct: 0,
    recentAccuracy: 0,
    currentDifficulty: 1,
    hintCount: 0,
    solutionRevealCount: 0,
    runtimePasses: 0,
    validatorPasses: 0,
    recentMistakes: [],
    testedDimensions: [],
    lastPracticedAt: "",
    nextReviewAt: new Date(0).toISOString(),
    masteryScore: 0,
    status: "new",
    recentOutcomes: [],
    spacedReviewPasses: 0,
    interviewPasses: 0,
    passedPatterns: [],
  };
}

export function calculateMastery(state: SkillState) {
  const breadth = Math.min(1, state.testedDimensions.length / 6);
  const depth = Math.min(1, state.attempted / 30);
  const accuracy = state.recentAccuracy;
  const independence = Math.max(0, 1 - state.hintCount / Math.max(1, state.attempted));
  const evidence = Math.min(1, (state.runtimePasses + state.validatorPasses) / 12);
  const retention = Math.min(1, state.spacedReviewPasses / 2);
  return Math.round((breadth * 0.2 + depth * 0.2 + accuracy * 0.25 + independence * 0.1 + evidence * 0.15 + retention * 0.1) * 100);
}

export function updateSkillState(
  previous: SkillState | undefined,
  evaluation: EvaluationResult,
  dimensions: string[],
  options: { usedHint?: boolean; review?: boolean; interview?: boolean; pattern?: string; now?: Date } = {},
) {
  const now = options.now ?? new Date();
  const state = structuredClone(previous ?? createSkillState("unknown"));
  const correct = evaluation.verdict === "correct" && evaluation.hiddenTestsPassed;
  state.attempted += 1;
  state.correct += correct ? 1 : 0;
  state.hintCount += options.usedHint ? 1 : 0;
  state.runtimePasses += evaluation.runtimePassed ? 1 : 0;
  state.validatorPasses += evaluation.validatorPassed ? 1 : 0;
  state.recentOutcomes = [...state.recentOutcomes, correct].slice(-10);
  state.recentAccuracy = state.recentOutcomes.filter(Boolean).length / state.recentOutcomes.length;
  state.recentMistakes = correct
    ? state.recentMistakes.slice(-4)
    : [...state.recentMistakes, evaluation.mistakeClassification].slice(-5);
  state.testedDimensions = [...new Set([...state.testedDimensions, ...dimensions])];
  if (correct && options.pattern) state.passedPatterns = [...new Set([...state.passedPatterns, options.pattern])].slice(-12);
  const revealsAcceptable = state.solutionRevealCount <= Math.max(1, Math.floor(state.attempted * 0.2));
  const hintsMinimal = state.hintCount <= Math.max(1, Math.floor(state.attempted * 0.2));
  const evidenceLevel = state.status === "working" && state.interviewPasses > 0
    ? 5
    : state.attempted >= 8 && state.recentAccuracy >= 0.85 && state.validatorPasses >= 6 && hintsMinimal
      ? 4
      : state.attempted >= 6 && state.recentAccuracy >= 0.8 && state.passedPatterns.length >= 2
        ? 3
        : state.attempted >= 4 && state.recentAccuracy >= 0.75 && revealsAcceptable
          ? 2
          : 1;
  state.currentDifficulty = correct ? Math.min(5, Math.max(state.currentDifficulty, evidenceLevel)) : Math.max(1, state.currentDifficulty - 0.25);
  state.spacedReviewPasses += correct && options.review ? 1 : 0;
  state.interviewPasses += correct && options.interview ? 1 : 0;
  state.lastPracticedAt = now.toISOString();
  const intervalDays = correct ? Math.min(30, 2 ** Math.min(4, state.spacedReviewPasses + 1)) : 1;
  state.nextReviewAt = new Date(now.getTime() + intervalDays * 86_400_000).toISOString();
  state.masteryScore = calculateMastery(state);

  const interviewReady = state.attempted >= 30 && state.recentAccuracy >= 0.85 && state.testedDimensions.length >= 6 && state.spacedReviewPasses >= 2 && state.interviewPasses >= 1 && state.hintCount <= Math.floor(state.attempted * 0.2) && state.validatorPasses >= 10;
  const working = state.attempted >= 20 && state.recentAccuracy >= 0.8 && state.testedDimensions.length >= 6 && state.currentDifficulty >= 3;
  const foundation = state.attempted >= 8 && state.correct >= 6 && state.testedDimensions.length >= 3;
  state.status = interviewReady ? "interview-ready" : working ? "working" : foundation ? "learning" : state.attempted ? "learning" : "new";
  return state;
}
