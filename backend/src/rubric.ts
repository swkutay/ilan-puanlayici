// Puanlama kuralları. Üst sınırlar burada sabit: model bunları aşamaz.
export const CRITERIA = [
  { key: "roleFit", label: "Rol ve sorumluluk", max: 40 },
  { key: "requirements", label: "Zorunlu gereksinimler", max: 25 },
  { key: "locationMode", label: "Konum ve çalışma biçimi", max: 15 },
  { key: "company", label: "Sektör ve şirket", max: 10 },
  { key: "salary", label: "Maaş", max: 10 },
] as const;

export type CriterionKey = (typeof CRITERIA)[number]["key"];

export const THRESHOLDS = { apply: 70, borderline: 55 } as const;

export type Verdict = "basvur" | "sinirda" | "atla" | "elendi";

export function verdictFor(total: number): Verdict {
  if (total >= THRESHOLDS.apply) return "basvur";
  if (total >= THRESHOLDS.borderline) return "sinirda";
  return "atla";
}
