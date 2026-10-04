import { useState, type FormEvent } from "react";
import { scoreJob, type ScoreResult, type WorkMode } from "./api";

const VERDICT_TEXT: Record<ScoreResult["verdict"], string> = {
  basvur: "Başvurmaya değer",
  sinirda: "Sınırda",
  atla: "Atla",
  elendi: "Elendi (kırmızı çizgi)",
};

const KEY_STORAGE = "ilan-puanlayici-api-key";

function readSavedKey(): string {
  try {
    return sessionStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

export default function App() {
  const [apiKey, setApiKey] = useState(readSavedKey);
  const [cv, setCv] = useState("");
  const [jobPosting, setJobPosting] = useState("");
  const [location, setLocation] = useState("İstanbul");
  const [workMode, setWorkMode] = useState<WorkMode>("hybrid");
  const [exclusions, setExclusions] = useState("");
  const [language, setLanguage] = useState<"tr" | "en">("tr");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScoreResult | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      try {
        sessionStorage.setItem(KEY_STORAGE, apiKey);
      } catch {
        /* depolama kapalıysa anahtar sadece bellekte kalır */
      }
      const r = await scoreJob({
        cv,
        jobPosting,
        location,
        workMode,
        exclusions,
        language,
        apiKey,
      });
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <header className="head">
        <h1>İlan Puanlayıcı</h1>
        <p>
          CV'ni ve bir iş ilanını yapıştır, ilanın sana ne kadar uyduğunu 100
          üzerinden gör.
        </p>
      </header>

      <div className="layout">
        <form className="panel" onSubmit={onSubmit}>
          <label>
            API anahtarın
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
              required
            />
            <span className="hint">
              Anahtar sunucuda saklanmaz, yalnızca bu sekmede tutulur ve
              puanlama isteğiyle sağlayıcıya iletilir.
            </span>
          </label>

          <label>
            CV'n (metin olarak yapıştır)
            <textarea
              value={cv}
              onChange={(e) => setCv(e.target.value)}
              rows={9}
              required
            />
          </label>

          <label>
            İş ilanı (metin olarak yapıştır)
            <textarea
              value={jobPosting}
              onChange={(e) => setJobPosting(e.target.value)}
              rows={9}
              required
            />
          </label>

          <div className="row">
            <label>
              Hedef konum
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </label>
            <label>
              Çalışma biçimi
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
              >
                <option value="office">Ofis</option>
                <option value="hybrid">Hibrit</option>
                <option value="remote">Uzaktan</option>
                <option value="any">Fark etmez</option>
              </select>
            </label>
          </div>

          <label>
            Başvurmak istemediğin şirket türleri (isteğe bağlı)
            <input
              value={exclusions}
              onChange={(e) => setExclusions(e.target.value)}
              maxLength={300}
            />
          </label>

          <label>
            Gerekçe dili
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "tr" | "en")}
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Puanlanıyor..." : "Puanla"}
          </button>

          <p className="hint">
            CV'n ve ilan kaydedilmez ve loglanmaz. Yine de kişisel bilgilerini
            (telefon, adres) yapıştırmadan önce çıkarmanı öneririz.
          </p>
        </form>

        <section className="panel result" aria-live="polite">
          {error && <p className="error">{error}</p>}

          {!error && !result && !loading && (
            <p className="empty">
              Formu doldurup "Puanla"ya bas, sonuç burada görünecek.
            </p>
          )}

          {loading && <p className="empty">Puanlanıyor...</p>}

          {result && (
            <>
              <div className={`verdict v-${result.verdict}`}>
                <span className="total">{result.total}</span>
                <span className="of">/ 100</span>
                <span className="vtext">{VERDICT_TEXT[result.verdict]}</span>
              </div>

              {result.redLine.triggered && (
                <p className="error">Kırmızı çizgi: {result.redLine.reason}</p>
              )}

              <ul className="criteria">
                {result.breakdown.map((c) => (
                  <li key={c.key}>
                    <div className="crow">
                      <span>{c.label}</span>
                      <span>
                        {c.score}/{c.max}
                      </span>
                    </div>
                    <div className="bar">
                      <div
                        className="fill"
                        style={{ width: `${(c.score / c.max) * 100}%` }}
                      />
                    </div>
                    <p className="reason">{c.reason}</p>
                  </li>
                ))}
              </ul>

              {result.missingRequirements.length > 0 && (
                <div className="missing">
                  <h2>Eksik zorunlu maddeler</h2>
                  <ul>
                    {result.missingRequirements.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.notes && <p className="notes">{result.notes}</p>}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
