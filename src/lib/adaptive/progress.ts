import { DIAGNOSTIC_NODE_IDS, completeDiagnosticNode, emptyDiagnosticState } from "@/lib/adaptive/diagnostic";
import type { EvaluationResult, LearningTechnology, ProgressState, QuestionFingerprint, SkillState, Technology } from "@/lib/adaptive/types";
import { updateSkillState } from "@/lib/adaptive/mastery";
import { createSkillState } from "@/lib/adaptive/mastery";

export const PROGRESS_KEY = "mastery-adaptive-progress-v1";

export function emptyProgress(): ProgressState {
  return {
    progressVersion: 2,
    version: 2,
    solved: { sql: 0, python: 0, pyspark: 0 },
    arcadeCompleted: 0,
    skills: {},
    recentFingerprints: [],
    currentQuestions: {},
    recentOutcomes: [],
    diagnostics: { sql: emptyDiagnosticState(), python: emptyDiagnosticState(), pyspark: emptyDiagnosticState() },
    difficultyPreference: { sql: "recommended", python: "recommended", pyspark: "recommended" },
    remediation: {},
  };
}

function normalizeSkillState(curriculumNodeId: string, value: unknown): SkillState {
  const base = createSkillState(curriculumNodeId);
  if (!value || typeof value !== "object") return { ...base, status: "learning" };
  const candidate = value as Partial<SkillState>;
  const merged = { ...base, ...candidate, curriculumNodeId };
  merged.recentOutcomes = Array.isArray(candidate.recentOutcomes) ? candidate.recentOutcomes.filter((item): item is boolean => typeof item === "boolean").slice(-10) : [];
  merged.testedDimensions = Array.isArray(candidate.testedDimensions) ? candidate.testedDimensions.filter((item): item is string => typeof item === "string") : [];
  merged.recentMistakes = Array.isArray(candidate.recentMistakes) ? candidate.recentMistakes.filter((item): item is string => typeof item === "string").slice(-5) : [];
  merged.passedPatterns = Array.isArray(candidate.passedPatterns) ? candidate.passedPatterns.filter((item): item is string => typeof item === "string").slice(-12) : [];
  if (!Number.isFinite(merged.attempted) || merged.attempted < 0) merged.attempted = 0;
  if (!Number.isFinite(merged.masteryScore) || merged.masteryScore < 0) merged.masteryScore = 0;
  if (!Number.isFinite(merged.currentDifficulty)) merged.currentDifficulty = 1;
  merged.currentDifficulty = Math.max(1, Math.min(5, merged.currentDifficulty));
  if (merged.attempted === 0) merged.status = "learning";
  return merged;
}

