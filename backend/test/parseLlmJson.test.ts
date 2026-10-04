import { describe, it, expect } from "vitest";
import { parseLlmJson } from "../src/parseLlmJson.js";

describe("parseLlmJson", () => {
  it("düz JSON'u okur", () => {
    expect(parseLlmJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("```json bloğunu ayıklar", () => {
    expect(parseLlmJson('Merhaba\n```json\n{"a":2}\n```')).toEqual({ a: 2 });
  });

  it("JSON yoksa hata fırlatır", () => {
    expect(() => parseLlmJson("sadece metin")).toThrow();
  });
});
