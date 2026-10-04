import express from "express";
import rateLimit from "express-rate-limit";
import path from "node:path";
import fs from "node:fs";
import { scoreRequestSchema, llmScoreSchema } from "./schemas.js";
import { computeResult } from "./scoring.js";
import { buildSystemPrompt, buildUserPrompt } from "./prompt.js";
import { parseLlmJson } from "./parseLlmJson.js";
import { LlmError, type LlmClient } from "./llm/types.js";
import { demoClient } from "./llm/demo.js";

export function createApp(llm: LlmClient) {
  const app = express();

  // Gizlilik: istek gövdelerini (CV, ilan, API anahtarı) hiçbir yerde loglanmıyor.
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Maliyet ve kötüye kullanım için hız sınırı: IP başına 15 dakikada 10 istek.
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Çok fazla istek. Biraz sonra tekrar dene." },
  });

  app.post("/api/score", limiter, async (req, res) => {
    const apiKey = req.header("x-llm-api-key");
    if (!apiKey) {
      res.status(401).json({ error: "API anahtarı gerekli (x-llm-api-key)." });
      return;
    }

    const parsed = scoreRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Geçersiz istek.",
        details: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
      return;
    }

    try {
      // API anahtarı "demo" ise gerçek LLM'e gitmeden sabit bir sonuç döndürür.
      const client = apiKey === "demo" ? demoClient : llm;
      const raw = await client.complete({
        apiKey,
        system: buildSystemPrompt(parsed.data.language),
        user: buildUserPrompt(parsed.data),
      });

      let json: unknown;
      try {
        json = parseLlmJson(raw);
      } catch {
        res.status(502).json({ error: "Modelin yanıtı okunamadı." });
        return;
      }

      const checked = llmScoreSchema.safeParse(json);
      if (!checked.success) {
        res.status(502).json({ error: "Modelin yanıtı beklenen şekle uymuyor." });
        return;
      }

      res.json(computeResult(checked.data));
    } catch (err) {
      if (err instanceof LlmError) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: "Beklenmeyen bir hata oluştu." });
    }
  });

  // Üretimde derlenmiş arayüzü aynı sunucuda (frontend/dist varsa).
  const dist = path.resolve(process.cwd(), "../frontend/dist");
  if (fs.existsSync(dist)) {
    app.use(express.static(dist));
  }

  return app;
}