function migrateProgress(parsed: Record<string, unknown>): ProgressState {
  const next = emptyProgress();
  const solved = parsed.solved && typeof parsed.solved === "object" ? parsed.solved as Partial<Record<Technology, number>> : {};
  for (const technology of ["sql", "python", "pyspark"] as const) next.solved[technology] = Number.isFinite(solved[technology]) ? Math.max(0, Number(solved[technology])) : 0;
  next.arcadeCompleted = Number.isFinite(parsed.arcadeCompleted) ? Math.max(0, Number(parsed.arcadeCompleted)) : 0;
  if (parsed.skills && typeof parsed.skills === "object") {
    for (const [id, state] of Object.entries(parsed.skills)) next.skills[id] = normalizeSkillState(id, state);
  }
  next.recentFingerprints = Array.isArray(parsed.recentFingerprints) ? parsed.recentFingerprints.slice(-60) as QuestionFingerprint[] : [];
  next.recentOutcomes = Array.isArray(parsed.recentOutcomes) ? parsed.recentOutcomes.slice(-40) as ProgressState["recentOutcomes"] : [];
  next.currentQuestions = parsed.currentQuestions && typeof parsed.currentQuestions === "object" ? parsed.currentQuestions as ProgressState["currentQuestions"] : {};

  if ((parsed.progressVersion === 2 || parsed.version === 2) && parsed.diagnostics && typeof parsed.diagnostics === "object") {
    const diagnostics = parsed.diagnostics as Partial<ProgressState["diagnostics"]>;
    for (const technology of ["sql", "python", "pyspark"] as const) {
      const state = diagnostics[technology];
      next.diagnostics[technology] = state && typeof state.started === "boolean" && Array.isArray(state.completedNodeIds)
        ? { started: state.started, shortened: !!state.shortened, completedNodeIds: state.completedNodeIds.filter((id): id is string => typeof id === "string") }
        : emptyDiagnosticState(next.solved[technology] > 0);
    }
    if (parsed.difficultyPreference && typeof parsed.difficultyPreference === "object") {
      const preferences = parsed.difficultyPreference as Record<string, unknown>;
      for (const technology of ["sql", "python", "pyspark"] as const) {
        if (["recommended", "beginner", "intermediate", "advanced"].includes(String(preferences[technology]))) next.difficultyPreference[technology] = preferences[technology] as ProgressState["difficultyPreference"][Technology];
      }
    }
    if (parsed.remediation && typeof parsed.remediation === "object") next.remediation = parsed.remediation as ProgressState["remediation"];
    return next;
  }

  for (const technology of ["sql", "python", "pyspark"] as const) {
    const reliableStates = Object.values(next.skills).filter((state) => state.curriculumNodeId.startsWith(`${technology}-`) && state.attempted >= 4 && state.testedDimensions.length > 0);
    if (reliableStates.length >= 2) next.diagnostics[technology] = { started: true, shortened: false, completedNodeIds: [...DIAGNOSTIC_NODE_IDS[technology]] };
    else next.diagnostics[technology] = emptyDiagnosticState(next.solved[technology] > 0 || reliableStates.length > 0);
  }
  return next;
}

export function parseProgress(value: string | null): ProgressState {
  if (!value) return emptyProgress();
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    if (![1, 2].includes(Number(parsed.progressVersion ?? parsed.version)) || !parsed.solved || !parsed.skills) return emptyProgress();
    return migrateProgress(parsed);
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

export function applyOutcome(progress: ProgressState, input: { technology: LearningTechnology; curriculumNodeId: string; dimensions: string[]; evaluation: EvaluationResult; usedHint?: boolean; review?: boolean; interview?: boolean; diagnosticQuestion?: boolean; fingerprint?: QuestionFingerprint; arcadeComplete?: boolean; now?: Date }) {
  let next = structuredClone(progress);
  const previous = next.skills[input.curriculumNodeId];
  const state = updateSkillState(previous ?? createSkillState(input.curriculumNodeId), input.evaluation, input.dimensions, { ...input, pattern: input.fingerprint?.pattern });
  state.curriculumNodeId = input.curriculumNodeId;
  next.skills[input.curriculumNodeId] = state;
  const correct = input.evaluation.verdict === "correct" && input.evaluation.hiddenTestsPassed;
  if (correct && input.technology !== "arcade") next.solved[input.technology] += 1;
  if (correct && input.technology === "arcade" && input.arcadeComplete) next.arcadeCompleted += 1;
  if (input.fingerprint) next.recentFingerprints = [...next.recentFingerprints, input.fingerprint].slice(-60);
  next.recentOutcomes = [...next.recentOutcomes, { technology: input.technology, curriculumNodeId: input.curriculumNodeId, correct, at: (input.now ?? new Date()).toISOString() }].slice(-40);
  if (input.technology !== "arcade") {
    if (input.diagnosticQuestion) next = completeDiagnosticNode(next, input.technology, input.curriculumNodeId);
    if (correct) delete next.remediation[input.technology];
    else next.remediation[input.technology] = { curriculumNodeId: input.curriculumNodeId, difficulty: Math.max(1, Math.min(5, Math.floor(state.currentDifficulty))) as 1 | 2 | 3 | 4 | 5 };
  }
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
