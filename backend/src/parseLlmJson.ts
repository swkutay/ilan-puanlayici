// Model bazen JSON'u ```json bloğu içinde döndürür. Güvenli şekilde ayıklarız.
export function parseLlmJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("JSON bulunamadı");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}
