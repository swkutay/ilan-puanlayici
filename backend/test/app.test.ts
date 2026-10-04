import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { LlmError, type LlmClient } from "../src/llm/types.js";
import { goodLlmScore, validBody } from "./helpers.js";

const fakeLlm = (reply: string): LlmClient => ({
  complete: async () => reply,
});

describe("POST /api/score", () => {
  it("geçerli istekte puanı döndürür", async () => {
    const app = createApp(fakeLlm(JSON.stringify(goodLlmScore)));
    const res = await request(app)
      .post("/api/score")
      .set("x-llm-api-key", "test-key")
      .send(validBody);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(58);
    expect(res.body.verdict).toBe("sinirda");
  });

  it("API anahtarı yoksa 401", async () => {
    const app = createApp(fakeLlm("{}"));
    const res = await request(app).post("/api/score").send(validBody);
    expect(res.status).toBe(401);
  });

  it("geçersiz gövdede 400", async () => {
    const app = createApp(fakeLlm("{}"));
    const res = await request(app)
      .post("/api/score")
      .set("x-llm-api-key", "test-key")
      .send({ cv: "çok kısa" });
    expect(res.status).toBe(400);
  });

  it("model şemaya uymayan çıktı verirse 502", async () => {
    const app = createApp(fakeLlm('{"total": 100}'));
    const res = await request(app)
      .post("/api/score")
      .set("x-llm-api-key", "test-key")
      .send(validBody);
    expect(res.status).toBe(502);
  });

  it("modelin uydurduğu toplamı yok sayar", async () => {
    const tricked = { ...goodLlmScore, total: 100, verdict: "basvur" };
    const app = createApp(fakeLlm(JSON.stringify(tricked)));
    const res = await request(app)
      .post("/api/score")
      .set("x-llm-api-key", "test-key")
      .send(validBody);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(58);
  });

  it("sağlayıcı anahtarı reddederse 401 döner", async () => {
    const llm: LlmClient = {
      complete: async () => {
        throw new LlmError("API anahtarı geçersiz ya da yetkisiz.", 401);
      },
    };
    const res = await request(createApp(llm))
      .post("/api/score")
      .set("x-llm-api-key", "bad-key")
      .send(validBody);
    expect(res.status).toBe(401);
  });
});

describe("GET /health", () => {
  it("ok döner", async () => {
    const res = await request(createApp(fakeLlm("{}"))).get("/health");
    expect(res.body).toEqual({ status: "ok" });
  });
});
