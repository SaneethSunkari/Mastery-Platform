import "server-only";

import { randomUUID } from "node:crypto";
import { curriculumById } from "@/lib/adaptive/curriculum";
import { isDuplicateFingerprint, parseProgress } from "@/lib/adaptive/progress";
import { scheduleTarget } from "@/lib/adaptive/scheduler";
import { validateQuestionEligibility } from "@/lib/adaptive/server/eligibility";
import { diagnosticQuestionBank } from "@/lib/adaptive/server/diagnostic-question-bank";
import { arcadePrompt, assistancePrompt, evaluationPrompt, generationPrompt } from "@/lib/adaptive/server/prompts";
import { assistanceSchema, evaluationSchema, questionSchema, requestStructuredJson } from "@/lib/adaptive/server/openai";
import { isEvaluationContent, isGeneratedQuestion } from "@/lib/adaptive/server/validation";
import type { EvaluationResult, GeneratedQuestion, LearnerQuestion, ProgressState, SchedulerOptions, Technology } from "@/lib/adaptive/types";

function decodeJson(value: unknown) {
  if (typeof value !== "string") return value;
  try { return JSON.parse(value) as unknown; } catch { return value; }
}

function decodeTests(value: unknown) {
  if (!Array.isArray(value)) return value;
  return value.map((test) => {
    if (!test || typeof test !== "object") return test;
    const item = test as { description?: unknown; input?: unknown; expected?: unknown };
    return { ...item, input: decodeJson(item.input), expected: decodeJson(item.expected) };
  });
}

function cleanQuestion(question: GeneratedQuestion): GeneratedQuestion {
  const runtimeValue = question.runtime as GeneratedQuestion["runtime"] & Record<string, unknown>;
  return {
    ...question,
    schema: decodeJson(question.schema),
    sampleData: decodeJson(question.sampleData),
    hiddenTests: decodeTests(question.hiddenTests) as GeneratedQuestion["hiddenTests"],
    runtime: runtimeValue ? {
      ...(typeof runtimeValue.setupSql === "string" ? { setupSql: runtimeValue.setupSql } : {}),
      ...(typeof runtimeValue.functionName === "string" ? { functionName: runtimeValue.functionName } : {}),
      ...(Array.isArray(runtimeValue.visibleTests) ? { visibleTests: decodeTests(runtimeValue.visibleTests) as NonNullable<GeneratedQuestion["runtime"]>["visibleTests"] } : {}),
      ...(typeof runtimeValue.pysparkQuestionId === "string" ? { pysparkQuestionId: runtimeValue.pysparkQuestionId } : {}),
    } : undefined,
  };
}

export function learnerQuestion(question: GeneratedQuestion): LearnerQuestion {
  const { hiddenTests: _hiddenTests, referenceSolution: _referenceSolution, ...safe } = question;
  void _hiddenTests;
  void _referenceSolution;
  return safe;
}

export async function generateQuestion(technology: Technology, progress: ProgressState, options: SchedulerOptions = {}) {
  const target = scheduleTarget(technology, progress, undefined, undefined, options);
  if (target.diagnosticQuestion) {
    const bank = diagnosticQuestionBank.get(target.node.id) ?? [];
    const startIndex = (progress.recentFingerprints.length + (options.adjustment ? 1 : 0)) % Math.max(1, bank.length);
    for (let offset = 0; offset < bank.length; offset += 1) {
      const stored = bank[(startIndex + offset) % bank.length]!;
      const candidate = {
        ...stored,
        difficulty: target.difficulty,
        learnerInstructions: options.adjustment === "easier"
          ? `Scaffolded variation: focus on the single selected competency. ${stored.learnerInstructions}`
          : options.adjustment === "harder"
            ? `Slightly harder variation: pay close attention to the supplied edge cases. ${stored.learnerInstructions}`
            : stored.learnerInstructions,
        fingerprint: { ...stored.fingerprint, difficulty: target.difficulty },
      };
      const eligibility = validateQuestionEligibility(candidate, progress, target.node, target);
      if (eligibility.eligible) return { question: { ...candidate, id: randomUUID() }, reason: target.reason };
    }
    throw new Error("DIAGNOSTIC_BANK_EXHAUSTED");
  }
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const raw = await requestStructuredJson<unknown>("adaptive_question", generationPrompt(technology, target, progress), questionSchema);
    if (!isGeneratedQuestion(raw)) throw new Error("INVALID_LLM_JSON");
    const cleaned = cleanQuestion(raw);
    const candidate = {
      ...cleaned,
      fingerprint: {
        ...cleaned.fingerprint,
        technology: target.node.technology,
        topic: target.node.topic,
        subtopic: target.node.subtopic,
        difficulty: cleaned.difficulty,
      },
    };
    const eligibility = validateQuestionEligibility(candidate, progress, target.node, target);
    if (!eligibility.eligible) continue;
    return { question: { ...candidate, id: randomUUID() }, reason: target.reason };
  }
  throw new Error("INELIGIBLE_GENERATION");
}

