# İlan Puanlayıcı

CV'ni ve bir iş ilanını yapıştır, ilanın sana ne kadar uyduğunu 100 üzerinden gör.
Sonuç: 5 kriterin puanı ve gerekçesi, eksik zorunlu maddeler ve bir karar
(başvur / sınırda / atla / elendi).

Herkes kendi CV'siyle kullanabilir. LLM çağrısı için **kullanıcı kendi API
anahtarını girer**; anahtar sunucuda saklanmaz.

## Puanlama sistemi (100 puan)

| Kriter | Üst sınır |
|---|---|
| Rol ve sorumluluk | 40 |
| Zorunlu gereksinimler | 25 |
| Konum ve çalışma biçimi | 15 |
| Sektör ve şirket | 10 |
| Maaş (belirtilmemişse nötr 5) | 10 |

Karar eşikleri: 70 ve üzeri başvur, 55-69 sınırda, 55 altı atla.
Kırmızı çizgi (ilan CV ile doğrudan çelişiyorsa) toplamı 0 yapar.
Kural: CV'de olmayan hiçbir beceri adaya atfedilmez.

## Klasör yapısı ve neden böyle

```
backend/
  src/rubric.ts        Kriterler, üst sınırlar, eşikler. Kuralların tek kaynağı.
  src/schemas.ts       zod şemaları: gelen istek ve modelin döndürmesi gereken şekil.
  src/scoring.ts       Toplam ve kararı HESAPLAR (model değil, sunucu).
  src/prompt.ts        Modele giden talimat ve kullanıcı mesajı.
  src/parseLlmJson.ts  Modelin çıktısından JSON'u güvenli şekilde ayıklar.
  src/llm/types.ts     LlmClient arayüzü. Sağlayıcıyı değiştirmek için.
  src/llm/anthropic.ts Anthropic uygulaması (fetch ile, SDK yok).
  src/app.ts           Express uygulaması: rota, hız sınırı, doğrulama.
  src/index.ts         Sunucuyu başlatır.
  test/                vitest + supertest testleri (gerçek LLM çağrısı yok).
frontend/              React + Vite arayüzü.
.github/workflows/     GitHub Actions: tip kontrolü, test, build.
```

## Tasarım kararları

- **Toplamı model hesaplamaz.** Model sadece 5 kriter puanını verir, toplamı ve
  kararı `scoring.ts` hesaplar. Model "toplam 100" desen bile yok sayılır
  (testi: `test/app.test.ts`).
- **Üst sınırlar kodda sabit.** Model bir kriterde sınırı aşarsa çıktı reddedilir
  (zod şeması).
- **Prompt injection'a karşı:** CV ve ilan `<cv>` / `<ilan>` etiketleri içinde
  "veri" olarak verilir, talimat olarak değil; çıktı şemayla doğrulanır.
  Bu tam bir koruma değildir, riski azaltır.
- **Maliyet:** Herkes kendi API anahtarını getirir, ayrıca IP başına
  15 dakikada 10 istek sınırı vardır ve gövde 100 KB ile sınırlıdır.
- **Gizlilik:** CV, ilan ve API anahtarı kaydedilmez ve loglanmaz. CV kişisel
  veridir; yayına almadan önce KVKK gereklerini kontrol et.
- **Sağlayıcıdan bağımsız:** `LlmClient` arayüzü sayesinde başka bir sağlayıcı
  eklemek için sadece yeni bir dosya yazarsın (`src/llm/`).

## Çalıştırma

Node 20 veya üstü gerekir.

```bash
# 1) Backend
cd backend
npm install
npm run dev          # http://localhost:3000

# 2) Frontend (ayrı terminal)
cd frontend
npm install
npm run dev          # http://localhost:5173 (/api isteklerini 3000'e yönlendirir)
```

Testler:

```bash
cd backend
npm test
npm run typecheck
```

Üretim gibi tek sunucuda çalıştırmak için:

```bash
cd frontend && npm run build
cd ../backend && npm run build && npm start   # arayüzü de 3000'den sunar
```

Model adı: varsayılan `claude-haiku-4-5-20251001`. Değiştirmek için
`LLM_MODEL` ortam değişkenini ayarla. Model adlarının güncel listesini
sağlayıcının dokümantasyonundan kontrol et.

## Bilinen sınırlar (dürüst liste)

- Gerçek bir LLM çağrısı bu repoda otomatik test edilmedi; testler sahte
  (fake) istemci kullanır. Kendi API anahtarınla bir kez elle dene.
- GitHub Actions dosyası standart bir şablondur, ilk push'ta çalışıp
  çalışmadığına bakman gerekir.
- Arayüz CV'yi yalnızca metin olarak alır (PDF yükleme yok).
- Hız sınırı IP başınadır ve bellekte tutulur; sunucu yeniden başlarsa sıfırlanır.
- Puan, bir dil modelinin yorumudur; kesin sonuç değil, karar desteğidir.
