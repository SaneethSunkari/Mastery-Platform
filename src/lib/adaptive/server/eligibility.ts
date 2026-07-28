import "server-only";

import { isDuplicateFingerprint } from "@/lib/adaptive/progress";
import { nodeEligible } from "@/lib/adaptive/scheduler";
import type { CurriculumNode, EligibilityResult, GeneratedQuestion, ProgressState, ScheduledTarget } from "@/lib/adaptive/types";

function sameSet(left: string[], right: string[]) {
  return left.length === right.length && [...left].sort().every((item, index) => item === [...right].sort()[index]);
}

function starterIsNeutral(question: GeneratedQuestion) {
  if (question.exerciseMode !== "write_from_scratch") return true;
  const code = question.starterCode.trim();
  if (question.technology === "sql") return code === "-- Write your query here";
  if (question.technology === "python") {
    const meaningful = code.split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
    return meaningful.length <= 2 && meaningful.some((line) => /^def\s+[a-z_][a-z0-9_]*\([^)]*\):$/iu.test(line)) && meaningful.every((line) => line === "pass" || /^def\s+[a-z_][a-z0-9_]*\([^)]*\):$/iu.test(line));
  }
  if (question.technology === "pyspark") return code.split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("#")).every((line) => /^result_df\s*=\s*None$/u.test(line));
  return true;
}

function starterOverlapsSolution(question: GeneratedQuestion) {
  if (question.exerciseMode !== "write_from_scratch") return false;
  const meaningfulStarter = question.starterCode.toLowerCase().replace(/--[^\n]*|#[^\n]*/gu, "").replace(/\s+/gu, " ").trim();
  if (!meaningfulStarter || meaningfulStarter === "pass" || meaningfulStarter.endsWith("= none")) return false;
  return meaningfulStarter.length >= 24 && question.referenceSolution.toLowerCase().replace(/\s+/gu, " ").includes(meaningfulStarter);
}

const lowDifficultyAdvancedTerms: Array<{ pattern: RegExp; allowed: RegExp }> = [
  { pattern: /\b(lag|lead|window function|partition by)\b/iu, allowed: /window|offset|lag|lead/iu },
  { pattern: /\b(rolling|moving average|window frame)\b/iu, allowed: /window|moving average|rolling/iu },
  { pattern: /\b(anomaly|outlier|z-score)\b/iu, allowed: /anomaly|statistical/iu },
  { pattern: /\b(recursive cte|recursion)\b/iu, allowed: /recursive/iu },
];

function hasUnrelatedAdvancedConcept(question: GeneratedQuestion, node: CurriculumNode) {
  if (question.difficulty > 2) return false;
  const content = `${question.prompt} ${question.learnerInstructions} ${question.starterCode}`;
  const selected = `${node.category} ${node.subtopic}`;
  return lowDifficultyAdvancedTerms.some(({ pattern, allowed }) => pattern.test(content) && !allowed.test(selected));
}

export function validateQuestionEligibility(question: GeneratedQuestion, learnerState: ProgressState, selectedNode: CurriculumNode, target: ScheduledTarget): EligibilityResult {
  const reasons: string[] = [];
  if (question.technology !== selectedNode.technology) reasons.push("technology mismatch");
  if (question.curriculumNodeId !== selectedNode.id) reasons.push("curriculum node mismatch");
  if (question.topic !== selectedNode.topic || question.subtopic !== selectedNode.subtopic) reasons.push("topic or subtopic mismatch");
  if (question.fingerprint.technology !== selectedNode.technology || question.fingerprint.topic !== selectedNode.topic || question.fingerprint.subtopic !== selectedNode.subtopic || question.fingerprint.difficulty !== question.difficulty) reasons.push("fingerprint metadata mismatch");
  if (question.difficulty < target.allowedDifficulty.min || question.difficulty > target.allowedDifficulty.max || question.difficulty > target.difficulty) reasons.push("difficulty outside scheduler target");
  if (!sameSet(question.prerequisiteIds, selectedNode.prerequisites)) reasons.push("prerequisite metadata mismatch");
  if (!target.diagnosticQuestion && !nodeEligible(selectedNode, learnerState)) reasons.push("prerequisites not satisfied");
  if (question.diagnosticQuestion !== target.diagnosticQuestion) reasons.push("diagnostic status mismatch");
  if ((target.diagnosticQuestion || target.difficulty <= 2) && question.exerciseMode !== "write_from_scratch") reasons.push("exercise mode inappropriate for beginner target");
  if (question.exerciseMode === "code_completion" && !/complete (?:the|this) (?:query|code|transformation)|complete the/iu.test(`${question.learnerInstructions} ${question.prompt}`)) reasons.push("code completion is not labeled");
  if (question.exerciseMode === "debugging" && !/fix (?:the|this) (?:query|code|transformation)|debug/iu.test(`${question.learnerInstructions} ${question.prompt}`)) reasons.push("debugging exercise is not labeled");
  if (!starterIsNeutral(question) || starterOverlapsSolution(question)) reasons.push("starter code reveals solution structure");
  if (hasUnrelatedAdvancedConcept(question, selectedNode)) reasons.push("unrelated advanced concept");
  if (!target.targetDimensions.every((dimension) => question.skillDimensions.includes(dimension))) reasons.push("target dimensions missing");
  if (isDuplicateFingerprint(question.fingerprint, learnerState.recentFingerprints)) reasons.push("recent duplicate");
  return reasons.length ? { eligible: false, reasons } : { eligible: true };
}