export async function generateArcadeQuestion(progress: ProgressState) {
  const raw = await requestStructuredJson<unknown>("arcade_question", arcadePrompt(progress.recentFingerprints.filter((item) => item.technology === "arcade").slice(-8).map((item) => item.scenario)), questionSchema);
  if (!isGeneratedQuestion(raw)) throw new Error("INVALID_LLM_JSON");
  const question = cleanQuestion({ ...raw, id: randomUUID(), technology: "arcade", curriculumNodeId: "arcade-cross-language", topic: "Cross-language data engineering", subtopic: "Equivalent transformations", skillDimensions: ["cross-language correctness", "edge-case parity", "runtime behavior"] });
  if (isDuplicateFingerprint(question.fingerprint, progress.recentFingerprints)) throw new Error("DUPLICATE_GENERATION");
  return { question, reason: "interview" as const };
}

export async function teacherEvaluation(input: { question: GeneratedQuestion; code: string; runtimeSummary: string; passed: boolean; runtimePassed: boolean; validatorPassed: boolean }): Promise<EvaluationResult> {
  const raw = await requestStructuredJson<unknown>("answer_evaluation", evaluationPrompt({ technology: input.question.technology, prompt: input.question.prompt, code: input.code, rubric: input.question.rubric, runtimeSummary: input.runtimeSummary, passed: input.passed }), evaluationSchema);
  if (!isEvaluationContent(raw)) throw new Error("INVALID_LLM_JSON");
  return {
    ...raw,
    verdict: input.passed ? "correct" : raw.verdict === "correct" ? "partially-correct" : raw.verdict,
    score: input.passed ? Math.max(80, raw.score) : Math.min(79, raw.score),
    runtimeResult: input.runtimeSummary,
    hiddenTestsPassed: input.passed,
    runtimePassed: input.runtimePassed,
    validatorPassed: input.validatorPassed,
  };
}

export async function teacherAssistance(input: { kind: "hint" | "explain"; question: GeneratedQuestion; code: string }) {
  const result = await requestStructuredJson<{ message?: unknown }>(`${input.kind}_response`, assistancePrompt({ kind: input.kind, technology: input.question.technology, prompt: input.question.prompt, code: input.code, dimensions: input.question.skillDimensions }), assistanceSchema);
  if (typeof result.message !== "string") throw new Error("INVALID_LLM_JSON");
  return result.message;
}

export function validateProgressPayload(value: unknown): ProgressState {
  if (!value || typeof value !== "object") throw new Error("INVALID_PROGRESS");
  const candidate = value as Partial<ProgressState> & { version?: unknown; progressVersion?: unknown };
  if (![1, 2].includes(Number(candidate.progressVersion ?? candidate.version)) || !candidate.solved || !candidate.skills || !Array.isArray(candidate.recentFingerprints)) throw new Error("INVALID_PROGRESS");
  const progress = parseProgress(JSON.stringify(value));
  if (Object.keys(progress.skills).length > curriculumById.size || progress.recentFingerprints.length > 60) throw new Error("INVALID_PROGRESS");
  return progress;
}
