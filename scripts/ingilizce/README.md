# İngilizce kursunun sesleri

`/araclar/ingilizce` sayfası İngilizce kelime ve cümleleri sesli okur. Hazır ses dosyası yoksa tarayıcının kendi sesini kullanır; bu ses cihaza göre çok değişir, bazı bilgisayarlarda robotik çıkar ya da hiç İngilizce ses yoktur.

`generate-audio.mjs` kursun bütün İngilizce satırlarını (kelimeler, cümleler, boşluk doldurma cevapları, ipucu örnekleri, hikâyeler, ses çiftleri) OpenAI'nin seslendirme servisiyle bir kez kaydeder. Kayıtlar `public/audio/ingilizce/` klasörüne, hangi satırın hangi dosyada olduğu da `manifest.json` dosyasına yazılır. Sayfa bu dosyayı bulursa kayıtları çalar; bulamadığı satırlarda tarayıcı sesine döner.

## Kayıtları üretmek

Önce neyin kaydedileceğine bak (anahtar gerekmez):

```bash
node scripts/ingilizce/generate-audio.mjs --dry-run
```

Sonra OpenAI API anahtarınla kaydet:

```bash
OPENAI_API_KEY=sk-... node scripts/ingilizce/generate-audio.mjs
```

Windows PowerShell'de:

```powershell
$env:OPENAI_API_KEY = "sk-..."; node scripts/ingilizce/generate-audio.mjs
```

Ardından `public/audio/ingilizce/` klasörünü commit'le.

- Kurs içeriği değişince betiği yeniden çalıştır; yalnızca yeni ya da değişen satırlar kaydedilir, kullanılmayanlar manifest'ten çıkar.
- Ses ve model ortam değişkenleriyle seçilir: `OPENAI_TTS_VOICE` (varsayılan `coral`), `OPENAI_TTS_MODEL` (varsayılan `gpt-4o-mini-tts`). Sesi değiştirince bütün satırlar yeniden kaydedilir.
- Kalıplardan anlık üretilen cümleler ("The duck is yellow." gibi) kaydedilmez; onları tarayıcı sesi okur.
