import type { EvaluationResult, LearningTechnology, ProgressState, QuestionFingerprint, Technology } from "@/lib/adaptive/types";
import { updateSkillState } from "@/lib/adaptive/mastery";
import { createSkillState } from "@/lib/adaptive/mastery";

export const PROGRESS_KEY = "mastery-adaptive-progress-v1";

export function emptyProgress(): ProgressState {
  return { version: 1, solved: { sql: 0, python: 0, pyspark: 0 }, arcadeCompleted: 0, skills: {}, recentFingerprints: [], currentQuestions: {}, recentOutcomes: [] };
}

export function parseProgress(value: string | null): ProgressState {
  if (!value) return emptyProgress();
  try {
    const parsed = JSON.parse(value) as Partial<ProgressState>;
    if (parsed.version !== 1 || !parsed.solved || !parsed.skills) return emptyProgress();
    return { ...emptyProgress(), ...parsed, solved: { ...emptyProgress().solved, ...parsed.solved } };
  } catch {
    return emptyProgress();
  }
}

export function totalCompleted(progress: ProgressState) {
  return progress.solved.sql + progress.solved.python + progress.solved.pyspark + progress.arcadeCompleted;
}

export function masteryForTechnology(progress: ProgressState, technology: Technology) {
  const states = Object.values(progress.skills).filter((state) => state.curriculumNodeId.startsWith(`${technology}-`));
  return states.length ? Math.round(states.reduce((sum, state) => sum + state.masteryScore, 0) / states.length) : 0;
}

export function applyOutcome(progress: ProgressState, input: { technology: LearningTechnology; curriculumNodeId: string; dimensions: string[]; evaluation: EvaluationResult; usedHint?: boolean; review?: boolean; interview?: boolean; fingerprint?: QuestionFingerprint; arcadeComplete?: boolean; now?: Date }) {
  const next = structuredClone(progress);
  const previous = next.skills[input.curriculumNodeId];
  const state = updateSkillState(previous ?? createSkillState(input.curriculumNodeId), input.evaluation, input.dimensions, input);
  state.curriculumNodeId = input.curriculumNodeId;
  next.skills[input.curriculumNodeId] = state;
  const correct = input.evaluation.verdict === "correct" && input.evaluation.hiddenTestsPassed;
  if (correct && input.technology !== "arcade") next.solved[input.technology] += 1;
  if (correct && input.technology === "arcade" && input.arcadeComplete) next.arcadeCompleted += 1;
  if (input.fingerprint) next.recentFingerprints = [...next.recentFingerprints, input.fingerprint].slice(-60);
  next.recentOutcomes = [...next.recentOutcomes, { technology: input.technology, curriculumNodeId: input.curriculumNodeId, correct, at: (input.now ?? new Date()).toISOString() }].slice(-40);
  return next;
}

export function normalizeFingerprint(fingerprint: QuestionFingerprint) {
  return [fingerprint.technology, fingerprint.topic, fingerprint.subtopic, fingerprint.pattern, fingerprint.scenario, fingerprint.difficulty, [...fingerprint.skills].sort().join(","), fingerprint.schemaSignature]
    .join("|")
    .toLowerCase()
    .replace(/[^a-z0-9|,]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

export function isDuplicateFingerprint(candidate: QuestionFingerprint, recent: QuestionFingerprint[]) {
  const normalized = normalizeFingerprint(candidate);
  const candidateTokens = new Set(normalized.split(/[ |,]+/u).filter(Boolean));
  return recent.some((item) => {
    const other = normalizeFingerprint(item);
    if (other === normalized) return true;
    const otherTokens = new Set(other.split(/[ |,]+/u).filter(Boolean));
    const intersection = [...candidateTokens].filter((token) => otherTokens.has(token)).length;
    const union = new Set([...candidateTokens, ...otherTokens]).size;
    return union > 0 && intersection / union >= 0.86;
  });
}
