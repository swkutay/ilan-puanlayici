import type { LlmClient } from "./types.js";
import type { LlmScore } from "../schemas.js";

const DEMO_RESULT: LlmScore = {
  redLine: { triggered: false, reason: "" },
  breakdown: {
    roleFit: {
      score: 30,
      reason: "İlan yeni mezun odaklı ve React/TypeScript deneyimiyle örtüşüyor.",
    },
    requirements: {
      score: 17,
      reason: "Zorunlu maddelerin çoğu karşılanıyor, Node.js yalnızca artı olarak geçiyor.",
    },
    locationMode: {
      score: 15,
      reason: "İstanbul ve hibrit çalışma hedefinle uyuşuyor.",
    },
    company: {
      score: 4,
      reason: "Şirket ilandan tanınamıyor, küçük ekip olarak düşük puan verildi.",
    },
    salary: {
      score: 5,
      reason: "Maaş belirtilmemiş, nötr puan.",
    },
  },
  missingRequirements: [],
  notes: "Bu bir demo sonucudur, gerçek bir puanlama değildir.",
};

export const demoClient: LlmClient = {
  async complete() {
    return JSON.stringify(DEMO_RESULT);
  },
};