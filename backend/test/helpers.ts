import type { LlmScore } from "../src/schemas.js";

export const goodLlmScore: LlmScore = {
  redLine: { triggered: false, reason: "" },
  breakdown: {
    roleFit: { score: 24, reason: "Örnek gerekçe" },
    requirements: { score: 5, reason: "Örnek gerekçe" },
    locationMode: { score: 15, reason: "Örnek gerekçe" },
    company: { score: 9, reason: "Örnek gerekçe" },
    salary: { score: 5, reason: "Örnek gerekçe" },
  },
  missingRequirements: ["Node.js", "Otomatik test"],
  notes: "Örnek not",
};

export const longText = "Lorem ipsum dolor sit amet. ".repeat(20);

export const validBody = {
  cv: longText,
  jobPosting: longText,
  target: { location: "İstanbul", workMode: "hybrid" as const },
};
