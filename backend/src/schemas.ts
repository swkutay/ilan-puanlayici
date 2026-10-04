import { z } from "zod";

// Kullanıcıdan gelen istek
export const scoreRequestSchema = z.object({
  cv: z.string().min(200).max(20000),
  jobPosting: z.string().min(200).max(20000),
  target: z.object({
    location: z.string().min(2).max(100),
    workMode: z.enum(["office", "hybrid", "remote", "any"]),
  }),
  exclusions: z.string().max(300).optional(),
  language: z.enum(["tr", "en"]).default("tr"),
});

export type ScoreRequest = z.infer<typeof scoreRequestSchema>;

const criterion = (max: number) =>
  z.object({
    score: z.number().int().min(0).max(max),
    reason: z.string().min(1).max(600),
  });

// Modelin döndürmesi gereken şekil. Toplam burada YOK: sunucu hesaplar.
export const llmScoreSchema = z.object({
  redLine: z.object({
    triggered: z.boolean(),
    reason: z.string().max(400),
  }),
  breakdown: z.object({
    roleFit: criterion(40),
    requirements: criterion(25),
    locationMode: criterion(15),
    company: criterion(10),
    salary: criterion(10),
  }),
  missingRequirements: z.array(z.string().max(200)).max(20),
  notes: z.string().max(1000),
});

export type LlmScore = z.infer<typeof llmScoreSchema>;
