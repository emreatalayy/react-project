# Maç analizi verisi

`/analiz` sayfalarının verisini üreten script'ler. Python 3.10+ gerekir: `numpy`, eğitim için ayrıca `pandas` ve `scikit-learn`.

## Yeni bir maç eklemek

1. ESPN'den maç özetini indir. Lig kodu ve maç numarası maçın ESPN adresinde yazar (`espn.com/soccer/match/_/gameId/<id>`).

   ```bash
   python scripts/analiz/fetch_match.py uefa.champions 401915435 tmp/summary.json
   ```

2. Anlatımdaki şutları ayrıştır ve xG modeliyle puanla.

   ```bash
   python scripts/analiz/parse_match.py tmp/summary.json scripts/analiz/xg_model.json tmp/analysis.json
   ```

3. Sitenin okuyacağı JSON'u yaz: takım kısaltmaları ve koyu zeminde birbirinden ayrışan iki takım rengiyle.

   ```bash
   python scripts/analiz/export_site.py tmp/analysis.json app/data/analiz/<slug>.json GS FCB "#d95926" "#3987e5"
   ```

4. `app/data/analiz/<slug>.ts` dosyasına maçın hikâyesini yaz (başlık, kırılma kartları, "ya olsaydı" seçenekleri). Örnek: `gs-barcelona-2026-10-13.ts`.
5. `app/data/analiz/index.ts` listesine ekle.

## xG modelini yeniden eğitmek

`xg_model.json` repoda hazır; yeniden eğitmek gerekmez. Gerekirse:

```bash
python scripts/analiz/statsbomb_shots.py tmp/shots.csv
python scripts/analiz/train_xg.py tmp/shots.csv scripts/analiz/xg_model.json
```

`statsbomb_shots.py`, StatsBomb Open Data'dan yaklaşık 290 maç indirir ve sadece şutları saklar. Model, anlatımdaki bölge adlarıyla ("ceza sahası ortası", "altıpasın sağı" gibi) aynı sözlüğü kullanan bir lojistik regresyon.

## Sınırlar

- ESPN anlatımı her ligde yok. Süper Lig maçlarında anlatım sadece gol ve kart satırlarından oluşuyor, şut ayrıştırması orada çalışmaz.
- ESPN'in uç noktaları belgelenmemiş; değişebilir.
- Maç öncesi beklenti piyasa olasılıklarından türetilir. Sayfada oran ya da bahis şirketi gösterilmez.
