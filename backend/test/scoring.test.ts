import { describe, it, expect } from "vitest";
import { computeResult } from "../src/scoring.js";
import { llmScoreSchema } from "../src/schemas.js";
import { goodLlmScore } from "./helpers.js";

describe("computeResult", () => {
  it("toplamı sunucu hesaplar (24+5+15+9+5 = 58)", () => {
    const r = computeResult(goodLlmScore);
    expect(r.total).toBe(58);
    expect(r.verdict).toBe("sinirda");
  });

  it("kırmızı çizgi tetiklenirse 0 ve elendi", () => {
    const r = computeResult({
      ...goodLlmScore,
      redLine: { triggered: true, reason: "Hâlâ öğrenci olmalı" },
    });
    expect(r.total).toBe(0);
    expect(r.verdict).toBe("elendi");
  });
});

describe("llmScoreSchema", () => {
  it("kriter üst sınırını aşan puanı reddeder", () => {
    const bad = {
      ...goodLlmScore,
      breakdown: {
        ...goodLlmScore.breakdown,
        roleFit: { score: 45, reason: "x" },
      },
    };
    expect(llmScoreSchema.safeParse(bad).success).toBe(false);
  });

  it("geçerli çıktıyı kabul eder", () => {
    expect(llmScoreSchema.safeParse(goodLlmScore).success).toBe(true);
  });
});
