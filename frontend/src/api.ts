export type WorkMode = "office" | "hybrid" | "remote" | "any";

export interface ScoreInput {
  cv: string;
  jobPosting: string;
  location: string;
  workMode: WorkMode;
  exclusions: string;
  language: "tr" | "en";
  apiKey: string;
}

export interface CriterionResult {
  key: string;
  label: string;
  score: number;
  max: number;
  reason: string;
}

export interface ScoreResult {
  total: number;
  verdict: "basvur" | "sinirda" | "atla" | "elendi";
  breakdown: CriterionResult[];
  redLine: { triggered: boolean; reason: string };
  missingRequirements: string[];
  notes: string;
}

export async function scoreJob(input: ScoreInput): Promise<ScoreResult> {
  const res = await fetch("/api/score", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-llm-api-key": input.apiKey,
    },
    body: JSON.stringify({
      cv: input.cv,
      jobPosting: input.jobPosting,
      target: { location: input.location, workMode: input.workMode },
      exclusions: input.exclusions || undefined,
      language: input.language,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = Array.isArray(data.details)
      ? data.details
          .map((d: { path: string; message: string }) => `${d.path}: ${d.message}`)
          .join(" | ")
      : "";
    throw new Error([data.error ?? "Bir hata oluştu.", detail].filter(Boolean).join(" "));
  }
  return data as ScoreResult;
}
