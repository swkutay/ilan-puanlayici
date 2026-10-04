import { CRITERIA, verdictFor, type Verdict } from "./rubric.js";
import type { LlmScore } from "./schemas.js";

export interface ScoreResult {
  total: number;
  verdict: Verdict;
  breakdown: {
    key: string;
    label: string;
    score: number;
    max: number;
    reason: string;
  }[];
  redLine: LlmScore["redLine"];
  missingRequirements: string[];
  notes: string;
}

// Toplamı ve kararı modelin değil, bizim kodumuz hesaplar.
export function computeResult(llm: LlmScore): ScoreResult {
  const breakdown = CRITERIA.map((c) => ({
    key: c.key,
    label: c.label,
    max: c.max,
    score: llm.breakdown[c.key].score,
    reason: llm.breakdown[c.key].reason,
  }));

  const base = {
    breakdown,
    redLine: llm.redLine,
    missingRequirements: llm.missingRequirements,
    notes: llm.notes,
  };

  if (llm.redLine.triggered) {
    return { ...base, total: 0, verdict: "elendi" };
  }

  const total = breakdown.reduce((sum, b) => sum + b.score, 0);
  return { ...base, total, verdict: verdictFor(total) };
}
