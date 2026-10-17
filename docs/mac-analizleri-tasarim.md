# Maç Analizleri Ekranı: Yazılım Tasarımı

> Durum: taslak · Tarih: 17 Ekim 2026 · Kapsam: siteye `/analiz` sekmesi ve her hafta otomatik güncellenen futbol analizleri

## 1. Özet

Siteye **"Analiz"** adında yeni bir sekme eklenir. Odak lig **Süper Lig**. Büyük Avrupa ligleri sonradan eklenebilir.

Veriyi sayfalar canlı olarak çekmez. Bir **GitHub Actions** görevi her gün veriyi çeker, analizleri hesaplar ve sonucu JSON olarak repoya commit'ler. Vercel her commit'te yeniden derler ve sayfalar bu JSON'lardan statik olarak oluşur.

Bu yaklaşımın faydaları:

- **API anahtarı tarayıcıya hiç gitmez.** Anahtarlar GitHub Secrets'ta durur.
- **Kaynak çökerse site çökmez.** Veri kaynağı bozulursa site son veriyle açık kalır. Bozulan şey sadece günlük görev olur ve bunu e-postayla haber verir.
- **Haftalık geçmiş kendiliğinden birikir.** Her haftanın verisi git geçmişinde saklanır. "Geçen haftaya göre değişim", tahmin başarısı takibi ve bump chart bu geçmişten çıkar.
- **İstek sayısı çok düşük kalır.** Günde birkaç istek atılır; bu da kaynakların kullanım koşullarına saygılı bir yük demektir.

## 2. Ücretsiz veri kaynakları

Araştırma tarihi 17 Ekim 2026. ESPN uç noktaları ayrıca elle test edildi.

**Ana sonuç:** Güncel Süper Lig sezonunu ücretsiz ve resmi olarak derinlemesine veren bir API yok.

- football-data.org Süper Lig'i ücretli pakete (€99/ay) koymuş.
- API-Football'un ücretsiz planı yalnızca 2022–2024 sezonlarını açıyor.
- TheSportsDB'nin ücretsiz anahtarı yanıtları birkaç satırla kısıtlıyor.
- Süper Lig için pratikteki en iyi seçenek **ESPN'in belgelenmemiş JSON uç noktaları**.

