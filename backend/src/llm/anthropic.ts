import { LlmError, type LlmClient } from "./types.js";

// Model adını LLM_MODEL ortam değişkeniyle değiştirebilirsin.
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

export function createAnthropicClient(
  model: string = process.env.LLM_MODEL ?? DEFAULT_MODEL,
): LlmClient {
  return {
    async complete({ apiKey, system, user }) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1500,
          system,
          messages: [{ role: "user", content: user }],
        }),
      });

      if (res.status === 401 || res.status === 403) {
        throw new LlmError("API anahtarı geçersiz ya da yetkisiz.", 401);
      }
      if (res.status === 429) {
        throw new LlmError("Sağlayıcı istek sınırına ulaşıldı. Biraz bekle.", 429);
      }
      if (!res.ok) {
        throw new LlmError("LLM sağlayıcısı hata döndürdü.", 502);
      }

      const data = (await res.json()) as {
        content?: { type: string; text?: string }[];
      };
      const text = data.content?.find((c) => c.type === "text")?.text;
      if (!text) throw new LlmError("LLM boş yanıt döndürdü.", 502);
      return text;
    },
  };
}
