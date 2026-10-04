import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { LlmError, type LlmClient } from "../src/llm/types.js";
import { validBody } from "./helpers.js";

// Gerçek LLM istemcisi çağrılırsa test başarısız olsun
const failingLlm: LlmClient = {
  complete: async () => {
    throw new LlmError("Gerçek LLM çağrılmamalıydı.", 500);
  },
};

describe("demo modu", () => {
  it('API anahtarı "demo" ise gerçek LLM çağrılmadan 71 döner', async () => {
    const res = await request(createApp(failingLlm))
      .post("/api/score")
      .set("x-llm-api-key", "demo")
      .send(validBody);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(71);
    expect(res.body.verdict).toBe("basvur");
  });

  it('API anahtarı "demo" değilse gerçek istemci kullanılır', async () => {
    const res = await request(createApp(failingLlm))
      .post("/api/score")
      .set("x-llm-api-key", "baska-anahtar")
      .send(validBody);
    expect(res.status).toBe(500);
  });
});