| Kaynak | Ne verir | Süper Lig | Ücretsiz sınır / not | Kullanım önerisi |
|---|---|---|---|---|
| **ESPN** (resmi olmayan) | Fikstür, skor, puan durumu, maç istatistikleri, olaylar, kadrolar | ✅ 2025-26 ve 2026-27 | Anahtar gerektirmiyor. Belgelenmemiş, haber vermeden değişebilir. | **Faz 1'in ana kaynağı** |
| football-data.org | Fikstür, skor, puan durumu, gol krallığı | ❌ (ücretli) | 12 lig, dakikada 10 istek. Sayfada atıf metni zorunlu. | Faz 3, Avrupa ligleri |
| StatsBomb Open Data | Tam olay verisi: xG, pas, şut koordinatları, 360 | ❌ (ama Euro 2024'te Türkiye maçları var) | Tarihsel veri. StatsBomb'a atıf ve logo zorunlu. | Faz 3 vitrin analizleri |
| football-data.co.uk | Sonuç, şut, korner ve oran CSV'leri | ✅ 1999'dan bugüne | **Türkiye'den erişim engelli** (bahis sitesi). GitHub runner'ı yurt dışında olduğu için oradan erişilebilir. | Geçmiş sezonlarla backtest |
| ClubElo | Günlük Elo puanları, maç olasılıkları | ✅ | Test sırasında 502 hatası ve boş yanıt döndü, kararsız. | Kıyaslama için, opsiyonel |
| Understat | Şut bazlı xG (koordinatlı) | ❌ (yalnız büyük 5 lig ve Rusya) | Kazıma gerekiyor, kullanım koşulları belirsiz. | Faz 3, dikkatli |
| API-Football | Her şey | Güncel sezon ücretli | Günde 100 istek, 2022–2024 sezonları. | Gerekirse ücretli plana geçiş yolu |
| FBref | Temel istatistikler | ✅ | Ocak 2026'da Opta ileri verisini (xG vb.) kaybetti. Dakikada en fazla 10 istek. | Önerilmez |
| FotMob / SofaScore / Transfermarkt | Zengin veri | ✅ | Kullanım koşulları toplu çekmeyi yasaklıyor ya da bot engeli var. | **Kullanma** |
| openfootball, OpenLigaDB | Sadece skor | ❌ | CC0 / ODbL | Gerek yok |

### ESPN'den gelen veri (elle doğrulandı)

- **Skor tablosu:** `site.api.espn.com/apis/site/v2/sports/soccer/tur.1/scoreboard?dates=2026&limit=400`
  - Bir takvim yılındaki bütün maçları döndürür. Testte 297 maç geldi: 2025-26 sezonundan 153, 2026-27 sezonundan 144.
  - Tarih aralığı parametresi (`dates=20260901-20260930`) boş döndü. **Yılı tek parametre olarak kullanmak gerekiyor.**
  - **Hafta (round) numarası verilmiyor.** Hafta numarasını tarih pencerelerinden türetmek gerekiyor; bkz. §6.
- **Maç özeti:** `site.web.api.espn.com/apis/site/v2/sports/soccer/tur.1/summary?event=<id>`
  - Takım istatistikleri (`boxscore.teams[].statistics`): topla oynama, şut, isabetli şut, engellenen şut, korner, faul, sarı/kırmızı kart, ofsayt, kurtarış, pas sayısı ve isabeti, top kapma.
  - `keyEvents`: gol, kart ve oyuncu değişikliği; dakika ve oyuncu bilgisiyle.
  - `rosters`: oyuncu bazlı gol, asist, şut ve kart.
- **Puan durumu:** `site.api.espn.com/apis/v2/sports/soccer/tur.1/standings` (18 takım, `rank`, `rankChange` ve `ppg` dahil)
- **ESPN'de olmayanlar:** Süper Lig için **xG, şut koordinatı ve pas haritası yok**. Maç anlatımı da sadece gol ve kart satırlarından ibaret.
- **Sonuç:** Süper Lig'de sonuç ve maç istatistiği analizleri yapılabilir. Olay verisi gerektiren analizler (xG, şut haritası) ancak StatsBomb vitrin içeriğiyle yapılabilir.

## 3. Hangi analizler yapılır?

Analizler gerektirdikleri veriye göre katmanlara ayrıldı. ✅ işareti, ücretsiz veriyle Süper Lig için yapılabilir demek.

### Katman 1: Yalnızca skor ve fikstür

| Analiz | Ne anlatır | Görsel | Zorluk | Süper Lig |
|---|---|---|---|---|
| Form tablosu | Son 5 maç G/B/M ve puan | Renkli G/B/M rozetleri | Kolay | ✅ |
| İç saha / deplasman ayrımı | Ayrı puan tabloları | Yan yana çubuklar | Kolay | ✅ |
| Maç başı puan trendi | Kayan ortalama | Çizgi grafik | Kolay | ✅ |
| Sıralama değişimi | Her haftadan sonraki sıra | **Bump chart** | Kolay | ✅ |
| Elo puanı | Her maçtan sonra güncellenen güç puanı | Puan çizgisi, "haftanın en çok yükselenleri" | Orta | ✅ |
| Poisson skor tahmini | Hücum ve savunma gücünden skor olasılıkları | Skor ısı haritası, G/B/M çubuğu | Orta | ✅ |
| Fikstür zorluğu | Oynanan ve kalan rakiplerin ortalama Elo'su | Isı şeridi | Kolay-orta | ✅ |
| Monte Carlo sezon simülasyonu | Kalan maçları 10.000 kez oynatıp şampiyonluk, Avrupa ve düşme olasılığı | Olasılık tablosu, sıra dağılımı | Orta | ✅ |

### Katman 2: Maç istatistikleri (şut, isabetli şut, topla oynama, korner, kart)

| Analiz | Tanım | Görsel | Süper Lig |
|---|---|---|---|
| **TSR** (Total Shots Ratio) | Atılan şut / (atılan + yenen şut). Puanlarla güçlü ilişkili; Premier Lig'de puan farklarının yaklaşık %68'ini açıklıyor. | TSR–puan saçılım grafiği | ✅ |
| **SoTR** | TSR'nin isabetli şutlarla hesaplanan hâli | Sıralama | ✅ |
| **PDO** | 1000 × (isabetli şutların gole dönme oranı + kurtarış oranı). 1000'in üstü "şanslı" sayılır ve zamanla ortalamaya döner. | **TSR × PDO dörtlüğü** (baskınlık × şans) | ✅ |
| Maç istatistiği karşılaştırması | Şut, isabetli şut, topla oynama, korner, faul, kart | Ayna çubuklar | ✅ |
| Disiplin ve korner trendleri | Maç başı ortalamalar | Küçük çoklu grafikler | ✅ |
| Gol zaman çizelgesi | Gollerin ve kartların dakikası | Yatay zaman şeridi | ✅ |

### Katman 3: Olay verisi (StatsBomb açık veri)

Bu katman Süper Lig için ❌. Vitrin sayfalarında kullanılır; örneğin Euro 2024'teki Türkiye maçları.

| Analiz | Tanım | Görsel |
|---|---|---|
| xG ve **xG yarış grafiği** | Her şutun gol olma olasılığı; dakikaya göre birikimli toplam | Basamak grafik |
| **Şut haritası** | Şutun yeri; nokta boyutu xG, renk sonuç | Yarım saha |
| **Pas ağı** | Oyuncuların ortalama konumları ve aralarındaki pas sayısı | Saha üstünde ağ |
| PPDA | Rakibin kendi %60'lık alanındaki pasları / bizim o alandaki savunma aksiyonlarımız. Düşük değer yoğun pres demek. | Çubuk, trend |
| Field tilt | Son üçte birlik bölgedeki pas payı | Bölge çubuğu |
| xT (Karun Singh) | 16×12 ızgarada topu ilerletmenin değeri | Izgara ısı haritası |
| VAEP (socceraction) | Her aksiyonun gol atma ve yeme olasılığına etkisi | Aksiyon sıralaması |

### Katman 4: Bahis oranları

Atlanması önerilir. Türkiye'de bahis içeriği hassas ve football-data.co.uk ülkeden erişilemiyor. İleride eklenecekse bahis şirketi adı ve bağlantısı olmadan, sadece "model ve piyasa olasılığı karşılaştırması" olarak eklenmeli.

### Katman 5: Oyuncu düzeyi

- ESPN kadro verisinden 90 dakika başına gol, asist ve şut çıkarılabilir. Oynanan dakika verisi değişikliklerden türetilmeli.
- Radar ve pizza grafiği için yeterince zengin ücretsiz Süper Lig verisi yok.
- Faz 3'te StatsBomb verisiyle yapılabilir.

## 4. Mimari

```
            (her gün 05:00 UTC + elle tetikleme)
┌──────────────────────── GitHub Actions ─────────────────────────┐
│                                                                 │
│  fetch ──► normalize ──► models ──► snapshot ──► git commit     │
│  ESPN       ortak         Elo,       hafta        yalnızca      │
│  (+ ileride  şema          Poisson,   JSON'ları    değişiklik    │
│  fd.org)    (Match,       Monte      data/analiz/ varsa         │
│             Team)         Carlo,                                │
│                           metrikler                             │
└─────────────────────────────────────────────────────────────────┘
                                   │ push
                                   ▼
┌──────────────────────── Vercel (next build) ────────────────────┐
│  app/analiz/** sunucu bileşenleri JSON'u fs ile okur            │
│  generateStaticParams → her hafta ve maç için statik sayfa      │
│  Etkileşimli grafikler küçük 'use client' SVG bileşenleri       │
└─────────────────────────────────────────────────────────────────┘
```

### Kararlar

- **Dil TypeScript.** Hesaplama (Elo, Poisson, simülasyon) basit matematik; Python'a gerek yok. Pipeline ile arayüz **aynı tip tanımlarını** kullanır. Betikler `npx tsx` ile çalışır.
  - Python (statsbombpy, mplsoccer, penaltyblog) yalnızca Faz 3'teki StatsBomb vitrini için, ayrı bir betik olarak devreye girer.
- **Grafikler el yazımı SVG React bileşenleri.**
  - Gerekçeler: sitenin koyu temasına uyar, paket yükü küçük kalır, saha çizimi zaten özel bir bileşen gerektirir.
  - Gerekirse yalnızca `d3-scale` ve `d3-shape` eklenir. Recharts gibi büyük kütüphanelere gerek yok.
- **Alternatif ISR, ama önerilmez.** Sayfalarda `fetch(..., { next: { revalidate: 3600 } })` ile çalışma zamanında veri çekmek de mümkün. Ama bu yaklaşım geçmiş haftaları saklamaz (tahmin takibi yapılamaz), siteyi ESPN'in o anki durumuna bağlar ve Vercel'e özeldir.
- **Tahminler maçtan önce dondurulur.** Bir haftanın tahminleri, o hafta başlamadan commit'lenen snapshot'tan okunur. Git commit zamanı, tahminin maçtan önce yapıldığının kanıtı olur. Model başarısı (RPS) bu dondurulmuş tahminlerle ölçülür.

## 5. Dosya yapısı

```
data/analiz/                          # pipeline çıktısı (commit'lenir, elle düzenlenmez)
  index.json                          # ligler, sezonlar, son hafta, güncellenme zamanı
  super-lig/2026-27/
    teams.json
    matches.json                      # bütün fikstür ve sonuçlar (normalize)
    matches/<id>.json                 # maç detayı: istatistikler, olaylar
    rounds/09.json                    # hafta snapshot'ı (bkz. §6)
    notes/09.md                       # (opsiyonel) senin haftalık yorumun
  config/super-lig.json               # takım sayısı, Avrupa ve düşme kontenjanları, Elo parametreleri

scripts/analiz/
  sources/espn.ts                     # ham çekme ve önbellek (biten maçı tekrar çekmez)
  sources/football-data-org.ts        # Faz 3
  normalize.ts                        # ESPN → Match/Team
  rounds.ts                           # hafta numarası türetme
  models/elo.ts
  models/poisson.ts
  models/simulate.ts                  # Monte Carlo
  models/metrics.ts                   # form, TSR, SoTR, PDO, maç başı puan
  evaluate.ts                         # RPS/Brier takibi
  build.ts                            # orkestrasyon: npx tsx scripts/analiz/build.ts
  backtest.ts                         # parametre ayarı (2025-26 sezonu üzerinde)

app/analiz/
  page.tsx                            # son haftaya yönlendirir ya da özetini gösterir
  [lig]/[sezon]/hafta/[hafta]/page.tsx
  mac/[id]/page.tsx
  takim/[slug]/page.tsx               # Faz 2
  metodoloji/page.tsx                 # yöntem, kaynaklar, atıflar
  _components/                        # PitchSvg, StatBars, BumpChart, EloLine, ProbBar,
                                      # ScoreHeatmap, QuadrantScatter, FormPills, DataAttribution
app/data/analiz/
  types.ts                            # ortak tipler (pipeline da import eder)
  load.ts                             # fs ile JSON okuma (yalnız sunucu)

.github/workflows/mac-analizi.yml
```

`NavTabs.tsx` dosyasında küçük bir değişiklik gerekiyor:

- Şu an `grid-cols-2` ve kayan göstergedeki `w-1/2` sabit yazılmış.
- Üçüncü sekme ("Analiz", `path.startsWith('/analiz')`) eklenince bunlar `tabs.length` değerinden hesaplanmalı.

## 6. Veri modeli

```ts
// app/data/analiz/types.ts
export type LeagueId = 'super-lig' | 'premier-league' | 'la-liga' /* … */;

export type Team = {
  id: string;            // kendi kimliğimiz, kaynak kimliğinden bağımsız
  slug: string;          // 'trabzonspor'
  name: string;
  shortName: string;     // 'TS'
  sourceIds: { espn?: string; footballDataOrg?: number };
};

export type TeamMatchStats = {
  possession: number; shots: number; shotsOnTarget: number; blockedShots: number;
  corners: number; fouls: number; yellow: number; red: number; offsides: number;
  saves: number; passes: number; passAccuracy: number; tackles: number;
};

export type MatchEvent = {
  minute: number; addedTime?: number;
  type: 'goal' | 'ownGoal' | 'penaltyGoal' | 'penaltyMiss' | 'yellow' | 'red' | 'sub';
  teamId: string; player?: string; assist?: string;
};

export type Match = {
  id: string; league: LeagueId; season: string; round: number;
  kickoff: string;                    // ISO, UTC
  status: 'scheduled' | 'live' | 'finished' | 'postponed';
  homeId: string; awayId: string;
  score?: { home: number; away: number };
  stats?: { home: TeamMatchStats; away: TeamMatchStats };
  events?: MatchEvent[];
  source: 'espn' | 'football-data-org';
  fetchedAt: string;
};

export type Prediction = {
  matchId: string; model: string;     // 'poisson-v1'
  pHome: number; pDraw: number; pAway: number;
  xgHome: number; xgAway: number;     // modelin beklediği gol (λ)
  scoreGrid?: number[][];             // 0–5 × 0–5
  frozenAt: string;
};

export type RoundSnapshot = {
  league: LeagueId; season: string; round: number; generatedAt: string;
  table: Array<{ teamId: string; rank: number; played: number; w: number; d: number; l: number;
                 gf: number; ga: number; pts: number; form: ('W'|'D'|'L')[]; rankChange: number }>;
  elo: Array<{ teamId: string; rating: number; delta: number }>;
  metrics: Array<{ teamId: string; tsr: number; sotr: number; pdo: number; ppgHome: number; ppgAway: number }>;
  simulation: Array<{ teamId: string; pTitle: number; pEurope: number; pRelegation: number;
                      expectedPts: number; positionDist: number[] }>;
  nextRoundPredictions: Prediction[];
  evaluation?: { rps: number; brier: number; baselineRps: number; matches: number };
};
```

### Hafta numarasını türetme

ESPN maçlara hafta numarası vermiyor. Önerilen yöntem:

1. Maçları başlama saatine göre sırala.
2. Her takımın n. maçı n. haftadır. Haftanın numarası, o haftadaki maçların çoğunluğunun aldığı sıra numarasıdır.
3. Ertelenen maç asıl haftasında kalır ve bir `rescheduled` işareti alır.
4. Belirsiz kalan durumlar için `config` dosyasında elle düzeltme listesi (override) tutulur.

## 7. Ekranlar

### 7.1 `/analiz`: Haftanın özeti (ana ekran)

```
┌───────────────────────────────────────────────────────────┐
│ [Süper Lig ▾] [2026-27 ▾]        ◀ 9. Hafta ▶   güncellendi │
├───────────────────────────────────────────────────────────┤
│ SONUÇLAR (kart ızgarası)                                    │
│ GS 2–1 FB   ·  beklenen: %48 / %27 / %25  ·  şut 14–9         │
│ TS 1–1 BJK  ·  …                                  → maç raporu │
├──────────────────────────────┬────────────────────────────┤
│ PUAN DURUMU                   │ ELO: HAFTANIN HAREKETLİLERİ │
│ # Takım  O  P  Av  Form  ±Sıra │  ▲ +18 Trabzonspor          │
│ 1 GS     9  23 +14 ●●●○●  –   │  ▼ –15 …                    │
├──────────────────────────────┴────────────────────────────┤
│ SEZON SİMÜLASYONU (10.000 tekrar)                           │
│ Takım   Şampiyonluk  Avrupa  Düşme  Beklenen puan  Δ geçen hafta │
├──────────────────────────────┬────────────────────────────┤
│ TSR × PDO DÖRTLÜĞÜ             │ SIRALAMA YOLCULUĞU (bump)   │
│  baskın+şanslı | baskın+şanssız│  hafta 1 → 9, takım çizgileri │
├──────────────────────────────┴────────────────────────────┤
│ GELECEK HAFTA TAHMİNLERİ   GS–TS  ▇▇▇▇▅▅▃  %52/%26/%22      │
├───────────────────────────────────────────────────────────┤
│ MODEL KARNESİ: RPS 0.198 (taban 0.221) · son 5 hafta trendi │
│ [Haftanın yorumu: notes/09.md varsa]                        │
│ Veri: ESPN · Yöntem → /analiz/metodoloji                    │
└───────────────────────────────────────────────────────────┘
```

### 7.2 `/analiz/mac/[id]`: Maç raporu

Sayfa yukarıdan aşağıya şu bölümlerden oluşur:

1. **Başlık:** skor, tarih, hafta numarası.
2. **Maç öncesi tahmin:** Poisson modelinin G/B/M olasılığı ve en olası skor. Isı haritasında gerçek skorun hücresi işaretlenir.
3. **Gol ve kart zaman şeridi:** 0–90+ dakika, iki takım için ayrı ayrı.
4. **Ayna istatistik çubukları:** topla oynama, şut, isabetli şut, korner, faul, kart, pas isabeti.
5. **Elo etkisi:** bu maç iki takımın puanını kaç değiştirdi.
6. **Bağlam:** iki takımın son 5 maçı ve aralarındaki son maçlar.

### 7.3 `/analiz/takim/[slug]`: Takım sayfası (Faz 2)

- Elo geçmişi çizgisi
- Sıra yolculuğu
- İç saha ve deplasman ayrımı
- Kalan fikstürün zorluk şeridi
- Sezon sonu sıra dağılımı (simülasyondan)

Sayfa her takım için açılır. İstenirse favori takım ana ekranda öne çıkarılabilir.

### 7.4 `/analiz/metodoloji`

- Her modelin tek paragraflık açıklaması ve formülleri
- Parametreler (K, ev sahibi avantajı, zaman ağırlığı)
- Backtest sonuçları
- Veri kaynakları ve **zorunlu atıflar**

Bu sayfa hem güvenilirlik sağlar hem de portföyde "nasıl yaptım" anlatımı olur.

### Tasarım dili

- Mevcut `Card`, `cardClass` ve `SpotlightGrid` bileşenleri ile `fade-up` animasyonu kullanılır.
- Galibiyet, beraberlik ve mağlubiyet için sabit üç renk seçilir. Grafiklerde de aynı renkler kullanılır.
- Olasılıklar her yerde tek ondalıklı yüzde olarak gösterilir.
- Sayısal sütunlarda `font-mono` ve tabular rakamlar kullanılır.
- Mobilde tablolar yatay kaydırılmaz; ikincil sütunlar gizlenir.

## 8. Modeller

### 8.1 Elo

- **Beklenen sonuç:** E = 1 / (1 + 10^((R_rakip − R_takım − HFA) / 400))
- **Güncelleme:** R′ = R + K · G · (S − E)
  - S: galibiyet 1, beraberlik 0.5, mağlubiyet 0
  - K: başlangıç değeri 20
  - G (gol farkı çarpanı, World Football Elo yaklaşımı): fark 0–1 ise 1, fark 2 ise 1.5, fark N ≥ 3 ise (11 + N) / 8
- **HFA (ev sahibi avantajı):** başlangıç değeri yaklaşık 65 Elo puanı. 2025-26 sezonu backtest'iyle ayarlanır.
- **Sezon başı:** puanlar ortalamaya üçte bir oranında çekilir. Ligden yükselen takımlar, geçen sezon düşen takımların ortalamasıyla başlar.

### 8.2 Poisson skor modeli

- **Beklenen goller:**
  - λ_ev = exp(c + hücum_ev − savunma_dep + ev_avantajı)
  - λ_dep = exp(c + hücum_dep − savunma_ev)
- **Skor olasılığı:** P(i, j) = Pois(i; λ_ev) · Pois(j; λ_dep), 0–6 gol aralığında.
  - G/B/M olasılıkları ızgaranın köşegen altı, köşegen ve köşegen üstü toplamlarıdır.
- **Parametre tahmini:** maksimum olabilirlik ile yapılır.
  - Zaman ağırlığı w = exp(−ξ · gün) uygulanır; ξ ≈ 0.0065 ile yaklaşık 3,5 aylık yarı ömür elde edilir.
  - Sezonun ilk haftalarında veri az olduğundan parametreler geçen sezona doğru büzülür (shrinkage).
- **v2:** Dixon-Coles düzeltmesi (ρ) eklenir. Bu düzeltme 0-0, 1-0, 0-1 ve 1-1 skorlarının olasılığını düzeltir.

### 8.3 Monte Carlo sezon simülasyonu

- Kalan her maç için skor, Poisson λ değerlerinden 10.000 kez çekilir.
- Her tekrarda puan tablosu hesaplanır. Sonuçta takım başına sıra dağılımı, şampiyonluk, Avrupa ve düşme olasılıkları çıkar.
- **Eşitlik bozma:** Süper Lig'de puan eşitliği önce **ikili averajla** (aradaki maçların puanı, sonra averajı) bozulur.
  - v1'de genel averaj kullanılabilir. Bu basitleştirme metodoloji sayfasında belirtilmeli.
- Avrupa kupası ve düşme kontenjanları her sezon değişebileceği için `config` dosyasında tutulur.

### 8.4 Metrikler

| Metrik | Formül |
|---|---|
| TSR | şut_atılan / (şut_atılan + şut_yenen) |
| SoTR | isabetli_atılan / (isabetli_atılan + isabetli_yenen) |
| PDO | 1000 × (goller / isabetli_atılan + (1 − yenen_goller / isabetli_yenen)) |
| Maç başı puan | puan / maç; iç saha ve deplasman için ayrı ayrı |

### 8.5 Değerlendirme (model karnesi)

- **RPS (Ranked Probability Score):** futbolda üç sonuçlu tahminler için standart ölçü.
  - RPS = ½ · Σ_{i=1..2} (Σ_{j≤i} (p_j − e_j))², sonuçlar ev/beraberlik/deplasman sırasıyla.
  - Düşük değer daha iyi demek.
- **Taban modeller:**
  - Lig ortalaması (yaklaşık %45 / %27 / %28)
  - Yalnız Elo
- Model bu tabanları geçmiyorsa sitede açıkça yazılmalı. Bu dürüstlük portföy açısından da artı.

## 9. Otomasyon

`.github/workflows/mac-analizi.yml`

- **Tetikleyiciler:**
  - Her gün `cron: '0 5 * * *'` (05:00 UTC, Türkiye saatiyle 08:00)
  - `workflow_dispatch` ile elle tetikleme
- **Adımlar:**
  1. checkout
  2. `npm ci`
  3. `npx tsx scripts/analiz/build.ts`
  4. Değişiklik varsa `git commit -m "data(analiz): …"` ve push
- **İstek bütçesi:** bir çalıştırmada bir skor tablosu, bir puan durumu ve son 48 saatte biten maçlar için maç özeti çekilir. Bu, haftada yaklaşık 30 istek eder.
- **Önbellek:** bitmiş ve 48 saatten eski maçlar tekrar çekilmez. ESPN istatistikleri maçtan sonraki birkaç saat içinde düzeltilebildiği için 48 saatlik pencere bırakılır.
- **Doğrulama:** pipeline çıktısını bir şema kontrolünden geçirir (ör. takım sayısı 18, olasılıkların toplamı 1). Bozuk veri commit'lenmez, görev hata verir ve GitHub e-posta gönderir.
- **Gizli anahtarlar:** Faz 3'te `FOOTBALL_DATA_ORG_TOKEN` GitHub Secrets'a konur. `NEXT_PUBLIC_` önekiyle **asla** tanımlanmaz.

## 10. Hukuki notlar ve atıf

- **ESPN:**
  - Belgelenmemiş bir API ve kullanım koşulları doğrulanmadı.
  - Düşük istek hacmi, önbellek ve "Veri: ESPN" atfı ile kullanılır. Ham veri yeniden dağıtılmaz; sitede yalnızca türetilmiş analizler gösterilir.
  - Kaynak kapanırsa yedek yol API-Football ücretli planı ya da football-data.org Süper Lig paketi.
- **football-data.org:** sayfada "Football data provided by the Football-Data.org API" metni zorunlu. Kulüp logoları için hak sahibinin izni gerekir.
- **StatsBomb:** StatsBomb'a atıf ve logo zorunlu. Ticari olmayan kullanım için.
- **Kulüp logoları:** kullanılmamalı. Takım kısaltmaları ve nötr renk noktaları yeterli.
- **FotMob, SofaScore, Transfermarkt:** kazınmamalı.

## 11. Yol haritası

| Faz | Kapsam | Çıktı |
|---|---|---|
| **0: Veri** | ESPN çekme, normalize, hafta türetme. 2025-26 ve 2026-27 Süper Lig. | `data/analiz/**` JSON'ları, tipler |
| **1: MVP** | Haftanın özeti (sonuçlar, puan durumu, form, Elo, TSR×PDO), maç raporu (istatistik çubukları, gol şeridi), GitHub Action, Analiz sekmesi, metodoloji sayfası | Canlı `/analiz` |
| **2: Tahmin** | Poisson ve Dixon-Coles, Monte Carlo simülasyonu, dondurulmuş tahminler, RPS karnesi, bump chart, takım sayfası, backtest | Model karnesi |
| **3: Derinlik** | football-data.org ile büyük 5 lig. StatsBomb vitrini: Euro 2024 Türkiye maçları için xG yarış grafiği, şut haritası, pas ağı. | Olay verisi analizleri |
| **4: Yapay zekâ dokunuşu** | Pipeline, hesaplanmış metriklerden Claude API ile **haftalık yorum taslağı** üretir ve bunu PR olarak açar. Sen düzenleyip birleştirirsin. Modele yalnızca hesaplanmış sayılar verilir; yorum uydurulmaz. | Sitenin "yapay zekâ mühendisi" kimliğine uyan özellik |

## 12. Açık sorular ve doğrulanmamış noktalar

- **Ekranın yeri:** üst menüde ayrı bir "Analiz" sekmesi mi olsun (öneri), yoksa Araçlar altında bir kart mı?
- **Lig kapsamı:** sadece Süper Lig mi, yoksa Faz 1'den itibaren büyük ligler de mi?
- **Sitenin yayın yeri:** Vercel mi? Repoda Vercel ayarı yok ve `out/` klasörü eski bir statik export'tan kalmış. Statik export kullanılıyorsa mimari yine çalışır; yeniden derlemeyi tetikleme adımı değişir.
- **Doğrulanmamış bilgiler:**
  - ESPN'in kullanım koşulları
  - football-data.co.uk'nin Türkiye CSV'lerindeki maç istatistiği sütunları
  - ClubElo'nun gol farkı formülü ve API kararlılığı
  - Süper Lig 2026-27 Avrupa ve düşme kontenjanları (bunun için `config` dosyası var)

## Kaynaklar

- ESPN uç noktaları: elle test edildi, 17 Ekim 2026.
- football-data.org: https://www.football-data.org/coverage · https://docs.football-data.org/general/v4/policies.html
- StatsBomb Open Data: https://github.com/statsbomb/open-data
- football-data.co.uk: https://www.football-data.co.uk/notes.txt
- ClubElo: http://clubelo.com/API
- API-Football ücretsiz plan sezon kısıtı (GitHub issue'ları, Ağustos–Ekim 2026)
- FBref'in Opta verisini kaybetmesi: https://www.theixsports.com/the-ix-soccer/fbrefs-loss-advanced-stats-womens-soccer-data-accessibility/
- PPDA: https://dataglossary.wyscout.com/ppda/
- TSR: https://grantland.com/the-triangle/what-is-total-shots-ratio-and-how-can-it-improve-your-understanding-of-soccer
- Dixon-Coles / penaltyblog: https://penaltyblog.readthedocs.io/en/latest/models/overview.html
- xT: https://socceraction.readthedocs.io/en/stable/documentation/valuing_actions/xT.html
- Pas ağı ve grafik örnekleri: https://mplsoccer.readthedocs.io/
- Beklenen puan: https://mckayjohns.substack.com/p/how-to-calculate-expected-points
- Opta süper bilgisayar örneği: https://theanalyst.com/articles/premier-league-predictions-2026-27-opta-supercomputer
- Soccermatics (David Sumpter): https://soccermatics.readthedocs.io/
