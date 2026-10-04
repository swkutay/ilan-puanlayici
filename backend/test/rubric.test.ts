import { describe, it, expect } from "vitest";
import { CRITERIA, verdictFor } from "../src/rubric.js";

describe("rubric", () => {
  it("kriter üst sınırlarının toplamı 100", () => {
    const total = CRITERIA.reduce((s, c) => s + c.max, 0);
    expect(total).toBe(100);
  });

  it("eşik değerlerine göre karar verir", () => {
    expect(verdictFor(70)).toBe("basvur");
    expect(verdictFor(69)).toBe("sinirda");
    expect(verdictFor(55)).toBe("sinirda");
    expect(verdictFor(54)).toBe("atla");
  });
});
